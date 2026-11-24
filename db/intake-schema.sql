-- Additive schema for the INTAKE binding, NOT the directory DB in production.
-- Apply to isolated local/staging DB first. Existing records/claims are preserved.
CREATE TABLE IF NOT EXISTS intake (
  id              TEXT PRIMARY KEY,          -- uuid
  received_at     TEXT NOT NULL,             -- ISO8601 UTC, set by the Worker
  site            TEXT NOT NULL,             -- adapttolife.org | adaptivesportsnearme.com | adaptbodyshop.com
  kind            TEXT NOT NULL,             -- newsletter | program (ASNM add-a-program) | contact | application | volunteer | waiver | donation | shop-contact
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
-- Mail ledger (Nov 2026, Resend). Same name and columns as adapt-to-life's
-- send_failures, so one alert reads both sites: every confirmation, notice or
-- welcome that did not go out, and every bounce, complaint or failure Resend
-- reports, is one row. db/migrations/0028_mail_ledger.sql adds both tables.
CREATE TABLE IF NOT EXISTS send_failures (
  id      TEXT PRIMARY KEY,                       -- uuid, or resend:<svix-id>
  ts      INTEGER NOT NULL,                       -- epoch seconds (the alert's cursor)
  route   TEXT NOT NULL,                          -- asnm-confirm-program, resend-bounced, ...
  to_addr TEXT,
  error   TEXT
);
CREATE INDEX IF NOT EXISTS idx_send_failures_ts ON send_failures(ts);
-- One row per Resend webhook delivery (svix-id), so a replay is stored once.
CREATE TABLE IF NOT EXISTS resend_events (
  svix_id     TEXT PRIMARY KEY,
  received_at TEXT NOT NULL,
  type        TEXT NOT NULL,                      -- email.delivered, email.bounced, ...
  email_id    TEXT,                               -- Resend's message id
  kind        TEXT,                               -- our kind tag: welcome, signin-profile, ...
  env         TEXT
);
CREATE INDEX IF NOT EXISTS idx_resend_events_email ON resend_events(email_id);
