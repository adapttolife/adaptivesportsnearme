# A directory the community keeps true

- **Status:** phase 1 in progress
- **Owner:** Alec (decides) · Karen (the confirm push) · Faisal (reviews; the only writer to production D1)
- **Builds on:** [programs that come back](programs-that-come-back.md)
- **Evidence:** a phone audit of eight real journeys and a study of community-kept directories (StreetComplete, Google Maps, 211 and findhelp, Open Referral, USA Pickleball, Wikipedia), 2026-10-26

## Objective

Anyone (an organization, an athlete, a parent, a volunteer) can add or fix one fact in under a minute. A person on our team checks it in one tap. Every listing says how fresh it is. Alec, 2026-10-26: "Boring, easy and repeatable... we want the community to be a part of building this."

## What we measured

On a phone (390 px), the confirm form was 6.1 screens with 264 checkboxes. It asked how the person knows the organization when the link already said, it never showed the facts we have, and ticking a sport added its seasons 1.6 screens away, out of sight. A parent needed about 80 seconds and 7 taps to find adaptive pickleball, and no result was on the first screen. A skier in New Hampshire was told there was nothing, because multi-sport organizations aren't found under their sports. Every listing page on production showed distances like "About 6,620 mi" (fixed in #124).

## Principles (ranked; each is copied from something that works)

1. **Ask; don't wait.** Freshness comes from asking each organization on a schedule (211 checks every record yearly; USA Pickleball touches every court yearly).
2. **One question per screen, answered in one tap.** (StreetComplete, GOV.UK.) Detail only after "Change it".
3. **Show what's on file; "Still right" is the biggest button.** (StreetComplete's resurvey, Google's "Does this look right?")
4. **"Still right" is data.** Save when and by whom a listing was confirmed, apart from when it changed. (OpenStreetMap `check_date`, Open Referral `assured_date`.)
5. **Freshness in plain words that fade.** "Confirmed by the organization · Oct 2026"; never a badge that lasts forever.
6. **Off season isn't closed.** "Off season · back in December".
7. **Never close on one report.** "We stopped" or "Closed" hides the listing after a person checks it; history stays; it can come back.
8. **The riskier the change, the more review.** Website, contact, "closed": always a person. "Still right": nothing to check.
9. **Close the loop.** People hear what happened to what they sent.
10. **No login, no timeouts, big targets, a human to ask.** The people we serve include people using screen readers, switch access and their phone at 200% zoom.

## Phase 1: the one-minute check-up (this change)

### For an organization (the link Karen sends: `/update/<id>?rel=run`)

**Screen 1: "Here's what families see."** One card with what's on file: name, website, where, sports with their seasons, who it's for, ages, cost, yearly events. Three answers:

- **Yes, it's all still right** (the big button) → email → Send. Done in about 20 seconds.
- **Something changed** → one item per screen, each with **Still right** / **Change it**: Website · Where · Sports and seasons · Who it's for and ages · Cost · Yearly events. Then email → Send.
- **We don't run this anymore** (small) → one tap for why (Closed for now · Closed for good · Merged with another group · Moved) → optional note → email → Send.

**Sports and seasons**: the sports already listed, each with its season chips right under it, already set; then **Add a sport**, a search box (type "ski", tap Skiing). No grid of every sport.

**The finish**: "Thanks. A person on our team checks it, usually within a week. Families will see Confirmed by the organization · October 2026." No "How do you know this organization?": the link already says.

### For anyone else ("Something's wrong?")

Moved up beside **Visit website**. One tap for what's wrong: Website moved or broken · Closed for now · Closed for good · Wrong place · Wrong sport · Listed twice · Something else. An optional note and an optional email (to hear back). That's it.

### On every listing

A **facts strip** at the top: When (seasons, or "Off season · back in December") · Cost · Ages · Who it's for · Equipment. One freshness line: "Confirmed by the organization · Oct 2026", else "Website checked Oct 12".

### For the team (admin queue)

Each item says plainly what it would change: "Adds Skiing (winter). Website: old → new. Nothing else changed." **Apply** writes it; "All still right" items can be applied together in one tap. "Something's wrong" reports show the reason and a link to edit the listing, and close with **Done**. "We stopped" hides the listing (never deletes) and logs it.

### Data (no new tables)

Answers ride the existing submission (`submissions.payload`), applied by the existing Apply. What Apply may write: `website_url`, `city`/`state`, `ages`, `cost_note`, the organization's programs and seasons (as today), yearly events (as today), and `is_public = 0` for "we stopped". Every Apply leaves a line in `organization_activity`. "All still right" logs `applied: Confirmed, no changes`, which sets "Confirmed by the organization" on the page.

## Phase 2: finding (next)

Multi-sport organizations found under every sport they run; an Ages filter (kids and teens · adults) using the tags we already have; a result on the first phone screen; the sport you picked first in the row; choosing a suggestion runs the search; an events page that offers nearby programs running this season when there are no dated events; empty yearly events hidden; the accessibility button out of the way.

## Phase 3: the yearly ask (needs Alec's yes on wording and timing; it sends email)

Once a year per organization, 6 to 8 weeks before its main season: one email with what's on file and three buttons, a signed link that works for 30 days with no password, a reminder on day 10, "Not confirmed this year" after 45 days, hidden (never deleted) after 18 months with a one-tap "bring it back". One email per organization, never per listing. Estimated team time once steady: 6 to 10 hours a month; the first pass over about 3,000 listings is spread over 6 to 12 months, most-viewed first.

## Phase 4: the community

Listing Keepers (volunteers who look after a region, about 10 listings a month), "Did you go? Was it right?" two weeks after someone opens a listing, a change log with one-click undo, and a private thank-you tally. No leaderboards.
