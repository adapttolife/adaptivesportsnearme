-- Spec 72 migration: sports taxonomy (reference data) + stale-first validate evidence.
-- Apply once per database (SQLite ALTER TABLE has no IF NOT EXISTS):
--   cfrun wrangler d1 execute <db> --remote --file db/migrations/0002_taxonomy.sql
-- Seed rows for `sports` live in data/sports-seed.sql (idempotent INSERT OR REPLACE).

-- Taxonomy reference table. Converges with the RCOS DataFields.md Sports database:
-- their sport_name -> name, sport_super_type -> super_type, sport_category -> category,
-- is_paralympic / is_team_sport carried directly. `sport_key` is the canonical machine key
-- lanes and sports_json use; `icon_key` is non-null only for the site's icon set (11 keys),
-- so classification can never break card imagery by inventing an unknown icon.
CREATE TABLE IF NOT EXISTS sports (
  sport_key     TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  super_type    TEXT NOT NULL,
  category      TEXT CHECK (category IN ('Indoor','Outdoor','Water')),
  is_paralympic INTEGER NOT NULL DEFAULT 0,
  is_team       INTEGER NOT NULL DEFAULT 0,
  icon_key      TEXT
);

-- Second documented evidence-write exception (with last_ok_at): validate stamps every org
-- it checks, success or failure, so the stale-first ordering never re-hammers dead sites.
ALTER TABLE organizations ADD COLUMN last_checked_at TEXT;
CREATE INDEX IF NOT EXISTS organizations_last_checked_idx ON organizations (last_checked_at);
