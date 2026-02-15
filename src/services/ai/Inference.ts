import * as ort from 'onnxruntime-react-native';
// @ts-ignore - transformers.js might not have perfect types for RN yet
import { AutoTokenizer } from '@xenova/transformers';

import { AI_MODELS } from '../../config/AIConfig';
import { ModelLoader } from '../ModelLoader';
import type { Message } from './PromptBuilder';

// -----------------------------------------------------------------------------
// Inference Engine (The "Brain")
// -----------------------------------------------------------------------------

const MAX_NEW_TOKENS = 256;

let session: any = null;
let tokenizer: any = null;

/**
 * Ensure the ONNX model is loaded into memory.
 */
async function loadModel(): Promise<void> {
  if (session) return;

  const modelUrl = AI_MODELS.THE_BRAIN.url;
  const modelFilename = AI_MODELS.THE_BRAIN.fileName;

  console.log('[Inference] Ensuring model is downloaded...');
  const modelPath = await ModelLoader.ensureModel(modelUrl, modelFilename);

  console.log('[Inference] Loading ONNX session...');
  session = await ort.InferenceSession.create(modelPath, {
    executionProviders: ['cpu'],
    graphOptimizationLevel: 'all',
  });
}

/**
 * Release the model from memory.
 */
export async function unloadModel(): Promise<void> {
  if (session) {
    console.log('[Inference] Unloading model to free RAM.');
    session = null;
    if (global.gc) global.gc();
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
async function getTokenizer(): Promise<any> {
  if (!tokenizer) {
    tokenizer = await AutoTokenizer.from_pretrained('onnx-community/Qwen2.5-0.5B-Instruct');
  }
  return tokenizer;
}

/**
 * Generate text from messages or a full chat-ML prompt string.
 * Loads the model, runs greedy decoding, and immediately unloads.
 */
export async function generateResponse(input: Message[] | string, _isAction: boolean = false): Promise<string> {
  await loadModel();
  if (!session) throw new Error('Model failed to load');

  const tok = await getTokenizer();
  
  let fullPrompt: string;
  if (Array.isArray(input)) {
    // Apply Qwen-2.5-Instruct chat template
    fullPrompt = tok.apply_chat_template(input, { tokenize: false, add_generation_prompt: true });
  } else {
    fullPrompt = input;
  }

  const { input_ids, attention_mask } = await tok(fullPrompt, { return_tensor: 'ort' });

  console.log('[Inference] Running inference...');
  const responseText = await runGeneration(session, input_ids, attention_mask, tok);

  await unloadModel(); // IMMEDIATE UNLOAD
  return responseText;
}

/**
 * Greedy generation loop over raw ONNX tensors.
 */
async function runGeneration(
  sess: any,
  inputIds: any,
  attentionMask: any,
  tok: any
): Promise<string> {
  let currentIds = inputIds;
  let currentMask = attentionMask;
  const generatedTokens: number[] = [];

  for (let i = 0; i < MAX_NEW_TOKENS; i++) {
    const feeds = { input_ids: currentIds, attention_mask: currentMask };
    const results = await sess.run(feeds);
    const logits = results.logits;

    const [, seqLen, vocabSize] = logits.dims;
    const data = logits.data;
    const start = (seqLen - 1) * vocabSize;
    const end = start + vocabSize;
    const lastLogits = data.slice(start, end);

    let maxVal = -Infinity;
    let nextToken = -1;
    for (let j = 0; j < vocabSize; j++) {
      if (lastLogits[j] > maxVal) {
        maxVal = lastLogits[j];
        nextToken = j;
      }
    }

    if (nextToken === tok.eos_token_id) break;
    generatedTokens.push(nextToken);

    // Append new token
    const oldData = currentIds.data;
    const newData = new (oldData.constructor as any)(oldData.length + 1);
    newData.set(oldData);
    newData[oldData.length] = BigInt(nextToken);

    const oldMask = currentMask.data;
    const newMask = new (oldMask.constructor as any)(oldMask.length + 1);
    newMask.set(oldMask);
    newMask[oldMask.length] = BigInt(1);

    currentIds = new ort.Tensor('int64', newData, [1, newData.length]);
    currentMask = new ort.Tensor('int64', newMask, [1, newMask.length]);
  }

  return tok.decode(generatedTokens);
}

