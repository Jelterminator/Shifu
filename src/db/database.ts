import * as SQLite from 'expo-sqlite';
import { MIGRATIONS } from './schema';

class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        // Open database (creates if doesn't exist)
        this.db = await SQLite.openDatabaseAsync('shifu.db');

        // Enable foreign keys
        await this.execute('PRAGMA foreign_keys = ON');
        await this.execute('PRAGMA journal_mode = WAL');

        // Run migrations
        await this.runMigrations();

        this.isInitialized = true;
      } catch (error) {
        this.initPromise = null; // Reset on failure so we can retry
        throw error;
      }
    })();

    return this.initPromise;
  }

  private async runMigrations(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Get current version
    const versionResult = await this.db.getFirstAsync<{
      user_version: number;
    }>('PRAGMA user_version');
    const currentVersion = versionResult?.user_version ?? 0;

    // Run migrations in sequence
    for (const migration of MIGRATIONS) {
      if (migration.version > currentVersion) {
        await this.db.execAsync(migration.sql);
        await this.db.execAsync(`PRAGMA user_version = ${migration.version}`);
      }
    }
  }

  // Public API
  async query<T>(sql: string, params: (string | number | null)[] = []): Promise<T[]> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.getAllAsync<T>(sql, params as (string | number)[]);
  }

  async execute(
    sql: string,
    params: (string | number | null)[] = []
  ): Promise<SQLite.SQLiteRunResult> {
    if (!this.db) throw new Error('Database not initialized');
    return await this.db.runAsync(sql, params as (string | number)[]);
  }

  async transaction(operations: (tx: SQLite.SQLiteDatabase) => Promise<void>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.withTransactionAsync(async () => {
      if (this.db) {
        await operations(this.db);
      }
    });
  }
}

// HMR-safe singleton
// In development, HMR can reload this file, creating a new instance while the old one holds the lock.
// We attach to globalThis to reuse the existing connected instance.

const globalDb = globalThis as unknown as {
  _shifu_db_instance?: DatabaseService;
};

if (!globalDb._shifu_db_instance) {
  globalDb._shifu_db_instance = new DatabaseService();
}

export const db = globalDb._shifu_db_instance;
