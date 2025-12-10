import { db } from '../../src/db/database';
import { habitRepository } from '../../src/db/repositories/HabitRepository';
import { generateId } from '../../src/utils/id';

// Mock DB
jest.mock('../../src/db/database', () => ({
  db: {
    execute: jest.fn(),
    query: jest.fn(),
  },
}));

jest.mock('../../src/utils/id', () => ({
  generateId: jest.fn(),
}));

describe('HabitRepository', () => {
  const mockDate = new Date('2025-01-01T12:00:00.000Z');
  const mockId = 'habit-123';
  const mockUserId = 'user-123';

  beforeEach(() => {
    jest.clearAllMocks();
    (generateId as jest.Mock).mockReturnValue(mockId);
  });

  describe('create', () => {
    const habitData = {
      title: 'Workout',
      minimumSessionMinutes: 30,
      weeklyGoalMinutes: 150,
      selectedDays: {
        monday: true,
        tuesday: false,
        wednesday: true,
        thursday: false,
        friday: true,
        saturday: false,
        sunday: false,
      },
      selectedKeywords: [],
      idealPhase: 'FIRE' as const,
      notes: 'Go hard',
      isActive: true,
      linkedObjectIds: [],
    };

    it('should insert and return a habit', async () => {
      // Mock db.execute to resolve
      (db.execute as jest.Mock).mockResolvedValue(undefined);

      // Mock db.query to return the inserted row
      const mockRow = {
        id: mockId,
        user_id: mockUserId,
        title: habitData.title,
        minimum_session_minutes: habitData.minimumSessionMinutes,
        weekly_goal_minutes: habitData.weeklyGoalMinutes,
        selected_days: JSON.stringify(habitData.selectedDays),
        selected_keywords: '[]',
        ideal_phase: 'FIRE',
        notes: 'Go hard',
        is_active: 1,
        linked_object_ids: '[]',
        created_at: mockDate.toISOString(),
        updated_at: mockDate.toISOString(),
      };
      (db.query as jest.Mock).mockResolvedValue([mockRow]);

      const result = await habitRepository.create(mockUserId, habitData);

      expect(db.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO habits'),
        expect.any(Array)
      );
      expect(result.id).toBe(mockId);
      expect(result.title).toBe('Workout');
    });
  });

  describe('calculateStreak', () => {
    it('should calculate streak correctly from plans', async () => {
      // Mock plans explicitly for streak calculation
      // Logic expects start_time descending
      // We simulate: Today (Done), Yesterday (Done), 2 days ago (Done) -> Streak 3

      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(today.getDate() - 2);

      const mockRows = [
        { start_time: today.toISOString() },
        { start_time: yesterday.toISOString() },
        { start_time: twoDaysAgo.toISOString() },
      ];

      (db.query as jest.Mock).mockResolvedValue(mockRows);

      // We need to spy on getLocalDateString or just trust it works with standard Dates.
      // The repo uses `new Date()` internally for "today", so we must ensure our "today" matches.
      // Ideally we'd mock system time, but for now let's assume test runs fast enough.

      const streak = await habitRepository.calculateStreak(mockId);

      expect(db.query).toHaveBeenCalledWith(expect.stringContaining('SELECT start_time'), [mockId]);
      expect(streak).toBe(3);
    });

    it('should return 0 if no plans', async () => {
      (db.query as jest.Mock).mockResolvedValue([]);
      const streak = await habitRepository.calculateStreak(mockId);
      expect(streak).toBe(0);
    });
  });

  describe('trackCompletion', () => {
    it('should insert a plan if not already completed for date', async () => {
      // Mock getCompletionForDate to return false (not found)
      // Note: trackCompletion calls `this.getCompletionForDate`.
      // We can spy on the instance method or just mock the db query that `getCompletionForDate` makes.

      // Call 1: getCompletionForDate -> query plans -> return empty []
      // Call 2: insert

      (db.query as jest.Mock).mockResolvedValueOnce([]); // No existing completion
      (db.execute as jest.Mock).mockResolvedValue(undefined);

      const date = new Date('2025-01-01T10:00:00Z');
      await habitRepository.trackCompletion(mockUserId, mockId, date, 30);

      expect(db.execute).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO plans'),
        expect.arrayContaining([mockId, mockUserId, 'Habit Completion'])
      );
    });
  });

  describe('getWeeklyOverallProgress', () => {
    it('should clamp progress per habit to its weekly goal', async () => {
      // 1. Mock getAllForUser response (2 Active habits)
      const habitA_Id = 'habit-A';
      const habitB_Id = 'habit-B';

      const mockRowA = {
        id: habitA_Id,
        user_id: mockUserId,
        title: 'Run',
        weekly_goal_minutes: 60,
        selected_days: '{}',
        selected_keywords: '[]',
        is_active: 1,
        linked_object_ids: '[]',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockRowB = {
        id: habitB_Id,
        user_id: mockUserId,
        title: 'Read',
        weekly_goal_minutes: 60,
        selected_days: '{}',
        selected_keywords: '[]',
        is_active: 1,
        linked_object_ids: '[]',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // 2. Mock plans response
      // Habit A has 100 mins (Goal 60) -> Should count as 60
      // Habit B has 0 mins (Goal 60) -> Should count as 0
      const planRow = {
        source_id: habitA_Id,
        start_time: '2025-01-01T10:00:00.000Z',
        end_time: '2025-01-01T11:40:00.000Z', // 100 mins later
      };

      // Sequence of DB calls:
      // 1. getAllForUser -> db.query
      // 2. getWeeklyOverallProgress plan query -> db.query

      (db.query as jest.Mock)
        .mockResolvedValueOnce([mockRowA, mockRowB]) // for getAllForUser
        .mockResolvedValueOnce([planRow]); // for plans

      const result = await habitRepository.getWeeklyOverallProgress(mockUserId);

      // Total Goal: 60 + 60 = 120
      // Current Progress: min(100, 60) + 0 = 60.
      expect(result.totalGoal).toBe(120);
      expect(result.currentProgress).toBe(60);
    });
  });
});
