-- Additive schema for the INTAKE binding, NOT the directory DB in production.
-- Apply to isolated local/staging DB first. Existing records/claims are preserved.
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
, lane TEXT);
CREATE TABLE IF NOT EXISTS newsletter_delivery_claims (claim_key TEXT PRIMARY KEY,publication_id TEXT NOT NULL,subscription_id TEXT,state TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS intake_delivery_claims (
  intake_id TEXT PRIMARY KEY,
  state TEXT NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','sending','done','review')),
  started_at TEXT,
  completed_at TEXT,
  error TEXT
);
CREATE TABLE IF NOT EXISTS newsletter_send_receipts (claim_key TEXT PRIMARY KEY, provider TEXT NOT NULL, provider_message_id TEXT NOT NULL, accepted_at TEXT NOT NULL);
