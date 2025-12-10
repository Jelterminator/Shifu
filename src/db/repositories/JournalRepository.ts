import type { JournalEntry, JournalEntryRow, JournalSegment } from '../../types/database';
import { generateId } from '../../utils/id';
import { db } from '../database';
import { mapJournalEntryRowToJournalEntry } from '../mappers';

class JournalRepository {
  // CREATE
  async create(
    userId: string,
    data: {
      entryDate: Date;
      content?: string;
      segments?: Array<{ timeKey: string; content: string }>;
    }
  ): Promise<JournalEntry> {
    const id = generateId();
    const dateStr = data.entryDate.toISOString(); // Store as ISO string for consistency

    await db.transaction(async tx => {
      // Insert main entry
      await tx.runAsync(
        `INSERT INTO journal_entries (id, user_id, entry_date, content, linked_object_ids) VALUES (?, ?, ?, ?, ?)`,
        [id, userId, dateStr, data.content || null, '[]']
      );

      // Insert segments if provided
      if (data.segments && data.segments.length > 0) {
        for (const segment of data.segments) {
          const segmentId = generateId();
          await tx.runAsync(
            `INSERT INTO journal_segments (id, journal_entry_id, time_key, content) VALUES (?, ?, ?, ?)`,
            [segmentId, id, segment.timeKey, segment.content]
          );
        }
      }
    });

    const entry = await this.getById(id);
    if (!entry) throw new Error('Failed to create journal entry');
    return entry;
  }

  // READ
  async getById(id: string): Promise<JournalEntry | null> {
    const entryRows = await db.query<JournalEntryRow>(
      'SELECT * FROM journal_entries WHERE id = ?',
      [id]
    );
    if (entryRows.length === 0) return null;

    const segmentRows = await db.query<JournalSegment>(
      'SELECT id, time_key as timeKey, content FROM journal_segments WHERE journal_entry_id = ?',
      [id]
    );

    const entry = mapJournalEntryRowToJournalEntry(entryRows[0]!);
    if (segmentRows.length > 0) {
      entry.segments = segmentRows;
    }
    return entry;
  }

  async getForDateRange(userId: string, startDate: Date, endDate: Date): Promise<JournalEntry[]> {
    const startStr = startDate.toISOString();
    const endStr = endDate.toISOString();

    const rows = await db.query<JournalEntryRow>(
      `SELECT * FROM journal_entries WHERE user_id = ? AND entry_date >= ? AND entry_date <= ? ORDER BY entry_date DESC`,
      [userId, startStr, endStr]
    );

    // Fetch all segments for these entries efficiently?
    // For now, n+1 query is acceptable for local SQLite given assumed low volume.
    // Or we could do a JOIN, but our mapper expects Row.

    return Promise.all(
      rows.map(async row => {
        const segments = await db.query<JournalSegment>(
          'SELECT id, time_key as timeKey, content FROM journal_segments WHERE journal_entry_id = ?',
          [row.id]
        );
        const entry = mapJournalEntryRowToJournalEntry(row);
        if (segments.length > 0) {
          entry.segments = segments;
        }
        return entry;
      })
    );
  }

  async getRecent(userId: string, limit = 7): Promise<JournalEntry[]> {
    const rows = await db.query<JournalEntryRow>(
      'SELECT * FROM journal_entries WHERE user_id = ? ORDER BY entry_date DESC LIMIT ?',
      [userId, limit]
    );

    return Promise.all(
      rows.map(async row => {
        const segments = await db.query<JournalSegment>(
          'SELECT id, time_key as timeKey, content FROM journal_segments WHERE journal_entry_id = ?',
          [row.id]
        );
        const entry = mapJournalEntryRowToJournalEntry(row);
        if (segments.length > 0) {
          entry.segments = segments;
        }
        return entry;
      })
    );
  }

  // UPDATE
  async update(id: string, content: string): Promise<void> {
    await db.execute(
      `UPDATE journal_entries SET content = ?, updated_at = datetime('now') WHERE id = ?`,
      [content, id]
    );
  }

  // DELETE
  async delete(id: string): Promise<void> {
    // Segments will cascade delete due to FK
    await db.execute('DELETE FROM journal_entries WHERE id = ?', [id]);
  }
}

export const journalRepository = new JournalRepository();
