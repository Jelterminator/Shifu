/**
 * Platform-aware vector storage adapter
 * SQLite for native, localStorage for web
 */
import { Platform } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import type {
  LinkableEntityType,
  VectorEmbedding,
  VectorEmbeddingRow,
  VectorQueryResult,
} from '../types/vectorTypes';

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Compute cosine similarity between two vectors
 * @returns Similarity score (1 = identical, 0 = orthogonal, -1 = opposite)
 */
export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  if (a.length !== b.length) {
    throw new Error(`Vector dimension mismatch: ${a.length} vs ${b.length}`);
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i]! * b[i]!;
    normA += a[i]! * a[i]!;
    normB += b[i]! * b[i]!;
  }

  const magnitude = Math.sqrt(normA) * Math.sqrt(normB);
  if (magnitude === 0) return 0;

  return dot / magnitude;
}

/**
 * Convert Float32Array to ArrayBuffer for SQLite BLOB storage
 */
export function float32ToBuffer(arr: Float32Array): ArrayBuffer {
  return arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength) as ArrayBuffer;
}

/**
 * Convert ArrayBuffer back to Float32Array
 */
export function bufferToFloat32(buffer: ArrayBuffer): Float32Array {
  return new Float32Array(buffer);
}

/**
 * Convert Float32Array to Base64 for localStorage
 */
export function float32ToBase64(arr: Float32Array): string {
  const bytes = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

/**
 * Convert Base64 back to Float32Array
 */
export function base64ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Float32Array(bytes.buffer);
}

// =============================================================================
// Storage Adapter Interface
// =============================================================================

export interface VectorStorageAdapter {
  /** Store a new embedding */
  add(
    userId: string,
    entityType: LinkableEntityType | 'summary',
    entityId: string,
    vector: Float32Array
  ): Promise<string>;

  /** Query for similar vectors */
  query(userId: string, queryVector: Float32Array, nResults: number): Promise<VectorQueryResult[]>;

  /** Get embedding for a specific entity */
  getByEntity(
    entityType: LinkableEntityType | 'summary',
    entityId: string
  ): Promise<VectorEmbedding | null>;

  /** Delete embedding for entity */
  delete(entityType: LinkableEntityType | 'summary', entityId: string): Promise<void>;

  /** Check if initialized */
  isInitialized(): boolean;

  /** Initialize the storage */
  initialize(): Promise<void>;
}

// =============================================================================
// SQLite Implementation (Native)
// =============================================================================

class SqliteVectorStorage implements VectorStorageAdapter {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Import db lazily to avoid issues on web
    const { db } = await import('./database');
    await db.initialize();
    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async add(
    userId: string,
    entityType: LinkableEntityType | 'summary',
    entityId: string,
    vector: Float32Array
  ): Promise<string> {
    if (!this.initialized) await this.initialize();

    const { db: dbService } = await import('./database');
    const id = uuidv4();

    // Check if embedding already exists for this entity
    const existing = await dbService.query<VectorEmbeddingRow>(
      'SELECT id FROM vector_embeddings WHERE entity_type = ? AND entity_id = ?',
      [entityType, entityId]
    );

    if (existing.length > 0) {
      // Update existing
      await dbService.execute(
        `UPDATE vector_embeddings 
         SET vector = ?, dimensions = ?, user_id = ?
         WHERE entity_type = ? AND entity_id = ?`,
        [float32ToBuffer(vector) as unknown as string, vector.length, userId, entityType, entityId]
      );
      return existing[0]!.id;
    }

    // Insert new
    await dbService.execute(
      `INSERT INTO vector_embeddings (id, user_id, entity_type, entity_id, vector, dimensions)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId,
        entityType,
        entityId,
        float32ToBuffer(vector) as unknown as string,
        vector.length,
      ]
    );

    return id;
  }

  async query(
    userId: string,
    queryVector: Float32Array,
    nResults: number
  ): Promise<VectorQueryResult[]> {
    if (!this.initialized) await this.initialize();

    const { db: dbService } = await import('./database');

    // Fetch all vectors for user (brute force)
    const rows = await dbService.query<VectorEmbeddingRow>(
      'SELECT id, entity_type, entity_id, vector FROM vector_embeddings WHERE user_id = ?',
      [userId]
    );

    // Compute similarities
    const results: VectorQueryResult[] = rows.map(row => {
      const vector = bufferToFloat32(row.vector);
      const similarity = cosineSimilarity(queryVector, vector);
      return {
        id: row.id,
        entityType: row.entity_type,
        entityId: row.entity_id,
        similarity,
      };
    });

    // Sort by similarity descending and take top N
    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, nResults);
  }

  async getByEntity(
    entityType: LinkableEntityType | 'summary',
    entityId: string
  ): Promise<VectorEmbedding | null> {
    if (!this.initialized) await this.initialize();

    const { db: dbService } = await import('./database');

    const rows = await dbService.query<VectorEmbeddingRow>(
      'SELECT * FROM vector_embeddings WHERE entity_type = ? AND entity_id = ?',
      [entityType, entityId]
    );

    if (rows.length === 0) return null;

    const row = rows[0]!;
    return {
      id: row.id,
      userId: row.user_id,
      entityType: row.entity_type as LinkableEntityType | 'summary',
      entityId: row.entity_id,
      vector: bufferToFloat32(row.vector),
      dimensions: row.dimensions,
      clusterId: row.cluster_id ?? undefined,
      createdAt: new Date(row.created_at),
    };
  }

  async delete(entityType: LinkableEntityType | 'summary', entityId: string): Promise<void> {
    if (!this.initialized) await this.initialize();

    const { db: dbService } = await import('./database');

    await dbService.execute(
      'DELETE FROM vector_embeddings WHERE entity_type = ? AND entity_id = ?',
      [entityType, entityId]
    );
  }
}

// =============================================================================
// Web (localStorage) Implementation
// =============================================================================

interface WebVectorEntry {
  id: string;
  userId: string;
  entityType: string;
  entityId: string;
  vectorBase64: string;
  dimensions: number;
  clusterId?: number;
  createdAt: string;
}

const WEB_STORAGE_KEY = 'shifu_vectors';

class WebVectorStorage implements VectorStorageAdapter {
  private initialized = false;
  private vectors: Map<string, WebVectorEntry> = new Map();

  async initialize(): Promise<void> {
    await Promise.resolve(); // Satisfy require-await
    if (this.initialized) return;

    try {
      const stored = localStorage.getItem(WEB_STORAGE_KEY);
      if (stored) {
        const entries = JSON.parse(stored) as WebVectorEntry[];
        for (const entry of entries) {
          const key = `${entry.entityType}:${entry.entityId}`;
          this.vectors.set(key, entry);
        }
      }
    } catch {
      // Start fresh if parsing fails
      this.vectors.clear();
    }

    this.initialized = true;
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  private persist(): void {
    const entries = Array.from(this.vectors.values());
    localStorage.setItem(WEB_STORAGE_KEY, JSON.stringify(entries));
  }

  async add(
    userId: string,
    entityType: LinkableEntityType | 'summary',
    entityId: string,
    vector: Float32Array
  ): Promise<string> {
    if (!this.initialized) await this.initialize();

    const key = `${entityType}:${entityId}`;
    const existing = this.vectors.get(key);
    const id = existing?.id ?? uuidv4();

    const entry: WebVectorEntry = {
      id,
      userId,
      entityType,
      entityId,
      vectorBase64: float32ToBase64(vector),
      dimensions: vector.length,
      createdAt: existing?.createdAt ?? new Date().toISOString(),
    };

    this.vectors.set(key, entry);
    this.persist();

    return id;
  }

  async query(
    userId: string,
    queryVector: Float32Array,
    nResults: number
  ): Promise<VectorQueryResult[]> {
    if (!this.initialized) await this.initialize();

    const results: VectorQueryResult[] = [];

    for (const entry of this.vectors.values()) {
      if (entry.userId !== userId) continue;

      const vector = base64ToFloat32(entry.vectorBase64);
      const similarity = cosineSimilarity(queryVector, vector);

      results.push({
        id: entry.id,
        entityType: entry.entityType,
        entityId: entry.entityId,
        similarity,
      });
    }

    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, nResults);
  }

  async getByEntity(
    entityType: LinkableEntityType | 'summary',
    entityId: string
  ): Promise<VectorEmbedding | null> {
    if (!this.initialized) await this.initialize();

    const key = `${entityType}:${entityId}`;
    const entry = this.vectors.get(key);
    if (!entry) return null;

    return {
      id: entry.id,
      userId: entry.userId,
      entityType: entry.entityType as LinkableEntityType | 'summary',
      entityId: entry.entityId,
      vector: base64ToFloat32(entry.vectorBase64),
      dimensions: entry.dimensions,
      clusterId: entry.clusterId,
      createdAt: new Date(entry.createdAt),
    };
  }

  async delete(entityType: LinkableEntityType | 'summary', entityId: string): Promise<void> {
    if (!this.initialized) await this.initialize();

    const key = `${entityType}:${entityId}`;
    this.vectors.delete(key);
    this.persist();
  }
}

// =============================================================================
// Factory: Platform-aware storage selection
// =============================================================================

function createVectorStorage(): VectorStorageAdapter {
  if (Platform.OS === 'web') {
    return new WebVectorStorage();
  }
  return new SqliteVectorStorage();
}

// HMR-safe singleton
const globalStore = globalThis as unknown as {
  _shifu_vector_storage?: VectorStorageAdapter;
};

if (!globalStore._shifu_vector_storage) {
  globalStore._shifu_vector_storage = createVectorStorage();
}

export const vectorStorage = globalStore._shifu_vector_storage;
