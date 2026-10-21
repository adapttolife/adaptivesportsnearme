# Data fixes: start here

This is the only page you need to read. The other `.md` files in this folder are the evidence behind each SQL file. Open one only if you want to know why a row changes.

Run each file on staging first, then production. Every file is safe to run twice: it skips any row someone already changed.

```
npx wrangler d1 execute asnm-db-staging --remote --config wrangler.preview.json --file db/maintenance/<file>.sql
npx wrangler d1 execute asnm-db --remote --config wrangler.json --file db/maintenance/<file>.sql
```

## 1. Run these, in this order

1. `karen_skiing_1_confident.sql`
2. `lost_links_restore.sql`
3. `dead_links_check.sql`, then `dead_links_1_confident.sql`. This has to come after step 1: four ski listings are in both files, and they only get their town if the skiing file runs first.
4. `missing_data_1_confident.sql`
5. `descriptions_002_approved.sql`, `new_listings_2026_10_21.sql`, `locations_2026_10_21.sql`

## 2. Wait for Alec's yes (these hide live listings)

- `hijacked_links_clear.sql` (run `hijacked_links_check.sql` after it)
- `dead_links_3_closed.sql`
- `dead_links_4_no_site.sql`
- `missing_data_3_closed.sql`

## 3. Optional: each line says what to check first

- `karen_skiing_2_look_first.sql`
- `dead_links_2_look_first.sql`
- `missing_data_2_look_first.sql`

## Already done

The duplicates work from 2026-10-18 is already on production. The other 2026-10-18 files (USTA links, the descriptions pilot) need running only if you haven't run them yet.
