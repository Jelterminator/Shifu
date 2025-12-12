describe('TaskRepository', () => {
  let taskRepository: any;
  let mockDb: any;

  beforeEach(() => {
    jest.resetModules();

    // Setup mock for database
    mockDb = {
      query: jest.fn(),
      execute: jest.fn(),
    };

    jest.mock('../src/db/database', () => ({
      db: mockDb,
    }));

    // Re-require to ensure mock is used
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const module = require('../src/db/repositories/TaskRepository');
    taskRepository = module.taskRepository;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTasksByKeyword', () => {
    it('should return tasks filtering by keyword', async () => {
      const mockTasks = [
        { id: '1', title: 'Task 1', selected_keywords: '["work"]' },
        { id: '2', title: 'Task 2', selected_keywords: '["work", "urgent"]' },
      ];

      mockDb.query.mockResolvedValue(mockTasks);

      const result = await taskRepository.getTasksByKeyword('user-1', 'work');

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('selected_keywords LIKE ?'),
        ['user-1', '%"work"%']
      );
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Task 1');
    });
  });

  describe('getUrgentTasks', () => {
    it('should return tasks sorted by urgency (deadline) then age', async () => {
      // 1. Setup mock data
      const now = new Date();
      const older = new Date(now.getTime() - 1000000);
      const newer = now;

      const taskWithDeadline = {
        id: '1',
        title: 'Deadline Task',
        effort_minutes: 60,
        deadline: new Date(now.getTime() + 86400000).toISOString(), // Tomorrow
        is_completed: 0,
        created_at: newer.toISOString(),
      };

      const oldTaskNoDeadline = {
        id: '2',
        title: 'Old Task',
        effort_minutes: 30,
        deadline: null,
        is_completed: 0,
        created_at: older.toISOString(),
      };

      const newTaskNoDeadline = {
        id: '3',
        title: 'New Task',
        effort_minutes: 30,
        deadline: null,
        is_completed: 0,
        created_at: newer.toISOString(),
      };

      mockDb.query.mockResolvedValue([newTaskNoDeadline, oldTaskNoDeadline, taskWithDeadline]);

      const result = await taskRepository.getUrgentTasks('user-1', 3);

      // Expect sorting:
      // 1. taskWithDeadline (minutesPerDay > 0)
      // 2. oldTaskNoDeadline (minutesPerDay = 0, but older)
      // 3. newTaskNoDeadline (minutesPerDay = 0, newer)

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('1'); // Deadline
      expect(result[1].id).toBe('2'); // Oldest
      expect(result[2].id).toBe('3'); // Newest
    });
  });
});
