# Dead and moved links (link check, 2026-10-21)

Every live website link on the site (2,195) was loaded on 2026-10-21. Anything that failed was loaded again in a real browser, so sites that only block scripts are not counted as dead. For each link that was dead, moved or pointed at a generic page, we looked for the organization's current official site. Every replacement was then loaded again. The nine hijacked links were handled in #106 and #109.

The full list, one row per listing, is in [`dead-links.csv`](dead-links.csv).

| File | What it does | Rows |
|---|---|---|
| `db/maintenance/dead_links_1_confident.sql` | Sets the current link: 110 replacements found on the organization's own site, plus 46 old links that now redirect to the same organization's new domain. Every new link returned 200 on 2026-10-21 with the organization's name on the page. | 156 |
| `db/maintenance/dead_links_2_look_first.sql` | Replacements our server couldn't load: it was blocked, or the site has a certificate problem and only `http://` works. Open each link in a browser before running its line. | 24 |
| `db/maintenance/dead_links_3_closed.sql` | Hides listings that closed or merged into another organization. Each line names its evidence (for example: Bart Adaptive merged into Vermont Adaptive; Concord Fencing Club closed in 2020; Helping with Horsepower ended and continues as a separate business). | 8 |
| `db/maintenance/dead_links_4_no_site.sql` | Clears links that are dead where no current site was found. 36 stay listed by their town; 41 hide until a link turns up. | 77 |

Every UPDATE matches the row's id **and** its current link (closures also check `is_public = 1`). That makes each file safe to run twice, and any row someone already changed is skipped. I tested all four files on a local copy of the schema: the first run changes every row, the second run changes none.

Run staging first, then production. Do the files one at a time; the look-first file only after its links are checked.

```
npx wrangler d1 execute asnm-db-staging --remote --config wrangler.preview.json --file db/maintenance/dead_links_1_confident.sql
npx wrangler d1 execute asnm-db --remote --config wrangler.json --file db/maintenance/dead_links_1_confident.sql
```

## Never restore these domains
They now serve gambling or spam:
- airs-ga.org (`www` is a lottery spam page)
- adaptivecanoeing.org (a blog with betting spam)
- capeableadventures.org (an unrelated travel blog)
- the nine in #106

## Sites that are real but carry injected spam
Each of these loads as the real organization, but hidden or visible gambling text has been injected into its pages, a sign the site was compromised:
- Miami Beach Rowing Club
- BARS (barsinfo.org)
- Helen Hayes Hospital's adapted sports page (noted 2026-10-18)

We left their links in place. Telling those organizations is a human call.

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
