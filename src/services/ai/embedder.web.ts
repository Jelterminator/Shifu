import { pipeline } from '@huggingface/transformers';
import { configureTransformers } from './transformersConfig';

interface WebExtractor {
  (text: string, options: { pooling: string; normalize: boolean }): Promise<unknown>;
}

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
  private extractor: WebExtractor | null = null;
  private readonly dimensions = EMBEDDING_DIMENSIONS;

  async init(): Promise<void> {
    if (this.extractor) return;
    // Use 'feature-extraction' pipeline
    // This automatically handles tokenization and inference.
    this.extractor = (await (pipeline as unknown as (...args: unknown[]) => Promise<unknown>)(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    )) as WebExtractor;
  }

  getDimensions(): number {
    return this.dimensions;
  }

  async embed(text: string): Promise<Float32Array> {
    await this.init();
    if (!this.extractor) throw new Error('WebEmbedder not initialized');

    // Run inference
    const output = (await this.extractor(text, { pooling: 'mean', normalize: true })) as Record<
      string,
      unknown
    >;

    // output is a Tensor. Data is typically Float32Array.
    if (output && typeof output === 'object' && 'data' in output) {
      const data = output['data'];
      if (data instanceof Float32Array) {
        return data;
      }
    }

    throw new Error('Unexpected output from web embedder');
  }
}

/**
 * Stub Embedder (Legacy/Fallback)
 */
export class StubEmbedder implements Embedder {
  getDimensions(): number {
    return EMBEDDING_DIMENSIONS;
  }
  async embed(_text: string): Promise<Float32Array> {
    return Promise.resolve(new Float32Array(384).fill(0.1));
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
