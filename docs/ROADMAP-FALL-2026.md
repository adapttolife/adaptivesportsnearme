# Fall 2026 — what we build, how we build it, how we know it's real

Written 2026-08-31, the night before the fall class. Every number in this
document was measured that night against the live tester; nothing is
aspirational except the parts labeled vision. When a number here disagrees
with the tester, the tester is right — rerun `node tools/four-doors-check.mjs`
and trust it over this file.

## The one-sentence mission

**A person leaves rehab, names a place, and finds four things: a program near
them, an event to show up to, a grant they could use, and a letter that tells
them sport is still possible. When those four doors open for a stranger, we
launch.**

Everything below serves that sentence. Anything that doesn't can wait.

## The scoreboard (measured 2026-08-31)

```
$ node tools/four-doors-check.mjs

  OPEN    Programs     22 actionable listings in WI — e.g. "Adaptive Mobility Providers"
  CLOSED  Events       events API answers but lists nothing upcoming
  OPEN    Grants       41 open grants with an application route
  CLOSED  The letter   /letter -> 404 (the page does not exist yet)

  2 of 4 doors open.
```

Two doors already open. That is not spin — it is also not the whole truth.
The programs door is open *in Wisconsin*. Run it with `--place MT` or
`--place WY` and it is closed: listings exist there but none carry a city plus
a website, phone, or email — nothing a stranger could act on. New York has 41
listings and exactly one actionable. **The programs door opens state by state,
and the map of closed states is the enrichment backlog.**

## What we build (the four doors, plus the engine under them)

### Door 1 — Programs: open it in all 50 states
Already open where the data is enriched. The work is data, not features:
- **Work the review queue.** 824 machine proposals are waiting for a human,
  the oldest since June 10. The architecture's one rule — automation proposes,
  a person approves — is implemented and has never really been used. Judging
  that queue is the fastest way to understand the whole system.
- **Enrich the name-only listings.** 356 listings are a name and a sport and
  nothing else (mostly Move United and NWBA roster scrapes). Each one an
  enrichment lane or a student can turn actionable is a door opening for
  someone's state.
- **Make the queue fast.** `tools/directory/` already holds queue-peek and a
  deterministic ship pipeline. What's missing is speed: one person should
  clear a hundred proposals an hour, not ten. This is product work, it is the
  highest-leverage item in this document, and almost nobody volunteers for it.

### Door 2 — Events: build the missing half
The events table exists and is empty. This is the summer team's design coming
home: their `ASInstance` module — a sports *instance*, when and where to
actually show up — is exactly this layer, and their Python port of it is the
natural engine. Deterministic sources first (Event JSON-LD, iCal feeds, RSS),
proposals into the same review queue, a person approves. The site already
renders `/events`, an ICS feed, and RSS; they are waiting for rows.

### Door 3 — Grants: finish what's started
45 grants with application routes are live on the tester (built on the
`staging` branch). Remaining: keep them fresh (deadlines pass; a stale grant
is worse than none — freshness checking belongs in the validate lane), grow
coverage beyond the seed set, and connect grants to programs so a listing can
say "athletes here often use these."

### Door 4 — The letter: the only door software cannot build
The letter is a page at `/letter` written by Alec and Karen in their own
words, to the person who just got home from rehab believing sport is over.
It is the emotional front door of the entire site and the one deliverable in
this document that must **never** be machine-written. Students build the page
frame, the print stylesheet, and the "bring this to your PT" affordance; the
words are human. (This door is why the field contracts exist: the site speaks
to people, and we now have machinery that keeps machine voice out of people's
fields — see `FIELD-CONTRACTS.md`.)

### The engine — trust, or none of the doors matter
- Every listing shows an honest last-checked date (44% have one; the validate
  lane is filling this in daily).
- Nothing reaches the public database without a person saying yes — now
  enforced with a 422 at the write boundary, not a convention.
- Accessibility is not a feature here; our users are the reason a11y exists.
  Axe-clean stays the floor; screen-reader passes are part of "tested."

## How we build it

1. **Trunk discipline: merge small, merge weekly.** The most expensive failure
   of the summer — on both sides — was work that never merged. The students
   left a crawler, an address parser, and a front end on seven branches
   nobody could see from `main`; this repo itself had grants and student
   tools stranded 36 commits deep on `staging`. New rule, enforced by the
   project lead: work merges to the trunk weekly or it is discussed at the
   weekly integration point until it does. A branch older than two weeks is
   an incident, not a style.
2. **Automation proposes; a person approves.** Unchanged since the May
   proposal, because it was right. Scrapers and lanes write to the review
   queue, never to the public table. The queue is the classroom: reading the
   machine's proposals and judging them is how you learn the domain.
3. **Two audiences, never both.** Public fields speak to a person; the
   pipeline keeps its memos in `internal_notes`. The contract is code
   (`src/description-contract.js`), the tests are pinned to the real strings
   that once leaked, and the write path refuses violations with the reason.
4. **The tester is the workshop; live stays locked.** Students ship to
   staging freely. Only Alec turns the live site on, and only when the doors
   pass and Karen agrees.
5. **Read the product weekly.** Ten random listings, read as a stranger.
   Every serious defect this project has found was found by a person reading
   the artifact — never by a green check. The project lead owns this ritual.

## How we evaluate it

| Check | Command / ritual | Passes when |
|---|---|---|
| The four doors | `node tools/four-doors-check.mjs` | exit 0 — all doors open |
| Doors, everywhere | same, `--place <state>` across all 56 | programs door open per state |
| The queue is alive | `/api/admin/digest-stats` | pending shrinking; approvals > 0 every week |
| Data speaks to people | `npm test` (191 tests incl. field contracts) | green, always |
| A stranger can use it | ten-listings ritual, weekly | lead finds nothing a reader shouldn't see |
| **The Karen test** | she names a place, live on a call | **she says yes** |

The last row is the only one that ends the semester. The script is the
rehearsal; Karen is the test.

## The vision, honestly held

The directory is phase one, and phase one is almost real: the database, the
site, five automated lanes, a grants layer, and a review discipline all exist.
What sits on top, once the foundation earns trust, is a toolbox for the
community — a grants agent that helps someone assemble an application a human
reviews; instance-level "show up here Saturday" freshness; the letter carried
into rehab hospitals by PTs. Each tool is small, each solves one obstacle a
real person hits after the moment of "I found a program."

This is being built by people who live it — Alec, Karen, the coaches and
engineers around Adapt To Life — and by students whose code will not die in a
classroom folder. The invitation to the fall class is exactly that: two doors
are open, two are yours, and a real person is waiting behind each one.

## Decisions still owed (named so nobody re-litigates silently)

- **Alec:** the words of the letter (with Karen). The frame can be built now.
- **Alec:** hide the 356 name-only listings until enriched
  (`is_public = 0`, staged SQL exists) or leave them visible. Recommendation:
  hide — a locked door reads better than a painted one.
- **Alec:** fold `staging` into `main` so the trunk is true again (draft PR
  open). Then the weekly-merge rule starts clean.
- **Clara's handoff:** her offer stands; the highest-value ask is a short
  written note on `ASInstance`'s design intent, while the context is fresh.
