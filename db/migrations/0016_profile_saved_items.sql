CREATE TABLE IF NOT EXISTS profile_login_tokens (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL COLLATE NOCASE,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS profile_login_tokens_expires_idx
  ON profile_login_tokens(expires_at);

CREATE TABLE IF NOT EXISTS profile_saved_items (
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_kind TEXT NOT NULL CHECK (item_kind IN ('organizations', 'programs', 'events', 'grants')),
  item_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (profile_id, item_kind, item_id)
);

CREATE INDEX IF NOT EXISTS profile_saved_items_profile_idx
  ON profile_saved_items(profile_id, created_at DESC);

INSERT OR IGNORE INTO profile_saved_items (profile_id, item_kind, item_id, created_at)
SELECT profile_id, 'organizations', org_id, created_at
FROM profile_favorites;
