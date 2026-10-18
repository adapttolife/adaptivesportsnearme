# Organization descriptions

- **Status:** approved (pilot: Alec read 25, "all good", 2026-10-18)
- **Owner:** Alec (decides) · Karen (editor, approves batches) · Faisal (data lane: the only writer to production D1)
- **Depends on:** #80 (notes with contact details hidden without consent)

## Objective

Every organization page should tell a first-time visitor, in two plain sentences, **what the organization offers and who it's for**. Today many pages say "We don't have a description for this organization yet." That one line makes the directory feel thin, and it's the first thing an athlete reads after the name.

Measured 2026-10-18 on a copy of production (`asnm-db-review-20261018b`), active public organizations:

| | Count |
|---|---|
| Active public organizations | 2,833 |
| No description at all | 1,355 |
| …of those, with a website we can read | **450** |
| …of those, with no website | 905 |
| Notes hidden for contact details (PR #80) | **102** |

**v1 covers the 552 organizations with a website** (450 + 102). Alec chose this as the next deep content piece (2026-10-18), with a pilot of 25 for him to read before anything is written to the database.

## Design principles

1. **From the organization's own website, and nothing else.** No guessing, no other sites, no outside knowledge. If the site doesn't say who it's for, the description doesn't either.
2. **A person approves every description before it goes live.** Drafts are proposals. This is the directory's existing rule: pipeline lanes propose into `review_queue`, and a person approves (`db/schema.sql`).
3. **One writer to production.** Faisal applies approved descriptions to `asnm-db`. Agents never write production.
4. **Public copy, not notes.** It follows the description contract (`src/description-contract.js`): no memos, no instructions to the next pass. And the contact rule (`src/public-text.js`): no email, phone, street address or PO box.
5. **Things that don't go stale.** No dates, seasons, schedules, prices or names of staff. Those change; the page already says to check the website.
6. **The Adaptive Sports Near Me voice:** useful, plain, respectful. Name the sport and the people early. Never "inspiring", never pity, no dashes. A listing is an **organization**; a **program** is what it offers.
7. **Keep the researchers' work.** An existing note is moved to `internal_notes` before a new description replaces it, never deleted.

## Files to change (collision map)

| File | Change |
|---|---|
| `tools/directory/describe.mjs` | New. Picks the next batch, reads each organization's website (`read-page.mjs`), drafts two sentences, files each as a `review_queue` proposal (`lane: 'describe'`). Tester database only. |
| `tools/directory/describe-check.mjs` | New. The deterministic checks every draft must pass before it's filed (§ Contracts). |
| `test/describe-check.test.js` | New. Pins the checks with real good and bad drafts. |
| `tools/directory/README.md` | Add the describe lane. |
| `docs/data-fixes/descriptions.md` | New. Faisal's run guide: export approved proposals, apply to production, move old notes to `internal_notes`. |
| `db/maintenance/descriptions_apply.sql` | Generated per batch from approved proposals; Faisal runs it. |

## Contracts

**A draft** (one per organization):

```json
{
  "organization_id": "f9b13bac-…",
  "description": "Access Mammoth runs adaptive mountain biking, skiing and paddling in Mammoth Lakes. Its camps are open to riders with physical, cognitive and visual disabilities, with adaptive bikes to borrow.",
  "source_url": "https://www.accessmammoth.org/",
  "fetched_at": "2026-10-19T15:04:00Z",
  "from_page": ["exact sentences on the site that support each claim"]
}
```

**The checks** (`describe-check.mjs`), all must pass or the draft isn't filed:

- 1 or 2 sentences, 120 to 320 characters.
- No contact detail (`contactIn()` from `src/public-text.js` returns null).
- No memo sentence (`src/description-contract.js` patterns).
- No dash characters (– or —), no "inspir*", no "wheelchair-bound" / "suffer" / "confined".
- No date, month, year, price or time.
- Names at least one activity or sport.
- Every claim has a supporting excerpt in `from_page` that appears on `source_url` as fetched.

**The proposal** in `review_queue`: `lane = 'describe'`, `proposed_change = {"description": {"from": <old>, "to": <draft>}}`, `evidence = {source_url, fetched_at, from_page}`.

## Acceptance criteria

1. **Pilot:** 25 drafts, five organizations in each of the five states with the most listings, are on one review page Alec can read on his phone. Nothing is written to any database.
2. **Pilot bar:** Alec (or Karen) approves at least 22 of 25 as written or with a light edit. Fewer than that, and the drafting changes before any batch.
3. Every filed draft passes every check. `node --test test/describe-check.test.js` passes, including a test that each check rejects a real bad example.
4. No draft is applied to production without an `approved` `review_queue` row naming who approved it (`resolved_by`).
5. After each applied batch: every organization in it shows its new description on its page, its old note is in `internal_notes`, and `contactIn()` finds nothing in any public description.
6. **Done for v1:** the count of active public organizations with a website and no description is 0, and the 102 hidden notes are replaced or explicitly marked "no description" by a person.

## Validation plan

- Pilot: open the review page; spot-check five drafts against their websites by hand.
- Per batch: `node tools/directory/describe-check.mjs --file <batch>` reports 0 failures; Faisal's apply guide ends with a read-back query (descriptions written = approved count) and a live page check of three organizations.
- After v1: the count query in Acceptance 6 returns 0.

## Decisions for Owner

| # | Decision | Kind | Default |
|---|---|---|---|
| D1 | Order of batches | mechanical | States by number of listings, most first (there's no page-visit data to rank by). The 102 hidden notes go first, since those pages lost text this week. |
| D2 | Who approves batches | taste | Karen, as editor. Alec reads the pilot. |
| D3 | Batch size | taste | 50 organizations per batch: one sitting for a reviewer. |
| D4 | Say on the page that a description was drafted from the website? | taste | No extra label. A person approved it, and the page already shows when we last checked the listing. |
| D5 | The 905 organizations with no website | taste | Out of v1. They need a website found first (the post-launch "find official sites" work). Without one, the page keeps saying so honestly. |

## Out of scope

- Organizations with no website (D5).
- Program descriptions (the `programs` table); same approach later, once v1 proves it.
- Rewriting descriptions that already read well; v1 only fills empty and hidden ones.
- Photos, logos and anything else on the page.
- Asking organizations to write their own (that's claiming a listing, which already exists at `/help`).
