import { PHASE_KEYWORDS } from '../../constants/keywords';
import { appointmentRepository } from '../../db/repositories/AppointmentRepository';
import { habitRepository } from '../../db/repositories/HabitRepository';
import { planRepository } from '../../db/repositories/PlanRepository';

import { taskRepository } from '../../db/repositories/TaskRepository';
import { useListStore } from '../../stores/listStore';
import { useUserStore } from '../../stores/userStore';
import type { Habit, Task } from '../../types/database';
import { anchorsService } from '../data/Anchors';
import { phaseManager, type WuXingPhase } from '../PhaseManager';

// --- Types ---

interface RankedPlanItem {
  type: 'task' | 'habit';
  id: string;
  source: Task | Habit;
  score: number;
  appropriateness: number;
  urgence: number;
  isInProgress: boolean;
}

interface HabitUrgencyDetails {
  progress: number;
  daysRemaining: number;
}

interface ItemSchedulingState {
  originalDuration: number;
  remainingMinutes: number;
  scheduledCount: number;
  lastEndTime: number | null;
}

export class SchedulerAI {
  async generateSchedule(date: Date = new Date(), fromNow: boolean = true): Promise<void> {
    const userId = useUserStore.getState().user.id;
    if (!userId) return;

    const deletionStart = new Date(date);
    deletionStart.setHours(0, 0, 0, 0);
    await planRepository.deleteFuturePendingPlans(userId, deletionStart);

    await this.scheduleDay(userId, date, fromNow, new Set<string>());
  }

  async rescheduleFromNowUntilNextDay(): Promise<void> {
    const userId = useUserStore.getState().user.id;
    if (!userId) return;

    // console.log(`🤖 SchedulerAI: Rescheduling everything from now until end of tomorrow`);

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    await planRepository.deleteFuturePendingPlans(userId, todayStart);

    const scheduledIds = new Set<string>();

    await this.scheduleDay(userId, new Date(), true, scheduledIds);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    await this.scheduleDay(userId, tomorrow, false, scheduledIds);

    // console.log(`🤖 SchedulerAI: Reschedule complete.`);
  }

  private async scheduleDay(
    userId: string,
    date: Date,
    fromNow: boolean,
    externalScheduledIds: Set<string>
  ): Promise<void> {
    // console.log(
    //   `🤖 SchedulerAI: Scheduling day ${date.toISOString().slice(0, 10)} (fromNow=${fromNow})`
    // );
    const schedulingStart = fromNow ? new Date() : new Date(date);
    if (!fromNow) schedulingStart.setHours(0, 0, 0, 0);
    const startTimeMs = schedulingStart.getTime();

    const tasks = await taskRepository.getUrgentTasks(userId, 32);

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weekday = days[date.getDay()] || 'Sunday';
    const habits = await habitRepository.getScheduledForToday(userId, weekday);

    const habitDetails = new Map<string, HabitUrgencyDetails>();
    const startOfWeek = new Date(date);
    const dayIndex = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayIndex);
    startOfWeek.setHours(0, 0, 0, 0);
    const daysRemaining = 7 - date.getDay();

    await Promise.all(
      habits.map(async h => {
        const progress = await habitRepository.calculateWeeklyProgress(h.id, startOfWeek);
        habitDetails.set(h.id, { progress, daysRemaining });
      })
    );

    // --- 1. Initialize Scheduling State ---
    const schedulingState = new Map<string, ItemSchedulingState>();

    for (const t of tasks) {
      if (externalScheduledIds.has(t.id)) continue;
      schedulingState.set(t.id, {
        originalDuration: t.effortMinutes || 30,
        remainingMinutes: t.effortMinutes || 30,
        scheduledCount: 0,
        lastEndTime: null,
      });
    }

    for (const h of habits) {
      if (externalScheduledIds.has(h.id)) continue;
      const details = habitDetails.get(h.id);
      const goal = h.weeklyGoalMinutes || 0;
      const left = Math.max(0, goal - (details?.progress ?? 0));
      const neededPerDay = left / Math.max(1, details?.daysRemaining ?? 1);

      const targetDuration = Math.round(neededPerDay + 5);

      schedulingState.set(h.id, {
        originalDuration: targetDuration,
        remainingMinutes: targetDuration,
        scheduledCount: 0,
        lastEndTime: null,
      });
    }

    // --- 2. Base Busy Slots (Appts, Sleep, Anchors) ---
    const activePhases = phaseManager
      .getPhasesForGregorianDate(date)
      .filter(p => p.endTime.getTime() > startTimeMs);

    const appointments = await appointmentRepository.getForDate(userId, date);
    const anchors = anchorsService.getAnchorsForDate(date);
    const user = useUserStore.getState().user;

    const sleepConstraints = this.getUserConstraints(user, date); // Only sleep

    const baseBusySlots = [
      ...appointments.map(a => ({ start: a.startTime, end: a.endTime })),
      ...anchors.map(a => ({
        start: a.startTime,
        end: a.startTime.getTime() + a.durationMinutes * 60000,
      })),
      ...sleepConstraints,
    ].map(slot => ({
      start: new Date(slot.start).getTime(),
      end: new Date(slot.end).getTime(),
    }));

    // Sort base slots
    baseBusySlots.sort((a, b) => a.start - b.start);

    // --- 3. Determine Work Hours ---
    const workHours = this.getWorkHours(user, date);

    // Helper to filter items based on list config
    const isAllowed = (item: Task | Habit, context: 'work' | 'outside'): boolean => {
      const itemKeywords = item.selectedKeywords || [];
      const lists = useListStore.getState().lists;

      // Find matching lists
      const matchingLists = lists.filter(l => l.keywords.some(k => itemKeywords.includes(k)));

      // If no list matches, default to... allowed everywhere? or allowed nowhere?
      // Let's assume allowed everywhere if uncategorized for now, or maybe 'Personal' default?
      // For safety, if no list matches, we treat it as 'outside work' (Private).
      if (matchingLists.length === 0) {
        return context === 'outside';
      }

      if (context === 'work') {
        return matchingLists.some(l => l.plan_during_work);
      } else {
        return matchingLists.some(l => l.plan_outside_work);
      }
    };

    // --- Pass 1: Outside Work ---
    // Block out Work Hours
    const outsideBusySlots = [...baseBusySlots];
    if (workHours) {
      this.addBusySlot(outsideBusySlots, workHours.start, workHours.end);
    }

    const outsideItems = [
      ...tasks.filter(t => isAllowed(t, 'outside')),
      ...habits.filter(h => isAllowed(h, 'outside')),
    ];

    // console.log(`🤖 Pass 1: Outside Work. Items: ${outsideItems.length}`);

    await this.runSchedulingPass({
      userId,
      items: outsideItems,
      busySlots: outsideBusySlots,
      phases: activePhases,
      schedulingState,
      startTimeMs,

      habitDetails,
      externalScheduledIds,
    });

    // --- Pass 2: During Work ---
    // Only if work hours exist
    if (workHours) {
      // Block out Non-Work Hours (Before work and After work)
      const workBusySlots = [...baseBusySlots];

      // Add "Before Work" block
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      if (workHours.start > dayStart.getTime()) {
        this.addBusySlot(workBusySlots, dayStart.getTime(), workHours.start);
      }

      // Add "After Work" block
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      if (workHours.end < dayEnd.getTime()) {
        this.addBusySlot(workBusySlots, workHours.end, dayEnd.getTime());
      }

      const workItems = [
        ...tasks.filter(t => isAllowed(t, 'work')),
        // User requested ONLY tasks for work hours.
        // "Once with only the work hours and only tasks with the flag 'allowed during work'"
      ];

      // console.log(`🤖 Pass 2: Work Hours. Items: ${workItems.length}`);

      await this.runSchedulingPass({
        userId,
        items: workItems,
        busySlots: workBusySlots,
        phases: activePhases,
        schedulingState,
        startTimeMs,

        habitDetails,
        externalScheduledIds,
      });
    }
  }

  private async runSchedulingPass(ctx: {
    userId: string;
    items: (Task | Habit)[];
    busySlots: { start: number; end: number }[];
    phases: WuXingPhase[];
    schedulingState: Map<string, ItemSchedulingState>;
    startTimeMs: number;

    habitDetails: Map<string, HabitUrgencyDetails>;
    externalScheduledIds: Set<string>;
  }): Promise<void> {
    const {
      userId,
      items,
      busySlots,
      phases,
      schedulingState,
      startTimeMs,
      habitDetails,
      externalScheduledIds,
    } = ctx;

    busySlots.sort((a, b) => a.start - b.start);

    // We need to know which items are tasks vs habits for the loop
    const passTasks = items.filter((i): i is Task => 'effortMinutes' in i);
    const passHabits = items.filter((i): i is Habit => 'weeklyGoalMinutes' in i);

    for (const phase of phases) {
      const projectsScheduledThisPhase = new Set<string>();
      const phaseStartMs = Math.max(phase.startTime.getTime(), startTimeMs);

      const rankedItems: RankedPlanItem[] = [];

      // A) Tasks
      for (const task of passTasks) {
        const state = schedulingState.get(task.id);
        if (!state || state.remainingMinutes <= 5) continue;
        if (externalScheduledIds.has(task.id)) continue;

        // Project Constraints
        if (task.projectId) {
          // We only need to check the list of tasks we are currently trying to schedule ('tasks')
          // We look for any "earlier" task that is not yet finished.
          const hasEarlierPendingTask = passTasks.some(
            t =>
              t.id !== task.id && // Not self
              t.projectId === task.projectId && // Same project
              (t.positionInProject ?? Infinity) < (task.positionInProject ?? Infinity) && // Lower position = Earlier
              (schedulingState.get(t.id)?.remainingMinutes ?? 0) > 5 // Still needs work
          );

          // If an earlier task exists and isn't done, we must wait for it. Skip this task.
          if (hasEarlierPendingTask) continue;
        }

        rankedItems.push(this.calculateScore(task, 'task', phase.name, state, phaseStartMs));
      }

      // B) Habits
      for (const habit of passHabits) {
        const state = schedulingState.get(habit.id);
        if (!state || state.scheduledCount > 0) continue;
        if (externalScheduledIds.has(habit.id)) continue;

        const details = habitDetails.get(habit.id);
        rankedItems.push(
          this.calculateScore(habit, 'habit', phase.name, state, phaseStartMs, details)
        );
      }

      // Sort High to Low
      rankedItems.sort((a, b) => b.score - a.score);

      // --- Fill Phase ---
      while (rankedItems.length > 0) {
        const phaseEnd = phase.endTime.getTime();
        if (phaseStartMs >= phaseEnd) break;

        const chronologicalSlots = this.getFreeSlots(busySlots, phaseStartMs, phaseEnd);
        if (chronologicalSlots.length === 0) break;

        const item = rankedItems.shift();
        if (!item) break;

        const state = schedulingState.get(item.id)!;
        const durationMs = state.remainingMinutes * 60000;

        let chosenSlot: { start: number; end: number; duration: number } | undefined;
        let isPartial = false;

        if (item.isInProgress) {
          chosenSlot = chronologicalSlots[0];
          if (chosenSlot && chosenSlot.duration < durationMs) isPartial = true;
        } else {
          const slotsBySize = [...chronologicalSlots].sort((a, b) => a.duration - b.duration);
          chosenSlot = slotsBySize.find(s => s.duration >= durationMs);
          if (!chosenSlot) {
            const biggest = slotsBySize[slotsBySize.length - 1];
            if (biggest && biggest.duration >= 10 * 60000) {
              chosenSlot = biggest;
              isPartial = true;
            }
          }
        }

        if (chosenSlot) {
          // Cap duration at 60 minutes to prevent burnout
          const MAX_BLOCK = 60 * 60000;
          let timeToBook = isPartial ? chosenSlot.duration : durationMs;
          if (timeToBook > MAX_BLOCK) {
            timeToBook = MAX_BLOCK;
          }

          const planStart = new Date(chosenSlot.start);
          const planEnd = new Date(chosenSlot.start + timeToBook);

          await this.createPlan(userId, item, phase.name, planStart, planEnd);
          this.addBusySlot(busySlots, chosenSlot.start, planEnd.getTime());

          const bookedMinutes = timeToBook / 60000;
          state.remainingMinutes -= bookedMinutes;
          state.lastEndTime = planEnd.getTime();
          state.scheduledCount++;

          if (item.type === 'task' && (item.source as Task).projectId) {
            projectsScheduledThisPhase.add((item.source as Task).projectId!);
          }

          if (item.type === 'task' && state.remainingMinutes > 5) {
            item.isInProgress = true;
            rankedItems.unshift(item);
          }

          if (item.type === 'habit') {
            state.remainingMinutes = 0;
            externalScheduledIds.add(item.id);
          }
          if (item.type === 'task' && state.remainingMinutes <= 5) {
            state.remainingMinutes = 0;
            externalScheduledIds.add(item.id);
          }
        }
      }
    }
  }

  private calculateScore(
    item: Task | Habit,
    type: 'task' | 'habit',
    phaseName: string,
    state: ItemSchedulingState,
    currentPhaseStart: number,
    habitDetails?: HabitUrgencyDetails
  ): RankedPlanItem {
    const keywords = item.selectedKeywords || [];
    const idealPhase = (item as Habit).idealPhase;

    const created = new Date(item.createdAt);
    const now = new Date();
    const ageDays = (now.getTime() - created.getTime()) / (1000 * 3600 * 24);

    let appropriateness = 1;
    let urgence = 1 + ageDays / 5;

    const isInProgress = state.scheduledCount > 0 && state.remainingMinutes > 5;

    for (const key of keywords) {
      if (this.doesPhaseMatchKeywords(phaseName, [key])) appropriateness += 2;
    }

    if (type === 'habit' && idealPhase === phaseName) appropriateness += 3;

    if (isInProgress) {
      appropriateness += 50;
    }
    if (state.lastEndTime) {
      const gapMinutes = Math.abs(currentPhaseStart - state.lastEndTime) / 60000;
      if (gapMinutes < 15) appropriateness += 5;
    }

    if (type === 'task') {
      const task = item as Task;
      const level = task.urgencyLevel || 'T6';
      const map: Record<string, number> = { T1: 6, T2: 5, T3: 4, T4: 3, T5: 2, T6: 1, CHORE: 2 };
      urgence += map[level] || 1;
      urgence = urgence * 2;
    } else {
      if (habitDetails) {
        const needed = state.originalDuration;
        if (needed > 30) urgence += 1;
        if (needed > 60) urgence += 1;
      }
    }

    const score = appropriateness * urgence;

    return {
      type,
      id: item.id,
      source: item,
      score,
      appropriateness,
      urgence,
      isInProgress,
    };
  }

  private getUserConstraints(
    user: { sleepStart?: string; sleepEnd?: string },
    date: Date
  ): { start: number; end: number }[] {
    const userConstraints: { start: number; end: number }[] = [];

    if (user.sleepStart && user.sleepEnd) {
      const sleepStart = this.getTimeOnDate(user.sleepStart, date);
      const sleepEnd = this.getTimeOnDate(user.sleepEnd, date);

      if (sleepStart && sleepEnd) {
        if (sleepStart > sleepEnd) {
          const dayStart = new Date(date);
          dayStart.setHours(0, 0, 0, 0);
          userConstraints.push({ start: dayStart.getTime(), end: sleepEnd });
          const dayEnd = new Date(date);
          dayEnd.setHours(23, 59, 59, 999);
          userConstraints.push({ start: sleepStart, end: dayEnd.getTime() });
        } else {
          userConstraints.push({ start: sleepStart, end: sleepEnd });
        }
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

  private doesPhaseMatchKeywords(phase: string, keywords: string[]): boolean {
    const map = PHASE_KEYWORDS as Record<string, readonly string[]>;
    const phaseKeywords = map[phase] || [];
    return keywords.some(k => phaseKeywords.includes(k));
  }

  private addBusySlot(
    busySlots: { start: number; end: number }[],
    start: number,
    end: number
  ): void {
    busySlots.push({ start, end });
    busySlots.sort((a, b) => a.start - b.start);
  }

  private async createPlan(
    userId: string,
    item: RankedPlanItem,
    phaseName: string,
    start: Date,
    end: Date
  ): Promise<void> {
    const dbStart = new Date(start.getTime() + 60000);
    const dbEnd = new Date(end.getTime() - 60000);

    await planRepository.create(userId, {
      name: item.source.title,
      description: `Scheduled by AI (${phaseName} Phase)`,
      startTime: dbStart,
      endTime: dbEnd,
      sourceId: item.id,
      sourceType: item.type,
      linkedObjectIds: [],
      done: null,
    });
  }

  private getFreeSlots(
    busySlots: { start: number; end: number }[],
    limitStart: number,
    limitEnd: number
  ): { start: number; end: number; duration: number }[] {
    const freeSlots: { start: number; end: number; duration: number }[] = [];
    let currentProbe = limitStart;

    for (const slot of busySlots) {
      if (slot.end <= currentProbe) continue;
      if (slot.start > currentProbe) {
        const start = currentProbe;
        const actualEnd = Math.min(slot.start, limitEnd);
        if (start >= limitEnd) break;

        const duration = actualEnd - start;
        if (duration >= 5 * 60000) {
          freeSlots.push({ start, end: actualEnd, duration });
        }
      }
      currentProbe = Math.max(currentProbe, slot.end);
    }

    if (currentProbe < limitEnd) {
      const duration = limitEnd - currentProbe;
      if (duration >= 5 * 60000) {
        freeSlots.push({ start: currentProbe, end: limitEnd, duration });
      }
    }
    return freeSlots;
  }
}

export const schedulerAI = new SchedulerAI();
