import { AutoTokenizer } from '@xenova/transformers';
import * as ort from 'onnxruntime-react-native';

import { AI_MODELS } from '../../constants/AIConfig';
import { ModelLoader } from './ModelLoader';
import type { Message } from './PromptBuilder';

// -----------------------------------------------------------------------------
// Inference Engine (The "Brain")
// -----------------------------------------------------------------------------

const MAX_NEW_TOKENS = 256;

interface Tokenizer {
  apply_chat_template: (
    messages: Message[],
    options: { tokenize: boolean; add_generation_prompt: boolean }
  ) => string;
  (
    text: string,
    options: { return_tensor: string }
  ): Promise<{
    input_ids: ort.Tensor;
    attention_mask: ort.Tensor;
  }>;
  eos_token_id: number;
  decode: (tokens: number[]) => string;
}

let session: ort.InferenceSession | null = null;
let tokenizer: Tokenizer | null = null;
let activeModelId: string | null = null;

// The models to try in order
const MODEL_PRIORITY = [AI_MODELS.THE_BRAIN_HIGH, AI_MODELS.THE_BRAIN_MID, AI_MODELS.THE_BRAIN_LOW];

/**
 * Ensure the ONNX model is loaded into memory.
 * Implements progressive fallback: 1.7B -> 360M -> 135M.
 */
async function loadModel(): Promise<void> {
  if (session) return;

  for (const modelConfig of MODEL_PRIORITY) {
    try {
      // eslint-disable-next-line no-console
      console.log(`[Inference] Attempting to load model: ${modelConfig.id}`);
      const modelPath = await ModelLoader.ensureModel(modelConfig.url, modelConfig.fileName);

      session = await ort.InferenceSession.create(modelPath, {
        executionProviders: ['cpu'],
        graphOptimizationLevel: 'all',
      });

      activeModelId = modelConfig.id;
      // eslint-disable-next-line no-console
      console.log(`[Inference] Successfully loaded: ${modelConfig.id}`);
      return;
    } catch (e) {
      console.warn(`[Inference] Failed to load ${modelConfig.id}:`, e);
      // Clean up partial state if needed
      session = null;
      activeModelId = null;
      // Continue to next model
    }
  }

  throw new Error('All AI models failed to load.');
}

/**
 * Release the model from memory.
 */
export function unloadModel(): void {
  if (session) {
    try {
      // release() might be missing in some RN typings but exists in practice
      if ('release' in session && typeof session.release === 'function') {
        const result = session.release() as Promise<void> | undefined;
        if (result instanceof Promise) {
          result.catch((err: unknown) => {
            // eslint-disable-next-line no-console
            console.warn('Deferred release failed', err);
          });
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to release session', e);
    }
    session = null;
    activeModelId = null; // Reset active model

    const g = global as unknown as { gc?: () => void };
    if (typeof g.gc === 'function') {
      g.gc();
    }
  }
}

/**
 * Reset all cached state. Only for use in tests.
 */
export function resetForTesting(): void {
  session = null;
  tokenizer = null;
  activeModelId = null;
}

/**
 * Lazy-load the tokenizer.
 * dynamically loads the tokenizer matching the currently active model.
 */
async function getTokenizer(): Promise<Tokenizer> {
  // If we have a tokenizer but switched models (unlikely in current flow but safer), reload it.
  if (!activeModelId) {
    // If no model is loaded yet, likely `generateResponse` calls `loadModel` first.
    // But if we need tokenizer before model, default to the lowest tier (safest/smallest).
    return (await AutoTokenizer.from_pretrained(
      AI_MODELS.THE_BRAIN_LOW.repoId
    )) as unknown as Tokenizer;
  }

  // We can just use the active model ID.
  // Note: AutoTokenizer caches internally, so repeated calls are cheap.
  // But we want to ensure we match the loaded model if possible.
  if (
    tokenizer &&
    (tokenizer as unknown as { name_or_path: string }).name_or_path === activeModelId
  ) {
    return tokenizer;
  }

  // Deduce the HuggingFace repo from the currently loaded config.
  let hfRepo = AI_MODELS.THE_BRAIN_LOW.repoId; // Default safe

  if (activeModelId === AI_MODELS.THE_BRAIN_HIGH.id) {
    hfRepo = AI_MODELS.THE_BRAIN_HIGH.repoId;
  } else if (activeModelId === AI_MODELS.THE_BRAIN_MID.id) {
    hfRepo = AI_MODELS.THE_BRAIN_MID.repoId;
  } else if (activeModelId === AI_MODELS.THE_BRAIN_LOW.id) {
    hfRepo = AI_MODELS.THE_BRAIN_LOW.repoId;
  }

  // eslint-disable-next-line no-console
  console.log(`[Inference] Loading tokenizer for ${hfRepo}`);
  tokenizer = (await AutoTokenizer.from_pretrained(hfRepo)) as unknown as Tokenizer;
  return tokenizer;
}

/**
 * Generate text from messages or a full chat-ML prompt string.
 * Loads the model, runs generation (greedy + KV cache if available), and immediately unloads.
 */
export async function generateResponse(
  input: Message[] | string,
  _isAction: boolean = false
): Promise<string> {
  await loadModel();
  if (!session) throw new Error('Model failed to load');

  const tok = await getTokenizer();

  let fullPrompt: string;
  if (Array.isArray(input)) {
    fullPrompt = tok.apply_chat_template(input, {
      tokenize: false,
      add_generation_prompt: true,
    });
  } else {
    fullPrompt = input;
  }

  const tokenized = await tok(fullPrompt, { return_tensor: 'ort' });
  const inputIds = tokenized.input_ids;
  const attentionMask = tokenized.attention_mask;

  const responseText = await runGeneration(session, inputIds, attentionMask, tok);

  unloadModel(); // IMMEDIATE UNLOAD
  return responseText;
}

/**
 * Generation loop with KV Cache fallback detection.
 */
async function runGeneration(
  sess: ort.InferenceSession,
  inputIds: ort.Tensor,
  attentionMask: ort.Tensor,
  tok: Tokenizer
): Promise<string> {
  // Detect if model supports KV cache (look for 'past_key_values' in input names)
  const inputNames = sess.inputNames;
  const useKVCache = inputNames.some(name => name.includes('past_key_values'));
  // eslint-disable-next-line no-console
  console.log(`[Inference] KV Cache detected: ${useKVCache}`);

  const generatedTokens: number[] = [];
  let currentIds = inputIds;
  let currentMask = attentionMask;

  // KV Cache state
  // past_key_values is usually a sequence of tensors.
  // We need to feed them back in the next step.
  let pastKeyValues: Record<string, ort.Tensor> = {};

  for (let i = 0; i < MAX_NEW_TOKENS; i++) {
    // Prepare feeds
    const feeds: Record<string, ort.Tensor> = {
      input_ids: currentIds,
      attention_mask: currentMask,
    };

    if (useKVCache && i > 0) {
      // On subsequent steps, we merge the past_key_values into feeds
      Object.assign(feeds, pastKeyValues);
    }

    // Run inference
    const results = await sess.run(feeds);

    // Extract logits
    const logits = results['logits'];
    // Extract new KV cache if using it
    if (useKVCache) {
      // The output names for KV cache generally match the input names or follow a pattern.
      // In ONNX Runtime, we just need to grab the outputs that seem to be KV cache.
      // Usually named 'present.0.key', 'present.0.value' OR 'present_key_values...'
      // We need to map 'present_...' outputs to 'past_...' inputs for the next step.

      const newPast: Record<string, ort.Tensor> = {};
      for (const key in results) {
        if (key.startsWith('present')) {
          const newKey = key.replace('present', 'past_key_values');
          const tensor = results[key];
          if (tensor) {
            newPast[newKey] = tensor;
          }
        }
      }
      pastKeyValues = newPast;
    }

    if (!logits) throw new Error('Missing logits in model output');

    // Argmax sampling (Greedy)
    const dims = logits.dims;
    const seqLen = dims[1]; // Sequence length of *this* run
    const vocabSize = dims[2];

    if (!seqLen || !vocabSize) {
      throw new Error('Invalid logit dimensions');
    }

    const data = logits.data as Float32Array;
    // We only care about the last token's logits
    const start = (seqLen - 1) * vocabSize;
    const end = start + vocabSize;
    const lastLogits = data.slice(start, end);

    let maxVal = -Infinity;
    let nextToken = -1;
    for (let j = 0; j < vocabSize; j++) {
      const val = lastLogits[j];
      if (val !== undefined && val > maxVal) {
        maxVal = val;
        nextToken = j;
      }
    }

    if (nextToken === -1 || nextToken === tok.eos_token_id) break;
    generatedTokens.push(nextToken);

    // Prepare next step
    if (useKVCache) {
      // KV Cache Optimized Step: Input is JUST the new token
      const newIdData = new BigInt64Array([BigInt(nextToken)]);
      currentIds = new ort.Tensor('int64', newIdData, [1, 1]);

      // Update Attention Mask:
      // With KV cache, we theoretically need to extend the mask.
      // In many HF ONNX exports, for the decode step with KV cache,
      // the attention mask input should be the *total* mask (past + new).
      const oldMaskData = currentMask.data as BigInt64Array;
      const newMaskData = new BigInt64Array(oldMaskData.length + 1);
      newMaskData.set(oldMaskData);
      newMaskData[oldMaskData.length] = BigInt(1);
      currentMask = new ort.Tensor('int64', newMaskData, [1, newMaskData.length]);
    } else {
      // Legacy / No-Cache Step: Append token to full sequence and re-run everything
      const oldData = currentIds.data as BigInt64Array;
      const newData = new BigInt64Array(oldData.length + 1);
      newData.set(oldData);
      newData[oldData.length] = BigInt(nextToken);

      const oldMask = currentMask.data as BigInt64Array;
      const newMask = new BigInt64Array(oldMask.length + 1);
      newMask.set(oldMask);
      newMask[oldMask.length] = BigInt(1);

      currentIds = new ort.Tensor('int64', newData, [1, newData.length]);
      currentMask = new ort.Tensor('int64', newMask, [1, newMask.length]);
    }
  }

  // Dispose tensors?
  // Ideally yes, but JS GC handles them eventually.
  // Explicit dispose is better for 4GB RAM devices but adds code complexity.
  // Let's rely on `unloadModel` doing a big GC sweep at the end.

  return tok.decode(generatedTokens);
}
