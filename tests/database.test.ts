// Mock expo-sqlite
const mockOpenDatabaseAsync = jest.fn();
const mockRunAsync = jest.fn();
const mockGetAllAsync = jest.fn();
const mockGetFirstAsync = jest.fn();
const mockExecAsync = jest.fn();
const mockWithTransactionAsync = jest.fn();

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: mockOpenDatabaseAsync,
}));

// Mock schema
jest.mock('../src/db/schema', () => ({
  MIGRATIONS: [
    { version: 1, sql: 'CREATE TABLE t1 (id TEXT);' },
    { version: 2, sql: 'CREATE TABLE t2 (id TEXT);' },
  ],
}));

describe('DatabaseService', () => {
  let dbService: any;
  let mockDb: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    // @ts-expect-error - Global assignment for testing
    global._shifu_db_instance = undefined;

    mockDb = {
      runAsync: mockRunAsync,
      getAllAsync: mockGetAllAsync,
      getFirstAsync: mockGetFirstAsync,
      execAsync: mockExecAsync,
      withTransactionAsync: mockWithTransactionAsync.mockImplementation(
        async (cb: any) => await cb()
      ),
    };

    mockOpenDatabaseAsync.mockResolvedValue(mockDb);

    // Re-import to get a fresh instance
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { db } = require('../src/db/database');
    dbService = db;
  });

  describe('initialize', () => {
    it('should initialize database and run migrations', async () => {
      // Mock current version as 0
      mockGetFirstAsync.mockResolvedValue({ user_version: 0 });

      await dbService.initialize();

      expect(mockOpenDatabaseAsync).toHaveBeenCalledWith('shifu.db');
      expect(mockDb.runAsync).toHaveBeenCalledWith('PRAGMA foreign_keys = ON', []);
      expect(mockDb.runAsync).toHaveBeenCalledWith('PRAGMA journal_mode = WAL', []);

      // Should check version
      expect(mockGetFirstAsync).toHaveBeenCalledWith('PRAGMA user_version');

      // Should run migrations 1 and 2
      expect(mockDb.execAsync).toHaveBeenCalledWith('CREATE TABLE t1 (id TEXT);');
      expect(mockDb.execAsync).toHaveBeenCalledWith('PRAGMA user_version = 1');
      expect(mockDb.execAsync).toHaveBeenCalledWith('CREATE TABLE t2 (id TEXT);');
      expect(mockDb.execAsync).toHaveBeenCalledWith('PRAGMA user_version = 2');
    });

    it('should skip existing migrations', async () => {
      // Mock current version as 1
      mockGetFirstAsync.mockResolvedValue({ user_version: 1 });

      await dbService.initialize();

      // Should ONLY run migration 2
      expect(mockDb.execAsync).not.toHaveBeenCalledWith('CREATE TABLE t1 (id TEXT);');
      expect(mockDb.execAsync).toHaveBeenCalledWith('CREATE TABLE t2 (id TEXT);');
      expect(mockDb.execAsync).toHaveBeenCalledWith('PRAGMA user_version = 2');
    });
  });

  describe('query execution', () => {
    beforeEach(async () => {
      mockGetFirstAsync.mockResolvedValue({ user_version: 2 });
      await dbService.initialize();
    });

    it('query should call getAllAsync', async () => {
      const sql = 'SELECT * FROM t1';
      const params = ['test'];
      await dbService.query(sql, params);
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(sql, params);
    });

    it('execute should call runAsync', async () => {
      const sql = 'INSERT INTO t1 VALUES (?)';
      const params = ['test'];
      await dbService.execute(sql, params);
      expect(mockDb.runAsync).toHaveBeenCalledWith(sql, params);
    });

    it('transaction should call withTransactionAsync', async () => {
      const op = jest.fn();
      await dbService.transaction(op);
      expect(mockDb.withTransactionAsync).toHaveBeenCalled();
      expect(op).toHaveBeenCalledWith(mockDb);
    });
  });
});
