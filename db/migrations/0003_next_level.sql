-- 0003_next_level.sql — events + lightweight profiles.
-- Apply AFTER 0002. Idempotent (IF NOT EXISTS throughout).
-- Timestamps are TEXT ISO-8601 UTC, matching schema.sql conventions.

-- Events: the calendar lane. Admin-curated for now (source='admin');
-- future sources (submissions, pipeline discovery) land through the same table.
CREATE TABLE IF NOT EXISTS events (
  id            TEXT PRIMARY KEY,                 -- uuid
  title         TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  org_id        TEXT REFERENCES organizations(id),
  sport_key     TEXT REFERENCES sports(sport_key),
  venue         TEXT,
  city          TEXT,
  state         TEXT,                             -- USPS 2-letter, like organizations.state
  url           TEXT,                             -- event's own page, if any
  starts_at     TEXT NOT NULL,                    -- ISO 8601 UTC
  ends_at       TEXT,
  all_day       INTEGER NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','cancelled')),
  is_public     INTEGER NOT NULL DEFAULT 1,
  source        TEXT NOT NULL DEFAULT 'admin',
  created_at    TEXT NOT NULL,
  updated_at    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_events_public_starts ON events (is_public, status, starts_at);

-- Profiles: no passwords, no walls. A profile is claimed by the device that
-- created it (signed HttpOnly cookie); email is unique so a second device
-- gets an honest "already exists" until magic-link recovery ships.
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

CREATE TABLE IF NOT EXISTS profile_favorites (
  profile_id    TEXT NOT NULL REFERENCES profiles(id),
  org_id        TEXT NOT NULL REFERENCES organizations(id),
  created_at    TEXT NOT NULL,
  PRIMARY KEY (profile_id, org_id)
);
CREATE INDEX IF NOT EXISTS idx_profile_favorites_org ON profile_favorites (org_id);
