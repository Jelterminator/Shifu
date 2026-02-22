/* eslint-disable */
import { appointmentRepository } from '../../../src/db/repositories/AppointmentRepository';
import { habitRepository } from '../../../src/db/repositories/HabitRepository';
import { planRepository } from '../../../src/db/repositories/PlanRepository';
import { taskRepository } from '../../../src/db/repositories/TaskRepository';
import { schedulerAI } from '../../../src/services/ai/SchedulerAI';
import { phaseManager } from '../../../src/services/data/PhaseManager';
import { useUserStore } from '../../../src/stores/userStore';

// Mocks
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    set: jest.fn(),
    getString: jest.fn(),
    getBoolean: jest.fn(),
    getNumber: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
  })),
}));
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationCategoryAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn().mockResolvedValue([]),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
}));
jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockResolvedValue({
    execAsync: jest.fn(),
    runAsync: jest.fn(),
    getAllAsync: jest.fn(),
    getFirstAsync: jest.fn(),
    withTransactionAsync: jest.fn(),
  }),
}));
jest.mock('../../../src/db/database', () => ({
  db: {
    execute: jest.fn(),
    query: jest.fn(),
  },
}));
jest.mock('../../../src/db/repositories/PlanRepository');
jest.mock('../../../src/db/repositories/TaskRepository');
jest.mock('../../../src/db/repositories/HabitRepository');

jest.mock('../../../src/db/repositories/AppointmentRepository');
jest.mock('../../../src/stores/userStore');
jest.mock('../../../src/services/data/PhaseManager');
jest.mock('../../../src/services/data/Anchors', () => ({
  anchorsService: {
    getAnchorsForDate: jest.fn().mockReturnValue([]),
  },
}));
jest.mock('../../../src/stores/listStore', () => ({
  useListStore: {
    getState: jest.fn().mockReturnValue({
      lists: [
        {
          id: 'work',
          name: 'Work',
          keywords: ['work'],
          plan_during_work: true,
          plan_outside_work: false,
        },
        {
          id: 'personal',
          name: 'Personal',
          keywords: ['personal'],
          plan_during_work: false,
          plan_outside_work: true,
        },
      ],
    }),
  },
}));

describe('SchedulerAI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useUserStore.getState as jest.Mock).mockReturnValue({
      user: { id: 'test-user', workStart: '09:00', workEnd: '17:00' },
    });
    (phaseManager.getPhasesForGregorianDate as jest.Mock).mockImplementation((date: Date) => {
      // Mock a simple day with one phase covering the whole day for simplicity
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      return [
        {
          name: 'WOOD', // Arbitrary
          startTime: start,
          endTime: end,
          color: 'green',
          romanHours: [],
          qualities: 'Growth',
          idealTasks: [],
        },
      ];
    });
  });

  it('should schedule tasks starting from NOW, not midnight, when fromNow is true', async () => {
    // Set "Now" to 10:00 AM
    const mockNow = new Date('2024-01-01T10:00:00.000Z');
    jest.useFakeTimers().setSystemTime(mockNow);

    // Mock Tasks
    (taskRepository.getUrgentTasks as jest.Mock).mockResolvedValue([
      {
        id: 'task-1',
        title: 'Task 1',
        effortMinutes: 60,
        selectedKeywords: [],
        createdAt: new Date(),
      },
      {
        id: 'task-2',
        title: 'Task 2',
        effortMinutes: 60,
        selectedKeywords: [],
        createdAt: new Date(),
      },
    ]);

    // Mock Habits (none)
    (habitRepository.getScheduledForToday as jest.Mock).mockResolvedValue([]);
    (habitRepository.calculateWeeklyProgress as jest.Mock).mockResolvedValue(0);

    // Mock Appointments (none)
    (appointmentRepository.getForDate as jest.Mock).mockResolvedValue([]);

    // Run Scheduler
    await schedulerAI.generateSchedule(mockNow, true);

    // Verify Plan Creation
    expect(planRepository.create).toHaveBeenCalled();

    // Check the start time of the first plan
    const firstCall = (planRepository.create as jest.Mock).mock.calls[0];
    const planData = firstCall[1];
    const planStart = new Date(planData.startTime);

    // Expect plan to start AFTER or AT 10:00 AM (plus buffer maybe), definitely NOT 00:00 (midnight)
    // The scheduler adds 1 min buffer in createPlan: dbStart = start + 60000
    // So if it schedules at 10:00, dbStart should be 10:01

    expect(planStart.getTime()).toBeGreaterThanOrEqual(mockNow.getTime());
  });
});
