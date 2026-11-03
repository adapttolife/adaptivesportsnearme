# Wheelchair pickleball tournaments: late 2026–2027

Faisal: the supplied schedule contains 13 candidates. **Two have both edition-specific dates and wheelchair divisions confirmed by an organizer and are ready to insert. Eleven need confirmation before publication.** Research checked November 3, 2026. Missing evidence here means unconfirmed, not that a division does not exist.

The [full 13-row review file](wheelchair-tournaments-2026-2027.json) preserves the supplied dates, fees and brackets, source links, evidence status, and the reason for each hold. Fields prefixed `supplied_` are leads, not verified facts. The [SQL](../../db/maintenance/wheelchair_tournaments_2026_2027.sql) contains only the two ready entries. No estimated dates, historical fees, assumed brackets or invented registration links enter the calendar.

## Ready to insert

| Event | Tournament dates | Confirmed wheelchair information | Sources |
|---|---|---|---|
| USA Pickleball Golden Ticket Las Vegas | February 23–28, 2027; Sunset Park | Coed doubles February 26, coed singles February 27, hybrid February 28. **$50 flat for all wheelchair events**, code `WC50`; not the supplied $95 + $45/event amateur price. Registration closes February 15. | [USAP event guide](https://usapickleball.org/tournaments/usap-golden-ticket-las-vegas-2027/), [registration](https://pickleballtournaments.com/tournaments/usa-pickleball-golden-ticket-las-vegas-1) |
| PVA Wheelchair Pickleball Tournament | April 24–25, 2027; Franklin, WI | Midwest Orthopedic Specialty Hospital Performance Center. Adaptive wheelchair, hybrid, mixed wheelchair and non-medal exhibition divisions. **Fees not confirmed.** Do not advertise free entry, singles or a clinic from this brief. | [PVA calendar](https://pva.org/sports-recreation/pickleball/), [PVA registration](https://events.blackthorn.io/en/Ho1cSeR7/2027-pva-wheelchair-pickleball-tournament-5a2FUi1TjM9/overview) |

## Hold until the missing evidence is available

| Candidate | Date evidence | What Faisal needs before adding it |
|---|---|---|
| APP Arizona Open | November 12–15, 2026 confirmed | [Organizer](https://www.theapp.global/tour-schedule/2026-app-arizona) and [registration](https://app.pickleballden.com/external-tournament/3791526) establish the event, but retrieved text does not confirm its wheelchair brackets. General pricing differs between those pages ($85 vs $115 entry; $40 amateur event); neither proves adaptive pricing. Confirm wheelchair availability and the supplied November 7 deadline. |
| APP Tour Championships | December 3–6, 2026 confirmed | [Organizer](https://www.theapp.global/tour-schedule/2026-app-tour-championships) and [registration](https://app.pickleballden.com/external-tournament/1719474): same wheelchair evidence gap and general-price discrepancy as Arizona. |
| Atlantic Union Bank Open | December 11–13, 2026 confirmed by [host calendar](https://www.myppb.com/compete) | Host says save the date. The indexed [registration page](https://pickleballtournaments.com/tournaments/the-atlantic-union-bank-open) is **December 5–7, 2025**. Get the 2026 registration page before carrying forward its wheelchair brackets, fees or daily schedule. This is the Henrico/Richmond event; do not substitute the Annandale collegiate event. |
| St. Louis Gateway Open | February 18–21, 2027 confirmed | [2027 registration](https://pickleballtournaments.com/tournaments/2027-st-louis-gateway-open-a-usa-pickleball-golden-ticket-event) confirms Missouri Pickleball Club, Fenton. Retrieved description does not establish wheelchair brackets. Header currently advertises $45 general registration, not the supplied $85–$95 estimate; obtain wheelchair-specific terms. |
| OrthoVirginia Cup | March 19–21, 2027 is an estimate | The [registration page found](https://pickleballtournaments.com/tournaments/the-orthovirginia-cup-1) is March 21–22, **2026**. A third-party 2027 listing gives different dates from the brief. Need official 2027 dates, brackets and fees. |
| Drive Drop & Dink | Conflicting edition details | [2027 page](https://pickleballtournaments.com/tournaments/drive-drop-and-dink-2027) header says March 20–22, 2027; body says 10th annual March 20–22, **2026** and gives a Friday–Sunday schedule. Fee header is $40; body says $30 including one event plus $10/additional. Wheelchair text may also be copied from 2026. Ask for a corrected edition; do not publish its schedule or fees yet. |
| US Open Pickleball Championships | April 17–24, 2027 confirmed | [Homepage](https://www.usopenpickleball.com/) uses **Franklin**, not the supplied Minto branding. [Detailed schedule](https://www.usopenpickleball.com/event-guide/schedule) still says **2026**. Need 2027 wheelchair brackets, fees and lottery dates. No inferred January registration window. |
| Golden Ticket Milwaukee | April 28–May 2, 2027 confirmed | [USAP calendar](https://usapickleball.org/goldenticket/) confirms Pickleball Kingdom, Menomonee Falls. Need edition-specific wheelchair brackets, registration link and fees. |
| Golden Ticket Colorado Springs | May 19–23, 2027 confirmed | [USAP calendar](https://usapickleball.org/goldenticket/) confirms Peak Pickleball. Need edition-specific wheelchair brackets, registration link and fees. Do not assume the supplied general amateur pricing applies. |
| Numotion Wheelchair Nationals | June 2027, TBA in the brief | [Official page](https://usapickleball.org/wheelchair-national-championships/) still describes June 19–21, **2026**. Leave dates null in the review file. Need the 2027 announcement; no June 1 placeholder, reused 2026 price or copied participation statistics. |
| APP Detroit Open | July 22–25, 2027 confirmed | [USAP announcement](https://usapickleball.org/usap-news/usa-pickleball-announces-eight-app-tour-events-as-2027-golden-ticket-national-qualifiers/) confirms Novi and Vibe Credit Union Showplace. Need this edition's wheelchair brackets and pricing; a previous APP tournament is not evidence for Detroit. |

## Notes outside the 13-row schedule

The brief also mentions San Diego, Glendale, SPP Paddle Classic and Spooky Spokes, plus Nationals qualification. These are context, not additional verified imports. No 2027 Spooky Spokes or October SPP dates are fabricated; the existing Spooky Spokes history is untouched. The Glendale exclusion and San Diego wheelchair availability need their own edition-specific check before becoming event data. The [USAP Golden Ticket FAQ](https://usapickleball.org/goldenticket/) distinguishes wheelchair-division entry at Nationals from entry into skill/age divisions; do not turn that into a blanket qualification exemption or reuse the brief's Nationals fee claim.

## Apply and verify

This PR was branched from `staging` at `b1e19123eaefbc77630afce21ad880da2ed60c74`. It changes data files and tests only. **No remote database has been modified.** Merging this PR alone does not execute the SQL. Faisal owns the database application and production promotion.

The file adds at most two dated rows to the existing `events` table. It needs the existing `pickleball` sports key and no schema migration. It does not create organizations, recurring programs or inferred host associations; `org_id` and `program_id` remain null, which the calendar already supports.

Before applying, inspect potential existing entries in the target database:

```sql
SELECT id, title, city, state, starts_at, ends_at, url, status, is_public
FROM events
WHERE substr(starts_at, 1, 4) = '2027'
  AND (lower(title) LIKE '%las vegas%' OR lower(title) LIKE '%pva%'
       OR lower(url) LIKE '%golden-ticket-las-vegas%'
       OR lower(url) LIKE '%5a2fui1tjm9%');
```

The insert skips existing IDs, same-year source/registration URLs (including query strings and trailing slashes), and recognizable event names in the same city/state with overlapping dates. It also skips matching hidden or cancelled entries, preserving editorial decisions. An existing edition is left unchanged, not silently enriched. A duplicate under a completely different title and URL still needs human reconciliation in preflight. Past editions using the same URL and similarly named tournaments in another city or month do not block the 2027 insert.

After reviewing preflight, use the repository's normal authenticated Wrangler environment. Apply to staging first:

```sh
npx wrangler d1 execute asnm-db-staging --config wrangler.preview.json --remote --file db/maintenance/wheelchair_tournaments_2026_2027.sql
```

Read back those entries with the preflight query and check `/events` filtered to Pickleball plus `/events.ics` on the staging site. Verify dates, full descriptions, destination links and no duplicates. Expect 0–2 new rows depending on existing editions, not an unconditional +2.

Only after Faisal approves staging and is ready to publish, he can apply the same file to production:

```sh
npx wrangler d1 execute asnm-db --config wrangler.json --remote --file db/maintenance/wheelchair_tournaments_2026_2027.sql
```

Repeat the read-back and calendar/feed check there. No automatic deploy, merge, production write, notification or monitor is attached to this PR.

## Local verification

```sh
node --test test/wheelchair-tournament-import.test.js
npm test
```

The focused tests execute the SQL against the repository schema with foreign keys enabled, read it through the actual calendar query and ICS renderer, and check repeat runs, human-edited/hidden/cancelled rows, alternate IDs/names/URLs, past editions, unrelated records and unchanged non-event tables. All 13 candidates remain in the review file; only the two confirmed entries are executable SQL.
