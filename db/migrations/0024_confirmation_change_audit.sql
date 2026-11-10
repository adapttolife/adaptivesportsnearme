CREATE TABLE IF NOT EXISTS organization_change_log (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  source_submission TEXT,
  field TEXT NOT NULL,
  previous_value TEXT NOT NULL,
  applied_value TEXT NOT NULL,
  actor TEXT NOT NULL,
  created_at TEXT NOT NULL,
  reverted_at TEXT,
  reverted_by TEXT
);

CREATE INDEX IF NOT EXISTS organization_change_log_org_idx
  ON organization_change_log (organization_id, created_at);
