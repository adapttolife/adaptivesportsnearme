# adaptivesportsnearme — AdaptiveSportsNearMe.com

The canonical site for **adaptivesportsnearme.com**: the Airbnb-style directory design, a
Cloudflare Worker with a **D1 data plane** (1,544 real organizations), a cron maintenance
pipeline, and an installable PWA. Production stays a gated pre-launch teaser; staging runs
the full ungated directory on real data.

## UI icons

Use Lucide HTML tags, such as `<i data-lucide="map-pin" aria-hidden="true"></i>`.
`public/icons.js` renders them on page load and whenever new UI is inserted.
Add `width`, `height`, `stroke-width`, or a CSS class to customize the icon;
colors inherit from the surrounding control. Keep accessible labels on buttons.
No generation or sync command is needed when adding or changing an icon name.
The full Lucide 1.49.0 JavaScript library and license are bundled in
`public/assets/vendor`, so icons work without a CDN connection.

## Local staging preview

From the repository root, run:

```sh
npm run dev
```

Open http://127.0.0.1:8787. `npm run dev` and `npm run preview` use
Wrangler's staging environment with local database storage. `npm run dev:local`
explicitly forces local bindings. Fresh local databases use the sample listings.

To run local code against the real staging database:

```sh
npx wrangler login
npm run dev:staging
```

`dev:staging` uses `wrangler.dev.json`: the application and assets run locally,
while `DB` and `INTAKE` connect to the existing `asnm-db-staging` database via
remote bindings. No data copy or deployment is needed. This requires Cloudflare
account access and internet connectivity. Database writes from forms, profiles,
and admin actions also affect the shared staging database; this is not a read-only
connection. Production databases are not selected.

Do not add `--local` to `dev:staging`, since it disables remote bindings.
Stop either server with Ctrl+C. `npx` may ask to download Wrangler on first use.
See [Cloudflare D1 local development](https://developers.cloudflare.com/d1/best-practices/local-development/).

For form integration testing, put the necessary runtime secrets in the ignored
`.dev.vars` file. External Beehiiv, Gmail, and Airtable requests still use real
services when credentials are supplied; `--local` only keeps Cloudflare bindings
local. See [Wrangler local development](https://developers.cloudflare.com/workers/local-development/).

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

**Data plane:** staging and the dedicated preview retain `asnm-db-staging` for
both `DB` and `INTAKE`. Production uses `asnm-db` and `atl-intake`. Staging and
preview use live production email, newsletter, and Airtable services; external
actions have real effects while directory, profile, and intake database writes
stay in the staging database.

**Core invariant (kept from the original Postgres design):** pipeline lanes *propose*
changes into `review_queue`; a human approves via `/api/admin/queue/:id` before anything
touches `organizations`. The one direct write is `last_ok_at` (liveness evidence, feeds
the freshness score — half-life 45 days, computed in the Worker).

**Environments:**

| | prod (`adaptivesportsnearme`) | staging version (`adaptivesportsnearme`) |
|---|---|---|
| URL | adaptivesportsnearme.com | staging-adaptivesportsnearme.adapt-to-life.workers.dev |
| Gate | `PRELAUNCH=true` (teaser + modal) | `PRELAUNCH=false` (full directory) |
| D1 | asnm-db + atl-intake | asnm-db-staging (DB + INTAKE) |
| Crons | validate every 2h / dispatch hourly | None (HTTP-only entrypoint) |
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

One application Worker, `adaptivesportsnearme`, serves the deployed production version
and an uploaded staging version. In its Cloudflare Settings > Builds configure:

- Production branch: `main`.
- Production deploy command: `npx wrangler deploy --config wrangler.json`.
- Preview branch: `staging` only (so other branches cannot move the staging alias).
- Preview command: `npx wrangler versions upload --config wrangler.preview.json --preview-alias staging`.

The preview URL is https://staging-adaptivesportsnearme.adapt-to-life.workers.dev.
An equivalent manual upload from the staging checkout is:

```
npx wrangler versions upload --env staging --preview-alias staging
```

Both configurations explicitly target the same Worker name. Use `versions upload`
for staging; `wrangler deploy --env staging` would replace the production deployment
with staging code and bindings. Release production from `main` using production config,
not by promoting a staging-configured version.

Production stays gated (`PRELAUNCH=true`). Staging uses `ENV_NAME=staging`,
`PRELAUNCH=false`, and `asnm-db-staging` for both `DB` and `INTAKE`. Its entrypoint
exports only `fetch`. Version uploads do not update the Worker's routes or cron
triggers; those remain managed by the production deployment.

Verify the uploaded version has the runtime secrets needed by Beehiiv, Gmail,
Airtable, profile signing, and admin authentication. Build variables and local
`.dev.vars` files are not runtime secrets. No database schema is applied by an
upload; newsletter capture requires `db/intake-schema.sql` in the staging database.
The existing `asnm-gate` config is a separate production signup route and is not
part of the staging preview setup.

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
