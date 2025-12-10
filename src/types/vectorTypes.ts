/**
 * Vector-related types for RAG system
 * Matching DATA_BIBLE specifications
 */

/** Linkable entity types that can have embeddings */
export type LinkableEntityType =
  | 'appointment'
  | 'plan'
  | 'anchor'
  | 'habit'
  | 'task'
  | 'project'
  | 'journal_entry'
  | 'note'
  | 'insight';

/**
 * Vector embedding for semantic search
 */
export interface VectorEmbedding {
  id: string;
  userId: string;
  /** Type of source entity */
  entityType: LinkableEntityType | 'summary';
  /** ID of source entity */
  entityId: string;
  /** Embedding vector (stored as Float32Array, persisted as BLOB) */
  vector: Float32Array;
  /** Dimensionality of the embedding */
  dimensions: number;
  /** Cluster assignment for ANN indexing */
  clusterId?: number;
  createdAt: Date;
}

/**
 * SQLite row representation of VectorEmbedding
 */
export interface VectorEmbeddingRow {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  vector: ArrayBuffer; // BLOB
  dimensions: number;
  cluster_id: number | null;
  created_at: string;
}

/**
 * Cluster centroid for approximate nearest neighbor search
 */
export interface VectorCluster {
  id: number;
  userId: string;
  centroid: Float32Array;
  dimensions: number;
  memberCount: number;
  updatedAt: Date;
}

/**
 * SQLite row representation of VectorCluster
 */
export interface VectorClusterRow {
  id: number;
  user_id: string;
  centroid: ArrayBuffer; // BLOB
  dimensions: number;
  member_count: number;
  updated_at: string;
}

/**
 * Result from vector similarity query
 */
export interface VectorQueryResult {
  id: string;
  entityType: string;
  entityId: string;
  /** Cosine similarity score (1 = identical, 0 = orthogonal) */
  similarity: number;
}
