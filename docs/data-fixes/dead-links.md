# Dead and moved links (link check, 2026-10-21)

Every live website link on the site (2,195) was loaded on 2026-10-21. Anything that failed was loaded again in a real browser, so sites that only block scripts are not counted as dead. For each link that was dead, moved or pointed at a generic page, we looked for the organization's current official site. Every replacement was then loaded again. The nine hijacked links were handled in #106 and #109.

The full list, one row per listing, is in [`dead-links.csv`](dead-links.csv).

| File | What it does | Rows |
|---|---|---|
| `db/maintenance/dead_links_1_confident.sql` | Sets the current link: replacements found on the organization's own site, plus old links that now redirect to the same organization's new domain. Every new link returned 200 on 2026-10-21. | 146 |
| `db/maintenance/dead_links_2_look_first.sql` | Replacements that need a person to open them first: our server couldn't load them (blocked, or a certificate problem so only `http://` works), plus 10 moved here from file 1 in review because the new link is a weak match (a careers page, a hosting name, an event page, an archive copy, a generic calendar, a news article, a city homepage, an encoded `%2F` link, or a TLS failure). Each line's comment says what to check. | 34 |
| `db/maintenance/dead_links_3_closed.sql` | Sets `is_public = 0` on organizations that closed or merged into another organization. Each line names its evidence (for example: Bart Adaptive merged into Vermont Adaptive; Concord Fencing Club closed in 2020; Helping with Horsepower ended and continues as a separate business). | 8 |
| `db/maintenance/dead_links_4_no_site.sql` | Clears links that are dead where no current site was found. 26 stay listed by their town; 40 drop off the site (32 organizations, 8 programs; see "What drops off the site" below). | 66 |
| `db/maintenance/dead_links_check.sql` | Read-only. Run before each file: shows, per file, how many rows still have the link the file expects. Changes nothing. | – |
| `db/maintenance/dead_links_rollback.sql` | Puts back every old link (and `is_public = 1` for the closures) where the row still has what the files set. | – |

The CSV also has 20 "keep" rows with no SQL: 9 whose old link works in a browser, and 11 moved out of file 4 in review because their own notes say the link may not be dead (a 406, 403 or bot check to our server, an expired or broken certificate, a 503 or 500 that looks temporary, an old page that still loads, or a search that ran out of budget before the row was researched). Recheck those in a browser before doing anything with them.

Every UPDATE matches the row's id **and** its current link (closures also check `is_public = 1`). That makes each file safe to run twice, and any row someone already changed is skipped. All files were replayed on a local SQLite copy of the repo schema, seeded with each row's current link: the first run changes 146 / 34 / 8 / 66 rows, the second run changes none, and the rollback then puts back all 254.

## Who runs it, and when

- **The site reviewer runs these files, staging first, then production.** Nobody runs them on merge.
- **Files 3 and 4 wait for Alec's yes**, given through Chief of Staff, because together they take 48 listings off the site (8 closures and 40 cleared links). Until then only files 1 and 2 may run.
- File 2 runs only after every line's link has been opened in a browser. `wrangler --file` runs the whole file, so first delete (in your local copy) any line whose link doesn't check out, then run the file.

## Run order with the other maintenance files

32 rows here also appear in `duplicates_finish.sql`, 4 in `karen_skiing_1_confident.sql`, 3 in `karen_skiing_2_look_first.sql` and 3 in `duplicates_1_merge_now.sql`. On each database:

1. `duplicates_1_merge_now.sql` and `duplicates_finish.sql` must already have run. Production already reflects the finish file today (read-only check on 2026-10-21: the programs it creates, such as Buddy Up Tennis, Louisville, are live, and menu-page rows it deletes, such as `691856bd`, are gone). On staging, run it first or rebuild staging from production. Why: `duplicates_finish.sql:232` fills a kept organization's blank link from the rows folded into it, so running it after file 4 could bring back a link file 4 cleared, and several file 1 and file 4 program rows only exist once it has run. Once it has run, the folded rows are gone and a second run cannot refill anything.
2. `karen_skiing_1_confident.sql` runs before file 1. Four rows (National Ability Center, Challenge Aspen, Wintergreen, Adaptive Ski Program) get the same new link there plus their town, and Karen's guard needs the old link. If file 1 runs first, those towns are never set. If Karen's file finds the town already set it skips the row, and file 1 then still fixes the link.
3. `karen_skiing_2_look_first.sql` and file 4 can run in either order: the three shared rows (Alpine Alternatives, AVSC adaptive alpine, Colorado Vibes) end the same either way.
4. Then the dead-links files, in order: check, 1, 2, and (after Alec's yes) 3 and 4.

## Steps for each database

```sh
DB=asnm-db-staging; CFG=wrangler.preview.json   # then DB=asnm-db; CFG=wrangler.json for production

# 1. Backup: note the Time Travel bookmark before anything runs (keep it in the run notes)
npx wrangler d1 time-travel info $DB

# 2. Pre-run check: on a database where none of these has run, matched = 146 / 34 / 8 / 66.
#    Stop if matched is much lower than expected, or if row_missing is not 0, and find out why first.
npx wrangler d1 execute $DB --remote --config $CFG --file db/maintenance/dead_links_check.sql

# 3. Run one file at a time, and re-run the check after each (that file's matched goes to 0)
npx wrangler d1 execute $DB --remote --config $CFG --file db/maintenance/dead_links_1_confident.sql
npx wrangler d1 execute $DB --remote --config $CFG --file db/maintenance/dead_links_check.sql
# file 2 after the browser check; files 3 and 4 only after Alec's yes
```

## Rollback

- Links only: `npx wrangler d1 execute $DB --remote --config $CFG --file db/maintenance/dead_links_rollback.sql`. It puts back each old link (and `is_public = 1` for the closures) only where the row still holds what these files set. It does not restore `last_ok_at` or `updated_at`.
- Everything: `npx wrangler d1 time-travel restore $DB --bookmark=<bookmark from step 1>`. This also undoes anything else written to that database since the bookmark, so check first.
- The CSV has every old link, row by row.

## What drops off the site

- **File 4, organizations (32):** with no link, town or consented contact, a row fails the site's "something to act on" rule (`src/data.js:35`). It leaves the lists, map, search and its own page (`getOrg`, `src/data.js:252`). **Its programs stay listed** and still name it: program visibility only checks the organization's `is_public` and `status` (`src/data.js:281`).
- **File 4, programs (8):** they leave the program lists (`src/data.js:115`) but **stay reachable at `/programs/<id>` and through `/api/programs`**, which don't apply that rule (`src/data.js:287`, `:306`).
- **File 3 (8):** `is_public = 0` hides each organization everywhere, and **every program under it** too (`src/data.js:281`).
- Rows that "stay listed by their town" keep showing, just without a link.

## Never restore these domains
They now serve gambling or spam:
- airs-ga.org (`www` is a lottery spam page)
- adaptivecanoeing.org (a blog with betting spam)
- capeableadventures.org (an unrelated travel blog)
- the nine in #106

## Sites that are real but carry injected spam
Each of these loads as the real organization, but hidden or visible gambling text has been injected into its pages, a sign the site was compromised:
- Miami Beach Rowing Club
- BARS (barsinfo.org). Its own site is stale and carries spam, so we don't link to it. The link the listing has today is a dead Move United page, which file 4 clears, so BARS drops off the site until a clean link turns up.
- Helen Hayes Hospital's adapted sports page (noted 2026-10-18)

Apart from BARS, we left their links in place. Telling those organizations is a human call.

## Rows that look wrong for other reasons (in the CSV notes)
- **Scraped pages, not organizations:**
  - Challenged Athletes Foundation pages such as "Donate", "Give Monthly" and "Partner".
  - Rows named "Programs", "Regional Programs" and "Youth Programs".
- **Renamed:**
  - Move Along is now CNY Adaptive Sports.
  - Capital Region Nordic Alliance is now Thisabled Sports.
  - Triangle Sled Hockey is now Triangle Special Hockey.
  - Chapter 126 is now Oak Hill Adaptive Sports and Fitness.
- **Wrong place:**
  - Marty Turcios Therapeutic Golf now runs in Augusta, GA.
  - The "Miracle League at Town 'N Country" link belongs to Austin, TX.
