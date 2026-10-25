-- Programs that come back: seasons, yearly events and history
-- (docs/specs/programs-that-come-back.md).
-- Additive only: new columns on programs and events, one new table. No row
-- changes; every existing program keeps today's behaviour (kind 'program',
-- listing 'own'). The site reads the same before and after this runs
-- (src/schema-probe.js), so it can run before or after the deploy.
-- Run it once per database: SQLite has no ADD COLUMN IF NOT EXISTS, so a
-- second run stops at the first ALTER with "duplicate column name", harmlessly.

-- What an organization offers, and when it comes back.
ALTER TABLE programs ADD COLUMN kind TEXT NOT NULL DEFAULT 'program' CHECK (kind IN ('program', 'event'));
ALTER TABLE programs ADD COLUMN seasons_json TEXT;          -- ["winter"]; spring, summer, fall, winter; empty = not said
ALTER TABLE programs ADD COLUMN usual_month INTEGER CHECK (usual_month IS NULL OR usual_month BETWEEN 1 AND 12);
ALTER TABLE programs ADD COLUMN first_year INTEGER;         -- a yearly event's 1st annual; counts "4th annual"
ALTER TABLE programs ADD COLUMN slug TEXT;                  -- /events/<slug> for a yearly event
-- 'own': its own card in lists (every program today). 'with_org': a sport the
-- organization runs at its own place; it rides on the organization's card.
ALTER TABLE programs ADD COLUMN listing TEXT NOT NULL DEFAULT 'own' CHECK (listing IN ('own', 'with_org'));
CREATE UNIQUE INDEX IF NOT EXISTS programs_slug_idx ON programs (slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS programs_kind_idx ON programs (organization_id, kind, listing);

-- Each time it happens: a dated events row that belongs to its program.
ALTER TABLE events ADD COLUMN program_id TEXT;              -- programs.id; empty = a one-time event, as today
ALTER TABLE events ADD COLUMN recap_url TEXT;               -- that year's results or photos on the host's site (a link, never names)
CREATE INDEX IF NOT EXISTS events_program_idx ON events (program_id, starts_at);

-- Team-only history of what happened with an organization. Never public.
CREATE TABLE IF NOT EXISTS organization_activity (
  id              TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  kind            TEXT NOT NULL CHECK (kind IN ('confirmation', 'fix', 'applied', 'self_edit', 'admin_edit', 'note')),
  summary         TEXT NOT NULL,                          -- one line, in words
  actor           TEXT,                                   -- 'organization', a team member's email, or 'system'
  ref             TEXT,                                   -- e.g. the submission id
  created_at      TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS organization_activity_org_idx ON organization_activity (organization_id, created_at);
