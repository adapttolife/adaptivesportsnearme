-- ASNM data plane — Cloudflare D1 (SQLite) schema.
-- Ported from the asnm repo's Postgres migration (db/migrations/0001_init.sql):
--   uuid -> TEXT, text[] -> JSON TEXT, timestamptz -> TEXT (ISO 8601), jsonb -> TEXT.
-- Freshness decay (half-life 45d) is computed in the Worker from last_ok_at, not in SQL.
-- Core invariant preserved from the Postgres design: pipeline lanes PROPOSE changes into
-- review_queue; organizations is only written by an approved review or the importer.

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
  geo_precision        TEXT,                    -- 'address' | 'city' | 'state' | NULL
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
);
CREATE INDEX IF NOT EXISTS organizations_state_idx ON organizations (state);
CREATE INDEX IF NOT EXISTS organizations_sport_idx ON organizations (sport_key);
CREATE INDEX IF NOT EXISTS organizations_status_idx ON organizations (status, is_public);

CREATE TABLE IF NOT EXISTS organization_data_sources (
  organization_id      TEXT NOT NULL REFERENCES organizations(id),
  source_id            TEXT NOT NULL REFERENCES data_sources(source_id),
  source_record_url    TEXT,
  data_quality_rating  TEXT,
  retrieved_at         TEXT,
  verified             INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (organization_id, source_id)
);

CREATE TABLE IF NOT EXISTS link_checks (
  check_id             INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id      TEXT NOT NULL REFERENCES organizations(id),
  url                  TEXT NOT NULL,
  ok                   INTEGER NOT NULL,
  http_status          INTEGER,
  detail               TEXT,
  lane                 TEXT NOT NULL DEFAULT 'validate',
  checked_at           TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS link_checks_org_idx ON link_checks (organization_id, checked_at);

CREATE TABLE IF NOT EXISTS review_queue (
  item_id              INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id      TEXT REFERENCES organizations(id),
  lane                 TEXT NOT NULL,            -- 'validate' | 'enrich' | 'submission'
  proposed_change      TEXT NOT NULL,            -- JSON: {field: {from, to}, ...}
  evidence             TEXT,                     -- JSON: source URL, excerpt, etc.
  confidence           REAL,
  status               TEXT NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending','approved','rejected')),
  created_at           TEXT NOT NULL,
  resolved_at          TEXT,
  resolved_by          TEXT
);
CREATE INDEX IF NOT EXISTS review_queue_status_idx ON review_queue (status, created_at);

CREATE TABLE IF NOT EXISTS submissions (
  submission_id        INTEGER PRIMARY KEY AUTOINCREMENT,
  kind                 TEXT NOT NULL DEFAULT 'new_program',
  payload              TEXT NOT NULL,            -- JSON of the submitted form
  contact_email        TEXT,
  status               TEXT NOT NULL DEFAULT 'new',
  created_at           TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS pipeline_runs (
  run_id               INTEGER PRIMARY KEY AUTOINCREMENT,
  lane                 TEXT NOT NULL,
  started_at           TEXT NOT NULL,
  finished_at          TEXT,
  items_processed      INTEGER NOT NULL DEFAULT 0,
  items_flagged        INTEGER NOT NULL DEFAULT 0,
  detail               TEXT
);

-- Cursor for batched cron lanes (which org we scanned up to, per lane).
CREATE TABLE IF NOT EXISTS lane_cursors (
  lane                 TEXT PRIMARY KEY,
  cursor               TEXT NOT NULL DEFAULT '',
  updated_at           TEXT NOT NULL
);
