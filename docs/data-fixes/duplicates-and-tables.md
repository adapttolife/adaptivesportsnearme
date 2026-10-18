# Duplicates, the two databases, and the "missing" tables

For Faisal (data). Alec, 2026-10-18: "Help me, help Faisal." Answers Faisal's texts of 2026-10-17:
"why are some tables missing from the production database?" and "duplicate organizations … and more. There are
duplicate programs in both databases as well. Both of those issues need to be fixed before I go in and assign
new organizations to programs before the release."

Every number here comes from read-only queries on 2026-10-18. Your two scripts from 2026-10-17 had already run:
`merge_staging_duplicate_organizations.sql` on staging (all 31 pairs merged) and
`normalize_production_organization_programs.sql` on production (5 organizations, 10 programs). Nothing here redoes them.

## Start here

Three things, in order. Everything after this section is background, or can wait until after the release.

1. **The tables: nothing to do.** Production isn't missing anything the site needs. The four intake tables live in
   `atl-intake`, production's `INTAKE` database, on purpose. The rest are unused leftovers on staging (section 1).
2. **Run list 1 on production.** It folds 75 duplicate organizations into the 71 rows they copy. Nothing a visitor
   can see is lost except the duplicates. Four commands with a restore point are in "Running a script safely" below.
3. **Then assign organizations to the waiting programs, as you planned.** That's also what brings them back to
   search: the sport, state, near-you and map pages list organizations only, so the 535 waiting programs that could
   be listed have been missing from those pages, on the live site too, since they moved to programs. In
   `waiting-programs-suggested-organizations.csv`:
   - **Skip 8 rows:** 5 empty copies, like the second BORP row, and 3 links scraped from a site menu
     ("Programs", "Regional Programs", "Youth Programs").
   - **When you create an organization, give it the program's web address and city.** An organization with
     neither stays hidden by the site's rule (`ACTIONABLE` in `src/data.js`).
   - 28 rows suggest an existing organization. Check the "strong" ones too: a few share a general page.

Later, after the release, and none of it blocks the steps above: list 2 (section 3), list 3 (section 3), the 173
staging-only listings (section 2), and rebuilding staging from production.

## 1. The tables

Staging has 22 tables, production 16. The difference:

| On staging only | Where it is in production | What it is |
|---|---|---|
| `intake`, `intake_delivery_claims`, `newsletter_delivery_claims`, `newsletter_send_receipts` | In `atl-intake`, production's `INTAKE` database | Form and newsletter submissions. Production binds `DB` to `asnm-db` and `INTAKE` to `atl-intake`; staging points both at `asnm-db-staging`, so they all land in one place. The code says so in `src/index.js`: "In production DB (asnm-db) and INTAKE (atl-intake) are separate D1 databases." |
| `contact_outbox`, index `idx_org_intake_row` | Not there, not needed | Left on staging by the master-sheet and contacts work tested there in September (branch `spec-174-master-sheet`, never merged). No code reads them. |
| `d1_migrations` | Not there, not needed | An empty table wrangler created on staging. |
| column `organizations.notes_split_at` | Not there | Added by `db/migrations/0005_description_contract.sql` as a record of the September description repair. Nothing reads it. Optional, to make production match the migrations: `ALTER TABLE organizations ADD COLUMN notes_split_at TEXT;` |

Every other table, column and index is the same in both.

## 2. Two databases, two versions of the directory

| | In both | Production only | Staging only |
|---|---|---|---|
| organizations | 1,599 | 1,278 | 1,261 |
| programs | 225 | 357 | 320 |

- **Karen's research was loaded twice.** It went into staging on 2026-09-05 through the master sheet's intake, her
  state lists and veteran lists together (1,029 of the staging-only rows). Her veteran lists went into production
  on 2026-10-14 (954 of the production-only rows). Same organizations, different ids, so a fix in one database
  never reaches the other.
- **Even shared rows disagree.** Of the 1,599 shared organizations, these fields differ: who can see it (547), web
  address (267), city (246), description (180), state (99), sport (32), name (12).
- **Staging keeps cleanup that production lost.** Staging hides 586 rows: 346 name-only rows from the Alec-approved
  2026-09-01 cleanup, 207 marked `duplicate`, 30 `inactive` and 3 others. The 547 of them that production also has
  are all active there. The
  name-only rule now lives in code (`ACTIONABLE` in `src/data.js`), so those 346 stay hidden either way. Of the 207
  duplicates, 172 also exist in production and 18 of them are listed on the production site. They're in list 3.
- **Staging has listings production doesn't.** 164 organizations and 9 programs that can be listed have no twin in
  production. Most were added on 2026-08-23 and 2026-08-21: NFL-team wheelchair football, adaptive pickleball,
  goalball, soccer. They're in `staging-only-worth-keeping.csv`. 34 look like programs of an organization production already
  has, 3 share a site with several organizations, and 136 are new organizations. **Copy these into production before
  rebuilding staging**, or they are gone.

## 3. Duplicates in production, in three lists

### List 1: merge now (`duplicates-1-merge-now.csv`, `db/maintenance/duplicates_1_merge_now.sql`)

71 groups, 75 rows: the same organization listed more than once at the same place. Spelling and "Inc." variants, the
Paralympic Sport Club name next to the plain name, a copy with no state or city. Your examples are here:
Abilities Unlimited of the Carolinas (2 rows to 1) and AccesSurf Hawaii (3 rows to 1).

The script is your staging merge with one step added first: blanks on the kept row are filled from the rows folded
into it, so no web address, place or description is lost. Kentwood Parks & Recreation keeps its web page and gains
its city, for example. The kept row is chosen in this order: verified, has a web page, has a city, has a state,
oldest, longest description. No verified row is ever folded into an unverified one. If a kept row is gone by the
time the script runs, its pair is skipped.

| Rehearsal on a copy of production | Before | After |
|---|---|---|
| organizations | 2,877 | 2,802 |
| listed on the site | 1,908 | 1,896 |
| source links (2 were duplicates) | 2,129 | 2,127 |
| anything pointing at a missing row | 0 | 0 |

No organization drops off the site: every group that was listed before is listed after. 12 duplicate listings
disappear.

### List 2, later: places become programs (`duplicates-2-places-become-programs.csv`, `db/maintenance/duplicates_2_places_become_programs.sql`)

30 organizations listed once per place, almost all from Karen's research. Empath Health is listed 10 times, once for
each Florida city where it runs a Veterans Coffee Connection. This is your `normalize_production_organization_programs.sql`
pattern applied to the rest: one organization, each place a program, named from Karen's own "Programs:" text. A
copy with no city folds into the organization. The organization gets a plain description of what it runs: "Empath
Health runs veteran meetups in 9 places in Florida." An organization row is deleted only once its program copy is
in, and nothing moves onto a kept organization that is gone.

| Rehearsal, after list 1 | Before | After |
|---|---|---|
| organizations | 2,802 | 2,750 |
| programs | 582 | 662 |
| listed on the site | 1,896 | 1,844 |
| anything pointing at a missing row | 0 | 0 |

**Run this one only after the directory lists programs** (section 4). Until then, these 52 listings drop out of
sport, state and near-you search.

### List 3, later: look first (`duplicates-3-look-first.csv`)

156 groups that need a person's judgment, each with a suggested action. 123 have a row the site shows today, so
start with those.

| Kind | Groups | Shown on the site |
|---|---|---|
| same name in several states (chapters, or a national group listed per state) | 68 | 35 |
| one web page shared by differently named listings | 58 | 58 |
| same name and place, different web addresses | 6 | 6 |
| same name in different places | 6 | 6 |
| marked `duplicate` on staging, still listed in production | 18 | 18 |

**Achilles.** Production has 33 Achilles rows, but the site shows only 3: Achilles International in New York (with
its web site), in Washington DC, and Achilles International - Nashville (verified). The other 30 have no web page
and no city, so the site already hides them: 17 "Achilles International" rows with only a state, 12 chapter rows
like "Achilles Chicago" with no state at all, and "Achilles International Track". Suggestion: one organization,
Achilles International (the New York row), with each real chapter as a program with its own city and page. Staging
already has chapter pages for Chicago, Los Angeles, San Francisco, Greater Phoenix, Las Vegas, Utah and Nashville.

**ACEing Autism** is the biggest case people see: 23 organization rows on the live site, one per state, all on
aceingautism.org, plus 6 more waiting as programs. That's one organization with 29 places, the list 2 pattern
across states. It's here rather than in list 2 because which row is the organization's home is a judgment call.

### Duplicate programs

You were right that there are some. Among the waiting programs, 5 are empty copies of another row: the second BORP,
Adaptive Sports Program New Mexico, Lounsbury Adaptive Ski Program, Southeastern Wisconsin Adaptive Ski Program and
Keystone Adaptive Center. They're marked "skip" in the suggestions file. Otherwise the repeated names are real
places: ACEing Autism in six states, TAPS care groups in four Florida cities, Home Base in three. Staging has two more
twins, Pineland Farms VAST Program and Adaptive Sports Program of Ohio, with one copy of each already hidden.

## 4. Why the waiting programs are missing from search

`listingsSnapshot` in `src/data.js` builds the sport, state, near-you and map pages from the `organizations` table
alone. Programs appear only on `/programs` and on their organization's page. Checked on the review copy: none of the
200 programs fetched from `/api/programs` is in `/api/listings`.

- 572 programs wait under "Organization not yet assigned" in production. 537 have a web address or a city, and 535 of
  those have no listed organization with the same name, so they're missing from search.
- **That's true on the live site too**, which reads the same database. These rows were listings: 440 had their
  websites checked as listings before 10/15, some since June. Bay Area Outreach & Recreation Program (BORP),
  Adaptive Sports Program of Ohio and California Adaptive Rowing Program are examples. They left
  `adaptivesportsnearme.com/api/directory` when `move_program_rows_to_placeholder.sql` took rows with "program" in
  the name out of `organizations`.

**Your assignment work brings them back:** a program whose organization has a web address or a city is listed again
through that organization. That covers organizations with one place, which is most of these.

Later, the directory can list programs too, so an organization with several places, like ACEing Autism, shows up
near each of them. That's our front-end follow-up, it changes `/api/listings`, and we'll design it with you. It
doesn't block your assignment work. List 2 waits for it.

## 5. The order

Now:
1. Note a restore point, then run list 1 on production.
2. Assign organizations to the waiting programs.

After the release:
3. The directory lists programs (our front-end change, designed with you).
4. Run list 2.
5. Work list 3, visible groups first.
6. Copy `staging-only-worth-keeping.csv` into production, then rebuild staging from production so the two match.

You run the scripts. One person writing to the database at a time keeps changes from colliding.

## Running a script safely

```sh
# 1. Restore point: note the bookmark this prints
npx wrangler d1 time-travel info asnm-db

# 2. Count before (--file prints only a summary, so pass the check as a command; the "=" matters
#    because the file starts with a comment)
npx wrangler d1 execute asnm-db --remote --command="$(cat db/maintenance/duplicates_check_counts.sql)"

# 3. Run
npx wrangler d1 execute asnm-db --remote --file db/maintenance/duplicates_1_merge_now.sql

# 4. Count after, and compare with the tables above
npx wrangler d1 execute asnm-db --remote --command="$(cat db/maintenance/duplicates_check_counts.sql)"

# To undo (rewinds everything since the bookmark, including any other change made after it)
npx wrangler d1 time-travel restore asnm-db --bookmark=<bookmark from step 1>
```

## How this was checked

- Every query against `asnm-db`, `asnm-db-staging` and `atl-intake` was a read. The count check, run on production
  itself, returns this file's "Before" numbers: 2,877, 582, 2,129, 1,908 and no broken references.
- Production was copied twice: locally, and into a scratch Cloudflare D1 database (deleted afterwards). Both scripts
  ran on each, the way they would run on production, with the results above. Both copies matched production first:
  2,877 organizations, 582 programs, 1,908 listed.
- Checks on the lists: no verified row folded into an unverified one; no list 1 group mixes two cities; no row in
  both list 1 and list 2; no group drops off the site.
- Checks on the scripts, on copies: with a kept row deleted first (AccesSurf for list 1, Empath Health for list 2),
  its other rows survive and nothing points at a missing row. Running either script a second time changes nothing.
- Production had not changed between the copy and these lists (last organization update 2026-10-17 20:23 UTC). If it
  changes before you run them, recount with `duplicates_check_counts.sql` and expect small differences: every row
  is named by id, a row that's gone is skipped, and a pair whose kept row is gone is left alone.
