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

## Programs that come back

`db/migrations/0015_programs_that_come_back.sql` adds when a program comes back
(`programs.kind`, `seasons_json`, `usual_month`, `first_year`, `slug`, `listing`),
links a year's dates to its program (`events.program_id`, `events.recap_url`), and
the team-only `organization_activity` log
([docs/specs/programs-that-come-back.md](specs/programs-that-come-back.md)).
It only adds, and every existing program keeps today's behaviour. The site reads
the same before and after it runs (`src/schema-probe.js`), so it can go before or
after the deploy. Run it once per database (a second run stops at "duplicate
column name", harmlessly):

```sh
npx wrangler d1 execute asnm-db-staging --config wrangler.preview.json --remote --file db/migrations/0015_programs_that_come_back.sql
npx wrangler d1 execute asnm-db --config wrangler.json --remote --file db/migrations/0015_programs_that_come_back.sql
```

`db/maintenance/yearly_spooky_spokes.sql` then adds the first yearly event page
(`/events/spooky-spokes`: The Pickle Lodge, Spooky Spokes and its three years,
links only). It is safe to run twice.

## Accounts and saved items

`db/migrations/0016_profile_saved_items.sql` adds `profile_login_tokens` (one-time
email sign-in links for profiles) and `profile_saved_items` (saved organizations,
programs, events and grants), and copies every existing row from
`profile_favorites` into `profile_saved_items`.
`db/migrations/0017_profile_saved_sports.sql` adds `profile_saved_sports`.

Both only add, and both are safe to run twice (`IF NOT EXISTS`, `INSERT OR IGNORE`).
**Run both on a database before the code that serves `/account` reaches it.** There is
no fallback: without these tables a signed-in `GET /api/profile` (and
`/api/profile-auth/session`) returns 500, and sign-in links and saving fail. Run 0016
before 0017, staging first, then production:

```sh
npx wrangler d1 execute asnm-db-staging --config wrangler.preview.json --remote --file db/migrations/0016_profile_saved_items.sql
npx wrangler d1 execute asnm-db-staging --config wrangler.preview.json --remote --file db/migrations/0017_profile_saved_sports.sql
npx wrangler d1 execute asnm-db --config wrangler.json --remote --file db/migrations/0016_profile_saved_items.sql
npx wrangler d1 execute asnm-db --config wrangler.json --remote --file db/migrations/0017_profile_saved_sports.sql
```

### Release gate for main

1. **Migrations 0015, 0016 and 0017 must be applied on `asnm-db` before any
   merge to `main`, or at the latest as part of the merge step, never after.**
   Apply them on `asnm-db-staging` first. Run 0016 before 0017. 0015 has a
   schema probe fallback and does not depend on them; if it has already run, a
   second run stops harmlessly at "duplicate column name". 0016 and 0017 have no
   fallback: without them a signed-in `GET /api/profile` returns 500.
2. **After a `main` release that includes these migrations, do one signed-in
   check on production:** sign in with an email link, open `/account`, confirm
   `GET /api/profile` returns 200, and save one item.

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

Staff assign or clear a verified claim address in the passwordless `/admin`
dashboard. This is intentionally separate from the public organization email.

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

Open http://127.0.0.1:8888. `npm run dev` and `npm run preview` use
Wrangler's staging environment with local database storage. `npm run dev:local`
explicitly forces local bindings. Fresh local databases use the sample listings.
Map view is available at http://127.0.0.1:8888/maps, including with sample data.
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
`.dev.vars` file. Resend requests still use the real service when a key is
supplied, but dev, like staging, mails only the team addresses in `MAIL_ALLOW`
(see [Email](#email)); `--local` only keeps Cloudflare bindings local. See [Wrangler local development](https://developers.cloudflare.com/workers/local-development/).

## Architecture

```
public/index.html      the site (self-contained design; hydrates real data from /api/*)
public/manifest.json   PWA manifest (installable, mobile + desktop)
public/sw.js           service worker (offline shell, network-first API)
src/index.js           Worker: routing, forms (beehiiv, shared intake), config, cron entry
src/data.js            /api/programs /api/orgs/:id /api/stats (D1 reads + freshness decay)
src/pipeline.js        cron lanes: validate every 2h; dispatch hourly rotates enrich, classify, geocode, resolve (src/lanes/)
src/admin-access.js    /api/admin-auth/* and /api/admin-data/* passwordless admin dashboard
db/schema.sql          D1 schema, dumped from the live asnm-db (regenerate, don't hand-edit)
scripts/pg-to-d1.py    one-time migration: local Postgres → cleaned SQL → D1
wrangler.json          production deployment, `previews` block (Workers Previews), and local `env.staging`
```

**Data plane:** staging and the dedicated preview retain `asnm-db-staging` for
both `DB` and `INTAKE`. Production uses `asnm-db` and `atl-intake`. Staging and
preview use the live Resend team, but send mail and touch the newsletter list
only for the team addresses in `MAIL_ALLOW` ([Email](#email)); directory,
profile, and intake database writes stay in the staging database.

**Core invariant (kept from the original Postgres design):** pipeline lanes *propose*
changes into `review_queue`; a human approves them before anything touches `organizations`.
The old approve screen (`src/admin.js`, `/api/admin/*`) was removed in October 2026, and
nothing replaces it yet: `/admin` today reviews user submissions, not lane proposals. Until a
replacement ships, nothing can approve `review_queue` proposals, so they pile up as `pending`.
The direct writes are two evidence columns, both set by validate:
`last_ok_at` (liveness evidence, feeds the freshness score — half-life 45 days, computed in
the Worker) and `last_checked_at` (stale-first ordering). See the `src/pipeline.js` header.

**Environments:**

| | prod (`adaptivesportsnearme`) | staging preview (`adaptivesportsnearme`) |
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

One application Worker, `adaptivesportsnearme`, serves production and the isolated
`staging` [Worker Preview](https://developers.cloudflare.com/workers/previews/).
In its Cloudflare Settings > Builds configure:

- Production branch: `main`.
- Production deploy command: `npx wrangler@4 deploy --config wrangler.json`.
- Preview branch: `staging` only (so other branches cannot overwrite the named `staging` Preview).
- Preview command: `npx wrangler@4 preview src/staging.js --config wrangler.json --name staging`
  (or `npm run deploy:staging`).

The Worker Preview deploys from `wrangler.json`'s `previews` block (with top-level `assets`
and the HTTP-only `src/staging.js` entrypoint) instead of uploading a production Worker Version
with `wrangler versions upload`. Because Worker Previews are isolated from production Worker
Versions:

- Staging builds do not become the production Worker's newest uploaded version.
- Preview secrets are configured separately from production secrets — do not assume production secrets are inherited. A new `staging` Preview starts with no secrets and needs the required entries from `config/production-secrets.json` (such as `RESEND_API_KEY`, `NEWSLETTER_LINK_SECRET`, `RESEND_WEBHOOK_SECRET`, `TURNSTILE_SECRET_KEY`, and `ADMIN_AUTH_SIGNING_KEY` / `ORG_AUTH_SIGNING_KEY` / `PROFILE_SIGNING_KEY`). Set them via the Worker's Preview base config in Cloudflare, pass `--secrets-file` on deploy, or run `npx wrangler@4 preview secret put <NAME> --name staging` once the `staging` Preview exists.
- Preview URLs are served at `https://staging-adaptivesportsnearme.adapt-to-life.workers.dev`
  and, once `wrangler.json`'s `previews_enabled: true` custom-domain setting is deployed from
  `main`, at `https://staging.adaptivesportsnearme.com`.

An equivalent manual deploy from the staging checkout is:

```
npm run deploy:staging
```

Never run `wrangler deploy --env staging`: that would replace the production deployment
with staging code and bindings. Release production from `main` using production config,
not by promoting a staging-configured build.

**Do not change this Worker's variables or secrets in the Cloudflare dashboard while an older
branch upload is still the newest version.** A dashboard edit makes a new version from the
Worker's newest upload and deploys it. Historically, branch builds used `wrangler versions upload`,
so the newest upload was usually a staging build. On 2026-10-18, adding `ORG_AUTH_SIGNING_KEY` in
the dashboard deployed the staging preview to adaptivesportsnearme.com: `ENV_NAME=staging`
(`robots.txt` disallowed everything and every page said `noindex`), `asnm-db-staging` for `DB` and
`INTAKE`, and no cron handler (#87). Once staging builds run on Workers Previews and `main` has
been deployed cleanly once, staging no longer creates production Worker Versions and
`npx wrangler secret put` stops hitting error 10215; until that cutover finishes, keep following
the safeguard below.

- Variables: change them in `wrangler.json` and release from `main`.
- Secrets: before every production release, and again after it, run `npm run check:release`. It
  reads the live version and the newest upload (read only, your own Wrangler login) and says SAFE
  only when the newest upload holds every secret in `config/production-secrets.json`.
- While an older staging version upload is still the Worker's newest upload (before the next `main`
  deploy after switching Builds to Workers Previews), `npx wrangler secret put` is refused
  ("Secret edit failed ... the latest version of your Worker isn't currently deployed", error
  10215); add or restore secrets with `npx wrangler versions secret put NAME --name adaptivesportsnearme`
  (which makes a new version from the newest upload without deploying) and do not redeploy `main`
  to "reset" first if the newest upload is missing secrets. Once `main` is the newest deployed
  version again, standard `npx wrangler secret put NAME --name adaptivesportsnearme` works.
- After any change to the deployed Worker, open https://adaptivesportsnearme.com/robots.txt:
  production says `Allow: /`; staging settings say `Disallow: /`.

Production uses `ENV_NAME=production`, `PRELAUNCH=false`, `asnm-db` for `DB` and
`atl-intake` for `INTAKE`. Staging uses `ENV_NAME=staging`,
`PRELAUNCH=false`, and `asnm-db-staging` for both `DB` and `INTAKE`. Its entrypoint
exports only `fetch`. Worker Previews do not update the production Worker's routes or cron
triggers; those remain managed by the production deployment.

Verify production holds the runtime secrets listed in `config/production-secrets.json`
(`npm run check:release`) and that the `staging` Preview has its own Preview secrets configured.
Build variables and local `.dev.vars` files are not runtime secrets. No database schema is applied
by a preview deploy; newsletter and program-submission capture require `db/intake-schema.sql` in
the staging database. The existing `asnm-gate` config is a separate production signup route and is
not part of the staging preview setup.

### Custom-domain staging previews

The custom-domain tester is https://staging.adaptivesportsnearme.com, backed by
the named `staging` [Worker Preview](https://developers.cloudflare.com/workers/previews/custom-domains/).
`wrangler.json` defines both:

1. A top-level `previews` block (Wrangler **4.135.0 or later**) with explicit
   staging variables (`ENV_NAME=staging`, `PRELAUNCH=false`, `MAIL_ALLOW`), the
   `asnm-db-staging` bindings for `DB` and `INTAKE`, `SEND_EMAIL`, `FORM_LIMITER`,
   and observability. Top-level `assets` are inherited automatically; `src/staging.js`
   keeps Previews HTTP-only.
2. `previews_enabled: true` on the `adaptivesportsnearme.com` custom-domain route
   entry (without adding a production route for `staging.adaptivesportsnearme.com`).

When switching Cloudflare Workers Builds over from legacy `versions upload`:

1. Set the Production deploy command to `npx wrangler@4 deploy --config wrangler.json`
   (Wrangler 4.135.0+ is required for `previews` and `previews_enabled`) and set the
   Preview build command (restricted to the `staging` branch) to
   `npx wrangler@4 preview src/staging.js --config wrangler.json --name staging`.
2. Configure Preview runtime secrets for `staging` (the required keys in
   `config/production-secrets.json`, including `RESEND_API_KEY`, `NEWSLETTER_LINK_SECRET`,
   `RESEND_WEBHOOK_SECRET`, `TURNSTILE_SECRET_KEY`, and `ADMIN_AUTH_SIGNING_KEY` /
   `ORG_AUTH_SIGNING_KEY` / `PROFILE_SIGNING_KEY`). Previews do not inherit production
   secrets, so the first staging Preview starts with none: set them via Preview base config
   or `--secrets-file`, or run `npx wrangler@4 preview secret put <NAME> --name staging`
   right after the first Preview exists.
3. Deploy `main` with the `previews_enabled: true` route change so Cloudflare
   provisions the wildcard custom-domain certificate and routes `staging.adaptivesportsnearme.com`
   to the `staging` Preview (confirm no conflicting DNS record or route exists and
   that the RPI network viewing policy covers the custom hostname).
4. Check `/api/config` on **both** `https://staging-adaptivesportsnearme.adapt-to-life.workers.dev/api/config`
   (which shares the hostname of the legacy `--preview-alias staging` URL) and
   `https://staging.adaptivesportsnearme.com/api/config`: expect `env: "staging"` and
   `prelaunch: false`.

## Email

The design for all three Adapt To Life brands is `docs/EMAIL.md` in
[adapt-to-life](https://github.com/adapttolife/adapt-to-life/blob/staging/docs/EMAIL.md).
The rule: **sites send through Resend, people answer in Google Workspace.**
`src/mail-transport.js` is the same file in both repos; change them together.

- **From** `Adaptive Sports Near Me <hello@mail.adaptivesportsnearme.com>` (`MAIL_FROM`), Reply-To
  `hello@adaptivesportsnearme.com`. `MAIL_TRANSPORT=resend`, `MAIL_FROM_DOMAINS=mail.adaptivesportsnearme.com`.
  A From on any other domain is refused before the network.
- **Every send** has a stable `idempotencyKey` (Resend sends a repeat of the same key and body once
  for 24 hours) and `brand`/`kind` tags; the transport adds `env`. Keys: `signin-<kind>:<digest of the
  link>`, `confirm-<kind>:<intake id>`, `confirm-profile-updated:<profile id>:<digest of the saved
  values>`, `invite:<digest of the address>`, `welcome:<signup claim key>`, `intake:<intake id>`.
- **Staging, preview and dev** (`ENV_NAME` not `production`) mail only addresses on `MAIL_ALLOW`, and
  only those addresses can join or leave the real list there. Anything else is logged and dropped.
- **Sign-in links** are limited to 3 per address per 15 minutes (`src/signin-limit.js`), on top of the
  per-IP form limiter. The profile notice goes out only when a save changed something.
- **The newsletter.** `/api/subscribe` (the `asnm-gate` Worker in production) puts the contact in the
  ASNM Segment (`RESEND_SEGMENT_ID`) and opts them in to the ASNM Topic (`RESEND_TOPIC_ID`
  `9310c098-509b-49f6-b019-426e6ab5fd11`, "Adaptive Sports Near Me news", opt_out, public), then sends "You're on the list" with the unsubscribe link, the
  one click `List-Unsubscribe` headers, why they get it and Adapt To Life NFP's postal address.
- **`/unsubscribe`** (signed with `NEWSLETTER_LINK_SECRET`, never the Resend key; the signed token
  carries the brand) opts the contact out of the ASNM Topic only. A GET only shows one button; the
  change happens on POST (the button, or the RFC 8058 one click header), so link scanners never
  unsubscribe anyone. It never sets Resend's team wide `unsubscribed` flag: the team is shared with
  adapttolife.org and alectranel.com. The profile newsletter switch writes the same Topic.
- **Joining when already in the team** (Resend answers 409): the contact still gets the ASNM Topic and
  the welcome, and if they had unsubscribed from everything the team wide flag is cleared. Safe because
  every brand Topic is `opt_out`.
- **`/api/resend-events`** is Resend's webhook for this site: `email.delivered`, `email.bounced`,
  `email.complained`, `email.failed`, `email.delivery_delayed`, signed with `RESEND_WEBHOOK_SECRET`.
  Only events tagged `brand=asnm` and this Worker's `ENV_NAME` are stored (`resend_events`, once per
  `svix-id`). Broadcast events carry no custom tags, so production matches them by From domain
  (`MAIL_FROM_DOMAINS`).
- **`send_failures`** (INTAKE database) is the ledger an alert reads: a confirmation, notice, invite or
  welcome that did not go out, an intake notice parked in `review`, and every bounce, complaint or
  failure Resend reports. Same columns as adapt-to-life's table. Intake notices that Resend refuses
  with a retryable error (429, 5xx, timeout) go back in the queue for the `asnm-gate` cron, under
  the same key, for up to 23 hours.

`db/migrations/0028_mail_ledger.sql` adds `send_failures` and `resend_events` to the **INTAKE**
database. It only adds and is safe to run twice; run it before the Resend code ships (code without
it still sends, but ledger rows are lost and the webhook answers 503 until it exists):

```sh
npx wrangler d1 execute asnm-db-staging --config wrangler.preview.json --remote --file db/migrations/0028_mail_ledger.sql
npx wrangler d1 execute atl-intake --config wrangler.json --remote --file db/migrations/0028_mail_ledger.sql
```

Going back to Gmail is a config change only: `MAIL_TRANSPORT=gmail` and
`MAIL_FROM=hello@adaptivesportsnearme.com` (Gmail sends only as `GMAIL_FROM`).

## Secrets (per worker)

The production list lives in `config/production-secrets.json`: `ADMIN_AUTH_SIGNING_KEY`,
`ORG_AUTH_SIGNING_KEY`, `PROFILE_SIGNING_KEY`, `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`,
`NEWSLETTER_LINK_SECRET`, `RESEND_WEBHOOK_SECRET`, and, while Gmail stays as a fallback
transport, `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN`. `asnm-gate` needs
`RESEND_API_KEY` and `NEWSLETTER_LINK_SECRET` (it sends the welcome). Each Worker has its own
**full access** Resend key: both manage contacts and Topics, and Resend's sending-only keys cover
one domain and no contacts.

`send_failures` and `resend_events` in `atl-intake` are owned by this repo. adapt-to-life's schema
check (`scripts/check-d1-schema.mjs`) fails on tables it doesn't know, so they must be on its
`OWNED_ELSEWHERE` list before `0028_mail_ledger.sql` runs on `atl-intake`. `BETA_AUTH_SIGNING_KEY`
stays unset on purpose: beta sessions are signed with `ADMIN_AUTH_SIGNING_KEY`. `test/release-secrets.test.js` fails when the code starts reading a secret
that isn't on the list.

`adaptivesportsnearme` is one Worker for production and the staging previews: set its
secrets the way [Deploy](#deploy) describes, never in the Cloudflare dashboard. `asnm-gate`
is a separate Worker with no previews: `npx wrangler secret put NAME --config wrangler.gate.json`.

## Maintaining the data

- Cron lanes run on their own; results land in `pipeline_runs`, evidence in `link_checks`,
  proposals in `review_queue`. There is no screen to approve those proposals since the old
  `/api/admin/*` API was removed, so they accumulate until a replacement ships.
- Review user submissions in `/admin`; admins sign in with an `@adaptivesportsnearme.com`
  or `@faisaln.com` passwordless link.
- Cron lanes run on schedule; the retired bearer-key API no longer exposes manual lane triggers.
- Re-seed from Postgres: `scripts/pg-to-d1.py --out out/d1-seed.sql`, then
  `cfrun wrangler d1 execute asnm-db-staging --remote --file out/d1-seed.sql -y`.


## Agents and staff

Agents use the shared [GitHub discipline](https://github.com/Tranel-Labs/agentos/blob/main/skills/github-publication-review/SKILL.md), merged by Alec through [AgentOS #742](https://github.com/Tranel-Labs/agentos/pull/742). The standing staging-first rule also covers ATL and Adapt Body Shop's Hydrogen storefront. Keep one shared skill source, not per-bot variants; merged source is not proof of every runtime's adoption. Faisal N is the website reviewer/approver; a green check is not his approval or production-release permission.

Students: start with [docs/STUDENTS.md](STUDENTS.md). Short version:

- Branch off `staging`.
- Open a pull request **into `staging`**.
- Feature/fix PRs never target `main`. Only the project lead opens a separately approved `staging` → `main` release PR after staging acceptance.
- Never deploy production (`adaptivesportsnearme`). Never write `asnm-db`. Live public count stays 2,593.
- Tester: https://staging-adaptivesportsnearme.adapt-to-life.workers.dev
- Live (locked): https://adaptivesportsnearme.com

ATL and ASNM share this method: fetch current staging → feature/fix branch → PR into staging → separately reviewed staging-to-main release. Keep one current repair PR per repository and link cross-repository companions. Check `git merge-base --is-ancestor origin/staging HEAD` before review; preserve concurrent work.

Read-only CI checks PR routing, staging ancestry and the full suite; it never deploys. At setup inspection ASNM had no branch protection and ATL's plan rejected protection/ruleset access. Checks and written policy are not claimed as mandatory merge enforcement. Existing Cloudflare Builds may upload production-bound non-main versions; do not use those as isolated test environments. Verify traffic-serving versions after pushes.

Do not commit `.env`, Wrangler auth, 1Password output, tokens, or local pile dumps (`inbox/`, receipts, leftover candidates).
