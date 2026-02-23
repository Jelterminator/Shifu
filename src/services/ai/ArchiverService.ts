import { db } from '../../db/database';
import { getRandomHexagram } from '../../utils/iching';
import { storage } from '../../utils/storage';
import { generateResponse, unloadModel } from './Inference';
import {
  buildDailyScrapePrompt,
  buildJournalInsightPrompt,
  buildRollupPrompt,
} from './PromptBuilder';

type SummaryType = 'daily' | 'weekly' | 'monthly' | 'quarterly';

interface ArchivalSummary {
  id: string;
  user_id: string;
  summary_type: SummaryType;
  date_string: string;
  content: string;
  is_rolled_up: number;
}

export class ArchiverService {
  private static instance: ArchiverService;

  static getInstance(): ArchiverService {
    if (!ArchiverService.instance) {
      ArchiverService.instance = new ArchiverService();
    }
    return ArchiverService.instance;
  }

  /**
   * Run the archiving process for a specific date (usually yesterday).
   * Generates the daily summary, then checks if it should trigger weekly/monthly/quarterly rollups.
   *
   * @param dateString YYYY-MM-DD
   * @param userId The ID of the user
   */
  async runDailyArchive(dateString: string, userId: string): Promise<void> {
    try {
      // 1. Check if daily summary already exists
      const existing = await db.query<ArchivalSummary>(
        `SELECT id FROM archival_summaries WHERE user_id = ? AND date_string = ? AND summary_type = 'daily'`,
        [userId, dateString]
      );

      if (existing.length > 0) {
        // eslint-disable-next-line no-console
        console.log(`[Archiver] Daily summary for ${dateString} already exists. Skipping.`);
        return;
      }

      // 2. Fetch all daily data
      const dataContext = await this.aggregateDailyData(dateString, userId);

      if (!dataContext || dataContext.trim() === '') {
        // eslint-disable-next-line no-console
        console.log(`[Archiver] No data to summarize for ${dateString}.`);
        return;
      }

      // 3. Generate summary via LLM
      const messages = buildDailyScrapePrompt(dataContext);
      const summaryContent = await generateResponse(messages, false);

      // 4. Save carefully
      const summaryId = `arch-daily-${dateString}-${Date.now()}`;
      await db.execute(
        `INSERT INTO archival_summaries (id, user_id, summary_type, date_string, content, is_rolled_up) 
         VALUES (?, ?, 'daily', ?, ?, 0)`,
        [summaryId, userId, dateString, summaryContent.trim()]
      );

      // eslint-disable-next-line no-console
      console.log(`[Archiver] Created daily summary for ${dateString}`);

      // 5. Check and run higher-level rollups
      await this.runHierarchicalRollups(userId);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`[Archiver] Error running daily archive:`, error);
    } finally {
      unloadModel(); // Ensure model is freed since this runs in background
    }
  }

  /**
   * Generates the daily AI insight for the Journal Screen based on I Ching and historical summaries.
   */
  async generateJournalInsights(userId: string): Promise<void> {
    try {
      const today = new Date();
      const todayString = today.toISOString().split('T')[0] || '';

      const lastInsightDate = storage.getString('journal_insight_date');
      if (lastInsightDate === todayString) {
        // eslint-disable-next-line no-console
        console.log(`[Archiver] Insight for ${todayString} already exists. Skipping.`);
        return;
      }

      let dataContext = '';

      // 1. Last 3 days data
      dataContext += '=== FULL USER DATA (LAST 3 DAYS) ===\n';
      for (let i = 0; i < 3; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dStr = d.toISOString().split('T')[0] || '';
        const dailyData = await this.aggregateDailyData(dStr, userId);
        if (dailyData.trim()) {
          dataContext += dailyData + '\n';
        }
      }

      // 2. Fetch Summaries
      const fetchSummaries = async (type: SummaryType, limit: number): Promise<string> => {
        const rows = await db.query<{ content: string; date_string: string }>(
          `SELECT content, date_string FROM archival_summaries 
           WHERE user_id = ? AND summary_type = ? 
           ORDER BY date_string DESC LIMIT ?`,
          [userId, type, limit]
        );
        if (rows.length === 0) return '';
        let res = `=== LAST ${limit} ${type.toUpperCase()} SUMMARIES ===\n`;
        // Reverse to have oldest to newest
        for (const row of [...rows].reverse()) {
          res += `[${row.date_string}]\n${row.content}\n\n`;
        }
        return res;
      };

      dataContext += await fetchSummaries('daily', 7);
      dataContext += await fetchSummaries('weekly', 4);
      dataContext += await fetchSummaries('monthly', 3);
      dataContext += await fetchSummaries('quarterly', 8);

      if (!dataContext.trim()) {
        // eslint-disable-next-line no-console
        console.log(`[Archiver] No data for journal insight.`);
        return;
      }

      const hexagram = getRandomHexagram();
      const messages = buildJournalInsightPrompt(dataContext, hexagram);

      const insightContent = await generateResponse(messages, false);

      storage.set('journal_insight_text', insightContent.trim());
      storage.set('journal_insight_date', todayString);

      // eslint-disable-next-line no-console
      console.log(
        `[Archiver] Created journal insight for ${todayString} based on Hexagram ${hexagram.number}`
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`[Archiver] Error generating journal insight:`, error);
    } finally {
      unloadModel();
    }
  }

  /**
   * Evaluates and runs any higher-level rollups that have met their count thresholds.
   * 7 dailies -> 1 weekly
   * 4 weeklies -> 1 monthly
   * 3 monthlies -> 1 quarterly
   */
  async runHierarchicalRollups(userId: string): Promise<void> {
    try {
      // Sequence matters: build weeks, then months, then quarters.
      // E.g., a new daily might trigger a new weekly, which might trigger a new monthly...

      let performedRollup = true;
      let iterations = 0;

      // Loop to handle cascading rollups (unlikely to need more than 3 iterations, but just in case)
      while (performedRollup && iterations < 5) {
        performedRollup = false;

        const rolledWeekly = await this.tryRollup(userId, 'daily', 'weekly', 7);
        const rolledMonthly = await this.tryRollup(userId, 'weekly', 'monthly', 4);
        const rolledQuarterly = await this.tryRollup(userId, 'monthly', 'quarterly', 3);

        performedRollup = rolledWeekly || rolledMonthly || rolledQuarterly;
        iterations++;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`[Archiver] Error during hierarchical rollups:`, error);
    }
  }

  /**
   * Attempts to roll up `requiredCount` of `sourceType` into one `targetType`.
   * Returns true if a rollup was performed.
   */
  private async tryRollup(
    userId: string,
    sourceType: SummaryType,
    targetType: SummaryType,
    requiredCount: number
  ): Promise<boolean> {
    // 1. Find unrolled summaries of the source type, ordered by oldest first
    const unrolled = await db.query<ArchivalSummary>(
      `SELECT id, date_string, content FROM archival_summaries 
       WHERE user_id = ? AND summary_type = ? AND is_rolled_up = 0 
       ORDER BY date_string ASC`,
      [userId, sourceType]
    );

    if (unrolled.length < requiredCount) {
      return false; // Not enough for a rollup
    }

    // 2. We have enough. Take exactly the required count (oldest first).
    const toRollup = unrolled.slice(0, requiredCount);
    const rollupIds = toRollup.map(s => s.id);
    // Join the contents so the model knows which day is which
    const joinedContents = toRollup
      .map(s => `[${s.date_string}]\n${s.content}`)
      .join('\n\n---\n\n');

    // Use the latest date in the set as the date_string for the new summary
    const latestDateStr = toRollup[toRollup.length - 1]!.date_string;

    // 3. Generate the higher-level summary
    const rollupTarget = targetType as 'weekly' | 'monthly' | 'quarterly';
    const messages = buildRollupPrompt(rollupTarget, joinedContents);
    const rollupContent = await generateResponse(messages, false);

    // 4. Save the new summary and mark the old ones as rolled up
    const newSummaryId = `arch-${targetType}-${latestDateStr}-${Date.now()}`;

    await db.transaction(async tx => {
      // Insert new
      await tx.runAsync(
        `INSERT INTO archival_summaries (id, user_id, summary_type, date_string, content, is_rolled_up) 
         VALUES (?, ?, ?, ?, ?, 0)`,
        [newSummaryId, userId, targetType, latestDateStr, rollupContent.trim()]
      );

      // Update old
      // Using placeholders for the IN clause
      const placeholders = rollupIds.map(() => '?').join(',');
      await tx.runAsync(
        `UPDATE archival_summaries SET is_rolled_up = 1 WHERE id IN (${placeholders})`,
        rollupIds
      );
    });

    // eslint-disable-next-line no-console
    console.log(`[Archiver] Created ${targetType} summary ending on ${latestDateStr}`);
    return true; // We successfully rolled up
  }

  /**
   * Aggregates all relevant user DB events into a string for the prompt.
   */
  private async aggregateDailyData(dateString: string, userId: string): Promise<string> {
    let context = `DAY ARCHIVE FOR: ${dateString}\n\n`;

    // 1. Completed Tasks & Habits (via plans table or direct tables)
    // We will query the 'plans' table to see what actually happened, since plans tracks the execution/ratings.
    const plans = await db.query<{
      name: string;
      source_type: string;
      done: number;
      rating: number;
    }>(
      `SELECT name, source_type, done, rating FROM plans
       WHERE user_id = ? AND date(start_time) = ? AND done IS NOT NULL`,
      [userId, dateString]
    );

    if (plans.length > 0) {
      context += '--- EXECUTED PLANS (TASKS & HABITS) ---\n';
      for (const p of plans) {
        const status = p.done === 1 ? 'COMPLETED' : 'SKIPPED/FAILED';
        const ratingStr = p.rating ? `(Rating: ${p.rating}/5)` : '';
        context += `- [${p.source_type.toUpperCase()}] ${p.name}: ${status} ${ratingStr}\n`;
      }
      context += '\n';
    }

    // 2. Journal Entries
    const journals = await db.query<{ content: string }>(
      `SELECT content FROM journal_entries WHERE user_id = ? AND entry_date = ?`,
      [userId, dateString]
    );

    if (journals.length > 0) {
      context += '--- JOURNAL ENTRIES ---\n';
      for (const j of journals) {
        if (j.content) context += `${j.content}\n\n`;
      }
    }

    // 3. Anchors (Spiritual Practices)
    const anchors = await db.query<{ name: string; duration_minutes: number; description: string }>(
      `SELECT name, duration_minutes, description FROM anchors WHERE user_id = ? AND date_str = ?`,
      [userId, dateString]
    );

    if (anchors.length > 0) {
      context += '--- SPIRITUAL / ANCHOR PRACTICES ---\n';
      for (const a of anchors) {
        context += `- ${a.name} (${a.duration_minutes}m): ${a.description || ''}\n`;
      }
      context += '\n';
    }

    return context;
  }
}

export const archiverService = ArchiverService.getInstance();
