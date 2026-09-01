# Field contracts

Which fields a person reads, which fields the machine reads, and the rule that
keeps them apart.

This document exists because we broke that rule. In August 2026 an RCOS student
read the live tester and found that 282 of 356 populated program descriptions
were pipeline verification memos rather than copy written for a human. Text like
this was being shown to disabled athletes looking for a sport:

> Listed https://carplb.tripod.com/index.htm is dead this pass (NXDOMAIN /
> pipeline HTTP 530). Guessed www.carplb.net is also NXDOMAIN — not stored.
> Org is not marked gone from a dead Tripod host alone. Do not invent …

Nothing was wrong with that text. It is careful, accurate, and it is exactly
what stops a later pipeline run from merging two organizations that share a
name. It was in the wrong column.

## The two audiences

Every free-text field on `organizations` serves exactly one of these, and it is
never both:

| Audience | Fields | Rule |
|---|---|---|
| **A person** deciding whether a program is for them | `description`, `cost_note`, `ages` | Written as if the reader is standing in front of you. No jargon, no record ids, no instructions to a future process. |
| **The pipeline**, remembering what it learned last pass | `internal_notes` | Anything useful. Never rendered. Never in `LIST_COLS`. |

## Why `description` gets a guard and the others do not

`description` is the only field where the two audiences produce text that looks
alike. A memo and a description are both prose about an organization, so the
mistake is invisible in a diff and invisible in a spot check. It took a person
reading the live site to find it.

So the rule is enforced in code, not in this file:

- `src/description-contract.js` — `checkPublicDescription()` refuses text that
  reads as a memo, and returns the reason. `splitPublicDescription()` separates
  a mixed record into its two halves without discarding either.
- `src/admin.js` — both write paths (new-org apply, existing-org apply) call
  `rejectMemoDescription()` and return **422** with the reason. The pipeline
  cannot publish a memo even if a human approves the proposal by mistake.
- `test/description-contract.test.js` — pinned to the real strings that were
  live in August 2026. If a change makes any of them publishable again, the
  suite fails.
- `db/migrations/0004_description_contract.sql` — gives memos a legal home so
  the guard has somewhere to send them.
- `scripts/repair-descriptions.mjs` — the one-time repair. Idempotent.

If you are adding a field, decide its audience first and write it in the table
above. A field with two audiences is a bug that will surface on a stranger's
screen.

## What a good description looks like

Real examples from the directory, unedited:

> Goalball program of Adaptive Sports Northwest serving Oregon and SW
> Washington. 2026 practices listed at the WA State School for the Blind
> gymnasium; coach Jen Armbruster.

> USWRA wheelchair rugby team (the Rhinos) practicing in Wooster. Open to
> athletes with loss of function in at least three limbs.

Concrete, sourced, and it answers the only question the reader has: *can I show
up, and is this for me?*

## What belongs in `internal_notes`

Everything the pipeline needs and the reader does not: which URL redirected,
what a previous pass decided and why, which similarly-named organizations this
one must not be merged with, which phone number is a roster artifact rather than
a program contact.

This is not second-class data. The disambiguation notes are the most expensive
thing in the database to reproduce.

## Related

- Sports taxonomy and field names: the merged data dictionary in
  `adapttolife/adaptivesportsnearme-data`, which converged with the RCOS team's
  `DataFields.md` (their `sport_super_type` is the one we adopted).
- The human review queue invariant: automation proposes, a person approves.
  See `src/admin.js` and `scripts/asnm-judgment-batch.md` in the agentos repo.
