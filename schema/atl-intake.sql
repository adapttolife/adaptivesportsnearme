-- atl-intake — one row per form submission, across every Adapt To Life property.
--
-- The contract this table exists to keep: a person who submits anything is
-- recorded BEFORE any step that can fail, and every side effect afterwards is a
-- stamp on their row rather than the success of a call. That is what makes the
-- whole path retryable: "was this notified?" is a query, not an inference, and a
-- crash mid-flight loses nothing.
--
-- Bound to all three Workers (adapttolife.org, adaptivesportsnearme.com,
-- adaptbodyshop.com) as env.INTAKE. Deliberately NOT a central intake Worker:
-- that would put a network hop between a member of the public and their
-- confirmation, which is one more thing that can fall apart.

CREATE TABLE IF NOT EXISTS intake (
  id              TEXT PRIMARY KEY,          -- uuid
  received_at     TEXT NOT NULL,             -- ISO8601 UTC, set by the Worker
  site            TEXT NOT NULL,             -- adapttolife.org | adaptivesportsnearme.com | adaptbodyshop.com
  kind            TEXT NOT NULL,             -- newsletter | program | contact | application | volunteer | waiver | donation | shop-contact
  name            TEXT,
  email           TEXT,
  phone           TEXT,
  summary         TEXT,                      -- one human line, used as the email subject
  payload         TEXT NOT NULL,             -- JSON: the full submission, verbatim
  source          TEXT,                      -- utm / referring form

  -- The work surface. ClickUp stays where ATL works tasks (Alec, 2026-09-09);
  -- this column exists so a row can be closed here too as this grows into the
  -- customer-service view.
  status          TEXT NOT NULL DEFAULT 'new',   -- new | working | closed

  -- Side effects, as stamps. NULL means owed, and something will retry it.
  notified_at     TEXT,
  notify_attempts INTEGER NOT NULL DEFAULT 0,
  notify_error    TEXT,
  sheet_synced_at TEXT,

  -- Canary rows are written by the scheduled end-to-end check. They travel the
  -- real path so the check is real, and are filtered out of the sheet and swept
  -- up afterwards so they never look like a person.
  is_canary       INTEGER NOT NULL DEFAULT 0
);

-- The sweeper's query: oldest unnotified first.
CREATE INDEX IF NOT EXISTS intake_unnotified ON intake (notified_at, received_at);
-- The sheet mirror's query.
CREATE INDEX IF NOT EXISTS intake_unsynced   ON intake (sheet_synced_at, received_at);
CREATE INDEX IF NOT EXISTS intake_received   ON intake (received_at DESC);
CREATE INDEX IF NOT EXISTS intake_email      ON intake (email);
