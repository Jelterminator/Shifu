import { configureTransformers } from './transformersConfig';
// @ts-ignore
import { pipeline } from '@huggingface/transformers';

// Configure environment
configureTransformers();

/** Default embedding dimension (MiniLM-L6-v2 uses 384) */
export const EMBEDDING_DIMENSIONS = 384;

/**
 * Embedder interface for dependency injection
 */
export interface Embedder {
  /** Generate embedding vector for text */
  embed(text: string): Promise<Float32Array>;
  /** Get the dimension of output embeddings */
  getDimensions(): number;
}

/**
 * Real Embedder using transformers.js pipeline
 */
class WebEmbedder implements Embedder {
  private extractor: any = null;
  private readonly dimensions = EMBEDDING_DIMENSIONS;

  async init() {
    if (this.extractor) return;
    try {
      console.log('[Embedder Web] Loading feature-extraction pipeline...');
      // Use 'feature-extraction' pipeline
      // This automatically handles tokenization and inference.
      this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
    } catch (e) {
      console.error('[Embedder Web] Failed to initialize:', e);
      throw e;
    }
  }

  getDimensions(): number {
    return this.dimensions;
  }

  async embed(text: string): Promise<Float32Array> {
    await this.init();

    // Run inference
    // pipeline output is a Tensor or nested array depending on options.
    // By default it returns a Tensor-like object with .data (Float32Array).
    // We want mean pooling usually.
    // The pipeline returns `Tensor` by default for `feature-extraction`.
    // Wait, 'feature-extraction' returns raw hidden states (shape: [batch, seq_len, hidden_size]).
    // We need to pool it.
    // transformers.js pipelines support `pooling: 'mean'` in v2.6+?
    // Let's check docs or source.
    // If not supported, we must do it manually.
    // simpler: use `pipeline('feature-extraction', model, { pooling: 'mean', normalize: true })`
    
    const output = await this.extractor(text, { pooling: 'mean', normalize: true });
    
    // output is a Tensor. Data is typically Float32Array.
    return output.data;
  }
}

/**
 * Stub Embedder (Legacy/Fallback)
 */
export class StubEmbedder implements Embedder {
  getDimensions() {
    return EMBEDDING_DIMENSIONS;
  }
  async embed(_text: string) {
    return new Float32Array(384).fill(0.1);
  }
}

// Singleton instance
let embedderInstance: Embedder | null = null;

export function getEmbedder(): Embedder {
  if (!embedderInstance) {
    embedderInstance = new WebEmbedder();
  }
  return embedderInstance;
}

export function setEmbedder(embedder: Embedder): void {
  embedderInstance = embedder;
}

export function createStubEmbedder(): Embedder {
  return new StubEmbedder();
}
