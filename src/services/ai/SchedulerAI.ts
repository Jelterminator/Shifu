import { PHASE_KEYWORDS } from '../../constants/keywords';
import { appointmentRepository } from '../../db/repositories/AppointmentRepository';
import { habitRepository } from '../../db/repositories/HabitRepository';
import { planRepository } from '../../db/repositories/PlanRepository';
import { taskRepository } from '../../db/repositories/TaskRepository';
import { useUserStore } from '../../stores/userStore';
import type { Habit, Task } from '../../types/database';
import { anchorsService } from '../data/Anchors';
import { phaseManager, type WuXingPhase } from '../data/PhaseManager';

// --- Types ---

interface SchedulableItem {
  type: 'task' | 'habit';
  id: string;
  source: Task | Habit;
  priorityScore: number;
  remainingDuration: number;
  // Specific constraints
  minChunkSize: number;
  maxChunkSize: number;
  allowedDays: number[]; // 0-6 (Sun-Sat)
  idealPhase?: string | null;
  keywords: string[];
}

interface TimeSlot {
  start: number;
  end: number;
  duration: number;
  phase?: WuXingPhase;
}

export class SchedulerAI {
  // Main Entry Point 1: Schedule specific date (e.g. "Plan Tomorrow")
  async generateSchedule(date: Date = new Date(), fromNow: boolean = true): Promise<void> {
    const user = useUserStore.getState().user;
    const userId = user?.id;
    if (!userId) return;

    // Define Window: Start of Date (or Now) -> End of Date
    const start = new Date(date);
    if (!fromNow) start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    await this.executeScheduling(userId, start, end);
  }

  // Main Entry Point 2: Reschedule "Rest of Today + Tomorrow"
  async rescheduleFromNowUntilNextDay(): Promise<void> {
    const user = useUserStore.getState().user;
    const userId = user?.id;
    if (!userId) return;

    const start = new Date(); // Now
    const end = new Date();
    end.setDate(end.getDate() + 1);
    end.setHours(23, 59, 59, 999); // End of Tomorrow

    await this.executeScheduling(userId, start, end);
  }

  private async executeScheduling(
    userId: string,
    windowStart: Date,
    windowEnd: Date
  ): Promise<void> {
    // 1. Cleanup Future/Pending Plans in Window
    // We clear from start of day (midnight) to ensure we don't leave "missed" morning plans hanging.
    // They should be rescheduled if they were pending.
    const cleanupStart = new Date(windowStart);
    cleanupStart.setHours(0, 0, 0, 0);
    await planRepository.deleteFuturePendingPlans(userId, cleanupStart);

    // 2. Fetch Data
    // A. Tasks (Global Urgent Pool)
    // We fetch a larger pool to allow "Eat the Frog" to pick the absolute best
    const tasks = await taskRepository.getUrgentTasks(userId, 50);

    // B. Habits (For every day in the window)

    const daysInWindow = this.getDaysInWindow(windowStart, windowEnd);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // We need to know which habits are for which day, to avoid scheduling "Monday Habit" on "Tuesday"
    // We will wrap them in SchedulableItem with 'allowedDays' constraint.
    // Fetch unique habits relevant for these days
    const uniqueHabitsMap = new Map<string, Habit>();

    for (const d of daysInWindow) {
      const dayName = dayNames[d.getDay()] || 'Sunday';
      const dayHabits = await habitRepository.getScheduledForToday(userId, dayName);
      for (const h of dayHabits) {
        if (!uniqueHabitsMap.has(h.id)) uniqueHabitsMap.set(h.id, h);
      }
    }

    // Calculate Habit Progress to filter out completed ones
    const activeHabits: Habit[] = [];
    // We'll do a quick check on weekly progress?
    // Actually, "Eat the Frog" for habits usually means "Do it today if not done".
    // We will let the scheduler decide based on 'remaining needed'.
    for (const h of uniqueHabitsMap.values()) {
      activeHabits.push(h);
    }

    // 3. Transform to SchedulableItems
    const items = await this.prepareItems(tasks, activeHabits, windowStart);

    // 4. Build Available Time Slots (The "Canvas")
    // Base Busy Slots: Appointments, Anchors, Sleep, Work (if strictly enforcing work hours for personal stuff)
    const busySlots = await this.getBusySlots(userId, windowStart, windowEnd);

    // 5. Greedy Allocation
    // Sort items by Priority (Frog First)
    items.sort((a, b) => b.priorityScore - a.priorityScore);

    for (const item of items) {
      if (item.remainingDuration <= 0) continue;

      // Try to book the item
      await this.scheduleItemGreedy(userId, item, busySlots, windowStart, windowEnd);
    }
  }

  private async scheduleItemGreedy(
    userId: string,
    item: SchedulableItem,
    busySlots: { start: number; end: number }[],
    windowStart: Date,
    windowEnd: Date
  ): Promise<void> {
    // 1. Find all free chunks in the window
    // We need to be careful with "Allowed Days" (e.g. Habit only on Monday)
    const freeSlots = this.getFreeSlotsMultiDay(
      busySlots,
      windowStart.getTime(),
      windowEnd.getTime()
    );

    // Filter slots by Item Constraints (Day, etc)
    const validSlots: TimeSlot[] = [];

    for (const slot of freeSlots) {
      const slotMid = new Date(slot.start + slot.duration / 2);
      const slotDay = slotMid.getDay(); // 0-6

      if (!item.allowedDays.includes(slotDay)) continue;
      if (slot.duration < item.minChunkSize * 60000) continue;

      // Get Phase for this slot (use midpoint or start?)
      // We'll split slots by phase for better granularity?
      // For now, let's just tag the slot with its dominant phase or evaluate suitability dynamically.
      // Better: The `getFreeSlotsMultiDay` could carry phase info or we look it up.
      // Let's look it up.
      const phases = phaseManager.getPhasesForGregorianDate(slotMid); // This gets phases for the day of the slot
      const currentPhase = phases.find(
        p => p.startTime.getTime() <= slotMid.getTime() && p.endTime.getTime() > slotMid.getTime()
      );

      validSlots.push({
        ...slot,
        phase: currentPhase,
      });
    }

    if (validSlots.length === 0) return;

    // 2. Score Slots for Suitability
    // We want "Greatest Suitability Timing"
    // Suitability = (Keyword Match) + (Ideal Phase Match) + (Energy Match)
    // We also likely want to penalize "Too Late" if urgency is high?
    // "Eat the Frog" means do it ASAP, right? Or do it at *best* time?
    // "Not focussed on filling all tasks as quickly as possible but one that focusses on getting each task its greatest suitability timing"
    // -> Prioritize Suitability over Earliness.

    let bestGenericSlot: TimeSlot | null = null;
    let bestScore = -Infinity;

    for (const slot of validSlots) {
      const suitability = this.calculateSuitability(item, slot.phase);

      // Minor penalty for distance in future? To avoid pushing everything to tomorrow if today is "Okay".
      // If today is 0.8 suitable and tomorrow is 0.9, do we wait? Yes, based on user implementation request.
      // But if urgency is high, we might override.
      // Let's rely heavily on suitability.

      // Tie breaker: Earliness
      const timePenalty = ((slot.start - windowStart.getTime()) / (1000 * 3600 * 24)) * 0.1; // Small penalty per day

      const finalScore = suitability - timePenalty;

      if (finalScore > bestScore) {
        bestScore = finalScore;
        bestGenericSlot = slot;
      }
    }

    if (!bestGenericSlot) return;

    // 3. Book It
    const bookDurationMs = Math.min(item.remainingDuration, 60) * 60000; // Cap at 60m blocks?
    // Actually standard practice is maxChunkSize.
    const actualDuration = Math.min(bookDurationMs, bestGenericSlot.duration);

    // We verify if we need to trim the slot?
    // Logic: schedule at START of the best slot? Or align with Phase?
    // Simple: Start of slot.
    const planStart = new Date(bestGenericSlot.start);
    const planEnd = new Date(bestGenericSlot.start + actualDuration);

    // Create Plan
    await planRepository.create(userId, {
      name: item.source.title,
      description: `Scheduled by AI (${
        bestGenericSlot.phase?.name || 'General'
      } Phase) - Suitability: ${bestScore.toFixed(2)}`,
      startTime: planStart,
      endTime: planEnd,
      sourceId: item.source.id,
      sourceType: item.type,
      linkedObjectIds: [],
      done: null,
    });

    // Add Busy Slot
    this.addBusySlot(busySlots, planStart.getTime(), planEnd.getTime());

    // Update Item State
    item.remainingDuration -= actualDuration / 60000;

    // Recurse? If item still has time?
    if (item.remainingDuration > item.minChunkSize) {
      // Try to schedule remainder
      await this.scheduleItemGreedy(userId, item, busySlots, windowStart, windowEnd);
    }
  }

  private calculateSuitability(item: SchedulableItem, phase?: WuXingPhase): number {
    if (!phase) return 1.0; // Neutral baseline

    let score = 1.0;

    // 1. Keyword Match from Item Selection
    const phaseKeywords = (PHASE_KEYWORDS[phase.name] || []) as readonly string[];
    const matchCount = item.keywords.filter(k => phaseKeywords.includes(k)).length;

    if (matchCount > 0) score += matchCount * 0.5; // +0.5 per match

    // 2. Ideal Phase Match (Habits)
    if (item.idealPhase === phase.name) {
      score += 2.0; // Strong bonus
    }

    // 3. Phase Config Qualities (Soft match)
    // Maybe check if task is "Creative" and phase is "Wood/Fire"
    // This is covered by keywords mostly.

    return score;
  }

  private async prepareItems(
    tasks: Task[],
    habits: Habit[],
    windowStart: Date
  ): Promise<SchedulableItem[]> {
    const items: SchedulableItem[] = [];
    const habitProgressMap = new Map<string, number>();

    // Load progress for habits (Weekly)
    // We assume habits need to be done *today* or *tomorrow* based on remaining weekly goal?
    // Or just "Habit for Today" needs doing.
    // Simplification: If habit is scheduled for today, it needs doing today.
    // Duration? min_session_minutes or (weekly_goal - progress) / remaining_days?
    // Let's use logic from previous:

    const startOfWeek = new Date(windowStart);

    // Let's just say "Start of Week" for progress purposes
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    for (const h of habits) {
      const progress = await habitRepository.calculateWeeklyProgress(h.id, startOfWeek);
      habitProgressMap.set(h.id, progress);
    }

    // Convert Tasks
    for (const t of tasks) {
      // Calculate Priority
      // default urgency logic:
      const urgencyMap: Record<string, number> = {
        T1: 100, // Critical
        T2: 80,
        T3: 60,
        T4: 40,
        T5: 20,
        T6: 10,
        CHORE: 30,
      };
      const basePriority = urgencyMap[t.urgencyLevel || 'T6'] || 10;

      // Boost if old
      const daysOld = (Date.now() - new Date(t.createdAt).getTime()) / (1000 * 3600 * 24);
      const ageBoost = Math.min(20, daysOld); // Max +20 for age

      items.push({
        type: 'task',
        id: t.id,
        source: t,
        priorityScore: basePriority + ageBoost,
        remainingDuration: t.effortMinutes || 30,
        minChunkSize: 15,
        maxChunkSize: 60,
        allowedDays: [0, 1, 2, 3, 4, 5, 6], // Tasks allow any day
        keywords: t.selectedKeywords || [],
      });
    }

    const dayList = this.getDaysInWindow(
      windowStart,
      new Date(windowStart.getTime() + 2 * 24 * 3600 * 1000)
    ); // Up to 2 days ahead

    for (const dayDate of dayList) {
      const dayName = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
      ][dayDate.getDay()] as keyof Habit['selectedDays'];

      for (const h of habits) {
        if (h.selectedDays[dayName]) {
          // It's valid for this day
          // Check progress
          const goal = h.weeklyGoalMinutes || 0;
          const current = habitProgressMap.get(h.id) || 0;
          if (goal > 0 && current >= goal) continue; // Already met weekly goal

          // Add Instance
          // Priority: Habits usually high -> "Maintenance"
          // Base on remaining?
          items.push({
            type: 'habit',
            id: `${h.id}_${dayDate.getTime()}`, // Unique ID for this instance
            source: h,
            priorityScore: 75, // Default high-ish
            remainingDuration: Math.max(15, h.minimumSessionMinutes || 15),
            minChunkSize: h.minimumSessionMinutes || 15,
            maxChunkSize: 60,
            allowedDays: [dayDate.getDay()], // Strict day
            idealPhase: h.idealPhase,
            keywords: h.selectedKeywords || [],
          });
        }
      }
    }

    return items;
  }

  // --- Helpers ---

  private getDaysInWindow(start: Date, end: Date): Date[] {
    const days: Date[] = [];
    const current = new Date(start);
    current.setHours(0, 0, 0, 0);

    const endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);

    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  }

  private async getBusySlots(
    userId: string,
    start: Date,
    end: Date
  ): Promise<{ start: number; end: number }[]> {
    // 1. Appointments

    // "AND start_time >= ? AND start_time <= ?" (StartOfDay, EndOfDay)
    // We need to fetch for multiple days if window > 1 day.
    // We'll iterate days.

    const slots: { start: number; end: number }[] = [];

    const days = this.getDaysInWindow(start, end);
    for (const d of days) {
      const dayAppts = await appointmentRepository.getForDate(userId, d);
      for (const a of dayAppts) {
        slots.push({ start: a.startTime.getTime(), end: a.endTime.getTime() });
      }

      const dayAnchors = anchorsService.getAnchorsForDate(d);
      for (const a of dayAnchors) {
        slots.push({
          start: a.startTime.getTime(),
          end: a.startTime.getTime() + a.durationMinutes * 60000,
        });
      }

      // Sleep
      const user = useUserStore.getState().user;
      const sleepConstraints = this.getUserConstraints(user, d);
      slots.push(...sleepConstraints);

      // Work (if needed) - assume work is a 'Busy' block for personal tasks?
      // Or we mark work blocks?
      // For now let's assume Mixed Schedule or Block Work?
      // Legacy code handled 'Work' vs 'Outside work'.
      // New request doesn't specify, but implies "Best suitability".
      // Ideally Work is just "Another Phase" (Work Phase).
      // But usually we can't schedule "Meditation" during work.
      // Let's add Work Hours as Busy for now to be safe, unless user explicit whitelist.
      // Or just leave it open?
      // "during work" checks in legacy code were strict.
      // Let's block work hours for now.
      const work = this.getWorkHours(user, d);
      if (work) {
        slots.push(work);
      }
    }

    return slots.sort((a, b) => a.start - b.start);
  }

  private getUserConstraints(
    user: { sleepStart?: string; sleepEnd?: string },
    date: Date
  ): { start: number; end: number }[] {
    const userConstraints: { start: number; end: number }[] = [];

    const sleepStartStr = user.sleepStart || '23:00';
    const sleepEndStr = user.sleepEnd || '07:00';

    const sleepStart = this.getTimeOnDate(sleepStartStr, date);
    const sleepEnd = this.getTimeOnDate(sleepEndStr, date);

    if (sleepStart && sleepEnd) {
      if (sleepStart > sleepEnd) {
        // Sleep crosses midnight (e.g. 23:00 - 07:00)
        // Block 1: Midnight -> Wake Time
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        userConstraints.push({ start: dayStart.getTime(), end: sleepEnd });

        // Block 2: Sleep Time -> Midnight
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        userConstraints.push({ start: sleepStart, end: dayEnd.getTime() });
      } else {
        // Sleep is within the day (e.g. 01:00 - 09:00, or naps)
        userConstraints.push({ start: sleepStart, end: sleepEnd });
      }
    }
    return userConstraints;
  }

  private getWorkHours(
    user: { workStart?: string; workEnd?: string },
    date: Date
  ): { start: number; end: number } | null {
    if (!user.workStart || !user.workEnd) return null;

    const start = this.getTimeOnDate(user.workStart, date);
    const end = this.getTimeOnDate(user.workEnd, date);

    if (start && end && start < end) {
      return { start, end };
    }
    return null;
  }

  private getTimeOnDate(timeStr: string | null | undefined, targetDate: Date): number | null {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (hours === undefined || isNaN(hours)) return null;
    const d = new Date(targetDate);
    d.setHours(hours, minutes, 0, 0);
    return d.getTime();
  }

  private addBusySlot(
    busySlots: { start: number; end: number }[],
    start: number,
    end: number
  ): void {
    busySlots.push({ start, end });
    busySlots.sort((a, b) => a.start - b.start);
  }

  private getFreeSlotsMultiDay(
    busySlots: { start: number; end: number }[],
    windowStart: number,
    windowEnd: number
  ): { start: number; end: number; duration: number }[] {
    const freeSlots: { start: number; end: number; duration: number }[] = [];
    let currentProbe = windowStart;

    // Use a copy to sort and filter relevant slots
    const relevantSlots = busySlots
      .filter(s => s.end > windowStart && s.start < windowEnd)
      .sort((a, b) => a.start - b.start);

    for (const slot of relevantSlots) {
      if (slot.end <= currentProbe) continue;

      // If there is a gap before this slot
      if (slot.start > currentProbe) {
        const start = currentProbe;
        const actualEnd = Math.min(slot.start, windowEnd);

        if (start < actualEnd) {
          const duration = actualEnd - start;
          // 5 min minimum
          if (duration >= 5 * 60000) {
            freeSlots.push({ start, end: actualEnd, duration });
          }
        }
      }
      currentProbe = Math.max(currentProbe, slot.end);
    }

    // Checking tail
    if (currentProbe < windowEnd) {
      const duration = windowEnd - currentProbe;
      if (duration >= 5 * 60000) {
        freeSlots.push({ start: currentProbe, end: windowEnd, duration });
      }
    }
    return freeSlots;
  }
}

export const schedulerAI = new SchedulerAI();
