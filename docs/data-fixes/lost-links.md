# Websites the June dataset had, missing from the live directory

The June 2026 dataset (2,095 rows) had **152 organizations from the CAF Directory with a website that appears nowhere in the live database**. Their rows aren't in production or staging. Where the same organization came in from another source (Move United, the Paralympic club finder), that copy has no link, so the site hides it. That's why Vermont Adaptive, New England Disabled Sports, Adaptive Sports Foundation, GLASA, Achieve Tahoe and others are missing.

I can't tell from the database whether the rows were never imported or were dropped later. None of the cleanup files in `db/maintenance/` touch them.

I loaded every one of the 152 links on 2026-10-21 and read the page title. The result is in [`lost-links.csv`](lost-links.csv):

| What | Count | File |
|---|---|---|
| restore: the link works, it's the organization, and there's a live row with no link | 58 | `db/maintenance/lost_links_restore.sql` |
| not in the directory: the link works but there's no live row by that name | 16 | the CSV, for you to add |
| do not restore: dead (no answer, 404, 403) or taken over | 73 | the CSV |
| already in `karen_skiing_1_confident.sql` | 5 | |

Domains that are now gambling or spam sites. **Never restore these:**
- shastadsusa.org (Shasta Disabled Sports)
- coloradoadaptivesports.org (Colorado Adaptive Sports Foundation)
- operationcomfort.org
- safencingcenter.com

The last two are the sites we removed on 2026-10-14.

Each UPDATE matches by id and only fills a row whose link is empty. Where two live rows matched, it fills the one with a state, and the other stays hidden as a duplicate.
