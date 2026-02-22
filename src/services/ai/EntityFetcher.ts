import { db } from '../../db/database';
import {
  mapAppointmentRowToAppointment,
  mapHabitRowToHabit,
  mapJournalEntryRowToJournalEntry,
  mapPlanRowToPlan,
  mapProjectRowToProject,
  mapTaskRowToTask,
} from '../../db/mappers';
import type {
  AppointmentRow,
  HabitRow,
  JournalEntryRow,
  PlanRow,
  ProjectRow,
  TaskRow,
} from '../../types/database';
import type { LinkableEntityType } from '../../types/vectorTypes';

export interface RetrievedEntity {
  id: string;
  type: LinkableEntityType;
  text: string;
  linkedObjectIds: string[];
}

export class EntityFetcher {
  /**
   * Fetch the text representation and backlinks of an entity by its type and ID.
   */
  static async fetchEntity(type: LinkableEntityType, id: string): Promise<RetrievedEntity | null> {
    await db.initialize();

    switch (type) {
      case 'task': {
        const rows = await db.query<TaskRow>('SELECT * FROM tasks WHERE id = ?', [id]);
        if (rows.length === 0) return null;
        const task = mapTaskRowToTask(rows[0]!);
        return {
          id: task.id,
          type: 'task',
          text: `Task: ${task.title}\nStatus: ${task.isCompleted ? 'Done' : 'Pending'}\nNotes: ${
            task.notes || 'None'
          }`,
          linkedObjectIds: task.linkedObjectIds,
        };
      }
      case 'project': {
        const rows = await db.query<ProjectRow>('SELECT * FROM projects WHERE id = ?', [id]);
        if (rows.length === 0) return null;
        const project = mapProjectRowToProject(rows[0]!);
        return {
          id: project.id,
          type: 'project',
          text: `Project: ${project.title}\nStatus: ${
            project.isCompleted ? 'Done' : 'Active'
          }\nNotes: ${project.notes || 'None'}`,
          linkedObjectIds: project.linkedObjectIds,
        };
      }
      case 'journal_entry': {
        const rows = await db.query<JournalEntryRow>('SELECT * FROM journal_entries WHERE id = ?', [
          id,
        ]);
        if (rows.length === 0) return null;
        const journal = mapJournalEntryRowToJournalEntry(rows[0]!);
        return {
          id: journal.id,
          type: 'journal_entry',
          text: `Journal (${journal.entryDate.toISOString().split('T')[0]}):\n${
            journal.content || 'Empty block'
          }`,
          linkedObjectIds: journal.linkedObjectIds,
        };
      }
      case 'habit': {
        const rows = await db.query<HabitRow>('SELECT * FROM habits WHERE id = ?', [id]);
        if (rows.length === 0) return null;
        const habit = mapHabitRowToHabit(rows[0]!);
        return {
          id: habit.id,
          type: 'habit',
          text: `Habit: ${habit.title}\nGoal: ${habit.weeklyGoalMinutes} minutes/week\nNotes: ${
            habit.notes || 'None'
          }`,
          linkedObjectIds: habit.linkedObjectIds,
        };
      }
      case 'appointment': {
        const rows = await db.query<AppointmentRow>('SELECT * FROM appointments WHERE id = ?', [
          id,
        ]);
        if (rows.length === 0) return null;
        const appt = mapAppointmentRowToAppointment(rows[0]!);
        return {
          id: appt.id,
          type: 'appointment',
          text: `Appointment: ${
            appt.name
          }\nTime: ${appt.startTime.toISOString()} to ${appt.endTime.toISOString()}\nDetails: ${
            appt.description || 'None'
          }`,
          linkedObjectIds: appt.linkedObjectIds,
        };
      }
      case 'plan': {
        const rows = await db.query<PlanRow>('SELECT * FROM plans WHERE id = ?', [id]);
        if (rows.length === 0) return null;
        const plan = mapPlanRowToPlan(rows[0]!);
        return {
          id: plan.id,
          type: 'plan',
          text: `Plan: ${
            plan.name
          }\nTime: ${plan.startTime.toISOString()} to ${plan.endTime.toISOString()}\nDetails: ${
            plan.description || 'None'
          }`,
          linkedObjectIds: plan.linkedObjectIds,
        };
      }
      case 'insight':
      case 'note':
      case 'anchor':
        // Not heavily queried or lack full string representations in current MVP schema,
        // but returning fallback
        return {
          id,
          type,
          text: `[${type.toUpperCase()}] ID: ${id}`,
          linkedObjectIds: [], // Safest assumption
        };
      default:
        return null; // Unknown type
    }
  }

  /**
   * Because backlinks are stored purely as "UUIDs" without explicit table names,
   * we must dynamically look up the entity_type in the vector store index.
   */
  static async resolveEntityType(id: string): Promise<LinkableEntityType | null> {
    await db.initialize();
    type ResolveRow = { entity_type: string };

    const rows = await db.query<ResolveRow>(
      'SELECT entity_type FROM vector_embeddings WHERE entity_id = ? LIMIT 1',
      [id]
    );

    if (rows.length === 0) return null;
    return rows[0]!.entity_type as LinkableEntityType;
  }
}
