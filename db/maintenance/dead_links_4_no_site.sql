-- Waits for Alec's yes (through Chief of Staff). The site reviewer runs it, staging first. 40 rows drop off the site.
-- docs/data-fixes/dead-links.md. Each UPDATE matches the row's id AND its current link, so it is safe to run twice
-- and skips a row someone already changed.

-- Alpine Alternatives, Inc.: link is dead and no current site was found. Hides until a link turns up. Old domain does not resolve; alpinealternatives.org also dead. GuideStar says the org has dropped off the IRS Business Master File and may have merged or ceased operations, but no 
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9f6074cd-6e08-438b-a346-499b89b33981' AND website_url = 'https://alpinealternatives.net/';

-- Baltimore Adapted Recreation and Sports (BARS): link is dead and no current site was found. Hides until a link turns up. BARS' own site barsinfo.org loads (200) but is stale (last content '2019 snow skiing information coming soon') and its homepage carries injected Singapore-casino spam text with a b
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '08e621d4-90e5-4618-9cba-897887b666cf' AND website_url = 'https://moveunitedsport.org/organization/baltimore-adaptive-recreation-and-sports/';

-- Cajun Wheelers: link is dead and no current site was found. Hides until a link turns up. Youth wheelchair basketball team in Lafayette (founded 2020, NWBA-affiliated, expanded to New Orleans). cajunwheelers.com now returns 404; cajunwheelers.org does not resolve. Only 
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '34fe3c5d-724a-4a04-90e1-7e6466965339' AND website_url = 'https://www.cajunwheelers.com/';

-- Disabled Sports USA South Jersey Chapter: link is dead and no current site was found. Hides until a link turns up. Old national chapter page 404 (Disabled Sports USA merged into Move United). No current South Jersey chapter site or Move United member listing found under this name.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '93fd121f-12cd-4977-a0ea-2e68bfff604c' AND website_url = 'http://www.disabledsportsusa.org/chapters/disabled-sports-usa-south-jersey-chapter-new-jersey/';

-- Dynamic Paddlers: link is dead and no current site was found. Hides until a link turns up. Pittsburgh adaptive kayaking school. dynamicpaddlers.com/.org no longer resolve; only partner (Venture Outdoors) and podcast mentions found. No current own site.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c7b9dfcc-026b-4dd6-a2d7-c1b49317a356' AND website_url = 'http://www.dynamicpaddlers.com';

-- Home Sweet Home Community Redevelopment Corp: link is dead and no current site was found. Hides until a link turns up. Houston housing/disaster-recovery nonprofit. Its domain is still on Cloudflare but returns 523 (origin unreachable) on all variants. No alternate official site found. Not an adapti
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '1b91aa99-876e-48b1-8a49-1afa4a7d0e21' AND website_url = 'http://www.homesweethomecommunity.org/';

-- Independence Place – Central Kentucky: link is dead and no current site was found. Hides until a link turns up. Lexington center for independent living; still listed as active by Kentucky SILC / 2023 filings. ipky.org does not resolve and independenceplaceky.org (listed as its site) now show
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '01aa5fee-014a-4b2e-9c77-d3a70ab523ec' AND website_url = 'http://www.ipky.org';

-- Michigan Sports Unlimited – Saginaw: link is dead and no current site was found. Hides until a link turns up. misportsunlimited.com and .org variants do not resolve; only old directory entries found. No current activity found; likely defunct.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5b0f022e-f5f3-4eba-ad47-ac2b9423cc09' AND website_url = 'http://www.misportsunlimited.com';

-- STARskaters – Houston: link is dead and no current site was found. Hides until a link turns up. starskaters.org now returns a generic host 404 (https does not connect). No replacement site found; Sugar Land rink news suggests program disruption. Not confirmed closed.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '848d21a9-7bb3-45ff-a9c0-0b960e3a0e59' AND website_url = 'http://www.STARskaters.org';

-- Strong as Steel Adaptive Sports: link is dead and no current site was found. Hides until a link turns up. Old Webs.com site gone (Webs shut down). Western PA youth adaptive track team; only directory listings found, no current own site.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '1f7caaaf-e39a-4611-b4cc-d91d459eb2d0' AND website_url = 'http://strongassteeladaptivesports.webs.com/';

-- The Cody Unser First Step Foundation: link is dead and no current site was found. Hides until a link turns up. codysfirststep.org does not resolve; codyunser.com/.org show only 'Coming Soon' placeholders. Only PADI/GoFundMe/news mentions found.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'be1996f6-c5ef-4a9d-845b-b82cd1378962' AND website_url = 'http://www.codysfirststep.org';

-- United States Handcycling Federation: link is dead and no current site was found. Hides until a link turns up. Old URL was an NCHPAD directory page (404). Org's own domain ushf.org now shows a GoDaddy parking lander; ushandcycling.org does not resolve. No current site found; likely defunct.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6c8ce246-1391-427c-9987-6555a993e44a' AND website_url = 'http://www.nchpad.org/Directories/Organizations/2086/United~States~Handcycling~Federation';

-- Wasabi Dojo at Elements BJJ: link is dead and no current site was found. Hides until a link turns up. wasabidojo.net/.com do not resolve; no web trace of a 'Wasabi Dojo' at an Elements BJJ in Texas (elementsbjj.com is an unrelated Dutch academy).
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '095faa88-cb0b-4e0d-8402-9860b345ba1a' AND website_url = 'www.wasabidojo.net';

-- Equines Assisting Special Individuals (EASI): link is dead and no current site was found. Stays listed by its town. Walker County (Jasper/Boldo) PATH center. easiranch.org and variants do not resolve; only old event listings found. No current own site.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '92bb3547-1f30-5217-9b2f-ba2122e4a24b' AND website_url = 'http://www.easiranch.org/';

-- Pegasus Riding Academy: link is dead and no current site was found. Stays listed by its town. Still operating per April 2026 WTOC report (struggling financially), but prasav.org does not resolve and no replacement site found. Not to be confused with Pegasus Therapeutic Ridi
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '464fe506-221c-5283-b879-fb545e5eb50d' AND website_url = 'https://prasav.org/';

-- Fred Perrin's USA Tennis: link is dead and no current site was found. Stays listed by its town. playusatennis.com does not resolve. Only a private coach's lesson-marketplace profiles found (Bucks County); no organization site or adaptive program page.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '377f8d74-e3bc-579c-908f-a660da3f37d9' AND website_url = 'http://www.playusatennis.com/';

-- Sports 4 All Foundation: link is dead and no current site was found. Stays listed by its town. s4af.org still resolves but its root returns a bare 404; no other official site found. Nashville nonprofit (equipment endowment, Project HEALTH); status unclear.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c2e340e2-fbc8-5a03-a7ab-4bd1e3395754' AND website_url = 'https://www.s4af.org/';

-- One Life to Live Foundation: link is dead and no current site was found. Stays listed by its town. West Palm Beach nonprofit (respite days for women veterans and caregivers). Old Wix-style domain returns 404; no current own site found, only directory listings.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6a5efed8-af0c-5c71-9029-92b313674405' AND website_url = 'https://www.onelifetolivefoundation1.org/';

-- Art For All Mississippi: link is dead and no current site was found. Stays listed by its town. artforallms.com shows 'Squarespace - Website Expired'. No replacement site found; org status unclear.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6bfeaa1a-c8ca-5beb-a8ca-91df1f3a21e1' AND website_url = 'https://artforallms.com/';

-- Programs: link is dead and no current site was found. Drops out of the program lists until a link turns up; its page stays at /programs/<id>. Bad record: name is literally 'Programs', no state, old_url is the relative path '/programs/'. Nothing to research; likely a scraping artifact. Recommend deleting the row.
UPDATE programs SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9eb7fb00-2cb6-4462-a4fe-66422ba998fa' AND website_url = '/programs/';

-- Wood River Ability Program – Sun Valley-Ketchum: link is dead and no current site was found. Drops out of the program lists until a link turns up; its page stays at /programs/<id>. woodriverabilityprogram.org no longer resolves; only directory listings and old articles found. Sun Valley Resort runs its own adaptive programs (https://www.sunvalley.com/Lessons/
UPDATE programs SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3bee3d9c-c15c-4e6e-8ec9-e74606311679' AND website_url = 'http://www.woodriverabilityprogram.org';

-- Miracle League at Town 'N Country: link is dead and no current site was found. Stays listed by its town. townandcountrybaseball.com does not resolve; no Tampa 'Town N Country' Miracle League found. Possible data mix-up: the Miracle League run by the Town and Country Optimist Club is i
UPDATE programs SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3ea41f76-6285-5d1b-be81-27bedad8135e' AND website_url = 'https://www.townandcountrybaseball.com/';

-- Mandeville Soccer Club TOPSoccer: link is dead and no current site was found. Stays listed by its town. Club site was rebuilt (old /page/show/ URL 404). Current site navigation and program pages have no TOPSoccer or disability program; /topsoccer and /tops return 404. Program may be 
UPDATE programs SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd023aad5-e49a-55d2-82d7-9964ac7b1c4d' AND website_url = 'http://www.mscsoccer.org/page/show/273712-tops';

-- Serve a Purpose / The Barns at Blue Mountain: link is dead and no current site was found. Drops out of the program lists until a link turns up; its page stays at /programs/<id>. thebarnsatbluemountain.org/.com do not resolve. serveapurpose.org exists but is only a 'Launching Soon' placeholder and cannot be confirmed as the same org.
UPDATE programs SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f0094159-88a6-5992-8e28-e32ee3b0505c' AND website_url = 'https://thebarnsatbluemountain.org/';

-- Disabled Veterans SCUBA Project: link is dead and no current site was found. Hides until a link turns up. Domain returns 404; no other official site found (only GuideStar and news). Status unknown.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'df3fa7f0-2868-4f8b-a987-dde2a03e6ef1' AND website_url = 'http://www.disabledveteransscubaproject.org/';

-- Inland Northwest Disabled Veterans Sports Association – Coeur d’Alene: link is dead and no current site was found. Hides until a link turns up. indvsa.org now redirects to a parked/ad page (ww16.indvsa.org). No replacement site found; USOPC club list still points to old domain.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2397c627-e142-4ee6-bd3a-cdec6ca95796' AND website_url = 'http://www.indvsa.org';

-- UCO Sports & Events: link is dead and no current site was found. Hides until a link turns up. usoadaptiverec.com does not resolve. UCO's newsroom links its adaptive event (Endeavor Games) to endeavorgames.org/edmond/, but uco.edu and endeavorgames.org both return 403 to aut
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e078cd42-e3d4-49b4-acee-3c509d099e66' AND website_url = 'http://www.usoadaptiverec.com';

-- STRIVE4You ARISE Adaptive Sports: link is dead and no current site was found. Stays listed by its town. strive4you.org has Cloudflare nameservers but no address record (site offline). No replacement site found.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'febf56b1-b296-5cfd-9a1d-f51ab4a7171d' AND website_url = 'https://strive4you.org/arise/';

-- Cloud of Witness Ranch Equine Assisted Services: link is dead and no current site was found. Stays listed by its town. cloudofwitness.org resolves but serves 404 (no site). Only directory listings found (Underwood, IN). Status unknown.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9c9e63a9-c248-55f7-b3f6-4110755dd0e1' AND website_url = 'https://www.cloudofwitness.org/';

-- Nipper Knolls Equine Center: link is dead and no current site was found. Stays listed by its town. nipperknolls.com no longer resolves (no DNS). Search index still shows old pages and 2024 news (Granville, NY), but no working site found.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c6d05e15-c589-5df7-9f1f-a5ed8fbe4652' AND website_url = 'https://nipperknolls.com/';

-- Mane Mission: link is dead and no current site was found. Stays listed by its town. manemissiontn.org shows 'Squarespace - Website Expired'. No replacement site found.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '82172063-1cbf-57e6-b177-8d35d3c117dd' AND website_url = 'https://www.manemissiontn.org/';

-- River Cities Therapy and Recreation Center: link is dead and no current site was found. Stays listed by its town. rctrc.org no longer resolves. Only directory/map listings found; possibly closed, no evidence either way.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '46683cf9-f994-556c-8ea4-77d850c8014c' AND website_url = 'http://www.rctrc.org/';

-- Athens Inclusive Recreation and Sports (AIRS): link is dead and no current site was found. Stays listed by its town. airs-ga.org is now a Chinese-language lottery/gambling page (TAKEN OVER, not just dead). No replacement official site found; only directory listings.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a6055e57-4fb0-4ddb-8a2a-b620cf292721' AND website_url = 'https://airs-ga.org/';

-- California Adaptive Rowing Program: link is dead and no current site was found. Drops out of the program lists until a link turns up; its page stays at /programs/<id>. Old tripod site gone. Search index shows carplb.net titled 'California Adaptive Rowing Programs', but carplb.net does not resolve from here; could not confirm.
UPDATE programs SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ec9c1db6-2cef-4326-a057-87eb57e21298' AND website_url = 'https://carplb.tripod.com/index.htm';

-- Paralympic Alpine Development Program – Aspen: link is dead and no current site was found. Drops out of the program lists until a link turns up; its page stays at /programs/<id>. Old link was a directory listing that moved to adaptiveskiing.net/clubs/alpine-skiing/avsc-adaptive-alpine-development-program (directory, not a replacement). Aspen Valley Ski & Sn
UPDATE programs SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5b00f6dc-e711-428e-8c6b-56c7837ee6e1' AND website_url = 'https://adaptiveskiing.net/clubs/alpine-skiing/item/avsc-adaptive-alpine-development-program';

-- Regional Programs: link is dead and no current site was found. Drops out of the program lists until a link turns up; its page stays at /programs/<id>. Old link is a relative fragment (/programs/#regions) with no domain and no state; cannot tell which organization it belongs to. Needs a look at the parent organization record.
UPDATE programs SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '315b9e53-8819-451c-8416-c0ebc0e534dd' AND website_url = '/programs/#regions';

-- Youth Programs: link is dead and no current site was found. Drops out of the program lists until a link turns up; its page stays at /programs/<id>. Old link is a relative fragment (/programs/#youth) with no domain and no state; cannot tell which organization it belongs to. Needs a look at the parent organization record.
UPDATE programs SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5871745b-04fd-403a-b3ed-3bfd447de985' AND website_url = '/programs/#youth';

-- Southern Crescent Wheelchair Tennis: link is dead and no current site was found. Stays listed by its town. Southern Crescent Tennis Association site (ustasoutherncrescent.com) is live, but the /wheelchair-tennis page is gone and no wheelchair tennis page was found on the site.
UPDATE programs SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'aa1a52d2-3762-5fba-bb1f-d3ae122c738c' AND website_url = 'http://www.ustasoutherncrescent.com/wheelchair-tennis';

-- Austin Rec’ers: link is dead and no current site was found. Hides until a link turns up. Old domain 404s; no current site found for this group by name. Austin Parks and Recreation Therapeutic Recreation Services (austintexas.gov) runs adaptive programs in Austin but is
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '749e5dc0-50a8-459a-b5b0-8f27accb01db' AND website_url = 'http://www.austinrecers.org/';

-- Champions Made From Adversity – Greater Augusta: link is dead and no current site was found. Hides until a link turns up. Old link was an NCHPAD directory entry, not the org's site. No own website found; only directory and news mentions. Other Augusta adaptive programs exist (Catalyst Sports Augusta, 
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'dd328116-8d7c-4a17-9222-86f020f5183f' AND website_url = 'https://www.nchpad.org/Directories/Organizations/3356/Champions~Made~From~Adversity-Paralympic~Sport~Greater~Augusta';

-- Colusana: link is dead and no current site was found. Hides until a link turns up. colusana.org no longer resolves. Only a GuideStar profile (Miami Beach wheelchair sports nonprofit, founded 2014) found; no current own website.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fbeab298-282c-492b-819f-294610919060' AND website_url = 'http://www.colusana.org';

-- Corona Challengers: link is dead and no current site was found. Hides until a link turns up. Old link was a Corona-Norco USD page (removed). No current page for Corona Challengers found. City of Corona Adaptive Recreation (https://www.coronaca.gov/departments/recreation-se
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f015e264-a25e-400c-a789-8d5d74ac20b2' AND website_url = 'http://www.cnusd.k12.ca.us/Page/17824';

-- Team PossAbilities Shield Maidens: link is dead and no current site was found. Hides until a link turns up. lashieldmaidens.com no longer resolves. Team PossAbilities (Loma Linda University Health) site is live at https://teampossabilities.org/adaptive-sports/ but no Shield Maidens team 
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '375628b2-fbb6-4ea7-a220-1e8f24a7416a' AND website_url = 'https://www.lashieldmaidens.com/';

-- Team River Runner – Virginia Beach: link is dead and no current site was found. Hides until a link turns up. Team River Runner's current chapters page (https://www.teamriverrunner.org/get-involved/chapters/) lists Virginia chapters such as Fort Belvoir and Fredericksburg but no Virginia B
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5d282231-c968-4161-909c-80209d76979d' AND website_url = 'http://www.teamriverrunner.org/get-involved/chapters/virginia-va-beach/';

-- University of New Mexico DisAbility Sports Festival: link is dead and no current site was found. Hides until a link turns up. Old festival page on nmwheelchairsports.com removed (site live but no festival page). No current UNM page for the DisAbility Sports Festival found; most recent coverage is 2016. UN
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '09008baf-a9ea-448a-888c-e75a785afbc4' AND website_url = 'http://nmwheelchairsports.com/adapted-sports-festival';

-- United Amputees Services Association: link is dead and no current site was found. Hides until a link turns up. Old link was an O&P directory entry. Organization (volunteer amputee peer-support nonprofit, Winter Park FL) has no own website found; only directory listings (JAN).
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '144cff6d-18b3-40be-abe1-c7ebceea15f1' AND website_url = 'https://www.oandp.com/resources/organizations/uasa/';

-- Visually Impaired and Blind Skiers: link is dead and no current site was found. Hides until a link turns up. coloradovibes.org no longer resolves; no replacement site found, only directory listings (NCHPAD) and older news (Colorado Springs area).
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5c7a5058-7f74-4031-bbc5-9a8ff0cab12e' AND website_url = 'http://www.coloradovibes.org';

-- Upstate SC AMBUCS: link is dead and no current site was found. Stays listed by its town. upstatescambucs.org no longer resolves. No chapter site found. National AMBUCS chapter directory (https://ambucs.org/chapter-directory/) loads its list dynamically; could not confi
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '37e0d0ad-413e-500b-a2c2-47f8ff388ba2' AND website_url = 'https://www.upstatescambucs.org/';

-- Mid-South Adaptive Sports and Recreation: link is dead and no current site was found. Stays listed by its town. msasr.org no longer resolves. Only local magazine directory listings (Memphis Parent, Memphis Magazine) found; no current own site.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0fd1afab-082a-5be2-8e35-7d578f50eed4' AND website_url = 'https://www.msasr.org/';

-- Nevada Department of Veterans Services / City of Reno: link is dead and no current site was found. Stays listed by its town. NDVS site redesign dropped the Veterans Community Councils page (404, not in sitemap). Agency site live at https://veterans.nv.gov/ ; the Reno-area group was listed as the Truckee 
UPDATE programs SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0ccf3bec-f5a4-5ee1-8ec0-b8601376f8ae' AND website_url = 'https://veterans.nv.gov/benefits-and-services/veterans-community-councils/';

-- Courage Therapeutic Riding Center: link is dead and no current site was found. Stays listed by its town. couragetrc.org no longer resolves. Only GuideStar/Benevity profiles (Prairie Grove, AR) found; no current own site.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7ee0e316-c97b-59fd-8fc2-24c38306d6c5' AND website_url = 'https://www.couragetrc.org/';

-- Lava Lake Institute for Science & Conservation / NCEFT: link is dead and no current site was found. Stays listed by its town. lavalakeinstitute.org shows 'Squarespace - Website Expired'; institute may be inactive, but no closure notice found. Partner NCEFT (Woodside, CA) is live with a veterans page (http
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2061acb3-d88c-50a4-b81b-273ed24c37b5' AND website_url = 'https://www.lavalakeinstitute.org/';

-- Shoulder 2 Shoulder Veteran Academy: link is dead and no current site was found. Stays listed by its town. s2sveterans.org domain registration has expired (registrar renewal page). No replacement site found via search (results were unrelated companies with similar names).
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e3004171-4a76-5e64-bee7-0bf449197577' AND website_url = 'https://www.s2sveterans.org/';

-- Lady Mavericks Wheelchair Basketball – Dallas: link is dead and no current site was found. Hides until a link turns up. webs.com site no longer resolves. Only a National Wheelchair Basketball Association team listing (https://www.nwba.org/page/show/7334662-lady-mavericks, governing-body directory) a
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'dc6f2215-a299-44e8-b855-bc75c5e2e902' AND website_url = 'https://wheelchairladymavericks.webs.com/';

-- Solid Rock Therapeutic Riding Center: link is dead and no current site was found. Hides until a link turns up. solidrocktrc.com (https) is a Netlify site 'paused as it reached its usage limits' (503); search index titled it 'Solid Rock Redemption Center | Horseback Riding & Programs', sugge
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '14120ef1-3123-49d9-a3ba-a3cf33ddd08a' AND website_url = 'http://www.solidrocktrc.com';

-- Adaptive Tennis US (Maryland): link is dead and no current site was found. Stays listed by its town. adaptivetennisus.com no longer resolves; no replacement found. Maryland adaptive tennis is offered by Junior Tennis Champions Center (https://jtcc.org/adaptive/), a different organ
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b4fa83a7-a80e-586e-ba1d-c79342026b27' AND website_url = 'https://adaptivetennisus.com/';

-- CAMC Para-athletic Program: link is dead and no current site was found. Drops out of the program lists until a link turns up; its page stays at /programs/<id>. CAMC (now Vandalia Health) removed the challengedsports page (404). No current CAMC page for the para-athletic program found. Challenged Athletes of West Virginia (https://cawvspor
UPDATE programs SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '723fce38-ee2e-4a2f-8919-ee706a209d5f' AND website_url = 'https://camc.org/challengedsports';

-- Hero Horse Therapeutic Riding: link is dead and no current site was found. Stays listed by its town. herohorse.org no longer resolves. Only GuideStar, VolunteerMatch and local news (Frierson, LA) found; no current own site.
UPDATE programs SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fd666524-9b05-5adc-9743-cb7a685ca5cd' AND website_url = 'https://www.herohorse.org/';

-- All Abilities Tennis Program, Kansas City, Missouri: link is dead and no current site was found. Stays listed by its town. The Whole Person rebuilt its site (thewholeperson.org); old adaptive sports/tennis pages are 404 and the new site map has no adaptive sports or tennis pages. Program may have ended
UPDATE programs SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b6e32930-9412-5172-a015-fbbfc69e532b' AND website_url = 'https://thewholeperson.org/other-services/adaptive-sports/tennis/';

-- Town of South Windsor: link is dead and no current site was found. Stays listed by its town. Old link was a Patch event listing for a dated veterans coffee hour (not an official page). Later Patch listings show the coffee hour recurs monthly in 2026, and South Windsor Amer
UPDATE programs SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '69cf5409-4c51-5f3e-9f55-d61237500a2f' AND website_url = 'https://patch.com/connecticut/southwindsor/calendar/event/20260115/8d75e5af-5a35-4a42-921f-945eb59f079b/veterans-coffee-hour';

-- Lake of the Ozarks Judo Club: link is dead and no current site was found. Hides until a link turns up. Still listed on USOPC Missouri club page but with no website or social link. No own site found by name search. Possibly inactive.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3daceb81-958d-43b6-a99b-e3a8a83a9d8a' AND website_url = 'https://www.teamusa.org/US-Paralympics/Find-A-Club/Club-Search/Lake-of-the-Ozarks-Judo-Club';

-- Miami Valley Adapted Sports: link is dead and no current site was found. Hides until a link turns up. USOPC lists miamivalleyadaptedsports.org, but that domain no longer resolves (no DNS). No replacement site found; only a Facebook page is listed. Possibly inactive.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b620356f-cd8d-4c01-91bb-dd2f6a20aba6' AND website_url = 'https://www.teamusa.org/US-Paralympics/Find-A-Club/Club-Search/Miami-Valley-Adapted-Sports-Paralympic-Sport-Miami-Valley';

-- Rollin’ Red Sox Wheelchair Softball: link is dead and no current site was found. Hides until a link turns up. USOPC lists the team with no website. Past affiliations (Access2Adventure RI, access2adventure.net; Wheelchair Sports Federation) have no team page: access2adventure.net does not r
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b44749e4-269c-4968-a8b2-50b6fde5a67f' AND website_url = 'https://www.teamusa.org/US-Paralympics/Find-A-Club/Club-Search/Rollin-Red-Sox-Wheelchair-Softball';

-- Seton Brain and Spine Institute – Austin: link is dead and no current site was found. Hides until a link turns up. Old seton.net page redirects to Ascension's generic homepage; setonbrainandspine.com no longer resolves. Ascension lists Seton rehab locations, but no page for the Adapted Sports P
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '077362b1-b0a1-42f0-acc1-de6aa31fac07' AND website_url = 'https://www.seton.net/brain-and-spine-care/spinal-cord-injury/adapted-sports-program/';

-- Wheelin’ Wizards Youth Wheelchair Basketball: link is dead and no current site was found. Hides until a link turns up. Known site wheelinwizards.org no longer resolves (no DNS). No current own site found. Possibly inactive.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '44b549cd-bb87-4c39-b686-22093880874e' AND website_url = 'https://www.teamusa.org/US-Paralympics/Find-A-Club/Club-Search/Wheelin-Wizards-Competitive-Youth-Wheelchair-Basketball-Club';

-- Liverpool FC International Academy Maryland TOPSoccer: link is dead and no current site was found. Stays listed by its town. Club moved to liverpoolfciamaryland.com; old /topsoccer redirects to the homepage. The new site has no TOPSoccer or adaptive program page. Program may be discontinued (MSYSA TOPSoc
UPDATE programs SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b5a3c700-9c10-5ffe-92bf-194ab00ecd75' AND website_url = 'https://lfcinternationalacademymd.com/topsoccer';
