# Hijacked links on the live site (2026-10-21)

Found by loading every live website link (2,195) on 2026-10-21. Each of these now sends a visitor somewhere else: a gambling or slot site, a spam page, or an unrelated business. Run `db/maintenance/hijacked_links_clear.sql` on both databases as soon as you can.

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
- **6 pending review items rejected:** they were drafted from the hijacked pages (a betting company's email for Michigan Adaptive Sports, a casino site's town and ZIP for Colorado Discover Ability, and four sport labels). Item ids 301, 461, 293, 465, 584, 657.
- Sets `updated_at`, and ends with a check query: each link should read cdagj.org, bamaadapted.com or NULL.

`db/sample/sample.sql` also had the hijacked Colorado link; it now has cdagj.org.

Staging first, then production (docs/MAINTAINERS.md order; every statement is guarded, so either order is safe):

```
npx wrangler d1 execute asnm-db-staging --remote --config wrangler.preview.json --file db/maintenance/hijacked_links_clear.sql
npx wrangler d1 execute asnm-db --remote --config wrangler.json --file db/maintenance/hijacked_links_clear.sql
```
