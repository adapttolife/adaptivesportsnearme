-- PR #60, choice 1 of 3. 45 listings: 24 organizations, 21 programs.
-- Confident links. Each line gives one tennis listing its own page in place of the
-- general USTA page. We checked every link: it loads and names the program or its town.
--
-- Look it over, delete any line you do not want, then run it on staging, then live:
--   npx wrangler d1 execute asnm-db-staging --config wrangler.preview.json --remote --file db/maintenance/usta_links_1_confident.sql
--   npx wrangler d1 execute asnm-db --config wrangler.json --remote --file db/maintenance/usta_links_1_confident.sql
--
-- Safe to run twice: a line changes its listing only while that listing still has the
-- general USTA page, and a line whose id is not in a database does nothing there.
-- Each change also clears the listing check dates (they were for the USTA page), so the
-- listing shows not checked yet until the new link is checked.

-- Youth Development Association, Inc., Huntsville, AL | organization
-- Why: Its own site USTA’s own adaptive tennis list links this exact address.
UPDATE organizations SET website_url = 'https://www.ydagtatennisedu.org/', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'bb43fd3e-317a-5202-98b9-edd4aabe1550' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Special Olympics Arkansas Area 7, Jonesboro, AR | organization
-- Why: NEATA’s adaptive page: its weekly clinic with Special Olympics Arkansas in Jonesboro, and USTA’s contact for this listing is NEATA’s. Special Olympics Arkansas’s own Area 7 page (specialolympicsarkansas.org/area-7.html) does not mention tennis.
UPDATE organizations SET website_url = 'https://playtennis.usta.com/northeastarkansastennisassociation/NEATAAdaptive', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'cddf03c9-3be3-59ff-8d0c-ab595a5f76c9' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Youth on Court, Scottsdale, AZ | organization
-- Why: Its own site USTA’s contact for the listing uses this domain, and its directory includes two Scottsdale tennis centers.
UPDATE organizations SET website_url = 'https://youthoncourt.com/', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '45c6e5e0-64c3-5b21-8d98-c0d6e4710579' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Agape Tennis Foundation, Atlanta, GA | organization
-- Why: Its own site USTA’s own adaptive tennis list links this exact address.
UPDATE organizations SET website_url = 'https://agapetennisfoundation.org/', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '624ac7a1-faa8-5509-a7ec-774c85b96a2f' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- South Atlanta Community Tennis Association, College Park / Fulton County, GA | organization
-- Why: Its own site (College Park, classes at South Fulton Tennis Center). The link USTA once had for it is dead.
UPDATE organizations SET website_url = 'https://www.southatlantatennis.org/', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'd00f219b-f44d-5402-a246-d04dee35f19d' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Buddy Up Tennis, South Bend, IN | organization
-- Why: Buddy Up for Life’s South Bend chapter page, which lists Buddy Up Tennis (Saturdays at South Bend Racquet Club).
UPDATE organizations SET website_url = 'https://buddyupforlife.org/chapters/south-bend-in/', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '471bc83f-8129-5776-a542-dea903045b26' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Handi-Racket Tennis, Wayland, MA | organization
-- Why: The Longfellow Club’s Handi-Racket Tennis page (Saturdays in Wayland).
UPDATE organizations SET website_url = 'https://www.longfellowhealthclubs.com/handi-racket-tennis', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'fadb07f8-82dd-5205-bebd-c2e8d9970354' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Bennett Blazers Tennis, Baltimore, MD | organization
-- Why: Kennedy Krieger’s Bennett Blazers programs page, with an adapted tennis section (stand-up and wheelchair, ages 5 to 18).
UPDATE organizations SET website_url = 'https://www.kennedykrieger.org/community/initiatives/bennett-blazers/our-programs', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '068e6504-5034-56a9-b325-ade54488c89d' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- West Michigan Community Tennis, Grandville, MI | organization
-- Why: Its adaptive tennis page in Grandville: weekly wheelchair and para-standing clinics.
UPDATE organizations SET website_url = 'https://wmctennis.com/courtconnections/adaptive-tennis/', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'cce71058-2976-57f5-a0c2-f1a500ba301f' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Hibbing-Chisholm Rangers Special Olympics, Hibbing, MN | organization
-- Why: Special Olympics Minnesota’s entry for the team in Hibbing it offers tennis and is accepting athletes.
UPDATE organizations SET website_url = 'https://specialolympicsminnesota.org/view/find-a-team/entry/45168/', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'bbf69234-fe39-5ec2-9527-ae77302b32ec' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Missouri School for the Blind, St. Louis, MO | organization
-- Why: The school’s own site USTA’s contact is school staff. It does not mention tennis.
UPDATE organizations SET website_url = 'https://msb.dese.mo.gov/', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'c438c01d-8156-5d38-8604-97b915e9e851' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Buddy Up Tennis, Princeton, NJ | organization
-- Why: Buddy Up for Life’s Princeton chapter page, which lists Buddy Up Tennis same contact as USTA’s listing.
UPDATE organizations SET website_url = 'https://buddyupforlife.org/chapters/princeton-nj/', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '347811d3-3146-51bf-bac1-3ac91f8756e4' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Police Athletic League, Atlantic City, NJ | organization
-- Why: Atlantic City PAL’s programs page, which lists tennis among its free youth sports.
UPDATE organizations SET website_url = 'https://acpal.org/programs/', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '81f8a714-4726-5842-9eef-f681a00c769e' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Beautiful People Adaptive Sports, New Windsor, NY | organization
-- Why: Its own site USTA’s contact domain for it redirects here, and its sports page has an adaptive tennis flyer for New Windsor.
UPDATE organizations SET website_url = 'https://beautifulpeoplesports.org/', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '02c18263-ea00-581c-a641-8d213d1c53d4' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Brooklyn Youth Tennis Association, Inc., Brooklyn, NY | organization
-- Why: Its programs page: adaptive tennis for about 75 children at a Brooklyn school.
UPDATE organizations SET website_url = 'https://www.brooklynyouthtennis.org/our-programs', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '64cc19ee-ed95-548d-8ed4-c60abec5f33a' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- NEYSA TENNIS, Dix Hills, NY | organization
-- Why: NEYSA’s official registration site: a Dix Hills location and a Special Needs program.
UPDATE organizations SET website_url = 'https://programsignup.org/about-us/', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '15f01301-5cc2-51a3-89a2-ba8521c2e40d' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Bridge Creek Early Childhood, Blanchard, OK | organization
-- Why: The school’s early childhood page USTA’s contact uses the same school domain. It does not mention tennis and looks like a program for the school’s own students.
UPDATE organizations SET website_url = 'https://www.bridgecreekbobcats.org/early-childhood/', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '8d3f5ca5-cc6d-55e4-b8a9-6102698d0645' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Lake Oswego Tennis Center Special Olympics, Lake Oswego, OR | organization
-- Why: The city’s page for the Lake Oswego Tennis Center’s Special Olympics tennis program.
UPDATE organizations SET website_url = 'https://www.ci.oswego.or.us/parksrec/special-olympics', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '0a8df763-e281-5349-bd05-fa41f9c7676e' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Highland Park Tennis Club, Pittsburgh, PA | organization
-- Why: Its clinics page: free wheelchair tennis and blind and low vision tennis.
UPDATE organizations SET website_url = 'https://highlandparktennisclub.org/clinics', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '6e98e890-2597-5cfd-a4df-ac8aab29b21d' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Legacy Youth Tennis and Education, Philadelphia, PA | organization
-- Why: Its own site USTA’s contact for the listing uses this domain.
UPDATE organizations SET website_url = 'https://legacyyte.org/', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'cfbc3ae3-e628-5657-ba43-86ffb256e9be' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Love Serving Autism, Allentown, PA | organization
-- Why: Love Serving Autism’s Pennsylvania page, which lists the Allentown session.
UPDATE organizations SET website_url = 'https://loveservingautism.org/programs/pennsylvania-racquet-sports-programs/', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '2886709e-baee-5cd1-85d6-ceadf7f892fa' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Aunt Nettie’s Fault Special Olympics Tennis, Columbia, SC | organization
-- Why: Special Olympics South Carolina’s Area 7 page (it covers Columbia). Its tennis contact is the same as USTA’s for this team, though the team name is not on the page.
UPDATE organizations SET website_url = 'https://so-sc.org/sports/local-programs/area-7', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '5c1ce4e5-e79a-544a-9dcf-088a36bd4a69' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Special Olympics Greenville (Area 4), Greenville, SC | organization
-- Why: Special Olympics South Carolina’s Area 4 (Greenville) page. It lists fall tennis, with the same contact as USTA’s listing.
UPDATE organizations SET website_url = 'https://so-sc.org/sports/local-programs/area-4', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '76284d2e-61c6-5811-95ef-577f72285e19' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Special Olympics Virginia Beach, Virginia Beach, VA | organization | live only
-- Why: Special Olympics Virginia’s Area 2 page (it includes Virginia Beach). It lists tennis, with the same contact as USTA’s listing.
UPDATE organizations SET website_url = 'https://www.specialolympicsva.org/southeast-region/area-2', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '612a0cb2-2c64-52e9-8c88-331b8363745a' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Tennis for Eagles Wings and United Cerebral Palsy, Tuscaloosa, AL | program
-- Why: Tuscaloosa Tennis Center’s outreach page: free weekly clinics for both groups.
UPDATE programs SET website_url = 'https://tennis.tcpara.org/contact-us/outreach', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '095d8bbe-dcf4-55f6-9c02-4b5598b2f5f8' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Tuscaloosa Titans, Tuscaloosa, AL | program
-- Why: Tuscaloosa Tennis Association’s adaptive tennis page, which names the Titans.
UPDATE programs SET website_url = 'https://tuscaloosatennis.com/adaptive-tennis/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'a39aa4da-df5c-5d60-ae10-4f98dc1cd1b4' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Ad In Special Needs Tennis, Columbus, GA | program
-- Why: The Columbus Regional Tennis Association’s Ad In page, with fall 2026 sessions. USTA linked this site for the program.
UPDATE programs SET website_url = 'https://www.corta.org/outreach_event/ad-in-clinic/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'cc371d5a-6a98-53e8-98ab-b65e515b391d' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Adaptive Tennis League (ATL), Norcross, GA | program
-- Why: USTA Atlanta’s Adaptive Tennis League page USTA’s own adaptive list links it.
UPDATE programs SET website_url = 'https://www.ustaatlanta.com/adaptive/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'ae8e49ae-7304-52a1-9e1c-63cf7c6d320f' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Chata Limitless Tennis, LaGrange, GA | program
-- Why: The association’s homepage, with its 2026 Limitless adaptive and wheelchair tennis dates.
UPDATE programs SET website_url = 'https://www.chatatennis.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '4888a8cb-6a12-5669-bf47-430b28a8f031' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Net Therapy for Children on the Autism Spectrum, Macon, GA | program
-- Why: Macon Area Tennis Association’s Net Therapy page, autism section. USTA’s old link to it is dead.
UPDATE programs SET website_url = 'https://maconareatennis.com/net-therapy/#autism', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'd53651eb-dc32-5a21-9bc6-c5ab98733a51' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Rockdale Special Olympics, Conyers, GA | program
-- Why: Its own site its coordinator matches USTA’s contact. Last updated around 2019.
UPDATE programs SET website_url = 'https://rockdalespecialolympics.net/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '3ff598e9-606c-5a42-b2e8-7530431f7cad' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Special Pops Tennis and Pickleball, Savannah, GA | program
-- Why: Its own site, with fall 2026 clinic dates.
UPDATE programs SET website_url = 'https://specialpopstennis-savannah.com/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '8f618c3c-16d4-500e-8713-d5b624833e9f' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Vet Therapy, Macon, GA | program
-- Why: Macon Area Tennis Association’s Net Therapy page, veterans section.
UPDATE programs SET website_url = 'https://maconareatennis.com/net-therapy/#veterans', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '63fa9e84-9523-5666-a60e-ce67179611e3' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Cedar Rapids Parks and Recreation, Cedar Rapids, IA | program
-- Why: The city’s therapeutic recreation page its fall 2026 newsletter lists Wednesday tennis.
UPDATE programs SET website_url = 'https://www.cedar-rapids.org/residents/parks_and_recreation/therapeutic_recreation.php', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '17daa281-6e4a-51e1-8b96-52701ff5b4c1' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Special Olympics Tennis Program, Cedar Rapids, IA | program
-- Why: The city’s therapeutic recreation page its fall 2026 newsletter lists Special Olympics tennis on Wednesdays.
UPDATE programs SET website_url = 'https://www.cedar-rapids.org/residents/parks_and_recreation/therapeutic_recreation.php', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'd325d86c-eb53-5721-8765-4fe50bc7bf4d' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- GLASA Adaptive Tennis Program, Winnetka, IL | program
-- Why: GLASA’s sports page, tennis tab: practices at A.C. Nielsen Tennis Center in Winnetka. This is the GLASA listing Alec asked about.
UPDATE programs SET website_url = 'https://glasa.org/sports-programs/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '9238aa75-ab68-5dbb-a93d-eec3e51569c5' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- RHI Adaptive Sports Program/Wheelchair Tennis of Indiana, Indianapolis, IN | program
-- Why: RHI’s adaptive sports teams page, wheelchair and adaptive standing tennis section.
UPDATE programs SET website_url = 'https://www.rhirehab.com/our-programs/community-reintegration/adaptive-sports-program/teams/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'ca36b1ea-3f30-515d-8431-7f7866c91a8c' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- West Kentucky Adaptive Tennis, Paducah, KY | program
-- Why: Paducah Tennis Association’s adaptive tennis page USTA linked this site for the program.
UPDATE programs SET website_url = 'https://paducahtennis.com/adaptive-tennis/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '6ceebf63-d91c-5b0d-a5b7-d7ad99049e24' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- ACEing Autism - New Orleans, New Orleans, LA | program
-- Why: ACEing Autism’s New Orleans program page, with fall 2026 sessions.
UPDATE programs SET website_url = 'https://aceingautism.org/programs/new-orleans-la/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '92c207ef-ff9b-5f63-82e2-46c4531a6769' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Special Olympics Iberia Parish, New Iberia, LA | program
-- Why: Special Olympics Louisiana’s Acadiana page its contact form lists Iberia Parish tennis.
UPDATE programs SET website_url = 'https://specialolympicsla.org/state-map/acadiana-area/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'f6b7b573-68f7-5e1e-a10d-88018f0cc0b6' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Brunswick County Tennis Association, Southport, NC | program
-- Why: Abilities Tennis Association of NC’s Brunswick clinics page, with the same contact as USTA’s listing. The association itself has no working site.
UPDATE programs SET website_url = 'https://www.atanc.org/all-programs/brunswick', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '59f919c6-4922-5d56-93ef-73f848e103b2' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Orange County Aces, Montgomery, Newburgh, NY | program
-- Why: Its USTA club page, which lists adaptive tennis.
UPDATE programs SET website_url = 'https://playtennis.usta.com/orangecountyacestennis', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'b9575e49-7702-56ef-b6e3-42c6a28dab5f' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Black Girls Tennis Club, Norfolk, VA | program
-- Why: Its own site (Norfolk) USTA’s contact uses this domain.
UPDATE programs SET website_url = 'https://www.blackgirlstennisclub.com/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'daeba536-43d0-536b-8c93-b31a2f2d2b37' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Piedmont Area Tennis Association Adaptive Tennis, Ivy / Charlottesville area, VA | program
-- Why: The association’s wheelchair tennis page: wheelchair and adapted tennis in Charlottesville.
UPDATE programs SET website_url = 'https://www.patatennis.org/wheelchair-tennis', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '852c9589-e098-5df6-ad6f-c27b01cf4f07' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- BLV Community Hub Program, Vancouver, WA | program
-- Why: USTA Pacific Northwest’s Vancouver Tennis Center adapted tennis page, blind and low vision section.
UPDATE programs SET website_url = 'https://www.ustapnw.org/pnw-tennis-centers/vancouver/adapted-tennis/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'fc9f9d6f-7cf8-58f3-b8e4-a3f06f0c04b4' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');
