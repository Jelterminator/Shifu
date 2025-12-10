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
    it('should return urgent tasks sorted by deadline', async () => {
      const mockTasks = [
        { id: '1', title: 'Urgent Task', deadline: '2025-12-10T10:00:00.000Z' },
        { id: '2', title: 'Less Urgent Task', deadline: '2025-12-15T10:00:00.000Z' },
      ];

      mockDb.query.mockResolvedValue(mockTasks);

      const result = await taskRepository.getUrgentTasks('user-1');

      expect(mockDb.query).toHaveBeenCalledWith(expect.stringContaining('ORDER BY deadline ASC'), [
        'user-1',
        50,
      ]);
      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Urgent Task');
    });
  });

  describe('getTopUrgentTasksForList', () => {
    it('should return top N urgent tasks for a list', async () => {
      const mockTasks = [
        {
          id: '1',
          title: 'Urgent Work Task',
          deadline: '2025-12-10T10:00:00.000Z',
          selected_keywords: '["work"]',
        },
      ];

      mockDb.query.mockResolvedValue(mockTasks);

      const result = await taskRepository.getTopUrgentTasksForList('user-1', 'work', 2);

      expect(mockDb.query).toHaveBeenCalledWith(
        expect.stringContaining('selected_keywords LIKE ?'),
        ['user-1', '%"work"%', 2]
      );
      expect(result).toHaveLength(1);
    });
  });
});
