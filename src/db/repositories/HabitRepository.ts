import type { Habit, HabitRow } from '../../types/database';
import { generateId } from '../../utils/id';
import { db } from '../database';
import { mapHabitRowToHabit, safeStringify } from '../mappers';
import { vectorService } from '../vectors';

class HabitRepository {
  // CREATE
  async create(
    userId: string,
    data: Omit<Habit, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<Habit> {
    const id = generateId();

    const selectedDaysJson = safeStringify(data.selectedDays);
    const selectedKeywordsJson = safeStringify(data.selectedKeywords);
    const linkedObjectIdsJson = safeStringify(data.linkedObjectIds);

    await db.execute(
      `INSERT INTO habits (
        id, user_id, title, minimum_session_minutes, weekly_goal_minutes,
        selected_days, selected_keywords, ideal_phase, notes, is_active, linked_object_ids
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId,
        data.title,
        data.minimumSessionMinutes,
        data.weeklyGoalMinutes,
        selectedDaysJson,
        selectedKeywordsJson,
        data.idealPhase || null, // Ensure null handling
        data.notes || null,
        data.isActive ? 1 : 0,
        linkedObjectIdsJson,
      ]
    );

    const rows = await db.query<HabitRow>('SELECT * FROM habits WHERE id = ?', [id]);
    if (!rows[0]) throw new Error('Failed to create habit: Row not found');
    const habit = mapHabitRowToHabit(rows[0]);

    const embedText = [habit.title, habit.notes].filter(Boolean).join(' ');
    try {
      if (embedText.trim()) {
        await vectorService.addEmbedding(userId, 'habit', id, embedText);
      }
    } catch (e) {
      console.warn('Failed to add embedding for habit', e);
    }

    return habit;
  }

  // READ
  async getById(id: string): Promise<Habit | null> {
    const rows = await db.query<HabitRow>('SELECT * FROM habits WHERE id = ?', [id]);
    return rows[0] ? mapHabitRowToHabit(rows[0]) : null;
  }

  async getAllForUser(userId: string, activeOnly = true): Promise<Habit[]> {
    const sql = activeOnly
      ? 'SELECT * FROM habits WHERE user_id = ? AND is_active = 1 ORDER BY created_at DESC'
      : 'SELECT * FROM habits WHERE user_id = ? ORDER BY created_at DESC';
    const rows = await db.query<HabitRow>(sql, [userId]);
    return rows.map(row => mapHabitRowToHabit(row));
  }

  async getScheduledForToday(userId: string, weekdayName: string): Promise<Habit[]> {
    const rows = await db.query<HabitRow>(
      'SELECT * FROM habits WHERE user_id = ? AND is_active = 1',
      [userId]
    );

    return rows
      .map(row => mapHabitRowToHabit(row))
      .filter(habit => {
        const dayKey = weekdayName.toLowerCase();
        const days = habit.selectedDays as Record<string, boolean>;
        return days[dayKey] === true;
      });
  }

  // UPDATE
  async update(id: string, data: Partial<Habit>): Promise<void> {
    const updates: string[] = [];
    const params: (string | number | null)[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      params.push(data.title);
    }
    if (data.minimumSessionMinutes !== undefined) {
      updates.push('minimum_session_minutes = ?');
      params.push(data.minimumSessionMinutes);
    }
    if (data.weeklyGoalMinutes !== undefined) {
      updates.push('weekly_goal_minutes = ?');
      params.push(data.weeklyGoalMinutes);
    }
    if (data.selectedDays !== undefined) {
      updates.push('selected_days = ?');
      params.push(safeStringify(data.selectedDays));
    }
    if (data.selectedKeywords !== undefined) {
      updates.push('selected_keywords = ?');
      params.push(safeStringify(data.selectedKeywords));
    }
    // Handle specific null/undefined logic for optional fields
    if (data.idealPhase !== undefined) {
      updates.push('ideal_phase = ?');
      params.push(data.idealPhase || null);
    } else if (data.idealPhase === null) {
      updates.push('ideal_phase = ?');
      params.push(null);
    }

    if (data.notes !== undefined) {
      updates.push('notes = ?');
      params.push(data.notes || null);
    }
    if (data.isActive !== undefined) {
      updates.push('is_active = ?');
      params.push(data.isActive ? 1 : 0);
    }

    if (updates.length === 0) return;

    updates.push("updated_at = datetime('now')");
    params.push(id);

    await db.execute(`UPDATE habits SET ${updates.join(', ')} WHERE id = ?`, params);

    if (data.title !== undefined || data.notes !== undefined) {
      try {
        const habit = await this.getById(id);
        if (habit) {
          const embedText = [habit.title, habit.notes].filter(Boolean).join(' ');
          if (embedText.trim()) {
            await vectorService.addEmbedding(habit.userId, 'habit', id, embedText);
          }
        }
      } catch (e) {
        console.warn('Failed to update embedding for habit', e);
      }
    }
  }

  // DELETE
  async delete(id: string): Promise<void> {
    await db.execute('DELETE FROM habits WHERE id = ?', [id]);
    try {
      await vectorService.delete('habit', id);
    } catch (e) {
      console.warn('Failed to delete embedding for habit', e);
    }
  }

  // --- STATS & COMPLETION Logic (Refactored for Timezones) ---

  // Helper to get local date string YYYY-MM-DD from a Date object
  private getLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  async calculateWeeklyProgress(habitId: string, startDate: Date): Promise<number> {
    // 1. Get raw plans data
    const rows = await db.query<{ start_time: string; end_time: string }>(
      `SELECT start_time, end_time
       FROM plans
       WHERE source_id = ?
         AND source_type = 'habit'
         AND done = 1
         AND start_time >= ? 
         AND start_time < ?`,
      [
        habitId,
        startDate.toISOString(),
        new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      ]
    );

    // 2. Sum up duration in minutes
    let totalMinutes = 0;
    for (const row of rows) {
      const start = new Date(row.start_time).getTime();
      const end = new Date(row.end_time).getTime();
      totalMinutes += (end - start) / (1000 * 60);
    }
    return Math.round(totalMinutes);
  }

  async trackCompletion(
    userId: string,
    habitId: string,
    date: Date,
    durationMinutes: number
  ): Promise<void> {
    const id = generateId();
    const startTime = date.toISOString();
    const endTime = new Date(date.getTime() + durationMinutes * 60000).toISOString();

    // prevent duplicates for THIS CALENDAR DAY
    const existing = await this.getCompletionForDate(habitId, date);
    if (existing) return;

    await db.execute(
      `INSERT INTO plans (
        id, user_id, name, start_time, end_time, done, source_id, source_type, created_at, completed_at
      ) VALUES (?, ?, ?, ?, ?, 1, ?, 'habit', datetime('now'), datetime('now'))`,
      [id, userId, 'Habit Completion', startTime, endTime, habitId]
    );
  }

  async undoCompletion(habitId: string, date: Date): Promise<void> {
    // We want to delete ANY completion that falls on this LOCAL calendar day
    const targetDay = this.getLocalDateString(date);

    // Get candidate plans based on range (optimization)
    // We'll broaden the search slightly to cover timezone edges, then filter in code
    const startRange = new Date(date);
    startRange.setHours(0, 0, 0, 0);
    startRange.setDate(startRange.getDate() - 1); // Buffer

    const endRange = new Date(date);
    endRange.setHours(23, 59, 59, 999);
    endRange.setDate(endRange.getDate() + 1); // Buffer

    const rows = await db.query<{ id: string; start_time: string }>(
      `SELECT id, start_time FROM plans 
       WHERE source_id = ? 
         AND source_type = 'habit' 
         AND start_time >= ? 
         AND start_time <= ?`,
      [habitId, startRange.toISOString(), endRange.toISOString()]
    );

    for (const row of rows) {
      const rowDate = new Date(row.start_time);
      if (this.getLocalDateString(rowDate) === targetDay) {
        // Match! Delete it.
        await db.execute('DELETE FROM plans WHERE id = ?', [row.id]);
      }
    }
  }

  async getCompletionForDate(habitId: string, date: Date): Promise<boolean> {
    const targetDay = this.getLocalDateString(date);
    // Optimization: query a window, filter in code
    const startWindow = new Date(date);
    startWindow.setDate(date.getDate() - 1);
    const endWindow = new Date(date);
    endWindow.setDate(date.getDate() + 1);

    const rows = await db.query<{ start_time: string }>(
      `SELECT start_time FROM plans 
       WHERE source_id = ? 
         AND source_type = 'habit' 
         AND done = 1
         AND start_time BETWEEN ? AND ?`,
      [habitId, startWindow.toISOString(), endWindow.toISOString()]
    );

    return rows.some(r => this.getLocalDateString(new Date(r.start_time)) === targetDay);
  }

  async getCompletedHabitIdsForDate(userId: string, date: Date): Promise<Set<string>> {
    const targetDay = this.getLocalDateString(date);
    // Broad window query
    const startWindow = new Date(date);
    startWindow.setDate(date.getDate() - 1);
    const endWindow = new Date(date);
    endWindow.setDate(date.getDate() + 1);

    const rows = await db.query<{ source_id: string; start_time: string }>(
      `SELECT source_id, start_time 
       FROM plans 
       WHERE user_id = ?
         AND source_type = 'habit' 
         AND done = 1
         AND start_time BETWEEN ? AND ?`,
      [userId, startWindow.toISOString(), endWindow.toISOString()]
    );

    const completedIds = new Set<string>();
    for (const row of rows) {
      if (this.getLocalDateString(new Date(row.start_time)) === targetDay) {
        completedIds.add(row.source_id);
      }
    }
    return completedIds;
  }

  async calculateStreak(habitId: string): Promise<number> {
    // 1. Get ALL completion dates (timestamps) sorted desc
    const rows = await db.query<{ start_time: string }>(
      `SELECT start_time
       FROM plans
       WHERE source_id = ?
         AND source_type = 'habit'
         AND done = 1
       ORDER BY start_time DESC`,
      [habitId]
    );

    if (rows.length === 0) return 0;

    // 2. Convert to unique local date strings
    const uniqueDays = new Set<string>();
    rows.forEach(r => uniqueDays.add(this.getLocalDateString(new Date(r.start_time))));

    const sortedDays = Array.from(uniqueDays).sort().reverse(); // ['2024-12-09', '2024-12-08', ...]

    let streak = 0;
    const today = new Date();
    const todayStr = this.getLocalDateString(today);

    // Check if the most recent completion is today OR yesterday
    // If most recent is 2 days ago, streak is broken (0), UNLESS we want to freeze streaks?
    // Standard logic: Streak is active if completed today OR (completed yesterday AND NOT today)

    if (sortedDays.length === 0) return 0;

    const lastCompletion = sortedDays[0];
    if (!lastCompletion) return 0;

    // Calculate gap from today
    // We can use simple string comparison/date math on the YYYY-MM-DD strings
    const todayParams = todayStr.split('-').map(Number);
    const lastParams = lastCompletion.split('-').map(Number);

    // Validate params
    if (
      todayParams.length !== 3 ||
      lastParams.length !== 3 ||
      todayParams[0] === undefined ||
      todayParams[1] === undefined ||
      todayParams[2] === undefined ||
      lastParams[0] === undefined ||
      lastParams[1] === undefined ||
      lastParams[2] === undefined
    ) {
      return 0; // Should not happen with YYYY-MM-DD
    }

    // Construct UTC dates from these strings to compare "Calendar Days" safely
    const todayDate = new Date(Date.UTC(todayParams[0], todayParams[1] - 1, todayParams[2]));
    const lastDate = new Date(Date.UTC(lastParams[0], lastParams[1] - 1, lastParams[2]));

    const diffMs = todayDate.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    // If gap > 1 day, streak is broken. (0)
    // Exception: If gap is 0 (done today) -> streak continues
    // If gap is 1 (done yesterday, not today) -> streak continues
    if (diffDays > 1) return 0;

    // Count consecutive days
    streak = 1;
    let currentCheckDate = lastDate;

    for (let i = 1; i < sortedDays.length; i++) {
      const prevDayStr = sortedDays[i];
      if (!prevDayStr) break;

      const p = prevDayStr.split('-').map(Number);
      if (p.length !== 3 || p[0] === undefined || p[1] === undefined || p[2] === undefined) break;

      const prevDate = new Date(Date.UTC(p[0], p[1] - 1, p[2]));

      // Should be exactly 1 day before currentCheckDate
      const expectedDate = new Date(currentCheckDate);
      expectedDate.setDate(currentCheckDate.getDate() - 1);

      if (prevDate.getTime() === expectedDate.getTime()) {
        streak++;
        currentCheckDate = prevDate;
      } else {
        break;
      }
    }

    return streak;
  }

  async getStats(habitId: string): Promise<{
    streak: number;
    totalCompleted: number;
    successRate: number;
    last30Days: boolean[];
    weeklyPattern: number[];
  }> {
    const streak = await this.calculateStreak(habitId);

    // Total completed
    const totalRows = await db.query<{ count: number }>(
      `SELECT COUNT(*) as count FROM plans WHERE source_id = ? AND source_type = 'habit' AND done = 1`,
      [habitId]
    );
    const totalCompleted = totalRows[0]?.count || 0;

    // Last 30 days
    const last30Days: boolean[] = [];
    const today = new Date();
    // unused todayStr removed

    // We want last 30 days ending today.
    // Query completions in range (safe buffer)
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 35);

    const rows = await db.query<{ start_time: string }>(
      `SELECT start_time 
       FROM plans 
       WHERE source_id = ? 
         AND source_type = 'habit' 
         AND done = 1 
         AND start_time >= ?`,
      [habitId, thirtyDaysAgo.toISOString()]
    );

    const completedDates = new Set<string>();
    rows.forEach(r => completedDates.add(this.getLocalDateString(new Date(r.start_time))));

    // Build the boolean array for exactly last 30 days
    // Iterating backwards from today
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dStr = this.getLocalDateString(d);
      last30Days.push(completedDates.has(dStr));
    }
    // Note: arrays pushed in order: T-29, T-28 ... T-0.

    // Weekly pattern (Sun-Sat or Mon-Sun)
    // Count day of week based on LOCAL time
    const weeklyCounts = [0, 0, 0, 0, 0, 0, 0]; // 0=Sun ... 6=Sat

    rows.forEach(r => {
      const d = new Date(r.start_time);
      const dayIndex = d.getDay(); // 0-6 Local
      if (weeklyCounts[dayIndex] !== undefined) {
        weeklyCounts[dayIndex]++;
      }
    });

    // Rotate to Mon-Sun (M T W T F S S)
    const monSunPattern = [
      weeklyCounts[1] ?? 0, // Mon // Safe access with ?? 0
      weeklyCounts[2] ?? 0,
      weeklyCounts[3] ?? 0,
      weeklyCounts[4] ?? 0,
      weeklyCounts[5] ?? 0,
      weeklyCounts[6] ?? 0,
      weeklyCounts[0] ?? 0, // Sun
    ];

    // Success Rate
    const habit = await this.getById(habitId);
    let successRate = 0;
    if (habit) {
      const created = new Date(habit.createdAt);
      const daysSince = Math.max(
        1,
        Math.floor((today.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
      );
      successRate = Math.round((totalCompleted / daysSince) * 100);
    }

    return {
      streak,
      totalCompleted,
      successRate,
      last30Days,
      weeklyPattern: monSunPattern,
    };
  }

  async getWeeklyOverallProgress(
    userId: string
  ): Promise<{ totalGoal: number; currentProgress: number }> {
    // 1. Get total weekly goal from all active habits
    const habits = await this.getAllForUser(userId, true);
    let totalGoal = 0;
    const habitGoals = new Map<string, number>();

    for (const h of habits) {
      const g = h.weeklyGoalMinutes || 0;
      totalGoal += g;
      habitGoals.set(h.id, g);
    }

    // 2. Calculate actual minutes completed this week (Mon-Sun or Rolling 7 days?)
    // "Weekly Goal" usually implies correct calendar week (Mon-Sun).
    // Let's implement Current Calendar Week (Sun-Sat).

    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 (Sun) - 6 (Sat)
    const diffToSun = -dayOfWeek; // Adjust to Sunday

    const sunday = new Date(now);
    sunday.setHours(0, 0, 0, 0);
    sunday.setDate(now.getDate() + diffToSun);

    // End of week is next Sunday 00:00
    const nextSunday = new Date(sunday);
    nextSunday.setDate(sunday.getDate() + 7);

    // Query all plans for this user within range
    const rows = await db.query<{ source_id: string; start_time: string; end_time: string }>(
      `SELECT source_id, start_time, end_time
       FROM plans
       WHERE user_id = ?
         AND source_type = 'habit'
         AND done = 1
         AND start_time >= ?
         AND start_time < ?`,
      [userId, sunday.toISOString(), nextSunday.toISOString()]
    );

    // Sum progress PER HABIT
    const progressByHabit = new Map<string, number>();

    for (const row of rows) {
      const start = new Date(row.start_time).getTime();
      const end = new Date(row.end_time).getTime();
      const mins = (end - start) / 60000;

      const current = progressByHabit.get(row.source_id) || 0;
      progressByHabit.set(row.source_id, current + mins);
    }

    // Sum clamped progress
    let currentProgress = 0;
    // We iterate over the habits we know about (active ones)
    // If there are plans for deleted/inactive habits, should we count them?
    // User logic: "progress can only increase from habits until they have reached their weekly target"
    // implies we care about the targets of *current* habits.
    // If a habit is inactive, its goal is 0 (not in the list), so usually checks shouldn't count?
    // Or should we just iterate over `progressByHabit`?
    // If we iterate over active habits, we miss plans for habits that became inactive mid-week.
    // However, `totalGoal` is derived from active habits only.
    // So for consistency, we should probably only sum progress for active habits.

    for (const h of habits) {
      const goal = habitGoals.get(h.id) || 0;
      const actual = progressByHabit.get(h.id) || 0;
      // Clamp
      currentProgress += Math.min(actual, goal);
    }

    return {
      totalGoal: Math.round(totalGoal),
      currentProgress: Math.round(currentProgress),
    };
  }

  async getHabitsWithDashboardData(
    userId: string
  ): Promise<{ habit: Habit; history: boolean[]; streak: number; weeklyProgress: number }[]> {
    const habits = await this.getAllForUser(userId, true);
    if (habits.length === 0) return [];

    // 1. Fetch ALL valid habit completions (done=1) for this user, sorted DESC
    // We need this for Streak (potentially long history) and Weekly Progress (this week)
    const allPlans = await db.query<{ source_id: string; start_time: string; end_time: string }>(
      `SELECT source_id, start_time, end_time 
         FROM plans 
         WHERE user_id = ? AND source_type = 'habit' AND done = 1 
         ORDER BY start_time DESC`,
      [userId]
    );

    // Group plans by habitId
    const plansByHabit = new Map<string, { start: Date; end: Date; dateStr: string }[]>();
    for (const row of allPlans) {
      if (!plansByHabit.has(row.source_id)) {
        plansByHabit.set(row.source_id, []);
      }
      const d = new Date(row.start_time);
      const e = new Date(row.end_time);
      plansByHabit.get(row.source_id)?.push({
        start: d,
        end: e,
        dateStr: this.getLocalDateString(d),
      });
    }

    // 2. Prepare Date Objects for Logic
    const today = new Date();
    const todayStr = this.getLocalDateString(today);

    // For Weekly Progress (Current Sun-Sat)
    const dayOfWeek = today.getDay(); // 0-6
    const diffToSun = -dayOfWeek; // Go back to Sunday
    const sunday = new Date(today);
    sunday.setHours(0, 0, 0, 0);
    sunday.setDate(today.getDate() + diffToSun);
    const sundayTime = sunday.getTime();

    // For History (Last 7 days: T-6 to T-0)
    const historyDates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      historyDates.push(this.getLocalDateString(d));
    }

    // 3. Iterate Habits and Calculate Stats in Memory
    return habits.map(habit => {
      const plans = plansByHabit.get(habit.id) || [];

      // A) History (last 7 days bools)
      const historySet = new Set(plans.map(p => p.dateStr));
      const history = historyDates.map(dateStr => historySet.has(dateStr));

      // B) Weekly Progress (minutes done since Sunday)
      let weeklyMins = 0;
      for (const p of plans) {
        if (p.start.getTime() >= sundayTime) {
          const dur = (p.end.getTime() - p.start.getTime()) / 60000;
          weeklyMins += dur;
        }
      }

      // C) Streak (Consecutive days ending Today or Yesterday)
      // Plans are already sorted DESC by start_time (query) -> thus by dateStr roughly, but strictly we should check uniq dates
      const uniqueDays = Array.from(new Set(plans.map(p => p.dateStr))); // Set keeps insertion order? No, but map preserves if we iterate?
      // Let's just sort the unique strings to be safe (DESC)
      uniqueDays.sort().reverse();

      let streak = 0;
      if (uniqueDays.length > 0) {
        const lastDateStr = uniqueDays[0];
        if (!lastDateStr)
          return { habit, history, streak: 0, weeklyProgress: Math.round(weeklyMins) };

        // Check if active (today or yesterday)
        const gap = this.daysBetween(lastDateStr, todayStr);

        if (gap <= 1) {
          // 0 = today, 1 = yesterday
          streak = 1;
          let currentStr = lastDateStr;

          for (let i = 1; i < uniqueDays.length; i++) {
            const prevStr = uniqueDays[i];
            if (!prevStr) break;

            if (this.daysBetween(prevStr, currentStr) === 1) {
              streak++;
              currentStr = prevStr;
            } else {
              break;
            }
          }
        }
      }

      return {
        habit,
        history,
        streak,
        weeklyProgress: Math.round(weeklyMins),
      };
    });
  }

  // Helper for days between YYYY-MM-DD strings
  private daysBetween(d1: string, d2: string): number {
    const p1 = d1.split('-').map(Number);
    const p2 = d2.split('-').map(Number);

    if (p1.length < 3 || p2.length < 3) return 0;
    // Safety check for undefined values if parsing fails
    if (
      p1[0] === undefined ||
      p1[1] === undefined ||
      p1[2] === undefined ||
      p2[0] === undefined ||
      p2[1] === undefined ||
      p2[2] === undefined
    ) {
      return 0;
    }

    const date1 = new Date(Date.UTC(p1[0], p1[1] - 1, p1[2]));
    const date2 = new Date(Date.UTC(p2[0], p2[1] - 1, p2[2]));
    return Math.floor((date2.getTime() - date1.getTime()) / 86400000);
  }

  async getHabitsWithHistory(
    userId: string,
    days = 7
  ): Promise<{ habit: Habit; history: boolean[] }[]> {
    const habits = await this.getAllForUser(userId, true);
    if (habits.length === 0) return [];

    // Calculate date range (Today back to T-days)
    const today = new Date();
    const rangeStart = new Date(today);
    rangeStart.setDate(today.getDate() - (days - 1)); // inclusive of today so days-1
    rangeStart.setHours(0, 0, 0, 0);

    const rangeEnd = new Date(today);
    rangeEnd.setHours(23, 59, 59, 999);

    const rows = await db.query<{ source_id: string; start_time: string }>(
      `SELECT source_id, start_time
         FROM plans
         WHERE user_id = ?
           AND source_type = 'habit'
           AND done = 1
           AND start_time >= ?
           AND start_time <= ?`,
      [userId, rangeStart.toISOString(), rangeEnd.toISOString()]
    );

    // Map completions by habitId -> Set<YYYY-MM-DD>
    const completionMap = new Map<string, Set<string>>();
    for (const row of rows) {
      if (!completionMap.has(row.source_id)) {
        completionMap.set(row.source_id, new Set());
      }
      const d = new Date(row.start_time);
      completionMap.get(row.source_id)?.add(this.getLocalDateString(d));
    }

    // Build result
    return habits.map(habit => {
      const history: boolean[] = [];
      // Iterate form T-(days-1) to Today
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        const dStr = this.getLocalDateString(d);
        history.push(completionMap.get(habit.id)?.has(dStr) || false);
      }
      return { habit, history };
    });
  }
}

export const habitRepository = new HabitRepository();
