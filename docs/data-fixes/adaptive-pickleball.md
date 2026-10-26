# Adaptive pickleball across the US

Researched 2026-10-26 for Alec ("add the pickleball clubs to the database"). Every row was checked on the organization's own page (or an official partner page) for adaptive pickleball that is running now: wheelchair, standing adaptive, blind and low vision, para, veterans, and "pickleball for all" sessions for people with disabilities. A general pickleball club counts only when its own page shows a regular adaptive session. No people's names, emails or phone numbers.

The full list with sources is [adaptive-pickleball.csv](adaptive-pickleball.csv). The SQL is ready to run, yours to decide on, Faisal:

| File | What it does | Rows | Needs |
|---|---|---|---|
| `db/maintenance/pickleball_1_new_organizations.sql` | New organizations, each confirmed current | 42 | nothing; runs today |
| `db/maintenance/pickleball_2_programs_for_listed_organizations.sql` | Organizations already listed that run adaptive pickleball: adds a Pickleball program on the organization's card, with its seasons, and adds pickleball to its sports so search finds it | 33 | migration 0015 (PR #121) |
| `db/maintenance/pickleball_3_look_first.sql` | Each says what to check first: no 2026 dates, news or social only, one-off clinics, a page that moved | 87 | 0015 for the program inserts |

All three are safe to run twice: fixed ids with `INSERT OR IGNORE`, and every insert is skipped when a row with the same website, or the same name in the same state, or a pickleball program for that organization, already exists. Tested twice on a copy of production from 2026-10-18: +42 organizations, +33 programs, nothing doubled.

Confident rows by state: AZ 3, CA 5, CO 2, CT 1, DE 2, FL 3, GA 1, IL 6, IN 2, KS 2, MA 2, MD 2, ME 1, MI 2, MN 3, MO 1, NC 1, NH 1, NJ 1, NV 4, NY 2, OH 3, OK 2, OR 1, PA 1, SC 4, TN 2, TX 7, UT 2, VA 2, WA 2, WI 2.

## Not changed here, worth a look

- **Duplicates already in the directory:** Gaylord Sports Association (`51dcf29d`, `fe5057c2`), Pennsylvania Center for Adapted Sports (`046a3daf`, `94a8261c`), Kennedy Krieger (`2f674a24`, `6783a3b2`, `fc8eec3d`), Kentwood Parks and Recreation (`82c4bec5`, `18765bd8`), Columbus Recreation and Parks (`626e65a4`, `10d1e42e`), Adaptive Sports Northwest (`5802e432`, `26e936a3`). The pickleball program went on the first of each.
- **Probably stale:** 3rd Shot Pickleball Reno Adaptive (its own site no longer mentions adaptive play), Harford County MD pickleball (`3cffbe5f`, no current adaptive pickleball on any county page), Access Leisure Sacramento's adaptive pickleball page now returns 404.
- **Seven matches are program rows under "Organization not yet assigned"** (Palm Beach Gardens, Palm Beach County, Fayetteville, Atrium Health, Greensboro, Greenville NC, Special Olympics Maryland Anne Arundel, RHI). They're listed in file 3 with their pickleball pages; no SQL until they have an organization.
- **The Pickle Lodge** (Cincinnati) is in PR #121's Spooky Spokes file as the host of that yearly event. It has no regular adaptive play, so its three locations are not added as adaptive programs.
- No current programs found in Vermont, West Virginia, Alaska, Idaho, Montana, Louisiana, Nebraska and the Dakotas. The US Wheelchair Pickleball Association publishes no club list we could reach.
