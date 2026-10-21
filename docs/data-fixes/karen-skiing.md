# Skiing: tester feedback, 2026-10-21

A tester who knows adaptive skiing well checked the skiing listings. Here is what they found, what caused it, and the fix for each.

| They said | What we found |
|---|---|
| Aspen Valley is listed in Utah, not Colorado | Correct. The club's own site puts it in Aspen, CO. Its site today is a youth racing club and doesn't mention adaptive programs, so it may not belong in the directory at all (look-first file). |
| Vermont Adaptive, Adaptive Sports Foundation (Windham NY), New England Disabled Sports (Loon), Mount Snow and Stowe are missing | They are all in the database. They're hidden because the live rows have no website and no town. The June dataset had the websites (see [lost-links.md](lost-links.md)). |
| NEHSA (Sunapee), STARS, NAC aren't listed | They're public, but they have no town, so they never show up in a "near" search, and they're filed as multi-sport rather than skiing. |
| CAMO | Challenge Aspen Military Opportunities, Challenge Aspen's veterans program. Challenge Aspen gets its town and link; CAMO isn't a separate organization. |
| Big Sky | Eagle Mount Bozeman runs it (Big Sky Resort's lessons page says so). Eagle Mount Bozeman gets its town. |

## Files

1. **`db/maintenance/karen_skiing_1_confident.sql`**: 27 updates (23 organizations, 4 programs).
   - Each one sets the current website and/or the town (and the state, where it was wrong or missing), checked on the organization's own site on 2026-10-21.
   - Every UPDATE matches the row's current values, so it is safe to run twice, and it skips any row that someone already changed.
   - Old links that are now parked or redirected are replaced: skiccsa.org is parked; skiwas.org, adaptiveski.org and discovernac.org redirect to the new sites.
2. **`db/maintenance/karen_skiing_2_look_first.sql`**: five judgment calls. Each line says what to look at.
   - Aspen Valley: hide, since it isn't adaptive.
   - The 2010 Paralympic Aspen program: hide; its link is a 404.
   - Alpine Alternatives: hide; the site is dead and it looks closed.
   - Visually Impaired and Blind Skiers: clear the dead link.
   - Gateway Disabled Ski Program: give it its town; its domain is parked.
3. **`docs/data-fixes/ski-programs-to-add.csv`**: 17 adaptive ski programs that aren't in the directory, each checked on its own site, with town and mountain. Examples: Crested Butte, BOEC, NSCD, Telluride, Maine Adaptive at Sunday River, Waterville Valley, STRIDE and Summit Adaptive. These are new rows, so they're your call.

Not changed, but worth knowing:
- **Stowe:** the program is now Green Mountain Adaptive Sports. It funds lessons that Stowe's ski school teaches, and we found no working site of its own.
- **NENSA:** a Nordic racing association that points people to other programs; it doesn't teach.
- **Duplicates:** these rows stay hidden, since they have no link. Fold them when you run duplicates.
  - Three Vermont Adaptive rows, two each for New England Disabled Sports and Adaptive Sports Foundation.
  - Cannonsburg and Adaptive Ski Association of West Michigan (the same organization, renamed).

## Run

The towns show distances once PR #103 is deployed, since Killington, Newbury and Dover come from the new town table. Before that, the rows still show on state pages.

```
npx wrangler d1 execute asnm-db-staging --remote --config wrangler.preview.json --file db/maintenance/karen_skiing_1_confident.sql
npx wrangler d1 execute asnm-db --remote --config wrangler.json --file db/maintenance/karen_skiing_1_confident.sql
```

I tested both files and `lost_links_restore.sql` with SQLite on copies of the 89 live rows they touch:
- First run: 27, 58 and 5 changes.
- Second run: no change to any row.
- No hijacked link is set.
