/* eslint-disable @typescript-eslint/no-explicit-any */

// MOCK TYPES to avoid import.meta crash from chromadb SDK
type Collection = any;
class ChromaClient {
  constructor(_params: any) {}
  async getOrCreateCollection(_params: any): Promise<any> {
    await Promise.resolve();
    return null;
  }
  async reset(): Promise<void> {
    await Promise.resolve();
  }
}

// Configuration - this would typically come from environment variables
// For local device dev, we assume a local instance or proxy.
// Given strict "on-device", this might imply a future embedded solution,
// but for now we implement the standard client.
const CHROMA_URL = 'http://localhost:8000';

class VectorService {
  private client: ChromaClient;
  private embeddingsCollection: Collection | null = null;
  private summariesCollection: Collection | null = null;
  private isInitialized = false;

  constructor() {
    this.client = new ChromaClient({ path: CHROMA_URL });
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    await Promise.resolve();

    try {
      // eslint-disable-next-line no-console
      console.log('⚠️ VectorService: mocked for React Native compatibility');
      // Get or create collections
      // this.embeddingsCollection = await this.client.getOrCreateCollection({
      //   name: 'embeddings',
      //   metadata: { description: 'Raw entity embeddings' },
      // });

      // this.summariesCollection = await this.client.getOrCreateCollection({
      //   name: 'summaries',
      //   metadata: { description: 'Hierarchical summary embeddings' },
      // });

      this.isInitialized = true;
    } catch (error) {
      // We don't throw here to avoid crashing the app if vector DB is offline,
      // as per robust offline-first design.
    }
  }

  // Generic add method
  async addEmbedding(
    _collectionName: 'embeddings' | 'summaries',
    _id: string,
    _vector: number[],
    _metadata: Record<string, string | number | boolean>,
    _document?: string
  ): Promise<void> {
    // Mock implementation
    await Promise.resolve();
    return;
  }

  // Generic query method
  async query(
    _collectionName: 'embeddings' | 'summaries',
    _queryVector: number[],
    _nResults: number = 5,
    _where?: Record<string, string | number | boolean>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    // Mock return
    await Promise.resolve();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
      ids: [[]],
      embeddings: [[]],
      documents: [[]],
      metadatas: [[]],
      distances: [[]],
    };
  }

  // Delete
  async delete(_collectionName: 'embeddings' | 'summaries', _id: string): Promise<void> {
    await Promise.resolve();
    return;
  }

  async reset(): Promise<void> {
    // await this.client.reset();
    this.isInitialized = false;
    await this.initialize();
  }
}

export const vectorService = new VectorService();
