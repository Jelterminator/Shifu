import { appointmentRepository } from '../../db/repositories/AppointmentRepository';
import { habitRepository } from '../../db/repositories/HabitRepository';
import { journalRepository } from '../../db/repositories/JournalRepository';
import { planRepository } from '../../db/repositories/PlanRepository';
import { projectRepository } from '../../db/repositories/ProjectRepository';
import { taskRepository } from '../../db/repositories/TaskRepository';
import { vectorStorage } from '../../db/vectorStorage';
import { anchorsService } from '../data/Anchors';
import { phaseManager } from '../PhaseManager';
import { getEmbedder } from './embedder';

// -----------------------------------------------------------------------------
// Tool Execution (The "Body")
// -----------------------------------------------------------------------------

/**
 * Execute an array of parsed tool-call steps against native repositories.
 * Returns an array of human-readable result strings.
 */
export async function executeTools(
  steps: Array<{ tool: string; args: any }>,
  userId: string
): Promise<string[]> {
  const results: string[] = [];

  for (const step of steps) {
    const { tool, args } = step;
    let output = '';

    try {
      switch (tool) {
        case 'create_task': {
          const newTask = await taskRepository.create(userId, {
            title: args.title,
            effortMinutes: args.effortMinutes || 30,
            deadline: args.deadline ? new Date(args.deadline) : undefined,
            selectedKeywords: [],
          });
          output = `Created task: ${newTask.title} (ID: ${newTask.id})`;
          break;
        }

        case 'delete_task':
          await taskRepository.delete(args.id);
          output = `Deleted task ${args.id}`;
          break;

        case 'get_tasks': {
          const tasks = args.keyword
            ? await taskRepository.getTasksByKeyword(userId, args.keyword)
            : await taskRepository.getAllForUser(userId);
          output =
            `Found ${tasks.length} tasks: ` + tasks.map(t => `${t.id}: ${t.title}`).join(', ');
          break;
        }

        case 'complete_task':
          await taskRepository.update(args.id, { isCompleted: true });
          output = `Completed task ${args.id}`;
          break;

        case 'get_agenda': {
          const date = args.date ? new Date(args.date) : new Date();
          const [apts, plans, anchors] = await Promise.all([
            appointmentRepository.getForDate(userId, date),
            planRepository.getForDateRange(userId, date, date),
            anchorsService.getAnchorsForDate(date),
          ]);
          output = `Agenda for ${date.toDateString()}:\n`;
          output += `Appointments: ${apts.map((a: any) => `${a.name} (${a.startTime.toLocaleTimeString()})`).join(', ') || 'None'}\n`;
          output += `Plans: ${plans.map((p: any) => `${p.name} (${p.startTime.toLocaleTimeString()})`).join(', ') || 'None'}\n`;
          output += `Anchors: ${anchors.map((a: any) => `${a.title} (${a.startTime.toLocaleTimeString()})`).join(', ') || 'None'}`;
          break;
        }

        case 'create_appointment': {
          const apt = await appointmentRepository.create(userId, {
            name: args.name,
            description: args.description,
            startTime: new Date(args.startTime),
            endTime: new Date(args.endTime),
            source: 'manual',
          });
          output = `Created appointment: ${apt.name} (ID: ${apt.id})`;
          break;
        }

        case 'move_appointment':
          await appointmentRepository.update(args.id, {
            startTime: new Date(args.startTime),
            endTime: new Date(args.endTime),
          });
          output = `Moved appointment ${args.id}`;
          break;

        case 'cancel_appointment':
          await appointmentRepository.delete(args.id);
          output = `Cancelled appointment ${args.id}`;
          break;

        case 'get_habits': {
          const habits = await habitRepository.getAllForUser(userId, args.activeOnly ?? true);
          output = `Found ${habits.length} habits: ${habits.map((h: any) => `${h.id}: ${h.title}`).join(', ')}`;
          break;
        }

        case 'add_habit': {
          const h = await habitRepository.create(userId, {
            title: args.title,
            weeklyGoalMinutes: args.weeklyGoalMinutes,
            minimumSessionMinutes: args.minimumSessionMinutes || 15,
            notes: args.notes,
            selectedDays: {
              monday: true, tuesday: true, wednesday: true, thursday: true,
              friday: true, saturday: true, sunday: true,
            },
            selectedKeywords: [],
            isActive: true,
            linkedObjectIds: [],
          });
          output = `Added habit: ${h.title} (ID: ${h.id})`;
          break;
        }

        case 'delete_habit':
          await habitRepository.delete(args.id);
          output = `Deleted habit ${args.id}`;
          break;

        case 'track_habit': {
          const date = args.date ? new Date(args.date) : new Date();
          await habitRepository.trackCompletion(userId, args.habitId, date, args.durationMinutes);
          output = `Tracked habit ${args.habitId} for ${args.durationMinutes} minutes.`;
          break;
        }

        case 'get_projects': {
          const projects = await projectRepository.getAllForUser(userId, args.completed ?? false);
          output = `Found ${projects.length} projects: ${projects.map((p: any) => `${p.id}: ${p.title}`).join(', ')}`;
          break;
        }

        case 'create_project': {
          const p = await projectRepository.create(userId, {
            title: args.title,
            deadline: args.deadline ? new Date(args.deadline) : undefined,
            notes: args.notes,
            selectedKeywords: [],
          });
          output = `Created project: ${p.title} (ID: ${p.id})`;
          break;
        }

        case 'delete_project':
          await projectRepository.delete(args.id);
          output = `Deleted project ${args.id}`;
          break;

        case 'search_memory': {
          const embedder = getEmbedder();
          const queryVector = await embedder.embed(args.query);
          const memoryResults = await vectorStorage.query(userId, queryVector, 5);
          output = `Found ${memoryResults.length} relevant items in memory: ` +
            memoryResults.map((m: any) => `[${m.entityType}] ${m.entityId} (Score: ${m.similarity.toFixed(2)})`).join(', ');
          break;
        }

        case 'add_journal_entry': {
          const entry = await journalRepository.create(userId, {
            entryDate: args.date ? new Date(args.date) : new Date(),
            content: args.content,
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
    } catch (err: any) {
      output = `Error executing ${tool}: ${err.message}`;
    }

    results.push(output);
  }

  return results;
}
