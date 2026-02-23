/**
 * HeartbeatService — The autonomous background maintenance loop for Shifu.
 *
 * Runs via expo-background-task (WorkManager on Android, BGTaskScheduler on iOS).
 * Each invocation is **stateless**: we re-initialize the DB, read what's needed,
 * perform maintenance, and exit cleanly.
 *
 * Current capabilities (Phase 6 MVP):
 *   - Log heartbeat run (timestamp, duration, result) to SQLite
 *   - Guard: only do heavy work (Qwen) when charging
 *
 * Future capabilities (plug in later):
 *   - Daily → Weekly → Monthly summarization roll-ups
 *   - Schedule generation for the next day
 *   - Context compression / memory pruning
 *   - Model A/B testing and rollback
 */

import { Platform } from 'react-native';
import { db } from '../../db/database';
import { storage } from '../../utils/storage';

// ── Storage keys ────────────────────────────────────────────────────────
const LAST_HEARTBEAT_KEY = 'heartbeat_last_run';
const HEARTBEAT_COUNT_KEY = 'heartbeat_run_count';

// ── Types ───────────────────────────────────────────────────────────────
export interface HeartbeatResult {
  success: boolean;
  durationMs: number;
  stepsCompleted: string[];
  error?: string;
}

// ── The Service ─────────────────────────────────────────────────────────
export class HeartbeatService {
  private static instance: HeartbeatService;

  static getInstance(): HeartbeatService {
    if (!HeartbeatService.instance) {
      HeartbeatService.instance = new HeartbeatService();
    }
    return HeartbeatService.instance;
  }

  /**
   * Main entry point — called by the TaskManager `defineTask` callback.
   * Must be fully self-contained (no React context, no hooks).
   */
  async execute(): Promise<HeartbeatResult> {
    const start = Date.now();
    const stepsCompleted: string[] = [];

    try {
      // ── Step 0: Ensure DB is ready ──────────────────────────────────
      await db.initialize();
      stepsCompleted.push('db_init');

      // ── Step 1: Ensure heartbeat_log table exists ───────────────────
      await this.ensureHeartbeatTable();
      stepsCompleted.push('table_check');

      // ── Step 2: Log that we woke up ─────────────────────────────────
      const now = new Date().toISOString();
      await db.execute(`INSERT INTO heartbeat_log (timestamp, status, platform) VALUES (?, ?, ?)`, [
        now,
        'started',
        Platform.OS,
      ]);
      stepsCompleted.push('log_start');

      // ── Step 3: Run lightweight maintenance ─────────────────────────
      // These are safe to run anytime (no model loading).
      await this.runLightMaintenance();
      stepsCompleted.push('light_maintenance');

      // ── Step 4: Heavy maintenance — gated on charging ─────────────────
      const isCharging = await this.isDeviceCharging();
      if (isCharging) {
        await this.runHeavyMaintenance();
        stepsCompleted.push('heavy_maintenance');
      } else {
        stepsCompleted.push('skipped_heavy_not_charging');
      }

      // ── Step 5: Update run metadata ─────────────────────────────────
      const durationMs = Date.now() - start;
      await db.execute(`UPDATE heartbeat_log SET status = ?, duration_ms = ? WHERE timestamp = ?`, [
        'completed',
        durationMs,
        now,
      ]);
      stepsCompleted.push('log_complete');

      // Persist to fast storage for UI reads
      storage.set(LAST_HEARTBEAT_KEY, now);
      const count = storage.getNumber(HEARTBEAT_COUNT_KEY) ?? 0;
      storage.set(HEARTBEAT_COUNT_KEY, count + 1);

      // eslint-disable-next-line no-console
      console.log(
        `💓 Heartbeat completed in ${durationMs}ms (steps: ${stepsCompleted.join(', ')})`
      );

      return { success: true, durationMs, stepsCompleted };
    } catch (error) {
      const durationMs = Date.now() - start;
      const message = error instanceof Error ? error.message : String(error);
      console.error('💔 Heartbeat failed:', message);

      // Best-effort: log failure to DB
      try {
        await db.execute(
          `INSERT INTO heartbeat_log (timestamp, status, duration_ms, error, platform) VALUES (?, ?, ?, ?, ?)`,
          [new Date().toISOString(), 'failed', durationMs, message, Platform.OS]
        );
      } catch {
        // If even this fails, we can't do much
      }

      return { success: false, durationMs, stepsCompleted, error: message };
    }
  }

  // ── Internal helpers ────────────────────────────────────────────────
  /**
   * Ensure the heartbeat_log table exists.
   * Idempotent — safe to call every run.
   */
  private async ensureHeartbeatTable(): Promise<void> {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS heartbeat_log (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp  TEXT    NOT NULL,
        status     TEXT    NOT NULL DEFAULT 'started',
        duration_ms INTEGER,
        error      TEXT,
        platform   TEXT,
        metadata   TEXT
      )
    `);
  }

  /**
   * Check if the device is currently charging.
   * On the web or if the check fails, we default to false (safe approach).
   */
  private async isDeviceCharging(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    try {
      const { default: Battery } = await import('expo-battery');
      const state = await Battery.getBatteryStateAsync();
      return state === Battery.BatteryState.CHARGING || state === Battery.BatteryState.FULL;
    } catch {
      return false;
    }
  }

  /**
   * Heavy maintenance that should ONLY run when the device is charging.
   * This includes loading the AI model and generating hierarchical summaries.
   */
  private async runHeavyMaintenance(): Promise<void> {
    try {
      // Dynamic import to avoid loading the model logic if not needed
      const { archiverService } = await import('../ai/ArchiverService');

      // Calculate yesterday's date string (YYYY-MM-DD)
      // We summarize "yesterday" so we don't accidentally summarize a day while it's still happening
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const dateString = yesterday.toISOString().split('T')[0] || '';

      // Get the current user
      const users = await db.query<{ id: string }>('SELECT id FROM users LIMIT 1');
      const user = users && users.length > 0 ? users[0] : undefined;
      const userId = user?.id;
      if (typeof userId === 'string') {
        await archiverService.runDailyArchive(dateString, userId);
        await archiverService.generateJournalInsights(userId);
      }
    } catch (error) {
      console.error(`[Heartbeat] Heavy maintenance error:`, error);
      throw error;
    }
  }

  /**
   * Lightweight maintenance that is safe to run on battery.
   * No model loading, no heavy computation.
   */
  private async runLightMaintenance(): Promise<void> {
    // Prune old heartbeat logs (keep last 100 entries)
    await db.execute(`
      DELETE FROM heartbeat_log
      WHERE id NOT IN (
        SELECT id FROM heartbeat_log ORDER BY id DESC LIMIT 100
      )
    `);
  }

  // ── Public query helpers (for UI) ─────────────────────────────────
  /**
   * Get the last heartbeat timestamp from fast storage.
   */
  static getLastRunTimestamp(): string | null {
    return storage.get(LAST_HEARTBEAT_KEY);
  }

  /**
   * Get the total number of heartbeat runs.
   */
  static getRunCount(): number {
    return storage.getNumber(HEARTBEAT_COUNT_KEY) ?? 0;
  }

  /**
   * Query recent heartbeat logs from the database.
   */
  static async getRecentLogs(limit: number = 10): Promise<
    {
      id: number;
      timestamp: string;
      status: string;
      duration_ms: number | null;
      error: string | null;
    }[]
  > {
    try {
      await db.initialize();
      return await db.query<{
        id: number;
        timestamp: string;
        status: string;
        duration_ms: number | null;
        error: string | null;
      }>(
        'SELECT id, timestamp, status, duration_ms, error FROM heartbeat_log ORDER BY id DESC LIMIT ?',
        [limit]
      );
    } catch {
      return [];
    }
  }
}
