# Data fixes: start here

All of the 2026-10-21 data fixes are in one file: `db/maintenance/2026_10_21_all.sql`. **They've already been run on staging.** Production needs one command:

```
npx wrangler d1 execute asnm-db --remote --config wrangler.json --file db/maintenance/2026_10_21_all.sql
```

The file is safe to run twice: it skips any row someone already changed. On staging, a second run wrote 0 rows.

## What changed on staging (2026-10-21)

| | Before | After |
|---|---|---|
| Organizations | 2,611 | 2,616 (5 new listings) |
| Listings shown | 2,611 | 2,594 (17 hidden: hijacked, closed, or dead with no site) |
| Organizations with a website | 1,803 | 2,143 |
| Organizations with a town | 1,318 | 1,743 |
| Organizations with a description | 1,422 | 1,666 |
| Programs | 885 | 893 (8 locations) |

All nine hijacked links are cleared (`hijacked_links_check.sql` shows 0 still hijacked).

## What's in the file, in order

`karen_skiing_1_confident`, `lost_links_restore`, `dead_links_1_confident`, `missing_data_1_confident`, `descriptions_002_approved`, `new_listings_2026_10_21`, `locations_2026_10_21`, `hijacked_links_clear`, `dead_links_3_closed`, `dead_links_4_no_site`, `missing_data_3_closed`. The skiing file has to come before dead links, and the combined file already runs it first. The other `.md` files in this folder explain why each row changes.

## Not run

The three look-first files (`karen_skiing_2_look_first.sql`, `dead_links_2_look_first.sql`, `missing_data_2_look_first.sql`) each need a person to open the links first.
