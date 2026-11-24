-- Mail ledger for the Resend move (Nov 2026). Runs on the INTAKE database, not
-- the directory database: atl-intake in production, asnm-db-staging on staging.
-- Only adds; safe to run twice; code on main and staging both run with or
-- without it (ledger writes fail open, and /api/resend-events answers 503 until
-- it exists so Resend retries).
--
--   npx wrangler d1 execute asnm-db-staging --config wrangler.preview.json --remote --file db/migrations/0028_mail_ledger.sql
--   npx wrangler d1 execute atl-intake --config wrangler.json --remote --file db/migrations/0028_mail_ledger.sql
--
-- send_failures may already exist in atl-intake if adapt-to-life adds it
-- first; IF NOT EXISTS keeps that table as it is (same columns).
CREATE TABLE IF NOT EXISTS send_failures (
  id      TEXT PRIMARY KEY,
  ts      INTEGER NOT NULL,
  route   TEXT NOT NULL,
  to_addr TEXT,
  error   TEXT
);
CREATE INDEX IF NOT EXISTS idx_send_failures_ts ON send_failures(ts);
CREATE TABLE IF NOT EXISTS resend_events (
  svix_id     TEXT PRIMARY KEY,
  received_at TEXT NOT NULL,
  type        TEXT NOT NULL,
  email_id    TEXT,
  kind        TEXT,
  env         TEXT
);
CREATE INDEX IF NOT EXISTS idx_resend_events_email ON resend_events(email_id);
