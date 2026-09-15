# Directory tools — tester only

These scripts are how students work the Adaptive Sports Near Me directory **on the tester**. They never write the live database (`asnm-db`). Live public count must stay **1,544**.

Tester: https://asnm-staging.adapt-to-life.workers.dev  
Live (locked): https://adaptivesportsnearme.com

Discover is this folder. There is no production cron that writes live. Do not add one.

```
node tools/directory/asnm.mjs help
```

Run from the repo root. You need Wrangler logged in, and you need the Cloudflare account that owns `asnm-db-staging`.

## Commands

| Command | What it does |
|---|---|
| `status` | live vs tester counts + last cron jobs |
| `queue` | what's waiting in the review pile |
| `diff` | live vs tester |
| `gaps` | thinnest states (for later discover) |
| `recheck` | re-hit pending dead-link proposals |
| `hide-404s` | dry-run hide last recheck 404s (`--apply` for tester) |
| `twins` | keep only obvious same-name twins in the resolve card |
| `rescue` | if a hidden listing's home page is up, write an inbox card |
| `export <lane>` | turn a pile into an inbox card |
| `lint <card.json>` | refuse invented names |
| `read <https://…>` | same page reader the website cron jobs use |
| `ship <card.json>` | dry-run tester SQL (`--apply` only after a person says yes) |
| `discover [file]` | leftover candidates → tester `review_queue` (propose only; `--apply` writes staging) |
| `eval-lanes` | receipt: extractors, discover dry-run does not write live, resolve twins |

`--apply` writes **tester** (`asnm-db-staging`) only, and only after a person says yes. Dry-run is the default.

Inbox cards live under `tools/directory/inbox/` on your machine. That folder is gitignored. Same for receipts, snapshots, and leftover candidate dumps.

## Live lock

Ship and discover refuse a non-SELECT against `asnm-db`. If the public live count is not 1,544, they abort. Do not pass `--allow-live-drift` unless Alec said the live number is allowed to move — it is not, right now.

Do not deploy the production worker (`asnm`) from this branch. Pushing `main` deploys production.

## What is not here

Huge inbox dumps, leftover-candidate piles, and receipts stay on the machine that generated them. They are not in GitHub. Bring your own candidate file to `discover`.
