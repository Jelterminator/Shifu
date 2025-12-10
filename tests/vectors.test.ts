import { vectorService } from '../src/db/vectors';

// Mock chromadb
jest.mock('chromadb', () => {
  const mockCollection = {
    add: jest.fn(),
    query: jest.fn(),
    delete: jest.fn(),
  };

  const mockClient = {
    getOrCreateCollection: jest.fn().mockResolvedValue(mockCollection),
    reset: jest.fn(),
  };

  return {
    ChromaClient: jest.fn(() => mockClient),
  };
});

describe('VectorService', () => {
  let mockClient: any;
  let mockCollection: any;

  beforeEach(async () => {
    // Get the mock instance
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { ChromaClient } = require('chromadb');
    mockClient = new ChromaClient();
    mockCollection = await mockClient.getOrCreateCollection();

    jest.clearAllMocks();

    // Reset service state if possible, though it's a singleton.
    // We assume initialize is idempotent-ish or we just test the calls.
    await vectorService.initialize();
  });

  it('initialize should create collections', async () => {
    expect(mockClient.getOrCreateCollection).toHaveBeenCalledWith({
      name: 'embeddings',
      metadata: expect.any(Object),
    });
    expect(mockClient.getOrCreateCollection).toHaveBeenCalledWith({
      name: 'summaries',
      metadata: expect.any(Object),
    });
  });

  it('addEmbedding should call collection.add', async () => {
    const id = 'test-id';
    const vector = [0.1, 0.2, 0.3];
    const metadata = { userId: 'u1' };

    await vectorService.addEmbedding('embeddings', id, vector, metadata);

    expect(mockCollection.add).toHaveBeenCalledWith({
      ids: [id],
      embeddings: [vector],
      metadatas: [metadata],
      documents: undefined,
    });
  });

  it('query should call collection.query', async () => {
    const vector = [0.1, 0.2, 0.3];
    await vectorService.query('summaries', vector, 3);

    expect(mockCollection.query).toHaveBeenCalledWith({
      queryEmbeddings: [vector],
      nResults: 3,
      where: undefined,
    });
  });

  it('delete should call collection.delete', async () => {
    await vectorService.delete('embeddings', 'id1');
    expect(mockCollection.delete).toHaveBeenCalledWith({
      ids: ['id1'],
    });
  });
});
