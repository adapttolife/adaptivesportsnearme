# Data fix: tennis listings whose website is a general USTA page

For Faisal (data). Alec, 2026-10-17: "I want him to focus on the data part, we focus on front end."
Found from Alec's question on a GLASA tennis listing: "GLASA Website should go to glasa.org not usta.com?"

## What's wrong

120 tennis listings, 69 organizations and 51 programs, use a general USTA page as their website instead of
the program's own page:

- `https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html` (119 listings)
- `https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are` (1 listing)

Both pages are about adaptive tennis nationally and say nothing about the program, so **Visit website** on any of
these listings lands on the same USTA page. They look like one USTA program list brought in together. The GLASA
listing Alec saw is one of the programs, **GLASA Adaptive Tennis Program** (Winnetka); its fix is in choice 1.

| | Staging (`asnm-db-staging`) | Live (`asnm-db`) |
|---|---|---|
| organizations | 68 | 69 |
| programs | 51 | 51 |

- Special Olympics Virginia Beach (organization `612a0cb2`) is only in live.
- Love Unlimited (program, Mobile, AL) has a different id in each: staging `3a727ccb`, live `9dc6a8ae`. The
  files carry both ids.

## What we found

We looked for each listing's own page: its website, or its page on the group that runs it (a Special Olympics
area, a city, a tennis association, a USTA club page). USTA's own adaptive tennis list helped: it gives a website
or a contact email for each program, and a matching contact on a page confirmed many of these. We opened every
link we propose and checked that it loads and names the program or its town.

- **45 confident links**: the listing's own page, checked.
- **31 links to look at first**: probably the right group, but something needs a person's eye: the page
  doesn't mention adaptive tennis, looks stale, is a Facebook page, or is a best guess. Each says what to look at.
- **44 with no page found**: most have only a personal contact email in USTA's list. Our web searches ran
  out partway through, so some of these got fewer searches; a few may have a Facebook page worth a look.

## Your choices

Each choice is one SQL file. Run any of them, all of them, or none. Delete any line you don't want first.

| Choice | File | Listings | What it does |
|---|---|---|---|
| 1. Confident links | [`usta_links_1_confident.sql`](https://github.com/adapttolife/adaptivesportsnearme/blob/docs/usta-generic-websites/db/maintenance/usta_links_1_confident.sql) | 45 | Sets each listing's website to its own page. |
| 2. Links to look at first | [`usta_links_2_look_first.sql`](https://github.com/adapttolife/adaptivesportsnearme/blob/docs/usta-generic-websites/db/maintenance/usta_links_2_look_first.sql) | 31 | The same, for links that need a look; each line says what to look at. To clear one instead, change its link to `NULL`. |
| 3. Clear the USTA link | [`usta_links_3_clear.sql`](https://github.com/adapttolife/adaptivesportsnearme/blob/docs/usta-generic-websites/db/maintenance/usta_links_3_clear.sql) | 44 | Empties the website. The listing then shows **Suggest a website** instead of sending people to the general USTA page. |

Run each on staging, look, then live. These are the same commands as the migrations in the README:

```sh
npx wrangler d1 execute asnm-db-staging --config wrangler.preview.json --remote --file db/maintenance/usta_links_1_confident.sql
npx wrangler d1 execute asnm-db --config wrangler.json --remote --file db/maintenance/usta_links_1_confident.sql
```

**Safe to run twice, in either database.** Every line changes one listing by id, and only while that listing
still has one of the two general USTA pages. A second run changes nothing, a listing you already fixed by hand is
left alone, and an id that isn't in that database does nothing.

**Check dates.** Each change also clears the listing's `last_ok_at` (and `last_checked_at` for organizations):
those dates were for the USTA page. The listing then shows "Listed (date) · not checked yet", and the validate
lane checks never-checked organizations first. Programs have no automatic check yet, so they show "not checked
yet" until one exists. `updated_at` is set to the time you run the file.

We ran all three files with wrangler on a local copy of these rows, twice each: the right rows changed, nothing
else did, and the second run changed nothing.

What's left at any point:

```sql
SELECT 'organization' AS kind, id, name, city, state FROM organizations
WHERE website_url IN (
  'https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html',
  'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are')
UNION ALL
SELECT 'program', id, name, city, state FROM programs
WHERE website_url IN (
  'https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html',
  'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are')
ORDER BY state, name;
```

Every row with full ids: [`usta-generic-websites.csv`](usta-generic-websites.csv).

## 1. Confident links (45)

| Listing | Type | Place | Link | Why |
|---|---|---|---|---|
| Youth Development Association, Inc. | org | Huntsville, AL | [ydagtatennisedu.org](https://www.ydagtatennisedu.org/) | Its own site; USTA's own adaptive tennis list links this exact address. |
| Special Olympics Arkansas Area 7 | org | Jonesboro, AR | [playtennis.usta.com/northeastarkansastennisa…](https://playtennis.usta.com/northeastarkansastennisassociation/NEATAAdaptive) | NEATA's adaptive page: its weekly clinic with Special Olympics Arkansas in Jonesboro, and USTA's contact for this listing is NEATA's. Special Olympics Arkansas's own Area 7 page (specialolympicsarkansas.org/area-7.html) does not mention tennis. |
| Youth on Court | org | Scottsdale, AZ | [youthoncourt.com](https://youthoncourt.com/) | Its own site; USTA's contact for the listing uses this domain, and its directory includes two Scottsdale tennis centers. |
| Agape Tennis Foundation | org | Atlanta, GA | [agapetennisfoundation.org](https://agapetennisfoundation.org/) | Its own site; USTA's own adaptive tennis list links this exact address. |
| South Atlanta Community Tennis Association | org | College Park / Fulton County, GA | [southatlantatennis.org](https://www.southatlantatennis.org/) | Its own site (College Park, classes at South Fulton Tennis Center). The link USTA once had for it is dead. |
| Buddy Up Tennis | org | South Bend, IN | [buddyupforlife.org/chapters/south-bend-in](https://buddyupforlife.org/chapters/south-bend-in/) | Buddy Up for Life's South Bend chapter page, which lists Buddy Up Tennis (Saturdays at South Bend Racquet Club). |
| Handi-Racket Tennis | org | Wayland, MA | [longfellowhealthclubs.com/handi-racket-tennis](https://www.longfellowhealthclubs.com/handi-racket-tennis) | The Longfellow Club's Handi-Racket Tennis page (Saturdays in Wayland). |
| Bennett Blazers Tennis | org | Baltimore, MD | [kennedykrieger.org/community/initiatives/ben…](https://www.kennedykrieger.org/community/initiatives/bennett-blazers/our-programs) | Kennedy Krieger's Bennett Blazers programs page, with an adapted tennis section (stand-up and wheelchair, ages 5 to 18). |
| West Michigan Community Tennis | org | Grandville, MI | [wmctennis.com/courtconnections/adaptive-tennis](https://wmctennis.com/courtconnections/adaptive-tennis/) | Its adaptive tennis page in Grandville: weekly wheelchair and para-standing clinics. |
| Hibbing-Chisholm Rangers Special Olympics | org | Hibbing, MN | [specialolympicsminnesota.org/view/find-a-tea…](https://specialolympicsminnesota.org/view/find-a-team/entry/45168/) | Special Olympics Minnesota's entry for the team in Hibbing; it offers tennis and is accepting athletes. |
| Missouri School for the Blind | org | St. Louis, MO | [msb.dese.mo.gov](https://msb.dese.mo.gov/) | The school's own site; USTA's contact is school staff. It does not mention tennis. |
| Buddy Up Tennis | org | Princeton, NJ | [buddyupforlife.org/chapters/princeton-nj](https://buddyupforlife.org/chapters/princeton-nj/) | Buddy Up for Life's Princeton chapter page, which lists Buddy Up Tennis; same contact as USTA's listing. |
| Police Athletic League | org | Atlantic City, NJ | [acpal.org/programs](https://acpal.org/programs/) | Atlantic City PAL's programs page, which lists tennis among its free youth sports. |
| Beautiful People Adaptive Sports | org | New Windsor, NY | [beautifulpeoplesports.org](https://beautifulpeoplesports.org/) | Its own site; USTA's contact domain for it redirects here, and its sports page has an adaptive tennis flyer for New Windsor. |
| Brooklyn Youth Tennis Association, Inc. | org | Brooklyn, NY | [brooklynyouthtennis.org/our-programs](https://www.brooklynyouthtennis.org/our-programs) | Its programs page: adaptive tennis for about 75 children at a Brooklyn school. |
| NEYSA TENNIS | org | Dix Hills, NY | [programsignup.org/about-us](https://programsignup.org/about-us/) | NEYSA's official registration site: a Dix Hills location and a Special Needs program. |
| Bridge Creek Early Childhood | org | Blanchard, OK | [bridgecreekbobcats.org/early-childhood](https://www.bridgecreekbobcats.org/early-childhood/) | The school's early childhood page; USTA's contact uses the same school domain. It does not mention tennis and looks like a program for the school's own students. |
| Lake Oswego Tennis Center Special Olympics | org | Lake Oswego, OR | [ci.oswego.or.us/parksrec/special-olympics](https://www.ci.oswego.or.us/parksrec/special-olympics) | The city's page for the Lake Oswego Tennis Center's Special Olympics tennis program. |
| Highland Park Tennis Club | org | Pittsburgh, PA | [highlandparktennisclub.org/clinics](https://highlandparktennisclub.org/clinics) | Its clinics page: free wheelchair tennis and blind and low vision tennis. |
| Legacy Youth Tennis and Education | org | Philadelphia, PA | [legacyyte.org](https://legacyyte.org/) | Its own site; USTA's contact for the listing uses this domain. |
| Love Serving Autism | org | Allentown, PA | [loveservingautism.org/programs/pennsylvania-…](https://loveservingautism.org/programs/pennsylvania-racquet-sports-programs/) | Love Serving Autism's Pennsylvania page, which lists the Allentown session. |
| Aunt Nettie's Fault Special Olympics Tennis | org | Columbia, SC | [so-sc.org/sports/local-programs/area-7](https://so-sc.org/sports/local-programs/area-7) | Special Olympics South Carolina's Area 7 page (it covers Columbia). Its tennis contact is the same as USTA's for this team, though the team name is not on the page. |
| Special Olympics Greenville (Area 4) | org | Greenville, SC | [so-sc.org/sports/local-programs/area-4](https://so-sc.org/sports/local-programs/area-4) | Special Olympics South Carolina's Area 4 (Greenville) page. It lists fall tennis, with the same contact as USTA's listing. |
| Special Olympics Virginia Beach | org | Virginia Beach, VA | [specialolympicsva.org/southeast-region/area-2](https://www.specialolympicsva.org/southeast-region/area-2) | Special Olympics Virginia's Area 2 page (it includes Virginia Beach). It lists tennis, with the same contact as USTA's listing. |
| Tennis for Eagles Wings and United Cerebral Palsy | program | Tuscaloosa, AL | [tennis.tcpara.org/contact-us/outreach](https://tennis.tcpara.org/contact-us/outreach) | Tuscaloosa Tennis Center's outreach page: free weekly clinics for both groups. |
| Tuscaloosa Titans | program | Tuscaloosa, AL | [tuscaloosatennis.com/adaptive-tennis](https://tuscaloosatennis.com/adaptive-tennis/) | Tuscaloosa Tennis Association's adaptive tennis page, which names the Titans. |
| Ad In Special Needs Tennis | program | Columbus, GA | [corta.org/outreach_event/ad-in-clinic](https://www.corta.org/outreach_event/ad-in-clinic/) | The Columbus Regional Tennis Association's Ad In page, with fall 2026 sessions. USTA linked this site for the program. |
| Adaptive Tennis League (ATL) | program | Norcross, GA | [ustaatlanta.com/adaptive](https://www.ustaatlanta.com/adaptive/) | USTA Atlanta's Adaptive Tennis League page; USTA's own adaptive list links it. |
| Chata Limitless Tennis | program | LaGrange, GA | [chatatennis.org](https://www.chatatennis.org/) | The association's homepage, with its 2026 Limitless adaptive and wheelchair tennis dates. |
| Net Therapy for Children on the Autism Spectrum | program | Macon, GA | [maconareatennis.com/net-therapy/#autism](https://maconareatennis.com/net-therapy/#autism) | Macon Area Tennis Association's Net Therapy page, autism section. USTA's old link to it is dead. |
| Rockdale Special Olympics | program | Conyers, GA | [rockdalespecialolympics.net](https://rockdalespecialolympics.net/) | Its own site; its coordinator matches USTA's contact. Last updated around 2019. |
| Special Pops Tennis and Pickleball | program | Savannah, GA | [specialpopstennis-savannah.com](https://specialpopstennis-savannah.com/) | Its own site, with fall 2026 clinic dates. |
| Vet Therapy | program | Macon, GA | [maconareatennis.com/net-therapy/#veterans](https://maconareatennis.com/net-therapy/#veterans) | Macon Area Tennis Association's Net Therapy page, veterans section. |
| Cedar Rapids Parks and Recreation | program | Cedar Rapids, IA | [cedar-rapids.org/residents/parks_and_recreat…](https://www.cedar-rapids.org/residents/parks_and_recreation/therapeutic_recreation.php) | The city's therapeutic recreation page; its fall 2026 newsletter lists Wednesday tennis. |
| Special Olympics Tennis Program | program | Cedar Rapids, IA | [cedar-rapids.org/residents/parks_and_recreat…](https://www.cedar-rapids.org/residents/parks_and_recreation/therapeutic_recreation.php) | The city's therapeutic recreation page; its fall 2026 newsletter lists Special Olympics tennis on Wednesdays. |
| GLASA Adaptive Tennis Program | program | Winnetka, IL | [glasa.org/sports-programs](https://glasa.org/sports-programs/) | GLASA's sports page, tennis tab: practices at A.C. Nielsen Tennis Center in Winnetka. This is the GLASA listing Alec asked about. |
| RHI Adaptive Sports Program/Wheelchair Tennis of Indiana | program | Indianapolis, IN | [rhirehab.com/our-programs/community-reintegr…](https://www.rhirehab.com/our-programs/community-reintegration/adaptive-sports-program/teams/) | RHI's adaptive sports teams page, wheelchair and adaptive standing tennis section. |
| West Kentucky Adaptive Tennis | program | Paducah, KY | [paducahtennis.com/adaptive-tennis](https://paducahtennis.com/adaptive-tennis/) | Paducah Tennis Association's adaptive tennis page; USTA linked this site for the program. |
| ACEing Autism - New Orleans | program | New Orleans, LA | [aceingautism.org/programs/new-orleans-la](https://aceingautism.org/programs/new-orleans-la/) | ACEing Autism's New Orleans program page, with fall 2026 sessions. |
| Special Olympics Iberia Parish | program | New Iberia, LA | [specialolympicsla.org/state-map/acadiana-area](https://specialolympicsla.org/state-map/acadiana-area/) | Special Olympics Louisiana's Acadiana page; its contact form lists Iberia Parish tennis. |
| Brunswick County Tennis Association | program | Southport, NC | [atanc.org/all-programs/brunswick](https://www.atanc.org/all-programs/brunswick) | Abilities Tennis Association of NC's Brunswick clinics page, with the same contact as USTA's listing. The association itself has no working site. |
| Orange County Aces | program | Montgomery, Newburgh, NY | [playtennis.usta.com/orangecountyacestennis](https://playtennis.usta.com/orangecountyacestennis) | Its USTA club page, which lists adaptive tennis. |
| Black Girls Tennis Club | program | Norfolk, VA | [blackgirlstennisclub.com](https://www.blackgirlstennisclub.com/) | Its own site (Norfolk); USTA's contact uses this domain. |
| Piedmont Area Tennis Association Adaptive Tennis | program | Ivy / Charlottesville area, VA | [patatennis.org/wheelchair-tennis](https://www.patatennis.org/wheelchair-tennis) | The association's wheelchair tennis page: wheelchair and adapted tennis in Charlottesville. |
| BLV Community Hub Program | program | Vancouver, WA | [ustapnw.org/pnw-tennis-centers/vancouver/ada…](https://www.ustapnw.org/pnw-tennis-centers/vancouver/adapted-tennis/) | USTA Pacific Northwest's Vancouver Tennis Center adapted tennis page, blind and low vision section. |

## 2. Links to look at first (31)

| Listing | Type | Place | Link | Look at |
|---|---|---|---|---|
| Smart DMS | org | Des Moines, IA | [playtennis.usta.com/lifetimeathleticdesmoine…](https://playtennis.usta.com/lifetimeathleticdesmoines/Coaching) | Our best guess, not confirmed: USTA's contact works at Life Time, and this is Life Time Des Moines's tennis page (SMART Tennis is its junior program). Nothing names an adaptive program. |
| iCan Dream Tennis | org | Homewood, IL | [hfracquetandfitness.com/racquetsports](https://hfracquetandfitness.com/racquetsports/) | The club where the program ran, per a 2019 USTA story. The page mentions special needs clinics but not iCan Dream. |
| FEAT: Autism Camp | org | Louisville, KY | [featoflouisville.org](https://featoflouisville.org/) | The right Louisville autism group, but its site shows only a 2015 tennis camp. The camp may have ended. |
| Accelerate4KIDS | org | Novi, MI | [playtennis.usta.com/accelerate4kids](https://playtennis.usta.com/accelerate4kids) | The group's own USTA page, but the group is in Detroit, not Novi, and the page does not mention adaptive tennis. |
| St. Louis Indoor Para-Tennis Championships | org | St. Louis, MO | [playtennis.usta.com/Competitions/pushwheelch…](https://playtennis.usta.com/Competitions/pushwheelchairtennisacademy/Tournaments/Overview/19be9dc1-1bc4-4e42-8e3f-6e20d6969b48) | The 2026 tournament page (it is now called the Indoor Wheelchair Tennis Championships, in Chesterfield). It will need a new link each year. |
| Meridian Roll and Run Adaptive Tennis | org | Meridian, MS | [playtennis.usta.com/NortheastParkTennisCenter](https://playtennis.usta.com/NortheastParkTennisCenter) | The Meridian tennis center whose director is USTA's contact; it ran the state's first adaptive program, Roll and Run. The page does not mention the program. |
| BSO BVI Tennis | org | Philadelphia, PA | [blindsports.org](https://www.blindsports.org/) | The group's homepage. It no longer lists tennis, so the program may have ended. |
| MAPLE'S Kids (Multiple Adaptive Play Experiences in Sports) | org | Salem, VA | [roanoke.edu/events/maples_(multiple_adaptive…](https://www.roanoke.edu/events/maples_(multiple_adaptive_play_experiences_in_sports)_opening_celebration) | A September 2025 event page at Roanoke College. The program has no standing page. |
| Alpine Adaptive Tennis | org | Laramie, WY | [alpine-tennis.org](https://www.alpine-tennis.org/) | Laramie's tennis association; its board has an adaptive lead. The tie rests on the name and town only. |
| Love Unlimited | program | Mobile, AL | [mobiletenniscenter.net/community-outreach](https://www.mobiletenniscenter.net/community-outreach/) | The Mobile Tennis Center's outreach page: its adaptive clinic and a Love Unlimited video. The clinic now runs under another partner's name. |
| Aces for Autism, Inc. | program | Pensacola, FL | [facebook.com/people/Aces-for-Autism-Inc/6155…](https://www.facebook.com/people/Aces-for-Autism-Inc/61558168528167/) | A Facebook page. The group has no website (the domains with its name are parked). |
| Lipson Foundation | program | West Palm Beach, FL | [lipsonfoundation.org](https://lipsonfoundation.org/) | The right group, but its site now features adaptive fitness and no longer mentions tennis. |
| Racquet Club of Cocoa Beach Adaptive Tennis | program | Cocoa Beach, FL | [cocoabeachracquetclub.com](https://www.cocoabeachracquetclub.com/) | The club's homepage; it lists no adaptive program right now. |
| Tennis Starts With Love | program | Tampa area, FL | [playtennis.usta.com/tennisstartswithlove](https://playtennis.usta.com/tennisstartswithlove) | An empty USTA club page (name and town only); the program may have ended. Clearing may be better. |
| Tennis-4-Everyone / Escambia County Special Olympics | program | Escambia County, FL | [specialolympicsflorida.org/northwest#escambia](https://www.specialolympicsflorida.org/northwest#escambia) | Special Olympics Florida's Escambia County section, which lists tennis. Tennis-4-Everyone has no site of its own. |
| ACSquared Tennis | program | Lithia Springs, GA | [acsquaredtennis.com](https://acsquaredtennis.com/) | The coach's own site, with the same contact as USTA's listing. No adaptive page. |
| Sign1U Deaf Youth Tennis Camp | program | Atlanta, GA | [sign1studios.com/summer-camp](https://sign1studios.com/summer-camp/) | The camp's sign-up page (a tennis camp form). The name Sign1U is not on it. |
| TVI Atlanta | program | Atlanta, GA | [facebook.com/TVIatlanta](https://www.facebook.com/TVIatlanta/) | A Facebook page (Tennis for Visually Impaired Atlanta). No website exists. |
| Windy Hill Community Center | program | Austell, GA | [cobbcounty.gov/parks/programs/therapeutic-re…](https://www.cobbcounty.gov/parks/programs/therapeutic-recreation-services) | Cobb County's therapeutic recreation page, held at Windy Hill; no tennis on it. Also, Windy Hill is in Smyrna, not Austell. |
| Cedar Rapids Homeschool Assistance Program | program | Cedar Rapids, IA | [crschools.us/academics-programs/alternative-…](https://www.crschools.us/academics-programs/alternative-learning-options/home-school-assistance-program) | The school district's homeschool program page; no tennis on it. |
| West Enders and Scott County Adults | program | Davenport, Moline, IA | [soiowa.org/sca-thunder](https://www.soiowa.org/sca-thunder/) | Special Olympics Iowa's page for Scott County Adults, which lists tennis. It covers only half the listing: West Enders has no page. |
| Acadiana Serves Adaptive Tennis | program | Lafayette, LA | [acadianaserves.com](https://www.acadianaserves.com/) | The group's homepage (it runs Lafayette's public tennis parks). No adaptive program listed, though Special Olympics Louisiana lists it as a local program. |
| Special Olympics Play Day | program | Lafayette, LA | [specialolympicsla.org/state-map/acadiana-area](https://specialolympicsla.org/state-map/acadiana-area/) | Special Olympics Louisiana's regional page, not the play day itself; no page exists for the play day. |
| Wounded Warrior Tennis | program | Gaithersburg, MD | [iambearlee.wixsite.com/website-2wwt](https://iambearlee.wixsite.com/website-2wwt) | The group's own site, last updated in 2018. The group later became Adaptive Tennis US, whose site is gone. |
| Dearborn Public Schools | program | Dearborn, MI | [dearbornschools.org](https://dearbornschools.org/) | The district homepage; nothing on tennis. Probably an in-school program. |
| St. Paul Urban Tennis Adaptive Tennis Program (Highland Friendship Club and St. Paul Public Schools (SPPS) Adaptive) | program | St. Paul, MN | [stpaulurbantennis.org](https://www.stpaulurbantennis.org/) | The organization's homepage; it has no adaptive page. |
| Mississippi Gulf Coast CTA Reach Program | program | Ocean Springs, MS | [playtennis.usta.com/coastaltennisalliance](https://playtennis.usta.com/coastaltennisalliance) | An empty USTA club page for the renamed Gulf Coast CTA. No mention of Reach or adaptive tennis. |
| Watertown YMCA Adaptive Program | program | Watertown, NY | [watertownymca.org/programs/racquet-sports/te…](https://www.watertownymca.org/programs/racquet-sports/tennis) | The Y's tennis page; no adaptive program posted. |
| ADN-Northeast Adaptive Tennis Program | program | Philadelphia, PA | [adnnec.org](https://adnnec.org/) | The group's homepage lists an adaptive tennis clinic, but its events date from 2022. |
| Mustang Tennis Adaptive Program | program | Brentwood, TN | [curreyingram.org/athletics/mustang-athletics](https://www.curreyingram.org/athletics/mustang-athletics) | A school's athletics page with no tennis on it (the tennis team is on its schedules page), and the team is for the school's own students. |
| T.R.I.N.I.T.Y. TRAILBLAZERS | program | Midlothian, VA | [trinitytennis.org](https://www.trinitytennis.org/) | The group's homepage. Trailblazers is its youth cardio tennis class, not an adaptive program. |

## 3. No page found (44)

| Listing | Type | Place | What we found |
|---|---|---|---|
| Adapted Physical Education | org | Danbury, CT | USTA gives only a school district contact. This looks like the district's adapted PE for its own students. No page found. |
| Bunny's Buddies (is with the Central Iowa Tennis Alliance) | org | Adel, IA | USTA gives only a personal contact. Its parent group has an empty USTA club page with nothing on the program. |
| Independent North, Algona-Dyson Special Olympics Tennis | org | Algona, IA | USTA gives only a personal contact. Special Olympics Iowa has no Algona listing. No page found. |
| Nancy's Stars | org | Bluegrass, IA | USTA gives only a personal contact. No page found. |
| USTA Iowa Allstars | org | Clinton, IA | An annual special needs tournament co-hosted in Clinton; only USTA news stories cover it. No page of its own. |
| Orofino Community Tennis | org | Orofino, ID | USTA gives only a school district contact. No page found. |
| Adaptive Tennis at Marquette Park | org | Chicago, IL | USTA gives only a personal contact (the same volunteer as Tennis for Veterans). No program page found. |
| Lincoln Way Area Tennis | org | Mokena, IL | USTA gives only a personal contact. No site or USTA club page found; the only mention online is a 2019 event listing. |
| Midwest Unified Doubles Showdown | org | Homewood, IL | A doubles event with the same contact as iCan Dream Tennis. No event page found. |
| Tennis for Veterans | org | Chicago, IL | USTA gives only a personal contact. It met at McKinley Park; no current page found. |
| Tiebreaks | org | Park Forest, IL | USTA gives only a personal contact. No page found, and the Park Forest club's site no longer exists. |
| CBTP Adaptive Tennis Club of Topeka | org | Topeka, KS | USTA gives only a school district contact; this looks like the district's transition program. No page found. |
| Tennis For All | org | Fort Riley, KS | USTA gives only a personal contact, a volunteer who teaches soldiers at Fort Riley. No page found. |
| Warriors in Transition | org | Fort Riley, KS | The Fort Riley unit it served was inactivated on August 14, 2026. Probably no longer runs: worth removing. |
| Special Populations, FEAT | org | Louisville, KY | Same contact as FEAT: Autism Camp. FEAT's site shows no current tennis program. No page found. |
| Adaptive Play Day | org | Holland, MI | A one-time play day. No page found. |
| Bay City Unified Adaptive Tennis | org | Bay City, MI | Run by the Bay Community Tennis Association, whose USTA club page is empty. Its Facebook page may help; it needs a person to check. |
| Free Community Event | org | See website / multiple locations, MI | USTA's line has no organization, contact or town; it may be a stray piece of the Got Ability Sports Tennis (Brighton) entry. Worth removing. |
| Battlefield BVI Tennis | org | Jackson, MS | USTA gives only a personal contact. Only news stories mention it; USTA Mississippi's adaptive list does not include it. |
| Love United Adaptive Tennis | org | Meridian, MS | USTA gives only a school district contact. No page found. The Meridian clinic with a page is a separate listing (Meridian Roll and Run). |
| Count Me In, Inc. | org | Exeter, Hampton, NH | A small registered nonprofit with no website, USTA club page or social page found. |
| Adaptive Tennis US | org | Lawrenceville, NJ | Its site, adaptivetennisus.com, no longer exists. No page found for a Lawrenceville program. |
| Adaptive Tennis and Fitness | org | Dix Hills, NY | USTA gives no contact, and no group by this name was found. The area's adaptive program is NEYSA's, which has its own listing: this may be a duplicate. |
| Adaptive Tennis for Students with Autism | org | Jamaica, NY | USTA gives only a personal contact. No page found. |
| Serving Heroes | org | Kings Park, Northport, NY | USTA gives only a personal contact. Possibly the free veterans tennis at SPORTIME Kings Park, but nothing online uses this name. |
| SPIRIT Tennis | org | Blauvelt, NY | USTA gives only a personal contact. No page found. |
| Walnut Hills Outreach | org | Cincinnati, OH | USTA gives only a personal contact. The Cincinnati Tennis Foundation is a separate listing, so its site was not used. |
| Cheltenham Youth Tennis | org | Wyncote, PA | Its USTA club page is empty, and the last session found is from 2020. No other site. |
| Delco Special Olympics | org | Haverford, PA | Its own site, sodelco.org, is down now (it had a tennis page in 2020). Worth checking again later. |
| Matchpoint Tennis Social Club | org | Philadelphia, PA | USTA gives only a personal contact. No page found (the MatchPoint club on USTA's site is a different club, in New York). |
| Exceptional Islanders Tennis | org | John's Island, SC | USTA gives only a school district contact; likely a high school program on Johns Island. No page found. |
| Adaptive Tennis Kick-Off Event | org | Blacksburg, VA | A one-time Virginia Tech wheelchair tennis clinic in February 2020. No current program: worth removing. |
| EXPO Tennis | org | Enumclaw, WA | A coach's seasonal class sold through Enumclaw parks registration; no lasting page. Possibly related, not confirmed: enumclawspecialolympics.com/tennis.html. |
| Lakeland Area Special Olympics | org | Minocqua, WI | Special Olympics Wisconsin lists the Lakeland Area program but gives it no page. No site found. |
| Grayhound Youth Sports | org | Northfork, WV | Real, but no website or official social page found; only news stories. |
| I Play Tennis, Inc. | org | Huntington, Ona, WV | USTA gives only a personal contact. No page found (the similar iplaytennis domains belong to other people). |
| Special Olympics Summit County | program | Breckenridge, CO | Real (practices in Breckenridge), but no page of its own. Special Olympics Colorado has only a regional page that names Summit County among 23 counties. |
| ACE Program | program | Atlantic Beach, FL | USTA gives only a contact email. No page found. |
| Tennis People, Inc. | program | McDonough, GA | A real McDonough nonprofit (weekly tennis for people with intellectual disabilities), but no website, USTA page or Facebook page found. |
| Scott County Masters | program | Riverdale, IA | USTA gives only a personal contact. Named once in a 2024 USTA Iowa story; no page. |
| Acadiana Junior Tennis League | program | Lafayette, LA | USTA's contact is a country club's tennis director, but no page mentions this league. |
| Blind Tennis | program | Youngsville, LA | USTA gives only a personal contact. No blind tennis program found in Youngsville or Lafayette. |
| Shot of the Day Tennis | program | Frederick, MD | USTA gives only a personal contact. No page found. |
| Barnegat High School Challenger Tennis Program | program | Barnegat, NJ | The high school's Challenger League page does not mention tennis. No tennis page found. |

## Listings that may not belong (your call)

Found along the way. These may be worth removing or changing rather than linking:

- **Warriors in Transition** (Fort Riley, KS): the unit it served was inactivated on August 14, 2026.
- **Free Community Event** (Michigan): USTA's line has no organization, contact or town.
- **Adaptive Tennis Kick-Off Event** (Blacksburg, VA): a one-time clinic in February 2020.
- **Adaptive Tennis and Fitness** (Dix Hills, NY): no group by this name; it may duplicate NEYSA's special needs
  tennis, which has its own listing.
- **FEAT: Autism Camp** and **Special Populations, FEAT** (Louisville, KY): the same contact; maybe one program.
- **St. Louis Indoor Para-Tennis Championships**: a yearly tournament, so its link will need updating each year.
- **Windy Hill Community Center**: listed in Austell, GA, but Windy Hill is in Smyrna.
- School programs that look like they're for the school's own students: Bridge Creek Early Childhood, Adapted
  Physical Education (Danbury), CBTP Adaptive Tennis Club of Topeka, Exceptional Islanders Tennis, Dearborn Public
  Schools, Mustang Tennis Adaptive Program.

## Not on the list (USTA pages about the program itself, fine as they are)

- First Service Doubles, Akron OH and Verona WI: USTA Midwest program pages.
- Philadelphia Sunchasers, Rockland Community Tennis Association: their own `playtennis.usta.com` pages.
- Westside Challenger Tennis: its flyer on usta.com.

## Also noticed

- **GLASA Wheelchair Tennis** (organization, staging `5b0a97d9`) is placed in Lake Forest, GLASA's office. Its
  tennis is played at the A.C. Nielsen Tennis Center in Winnetka (GLASA's event pages). Near-me
  searches use the listing's place, so Winnetka may be the better location. Its website,
  `glasa.org/sports-programs/`, is right.
- Some re-imported rows have different ids in staging and live (Rockland Community Tennis Association: staging
  `f7d29c10`, live `f814e0c6`; Love Unlimited, above), in case that matters when fixes move to live.
