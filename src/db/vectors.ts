/**
 * Vector Service
 *
 * High-level API for storing and querying vector embeddings.
 * Uses platform-aware storage (SQLite on native, localStorage on web).
 */
import { getEmbedder } from '../services/ai/embedder';
import type { LinkableEntityType, VectorEmbedding, VectorQueryResult } from '../types/vectorTypes';
import { vectorStorage } from './vectorStorage';

/**
 * VectorService provides high-level operations for RAG embeddings
 */
class VectorService {
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    await vectorStorage.initialize();
    this.isInitialized = true;
  }

  /**
   * Add or update an embedding for an entity
   * Automatically generates embedding from text using current embedder
   */
  async addEmbedding(
    userId: string,
    entityType: LinkableEntityType | 'summary',
    entityId: string,
    text: string
  ): Promise<string> {
    if (!this.isInitialized) await this.initialize();

    const embedder = getEmbedder();
    const vector = await embedder.embed(text);

    return vectorStorage.add(userId, entityType, entityId, vector);
  }

  /**
   * Add embedding with pre-computed vector (for advanced use cases)
   */
  async addEmbeddingDirect(
    userId: string,
    entityType: LinkableEntityType | 'summary',
    entityId: string,
    vector: Float32Array
  ): Promise<string> {
    if (!this.isInitialized) await this.initialize();

    return vectorStorage.add(userId, entityType, entityId, vector);
  }

  /**
   * Query for similar entities using text
   */
  async query(
    userId: string,
    queryText: string,
    nResults: number = 5
  ): Promise<VectorQueryResult[]> {
    if (!this.isInitialized) await this.initialize();

    const embedder = getEmbedder();
    const queryVector = await embedder.embed(queryText);

    return vectorStorage.query(userId, queryVector, nResults);
  }

  /**
   * Query for similar entities using pre-computed vector
   */
  async queryDirect(
    userId: string,
    queryVector: Float32Array,
    nResults: number = 5
  ): Promise<VectorQueryResult[]> {
    if (!this.isInitialized) await this.initialize();

    return vectorStorage.query(userId, queryVector, nResults);
  }

  /**
   * Get embedding for a specific entity
   */
  async getByEntity(
    entityType: LinkableEntityType | 'summary',
    entityId: string
  ): Promise<VectorEmbedding | null> {
    if (!this.isInitialized) await this.initialize();

    return vectorStorage.getByEntity(entityType, entityId);
  }

  /**
   * Delete embedding for an entity
   */
  async delete(entityType: LinkableEntityType | 'summary', entityId: string): Promise<void> {
    if (!this.isInitialized) await this.initialize();

    return vectorStorage.delete(entityType, entityId);
  }

  /**
   * Reset service state (useful for testing)
   */
  async reset(): Promise<void> {
    this.isInitialized = false;
    await vectorStorage.reset();
    this.isInitialized = true;
  }
}

// HMR-safe singleton
const globalVectorService = globalThis as unknown as {
  _shifu_vector_service?: VectorService;
};

if (!globalVectorService._shifu_vector_service) {
  globalVectorService._shifu_vector_service = new VectorService();
}

export const vectorService = globalVectorService._shifu_vector_service;
