/**
 * Vector Service Tests
 *
 * Tests for the cross-platform vector storage and retrieval system.
 */
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

// Mock the embedder module
jest.mock('../src/services/ai/embedder', () => {
  const mockEmbedder = {
    embed: jest.fn((text: string) => {
      // Simple deterministic embedding for testing
      const vector = new Float32Array(384);
      let hash = 0;
      for (let i = 0; i < text.length; i++) {
        hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
      }
      for (let i = 0; i < 384; i++) {
        vector[i] = Math.sin(hash + i) * 0.5;
      }
      return Promise.resolve(vector);
    }),
    getDimensions: jest.fn(() => 384),
  };

  return {
    getEmbedder: jest.fn(() => mockEmbedder),
    setEmbedder: jest.fn(),
    createStubEmbedder: jest.fn(() => mockEmbedder),
    EMBEDDING_DIMENSIONS: 384,
  };
});

// Mock Platform for web testing
jest.mock('react-native', () => ({
  Platform: {
    OS: 'web',
    select: (obj: any) => obj.web || obj.default,
  },
}));

// Mock localStorage for web storage tests
const mockStorage: Record<string, string> = {};
Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: (key: string) => mockStorage[key] ?? null,
    setItem: (key: string, value: string) => {
      mockStorage[key] = value;
    },
    removeItem: (key: string) => {
      delete mockStorage[key];
    },
    clear: () => {
      for (const key of Object.keys(mockStorage)) {
        delete mockStorage[key];
      }
    },
  },
  writable: true,
});

// Import after mocks are set up
import { vectorService } from '../src/db/vectors';
import { base64ToFloat32, cosineSimilarity, float32ToBase64 } from '../src/db/vectorStorage';

describe('VectorService', () => {
  beforeEach(async () => {
    localStorage.clear();
    // Reset service state
    await vectorService.reset();
  });

  describe('Utility Functions', () => {
    it('cosineSimilarity returns 1 for identical vectors', () => {
      const a = new Float32Array([1, 0, 0]);
      const b = new Float32Array([1, 0, 0]);
      expect(cosineSimilarity(a, b)).toBeCloseTo(1, 5);
    });

    it('cosineSimilarity returns 0 for orthogonal vectors', () => {
      const a = new Float32Array([1, 0, 0]);
      const b = new Float32Array([0, 1, 0]);
      expect(cosineSimilarity(a, b)).toBeCloseTo(0, 5);
    });

    it('cosineSimilarity returns -1 for opposite vectors', () => {
      const a = new Float32Array([1, 0, 0]);
      const b = new Float32Array([-1, 0, 0]);
      expect(cosineSimilarity(a, b)).toBeCloseTo(-1, 5);
    });

    it('float32ToBase64 and base64ToFloat32 are inverses', () => {
      const original = new Float32Array([0.1, 0.2, 0.3, -0.5, 1.0]);
      const base64 = float32ToBase64(original);
      const restored = base64ToFloat32(base64);

      expect(restored.length).toBe(original.length);
      for (let i = 0; i < original.length; i++) {
        expect(restored[i]).toBeCloseTo(original[i]!, 5);
      }
    });
  });

  describe('Embedding Operations', () => {
    it('addEmbedding stores and returns an ID', async () => {
      const id = await vectorService.addEmbedding(
        'user-1',
        'task',
        'task-123',
        'Test task content'
      );

      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('getByEntity retrieves stored embedding', async () => {
      await vectorService.addEmbedding(
        'user-1',
        'journal_entry',
        'journal-456',
        'My journal entry'
      );

      const embedding = await vectorService.getByEntity('journal_entry', 'journal-456');

      expect(embedding).not.toBeNull();
      expect(embedding?.entityType).toBe('journal_entry');
      expect(embedding?.entityId).toBe('journal-456');
      expect(embedding?.userId).toBe('user-1');
      expect(embedding?.vector).toBeInstanceOf(Float32Array);
    });

    it('delete removes embedding', async () => {
      await vectorService.addEmbedding('user-1', 'habit', 'habit-789', 'Daily exercise');

      await vectorService.delete('habit', 'habit-789');

      const embedding = await vectorService.getByEntity('habit', 'habit-789');
      expect(embedding).toBeNull();
    });

    it('addEmbedding updates existing entry for same entity', async () => {
      const id1 = await vectorService.addEmbedding('user-1', 'task', 'task-1', 'Original');
      const id2 = await vectorService.addEmbedding('user-1', 'task', 'task-1', 'Updated');

      // Should return same ID (update, not insert)
      expect(id2).toBe(id1);

      const embedding = await vectorService.getByEntity('task', 'task-1');
      expect(embedding).not.toBeNull();
    });
  });

  describe('Query Operations', () => {
    beforeEach(async () => {
      // Add some test embeddings
      await vectorService.addEmbedding('user-1', 'task', 'task-1', 'Buy groceries');
      await vectorService.addEmbedding('user-1', 'task', 'task-2', 'Buy milk');
      await vectorService.addEmbedding('user-1', 'task', 'task-3', 'Write code');
      await vectorService.addEmbedding('user-2', 'task', 'task-4', 'Other user task');
    });

    it('query returns results sorted by similarity', async () => {
      const results = await vectorService.query('user-1', 'Buy things', 3);

      expect(results.length).toBeLessThanOrEqual(3);
      // Results should be sorted by similarity
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1]!.similarity).toBeGreaterThanOrEqual(results[i]!.similarity);
      }
    });

    it('query only returns results for specified user', async () => {
      const results = await vectorService.query('user-1', 'task', 10);

      for (const result of results) {
        // Should not include user-2's tasks
        expect(result.entityId).not.toBe('task-4');
      }

      // Should have found at least the tasks we added for user-1
      expect(results.length).toBeGreaterThan(0);
    });

    it('query respects nResults limit', async () => {
      const results = await vectorService.query('user-1', 'task', 2);
      expect(results.length).toBeLessThanOrEqual(2);
    });
  });
});
