import { pipeline, TextStreamer } from '@huggingface/transformers';
import type { Message } from './PromptBuilder';
import { configureTransformers } from './transformersConfig';

// -----------------------------------------------------------------------------
// Inference Engine (Web Implementation)
// -----------------------------------------------------------------------------

// Initialize transfomers
configureTransformers();

interface WebGenerator {
  (input: Message[] | string, options: Record<string, unknown>): Promise<unknown>;
  tokenizer: unknown;
}

let generator: WebGenerator | null = null;

// The model to use.
// Note: Using onnx-community version as requested.
const MODEL_ID = 'onnx-community/Qwen2.5-0.5B-Instruct';

/**
 * Ensure the model is loaded.
 */
async function loadModel(): Promise<void> {
  if (generator) return;

  const device = 'gpu' in navigator ? 'webgpu' : 'wasm';

  generator = (await pipeline('text-generation', MODEL_ID, {
    model_file_name: 'model_q4f16', // Explicitly request this file
    dtype: 'fp32', // Hack: Prevent filename mangling while using model_q4f16.onnx
    device: device,
    session_options: {
      executionMode: 'sequential', // Often more stable/performant for WebGPU
      graphOptimizationLevel: 'all', // Ensure full graph optimization
    },
    progress_callback: (p: { status: string }) => {
      if (p.status === 'progress') {
        // progress logic if needed
      }
    },
  })) as WebGenerator;
}

/**
 * Release the model from memory.
 * Transformers.js pipelines are cached, but we can clear specific instances if needed.
 * For now, we keep it simple.
 */
export async function unloadModel(): Promise<void> {
  // On web, we persist the model in memory for performance.
  // Re-loading WASM/Weights is too slow for a smooth user experience.
}

export function resetForTesting(): void {
  generator = null;
}

/**
 * Generate text from messages or a full prompt string.
 */
export async function generateResponse(
  input: Message[] | string,
  isAction: boolean = false
): Promise<string> {
  await loadModel();
  if (!generator) throw new Error('Model failed to load');

  // Create a streamer to log progress (non-blocking)
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument -- tokenizer type comes from dynamic pipeline
  const streamer = new TextStreamer(generator.tokenizer as never, {
    skip_prompt: true,
    callback_function: () => {
      // callback if needed
    },
  });

  // Run generation
  const result = await (
    generator as (input: Message[] | string, options: Record<string, unknown>) => Promise<unknown>
  )(input, {
    max_new_tokens: isAction ? 64 : 128,
    return_full_text: false,
    do_sample: false,
    repetition_penalty: isAction ? 2.0 : 1.2,
    streamer: streamer,
  });

  // result is usually [{ generated_text: "..." }]
  // Handle different output formats from Transformers.js
  let text = '';

  if (Array.isArray(result) && result.length > 0) {
    const lastItem = result[result.length - 1] as Record<string, unknown>;
    if (lastItem && typeof lastItem === 'object') {
      if ('generated_text' in lastItem && typeof lastItem['generated_text'] === 'string') {
        text = lastItem['generated_text'];
      } else if ('content' in lastItem && typeof lastItem['content'] === 'string') {
        // Chat format: returns generic message objects
        text = lastItem['content'];
      }
    }
  } else if (
    result &&
    typeof result === 'object' &&
    'generated_text' in (result as Record<string, unknown>)
  ) {
    const res = result as Record<string, unknown>;
    if (typeof res['generated_text'] === 'string') {
      text = res['generated_text'];
    }
  }

  return text;
}

// parsePlan is moved to aiUtils.ts
