import { db } from '../src/db/database';
import { archiverService } from '../src/services/ai/ArchiverService';
import { generateResponse } from '../src/services/ai/Inference';

// Mock the dependencies
jest.mock('../src/db/database', () => ({
  db: {
    query: jest.fn(),
    execute: jest.fn(),
    transaction: jest.fn(),
  },
}));

jest.mock('../src/services/ai/Inference', () => ({
  generateResponse: jest.fn(),
  unloadModel: jest.fn(),
}));

describe('ArchiverService Rollups', () => {
  const USER_ID = 'test-user-id';

  beforeEach(() => {
    jest.clearAllMocks();
    // Default generateResponse to just return a dummy string
    (generateResponse as jest.Mock).mockResolvedValue('Mocked AI Summary');
  });

  it('should trigger a weekly rollup when 7 unrolled dailies exist', async () => {
    // We mock the DB to return 7 daily summaries
    const fakeDailies = Array.from({ length: 7 }).map((_, i) => ({
      id: `daily-id-${i}`,
      date_string: `2024-01-0${i + 1}`,
      content: `Content for day ${i + 1}`,
    }));

    let consumedDaily = false;
    (db.query as jest.Mock).mockImplementation((_queryStr: string, params?: any[]) => {
      if (params?.[1] === 'daily' && !consumedDaily) {
        consumedDaily = true;
        return Promise.resolve(fakeDailies);
      }
      return Promise.resolve([]);
    });

    // Mock transaction to just execute the callback
    (db.transaction as jest.Mock).mockImplementation(async callback => {
      const mockTx = { runAsync: jest.fn() };
      await callback(mockTx);
    });

    await archiverService.runHierarchicalRollups(USER_ID);

    // Verify generateResponse was called for the weekly rollup
    expect(generateResponse).toHaveBeenCalledTimes(1);
    const callArgs = (generateResponse as jest.Mock).mock.calls[0][0]; // the messages array
    expect(callArgs[0].content).toContain('weekly'); // System prompt should mention weekly

    // Verify DB transaction was called to insert the weekly summary and mark the 7 dailies as rolled up
    expect(db.transaction).toHaveBeenCalled();
  });

  it('should NOT trigger a weekly rollup if only 6 unrolled dailies exist', async () => {
    const fakeDailies = Array.from({ length: 6 }).map((_, i) => ({
      id: `daily-id-${i}`,
      date_string: `2024-01-0${i + 1}`,
      content: `Content for day ${i + 1}`,
    }));

    let consumedDaily = false;
    (db.query as jest.Mock).mockImplementation((_queryStr: string, params?: any[]) => {
      if (params?.[1] === 'daily' && !consumedDaily) {
        consumedDaily = true;
        return Promise.resolve(fakeDailies);
      }
      return Promise.resolve([]);
    });

    await archiverService.runHierarchicalRollups(USER_ID);

    // Should not call AI
    expect(generateResponse).not.toHaveBeenCalled();
    expect(db.transaction).not.toHaveBeenCalled();
  });

  it('should cascade rollups: 4 weeklies trigger 1 monthly', async () => {
    const fakeWeeklies = Array.from({ length: 4 }).map((_, i) => ({
      id: `weekly-id-${i}`,
      date_string: `2024-01-${(i + 1) * 7}`,
      content: `Content for week ${i + 1}`,
    }));

    let consumedWeekly = false;
    (db.query as jest.Mock).mockImplementation((_queryStr: string, params?: any[]) => {
      if (params?.[1] === 'weekly' && !consumedWeekly) {
        consumedWeekly = true;
        return Promise.resolve(fakeWeeklies);
      }
      return Promise.resolve([]);
    });

    (db.transaction as jest.Mock).mockImplementation(async callback => {
      const mockTx = { runAsync: jest.fn() };
      await callback(mockTx);
    });

    await archiverService.runHierarchicalRollups(USER_ID);

    // 1 AI call for the monthly rollup
    expect(generateResponse).toHaveBeenCalledTimes(1);
    const callArgs = (generateResponse as jest.Mock).mock.calls[0][0];
    expect(callArgs[0].content).toContain('monthly');
  });

  it('should cascade rollups: 3 monthlies trigger 1 quarterly', async () => {
    const fakeMonthlies = Array.from({ length: 3 }).map((_, i) => ({
      id: `monthly-id-${i}`,
      date_string: `2024-0${i + 1}-28`,
      content: `Content for month ${i + 1}`,
    }));

    let consumedMonthly = false;
    (db.query as jest.Mock).mockImplementation((_queryStr: string, params?: any[]) => {
      if (params?.[1] === 'monthly' && !consumedMonthly) {
        consumedMonthly = true;
        return Promise.resolve(fakeMonthlies);
      }
      return Promise.resolve([]);
    });

    (db.transaction as jest.Mock).mockImplementation(async callback => {
      const mockTx = { runAsync: jest.fn() };
      await callback(mockTx);
    });

    await archiverService.runHierarchicalRollups(USER_ID);

    // 1 AI call for the quarterly rollup
    expect(generateResponse).toHaveBeenCalledTimes(1);
    const callArgs = (generateResponse as jest.Mock).mock.calls[0][0];
    expect(callArgs[0].content).toContain('quarterly');
  });
});
