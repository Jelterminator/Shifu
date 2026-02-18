import * as Mappers from '../src/db/mappers';
import type {
    Habit,
    HabitRow,
    JournalEntry,
    JournalEntryRow,
    Project,
    ProjectRow,
    Task,
    TaskRow,
} from '../src/types/database';

describe('Mappers', () => {
  const mockDate = new Date('2025-01-01T12:00:00.000Z');

  describe('Utilities', () => {
    it('safeParse should return object from JSON', () => {
      const json = '{"foo":"bar"}';
      expect(Mappers.safeParse(json, {})).toEqual({ foo: 'bar' });
    });

    it('safeParse should return fallback on error', () => {
      expect(Mappers.safeParse('invalid', [])).toEqual([]);
    });

    it('safeStringify should return JSON string', () => {
      expect(Mappers.safeStringify({ a: 1 })).toBe('{"a":1}');
    });
  });

  describe('Habit Mapper', () => {
    const mockRow: HabitRow = {
      id: '1',
      user_id: 'u1',
      title: 'Meditate',
      minimum_session_minutes: 10,
      weekly_goal_minutes: 60,
      selected_days: '{"monday":true}',
      selected_keywords: '["calm"]',
      ideal_phase: 'WATER',
      notes: null,
      is_active: 1,
      linked_object_ids: '[]',
      created_at: mockDate.toISOString(),
      updated_at: mockDate.toISOString(),
    };

    it('mapHabitRowToHabit correctly converts row', () => {
      const result = Mappers.mapHabitRowToHabit(mockRow);
      expect(result.id).toBe('1');
      expect(result.isActive).toBe(true);
      expect(result.createdAt).toEqual(mockDate);
    });

    it('mapHabitToRow correctly converts domain object', () => {
      const habit: Habit = Mappers.mapHabitRowToHabit(mockRow);
      const row = Mappers.mapHabitToRow(habit);
      expect(row).toEqual(mockRow);
    });
  });

  describe('Task Mapper', () => {
    const mockRow: TaskRow = {
      id: 't1',
      user_id: 'u1',
      title: 'Do logic',
      effort_minutes: 30,
      deadline: mockDate.toISOString(),
      project_id: 'p1',
      notes: 'Some notes',
      position_in_project: 1,
      selected_keywords: '["quick"]',
      is_completed: 0,
      linked_object_ids: '[]',
      created_at: mockDate.toISOString(),
      updated_at: mockDate.toISOString(),
      completed_at: null,
    };

    it('mapTaskRowToTask correctly converts row', () => {
      const result = Mappers.mapTaskRowToTask(mockRow);
      expect(result.id).toBe('t1');
      expect(result.title).toBe('Do logic');
      expect(result.isCompleted).toBe(false);
      expect(result.deadline).toEqual(mockDate);
    });

    it('mapTaskToRow correctly converts domain object', () => {
      const task: Task = Mappers.mapTaskRowToTask(mockRow);
      const row = Mappers.mapTaskToRow(task);
      expect(row).toEqual(mockRow);
    });
  });

  describe('Project Mapper', () => {
    const mockRow: ProjectRow = {
      id: 'p1',
      user_id: 'u1',
      title: 'Big Project',
      deadline: mockDate.toISOString(),
      notes: null,
      is_completed: 1,
      linked_object_ids: '[]',
      selected_keywords: '[]',
      created_at: mockDate.toISOString(),
      updated_at: mockDate.toISOString(),
      completed_at: mockDate.toISOString(),
    };

    it('mapProjectRowToProject correctly converts row', () => {
      const result = Mappers.mapProjectRowToProject(mockRow);
      expect(result.id).toBe('p1');
      expect(result.isCompleted).toBe(true);
      expect(result.completedAt).toEqual(mockDate);
    });

    it('mapProjectToRow correctly converts domain object', () => {
      const project: Project = Mappers.mapProjectRowToProject(mockRow);
      const row = Mappers.mapProjectToRow(project);
      expect(row).toEqual(mockRow);
    });
  });

  describe('JournalEntry Mapper', () => {
    const mockRow: JournalEntryRow = {
      id: 'j1',
      user_id: 'u1',
      entry_date: mockDate.toISOString(),
      content: 'Dear diary',
      linked_object_ids: '[]',
      created_at: mockDate.toISOString(),
      updated_at: mockDate.toISOString(),
    };

    it('mapJournalEntryRowToJournalEntry correctly converts row', () => {
      const result = Mappers.mapJournalEntryRowToJournalEntry(mockRow);
      expect(result.id).toBe('j1');
      expect(result.content).toBe('Dear diary');
      expect(result.entryDate).toEqual(mockDate);
    });

    it('mapJournalEntryToRow correctly converts domain object', () => {
      const entry: JournalEntry = Mappers.mapJournalEntryRowToJournalEntry(mockRow);
      const row = Mappers.mapJournalEntryToRow(entry);
      expect(row).toEqual(mockRow);
    });
  });
});
