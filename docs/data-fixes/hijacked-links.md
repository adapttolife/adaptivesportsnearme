# Hijacked links on the live site (2026-10-21)

Found by loading every live website link (2,195) on 2026-10-21. Each of these now sends a visitor somewhere else: a gambling or slot site, a spam page, or an unrelated business. `db/maintenance/hijacked_links_clear.sql` fixes all nine on each database. It hides 5 public listings, so it waits for Alec's yes (on hold as of 2026-10-21). Running it is the site reviewer's step, not an agent's.

| Listing | Link | Where it goes now |
|---|---|---|
| Alabama Adapted Athletics (AL) | alabamaadapted.com | a sports betting blog. **New link: bamaadapted.com**, the official site |
| Coastal Carolina Adaptive Sports & Recreation (SC) | www.coastaladaptivesports.org | a slot gambling site |
| Colorado Discover Ability (CO) | www.coloradodiscoverability.org | a casino review page. **New link: cdagj.org**, its own site |
| Discovery Blind Sports (CA) | www.discoveryblindsports.org | a spam page |
| Michigan Adaptive Sports (MI) | www.michiganadaptivesports.com | a betting app download page |
| Midwest Wheelchair Sport & Social Club (IL) | www.mdwssc.org | an online gambling site |
| Sailing 4 All (VA) | www.gosailing4all.org | a casino site |
| Helping with Horsepower at Reclamation-Ranch (SD) | www.reclamation-ranch.com | an unrelated bookkeeping business |
| New Freedom Farm (VA) | www.newfreedomfarm.org | a slot gambling site |

What the SQL does:
- **2 get their real site and stay listed:** Colorado Discover Ability (cdagj.org) and Alabama Adapted Athletics (bamaadapted.com).
- **2 stay listed by their town, with no link:** Helping with Horsepower at Reclamation-Ranch (Mitchell, SD) and New Freedom Farm (Buchanan, VA).
- **5 hide** until a real link turns up: Coastal Carolina Adaptive Sports, Discovery Blind Sports, Michigan Adaptive Sports, Midwest Wheelchair Sport & Social Club and Sailing 4 All. Each one's own domain was taken over, and a search on 2026-10-21 found no current site of its own; directories still point at the hijacked domains. With no link and no town, a listing is a dead end, so the existing rule in `src/data.js` hides it. Hiding is the fallback only where no real site exists.
- **2 pending review items rejected:** 461 (a betting company's email for Michigan Adaptive Sports) and 301 (an email, town and ZIP from a casino review site for Colorado Discover Ability). Each statement matches the item id, the org, the lane and pending status, because each database numbers its review items separately and these ids were read on live.
- **4 classify items flagged, not changed:** 293, 465, 584 and 657. Their source pages were probably already hijacked when they were made. A person checks each against the org's real site before approving, or rejects it, in the admin review queue (`/api/admin`, action `reject`).
- Sets `updated_at` on every changed row and clears `last_ok_at`, so the link checker treats it as not checked yet.

Alabama's new link: bamaadapted.com loads as "Alabama Adapted - Official Athletics Website" with the University of Alabama's Tuscaloosa address, its wheelchair basketball, wheelchair tennis and para track and field teams, and links to the university's give.ua.edu booster club. Move United's directory lists bamaadapted.com for University of Alabama Adapted Athletics (checked 2026-10-21).

`db/sample/sample.sql` also had the hijacked Colorado link. It now has cdagj.org with no check date.

## How to run it: staging first

Every organizations UPDATE matches both the row's id and its hijacked link, so a second run changes nothing and a row someone already fixed is skipped. The review queue statements also match the org and lane, so on a database where an id belongs to something else they change nothing.

`db/maintenance/hijacked_links_check.sql` is read-only. Run it before and after on each database and compare: that shows which rows changed, how many hide, that the old links are gone, and what the review items are.

1. Staging, before: run the check. Expect 9 rows, `still_hijacked` = 1 on all 9, and totals `9 / 9 / 9`. Staging's review items may not match the live ids; the `plan` column shows that.
2. Staging: run the clear.
3. Staging, after: run the check. Expect `still_hijacked` = 0 on all 9 and totals `9 / 0 / 4`.
4. Staging: run the clear again. Expect 0 changes.
5. Live: repeat steps 1 to 3 on `asnm-db`. Before running the clear, check that items 461 and 301 show the expected org, lane `enrich` and `pending`. If one doesn't, the clear leaves it alone; reject it by hand instead.

```
npx wrangler d1 execute asnm-db-staging --remote --config wrangler.preview.json --file db/maintenance/hijacked_links_check.sql
npx wrangler d1 execute asnm-db-staging --remote --config wrangler.preview.json --file db/maintenance/hijacked_links_clear.sql
npx wrangler d1 execute asnm-db-staging --remote --config wrangler.preview.json --file db/maintenance/hijacked_links_check.sql

npx wrangler d1 execute asnm-db --remote --config wrangler.json --file db/maintenance/hijacked_links_check.sql
npx wrangler d1 execute asnm-db --remote --config wrangler.json --file db/maintenance/hijacked_links_clear.sql
npx wrangler d1 execute asnm-db --remote --config wrangler.json --file db/maintenance/hijacked_links_check.sql
```

Pages and the sitemap are cached for up to an hour, so check live pages again an hour after the live run. To undo an organization row, set `website_url` back to the old value in that row's guard.

Follow-up, outside this fix: the link check in `src/lanes/validate.js` counts any page that loads as OK. That's why these hijacked links kept fresh "checked OK" dates.
