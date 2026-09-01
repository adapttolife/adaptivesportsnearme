# Start here — your first hour on Adaptive Sports Near Me

You just joined a project where the code you write helps a real person find a
sport they thought they'd lost. This hour gets you from clone to contribution.

## Minute 0–10: see the real thing

Open the tester: https://asnm-staging.alec-af3.workers.dev/

Pick ten listings at random. For each one, ask a single question: *could a
stranger act on this tonight?* (Is there a place? A website, phone, or email?)
Write down what you notice. You have just performed this project's most
important quality check — a student doing exactly this in August found a
defect every automated check had missed for months.

## Minute 10–20: run the scoreboard

```
node tools/four-doors-check.mjs
node tools/four-doors-check.mjs --place MT
```

Four doors: programs, events, grants, the letter. The semester is over when
all four open and Karen — a retired Army captain who tests this as a real
user — agrees. Try a few states. The closed ones are the work.

## Minute 20–40: run the system

```
npm install
npm test          # 191 tests, green before and after every change you make
npx wrangler dev  # the site, locally
```

Then read two short documents, in this order:

1. **`docs/FIELD-CONTRACTS.md`** — who reads each field, and the story of how
   machine notes ended up on athletes' screens. The most important lesson in
   the repo.
2. **`docs/ROADMAP-FALL-2026.md`** — what we build, how, and how we know.

## Minute 40–60: judge five proposals

The pipeline proposes changes; a person approves them. 800+ proposals are
waiting. Ask the lead for queue access, then judge five: is the evidence
real? Would you stake the site's trust on it? You'll learn more about this
system in five judgments than in an afternoon of reading code.

## The rules that keep us honest

- **Merge small, merge weekly.** Unmerged work is invisible work. A branch
  older than two weeks gets discussed at the weekly integration point.
- **Automation proposes; a person approves.** Nothing you scrape or generate
  goes straight to the public table. Ever.
- **Public fields speak to people.** The pipeline keeps its notes in
  `internal_notes`. The write path enforces this; don't fight it, thank it.
- **When a count and the artifact disagree, the artifact wins.** Read the
  output. Read the page. Read it like a stranger.

## Who to ask

- **The project lead** — day to day, what merges, what's ready.
- **Alec Tranel** (alec@alectranel.com) — product, vision, the live site.
- **Karen Atkinson** — whether it actually works for the community.
- **Clara James** (last semester's lead) — the `ASInstance` data model and
  anything about the summer semester. She's offered to answer questions.

Welcome. Someone is going to find a sport because of what you ship here.
