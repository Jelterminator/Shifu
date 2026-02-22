import { pipeline, TextStreamer } from '@huggingface/transformers';
import { AI_MODELS } from '../../constants/AIConfig';
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

const MODEL_PRIORITY = [AI_MODELS.THE_BRAIN_HIGH, AI_MODELS.THE_BRAIN_MID, AI_MODELS.THE_BRAIN_LOW];

/**
 * Ensure the model is loaded.
 * Implements progressive fallback: 1.7B -> 360M -> 135M.
 */
async function loadModel(): Promise<void> {
  if (generator) return;

  for (const modelConfig of MODEL_PRIORITY) {
    try {
      // eslint-disable-next-line no-console
      console.log(`[WebInference] Attempting to load model: ${modelConfig.repoId}`);

      // Use model-specific dtype if available, otherwise default to q8 (stable)
      type DType = 'q8' | 'auto' | 'fp32' | 'fp16' | 'int8' | 'uint8' | 'q4' | 'bnb4' | 'q4f16';
      const dtype: DType = 'dtype' in modelConfig ? (modelConfig.dtype as DType) : 'q8';

      // Auto-detect best device. Transformers.js defaults to WebGPU -> WASM.
      // But we are seeing WebGPU driver crashes (DXGI_ERROR_DEVICE_HUNG) with 1.7B.
      // So we FORCE WASM for stability. It's slower but safe.

      generator = (await pipeline('text-generation', modelConfig.repoId, {
        dtype: dtype,
        device: 'wasm',
        session_options: {
          executionMode: 'sequential',
          graphOptimizationLevel: 'all',
          intraOpNumThreads: 1, // FORCE single-threaded to avoid "Aborted" on WASM
          interOpNumThreads: 1,
        },
        progress_callback: (p: unknown) => {
          if (p && typeof p === 'object' && 'status' in p && p.status === 'progress') {
            // eslint-disable-next-line no-console
            console.log(
              `Downloading ${modelConfig.repoId}: ${Math.round(
                'progress' in p && typeof p.progress === 'number' ? p.progress : 0
              )}%`
            );
          }
        },
      })) as unknown as WebGenerator;

      // eslint-disable-next-line no-console
      console.log(`[WebInference] Successfully loaded: ${modelConfig.repoId}`);
      return;
    } catch (e) {
      console.warn(`[WebInference] Failed to load ${modelConfig.repoId}:`, e);
      generator = null;
      // Continue to next model
    }
  }

  throw new Error('All AI models failed to load on Web.');
}

/**
 * Release the model from memory.
 * Transformers.js pipelines are cached, but we can clear specific instances if needed.
 * For now, we keep it simple.
 */
export function unloadModel(): void {
  // On web, we persist the model in memory for performance.
  // Re-loading WASM/Weights is too slow for a smooth user experience.
  // But if we want to force release (e.g. to switch models or enable fallback later), we could:
  generator = null;
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
    return_full_text: true, // Returning full text to debug if prompt is stripped incorrectly
    do_sample: false,
    repetition_penalty: isAction ? 1.5 : 1.1, // Lower penalty slightly
    streamer: streamer,
  });

  // eslint-disable-next-line no-console
  console.log('[WebInference] Raw generation result:', JSON.stringify(result));

  // result is usually [{ generated_text: string }] or [{ generated_text: [ {role, content}, ... ] }]
  // Handle different output formats from Transformers.js
  let text = '';

  if (Array.isArray(result) && result.length > 0) {
    const firstItem = result[0] as Record<string, unknown>;

    // Case 1: Chat template style (array of messages)
    if ('generated_text' in firstItem && Array.isArray(firstItem['generated_text'])) {
      const messages = firstItem['generated_text'] as unknown[];
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && typeof lastMessage === 'object' && 'content' in lastMessage) {
          text = String((lastMessage as { content: unknown }).content);
        }
      }
    }
    // Case 2: Text generation style (string)
    else if ('generated_text' in firstItem && typeof firstItem['generated_text'] === 'string') {
      text = firstItem['generated_text'];
    }
    // Case 3: Other unexpected format?
    else if ('content' in firstItem && typeof firstItem['content'] === 'string') {
      text = firstItem['content'];
    }
  }

  // If text is still empty, try to fallback to raw string
  if (!text && typeof result === 'string') {
    text = result;
  }

  return text;
}
