import type { TaskKeyword } from './models';

// Base interface for all entities
export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

// Habits
export interface HabitRow extends BaseEntity {
  user_id: string;
  title: string;
  minimum_session_minutes: number;
  weekly_goal_minutes: number;
  selected_days: string; // JSON
  selected_keywords: string; // JSON array
  ideal_phase: 'WOOD' | 'FIRE' | 'EARTH' | 'METAL' | 'WATER' | null;
  notes: string | null;
  is_active: number; // SQLite boolean
  linked_object_ids: string | null; // JSON
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  minimumSessionMinutes: number;
  weeklyGoalMinutes: number;
  selectedDays: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  selectedKeywords: TaskKeyword[];
  idealPhase?: 'WOOD' | 'FIRE' | 'EARTH' | 'METAL' | 'WATER';
  notes?: string;
  isActive: boolean;
  linkedObjectIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Tasks
export type UrgencyLevel = 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6' | 'CHORE';

export interface TaskRow extends BaseEntity {
  user_id: string;
  title: string;
  effort_minutes: number;
  deadline: string | null;
  project_id: string | null;
  notes: string | null;
  position_in_project: number | null;
  selected_keywords: string; // JSON
  is_completed: number;
  linked_object_ids: string | null;
  completed_at: string | null;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  effortMinutes: number;
  deadline?: Date;
  projectId?: string;
  notes?: string;
  positionInProject?: number;
  selectedKeywords: TaskKeyword[];
  isCompleted: boolean;
  linkedObjectIds: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;

  // Computed properties
  daysUntilDeadline?: number;
  minutesPerDay?: number;
  urgencyLevel?: UrgencyLevel;
}

// Projects
export interface ProjectRow extends BaseEntity {
  user_id: string;
  title: string;
  deadline: string | null;
  notes: string | null;
  is_completed: number;
  selected_keywords: string; // JSON
  linked_object_ids: string | null;
  completed_at: string | null;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  deadline?: Date;
  notes?: string;
  isCompleted: boolean;
  selectedKeywords: TaskKeyword[];
  linkedObjectIds: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// Journal Entries
export interface JournalEntryRow extends BaseEntity {
  user_id: string;
  entry_date: string;
  content: string | null;
  linked_object_ids: string | null;
}

export interface JournalEntry {
  id: string;
  userId: string;
  entryDate: Date;
  content?: string;
  segments?: JournalSegment[];
  linkedObjectIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface JournalSegment {
  id: string;
  timeKey: string;
  content: string;
}

// Appointments
export type AppointmentSource = 'manual' | 'google' | 'apple' | 'microsoft' | 'device';

export interface AppointmentRow extends BaseEntity {
  user_id: string;
  name: string;
  description: string | null;
  start_time: string;
  end_time: string;
  external_id: string | null;
  source: AppointmentSource;
  linked_object_ids: string | null;
}

export interface Appointment {
  id: string;
  userId: string;
  name: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  externalId?: string;
  source: AppointmentSource;
  linkedObjectIds: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Plans
export interface PlanRow extends BaseEntity {
  user_id: string;
  name: string;
  description: string | null;
  start_time: string;
  end_time: string;
  done: number | null;
  source_id: string | null;
  source_type: 'habit' | 'task' | null;
  rating: number | null;
  linked_object_ids: string | null;
  completed_at: string | null;
}

export interface Plan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  done: boolean | null;
  sourceId?: string;
  sourceType?: 'habit' | 'task';
  rating?: number;
  linkedObjectIds: string[];
  createdAt: Date;
  completedAt?: Date;
}
