// @ts-ignore
import { pipeline, TextStreamer } from '@huggingface/transformers';
import type { Message } from './PromptBuilder';
import { configureTransformers } from './transformersConfig';

// -----------------------------------------------------------------------------
// Inference Engine (Web Implementation)
// -----------------------------------------------------------------------------

// Initialize transfomers
configureTransformers();

let generator: any = null;

// The model to use. 
// Note: Using onnx-community version as requested.
const MODEL_ID = 'onnx-community/Qwen2.5-0.5B-Instruct';

/**
 * Ensure the model is loaded.
 */
async function loadModel(): Promise<void> {
  if (generator) return;

  console.log(`[Inference Web] Initializing pipeline with model: ${MODEL_ID} (device: ${'gpu' in navigator ? 'webgpu' : 'wasm'})`);
  
  const device = 'gpu' in navigator ? 'webgpu' : 'wasm';

  generator = await pipeline('text-generation', MODEL_ID, {
    model_file_name: 'model_q4f16', // Explicitly request this file
    dtype: 'fp32', // Hack: Prevent filename mangling while using model_q4f16.onnx
    device: device,
    session_options: {
        executionMode: 'sequential', // Often more stable/performant for WebGPU
        graphOptimizationLevel: 'all', // Ensure full graph optimization
    },
    progress_callback: (p: any) => {
        if (p.status === 'progress') {
            const percent = Math.round(p.progress || 0);
            if (percent % 10 === 0 && percent !== 0) {
                 console.log(`[Inference Web] Loading: ${p.file} ${percent}%`);
            }
        }
    },
  });
}

/**
 * Release the model from memory.
 * Transformers.js pipelines are cached, but we can clear specific instances if needed.
 * For now, we keep it simple.
 */
export async function unloadModel(): Promise<void> {
  // On web, we persist the model in memory for performance.
  // Re-loading WASM/Weights is too slow for a smooth user experience.
  if (generator) {
    console.log('[Inference Web] Keeping model in memory (ignoring unload request).');
  }
}

export function resetForTesting(): void {
  generator = null;
}

/**
 * Generate text from messages or a full prompt string.
 */
export async function generateResponse(input: Message[] | string, isAction: boolean = false): Promise<string> {
  await loadModel();
  if (!generator) throw new Error('Model failed to load');

  console.log('[Inference Web] Running inference...');
  const startTime = Date.now();

  // Create a streamer to log progress (non-blocking)
  const streamer = new TextStreamer(generator.tokenizer, {
    skip_prompt: true,
    callback_function: (_token: string) => {
        // Log every 10th token to avoid flooding but show life
        tokenCount++;
        if (tokenCount % 10 === 0) {
            console.log(`[Inference Web] Generated ${tokenCount} tokens...`);
        }
    },
  });

  let tokenCount = 0;

  const prefillTime = (Date.now() - startTime) / 1000;
  const decodeStartTime = Date.now();

  // Run generation
  const result = await generator(input, {
    max_new_tokens: isAction ? 64 : 128, 
    return_full_text: false,
    do_sample: false, 
    repetition_penalty: isAction ? 2.0 : 1.2, 
    streamer: streamer,
  });

  const totalDuration = (Date.now() - startTime) / 1000;
  const decodeDuration = (Date.now() - decodeStartTime) / 1000;
  const tps = tokenCount / decodeDuration;

  console.log(`[Inference Web] Prefill: ${prefillTime.toFixed(2)}s | Gen: ${decodeDuration.toFixed(2)}s (${tps.toFixed(2)} t/s) | Total: ${totalDuration.toFixed(2)}s`);

  // result is usually [{ generated_text: "..." }]
  // Handle different output formats from Transformers.js
  let text = '';
  
  if (Array.isArray(result) && result.length > 0) {
    const lastItem = result[result.length - 1];
    if (lastItem.generated_text) {
        text = lastItem.generated_text;
    } else if (lastItem.content) {
        // Chat format: returns generic message objects
        text = lastItem.content;
    }
  } else if (typeof result === 'object' && result?.generated_text) {
      text = result.generated_text;
  }
  
  // If the output is the full conversation (often the case with chat pipelines),
  // we might need to strip the previous messages if they are included in the generated_text.
  // However, for "content" field in chat output, it is usually just the new message.
  
  return text;
}

// parsePlan is moved to aiUtils.ts

