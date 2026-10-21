-- Run only after every line's link has been opened in a browser; delete failing lines from your local copy first.
-- docs/data-fixes/dead-links.md. Each UPDATE matches the row's id AND its current link, so it is safe to run twice
-- and skips a row someone already changed.

-- Treasure Valley Family YMCA – Boise: same site, new page; could not load it from our server (blocked) or it is http only. Open it in a browser first. Y's site blocks automated fetches (403 to both curl and fetch tool), so load not confirmed directly; page is current in search index. THRIVE center is at the South Meridian YMCA. V
UPDATE organizations SET website_url = 'https://ymcatvidaho.org/facilities/thrive-adaptive-spaces/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '501c9d4f-8ac3-443a-b665-ff1642e74389' AND website_url = 'https://www.ymcatvidaho.org/categories/c-thrive-adaptive/';

-- Operation North State: same site, new page; could not load it from our server (ok) or it is http only. Open it in a browser first. Not actually dead: the site loads over plain http (200, fishing festivals for wounded/disabled veterans); its https certificate is self-signed so the https link fails. Store the ht
UPDATE organizations SET website_url = 'http://www.operationnorthstate.com/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4756ca61-6638-5907-8263-43ee1979778d' AND website_url = 'https://operationnorthstate.com/';

-- Sioux Wheelers Adaptive Sports: same site, new page; could not load it from our server (ok) or it is http only. Open it in a browser first. Not actually dead: same site loads over plain http (200, mission text present); https resets the connection. Store the http URL.
UPDATE organizations SET website_url = 'http://siouxwheelers.com/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7234432f-563c-5539-a8a9-ab9a2f335c27' AND website_url = 'https://www.siouxwheelers.com';

-- NYC Parks & Recreation: same site, new page; could not load it from our server (dead 405) or it is http only. Open it in a browser first. Old /paralympics subpage gone; NYC Parks now lists adaptive sports (incl. S.P.A.R.E.S. youth adaptive sports) under Accessibility Programs and /events/adaptive-programs. NOTE: nycg
UPDATE organizations SET website_url = 'https://www.nycgovparks.org/accessibility/accessibility-programs', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '77f5ec7b-65d0-48c4-947e-4a24fa0da440' AND website_url = 'https://www.nycgovparks.org/accessibility/accessibility-programs/paralympics';

-- TIRR Memorial Hermann Sports: same site, new page; could not load it from our server (dead 000) or it is http only. Open it in a browser first. URL slug changed from adaptive-sports to adapted-sports (search index shows the adapted-sports page live). NOTE: memorialhermann.org refuses connections from this server, so 200 no
UPDATE organizations SET website_url = 'https://memorialhermann.org/services/specialties/tirr/patients-visitors/adapted-sports', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6e494fe4-1b49-4754-b5f9-5070348ad3d8' AND website_url = 'https://memorialhermann.org/services/specialties/tirr/patients-visitors/adaptive-sports';

-- West Mobile Miracle League: same site, new page; could not load it from our server (dead 406) or it is http only. Open it in a browser first. mcpss.com returns 406 to all automated fetches (old URL may still be live; search index still has /o/mlwm/ articles). Search index shows mcpss.com/miracleleague titled 'Miracle Fie
UPDATE organizations SET website_url = 'https://mcpss.com/miracleleague', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '07c91020-aeb4-5d39-b7a1-d2e53d046736' AND website_url = 'https://www.mcpss.com/o/mlwm';

-- Carolina Sled Hockey Association / Carolina Honey Badgers: same site, new page; could not load it from our server (ok) or it is http only. Open it in a browser first. Same domain; HTTPS is broken but the http:// address loads and names the Carolina Honey Badgers.
UPDATE organizations SET website_url = 'http://carolinasledhockey.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6f0f97e7-3939-5a17-8c6b-d9ccfa597727' AND website_url = 'https://carolinasledhockey.org/';

-- Queen City Adaptive Recreation Sled Hockey: new site; could not load it from our server (ok) or it is http only. Open it in a browser first. qcsledhockey.org (Google Sites) is gone. Team now has a page on the Carolina Sled Hockey (Honey Badgers) site. http only; HTTPS on that domain is broken.
UPDATE organizations SET website_url = 'http://carolinasledhockey.org/team/queen-city-sled-hockey/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b05156c2-acde-561f-ace2-2dd12a23115a' AND website_url = 'https://qcsledhockey.org/';

-- The Transitioning Warrior and River City Advocacy: new site; could not load it from our server (blocked) or it is http only. Open it in a browser first. thetransitioningwarrior.org no longer responds. Transitioning Warrior Outreach now lives on Coming Home Well (partnered with a New Braunfels business; community breakfasts). Loaded
UPDATE organizations SET website_url = 'https://cominghomewell.com/tw-outreach/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '87ea47f1-85d1-5624-a3e1-3a660a6a02f5' AND website_url = 'https://thetransitioningwarrior.org/';

-- BREC Hearts & Hooves Adaptive Riding: same site, new page; could not load it from our server (blocked) or it is http only. Open it in a browser first. Hearts & Hooves runs at BREC's Farr Park Equestrian Center; search index has dated Hearts and Hooves Adaptive Riding calendar entries. brec.org returns 403 to all automated fetches
UPDATE programs SET website_url = 'https://www.brec.org/facility/FarrPark', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9c262078-2fdf-5710-aa02-ac21ab108f64' AND website_url = 'https://www.brec.org/calendar?park=58';

-- Louisiana School for the Deaf Athletics: same site, new page; could not load it from our server (dead 406) or it is http only. Open it in a browser first. Page slug changed from /sports to /athleticsdept/. Site blocks automated fetches from this server, so 200 not confirmed here; page found in the search index.
UPDATE programs SET website_url = 'https://www.ssdofla.org/o/lsd/page/athleticsdept/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9576960d-15ae-5cc2-a58d-4809bd9472fa' AND website_url = 'https://www.ssdofla.org/o/lsd/page/sports';

-- Anne Arundel County Public Schools Unified Sports: same site, new page; could not load it from our server (dead 406) or it is http only. Open it in a browser first. Old link was just the district homepage. aacps.org returns 406 to all automated fetches, so the homepage is probably not dead; this is the specific Unified Sports page from the sea
UPDATE programs SET website_url = 'https://www.aacps.org/documents/students/resources/links/athletics/unified-sports/corollary-sports/619858', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fe064be6-34eb-5879-9dec-091ad6d3ea19' AND website_url = 'https://www.aacps.org/';

-- Town of Superior: new site; could not load it from our server (blocked) or it is http only. Open it in a browser first. Town moved from superiorcommunitycenter.com to superiorcolorado.gov. Page is the Aug 16, 2025 adaptive trail event run with Adaptive Adventures (loaded via WebFetch; curl gets 403)
UPDATE programs SET website_url = 'https://www.superiorcolorado.gov/Community/Calendars/Events/Adaptive-Adventures', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '910a3ea3-e2b2-5798-8906-82e5ac3fda1a' AND website_url = 'https://www.superiorcommunitycenter.com/CivicAlerts.aspx?AID=101';

-- Winfield Parks and Recreation Adaptive Athletics: same site, new page; could not load it from our server (ok) or it is http only. Open it in a browser first. Same domain still live over plain http; the https version fails (certificate/connection), which is why the old link reads dead. Site does not name an adaptive athletics program.
UPDATE organizations SET website_url = 'http://winfieldparkandrec.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '06a17091-1dd8-5fdd-81d3-051035053271' AND website_url = 'https://winfieldparkandrec.org/';

-- Lifeline Horse Rescue and Rehabilitation: same site, new page; could not load it from our server (ok) or it is http only. Open it in a browser first. Same domain works over plain http with www; https fails. Veteran program page: http://www.lifelinehorserescue.org/lifeline-equine-therapy-services-lets/
UPDATE organizations SET website_url = 'http://www.lifelinehorserescue.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ae1b58f9-e60f-5be4-9a3f-943b20c2a004' AND website_url = 'https://lifelinehorserescue.org/';

-- Galloping Acres Foundation: new site; could not load it from our server (dead 000) or it is http only. Open it in a browser first. Old .com domain now 301-redirects to gallopingacres.org. The .org site loads and names the foundation and its therapeutic riding mission; our curl flagged its TLS certificate chain
UPDATE organizations SET website_url = 'https://www.gallopingacres.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '56c599d6-2785-5d0a-b821-a123e0d2757f' AND website_url = 'https://www.gallopingacres.com/';

-- Let's Saddle Up: same site, new page; could not load it from our server (ok) or it is http only. Open it in a browser first. Same site still up over plain http with www; its https certificate has expired, which is why the https link reads dead. Older-style site (copyright years up to 2022); a Facebook pa
UPDATE organizations SET website_url = 'http://www.letssaddleup.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f10d2170-dbbe-5456-b258-fc01ea8d4a50' AND website_url = 'https://www.letssaddleup.org/';

-- Hoofbeats for Heroes: same site, new page; could not load it from our server (ok) or it is http only. Open it in a browser first. Same site loads over plain http with www; https fails. Page names the 501(c)(3) and its BLORA Ranch operation at Fort Hood, Belton TX.
UPDATE organizations SET website_url = 'http://www.hoofbeatsforheroes.com/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0fbf5343-dd9d-57c8-ba8a-7c5ff8f4d77c' AND website_url = 'https://www.hoofbeatsforheroes.com/';

-- TIRR Texans: new site; could not load it from our server (dead 000) or it is http only. Open it in a browser first. TIRR subdomain retired; page moved to memorialhermann.org. Verified 200 via Firecrawl (our box cannot reach the host directly); page names TIRR Memorial Hermann Adapted Sports and 
UPDATE organizations SET website_url = 'https://memorialhermann.org/services/specialties/tirr/patients-visitors/adapted-sports', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fbb0cdfe-4492-4a43-bc8d-61413bdba719' AND website_url = 'http://tirr.memorialhermann.org/patient-resources/adaptive-sports/';

-- Steven A. Cohen Military Family Clinic at Aspire Health Partners: new site; could not load it from our server (blocked) or it is http only. Open it in a browser first. Cohen Veterans Network dropped per-clinic pages; its Clinics page (https://www.cohenveteransnetwork.org/clinics/) links this Aspire page. Blocks plain curl (403) but loads 200 via 
UPDATE organizations SET website_url = 'https://aspirehealthpartners.com/cohenclinic/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '486b633d-3629-50ad-8c7c-a6dc03c94f07' AND website_url = 'https://www.cohenveteransnetwork.org/clinic/tampa-fl/';

-- University of Illinois Track and Road Racing Program: new site; could not load it from our server (blocked) or it is http only. Open it in a browser first. Program moved to dres.illinois.edu (search index shows a 2026 season schedule page). At check time the server returned 503 / timed out, so not fetch-verified; recheck.
UPDATE programs SET website_url = 'https://dres.illinois.edu/athletics/track-and-road-racing/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '63fcf1da-474f-40e3-b170-17c20fda69d1' AND website_url = 'http://disability.illinois.edu/athletics';

-- City of Sunrise Special Populations: same site, new page; could not load it from our server (blocked) or it is http only. Open it in a browser first. Special Populations page removed (404). Leisure Services page loads (via Firecrawl; site blocks curl). City calendar still lists Special Populations events (e.g. a 2025 movie night
UPDATE programs SET website_url = 'https://www.sunrisefl.gov/departments-services/leisure-services', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c1b31aa1-82a3-5094-9b30-30d9d4171c61' AND website_url = 'https://www.sunrisefl.gov/departments-services/leisure-services/special-populations';

-- Louisiana School for the Visually Impaired Athletics: same site, new page; could not load it from our server (dead 406) or it is http only. Open it in a browser first. Page moved within the Special School District site; loads 200 via Firecrawl (blocks plain curl with 406).
UPDATE programs SET website_url = 'https://www.ssdofla.org/o/lsvi/page/athletics', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3a14da30-fdb0-510f-a3df-aa1dd60bcb8b' AND website_url = 'https://www.ssdofla.org/o/lsvi/page/special-events-camps-and-programs';

-- Knoxville Parks & Recreation Dynamic Recreation: same site, new page; could not load it from our server (blocked) or it is http only. Open it in a browser first. City site moved to CivicEngage page numbers; loads 200 via Firecrawl (Cloudflare blocks plain curl).
UPDATE programs SET website_url = 'https://www.knoxvilletn.gov/573/Dynamic-Recreation-Program', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '634a1af5-d0ce-44e4-a89f-1dc652db4fe0' AND website_url = 'https://www.knoxvilletn.gov/government/city_departments_offices/parks_and_recreation/programs/dynamic_recreation_program';

-- Palm Beach Gardens Veterans' Tennis and Pickleball: moved from the confident file in review. Check it in a browser first: the city homepage, not the program's page. Original note: the old link redirects here (Palm Beach Gardens, FL - Official Website | Official Website)
UPDATE programs SET website_url = 'https://www.pbgfl.gov/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ce0d0394-b36a-5da6-894b-2ec88ccd6d28' AND website_url = 'https://www.pbgfl.com/';

-- Bluegrass Tennis Association Wheelchair Tennis: moved from the confident file in review. Check it in a browser first: fails TLS from our server. Original note: the old link redirects here (Lexington Area Tennis Association)
UPDATE programs SET website_url = 'https://latasc.com/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fc953c88-7675-5195-93ac-1a51732bc4ab' AND website_url = 'https://www.lexington.usta.com/';

-- Freedom Hills Therapeutic Riding Program at Rolling Hills Ranch: moved from the confident file in review. Check it in a browser first: fhtrp.wpengine.com is a hosting name, not the organization's own domain. Original note: the old link redirects here (Home - Freedom Hills Therapeutic Riding)
UPDATE programs SET website_url = 'https://fhtrp.wpengine.com/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6e3fbcb2-473a-5e9c-af7b-e2e41e89d2be' AND website_url = 'https://freedomhills.org/';

-- Spina Bifida Association of Kentucky Adaptive Sports Activities: moved from the confident file in review. Check it in a browser first: the link has an encoded slash (%2F) and fails TLS from our server. Original note: same site, new page; loads ("Adaptive Sport/Activities")
UPDATE organizations SET website_url = 'https://spinabifidakentucky.org/adaptive-sport%2Factivities', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd5cbf21f-0df2-58fa-9c6a-338c5e804b73' AND website_url = 'https://spinabifidakentucky.org/activities';

-- Suicide Prevention Color Run and Resource Fair: moved from the confident file in review. Check it in a browser first: a one-off "3rd Annual" event page, not a standing program page. Original note: same site, new page; loads ("3rd Annual Veteran Color Run/Walk for Veteran Suicide Awaren")
UPDATE programs SET website_url = 'https://veterans.nv.gov/3rd-annual-veteran-color-run-walk-for-veteran-suicide-awareness/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '182253f7-fc88-5592-b159-c4ab666e076a' AND website_url = 'https://veterans.nv.gov/message-from-director-oct25/';

-- White County Regional Library System / Cornerstone Caregiving: moved from the confident file in review. Check it in a browser first: a generic library calendar, not this program. Original note: same site, new page; loads ("White County Libraries Calendar - White County Libraries, Ar")
UPDATE organizations SET website_url = 'https://whitecountylibraries.org/calendar', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0255fbe9-929a-5925-aad9-a8edb747466d' AND website_url = 'https://whitecountylibraries.assabetinteractive.com/calendar/2026-june/event-listing/';

-- Guitars for Vets / VA Sierra Nevada: moved from the confident file in review. Check it in a browser first: archive.veterans.nv.gov is an archive copy, not the live page. Original note: same site, new page; loads ("Guitars for Vets - Nevada Department of Veterans Services")
UPDATE organizations SET website_url = 'https://archive.veterans.nv.gov/guitars-for-vets/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a5a41a0a-1467-565c-bf92-de6097fddd84' AND website_url = 'https://veterans.nv.gov/guitars-for-vets/';

-- Bellarmine University iCan Bike Camp: moved from the confident file in review. Check it in a browser first: a news article, not the program's page. Original note: same site, new page; loads ("Bellarmine physical therapy program helps children with disa")
UPDATE organizations SET website_url = 'https://bellarmine.edu/news/article/physical-therapy-program-children-disabilities-ride-bike.php', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd70e91a5-0281-52d7-92d7-67ee42f5fc30' AND website_url = 'https://www.bellarmine.edu/physical-therapy/';

-- Maryland Department of Disabilities - Accessible Boating Fund: moved from the confident file in review. Check it in a browser first: goes to the MDOD careers and procurement page, not the boating fund. Original note: same site, new page; loads ("Careers and Procurement | Department of Disabilities")
UPDATE programs SET website_url = 'https://mdod.maryland.gov/about-us/careers-and-procurement', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '997ca4c0-2f6a-534b-92f8-ced867d9e178' AND website_url = 'https://mdod.maryland.gov/about/Pages/grants.aspx';

-- New Mexico Department of Cultural Affairs / New Mexico Arts: moved from the confident file in review. Check it in a browser first: fails TLS from our server. Original note: new site; loads ("New Mexico Arts and the Military Initiative")
UPDATE organizations SET website_url = 'https://nmarts.org/all-programs/arts-the-military/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '1a67b135-1d5c-53af-988c-859cfcaa9fbc' AND website_url = 'https://www.newmexicoculture.org/release/1915/29';
