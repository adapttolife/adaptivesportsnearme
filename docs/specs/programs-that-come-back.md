# Programs that come back: seasons, yearly events and history

- **Status:** built (this pull request)
- **Owner:** Alec (decides) · Karen (the confirm-your-listing push) · Faisal (reviews; the only writer to production D1)
- **Database change:** `db/migrations/0015_programs_that_come_back.sql`, additive only. The site reads the same before and after it runs.

## The pattern

Everything an organization offers comes back. A ski program runs every winter. A tournament happens every October. A tennis clinic runs all year. A clinic in March happens once. Today the site can't say any of that, so a ski program looks dead in July, and a yearly tournament vanishes the day after it ends and loses its history.

One model fits all of them:

| Layer | What it is | Where it lives |
|---|---|---|
| **Organization** | Who runs it | `organizations` (as today) |
| **Program** | What they offer: a sport they run, or an event they hold. Says **when it comes back**: its seasons (a program) or its usual month (a yearly event). | `programs` (as today, plus `kind`, `seasons_json`, `usual_month`, `first_year`, `slug`, `listing`) |
| **Dates** | Each time it actually happens: that year's dates, sign-up link and, afterward, a results or photos link | `events` (as today, plus `program_id`, `recap_url`) |

**History falls out of it.** An organization's past is its past dates, in order, plus when it joined the directory and when it last updated its listing. Nobody writes it.

Words (Alec and Faisal, 2026-10-15): the listing is an **organization**; a **program** is what it offers. A yearly event is a program whose `kind` is `event`.

## Who it's for, and what each of them needs

**An athlete or a family**, usually on a phone: *Is this real, is it running, when can I go, how do I sign up?*
- A program says its seasons in plain words: "Skiing · Winter", "Tennis · Year-round".
- A yearly event never looks stale. Between years: "Every year since 2024. Usually late October. The 2027 dates aren't announced yet." Once dates are set: "4th annual · Oct 22 to 24, 2027 · Register".
- Past years show where and when, with a link to the host's results and photos. **Never athletes' names** (Alec, 2026-10-25); linking out needs nothing.
- An organization's page shows its **history**: "On Adaptive Sports Near Me since March 2025 · Last updated by the organization, October 2026", and the years of its events. Only what can be trusted counts as "updated by the organization": a confirmation a person on our team applied, or an edit by the signed-in organization. The confirm form is open to anyone, so a form alone doesn't count until it's applied.

**An organization**, confirming its listing once (Karen's push): *Make it quick, and don't ask me again in three months.*
- One link: `/update/<id>?rel=run`. One form: tick every sport you run, pick its seasons, add the events you hold every year (name, usual month, link). About two minutes.
- Signed-in organizations (`/manage`) get the same checklist, and an event they add can be marked **We hold this every year**, which files it under that event's page.

**Our team** (Karen, Faisal, Alec): *Read every change, apply it in one click, and know where each organization stands.*
- A confirmation arrives in the admin review queue as "Organization confirming its listing". **Apply** writes its programs and seasons and starts its yearly event pages. Applying isn't the Verified check; that stays the organization's own yes.
- Each organization's admin page shows its **activity**: confirmations and fixes received, what was applied, what the organization edited itself, and notes the team adds ("Emailed Oct 26", "Called, wants winter added"). Team-only, never public.

## How programs show in lists

A person looks for a sport at a place (Alec, 2026-10-17), so a program with **its own place** is its own card, as today. But a sport an organization ticks on the checklist happens at the organization's own place, so it **rides on the organization's card** (`programs.listing = 'with_org'`): one card, "Mountain Adaptive · Skiing, Sailing and Cycling", found under each sport. This keeps a multi-sport organization from filling a city list with six cards of itself.

- `listing = 'own'` (every program today): its own card, as before.
- `listing = 'with_org'`: no card of its own; the organization's card and page carry it, and search by sport finds the organization. It still has a page (`/programs/<id>`), linked from the organization's page.
- `kind = 'event'`: a yearly event. It isn't a directory card. It lives on the events page, the organization's page, and its own page.

## Pages

| Address | What it shows |
|---|---|
| `/organizations/<id>` | As today, plus each program with its seasons, **Yearly events**, and **History** |
| `/programs/<id>` | As today, plus its seasons. For a yearly event, the yearly event page below |
| `/events/<slug>` | The yearly event page (`/events/spooky-spokes`): next dates or "not announced yet", about, host, past years |
| `/events` | The dated calendar (as today) plus **Yearly events**, ordered by when each comes round next |

## Rules (`public/app/yearly.js`, shared by the Worker and the browser)

- **Seasons** are spring, summer, fall, winter; all four read "Year-round"; none means the organization hasn't said.
- **"Nth annual"** counts from `first_year` (`year - first_year + 1`). Without a first year, no number, never a guess.
- **"Usually late October"** comes from the newest year's start date (days 1 to 10 early, 11 to 20 mid, 21 on late); before any dates, from `usual_month`.
- **The next dates** are the soonest that haven't ended. A cancelled year is skipped.

## Data (migration 0015)

| Column or table | Meaning |
|---|---|
| `programs.kind` | `program` (default) or `event` (a yearly event) |
| `programs.seasons_json` | `["winter"]`; empty = not said |
| `programs.usual_month`, `programs.first_year` | For yearly events: usual month (1 to 12), year of the 1st annual |
| `programs.slug` | A readable address for a yearly event (`spooky-spokes`), unique when set |
| `programs.listing` | `own` (default, today's behaviour) or `with_org` |
| `events.program_id` | The program a dated event belongs to; empty = a one-time event, as today |
| `events.recap_url` | That year's results or photos page on the host's site |
| `organization_activity` | Team-only log per organization: `kind` (`confirmation`, `fix`, `applied`, `self_edit`, `admin_edit`, `note`), a one-line `summary`, who, when |

Saving sports also fills `organizations.sports_json` with every sport, so search by sport finds the organization under each one.

## API

| Route | Returns |
|---|---|
| `GET /api/events` | As today, plus `program_id`, `recap_url`, `series: { slug, name, first_year }` |
| `GET /api/event-series` (`?org=<id>`) | Yearly events with every public year |
| `GET /api/event-series/:slug` | One yearly event (by slug, or by program id) |
| `/api/listings`, `/api/organizations/:id` | Organizations carry `seasons: [{ key, seasons }]` from their programs; the organization page also gets `history` |
| `GET/POST /api/admin-data/organizations/:id/activity` | The team-only activity log, and adding a note |

## Releasing

1. Review and merge into `staging`.
2. Run the migration on staging (it only adds; the site works before and after):
   `npx wrangler d1 execute asnm-db-staging --config wrangler.preview.json --remote --file db/migrations/0015_programs_that_come_back.sql`
3. Optional, for real content: `db/maintenance/yearly_spooky_spokes.sql` adds The Pickle Lodge and Spooky Spokes (2024, 2025, 2026; links only).
4. On release to production, run 2 and 3 against `asnm-db` with `--config wrangler.json`. Then Karen's push can start.

## Not in this change

- An email when next year's dates are posted ("tell me when"). It needs consent and an unsubscribe path; it's its own piece.
- Months per program ("December to March"). Seasons are enough to stop a listing looking dead off-season.
- Dated seasons for programs ("Winter 2026 to 27 sign-ups open Oct 1"). The model allows it (a program's dates are `events` rows), the forms don't ask yet.
