# AMP (Adaptive Mobility Providers) and production beta access

On 2026-10-29 AMP, the southern Wisconsin adaptive sports nonprofit Alec and Karen ski with, was in the database as an empty organization: no website, city, state, description or programs. Its page said "We couldn't find that listing", and searching Wisconsin or water skiing never showed it. Alec asked for it to be listed properly, so it could also be the example in the beta-tester reel.

Everything below comes from AMP's own site, https://www.adaptivemobilityproviders.org/programs, read that day.

| Row | What it says now |
|---|---|
| Organization `e9e80817…` Adaptive Mobility Providers, Inc. | Elkhorn, WI (AMP says "Southern Wisconsin, near Chicago"); its website; its mission text |
| Program `06c24d54…` **Water Sports Wednesdays** | Water skiing, wakeboarding, kayaking, paddleboarding, fishing on Lauderdale Lakes (W5625 West Shore Dr., Elkhorn). Summer. $50 with equipment, instruction and lunch |
| Program `44a81371…` **Alpine Ski & Ride Program** | Sit-skiing, snowboarding, stand-up skiing at Wilmot Mountain and other hills. Winter. Modest fee |
| Program `a45edcae…` **Paddle & Play Days** | Kayaking on regional waterways (Chicago River, Fox River and others), so no single city. Summer. Modest fee |

`db/maintenance/amp_adaptive_mobility_providers.sql` is production's state after the change. It's safe to run twice (re-running it on production changed nothing). It was applied to production and staging, which now match.

## Choices made

- **Not verified yet.** On this site "Verified" means the organization confirmed its own listing, and nobody at AMP has done that yet. "Checked" is today's date, because the website was opened and read.
- **Wilmot, not Alpine Valley.** Alec first said Alpine Valley for snow skiing. AMP's site says "Wilmot Mountain & more", so we used that. If AMP also skis at Alpine Valley, that can be a second winter program.
- **Climb & Camp Adventures is left out.** AMP lists it as "Coming soon" with no dates or place.
- **Address not shown.** The Water Sports Wednesdays street address is stored with `address_publicity_consent = 0`, so the page shows the city only, like every other listing.

Before-change copies of the rows were kept outside the repo, in case anything needs rolling back.

## Production beta access

Alec's own address was added to `beta_testers` on production on 2026-10-29, with the same statement as `setBetaTester()`. Before this the table was empty, so nobody could sign in while PRELAUNCH is on. No SQL file is committed for it, because data files carry no contact details. To change it, use the admin beta-testers screen or `setBetaTester()`.

## Staging access for agents (Cloudflare, not in this repo)

The staging Access app on the Adapt To Life account only offers Cloudflare login. Two allow policies were added that day:

- **Service token: ASNM staging agents.** It's a non-identity policy for the service token "ASNM staging agents (AgentOS)", which expires 2027-10-29. The client id and secret are in the 1Password Engineering vault item "Cloudflare Access - ASNM staging agents".
- **Email: Alec's address.** This does nothing until a one-time-PIN login method is turned on for the account, which is a separate decision because it affects every Access app there.
