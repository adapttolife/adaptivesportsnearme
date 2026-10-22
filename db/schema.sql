-- Adaptive Sports Near Me: the schema of the live D1 database (asnm-db), read from it on 2026-10-22.
-- The live database is the source of truth. This file can fall behind it; regenerate it from asnm-db
-- (sqlite_master) rather than editing it by hand.

CREATE TABLE IF NOT EXISTS admin_login_tokens (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS data_sources (
  source_id            TEXT PRIMARY KEY,
  source_name          TEXT NOT NULL,
  source_organization  TEXT,
  source_url           TEXT,
  source_type          TEXT,
  coverage_scope       TEXT,
  data_quality_rating  TEXT,
  record_count         INTEGER,
  status               TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  org_id TEXT,
  sport_key TEXT REFERENCES sports(sport_key),
  venue TEXT,
  city TEXT,
  state TEXT,
  url TEXT,
  starts_at TEXT NOT NULL,
  ends_at TEXT,
  all_day INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','cancelled')),
  is_public INTEGER NOT NULL DEFAULT 1,
  source TEXT NOT NULL DEFAULT 'admin',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS grants (
  id                   TEXT PRIMARY KEY,          -- uuid, same as organizations.id
  name                 TEXT NOT NULL,
  source               TEXT,                      -- funder / org (Adapt To Life, CAF, …)
  type                 TEXT,                      -- equipment | training | program | general | quality_of_life
  audience             TEXT NOT NULL DEFAULT 'athlete'
                         CHECK (audience IN ('athlete','program')),
  amount_min_cents     INTEGER,                   -- RCOS; nullable when "Varies"
  amount_max_cents     INTEGER,
  amount_display       TEXT,                      -- "Up to $5,000" / "Varies" — list + fact row
  deadline_display     TEXT,                      -- "Rolling" / "Mar 1 / Sep 1" / "Spring / Fall"
  deadline_next        TEXT,                      -- optional ISO date for sort; null if rolling
  description          TEXT,
  eligibility_criteria TEXT,
  how_to_apply         TEXT,
  application_url      TEXT,
  source_url           TEXT,
  email                TEXT,
  phone                TEXT,
  sports_json          TEXT,                      -- JSON array of sport_key; empty = any / multi
  is_open              INTEGER NOT NULL DEFAULT 1,
  is_renewable         INTEGER NOT NULL DEFAULT 0,
  is_public            INTEGER NOT NULL DEFAULT 1,
  status               TEXT NOT NULL DEFAULT 'active',
  created_at           TEXT NOT NULL,
  updated_at           TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS lane_cursors (
  lane                 TEXT PRIMARY KEY,
  cursor               TEXT NOT NULL DEFAULT '',
  updated_at           TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS link_checks (
  check_id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id TEXT,
  url TEXT NOT NULL,
  ok INTEGER NOT NULL,
  http_status INTEGER,
  detail TEXT,
  lane TEXT NOT NULL DEFAULT 'validate',
  checked_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS organization_data_sources (
  organization_id      TEXT NOT NULL REFERENCES organizations(id),
  source_id            TEXT NOT NULL REFERENCES data_sources(source_id),
  source_record_url    TEXT,
  data_quality_rating  TEXT,
  retrieved_at         TEXT,
  verified             INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (organization_id, source_id)
);

CREATE TABLE IF NOT EXISTS organization_login_tokens (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS organization_sessions (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS organizations (
  id                   TEXT PRIMARY KEY,        -- uuid carried over from Postgres
  name                 TEXT NOT NULL,
  org_type             TEXT,
  sport                TEXT,                    -- derived primary sport label ("Wheelchair Basketball")
  sport_key            TEXT,                    -- icon/photo key when it matches the site's sport set, else NULL
  sports_json          TEXT,                    -- JSON array; future multi-sport support
  website_url          TEXT,
  email                TEXT,
  phone                TEXT,
  city                 TEXT,
  state                TEXT,                    -- USPS 2-letter code
  state_name           TEXT,                    -- display name
  zip                  TEXT,
  country              TEXT DEFAULT 'United States',
  lat                  REAL,
  lng                  REAL,
  geo_precision        TEXT,                    -- 'address' | 'zip' | 'city' | 'state' | NULL
  description          TEXT,
  cost_note            TEXT,
  equipment_provided   INTEGER,                 -- boolean 0/1, NULL = unknown
  ages                 TEXT,
  data_quality_rating  TEXT,
  primary_data_source  TEXT,
  verification_status  TEXT NOT NULL DEFAULT 'unverified'
                       CHECK (verification_status IN ('verified','pending','unverified')),
  verification_method  TEXT,
  status               TEXT NOT NULL DEFAULT 'active',
  is_public            INTEGER NOT NULL DEFAULT 1,
  last_ok_at           TEXT,                    -- last successful link check (freshness input)
  created_at           TEXT NOT NULL,
  updated_at           TEXT NOT NULL
, last_checked_at TEXT, internal_notes TEXT, intake_row TEXT, "publicity_consent" INTEGER NOT NULL DEFAULT 0 CHECK ("publicity_consent" IN (0, 1)), claim_email TEXT, address TEXT, address_publicity_consent INTEGER NOT NULL DEFAULT 0 CHECK (address_publicity_consent IN (0, 1)));

CREATE TABLE IF NOT EXISTS pipeline_runs (
  run_id               INTEGER PRIMARY KEY AUTOINCREMENT,
  lane                 TEXT NOT NULL,
  started_at           TEXT NOT NULL,
  finished_at          TEXT,
  items_processed      INTEGER NOT NULL DEFAULT 0,
  items_flagged        INTEGER NOT NULL DEFAULT 0,
  detail               TEXT
);

CREATE TABLE IF NOT EXISTS profile_favorites (
  profile_id TEXT NOT NULL REFERENCES profiles(id),
  org_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (profile_id, org_id)
);

CREATE TABLE IF NOT EXISTS profiles (
  id            TEXT PRIMARY KEY,                 -- uuid
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name          TEXT NOT NULL DEFAULT '',
  state         TEXT NOT NULL DEFAULT '',
  sports_json   TEXT NOT NULL DEFAULT '[]',       -- array of sport_key strings
  newsletter    INTEGER NOT NULL DEFAULT 0,       -- 1 = opted into beehiiv
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS programs (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL REFERENCES organizations(id),
  name TEXT NOT NULL,
  sport TEXT,
  sport_key TEXT,
  sports_json TEXT,
  website_url TEXT,
  email TEXT,
  phone TEXT,
  city TEXT,
  state TEXT,
  state_name TEXT,
  zip TEXT,
  publicity_consent INTEGER NOT NULL DEFAULT 0 CHECK (publicity_consent IN (0, 1)),
  country TEXT DEFAULT 'United States',
  lat REAL,
  lng REAL,
  geo_precision TEXT,
  description TEXT,
  cost_note TEXT,
  equipment_provided INTEGER,
  ages TEXT,
  verification_status TEXT NOT NULL DEFAULT 'unverified' CHECK (verification_status IN ('verified','pending','unverified')),
  verification_method TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  is_public INTEGER NOT NULL DEFAULT 1,
  last_ok_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
, address TEXT, address_publicity_consent INTEGER NOT NULL DEFAULT 0 CHECK (address_publicity_consent IN (0, 1)));

CREATE TABLE IF NOT EXISTS review_queue (
  item_id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id TEXT,
  lane TEXT NOT NULL,
  proposed_change TEXT NOT NULL,
  evidence TEXT,
  confidence REAL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TEXT NOT NULL,
  resolved_at TEXT,
  resolved_by TEXT
);

CREATE TABLE IF NOT EXISTS sports (
  sport_key     TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  super_type    TEXT NOT NULL,
  category      TEXT CHECK (category IN ('Indoor','Outdoor','Water')),
  is_paralympic INTEGER NOT NULL DEFAULT 0,
  is_team       INTEGER NOT NULL DEFAULT 0,
  icon_key      TEXT
);

CREATE TABLE IF NOT EXISTS submissions (
  submission_id        INTEGER PRIMARY KEY AUTOINCREMENT,
  kind                 TEXT NOT NULL DEFAULT 'new_program',
  payload              TEXT NOT NULL,            -- JSON of the submitted form
  contact_email        TEXT,
  status               TEXT NOT NULL DEFAULT 'new',
  created_at           TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS admin_login_tokens_email_idx
  ON admin_login_tokens (email COLLATE NOCASE, expires_at);

CREATE INDEX IF NOT EXISTS admin_sessions_email_idx
  ON admin_sessions (email COLLATE NOCASE, expires_at);

CREATE INDEX IF NOT EXISTS idx_events_public_starts ON events (is_public, status, starts_at);

CREATE INDEX IF NOT EXISTS grants_audience_idx ON grants (audience, is_public, status);

CREATE INDEX IF NOT EXISTS grants_public_idx ON grants (is_public, status);

CREATE INDEX IF NOT EXISTS link_checks_org_idx ON link_checks (organization_id, checked_at);

CREATE INDEX IF NOT EXISTS organization_login_tokens_email_idx
  ON organization_login_tokens (email COLLATE NOCASE, expires_at);

CREATE INDEX IF NOT EXISTS organization_sessions_email_idx
  ON organization_sessions (email COLLATE NOCASE, expires_at);

CREATE INDEX IF NOT EXISTS organizations_claim_email_idx
  ON organizations (claim_email COLLATE NOCASE);

CREATE INDEX IF NOT EXISTS organizations_last_checked_idx ON organizations (last_checked_at);

CREATE INDEX IF NOT EXISTS organizations_sport_idx ON organizations (sport_key);

CREATE INDEX IF NOT EXISTS organizations_state_idx ON organizations (state);

CREATE INDEX IF NOT EXISTS organizations_status_idx ON organizations (status, is_public);

CREATE INDEX IF NOT EXISTS idx_profile_favorites_org ON profile_favorites (org_id);

CREATE INDEX IF NOT EXISTS programs_organization_idx ON programs (organization_id);

CREATE INDEX IF NOT EXISTS programs_sport_idx ON programs (sport_key);

CREATE INDEX IF NOT EXISTS programs_state_idx ON programs (state);

CREATE INDEX IF NOT EXISTS programs_status_idx ON programs (status, is_public);

CREATE INDEX IF NOT EXISTS review_queue_status_idx ON review_queue (status, created_at);
