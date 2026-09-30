# ASNM Master Sheets operational sync

This directory is the recovery baseline for the existing **`asnm-sheets`** Worker, not the public website. The checked-in modules are the exact recovered, bundled modules identified in `baseline.json`. They are not presented as newly authored application source. This avoids another untracked dashboard-only runtime; unbundling can be a separately reviewed change.

## Ownership and boundaries

- One scheduled Worker in the Adapt To Life account runs both engines inside its scheduled execution context.
- Production: `DB` and `ASNM_MASTER_SHEET_ID`.
- Staging: `STAGING_DB`, `STAGING_MASTER_SHEET_ID`, and `STAGING_CRM_SHEET_ID`. The staging engine retains the existing staging CRM contact lane.
- No routes, workers.dev, previews, or public administrative endpoints. Google credentials are an existing secret binding and are not in this repository.
- No imports from, deployments of, or configuration changes to the website entrypoint. The root website Wrangler configuration is separate.
- The old personal-account Sheets writers are retired. Do not reactivate them or bind this Worker to an old database because the database names match.
- D1 is authoritative for exported Organizations and supporting tabs. Intake processing state is not verification status. A nonempty Intake Status skips normal ingestion. This is not general bidirectional spreadsheet editing.

## Reliability contract

1. Only `10,30,50 * * * *` is accepted by the handler. Stale minute-test events do not touch D1 or Sheets. Do not change a live cron to every minute for testing.
2. Both engines run in the scheduled context. An HTTP Service-binding call put staging under the free-plan HTTP CPU limit and is deliberately not used.
3. Source-link counts are aggregated once, then joined to sources. Do not restore a full link-table scan inside a correlated count for every source.
4. Export run details record `rows_read` across the six export SELECTs. This excludes intake, CRM and pipeline bookkeeping reads; include those and website traffic in the account budget.
5. Production and staging failures are independent and logged by environment. Caught intake/CRM failures are reported as partial failures, not a green full-sync result.
6. Validate actual scheduled events, lane records, exact Sheet values, and account read usage. A configured cron, one successful export, HTTP 200, or a no-new-rows intake check is not complete release proof.
7. On account-wide D1 exhaustion, retain last-good Sheets. Never replace source data with empties or copy from legacy D1 to manufacture success. An account quota reset is a dependency, not an application fix.

## Local verification

```sh
node --check tools/sheets-sync/index.js
node --check tools/sheets-sync/staging-engine.js
node --test tools/sheets-sync/sync.test.mjs
python3 tools/sheets-sync/test_query.py
```

Tests have no provider access or production writes. SQL tests report SQLite execution work, **not Cloudflare billed rows**. Live `rows_read` evidence and a normal-cadence successful run remain required after a quota-blocked repair.

## Release gate

A staging-targeted review is not approval to redeploy this or the website. Follow the repository's Faisal review gate. Use this directory's explicit Wrangler config only for an approved sync-Worker change; never the root website config. Preserve inherited secrets, upload an inactive version, compare its exact modules and bindings with the intended candidate, guard against a concurrent deployment, then promote only that reviewed version. Read back routes, previews, cron configuration and actual executions separately. Retain the previous version for rollback; rolling back to the known expensive query is not a safe long-term recovery.

The Cloudflare account has shared free-tier limits. A billing change requires explicit approval. Budget the recurring read load, import/audit work and visitor traffic together; do not rely only on individual query latency.
