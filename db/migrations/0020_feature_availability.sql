CREATE TABLE IF NOT EXISTS feature_toggles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE COLLATE NOCASE,
  audience_json TEXT NOT NULL DEFAULT '["everyone"]' CHECK (json_valid(audience_json)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

INSERT OR IGNORE INTO feature_toggles (id, name, audience_json, created_at, updated_at)
VALUES (
  'organization-dashboard',
  'Organization Dashboard',
  '["everyone"]',
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now'),
  strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
);
