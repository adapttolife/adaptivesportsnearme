-- 0004_grants.sql — public athlete + program grant directory.
-- Additive. Do not ALTER existing tables. Staging first.
--   cfrun wrangler d1 execute asnm-db-staging --remote --file db/migrations/0004_grants.sql
-- Live asnm-db stays locked until an explicit prod apply.

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
CREATE INDEX IF NOT EXISTS grants_public_idx ON grants (is_public, status);
CREATE INDEX IF NOT EXISTS grants_audience_idx ON grants (audience, is_public, status);
