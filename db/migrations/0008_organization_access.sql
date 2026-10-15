ALTER TABLE organizations ADD COLUMN claim_email TEXT;

CREATE INDEX IF NOT EXISTS organizations_claim_email_idx
  ON organizations (claim_email COLLATE NOCASE);

CREATE TABLE IF NOT EXISTS organization_login_tokens (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS organization_login_tokens_email_idx
  ON organization_login_tokens (email COLLATE NOCASE, expires_at);

CREATE TABLE IF NOT EXISTS organization_sessions (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS organization_sessions_email_idx
  ON organization_sessions (email COLLATE NOCASE, expires_at);
