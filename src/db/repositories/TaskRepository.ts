import type { ListConfiguration } from '../../stores/listStore';
import type { Task, TaskRow } from '../../types/database';
import { generateId } from '../../utils/id';
import { db } from '../database';
import { mapTaskRowToTask, safeStringify } from '../mappers';

class TaskRepository {
  // CREATE
  async create(
    userId: string,
    data: Omit<
      Task,
      'id' | 'userId' | 'createdAt' | 'updatedAt' | 'isCompleted' | 'linkedObjectIds'
    > & {
      linkedObjectIds?: string[];
    }
  ): Promise<Task> {
    const id = generateId();
    const selectedKeywordsJson = safeStringify(data.selectedKeywords || []);
    const linkedObjectIdsJson = safeStringify(data.linkedObjectIds || []);

    await db.execute(
      `INSERT INTO tasks (
        id, user_id, title, effort_minutes, deadline, project_id,
        notes, position_in_project, selected_keywords, is_completed, linked_object_ids
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
      [
        id,
        userId,
        data.title,
        data.effortMinutes,
        data.deadline ? data.deadline.toISOString() : null,
        data.projectId || null,
        data.notes || null,
        data.positionInProject || null,
        selectedKeywordsJson,
        linkedObjectIdsJson,
      ]
    );

    const rows = await db.query<TaskRow>('SELECT * FROM tasks WHERE id = ?', [id]);
    const firstRow = rows[0];
    if (!firstRow) throw new Error('Failed to create task: Row not found');
    return mapTaskRowToTask(firstRow);
  }

  // READ
  async getById(id: string): Promise<Task | null> {
    const rows = await db.query<TaskRow>('SELECT * FROM tasks WHERE id = ?', [id]);
    return rows[0] ? mapTaskRowToTask(rows[0]) : null;
  }

  async getAllForUser(userId: string, completed = false): Promise<Task[]> {
    const rows = await db.query<TaskRow>(
      'SELECT * FROM tasks WHERE user_id = ? AND is_completed = ? ORDER BY created_at DESC',
      [userId, completed ? 1 : 0]
    );
    return rows.map(mapTaskRowToTask);
  }

  async getUrgentTasks(userId: string, limit = 3): Promise<Task[]> {
    // Basic fetching, mapped with computed urgency
    // Then sort in JS because SQLite computes are complex (lazy load)
    // Ideally we filter by deadline, but for now fetch all active with deadline
    const rows = await db.query<TaskRow>(
      `SELECT * FROM tasks 
       WHERE user_id = ? 
         AND is_completed = 0 
       LIMIT 1000`, // Fetch enough candidates
      [userId]
    );

    const tasks = rows.map(mapTaskRowToTask);

    // Sort by descending minutePerDay/Urgency, then by Age (Oldest first)
    tasks.sort((a, b) => {
      const urgencyA = a.minutesPerDay || 0;
      const urgencyB = b.minutesPerDay || 0;
      if (urgencyA !== urgencyB) {
        return urgencyB - urgencyA; // Higher urgency first
      }
      // Same urgency (e.g. both 0/no deadline) -> Oldest first
      return a.createdAt.getTime() - b.createdAt.getTime();
    });

    return tasks.slice(0, limit);
  }

  async getTasksByKeyword(userId: string, keyword: string): Promise<Task[]> {
    const rows = await db.query<TaskRow>(
      `SELECT * FROM tasks 
       WHERE user_id = ? 
         AND is_completed = 0
         AND selected_keywords LIKE ?`,
      [userId, `%"${keyword}"%`]
    );
    return rows.map(mapTaskRowToTask);
  }

  async getTasksByProjectId(userId: string, projectId: string): Promise<Task[]> {
    const rows = await db.query<TaskRow>(
      `SELECT * FROM tasks 
       WHERE user_id = ? 
         AND project_id = ?
         AND is_completed = 0
       ORDER BY position_in_project ASC, created_at ASC`,
      [userId, projectId]
    );
    return rows.map(mapTaskRowToTask);
  }

  // Returns { [listId]: { count: number, preview: Task[] } }
  async getListSummaries(
    userId: string,
    lists: ListConfiguration[]
  ): Promise<Record<string, { count: number; preview: Task[] }>> {
    // This is a naive implementation: loop queries.
    // Optimized: Fetch ALL active tasks for user, then partition in memory.
    // Fetching all might be heavy if >1000 tasks, but likely fine for local DB <10k.

    const allActiveRows = await db.query<TaskRow>(
      'SELECT * FROM tasks WHERE user_id = ? AND is_completed = 0',
      [userId]
    );
    const allActive = allActiveRows.map(mapTaskRowToTask);

    const result: Record<string, { count: number; preview: Task[] }> = {};

    for (const list of lists) {
      // Filter by keywords (array overlap)
      const matches = allActive.filter(
        t => t.selectedKeywords.some(k => list.keywords.includes(k))
        // || (list.plan_outside_work && t.isNonWork?) -- future logic
      );

      // Sort for preview: highest urgency first
      matches.sort((a, b) => (b.minutesPerDay || 0) - (a.minutesPerDay || 0));

      result[list.id] = {
        count: matches.length,
        preview: matches.slice(0, 3), // Preview top 3
      };
    }
    return result;
  }

  async getAllTasksByKeyword(userId: string, keyword: string): Promise<Task[]> {
    const rows = await db.query<TaskRow>(
      `SELECT * FROM tasks 
       WHERE user_id = ? 
         AND selected_keywords LIKE ?`,
      [userId, `%"${keyword}"%`]
    );
    return rows.map(mapTaskRowToTask);
  }

  async getCompletedTasks(userId: string, limit = 20): Promise<Task[]> {
    const rows = await db.query<TaskRow>(
      `SELECT * FROM tasks 
       WHERE user_id = ? 
         AND is_completed = 1
       ORDER BY completed_at DESC 
       LIMIT ?`,
      [userId, limit]
    );
    return rows.map(mapTaskRowToTask);
  }

  // UPDATE
  async update(id: string, data: Partial<Task>): Promise<void> {
    const updates: string[] = [];
    const params: (string | number | null)[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      params.push(data.title);
    }
    if (data.effortMinutes !== undefined) {
      updates.push('effort_minutes = ?');
      params.push(data.effortMinutes);
    }
    if (data.deadline !== undefined) {
      updates.push('deadline = ?');
      params.push(data.deadline ? data.deadline.toISOString() : null);
    }
    if (data.projectId !== undefined) {
      updates.push('project_id = ?');
      params.push(data.projectId);
    }
    if (data.notes !== undefined) {
      updates.push('notes = ?');
      params.push(data.notes || null);
    }
    if (data.positionInProject !== undefined) {
      updates.push('position_in_project = ?');
      params.push(data.positionInProject);
    }
    if (data.selectedKeywords !== undefined) {
      updates.push('selected_keywords = ?');
      params.push(safeStringify(data.selectedKeywords));
    }
    if (data.isCompleted !== undefined) {
      updates.push('is_completed = ?');
      params.push(data.isCompleted ? 1 : 0);
      if (data.isCompleted) {
        updates.push("completed_at = datetime('now')");
      } else {
        updates.push('completed_at = NULL');
      }
    }

    if (updates.length === 0) return;

    updates.push("updated_at = datetime('now')");
    params.push(id);

    await db.execute(`UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`, params);
  }

  // DELETE
  async delete(id: string): Promise<void> {
    await db.execute('DELETE FROM tasks WHERE id = ?', [id]);
  }

  // BATCH UPDATE
  async updatePositions(updates: { id: string; position: number }[]): Promise<void> {
    await db.transaction(async tx => {
      for (const { id, position } of updates) {
        await tx.runAsync('UPDATE tasks SET position_in_project = ? WHERE id = ?', [position, id]);
      }
    });
  }
}

export const taskRepository = new TaskRepository();
