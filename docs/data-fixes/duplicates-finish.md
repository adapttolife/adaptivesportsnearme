# Finish the duplicates: one file

For Faisal. Alec, 2026-10-18: "Get this right. Let's make this easy and set Faisal up for success." Answers your
text: "I still see many duplicates for organizations and programs, for some reason the number is going up.
Duplicates for 'Achilles International' went from 16 to 19, and the other duplicates weren't removed."

One file finishes the duplicates in production: `db/maintenance/duplicates_finish.sql`. After it, no two
organizations share a name and no two programs share a name. `db/maintenance/duplicates_report.sql` shows it: on
production today it returns 75 rows, after the file it returns none. The file replaces lists 2 and 3 and the
look-first list; every decision they made is in it, and the groups they left are decided too.

## Why the number went up

Nothing added rows. Staging had 16 "Achilles International" rows because staging kept a September cleanup that
production never got. Production has had 19 since 2026-06-10, all loaded in one batch from the US Paralympics club
finder. Rebuilding staging from production (step 3 of the old brief) gave staging production's 19. List 1 folded only
exact copies at the same place; the rest waited for lists 2 and 3, which never ran.

The live site shows them too: its directory serves all 2,931 rows today, with 69 names repeated, 19 of them
"Achilles International".

## What counts as a duplicate

Two organizations with the same name, or two programs with the same name (case and outer spaces ignored). That's
what the report checks, the same way you count. Different organizations or places that share a name carry their
place in it: Special Olympics Colorado and Special Olympics New York, Portland Vet Center (Maine) and Portland Vet
Center (Oregon), Achilles Boston.

## Steps

| # | Who | Step | Result on a copy of production |
|---|---|---|---|
| 1 | Faisal, optional | Try it on staging first and click around the staging site | the new site's own code shows the result |
| 2 | Faisal | Merge the release (#46), then run the file on production and the report | report: 75 rows before, none after |
| 3 | Faisal | Rebuild staging from production: `scripts/rebuild-staging-from-production.sh`, dry run, then `--fire` | staging matches production again |
| 4 | Faisal | Assign organizations to the waiting programs: `waiting-programs-suggested-organizations.csv` | 560 waiting; the list matches the finished database |

```sh
# Staging (step 1)
npx wrangler d1 execute asnm-db-staging --remote --file db/maintenance/duplicates_finish.sql
npx wrangler d1 execute asnm-db-staging --remote --command="$(cat db/maintenance/duplicates_report.sql)"

# Production (step 2): restore point, count, run, report, count
npx wrangler d1 time-travel info asnm-db
npx wrangler d1 execute asnm-db --remote --command="$(cat db/maintenance/duplicates_check_counts.sql)"
npx wrangler d1 execute asnm-db --remote --file db/maintenance/duplicates_finish.sql
npx wrangler d1 execute asnm-db --remote --command="$(cat db/maintenance/duplicates_report.sql)"
npx wrangler d1 execute asnm-db --remote --command="$(cat db/maintenance/duplicates_check_counts.sql)"

# To undo (rewinds everything since the bookmark, including any other change made after it)
npx wrangler d1 time-travel restore asnm-db --bookmark=<bookmark from time-travel info>
```

**When.** Best right after the release. The live site's current code lists organizations only, so until the release
it shows Buddy Up for Life once instead of in its 12 cities: 176 places like that move into programs and come back
when the new site is live. If the release has to wait, the file can still run first. The live site then loses its 69
repeated names and 24 menu pages.

## What the file does

Every row it touches, and why, is in `duplicates-finish.csv`, one line each.

| Step in the file | Rows | Examples |
|---|---|---|
| 1. Pages from a website's menu, removed | 24 | "Our Board", "History", "Media + Press": the Challenged Athletes Foundation site menu, listed as organizations. The new site already hides them in code (`public/app/listable.js`), whose note asks to drop them at the source |
| 2. The same organization stored twice, folded into one row | 121 | 84 hidden, name-only copies from a second directory ("National Ability Center" next to "National Ability Center – Park City"); N.E.I.G.H. next to its full name; Faisal's own staging pairs that never reached production (Denver Rolling Nuggets, the misspelled University of Southern Mississippi row, Adaptive Adventures) |
| 3. One organization, its places and programs | 260 programs under 85 organizations | Achilles International: 27 chapters, each with its city and page from achillesinternational.org/find-a-chapter, plus its waiting South Florida program. ACEing Autism: 29 programs. Buddy Up for Life (buddyuptennis.com now opens buddyupforlife.org): Buddy Up Tennis in 12 cities. Empath Health: 9 coffee groups |
| 4. Waiting programs whose organization is now plain | 19 | Love Serving Autism in Florida and Richmond; VA Maryland Health Care System's two |
| 5. Organization names and web addresses | 22 | Special Olympics Colorado and New York; Reins of Life (Indiana) and (Pennsylvania), two different riding centers; NC Tennis For Life, its own organization in Cary |
| 6. Descriptions that say where an organization runs | 66 | "Empath Health runs veteran meetups in 9 places in Florida." Only where the old text was one place's; it moves to that place's program. The 18 approved descriptions are untouched |
| 7. Programs that shared a name get their place | 23 | Tragedy Assistance Program for Survivors (TAPS), Tampa |

A program keeps its old row's id, so its link checks and review items follow it. A row is deleted only once its
copy or its program exists, nothing moves onto a missing row, and a second run changes nothing.

## Result

On a copy of production taken 2026-10-18 04:30 UTC, and the same on a scratch D1 database (deleted afterwards):

| | Before | After |
|---|---|---|
| organizations | 2,931 | 2,610 |
| programs | 623 | 883 |
| report rows (names used twice) | 75 | 0 |
| new site listings, from its own code | 2,543 | 2,553 |
| new site names shown twice | 69 | 0 |
| live site rows, from its own code | 2,931 | 2,610 |
| waiting programs | 579 | 560 |
| anything pointing at a missing row | 0 | 0 |

## Not duplicates

- **One web page, different organizations.** 138 organizations share 31 web pages with other organizations: USTA's
  adaptive tennis page (30), a league's team list, an events calendar. They're different organizations with a page
  standing in for their own. They're in `shared-web-pages.csv` for a later website fix.
- **Chapters with their own names**, like the 39 Team River Runner chapters, appear once each. Grouping them under a
  parent is assignment work, not a duplicate.
- **Adaptive Tennis US** in Maryland and New Jersey: nothing confirms they're one organization, and
  adaptivetennisus.com no longer answers and its last saved copy (November 2025) shows an unrelated company. Both
  stay, with their state in the name.

## What changed from lists 2 and 3

- Program names. Lists 2 and 3 named each place after its organization, so ACEing Autism would have had 28 programs
  called "ACEing Autism", and the count would have gone up again. Every program now has its own name.
- One overlap. List 2 made At Liberty CONNECTIONS in Newport a parent with its own Newport program; list 3 then turned
  the same Newport row into a second Newport program under the North Carolina row. The file makes one.
- Descriptions. Lists 2 and 3 replaced every kept organization's description; the file replaces only one place's text.
- `waiting-programs-suggested-organizations.csv` matches the finished database. It had told you to create new
  organizations for the waiting Love Serving Autism and Achilles International South Florida rows; those now join
  their organizations.

## How this was checked

- The file ran on a local copy of production and on a scratch D1 database loaded from it; the two results match row
  for row, and a second run on D1 changed nothing.
- The report, run with the command above, returns 75 rows on production today and none on the finished copy.
- The site counts come from the sites' own code (`listingsSnapshot` on staging, `directorySnapshot` on main) run on the
  copies.
- Nothing points at a missing row, foreign keys hold, and no helper table is left behind.
- No file here carries an email, phone or street address (`test/no-contact-in-data-files.test.js`).
- Between the first copy and the final one, production changed only by your 18 approved descriptions and the hourly
  link checks; the file was regenerated on the final copy.
