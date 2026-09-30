# Working on Adaptive Sports Near Me

Plain language for Fall students. If a step would change the live site, stop.

## Two sites

- **Tester** (where you work): https://staging-adaptivesportsnearme.adapt-to-life.workers.dev
  Map is open. About 1,449 programs. Grants are the current 45. Prelaunch is off.
- **Live** (locked): https://adaptivesportsnearme.com  
  Map is gated. 1,544 programs. Grants are still the old six-name list. Nothing goes live until Alec says, and not until you have done rigorous testing.

Live stays locked. Do not deploy the production worker (`asnm`). Do not write the live database (`asnm-db`). The public live count must stay 1,544.

## Two branches

- `main` is the production recipe. Do not push to it. Do not open a pull request into it. Do not merge into it.
- `staging` is the student integration branch. This is the code closest to the tester.

Work like this:

1. `git checkout staging` and `git pull`.
2. Make a short-lived branch off `staging` (`git checkout -b your-name/what-you-are-doing`).
3. Do the work. Do not commit `.env`, tokens, 1Password output, or pile dumps.
4. Open a **pull request into `staging`**, not into `main`.
5. Wait for review. Merge lands on `staging`.

The default branch on GitHub stays `main`. That is on purpose. It does not mean you should work on `main`.

## Tester vs live deploys

One application Worker, `adaptivesportsnearme`, serves both versions:

- Production: `main`, deployed at adaptivesportsnearme.com with production databases.
- Staging: `staging`, uploaded at the tester alias with `asnm-db-staging` for both `DB` and `INTAKE`.

Cloudflare Builds should upload staging with
`npx wrangler versions upload --config wrangler.preview.json --preview-alias staging`.
Restrict that preview build to the `staging` branch. See [README](../README.md#deploy).
Never run `wrangler deploy --env staging`: both configs now name the same Worker,
so that command would replace the production deployment. Students must not push to `main`.
The workflow in `docs/deploy-staging.workflow.yml` is only an inactive historical stub.

## Directory tools

The tester directory tools live in `tools/directory/`. Front door:

```
node tools/directory/asnm.mjs help
```

Discover is those scripts. It proposes into the tester review pile. A person still says yes. It is not a production cron that writes live. See `tools/directory/README.md`.

## Cron jobs

Only production runs scheduled maintenance. Staging and preview export HTTP only and have no cron triggers. They propose; they should not silently rewrite public listings. Do not add a discover cron that writes live.

## If you are unsure

The staging website and directory tools use `asnm-db-staging`. Database changes
stay there, but email, newsletter subscriptions, and Airtable actions use live
production services and have real effects. Check the target before running a
data-maintenance command.
