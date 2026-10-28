# Hijacked links on the live site (2026-10-21)

Found by loading every live website link (2,195) on 2026-10-21. Each of these now sends a visitor somewhere else: a gambling or slot site, a spam page, or an unrelated business. `db/maintenance/hijacked_links_clear.sql` fixes all nine on each database. It hides 5 public listings, so it waits for Alec's yes through Chief of Staff (on hold as of 2026-10-21). The site reviewer (Faisal) runs it, not an agent.

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
- **Other review items on these orgs stay pending** for a person to decide. See "Review items left pending" below.
- Sets `updated_at` on every changed row and clears `last_ok_at`, so the listing shows no "checked OK" date until the link checker next loads the link. The two new links (Alabama, Colorado) also get `last_checked_at` cleared, so the validate lane checks them first.

Alabama's new link: bamaadapted.com loads as "Alabama Adapted - Official Athletics Website" with the University of Alabama's Tuscaloosa address, its wheelchair basketball, wheelchair tennis and para track and field teams, and links to the university's give.ua.edu booster club. Move United's directory lists bamaadapted.com for University of Alabama Adapted Athletics (checked 2026-10-21).

`db/sample/sample.sql` also had the hijacked Colorado link. It now has cdagj.org, with `last_ok_at` and `last_checked_at` empty, the same as the clear leaves it.

## Review items left pending

Only 461 and 301 are rejected, because they were scraped from the hijacked pages. Every other item on these orgs stays pending. The Chief Review Officer read them on 2026-10-21; staging had the same ids, orgs and content as live that day.

- **465 (Colorado Discover Ability, classify) and 584 (Michigan Adaptive Sports, classify):** read off the same hijacked domains in the same week. Their labels may be wrong. They stay pending because this doc doesn't cite each item's evidence URL and date. Check the label against the org's real site before approving.
- **657 (Midwest Wheelchair Sport & Social Club, classify):** read off mdwssc.org on 2026-07-30. When that domain was hijacked isn't proven, so the label may be fine. Check before approving.
- **293 (Discovery Blind Sports, classify):** matched on the listing's name ("blind sports"), not on any page. It wasn't drafted from a hijacked page, and its label is likely right.
- **Validate items 6, 674, 683 and 697:** based on HTTP failures from the hijacked domains. If approved, they would mark these orgs dead or inactive. A person decides each one. After the clear, the old links are gone, so these no longer describe the listing's current link.

The retired bearer-key review API cannot decide these legacy pipeline items. Use a reviewed, targeted D1 maintenance statement when a decision is necessary.

## How to run it: staging first

Every organizations UPDATE matches both the row's id and its hijacked link, so a second run changes nothing and a row someone already fixed is skipped. The review queue statements also match the org and lane, so on a database where an id belongs to something else they change nothing.

`db/maintenance/hijacked_links_check.sql` is read-only. Run it before and after on each database and compare: that shows which rows changed, how many hide, that the old links are gone, and what the review items are.

1. Staging, before: run the check. Expect 9 rows, `still_hijacked` = 1 on all 9, and totals `9 / 9 / 9`. **If the totals aren't 9 / 9 / 9, stop: don't run the clear, and report what the check shows.** Some rows have changed since 2026-10-21, and the guards would skip them silently (Alabama's guard, for one, skips a link that is already empty). Staging's review items may not match the live ids; the `plan` column shows that.
2. Staging: run the clear.
3. Staging, after: run the check. Expect `still_hijacked` = 0 on all 9 and totals `9 / 0 / 4`.
4. Staging: run the clear again. Expect 0 changes.
5. Live: repeat steps 1 to 3 on `asnm-db`, with the same stop rule: if the before totals aren't 9 / 9 / 9, stop. Before running the clear, check that the `plan` column reads `reject` for items 461 and 301. That means each is pending, in lane `enrich`, and belongs to the expected org (461 to Michigan Adaptive Sports `e0978514-…`, 301 to Colorado Discover Ability `63c9e62b-…`). If one doesn't, the clear leaves it alone. Don't reject that item id by hand, because it may be someone else's item. Instead, use a reviewed maintenance statement that also matches the organization, lane, and source page.

```
npx wrangler d1 execute asnm-db-staging --remote --config wrangler.preview.json --file db/maintenance/hijacked_links_check.sql
npx wrangler d1 execute asnm-db-staging --remote --config wrangler.preview.json --file db/maintenance/hijacked_links_clear.sql
npx wrangler d1 execute asnm-db-staging --remote --config wrangler.preview.json --file db/maintenance/hijacked_links_check.sql

npx wrangler d1 execute asnm-db --remote --config wrangler.json --file db/maintenance/hijacked_links_check.sql
npx wrangler d1 execute asnm-db --remote --config wrangler.json --file db/maintenance/hijacked_links_clear.sql
npx wrangler d1 execute asnm-db --remote --config wrangler.json --file db/maintenance/hijacked_links_check.sql
```

Pages and the sitemap are cached for up to an hour, so check live pages again an hour after the live run.

## Rollback

Run on the database you want to undo, then run the check file again. Each line only touches a row that still has the value the clear set. The old check dates (`last_ok_at`, `last_checked_at`) and `updated_at` aren't kept, so they stay as the clear left them. Undoing puts the hijacked links back on the site, so only do it for a real mistake.

```sql
UPDATE organizations SET website_url = 'http://alabamaadapted.com/', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f6b95ded-9dba-4a7c-a441-edd5b9c6406b' AND website_url = 'https://bamaadapted.com/';
UPDATE organizations SET website_url = 'https://www.coastaladaptivesports.org/', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'db949607-6858-4d28-86cd-e2897d7adb19' AND website_url IS NULL;
UPDATE organizations SET website_url = 'http://www.coloradodiscoverability.org', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '63c9e62b-c605-4b14-bfcd-25a3ccb00078' AND website_url = 'https://cdagj.org/';
UPDATE organizations SET website_url = 'http://www.discoveryblindsports.org', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2412b1f2-b136-4e90-92bb-9589f71dfcf3' AND website_url IS NULL;
UPDATE organizations SET website_url = 'https://www.michiganadaptivesports.com/', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e0978514-3831-4cd5-8d0f-fb401b73cb96' AND website_url IS NULL;
UPDATE organizations SET website_url = 'http://www.mdwssc.org', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b707d9db-e8d1-4cf3-89e2-3363b137ca09' AND website_url IS NULL;
UPDATE organizations SET website_url = 'http://www.gosailing4all.org', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b8e095b5-0d63-44e3-8bae-18dd3a15c905' AND website_url IS NULL;
UPDATE organizations SET website_url = 'https://www.reclamation-ranch.com/', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2c9cfcbc-1af5-5d8b-acf0-fc6a42cb8486' AND website_url IS NULL;
UPDATE organizations SET website_url = 'https://www.newfreedomfarm.org/', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3b4a166f-3a2b-51fc-b416-1974cb81a914' AND website_url IS NULL;
-- Review queue: put back only the two items the clear rejected.
UPDATE review_queue SET status = 'pending', resolved_at = NULL, resolved_by = NULL WHERE item_id IN (461, 301) AND status = 'rejected' AND resolved_by = 'data fix: source page was hijacked';
```

Follow-up, outside this fix: the link check in `src/lanes/validate.js` counts any page that loads as OK. That's why these hijacked links kept fresh "checked OK" dates.
