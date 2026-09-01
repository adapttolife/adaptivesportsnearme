# Lineage

Software forgets its authors unless someone writes them down. This project's
foundation was laid by RCOS students in Summer 2026, and parts of what they
built are running in production today. Their names belong here.

## Summer 2026 — RCOS

**Clara James** — project lead. Designed the data model: the field dictionary
(`DataFields.md` in `adapttolife/ASNMxRCOS`) whose five sport fields are, under
the names she chose, the five columns of the production `sports` table —
`name`, `super_type`, `category`, `is_paralympic`, `is_team`. Built the
`ASInstance` module in C: the sports-instance layer (when and where to actually
show up) that the events door is being built on. In August she read the live
tester as a user and found the description defect that led to the field
contracts (`FIELD-CONTRACTS.md`) — the most consequential quality catch in the
project's history.

**Robin Corwin** — front end and parsing. Built a working front end with
search over a SQL schema (`FrontEnd` branch), and co-built the address parser
(`parsing/parseLocation.c`, with its own location reference table) that
reconstructs house number, street, city, state and ZIP from unformatted
strings — the same problem the production geocode lane solves, worked
independently.

**Ethan Bean** — collection. Built the web crawler and scraper
(`crawler`/`Pipeline` branches) that walked real adaptive-sports sites and
produced the project's first URL frontier.

Much of this work lives on branches of `adapttolife/ASNMxRCOS` rather than its
main branch. That is an integration lesson this project has now written into
its rules (see `ROADMAP-FALL-2026.md`: merge small, merge weekly) — it is not
a comment on the work, which was real.

## How to get added to this file

Ship something a stranger benefits from. The project lead updates this file at
the end of each semester; disagreements about credit go to Alec.
