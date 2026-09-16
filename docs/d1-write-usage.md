# D1 write usage

## Audit, 2026-09-16

The public directory, blog, program/grant pages and event feeds do not write to
D1 when viewed. Writes come from maintenance lanes, admin approvals/event edits,
program submissions, profile saves and favorites. The migration/seed scripts can
also write large batches when explicitly executed.

Production `wrangler d1 insights asnm-db --sort-type=sum --sort-by=writes
--limit=10 --timePeriod=7d` returned seven write-query groups totaling 1,907 rows:
804 link-check history, 725 organization timestamps, 178 run history,
194 cursors and six review-queue rows. These query insights do not establish
the complete account billing total or the cause of the 100,000-row alert.

Also checked query insights for the other six currently listed account databases.
The returned top-write queries did not identify a 100,000-writes/day source.
Those databases were created September 14–15, so the seven-day request should
not be interpreted as seven full days of historical coverage. Bulk imports,
previous/deleted databases and complete daily billing totals remain unverified.

Cloudflare's free daily allowance is shared by databases in the account and
includes index maintenance. Check the dashboard's per-database **rows written**
by UTC date, including imports, staging databases and other applications.
See [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/) and
[analytics](https://developers.cloudflare.com/d1/observability/metrics-analytics/).

## Write reductions

- Dispatch hourly instead of every 20 minutes: each enrichment/classification/
  geocoding/deduplication lane runs at most six times per day.
- Geocoding batches contain at most 50 organizations instead of 200.
- Atomic cooldown claims in the existing `lane_cursors` table protect both
  scheduled and admin-triggered runs. Failed runs retain their cooldown, rather
  than allowing rapid retries. No schema migration is needed.
- Validation remains limited to 15 organizations every two hours, with a seven-day
  minimum recheck interval. Successful checks update both timestamps together.
- Unchanged profile saves do not update the row or its timestamp.
- `pipeline_writes` log events report D1's `batch_rows_written` metadata, including
  index maintenance. This includes lane batches and run-history/cursor completion;
  it excludes the small separate slot-claim and dispatch bookkeeping writes.

With the repository schema, scheduled maintenance is estimated below **5,000
row writes/day** even when every candidate produces a proposal (600 proposals/day,
up to 180 validation checks/day, plus bookkeeping). This leaves substantial room
within the requested 50,000 target. It is not an account-wide hard cap: user/admin
traffic, imports, other workers and additional database indexes are outside this
estimate. Maintenance throughput is deliberately lower.

Changes take effect only after deployment. Compare daily per-database metrics
after deployment; do not treat passing local tests as proof of production usage.
