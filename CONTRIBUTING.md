# Contributing

Students: start with [docs/STUDENTS.md](docs/STUDENTS.md). Short version:

- Branch off `staging`.
- Open a pull request **into `staging`**.
- Feature/fix PRs never target `main`. Only the project lead opens a separately approved `staging` → `main` release PR after staging acceptance.
- Never deploy production (`asnm`). Never write `asnm-db`. Live public count stays 1,544.
- Tester: https://asnm-staging.adapt-to-life.workers.dev
- Live (locked): https://adaptivesportsnearme.com

ATL and ASNM share this method: fetch current staging → feature/fix branch → PR into staging → separately reviewed staging-to-main release. Keep one current repair PR per repository and link cross-repository companions. Check `git merge-base --is-ancestor origin/staging HEAD` before review; preserve concurrent work.

Read-only CI checks PR routing, staging ancestry and the full suite; it never deploys. At setup inspection ASNM had no branch protection and ATL's plan rejected protection/ruleset access. Checks and written policy are not claimed as mandatory merge enforcement. Existing Cloudflare Builds may upload production-bound non-main versions; do not use those as isolated test environments. Verify traffic-serving versions after pushes.

Do not commit `.env`, Wrangler auth, 1Password output, tokens, or local pile dumps (`inbox/`, receipts, leftover candidates).
