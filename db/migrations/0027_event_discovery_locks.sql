CREATE TABLE IF NOT EXISTS event_discovery_pairs (
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
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (sport_key, area_kind, area_id)
);

CREATE INDEX IF NOT EXISTS event_discovery_pairs_available_idx
  ON event_discovery_pairs (area_kind, lock_expires_at, last_scraped_at);

CREATE TABLE IF NOT EXISTS event_entity_discovery (
  entity_type TEXT NOT NULL CHECK (entity_type IN ('organization', 'program')),
  entity_id TEXT NOT NULL,
  lock_token TEXT,
  locked_at TEXT,
  lock_expires_at TEXT,
  last_scraped_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS event_entity_discovery_available_idx
  ON event_entity_discovery (entity_type, lock_expires_at, last_scraped_at);
