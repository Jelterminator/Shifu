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

/**
 * Ensure the ONNX model is loaded into memory.
 */
async function loadModel(): Promise<void> {
  if (session) return;

  const modelUrl = AI_MODELS.THE_BRAIN.url;
  const modelFilename = AI_MODELS.THE_BRAIN.fileName;

  const modelPath = await ModelLoader.ensureModel(modelUrl, modelFilename);

  session = await ort.InferenceSession.create(modelPath, {
    executionProviders: ['cpu'],
    graphOptimizationLevel: 'all',
  });
}

/**
 * Release the model from memory.
 */
export function unloadModel(): void {
  if (session) {
    session = null;
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
}

/**
 * Lazy-load the tokenizer.
 */
async function getTokenizer(): Promise<Tokenizer> {
  if (!tokenizer) {
    tokenizer = (await AutoTokenizer.from_pretrained(
      'onnx-community/Qwen2.5-0.5B-Instruct'
    )) as unknown as Tokenizer;
  }
  return tokenizer;
}

/**
 * Generate text from messages or a full chat-ML prompt string.
 * Loads the model, runs greedy decoding, and immediately unloads.
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
    // Apply Qwen-2.5-Instruct chat template
    fullPrompt = tok.apply_chat_template(input, {
      tokenize: false,
      add_generation_prompt: true,
    });
  } else {
    fullPrompt = input;
  }

  const tokenized = await tok(fullPrompt, { return_tensor: 'ort' });

  const responseText = await runGeneration(
    session,
    tokenized.input_ids,
    tokenized.attention_mask,
    tok
  );

  unloadModel(); // IMMEDIATE UNLOAD
  return responseText;
}

/**
 * Greedy generation loop over raw ONNX tensors.
 */
async function runGeneration(
  sess: ort.InferenceSession,
  inputIds: ort.Tensor,
  attentionMask: ort.Tensor,
  tok: Tokenizer
): Promise<string> {
  let currentIds = inputIds;
  let currentMask = attentionMask;
  const generatedTokens: number[] = [];

  for (let i = 0; i < MAX_NEW_TOKENS; i++) {
    const feeds = { input_ids: currentIds, attention_mask: currentMask };
    const results = await sess.run(feeds);
    const logits = results['logits'];
    if (!logits) throw new Error('Missing logits in model output');

    const dims = logits.dims;
    const seqLen = dims[1];
    const vocabSize = dims[2];
    if (seqLen === undefined || vocabSize === undefined)
      throw new Error('Invalid logit dimensions');

    const data = logits.data as Float32Array;
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

    // Append new token
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

  return tok.decode(generatedTokens);
}
