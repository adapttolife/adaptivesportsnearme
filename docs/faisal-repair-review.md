# Faisal review: one current repair PR

**Review ASNM PR #25 into `staging`. PR #24 is superseded; do not merge its old direct-to-main branch.** This document is the current handoff, not a request to reconstruct progress from comments. Julia performed the work directly at Alec's request.

## Response to Faisal's requests

| Request | Work completed and evidence | What is not yet claimed |
|---|---|---|
| Investigate D1 write-limit alerts | Confirmed account-wide quota alerts and queried Cloudflare daily metrics. At the audit capture, Sep 14 had 128,266 rows written and Sep 15 had 101,285. Bulk activity dominated: Sep 15 staging DB accounted for 96,123 writes in one reported write query. Refreshed the metrics: complete UTC days Sep 16 and Sep 17 recorded 2,637 and 2,545 writes respectively, not continuing quota exhaustion at that capture. Inspected importer, schedules and deployed bundles. Preserved Faisal's `b3cc1ab` optimization without duplicating or changing `src/pipeline.js`. | Metrics do not identify the historical caller or prove recurring delete/reinsert automation. No paid-plan change or bulk reimport. Production optimization and a complete post-release daily observation remain outstanding. |
| Branch from staging and PR back to staging | This branch starts at current `staging` (`b3cc1ab`) and #25 targets `staging`. Reconciled the intended fields, copy and photo changes from #24 rather than merging its divergent branch. Main is untouched. | Review/merge is not a production deployment approval. |
| Preserve team design work and coordinate redesign | Kept Faisal's extracted stylesheet and current spacing. Repaired formatting-sensitive tests without reverting the team's layout. Preserved the intended athlete photos, first-name field and beta opt-in. | No redesign was undertaken or approved on Hannah's behalf. This infrastructure repair does not replace the team's design-planning discussion. |
| Supply Gmail sending credentials | Dedicated native Gmail refresh grant for `hello@adapttolife.org` is provisioned. Refreshed it directly; verified email identity and only send/email-identity/OpenID scopes; inbox read was denied. Staged `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REFRESH_TOKEN` in undeployed versions of all four relevant Workers and read back the binding names. | This is not a generic API key and not the agent's broad token. Production code has not been activated. Google app audience/publishing policy still needs confirmation before promising no testing-mode expiry. |

## Verification actually executed

- Fresh full ASNM suite: **282 passed, zero failures/skips**.
- Fresh full ATL candidate suite: **578 passed, zero failures/skips**.
- Preview and gate Wrangler dry-run builds; separate ATL site-mail entrypoint bundle; local SQLite/D1 additive schema exercise.
- Actual local Worker and Chromium signup checks at phone and desktop widths. These do not represent live-public form submissions.
- ASNM and ATL mail transport files are byte-identical (SHA-256 `79ded234e1318899cfbfe102fa4c7aa63cce167d6f9c91ae7f9c2cfb654f3c76`). Native Gmail test used the ATL repair branch's actual `src/mail-transport.js`, not a mocked Gmail response and not Composio sending. A controlled hello@ to hello@ message with an attachment was accepted as `1a0b265fe4844b13`, independently read back with SENT and INBOX labels, attachment bytes checked, then moved to Trash and verified. This proves the tested transport and self-recipient path, not every form or external-recipient delivery.
- Concurrency, consent/opt-out, repeat signup, inactive subscriber, uncertain provider/send response, receipt persistence failure, Gmail configuration, sender restrictions, MIME and deployment-boundary cases are covered in automated tests.

## Code review map

1. `src/newsletter.js`, `src/intake.js`, `db/intake-schema.sql`: consent, durable intake/claims, single welcome attempt, conservative uncertain outcomes.
2. `src/signup-gate.js`, `src/index.js`: same implementation behind the existing production `/api/subscribe*` gate and app/preview routes.
3. `src/mail-transport.js`, `src/email.js`: explicit Gmail selection, authorized sender, native token refresh, one submission, no cross-provider fallback.
4. `wrangler*.json`, `test/deploy-boundaries.test.js`: account/routing/database isolation and version-preview protection.
5. UI and tests: intended #24 changes without overwriting staging design work; whitespace-independent CSS assertions still check selectors/values.

## Secret staging receipt — these versions are NOT release artifacts

| Worker | Version containing staged Gmail secrets |
|---|---|
| adapt-to-life | `c18d0d36-2d6f-48cc-9662-93800c83f809` |
| adaptivesportsnearme | `d9f82a59-0478-494a-b3df-ef9777aae346` |
| asnm-gate | `ada24791-1fcc-475a-b7ef-484e7b1d6ff8` |
| asnm-preview | `61a1bd69-e633-444a-b2c1-15825e91fe1f` |

All traffic-serving version IDs were unchanged after staging. These versions inherit pre-existing code; **do not promote them as the fix**. Upload the reviewed repair with secrets preserved and explicit `MAIL_TRANSPORT=gmail` / `GMAIL_FROM=hello@adapttolife.org`.

Version-only preview URLs were disabled on the production-backed app and gate; regular workers.dev settings, live domains and the dedicated preview endpoint were preserved. DNS/MX were not changed. Do not use a generated production-backed build URL as an isolated test environment.

## Separate repository boundary: ATL

The associated [ATL repair branch](https://github.com/adapttolife/adapt-to-life/tree/fix/julia-gmail-transport) contains the native sender across existing receipt/attachment/intake/donation paths and conservative donation claims. It has not been integrated or deployed. The repository has no git `staging` branch; Wrangler's staging environment is not a git integration ref and is front-end-only.

There is deliberately no additional ATL repair PR to sort through. **This ASNM PR cannot merge code into a different repository.** The ATL integration base/process must be confirmed before that code can be integrated. Julia retains implementation ownership; this is a real release gate, not homework to recreate the repair. Unrelated existing ATL content/CRM PRs are outside this repair and remain untouched.

## Session scope beyond website code

Julia's separate business-account connection already has the broad Workspace scope baseline requested by Alec. Live read/write checks covered Gmail, Drive, Docs, Sheets, Slides, Calendar, Contacts and Tasks, with synthetic resources cleaned up. The website's narrow grant does not restrict Julia's inbox access. Agent permissions are not a source-code change to merge here and do not imply Workspace administrator privileges.

## Ordered remaining gates

1. Review this exact staging candidate and its latest checks; preserve concurrent work. Confirm the ATL repository's integration path rather than inventing a staging branch or silently merging main.
2. Confirm Google OAuth app audience/publishing policy. A successful refresh alone does not establish the absence of testing-mode expiry.
3. Apply the additive intake/receipt schema to isolated staging after inspecting existing columns. Do not apply the directory reset/import schema to production.
4. Exercise reviewed runtime/form paths in isolation with approved recipient-controlled fixtures: fields/publication, one welcome, internal notification, provider IDs, actual inbox receipts, attachments/privacy boundaries, and exact cleanup. Native self-send is not this acceptance test.
5. Inspect historical intake/donation/waiver delivery debt; never mass-replay uncertain claims. Upload reviewed source with preserved secrets; separately approve production release of the actual routed gate and ATL backend, not just the frontend.
6. Verify resulting live deployments/routes, inspect receipts and monitor full-day account-wide D1 writes. Retain rollback versions and additive delivery evidence.

**Current conclusion:** source repair and sender credential are prepared and tested as described. One current ASNM review is ready. Live website mail restoration and all-session release acceptance are not yet complete.
