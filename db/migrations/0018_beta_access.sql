CREATE TABLE IF NOT EXISTS beta_testers (
  email TEXT PRIMARY KEY COLLATE NOCASE,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS beta_login_tokens (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS beta_login_tokens_email_idx
  ON beta_login_tokens (email COLLATE NOCASE, expires_at);

CREATE TABLE IF NOT EXISTS beta_sessions (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS beta_sessions_email_idx
  ON beta_sessions (email COLLATE NOCASE, expires_at);
