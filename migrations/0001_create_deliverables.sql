CREATE TABLE IF NOT EXISTS deliverables (
  id TEXT PRIMARY KEY NOT NULL,
  payload TEXT NOT NULL CHECK (json_valid(payload)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS deliverables_updated_at_idx ON deliverables (updated_at);

CREATE TABLE IF NOT EXISTS workspace_metadata (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);
