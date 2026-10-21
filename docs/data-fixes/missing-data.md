# Missing websites and towns (research, 2026-10-21)

Two gaps kept listings out of reach:
- **768 listings were hidden** because we had only a name: no website and no town.
- **576 live listings had no town**, so they never came up in a "near" search.

We researched all of them (1,143 unique items once duplicates were set aside). Each answer came from the organization's own website, or for a program run by a city, hospital, school or YMCA, from that institution's page for the program. Directories, Facebook and news don't count as a source. Every site was loaded and checked so it isn't parked or spam, and the town is backed by a quote from the page. 156 towns came straight from the address on the organization's own site.

The full list, one row per listing with its evidence and notes, is in [`missing-data.csv`](missing-data.csv).

| File | What it does | Rows |
|---|---|---|
| `db/maintenance/missing_data_1_confident.sql` | Sets the website, town and/or state where the evidence is clear: the page loads, the quote shows the town, and the state doesn't change. **Brings back 328 hidden listings, gives 192 live listings a town, and sets 377 websites.** | 534 |
| `db/maintenance/missing_data_2_look_first.sql` | Same kind of update, but each line says what to check first. The reasons: the state changes, the town came from a news story or directory, the page didn't load from our server, the town isn't in the city table, or it's a national name where a headquarters town would mislead. | 368 |
| `db/maintenance/missing_data_3_closed.sql` | Hides listings that closed or merged, with the evidence on each line. 8 of them are live today. | 14 |

Each UPDATE fills only what is empty, or matches the exact value it replaces, so it's safe to run twice and skips anything someone already set. Where one name matched several hidden rows, only the first row is filled; the rest are duplicates and are listed in the CSV for the duplicates pass. Listings already handled in #104, #109 or #113 are left out. I tested all three files on a local copy of the schema: the first run changes every row, the second run changes none.

Run staging first, then production:
```
npx wrangler d1 execute asnm-db-staging --remote --config wrangler.preview.json --file db/maintenance/missing_data_1_confident.sql
npx wrangler d1 execute asnm-db --remote --config wrangler.json --file db/maintenance/missing_data_1_confident.sql
```

## Not found (167)
No current site of its own and no town we could confirm. Most are teams that appear only on a national league page, groups with only a Facebook page, or domains that have expired. They stay hidden, and the CSV notes give any leads.

## Never link these domains
They now serve gambling, spam or unrelated content:
- From this research: usewha.org, libertybelljudo.com, fgagolf.org, disabledveteransscubaproject.org, abqkings.org (hacked), codysfirststep.org, coastaladaptivesports.org, discoveryblindsports.org, michiganadaptivesports.com, capeableadventures.org, coloradoadaptivesports.org, wisconsinadaptivesports.org.
- Earlier: shastadsusa.org, airs-ga.org, adaptivecanoeing.org, and the nine in #106.

One correction to #113's notes: miamibeachrowing.com is now a parked domain, not a site with injected spam.

## Worth a decision (details in the CSV notes)
- **Not adaptive sports:** several listings are veteran support, arts, food, a wheelchair store, a guide-tether seller or a grant. Decide whether they belong in the directory.
- **National bodies** (USA Fencing, USRowing, Move United and others) get a website but no town, so they never pretend to be local.
- **Renamed:** for example, Disabled Sports USA is now Move United; Move Along is now CNY Adaptive Sports; ENWAA is now Nebraska Adaptive Sports; Push America is now The Ability Experience. The CSV has the current names.
- **Duplicates**, for the duplicates pass: Atlanta Sparks, Rancho Halos, Row New York, USA Boccia, the Kennedy Krieger and STRAPS pairs, and others in the CSV.
