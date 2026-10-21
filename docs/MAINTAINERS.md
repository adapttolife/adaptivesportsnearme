# Maintainers' notes

How the site is deployed and operated: environments, databases, secrets and
Cloudflare settings. Contributors don't need any of this; start with the
[README](../README.md) and [CONTRIBUTING](../CONTRIBUTING.md).


The canonical site for **adaptivesportsnearme.com**: the Airbnb-style directory design, a
Cloudflare Worker with a **D1 data plane**, a cron maintenance pipeline, and an installable
PWA. Production runs the full directory (`PRELAUNCH=false`) on `asnm-db`; staging runs the
same code on `asnm-db-staging`.

## UI icons

Use Lucide HTML tags, such as `<i data-lucide="map-pin" aria-hidden="true"></i>`.
`public/icons.js` renders them on page load and whenever new UI is inserted.
Add `width`, `height`, `stroke-width`, or a CSS class to customize the icon;
colors inherit from the surrounding control. Keep accessible labels on buttons.
No generation or sync command is needed when adding or changing an icon name.
The full Lucide 1.49.0 JavaScript library and license are bundled in
`public/assets/vendor`, so icons work without a CDN connection.

## D1 read usage

The homepage loads `/api/directory` once for its full public dataset instead of
issuing a count and an offset scan for each 200 programs. All existing client
filters, distance sorting and map markers use that same dataset. The paginated
`/api/programs` endpoint remains available for other callers.

Directory, program search, stats and grant-list responses use the Worker Cache
API for five minutes, separated by host, environment and relevant parameters.
Concurrent misses in one Worker isolate share a load. Paginated counts also
reuse results for five minutes within each database binding. Public edits may
take five minutes to appear (paginated totals can take up to ten); admin,
profiles, location, form submissions and failed responses are never cached.

Apply the index migration to each database, then deploy the matching Worker
and frontend changes. Run staging first and verify before production:

```sh
npx wrangler d1 execute asnm-db-staging --config wrangler.preview.json --remote --file db/migrations/0006_read_indexes.sql
npx wrangler d1 execute asnm-db --config wrangler.json --remote --file db/migrations/0006_read_indexes.sql
```

The migration is repeatable and changes no program content. It indexes public
directory ordering, case-insensitive admin ordering, source linkage and pending
review ordering. Building indexes consumes some reads/writes once; subsequent
writes also maintain them.

## Organization management access

`db/migrations/0008_organization_access.sql` adds `organizations.claim_email`
and the passwordless login tables. Set `claim_email` only after staff verify the
claimant’s connection to the program; it is the login address and may differ
from the public organization email. Apply it to staging before production:

```sh
npx wrangler d1 execute asnm-db-staging --config wrangler.preview.json --remote --file db/migrations/0008_organization_access.sql
npx wrangler d1 execute asnm-db --config wrangler.json --remote --file db/migrations/0008_organization_access.sql
```

Set the `ORG_AUTH_SIGNING_KEY` secret once, on the `adaptivesportsnearme` Worker, the way
[Deploy](#deploy) describes, never in the Cloudflare dashboard. Staging previews are versions
of that same Worker, and previews uploaded afterwards carry the secret. Claimants
request a one-time email link at `POST /api/org-auth/request-link`; authenticated
sessions can read and update only organizations whose `claim_email` matches the
verified address through `/api/organizations/:id/manage`.

Staff assign or clear a verified claim address with the existing admin bearer key:
`PATCH /api/admin/organizations/:id/claim-email` and a JSON body containing
`claim_email`. This is intentionally separate from the public organization email.

Cloudflare's free allowance is **5 million rows read per day per account**,
shared across databases, not five million for each staging/production database.
See [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/).
Cache entries are local to Cloudflare data centers and may be evicted. These
changes reduce reads but cannot guarantee a daily ceiling with arbitrary traffic
or external query clients. After rollout, compare both databases' Metrics > Row
Metrics over a full day, and review D1 query insights for remaining callers:

```sh
npx wrangler d1 insights asnm-db --config wrangler.json --sort-by=rows_read --sort-type=sum
npx wrangler d1 insights asnm-db-staging --config wrangler.preview.json --sort-by=rows_read --sort-type=sum
```

## Local staging preview

From the repository root, run:

```sh
npm run dev
```

Open http://127.0.0.1:8787. `npm run dev` and `npm run preview` use
Wrangler's staging environment with local database storage. `npm run dev:local`
explicitly forces local bindings. Fresh local databases use the sample listings.
Map view is available at http://127.0.0.1:8787/maps, including with sample data.
Map tiles need internet access and a browser with WebGL support. Sample listings
without coordinates remain in the list but do not produce map pins; use the
staging database below to preview real program locations.

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
`.dev.vars` file. External Beehiiv and Gmail requests still use real
services when credentials are supplied; `--local` only keeps Cloudflare bindings
local. See [Wrangler local development](https://developers.cloudflare.com/workers/local-development/).

## Architecture

```
public/index.html      the site (self-contained design; hydrates real data from /api/*)
public/manifest.json   PWA manifest (installable, mobile + desktop)
public/sw.js           service worker (offline shell, network-first API)
src/index.js           Worker: routing, forms (beehiiv, shared intake), config, cron entry
src/data.js            /api/programs /api/orgs/:id /api/stats (D1 reads + freshness decay)
src/pipeline.js        cron lanes: validate every 2h; dispatch hourly rotates enrich, classify, geocode, resolve (src/lanes/)
src/admin.js           /api/admin/* review queue (ADMIN_KEY bearer)
db/schema.sql          D1 schema (ported from adaptivesportsnearme-data's Postgres design)
scripts/pg-to-d1.py    one-time migration: local Postgres → cleaned SQL → D1
wrangler.json          production deployment plus named staging environment
```

**Data plane:** staging and the dedicated preview retain `asnm-db-staging` for
both `DB` and `INTAKE`. Production uses `asnm-db` and `atl-intake`. Staging and
preview use live production email and newsletter services; external
actions have real effects while directory, profile, and intake database writes
stay in the staging database.

**Core invariant (kept from the original Postgres design):** pipeline lanes *propose*
changes into `review_queue`; a human approves via `/api/admin/queue/:id` before anything
touches `organizations`. The direct writes are two evidence columns, both set by validate:
`last_ok_at` (liveness evidence, feeds the freshness score — half-life 45 days, computed in
the Worker) and `last_checked_at` (stale-first ordering). See the `src/pipeline.js` header.

**Environments:**

| | prod (`adaptivesportsnearme`) | staging version (`adaptivesportsnearme`) |
|---|---|---|
| URL | adaptivesportsnearme.com | staging-adaptivesportsnearme.adapt-to-life.workers.dev |
| Gate | `PRELAUNCH=false` (full directory) | `PRELAUNCH=false` (full directory) |
| D1 | asnm-db + atl-intake | asnm-db-staging (DB + INTAKE) |
| Crons | validate every 2h / dispatch hourly | None (HTTP-only entrypoint) |
| Deploys from | `main`, explicit, locked | `staging` |

**Branch model (Fall 2026):**

- `staging` is the student integration branch — closest to the tester. Branch off it. Open pull requests **into `staging`**.
- `main` is the production recipe and deploys to the live site on every push. Default branch stays `main`. Do not PR into it. Do not merge to it casually.
- Production runs with `PRELAUNCH=false`; a push to `main` deploys the current production recipe.
- Students: [docs/STUDENTS.md](STUDENTS.md). Directory tools: [tools/directory/README.md](../tools/directory/README.md).

The front-end hydrates from `/api/config` + `/api/programs`; if the API is absent or errors,
the inline sample stays and the page never breaks. Real listings render honestly: no
invented contact info, no unverified accessibility claims, gradient tiles for sports
outside the 11-photo launch set, state-centroid map pins marked `state-level`.

## Deploy

RCOS student developers at RPI can **view staging URLs without a Cloudflare
account** while connected to RPI WiFi or the RPI VPN. Off campus, connect to
the RPI VPN first. This viewing policy does not grant Cloudflare administration,
deployment, or remote database access.

One application Worker, `adaptivesportsnearme`, serves the deployed production version
and an uploaded staging version. In its Cloudflare Settings > Builds configure:

- Production branch: `main`.
- Production deploy command: `npx wrangler deploy --config wrangler.json`.
- Preview branch: `staging` only (so other branches cannot move the staging alias). Check
  it: on 2026-10-19 the live setting uploaded every branch except `main`, so each pull
  request branch moved the alias and became the Worker's newest version.
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

**Never change this Worker's variables or secrets in the Cloudflare dashboard.** A dashboard
edit makes a new version from the Worker's newest upload and deploys it. Branch builds
upload versions to this Worker, so the newest upload is usually a branch preview with
staging settings. On 2026-10-18, adding `ORG_AUTH_SIGNING_KEY` in the dashboard deployed
the staging preview to adaptivesportsnearme.com: `ENV_NAME=staging` (`robots.txt`
disallowed everything and every page said `noindex`), `asnm-db-staging` for `DB` and
`INTAKE`, and no cron handler (#87).

- Variables: change them in `wrangler.json` and release from `main`.
- Secrets: run `npx wrangler secret put NAME` right after a production deploy, while the
  deployed version is still the newest. If Wrangler says "Secret edit failed ... the latest
  version of your Worker isn't currently deployed", a branch has uploaded since. Don't use
  either fix it suggests: both act on that branch's version. Redeploy `main` (re-run its
  latest build in Cloudflare, or `npx wrangler deploy` from a clean checkout of `main`),
  then run the command again.
- After any change to the deployed Worker, open https://adaptivesportsnearme.com/robots.txt:
  production says `Allow: /`; staging settings say `Disallow: /`.

Production uses `ENV_NAME=production`, `PRELAUNCH=false`, `asnm-db` for `DB` and
`atl-intake` for `INTAKE`. Staging uses `ENV_NAME=staging`,
`PRELAUNCH=false`, and `asnm-db-staging` for both `DB` and `INTAKE`. Its entrypoint
exports only `fetch`. Version uploads do not update the Worker's routes or cron
triggers; those remain managed by the production deployment.

Verify the uploaded version has the runtime secrets needed by Beehiiv, Gmail,
profile signing, and admin authentication. Build variables and local
`.dev.vars` files are not runtime secrets. No database schema is applied by an
upload; newsletter and program-submission capture require `db/intake-schema.sql` in the staging database.
The existing `asnm-gate` config is a separate production signup route and is not
part of the staging preview setup.

### Custom-domain staging previews

The intended custom-domain tester is https://staging.adaptivesportsnearme.com.
Enabling `adaptivesportsnearme.com` for Production and Preview configures its
preview hostname support, but does not turn an uploaded Version URL alias into
a Worker Preview. Our current `versions upload --preview-alias staging` command
and `wrangler.preview.json` still use the former workflow. Re-running that
command does not create the named Worker Preview required by the new hostname.
See [Cloudflare's workflow comparison](https://developers.cloudflare.com/workers/previews/compare-workflows/).

To migrate, a maintainer should:

1. Use Wrangler **4.135.0 or later** and configure a `previews` block. Explicitly
   include staging variables (`ENV_NAME=staging`, `PRELAUNCH=false`), the
   `asnm-db-staging` bindings for `DB` and `INTAKE`, and required runtime
   bindings. Configure Preview secrets as well; do not assume production
   settings or secrets are inherited. Keep assets at the top level. Follow
   [Preview configuration](https://developers.cloudflare.com/workers/previews/configuration/).
2. Preserve the domain's Production and Preview setting in the configuration
   that manages production routes: the existing `adaptivesportsnearme.com`
   custom-domain entry should have `previews_enabled: true`. Do not add a
   production route for `staging.adaptivesportsnearme.com` or deploy staging
   configuration as production. See
   [custom-domain Preview setup](https://developers.cloudflare.com/workers/previews/custom-domains/).
3. After preparing that configuration, change the staging branch's build
   command to `npx wrangler preview --config <prepared-config> --name staging`.
   This creates a Preview under the same Worker; it does not require a second
   application Worker. The current files have not yet been migrated.
4. Confirm the named `staging` Preview exists, its custom-domain URL is listed,
   wildcard DNS/certificate provisioning has completed, and no explicit DNS
   record or route conflicts with `staging.adaptivesportsnearme.com`. Ensure
   the RPI network viewing policy covers the custom hostname too.
5. Check `/api/config` on the new hostname: expect `env: "staging"` and
   `prelaunch: false`. Check directory and form bindings before adopting it as
   the tester URL. Keep the current `workers.dev` link available during migration.

This is deployment configuration, not an application path-routing change.
The repository configuration explains a likely cause of a 404; live account
settings, DNS, and certificate status must also be checked in Cloudflare.

## Secrets (per worker, via `wrangler secret put`)

`BEEHIIV_API_KEY`, `TURNSTILE_SECRET_KEY`, `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`,
`GMAIL_REFRESH_TOKEN`, `PROFILE_SIGNING_KEY`, `ORG_AUTH_SIGNING_KEY`, and `ADMIN_KEY`
(enables `/api/admin/*`; unset = admin disabled, 401). `BEEHIIV_PUBLICATION_ID` is a
variable in `wrangler.json`.

`adaptivesportsnearme` is one Worker for production and the staging previews: set its
secrets the way [Deploy](#deploy) describes, never in the Cloudflare dashboard. `asnm-gate`
is a separate Worker with no previews: `npx wrangler secret put NAME --config wrangler.gate.json`.

## Maintaining the data

- Cron lanes run on their own; results land in `pipeline_runs`, evidence in `link_checks`,
  proposals in `review_queue`.
- Review: `GET /api/admin/queue`, decide with `POST /api/admin/queue/:id {"action":"approve"}`.
- Manual lane run: `POST /api/admin/run/<lane>`, where lane is `validate`, `enrich`, `classify`,
  `resolve`, `geocode` or `dispatch` (`src/admin.js`).
- Re-seed from Postgres: `scripts/pg-to-d1.py --out out/d1-seed.sql`, then
  `cfrun wrangler d1 execute asnm-db-staging --remote --file out/d1-seed.sql -y`.


## Agents and staff

Agents use the shared [GitHub discipline](https://github.com/Tranel-Labs/agentos/blob/main/skills/github-publication-review/SKILL.md), merged by Alec through [AgentOS #742](https://github.com/Tranel-Labs/agentos/pull/742). The standing staging-first rule also covers ATL and Adapt Body Shop's Hydrogen storefront. Keep one shared skill source, not per-bot variants; merged source is not proof of every runtime's adoption. Faisal N is the website reviewer/approver; a green check is not his approval or production-release permission.

Students: start with [docs/STUDENTS.md](STUDENTS.md). Short version:

- Branch off `staging`.
- Open a pull request **into `staging`**.
- Feature/fix PRs never target `main`. Only the project lead opens a separately approved `staging` → `main` release PR after staging acceptance.
- Never deploy production (`adaptivesportsnearme`). Never write `asnm-db`. Live public count stays 1,544.
- Tester: https://staging-adaptivesportsnearme.adapt-to-life.workers.dev
- Live (locked): https://adaptivesportsnearme.com

ATL and ASNM share this method: fetch current staging → feature/fix branch → PR into staging → separately reviewed staging-to-main release. Keep one current repair PR per repository and link cross-repository companions. Check `git merge-base --is-ancestor origin/staging HEAD` before review; preserve concurrent work.

Read-only CI checks PR routing, staging ancestry and the full suite; it never deploys. At setup inspection ASNM had no branch protection and ATL's plan rejected protection/ruleset access. Checks and written policy are not claimed as mandatory merge enforcement. Existing Cloudflare Builds may upload production-bound non-main versions; do not use those as isolated test environments. Verify traffic-serving versions after pushes.

Do not commit `.env`, Wrangler auth, 1Password output, tokens, or local pile dumps (`inbox/`, receipts, leftover candidates).
