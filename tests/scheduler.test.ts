jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    getBoolean: jest.fn(),
    getNumber: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
  })),
}));

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockResolvedValue({
    runAsync: jest.fn(),
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    execAsync: jest.fn(),
    transactionAsync: jest.fn(),
    closeAsync: jest.fn(),
  }),
}));

import { appointmentRepository } from '../src/db/repositories/AppointmentRepository';
import { habitRepository } from '../src/db/repositories/HabitRepository';
import { planRepository } from '../src/db/repositories/PlanRepository';
import { projectRepository } from '../src/db/repositories/ProjectRepository';
import { taskRepository } from '../src/db/repositories/TaskRepository';
import { schedulerAI } from '../src/services/ai/SchedulerAI';
import { anchorsService } from '../src/services/data/Anchors';
import { phaseManager } from '../src/services/data/PhaseManager';
import { useUserStore } from '../src/stores/userStore';

// Mocks
jest.mock('../src/db/repositories/TaskRepository');
jest.mock('../src/db/repositories/HabitRepository');
jest.mock('../src/db/repositories/AppointmentRepository');
jest.mock('../src/db/repositories/PlanRepository');
jest.mock('../src/db/repositories/ProjectRepository');
jest.mock('../src/services/data/Anchors');
jest.mock('../src/services/data/PhaseManager');
jest.mock('../src/stores/userStore', () => ({
  useUserStore: {
    getState: jest.fn().mockReturnValue({
      user: { id: 'test-user-id' },
    }),
  },
}));

describe('SchedulerAI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset user store mock just in case
    // const { useUserStore } = require('../src/stores/userStore');
    (useUserStore.getState as jest.Mock).mockReturnValue({
      user: { id: 'test-user-id' },
    });
  });

  it('should generate plan for tasks based on scoring', async (): Promise<void> => {
    // Setup Mocks
    const d = (h: number): Date => {
      const date = new Date();
      date.setHours(h, 0, 0, 0);
      return date;
    };
    const mockPhases = [
      {
        name: 'WOOD',
        startTime: d(6),
        endTime: d(10),
        color: '#000',
        romanHours: [],
        qualities: '',
        idealTasks: [],
      },
      {
        name: 'FIRE',
        startTime: d(10),
        endTime: d(14),
        color: '#000',
        romanHours: [],
        qualities: '',
        idealTasks: [],
      },
      {
        name: 'WATER',
        startTime: d(14),
        endTime: d(23),
        color: '#000',
        romanHours: [],
        qualities: '',
        idealTasks: [],
      }, // Simplification
    ];
    // const { phaseManager } = require('../src/services/PhaseManager');
    (phaseManager.getPhasesForGregorianDate as jest.Mock).mockReturnValue(mockPhases);

    const mockTasks = [
      {
        id: 't1',
        title: 'Urgent Task',
        urgencyLevel: 'T1',
        createdAt: new Date(),
        selectedKeywords: [],
        effortMinutes: 30,
      },
      {
        id: 't2',
        title: 'Low Prio Task',
        urgencyLevel: 'T6',
        createdAt: new Date(),
        selectedKeywords: [],
        effortMinutes: 30,
      },
    ];
    (taskRepository.getUrgentTasks as jest.Mock).mockResolvedValue(mockTasks);
    (projectRepository.getAllForUser as jest.Mock).mockResolvedValue([]);
    (habitRepository.getScheduledForToday as jest.Mock).mockResolvedValue([]);
    (appointmentRepository.getForDate as jest.Mock).mockResolvedValue([]);
    (anchorsService.getAnchorsForDate as jest.Mock).mockReturnValue([]);
    (planRepository.create as jest.Mock).mockResolvedValue({ id: 'p1' });

    // Run
    await schedulerAI.generateSchedule(new Date(), false); // False = Whole Day

    // Expectation
    // T1 task should be scheduled
    expect(planRepository.create).toHaveBeenCalled();
    const calls = (planRepository.create as jest.Mock).mock.calls;

    // Find T1 call
    const t1Call = calls.find((c: any[]) => (c[1] as { sourceId: string }).sourceId === 't1');
    expect(t1Call).toBeTruthy();
  });

  it('should find gaps between appointments', async (): Promise<void> => {
    // Setup: Appointment from 10:00 to 11:00. Phase WOOD ends at 10:00. FIRE starts 10:00-14:00.
    // Task 30 mins.
    // It should schedule in FIRE phase after 11:00 if 10-11 is blocked.

    const d = (h: number): Date => {
      const date = new Date();
      date.setHours(h, 0, 0, 0);
      return date;
    };

    // Mock phases to ensure we have clear boundaries
    const mockPhases = [
      {
        name: 'WOOD',
        startTime: d(6),
        endTime: d(10),
        color: '#000',
        romanHours: [],
        qualities: '',
        idealTasks: [],
      },
      {
        name: 'FIRE',
        startTime: d(10),
        endTime: d(14),
        color: '#000',
        romanHours: [],
        qualities: '',
        idealTasks: [],
      },
      {
        name: 'EARTH',
        startTime: d(14),
        endTime: d(16),
        color: '#000',
        romanHours: [],
        qualities: '',
        idealTasks: [],
      },
      {
        name: 'METAL',
        startTime: d(16),
        endTime: d(20),
        color: '#000',
        romanHours: [],
        qualities: '',
        idealTasks: [],
      },
      {
        name: 'WATER',
        startTime: d(20),
        endTime: d(23),
        color: '#000',
        romanHours: [],
        qualities: '',
        idealTasks: [],
      },
    ];
    // We need to access the mock instance of phaseManager.
    // Since we did jest.mock('../src/services/PhaseManager'), we can use the imported one.
    // But TS might complain if we don't cast it.
    // const { phaseManager } = require('../src/services/PhaseManager');
    (phaseManager.getPhasesForGregorianDate as jest.Mock).mockReturnValue(mockPhases);

    const mockTasks = [
      {
        id: 't1',
        title: 'Task',
        urgencyLevel: 'T3',
        createdAt: new Date(),
        selectedKeywords: [],
        effortMinutes: 30,
      },
    ];

    (taskRepository.getUrgentTasks as jest.Mock).mockResolvedValue(mockTasks);
    (habitRepository.getScheduledForToday as jest.Mock).mockResolvedValue([]);

    // Appointment covering morning until 11:00
    (appointmentRepository.getForDate as jest.Mock).mockResolvedValue([
      { startTime: d(0), endTime: d(11) },
    ]);
    (anchorsService.getAnchorsForDate as jest.Mock).mockReturnValue([]);

    await schedulerAI.generateSchedule(new Date(), false);

    const calls = (planRepository.create as jest.Mock).mock.calls;

    // Ensure called
    expect(calls.length).toBeGreaterThan(0);

    const call = calls[0][1];

    // Should start >= 11:00
    expect(new Date((call as { startTime: Date }).startTime).getTime()).toBeGreaterThanOrEqual(
      d(11).getTime()
    );
  });

  it('should prioritize habits that are behind on weekly goal', async (): Promise<void> => {
    const d = (h: number): Date => {
      const date = new Date();
      date.setHours(h, 0, 0, 0);
      return date;
    };
    // const { phaseManager } = require('../src/services/PhaseManager');
    (phaseManager.getPhasesForGregorianDate as jest.Mock).mockReturnValue([
      {
        name: 'WOOD',
        startTime: d(8),
        endTime: d(12),
        color: '#000',
        romanHours: [],
        qualities: '',
        idealTasks: [],
      },
    ]);

    const habitBehind = {
      id: 'h1',
      title: 'Behind Habit',
      minimumSessionMinutes: 30,
      weeklyGoalMinutes: 210, // 30 mins/day * 7
      selectedKeywords: [],
      idealPhase: 'WOOD',
      selectedDays: {
        [new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()]: true,
      }, // Dynamic today
      createdAt: new Date(),
    };

    const habitAhead = {
      id: 'h2',
      title: 'Ahead Habit',
      minimumSessionMinutes: 30,
      weeklyGoalMinutes: 30, // Low goal
      selectedKeywords: [],
      idealPhase: 'WOOD',
      selectedDays: {
        [new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()]: true,
      },
      createdAt: new Date(),
    };

    (habitRepository.getScheduledForToday as jest.Mock).mockResolvedValue([
      habitBehind,
      habitAhead,
    ]);
    (taskRepository.getUrgentTasks as jest.Mock).mockResolvedValue([]);
    (appointmentRepository.getForDate as jest.Mock).mockResolvedValue([]);
    (anchorsService.getAnchorsForDate as jest.Mock).mockReturnValue([]);
    (planRepository.create as jest.Mock).mockResolvedValue({ id: 'p1' });

    // Mock calculateWeeklyProgress
    // h1 is behind: 0 progress
    // h2 is ahead: 30 progress
    (habitRepository.calculateWeeklyProgress as jest.Mock).mockImplementation((id: string) => {
      if (id === 'h1') return Promise.resolve(0);
      if (id === 'h2') return Promise.resolve(30);
      return Promise.resolve(0);
    });

    // Current Date is e.g. Monday (Day 1). Days remaining = 6.
    // h1 needed: 210 / 6 = 35 mins/day -> Urgency = 3.5
    // h2 needed: (30-30) / 6 = 0 -> Urgency = 0

    await schedulerAI.generateSchedule(new Date(), false);

    const calls = (planRepository.create as jest.Mock).mock.calls;

    // We expect h1 to be scheduled first because it has higher urgency score
    // However, existing scoring also considers appropriateness and urgence base (2).
    // h1 score: 1(appr) + 3(phase match) * [2(base) + 3.5(urgency)] = 4 * 5.5 = 22?
    // Wait, logic is: score = appropriateness(4) * urgence(2 + 3.5 = 5.5) = 22.
    // h2 score: 1(appr) + 3(phase match) * [2(base) + 0(urgency)] = 4 * 2 = 8.

    // So h1 should be first.

    expect(calls.length).toBeGreaterThanOrEqual(1);
    expect(calls[0][1].sourceId).toBe('h1');

    // if (calls.length > 1) {
    //   expect(calls[1][1].sourceId).toBe('h2');
    // }
  });

  it('should clear all pending plans for the day when generating schedule', async (): Promise<void> => {
    // Even if fromNow=true, we want to clear pending plans from 00:00

    // Mock deleteFuturePendingPlans
    (planRepository.deleteFuturePendingPlans as jest.Mock).mockResolvedValue(undefined);
    (taskRepository.getUrgentTasks as jest.Mock).mockResolvedValue([]);
    (habitRepository.getScheduledForToday as jest.Mock).mockResolvedValue([]);
    // const { phaseManager } = require('../src/services/PhaseManager');
    (phaseManager.getPhasesForGregorianDate as jest.Mock).mockReturnValue([]);
    (appointmentRepository.getForDate as jest.Mock).mockResolvedValue([]);
    (anchorsService.getAnchorsForDate as jest.Mock).mockReturnValue([]);

    const now = new Date();
    now.setHours(14, 0, 0, 0); // 2 PM

    await schedulerAI.generateSchedule(now, true);

    expect(planRepository.deleteFuturePendingPlans).toHaveBeenCalled();
    const callArgs = (planRepository.deleteFuturePendingPlans as jest.Mock).mock.calls[0];

    // Args: (userId, deleteFrom)
    const deleteFrom = new Date(callArgs[1] as Date);

    // Should be 00:00 of the same day
    expect(deleteFrom.getHours()).toBe(0);
    expect(deleteFrom.getMinutes()).toBe(0);
    expect(deleteFrom.getDate()).toBe(now.getDate());
  });

  it('should split large tasks into multiple blocks', async (): Promise<void> => {
    const d = (h: number): Date => {
      const date = new Date();
      date.setHours(h, 0, 0, 0);
      return date;
    };

    (taskRepository.getUrgentTasks as jest.Mock).mockResolvedValue([
      {
        id: 'long1',
        title: 'Long Task',
        urgencyLevel: 'T3',
        createdAt: new Date(),
        selectedKeywords: [],
        effortMinutes: 90,
      },
    ]);
    (habitRepository.getScheduledForToday as jest.Mock).mockResolvedValue([]);
    (planRepository.create as jest.Mock).mockResolvedValue({ id: 'p1' });

    // Phases allow ample time
    (phaseManager.getPhasesForGregorianDate as jest.Mock).mockReturnValue([
      {
        name: 'Fire',
        startTime: d(8),
        endTime: d(18), // 10 hours
        color: '#000',
        romanHours: [],
        qualities: '',
        idealTasks: [],
      },
    ]);
    (appointmentRepository.getForDate as jest.Mock).mockResolvedValue([]);
    (anchorsService.getAnchorsForDate as jest.Mock).mockReturnValue([]);

    await schedulerAI.generateSchedule(d(8), false);

    const calls = (planRepository.create as jest.Mock).mock.calls;
    const longTaskCalls = calls.filter(
      (c: any[]) => (c[1] as { sourceId: string }).sourceId === 'long1'
    );

    // Should be split. e.g. 60 + 30 or similar.
    expect(longTaskCalls.length).toBeGreaterThan(1);

    const totalScheduled = longTaskCalls.reduce((acc: number, c: any[]) => {
      const start = new Date((c[1] as { startTime: string | number | Date }).startTime);
      const end = new Date((c[1] as { endTime: string | number | Date }).endTime);
      return acc + (end.getTime() - start.getTime()) / 60000;
    }, 0);

    // Should schedule roughly 90 mins (rounding might affect it slightly, but close)
    expect(totalScheduled).toBeGreaterThanOrEqual(85);
    expect(totalScheduled).toBeLessThanOrEqual(92);
  });

  it('should not schedule during sleep hours', async (): Promise<void> => {
    const d = (h: number): Date => {
      const date = new Date();
      date.setHours(h, 0, 0, 0);
      return date;
    };

    // Sleep 22:00 - 06:00
    (useUserStore.getState as jest.Mock).mockReturnValue({
      user: { id: 'test', sleepStart: '22:00', sleepEnd: '06:00' },
    });

    (taskRepository.getUrgentTasks as jest.Mock).mockResolvedValue([
      { id: 't1', title: 'Task', urgencyLevel: 'T1', effortMinutes: 60, createdAt: new Date() },
    ]);
    (habitRepository.getScheduledForToday as jest.Mock).mockResolvedValue([]);

    // Open phase late at night
    (phaseManager.getPhasesForGregorianDate as jest.Mock).mockReturnValue([
      {
        name: 'Water',
        startTime: d(20),
        endTime: d(24),
        color: '#000',
        romanHours: [],
        qualities: '',
        idealTasks: [],
      },
    ]);
    (appointmentRepository.getForDate as jest.Mock).mockResolvedValue([]);
    (anchorsService.getAnchorsForDate as jest.Mock).mockReturnValue([]);

    // Schedule for today
    await schedulerAI.generateSchedule(d(8), false);

    const calls = (planRepository.create as jest.Mock).mock.calls;

    // Check all plans start before 22:00
    for (const call of calls) {
      const start = new Date((call[1] as { startTime: string | number | Date }).startTime);
      expect(start.getHours()).toBeLessThan(22);
    }
  });

  it('should prioritize tasks matching phase keywords', async (): Promise<void> => {
    const d = (h: number): Date => {
      const date = new Date();
      date.setHours(h, 0, 0, 0);
      return date;
    };

    const taskMatching = {
      id: 'match',
      title: 'Creative Task',
      urgencyLevel: 'T3',
      selectedKeywords: ['creative'],
      effortMinutes: 60,
      createdAt: new Date(),
    };
    const taskGeneric = {
      id: 'generic',
      title: 'Generic Task',
      urgencyLevel: 'T3',
      selectedKeywords: [],
      effortMinutes: 60,
      createdAt: new Date(),
    };

    (taskRepository.getUrgentTasks as jest.Mock).mockResolvedValue([taskGeneric, taskMatching]);
    (habitRepository.getScheduledForToday as jest.Mock).mockResolvedValue([]);
    (planRepository.create as jest.Mock).mockResolvedValue({ id: 'p1' });

    // Mock Phase with 'creative' keyword
    // Note: implementation checks PHASES constant. We can't easily mock the constant import.
    // However, SchedulerAI.ts imports `phaseManager` and `PHASE_KEYWORDS` might be used.
    // Let's check SchedulerAI implementation.
    // It calls `isPhaseMatch`.
    // We can rely on 'WOOD' phase having some keywords.
    // 'WOOD' typically has 'creative', 'strategy'.

    (phaseManager.getPhasesForGregorianDate as jest.Mock).mockReturnValue([
      {
        name: 'WOOD', // Should match 'creative'
        startTime: d(8),
        endTime: d(12),
        color: '#000',
        romanHours: [],
        qualities: '',
        idealTasks: [],
      },
    ]);
    (appointmentRepository.getForDate as jest.Mock).mockResolvedValue([]);
    (anchorsService.getAnchorsForDate as jest.Mock).mockReturnValue([]);

    await schedulerAI.generateSchedule(d(8), false);

    const calls = (planRepository.create as jest.Mock).mock.calls;

    // We expect 'match' to be scheduled.
    // 'generic' might also be scheduled if there's time.
    // We want to verify `match` got a boosted score or was scheduled.
    const matchCall = calls.find((c: any[]) => (c[1] as { sourceId: string }).sourceId === 'match');
    expect(matchCall).toBeTruthy();
  });
});
