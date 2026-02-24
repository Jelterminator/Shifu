import { db } from '../../src/db/database';
import { journalRepository } from '../../src/db/repositories/JournalRepository';
import { generateId } from '../../src/utils/id';

// Mock DB
jest.mock('../../src/db/database', () => ({
  db: {
    execute: jest.fn(),
    query: jest.fn(),
    transaction: jest.fn(cb => cb({ runAsync: jest.fn() })), // Mock transaction execution
  },
}));

jest.mock('../../src/db/vectors', () => ({
  vectorService: {
    addEmbedding: jest.fn().mockResolvedValue('embed-id'),
    delete: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../../src/utils/id', () => ({
  generateId: jest.fn(),
}));

describe('JournalRepository', () => {
  const mockDate = new Date('2025-01-01T12:00:00.000Z');
  const mockId = 'journal-123';
  const mockUserId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();
    (generateId as jest.Mock).mockReturnValue(mockId);
  });

  describe('create', () => {
    it('should create entry with segments inside transaction', async () => {
      // Mock db.transaction to execute callback immediately with a mock tx
      const mockTx = { runAsync: jest.fn() };
      (db.transaction as jest.Mock).mockImplementation(async cb => {
        await cb(mockTx);
      });

      // Mock getById to return the entry after creation
      const mockEntry = {
        id: mockId,
        user_id: mockUserId,
        entry_date: mockDate.toISOString(),
        content: 'test content',
        linked_object_ids: '[]',
        created_at: mockDate.toISOString(),
        updated_at: mockDate.toISOString(),
      };
      const mockSegments = [{ id: 's1', timeKey: '08:00', content: 'morning' }];

      // We need to mock query separately for getById logic
      (db.query as jest.Mock)
        .mockResolvedValueOnce([mockEntry]) // for getById (entry)
        .mockResolvedValueOnce(mockSegments); // for getById (segments)

      const result = await journalRepository.create(mockUserId, {
        entryDate: mockDate,
        content: 'test content',
        segments: [{ timeKey: '08:00', content: 'morning' }],
      });

      // Verification
      expect(db.transaction).toHaveBeenCalled();
      expect(mockTx.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO journal_entries'),
        [mockId, mockUserId, mockDate.toISOString(), 'test content', '[]']
      );
      expect(mockTx.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO journal_segments'),
        [expect.anything(), mockId, '08:00', 'morning']
      );

      expect(result.id).toBe(mockId);
      expect(result.segments).toHaveLength(1);
    });
  });

  describe('getForDateRange', () => {
    it('should return entries within range', async () => {
      const mockRows = [
        {
          id: 'j1',
          user_id: mockUserId,
          entry_date: mockDate.toISOString(),
          content: 'range test',
          created_at: mockDate.toISOString(),
          updated_at: mockDate.toISOString(),
        },
      ];

      // Mock query flow:
      // 1. getForDateRange -> select entries
      // 2. map -> select segments
      (db.query as jest.Mock).mockResolvedValueOnce(mockRows).mockResolvedValueOnce([]); // no segments

      await journalRepository.getForDateRange(mockUserId, mockDate, mockDate);

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('entry_date >= ?'),
        expect.arrayContaining([mockUserId])
      );
    });
  });
});
