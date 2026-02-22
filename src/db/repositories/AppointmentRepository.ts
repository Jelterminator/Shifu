import type { Appointment, AppointmentRow } from '../../types/database';
import { generateId } from '../../utils/id';
import { db } from '../database';
import { mapAppointmentRowToAppointment, safeStringify } from '../mappers';
import { vectorService } from '../vectors';

class AppointmentRepository {
  async create(
    userId: string,
    data: Omit<Appointment, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'linkedObjectIds'> & {
      linkedObjectIds?: string[];
    }
  ): Promise<Appointment> {
    const id = generateId();
    const now = new Date().toISOString();
    const linkedObjectIdsJson = safeStringify(data.linkedObjectIds || []);

    await db.execute(
      `INSERT INTO appointments (
        id, user_id, name, description, start_time, end_time, 
        external_id, source, linked_object_ids, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        userId,
        data.name,
        data.description || null,
        data.startTime.toISOString(),
        data.endTime.toISOString(),
        data.externalId || null,
        data.source,
        linkedObjectIdsJson,
        now,
        now,
      ]
    );

    const rows = await db.query<AppointmentRow>('SELECT * FROM appointments WHERE id = ?', [id]);
    if (!rows[0]) throw new Error('Failed to create appointment: Row not found');
    const appointment = mapAppointmentRowToAppointment(rows[0]);

    const embedText = [appointment.name, appointment.description].filter(Boolean).join(' ');
    try {
      if (embedText.trim()) {
        await vectorService.addEmbedding(userId, 'appointment', id, embedText);
      }
    } catch (e) {
      console.warn('Failed to add embedding for appointment', e);
    }

    return appointment;
  }

  async getForDate(userId: string, date: Date): Promise<Appointment[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const rows = await db.query<AppointmentRow>(
      `SELECT * FROM appointments 
         WHERE user_id = ?
         AND start_time >= ? 
         AND start_time <= ?
         ORDER BY start_time ASC`,
      [userId, startOfDay.toISOString(), endOfDay.toISOString()]
    );

    return rows.map(mapAppointmentRowToAppointment);
  }

  async getByExternalId(externalId: string): Promise<Appointment | null> {
    const rows = await db.query<AppointmentRow>(
      'SELECT * FROM appointments WHERE external_id = ?',
      [externalId]
    );
    if (!rows[0]) return null;
    return mapAppointmentRowToAppointment(rows[0]);
  }

  async update(id: string, data: Partial<Appointment>): Promise<void> {
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
    if (data.linkedObjectIds !== undefined) {
      updates.push('linked_object_ids = ?');
      params.push(safeStringify(data.linkedObjectIds));
    }

    if (updates.length === 0) return;

    updates.push("updated_at = datetime('now')");
    params.push(id);

    await db.execute(`UPDATE appointments SET ${updates.join(', ')} WHERE id = ?`, params);

    if (data.name !== undefined || data.description !== undefined) {
      try {
        const rows = await db.query<AppointmentRow>('SELECT * FROM appointments WHERE id = ?', [
          id,
        ]);
        if (rows[0]) {
          const appointment = mapAppointmentRowToAppointment(rows[0]);
          const embedText = [appointment.name, appointment.description].filter(Boolean).join(' ');
          if (embedText.trim()) {
            await vectorService.addEmbedding(appointment.userId, 'appointment', id, embedText);
          }
        }
      } catch (e) {
        console.warn('Failed to update embedding for appointment', e);
      }
    }
  }

  async delete(id: string): Promise<void> {
    await db.execute('DELETE FROM appointments WHERE id = ?', [id]);
    try {
      await vectorService.delete('appointment', id);
    } catch (e) {
      console.warn('Failed to delete embedding for appointment', e);
    }
  }

  async deleteBySource(userId: string, source: string): Promise<void> {
    const rows = await db.query<{ id: string }>(
      'SELECT id FROM appointments WHERE user_id = ? AND source = ?',
      [userId, source]
    );
    for (const row of rows) {
      try {
        await vectorService.delete('appointment', row.id);
      } catch (e) {
        console.warn('Failed to delete embedding for appointment', e);
      }
    }
    await db.execute('DELETE FROM appointments WHERE user_id = ? AND source = ?', [userId, source]);
  }
}

export const appointmentRepository = new AppointmentRepository();
