# Organization descriptions: run guide

For the data lane (Faisal). The plan is [docs/specs/organization-descriptions.md](../specs/organization-descriptions.md); the tool is `tools/directory/describe.mjs`.

## Start here: batch 1 (the pilot)

Alec read all 25 pilot organizations on 2026-10-18 and said "all good". 18 have a description; 7 could not be drafted (their websites are broken, see below).

1. Run `db/maintenance/descriptions_001_pilot.sql` on `asnm-db`, once:
   ```sh
   npx wrangler d1 execute asnm-db --remote --file db/maintenance/descriptions_001_pilot.sql
   ```
2. The last statement reads back. Expect `written = 18`.
3. Open three of them on the live site and read the About section.

What the file does, for each of the 18:
- writes the new description only if the description on record is still the one we drafted against (empty, or the old note). Anything changed since is left alone, so running it twice writes nothing the second time.
- moves an old note into `internal_notes` with the date, never deletes it (6 of the 18 had one).

Rehearsed 2026-10-18 on `asnm-db-staging`: 18 rows written, 6 notes moved; a second run wrote 0.

## Websites to fix

`docs/data-fixes/descriptions-sites-to-fix.csv`: 12 listings from the pilot whose website is dead, parked, moved, or doesn't match the listing. Seven of them are why there was no draft.

One is a **security** finding: Helen Hayes Hospital's adapted sports page carries hidden, injected gambling links (an off-screen block of "online gaming" links), a sign the hospital's site was compromised. Visitors don't see it. Whether to tell the hospital is Alec's call.

## Every batch after this

```sh
node tools/directory/describe.mjs batch --size 50          # next 50; notes hidden for contact details first
# draft them with tools/directory/describe-prompt.md into a drafts file
node tools/directory/describe.mjs review <drafts.json>      # a review page for the approver
node tools/directory/describe.mjs file <drafts.json> --approved-by "Karen" --except 3,7 --apply
node tools/directory/describe.mjs export --out db/maintenance/descriptions_NNN.sql
```

`file` refuses the whole batch if any draft fails a check or quotes something the website no longer says. `--except` leaves the numbers the approver didn't approve as pending. `export` writes every approved row; because each update checks the old text first, rows already applied are skipped.
