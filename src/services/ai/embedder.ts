/**
 * Stub Embedder for development and testing
 *
 * This generates deterministic mock embeddings based on text content.
 * Replace with real MiniLM/Transformers.js implementation when AI layer is ready.
 */

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
 * Stub embedder that generates deterministic mock embeddings
 * Uses a simple hash-based approach to create reproducible vectors
 */
class StubEmbedder implements Embedder {
  private dimensions: number;

  constructor(dimensions: number = EMBEDDING_DIMENSIONS) {
    this.dimensions = dimensions;
  }

  getDimensions(): number {
    return this.dimensions;
  }

  /**
   * Generate a deterministic mock embedding from text
   * Same text always produces same vector (useful for testing)
   */
  async embed(text: string): Promise<Float32Array> {
    await Promise.resolve(); // Simulate async work
    const vector = new Float32Array(this.dimensions);

    // Simple hash-based seeding for reproducibility
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
    }

    // Generate pseudo-random values from hash
    // Using a simple LCG (Linear Congruential Generator)
    let seed = hash || 1;
    for (let i = 0; i < this.dimensions; i++) {
      seed = (seed * 1103515245 + 12345) >>> 0;
      // Normalize to [-1, 1] range
      vector[i] = (seed / 0x7fffffff) * 2 - 1;
    }

    // Normalize the vector to unit length (important for cosine similarity)
    let norm = 0;
    for (let i = 0; i < this.dimensions; i++) {
      norm += vector[i]! * vector[i]!;
    }
    norm = Math.sqrt(norm);
    if (norm > 0) {
      for (let i = 0; i < this.dimensions; i++) {
        vector[i]! /= norm;
      }
    }

    return vector;
  }
}

// Singleton stub embedder instance
let embedderInstance: Embedder | null = null;

/**
 * Get the current embedder instance
 * Defaults to StubEmbedder until real implementation is provided
 */
export function getEmbedder(): Embedder {
  if (!embedderInstance) {
    embedderInstance = new StubEmbedder();
  }
  return embedderInstance;
}

/**
 * Set a custom embedder implementation (for production use)
 * Call this during app initialization to swap in real embeddings
 */
export function setEmbedder(embedder: Embedder): void {
  embedderInstance = embedder;
}

/**
 * Create a new StubEmbedder instance (for testing)
 */
export function createStubEmbedder(dimensions?: number): Embedder {
  return new StubEmbedder(dimensions);
}
