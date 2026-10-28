-- docs/data-fixes/dead-links.md. Each UPDATE matches the row's id AND its current link, so it is safe to run twice
-- and skips a row someone already changed.

-- Ability360 – Paralympic Sport Phoenix: the old link redirects here (Sports & Fitness - Ability360 | Phoenix, AZ)
UPDATE organizations SET website_url = 'https://ability360.org/sports-fitness/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b7827006-4eda-47a0-a38d-87ad4d19a73b' AND website_url = 'http://www.spofit.org';

-- Access Leisure – Paralympic Sport Sacramento: the old link redirects here (Access Leisure | City of Sacramento)
UPDATE organizations SET website_url = 'https://www.cityofsacramento.gov/ypce/access-leisure', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7b9940cf-d09d-47aa-9dfb-e3f11266d612' AND website_url = 'http://www.accessleisuresac.org';

-- Auburn University Office of Accessibility – Paralympic Sport Auburn: the old link redirects here (Home)
UPDATE organizations SET website_url = 'https://www.auburnadapted.com/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5566bec2-14f8-4e08-90ce-c826298e7ac4' AND website_url = 'http://auburn.edu/adaptivesports';

-- Catch A Lift: the old link redirects here (Fitness Programs for Combat-Injured Veterans | Catch A Lift )
UPDATE organizations SET website_url = 'https://catchaliftfund.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '82f303e4-73db-47a6-b61d-c113044f8531' AND website_url = 'http://www.catchaliftfund.com';

-- Disabled Sports Eastern Sierra: the old link redirects here (Access Mammoth | Adaptive Mountain Sports in the Eastern Sie)
UPDATE organizations SET website_url = 'https://accessmammoth.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'cd86ffb5-16df-4f2e-a4db-4d41853a46c7' AND website_url = 'http://www.disabledsportseasternsierra.org';

-- Disabled Sports USA Los Angeles – The Unrecables: the old link redirects here (The Unrecables – Snow sports for disabled athletes in Mammot)
UPDATE organizations SET website_url = 'https://unrecables.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '31e332a5-fb00-40f4-ab40-9f974390bc14' AND website_url = 'http://www.unrecables.com/';

-- Groton Parks and Recreation: the old link redirects here (GrotonRec.com - Groton Parks and Recreation)
UPDATE organizations SET website_url = 'https://www.groton-ct.gov/departments/parksrec/index.php', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '77aa6806-0959-4040-a963-d4bbb8567393' AND website_url = 'http://www.grotonrec.com';

-- Happy Trails Riding Academy: the old link redirects here (Happy Trails Riding Academy)
UPDATE organizations SET website_url = 'https://wearehappytrails.com/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'cddeb5d4-cc81-4a8f-8bab-5e510d32ade9' AND website_url = 'http://happytrailsridingacademy.org/';

-- National Ability Center – Park City: the old link redirects here (Adaptive Recreation & Outdoor Programs | National Ability Ce)
UPDATE organizations SET website_url = 'https://nationalabilitycenter.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7f66bd7e-f782-4908-be5d-0d9317f35d37' AND website_url = 'http://www.discovernac.org';

-- PossAbilities at Loma Linda University: the old link redirects here (PossAbilities at Loma Linda University Medical Center)
UPDATE organizations SET website_url = 'https://teampossabilities.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '53ba8186-6257-470c-8809-a6fe72a643ab' AND website_url = 'http://www.teampossabilities.com';

-- Team St. Luke’s – Spokane: the old link redirects here (St. Luke's Rehabilitation Medical Center | Providence)
UPDATE organizations SET website_url = 'https://www.providence.org/locations/wa/st-lukes?id=436&linkidentifier=id&itemid=436', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '74e18e79-17c6-4c79-921f-cdc9feff816f' AND website_url = 'http://www.st-lukes.org/Sub.aspx?id=436&linkidentifier=id&itemid=436';

-- Teton Adaptive Sports, Inc.: the old link redirects here (Adaptive Outdoor Recreation in Jackson Hole)
UPDATE organizations SET website_url = 'https://tetonadaptive.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2491dea6-5b14-4189-8fa4-28d2bafd01da' AND website_url = 'http://www.tetonadaptivesports.com';

-- Triangle Sled Hockey Association: the old link redirects here (Triangle Special Hockey - Ice & Street Hockey for All Abilit)
UPDATE organizations SET website_url = 'https://tshanc.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5719f643-77a7-47b5-90ad-2248131027e6' AND website_url = 'http://www.trianglespecialhockey.org';

-- USA Judo: the old link redirects here (USA JUDO | USA Judo)
UPDATE organizations SET website_url = 'https://www.usajudo.com/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7fc7db29-a3dd-41b6-871a-1ccc73278499' AND website_url = 'http://www.usjudo.org';

-- Wintergreen Adaptive Sports: the old link redirects here (Wintergreen Adaptive Sports)
UPDATE organizations SET website_url = 'https://www.wintergreenadaptivesports.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c73b0784-b96a-4754-8962-7807dd896e76' AND website_url = 'http://www.skiwas.org';

-- Cobb PARKS Therapeutic Recreation Services: the old link redirects here (Cobb County PARKS | Cobb County Georgia)
UPDATE organizations SET website_url = 'https://www.cobbcounty.gov/parks', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'bb0ff850-4aa4-5a1d-a748-bbe49f64ded6' AND website_url = 'https://www.cobbcounty.org/parks';

-- New Orleans Recreation Development Commission - Inclusive Recreation: the old link redirects here (Home - NORDC - New Orleans Recreation Development Commission)
UPDATE organizations SET website_url = 'https://nordc.org/home/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd0797aea-7f8c-54bd-9636-49c0625fb6a3' AND website_url = 'https://nola.gov/NEXT/NORD';

-- Bennington Aces: the old link redirects here (Bennington Tennis Center)
UPDATE organizations SET website_url = 'https://benningtontennisclub.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'dfbf2fc7-aa34-5cb7-9ac6-1e33d74c9522' AND website_url = 'http://www.benningtontenniscenter.com/';

-- Veteran Artist Network: the old link redirects here (Veteran Artist Network)
UPDATE organizations SET website_url = 'https://veteranscreate.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a9fa9a88-21d9-53da-a80a-09b20094c5d2' AND website_url = 'https://veteranartistnetwork.org/';

-- Patton Veterans Project / Umpqua Community College: the old link redirects here (Patton Vets – Our mission is to help veterans coping with po)
UPDATE organizations SET website_url = 'https://pattonvets.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6594e021-6aa5-5249-9eb7-ec5238a5496a' AND website_url = 'https://pattonveteransproject.org/';

-- Springville Parks & Recreation — Adaptive VIP Soccer: the old link redirects here (Adaptive Sports | Parks and Recreation)
UPDATE organizations SET website_url = 'https://www.springvilleutah.gov/parks-recreation/recreation/youth/adaptive-sports/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '72e0df75-e479-4a46-8b28-adddd035ddbb' AND website_url = 'https://www.springville.org/parks-recreation/recreation/youth/adaptive-sports/';

-- Orem Recreation Adaptive Tumbling: the old link redirects here (Adaptive Sports – Orem Parks & Recreation)
UPDATE organizations SET website_url = 'https://rec.orem.gov/adaptive-sports/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9dd714fe-d642-4f0f-8a56-72d5917d25d8' AND website_url = 'https://www.oremrecreation.com/adaptive-sports/';

-- Buddy Up Tennis: the old link redirects here (Buddy Up for Life - Buddy Up for Life)
UPDATE programs SET website_url = 'https://buddyupforlife.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e38e6564-44df-5cbf-95e9-637d1d0d754c' AND website_url = 'https://buddyuptennis.com/';

-- Buddy Up Tennis - Nashville: the old link redirects here (Buddy Up for Life - Buddy Up for Life)
UPDATE programs SET website_url = 'https://buddyupforlife.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '77a6fa17-e055-5a99-bd20-4a8c4dc9d780' AND website_url = 'https://buddyuptennis.com/';

-- Buddy Up Tennis, Louisville: the old link redirects here (Buddy Up for Life - Buddy Up for Life)
UPDATE programs SET website_url = 'https://buddyupforlife.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '633baf91-6c93-5840-878e-7b8f577212a7' AND website_url = 'https://buddyuptennis.com/';

-- Oceans of Hope Foundation: the old link redirects here (Oceans of Hope Foundation – Experience The Thrill of Adaptiv)
UPDATE programs SET website_url = 'https://oohf.net/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c596df9f-92ed-54e6-9559-0356473a32e7' AND website_url = 'https://www.oceansofhopefoundation.org/';

-- Decatur-DeKalb YMCA TOPSoccer: the old link redirects here (TOPSoccer | Decatur-DeKalb YMCA Soccer Club)
UPDATE programs SET website_url = 'https://ddysoccer.ottosport.ai/recreational/topsoccer/topsoccer', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '203e314d-9180-5cf1-927b-15469c27d4df' AND website_url = 'https://ddysoccer.demosphere-secure.com/recreational/topsoccer/topsoccer';

-- Miracle League of Macon: the old link redirects here (Miracle League of Macon – “Every Child Deserves a Chance to )
UPDATE programs SET website_url = 'https://miracleleagueofmacon.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'bd0deb87-22e7-5212-b91c-ad9befd392a7' AND website_url = 'https://www.mlmacon.org/';

-- Rush Union Thunder TOPSoccer: the old link redirects here (SPRING 2026 THUNDER PROGRAM | Rush Union Soccer)
UPDATE programs SET website_url = 'https://rushunionsoccer.ottosport.ai/milton-home/recreational/topsoccer-thunder-program', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ab03d343-66a8-5c87-9852-befe2e1fe929' AND website_url = 'https://rushunionsoccer.demosphere-secure.com/milton-home/recreational/topsoccer-thunder-program';

-- Southeast Clarke Park Tennis Center Adaptive Tennis: the old link redirects here (Tennis Center | Athens-Clarke County, GA - Official Website)
UPDATE programs SET website_url = 'https://www.accgov.com/5694/Tennis-Center', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c56b61aa-1328-501b-b85c-2e2f9fcfbba5' AND website_url = 'http://www.athensclarkecounty.com/5694/Tennis-Center';

-- Kentucky School for the Deaf Physical Education Adaptive Tennis: the old link redirects here (Home - Kentucky School for the Deaf)
UPDATE programs SET website_url = 'https://www.ksd.kyschools.us/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8fc5ab8e-8b26-5e24-a86e-3b798d0d9851' AND website_url = 'https://www.ksd.k12.ky.us/';

-- Thibodaux Soccer Association TOPSoccer: the old link redirects here (Home)
UPDATE programs SET website_url = 'https://www.thibodaux-soccer.org/Default.aspx?tabid=197044', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9c9d0deb-2736-59f9-8524-7f11ad46c42b' AND website_url = 'http://clubs.bluesombrero.com/Default.aspx?tabid=197044';

-- JTCC Para Standing Tennis: the old link redirects here (Adaptive - Junior Tennis Champions Center)
UPDATE programs SET website_url = 'https://jtcc.org/adaptive/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4c9d7cb7-4090-5de9-b01b-4f3915b2c05d' AND website_url = 'https://jtccregister.org/adaptive/';

-- JTCC Veterans Tennis Corps: the old link redirects here (Adaptive - Junior Tennis Champions Center)
UPDATE programs SET website_url = 'https://jtcc.org/adaptive/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'de48870f-e0a4-54b0-b02b-44028ece3d22' AND website_url = 'https://jtccregister.org/adaptive/';

-- Princeton Tennis Program: the old link redirects here (Princeton Tennis Program - Home)
UPDATE programs SET website_url = 'https://playtennis.usta.com/princetontennisprogram/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'dd8933d5-3fca-5bb6-8ab1-133e6fb8ba3f' AND website_url = 'http://www.ptp.org/';

-- Miracle League of Florence County: the old link redirects here (Florence County SC - Parks And Recreation)
UPDATE programs SET website_url = 'https://www.florencecountysc.gov/offices/parks-recreation/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c8b215a1-51e8-503b-ab93-ce3da1e89160' AND website_url = 'https://florenceco.org/offices/parks-recreation/';

-- Vets Recover / Helping 2 Overcome: the old link redirects here (Vets Recover Community Integration Team)
UPDATE programs SET website_url = 'https://vetsrecoverconnect.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '222548bf-3255-507f-a469-af8d3af14f34' AND website_url = 'https://helping2overcome.org/helping-2-overcome-program';

-- Buddy Up Tennis, Ohio: the old link redirects here (Buddy Up for Life - Buddy Up for Life)
UPDATE programs SET website_url = 'https://buddyupforlife.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'cabd5885-e1be-5ceb-a1f5-d03a835583a0' AND website_url = 'http://www.buddyuptennis.com/';

-- Buddy Up Tennis, Pennsylvania: the old link redirects here (Buddy Up for Life - Buddy Up for Life)
UPDATE programs SET website_url = 'https://buddyupforlife.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '006e069f-3040-5362-9186-1513ba88d59d' AND website_url = 'http://www.buddyuptennis.com/';

-- Buddy Up Tennis, Phoenix: the old link redirects here (Buddy Up for Life - Buddy Up for Life)
UPDATE programs SET website_url = 'https://buddyupforlife.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4f7fba61-e2c7-5c1c-9d36-8b2669cf32e7' AND website_url = 'http://buddyuptennis.com/';

-- Buddy Up Tennis, Illinois: the old link redirects here (Buddy Up for Life - Buddy Up for Life)
UPDATE programs SET website_url = 'https://buddyupforlife.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5e9b7813-ef75-5ef0-8767-252e1f50f55f' AND website_url = 'http://buddyuptennis.com/';

-- Buddy Up Tennis, Lebanon: the old link redirects here (Buddy Up for Life - Buddy Up for Life)
UPDATE programs SET website_url = 'https://buddyupforlife.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd4cbd41d-464b-5e17-8507-51bfec450e86' AND website_url = 'http://buddyuptennis.com/';

-- Buddy Up Tennis, Green Bay: the old link redirects here (Buddy Up for Life - Buddy Up for Life)
UPDATE programs SET website_url = 'https://buddyupforlife.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '407199d5-5105-5e80-924f-039795673ede' AND website_url = 'http://buddyuptennis.com/';

-- Chapter 126 Sports & Fitness, An Oak Hill Center: new site; loads ("Home - Oak Hill Adaptive Sports and Fitness")
UPDATE organizations SET website_url = 'https://sportsandfitness.oakhillct.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7eb0dc91-baca-4199-8b0f-a996363412fb' AND website_url = 'http://www.chapter126.com';

-- City of Reno Adaptive Recreation: same site, new page; loads ("Reno, NV Parks and Recreation")
UPDATE organizations SET website_url = 'https://www.reno.gov/parks-and-recreation/adaptive-recreation/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ef737210-2286-4829-a0a8-0bec820cabbb' AND website_url = 'https://www.reno.gov/government/departments/parks-recreation-community-services/adaptive-recreation';

-- G.V. Sonny Montgomery VAMC Warriors Unlimited: same site, new page; loads ("G.V. (Sonny) Montgomery Department Of Veterans Affairs Medic")
UPDATE organizations SET website_url = 'https://www.va.gov/jackson-health-care/locations/gv-sonny-montgomery-department-of-veterans-affairs-medical-center/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5ef8921e-1426-48ff-a03b-960dd76c9ac3' AND website_url = 'http://www.jackson.va.gov';

-- Jesse Brown VA Hospital: same site, new page; loads ("Jesse Brown Department Of Veterans Affairs Medical Center | ")
UPDATE organizations SET website_url = 'https://www.va.gov/chicago-health-care/locations/jesse-brown-department-of-veterans-affairs-medical-center/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e981128b-0479-4bf7-8d17-58383a3efbb0' AND website_url = 'http://www.chicago.va.gov';

-- Mecklenburg County Park & Rec – Therapeutic: new site; loads ("Therapeutic and Inclusive Recreation Services | Park and Rec")
UPDATE organizations SET website_url = 'https://parkandrec.mecknc.gov/Activities/therapeutic-recreation-activities', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6b5f8dad-6515-431b-b77a-763cc71babbb' AND website_url = 'http://TR.Charmeck.org';

-- Minneapolis VA Health Care System: same site, new page; loads ("VA Minneapolis Health Care | Veterans Affairs")
UPDATE organizations SET website_url = 'https://www.va.gov/minneapolis-health-care/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6b3a925f-120d-4460-8471-a4eebfe0eec3' AND website_url = 'http://www.minneapolis.va.gov';

-- NMVAHCS: same site, new page; loads ("VA New Mexico Health Care | Veterans Affairs")
UPDATE organizations SET website_url = 'https://www.va.gov/new-mexico-health-care/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '30ab9f3c-6731-4d3e-908e-95391e1263e6' AND website_url = 'https://www.albuquerque.va.gov/';

-- Northwest Wheelchair Tennis Association: same site, new page; loads ("Northwest Wheelchair Tennis Association -")
UPDATE organizations SET website_url = 'https://nwwheelchairtennis.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '69017bc9-c2bf-4507-8532-e4e40f3f3193' AND website_url = 'http://www.nwwheelchairtennis.org/nwta/';

-- Oklahoma City VA Medical Center: same site, new page; loads ("Oklahoma City VA Medical Center | VA Oklahoma City Health Ca")
UPDATE organizations SET website_url = 'https://www.va.gov/oklahoma-city-health-care/locations/oklahoma-city-va-medical-center/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '98d9e11c-58c3-422f-9b1c-1ab6e3d4be99' AND website_url = 'http://www.oklahoma.va.gov';

-- Shepherd Stealers: same site, new page; loads ("Adaptive Sports | Shepherd Center")
UPDATE organizations SET website_url = 'https://shepherd.org/treatment/services-clinics/adaptive-sports/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd43ee1b4-e26b-4585-9178-9a78e331e26e' AND website_url = 'http://www.shepherd.org/resources/sports';

-- VA Black Hills Health Care System: same site, new page; loads ("VA Black Hills Health Care | Veterans Affairs")
UPDATE organizations SET website_url = 'https://www.va.gov/black-hills-health-care/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2bd48130-c315-4c13-993b-0ff5bed06199' AND website_url = 'http://www.blackhills.va.gov/';

-- VA Central Iowa Health Care System: same site, new page; loads ("VA Central Iowa Health Care | Veterans Affairs")
UPDATE organizations SET website_url = 'https://www.va.gov/central-iowa-health-care/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '98eb294f-c1f8-4fa8-930c-88a9aeae7a7f' AND website_url = 'http://www.centraliowa.va.gov';

-- Tennis Pals: new site; loads ("Summer | Lymes' Youth Service Bureau")
UPDATE organizations SET website_url = 'https://lysb.org/summer/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '84dcf38e-8c5a-5df6-b152-c21af6a85d40' AND website_url = 'http://tennispals.org/';

-- Graham Equestrian Center: new site; loads ("Graham Equestrian Center - For the joy of horses.")
UPDATE organizations SET website_url = 'https://grahameq.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9bac5212-1ff9-5caf-957b-731704f1c354' AND website_url = 'https://www.grahamequestrian.org/';

-- Mingo Tennis Inclusion: new site; loads ("Mingo Tennis - Mingo Tennis")
UPDATE organizations SET website_url = 'https://playtennis.usta.com/mingotennis', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2c5a3ab1-6acb-5665-ac2c-c614b88ab6de' AND website_url = 'http://www.fulleffectgroup.org/mingotennis';

-- Amy Yee Tennis Center Special Populations Tennis Camps: same site, new page; loads ("Amy Yee Tennis Center Park - Parks | seattle.gov")
UPDATE organizations SET website_url = 'https://www.seattle.gov/parks/parks/amy-yee-tennis-center-park', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '08868ff8-e162-5d40-8fc2-e453d9cb6ce2' AND website_url = 'http://seattle.gov/parks/amyyee';

-- Steven A. Cohen Military Family Clinic at Centerstone: new site; loads ("Steven A. Cohen Military Family Clinic at Centerstone – Jack")
UPDATE organizations SET website_url = 'https://centerstone.org/cohen-military-family-clinic/jacksonville/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a0bff4b4-94f4-5604-9d3e-919c036c2b6e' AND website_url = 'https://www.cohenveteransnetwork.org/clinic/jacksonville-fl/';

-- Sacred Mountain Retreat Center: new site; loads ("Home - Sacred Mountain Retreat Center")
UPDATE organizations SET website_url = 'https://sacredmtnretreat.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '209d56a8-0ccc-5a50-9f81-5a3858cb82f0' AND website_url = 'https://dakotaathome.sd.gov/search/29f9f394-ef25-5734-bb93-46f2b2769af1';

-- Giant City Stables / Illinois Department of Natural Resources: new site; loads ("Therapeutic Riding – Giant City Stables")
UPDATE organizations SET website_url = 'https://www.giantcitystables.com/therapeutic-riding/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f8886834-2ab9-5092-903c-eac2682803b3' AND website_url = 'https://dnr.illinois.gov/parks/park.giantcity.html';

-- Guitars for Vets - Reno: new site; loads ("Find a chapter - Guitars 4 Vets")
UPDATE programs SET website_url = 'https://guitars4vets.org/find-a-chapter/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'bbe2806a-e647-51dc-8084-c0ccce5509ab' AND website_url = 'https://veterans.nv.gov/guitars-for-vets/';

-- Oklahoma Contemporary: same site, new page; loads ("Veterans and Active-Duty Military Initiative – Oklahoma Cont")
UPDATE organizations SET website_url = 'https://oklahomacontemporary.org/education/studio-school/veterans-and-active-duty-military-initiative/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7ae7a372-0250-5495-8576-70ae238fd3f4' AND website_url = 'https://oklahomacontemporary.org/course/creative-foundations-for-veterans-sunday-2/';

-- Rockford Junior Chariots: new site; loads ("Therapeutic Recreation - Programs for people with disabiliti")
UPDATE organizations SET website_url = 'https://rockfordparkdistrict.org/therapeutic', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '744c9a2a-6eb1-4f70-8665-5fc162348321' AND website_url = 'https://uwhealthsportsfactory.com/wheelchair-basketball';

-- Adaptive Sports & Adventures Program: new site; loads ("Adaptive Sports and Adventures Program | Atrium Health")
UPDATE programs SET website_url = 'https://atriumhealth.org/medical-services/specialty-care/rehabilitation/adaptive-sports-and-adventures-program', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a30fc79b-c7a3-4337-b305-60b70717421f' AND website_url = 'https://www.carolinashealthcare.org/medical-services/specialty-care/rehabilitation/Community-Programs-Support-Groups/Adaptive-Sports-and-Adventures-Program';

-- James A. Haley Veterans Hospital’s Adaptive Sports Program: same site, new page; loads ("James A. Haley Veterans' Hospital | VA Tampa Health Care | V")
UPDATE programs SET website_url = 'https://www.va.gov/tampa-health-care/locations/james-a-haley-veterans-hospital/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fa10e4dd-1691-46bb-b252-a7957bd34aaa' AND website_url = 'https://www.tampa.va.gov/';

-- South Atlanta CTA: new site; loads ("South Atlanta Community Tennis Association Inc - South Atlan")
UPDATE programs SET website_url = 'https://playtennis.usta.com/south-atlanta-community-tennis-association-inc', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '48e27a84-2f18-58c6-a637-d34565ec1099' AND website_url = 'http://southfultontennis.com/';

-- Virginia Swimming Disability Swimming Program: new site; loads ("Virginia Swimming - Disability Swimming")
UPDATE programs SET website_url = 'https://www.gomotionapp.com/team/va/page/diversityinclusion/disability-info', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '24518c8f-30db-5248-a988-d771e170af5c' AND website_url = 'https://www.virginiaswimming.com/';

-- Clarksville Parks and Recreation Inclusive Recreation: new site; loads ("Parks and Recreation | Clarksville, TN")
UPDATE programs SET website_url = 'https://www.clarksvilletn.gov/153/Parks-and-Recreation', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fb66bd1e-7c0b-44c4-8256-4d15dea46f52' AND website_url = 'https://www.cityofclarksville.com/219/Parks-Recreation';

-- Aleda E. Lutz VA Medical Center: same site, new page; loads ("VA Saginaw Health Care | Veterans Affairs")
UPDATE organizations SET website_url = 'https://www.va.gov/saginaw-health-care/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '23d03226-b5b4-4227-8654-a8e2d2cf3d25' AND website_url = 'http://www.saginaw.va.gov';

-- Atlanta VA Medical Center: same site, new page; loads ("VA Atlanta Health Care | Veterans Affairs")
UPDATE organizations SET website_url = 'https://www.va.gov/atlanta-health-care/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'dab425ea-747f-4f11-97e1-8bdffb10333a' AND website_url = 'http://www.atlanta.va.gov';

-- Challenge Aspen: new site; loads ("Home | Challenge Aspen")
UPDATE organizations SET website_url = 'https://challengeaspen.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f28a3bb7-6e25-42b0-90af-db583ffd0673' AND website_url = 'http://www.challengeaspen.com';

-- Charlie Norwood VA Medical Center: same site, new page; loads ("VA Augusta Health Care | Veterans Affairs")
UPDATE organizations SET website_url = 'https://www.va.gov/augusta-health-care/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0b35baa7-31b6-4ed3-9d39-9d8ad95160fb' AND website_url = 'http://www.augusta.va.gov';

-- Clarksville Parks and Recreation: same site, new page; loads ("Parks and Recreation | Clarksville, TN")
UPDATE organizations SET website_url = 'https://www.clarksvilletn.gov/1230/Parks-and-Recreation', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7c286669-a8be-4460-8300-07d5027dce11' AND website_url = 'http://www.cityofclarksville.com/parks';

-- Connecticut Spokebenders: new site; loads ("Sports & Recreation | Hospital for Special Care")
UPDATE organizations SET website_url = 'https://hfsc.org/sports-and-fitness/sports-recreation/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fa7eaa5b-367a-481e-ab7f-ef76526080c3' AND website_url = 'http://www.ctspokebenders.com/';

-- Edward Hines Jr. VA Medical Center: same site, new page; loads ("VA Hines Health Care | Veterans Affairs")
UPDATE organizations SET website_url = 'https://www.va.gov/hines-health-care/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4c9b0784-799e-424c-b801-3a471f91ffd5' AND website_url = 'http://www.hines.va.gov';

-- Harker Heights Parks & Recreation: same site, new page; loads ("Parks & Recreation | Harker Heights, TX")
UPDATE organizations SET website_url = 'https://www.harkerheights.gov/388/Parks-Recreation', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '938434c2-34ae-4c49-9af0-752eb2e8eae4' AND website_url = 'https://www.harkerheights.gov/index.php/athletics';

-- HOPE, Inc. – Fargo-Moorhead: new site; loads ("Hope Inc | Fargo")
UPDATE organizations SET website_url = 'https://www.hopeinc.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ddf27ec2-5dbf-40fe-874b-51924d72b3e0' AND website_url = 'http://www.hopeinconline.org';

-- John D. Dingell VA Medical Center: same site, new page; loads ("VA Detroit Health Care | Veterans Affairs")
UPDATE organizations SET website_url = 'https://www.va.gov/detroit-health-care/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '1e2cee17-2cda-4bde-ad38-9655733ee409' AND website_url = 'http://www.detroit.va.gov';

-- Michael E. DeBakey VA Medical Center: same site, new page; loads ("VA Houston Health Care | Veterans Affairs")
UPDATE organizations SET website_url = 'https://www.va.gov/houston-health-care/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '904cfcdf-6164-4f25-9f33-adddcd6360d1' AND website_url = 'http://www.houston.va.gov';

-- Move Along Inc.: new site; loads ("CNY Adaptive Sports - Formerly MoveAlong - CNY Adaptive Spor")
UPDATE organizations SET website_url = 'https://cnyadaptivesports.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '64496fa7-5906-4bf5-a472-94504d694968' AND website_url = 'http://www.movealonginc.org/';

-- Northern Indiana VA Health Care System: same site, new page; loads ("VA Northern Indiana Health Care | Veterans Affairs")
UPDATE organizations SET website_url = 'https://www.va.gov/northern-indiana-health-care/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '48971bd6-73cb-459d-b0c2-95370f100b50' AND website_url = 'http://www.northernindiana.va.gov';

-- Paralyzed Veterans Racing: same site, new page; loads ("Meet the racing team")
UPDATE organizations SET website_url = 'https://pva.org/adaptive-sports/meet-the-racing-team/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4cba2557-f95a-4d63-9e96-6e4a0193e922' AND website_url = 'http://www.pva.org/site/c.ajIRK9NJLcJ2E/b.6305947/k.B171/Racing_and_Fitness.htm';

-- Sioux Falls VA Health Care System: same site, new page; loads ("VA Sioux Falls Health Care | Veterans Affairs")
UPDATE organizations SET website_url = 'https://www.va.gov/sioux-falls-health-care/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fb013434-cef2-4600-8e01-e0ae83d05823' AND website_url = 'http://www.siouxfalls.va.gov/';

-- St. Cloud VA Health Care System: same site, new page; loads ("VA St Cloud Health Care | Veterans Affairs")
UPDATE organizations SET website_url = 'https://www.va.gov/st-cloud-health-care/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '086dc190-7e6e-4e27-bcee-bb8016713563' AND website_url = 'http://www.stcloud.va.gov/';

-- Surprise Arizona Adaptive Recreation: same site, new page; loads ("Adaptive Recreation | Surprise, AZ - Official Website")
UPDATE organizations SET website_url = 'https://surpriseaz.gov/adaptive-recreation', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9881159d-700c-4592-8310-d1d4336cce77' AND website_url = 'http://www.surpriseaz.gov/index.aspx?NID=1459';

-- Team River Runner – Texas Hill Country: same site, new page; loads ("San Marcos, TX – Team River Runner")
UPDATE organizations SET website_url = 'https://www.teamriverrunner.org/san-marcos-tx/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '01568957-fcf0-444a-9067-55dac580b35d' AND website_url = 'www.kayakinstruction.org';

-- VA Boston Health Care System: same site, new page; loads ("VA Boston Health Care | Veterans Affairs")
UPDATE organizations SET website_url = 'https://www.va.gov/boston-health-care/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'bc799c8e-968e-44be-8d56-5b3c608389fe' AND website_url = 'http://www.boston.va.gov';

-- Wasatch Adaptive Sports: same site, new page; loads ("Home - Wasatch Adaptive Sports")
UPDATE organizations SET website_url = 'https://wasatchadaptivesports.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '529488d7-efee-4db0-84d6-cd3039bffdd6' AND website_url = 'http://www.wasatchadaptivesports.org';

-- Harris County Soccer Association Adaptive Soccer / TOPSoccer: new site; loads ("Home")
UPDATE organizations SET website_url = 'https://www.hc-soccer.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'abd3f466-58d5-5591-9d76-1253c498c60c' AND website_url = 'https://hc-soccer.com/';

-- Blue Valley Blue Streaks: new site; loads ("Inclusive Rec Opportunities in Overland Park")
UPDATE organizations SET website_url = 'https://www.bluevalleyrec.org/specialolympics', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ecaf9298-f345-5329-8b70-c9f22c4b0e03' AND website_url = 'http://www.ksso.org/';

-- Adaptive Tennis Lessons: same site, new page; loads ("Accessibility & Inclusion | Lexington, MA")
UPDATE organizations SET website_url = 'https://www.lexingtonma.gov/2518/Accessibility-Inclusion', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '133be09b-64f3-5c9f-a63b-37b380b45657' AND website_url = 'https://www.lexingtonma.gov/recreation-community-programs/therapeutic-recreation/pages/current-programs';

-- Highland Park Free Blind/VI Tennis: new site; loads ("Clinics — Highland Park Tennis Club")
UPDATE organizations SET website_url = 'https://highlandparktennisclub.org/clinics', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '1d994de4-863c-5000-b13f-c78360d3ddb4' AND website_url = 'http://hptc.info/';

-- Magnolia Equine Assisted Therapies: same site, new page; loads ("Our Mission – Magnolia Equine Assisted Therapies")
UPDATE organizations SET website_url = 'https://magnoliaequine.org/home/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '14142a8f-2f39-5fe5-94fb-b8d9b2d3d3a4' AND website_url = 'https://magnoliaequine.org/';

-- Coles County Council on Aging: new site; loads ("Coles County Council on Aging - Home")
UPDATE organizations SET website_url = 'https://lifespancenter.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9f91db75-a8a7-5c9d-a0ba-13081ef0d2bf' AND website_url = 'https://ilaging.illinois.gov/aboutus/calendar/veterans-coffee-hour.html';

-- Manchester VA Health Care: same site, new page; loads ("Events | VA Manchester Health Care | Veterans Affairs")
UPDATE organizations SET website_url = 'https://www.va.gov/manchester-health-care/events/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8e9bc3f9-3124-55c9-b604-c967bf074a8f' AND website_url = 'https://www.va.gov/manchester-health-care/events/86915/';

-- Operation Revamp: same site, new page; loads ("Operation Revamp")
UPDATE organizations SET website_url = 'https://operationrevamp.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8ce385b0-e26d-55bc-8efd-028f499d929e' AND website_url = 'https://www.operationrevamp.org/';

-- The War Memorial: same site, new page; loads ("Patriotic and Veterans Events — The War Memorial")
UPDATE organizations SET website_url = 'https://www.warmemorial.org/veterans', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7a9582fb-b04d-5670-a14f-336330d935ac' AND website_url = 'https://www.warmemorial.org/events/veteranwellness';

-- Baltic Street Into Action / Brooklyn VA partners: same site, new page; loads ("Projects — Baltic Street Into Action")
UPDATE organizations SET website_url = 'https://balticstreetintoaction.com/projects', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ea62d0ae-34c2-573a-90bd-143d47e64986' AND website_url = 'https://balticstreetintoaction.com/projects/';

-- Sacramento Youth Soccer League TOPSoccer: same site, new page; loads ("Sacramento Youth Soccer League")
UPDATE organizations SET website_url = 'https://www.sysl.com/about/sactopscom', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '18008619-c380-4ced-8af5-81b3d269eeb9' AND website_url = 'https://sysl.com/content/3229/TOPSoccer';

-- Red River Soccer Association TOPSoccer: new site; loads ("Programs - Red River Soccer Association")
UPDATE programs SET website_url = 'https://redriversoccer.org/programs/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b4f5f316-232e-50ea-a2aa-f91fa4195d98' AND website_url = 'https://redriversoccerassociation.com/';

-- Silverado - Frederick County 4-H Therapeutic Riding Program: new site; loads ("Frederick County 4H Therapeutic Riding Program – Horseback R")
UPDATE programs SET website_url = 'https://www.fc4htrp.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5600a369-dcc1-5c5c-90e4-5e011318aabc' AND website_url = 'https://www.silveradotherapeuticriding.org/';

-- The Arc of Greensboro - Big 3 Challenger Sports: same site, new page; loads ("Programs")
UPDATE programs SET website_url = 'https://www.arcg.org/Programs', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5edfb588-742f-5877-a17f-f3e8ca59389b' AND website_url = 'https://arcg.org/sports/';

-- Crossville Recreational Youth Soccer TOPSoccer: new site; loads ("Crossville Recreational Youth Soccer Association")
UPDATE programs SET website_url = 'https://www.crysasoccer.com/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c07d1318-cd4a-5b7a-879e-670b127d9d0c' AND website_url = 'https://www.crossvillesoccer.com/';

-- Birmingham VA Medical Center: new site; loads ("VA Birmingham Health Care | Veterans Affairs")
UPDATE organizations SET website_url = 'https://www.va.gov/birmingham-health-care/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fc714a1a-6986-4f81-9935-932a3732afd6' AND website_url = 'http://www.birmingham.va.gov';

-- Clement Zablocki VA Medical Center: new site; loads ("VA Milwaukee Health Care | Veterans Affairs")
UPDATE organizations SET website_url = 'https://www.va.gov/milwaukee-health-care/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd1c929db-6ba9-4462-8764-2c7c5faf7f7f' AND website_url = 'http://www.milwaukee.va.gov';

-- Fargo VA Health Care System: new site; loads ("VA Fargo Health Care | Veterans Affairs")
UPDATE organizations SET website_url = 'https://www.va.gov/fargo-health-care/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a71b6ba6-ec39-4750-8be7-5f98bf90194f' AND website_url = 'http://www.fargo.va.gov/';

-- Hunter Holmes McGuire VA Medical Center: new site; loads ("VA Richmond Health Care | Veterans Affairs")
UPDATE organizations SET website_url = 'https://www.va.gov/richmond-health-care/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0740facb-22fe-4842-923a-53987e4715d0' AND website_url = 'http://www.richmond.va.gov/';

-- Iowa City VA Health Care System: new site; loads ("VA Iowa City Health Care | Veterans Affairs")
UPDATE organizations SET website_url = 'https://www.va.gov/iowa-city-health-care/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '75895911-0078-4349-b388-59a8d06eb740' AND website_url = 'http://www.iowacity.va.gov/';

-- Nebraska-Western Iowa VA Health Care System: new site; loads ("VA Nebraska-Western Iowa Health Care | Veterans Affairs")
UPDATE organizations SET website_url = 'https://www.va.gov/nebraska-western-iowa-health-care/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3f4d5d30-7282-4fbf-b464-b33ac48dacb7' AND website_url = 'http://www.nebraska.va.gov';

-- Northport VAMC / DAV: new site; loads ("VA Northport Health Care | Veterans Affairs")
UPDATE organizations SET website_url = 'https://www.va.gov/northport-health-care/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9322c871-61f2-41be-9061-0a96ebd9a8d2' AND website_url = 'https://www.northport.va.gov/NORTHPORT/features/DAV_Honors_Northport_VAMC_Volunteers.asp';

-- VA Boston Health Care System, Massachusetts: new site; loads ("VA Boston Health Care | Veterans Affairs")
UPDATE programs SET website_url = 'https://www.va.gov/boston-health-care/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4d5b02ae-d732-5d36-b4ce-e0c14c620152' AND website_url = 'http://www.boston.va.gov';

-- Chicago Park District: same site, new page; loads ("Special Recreation Programs | Chicago Park District")
UPDATE organizations SET website_url = 'https://www.chicagoparkdistrict.com/special-recreation-programs', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'dc9ff168-2be9-4508-ac71-44c980ca5300' AND website_url = 'https://www.chicagoparkdistrict.com/programs-memberships/programs-overview/special-recreation';

-- Oakland County Parks – Waterford: new site; loads ("Adaptive Recreation | Oakland County, MI")
UPDATE organizations SET website_url = 'https://www.oaklandcountymi.gov/community/oakland-county-parks/recreation/adaptive-recreation/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2a18f3cb-4cec-408b-8a69-111d0a43089c' AND website_url = 'https://www.oakgov.com/parks/recreation/adaptive-recreation/Pages/default.aspx';

-- Hillsborough County Parks – Paralympic Sport Tampa Bay: new site; loads ("HC Adaptive Sports | Hillsborough County, FL")
UPDATE organizations SET website_url = 'https://hcfl.gov/residents/parks-and-leisure/adaptive-sports/hc-adaptive-sports', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6e80113e-6678-496d-8fc4-1c59df070602' AND website_url = 'http://www.hillsboroughcounty.org/en/residents/recreation-and-culture/sports-and-athletics/paralympic-sports-club';

-- Alegent Health Immanuel Rehabilitation Center – Omaha: new site; loads ("Therapeutic Recreation | CHI Health")
UPDATE organizations SET website_url = 'https://www.chihealth.com/services/rehabilitation/inpatient-rehabilitation/immanuel-rehabilitation-institute/therapeutic-recreation', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '55d525cf-a4ee-44dd-8f24-c697d0fb9cd2' AND website_url = 'http://www.alegentcreighton.com/TherapeuticRecreation';

-- Military Racquetball Federation: new site; loads ("Military Racquetball | USA Racquetball")
UPDATE organizations SET website_url = 'https://www.usaracquetball.com/military-racquetball', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2b073e5c-f96d-4e15-a8e1-990fb01d7f8f' AND website_url = 'http://www.militaryracquetball.com/';

-- Henry County Parks and Recreation Wheelchair Tennis: same site, new page; loads ("Parks | Henry County, GA - Official Website")
UPDATE organizations SET website_url = 'https://www.henrycountyga.gov/parks', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0f4a5851-f7e2-515e-bf5c-412d1383c1c9' AND website_url = 'https://www.henrycountyga.gov/Departments/M-R/Parks-Recreation';

-- InnerCity Tennis' Kidspeed Stations for Children with ASD: same site, new page; loads ("Youth - InnerCity Tennis")
UPDATE organizations SET website_url = 'https://innercitytennis.org/youth/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '72162f1a-8dde-5fc5-bc9a-1a5a9ed083a9' AND website_url = 'http://www.innercitytennis.org/youth/community-outreach';

-- Indo Jax Surf Charities: new site; loads ("Home - Indo Jax Surf Charities")
UPDATE organizations SET website_url = 'https://indojaxsurfcharities.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '1f27da4f-52dc-5551-83f1-2d1574943139' AND website_url = 'https://www.indojaxsurfschool.com/charity';

-- Santa Fe Family Life Center: same site, new page; loads ("Who We Are - sfflc")
UPDATE organizations SET website_url = 'https://sfflc.com/about/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4c4d2a8f-2b74-5505-ad3f-fb14ecc40219' AND website_url = 'https://sfflc.com/about/mission/';

-- Health4Heroes: same site, new page; loads ("About Health4Heroes | Empowering Veterans & First Responders")
UPDATE organizations SET website_url = 'https://health4heroes.org/about-health4heroes', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '975da950-99e5-5411-b116-20f26832e15a' AND website_url = 'https://health4heroes.org/how-we-serve';

-- Nevada Department of Veterans Services: same site, new page; loads ("Home - Nevada Department of Veterans Services")
UPDATE organizations SET website_url = 'https://veterans.nv.gov/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a0f1ef89-568a-591e-a295-20bf356b8836' AND website_url = 'https://veterans.nv.gov/message-from-director-oct25/';

-- Veterans Social Center / The High Road Inc.: same site, new page; loads ("About VSC")
UPDATE organizations SET website_url = 'https://veteranssocialcenter.org/about-vsc', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '1cd6f6a1-0dc9-5d47-8b18-62502c634960' AND website_url = 'https://veteranssocialcenter.org/about';

-- Guitars for Vets - Gardnerville: new site; loads ("Find a chapter - Guitars 4 Vets")
UPDATE programs SET website_url = 'https://guitars4vets.org/find-a-chapter/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c84dd813-d64e-5b0d-8880-50445f54908d' AND website_url = 'https://veterans.nv.gov/guitars-for-vets/';

-- Combat to Creative: new site; loads ("Combat To Creative | Veteran Support | Minnesota, USA")
UPDATE organizations SET website_url = 'https://combattocreative.wixsite.com/combattocreative', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '60776e37-8112-5467-ac54-a306a7395b03' AND website_url = 'https://www.combattocreative.org/';

-- Special Olympics Southern California — 2026 San Luis Obispo Fall Games: same site, new page; loads ("Region 1 | Special Olympics Southern California")
UPDATE organizations SET website_url = 'https://sosc.org/region-1/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '52925ad9-42f6-4865-99de-40ea39783b0c' AND website_url = 'https://sosc.org/eventcalendar/2026-sloc-fall-games/';

-- 3rd Shot Pickleball Reno Adaptive: new site; loads ("3rd Shot Pickleball Reno — Reno's Home for Indoor Pickleball")
UPDATE organizations SET website_url = 'https://www.3rdshotpickleballreno.com/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fc478a1c-b3a0-4828-84bf-3dd45f6dec82' AND website_url = 'https://3rdshotpickleball.com/home-reno';

-- Penn State Ability Athletics Program: new site; loads ("Adaptive Athletics - Penn State - Official Athletics Website")
UPDATE programs SET website_url = 'https://gopsusports.com/adaptive-athletics', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '42afb08d-22cd-4fd8-966f-209cd281b180' AND website_url = 'http://www.athletics.psu.edu/ability/';

-- Atlanta Fire United TOPSoccer: same site, new page; loads ("Atlanta Fire United")
UPDATE programs SET website_url = 'https://www.atlantaunitedsoccer.com/topsoccerd4d455be', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9004d0e4-8ef8-5803-a8b6-2ce04d9e38fb' AND website_url = 'https://www.atlantaunitedsoccer.com/Default.aspx?tabid=280686';

-- Special Pops Tennis: new site; loads ("Special Pops Tennis – Play Tennis, Make Friends, Live Life")
UPDATE programs SET website_url = 'https://www.specialpopstennis.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'aae903e8-5f4c-559e-9ae4-cc21f410aba8' AND website_url = 'https://specialpops.org/';

-- Special Olympics Louisiana, Inc., Tennis Program: new site; loads ("Sports & Competition - Special Olympics Louisiana")
UPDATE programs SET website_url = 'https://specialolympicsla.org/sports-competition/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4464f38a-a728-5cb2-bdda-c74fdb0c90d4' AND website_url = 'http://www.laso.org/';

-- Wake Forest Parks, Recreation & Cultural Resources - Dream League Baseball: same site, new page; loads ("Dream League | Town of Wake Forest, NC")
UPDATE programs SET website_url = 'https://www.wakeforestnc.gov/parks-recreation-cultural-resources/specialized-programs-inclusion/dream-league', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '92e0590f-12d3-5b55-b8a3-ab17f8392c8f' AND website_url = 'https://www.wakeforestnc.gov/parks-recreation-cultural-resources/athletics';

-- Special Olympics Virginia Beach Tennis: new site; loads ("Area 2")
UPDATE programs SET website_url = 'https://www.specialolympicsva.org/southeast-region/area-2', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '526a50c0-aa93-5568-8dae-bb44141014fb' AND website_url = 'https://area2specialolympics.org/';

-- Capital Region Nordic Alliance: new site; loads ("Home - thisabledsports.org")
UPDATE organizations SET website_url = 'https://thisabledsports.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'facba626-fdbd-4bb0-b7f2-06f383fad46f' AND website_url = 'https://www.capitalregionnordicalliance.org/';

-- Marty Turcios Therapeutic Golf Foundation: new site; loads ("Home | MTTG")
UPDATE organizations SET website_url = 'https://www.mttg.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '550348c7-fe9d-4c2d-9e8d-cb061536ad9e' AND website_url = 'http://www.therapeuticgolfclinic.com';

-- Oklahoma City Boathouse: new site; loads ("Adaptive Rowing - Riversport OKC")
UPDATE organizations SET website_url = 'https://www.riversportokc.org/team-sports/rowing/adaptive-rowing/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0851fff7-6cfa-4f1b-8a36-bc94f5dbf19d' AND website_url = 'http://okc-nhpc.org/';

-- EMARC Adaptive Tennis: new site; loads ("Recreation Programs - Communitas")
UPDATE organizations SET website_url = 'https://communitasma.org/services/recreational-programs/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6e368383-7302-5ee3-8067-3fe41c0fc713' AND website_url = 'https://theemarc.org/';

-- CHI Health Immanuel Rehab Institute, Paralympic Sports Club: same site, new page; loads ("Sports and Leisure Program | CHI Health")
UPDATE organizations SET website_url = 'https://www.chihealth.com/services/rehabilitation/outpatient-rehabilitation/sports-and-leisure-program', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c0251cd4-2f9e-5441-8eec-29f320b24bf3' AND website_url = 'https://www.teamusa.org/Team-USA-Athlete-Services/Paralympic-Sport-Development/Getting-Started/Find-A-Club/Club-Search/CHI-Health-Immanuel-Rehabilitation-Institute';

-- GPTL Racquest Stars: new site; loads ("Greater Pottstown Tennis & Learning | Youth, Adult & Adaptiv")
UPDATE organizations SET website_url = 'https://greaterpottstowntennis.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5579ecdd-79d0-54fd-a7a3-baec9e604fd0' AND website_url = 'http://www.gptatennis.com/';

-- Arkansas Hospice: new site; loads ("Committed to Veterans — LifeTouch Health")
UPDATE organizations SET website_url = 'https://www.lifetouchhealth.org/committed-to-veterans', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '25c3528d-c555-5c94-baee-59fba6a35d40' AND website_url = 'https://www.arkansashospice.org/patients-families-caregivers/veterans';

-- Oklahoma Arts Council / Oklahoma Department of Veterans Affairs: same site, new page; loads ("Arts and the Military")
UPDATE organizations SET website_url = 'https://oklahoma.gov/arts/programs/arts_and_military.html', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '16b3be1c-e6d8-58af-9c4a-96b77b15b208' AND website_url = 'https://www.arts.ok.gov/our_programs/Art_and_Military.html';

-- Adaptive Ski Program: new site; loads ("Adaptive Sports Program New Mexico - Home")
UPDATE programs SET website_url = 'https://www.adaptivesportsprogram.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7b8db43e-1900-4e92-81e6-3c696a476b21' AND website_url = 'http://www.adaptiveski.org';

-- Medstar NRH Veterans Sports Program: same site, new page; loads ("Adaptive Sports Fitness Program")
UPDATE programs SET website_url = 'https://www.medstarhealth.org/services/adaptive-sports-fitness-program', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ea872984-ce4c-4fc7-abcf-47426426658c' AND website_url = 'http://www.medstarnrh.org/sports';

-- Green Spring Tennis and Educational Foundation: new site; loads ("GSTEF")
UPDATE programs SET website_url = 'https://sites.google.com/view/gstef/home', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c61cf152-d9a4-56cb-afd2-1865f2e07b3c' AND website_url = 'http://www.gstef.org/';
