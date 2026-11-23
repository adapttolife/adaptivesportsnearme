CREATE TABLE IF NOT EXISTS program_discovery_pairs (
  sport_key TEXT NOT NULL REFERENCES sports(sport_key),
  area_kind TEXT NOT NULL CHECK (area_kind IN ('county', 'city', 'state')),
  area_id TEXT NOT NULL,
  area_name TEXT NOT NULL,
  state TEXT,
  county TEXT,
  city TEXT,
  lock_token TEXT,
  locked_at TEXT,
  lock_expires_at TEXT,
  last_scraped_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (sport_key, area_kind, area_id)
);

CREATE INDEX IF NOT EXISTS program_discovery_pairs_available_idx
  ON program_discovery_pairs (area_kind, lock_expires_at, last_scraped_at);

CREATE TABLE IF NOT EXISTS organization_program_discovery (
  organization_id TEXT PRIMARY KEY REFERENCES organizations(id),
  lock_token TEXT,
  locked_at TEXT,
  lock_expires_at TEXT,
  last_scraped_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS organization_program_discovery_available_idx
  ON organization_program_discovery (lock_expires_at, last_scraped_at);
