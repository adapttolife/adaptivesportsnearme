# Duplicates, the two databases, and the "missing" tables

For Faisal (data). Alec, 2026-10-18: "Help me, help Faisal." Answers Faisal's texts of 2026-10-17:
"why are some tables missing from the production database?" and "duplicate organizations … and more. There are
duplicate programs in both databases as well. Both of those issues need to be fixed before I go in and assign
new organizations to programs before the release."

Every number here comes from read-only queries on 2026-10-18. Your two scripts from 2026-10-17 had already run:
`merge_staging_duplicate_organizations.sql` on staging (all 31 pairs merged) and
`normalize_production_organization_programs.sql` on production (5 organizations, 10 programs). Nothing here redoes them.

## Start here

Alec, 2026-10-18: set this up now, not after the release. Every step below was rehearsed on a copy of production,
and the review link runs the new site on the finished data, so you can click through the end state before
production changes: https://asnm-review.adapt-to-life.workers.dev/near/Brandon%2C%20FL

**Nothing to do for the tables** (section 1). Then, in this order:

| # | When | Who | Step | Rehearsed on a copy of production |
|---|---|---|---|---|
| 1 | Now | Faisal | Run list 1: `duplicates_1_merge_now.sql` | 2,877 to 2,802 organizations, nothing a visitor sees lost but duplicates |
| 2 | Done 2026-10-18 | Faisal | Ran `staging_only_into_production.sql`: 173 listings that only staging has. The file was removed afterwards: it carried the private email and phone columns | +129 organizations, +41 programs |
| 3 | Now | Faisal | Rebuild staging from production: `scripts/rebuild-staging-from-production.sh` (dry run, then `--fire`) | staging matches production exactly; restore tested |
| 4 | Now | Faisal reviews | Merge PR #68: programs show in search as places | 2,616 listings, 723 of them programs |
| 5 | Now | Faisal | Assign organizations to the waiting programs, and work list 3 (section 3) | 579 waiting (step 6 attaches 9 more on its own); 97 groups to judge, 91 shown on the site |
| 6 | The day the new site goes live | Faisal | Run list 2: `duplicates_2_places_become_programs.sql`, then `duplicates_3_mechanical.sql` | 2,750 organizations after list 2; ACEing Autism one organization with 28 programs |
| 7 | After 6 | Faisal | Rebuild staging again, so it matches | as step 3 |

Steps 1 to 3 help the current live site too: duplicates go and staging's listings come back. Step 6 waits for the
new site because it turns organizations into programs, and the current live site lists organizations only, so
on it those places would disappear until the new site ships.

Tips for step 5, in `waiting-programs-suggested-organizations.csv`:
- Skip the 8 rows marked "skip": 5 empty copies, like the second BORP row, and 3 links scraped from a site menu.
- When you create an organization, give it the program's web address and city. An organization with neither
  stays hidden by the site's rule (`ACTIONABLE` in `src/data.js`).
- 28 rows suggest an existing organization. Check the "strong" ones too: a few share a general page.

You run the scripts: one person writing to the database at a time keeps changes from colliding. Each one has a
restore point and a count check ("Running a script safely").

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
  goalball, soccer. They're in `staging-only-worth-keeping.csv`, and
  `staging_only_into_production.sql` copied them into production (step 2, run 2026-10-18, file since removed because it carried private contact columns): 129 as organizations, 41 as
  programs (34 under the production organization that runs them, like the Kansas City Chiefs team under Midwest
  Adaptive Sports), with the sources they came from. 3 need a person to pick the parent: Lakeshore Demolition
  Wheelchair Rugby, Birmingham Hammers Wheelchair Football and a Challenged Athletes Foundation clinics row. Some of
  the new organizations read as programs of a parent production doesn't have yet, like GLASA Adaptive Pickleball;
  fold them during step 5. **Run it before rebuilding staging**, or these listings are gone.

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

### List 2, the day the new site goes live: places become programs (`duplicates-2-places-become-programs.csv`, `db/maintenance/duplicates_2_places_become_programs.sql`)

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

### List 3: the mechanical part, and what needs a person (`duplicates_3_mechanical.sql`, `duplicates-3-look-first.csv`)

The mechanical part is a script, run with list 2 (step 6), rehearsed after lists 1, 2 and the staging import:
- **One organization listed once per state on its own site** (15 organizations, 55 rows): one organization with each
  place a program, the list 2 pattern across states. ACEing Autism becomes one organization with 28 programs.
- **Empty copies next to their one real twin** (6 rows) fold in, like Wauwatosa Curling Club.
- **Waiting programs whose organization is obvious**, the same name on the same own site (9), are attached.

| Rehearsal, after lists 1, 2 and the staging import | Before | After |
|---|---|---|
| organizations | 2,879 | 2,833 |
| programs | 703 | 758 |
| anything pointing at a missing row | 0 | 0 |

What still needs a person is in `duplicates-3-look-first.csv`: 97 groups, each with a suggested action, 91 with a row
the site shows, worked out on the finished state so nothing in it is already handled.

| Kind | Groups | Shown on the site |
|---|---|---|
| one web page shared by differently named listings | 59 | 55 |
| same name in several states (chapters, or a national group listed per state) | 13 | 11 |
| marked `duplicate` on staging, still listed in production | 13 | 13 |
| same name and place, different web addresses | 6 | 6 |
| same name in different places | 6 | 6 |

**Achilles.** Production has 33 Achilles rows, but the site shows only 3: Achilles International in New York (with
its web site), in Washington DC, and Achilles International - Nashville (verified). The other 30 have no web page
and no city, so the site already hides them: 17 "Achilles International" rows with only a state, 12 chapter rows
like "Achilles Chicago" with no state at all, and "Achilles International Track". Suggestion: one organization,
Achilles International (the New York row), with each real chapter as a program with its own city and page. Staging
already has chapter pages for Chicago, Los Angeles, San Francisco, Greater Phoenix, Las Vegas, Utah and Nashville.

**ACEing Autism** was the biggest case people see: 23 organization rows on the live site, one per state, all on
aceingautism.org, plus 6 waiting as programs. The mechanical script makes it one organization with 28 programs;
"ACEing Autism - Atlanta" and one waiting row linked to a general USTA page stay in the judgment list.

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

The directory listing programs is PR #68 (step 4), so an organization with several places, like ACEing Autism, shows
up near each of them, and a program waiting for its organization shows in search without one named. List 2 and the
mechanical part of list 3 wait for it to be live.

## 5. Rebuilding staging

`scripts/rebuild-staging-from-production.sh` makes `asnm-db-staging` an exact copy of production's directory and adds the
empty intake tables staging's `INTAKE` binding needs. Staging keeps its database id, so no config or test changes.

- Dry run by default; `--fire` to do it; `--restore <backup>` to undo. It refuses to target production.
- It backs staging up first, and the drop and the load are one import. D1 runs an import all or nothing (checked:
  a failing statement rolls back everything before it), so staging is either fully replaced or left as it was.
- Tables are dropped children first and rows go in parents first, because a large D1 import checks foreign keys as
  it goes (`scripts/lib/d1-replace-file.mjs`).
- Rehearsed on scratch databases: a forced failure changed nothing, a rebuild matched the source exactly, and a
  restore brought the old state back.

## Running a script safely

```sh
# 1. Restore point: note the bookmark this prints
npx wrangler d1 time-travel info asnm-db

# 2. Count before (--file prints only a summary, so pass the check as a command; the "=" matters
#    because the file starts with a comment)
npx wrangler d1 execute asnm-db --remote --command="$(cat db/maintenance/duplicates_check_counts.sql)"

# 3. Run (one script per run, in the order above)
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
  its other rows survive and nothing points at a missing row. Running any script a second time changes nothing.
- The staging import and the mechanical part of list 3 were rehearsed after lists 1 and 2, with the results above.
  The review copy (`asnm-db-review-20261018b`) holds that finished state.
- The staging rebuild was rehearsed on scratch D1 databases (section 5), all deleted afterwards.
- Production had not changed between the copy and these lists (last organization update 2026-10-17 20:23 UTC). If it
  changes before you run them, recount with `duplicates_check_counts.sql` and expect small differences: every row
  is named by id, a row that's gone is skipped, and a pair whose kept row is gone is left alone.
