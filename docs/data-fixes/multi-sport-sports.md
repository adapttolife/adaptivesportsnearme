# Sports for organizations listed only as "Multi-sport"

On 2026-10-26, 382 organizations on the live site were listed as "Multi-sport" with no actual sports and a website. Nobody searching for a sport could find them: a skier in New Hampshire was told "No skiing listed". We read each organization's own website and recorded what it runs now, and in which seasons when the site says.

The list with sources is [multi-sport-sports.csv](multi-sport-sports.csv).

| File | What it does | Organizations | Needs |
|---|---|---|---|
| `db/maintenance/multi_sport_1_confident.sql` | Each sport becomes a program on the organization's card (`listing = 'with_org'`, with its seasons) and joins its sports, so search finds it | 165 | migration 0015 |
| `db/maintenance/multi_sport_2_look_first.sql` | The same, for rows where the site was thin, old or read through a third party; each says what to check | 95 | migration 0015 |
| `db/maintenance/multi_sport_3_no_change.sql` | No SQL. Sites that are dead (4), taken over (2), organizations that closed or merged (10), VA hospital homepages and other pages that name no program (61), and live sites whose activities fit none of our sports (45), for a person to look at | 122 | nothing |

Both SQL files are safe to run twice: fixed ids, and every insert is skipped when the organization already has a program for that sport. They never change an existing program, name, description or contact. Tested twice on a copy of production from 2026-10-18.

## Choices made

- Only what the organization's own site says it runs now, not partners' programs or one-off past events.
- Kayaking, canoeing and paddleboarding count as rowing; alpine skiing and snowboarding as skiing; flag football as football; therapeutic riding as equine therapy; showdown as blind sports.
- Bocce isn't boccia. For Special Olympics and parks and recreation programs, which run bocce, boccia is left out.

## Worth a look (not changed here)

- **Taken over:** CAPEable Adventures (now a travel blog) and adaptivecanoeing.org (now a betting blog). Helen Hayes Hospital's adapted sports page has casino spam injected into it.
- **Closed or merged:** Adaptive Sports USA (merged into Move United), several Team River Runner chapters no longer on its chapter list, Alegent Health (now CHI Health).
- **Better links:** a number of rows point to a Move United directory page or Facebook instead of the organization's own site (for example Ogden Valley Adaptive Sports, Mississippi Wheelcats). The CSV notes say which.
- **Duplicates:** several organizations appear two or three times (Achievers, Adaptive Action Sports, SportsAbility Alliance, Higher Ground, Hillsborough County, Salt Lake County, HOPE Inc, Reno, TIRR, Kennedy Krieger and others).
- **Renamed:** Friends of Stowe Adaptive Sports is now Green Mountain Adaptive Sports.
