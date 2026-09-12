-- The shared intake table (D1 `atl-intake`, 916e841e-50cc-4661-806a-865cd24fbb53),
-- bound to EVERY property Worker as env.INTAKE. This file is the record of the
-- live schema; apply changes with
--   cfrun wrangler d1 execute atl-intake --remote --file sql/<migration>.sql
-- and keep this file equal to what `sqlite_master` says afterwards.
CREATE TABLE IF NOT EXISTS intake (
  id              TEXT PRIMARY KEY,          -- uuid
  received_at     TEXT NOT NULL,             -- ISO8601 UTC, set by the Worker
  site            TEXT NOT NULL,             -- adapttolife.org | adaptivesportsnearme.com | adaptbodyshop.com
  kind            TEXT NOT NULL,             -- newsletter | program | contact | application | volunteer | waiver | donation | shop-contact | canary
  name            TEXT,
  email           TEXT,
  phone           TEXT,
  summary         TEXT,                      -- one human line, used as the email subject
  payload         TEXT NOT NULL,             -- JSON: the full submission, verbatim
  source          TEXT,                      -- utm / referring form; canaries: canary:<ENV_NAME>
  status          TEXT NOT NULL DEFAULT 'new',   -- new | working | closed
  notified_at     TEXT,                      -- side effects are STAMPS; NULL means owed
  notify_attempts INTEGER NOT NULL DEFAULT 0,
  notify_error    TEXT,
  sheet_synced_at TEXT,
  is_canary       INTEGER NOT NULL DEFAULT 0,
  lane            TEXT                       -- ENV_NAME of the Worker that wrote the row (2026-09-12); the sweeper only re-notifies its own lane
);
