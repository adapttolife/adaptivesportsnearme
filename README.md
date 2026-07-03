# adaptivesportsnearme — AdaptiveSportsNearMe.com

The canonical site for **adaptivesportsnearme.com**: the Airbnb-style directory design, a
Cloudflare Worker with a **D1 data plane** (1,544 real organizations), a cron maintenance
pipeline, and an installable PWA. Production stays a gated pre-launch teaser; staging runs
the full ungated directory on real data.

## Architecture

```
public/index.html      the site (self-contained design; hydrates real data from /api/*)
public/manifest.json   PWA manifest (installable, mobile + desktop)
public/sw.js           service worker (offline shell, network-first API)
src/index.js           Worker: routing, forms (beehiiv/Airtable), config, cron entry
src/data.js            /api/programs /api/orgs/:id /api/stats (D1 reads + freshness decay)
src/pipeline.js        cron lanes: validate (link liveness) + enrich (contact scrape)
src/admin.js           /api/admin/* review queue (ADMIN_KEY bearer)
db/schema.sql          D1 schema (ported from adaptivesportsnearme-data's Postgres design)
scripts/pg-to-d1.py    one-time migration: local Postgres → cleaned SQL → D1
scripts/deploy.sh      the deploy path (sandbox | staging | prod) with post-deploy smoke test
```

**Data plane:** two D1 databases — `asnm-db` (prod) and `asnm-db-staging`. Same schema,
seeded identically from the asnm Postgres (2,095 raw orgs → 1,544 after dropping scraped
junk rows and merging duplicates). Provenance (22 sources + junction), 575 link checks and
the review queue carried over.

**Core invariant (kept from the original Postgres design):** pipeline lanes *propose*
changes into `review_queue`; a human approves via `/api/admin/queue/:id` before anything
touches `organizations`. The one direct write is `last_ok_at` (liveness evidence, feeds
the freshness score — half-life 45 days, computed in the Worker).

**Environments:**

| | prod (`asnm`) | staging (`asnm-staging`) | sandbox (`asnm-sandbox`) |
|---|---|---|---|
| URL | adaptivesportsnearme.com | asnm-staging.alec-af3.workers.dev | asnm-sandbox.alec-af3.workers.dev |
| Gate | `PRELAUNCH=true` (teaser + modal) | `PRELAUNCH=false` (full directory) | `PRELAUNCH=false` |
| D1 | asnm-db | asnm-db-staging | asnm-db-sandbox (starts empty) |
| Crons | validate 2h / enrich 20min | same | none (run lanes by hand) |
| Deploys from | `main`, explicit | `main` | `v2` |

**Branch model (one repo, three lanes):**

- `main` is the trunk — what collaborators branch from and PR into; deploys to **staging**.
- `v2` is the long-running milestone branch — the data-infrastructure fill + design-to-data
  work happens here; collaborator PRs target `v2`; deploys to **sandbox**. When the
  milestone is done: one PR `v2 → main`, verify on staging, then the prod cutover.
- **prod only changes via an explicit `scripts/deploy.sh prod`** — merging is never
  deploying. That separation, not a second repo, is what protects the live site.

The front-end hydrates from `/api/config` + `/api/programs`; if the API is absent or errors,
the inline sample stays and the page never breaks. Real listings render honestly: no
invented contact info, no unverified accessibility claims, gradient tiles for sports
outside the 11-photo launch set, state-centroid map pins marked `state-level`.

## Deploy

```
cd /srv/alec-version-2
scripts/deploy.sh sandbox   # deploy + smoke test sandbox (from the v2 branch)
scripts/deploy.sh staging   # deploy + smoke test staging
scripts/deploy.sh prod      # deploy + smoke test production (keeps the prelaunch gate)
```

Launch cutover = set `PRELAUNCH` to `"false"` in the prod `vars` in `wrangler.jsonc`,
then `scripts/deploy.sh prod`.

## Secrets (per worker, via `wrangler secret put`)

`BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID`, `AIRTABLE_TOKEN`, `TURNSTILE_SECRET_KEY`,
and `ADMIN_KEY` (enables `/api/admin/*`; unset = admin disabled, 401).

## Maintaining the data

- Cron lanes run on their own; results land in `pipeline_runs`, evidence in `link_checks`,
  proposals in `review_queue`.
- Review: `GET /api/admin/queue`, decide with `POST /api/admin/queue/:id {"action":"approve"}`.
- Manual lane run: `POST /api/admin/run/validate` (or `enrich`).
- Re-seed from Postgres: `scripts/pg-to-d1.py --out out/d1-seed.sql`, then
  `cfrun wrangler d1 execute asnm-db-staging --remote --file out/d1-seed.sql -y`.
