-- docs/data-fixes/missing-data.md. Every UPDATE matches the row's id and only fills what is empty (or matches the
-- current value it replaces), so it is safe to run twice and skips anything someone already set.

-- Lakeshore Sharks: website + town + state. Evidence: https://www.lakeshore.org/activity/sports-recreation/youth-athletics/ To check: the quote does not show the town; weaker evidence (see note). Youth Prep-division wheelchair basketball team of Lakeshore Foundation; footer gives Birmingham, AL. Old Team App page is inactive. lakeshore.org blocks curl (403); confirmed via Exa fetch.
UPDATE organizations SET website_url = 'https://www.lakeshore.org/activity/sports-recreation/youth-athletics/', last_ok_at = NULL, city = 'Birmingham', state = 'AL', state_name = 'Alabama', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd7b27879-3292-4dc3-82a7-d25434565019' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Outdoor Valor (TN): website + town + state. Evidence: https://outdoorvalor.org/events/ To check: changes the state from TN to FL. Listed state TN looks wrong: site title says 'Free Veteran Fishing Programs in Florida'; serves Marion County / Tampa Bay area. No Tennessee presence found.
UPDATE programs SET website_url = 'https://outdoorvalor.org/', last_ok_at = NULL, city = 'Ocala', state = 'FL', state_name = 'Florida', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6f15cc71-b58a-5290-8d64-e1610f7e79f1' AND website_url = 'https://outdoorvalor.org/about/' AND (city IS NULL OR city = '') AND state = 'TN';

-- Arkansas Rollin' Razorbacks: town. Evidence: https://www.knoe.com/2026/03/29/arkansas-rollin-razorbacks-win-national-wheelchair-basketball-tournament/ To check: town only, with no website of its own; weaker evidence (see note). No own website; only NWBA team pages (e.g. nwba.org/page/show/9224946-arkansas-rollin-razorbacks) and the USOPC club finder, which links to NWBA. Town from a news story (KNOE, 2026). Same team as item 'AR Rollin' Razorba
UPDATE organizations SET city = 'Sherwood', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e5712394-2041-4223-80d4-143a50d415a3' AND (city IS NULL OR city = '');

-- Fitness Warehouse of Elizabeth City: town + state. Evidence: https://moveunitedsport.org/organization/fitness-warehouse-of-elizabeth-city/ To check: town only, with no website of its own; weaker evidence (see note). Local gym; no own official website found (only directory/aggregator pages such as an auto-generated edan.io page, Wellhub, MapQuest). Evidence is the Move United listing (directory, not to be used as website).
UPDATE organizations SET city = 'Elizabeth City', state = 'NC', state_name = 'North Carolina', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '1c854156-02e2-42c3-b449-578611f7c86b' AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- AR Rollin' Razorbacks: town + state. Evidence: https://www.knoe.com/2026/03/29/arkansas-rollin-razorbacks-win-national-wheelchair-basketball-tournament/ To check: town only, with no website of its own; weaker evidence (see note). Duplicate of 'Arkansas Rollin' Razorbacks' (NWBA lists both 'AR Rollin Razorbacks' and 'Arkansas Rollin Razorbacks' team pages). No own website.
UPDATE organizations SET city = 'Sherwood', state = 'AR', state_name = 'Arkansas', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4ddaaabc-d4d7-4af6-84c3-1e6a301bd34a' AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Columbus Knights - Varsity: website + town + state. Evidence: https://columbusrecparks.com/wellness/athletics/basketball/wheelchair-basketball/ To check: weaker evidence (see note). City-run wheelchair basketball; '- Varsity' is an NWBA division label. Practices at Espy Adaptive Sports Complex.
UPDATE organizations SET website_url = 'https://columbusrecparks.com/wellness/athletics/basketball/wheelchair-basketball/', last_ok_at = NULL, city = 'Columbus', state = 'OH', state_name = 'Ohio', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f3d09d84-8d40-46c0-828c-0efedf4d6976' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Bridge II Sports Pride - Prep: website + town + state. Evidence: https://www.bridge2sports.org/ To check: weaker evidence (see note). ' - Prep' is the NWBA division label for the Pride youth team. Site footer lists a Durham, NC location. No Pride-specific page on the current site.
UPDATE organizations SET website_url = 'https://www.bridge2sports.org/', last_ok_at = NULL, city = 'Durham', state = 'NC', state_name = 'North Carolina', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'cd006d42-5823-465a-afe5-2f54021d1b6d' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Reimagine Life Foundation: website + town + state. Evidence: https://www.reimagine-life.org/ To check: the quote does not show the town. Page title includes the Detroit, MI office (address omitted here). Runs SportsAbility adaptive sports program.
UPDATE organizations SET website_url = 'https://www.reimagine-life.org/adaptive-sports', last_ok_at = NULL, city = 'Detroit', state = 'MI', state_name = 'Michigan', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '352074d5-63fb-40e6-8462-8c20dffdf06e' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- NY Rollin Fury: website + town + state. Evidence: https://nyrollingfury.org/ To check: the quote does not show the town. Correct name is 'Rolling Fury'. Junior club serving Greater NY, Long Island and NJ; contact page says practices are at a Manhattan (New York, NY) recreation center.
UPDATE organizations SET website_url = 'https://nyrollingfury.org/', last_ok_at = NULL, city = 'New York', state = 'NY', state_name = 'New York', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'db081ea2-7779-4244-bcb7-546f8b042bf8' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Team River Runner – Springfield: website + town. Evidence: https://www.teamriverrunner.org/branson/ To check: the quote does not show the town. Old Springfield node URL now just loads the TRR home page. TRR's chapter list has no Springfield chapter; the regional chapter is Southwest Missouri, whose page is titled 'Branson, MO'. Confirm this is the successor.
UPDATE organizations SET website_url = 'https://www.teamriverrunner.org/branson/', last_ok_at = NULL, city = 'Branson', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '853aaadc-e9f1-4d46-98aa-bb8aebd3dc8b' AND website_url = 'http://www.teamriverrunner.org/?q=node/1333' AND (city IS NULL OR city = '');

-- NMCSD Wolf Pack: website + town + state. Evidence: https://warriorfoundation.org/wolfpack/ To check: weaker evidence (see note). Military wheelchair basketball team, now supported by Warrior Foundation Freedom Station. NWBA lists it as NMCSD Wolf Pack.
UPDATE organizations SET website_url = 'https://warriorfoundation.org/wolfpack/', last_ok_at = NULL, city = 'San Diego', state = 'CA', state_name = 'California', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '08c4b284-9255-4b14-bfb1-9487d659746d' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Nautical Milers Swim Team: town. Evidence: https://www.athleteswithoutlimits.org/people/thoreson-patrick To check: town only, with no website of its own; weaker evidence (see note). Listed site is Facebook; no own website found (also listed on U.S. Masters Swimming club page usms.org/clubs/nautical-milers-special-needs-swim-team-2104).
UPDATE organizations SET city = 'Atlanta', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ae3cd93e-91a2-4365-a942-fdcb5e9295d6' AND (city IS NULL OR city = '');

-- Lakeshore Storm: website + town. Evidence: https://www.lakeshore.org/activity/sports-recreation/adult-athletics/ To check: the quote does not show the town; weaker evidence (see note). Lakeshore Foundation, Birmingham AL (site footer). lakeshore.org blocks curl; confirmed via Exa fetch.
UPDATE organizations SET website_url = 'https://www.lakeshore.org/activity/sports-recreation/adult-athletics/', last_ok_at = NULL, city = 'Birmingham', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ddd9e639-96d5-4a9e-9ab8-f99370d4057d' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Texas Regional Games: website + town. Evidence: https://www.texasparasportgames.com/ To check: the quote does not show the town; weaker evidence (see note). Renamed event of Texas Parasport. Venues are Morgan’s Wonderland facilities (San Antonio); town per Texas Parasport's 2025 press release dated SAN ANTONIO, not stated as a town name on the games page itself.
UPDATE organizations SET website_url = 'https://www.texasparasportgames.com/', last_ok_at = NULL, city = 'San Antonio', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a24fc3fe-77ed-486f-be65-51552ff75f3c' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Rancho Halos- DIII: website + town + state. Evidence: https://www.thedowneypatriot.com/articles/ranchos-adult-wheelchair-basketball-team-ranked-no-4-nationally To check: weaker evidence (see note). Program page of LA County's Rancho Los Amigos National Rehabilitation Center; '- DIII' is the NWBA division (page: 'The other adult team competes at a more recreational level in Division III'). Town quote from local news
UPDATE organizations SET website_url = 'https://dhs.lacounty.gov/rancho/patient-programs-and-services/wheelchair-sports-program/', last_ok_at = NULL, city = 'Downey', state = 'CA', state_name = 'California', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6a1cfb21-a3ce-4a68-9d26-2972059cc5fe' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Easton Archery Center of Excellence: website + town + state. Evidence: https://www.eastonarcherycenterofexcellence.org/ To check: weaker evidence (see note). Quote from the page header contact line. Home of USA Archery resident programs; adaptive-specific page not confirmed (sister Easton centers in Salt Lake City and Newberry have para archery pages).
UPDATE organizations SET website_url = 'https://www.eastonarcherycenterofexcellence.org/', last_ok_at = NULL, city = 'Chula Vista', state = 'CA', state_name = 'California', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '1338abf3-2fd2-4091-b907-5afe4d10a5ed' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- St. Marys County Department of Recreation and Parks: website + town. Evidence: https://www.stmaryscountymd.gov/recreate/trc/ To check: the quote does not show the town. County department; office in Leonardtown, MD (page footer). Serves all of St. Mary's County.
UPDATE organizations SET website_url = 'https://www.stmaryscountymd.gov/recreate/trc/', last_ok_at = NULL, city = 'Leonardtown', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e2672d59-39ab-47b6-aeca-91c196dd161e' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Adaptive Martial Arts Alliance: website + town + state. Evidence: https://adaptivekarate.net/meet-the-instructor To check: the quote does not show the town; weaker evidence (see note). Town Wood River, IL from site footer (WebFetch). Do not confuse with the Disabled Martial Artists Alliance (formerly Adaptive Martial Arts Association) at adaptivemartialarts.org.
UPDATE organizations SET website_url = 'https://adaptivekarate.net/', last_ok_at = NULL, city = 'Wood River', state = 'IL', state_name = 'Illinois', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '441c44ab-d1ed-436b-8d27-b1352bdccb82' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- NRH Ambassadors: website + town. Evidence: https://www.medstarhealth.org/services/adaptive-sports-fitness-program To check: the quote does not show the town; weaker evidence (see note). Listed site is Facebook. The hospital program page lists location National Rehabilitation Hospital, Washington, DC. 'NRH Ambassadors' name not found; current team name is MedStar NRH Punishers.
UPDATE organizations SET website_url = 'https://www.medstarhealth.org/services/adaptive-sports-fitness-program', last_ok_at = NULL, city = 'Washington', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7f965b4d-c93d-4d7d-a7cd-c623bfe77ee3' AND website_url = 'https://www.facebook.com/NRHPunishersWheelchairBasketball/' AND (city IS NULL OR city = '');

-- Reboot Hope: website + town. Evidence: https://reboothope.org/contact-us/ To check: weaker evidence (see note). Listed URL rebootrecovery.com is a different org (REBOOT Recovery, Pleasant View TN). Reboot Hope's own site is reboothope.org (mentorship, mental health support, equine-assisted services for veterans, women, youth in Te
UPDATE organizations SET website_url = 'https://reboothope.org/', last_ok_at = NULL, city = 'Marion', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '71aa9f49-7806-530d-96d3-b780def2c5e3' AND website_url = 'https://rebootrecovery.com/' AND (city IS NULL OR city = '');

-- Angel City Games: website + town. Evidence: https://angelcitysports.org/angelcitygames/ To check: the quote does not show the town. Annual event by Angel City Sports (a Los Angeles-based nonprofit). Event venue El Camino College is in Torrance per the page's location block.
UPDATE organizations SET website_url = 'https://angelcitysports.org/angelcitygames/', last_ok_at = NULL, city = 'Torrance', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '50425b31-5592-47c9-8f74-9d75ad5720ff' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Space Coast Hurricanes Sled Hockey: town. Evidence: https://www.fladaptivesports.org/spacecoasthurricanes To check: weaker evidence (see note). Own site says 'located in Brevard County, Florida'; Florida Adaptive Sports listing and local news give Space Coast Iceplex in Rockledge.
UPDATE organizations SET city = 'Rockledge', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2dad6a35-40e7-4a7a-99ab-ebaf7db0780f' AND (city IS NULL OR city = '');

-- Central Florida Tri-Club – Paralympic Sport Orlando: website + town. Evidence: https://cfltriclub.com/ To check: weaker evidence (see note). Triathlon club; Paralympic Sport Orlando affiliation not confirmed on current site.
UPDATE organizations SET website_url = 'https://cfltriclub.com/', last_ok_at = NULL, city = 'Orlando', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '11dde9f0-290a-4215-aefd-8efcaef0c2f7' AND website_url = 'http://www.cfltriclub.com' AND (city IS NULL OR city = '');

-- Houston Rollin' Rockets: town + state. Evidence: https://www.nwba.org/page/show/9558045-houston-rolling-rockets To check: town only, with no website of its own; weaker evidence (see note). No own website found; only NWBA team pages (league listing, not an official site). Name on NWBA is now 'Houston Rolling Rockets'. Town from team name only; City of Houston Parks runs adult wheelchair basketball (houstont
UPDATE organizations SET city = 'Houston', state = 'TX', state_name = 'Texas', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8aeb6c90-df1d-446f-bdc5-51d058c6a883' AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- RISE Adaptive Sports – North Texas: town. Evidence: https://riseadaptivesports.org/ To check: weaker evidence (see note). Serves North Texas; event quote names a Dallas venue.
UPDATE organizations SET city = 'Dallas', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0b225fd8-27c2-4c6a-850a-3a220bb7e366' AND (city IS NULL OR city = '');

-- Central Association for the Blind and Visually Impaired: website + town. Evidence: https://cabvi.org/about/our-story/ To check: weaker evidence (see note). Also has a Syracuse office. Vision services agency; adaptive recreation not confirmed on fetched pages.
UPDATE organizations SET website_url = 'https://cabvi.org/', last_ok_at = NULL, city = 'Utica', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a0a90054-c6aa-4ce8-9e44-d9b0a9eec3cd' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Texas Regional Para Sport: A division of Lone Star Paralysis Foundation: website. Evidence: https://www.texasparasport.org/ To check: weaker evidence (see note). Texas Regional Para Sport (TRPS, earlier a program of Lone Star Paralysis Foundation: lonestarparalysis.org/trps) appears to now operate as Texas Parasport, which runs the Texas Parasport Games 'formerly the Texas Region
UPDATE organizations SET website_url = 'https://www.texasparasport.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9e6bc15e-0f8a-4770-a50f-7923fca0b041' AND (website_url IS NULL OR website_url = '');

-- Wheelin' Wizards Competitive Youth Wheelchair Basketball Club: town. Evidence: https://www.taxexemptworld.com/organization.asp?tn=804909 To check: town only, with no website of its own; weaker evidence (see note). No own website found; town from IRS-registry listing only (not an official page). Treat as low confidence; may be inactive.
UPDATE organizations SET city = 'Cudahy', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a6734461-be9b-4fbf-95d4-ada6c57eb8c7' AND (city IS NULL OR city = '');

-- Bassai Karate Dojo International: website + town. Evidence: https://bassaikaratedojo.weebly.com/bkd--i-branch-location.html To check: weaker evidence (see note). Listed site is Facebook; own weebly site found. Also lists a Destin, FL branch. Adaptive program not confirmed.
UPDATE organizations SET website_url = 'https://bassaikaratedojo.weebly.com/', last_ok_at = NULL, city = 'Orlando', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8d3399dc-b36d-4b82-9a65-56c29e50c39b' AND website_url = 'https://www.facebook.com/BassaiKarateDojoInternational' AND (city IS NULL OR city = '');

-- Mary Free Bed Pacers: website + town + state. Evidence: https://www.maryfreebed.com/specialties/wheelchair-adaptive-sports/ To check: the quote does not show the town; weaker evidence (see note). Pacers are Mary Free Bed's NWBA wheelchair basketball team; program page is the hospital's adaptive sports page (Grand Rapids).
UPDATE organizations SET website_url = 'https://www.maryfreebed.com/specialties/wheelchair-adaptive-sports/', last_ok_at = NULL, city = 'Grand Rapids', state = 'MI', state_name = 'Michigan', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '577e9bb3-7cd6-40a9-8842-22f18424e41d' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Row New York Adaptive: website + town + state. Evidence: https://www.rownewyork.org/ To check: the quote does not show the town. Adaptive rowing is a Row New York program; boathouses in Manhattan and Queens (Flushing).
UPDATE organizations SET website_url = 'https://www.rownewyork.org/', last_ok_at = NULL, city = 'New York', state = 'NY', state_name = 'New York', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0b97422a-32da-4692-944b-4b62528e2d04' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- United States Equestrian Federation: website + town + state. Evidence: https://www.usef.org/ To check: changes the state from NJ to KY; town only, with no website of its own. National governing body (US Equestrian); HQ is Lexington KY, not NJ. National org, para-equestrian is a discipline; consider town=''.
UPDATE organizations SET website_url = 'https://www.usef.org/', last_ok_at = NULL, city = 'Lexington', state = 'KY', state_name = 'Kentucky', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'da4bc284-5c3f-406f-a11d-7907fcbd0e71' AND website_url = 'http://www.usef.org/_IFrames/breedsDisciplines/discipline/allpara.aspx' AND (city IS NULL OR city = '') AND state = 'NJ';

-- Team Paradise Sailing – Paralympic Sport Miami: town. Evidence: https://www.teamparadise.org/ To check: town only, with no website of its own. 
UPDATE organizations SET city = 'Miami', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9399efbf-9b24-4925-bc2c-aeb45c759a56' AND (city IS NULL OR city = '');

-- Lending Sight: website. Evidence: https://www.lendingsight.com/ To check: weaker evidence (see note). Site sells guide tethers for visually impaired runners (shop + Cherry Creek Sneak photo galleries); not a program with a stated town. Consider whether it belongs in the directory.
UPDATE organizations SET website_url = 'https://www.lendingsight.com/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'eec0f8b3-b90c-4086-9108-3d963f7cbafa' AND (website_url IS NULL OR website_url = '');

-- City of Atlanta Parks and Recreation-Therapeutics: website + town. Evidence: https://www.atlantaga.gov/government/departments/department-parks-recreation/office-of-recreation/therapeutics-special-needs To check: the website did not load cleanly from our server (blocked); weaker evidence (see note). Based at Coan Park Therapeutic Center. City site blocks curl/headless (403); content confirmed via Exa crawl.
UPDATE organizations SET website_url = 'https://www.atlantaga.gov/government/departments/department-parks-recreation/office-of-recreation/therapeutics-special-needs', last_ok_at = NULL, city = 'Atlanta', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a44fa7d7-214d-4917-84af-94bb2c674799' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- MedStar NRH Punishers: website + town + state. Evidence: https://www.medstarhealth.org/services/adaptive-sports-fitness-program To check: the quote does not show the town. Team of the MedStar National Rehabilitation Hospital Adaptive Sports and Fitness program; page lists National Rehabilitation Hospital, Washington, DC.
UPDATE organizations SET website_url = 'https://www.medstarhealth.org/services/adaptive-sports-fitness-program', last_ok_at = NULL, city = 'Washington', state = 'DC', state_name = 'District of Columbia', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5147530a-0f31-47ec-a1e9-8d89ff8ce943' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- One Chair At A Time: town. Evidence: https://www.onechairatatime.org/ To check: town only, with no website of its own; weaker evidence (see note). Town inferred from athlete listings on the homepage (Amarillo area); org address not shown. Lower confidence.
UPDATE organizations SET city = 'Amarillo', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '27f69b0a-f713-48be-8e2c-685e4796033b' AND (city IS NULL OR city = '');

-- Pursuit Adaptive Sports and Recreation: website + state. Evidence: https://www.pursuitadaptivesports.org/ To check: weaker evidence (see note). Serves the DC metro region (Northern VA, DC, MD); no single town. Some activities in Alexandria VA.
UPDATE organizations SET website_url = 'https://www.pursuitadaptivesports.org/', last_ok_at = NULL, state = 'VA', state_name = 'Virginia', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '415099c7-501d-4025-b38c-c076acb90da3' AND (website_url IS NULL OR website_url = '') AND (state IS NULL OR state = '');

-- Cincinatti Para-Swimming Open: town. Evidence: https://www.gomotionapp.com/team/czohlsc/page/meets/2026-lc-schedule--results To check: town only, with no website of its own. Annual para swim meet (event, not an org); no dedicated official site found. Evidence is the Ohio Swimming 2026 meet schedule.
UPDATE organizations SET city = 'Cincinnati', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6cc22d79-b078-442e-bf24-4a19d8f5c9c9' AND (city IS NULL OR city = '');

-- Nashville Rowing – Freedom Rows: town. Evidence: https://www.nashvillerowing.org/freedom-rows To check: town only, with no website of its own. Freedom Rows is the Nashville Rowing Club adaptive program.
UPDATE organizations SET city = 'Nashville', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a592d06a-86da-4293-83a6-c61996142f37' AND (city IS NULL OR city = '');

-- DC Fire Fighters Burn Foundation: town. Evidence: https://www.dcffburnfoundation.org/ To check: the quote does not show the town; town only, with no website of its own. 
UPDATE organizations SET city = 'Washington', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b2a57b7b-381f-45b8-aa47-ec913319af19' AND (city IS NULL OR city = '');

-- Living Spinal: town + state. Evidence: https://livingspinal.com/faq/ To check: changes the state from CA to WI; town only, with no website of its own; weaker evidence (see note). Living Spinal is a wheelchair/mobility equipment retailer, not a sports program; moved from San Diego CA to Appleton WI. State on listing (CA) is outdated. Consider removing from directory.
UPDATE organizations SET city = 'Appleton', state = 'WI', state_name = 'Wisconsin', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '11df7dec-1fe6-43e2-8841-4a2fbad0cdf2' AND (city IS NULL OR city = '') AND state = 'CA';

-- Chicago Rowing Foundation: website + town. Evidence: https://rowchicago.com/ To check: town only, with no website of its own; weaker evidence (see note). JS-rendered site; adaptive program not confirmed on homepage.
UPDATE organizations SET website_url = 'https://rowchicago.com/', last_ok_at = NULL, city = 'Chicago', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'de49ec9c-a6d8-41b3-8035-4a9a6eae035d' AND website_url = 'http://www.rowchicago.com/' AND (city IS NULL OR city = '');

-- Mics & Stripes: town. Evidence: https://www.micsandstripes.org/ To check: town only, with no website of its own. Veterans music/art org serving NYC metro.
UPDATE organizations SET city = 'New York', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '33bfc002-0ef5-57ba-b3cd-157aded59086' AND (city IS NULL OR city = '');

-- AccesSport America: website + town. Evidence: https://goaccess.org/contact/ To check: town only, with no website of its own. accessportamerica.org redirects to goaccess.org.
UPDATE organizations SET website_url = 'https://goaccess.org/', last_ok_at = NULL, city = 'Acton', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '96261081-78ae-4a03-bf1d-22a6ad1dc2c4' AND website_url = 'http://www.accessportamerica.org' AND (city IS NULL OR city = '');

-- Utah Rush - Varsity: website + town + state. Evidence: https://www.neuroworx.org/rush/ To check: the quote does not show the town; weaker evidence (see note). Run by Neuroworx (footer address Sandy, UT). Varsity is one of its NWBA junior teams.
UPDATE organizations SET website_url = 'https://www.neuroworx.org/rush/', last_ok_at = NULL, city = 'Sandy', state = 'UT', state_name = 'Utah', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd283a2f5-0d30-438b-be61-ad731e10c104' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Junior Titans - Varsity: website + town + state. Evidence: https://www.rainieradaptivesports.org/programs To check: weaker evidence (see note). Junior Titans are Rainier Adaptive Sports' junior wheelchair basketball team (South Tacoma practices). Matched via NWBA team name; moderate confidence it is the same Junior Titans.
UPDATE organizations SET website_url = 'https://www.rainieradaptivesports.org/programs', last_ok_at = NULL, city = 'Tacoma', state = 'WA', state_name = 'Washington', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ac63be8a-1f4e-499f-b602-a0192d8be106' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- STRAPS - South Texas Regional Adaptive Para Sport: website + town. Evidence: https://ymcasatx.org/hartman/morgans-sports-complex/STRAPS To check: the quote does not show the town. Same program as 'Morgan's Wonderland Sports – STRAPS'; YMCA took over operations April 2026.
UPDATE organizations SET website_url = 'https://ymcasatx.org/hartman/morgans-sports-complex/STRAPS', last_ok_at = NULL, city = 'San Antonio', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fc948191-d352-4058-8566-fd5cb3aec689' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Rancho Halos- DI: website + town + state. Evidence: https://dhs.lacounty.gov/rancho/patient-programs-and-services/wheelchair-sports-program/ To check: the quote does not show the town. Rancho Los Amigos National Rehabilitation Center is in Downey CA; town not printed on this page.
UPDATE organizations SET website_url = 'https://dhs.lacounty.gov/rancho/patient-programs-and-services/wheelchair-sports-program/', last_ok_at = NULL, city = 'Downey', state = 'CA', state_name = 'California', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '199a0274-8b51-40be-98ac-128b08024240' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- USA Powerlifting: website. Evidence: https://www.usapowerlifting.com/committees/disabled-athletes-committee To check: the website did not load cleanly from our server (blocked); weaker evidence (see note). National powerlifting federation (not a Paralympic NGB); national, town blank. Page is Cloudflare-protected from curl; content confirmed via Exa.
UPDATE organizations SET website_url = 'https://www.usapowerlifting.com/committees/disabled-athletes-committee', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '88ea80df-e926-44ab-a98e-67ed7a9e4427' AND (website_url IS NULL OR website_url = '');

-- Turnstone Center for Disabled Children and Adults, Inc.: website + town + state. Evidence: https://turnstone.org/ To check: the town is not in the city table, so it would get no distance. 
UPDATE organizations SET website_url = 'https://turnstone.org/', last_ok_at = NULL, city = 'Fort Wayne', state = 'IN', state_name = 'Indiana', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ade1358e-a44a-4966-b4e3-d6393fb44fa9' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Los Angeles County Department of Military and Veterans Affairs: town. Evidence: https://mva.lacounty.gov/veteran-peer-access-network/ To check: the quote does not show the town; town only, with no website of its own; weaker evidence (see note). LA County program, countywide; town set to Los Angeles (county seat). Page is JS/bot-protected from curl; content confirmed via Exa.
UPDATE organizations SET city = 'Los Angeles', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '86b06e50-9604-5689-8237-200c52ecac19' AND (city IS NULL OR city = '');

-- Footloose Sailing Association: website + town. Evidence: https://footloosedisabledsailing.org/daysail-events/ To check: the quote does not show the town. Sails from Leschi (Seattle); mailing address is Mercer Island.
UPDATE organizations SET website_url = 'https://footloosedisabledsailing.org/', last_ok_at = NULL, city = 'Seattle', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f0a2a04b-7d3f-44ea-837f-b9f4ecf794d6' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- CK Rolling Timberwolves: website + state. Evidence: https://www.allinahealth.org/allina-news/2024/09/new-season-and-new-coach-for-jr-rolling-timberwolves To check: weaker evidence (see note). CK = Courage Kenny Rehabilitation Institute (Allina Health), Minnesota. Town not stated on the pages checked (Twin Cities area).
UPDATE organizations SET website_url = 'https://www.allinahealth.org/courage-kenny-rehabilitation-institute/outcomes-overview/adaptive-sports-and-recreation', last_ok_at = NULL, state = 'MN', state_name = 'Minnesota', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9a982bf8-76d4-43c2-a16a-f05e1624ab13' AND (website_url IS NULL OR website_url = '') AND (state IS NULL OR state = '');

-- Charlotte Rollin' Hornets Teal: website + town + state. Evidence: https://rollinhornets.org/ To check: the website did not load cleanly from our server (dead 000); weaker evidence (see note). Site loads via Exa fetch; curl from this box fails (connection). Teal is one of its team levels.
UPDATE organizations SET website_url = 'https://rollinhornets.org/', last_ok_at = NULL, city = 'Charlotte', state = 'NC', state_name = 'North Carolina', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a438ad7e-6892-4fe9-acf4-6725074a4805' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Maryland Ravens Wheelchair Basketball: website. Evidence: https://www.marylandravens.org/about To check: weaker evidence (see note). Maryland wheelchair basketball team; current practice town not stated on pages checked (historically Baltimore).
UPDATE organizations SET website_url = 'https://www.marylandravens.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '669f6f71-805c-4275-b3f5-3340006269c2' AND (website_url IS NULL OR website_url = '');

-- Asphalt Green: town. Evidence: https://www.asphaltgreen.org/ To check: town only, with no website of its own. Sites in Manhattan and Brooklyn.
UPDATE organizations SET city = 'New York', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0027a07d-b676-42ba-9d37-d03a645c2763' AND (city IS NULL OR city = '');

-- Aspen Camp (Deaf & Hard of Hearing): website + town. Evidence: https://aspencamp.org/about/ To check: the town is not in the city table, so it would get no distance; town only, with no website of its own. Camp is near Aspen on Snowmass Creek; 'Aspen' also acceptable.
UPDATE organizations SET website_url = 'https://aspencamp.org/', last_ok_at = NULL, city = 'Snowmass', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd82ee02c-72d3-4a4f-8e2f-e1f98977e1c2' AND website_url = 'http://www.aspencamp.org' AND (city IS NULL OR city = '');

-- Southwest Wheelchair Athletic Association | SWAA: website + state. Evidence: https://www.swaasports.org/ To check: weaker evidence (see note). Regional (Texas/Southwest) events in several cities; no single town.
UPDATE organizations SET website_url = 'https://www.swaasports.org/', last_ok_at = NULL, state = 'TX', state_name = 'Texas', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7123506a-b891-4a99-983c-3423dcee773d' AND (website_url IS NULL OR website_url = '') AND (state IS NULL OR state = '');

-- Strongpoint Theinert Ranch: town. Evidence: https://www.strongpointtheinert.org/about To check: town only, with no website of its own. 
UPDATE organizations SET city = 'Magdalena', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c3c757c2-53c0-505e-b588-13ee96343b2e' AND (city IS NULL OR city = '');

-- TIRR Memorial Hermann Hotwheels: website + town + state. Evidence: https://memorialhermann.org/services/specialties/tirr/patients-visitors/adapted-sports To check: the website did not load cleanly from our server (dead 000); the quote does not show the town; weaker evidence (see note). Page bot-blocks curl; content confirmed via Exa fetch. TIRR is in Houston.
UPDATE organizations SET website_url = 'https://memorialhermann.org/services/specialties/tirr/patients-visitors/adapted-sports', last_ok_at = NULL, city = 'Houston', state = 'TX', state_name = 'Texas', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '1ee10ebc-9782-439b-81a1-28525abf1232' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Lost Creek Ranch: town. Evidence: https://www.lostcreekranchwi.org/contact.html To check: the town is not in the city table, so it would get no distance; town only, with no website of its own. Horse rescue with therapeutic riding in western Wisconsin.
UPDATE organizations SET city = 'Beldenville', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '18da00fb-835d-5e88-a89d-1af0d93b24d7' AND (city IS NULL OR city = '');

-- RHI Jr. Racers Varsity: website + town + state. Evidence: https://www.rhirehab.com/our-programs/community-reintegration/adaptive-sports-program/ To check: weaker evidence (see note). Jr. Racers are RHI's NWBA junior team (name confirmed on NWBA roster, not on RHI page).
UPDATE organizations SET website_url = 'https://www.rhirehab.com/our-programs/community-reintegration/adaptive-sports-program/', last_ok_at = NULL, city = 'Indianapolis', state = 'IN', state_name = 'Indiana', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f68c8115-0625-4044-8400-f66500f1e4c2' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- City of Fort Collins Adaptive Recreation: website + town. Evidence: https://www.fortcollins.gov/Activities/Recreation/Programs/Adaptive-Recreation-Opportunities To check: the website did not load cleanly from our server (blocked); the town is not in the city table, so it would get no distance; town only, with no website of its own. fcgov.com/aro redirects here (curl gets 403 bot block; loads in a browser).
UPDATE organizations SET website_url = 'https://www.fortcollins.gov/Activities/Recreation/Programs/Adaptive-Recreation-Opportunities', last_ok_at = NULL, city = 'Fort Collins', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a580f4bf-f3d6-4527-8ed3-f6cd477da549' AND website_url = 'http://www.fcgov.com/aro' AND (city IS NULL OR city = '');

-- Milwaukee Bucks Wheelchair Basketball Association: website + town. Evidence: https://www.wasa.org/wheelchair-basketball To check: weaker evidence (see note). Listed website was WASA's Facebook page. WASA's own site runs the wheelchair basketball program (teams incl. Junior Bucks); WASA office is in Brookfield, WI. The old wisconsinadaptivesports.org domain now redirects to an
UPDATE organizations SET website_url = 'https://www.wasa.org/wheelchair-basketball', last_ok_at = NULL, city = 'Milwaukee', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '216f7391-6648-4589-a573-166902ae2bdc' AND website_url = 'https://www.facebook.com/wisconsinadaptivesports/' AND (city IS NULL OR city = '');

-- Golden State Road Warriors: website. Evidence: https://www.goldenstateroadwarriors.com/about To check: town only, with no website of its own; weaker evidence (see note). Site loads but names no home town. Outside sources (Pioneer/East Bay student paper, Silicon Valley Voice) say the team practices at Mission College in Santa Clara and earlier Cal State East Bay in Hayward; SF Bay Area te
UPDATE organizations SET website_url = 'https://www.goldenstateroadwarriors.com/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'bf382eb5-be37-4b3a-a2d5-13c8ed46ee3d' AND website_url = 'http://www.goldenstateroadwarriors.com';

-- Mary Free Bed Jr Pacers - Prep: website + town + state. Evidence: https://www.maryfreebed.com/jr-pacers-wheelchair-basketball-2009-midwest-conference-champs/ To check: the quote does not show the town. Youth wheelchair basketball team of Mary Free Bed Wheelchair & Adaptive Sports (Grand Rapids). Mary Free Bed's brochure lists practices at the Mary Free Bed YMCA in Grand Rapids. Program page is the hospital's adaptive s
UPDATE organizations SET website_url = 'https://www.maryfreebed.com/specialties/wheelchair-adaptive-sports/', last_ok_at = NULL, city = 'Grand Rapids', state = 'MI', state_name = 'Michigan', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f1c54cf4-830b-4521-9f18-3de099d66f50' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Rolling Heat Prep: website + town + state. Evidence: https://www.sf-ymca.net/ To check: weaker evidence (see note). YMCA prep-level youth wheelchair basketball program (ages 8-14), NWBA registered.
UPDATE organizations SET website_url = 'https://www.sf-ymca.net/wheelchair-basketball', last_ok_at = NULL, city = 'Champaign', state = 'IL', state_name = 'Illinois', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd002f50c-e12f-44a3-a1c6-8ef81a542166' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Archie Foundation for Therapeutic Horsemanship: town. Evidence: https://www.guidestar.org/profile/82-4110189 To check: the town is not in the city table, so it would get no distance; weaker evidence (see note). Own site loads but names no town; GuideStar profile (linking the same site) gives Purdon, TX.
UPDATE organizations SET city = 'Purdon', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '90a004d3-cccd-53dc-9e71-50b466c89e8d' AND (city IS NULL OR city = '');

-- HOPE Network – Pittsburgh: town. Evidence: https://www.guidestar.org/profile/23-2898628 To check: town only, with no website of its own; weaker evidence (see note). Listed website is Facebook. No own website found (hopenetwork.org is an unrelated Michigan nonprofit). USOPC listing says it serves Southwestern Pennsylvania.
UPDATE organizations SET city = 'Pittsburgh', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '24988bae-93c1-433c-8bbf-6d68bc4cbfac' AND (city IS NULL OR city = '');

-- SoCal Soaring Academy: website + town. Evidence: https://soaringacademy.org/flight-school To check: the town is not in the city table, so it would get no distance. Glider flight school with monthly veteran soaring events; flies at Crystalaire Airport, Llano (mailing address is Valencia).
UPDATE organizations SET website_url = 'https://soaringacademy.org/', last_ok_at = NULL, city = 'Llano', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'cf84e69f-14ed-432b-8833-b6f5f0755ba7' AND website_url = 'http://www.soaringacademy.org/' AND (city IS NULL OR city = '');

-- Wichita Kansas Park and Recreation Department: website + town. Evidence: https://www.wichita.gov/ParkandRec To check: the website did not load cleanly from our server (blocked); weaker evidence (see note). City site blocks curl/WebFetch (Cloudflare 403); page text confirmed via Exa fetch. Adaptive offering found on city site: Miracle League of Wichita (wichita.gov/462/Miracle-League-of-Wichita). Separate nonprofit Wichita 
UPDATE organizations SET website_url = 'https://www.wichita.gov/ParkandRec', last_ok_at = NULL, city = 'Wichita', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '783a6b2e-d81b-4e37-94aa-d3e4f09f6ed0' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Special Olympics Delaware: website + town. Evidence: https://sode.org/ To check: the website did not load cleanly from our server (blocked); weaker evidence (see note). Statewide program; office in Newark. (Site rate-limits curl; confirmed via WebFetch.)
UPDATE organizations SET website_url = 'https://sode.org/', last_ok_at = NULL, city = 'Newark', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'bda09346-1626-4e69-882b-1090bd8d9623' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Show Me Shooting Sports: website + town + state. Evidence: https://www.showmeshootingsports.org/new-page-1 To check: weaker evidence (see note). Archery/air rifle club, adaptive athletes welcome; started 2024. Listing state was blank; KC metro (MO per name/Move United listing, not stated on the page).
UPDATE organizations SET website_url = 'https://www.showmeshootingsports.org/', last_ok_at = NULL, city = 'Kansas City', state = 'MO', state_name = 'Missouri', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ca19c914-3fbe-4fb1-8533-f3cca61cfb34' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Swim Angelfish: website. Evidence: https://swimangelfish.com/ To check: weaker evidence (see note). Adaptive swim network with multiple locations plus a national instructor directory; no single town. Town blank.
UPDATE organizations SET website_url = 'https://swimangelfish.com/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7399d379-6bec-4905-a4f5-6a28e799adb1' AND (website_url IS NULL OR website_url = '');

-- Visually Impaired and Blind Skiers of the Colorado Springs Community: town. Evidence: https://paracor.org/VIBeS To check: the quote does not show the town; town only, with no website of its own; weaker evidence (see note). No own website found; only a Paracor profile page (directory-type) and 2017 Gazette coverage. Colorado Springs comes from the name and those sources.
UPDATE organizations SET city = 'Colorado Springs', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5a782dd3-bf88-4f76-88b2-34cf8a0048c7' AND (city IS NULL OR city = '');

-- CK Rolling Rowdies: website + state. Evidence: https://account.allinahealth.org/events/54940 To check: weaker evidence (see note). CK = Courage Kenny Rehabilitation Institute (Allina Health); Rolling Rowdies is its prep team (ages 8-14) per Allina's team fundraising page. Practice town not stated on the pages read, so town blank. Listing state was b
UPDATE organizations SET website_url = 'https://account.allinahealth.org/events/54940', last_ok_at = NULL, state = 'MN', state_name = 'Minnesota', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '329d1219-f9d0-4140-8073-e81a18097b0d' AND (website_url IS NULL OR website_url = '') AND (state IS NULL OR state = '');

-- New York City Department of Parks & Recreation: website + town. Evidence: https://www.nycgovparks.org/events/adaptive-programs To check: the website did not load cleanly from our server (dead 405); the quote does not show the town; weaker evidence (see note). City agency page; site blocks curl (human verification); text confirmed via Exa fetch. Adaptive hubs in each borough.
UPDATE organizations SET website_url = 'https://www.nycgovparks.org/events/adaptive-programs', last_ok_at = NULL, city = 'New York', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7720e62e-397a-4824-b7b5-7e162014b34a' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Casa Colina Hospital and Centers for Healthcare: website + town + state. Evidence: https://www.casacolina.org/programs-services/community-services/outdoor-adventures-and-wheelchair-sports/ To check: the website did not load cleanly from our server (blocked). Casa Colina site blocks curl (Cloudflare); page and Pomona location seen via search index of the same site. Listing state was blank.
UPDATE organizations SET website_url = 'https://www.casacolina.org/programs-services/community-services/outdoor-adventures-and-wheelchair-sports/', last_ok_at = NULL, city = 'Pomona', state = 'CA', state_name = 'California', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '1effb76d-7d80-4cca-9f51-41c80133b152' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- San Diego Sharp – USA Wheelchair Rugby: town. Evidence: https://timesofsandiego.com/sports/2017/11/18/murderball-on-the-muni-gym-express-ferocious-photos-of-quad-rugby/ To check: town only, with no website of its own; weaker evidence (see note). Listed site is Facebook (facebook.com/SharpEdgeRugby). No Sharp HealthCare page for the team found. Town from 2017 local news; USWRA roster shows the team active in 2021-22. Plays at Balboa Park Municipal Gym.
UPDATE organizations SET city = 'San Diego', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a0b72f24-fed3-4c56-b86b-cef2033b3f68' AND (city IS NULL OR city = '');

-- Challenged Athletes of West Virginia – Mountaineer: website + town. Evidence: https://cawvsports.org/ To check: the town is not in the city table, so it would get no distance. Programs at Snowshoe Mountain (Silver Creek); site redirects to cawvsports.org.
UPDATE organizations SET website_url = 'https://cawvsports.org/', last_ok_at = NULL, city = 'Snowshoe', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0570c6ef-5821-4693-b576-522f16f9a4e4' AND website_url = 'http://www.cawvsports.org/' AND (city IS NULL OR city = '');

-- Team River Runner – Ft. Belvoir: town. Evidence: https://www.teamriverrunner.org/get-involved/chapters/virginia-fort-belvoir/ To check: the town is not in the city table, so it would get no distance; the quote does not show the town. Chapter also has its own site trrftbelvoir.org (not verified).
UPDATE organizations SET city = 'Fort Belvoir', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c58043de-aad0-4afb-9082-64c805f0178a' AND (city IS NULL OR city = '');

-- Freedom Golf Association: town. Evidence: https://secure.processdonation.org/Fgagolf/Donation.aspx To check: town only, with no website of its own; weaker evidence (see note). Listed site is Facebook. WARNING: former official domain fgagolf.org now redirects to an Indonesian gambling site, do not use. Town from FGA's own donation page (third-party processor). Clinics run at partner courses acr
UPDATE organizations SET city = 'Burr Ridge', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9df9746f-4a4e-4422-ba92-2ea4232874b6' AND (city IS NULL OR city = '');

-- Community Rowing Inc Adaptive: website + town + state. Evidence: https://communityrowing.org/para/ To check: the town is not in the city table, so it would get no distance. Harry Parker Boathouse, Brighton (Boston), MA.
UPDATE organizations SET website_url = 'https://communityrowing.org/para/', last_ok_at = NULL, city = 'Brighton', state = 'MA', state_name = 'Massachusetts', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '54721bda-6abd-478f-9edf-3c3f66e52884' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- CSULB Flying Wheels: town + state. Evidence: https://www.nwba.org/page/show/9145308-csulb-flying-wheels To check: the quote does not show the town; town only, with no website of its own; weaker evidence (see note). NWBA Division III team for 2025-26 (NWBA team page is a directory, not a website). No CSULB page for the team found. Town inferred from CSULB = California State University, Long Beach.
UPDATE organizations SET city = 'Long Beach', state = 'CA', state_name = 'California', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6ac6a373-0c58-4b2c-beda-4882146d1826' AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Team River Runner Johnson City and TriCities area of NE Tennessee: website + town. Evidence: http://www.teamriverrunner.org/get-involved/chapters/tennessee-johnson-citytricities-northern-tn/ To check: the quote does not show the town. TRR national chapter page (chapter of a national network).
UPDATE organizations SET website_url = 'http://www.teamriverrunner.org/get-involved/chapters/tennessee-johnson-citytricities-northern-tn/', last_ok_at = NULL, city = 'Johnson City', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '797c2b73-afd1-4a89-97e6-6b40c9e0790f' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Veterans Writing Workshop: town. Evidence: https://veteranswritingworkshop.org/index.html To check: the quote does not show the town. Serves NYC metro area; town given as New York.
UPDATE programs SET city = 'New York', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'bf767fe2-bf73-561e-9afc-643faab65733' AND (city IS NULL OR city = '');

-- DASA Rolling Rams - Prep: website + town + state. Evidence: https://www.dasasports.org/competitive-team-sports/wheelchair-basketball To check: weaker evidence (see note). Prep is the NWBA youth division team of the DASA Rolling Rams. Greater St. Louis area.
UPDATE organizations SET website_url = 'https://www.dasasports.org/competitive-team-sports/wheelchair-basketball', last_ok_at = NULL, city = 'St. Louis', state = 'MO', state_name = 'Missouri', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3224b00f-2f49-4eb0-99dc-1c2916e14abf' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Swim Strong Foundation: website + town + state. Evidence: https://www.swimstrongfoundation.org/ To check: the quote does not show the town. Classes at several NYC sites (Brooklyn and Queens). Has an Adaptive Program page.
UPDATE organizations SET website_url = 'https://www.swimstrongfoundation.org/shop/classes/adaptive-program/', last_ok_at = NULL, city = 'New York', state = 'NY', state_name = 'New York', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '43cbc9c5-6927-42a4-a4e5-99d81877553f' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Fayetteville-Cumberland Parks and Recreation Department: website + town. Evidence: https://www.fayettevillenc.gov/Parks-and-Recreation/Facilities/Recreation-Centers/Dorothy-D.-Gilmore-Adaptive-Recreation-Center To check: the website did not load cleanly from our server (blocked). Page blocks curl (403), loads via fetch tool. Gilmore Center offers recreation programs to persons with disabilities.
UPDATE organizations SET website_url = 'https://www.fayettevillenc.gov/Parks-and-Recreation/Facilities/Recreation-Centers/Dorothy-D.-Gilmore-Adaptive-Recreation-Center', last_ok_at = NULL, city = 'Fayetteville', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '213c0213-11ef-4278-8d2b-56260bca0196' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- World Wheelchair Sports: town. Evidence: https://www.guidestar.org/profile/94-3151224 To check: town only, with no website of its own; weaker evidence (see note). Own site worldwheelchairsports.com does not load (502/no response). Town from GuideStar (directory) only.
UPDATE organizations SET city = 'Eugene', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '803cf363-86d9-46a4-9bf9-2788a84f4a3e' AND (city IS NULL OR city = '');

-- Adaptive Sports Ohio-Prep: website + town + state. Evidence: https://adaptivesportsohio.org/2026/03/24/adaptive-sports-ohios-junior-cavaliers-win-national-invitational-championship/ To check: the quote does not show the town; weaker evidence (see note). Prep is the NWBA youth division team. Adaptive Sports Ohio HQ is Wooster; youth wheelchair basketball is Cleveland-based (quote: 'bring the team’s first NWBA Junior Championship back home to Cleveland').
UPDATE organizations SET website_url = 'https://adaptivesportsohio.org/community-based-sports/', last_ok_at = NULL, city = 'Cleveland', state = 'OH', state_name = 'Ohio', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '42f93b6d-3820-4c9a-8f4d-daf356981297' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- All Season Adaptive Sports: website + town + state. Evidence: https://www.allseasonadaptivesports.com/ To check: the town is not in the city table, so it would get no distance; the quote does not show the town. At Ski Apache near Ruidoso; site footer lists Alto, NM. Town could also be given as Ruidoso.
UPDATE organizations SET website_url = 'https://www.allseasonadaptivesports.com/', last_ok_at = NULL, city = 'Alto', state = 'NM', state_name = 'New Mexico', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0e959560-5611-43ce-8f3d-22d3db2566fc' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- SoCal Power Soccer, Glendale: town. Evidence: https://powerhub.powersoccerusa.org/teams/1ce1ee77-3e2f-4162-9c9c-b7344f0549fe To check: town only, with no website of its own; weaker evidence (see note). Listed site is Facebook (facebook.com/SoCalVaqueros). No own site found. Town from US Power Soccer Association team page (governing-body listing), which says Burbank, not Glendale. Listing name says Glendale; Glendale ho
UPDATE organizations SET city = 'Burbank', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8e940e24-2b86-4194-b746-2bcd792d786d' AND (city IS NULL OR city = '');

-- Universal Access Program – Statewide: website. Evidence: https://www.mass.gov/orgs/universal-access-program To check: the website did not load cleanly from our server (blocked). Statewide program in Massachusetts state parks; no single town. Old URL 403s; current page is mass.gov/orgs/universal-access-program (403 to curl, loads via fetch tool).
UPDATE programs SET website_url = 'https://www.mass.gov/orgs/universal-access-program', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c99c6f55-ad7f-40d8-b43b-3681145918e3' AND website_url = 'http://www.mass.gov/eea/agencies/dcr/massparks/accessibility/';

-- Michigan Rollverines Varsity: town + state. Evidence: https://www.michiganmedicine.org/health-lab/unleashing-beast To check: the quote does not show the town; town only, with no website of its own; weaker evidence (see note). No dedicated program page found. Evidence is a Michigan Medicine (U-M Health) story; town Ann Arbor per U-M and local news (mlive, Ann Arbor). Varsity is an NWBA junior division team. Page blocks curl, loads via fetch to
UPDATE organizations SET city = 'Ann Arbor', state = 'MI', state_name = 'Michigan', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4b83c050-6dcd-4f14-ae45-49f97ee98332' AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Providence Saints DIII: website + town + state. Evidence: https://www.providence.org/locations/wa/st-lukes/sports-and-recreation-programs To check: weaker evidence (see note). DIII is the NWBA division; team is part of Providence St. Luke's Rehabilitation Medical Center in Spokane.
UPDATE organizations SET website_url = 'https://www.providence.org/locations/wa/st-lukes/sports-and-recreation-programs', last_ok_at = NULL, city = 'Spokane', state = 'WA', state_name = 'Washington', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'dc1dda73-b240-44e3-9ef8-7051794fd396' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- BCRollingBlazers: website + town + state. Evidence: https://www.bridgecityinclusive.com/rose-city-invitational To check: weaker evidence (see note). BCRollingBlazers = Bridge City Rolling Blazers, a program of Bridge City Inclusive Sports. Town quote is from its hosted tournament page; local news also places the team in Portland, OR.
UPDATE organizations SET website_url = 'https://www.bridgecityinclusive.com/wheelchair-basketball', last_ok_at = NULL, city = 'Portland', state = 'OR', state_name = 'Oregon', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8c3d5bb4-00b0-4f33-bb7c-3e0661c05c59' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Gateway Games: website + town. Evidence: https://moveunitedsport.org/event/2026-gateway-games-in-partnership-with-the-hartford/ To check: the quote does not show the town. Annual competition hosted by Disabled Athlete Sports Association (dasasports.org). Evidence page is Move United's event page (a national network page); consider dasasports.org as website.
UPDATE organizations SET website_url = 'https://moveunitedsport.org/event/2026-gateway-games-in-partnership-with-the-hartford/', last_ok_at = NULL, city = 'St. Louis', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c502e206-dad4-4a2a-840c-3db9888c7792' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Incight: website + town + state. Evidence: https://www.incight.org/about To check: changes the state from CA to OR. STATE MISMATCH: listing says CA but INCIGHT is based in Portland, Oregon. Also note it is a disability employment/education org, not a sports program.
UPDATE organizations SET website_url = 'https://www.incight.org/', last_ok_at = NULL, city = 'Portland', state = 'OR', state_name = 'Oregon', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '20d78885-54c6-4266-bcef-f30b277788ee' AND website_url = 'http://www.incight.org' AND (city IS NULL OR city = '') AND state = 'CA';

-- Mary Free Bed Jr Pacers - Varsity: website + town + state. Evidence: https://maryfreebed.app.neoncrm.com/np/clients/maryfreebed/eventList.jsp To check: the quote does not show the town. Mary Free Bed Wheelchair and Adaptive Sports, Grand Rapids. Evidence is Mary Free Bed's own registration page; the main sports page names Grand Rapids.
UPDATE organizations SET website_url = 'https://www.maryfreebed.com/specialties/wheelchair-adaptive-sports/', last_ok_at = NULL, city = 'Grand Rapids', state = 'MI', state_name = 'Michigan', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '339c06a6-af7c-479a-8520-b1c02845bcee' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Women's Support Groups: town. Evidence: https://www.va.gov/white-river-junction-health-care/events/ To check: the quote does not show the town. Not a sports program; VA social group listed on events page of White River Junction VA Healthcare System.
UPDATE programs SET city = 'White River Junction', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c1d010f4-7381-50db-b530-a6efb4ffa567' AND (city IS NULL OR city = '');

-- Charlotte Prep - Purple: website + town + state. Evidence: http://rollinhornets.org/ To check: weaker evidence (see note). 'Charlotte Prep - Purple' is the NWBA name of a Rollin' Hornets prep team (NWBA lists 'Charlotte Rollin' Hornets Purp'). Greater Charlotte area.
UPDATE organizations SET website_url = 'http://rollinhornets.org/', last_ok_at = NULL, city = 'Charlotte', state = 'NC', state_name = 'North Carolina', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ea3308c1-2183-4da8-b377-49054e3f0433' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Far West Wheelchair Athletic Association: website. Evidence: https://fwwaa.sportngin.com/ To check: weaker evidence (see note). Regional (Northern California) org; site is its own SportsEngine site. Old domain fwwaa.org now redirects to an unrelated Google Form, do not use. Nonprofit listings place it in San Jose, not confirmed on its own site.
UPDATE organizations SET website_url = 'https://fwwaa.sportngin.com/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2f9f1dbf-7667-4baf-910a-71ddae68027f' AND (website_url IS NULL OR website_url = '');

-- Ability360 Phoenix - Varsity: website + town + state. Evidence: https://ability360.org/youth-wheelchair-basketball/ To check: the website did not load cleanly from our server (dead 404); weaker evidence (see note). Page 403s to curl, loads via fetch tool. Varsity is an NWBA junior division team.
UPDATE organizations SET website_url = 'https://ability360.org/youth-wheelchair-basketball/', last_ok_at = NULL, city = 'Phoenix', state = 'AZ', state_name = 'Arizona', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c63a5cfa-ce1b-44f1-99c1-16b15dda1910' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Veteran Art Therapy: website. Evidence: https://www.veteranarttherapy.org/ To check: the website did not load cleanly from our server (dead 000); weaker evidence (see note). Listed linktr.ee 406s; own site veteranarttherapy.org loads via fetch tool (curl fails). No town found; Texas statewide focus. Art therapy, not sports.
UPDATE organizations SET website_url = 'https://www.veteranarttherapy.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '1b2aa7f6-21ac-5331-afb1-6d997243f586' AND website_url = 'https://linktr.ee/veteranarttherapy';

-- Wheels to Water: website + town. Evidence: https://paracor.org/wheelstowater To check: weaker evidence (see note). Own site wheelstowater.com loads (names the org) but shows no town; town from Paracor listing page (a directory). Treat town as lower confidence.
UPDATE organizations SET website_url = 'https://wheelstowater.com/', last_ok_at = NULL, city = 'Los Angeles', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7de17c82-9a03-4d55-85be-ed8d1b203947' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Turnstone Center – Fort Wayne: website + town. Evidence: https://turnstone.org/ To check: the town is not in the city table, so it would get no distance. Turnstone Center for Children and Adults with Disabilities, Fort Wayne.
UPDATE organizations SET website_url = 'https://turnstone.org/', last_ok_at = NULL, city = 'Fort Wayne', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f3450faa-b58f-471b-b8b3-3162641878c7' AND website_url = 'http://www.turnstone.org' AND (city IS NULL OR city = '');

-- Moving Forward Adaptive Sports: town. Evidence: https://dailyinterlake.com/news/2019/aug/11/marine-partners-with-nonprofit-for-adaptive-6/ To check: town only, with no website of its own; weaker evidence (see note). Listed site neverstoprocking.com is an empty server index (no content). Only a Facebook page found. Town from local news (Flathead Valley: Kalispell / Lakeside / Whitefish). Lower confidence; check activity.
UPDATE organizations SET city = 'Kalispell', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c1fa9d32-2a99-4e4c-b563-81b2b3643876' AND (city IS NULL OR city = '');

-- UCO Endeavor Games: website + town. Evidence: https://www.endeavorgames.org/ To check: the website did not load cleanly from our server (dead 000); the quote does not show the town. Annual event, Edmond, OK (page heading 'Edmond, OK'). Curl fails; loads via fetch tool.
UPDATE organizations SET website_url = 'https://www.endeavorgames.org/edmond/', last_ok_at = NULL, city = 'Edmond', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2c4f2631-87d6-49c4-a0e5-ed121b66a14c' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- LA Kings Sled Hockey: website + town. Evidence: https://www.lakingssledhockey.com/ To check: weaker evidence (see note). Listed site was Facebook; own site lakingssledhockey.com. Practices at Riverside Ice Town; serves Southern California.
UPDATE organizations SET website_url = 'https://www.lakingssledhockey.com/', last_ok_at = NULL, city = 'Riverside', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a55571ac-6240-4158-956f-b5e0f61899f8' AND website_url = 'https://www.facebook.com/LAKingsSledHockey/' AND (city IS NULL OR city = '');

-- Charlotte Rollin Bobcats: website + town. Evidence: http://rollinhornets.org/ To check: weaker evidence (see note). Listed WordPress site (rollinbobcats.wordpress.com) last posted 2011; the program now runs as the Charlotte Rollin' Hornets (Bobcats NBA team renamed Hornets). Rename inferred from same city/program and formation history
UPDATE organizations SET website_url = 'http://rollinhornets.org/', last_ok_at = NULL, city = 'Charlotte', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'dbe02551-b113-4ed6-b507-adc37abaa1fe' AND website_url = 'https://rollinbobcats.wordpress.com/' AND (city IS NULL OR city = '');

-- University of Central Oklahoma Endeavor Games: website + town + state. Evidence: https://www.endeavorgames.org/ To check: the website did not load cleanly from our server (dead 000); the quote does not show the town. Duplicate of the 'UCO Endeavor Games' listing.
UPDATE organizations SET website_url = 'https://www.endeavorgames.org/edmond/', last_ok_at = NULL, city = 'Edmond', state = 'OK', state_name = 'Oklahoma', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '410168ad-9713-471f-a743-f95d1e210c13' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Community Rowing, Inc. – Boston: website + town. Evidence: https://communityrowing.org/para/ To check: the town is not in the city table, so it would get no distance. Para program at the Harry Parker Boathouse, Brighton neighborhood of Boston. Listed URL redirects to /para/.
UPDATE organizations SET website_url = 'https://communityrowing.org/para/', last_ok_at = NULL, city = 'Brighton', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c54340a0-6578-49a0-8961-69d415071253' AND website_url = 'https://www.communityrowing.org/programs/para-program' AND (city IS NULL OR city = '');

-- Plantation Community Tennis Corporation: town. Evidence:  To check: the quote does not show the town; town only, with no website of its own; weaker evidence (see note). Runs the Plantation Adaptive Tennis Program (wheelchair tennis) at the Frank Veltri Tennis Center, Plantation Central Park, per USTA Florida and search results. Its old site plantationtennis.org is now an unrelated Indon
UPDATE organizations SET city = 'Plantation', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4c893491-e0a8-4d28-9d2a-b56edc8267d5' AND (city IS NULL OR city = '');

-- Cottage Rehabilitation Hospital: town. Evidence:  To check: the quote does not show the town; town only, with no website of its own; weaker evidence (see note). cottagehealth.org returns 403 Access Denied to automated fetch (curl and WebFetch), so no on-page quote. Cottage Rehabilitation Hospital is Cottage Health's rehab hospital in Santa Barbara; confirm by eye before publishi
UPDATE organizations SET city = 'Santa Barbara', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'baa93a64-8691-4551-ba99-ee7f401080f7' AND (city IS NULL OR city = '');

-- Utah Foundation for the Blind and Visually Impaired: website + town. Evidence: https://www.ufbvi.org/ To check: weaker evidence (see note). Serves blind children/youth statewide; goalball program. Quote confirmed via WebFetch (page footer).
UPDATE organizations SET website_url = 'https://www.ufbvi.org/', last_ok_at = NULL, city = 'Riverton', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b1f58021-8eba-4e6b-8702-b5b4be509d21' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Bullets and Bandaids: town + state. Evidence: https://bulletsandbandaids.org/contact/ To check: changes the state from NC to SC. State mismatch: listing says NC but the organization's contact page gives Columbia, SC. Veteran/art storytelling nonprofit, not a sports program.
UPDATE organizations SET city = 'Columbia', state = 'SC', state_name = 'South Carolina', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f470ccd9-8268-5d9a-a5a6-5a0c33bcd0d3' AND (city IS NULL OR city = '') AND state = 'NC';

-- Seattle Sonics: website + town + state. Evidence: https://www.seattleadaptivesports.org/our-programs/wheelchair-basketball/ To check: weaker evidence (see note). Adult NWBA team of Seattle Adaptive Sports; drop-in practice at a Seattle community center.
UPDATE organizations SET website_url = 'https://www.seattleadaptivesports.org/our-programs/wheelchair-basketball/', last_ok_at = NULL, city = 'Seattle', state = 'WA', state_name = 'Washington', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '77b89e9d-dbfa-4045-a406-6a8200e0ceed' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Team River Runner – Asheville: town. Evidence: https://www.teamriverrunner.org/get-involved/chapters/north-carolina-asheville/ To check: the quote does not show the town. Page spells it 'Ashville'.
UPDATE organizations SET city = 'Asheville', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '84ba75d8-dd4f-4c43-bd62-8e9fa2c7ad3e' AND (city IS NULL OR city = '');

-- Louisville Lightning: website + town + state. Evidence: https://sites.google.com/jefferson.kyschools.us/athletic-directors/adapted-sports-program To check: weaker evidence (see note). Jefferson County Public Schools adapted sports team (wheelchair basketball, NWBA junior).
UPDATE organizations SET website_url = 'https://sites.google.com/jefferson.kyschools.us/athletic-directors/adapted-sports-program', last_ok_at = NULL, city = 'Louisville', state = 'KY', state_name = 'Kentucky', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7365f469-cf91-41e1-9ecd-78e601478442' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Florida Department of Veterans' Affairs (FDVA): town. Evidence: https://floridavets.org/locations/fdva-offices/ To check: the quote does not show the town; weaker evidence (see note). State agency serving all of Florida; HQ in Largo (also Tallahassee office). floridavets.org blocks curl (403); page content confirmed via Exa page fetch. Statewide, so town could be left blank. Not a sports program.
UPDATE organizations SET city = 'Largo', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '91dd0d6e-e9c4-5485-a50d-f87e80a7f1d9' AND (city IS NULL OR city = '');

-- Rocket City Rockets: website + town + state. Evidence: https://rocketcityadaptedathletics.org/join To check: weaker evidence (see note). Junior Prep NWBA team of Rocket City Adapted Athletics.
UPDATE organizations SET website_url = 'https://rocketcityadaptedathletics.org/join', last_ok_at = NULL, city = 'Huntsville', state = 'AL', state_name = 'Alabama', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd3857d47-dc62-4487-89b6-639a00c3461a' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Magee Spokesmen: website + town + state. Evidence:  To check: the quote does not show the town; town only, with no website of its own; weaker evidence (see note). Jefferson Health wheelchair sports page loads (200) but content renders by script, so no on-page quote. Spokesmen are Magee Rehabilitation's (Jefferson) NWBA team in Philadelphia per Jefferson Health patient story in sea
UPDATE organizations SET website_url = 'https://www.jeffersonhealth.org/clinical-specialties/rehabilitation-medicine/specialty-rehabilitation-services/wheelchair-sports', last_ok_at = NULL, city = 'Philadelphia', state = 'PA', state_name = 'Pennsylvania', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5b328b8b-248e-41a1-99c1-ba5401ffb739' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- The Kyle Pease Foundation: website + town + state. Evidence: https://kylepeasefoundation.org/contact To check: weaker evidence (see note). Quote via WebFetch of contact page. Also runs KPF Utah and North Georgia events.
UPDATE organizations SET website_url = 'https://kylepeasefoundation.org/', last_ok_at = NULL, city = 'Atlanta', state = 'GA', state_name = 'Georgia', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '00676d0d-aa42-456d-93a7-95c20288fa90' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Atlanta Sparks: town. Evidence: https://www.specialhockey.org/page/show/9511330-atlanta-sparks To check: town only, with no website of its own; weaker evidence (see note). Evidence is the American Special Hockey Association team page (a network directory). Team's own atlantasparks.com now hosts unrelated blog/spam content.
UPDATE organizations SET city = 'Alpharetta', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '758fe025-1f75-4ea1-ba32-466125fc451f' AND (city IS NULL OR city = '');

-- Adaptive Sports USA: website + town. Evidence: https://www.adaptivesports.org/about-us/contact To check: weaker evidence (see note). NAME MISMATCH: the listed website adaptivesports.org is the Adaptive Sports Center of Crested Butte, not 'Adaptive Sports USA' (a national governing body; adaptivesportsusa.org did not resolve). Likely a mis-merged listi
UPDATE organizations SET website_url = 'https://www.adaptivesports.org/', last_ok_at = NULL, city = 'Crested Butte', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e9c6e875-44fd-4b28-90cd-f4fe5b7a3fd7' AND website_url = 'http://www.adaptivesports.org' AND (city IS NULL OR city = '');

-- Wichita Adaptive Sports INC | WAS: website + town + state. Evidence: https://www.wichitaadaptivesports.org/ To check: the website did not load cleanly from our server (blocked); the quote does not show the town. Both .com (current Wix site) and .org load. '| WAS' is the acronym.
UPDATE organizations SET website_url = 'https://www.wichitaadaptivesports.com/', last_ok_at = NULL, city = 'Wichita', state = 'KS', state_name = 'Kansas', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd784be43-82ba-4c1e-985c-c0b0ee23665d' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Atlanta Sparks Hockey: town. Evidence: https://www.specialhockey.org/page/show/9511330-atlanta-sparks To check: town only, with no website of its own; weaker evidence (see note). Listed Facebook page only; atlantasparks.com now unrelated spam blog. Evidence from ASHA team page (directory). Same team as the 'Atlanta Sparks' org listing (possible duplicate).
UPDATE organizations SET city = 'Alpharetta', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a1c5a14c-488d-40e5-a697-202f66a6807e' AND (city IS NULL OR city = '');

-- Utica Curling Club: website + town. Evidence: https://www.sitrin.com/adaptivesports/curling/ To check: the quote does not show the town. uticacurlingclub.com redirects to a Google Sites page. Club facility on Clark Mills Rd, Whitesboro (Utica area) per county tourism listing; wheelchair curling run with Sitrin STARS program. Town quote not on club page.
UPDATE organizations SET website_url = 'https://sites.google.com/uticacurlingclub.org/uticacurlingclub', last_ok_at = NULL, city = 'Whitesboro', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7813d09c-6240-409a-b456-16b8974e6339' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- ATX - JV: website + town + state. Evidence: https://atxabilities.com/ To check: weaker evidence (see note). ATX JV is the junior varsity NWBA team of ATX Abilities, Austin wheelchair sports.
UPDATE organizations SET website_url = 'https://atxabilities.com/', last_ok_at = NULL, city = 'Austin', state = 'TX', state_name = 'Texas', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8708198e-c91b-4c68-b79f-e849b8f4ca7d' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Greenville Health System: website + town. Evidence: https://prismahealth.org/locations/ambulatory-labs-other/rcp-rehabilitation-unity-park To check: weaker evidence (see note). Greenville Health System is now Prisma Health. Page renders by script; quote confirmed via Exa page fetch.
UPDATE organizations SET website_url = 'https://prismahealth.org/locations/ambulatory-labs-other/rcp-rehabilitation-unity-park', last_ok_at = NULL, city = 'Greenville', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '008964d8-8d83-498d-8226-7b1db5e16b70' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Brooks Bullsharks: website + town + state. Evidence: https://brooksadaptivesports.org/ To check: weaker evidence (see note). Bullsharks are Brooks Rehabilitation's NWBA youth wheelchair basketball team in Jacksonville.
UPDATE organizations SET website_url = 'https://brooksadaptivesports.org/', last_ok_at = NULL, city = 'Jacksonville', state = 'FL', state_name = 'Florida', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '91403141-8a29-459f-8327-7c170803e8c5' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Triad Trackers: town. Evidence: https://sicilnc.org/event/wheelchair-basketball-at-hanes-hosiery-community-center-24/ To check: the quote does not show the town; town only, with no website of its own; weaker evidence (see note). No own website found (NWBA team pages and news only). Partner event page shows clinics at Hanes Hosiery Community Center with Winston-Salem Recreation & Parks.
UPDATE organizations SET city = 'Winston-Salem', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9c00d202-f597-4ce2-a39f-dcf245e15cf0' AND (city IS NULL OR city = '');

-- Columbus Knights - DIII: website + town + state. Evidence: https://columbusrecparks.com/wellness/athletics/basketball/wheelchair-basketball/ To check: weaker evidence (see note). City of Columbus, Ohio program; DIII is the NWBA division.
UPDATE organizations SET website_url = 'https://columbusrecparks.com/wellness/athletics/basketball/wheelchair-basketball/', last_ok_at = NULL, city = 'Columbus', state = 'OH', state_name = 'Ohio', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b82d5547-e84a-4d8f-952a-f768e89648c4' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Charlotte Rollin' Hornets - Varsity: website + town + state. Evidence: https://rollinhornets.org/ To check: the website did not load cleanly from our server (dead 000). Site loads but its TLS certificate has expired (browsers will warn). Varsity is the junior varsity team.
UPDATE organizations SET website_url = 'https://rollinhornets.org/', last_ok_at = NULL, city = 'Charlotte', state = 'NC', state_name = 'North Carolina', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '50713f8a-7d0c-4be6-b326-d3d2450308e9' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- GLASA Varsity: website + town + state. Evidence: https://glasa.org/sports-programs/ To check: weaker evidence (see note). 'GLASA Varsity' is GLASA's NWBA junior varsity wheelchair basketball team.
UPDATE organizations SET website_url = 'https://glasa.org/sports-programs/', last_ok_at = NULL, city = 'Lake Forest', state = 'IL', state_name = 'Illinois', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c8aa08e8-d950-44f7-a845-b1513f56a264' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- KC Kings Varsity: website + town + state. Evidence: https://www.midwestadaptivesports.org/youth-wheelchair-basketball To check: weaker evidence (see note). KC Kings Varsity is an NWBA junior team; page links 'NWBA Kansas City Kings'.
UPDATE organizations SET website_url = 'https://www.midwestadaptivesports.org/youth-wheelchair-basketball', last_ok_at = NULL, city = 'Kansas City', state = 'MO', state_name = 'Missouri', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '67e0cae4-5d3a-45a8-aa24-86ff5851c0a9' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- ParaSport Prep: website + town + state. Evidence: https://www.parasportspokane.org/basketball To check: weaker evidence (see note). 'ParaSport Prep' = ParaSport Spokane Prep NWBA junior team.
UPDATE organizations SET website_url = 'https://www.parasportspokane.org/basketball', last_ok_at = NULL, city = 'Spokane', state = 'WA', state_name = 'Washington', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '55964f28-bc23-4ecd-8b03-69570a14f342' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Northland Adaptive Recreation: website + town + state. Evidence: https://www.northlandadaptive.org/contact/ To check: weaker evidence (see note). Site intermittently shows 'Site is offline' (503) to curl; content confirmed via Exa fetch.
UPDATE organizations SET website_url = 'https://northlandadaptive.org/', last_ok_at = NULL, city = 'Duluth', state = 'MN', state_name = 'Minnesota', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '82f144a9-249f-42fe-95bf-27911ebc1ee6' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Vets Retreat Virginia, Inc.: town. Evidence: https://vetsretreatvirginia.org/about-us-vets-retreat-virginia-inc/ To check: the town is not in the city table, so it would get no distance; town only, with no website of its own. Satellite office at Spotsylvania American Legion Post 320; registered office in Falls Church per corporate records.
UPDATE organizations SET city = 'Spotsylvania', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '1477e33a-cfa3-547f-bc8a-be6b1232b4e4' AND (city IS NULL OR city = '');

-- Special Olympics New Jersey: website. Evidence: https://www.sonj.org/ To check: the website did not load cleanly from our server (blocked); weaker evidence (see note). Statewide program; HQ in Lawrenceville, NJ. curl gets 403; content confirmed via Exa fetch.
UPDATE organizations SET website_url = 'https://www.sonj.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4889ca31-733c-4331-8fb7-85b716ff26c1' AND (website_url IS NULL OR website_url = '');

-- Adaptive Martial Arts Association (AMAA): website + town + state. Evidence: https://adaptivemartialarts.org/ To check: the quote does not show the town; changes the state from VT to KY; town only, with no website of its own. Renamed DMAA; page lists a Nicholasville, KY mailing address (listed state VT is outdated). Network serves instructors nationwide. Bare domain works; www returns empty.
UPDATE organizations SET website_url = 'https://adaptivemartialarts.org/', last_ok_at = NULL, city = 'Nicholasville', state = 'KY', state_name = 'Kentucky', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0a8516d4-b6c8-459a-b219-696b0c0b62aa' AND website_url = 'http://www.adaptivemartialarts.org' AND (city IS NULL OR city = '') AND state = 'VT';

-- Angel City Sports: town. Evidence: https://angelcitysports.org/ To check: town only, with no website of its own. 
UPDATE organizations SET city = 'Los Angeles', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0a952ffb-4765-49fd-a97e-671200072a0d' AND (city IS NULL OR city = '');

-- ATX - Junior (Prep): website + town + state. Evidence: https://atxabilities.com/ To check: weaker evidence (see note). 'ATX - Junior (Prep)' is the NWBA prep team of ATX Abilities, partner of the Austin Rec'ers.
UPDATE organizations SET website_url = 'https://atxabilities.com/', last_ok_at = NULL, city = 'Austin', state = 'TX', state_name = 'Texas', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f7faeebe-b291-45a5-afcf-06a318591d64' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Bicycling Blind Los Angeles: town. Evidence: https://bicyclingblind.org/blog/los-angeles-bicycling-blind-group-rides To check: town only, with no website of its own. Org is the U.S. Blind Tandem Cycling Connection; LA group rides described in the Conejo Valley (2013 post). Town is the metro, low precision.
UPDATE organizations SET city = 'Los Angeles', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7f7af9f3-efb2-4858-8afe-c47b5aa5cdf1' AND (city IS NULL OR city = '');

-- Adaptive Sports Iowa – Central Iowa: town. Evidence: https://www.adaptivesportsiowa.org/contact/ To check: town only, with no website of its own. Site live; ASI office in Ames (central Iowa). Same org as 'Adaptive Sports IOWA | ASI'.
UPDATE organizations SET city = 'Ames', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8b905c04-d630-4a6c-8297-a3b3dc90a1dd' AND (city IS NULL OR city = '');

-- GLASA- Prep: website + town + state. Evidence: https://glasa.org/sports-programs/ To check: weaker evidence (see note). 'GLASA- Prep' is GLASA's NWBA prep-level junior wheelchair basketball team.
UPDATE organizations SET website_url = 'https://glasa.org/sports-programs/', last_ok_at = NULL, city = 'Lake Forest', state = 'IL', state_name = 'Illinois', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a9e0bffb-ac8c-46ef-88db-a9af8985d738' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Rio Salado Rowing Club – Paralympic Sport Valley of the Sun: town. Evidence: https://rowrio.org/ To check: town only, with no website of its own; weaker evidence (see note). Confirmed via WebFetch (curl gets 403). Site says it offers adaptive rowing.
UPDATE organizations SET city = 'Tempe', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ccba8a33-ea16-485c-be18-4748f4ad4f7c' AND (city IS NULL OR city = '');

-- Chicago Skyhawks Prep: website + town + state. Evidence: https://www.sralab.org/wheelchair-basketball To check: the quote does not show the town; weaker evidence (see note). Junior Skyhawks program of Shirley Ryan AbilityLab with Chicago Park District. Quote via WebFetch; contains a park address.
UPDATE organizations SET website_url = 'https://www.sralab.org/wheelchair-basketball', last_ok_at = NULL, city = 'Chicago', state = 'IL', state_name = 'Illinois', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd3f76f1f-e629-4261-915b-0c360531a663' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Southern Arizona Adaptive Sports: town. Evidence: https://www.soazadaptivesports.org/about To check: town only, with no website of its own. Southern Arizona; Tucson-based (Tucson Lobos, El Tour de Tucson). Quote weak - board listing; no address on site text.
UPDATE organizations SET city = 'Tucson', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '35563812-9b64-4df7-9b19-6f87c0cbb6e9' AND (city IS NULL OR city = '');

-- Adventure Amputee Camp: town + state. Evidence: https://adventureamputeecamp.org/summer-camp-1 To check: changes the state from VA to NC; town only, with no website of its own. Listed state is VA but summer camp is held in Bryson City, North Carolina.
UPDATE organizations SET city = 'Bryson City', state = 'NC', state_name = 'North Carolina', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f1963571-1ec3-49f6-ab77-ddfd6c762d6f' AND (city IS NULL OR city = '') AND state = 'VA';

-- Coastal Chairmen: website + town + state. Evidence: https://www.postandcourier.com/myrtle-beach/sports/coastal-chairmen-wheelchair-basketball-team/article_b491a128-b707-11ee-a2c2-13c730bbc0b3.html To check: weaker evidence (see note). Official site names no town; town from Post and Courier (2024) news.
UPDATE organizations SET website_url = 'https://www.coastalchairmen.com/', last_ok_at = NULL, city = 'North Myrtle Beach', state = 'SC', state_name = 'South Carolina', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4ac927f3-0913-4026-8dbe-83cb043e79da' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Warriors for Peace Theatre: town + state. Evidence: https://www.wfptheatre.org/donate-contact To check: changes the state from NY to CA; town only, with no website of its own. Listed state NY; site's donation address is Los Angeles, CA.
UPDATE organizations SET city = 'Los Angeles', state = 'CA', state_name = 'California', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'bed7d95d-9f9b-5888-987b-d6ff9f52ce41' AND (city IS NULL OR city = '') AND state = 'NY';

-- Utah Rush Wheelchair Basketball: website + town. Evidence: https://www.neuroworx.org/rush/ To check: town only, with no website of its own; weaker evidence (see note). Listed site is Facebook; team is a Neuroworx program. Quote is Neuroworx footer.
UPDATE organizations SET website_url = 'https://www.neuroworx.org/rush/', last_ok_at = NULL, city = 'Sandy', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '83f71aff-2830-4491-b479-816fcee73ed3' AND website_url = 'https://www.facebook.com/Utah-Rush-230754530409542/' AND (city IS NULL OR city = '');

-- 10 ARTS Foundation / New York Film Academy / NYC Dwyer Program: town. Evidence: https://www.nyc.gov/site/veterans/community/Dwyer-peer-to-peer-program.page To check: town only, with no website of its own. Citywide program; offerings across all five boroughs.
UPDATE programs SET city = 'New York', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8aa45105-81fe-5569-b2c3-5057016880a0' AND (city IS NULL OR city = '');

-- Children’s Specialized Hospital Lightning Wheels: website + town. Evidence: https://moveunitedsport.org/organization/childrens-lightning-wheels/ To check: town only, with no website of its own. Listed rwjbh.org URL is behind a bot wall; the team's own page is on CSH's recdesk site. Town from Move United listing (c/o CSH Mountainside). Same team as 'Children's Lightning Wheels'.
UPDATE organizations SET website_url = 'https://csh.recdesk.com/Community/Page?pageId=15595', last_ok_at = NULL, city = 'Mountainside', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '520dd909-028e-4ff7-bdf8-8279ec79c746' AND website_url = 'https://www.rwjbh.org/childrens-specialized-hospital/?utm_source=childrens-specialized.org&utm_campaign=rackspace&utm_medium=redirect' AND (city IS NULL OR city = '');

-- CAST Iron Skillets: website + town + state. Evidence: https://www.skilletswheelchairbasketball.com/ To check: the website did not load cleanly from our server (dead 404); weaker evidence (see note). Homepage loads via Exa fetch; curl got 404.
UPDATE organizations SET website_url = 'https://www.skilletswheelchairbasketball.com/', last_ok_at = NULL, city = 'Tallassee', state = 'AL', state_name = 'Alabama', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e4137a2e-b55a-4365-bc63-5b0811876a6e' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Charlotte Rollin' Hornets DIII: website + town + state. Evidence: https://rollinhornets.org/ To check: the website did not load cleanly from our server (dead 000); weaker evidence (see note). DIII is one of the program's NWBA teams.
UPDATE organizations SET website_url = 'https://rollinhornets.org/', last_ok_at = NULL, city = 'Charlotte', state = 'NC', state_name = 'North Carolina', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd0117e86-5cff-4b64-b5f6-66fc4bcc39c2' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Webster Water Ski Collective: website + town + state. Evidence: https://newenglandwaterski.org/adaptive-skiing/ To check: weaker evidence (see note). curl gets 403; content confirmed via Exa fetch.
UPDATE organizations SET website_url = 'https://newenglandwaterski.org/adaptive-skiing/', last_ok_at = NULL, city = 'Webster', state = 'MA', state_name = 'Massachusetts', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '1233017d-d36d-4f17-8ccb-00083ba98091' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- University of Illinois: website + town + state. Evidence: https://dres.illinois.edu/athletics/ To check: the website did not load cleanly from our server (blocked); the quote does not show the town. Town is the university campus (Urbana-Champaign); page names no town. Site intermittently 503.
UPDATE organizations SET website_url = 'https://dres.illinois.edu/athletics/', last_ok_at = NULL, city = 'Champaign', state = 'IL', state_name = 'Illinois', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '13372421-e8f1-4feb-b13a-42b86f310465' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Team River Runner – Milwaukee: town. Evidence: https://www.teamriverrunner.org/get-involved/chapters/wisconsin-milwaukee/ To check: town only, with no website of its own. Sessions also at Genesee Lake, Oconomowoc.
UPDATE organizations SET city = 'Milwaukee', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f72f1222-059c-4d23-ba5f-b9c7e87d6907' AND (city IS NULL OR city = '');

-- USA Archery Paralympic: website. Evidence: https://www.usarchery.org/high-performance/making-the-us-paralympic-archery-team To check: the website did not load cleanly from our server (GAMBLING). National governing body (USA Archery) para page; national, no town.
UPDATE organizations SET website_url = 'https://www.usarchery.org/high-performance/making-the-us-paralympic-archery-team', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c84757e8-89e0-4c84-9212-3900322854d7' AND (website_url IS NULL OR website_url = '');

-- META Athletics – Tyler: town. Evidence: https://www.kltv.com/story/34896967/meta-athletics-gives-east-texans-an-opportunity-to-participate-in-adaptive-athletics/ To check: town only, with no website of its own; weaker evidence (see note). Only web presence is the Facebook page facebook.com/MyEastTexasAdaptiveAthletics (not usable as website). Town from 2017 KLTV news; current activity unconfirmed.
UPDATE organizations SET city = 'Tyler', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b50f3140-1bd0-4db0-975c-00b0e25360ea' AND (city IS NULL OR city = '');

-- Turnstone Center for Children and Adults with Physical Disabilities: website + town. Evidence: https://turnstone.org/ To check: the town is not in the city table, so it would get no distance. Now branded simply Turnstone.
UPDATE organizations SET website_url = 'https://turnstone.org/', last_ok_at = NULL, city = 'Fort Wayne', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2a518211-446f-4e7e-8e29-69a571c07fcf' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Dallas Mavericks Wheelchair Basketball: website + town. Evidence: https://sites.google.com/view/dtown4life/home To check: weaker evidence (see note). Team's own Google Sites page (#DTown4LIFE); NWBA team page: https://www.nwba.org/page/show/9145197-dallas-wheelchair-mavericks
UPDATE organizations SET website_url = 'https://sites.google.com/view/dtown4life/home', last_ok_at = NULL, city = 'Dallas', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6c5731ba-72c2-4818-bbf6-0537d81d02ea' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- The Dented Puck Foundation: website. Evidence: https://www.thedentedpuck.com/ To check: weaker evidence (see note). National blind hockey support nonprofit (podcast, events); no single program town. GuideStar lists its main office in North Haledon, NJ.
UPDATE organizations SET website_url = 'https://www.thedentedpuck.com/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0557c1a0-0939-4ce6-9c62-8c5045b984d4' AND (website_url IS NULL OR website_url = '');

-- Tampa Bay Strong Dogs DII: website + town + state. Evidence: https://hcfl.gov/residents/parks-and-leisure/adaptive-sports/tampa-bay-strong-dogs-wheelchair-basketball-team To check: weaker evidence (see note). Hillsborough County Parks & Recreation program; 'DII' is the NWBA division label. County office in Tampa.
UPDATE organizations SET website_url = 'https://hcfl.gov/residents/parks-and-leisure/adaptive-sports/tampa-bay-strong-dogs-wheelchair-basketball-team', last_ok_at = NULL, city = 'Tampa', state = 'FL', state_name = 'Florida', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e8c16cbf-95a8-4287-ac06-71706d8ab5b3' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- LWSRA/Synergy Hawks P2: website + town + state. Evidence: https://lwsra.org/wheelchair-basketball/ To check: weaker evidence (see note). 'P2' is the NWBA prep division label; team plays out of LWSRA's Lincolnway Special Recreation Center.
UPDATE organizations SET website_url = 'https://lwsra.org/wheelchair-basketball/', last_ok_at = NULL, city = 'New Lenox', state = 'IL', state_name = 'Illinois', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f18204b6-7ad5-4c1b-b3e5-739ceca49734' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Pearland Parks and Recreation: website + town. Evidence: https://www.parks.pearlandtx.gov/recreation-programs/adaptive-recreation To check: the website did not load cleanly from our server (blocked); weaker evidence (see note). Page returns 403 to curl (bot block); loaded via Firecrawl. Also runs adaptive sports and a Miracle League.
UPDATE organizations SET website_url = 'https://www.parks.pearlandtx.gov/recreation-programs/adaptive-recreation', last_ok_at = NULL, city = 'Pearland', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '33cf731b-136a-4e0d-8e80-f94a8d4799e3' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Charlottesville Cardinals DIII: website + town + state. Evidence: https://cardinalsbasketball.com/ To check: weaker evidence (see note). 'DIII' is the NWBA division label.
UPDATE organizations SET website_url = 'https://cardinalsbasketball.com/', last_ok_at = NULL, city = 'Charlottesville', state = 'VA', state_name = 'Virginia', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b11b1bc8-d444-46f7-9cb1-ccccbff0204a' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Los Angeles Clippers Chairmen: website + town. Evidence: https://www.nba.com/clippers/community/outreach To check: the quote does not show the town; weaker evidence (see note). Team section on the Clippers' official site; NWBA team page https://www.nwba.org/page/show/9145206-la-clippers-chairmen. 2025-26 home games listed at Clara Street Park, Cudahy, CA. Duplicate of 'LA Clippers Chairmen' lis
UPDATE organizations SET website_url = 'https://www.nba.com/clippers/community/outreach', last_ok_at = NULL, city = 'Los Angeles', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fdf6eaa8-8ae1-47a0-b741-d4293b3a276c' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- MAPVA Chargers: website + town. Evidence: https://www.nwba.org/page/show/2024042-ok-mapva-chargers To check: weaker evidence (see note). Team page on NWBA site (Division I).
UPDATE organizations SET website_url = 'https://www.nwba.org/page/show/2024042-ok-mapva-chargers', last_ok_at = NULL, city = 'Oklahoma City', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6aa1f37f-14aa-4b58-8891-4eab764756d5' AND website_url = 'http://www.nwba.org/page/show/2024042-ok-mapva-chargers' AND (city IS NULL OR city = '');

-- Veteran Spouse Network: website + town. Evidence: https://imvfw.utexas.edu/2025/06/05/ut-austins-veteran-spouse-network-highlights-military-veteran-spouse-needs-in-new-pmi-u-s-report/ To check: weaker evidence (see note). Own site veteranspousenetwork.org loads. Program of UT Austin's Institute for Military & Veteran Family Wellness; peer support across Texas and online. Not a sports program.
UPDATE programs SET website_url = 'https://veteranspousenetwork.org/', last_ok_at = NULL, city = 'Austin', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7a3690e6-b538-5309-8e0e-ce3e320084df' AND website_url = 'https://texvet.org/event/coffee-chat-weekly-space-connection-conversation' AND (city IS NULL OR city = '');

-- Teaming Individuals Emphasizing Sports: website + town. Evidence: https://tiessports.org/ To check: the website did not load cleanly from our server (dead 000); weaker evidence (see note). Page read via Exa fetch (curl connection fails from this box). USTA community tennis org for wheelchair tennis.
UPDATE organizations SET website_url = 'https://tiessports.org/', last_ok_at = NULL, city = 'Sacramento', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '04214762-a923-41e7-833e-3b7d453b7f35' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Tenn Tornadoes Varsity: website + town + state. Evidence: https://www.wvlt.tv/2026/05/25/tennessee-tornadoes-wheelchair-basketball-team-seeks-players-new-season/ To check: weaker evidence (see note). No own site found; NWBA team page (Junior Division - Prep) used as website. Town from local news (WVLT). 'Varsity' in listed name is the NWBA division label.
UPDATE organizations SET website_url = 'https://www.nwba.org/page/show/9145070-tenn-tornadoes', last_ok_at = NULL, city = 'Knoxville', state = 'TN', state_name = 'Tennessee', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '73b5a800-8be7-44c2-a371-192946a20385' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Philadelphia Flyers Sled Hockey: website. Evidence: http://www.flyerssledhockey.com/mission/ To check: weaker evidence (see note). Site loads but looks stale (homepage points to a 2017-18 site at flyerssledhockey.org, which no longer resolves). No town or rink on the page; not confirmed whether active.
UPDATE organizations SET website_url = 'http://www.flyerssledhockey.com/mission/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '07890730-ed44-4cf5-bb86-3a52dc7c5b7b' AND (website_url IS NULL OR website_url = '');

-- Ability360 Wheelchair Suns: website + town + state. Evidence: https://ability360.org/wheelchair-basketball/ To check: weaker evidence (see note). Ability360 runs 3 adult NWBA teams (DII, DIII, Women's).
UPDATE organizations SET website_url = 'https://ability360.org/sports/360-phoenix-suns-wheelchair-basketball/', last_ok_at = NULL, city = 'Phoenix', state = 'AZ', state_name = 'Arizona', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f14e7298-ff5d-4114-be16-fd874dc2523b' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- FEBASIRU Puerto Rico: website + state. Evidence: https://www.ccies-r.com/febasiru To check: weaker evidence (see note). Puerto Rico's wheelchair basketball federation (island-wide governing body), no single town. No standalone federation site found; this page is hosted by partner CCIES-R. NWBA team page: https://www.nwba.org/page/show/914
UPDATE organizations SET website_url = 'https://www.ccies-r.com/febasiru', last_ok_at = NULL, state = 'PR', state_name = 'Puerto Rico', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '50ef253a-7a08-47f9-9d73-749d10b29a51' AND (website_url IS NULL OR website_url = '') AND (state IS NULL OR state = '');

-- LA Clippers Chairmen: website + town + state. Evidence: https://www.nba.com/clippers/community/outreach To check: the quote does not show the town; weaker evidence (see note). Duplicate of 'Los Angeles Clippers Chairmen' listing. 2025-26 home games listed at Clara Street Park, Cudahy, CA (NWBA schedule).
UPDATE organizations SET website_url = 'https://www.nba.com/clippers/community/outreach', last_ok_at = NULL, city = 'Los Angeles', state = 'CA', state_name = 'California', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a2af0d73-4d9a-4a4b-9d99-0be0f2fe05e4' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Soldiers Undertaking Disabled Scuba, Inc.: website + town + state. Evidence: https://sudsusa.org/about-us/ To check: changes the state from NC to TX. Name changed from Soldiers Undertaking Disabled Scuba; started at Walter Reed, now multi-sport. Listed state NC no longer matches (moved to TX). Older domain sudsdiving.org times out.
UPDATE organizations SET website_url = 'https://sudsusa.org/', last_ok_at = NULL, city = 'San Antonio', state = 'TX', state_name = 'Texas', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b86968f0-cdbf-42d2-a5b5-6999bde53256' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND state = 'NC';

-- Triumph Foundation: website + town. Evidence: https://triumph-foundation.org/contact-us/ To check: the town is not in the city table, so it would get no distance. Valencia is part of Santa Clarita.
UPDATE organizations SET website_url = 'https://triumph-foundation.org/', last_ok_at = NULL, city = 'Valencia', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8f3e1aed-c996-4e0d-a2b0-035e1d3ab9d0' AND website_url = 'http://www.Triumph-Foundation.org' AND (city IS NULL OR city = '');

-- Bayou City: website + town + state. Evidence: https://www.beeabled.org/workouts/events-fall2026 To check: weaker evidence (see note). Bayou City is Bee Abled's NWBA Division I team (NWBA page https://www.nwba.org/page/show/9557968-bee-abled-bayou-city); 'Bayou City Basketball Practice' sessions at Houston community centers.
UPDATE organizations SET website_url = 'https://www.beeabled.org/', last_ok_at = NULL, city = 'Houston', state = 'TX', state_name = 'Texas', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'aacdc72e-bdcf-479c-96d4-272a400f8d43' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- San Diego Wolf Pack Wheelchair Basketball: website + town. Evidence: https://warriorfoundation.org/wolfpack/ To check: weaker evidence (see note). Military wheelchair basketball team (Naval Medical Center San Diego); NWBA page https://www.nwba.org/page/show/9145266-nmcsd-wolf-pack
UPDATE organizations SET website_url = 'https://warriorfoundation.org/wolfpack/', last_ok_at = NULL, city = 'San Diego', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ce68bc19-5d6a-4103-b81b-c1a1aa0660d5' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Fairfax Falcons Varsity: website + state. Evidence: https://fairfaxfalcons.org/ To check: weaker evidence (see note). Youth wheelchair basketball ('Varsity' is the NWBA division label). Serves Northern Virginia region; primary practice site is the James Lee Community Center (Fairfax County). Town left blank.
UPDATE organizations SET website_url = 'https://fairfaxfalcons.org/', last_ok_at = NULL, state = 'VA', state_name = 'Virginia', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'bd9b79c2-0f04-439b-82c4-844662f4004e' AND (website_url IS NULL OR website_url = '') AND (state IS NULL OR state = '');

-- Shepherd Stealers- DII: website + town + state. Evidence: https://shepherd.org/treatment/services-clinics/adaptive-sports/ To check: weaker evidence (see note). Shepherd Center wheelchair basketball team; 'DII' is the NWBA division label.
UPDATE organizations SET website_url = 'https://shepherd.org/treatment/services-clinics/adaptive-sports/', last_ok_at = NULL, city = 'Atlanta', state = 'GA', state_name = 'Georgia', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'dcd6326f-fe79-4a94-b00c-ef60c1ba78d9' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Ability PLUS, Inc.: website + town. Evidence: http://www.abilityplus.org/ To check: the town is not in the city table, so it would get no distance; the quote does not show the town. Site loads but content is stale (2016-17 season); Vermont program runs at Mount Snow (West Dover, VT); also a NH program at Wildcat / Mount Washington Valley. Mount Snow location in West Dover per search listings, not on
UPDATE organizations SET website_url = 'http://www.abilityplus.org/', last_ok_at = NULL, city = 'West Dover', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a199684b-19a9-41da-9b83-82ce3de5a518' AND website_url = 'http://www.abilityplus.org' AND (city IS NULL OR city = '');

-- Magee Spokesman RED: website + town + state. Evidence: https://www.jeffersonhealth.org/clinical-specialties/rehabilitation-medicine/specialty-rehabilitation-services/wheelchair-sports To check: the quote does not show the town; weaker evidence (see note). Page is JS-rendered (read via Firecrawl); the practice site it names is in West Deptford, NJ (Philadelphia area). 'RED' looks like a squad label. NWBA page: https://www.nwba.org/page/show/9558001-magee-spokesmen (Magee S
UPDATE organizations SET website_url = 'https://www.jeffersonhealth.org/clinical-specialties/rehabilitation-medicine/specialty-rehabilitation-services/wheelchair-sports', last_ok_at = NULL, city = 'West Deptford', state = 'NJ', state_name = 'New Jersey', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b0222953-524b-47a9-8add-e836e0a1357c' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Hornets Sled Hockey: website + town. Evidence: https://www.ahai.org/about/disabled/135508 To check: the quote does not show the town. Own site loads but gives no location; town from Amateur Hockey Association of Illinois page.
UPDATE organizations SET website_url = 'https://www.hornetsledhockeyteam.org/', last_ok_at = NULL, city = 'Mount Prospect', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '00e5b024-5f8a-414d-ad7b-cb2c614b5f16' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Bennett Blazers Prep: website + town + state. Evidence: https://www.kennedykrieger.org/community/initiatives/bennett-blazers To check: weaker evidence (see note). 'Prep' is the NWBA division label.
UPDATE organizations SET website_url = 'https://www.kennedykrieger.org/community/initiatives/bennett-blazers', last_ok_at = NULL, city = 'Baltimore', state = 'MD', state_name = 'Maryland', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7bc31101-6146-49d1-af4a-c7e2d96999b5' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Port City Spokesmen: website + town + state. Evidence: https://www.wilmingtonandbeaches.com/articles/post/wilmington-welcomes-the-carolinas-wheelchair-basketball-conference-for-2026-tournament-in-march/ To check: the quote does not show the town; weaker evidence (see note). No own site; NWBA Division III team page used. Affiliated with the Wilmington Disabled Athletics Association; town from Wilmington tourism article (2026).
UPDATE organizations SET website_url = 'https://www.nwba.org/page/show/9558075-port-city-spokesmen', last_ok_at = NULL, city = 'Wilmington', state = 'NC', state_name = 'North Carolina', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8f244e0e-b605-404e-9067-428d1c85813e' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Chicago Skyhawks Varsity: website + town + state. Evidence: https://www.sralab.org/wheelchair-basketball To check: weaker evidence (see note). 'Varsity' is the NWBA junior division label. NWBA page: https://www.nwba.org/page/show/9145097-chicago-skyhawks-varsity
UPDATE organizations SET website_url = 'https://www.sralab.org/wheelchair-basketball', last_ok_at = NULL, city = 'Chicago', state = 'IL', state_name = 'Illinois', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'be4a6a0d-f0bf-4318-a643-f09f64de6479' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- C.O.R.E. Centers, LLC: town. Evidence: http://www.centerofrestorativeexercise.com/contact To check: the town is not in the city table, so it would get no distance. Adaptive rehab gym.
UPDATE organizations SET city = 'Northridge', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '49d51c6b-df0d-42be-8edc-624ca32f9d05' AND (city IS NULL OR city = '');

-- Hillsborough County Adaptive Sports: website + town + state. Evidence: https://hcfl.gov/residents/parks-and-leisure/adaptive-sports To check: the quote does not show the town. County-wide program; county offices in Tampa ('Tampa, FL' in page footer). Teams include Tampa Bay Strong Dogs.
UPDATE organizations SET website_url = 'https://hcfl.gov/residents/parks-and-leisure/adaptive-sports/hc-adaptive-sports', last_ok_at = NULL, city = 'Tampa', state = 'FL', state_name = 'Florida', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6faa46db-7f95-41a7-b1fb-b041734dba94' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Madison Curling Club: website + town. Evidence: https://madisoncurlingclub.com/about-us/history/ To check: the website did not load cleanly from our server (blocked); weaker evidence (see note). Curl blocked with 429; read via WebFetch. Site does not itself describe wheelchair curling; the club is a known wheelchair curling hub
UPDATE organizations SET website_url = 'https://madisoncurlingclub.com/', last_ok_at = NULL, city = 'McFarland', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '09d5b4eb-f179-4843-8037-969904bce9b8' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Las Vegas Silver Bandits: website + town. Evidence: https://www.snadaptive.org/services To check: the quote does not show the town. lvsilverbandits.org is dead; team now listed under Southern Nevada Adaptive Sports Foundation, practicing at Dula Gym in Las Vegas
UPDATE organizations SET website_url = 'https://www.snadaptive.org/services', last_ok_at = NULL, city = 'Las Vegas', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6a75a1d6-e04c-4767-8e52-61ec44d348fb' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Berrytown Recreation Center – Louisville: town. Evidence: https://louisvilleky.gov/government/parks/berrytown-recreation-center-adaptive-and-inclusive-recreation To check: weaker evidence (see note). Curl gets Cloudflare 403; page read via Exa fetch. Louisville Metro Parks facility
UPDATE organizations SET city = 'Louisville', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f3abd147-d875-4a1a-becb-79a0e9056238' AND (city IS NULL OR city = '');

-- Chapter 126 Sports & Fitness, An Oak Hll Center: website + town. Evidence: https://oakhillct.org/ To check: weaker evidence (see note). Oak Hill site loads (easterseals.com/oakhill redirects here) but no dedicated adaptive sports page found in its sitemap; earlier Chapter 126 center opened in Bristol, current adaptive gym listed in Hartford per Kelly Bru
UPDATE organizations SET website_url = 'https://oakhillct.org/', last_ok_at = NULL, city = 'Hartford', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '1914133d-107e-4082-b7cd-32a0be225688' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Rehabilitation Institute of Michigan Adapted Sports: website + town. Evidence: https://www.dmc.org/rim-rehab/services/adapted-sports-program To check: the website did not load cleanly from our server (blocked); weaker evidence (see note). Curl blocked by Cloudflare; read via Exa fetch. Run with Reimagine Life Foundation; serves Metro Detroit
UPDATE organizations SET website_url = 'https://www.dmc.org/rim-rehab/services/adapted-sports-program', last_ok_at = NULL, city = 'Detroit', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '82e5d794-4939-4680-9490-4562debe3af1' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Desert Ability Center: website. Evidence: https://desertabilitycenter.org/letter-from-the-executive-director/ To check: the website did not load cleanly from our server (dead 000); weaker evidence (see note). Serves the Coachella Valley; sources conflict on base town (Indio vs La Quinta), so town left blank. Site read via Exa (curl DNS failed from this box)
UPDATE organizations SET website_url = 'https://desertabilitycenter.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '131d6eb4-202c-42d8-9d1e-f994c37030ef' AND (website_url IS NULL OR website_url = '');

-- Craftsbury Sculling Center Adaptive: website + town + state. Evidence: https://www.craftsbury.com/sculling To check: the town is not in the city table, so it would get no distance. No dedicated adaptive rowing page found on the site; adaptive content on site is mainly adaptive Nordic ski events
UPDATE organizations SET website_url = 'https://www.craftsbury.com/sculling', last_ok_at = NULL, city = 'Craftsbury Common', state = 'VT', state_name = 'Vermont', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '221740be-3d6b-43fc-8cf5-f2d2b55945fb' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Houston Parks & Recreation Department: website + town. Evidence: https://www.houstontx.gov/parks/adaptivesports-recreation.html To check: the website did not load cleanly from our server (dead 400); the quote does not show the town; weaker evidence (see note). Page blocks curl/WebFetch (HTTP 400 to bots) but is indexed under this URL; search snippet says section is headquartered at Metropolitan Multi-Service Center at West Gray, Houston. Verify in a browser
UPDATE organizations SET website_url = 'https://www.houstontx.gov/parks/adaptivesports-recreation.html', last_ok_at = NULL, city = 'Houston', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '55e0529b-71e1-4616-b03b-0c90fcfab0ac' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Virginia Amateur Sports: website + state. Evidence: https://www.commonwealthgames.org/who-is-vas To check: weaker evidence (see note). Statewide games (adaptive Able Games); host region moved to Richmond region 2026-2028 per news; town left blank
UPDATE organizations SET website_url = 'https://www.commonwealthgames.org/', last_ok_at = NULL, state = 'VA', state_name = 'Virginia', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6338ad2c-9e92-4b89-ae85-cbcf286b3e33' AND (website_url IS NULL OR website_url = '') AND (state IS NULL OR state = '');

-- Team River Runner Coatesville: website. Evidence: https://www.teamriverrunner.org/get-involved/chapters/pennsylvania-southeast-pa/ To check: weaker evidence (see note). Coatesville chapter appears to be now the Southeast PA destination chapter; page names no town (2008 news put it at the Coatesville VA Medical Center). Town left blank
UPDATE organizations SET website_url = 'https://www.teamriverrunner.org/get-involved/chapters/pennsylvania-southeast-pa/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '12d95930-1bb2-4bbf-8934-da253f6427be' AND (website_url IS NULL OR website_url = '');

-- Chicago Blackhawks Sled Hockey: website + town + state. Evidence: https://www.sralab.org/sled-hockey To check: weaker evidence (see note). Program now branded Chicago Freeze; practices at McFetridge Sports Center in Chicago (read via WebFetch)
UPDATE organizations SET website_url = 'https://www.sralab.org/sled-hockey', last_ok_at = NULL, city = 'Chicago', state = 'IL', state_name = 'Illinois', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e87dd951-6c77-48f3-a42f-51c24dc8266b' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- LWSRA/Synergy Hawks - Prep: website + town + state. Evidence: https://lwsra.org/ To check: weaker evidence (see note). NWBA junior prep team LWSRA/Synergy Hawks; LWSRA site mentions Hawks wheelchair basketball
UPDATE organizations SET website_url = 'https://lwsra.org/', last_ok_at = NULL, city = 'New Lenox', state = 'IL', state_name = 'Illinois', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '58fadd24-ac48-4343-b47a-a91d5da7b650' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Louisville Thunder: website + town + state. Evidence: https://adaptlou.com/louisville-thunder To check: weaker evidence (see note). NWBA DIII wheelchair basketball team run by AdaptLou
UPDATE organizations SET website_url = 'https://adaptlou.com/louisville-thunder', last_ok_at = NULL, city = 'Louisville', state = 'KY', state_name = 'Kentucky', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '206eb45c-daa5-480b-8ec4-988b68c089f9' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Tulsa Jammers: town. Evidence: https://www.newson6.com/story/5e36748c2f69d76f62085b36/tulsa-jammers-take-it-to-the-court To check: town only, with no website of its own; weaker evidence (see note). Given website is a Facebook page (not usable). No own site found; NWBA lists Tulsa Jammers teams. Town from team name and Tulsa TV news headline, not an own site
UPDATE organizations SET city = 'Tulsa', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4213e003-953d-45d2-b6ff-4424fcbba2cf' AND (city IS NULL OR city = '');

-- Sportable Spokes Varsity: website + town + state. Evidence: https://sportable.org/sports/wheelchair-basketball-competitive/ To check: the quote does not show the town. Sportable is Richmond VA based; town not in the quoted line
UPDATE organizations SET website_url = 'https://sportable.org/sports/wheelchair-basketball-competitive/', last_ok_at = NULL, city = 'Richmond', state = 'VA', state_name = 'Virginia', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ad84083b-e54a-48fd-a719-94b273aeb139' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Virtual veteran coffee socials and gaming groups: town. Evidence: https://www.mirecc.va.gov/MIRECC/visn5/training/interprofessional_fellowship_program/cheyenne/Cheyenne_PSR_Fellowship_Manual_26-27-508.pdf To check: town only, with no website of its own. Listing website is a VA fellowship manual PDF, not a program page; program is virtual, run by Cheyenne VA
UPDATE programs SET city = 'Cheyenne', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'de57e6ce-910f-532f-9a8b-0ba20e8ea46c' AND (city IS NULL OR city = '');

-- Central Maine Adaptive Sports: website. Evidence: https://centralmaineadaptivesports.org/ To check: weaker evidence (see note). Own site names no town in readable text. Directory listings (CP Family Network, Move United) say it is located at Lost Valley Ski Resort, Auburn ME; not confirmed on own site
UPDATE organizations SET website_url = 'https://centralmaineadaptivesports.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0715b244-617f-4df8-91c4-eaf88c1bc3e3' AND website_url = 'http://centralmaineadaptivesports.org/';

-- FYV Flyers: website + town + state. Evidence: https://www.fayettevilleflyers.org/ To check: weaker evidence (see note). Site is the Fayetteville Flyers Track and Field Club; NWBA lists a Fayetteville Flyers DIII wheelchair team. Low confidence that this site covers the wheelchair team
UPDATE organizations SET website_url = 'https://www.fayettevilleflyers.org/', last_ok_at = NULL, city = 'Fayetteville', state = 'NC', state_name = 'North Carolina', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '1c640dbf-5838-4207-8ac7-f7c1cbe54389' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Shepherd Stealers DIII: website + town + state. Evidence: https://shepherd.org/treatment/services-clinics/adaptive-sports/ To check: weaker evidence (see note). Stealers basketball listed on this page; NWBA lists them DII (listing says DIII)
UPDATE organizations SET website_url = 'https://shepherd.org/treatment/services-clinics/adaptive-sports/', last_ok_at = NULL, city = 'Atlanta', state = 'GA', state_name = 'Georgia', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9b32a764-a563-4815-9f26-1e797799b5ad' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Disabled Sports USA Far West: website + town + state. Evidence: https://www.achievetahoe.org/ To check: the town is not in the city table, so it would get no distance. Disabled Sports USA Far West renamed Achieve Tahoe (Tahoe Daily Tribune: 'Disabled Sports USA Far West changes name to Achieve Tahoe'); office also in Truckee
UPDATE organizations SET website_url = 'https://www.achievetahoe.org/', last_ok_at = NULL, city = 'Alpine Meadows', state = 'CA', state_name = 'California', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '96a280ae-9322-4024-bdc3-4a18d572a11f' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Ultimate Workout & Recovery: website. Evidence: https://workoutandrecovery.com/pages/our-mission To check: the website did not load cleanly from our server (blocked); town only, with no website of its own. Product company / foundation (home gym equipment), not a local program; site gives Ohio but no town
UPDATE organizations SET website_url = 'https://workoutandrecovery.com/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9864aaf4-6756-4ca4-9ca2-39558c80efea' AND website_url = 'http://www.workoutandrecovery.com';

-- New Jersey Freeze: town. Evidence: https://www.tapinto.net/towns/randolph/sections/health-and-wellness/articles/sled-hockey-takes-center-ice-in-randolph To check: town only, with no website of its own; weaker evidence (see note). newjerseyfreeze.com is now parked (redirects to /lander). Town from local news and a travel sports listing; no live own site
UPDATE organizations SET city = 'Randolph', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '1c478649-30f8-4b3c-96fd-72b09ecc157d' AND (city IS NULL OR city = '');

-- Victoria Bad News Chairs: town. Evidence: https://victoriaadvocate.com/2022/11/04/city-partners-with-bad-news-chairs-to-expand-adaptive-sports-opportunities/ To check: the quote does not show the town; town only, with no website of its own; weaker evidence (see note). Given website is a Facebook group. No own site; City of Victoria news release confirms Victoria TX
UPDATE organizations SET city = 'Victoria', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c05dd46e-9edf-49a8-b58f-16792af8ccd7' AND (city IS NULL OR city = '');

-- GallantFew / Denton County Military Veteran Peer Network: website. Evidence: https://www.dentoncountymvpn.org/ To check: the website did not load cleanly from our server (dead 000); weaker evidence (see note). Denton County-wide network (GallantFew partners); GallantFew site does not name the network on homepage. Town not stated; county-level
UPDATE organizations SET website_url = 'https://www.dentoncountymvpn.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '517606e2-3def-598e-a9bd-703c2d2839ba' AND website_url = 'https://www.gallantfew.org/';

-- Legacy Equine Center and Sanctuary: town. Evidence: https://legacysanctuary.org/ To check: the town is not in the city table, so it would get no distance. Footer gives the farm's location in Easthampton (Western Massachusetts). Formerly Wagner Equine Center.
UPDATE organizations SET city = 'Easthampton', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e152d6a1-0a9d-5f2f-a389-345a4c14d38b' AND (city IS NULL OR city = '');

-- Sacramento Royals: website + town + state. Evidence: https://healinitiative.spond.club/sacramento_d3_royals To check: weaker evidence (see note). NWBA Division III team run by the nonprofit H.E.A.L. (oneheal.org). Town taken from the team name; page gives no other locality.
UPDATE organizations SET website_url = 'https://healinitiative.spond.club/sacramento_d3_royals', last_ok_at = NULL, city = 'Sacramento', state = 'CA', state_name = 'California', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7b0c64b4-4c09-4522-a340-ed501f7b3248' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- NE Red Dawgs Jr Prep: website + town + state. Evidence: https://nebraskaadaptivesports.org/youth-activities/ne-red-dawgs/ To check: weaker evidence (see note). 'Jr Prep' is the NWBA prep (younger) team label of the Nebraska Red Dawgs youth program.
UPDATE organizations SET website_url = 'https://nebraskaadaptivesports.org/youth-activities/ne-red-dawgs/', last_ok_at = NULL, city = 'Omaha', state = 'NE', state_name = 'Nebraska', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2363e082-6d2a-42ef-a189-1250c5dbe010' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Philadelphia Rough Riders: website + town + state. Evidence: https://phillywheelchairroughriders.com/ To check: weaker evidence (see note). NWBA Division III team. Domain forwards to a WordPress.com site with the team's content.
UPDATE organizations SET website_url = 'https://phillywheelchairroughriders.com/', last_ok_at = NULL, city = 'Philadelphia', state = 'PA', state_name = 'Pennsylvania', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '163c66df-8ed7-489e-b844-622ca65fbee1' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Challenged Athletes of West Virginia | CAWV: website + town + state. Evidence: https://cawvsports.org/ To check: the town is not in the city table, so it would get no distance. A related site cawvinthevalley.org covers CAWV programs in the Canaan Valley area.
UPDATE organizations SET website_url = 'https://cawvsports.org/', last_ok_at = NULL, city = 'Snowshoe', state = 'WV', state_name = 'West Virginia', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9ad559cc-4e12-4f75-930c-bd10264dd340' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Rolling Heat Varsity: website + town + state. Evidence: https://www.sf-ymca.net/wheelchair-basketball To check: the quote does not show the town; weaker evidence (see note). Page footer: Stephens Family YMCA (Champaign County YMCA), Champaign, IL. Page calls the team prep-level; NWBA lists Rolling Heat Prep and Varsity squads. Medium confidence it is the same program.
UPDATE organizations SET website_url = 'https://www.sf-ymca.net/wheelchair-basketball', last_ok_at = NULL, city = 'Champaign', state = 'IL', state_name = 'Illinois', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '1b858eb9-09a0-401e-9374-eebb9460ba54' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Para Sport of Southern Kentucky: website + town + state. Evidence: https://www.bgky.org/bgpr/adaptive-recreation To check: the quote does not show the town; weaker evidence (see note). Medium confidence: likely the current name of Para Sport of Southern Kentucky (city program, wheelchair basketball, tennis, goalball). Verify.
UPDATE organizations SET website_url = 'https://www.bgky.org/bgpr/adaptive-recreation', last_ok_at = NULL, city = 'Bowling Green', state = 'KY', state_name = 'Kentucky', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e443638a-9f08-42eb-b931-e5789091d5b4' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Dallas Wheelchair Mavericks: website + town + state. Evidence: https://sites.google.com/view/dtown4life/home To check: weaker evidence (see note). Team's own Google Site (#DTown4LIFE). NWBA Division I team; 2026 D-I national champions per NWBA.
UPDATE organizations SET website_url = 'https://sites.google.com/view/dtown4life/home', last_ok_at = NULL, city = 'Dallas', state = 'TX', state_name = 'Texas', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '13c47553-534e-4bb1-b8d0-a26db90f435a' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- American Association of Adapted Sports Programs: website + town + state. Evidence: https://www.adaptedsports.org/ To check: weaker evidence (see note). Home office in Atlanta; runs interscholastic adapted sports in school systems across Georgia. Site returns 403 to curl but loads via WebFetch.
UPDATE programs SET website_url = 'https://www.adaptedsports.org/', last_ok_at = NULL, city = 'Atlanta', state = 'GA', state_name = 'Georgia', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '76744902-91b9-48b7-b6bc-5e1bafe0cce1' AND website_url = 'https://www.adaptedsports.org' AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Magee Spokesman BLUE DIII: website + town + state. Evidence: https://giving.jefferson.edu/why-give/stories/patient-stories/wheelchair-sports-program.html To check: the quote does not show the town. Magee Rehab is now Jefferson Moss-Magee Rehabilitation Hospital, Philadelphia. Program page is JS-only. Low-medium confidence that the Spokesmen BLUE DIII team continues under the 76ers name.
UPDATE organizations SET website_url = 'https://www.jeffersonhealth.org/clinical-specialties/rehabilitation-medicine/specialty-rehabilitation-services/wheelchair-sports', last_ok_at = NULL, city = 'Philadelphia', state = 'PA', state_name = 'Pennsylvania', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '98f420c5-f725-477a-90dd-dc36e4ab0bd8' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Wheels in Motion: website + town + state. Evidence: https://wheelsinmotion.org/about-us/ To check: weaker evidence (see note). LOW confidence on identity: listing has no state and 'Wheels in Motion' is a common name; this is the Michigan adaptive sports/recreation nonprofit (events also in Pontiac). Check original source.
UPDATE organizations SET website_url = 'https://wheelsinmotion.org/', last_ok_at = NULL, city = 'Fenton', state = 'MI', state_name = 'Michigan', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6ee36961-e570-4e58-88ee-505887d82b03' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Memorial Sharks DIII: website + town + state. Evidence: https://www.mhs.net/services/rehabilitation/conditions-treatments-services/adaptive-sports To check: the quote does not show the town. Memorial Healthcare System's Memorial Rehabilitation Institute (Memorial Regional Hospital South, Hollywood, FL). Florida Adaptive Sports lists the team under Ft Lauderdale.
UPDATE organizations SET website_url = 'https://www.mhs.net/services/rehabilitation/conditions-treatments-services/adaptive-sports', last_ok_at = NULL, city = 'Hollywood', state = 'FL', state_name = 'Florida', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ff0cf4cd-2d28-46a2-ad4a-cc3bb65804f7' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- LWSRA/Synergy Hawks - Varsity: website + town + state. Evidence: https://lwsra.org/ To check: weaker evidence (see note). Hawks wheelchair basketball is run by Lincolnway Special Recreation Association with Synergy Adaptive Athletics (WDSRA). 'Varsity' is the NWBA junior varsity squad.
UPDATE organizations SET website_url = 'https://lwsra.org/', last_ok_at = NULL, city = 'New Lenox', state = 'IL', state_name = 'Illinois', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c3e8e68e-f2d1-4ad1-a052-d412b9eb6113' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Valley Adaptive Sports: website + town + state. Evidence: https://valleyadaptivesports.org/about-us/ To check: the quote does not show the town; weaker evidence (see note). LOW confidence on identity: listing has no state and the name is generic; this is the Teton Valley, Idaho org (mailing town Driggs). Check source.
UPDATE organizations SET website_url = 'https://valleyadaptivesports.org/', last_ok_at = NULL, city = 'Driggs', state = 'ID', state_name = 'Idaho', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a7933a6e-64fe-4f9f-9589-9a17541eeb5c' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Community Center of Leadership and Transformation for Veterans (CCLT4Vets): state. Evidence: https://www.cclt4vets.org/home To check: changes the state from CT to NY. Listing state CT looks wrong: the site says it serves the Hudson Valley region of New York (mailing address in West Point, NY). Region, no single program town.
UPDATE organizations SET state = 'NY', state_name = 'New York', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '39cb0521-8939-521c-a386-38e222a8f593' AND state = 'CT';

-- Tampa Lighthouse for the Blind: website + town. Evidence: https://www.lighthouseblv.org/contact/ To check: the website did not load cleanly from our server (dead 307). Medium confidence this is the current name of Tampa Lighthouse for the Blind; it has Tampa and Winter Haven locations.
UPDATE organizations SET website_url = 'https://www.lighthouseblv.org/', last_ok_at = NULL, city = 'Tampa', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0f304c0d-af82-4531-b317-0fb6ba005e93' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Columbus Knights - Prep: website + town + state. Evidence: https://columbusrecparks.com/wellness/athletics/basketball/wheelchair-basketball/ To check: weaker evidence (see note). Columbus Knights YOUTH, ages 6-17; 'Prep' is the NWBA junior prep label.
UPDATE organizations SET website_url = 'https://columbusrecparks.com/wellness/athletics/basketball/wheelchair-basketball/', last_ok_at = NULL, city = 'Columbus', state = 'OH', state_name = 'Ohio', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ea403141-3e0f-47af-b96b-3bbe4840dc28' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Southwest Minnesota State Wheelchair Basketball: website + town. Evidence: https://smsumustangs.com/sports/wheelbball To check: the quote does not show the town. Southwest Minnesota State University is in Marshall, MN (page links 'Visit Marshall').
UPDATE organizations SET website_url = 'https://smsumustangs.com/sports/wheelbball', last_ok_at = NULL, city = 'Marshall', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b47b22e7-4d11-4fc2-96a0-07bdfcca558e' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Heroes On The Water – DFW Chapter: website + town. Evidence: https://heroesonthewater.org/chapters/dfw-texas/ To check: weaker evidence (see note). Chapter serves Collin, Dallas and Tarrant counties; events on lakes around Dallas (Plano, Farmersville). Site blocks curl (403) but loads via WebFetch.
UPDATE organizations SET website_url = 'https://heroesonthewater.org/chapters/dfw-texas/', last_ok_at = NULL, city = 'Dallas', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e4beeeed-0b37-4aa1-82d8-487a50a56a69' AND website_url = 'http://www.HeroesOnTheWater.org' AND (city IS NULL OR city = '');

-- Special Olympics Maryland: website. Evidence: https://www.somd.org/ To check: weaker evidence (see note). Statewide program; HQ in Baltimore area. specialolympicsmd.org redirects to somd.org (blocks curl with 403, loads via WebFetch). Town left blank as statewide.
UPDATE organizations SET website_url = 'https://www.somd.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ca0f3fdb-bde3-4ea8-8444-9eeefb83c628' AND (website_url IS NULL OR website_url = '');

-- Ability360 WC Suns: website + town + state. Evidence: https://ability360.org/wheelchair-basketball/ To check: weaker evidence (see note). Site blocks curl (403) but loads via WebFetch.
UPDATE organizations SET website_url = 'https://ability360.org/wheelchair-basketball/', last_ok_at = NULL, city = 'Phoenix', state = 'AZ', state_name = 'Arizona', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b3c128b3-0f6a-4048-aefa-f0e9e2dce668' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Coyotes Sled Hockey: website. Evidence: https://coyotessledhockey.com/about-us To check: weaker evidence (see note). Run by Arizona Sled Hockey Association. Site names no town; news coverage places practices in Scottsdale (Phoenix area), not confirmed on own page.
UPDATE organizations SET website_url = 'https://coyotessledhockey.com/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b6061a9c-d6e9-4b56-8de1-a80b0897246e' AND (website_url IS NULL OR website_url = '');

-- TIRR Memorial Hermann Hotwheels Varsity: website + town + state. Evidence: https://memorialhermann.org/services/specialties/tirr/patients-visitors/adapted-sports To check: the website did not load cleanly from our server (dead 000); the quote does not show the town; weaker evidence (see note). Page confirmed via Exa fetch (refuses direct curl). Page does not print the city; TIRR Memorial Hermann is in Houston. 'Varsity' is the NWBA junior varsity squad.
UPDATE organizations SET website_url = 'https://memorialhermann.org/services/specialties/tirr/patients-visitors/adapted-sports', last_ok_at = NULL, city = 'Houston', state = 'TX', state_name = 'Texas', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '59d31d42-d11e-413d-a240-1984ff932ccb' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Capital Rowing Club – Paralympic Sport Washington, D.C.: website + town. Evidence: https://capitalrowing.org/ To check: the quote does not show the town. Rows on the Anacostia River, Washington, DC; has an Adaptive Rowing program.
UPDATE organizations SET website_url = 'https://capitalrowing.org/', last_ok_at = NULL, city = 'Washington', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fc965b14-deff-42d4-9aa0-bd1e73e12723' AND website_url = 'http://www.capitalrowing.org' AND (city IS NULL OR city = '');

-- Central Florida Chapter of Paralyzed Veterans of America | PVA: town + state. Evidence: https://www.charitynavigator.org/ein/591793434 To check: town only, with no website of its own; weaker evidence (see note). Chapter's listed site centralfloridapva.org does not resolve (connection fails). Town from Charity Navigator profile only; no working official site found.
UPDATE organizations SET city = 'Sanford', state = 'FL', state_name = 'Florida', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '28bc6a69-b700-42ce-9c09-2028f37a3003' AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Cincinnati IceBreakers: website + town. Evidence: https://cincinnatisledhockey.org/schedule-2 To check: the quote does not show the town. Practices at Queen City Sportsplex (formerly Sports Plus), Cincinnati area (Evendale). Site title names the org.
UPDATE organizations SET website_url = 'https://cincinnatisledhockey.org/', last_ok_at = NULL, city = 'Cincinnati', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '89445df4-c18e-45fc-9739-38320ab554b4' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- WASA Marquette Eagles - DI: website + town + state. Evidence: https://www.wasa.org/wheelchair-basketball To check: weaker evidence (see note). NWBA lists the DI team as 'WASA Marquette Eagles - DI'; WASA's own page calls its program WASA Golden Eagles. Greater Milwaukee area.
UPDATE organizations SET website_url = 'https://www.wasa.org/wheelchair-basketball', last_ok_at = NULL, city = 'Milwaukee', state = 'WI', state_name = 'Wisconsin', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a6f3dc9e-495d-46e8-9e3b-262d809993bd' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Breckenridge Outdoor Education Center: website + town. Evidence: https://boec.org/ To check: weaker evidence (see note). Two ids share this listing (likely duplicates).
UPDATE organizations SET website_url = 'https://boec.org/', last_ok_at = NULL, city = 'Breckenridge', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'eaacb362-f349-4e89-8391-31a667802fa0' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- ParaSport Varsity: website + town + state. Evidence: https://www.parasportspokane.org/basketball To check: the quote does not show the town; weaker evidence (see note). NWBA junior team label 'ParaSport Varsity' matches ParaSport Spokane's varsity team; page title 'Wheelchair Basketball in Spokane'.
UPDATE organizations SET website_url = 'https://www.parasportspokane.org/basketball', last_ok_at = NULL, city = 'Spokane', state = 'WA', state_name = 'Washington', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '86df2578-8a06-482d-a8ba-279ebcbb447d' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Adaptive Recreation Opportunities: website + town + state. Evidence: https://www.fortcollins.gov/Activities/Recreation/Programs/Adaptive-Recreation-Opportunities To check: the website did not load cleanly from our server (blocked); the town is not in the city table, so it would get no distance; the quote does not show the town; weaker evidence (see note). Listing had no state; this is the best-known program with this exact name (City of Fort Collins). Page blocks curl (403) but loads via WebFetch. Confirm it matches the listing's other data.
UPDATE organizations SET website_url = 'https://www.fortcollins.gov/Activities/Recreation/Programs/Adaptive-Recreation-Opportunities', last_ok_at = NULL, city = 'Fort Collins', state = 'CO', state_name = 'Colorado', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'dd7d8b98-6ca7-406a-aeb9-35cc463f4139' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Zia Freewheelers Adaptive Cycling Team: town. Evidence: https://vetresourcegroup.org/business-directory/zia-freewheelers-adaptive-cycling-team/ To check: town only, with no website of its own; weaker evidence (see note). Listed website is a Facebook page (not allowed as website); no own site found. Town from a veteran resource directory listing only. Kids' adaptive cycling team.
UPDATE organizations SET city = 'Albuquerque', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0a4d2c2c-b0c0-48aa-bb90-2124aacf6474' AND (city IS NULL OR city = '');

-- Utah Rush - Prep: website + town + state. Evidence: https://www.neuroworx.org/rush/ To check: the quote does not show the town. Prep team of the Utah Rush, run by Neuroworx; page footer lists Neuroworx in Sandy, UT.
UPDATE organizations SET website_url = 'https://www.neuroworx.org/rush/', last_ok_at = NULL, city = 'Sandy', state = 'UT', state_name = 'Utah', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c68a17c8-775d-4d5c-82f0-5a1dcf2b66b5' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- OKC Wheels of Thunder: town + state. Evidence: https://www.koco.com/article/oklahoma-wheelchair-basketball-tournament/39799371 To check: town only, with no website of its own; weaker evidence (see note). Junior wheelchair basketball team; only NWBA pages and news found, no own site. Town from KOCO news (tournament at Oklahoma City University).
UPDATE organizations SET city = 'Oklahoma City', state = 'OK', state_name = 'Oklahoma', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '05a302a0-90a7-4fc3-b866-fbab561bd4dc' AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Servicemembers Undertaking Disabled Sports: website. Evidence: https://sudsdiving.org/ To check: weaker evidence (see note). Site is reachable via Exa fetch but Cloudflare shows a 'Suspected Phishing' interstitial to curl - verify by hand. No town on the page; a related site (sudsusa.org) says SUDS started at Walter Reed Army Medical Center in
UPDATE organizations SET website_url = 'https://sudsdiving.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6211ea10-82aa-4c29-ba8d-c3ad91dd496f' AND website_url = 'http://www.sudsdiving.org';

-- Barry University: website + town + state. Evidence: https://blog.barry.edu/2025/04/11/breaking-barriers-through-sports-barry-university-hosts-wheelchair-basketball-game-to-launch-new-initiative/ To check: the quote does not show the town; weaker evidence (see note). NWBA lists a 'Barry University' team. Best institutional page found is this university blog post (Adapted Sport Administration initiative); no dedicated team page found. Barry's campus is in Miami Shores; town not stated
UPDATE organizations SET website_url = 'https://blog.barry.edu/2025/04/11/breaking-barriers-through-sports-barry-university-hosts-wheelchair-basketball-game-to-launch-new-initiative/', last_ok_at = NULL, city = 'Miami Shores', state = 'FL', state_name = 'Florida', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e049733e-4bc8-469b-a806-f0ee86d7ee37' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Central Valley Ballers: town + state. Evidence: https://thebusinessjournal.com/city-of-fresno-recognizes-individuals-during-disability-awareness-month/ To check: the quote does not show the town; town only, with no website of its own; weaker evidence (see note). Only NWBA pages and a 2019 Fresno news item; no own site found.
UPDATE organizations SET city = 'Fresno', state = 'CA', state_name = 'California', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9c41e417-ac05-4141-a8ea-67c5d08949af' AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Operation Not Forgotten: town. Evidence: https://www.fox5atlanta.com/news/douglasville-organization-aims-to-improve-lives-of-veterans-first-responders To check: weaker evidence (see note). Town from FOX 5 Atlanta news headline; own site describes peer support meetings (in-person and virtual), not adaptive sports.
UPDATE organizations SET city = 'Douglasville', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '117b4124-e4e6-521c-8e96-043e465b1a16' AND (city IS NULL OR city = '');

-- SportAbility of Iowa – Eastern Iowa: town. Evidence: https://www.thegazette.com/business/u-s-paralympics-partners-with-solon-organization/ To check: town only, with no website of its own; weaker evidence (see note). Listed website is Facebook; no own site found (only GuideStar/ProPublica/volunteer listings). Town from Cedar Rapids Gazette headline.
UPDATE organizations SET city = 'Solon', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0b8f66df-b7a9-45e2-b962-27dcec706cf1' AND (city IS NULL OR city = '');

-- Memorial Rehab Sharks - DI: website + town + state. Evidence: https://www.fladaptivesports.org/memorialrehabinstitutesharks To check: the town is not in the city table, so it would get no distance; the quote does not show the town; weaker evidence (see note). Hospital adaptive sports page names 'Memorial Sharks Wheelchair Basketball Team'. Town from the Florida Adaptive Sports listing (a directory, used only for the town); Memorial Healthcare System is in South Broward.
UPDATE organizations SET website_url = 'https://www.mhs.net/services/rehabilitation/conditions-treatments-services/adaptive-sports', last_ok_at = NULL, city = 'Fort Lauderdale', state = 'FL', state_name = 'Florida', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2d889e67-c051-44d5-87e9-ca9ec27789e2' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Outdoors For All Foundation (OR): website + town + state. Evidence: https://outdoorsforall.org/contact/ To check: changes the state from OR to WA. Listing says Oregon, but the foundation's contact page lists only Washington locations (HQ Bellevue; Magnuson Park in Seattle, Issaquah, Snoqualmie Pass). No Oregon program found.
UPDATE programs SET website_url = 'https://outdoorsforall.org/', last_ok_at = NULL, city = 'Seattle', state = 'WA', state_name = 'Washington', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3178a800-7371-420f-b6be-0afb0423fb45' AND website_url = 'http://www.outdoorsforall.org' AND (city IS NULL OR city = '') AND state = 'OR';

-- Louisville Light Blue: website + town + state. Evidence: https://www.jefferson.kyschools.us/article/2126695/ To check: the website did not load cleanly from our server (dead 406); weaker evidence (see note). NWBA page for 'Louisville Light Blue' now titles the team 'Louisville Lightning - Junior (Prep)'. Run by Jefferson County Public Schools adapted sports program; JCPS also has an adapted sports page at sites.google.com/je
UPDATE organizations SET website_url = 'https://www.jefferson.kyschools.us/article/2126695/', last_ok_at = NULL, city = 'Louisville', state = 'KY', state_name = 'Kentucky', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9cf0a403-72ad-41ca-8989-323acce141e7' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Oak Lawn Park District: website + town. Evidence: https://www.olparks.com/programs/special-recreation/ To check: the website did not load cleanly from our server (blocked); weaker evidence (see note). Park district special recreation page (curl gets 403 bot block; loads via Exa fetch).
UPDATE organizations SET website_url = 'https://www.olparks.com/programs/special-recreation/', last_ok_at = NULL, city = 'Oak Lawn', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0e674621-24db-43af-a697-e19f7e07f199' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Bridge City Blazers Prep: website + town + state. Evidence: https://www.bridgecityinclusive.com/wheelchair-basketball To check: the quote does not show the town; weaker evidence (see note). Portland is per news coverage (KATU) and the org's Rose City Invitational; town not quoted on the page itself.
UPDATE organizations SET website_url = 'https://www.bridgecityinclusive.com/wheelchair-basketball', last_ok_at = NULL, city = 'Portland', state = 'OR', state_name = 'Oregon', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9746240e-c761-417a-a800-cd4c6fe52146' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Florida Sled Hockey Association: town. Evidence: https://www.sportsengine.com/org/florida-sled-hockey-association To check: town only, with no website of its own; weaker evidence (see note). Own domain floridasledhockey.com does not resolve. Town from SportsEngine org listing only.
UPDATE organizations SET city = 'Cape Coral', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd85265ac-4285-45ae-869a-ef1f8a2233ee' AND (city IS NULL OR city = '');

-- Clocktower Classic Handcycle Race: town. Evidence: https://valentinepeakendurancechanllenge.itsyourrace.com/EventCourses.aspx?id=7546 To check: town only, with no website of its own. Only a registration-platform page (ItsYourRace), no current own site; may be a past event. Note: the 2026 'Clocktower Classic' on Race Roster is a different cycling race in Oak Creek, WI.
UPDATE organizations SET city = 'Rome', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3a182d5c-829c-4197-a142-1aa273633387' AND (city IS NULL OR city = '');

-- Motor City Wheelz - Varsity: website + town + state. Evidence: https://www.motorcitywheelz.org/ To check: weaker evidence (see note). Junior team, Southeast Michigan (Metro Detroit); exact practice town not stated.
UPDATE organizations SET website_url = 'https://www.motorcitywheelz.org/', last_ok_at = NULL, city = 'Detroit', state = 'MI', state_name = 'Michigan', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fe4b2548-859f-4a3a-8fa0-cd80f0cdc5ec' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Craig Hospital Paralympic Sports: town. Evidence: https://craighospital.org/wp-content/uploads/sites/TRec.ResourceGuide.CraigHospital.pdf To check: weaker evidence (see note). Program page requires JavaScript (307 redirect for curl). Quote is from Exa's text of Craig Hospital's own pages (resource guide/campus text). Verify program URL in a browser.
UPDATE organizations SET city = 'Englewood', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'acb82e31-821b-4f82-b99b-2b0671c2d953' AND (city IS NULL OR city = '');

-- Bridge City Inclusive Sports: website + town + state. Evidence: https://www.bridgecityinclusive.com/ To check: the quote does not show the town. Portland, OR area; town not quoted on page (Rolling Blazers / Rose City Invitational).
UPDATE organizations SET website_url = 'https://www.bridgecityinclusive.com/', last_ok_at = NULL, city = 'Portland', state = 'OR', state_name = 'Oregon', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '50fe8320-f4c6-49f3-b17d-695061381856' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Tri County Special Recreation Association: town. Evidence: https://www.whereorg.com/tri-county-special-recreation-association-29885613 To check: town only, with no website of its own; weaker evidence (see note). No own site found; only business-directory listings. Romeoville is also home to Northern Will County SRA (nwcsra.org); this may be a former/merged name, not confirmed.
UPDATE organizations SET city = 'Romeoville', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7013af63-89c4-4e2f-b13d-fbde8d431613' AND (city IS NULL OR city = '');

-- Muskogee Rollin' Raiders: town. Evidence: https://cityofmuskogeefoundation.org/muskogee-rollin-raiders/ To check: town only, with no website of its own; weaker evidence (see note). Only a 2017 grant-story page from the City of Muskogee Foundation and old NWBA pages; no own site found. Activity status unknown.
UPDATE organizations SET city = 'Muskogee', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4072ccf9-99a5-4697-9ba6-db4a7986dab7' AND (city IS NULL OR city = '');

-- PA Lions - Prep: website + town + state. Evidence: https://cilcp.org/event/category/cilcp-adaptive-sports/youth-wheelchair-basketball/ To check: the quote does not show the town. Run by the Center for Independent Living of Central PA; practices at Spooky Nook Sports in Manheim (Lancaster County).
UPDATE organizations SET website_url = 'https://cilcp.org/event/category/cilcp-adaptive-sports/youth-wheelchair-basketball/', last_ok_at = NULL, city = 'Manheim', state = 'PA', state_name = 'Pennsylvania', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '90db4a12-648f-4d03-ba9c-b753c8483012' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Louisville Metro Parks and Recreation Adaptive and Inclusive Recreation: website + town. Evidence: https://louisvilleky.gov/government/parks-and-recreation To check: the website did not load cleanly from our server (blocked); the quote does not show the town; weaker evidence (see note). City Parks and Recreation page (blocks curl via Cloudflare; loaded via Exa fetch) links the Adaptive and Inclusive Recreation division. Programs center on the Berrytown Adaptive and Inclusive Recreation Center. A dedicat
UPDATE organizations SET website_url = 'https://louisvilleky.gov/government/parks-and-recreation', last_ok_at = NULL, city = 'Louisville', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '683062e3-0ff0-4c15-b863-74f44baf2d00' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Community Rowing, Inc. | CRI: website + town + state. Evidence: https://communityrowing.org/para/ To check: the town is not in the city table, so it would get no distance. Para rowing program at the Harry Parker Boathouse (Boston's Brighton neighborhood).
UPDATE organizations SET website_url = 'https://communityrowing.org/para/', last_ok_at = NULL, city = 'Brighton', state = 'MA', state_name = 'Massachusetts', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c3062250-922f-412b-8152-80499bd3dff0' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- WASA Marquette Eagles Junior - Prep: website + town + state. Evidence: https://www.wasa.org/wheelchair-basketball To check: the quote does not show the town. Junior prep team of WASA; page says 'Wheelchair Basketball in Greater Milwaukee'.
UPDATE organizations SET website_url = 'https://www.wasa.org/wheelchair-basketball', last_ok_at = NULL, city = 'Milwaukee', state = 'WI', state_name = 'Wisconsin', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4529c5a7-4264-4329-97bb-07ee2cb2e975' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Penn State Nittany Lions: website + town + state. Evidence: https://gopsusports.com/adaptive-athletics To check: the town is not in the city table, so it would get no distance; the quote does not show the town; weaker evidence (see note). Penn State's official athletics page for the adaptive program (NWBA team 'Penn State Nittany Lions'). Main campus University Park; town not quoted on page.
UPDATE organizations SET website_url = 'https://gopsusports.com/adaptive-athletics', last_ok_at = NULL, city = 'University Park', state = 'PA', state_name = 'Pennsylvania', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b26d866d-52d6-4e74-9374-a19d1c275ead' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Best Day Foundation: website + town. Evidence: https://bestdayfoundation.org/about/ To check: weaker evidence (see note). Listed website was Facebook; own site found. Has chapters in California, New Jersey, Florida and Virginia; Santa Cruz is the founding town.
UPDATE organizations SET website_url = 'https://bestdayfoundation.org/', last_ok_at = NULL, city = 'Santa Cruz', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '487cbb2f-6b2b-4691-8173-60663ff24443' AND website_url = 'https://www.facebook.com/BestDayFoundation/' AND (city IS NULL OR city = '');

-- Denver Curling: website. Evidence: https://denvercurlingclub.com/index.php/curling/adaptive-curling To check: weaker evidence (see note). Club is in the Denver metro (Golden); town not confirmed on page, left blank.
UPDATE organizations SET website_url = 'https://denvercurlingclub.com/index.php/curling/adaptive-curling', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fdb1a44a-612e-4de9-a0e3-bc5fc79f87ff' AND (website_url IS NULL OR website_url = '');

-- ParaSport DII: website + town + state. Evidence: https://www.parasportspokane.org/basketball To check: weaker evidence (see note). NWBA team page titles this team 'ParaSport Spokane - DII'. 'DII' is the NWBA division label.
UPDATE organizations SET website_url = 'https://www.parasportspokane.org/basketball', last_ok_at = NULL, city = 'Spokane', state = 'WA', state_name = 'Washington', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '70808cfb-0871-4b82-815b-f28f3b3d7604' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Texas Adaptive Aquatics: website + town. Evidence: https://www.taasports.org/ To check: the town is not in the city table, so it would get no distance. 
UPDATE organizations SET website_url = 'https://www.taasports.org/', last_ok_at = NULL, city = 'Huffman', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '349c968f-e08f-4c77-ab36-37dd9513717e' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Michigan Rollverines: website + town + state. Evidence: https://record.umich.edu/articles/michigan-medicine-staffer-coaches-wheelchair-basketball/ To check: the website did not load cleanly from our server (blocked); the quote does not show the town; weaker evidence (see note). UM pages block curl (403); loaded via Exa fetch. The UM pages do not spell out the town. Ann Arbor comes from an MLive report on Rollverines practice ('ANN ARBOR, MI').
UPDATE organizations SET website_url = 'https://medicine.umich.edu/dept/pmr/patient-care/therapeutic-other-services/university-michigan-adaptive-inclusive-sports-experience-umaise', last_ok_at = NULL, city = 'Ann Arbor', state = 'MI', state_name = 'Michigan', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd61596e3-0fdf-4aad-b614-5739069c41bf' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Palm Beach County Therapeutic Recreation: website + town. Evidence: https://discover.pbc.gov/parks/Pages/Therapeutic-Recreation.aspx To check: the town is not in the city table, so it would get no distance. Adapted sports page: https://discover.pbc.gov/parks/Pages/Adapted-Sports.aspx
UPDATE organizations SET website_url = 'https://discover.pbc.gov/parks/Pages/Therapeutic-Recreation.aspx', last_ok_at = NULL, city = 'Lake Worth', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '422ffb08-fd48-4f1a-a8b8-181e92cd7a26' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Fayetteville-Cumberland Parks & Rec: website + town. Evidence: https://www.fayettevillenc.gov/Parks-and-Recreation/Sports-Athletics/Adaptive-Sports To check: the website did not load cleanly from our server (blocked); weaker evidence (see note). fcpr.us URL redirects to the city site. Direct curl gets 403 (bot block); page loaded via Exa fetch.
UPDATE organizations SET website_url = 'https://www.fayettevillenc.gov/Parks-and-Recreation/Sports-Athletics/Adaptive-Sports', last_ok_at = NULL, city = 'Fayetteville', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b0228cc8-162b-4193-86ee-f720231aca75' AND website_url = 'https://fcpr.us/athletics/adaptive-sports-3048' AND (city IS NULL OR city = '');

-- WWAR Generals: website + town + state. Evidence: https://woundedwarriorsabilitiesranch.org/lurie-park/ To check: weaker evidence (see note). WWAR offers wheelchair basketball and rugby. The Generals are its team (NWBA lists 'WWAR Generals').
UPDATE organizations SET website_url = 'https://woundedwarriorsabilitiesranch.org/adaptive-sports/', last_ok_at = NULL, city = 'Pinellas Park', state = 'FL', state_name = 'Florida', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '164f2944-155b-4b92-b123-661862140b3b' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- NY Rollin Fury Varsity: website + town + state. Evidence: https://www.nyrollingfury.org/contact-us/ To check: the quote does not show the town; weaker evidence (see note). Practice is in Manhattan (New York, NY). The club serves Greater NY, Long Island and NJ. 'Varsity' is the NWBA junior division label.
UPDATE organizations SET website_url = 'https://nyrollingfury.org/', last_ok_at = NULL, city = 'New York', state = 'NY', state_name = 'New York', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9b072e2a-1a6b-44d2-b6ef-016a0457ce31' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Katie's KOMETS Prep: website + town + state. Evidence: https://www.katieskomets.org/ To check: weaker evidence (see note). 'Prep' is the NWBA junior division label.
UPDATE organizations SET website_url = 'https://www.katieskomets.org/', last_ok_at = NULL, city = 'Philadelphia', state = 'PA', state_name = 'Pennsylvania', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ee52d51a-9aac-4d58-9127-6b1ccbe89412' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Detroit Pistons: town + state. Evidence: https://nwbamerch.com/pages/detroit-wheelchair-pistons-built-in-detroit-rolling-nationwide To check: town only, with no website of its own; weaker evidence (see note). NWBA wheelchair basketball team; no own website found (only NWBA team pages and the NWBA merch store). Supported by the Detroit Pistons and Reimagine Life Foundation (nba.com/pistons).
UPDATE organizations SET city = 'Detroit', state = 'MI', state_name = 'Michigan', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '36db2aa9-1661-4601-866e-c6a1465a86c7' AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Coffee and Tea Socials: town. Evidence: https://www.va.gov/white-river-junction-health-care/events/ To check: the quote does not show the town. Events at White River Junction VA Medical Center ("addressLocality":"White River Junction").
UPDATE programs SET city = 'White River Junction', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'program-va-white-river-coffee-socials' AND (city IS NULL OR city = '');

-- Miss ThunderCats: town + state. Evidence: https://www.lakeshore.org/activity/sports-recreation/tournaments/2026-tip-off-club-classic/ To check: town only, with no website of its own; weaker evidence (see note). Older senior team linked to the Mississippi Wheelcats. mississippiwheelcats.com does not load. Evidence is the Lakeshore Foundation 2026 tournament team list (loaded via Exa; curl 403).
UPDATE organizations SET city = 'Jackson', state = 'MS', state_name = 'Mississippi', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '1d6fd529-296b-40ca-9f66-dcce18202603' AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Dallas Jr. Wheelchair Mavericks: website + town. Evidence: https://www.dallasjuniorwheelchairmavericks.org/ To check: weaker evidence (see note). Official site replaces the Facebook page. The site text gives no town beyond the team name; it serves the DFW area. Town taken from the name.
UPDATE organizations SET website_url = 'https://www.dallasjuniorwheelchairmavericks.org/', last_ok_at = NULL, city = 'Dallas', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '23e3f33a-1296-44e1-8517-e242c7dcadab' AND website_url = 'https://www.facebook.com/DallasJrMavs/' AND (city IS NULL OR city = '');

-- Adaptive Cycling Omnium: website + town. Evidence: http://www.kansascyclist.com/events/KansasAdaptiveCyclingOmnium.html To check: the website did not load cleanly from our server (blocked). This is a yearly race event run by Wichita Adaptive Sports, not an organization.
UPDATE organizations SET website_url = 'https://www.wichitaadaptivesports.com/', last_ok_at = NULL, city = 'Wichita', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'abf56b30-95cf-45b1-a8fd-6d56248b4199' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- LV Silver Bandits: website + town + state. Evidence: https://www.snadaptive.org/services To check: the quote does not show the town. Games at Dula Gym, Las Vegas, NV.
UPDATE organizations SET website_url = 'https://www.snadaptive.org/services', last_ok_at = NULL, city = 'Las Vegas', state = 'NV', state_name = 'Nevada', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5ca6baf6-f9ec-4946-9dc5-4a2f13df0eae' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Junior Titans - Prep: website + town + state. Evidence: https://www.rainieradaptivesports.org/programs To check: weaker evidence (see note). 'Prep' is the NWBA junior division label. Match is likely but not certain: NWBA lists Tacoma Titans in the Junior Prep division.
UPDATE organizations SET website_url = 'https://www.rainieradaptivesports.org/programs', last_ok_at = NULL, city = 'Tacoma', state = 'WA', state_name = 'Washington', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '001449b8-0d18-4548-9a5c-2b55d5ff342b' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Adaptive Mobility Providers, Inc.: website + town + state. Evidence: https://www.adaptivemobilityproviders.org/programs To check: weaker evidence (see note). Home page says 'Southern Wisconsin — Near Chicago'. Programs page loaded via Exa (JS site).
UPDATE organizations SET website_url = 'https://www.adaptivemobilityproviders.org/', last_ok_at = NULL, city = 'Elkhorn', state = 'WI', state_name = 'Wisconsin', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e9e80817-0a44-45fb-b014-5d8c83358d29' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Mighty Penguins Sled Hockey Organization: website + town. Evidence: https://www.penguinssledhockey.org/about/about-us/158206 To check: the town is not in the city table, so it would get no distance; the quote does not show the town. Pittsburgh-area program. Home ice UPMC Lemieux Sports Complex is in Cranberry Township; the page does not name the town. Use Pittsburgh if a metro name is preferred.
UPDATE organizations SET website_url = 'https://www.penguinssledhockey.org/', last_ok_at = NULL, city = 'Cranberry Township', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a4310058-ead1-4f6f-a8f1-69001cbff478' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Crotched Mountain Accessible Recreation and Sports: website + town. Evidence: https://cmf.org/cmfkids/cmfkidsrecreation/ To check: the quote does not show the town. CMARS is a program of Crotched Mountain Foundation. Its adaptive ski program runs at Crotched Mountain Ski & Ride in Bennington NH (per Kelly Brush Active Project and Inclusive Rec listings). The CMF page itself does not
UPDATE organizations SET website_url = 'https://cmf.org/cmfkids/cmfkidsrecreation/', last_ok_at = NULL, city = 'Bennington', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f29dfae2-b211-4757-89dc-2a4899d6be90' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Adaptive Sports Connection: website + town. Evidence: https://adaptivesportsconnection.org/ To check: weaker evidence (see note). Two listing ids, likely duplicates.
UPDATE organizations SET website_url = 'https://adaptivesportsconnection.org/', last_ok_at = NULL, city = 'Powell', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4805011c-1c3e-403b-87de-26977f7359b9' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Wounded Warrior Adaptive Sports: town. Evidence: https://causes.benevity.org/causes/840-465169167?lang=en To check: town only, with no website of its own; weaker evidence (see note). No own website found; listing has only Facebook. Town from a nonprofit registry (Benevity) and a government vendor profile. A 2014 Joint Base Langley-Eustis article places it in the Hampton Roads area. Weak evidence.
UPDATE organizations SET city = 'Virginia Beach', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4496c3b4-4511-4a92-b30c-40006a38027d' AND (city IS NULL OR city = '');

-- Cincinnati Royals: town + state. Evidence: https://www.fox19.com/2020/03/07/two-cincinnati-wheelchair-basketball-teams-heading-nationals/ To check: town only, with no website of its own; weaker evidence (see note). No own website. Older news says the team is run by the Cincinnati Recreation Commission (CRC), but the CRC therapeutic recreation page (https://www.cincinnati-oh.gov/crc/programs/therapeutic-recreation-and-inclusion/) do
UPDATE organizations SET city = 'Cincinnati', state = 'OH', state_name = 'Ohio', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '1067810d-40fc-4327-8444-17ed8300d9db' AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Metro Parks Tacoma Adaptive Recreation: website + town. Evidence: https://www.parkstacoma.gov/activities-and-sports/category/as/adaptive/ To check: the website did not load cleanly from our server (blocked); weaker evidence (see note). Metro Parks Tacoma now calls itself Parks Tacoma. Its site blocks curl (Cloudflare); loaded via Exa.
UPDATE organizations SET website_url = 'https://www.parkstacoma.gov/activities-and-sports/category/as/adaptive/', last_ok_at = NULL, city = 'Tacoma', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'cf2528b0-cd7a-439f-8ff5-4728ec61f1b6' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Charlotte Hornets DI: website + town + state. Evidence: https://rollinhornets.org/about/ To check: the website did not load cleanly from our server (dead 000); weaker evidence (see note). NWBA lists the DI team as 'Charlotte Hornets DI'. Site loaded via Exa (curl timed out).
UPDATE organizations SET website_url = 'https://rollinhornets.org/', last_ok_at = NULL, city = 'Charlotte', state = 'NC', state_name = 'North Carolina', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '1fa4794b-4fd7-4490-b16f-a41cc886426f' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Team River Runner Texas: website + town. Evidence: https://www.teamriverrunner.org/san-marcos-tx/ To check: weaker evidence (see note). Only Texas chapter on the national list. Same chapter as the 'Team River Runner – Texas Hill Country' listing (likely duplicate).
UPDATE organizations SET website_url = 'https://www.teamriverrunner.org/san-marcos-tx/', last_ok_at = NULL, city = 'San Marcos', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e905b1aa-27fa-4d77-919c-912119c5333d' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- City of Sacramento, Department of Parks and Recreation Access Leisure: website + town. Evidence: https://www.cityofsacramento.gov/ypce/access-leisure To check: weaker evidence (see note). Same program as the Access Leisure – Paralympic Sport Sacramento listing (likely a duplicate).
UPDATE organizations SET website_url = 'https://www.cityofsacramento.gov/ypce/access-leisure', last_ok_at = NULL, city = 'Sacramento', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '11105c30-7e83-4506-b4c4-306881fa9425' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Adaptive Ski Association – West Michigan: website + town + state. Evidence: https://www.asa-wm.org/athletes To check: the town is not in the city table, so it would get no distance. Formerly Cannonsburg Challenged Ski Association; also runs sessions at Crystal Mountain Resort, Thompsonville, MI.
UPDATE organizations SET website_url = 'https://www.asa-wm.org/', last_ok_at = NULL, city = 'Belmont', state = 'MI', state_name = 'Michigan', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6953555c-d682-47c0-8367-8eb798429a42' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Mecklenburg County Park and Recreation, Therapeutic Recreation Section: website + town. Evidence: https://parkandrec.mecknc.gov/ To check: weaker evidence (see note). Department homepage; specific Therapeutic Recreation page not confirmed.
UPDATE organizations SET website_url = 'https://parkandrec.mecknc.gov/', last_ok_at = NULL, city = 'Charlotte', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b540e8db-2d8e-4ce2-a273-8584124c8cf6' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- NYU Veterans Writing Workshop: town. Evidence: https://www.nyuvetsworkshop.org/ To check: town only, with no website of its own. Writing workshop, not a sport program.
UPDATE programs SET city = 'New York', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0fef2a6e-b9f5-5d41-b23a-16d617321395' AND (city IS NULL OR city = '');

-- Memorial Rehab Sharks - DII: website + town + state. Evidence: https://www.mhs.net/services/rehabilitation/conditions-treatments-services/adaptive-sports To check: the quote does not show the town. 'DII' is a division label. Program of Memorial Rehabilitation Institute (Memorial Healthcare System), Hollywood FL; page footer names Hollywood, FL. Same program as 'Memorial's Fort Lauderdale Sharks'.
UPDATE organizations SET website_url = 'https://www.mhs.net/services/rehabilitation/conditions-treatments-services/adaptive-sports', last_ok_at = NULL, city = 'Hollywood', state = 'FL', state_name = 'Florida', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '88b57b66-1acd-4dea-9f9e-73c5b8e4d58f' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Rising Strides Therapy Ranch: town. Evidence: https://risingstridestherapyranch.org/ To check: town only, with no website of its own. Mailing address is in Garden City, ID; ranch is in the Eagle area.
UPDATE organizations SET city = 'Eagle', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '878c7d67-d9f9-5afa-bf90-b960fd28f13c' AND (city IS NULL OR city = '');

-- Milagro Aquatics: town. Evidence: https://www.milagroaquatics.com/contacts.html To check: town only, with no website of its own. Aquatic rehabilitation business; town from contact page (mailing address).
UPDATE organizations SET city = 'Albuquerque', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '73d84ad6-9a1a-4e72-bb7a-a3ce1403778c' AND (city IS NULL OR city = '');

-- Break The Barriers, Inc.: town. Evidence: https://breakthebarriers.org/contact/ To check: town only, with no website of its own. 
UPDATE organizations SET city = 'Fresno', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6d640a0e-d51d-4b1c-a733-c58e62d57414' AND (city IS NULL OR city = '');

-- Rancho Halos- Prep: website + town + state. Evidence: https://dhs.lacounty.gov/rancho/patient-programs-and-services/wheelchair-sports-program/ To check: the quote does not show the town. 'Prep' is a division label. Rancho Los Amigos National Rehabilitation Center wheelchair sports program; Rancho Los Amigos is in Downey, CA (town not quoted on this page).
UPDATE organizations SET website_url = 'https://dhs.lacounty.gov/rancho/patient-programs-and-services/wheelchair-sports-program/', last_ok_at = NULL, city = 'Downey', state = 'CA', state_name = 'California', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '77b5dae4-be5c-41c5-8fd6-4f90407dcfd9' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Artistic Swimming for Athletes with Disabilities (Artistic Swim AWD): website + town. Evidence: https://www.bayarea-artisticswimming.com/ To check: the website did not load cleanly from our server (GAMBLING); weaker evidence (see note). Site header reads 'Bay Area Artistic SwimTeam for Athletes with Disabilities (AWD)'; strong but not certain match to the listed name.
UPDATE organizations SET website_url = 'https://www.bayarea-artisticswimming.com/', last_ok_at = NULL, city = 'San Jose', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9f74c621-d344-4d93-9a9f-53c9ce802726' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- UCLA Adaptive Programs: website + town. Evidence: https://recreation.ucla.edu/rec-programs/adaptive-recreation To check: town only, with no website of its own. Old URL redirects to the new Adaptive Recreation page.
UPDATE programs SET website_url = 'https://recreation.ucla.edu/rec-programs/adaptive-recreation', last_ok_at = NULL, city = 'Los Angeles', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a7e22239-6e00-4474-94ba-a48558223359' AND website_url = 'https://www.recreation.ucla.edu/adaptiveprograms' AND (city IS NULL OR city = '');

-- Appalachian Trauma and Resiliency Center: town. Evidence: https://www.wvtrauma.org/ To check: town only, with no website of its own. Counseling/trauma center, not a sports program.
UPDATE organizations SET city = 'Fairmont', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f88dd138-0dee-5e95-a1fb-b4c7ecc20766' AND (city IS NULL OR city = '');

-- PDX Fencing: website + town. Evidence: https://pdxfencing.com/contact-2/ To check: town only, with no website of its own. Site title says 'Learn Fencing in Portland - PDX Fencing Academy'; contact page address is in Beaverton. No adaptive/wheelchair fencing mentioned on the homepage.
UPDATE organizations SET website_url = 'https://pdxfencing.com/', last_ok_at = NULL, city = 'Beaverton', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8e9949dd-f309-4d91-81d9-1295b4587c3f' AND website_url = 'http://www.pdxfencing.com' AND (city IS NULL OR city = '');

-- United States Adaptive Recreation Center: website + town. Evidence: https://www.usarc.org/contact-us/ To check: town only, with no website of its own. 
UPDATE organizations SET website_url = 'https://www.usarc.org/', last_ok_at = NULL, city = 'Big Bear Lake', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e1066bc4-0249-49ef-916f-ce9ec0127246' AND website_url = 'http://www.usarc.org' AND (city IS NULL OR city = '');

-- Memorial's Fort Lauderdale Sharks: website + town. Evidence: https://www.mhs.net/services/rehabilitation/conditions-treatments-services/adaptive-sports To check: the quote does not show the town; weaker evidence (see note). Program of Memorial Rehabilitation Institute, Hollywood FL (page footer: Hollywood, FL). Likely duplicate of 'Memorial Rehab Sharks - DII'.
UPDATE organizations SET website_url = 'https://www.mhs.net/services/rehabilitation/conditions-treatments-services/adaptive-sports', last_ok_at = NULL, city = 'Hollywood', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3b3fc619-877e-4846-bcb9-ad3383fdaaac' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Adventures Without Limits | AWL: website + town + state. Evidence: https://awloutdoors.org/ To check: the quote does not show the town. Office in Forest Grove, OR (site footer).
UPDATE organizations SET website_url = 'https://awloutdoors.org/', last_ok_at = NULL, city = 'Forest Grove', state = 'OR', state_name = 'Oregon', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '983176b3-be20-4af0-a13a-71075ea7f58b' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Kinetic Kids – San Antonio: website + town. Evidence: https://kinetickidstx.org/ To check: town only, with no website of its own. 
UPDATE organizations SET website_url = 'https://kinetickidstx.org/', last_ok_at = NULL, city = 'San Antonio', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a10b1e03-2223-4db7-bdd9-79a067d99f60' AND website_url = 'http://www.kinetickidstx.org' AND (city IS NULL OR city = '');

-- North Jersey Navigators: town. Evidence: https://www.navigatorsadaptivesports.com/ To check: town only, with no website of its own. Site name is Navigators Adaptive Sports Club.
UPDATE organizations SET city = 'Bayonne', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6c47d309-c28b-4071-9416-3d5af182b21c' AND (city IS NULL OR city = '');

-- Push America: website + town. Evidence: https://www.abilityexperience.org/ To check: the quote does not show the town. Push America was renamed The Ability Experience; office in Charlotte (page: 'took on Charlotte's 10k race').
UPDATE organizations SET website_url = 'https://www.abilityexperience.org/', last_ok_at = NULL, city = 'Charlotte', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '37a90e90-fd9f-4709-b083-7a529107f49d' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Recovery Point West Virginia: town. Evidence: https://recoverypointwv.org/bridge/ To check: town only, with no website of its own. Addiction recovery program, not a sports program.
UPDATE organizations SET city = 'Huntington', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a761c45d-a555-5751-9efd-0252295b395c' AND (city IS NULL OR city = '');

-- Massachusetts Association for the Blind & Visually Impaired: website + town. Evidence: https://www.mabvi.org/contact_us/ To check: the town is not in the city table, so it would get no distance; town only, with no website of its own; weaker evidence (see note). Listed website was Facebook; official site is mabvi.org. Main office Allston (Boston); also a Central MA office in Worcester.
UPDATE organizations SET website_url = 'https://www.mabvi.org/', last_ok_at = NULL, city = 'Allston', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6a960de2-b401-4e15-ad3c-4d763d8c3d3e' AND website_url = 'https://www.facebook.com/mabvi/' AND (city IS NULL OR city = '');

-- Rancho Halos- Varsity: website + town + state. Evidence: https://dhs.lacounty.gov/rancho/patient-programs-and-services/wheelchair-sports-program/ To check: the quote does not show the town. 'Varsity' is a division label; same program as Rancho Halos- Prep. Rancho Los Amigos is in Downey, CA (town not quoted on this page).
UPDATE organizations SET website_url = 'https://dhs.lacounty.gov/rancho/patient-programs-and-services/wheelchair-sports-program/', last_ok_at = NULL, city = 'Downey', state = 'CA', state_name = 'California', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c5152f18-8fb5-4a02-a16d-bae2c4b76528' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- City of Eugene Adaptive Recreation Services: website + town. Evidence: https://www.eugene-or.gov/134/Adaptive To check: the website did not load cleanly from our server (blocked); town only, with no website of its own. Old /recadaptive URL; current page 'Adaptive at Hilyard' (Hilyard Community Center). Site blocks curl (Cloudflare 403) but loads in a browser/crawler.
UPDATE organizations SET website_url = 'https://www.eugene-or.gov/134/Adaptive', last_ok_at = NULL, city = 'Eugene', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fd2f30c5-1645-49b5-930f-f33e9fa1ef06' AND website_url = 'http://www.eugene-or.gov/recadaptive' AND (city IS NULL OR city = '');

-- Turnstone Endeavor Games: website + town. Evidence: https://turnstone.org/ To check: the town is not in the city table, so it would get no distance. Event hosted by Turnstone; page text: 'The Turnstone Endeavor Games are an opportunity for athletes with physical disabilities'.
UPDATE organizations SET website_url = 'https://turnstone.org/sports-rec/endeavor-games', last_ok_at = NULL, city = 'Fort Wayne', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '914a995e-dac3-4544-9dac-432e2a444586' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- NEPVA Celtics: website. Evidence: https://www.pvanewengland.org/activities-events/adaptive-sports/basketball/ To check: weaker evidence (see note). Wheelchair basketball team of New England PVA. Official page names no town; 2019 local news describes the team as Brockton-based (not confirmed on official site).
UPDATE organizations SET website_url = 'https://www.pvanewengland.org/activities-events/adaptive-sports/basketball/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3cb0c41f-1e41-4f2b-a618-add97526f333' AND (website_url IS NULL OR website_url = '');

-- Shepherd Navy Stealers: website + town + state. Evidence: https://shepherd.org/treatment/services-clinics/adaptive-sports/ To check: the quote does not show the town. 'Navy' is a squad label of the Shepherd Stealers wheelchair basketball team, Shepherd Center adaptive sports (page: 'individuals with physical disabilities in the Atlanta area').
UPDATE organizations SET website_url = 'https://shepherd.org/treatment/services-clinics/adaptive-sports/', last_ok_at = NULL, city = 'Atlanta', state = 'GA', state_name = 'Georgia', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3c27ff11-8568-4cdc-92bb-6076ea22e6b2' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Gleneayre Equestrian Program: town + state. Evidence: https://www.usef.org/about-us/community-building/community-outreach/gleneayre To check: changes the state from SC to NJ; town only, with no website of its own. STATE MISMATCH: listing says SC but US Equestrian page places it in Lumberton, NJ (site uses a 609 NJ area code). Official site itself names no town.
UPDATE programs SET city = 'Lumberton', state = 'NJ', state_name = 'New Jersey', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '52aec1bf-02e4-5f5e-bd01-16ac5d3b1e3e' AND (city IS NULL OR city = '') AND state = 'SC';

-- Preferred Behavioral Health Group: town. Evidence: https://www.preferredbehavioral.org/ To check: the quote does not show the town; town only, with no website of its own. Behavioral health provider with many Ocean/Monmouth County locations (Lakewood, Toms River, Brick, Barnegat, Eatontown); most locations are in Lakewood. Not a sports program.
UPDATE organizations SET city = 'Lakewood', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2a1f6536-6938-5e14-ad1b-96fe8bd23f2b' AND (city IS NULL OR city = '');

-- Achilles International: town from the address on its own website (http://www.achillesinternational.org/). To check: a national name: a headquarters town would make it look local.
UPDATE organizations SET city = 'New York', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'bf59cd3d-c859-45a7-8e14-2ebb835f8df4' AND (city IS NULL OR city = '');

-- BlazeSports America: town from the address on its own website (https://www.blazesports.org). To check: a national name: a headquarters town would make it look local.
UPDATE organizations SET city = 'Atlanta', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '56c7c499-0d9a-471d-98d0-59e6201e4d51' AND (city IS NULL OR city = '');

-- CABVI: town from the address on its own website (http://www.cabvi.org). To check: the page shows 2 different towns.
UPDATE organizations SET city = 'Utica', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '43940628-94fc-40b1-9d98-961e8842dbf3' AND (city IS NULL OR city = '');

-- Courage Kenny Rehabilitation Institute – Twin Cities: town from the address on its own website (http://www.allinahealth.org/adaptivesports). To check: the page shows 6 different towns.
UPDATE organizations SET city = 'Minneapolis', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3d82c0f6-0815-4711-b459-2895d8a70602' AND (city IS NULL OR city = '');

-- Disabled Sports USA Orange County – The Achievers: town from the address on its own website (http://www.theachievers.org/). To check: a national name: a headquarters town would make it look local.
UPDATE organizations SET city = 'Irvine', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7a219a82-f5c3-4984-8711-e6c738b9d268' AND (city IS NULL OR city = '');

-- Miami-Dade Parks and Recreation – Paralympic Sport Miami: town from the address on its own website (http://www.miamidade.gov/parks/accessibility-paralympic-sports.asp). To check: the page shows 2 different towns.
UPDATE organizations SET city = 'Miami', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '449d8205-f59c-4010-b0d9-354c6c1eec00' AND (city IS NULL OR city = '');

-- National Sports Center for the Disabled – Winter Park & Denver: town from the address on its own website (http://www.nscd.org). To check: the page shows 2 different towns; a national name: a headquarters town would make it look local.
UPDATE organizations SET city = 'Golden', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '22057a75-49fc-42a6-a68e-557692cdea12' AND (city IS NULL OR city = '');

-- National Wheelcats: town from the address on its own website (http://www.nationalwheelcats.org). To check: a national name: a headquarters town would make it look local.
UPDATE organizations SET city = 'Guthrie', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a04151bd-2359-45f9-bf83-518ce2597127' AND (city IS NULL OR city = '');

-- Ocean Healing Group: town from the address on its own website (https://en.wikipedia.org/wiki/Ocean_Healing_Group). To check: the listing had no state.
UPDATE organizations SET city = 'Aspen', state = 'CO', state_name = 'Colorado', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6194a27a-8240-4ac1-9163-39276a16bbc0' AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Outdoors for All Foundation: town from the address on its own website (http://www.outdoorsforall.org). To check: the page shows 4 different towns.
UPDATE organizations SET city = 'Seattle', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8001d355-241d-4379-a48e-bd68601a6a83' AND (city IS NULL OR city = '');

-- Paralyzed Veterans of America: town from the address on its own website (http://www.pva.org). To check: a national name: a headquarters town would make it look local.
UPDATE organizations SET city = 'Washington', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6d4a554e-4011-438d-823d-e1b9468c59af' AND (city IS NULL OR city = '');

-- Seattle Wheelchair Rugby Association: town from the address on its own website (http://www.seattleslam.org). To check: the page shows 2 different towns.
UPDATE organizations SET city = 'Seattle', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '42a97335-4961-4ec6-b5a7-8b5029e4e99e' AND (city IS NULL OR city = '');

-- Team River Runner – Walter Reed: town from the address on its own website (https://www.teamriverrunner.org/get-involved/chapters/maryland-walter-reed-national-military-medical-center-wrnmmc/). To check: the page shows 2 different towns.
UPDATE organizations SET city = 'Bethesda', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e52d32b3-4683-4782-b31f-d1574c8c5f64' AND (city IS NULL OR city = '');

-- United States Association of Blind Athletes (USABA): town from the address on its own website (http://www.usaba.org). To check: a national name: a headquarters town would make it look local.
UPDATE organizations SET city = 'Colorado Springs', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '928ed8bf-d4ee-4211-818a-8218c7292601' AND (city IS NULL OR city = '');

-- University of Southern Mississippi Technology Learning Center: town from the address on its own website (https://www.usm.edu/ids/index.php). To check: the page shows 2 different towns.
UPDATE organizations SET city = 'Hattiesburg', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '93b0cd0b-d4b1-48b9-bdf0-ebdfadee8de0' AND (city IS NULL OR city = '');

-- Wheelchair & Ambulatory Sports, USA: town from the address on its own website (http://www.wasusa.org/). To check: a national name: a headquarters town would make it look local.
UPDATE organizations SET city = 'Littleton', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4264bf7e-2035-479a-b819-2b009306dbc3' AND (city IS NULL OR city = '');

-- Choctaw Nation of Oklahoma: town from the address on its own website (https://www.choctawnation.com/services/warrior-wellness/). To check: the page shows 2 different towns.
UPDATE organizations SET city = 'Durant', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd393bfef-a784-5737-9306-6035357df835' AND (city IS NULL OR city = '');

-- NAMI Dallas Southern Sector: town from the address on its own website (https://namitexas.org/about-nami-texas/nami-affiliates-in-texas/nami-dallas-southern-sector/). To check: the page shows 2 different towns.
UPDATE organizations SET city = 'Austin', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '58c66321-5794-57b8-9ffa-2dd30b6da150' AND (city IS NULL OR city = '');

-- VA Puget Sound Health Care: town from the address on its own website (https://www.va.gov/puget-sound-health-care/). To check: the page shows 2 different towns.
UPDATE organizations SET city = 'Seattle', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'beeb29cf-78df-5f17-8178-f5a568c3e6b4' AND (city IS NULL OR city = '');

-- Appalachian Center for Independent Living: town from the address on its own website (https://www.wvacil.org/veteran-services). To check: the page shows 5 different towns.
UPDATE organizations SET city = 'Charleston', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9c65d6fc-badf-5ad6-b932-b8aecccb942a' AND (city IS NULL OR city = '');

-- Nevada Arts Council: town from the address on its own website (https://www.nvartscouncil.org/about/programs/veterans-initiatives/). To check: the page shows 2 different towns.
UPDATE organizations SET city = 'Reno', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ec7e8e20-d676-5805-9932-126e2da8cb75' AND (city IS NULL OR city = '');

-- Adaptive Sports Program New Mexico: town from the address on its own website (http://www.adaptivesportsprogram.org/). To check: the page shows 2 different towns.
UPDATE programs SET city = 'Albuquerque', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'df8fbabf-3b90-444d-9fd6-aa94d5327492' AND (city IS NULL OR city = '');

-- USA Volleyball – Sitting Program: town from the address on its own website (https://usavolleyball.org/womens-sitting-national-team/). To check: a national name: a headquarters town would make it look local.
UPDATE programs SET city = 'Edmond', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '16d14ab5-7a85-4f69-8e51-88b631b5060b' AND (city IS NULL OR city = '');

-- Hope for Tomorrow / Rally Point Recovery: town from the address on its own website (https://myhopefortomorrow.com/treatment-programs/veterans-program/). To check: the page shows 2 different towns.
UPDATE programs SET city = 'Point Pleasant', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '631b6225-f192-5572-b80a-f79132baf2f0' AND (city IS NULL OR city = '');

-- Outdoors for All Foundation (WA): town from the address on its own website (http://www.outdoorsforall.org). To check: the page shows 4 different towns.
UPDATE programs SET city = 'Seattle', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2fd06f8f-be76-5a74-a59d-3c1938157a50' AND (city IS NULL OR city = '');

-- Achilles New Jersey: town from the address on its own website (https://www.achillesinternational.org/new-jersey). To check: the page shows 5 different towns.
UPDATE programs SET city = 'Cranford', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e55d73a5-b546-4e21-9914-f1522199f669' AND (city IS NULL OR city = '');

-- AccesSurf Hawaii Inc. – Paralympic Sport Hawaii: town from the address on its own website (http://www.accessurf.org). To check: a chapter or national network: the page may show the headquarters town.
UPDATE organizations SET city = 'Honolulu', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a00a07e5-617e-4612-923e-05b273422ba3' AND (city IS NULL OR city = '');

-- Adaptive Adventures: town from the address on its own website (https://adaptiveadventures.org/). To check: a chapter or national network: the page may show the headquarters town.
UPDATE organizations SET city = 'Westminster', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '387be9ff-5129-4a84-a95f-64809a68863e' AND (city IS NULL OR city = '');

-- Kennedy Krieger Institute – Bennett Institute Sports: town from the address on its own website (http://www.kennedykrieger.org). To check: a chapter or national network: the page may show the headquarters town.
UPDATE organizations SET city = 'Baltimore', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fc8eec3d-b563-4755-adb0-ee81d1ef3cba' AND (city IS NULL OR city = '');

-- Nemours/Alfred I duPont Hospital for Children – Paralympic Sport Delaware: town from the address on its own website (http://www.nemours.org/locations/nemours-dupont.html). To check: a chapter or national network: the page may show the headquarters town.
UPDATE organizations SET city = 'Wilmington', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e036ec93-985e-43b2-bef1-8dc7ff0ede1f' AND (city IS NULL OR city = '');

-- Northeast Passage – Southern New Hampshire: town from the address on its own website (http://www.nepassage.org). To check: a chapter or national network: the page may show the headquarters town.
UPDATE organizations SET city = 'Durham', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3ceaf5c4-87b4-4b5e-9f0f-792ae8345daa' AND (city IS NULL OR city = '');

-- Northwest Association for Blind Athletes – Clark County: town from the address on its own website (http://www.nwaba.org). To check: a chapter or national network: the page may show the headquarters town.
UPDATE organizations SET city = 'Vancouver', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e0e06400-f216-419f-b6ca-7b0848f6f856' AND (city IS NULL OR city = '');

-- Oregon Adaptive Sports – Central Oregon: town from the address on its own website (http://www.oregonadaptivesports.org). To check: a chapter or national network: the page may show the headquarters town.
UPDATE organizations SET city = 'Bend', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e8c182d9-802f-48c7-b007-389c459a9433' AND (city IS NULL OR city = '');

-- Special Olympics Hawaii: town from the address on its own website (https://sohawaii.org/). To check: a chapter or national network: the page may show the headquarters town.
UPDATE organizations SET city = 'Ewa Beach', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '07b9d5c0-b40e-4593-883f-772ae4749302' AND (city IS NULL OR city = '');

-- Team River Runner – Fredericksburg: town from the address on its own website (https://www.teamriverrunner.org/virginia-fredericksburg/). To check: a chapter or national network: the page may show the headquarters town.
UPDATE organizations SET city = 'Falmouth', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3e767cc3-3aef-4c6e-a291-de3d9fceb42d' AND (city IS NULL OR city = '');

-- The Ability Experience: town from the address on its own website (http://www.abilityexperience.org/). To check: a chapter or national network: the page may show the headquarters town.
UPDATE organizations SET city = 'Charlotte', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b21605a2-e61c-4542-85d7-b3e8a80f683b' AND (city IS NULL OR city = '');

-- Therapeutic Adventures – Blue Ridge/Shenandoah: town from the address on its own website (http://www.TAonline.org). To check: a chapter or national network: the page may show the headquarters town.
UPDATE organizations SET city = 'Charlottesville', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e5a88309-4937-409c-80d5-cb4d08bc2155' AND (city IS NULL OR city = '');

-- Touch the Future, Inc. – Golden Corner: town from the address on its own website (https://touchthefuture.us/events/paralympic-sports-club-events/). To check: a chapter or national network: the page may show the headquarters town.
UPDATE organizations SET city = 'Anderson', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4a7b9e59-e304-48af-b13c-59d5b8990aa8' AND (city IS NULL OR city = '');

-- Achilles Long Island: town from the address on its own website (https://www.achillesinternational.org/long-island). To check: a chapter or national network: the page may show the headquarters town.
UPDATE programs SET city = 'New York', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '67aada0e-260d-5a23-9595-cf776952e3a1' AND (city IS NULL OR city = '');

-- Achilles Westchester: town from the address on its own website (https://www.achillesinternational.org/westchester). To check: a chapter or national network: the page may show the headquarters town.
UPDATE programs SET city = 'New York', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '15151265-a9c6-517f-8abb-412320eba5ae' AND (city IS NULL OR city = '');

-- Adaptive Adventures Paralympic Sport Front Range: town from the address on its own website (http://www.adaptiveadventures.org). To check: a chapter or national network: the page may show the headquarters town.
UPDATE programs SET city = 'Westminster', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c19c444c-afa1-42e7-adbf-0014894c4151' AND (city IS NULL OR city = '');
