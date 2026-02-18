import { appointmentRepository } from '../../db/repositories/AppointmentRepository';
import { habitRepository } from '../../db/repositories/HabitRepository';
import { journalRepository } from '../../db/repositories/JournalRepository';
import { planRepository } from '../../db/repositories/PlanRepository';
import { projectRepository } from '../../db/repositories/ProjectRepository';
import { taskRepository } from '../../db/repositories/TaskRepository';
import { vectorStorage } from '../../db/vectorStorage';
import { type PlanStep } from '../../utils/aiUtils';
import { anchorsService } from '../data/Anchors';
import { phaseManager } from '../data/PhaseManager';
import { getEmbedder } from './embedder';

// -----------------------------------------------------------------------------
// Tool Execution (The "Body")
// -----------------------------------------------------------------------------

/**
 * Execute an array of parsed tool-call steps against native repositories.
 * Returns an array of human-readable result strings.
 */
export async function executeTools(steps: PlanStep[], userId: string): Promise<string[]> {
  const results: string[] = [];

  for (const step of steps) {
    const { tool, args } = step;
    let output = '';

    try {
      switch (tool) {
        case 'create_task': {
          const newTask = await taskRepository.create(userId, {
            title: args['title'] as string,
            effortMinutes: (args['effortMinutes'] as number) || 30,
            deadline: args['deadline'] ? new Date(args['deadline'] as string) : undefined,
            selectedKeywords: [],
          });
          output = `Created task: ${newTask.title} (ID: ${newTask.id})`;
          break;
        }

        case 'delete_task':
          await taskRepository.delete(args['id'] as string);
          output = `Deleted task ${args['id'] as string}`;
          break;

        case 'get_tasks': {
          const tasks = args['keyword']
            ? await taskRepository.getTasksByKeyword(userId, args['keyword'] as string)
            : await taskRepository.getAllForUser(userId);
          output =
            `Found ${tasks.length} tasks: ` + tasks.map(t => `${t.id}: ${t.title}`).join(', ');
          break;
        }

        case 'complete_task':
          await taskRepository.update(args['id'] as string, { isCompleted: true });
          output = `Completed task ${args['id'] as string}`;
          break;

        case 'get_agenda': {
          const date = args['date'] ? new Date(args['date'] as string) : new Date();
          const [apts, plans, anchors] = await Promise.all([
            appointmentRepository.getForDate(userId, date),
            planRepository.getForDateRange(userId, date, date),
            anchorsService.getAnchorsForDate(date),
          ]);
          output = `Agenda for ${date.toDateString()}:\n`;
          output += `Appointments: ${apts.map(a => `${a.name} (${a.startTime.toLocaleTimeString()})`).join(', ') || 'None'}\n`;
          output += `Plans: ${plans.map(p => `${p.name} (${p.startTime.toLocaleTimeString()})`).join(', ') || 'None'}\n`;
          output += `Anchors: ${anchors.map(a => `${a.title} (${a.startTime.toLocaleTimeString()})`).join(', ') || 'None'}`;
          break;
        }

        case 'create_appointment': {
          const apt = await appointmentRepository.create(userId, {
            name: args['name'] as string,
            description: args['description'] as string,
            startTime: new Date(args['startTime'] as string),
            endTime: new Date(args['endTime'] as string),
            source: 'manual',
          });
          output = `Created appointment: ${apt.name} (ID: ${apt.id})`;
          break;
        }

        case 'move_appointment':
          await appointmentRepository.update(args['id'] as string, {
            startTime: new Date(args['startTime'] as string),
            endTime: new Date(args['endTime'] as string),
          });
          output = `Moved appointment ${args['id'] as string}`;
          break;

        case 'cancel_appointment':
          await appointmentRepository.delete(args['id'] as string);
          output = `Cancelled appointment ${args['id'] as string}`;
          break;

        case 'get_habits': {
          const habits = await habitRepository.getAllForUser(
            userId,
            (args['activeOnly'] as boolean) ?? true
          );
          output = `Found ${habits.length} habits: ${habits.map(h => `${h.id}: ${h.title}`).join(', ')}`;
          break;
        }

        case 'add_habit': {
          const h = await habitRepository.create(userId, {
            title: args['title'] as string,
            weeklyGoalMinutes: args['weeklyGoalMinutes'] as number,
            minimumSessionMinutes: (args['minimumSessionMinutes'] as number) || 15,
            notes: args['notes'] as string,
            selectedDays: {
              monday: true,
              tuesday: true,
              wednesday: true,
              thursday: true,
              friday: true,
              saturday: true,
              sunday: true,
            },
            selectedKeywords: [],
            isActive: true,
            linkedObjectIds: [],
          });
          output = `Added habit: ${h.title} (ID: ${h.id})`;
          break;
        }

        case 'delete_habit':
          await habitRepository.delete(args['id'] as string);
          output = `Deleted habit ${args['id'] as string}`;
          break;

        case 'track_habit': {
          const date = args['date'] ? new Date(args['date'] as string) : new Date();
          await habitRepository.trackCompletion(
            userId,
            args['habitId'] as string,
            date,
            args['durationMinutes'] as number
          );
          output = `Tracked habit ${args['habitId'] as string} for ${args['durationMinutes'] as number} minutes.`;
          break;
        }

        case 'get_projects': {
          const projects = await projectRepository.getAllForUser(
            userId,
            (args['completed'] as boolean) ?? false
          );
          output = `Found ${projects.length} projects: ${projects.map(p => `${p.id}: ${p.title}`).join(', ')}`;
          break;
        }

        case 'create_project': {
          const p = await projectRepository.create(userId, {
            title: args['title'] as string,
            deadline: args['deadline'] ? new Date(args['deadline'] as string) : undefined,
            notes: args['notes'] as string,
            selectedKeywords: [],
          });
          output = `Created project: ${p.title} (ID: ${p.id})`;
          break;
        }

        case 'delete_project':
          await projectRepository.delete(args['id'] as string);
          output = `Deleted project ${args['id'] as string}`;
          break;

        case 'search_memory': {
          const embedder = getEmbedder();
          const queryVector = await embedder.embed(args['query'] as string);
          const memoryResults = await vectorStorage.query(userId, queryVector, 5);
          output =
            `Found ${memoryResults.length} relevant items in memory: ` +
            memoryResults
              .map(m => `[${m.entityType}] ${m.entityId} (Score: ${m.similarity.toFixed(2)})`)
              .join(', ');
          break;
        }

        case 'add_journal_entry': {
          const entry = await journalRepository.create(userId, {
            entryDate: args['date'] ? new Date(args['date'] as string) : new Date(),
            content: args['content'] as string,
          });
          output = `Added journal entry (ID: ${entry.id})`;
          break;
        }

        case 'get_status': {
          const phase = phaseManager.getCurrentPhase();
          output = `Current Phase: ${phase.name} (${phase.qualities})\nTime: ${new Date().toISOString()}`;
          break;
        }

        default:
          output = `Error: Tool ${tool} not found.`;
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      output = `Error executing ${tool}: ${message}`;
    }

    results.push(output);
  }

  return results;
}
