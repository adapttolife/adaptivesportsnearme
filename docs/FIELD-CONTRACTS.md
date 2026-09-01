# Field contracts

Which fields a person reads, which fields the machine reads, and the checks that
keep them apart.

## How we learned this

In August 2026 an RCOS student on the summer team read the live tester and found
that most program descriptions were not descriptions. They were the pipeline's
own verification memos, published by mistake:

> Listed https://carplb.tripod.com/index.htm is dead this pass (NXDOMAIN /
> pipeline HTTP 530). Guessed www.carplb.net is also NXDOMAIN — not stored.
> Org is not marked gone from a dead Tripod host alone. Do not invent …

She was right. 330 of 356 populated descriptions were affected.

Sweeping the rest of the table found the same voice in two more fields she had
not looked at, both equally public:

| Field | Populated | Carrying the memo voice |
|---|---|---|
| `description` | 356 | 330 |
| `cost_note` | 98 | 76 |
| `ages` | 137 | 78 |

And a different failure in a fourth place: eight listings were website
navigation labels — "Donate", "Our Team", "Events Calendar" — scraped from a
directory's nav bar and stored as organisations, each with a URL and a data
source, structurally indistinguishable from a real program.

**The lesson is not "descriptions were wrong."** It is that we filled fields
without ever writing down who reads them. The pipeline's success condition was
*the field is populated*. Nobody's success condition was *a person could act on
this*. Every defect above is the same defect wearing different clothes, and it
took a human reading the product to see any of it.

That is what "AI slop" actually means here. Not bad prose — **machine output
that became the product without a person ever deciding it was fit for a
reader.**

## The two audiences

Every free-text field on `organizations` serves exactly one, never both:

| Audience | Fields | Rule |
|---|---|---|
| **A person** deciding whether a program is for them | `description`, `cost_note`, `ages` | Written as if the reader is standing in front of you. No jargon, no record ids, no instructions to a future process. |
| **The pipeline**, remembering what it learned last pass | `internal_notes` | Anything useful. Never rendered. Never in `LIST_COLS`. |

## What the checks do

The rule is enforced in code, not in this file.

- **`src/description-contract.js`**
  - `checkPublicDescription()` refuses text that reads as a memo and returns the
    reason. Its patterns are the vocabulary found in the real corpus: operator
    instructions, verification voice, extraction outcomes, merge and triage
    notes, raw diagnostics, bare record ids.
  - `stripOperatorVocabulary()` removes the vocabulary while keeping the facts.
    This matters most in `cost_note` and `ages`, where "Official: $25.00
    includes a TOPS t-shirt" is a real price wearing the wrong clothes. Deleting
    the sentence would throw away data nobody wants to re-source.
  - `repairPublicText()` strips, then moves whatever is still a memo into
    `internal_notes`. Across 484 contaminated values it keeps the facts in 482
    and empties 2.
  - `looksLikeNavigationLabel()` catches "Donate" and its relatives.
- **`src/admin.js`** — both write paths return **422 with the reason** if a
  proposal would publish a memo or admit a navigation label. The pipeline cannot
  land one even if a human approves the proposal by mistake.
- **`test/description-contract.test.js`** — pinned to the real August 2026
  strings, plus idempotency, plus a check that `internal_notes` never enters the
  public column list.
- **`scripts/repair-public-text.mjs`** — the one-time repair. Idempotent,
  dry-run by default.

## Two judgment calls worth knowing about

**Bounded `Not X`.** A sentence opening `Not <Capitalised>` is how the pipeline
records "this org is not that other org". There are 364 of them and every one is
a dedupe note, the longest 13 words. But exactly one real organisation is called
*Not Forgotten Outreach*, so the rule is bounded by sentence length rather than
matching blindly.

**UUIDs inside URLs.** A raw record id in prose is a leak. The same character
sequence inside a URL path is a legitimate address. The pattern excludes hex
tokens adjacent to `/` or `-`.

Both are the kind of decision that a count cannot make for you, which is the
other half of the lesson: **the pass/fail number lied three separate times
during this repair.** Reading the output caught a sentence splitter breaking on
`5025 E. Washington St.`, a missing regex flag, and 40 prices being discarded
because `Official:` with a colon was not handled. Read the output.

## What a good value looks like

Unedited, from the directory:

> Goalball program of Adaptive Sports Northwest serving Oregon and SW
> Washington. 2026 practices listed at the WA State School for the Blind
> gymnasium; coach Jen Armbruster.

> Cycling / kayaking: Ages 8+. Mountain biking: Ages 18+.

Concrete, sourced, answering the only question the reader has: *can I show up,
and is this for me?*

## What belongs in `internal_notes`

Everything the pipeline needs and the reader does not: which URL redirected,
what a previous pass decided and why, which similarly-named organisations this
one must not be merged with, which phone number is a roster artifact rather than
a program contact.

This is not second-class data. The disambiguation notes are the most expensive
thing in the database to reproduce.

## If you are adding a field

Write its audience into the table above before you write the migration. A field
with two audiences is a bug that will surface on a stranger's screen.

## Related

- Sports taxonomy and field names: the merged data dictionary in
  `adapttolife/adaptivesportsnearme-data`, converged with the RCOS team's
  `DataFields.md`.
- The human review queue invariant: automation proposes, a person approves.
  See `src/admin.js`. As of Sept 2026 that queue holds 824 proposals, the oldest
  from June 10, and nothing had been approved in 24 hours. A check that no one
  answers is not a check.
