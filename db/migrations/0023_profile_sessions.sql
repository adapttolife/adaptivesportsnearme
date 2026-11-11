CREATE TABLE IF NOT EXISTS profile_sessions (
  id TEXT PRIMARY KEY,
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS profile_sessions_profile_idx
  ON profile_sessions(profile_id, expires_at);
