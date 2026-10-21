# Approved descriptions, new listings and locations (2026-10-21)

**Alec approved all 315 drafts on 2026-10-21.** They're in two review docs in the Adaptive Sports Near Me Drive folder (Database). Before writing any SQL, I read both docs back: neither had been edited or commented on, so the SQL uses the text exactly as approved, with one exception noted below. Every draft was written only from the organization's own website, with a quote from the site behind each fact.

The text uses the format the listing page already renders: `Sports and activities: …. Athletes served: …`. The first part becomes the **Programs** list and the second becomes the **Who it's for** line. It also feeds the "Who it's for" filter (#111) and the sports wording (#105, #108).

| File | What it does | Rows |
|---|---|---|
| `db/maintenance/descriptions_002_approved.sql` | Fills the description where a listing has none. It never replaces existing text. | 289 |
| `db/maintenance/new_listings_2026_10_21.sql` | Adds five programs that aren't in the directory: Vail Veterans Program, Double H Ranch (Adaptive Winter Sports), Wachusett Mountain's adaptive program, Colorado Springs Therapeutic Recreation, and the Judd Goldman Adaptive Sailing Program. | 5 |
| `db/maintenance/locations_2026_10_21.sql` | One program row per place an organization actually runs: Vermont Adaptive at Pico/Killington, Sugarbush (Waitsfield), Bolton Valley, Saskadena Six (Pomfret) and Lake Champlain (Burlington); New England Disabled Sports at Loon (Lincoln) and Bretton Woods (Carroll); Eagle Mount at Big Sky. A search near any of those mountains now finds them. | 8 |

**Why 289 and 5, not 315.** Of the 32 drafts written as "new to the directory", 27 turned out to be listed already, either live today or brought back by #116. Their approved text goes on the existing row instead. 17 of those rows also had their own approved draft, and that one is used. Four drafts match more than one row, so they're left out for a person to place: Adaptive Sports Center (Crested Butte), Waterville Valley, Northeast Passage, and Ski Apache. Crested Butte is also mis-filed under the name "Adaptive Sports USA".

**One edit after approval.** Shared Adventures: "families who have a child with a disability ages 5 to 25" now reads "families of children with disabilities ages 5 to 25". The site's description check (`src/description-contract.js`) reads "a child" as an internal record note and would have hidden the text.

**Checks.**
- All texts pass `checkPublicDescription` and `contactIn`.
- New listings are inserted with a fixed id, and are skipped if any row already has the same website.
- Locations use `INSERT OR IGNORE` with fixed ids. Bromley and Stratton are left out, because Vermont Adaptive's own page doesn't name their towns.
- I ran all three files twice on a local copy of the schema: the first run changes every row, the second run changes none.

Once an organization has listed programs, the site shows its programs in place of the organization (`src/data.js`, `listingsSnapshot`). So Vermont Adaptive appears as its five places, and its own page still works.

Run staging first, then production:
```
npx wrangler d1 execute asnm-db-staging --remote --config wrangler.preview.json --file db/maintenance/descriptions_002_approved.sql
npx wrangler d1 execute asnm-db --remote --config wrangler.json --file db/maintenance/descriptions_002_approved.sql
```
Then do the same for `new_listings_2026_10_21.sql` and `locations_2026_10_21.sql`.
