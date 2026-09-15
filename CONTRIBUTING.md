# Contributing

Students: start with [docs/STUDENTS.md](docs/STUDENTS.md). Short version:

- Branch off `staging`.
- Open a pull request **into `staging`**.
- Never open a pull request into `main`.
- Never deploy production (`asnm`). Never write `asnm-db`. Live public count stays 1,544.
- Tester: https://asnm-staging.adapt-to-life.workers.dev
- Live (locked): https://adaptivesportsnearme.com

Do not commit `.env`, Wrangler auth, 1Password output, tokens, or local pile dumps (`inbox/`, receipts, leftover candidates).
