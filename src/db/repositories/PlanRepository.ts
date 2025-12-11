import type { Plan, PlanRow } from '../../types/database';
import { generateId } from '../../utils/id';
import { db } from '../database';
import { mapPlanRowToPlan, safeStringify } from '../mappers';

class PlanRepository {
  async create(
    userId: string,
    data: Omit<Plan, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'linkedObjectIds' | 'done'> & {
      linkedObjectIds?: string[];
      done?: boolean | null;
    }
  ): Promise<Plan> {
    const id = generateId();
    const now = new Date().toISOString();
    const linkedObjectIdsJson = safeStringify(data.linkedObjectIds || []);
    
    // done defaults to null (pending) if not provided
    const doneValue = data.done === undefined ? null : (data.done === null ? null : (data.done ? 1 : 0));

    await db.execute(
      `INSERT INTO plans (
        id, user_id, name, description, start_time, end_time, 
        done, source_id, source_type, rating, linked_object_ids, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId,
        data.name,
        data.description || null,
        data.startTime.toISOString(),
        data.endTime.toISOString(),
        doneValue,
        data.sourceId || null,
        data.sourceType || null,
        data.rating || null,
        linkedObjectIdsJson,
        now,
      ]
    );

    const rows = await db.query<PlanRow>('SELECT * FROM plans WHERE id = ?', [id]);
    if (!rows[0]) throw new Error('Failed to create plan: Row not found');
    return mapPlanRowToPlan(rows[0]);
  }

  async getForDateRange(userId: string, start: Date, end: Date): Promise<Plan[]> {
    const rows = await db.query<PlanRow>(
      `SELECT * FROM plans 
         WHERE user_id = ?
         AND start_time >= ? 
         AND start_time <= ?
         ORDER BY start_time ASC`,
      [userId, start.toISOString(), end.toISOString()]
    );

    return rows.map(mapPlanRowToPlan);
  }

  async getById(id: string): Promise<Plan | null> {
    const rows = await db.query<PlanRow>('SELECT * FROM plans WHERE id = ?', [id]);
    return rows[0] ? mapPlanRowToPlan(rows[0]) : null;
  }

  async getBySourceId(userId: string, sourceId: string, sourceType: 'task' | 'habit'): Promise<Plan[]> {
    const rows = await db.query<PlanRow>(
      `SELECT * FROM plans 
       WHERE user_id = ? 
       AND source_id = ? 
       AND source_type = ?
       ORDER BY start_time ASC`,
      [userId, sourceId, sourceType]
    );
    return rows.map(mapPlanRowToPlan);
  }

  /**
   * Delete plans for a specific generated run (e.g. clear future suggestions)
   * This is useful when re-generating a schedule.
   * NOTE: Only deletes PENDING plans (done IS NULL or done = 0), not COMPLETED ones.
   */
  async deleteFuturePendingPlans(userId: string, fromDate: Date): Promise<void> {
    await db.execute(
      `DELETE FROM plans 
       WHERE user_id = ? 
       AND start_time >= ? 
       AND (done IS NULL OR done = 0)`, // Delete pending plans (null or false)
      [userId, fromDate.toISOString()]
    );
  }

  async update(id: string, data: Partial<Plan>): Promise<void> {
    const updates: string[] = [];
    const params: (string | number | null)[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      params.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      params.push(data.description || null);
    }
    if (data.startTime !== undefined) {
      updates.push('start_time = ?');
      params.push(data.startTime.toISOString());
    }
    if (data.endTime !== undefined) {
      updates.push('end_time = ?');
      params.push(data.endTime.toISOString());
    }
    if (data.done !== undefined) {
      updates.push('done = ?');
      // Fix: handle null properly. Logic: undefined -> ignore, null -> set to null, boolean -> 1/0
      if (data.done === null) params.push(null);
      else params.push(data.done ? 1 : 0);
    }
    if (data.rating !== undefined) {
        updates.push('rating = ?');
        params.push(data.rating || null);
    }
    if (data.linkedObjectIds !== undefined) {
      updates.push('linked_object_ids = ?');
      params.push(safeStringify(data.linkedObjectIds));
    }
    if (data.completedAt !== undefined) {
        updates.push('completed_at = ?');
        params.push(data.completedAt ? data.completedAt.toISOString() : null);
    }

    if (updates.length === 0) return;
    
    // Plans don't track updated_at usually, but we update the row
    params.push(id);

    await db.execute(`UPDATE plans SET ${updates.join(', ')} WHERE id = ?`, params);
  }
  async delete(id: string): Promise<void> {
    await db.execute('DELETE FROM plans WHERE id = ?', [id]);
  }
}

export const planRepository = new PlanRepository();
