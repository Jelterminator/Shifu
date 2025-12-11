import type {
  Appointment,
  AppointmentRow,
  Habit,
  HabitRow,
  JournalEntry,
  JournalEntryRow,
  Plan,
  PlanRow,
  Project,
  ProjectRow,
  Task,
  TaskRow,
} from '../types/database';

/**
 * Generic JSON parser with safe fallback
 */
export function safeParse<T>(json: string | null, fallback: T): T {
  if (!json) return fallback;
  try {
    return JSON.parse(json) as T;
  } catch (e) {
    console.warn('Failed to parse JSON:', json, e);
    return fallback;
  }
}

/**
 * Generic JSON stringifier
 */
export function safeStringify<T>(data: T): string {
  try {
    return JSON.stringify(data);
  } catch (e) {
    console.warn('Failed to stringify data:', data, e);
    return '[]';
  }
}

/**
 * Convert SQLite boolean (0/1) to boolean
 */
export function toBool(val: number): boolean {
  return val === 1;
}

/**
 * Convert boolean to SQLite boolean (0/1)
 */
export function toInt(val: boolean): number {
  return val ? 1 : 0;
}

// --- Mappers ---

export function mapHabitRowToHabit(row: HabitRow): Habit {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    minimumSessionMinutes: row.minimum_session_minutes,
    weeklyGoalMinutes: row.weekly_goal_minutes,
    selectedDays: safeParse(row.selected_days, {
      monday: false,
      tuesday: false,
      wednesday: false,
      thursday: false,
      friday: false,
      saturday: false,
      sunday: false,
    }),
    selectedKeywords: safeParse(row.selected_keywords, []),
    idealPhase: row.ideal_phase || undefined,
    notes: row.notes || undefined,
    isActive: toBool(row.is_active),
    linkedObjectIds: safeParse(row.linked_object_ids, []),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function mapHabitToRow(habit: Habit): HabitRow {
  return {
    id: habit.id,
    user_id: habit.userId,
    title: habit.title,
    minimum_session_minutes: habit.minimumSessionMinutes,
    weekly_goal_minutes: habit.weeklyGoalMinutes,
    selected_days: safeStringify(habit.selectedDays),
    selected_keywords: safeStringify(habit.selectedKeywords),
    ideal_phase: habit.idealPhase || null,
    notes: habit.notes || null,
    is_active: toInt(habit.isActive),
    linked_object_ids: safeStringify(habit.linkedObjectIds),
    created_at: habit.createdAt.toISOString(),
    updated_at: habit.updatedAt.toISOString(),
  };
}

/**
 * Calculate urgency metrics based on deadline and effort.
 */
export function determineUrgency(
  deadline?: Date,
  effortMinutes: number = 30
): {
  daysUntilDeadline: number | undefined;
  minutesPerDay: number | undefined;
  urgencyLevel: Task['urgencyLevel'];
} {
  if (!deadline) {
    return {
      daysUntilDeadline: undefined,
      minutesPerDay: undefined,
      urgencyLevel: 'CHORE',
    };
  }

  const now = new Date();
  // Calculate difference in days (ceil to include today as 1 day)
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.max(0.1, Math.ceil(diffTime / (1000 * 60 * 60 * 24))); // Avoid division by zero, min 0.1

  const minutesPerDay = effortMinutes / diffDays;

  let urgencyLevel: Task['urgencyLevel'] = 'T6';
  if (minutesPerDay >= 360) urgencyLevel = 'T1';
  else if (minutesPerDay >= 240) urgencyLevel = 'T2';
  else if (minutesPerDay >= 120) urgencyLevel = 'T3';
  else if (minutesPerDay >= 60) urgencyLevel = 'T4';
  else if (minutesPerDay >= 30) urgencyLevel = 'T5';
  else urgencyLevel = 'T6';

  return {
    daysUntilDeadline: diffDays,
    minutesPerDay,
    urgencyLevel,
  };
}

export function mapTaskRowToTask(row: TaskRow): Task {
  const deadline = row.deadline ? new Date(row.deadline) : undefined;
  const { daysUntilDeadline, minutesPerDay, urgencyLevel } = determineUrgency(
    deadline,
    row.effort_minutes
  );

  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    effortMinutes: row.effort_minutes,
    deadline,
    projectId: row.project_id || undefined,
    notes: row.notes || undefined,
    positionInProject: row.position_in_project || undefined,
    selectedKeywords: safeParse(row.selected_keywords, []),
    isCompleted: toBool(row.is_completed),
    linkedObjectIds: safeParse(row.linked_object_ids, []),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,

    // Computed props
    daysUntilDeadline,
    minutesPerDay,
    urgencyLevel,
  };
}

export function mapTaskToRow(task: Task): TaskRow {
  return {
    id: task.id,
    user_id: task.userId,
    title: task.title,
    effort_minutes: task.effortMinutes,
    deadline: task.deadline ? task.deadline.toISOString() : null,
    project_id: task.projectId || null,
    notes: task.notes || null,
    position_in_project: task.positionInProject || null,
    selected_keywords: safeStringify(task.selectedKeywords),
    is_completed: toInt(task.isCompleted),
    linked_object_ids: safeStringify(task.linkedObjectIds),
    created_at: task.createdAt.toISOString(),
    updated_at: task.updatedAt.toISOString(),
    completed_at: task.completedAt ? task.completedAt.toISOString() : null,
  };
}

export function mapProjectRowToProject(row: ProjectRow): Project {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    deadline: row.deadline ? new Date(row.deadline) : undefined,
    notes: row.notes || undefined,
    isCompleted: toBool(row.is_completed),
    selectedKeywords: safeParse(row.selected_keywords, []),
    linkedObjectIds: safeParse(row.linked_object_ids, []),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
  };
}

export function mapProjectToRow(project: Project): ProjectRow {
  return {
    id: project.id,
    user_id: project.userId,
    title: project.title,
    deadline: project.deadline ? project.deadline.toISOString() : null,
    notes: project.notes || null,
    is_completed: toInt(project.isCompleted),
    selected_keywords: safeStringify(project.selectedKeywords),
    linked_object_ids: safeStringify(project.linkedObjectIds),
    created_at: project.createdAt.toISOString(),
    updated_at: project.updatedAt.toISOString(),
    completed_at: project.completedAt ? project.completedAt.toISOString() : null,
  };
}

export function mapJournalEntryRowToJournalEntry(row: JournalEntryRow): JournalEntry {
  return {
    id: row.id,
    userId: row.user_id,
    entryDate: new Date(row.entry_date),
    content: row.content || undefined,
    linkedObjectIds: safeParse(row.linked_object_ids, []),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function mapJournalEntryToRow(entry: JournalEntry): JournalEntryRow {
  return {
    id: entry.id,
    user_id: entry.userId,
    entry_date: entry.entryDate.toISOString(),
    content: entry.content || null,
    linked_object_ids: safeStringify(entry.linkedObjectIds),
    created_at: entry.createdAt.toISOString(),
    updated_at: entry.updatedAt.toISOString(),
  };
}

export function mapAppointmentRowToAppointment(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description || undefined,
    startTime: new Date(row.start_time),
    endTime: new Date(row.end_time),
    externalId: row.external_id || undefined,
    source: row.source,
    linkedObjectIds: safeParse(row.linked_object_ids, []),
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function mapAppointmentToRow(appointment: Appointment): AppointmentRow {
  return {
    id: appointment.id,
    user_id: appointment.userId,
    name: appointment.name,
    description: appointment.description || null,
    start_time: appointment.startTime.toISOString(),
    end_time: appointment.endTime.toISOString(),
    external_id: appointment.externalId || null,
    source: appointment.source,
    linked_object_ids: safeStringify(appointment.linkedObjectIds),
    created_at: appointment.createdAt.toISOString(),
    updated_at: appointment.updatedAt.toISOString(),
  };
}

export function mapPlanRowToPlan(row: PlanRow): Plan {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    description: row.description || undefined,
    startTime: new Date(row.start_time),
    endTime: new Date(row.end_time),
    done: row.done === null ? null : toBool(row.done),
    sourceId: row.source_id || undefined,
    sourceType: row.source_type || undefined,
    rating: row.rating || undefined,
    linkedObjectIds: safeParse(row.linked_object_ids, []),
    createdAt: new Date(row.created_at),
    completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
  };
}

export function mapPlanToRow(plan: Plan): PlanRow {
  return {
    id: plan.id,
    user_id: plan.userId,
    name: plan.name,
    description: plan.description || null,
    start_time: plan.startTime.toISOString(),
    end_time: plan.endTime.toISOString(),
    done: plan.done === null ? null : toInt(plan.done as boolean),
    source_id: plan.sourceId || null,
    source_type: plan.sourceType || null,
    rating: plan.rating || null,
    linked_object_ids: safeStringify(plan.linkedObjectIds),
    created_at: plan.createdAt.toISOString(),
    updated_at: plan.createdAt.toISOString(), // Plans are append-only mostly, but row needs it 
    completed_at: plan.completedAt ? plan.completedAt.toISOString() : null,
  };
}
