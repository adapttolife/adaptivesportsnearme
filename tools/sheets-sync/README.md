# ASNM Master Sheets sync

## Current execution contract

The bulk sync runs on Julia's existing host every two hours (`10 */2 * * *`, scheduler Central time), using the same ATL D1 databases, separate production/staging Master Sheets and existing Google service account. Cloudflare remains on Free. Success output is local; failures alert the owner. The separate ATL CRM source-refresh schedule is unchanged.

D1 is authoritative for exported tabs. Intake admits new organizations and proposes supported updates for review; editing exported Organizations does not update D1. This is not unrestricted two-way editing.

The old ATL `asnm-sheets` Worker is inert, with no bindings, secrets or schedule. `retired-worker.mjs` and `wrangler.json` document that retirement, not a replacement website. Other retired Sheets writers must remain disabled.

## Organization query design

- Read organizations once per environment after Intake completes. Staging CRM and export share this invocation-local snapshot, not a persistent cache.
- Read source links once through their covering primary index. Assemble organization source labels and source counts from that same data on the host, eliminating per-organization correlated lookups and repeat link aggregation.
- Resolve Queue/Recent Changes organization names from the same organization snapshot, rather than joining organizations again.
- Sort organizations on the host using SQLite NOCASE semantics, including ASCII-only case folding, stable ties, nulls and UTF-8 byte ordering. Do not substitute localeCompare.
- Refresh the entire snapshot each cycle: edits, deletions and link changes are not missed by timestamp-only change detection. Intake duplicate matching may need an additional pre-write scan when new rows actually exist; that earlier state must not be reused for export.
- Record per-statement D1 cost metadata without bound parameter values.

Live measured results at the current dataset size:

| Measurement | Before | Optimized |
|---|---:|---:|
| Production organization query reads | 12,772 | 2,465 |
| Staging organization query reads | 18,238 | 3,435 |
| Complete production + staging cycle, including CRM and bookkeeping | 56,140 | 17,060 |
| Nominal daily cycles | 72 | 12 |
| Projected daily sync reads | 4,042,080 | 204,720 |

The last line is a projection, not measured full-day account consumption. Other website/CRM/maintenance reads are separate. Intake activity and growing datasets can change the totals. The existing 60,000-read per-run circuit remains; unexpected excess opens a hold for investigation.

Live old/new query results were compared across every exported dataset and matched completely. The optimized full sync then wrote both environments and read back every written range exactly. Organization counts remained 2,465 production and 3,435 staging; no data/schema migration or index changes were needed.

## Source provenance and safe execution

`assets/` preserves the recovered serving source and records original and successive host hashes in `manifest.json`. Host adaptations include module imports/exports, the single-read projection, snapshot reuse, and two-hour Intake instructions. These engines are host-only and must not be deployed as Workers.

The portable runner is `scripts/run.mjs`; D1 binding compatibility is `scripts/d1-rest.mjs`; exact Sheet readback is `scripts/sheet-readback.mjs`. Julia's private credential launcher is intentionally excluded from this public repository. It retrieves existing credentials into child-process memory, holds one nonblocking host lock, enforces a 165-second deadline and verifies that the old Worker still has the exact retirement version, no cron and no Google secret before every run. It preserves the last successful receipt when a later attempt fails.

Do not run the portable engine alongside its scheduled owner. One authorized host launcher/schedule owns writes. There is no automatic write retry or failover to the retired Worker; ambiguous mutations require reconciliation. Intake/CRM/readback failures remain overall failures even if export succeeds.

The D1 REST batch adapter's rollback behavior was proved with an isolated temporary staging-only probe, then its removal was verified. Sheet readback expands anchor ranges to complete write dimensions and preserves meaningful zero/false cells.

## Verification and review

Run `npm test` from the repository root. Portable tests cover adapter behavior, exact readback, actual SQLite projection equivalence and SQL-work regression, snapshot scoping, and inert Worker behavior. Private launcher tests separately prove timer/version/credential fencing, the read-budget hold and the execution lock. Fixtures are synthetic; live receipts stay private.

Workers Free constrains both HTTP and cron CPU to 10 ms. The host removes that invocation constraint, not the account's D1 allowance. Data correctness, cost per run, actual cadence and sustained runtime reliability are distinct gates. A no-new-rows Intake run is not a new-row admission test.

This source remains in the existing draft PR into `staging`. Source publication is not a merge, production website release or authorization to reactivate the retired Worker.
