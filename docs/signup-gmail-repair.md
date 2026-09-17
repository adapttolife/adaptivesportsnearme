# Signup repair / Gmail cutover

## What this branch does

This is an ASNM contribution based on `staging` at `b3cc1ab`, not a direct-to-main release. It reconciles the useful changes in the old `gate-name-beta` PR without replacing the team's shared stylesheet or importing obsolete deployment files. It does not deploy anything.

- First Name and optional Beta Tester capture; athlete/action photos and invitation copy retained from the earlier work.
- One newsletter implementation shared by the app, preview and the **existing** `asnm-gate` route Worker. Updating only the app would not fix public signup: `/api/subscribe*` is intercepted by that gate.
- Correct ASNM publication; existing/legacy consent checked; no silent reactivation. Existing subscribers are not welcomed again. The profile opt-in deliberately requests no custom welcome.
- Atomic durable intake + delivery claims before subscription creation. Concurrent requests cannot create multiple internal records or mail claims.
- Beehiiv welcome suppressed; a custom welcome requires the same subscriber to be active, a one-way send claim, and a provider acceptance ID. Acceptance is NOT inbox delivery.
- Uncertain send/create outcomes are retained for review, never blindly retried. Missing Gmail configuration leaves `waiting-for-mail`, not a false `sent` state. Pending validation can leave `not-active-no-welcome`; that is a visible operator-review outcome, not a delivery guarantee.
- Existing notification claims are preserved. No fabricated claims for old records and no canary submissions or synthetic external mail.
- Explicit Gmail transport, UTF-8 MIME, attachments, sender restriction, no provider fallback. Network calls and responses in automated tests are isolated fixtures, not evidence of real Gmail delivery.
- The existing D1 optimization from staging stays intact. No directory reimport or delete/reinsert task.

## Configuration and isolation

`wrangler.json` now names the observed live app Worker (`adaptivesportsnearme`), the Adapt To Life account, and the current database identifiers. Its staging environment and `wrangler.preview.json` use the staging D1 database, **not the production gate database**. The preview remains `asnm-preview`; there is no new preview fleet. `wrangler.gate.json` owns only the already-existing subscription routes and its ten-minute notification sweep.

Every candidate lane opts into Gmail with `MAIL_TRANSPORT=gmail` and `GMAIL_FROM=hello@adapttolife.org`. These non-secret variables do not grant send authority. Provision these as Worker secrets only after an approved sender authorization:

- `GMAIL_CLIENT_ID`
- `GMAIL_CLIENT_SECRET`
- `GMAIL_REFRESH_TOKEN`
- existing correct `BEEHIIV_API_KEY`

Use a dedicated refresh token authorized for `https://www.googleapis.com/auth/gmail.send`, owned by the actual hello@ mailbox or a mailbox whose hello@ send-as identity is already accepted. A generic Google API key does not authorize mail. Do not give the website a personal all-mail token. Do not paste credentials into issues, PRs or chat. Store them in the approved vault and provision server-side. Gmail API enablement and actual mailbox/alias ownership must be confirmed during authorization. No MX change is required.

`GMAIL_FROM` is an allowlisted sender identity, not a mechanism to create a Gmail alias. Google must independently authorize that identity. Missing/invalid authorization must remain a blocked activation, not a switch to another sender.

## Database changes

`db/intake-schema.sql` is additive. It creates the intake/claim tables in isolated staging if absent, and the new `newsletter_send_receipts` table. On the production `atl-intake` database, existing tables and rows are retained; only the absent receipt table is added. Do not apply the directory's `db/schema.sql` to production as part of this repair.

Local verification (no external writes):

```sh
node --test
wrangler d1 execute asnm-db-staging --local --config wrangler.preview.json --file db/schema.sql
wrangler d1 execute asnm-db-staging --local --config wrangler.preview.json --file db/intake-schema.sql
wrangler deploy --dry-run --config wrangler.preview.json
wrangler deploy --dry-run --config wrangler.gate.json
```

Cloud migrations are a separate reviewed release step. Confirm the account/database binding before applying them; retain a backup. The schema never drops/repopulates directory tables. It is safe to rerun its `CREATE TABLE IF NOT EXISTS` statements, but that does not validate arbitrary schema drift—inspect actual existing columns first.

## Tests and collaboration

The existing formatting-sensitive CSS tests now compare selectors/values independently of whitespace. They still check the substantive layout values; the section-spacing expectation follows the team's current 15px value rather than reverting its design to make the old test pass. A test-only GitHub workflow is included; it has read-only repository permissions and no deploy/secret access. It is not a claim that branch protection has been enabled.

Keep contributions on `staging` and PRs into `staging`, per CONTRIBUTING.md. Review deployment as a separate change. Do not simply retarget the old divergent branch or merge it wholesale; this branch contains its intentionally reconciled changes. The old PR can be superseded after this replacement is accepted.

## Release gates / how to finish

1. Review this exact candidate and CI on `staging`; preserve other developers' concurrent edits.
2. Complete approved Gmail sender authorization. Verify account/send-as identity and securely provision the dedicated secrets in each intended Worker. No credential was provisioned by writing this branch.
3. Apply the additive schema first to isolated staging; exercise the configured candidate without public subscriber fixtures.
4. Coordinate an approved recipient-controlled delivery check: capture and correct publication/fields, one welcome, internal notification, provider ID, and recipient receipt. Do not call a Gmail HTTP 200 or a database stamp inbox-delivery proof. No live test emails have been sent as part of the automated suite.
5. Capture current deployment IDs and database backup. Release the intended app/gate versions separately through the project's normal production approval; leave MX, unrelated routes and directory data untouched. Refresh the preview from the same reviewed source but keep its D1 isolated.
6. Review historical ambiguous claims individually. There is no automatic welcome backfill. Pending notification claims may be processed by the existing sweep only when their at-most-once evidence permits it.
7. Monitor account-wide D1 usage through a complete day. Migration/import spikes and steady-state scheduled writes are different causes; do not assert an ongoing rebuild without evidence.

If delivery validation fails, stop promotion. Roll back only to the captured deployment versions; retain additive ledger tables and receipts. The prior sender was already broken, so rollback is not evidence of restored email.
