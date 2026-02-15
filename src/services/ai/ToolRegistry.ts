import { getEmbedder } from './embedder';

// -----------------------------------------------------------------------------
// Tool Definitions (The "Instinct" Schema)
// -----------------------------------------------------------------------------

export interface ToolDefinition {
  name: string;
  description: string; // Verbose: for embeddings/routing (Instinct)
  shortDescription: string; // Concise: for LLM prompt (Context)
  parameters: Record<string, any>;
  embedding?: Float32Array; // Cached embedding
}

const AVAILABLE_TOOLS: ToolDefinition[] = [
  {
    name: 'create_task',
    description: "Create, add, or make a new task, to-do item, chore, assignment, or shopping list entry in the user's list (sometimes called tabs).",
    shortDescription: "Create a new task or to-do.",
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Title of the task' },
        effortMinutes: { type: 'number', description: 'Estimated effort in minutes' },
        deadline: { type: 'string', description: 'ISO date string for deadline (optional)' },
      },
      required: ['title'],
    },
  },
  {
    name: 'delete_task',
    description: 'Delete, remove, erase, or cancel a task, to-do, or chore by its unique identifier or ID.',
    shortDescription: 'Delete a task by ID.',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ID of the task to delete' },
      },
      required: ['id'],
    },
  },
  {
    name: 'get_tasks',
    description: 'Get, retrieve, fetch, list, or find active tasks, chores, and to-do items, optionally filtering by keyword or search term.',
    shortDescription: 'Fetch a list of active tasks.',
    parameters: {
      type: 'object',
      properties: {
        keyword: { type: 'string', description: 'Keyword to search for (optional)' },
      },
    },
  },
  {
    name: 'complete_task',
    description: 'Mark, check off, finish, or indicate a task, chore, or to-do as completed or done.',
    shortDescription: 'Mark a task as completed.',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ID of the task to complete' },
      },
      required: ['id'],
    },
  },
  {
    name: 'get_agenda',
    description: "Get, fetch, retrieve, or list all appointments, plans, schedules, and anchors for a specific date, today, or a particular time period.",
    shortDescription: "List agenda for a specific date.",
    parameters: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'ISO date string (YYYY-MM-DD)' },
      },
    },
  },
  {
    name: 'create_appointment',
    description: 'Create, schedule, book, or set a new calendar appointment, meeting, event, or engagement.',
    shortDescription: 'Create a new calendar appointment.',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name of the appointment' },
        description: { type: 'string', description: 'Optional description' },
        startTime: { type: 'string', description: 'ISO date-time string' },
        endTime: { type: 'string', description: 'ISO date-time string' },
      },
      required: ['name', 'startTime', 'endTime'],
    },
  },
  {
    name: 'move_appointment',
    description: 'Reschedule, move, postpone, adjust, or change the time of an existing appointment, meeting, or event.',
    shortDescription: 'Reschedule an existing appointment.',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ID of the appointment' },
        startTime: { type: 'string', description: 'New ISO start time' },
        endTime: { type: 'string', description: 'New ISO end time' },
      },
      required: ['id', 'startTime', 'endTime'],
    },
  },
  {
    name: 'cancel_appointment',
    description: 'Delete, cancel, remove, or erase a calendar appointment, meeting, or event.',
    shortDescription: 'Delete a calendar appointment.',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ID of the appointment to delete' },
      },
      required: ['id'],
    },
  },
  {
    name: 'get_habits',
    description: 'Get, retrieve, list, fetch, or find user habits, routines, and recurring practices.',
    shortDescription: 'List user habits.',
    parameters: {
      type: 'object',
      properties: {
        activeOnly: { type: 'boolean', description: 'Whether to filter only active habits' },
      },
    },
  },
  {
    name: 'add_habit',
    description: 'Create, add, make, or establish a new habit template, routine, or recurring activity.',
    shortDescription: 'Create a new habit template.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Name of the habit' },
        weeklyGoalMinutes: { type: 'number', description: 'Target minutes per week' },
        minimumSessionMinutes: { type: 'number', description: 'Minimum session length' },
        notes: { type: 'string', description: 'Optional notes' },
      },
      required: ['title', 'weeklyGoalMinutes'],
    },
  },
  {
    name: 'track_habit',
    description: 'Log, record, track, or note the completion of a habit session, routine, or activity.',
    shortDescription: 'Log completion of a habit session.',
    parameters: {
      type: 'object',
      properties: {
        habitId: { type: 'string', description: 'ID of the habit' },
        durationMinutes: { type: 'number', description: 'Actual duration in minutes' },
        date: { type: 'string', description: 'ISO date string (defaults to now)' },
      },
      required: ['habitId', 'durationMinutes'],
    },
  },
  {
    name: 'delete_habit',
    description: 'Delete, remove, or erase a habit template or routine.',
    shortDescription: 'Delete a habit template.',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ID of the habit to delete' },
      },
      required: ['id'],
    },
  },
  {
    name: 'get_projects',
    description: 'List, fetch, retrieve, or find user projects, groups, or collections of tasks.',
    shortDescription: 'List user projects.',
    parameters: {
      type: 'object',
      properties: {
        completed: { type: 'boolean', description: 'Filter by completion status' },
      },
    },
  },
  {
    name: 'create_project',
    description: 'Create, add, make, or establish a new project group, collection, or container for tasks.',
    shortDescription: 'Create a new project group.',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Project title' },
        deadline: { type: 'string', description: 'ISO date string' },
        notes: { type: 'string', description: 'Optional project notes' },
      },
      required: ['title'],
    },
  },
  {
    name: 'delete_project',
    description: 'Delete, remove, or erase a project and its associated task groupings.',
    shortDescription: 'Delete a project.',
    parameters: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'ID of the project to delete' },
      },
      required: ['id'],
    },
  },
  {
    name: 'search_memory',
    description: 'Search, find, look up, or retrieve information from journals, notes, tasks, and memories using semantic search.',
    shortDescription: 'Semantic search through memories.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Natural language search query' },
      },
      required: ['query'],
    },
  },
  {
    name: 'add_journal_entry',
    description: 'Write, create, add, or log a new journal entry, note, thought, or diary reflection.',
    shortDescription: 'Write a new journal entry.',
    parameters: {
      type: 'object',
      properties: {
        content: { type: 'string', description: 'Main text of the journal' },
        date: { type: 'string', description: 'ISO date string' },
      },
      required: ['content'],
    },
  },
  {
    name: 'get_status',
    description: 'Get, retrieve, fetch, or find current system status, Wu Xing phase, current time, date, and state.',
    shortDescription: 'Get current system status and time.',
    parameters: {
      type: 'object',
      properties: {},
    },
  },
];

// -----------------------------------------------------------------------------
// Tool Routing (The "Instinct")
// -----------------------------------------------------------------------------

const ROUTING_THRESHOLD = 0.3;
const MAX_ROUTED_TOOLS = 5;

/**
 * Route a user prompt to the most relevant tools via cosine similarity.
 */
export async function routeTools(userPrompt: string): Promise<ToolDefinition[]> {
  const embedder = getEmbedder();
  const promptVector = await embedder.embed(userPrompt);

  const scores = await Promise.all(
    AVAILABLE_TOOLS.map(async tool => {
      if (!tool.embedding) {
        tool.embedding = await embedder.embed(tool.description + ' ' + tool.name);
      }

      let dot = 0;
      let normA = 0;
      let normB = 0;
      for (let i = 0; i < promptVector.length; i++) {
        dot += promptVector[i]! * tool.embedding[i]!;
        normA += promptVector[i]! * promptVector[i]!;
        normB += tool.embedding[i]! * tool.embedding[i]!;
      }
      const sim = dot / (Math.sqrt(normA) * Math.sqrt(normB));

      return { tool, score: sim };
    })
  );

  return scores
    .filter(s => s.score > ROUTING_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_ROUTED_TOOLS)
    .map(s => s.tool);
}

/** Expose the tools array for testing and external use. */
export { AVAILABLE_TOOLS };

