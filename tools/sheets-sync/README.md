# ASNM Master Sheets sync

## Current execution contract

The bulk sync runs on Julia's existing host, every 20 minutes at minutes 10, 30 and 50. It uses the same ATL D1 databases, separate production/staging Master Sheets, and existing Google service account. Cloudflare remains on Free; this adds no paid service. The public website Workers are unchanged.

The old `asnm-sheets` Worker is retired. `retired-worker.mjs` does no data work; its live timer, bindings and Google secret were removed and read back. The configuration here must remain inert. Do not deploy the recovered engines as Workers or restore a second scheduled writer.

`assets/manifest.json` pins the recovered, query-optimized engine version and hashes. The only module changes for host execution are the local staging import extension and named production export. Existing Intake validation, exported tables and staging CRM logic are preserved. The host's `D1Rest` adapter implements the used binding methods against Cloudflare's native REST query API. Its batch rollback semantics were exercised in an isolated staging probe, followed by verified probe removal.

D1 is authoritative for Organizations and related exported tabs. Intake admits new organizations; editing Organizations does not write changes back to D1. Production and staging are intentionally independent datasets, not replicas.

## Invocation and ownership

The portable engine entrypoint is `scripts/run.mjs`. It requires the existing `CLOUDFLARE_API_TOKEN` and `GOOGLE_SA_JSON` in process memory and an `ASNM_RESULT_PATH` for its private result. Never commit secrets or copy production receipts into this public repository.

**Do not schedule or run this entrypoint independently.** The installed profile launcher is the single operational entrypoint. It takes a nonblocking host lock, checks the exact retired Worker version and absence of schedules/secrets before any data write, acquires the existing vault credentials, enforces a bounded execution time and memory allowance, and preserves separate last-attempt and last-success receipts. Private profile paths and vault references are intentionally not part of this public source.

A no-agent scheduler job owns execution. Healthy receipts remain local; failures alert Alec. A partial environment failure must fail the overall run. A read-budget violation opens a persistent circuit that requires investigation before explicitly clearing it. No automatic write retry may turn an ambiguous mutation into a duplicate.

## Readback and cost

Every successful run reads back the exact Google value ranges it wrote. Anchor ranges such as `Organizations!A1` are expanded to their full dimensions; empty trailing cells are normalized without discarding meaningful zero/false cells. Partial writes, absent ranges and mismatches fail the run. This is stronger than checking only a row count or a process exit code.

Host execution removes the Worker CPU/memory constraint, **not** D1's shared daily read allowance. Workers Free allows only 10 ms CPU for both HTTP and cron invocations; the earlier claim that scheduled context supplied a larger Free allowance was incorrect. Grouped SQL remains essential. Measured initial host execution used 56,140 D1 reads across both environments, approximately 4.04 million per day at the regular cadence. Site traffic, separate CRM refreshes, audits and manual runs also consume the shared 5 million daily allowance. This estimate is not an account-wide usage measurement or an unlimited growth guarantee.

## Tests and release boundaries

Run `node --test tools/sheets-sync/scripts/*.test.mjs tools/sheets-sync/retired-worker.test.mjs`, then the repository's full test suite. Tests cover adapter failures, atomic batch response handling, target isolation, exact readback, missing writes and the retired Worker's inert behavior. A real staging batch-rollback probe, real host execution, actual scheduler fire, D1 import invariants and Google readbacks were checked separately from offline tests.

Maintain one current source-review PR into `staging`. This source preservation is not approval to merge, deploy the public website, change billing, re-import organizations or restore a Cloudflare sync timer. Verify latest staging ancestry and preserve unrelated teammate changes. Reversal also requires a single-writer cutover: pause and fence the host before restoring any other execution owner.
