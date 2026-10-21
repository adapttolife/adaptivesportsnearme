# Hijacked links on the live site (2026-10-21)

Found by loading every live website link (2,195) on 2026-10-21. Each of these now sends a visitor somewhere else: a gambling or slot site, a spam page, or an unrelated business. Run `db/maintenance/hijacked_links_clear.sql` on both databases as soon as you can.

| Listing | Link | Where it goes now |
|---|---|---|
| Alabama Adapted Athletics (AL) | alabamaadapted.com | a sports betting blog |
| Coastal Carolina Adaptive Sports & Recreation (SC) | www.coastaladaptivesports.org | a slot gambling site |
| Colorado Discover Ability (CO) | www.coloradodiscoverability.org | casino review page; its real site is cdagj.org (set by the SQL) |
| Discovery Blind Sports (CA) | www.discoveryblindsports.org | a spam page |
| Michigan Adaptive Sports (MI) | www.michiganadaptivesports.com | a betting app download page |
| Midwest Wheelchair Sport & Social Club (IL) | www.mdwssc.org | an online gambling site |
| Sailing 4 All (VA) | www.gosailing4all.org | a casino site |
| Helping with Horsepower at Reclamation-Ranch (SD) | www.reclamation-ranch.com | an unrelated bookkeeping business |
| New Freedom Farm (VA) | www.newfreedomfarm.org | a slot gambling site |

Clearing a link hides the listing until it gains a new link or a town (the existing rule in `src/data.js`). A follow-up PR brings the current official link for each one we can find.

```
npx wrangler d1 execute asnm-db --remote --config wrangler.json --file db/maintenance/hijacked_links_clear.sql
npx wrangler d1 execute asnm-db-staging --remote --config wrangler.preview.json --file db/maintenance/hijacked_links_clear.sql
```
