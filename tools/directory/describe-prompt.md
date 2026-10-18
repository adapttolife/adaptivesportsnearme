# Drafting organization descriptions

The brief for drafting a batch from `describe.mjs batch`. Any careful person, or any AI assistant, can follow it. Every draft is checked (`describe.mjs check`) and read by a person before anything reaches the site. See [the spec](../../docs/specs/organization-descriptions.md).

## For each organization in the batch

1. **Read its own website**, and nothing else: no search engines, no other sites, nothing you already know about it. You may follow up to three links on the same site (About, Programs, Adaptive) when the home page doesn't say what they offer. Try `https://` if `http://` fails.
2. **Write two plain sentences, 120 to 320 characters in all.**
   - First: what the organization offers. Name the sport or activity, and the place if the site says it.
   - Second: who it's for, in the site's own terms (ages, disabilities, veterans, families), plus one useful fact if the site states it (equipment provided, free, no experience needed).
3. **Never** write dashes (– or —), dates, months, seasons, years, prices, times, email addresses, phone numbers, street addresses or staff names. Never "inspiring", "suffer", "confined", "wheelchair-bound", "special needs" or "handicapped". Don't invent anything: every claim needs words on the site behind it.
4. A listing is an **organization**. A **program** is what it offers, like wheelchair basketball. Start with the organization's name or "It".
5. **No draft** when the site is down, parked, behind a login, a Facebook page you can't read, or says nothing about adaptive sports or disability. Give a one-line reason a person can act on, like "Site down (DNS fails)" or "Page moved; challengeaspen.org answers".

## The drafts file

A JSON array, one object per organization in the batch, in the same order, keeping the batch's `id`, `name`, `state`, `was` and `from`:

```json
{
  "id": "…", "name": "…", "state": "CO", "was": "empty", "from": null,
  "status": "draft",
  "description": "Two sentences.",
  "source_url": "https://the-page-you-read/",
  "pages_read": ["https://…"],
  "fetched_at": "2026-10-19T15:04:00Z",
  "from_page": ["short quotes copied exactly from the site, one for each claim"],
  "reason": null,
  "note": "anything a reviewer should know, or null"
}
```

For no draft: `"status": "no_draft"`, `"description": null`, and a `reason`.

Then run `node tools/directory/describe.mjs review <drafts.json>` and send the review page to a reviewer.
