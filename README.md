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
wrangler.json          production deployment plus named staging environment
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

| | prod (`asnm`) | staging (`asnm-staging`) |
|---|---|---|
| URL | adaptivesportsnearme.com | asnm-staging.adapt-to-life.workers.dev |
| Gate | `PRELAUNCH=true` (teaser + modal) | `PRELAUNCH=false` (full directory) |
| D1 | asnm-db | asnm-db-staging |
| Crons | validate 2h / enrich 20min | same |
| Deploys from | `main`, explicit, locked | `staging` |

**Branch model (Fall 2026):**

- `staging` is the student integration branch — closest to the tester. Branch off it. Open pull requests **into `staging`**.
- `main` is the production recipe and deploys to the live site on every push. Default branch stays `main`. Do not PR into it. Do not merge to it casually.
- Production remains gated by `PRELAUNCH=true`; a push to `main` deploys the current production recipe.
- Students: [docs/STUDENTS.md](docs/STUDENTS.md). Directory tools: [tools/directory/README.md](tools/directory/README.md).

The front-end hydrates from `/api/config` + `/api/programs`; if the API is absent or errors,
the inline sample stays and the page never breaks. Real listings render honestly: no
invented contact info, no unverified accessibility claims, gradient tiles for sports
outside the 11-photo launch set, state-centroid map pins marked `state-level`.

## Deploy

Cloudflare Workers Builds deploys the production worker from `main` using `wrangler.json`.
Named environments remain available for deliberate previews:

```
npx wrangler deploy --env staging
```

Production stays gated (`PRELAUNCH=true`).

## Secrets (per worker, via `wrangler secret put`)

`BEEHIIV_API_KEY`, `BEEHIIV_PUBLICATION_ID`, `TURNSTILE_SECRET_KEY`,
and `ADMIN_KEY` (enables `/api/admin/*`; unset = admin disabled, 401).

## Maintaining the data

- Cron lanes run on their own; results land in `pipeline_runs`, evidence in `link_checks`,
  proposals in `review_queue`.
- Review: `GET /api/admin/queue`, decide with `POST /api/admin/queue/:id {"action":"approve"}`.
- Manual lane run: `POST /api/admin/run/validate` (or `enrich`).
- Re-seed from Postgres: `scripts/pg-to-d1.py --out out/d1-seed.sql`, then
  `cfrun wrangler d1 execute asnm-db-staging --remote --file out/d1-seed.sql -y`.
