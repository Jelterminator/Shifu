export interface Migration {
  version: number;
  sql: string;
}

export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    sql: `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT,
      email TEXT,
      timezone TEXT NOT NULL DEFAULT 'UTC',
      latitude REAL,
      longitude REAL,
      sleep_start TEXT,
      sleep_end TEXT,
      work_start TEXT,
      work_end TEXT,
      spiritual_practices TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX idx_users_email ON users(email);
    `,
  },
  {
    version: 2,
    sql: `
    -- Habits table
    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      minimum_session_minutes INTEGER NOT NULL DEFAULT 15,
      weekly_goal_minutes INTEGER NOT NULL DEFAULT 60,
      selected_days TEXT NOT NULL DEFAULT '{"monday":true,"tuesday":true,"wednesday":true,"thursday":true,"friday":true,"saturday":false,"sunday":false}',
      selected_keywords TEXT NOT NULL DEFAULT '[]',
      ideal_phase TEXT CHECK (ideal_phase IN ('WOOD', 'FIRE', 'EARTH', 'METAL', 'WATER')),
      notes TEXT,
      is_active INTEGER NOT NULL DEFAULT 1,
      linked_object_ids TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX idx_habits_user_active ON habits(user_id, is_active);
    `,
  },
  {
    version: 3,
    sql: `
    -- Projects table (must come before tasks for FK)
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      deadline TEXT,
      notes TEXT,
      is_completed INTEGER NOT NULL DEFAULT 0,
      linked_object_ids TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT
    );
    CREATE INDEX idx_projects_user_active ON projects(user_id, is_completed);
    `,
  },
  {
    version: 4,
    sql: `
    -- Tasks table
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      effort_minutes INTEGER NOT NULL DEFAULT 30,
      deadline TEXT,
      project_id TEXT REFERENCES projects(id) ON DELETE SET NULL,
      notes TEXT,
      position_in_project INTEGER,
      selected_keywords TEXT NOT NULL DEFAULT '[]',
      is_completed INTEGER NOT NULL DEFAULT 0,
      linked_object_ids TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT
    );
    CREATE INDEX idx_tasks_user_incomplete ON tasks(user_id, is_completed) WHERE is_completed = 0;
    CREATE INDEX idx_tasks_project ON tasks(project_id);
    CREATE INDEX idx_tasks_deadline ON tasks(deadline) WHERE deadline IS NOT NULL;
    `,
  },
  {
    version: 5,
    sql: `
    -- Journal entries
    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      entry_date TEXT NOT NULL,
      content TEXT,
      linked_object_ids TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX idx_journal_user_date ON journal_entries(user_id, entry_date);

    -- Journal segments (for time-keyed entries)
    CREATE TABLE IF NOT EXISTS journal_segments (
      id TEXT PRIMARY KEY NOT NULL,
      journal_entry_id TEXT NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
      time_key TEXT NOT NULL,
      content TEXT NOT NULL
    );
    CREATE INDEX idx_journal_segments_entry ON journal_segments(journal_entry_id);
    `,
  },
  {
    version: 6,
    sql: `
    -- Appointments (fixed calendar events)
    CREATE TABLE IF NOT EXISTS appointments (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      external_id TEXT,
      source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'google', 'apple')),
      linked_object_ids TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX idx_appointments_user_date ON appointments(user_id, date(start_time));
    CREATE INDEX idx_appointments_external ON appointments(external_id);
    `,
  },
  {
    version: 7,
    sql: `
    -- Plans (AI-generated schedule entries - APPEND-ONLY)
    CREATE TABLE IF NOT EXISTS plans (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      done INTEGER,
      source_id TEXT,
      source_type TEXT CHECK (source_type IN ('habit', 'task')),
      rating INTEGER CHECK (rating BETWEEN 1 AND 5),
      linked_object_ids TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT
    );
    CREATE INDEX idx_plans_user_date ON plans(user_id, date(start_time));
    CREATE INDEX idx_plans_source ON plans(source_id, source_type);
    CREATE INDEX idx_plans_training ON plans(user_id, done, rating) WHERE done IS NOT NULL;
    `,
  },
  {
    version: 8,
    sql: `
    -- Anchors (spiritual practice instances)
    CREATE TABLE IF NOT EXISTS anchors (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      description TEXT,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      date_str TEXT NOT NULL,
      practice_id TEXT,
      linked_object_ids TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX idx_anchors_user_date ON anchors(user_id, date_str);
    CREATE INDEX idx_anchors_practice ON anchors(practice_id);
    `,
  },
  {
    version: 9,
    sql: `
    -- Add keywords to projects
    ALTER TABLE projects ADD COLUMN selected_keywords TEXT NOT NULL DEFAULT '[]';
    `,
  },
  {
    version: 10,
    sql: `
    -- Vector Embeddings for RAG
    CREATE TABLE IF NOT EXISTS vector_embeddings (
      id TEXT PRIMARY KEY NOT NULL,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      entity_type TEXT NOT NULL,
      entity_id TEXT NOT NULL,
      vector BLOB NOT NULL,
      dimensions INTEGER NOT NULL,
      cluster_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(entity_type, entity_id)
    );
    CREATE INDEX idx_vectors_entity ON vector_embeddings(entity_type, entity_id);
    CREATE INDEX idx_vectors_cluster ON vector_embeddings(cluster_id);
    CREATE INDEX idx_vectors_user ON vector_embeddings(user_id);
    `,
  },
  {
    version: 11,
    sql: `
    -- Vector Clusters for ANN Index
    CREATE TABLE IF NOT EXISTS vector_clusters (
      id INTEGER PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      centroid BLOB NOT NULL,
      dimensions INTEGER NOT NULL,
      member_count INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX idx_clusters_user ON vector_clusters(user_id);
    `,
  },
];
