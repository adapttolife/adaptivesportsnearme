-- All 2026-10-21 data fixes, in run order. Ran on asnm-db-staging on 2026-10-21. Safe to run twice.
-- Start here: docs/data-fixes/README.md

-- ===== karen_skiing_1_confident.sql
-- docs/data-fixes/karen-skiing.md, part 1. Safe to run twice: every UPDATE matches the row's current value.

-- Karen's list (2026-10-21). Each line is checked on the organization's own website.
-- Vermont Adaptive Ski and Sports: Vermont Adaptive, HQ at Pico Mountain, Killington. Had no link, so it was hidden.
UPDATE organizations SET website_url = 'https://www.vermontadaptive.org/', city = 'Killington', last_ok_at = NULL
  WHERE id = '18a9facb-61f3-4246-8031-79a32a57e54d' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Adaptive Sports Foundation: Adaptive Sports Foundation, Windham NY. Had no link, so it was hidden.
UPDATE organizations SET website_url = 'https://www.adaptivesportsfoundation.org/', city = 'Windham', last_ok_at = NULL
  WHERE id = '90485a4a-7a41-45b9-8d59-ede3ac7e3cae' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- New England Disabled Sports: New England Disabled Sports, Loon Mountain, Lincoln NH. Had no link, so it was hidden.
UPDATE organizations SET website_url = 'https://nedisabledsports.org/', city = 'Lincoln', last_ok_at = NULL
  WHERE id = 'd2c13bb9-edc8-412e-845e-730e8fe50bb4' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- New England Healing Sports Association (NEHSA): NEHSA, Mount Sunapee, Newbury NH.
UPDATE organizations SET website_url = 'https://nehsa.org/', city = 'Newbury', last_ok_at = NULL
  WHERE id = '8f21c7f6-8403-4792-978e-a83899d83921' AND website_url = 'http://www.nehsa.org' AND (city IS NULL OR city = '');

-- Adaptive Sports at Mount Snow | ASMS: Adaptive Sports at Mount Snow, West Dover (town of Dover) VT. Had no link or state, so it was hidden.
UPDATE organizations SET website_url = 'https://www.adaptiveatsnow.org/', city = 'Dover', state = 'VT', state_name = 'Vermont', last_ok_at = NULL
  WHERE id = '34380ebf-bf06-4de7-800f-d4f4a60d6d0b' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- National Ability Center – Park City: NAC, Park City UT. discovernac.org now redirects here.
UPDATE organizations SET website_url = 'https://nationalabilitycenter.org/', city = 'Park City', last_ok_at = NULL
  WHERE id = '7f66bd7e-f782-4908-be5d-0d9317f35d37' AND website_url = 'http://www.discovernac.org' AND (city IS NULL OR city = '');

-- Steamboat Adaptive Recreational Sports ‘STARS’: STARS, Steamboat Springs CO.
UPDATE organizations SET city = 'Steamboat Springs'
  WHERE id = '91660598-fbb3-4f51-9400-d15b743d5a02' AND (city IS NULL OR city = '');

-- Challenge Aspen: Challenge Aspen, Snowmass Village CO. CAMO is its veterans program, not a separate organization.
UPDATE organizations SET website_url = 'https://challengeaspen.org/', city = 'Snowmass Village', last_ok_at = NULL
  WHERE id = 'f28a3bb7-6e25-42b0-90af-db583ffd0673' AND website_url = 'http://www.challengeaspen.com' AND (city IS NULL OR city = '');

-- Eagle Mount Bozeman: Eagle Mount Bozeman. It also runs the adaptive program at Big Sky (Big Sky Resort says so).
UPDATE organizations SET city = 'Bozeman'
  WHERE id = 'c7cccde6-1b05-46d5-9f80-ce501f45799a' AND (city IS NULL OR city = '');

-- Aspen Valley Ski and Snowboard Club (AVSC): Aspen Valley Ski and Snowboard Club is in Aspen, CO, not Utah (the footer of its own site). See the look-first file: it may not be adaptive at all.
UPDATE organizations SET city = 'Aspen', state = 'CO', state_name = 'Colorado'
  WHERE id = 'ac064049-e8cc-4a71-a371-cb8d73f55a57' AND (city IS NULL OR city = '') AND state = 'UT';

-- Other ski programs: town on file (so distance works) and current link.
-- Cannonsburg Challenged Ski Association: Now Adaptive Ski Association of West Michigan. skiccsa.org is a parked ad page.
UPDATE organizations SET website_url = 'https://www.asa-wm.org/', city = 'Ada', last_ok_at = NULL
  WHERE id = 'adbc8084-0adf-45d6-81a0-4232ed6779b8' AND website_url = 'http://www.skiccsa.org' AND (city IS NULL OR city = '');

-- Boise Adaptive Snowsport Education | BASE: BASE, Boise ID (Bogus Basin). Had no link or state.
UPDATE organizations SET website_url = 'https://www.baseidaho.net/', city = 'Boise', state = 'ID', state_name = 'Idaho', last_ok_at = NULL
  WHERE id = 'f991223c-e3af-4148-a918-5f09e0b19c88' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Greek Peak Adaptive Snowsports: Greek Peak Adaptive Snowsports, at Greek Peak in Virgil NY.
UPDATE organizations SET city = 'Virgil'
  WHERE id = 'cb639492-5bd8-49a5-97c5-a1f8f71fbb4b' AND (city IS NULL OR city = '');

-- Leaps Of Faith Disabled Skiers – Paralympic Sport Connecticut: LOF Adaptive Skiers, lessons at Mount Southington CT.
UPDATE organizations SET city = 'Southington'
  WHERE id = '37759c33-9686-477f-8aab-c4be9e49e553' AND (city IS NULL OR city = '');

-- Foresight Ski Guides, Inc.: Foresight Ski Guides, Vail and Beaver Creek. Had no link.
UPDATE organizations SET website_url = 'https://www.foresightskiguides.org/', city = 'Vail', last_ok_at = NULL
  WHERE id = 'ad159233-f344-4ec6-b937-2a3057547716' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Special Outdoor Leisure Opportunities (SOLO, Inc.): SOLO, based in South Bend IN (skis at Swiss Valley, Jones MI).
UPDATE organizations SET city = 'South Bend'
  WHERE id = '7e35c388-e29d-4429-bc56-3c684db25179' AND (city IS NULL OR city = '');

-- Blue Ridge Adaptive Snow Sports (BRASS): BRASS, Fairfield PA (Liberty Mountain).
UPDATE organizations SET city = 'Fairfield'
  WHERE id = '84a1a725-593d-49e1-9b5d-7c2b46373cd8' AND (city IS NULL OR city = '');

-- Black Hills Regional Ski for Light, Inc.: Black Hills Regional Ski for Light, Rapid City SD.
UPDATE organizations SET city = 'Rapid City'
  WHERE id = '728c099c-a7d8-4d8d-ac11-3ee14ab6b071' AND (city IS NULL OR city = '');

-- Wintergreen Adaptive Sports: skiwas.org now redirects here.
UPDATE organizations SET website_url = 'https://www.wintergreenadaptivesports.org/', city = 'Wintergreen', last_ok_at = NULL
  WHERE id = 'c73b0784-b96a-4754-8962-7807dd896e76' AND website_url = 'http://www.skiwas.org' AND (city IS NULL OR city = '');

-- Central Cross Country Ski Association – Madison: CXC adaptive Nordic, Middleton WI.
UPDATE organizations SET city = 'Middleton'
  WHERE id = '9d37cd88-0261-4f84-9f1b-a9698acee719' AND (city IS NULL OR city = '');

-- Two Top Mountain Adaptive Sports Foundation: Two Top Mountain, Whitetail Resort, Mercersburg PA.
UPDATE organizations SET city = 'Mercersburg'
  WHERE id = '88c8136f-9289-4911-abf8-0bb622a71845' AND (city IS NULL OR city = '');

-- Eagle Mount Great Falls: Eagle Mount Great Falls.
UPDATE organizations SET city = 'Great Falls'
  WHERE id = 'dad64d2f-9967-4c69-b3cf-e2b46e138dc4' AND (city IS NULL OR city = '');

-- Eagle Mount Billings: Eagle Mount Billings. Had no link.
UPDATE organizations SET website_url = 'https://eaglemountbillings.org/', city = 'Billings', last_ok_at = NULL
  WHERE id = 'feb18991-7382-4f49-bcac-dc84b26f0582' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Adaptive Ski Program: Now Adaptive Sports Program New Mexico (Ski Santa Fe, Sandia Peak). adaptiveski.org redirects here.
UPDATE programs SET website_url = 'https://www.adaptivesportsprogram.org/', city = 'Santa Fe', last_ok_at = NULL
  WHERE id = '7b8db43e-1900-4e92-81e6-3c696a476b21' AND website_url = 'http://www.adaptiveski.org' AND (city IS NULL OR city = '');

-- Ski Apache Disabled Skiers Program: Now All Season Adaptive Sports, at Ski Apache near Ruidoso NM. Had no link.
UPDATE programs SET website_url = 'https://www.allseasonadaptivesports.com/', city = 'Ruidoso', last_ok_at = NULL
  WHERE id = '6ba84180-b7fc-4387-80f5-3942b5fa2e00' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Lounsbury Adaptive Ski Program: Its old Wix page says "This site has moved to lounsburyadaptive.org". Holiday Valley, Ellicottville NY.
UPDATE programs SET website_url = 'https://lounsburyadaptive.org/', city = 'Ellicottville', last_ok_at = NULL
  WHERE id = 'd81f31e3-378f-4dfd-ae0b-aeb85207374e' AND website_url = 'https://skilasp1.wixsite.com/lounsburyadaptive' AND (city IS NULL OR city = '');

-- Southeastern Wisconsin Adaptive Ski Program: SEWASP, Alpine Valley, East Troy WI.
UPDATE programs SET website_url = 'https://sewasp.org/', city = 'East Troy', last_ok_at = NULL
  WHERE id = 'f6dad335-a0e3-4daf-a2e1-2de726f0f8f7' AND website_url = 'http://www.sewasp.org' AND (city IS NULL OR city = '');


-- ===== lost_links_restore.sql
-- docs/data-fixes/lost-links.md. Puts back a website the June dataset had (CAF Directory) on the live row that lost it.
-- Every link was loaded on 2026-10-21 and its page title read. Only rows with no link are touched; safe to run twice.

-- Team River Runner Ft. Campbell (AL): Team River Runner – River to Recovery
UPDATE organizations SET website_url = 'https://www.teamriverrunner.org/?q=node/1283', last_ok_at = NULL WHERE id = '3bc3cca6-8519-47c5-a88d-146942fc0ce7' AND (website_url IS NULL OR website_url = '');

-- Achieve Tahoe (CA): Achieve Tahoe | Achieve Tahoe
UPDATE organizations SET website_url = 'https://www.achievetahoe.org/', last_ok_at = NULL WHERE id = 'e06dcd42-92d3-4eb6-ac6f-04925a4f29c4' AND (website_url IS NULL OR website_url = '');

-- Argo Challenge (CA): ARGO Challenge - We Can, You Can
UPDATE organizations SET website_url = 'https://www.argochallenge.org/pages/Home_en/101', last_ok_at = NULL WHERE id = '16807403-5931-4b35-a940-da6046ef8fa2' AND (website_url IS NULL OR website_url = '');

-- United States Para-Equestrian Association (CA): United States Para-Equestrian Association
UPDATE organizations SET website_url = 'https://uspea.org/', last_ok_at = NULL WHERE id = '1be58214-d06f-4bb9-9550-81126c27daca' AND (website_url IS NULL OR website_url = '');

-- Team River Runner Sacramento (CA): California – American River – Team River Runner
UPDATE organizations SET website_url = 'https://www.teamriverrunner.org/get-involved/chapters/california-american-river/', last_ok_at = NULL WHERE id = '04dcd628-1ba9-48a9-bb7a-73ceb7dbd52f' AND (website_url IS NULL OR website_url = '');

-- Team River Runner San Diego (CA): California – San Diego – Team River Runner
UPDATE organizations SET website_url = 'https://www.teamriverrunner.org/get-involved/chapters/california-san-diego/', last_ok_at = NULL WHERE id = '6625bd11-c9ed-4712-8e6b-f4618bae98e8' AND (website_url IS NULL OR website_url = '');

-- San Diego Rowing Club (CA): San Diego Rowing Club – and Garty Family Pavilion
UPDATE organizations SET website_url = 'https://www.sandiegorowing.org/', last_ok_at = NULL WHERE id = '14fbe5a0-b213-4cac-88d5-b43451270903' AND (website_url IS NULL OR website_url = '');

-- High Fives Non-Profit Foundation (CA): Adaptive Sports Foundation | High Fives Foundation
UPDATE organizations SET website_url = 'https://highfivesfoundation.org/', last_ok_at = NULL WHERE id = '84e84cc7-2ced-474d-bcda-eac4083d77f7' AND (website_url IS NULL OR website_url = '');

-- San Diego Ducks Sled Hockey (CA): Ducks Sled Hockey – Improving lives through sport
UPDATE organizations SET website_url = 'https://duckssledhockey.org/', last_ok_at = NULL WHERE id = '3a5b9149-77b5-4274-aa4c-432f95305389' AND (website_url IS NULL OR website_url = '');

-- USA Shooting (CO): Home | USA Shooting
UPDATE organizations SET website_url = 'https://usashooting.org/', last_ok_at = NULL WHERE id = '67ca5776-b43b-4162-b811-d9a2bcfdf33a' AND (website_url IS NULL OR website_url = '');

-- USA Fencing (CO): Home | USA Fencing
UPDATE organizations SET website_url = 'https://www.usafencing.org/', last_ok_at = NULL WHERE id = '83542d91-e1fe-4e49-a68c-c04215c59ff4' AND (website_url IS NULL OR website_url = '');

-- Community Sailing of Colorado (CO): Home - Community Sailing of Colorado
UPDATE organizations SET website_url = 'https://www.communitysailing.org/', last_ok_at = NULL WHERE id = '3d835bbf-b618-4c5a-8d10-fdd3d0e8df4c' AND (website_url IS NULL OR website_url = '');

-- National Wheelchair Basketball Association (CO): National Wheelchair Basketball Association
UPDATE organizations SET website_url = 'https://www.nwba.org/', last_ok_at = NULL WHERE id = '7dc3b960-3bfa-43cf-bb3d-4565fc0b7c75' AND (website_url IS NULL OR website_url = '');

-- Team River Runner Orlando (FL): Team River Runner – River to Recovery
UPDATE organizations SET website_url = 'https://www.teamriverrunner.org/?q=node/1354', last_ok_at = NULL WHERE id = 'fe2e3a5a-bae3-4bad-9237-4907422d96e6' AND (website_url IS NULL OR website_url = '');

-- Team River Runner Atlanta (GA): Georgia – Atlanta – Team River Runner
UPDATE organizations SET website_url = 'https://www.teamriverrunner.org/get-involved/chapters/georgia-atlanta/', last_ok_at = NULL WHERE id = 'f262d333-052a-413b-a37e-895e00c0a8e3' AND (website_url IS NULL OR website_url = '');

-- Catalyst Sports (GA): Catalyst Sports | adaptive sports
UPDATE organizations SET website_url = 'https://www.catalystsports.org/', last_ok_at = NULL WHERE id = '45b412a5-ca12-42ac-bf31-8b783e7e780d' AND (website_url IS NULL OR website_url = '');

-- Adaptive Wilderness Sports of McCall (ID): awesomemccall.org
UPDATE organizations SET website_url = 'https://sites.google.com/awesomemccall.org/home/home', last_ok_at = NULL WHERE id = 'ac583c0d-af99-4d7a-96c0-478a7581fb6e' AND (website_url IS NULL OR website_url = '');

-- Idaho Wheelchair Tennis Association (ID): Idaho Wheelchair Tennis Association - Home
UPDATE organizations SET website_url = 'https://playtennis.usta.com/idaho-wheelchair-tennis-association0', last_ok_at = NULL WHERE id = '7dc9a34f-6f4a-44be-a4b5-4f68e5593327' AND (website_url IS NULL OR website_url = '');

-- Great Lakes Adaptive Sports Association (GLASA) (IL): Great Lakes Adaptive Sports Association – Let no one sit on the sideli
UPDATE organizations SET website_url = 'https://glasa.org/', last_ok_at = NULL WHERE id = '0ac72a3e-b1f8-47a3-b99c-33a2d4bb8df2' AND (website_url IS NULL OR website_url = '');

-- South Suburban Special Recreation Association (IL): Recreation for Children & Adults with Disabilities or Special Needs | 
UPDATE organizations SET website_url = 'https://sssra.org/', last_ok_at = NULL WHERE id = '26a090e5-7f41-4bdc-819b-c0416fda993f' AND (website_url IS NULL OR website_url = '');

-- Rockford Park District (IL): Therapeutic Recreation - Programs for people with disabilities — Rockf
UPDATE organizations SET website_url = 'https://rockfordparkdistrict.org/therapeutic', last_ok_at = NULL WHERE id = 'b4bcda09-2696-49ff-8468-a8ae0569f590' AND (website_url IS NULL OR website_url = '');

-- Northern Suburban Special Recreation Association (IL): Northern Suburban Special Recreation Association: NSSRA Home - NSSRA
UPDATE organizations SET website_url = 'https://www.nssra.org/', last_ok_at = NULL WHERE id = 'd9749c7e-28e2-416a-85e5-cb8cd832f12c' AND (website_url IS NULL OR website_url = '');

-- Northern Illinois Special Recreation Association (IL): NISRA - Year-round recreation for people with disabilities
UPDATE organizations SET website_url = 'https://www.nisra.org/', last_ok_at = NULL WHERE id = '278bff6c-73ce-4565-98ec-ded225a73085' AND (website_url IS NULL OR website_url = '');

-- Northwest Special Recreation Association (IL): Home - NWSRA
UPDATE organizations SET website_url = 'https://www.nwsra.org/', last_ok_at = NULL WHERE id = 'f457f639-3d63-4979-95e8-c9f20fc51abf' AND (website_url IS NULL OR website_url = '');

-- Heart of Illinois Special Recreation Association (IL): Welcome to The Heart of Illinois Special Recreation Association - HISR
UPDATE organizations SET website_url = 'https://hisra.org/', last_ok_at = NULL WHERE id = '274baba2-2f54-4dfe-a69e-dc3947f7b5a8' AND (website_url IS NULL OR website_url = '');

-- South West Special Recreation Association (IL): South West Special Recreation Association (SWSRA)
UPDATE organizations SET website_url = 'https://www.swsra.org/', last_ok_at = NULL WHERE id = '62c6bc79-a604-4c7d-af65-bd9cfa27d785' AND (website_url IS NULL OR website_url = '');

-- US Biathlon (ME): Biathlon Home Page | US Biathlon
UPDATE organizations SET website_url = 'https://www.usbiathlon.org/', last_ok_at = NULL WHERE id = '5f8d0934-96f5-4edb-82ae-493942802069' AND (website_url IS NULL OR website_url = '');

-- Maryland Ravens (MD): Maryland Ravens
UPDATE organizations SET website_url = 'https://www.marylandravens.org/', last_ok_at = NULL WHERE id = '76294ef4-45e8-4cc0-9d27-e34fbb919e0a' AND (website_url IS NULL OR website_url = '');

-- Cape Cod Curling Club (MA): Cape Cod Curling Club - Home
UPDATE organizations SET website_url = 'https://capecodcurling.org/', last_ok_at = NULL WHERE id = 'ec1f6463-42d5-4f61-bfb4-1ea320682731' AND (website_url IS NULL OR website_url = '');

-- Amelia Park Ice Arena (MA): AMELIA PARK ARENA
UPDATE organizations SET website_url = 'https://www.ameliaparkarena.org/', last_ok_at = NULL WHERE id = '7ec6c489-70fd-4e5a-8b63-fb97006f6595' AND (website_url IS NULL OR website_url = '');

-- Michigan State University Demmer Center (MI): Demmer Center | Residential and Hospitality Services | Michigan State 
UPDATE organizations SET website_url = 'https://rhs.msu.edu/demmer-center', last_ok_at = NULL WHERE id = '0fcd004e-f4cf-4af6-a8ee-128afc50a937' AND (website_url IS NULL OR website_url = '');

-- Eastern Nebraska Wheelchair Athletic Association (ENWAA) (NE): Eastern Nebraska Wheelchair Athletic Association (ENWAA) | Cerebral Pa
UPDATE organizations SET website_url = 'https://cpfamilynetwork.org/resources/resources-guide/eastern-nebraska-wheelchair-athletic-association-enwaa/', last_ok_at = NULL WHERE id = '134c58e2-9d11-4d0b-9bcc-8348c869b44c' AND (website_url IS NULL OR website_url = '');

-- City of Las Vegas Adaptive Recreation (no state): Adaptive Recreation
UPDATE organizations SET website_url = 'https://www.lasvegasnevada.gov/Government/Departments/Parks-Recreation/Adaptive-Recreation', last_ok_at = NULL WHERE id = 'c34e8c96-cd38-4b7d-8cbe-72722066e76b' AND (website_url IS NULL OR website_url = '');

-- Lakes Region Disabled Sports at Gunstock (NH): Lakes Region Disabled Sports
UPDATE organizations SET website_url = 'https://lradaptive.org/', last_ok_at = NULL WHERE id = 'b8ddfa57-d4eb-4f19-a1a0-c713f3bbf1b0' AND (website_url IS NULL OR website_url = '');

-- United States Rowing Association (NJ): USRowing
UPDATE organizations SET website_url = 'https://usrowing.org/', last_ok_at = NULL WHERE id = '86bb2ecf-b2af-4914-8656-e88f7b03e77f' AND (website_url IS NULL OR website_url = '');

-- Global Opportunities Unlimited (NM): Go Unlimited
UPDATE organizations SET website_url = 'https://www.gounlimited.org/', last_ok_at = NULL WHERE id = '4809f6a6-7971-40bb-aae6-5e6523e92b8e' AND (website_url IS NULL OR website_url = '');

-- Challenge New Mexico (NM): Therapy Horseback Riding | Santa Fe | Challenge New Mexico
UPDATE organizations SET website_url = 'https://www.challengenewmexico.com/', last_ok_at = NULL WHERE id = '0f8405b2-4a85-4846-a4d8-559e8b57c96d' AND (website_url IS NULL OR website_url = '');

-- United States Tennis Association (NY): Play Tennis: Wheelchair Tennis Tournaments
UPDATE organizations SET website_url = 'https://www.usta.com/en/home/play/adult-tennis/programs/national/wheelchair-tennis-tournaments.html', last_ok_at = NULL WHERE id = '3c6e1bc4-43b3-4528-b08c-79b5404fad14' AND (website_url IS NULL OR website_url = '');

-- Row New York (NY): Row New York
UPDATE organizations SET website_url = 'https://www.rownewyork.org/', last_ok_at = NULL WHERE id = '1d67511e-79cd-4ae9-a1e0-8bc7f6d58486' AND (website_url IS NULL OR website_url = '');

-- World T.E.A.M. Sports (NY): Home - World TEAM Sports
UPDATE organizations SET website_url = 'https://worldteamsports.org/', last_ok_at = NULL WHERE id = '2153b05a-9478-40c3-9b46-09fba1d8b18f' AND (website_url IS NULL OR website_url = '');

-- Wheelchair Sports Federation (NY): Wheelchair Sports Federation: Empowering Athletes in Sports
UPDATE organizations SET website_url = 'https://wheelchairsportsfederation.org/', last_ok_at = NULL WHERE id = 'c62782e4-df74-4480-b7d4-1712e681f6eb' AND (website_url IS NULL OR website_url = '');

-- Bridge II Sports (NC): Bridge2Sports | Adapted Sports in Raleigh-Durham
UPDATE organizations SET website_url = 'https://www.bridge2sports.org/', last_ok_at = NULL WHERE id = '5c295b56-93de-416a-b56d-0e03b9043f7c' AND (website_url IS NULL OR website_url = '');

-- The Warrior Ride (NC): Warriors Helping Warriors | The Warrior Ride®
UPDATE organizations SET website_url = 'https://www.thewarriorride.org/', last_ok_at = NULL WHERE id = '9b579336-a92d-4a4e-a3fe-d9219008cfcd' AND (website_url IS NULL OR website_url = '');

-- Three Trackers of Ohio (OH): Home
UPDATE organizations SET website_url = 'http://www.3trackers.org/', last_ok_at = NULL WHERE id = '7ad4fa0f-3dc0-4a19-8329-7065e944ba98' AND (website_url IS NULL OR website_url = '');

-- Greater Columbus Rowing Association (OH): Greater Columbus Rowing Association
UPDATE organizations SET website_url = 'https://www.columbusrowing.org/', last_ok_at = NULL WHERE id = 'c6785b28-ee46-4983-adb2-353d7f18bb14' AND (website_url IS NULL OR website_url = '');

-- SPIRE Institute (OH): Home - SPIRE Academy
UPDATE organizations SET website_url = 'https://www.spireacademy.com/', last_ok_at = NULL WHERE id = '2ec2b541-100a-4bb7-a341-cff2b0c37276' AND (website_url IS NULL OR website_url = '');

-- Great Miami Rowing Center (OH): Great Miami Rowing Center
UPDATE organizations SET website_url = 'https://greatmiamirowing.org/', last_ok_at = NULL WHERE id = 'ebc14366-ef3b-4183-a5d8-34fc454403fd' AND (website_url IS NULL OR website_url = '');

-- Evergreen Curling Club (OR): Evergreen Curling Club
UPDATE organizations SET website_url = 'https://www.evergreencurling.org/', last_ok_at = NULL WHERE id = '341cecc1-a9f1-4463-850c-c1007cf9ed39' AND (website_url IS NULL OR website_url = '');

-- Blind Sports Organization (PA): Blind Sports Organization
UPDATE organizations SET website_url = 'https://www.blindsports.org/', last_ok_at = NULL WHERE id = '3780a0dc-56eb-4dbf-ba6f-0a4ae93b5fe5' AND (website_url IS NULL OR website_url = '');

-- Sports, Arts & Recreation of Chattanooga (SPARC) (TN): Sports, Arts & Recreation of Chattanooga
UPDATE organizations SET website_url = 'http://www.sparctn.org/', last_ok_at = NULL WHERE id = '7edab0a2-680d-4f32-97d6-1a402f4abcbe' AND (website_url IS NULL OR website_url = '');

-- Southwest Wheelchair & Ambulatory Sports Association (TX): SWAA
UPDATE organizations SET website_url = 'https://www.swaasports.org/', last_ok_at = NULL WHERE id = 'aac2bf8a-4f90-4bf7-91e1-79cb1079f6c1' AND (website_url IS NULL OR website_url = '');

-- Salt Lake County Adaptive Recreation (UT): Adaptive Recreation - Parks & Recreation | Salt Lake County
UPDATE organizations SET website_url = 'https://www.saltlakecounty.gov/parks-recreation/adaptive/', last_ok_at = NULL WHERE id = '751c5515-73e4-4653-8d1d-e1b1ae5e61c5' AND (website_url IS NULL OR website_url = '');

-- Common Ground Outdoor Adventures (UT): Common Ground Outdoor Adventures
UPDATE organizations SET website_url = 'https://cgadventures.org/', last_ok_at = NULL WHERE id = 'ae42947d-1552-46a5-a15f-b9856826c24b' AND (website_url IS NULL OR website_url = '');

-- Richmond Tennis Association (VA): Richmond Tennis Association – RVA's Best Tennis Resource
UPDATE organizations SET website_url = 'https://richmondtennis.org/', last_ok_at = NULL WHERE id = 'c97280f7-791e-4a1c-aff5-55faa972ed6b' AND (website_url IS NULL OR website_url = '');

-- Seattle Adaptive Sports (WA): Seattle Adaptive Sports | Compete, Learn, Grow
UPDATE organizations SET website_url = 'https://www.seattleadaptivesports.org/', last_ok_at = NULL WHERE id = '3fd13e69-3c9c-4ce2-a0bb-6fdbbee45294' AND (website_url IS NULL OR website_url = '');

-- USA Curling (WI): ADAPTIVE CURLING — USA CURLING
UPDATE organizations SET website_url = 'https://www.usacurling.org/adaptive-curling', last_ok_at = NULL WHERE id = '5c8fa4ee-d0c3-46a6-a929-fc57a889b917' AND (website_url IS NULL OR website_url = '');

-- Casper Mountain Biathlon Club (WY): Adaptive Biathlon/Paralympic - CMBC
UPDATE organizations SET website_url = 'https://caspermountainbiathlonclub.org/paralympic/', last_ok_at = NULL WHERE id = 'cb1831a7-cd9d-4545-b020-25bb50419bca' AND (website_url IS NULL OR website_url = '');

-- National Center on Health, Physical Activity and Disability (NCHPAD) (no state): National Center on Health, Physical Activity and Disability (NCHPAD) -
UPDATE organizations SET website_url = 'https://www.nchpad.org/', last_ok_at = NULL WHERE id = 'b936102a-0392-46c6-a810-c8d71569aecb' AND (website_url IS NULL OR website_url = '');


-- ===== dead_links_1_confident.sql
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


-- ===== missing_data_1_confident.sql
-- docs/data-fixes/missing-data.md. Every UPDATE matches the row's id and only fills what is empty (or matches the
-- current value it replaces), so it is safe to run twice and skips anything someone already set.

-- US Electric Wheelchair Hockey Association | USEWHA: website. Evidence: https://powerhockey.com/
UPDATE organizations SET website_url = 'https://powerhockey.com/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '580076b7-8f5f-425e-b19c-e665b6e304ca' AND (website_url IS NULL OR website_url = '');

-- Courage Kenny Rehabilitation Institute | CKRI: website + state. Evidence: https://allinahealth.org/adaptivesports
UPDATE organizations SET website_url = 'https://www.allinahealth.org/adaptivesports', last_ok_at = NULL, state = 'MN', state_name = 'Minnesota', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b2a0602e-8e6d-4fbb-b0ea-6b7322a022aa' AND (website_url IS NULL OR website_url = '') AND (state IS NULL OR state = '');

-- Adaptive Sports Partners of the North Country: website. Evidence: https://adaptivesportspartners.org/participate/
UPDATE organizations SET website_url = 'https://adaptivesportspartners.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b554b41e-d820-47e6-bb3e-7481e28b4054' AND (website_url IS NULL OR website_url = '');

-- Special Olympics Montana: website. Evidence: https://somt.org/our-story/
UPDATE organizations SET website_url = 'https://somt.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '142ce42a-8306-4fa3-9233-55705be312ec' AND (website_url IS NULL OR website_url = '');

-- Special Olympics West Virginia: website. Evidence: https://sowv.org/
UPDATE organizations SET website_url = 'https://sowv.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c8cbb62b-4588-4dcd-9a3e-c5d8591cf71a' AND (website_url IS NULL OR website_url = '');

-- Northeast Disabled Athletic Association | NDAA: website + town + state. Evidence: https://disabledathletics.org/about/
UPDATE organizations SET website_url = 'https://disabledathletics.org/', last_ok_at = NULL, city = 'Burlington', state = 'VT', state_name = 'Vermont', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4aec15d9-62a0-4b5b-a72e-50d4703442cd' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Dallas Sled Hockey: website + town. Evidence: https://www.swaasports.org/swaa/sled-hockey
UPDATE organizations SET website_url = 'https://www.swaasports.org/swaa/sled-hockey', last_ok_at = NULL, city = 'Farmers Branch', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7e3d4ec9-4e4a-4269-8372-5f3d6817ef71' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- USA Swimming Adapted Swimming: website. Evidence: https://www.usaswimming.org/resource-center/diversity-equity-inclusion
UPDATE organizations SET website_url = 'https://www.usaswimming.org/resource-center/diversity-equity-inclusion', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7a196b9f-3d59-449e-9425-0f7bebd7e836' AND (website_url IS NULL OR website_url = '');

-- Team River Runner – Bozeman: town. Evidence: https://www.teamriverrunner.org/montana-bozeman/
UPDATE organizations SET city = 'Bozeman', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2100bf8f-e03e-4ca8-bc34-a5de81215feb' AND (city IS NULL OR city = '');

-- Special Olympics Nebraska: website. Evidence: https://www.sone.org/who-we-are/contact-us.html
UPDATE organizations SET website_url = 'https://www.sone.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e8e318fa-144a-4227-a68e-7d008107ea19' AND (website_url IS NULL OR website_url = '');

-- Northeast Sled Hockey League: website. Evidence: https://www.neshl.org/about-neshl
UPDATE organizations SET website_url = 'https://www.neshl.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e7868760-9632-4b9b-9e17-0d66c7cb42c0' AND (website_url IS NULL OR website_url = '');

-- Branded Brothers, Inc.: town. Evidence: https://www.brandedbrothersinc.org/
UPDATE organizations SET city = 'Shelley', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e5aa93a3-6a1d-5f7e-a591-b9eeeb8f114a' AND (city IS NULL OR city = '');

-- Martinsburg VA Medical Center: website + town. Evidence: https://www.va.gov/martinsburg-health-care/
UPDATE organizations SET website_url = 'https://www.va.gov/martinsburg-health-care/', last_ok_at = NULL, city = 'Martinsburg', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '11a91b60-2ec5-5f27-be9b-024c9ae6b4f9' AND website_url = 'https://www.va.gov/files/2024-02/PR_CoffeeSocials.20240207.pdf' AND (city IS NULL OR city = '');

-- Pennsylvania Center for Adapted Sports | PCAS: website + town + state. Evidence: https://centeronline.com/
UPDATE organizations SET website_url = 'https://centeronline.com/', last_ok_at = NULL, city = 'Philadelphia', state = 'PA', state_name = 'Pennsylvania', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '046a3daf-0743-4ec2-9481-c738ae37a816' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- RIC Sky (Women’s Team): website + town. Evidence: https://www.sralab.org/wheelchair-basketball
UPDATE organizations SET website_url = 'https://www.sralab.org/wheelchair-basketball', last_ok_at = NULL, city = 'Chicago', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '116eb801-041c-4551-a350-af3ee09dda97' AND website_url = 'http://www.ricsky.org/' AND (city IS NULL OR city = '');

-- USA Shooting Paralympic: website. Evidence: https://www.usashooting.org/
UPDATE organizations SET website_url = 'https://www.usashooting.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '22faa628-b04d-49ef-bd22-ddc92104952f' AND (website_url IS NULL OR website_url = '');

-- A Stable Learning: town. Evidence: https://astablelearning.com/
UPDATE organizations SET city = 'San Benito', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '26d72af7-3e7e-55db-8f93-f75d6c49af68' AND (city IS NULL OR city = '');

-- Homefront Horsemanship: town. Evidence: https://www.homefronthorsemanship.org/
UPDATE organizations SET city = 'El Cajon', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ad4ab0f9-41b1-50e7-88b3-8da1784e4314' AND (city IS NULL OR city = '');

-- Disabled Athlete Sports Association – St. Louis: website + town. Evidence: http://www.dasasports.org
UPDATE organizations SET website_url = 'https://dasasports.org/', last_ok_at = NULL, city = 'St. Louis', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e3cb007a-bf43-470e-8ff2-5927738b49f7' AND website_url = 'http://www.dasasports.org' AND (city IS NULL OR city = '');

-- Special Olympics Texas: website. Evidence: https://www.sotx.org/
UPDATE organizations SET website_url = 'https://www.sotx.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c6719c3a-8e4d-4e0a-9437-6f07d90713a6' AND (website_url IS NULL OR website_url = '');

-- American Amputee Soccer Association: website. Evidence: https://www.usampsoccer.org/about-aasa
UPDATE organizations SET website_url = 'https://www.usampsoccer.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '538f177e-c097-45b5-a630-529c72904116' AND (website_url IS NULL OR website_url = '');

-- Metro Area Community Empowerment (MACE): website. Evidence: https://mace-mississippi.org/locations/
UPDATE organizations SET website_url = 'https://mace-mississippi.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '22aa5057-d491-4ab6-81ef-bffb9d105734' AND (website_url IS NULL OR website_url = '');

-- USA Archery: website. Evidence: https://www.usarchery.org/participate/adaptive-archery
UPDATE organizations SET website_url = 'https://www.usarchery.org/participate/adaptive-archery', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c2916c66-445c-41b0-b362-86d2ac9a1bb4' AND website_url = 'http://www.AmericanDisabledArchers.com';

-- HOPE Inc, Adaptive Sports and Recreation: website + town + state. Evidence: https://www.hopeinc.org/
UPDATE organizations SET website_url = 'https://www.hopeinc.org/', last_ok_at = NULL, city = 'Fargo', state = 'ND', state_name = 'North Dakota', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b37bc190-1191-4076-a8ff-726deac60dfe' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Central Cross Country Ski (CXC): website. Evidence: https://cxcskiing.org/pages/adaptive/about
UPDATE organizations SET website_url = 'https://cxcskiing.org/pages/adaptive/about', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f8cc4dd2-7169-4892-919b-05714d029e45' AND (website_url IS NULL OR website_url = '');

-- Hospital for Special Care (HSC) Community Service: website + town. Evidence: https://hfsc.org/sports-and-fitness/adaptive-sports-program/
UPDATE organizations SET website_url = 'https://hfsc.org/sports-and-fitness/adaptive-sports-program/', last_ok_at = NULL, city = 'New Britain', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5c4fce91-eb73-47ea-9c15-87299e6729b4' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Special Olympics Kentucky: website. Evidence: https://soky.org/generalinfo/
UPDATE organizations SET website_url = 'https://soky.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd8ad592d-61bb-4e5d-a09e-9cb9dd49c707' AND (website_url IS NULL OR website_url = '');

-- Denver Rolling Nuggets Wheelchair Basketball: website + town. Evidence: https://coloradowheelchairbasketball.org/
UPDATE organizations SET website_url = 'https://coloradowheelchairbasketball.org/', last_ok_at = NULL, city = 'Denver', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7d040e84-8c6a-4b7d-845e-44b2228e889e' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- U.S. Soccer: website. Evidence: https://www.ussoccer.com/teams/power-soccer-national-team
UPDATE organizations SET website_url = 'https://www.ussoccer.com/teams/power-soccer-national-team', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ed6731c6-9079-4d8c-b042-a8b9d9ee61e4' AND (website_url IS NULL OR website_url = '');

-- GS Road Warriors: website + state. Evidence: https://www.goldenstateroadwarriors.com/about
UPDATE organizations SET website_url = 'https://www.goldenstateroadwarriors.com/', last_ok_at = NULL, state = 'CA', state_name = 'California', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '587a5c6d-33a1-48c7-afa3-490331220eb1' AND (website_url IS NULL OR website_url = '') AND (state IS NULL OR state = '');

-- Center of Recreational Excellence CORE: website + town + state. Evidence: https://www.corehobbs.com/
UPDATE organizations SET website_url = 'https://corehobbs.com/sports.html', last_ok_at = NULL, city = 'Hobbs', state = 'NM', state_name = 'New Mexico', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '32bbf405-1eaa-4ce4-a9b7-d8662584eae5' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Arlington-Fairfax IWLA: website + town. Evidence: https://wp.arlingtonfairfax-iwla.org/location/
UPDATE organizations SET website_url = 'https://wp.arlingtonfairfax-iwla.org/', last_ok_at = NULL, city = 'Centreville', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fec733dd-eae9-4c00-93a2-133069fccbf0' AND website_url = 'http://arlingtonfairfax-iwla.org/' AND (city IS NULL OR city = '');

-- DASA CarShield Sled Hockey: website + town + state. Evidence: https://dasasports.org/sports-and-fitness/program-descriptions/
UPDATE organizations SET website_url = 'https://dasasports.org/sports-and-fitness/competitive-teams/sled-hockey/', last_ok_at = NULL, city = 'St. Louis', state = 'MO', state_name = 'Missouri', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '611f889f-d72e-40fa-b8e6-c7b1bf2bc9e5' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Team River Runner – Kent State: website. Evidence: https://www.teamriverrunner.org/get-involved/chapters/northeast-central-ohio/
UPDATE organizations SET website_url = 'https://www.teamriverrunner.org/get-involved/chapters/northeast-central-ohio/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '35bafa91-a120-45a8-a7fc-acd920e451af' AND website_url = 'http://www.teamriverrunner.org/?q=node/1390';

-- Special Olympics Minnesota: website. Evidence: https://specialolympicsminnesota.org/about/areas-delegations-teams/
UPDATE organizations SET website_url = 'https://specialolympicsminnesota.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b601d46f-5f19-46f8-b332-a93f78a8d105' AND (website_url IS NULL OR website_url = '');

-- Wheelchair Fencing USA: website. Evidence: https://www.usafencing.org/parafencing
UPDATE organizations SET website_url = 'https://www.usafencing.org/parafencing', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '79ff9482-a4b6-42a2-bf84-3de67f193ee1' AND (website_url IS NULL OR website_url = '');

-- Townlake YMCA: website + town. Evidence: https://www.austinymca.org/locations-townlake/
UPDATE organizations SET website_url = 'https://www.austinymca.org/locations-townlake/', last_ok_at = NULL, city = 'Austin', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f60e9dc0-5c1b-4667-a06d-6275f64af437' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Veterans on the 48: website. Evidence: https://www.veteransonthe48.org/home
UPDATE organizations SET website_url = 'https://www.veteransonthe48.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a2bbebae-e2e4-5ad1-84e3-41d016f26021' AND website_url = 'https://www.veteransonthe48.org/home';

-- DRIVEN NeuroRecovery Center: website + town + state. Evidence: https://drivenneuro.org/about-us/
UPDATE organizations SET website_url = 'https://drivenneuro.org/', last_ok_at = NULL, city = 'Las Vegas', state = 'NV', state_name = 'Nevada', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd4ea78c9-520c-4fc3-ab72-b9aecdcc1d82' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Buffalo Sabres Sled Hockey Team: website + town. Evidence: https://www.buffalosabressledhockey.org/page/show/8350703-history
UPDATE organizations SET website_url = 'https://www.buffalosabressledhockey.org/', last_ok_at = NULL, city = 'Buffalo', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8aeb598b-3557-43c7-af3f-b349692336b7' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- PUCHOG, Inc.: website + town. Evidence: https://www.puchog.org/contact-us/
UPDATE organizations SET website_url = 'https://www.puchog.org/', last_ok_at = NULL, city = 'Mechanicsburg', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0b9d96fb-aaca-42f2-9150-05e9afc516d3' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Morgan’s Wonderland Sports – STRAPS: website + town + state. Evidence: https://ymcasatx.org/hartman/morgans-sports-complex/STRAPS
UPDATE organizations SET website_url = 'https://ymcasatx.org/hartman/morgans-sports-complex/STRAPS', last_ok_at = NULL, city = 'San Antonio', state = 'TX', state_name = 'Texas', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8448fe46-3565-41d7-8b59-4928cfb4bd60' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Great Lakes Regional Games: website + town. Evidence: https://glasa.org/
UPDATE organizations SET website_url = 'https://glasa.org/', last_ok_at = NULL, city = 'Lake Forest', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f2388c1c-5809-474e-b28c-6cd25ded73ad' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Move United Sitting Volleyball: website. Evidence: https://moveunitedsport.org/sport/volleyball-sit-volleyball/
UPDATE organizations SET website_url = 'https://moveunitedsport.org/sport/volleyball-sit-volleyball/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4c924880-9b7d-49cc-b84e-ef482f18488c' AND (website_url IS NULL OR website_url = '');

-- Greater Buffalo Adaptive Sports | GBAS: website + town + state. Evidence: https://greaterbuffaloadaptivesports.org/
UPDATE organizations SET website_url = 'https://greaterbuffaloadaptivesports.org/', last_ok_at = NULL, city = 'Buffalo', state = 'NY', state_name = 'New York', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3a2bb307-d415-4b65-9f55-a9a5183845fe' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Michigan Disability Sports Alliance: website + state. Evidence: https://michiganvictorygames.org/
UPDATE organizations SET website_url = 'https://michiganvictorygames.org/', last_ok_at = NULL, state = 'MI', state_name = 'Michigan', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '22c2bd3b-9229-427d-9c92-c1d289065093' AND (website_url IS NULL OR website_url = '') AND (state IS NULL OR state = '');

-- Bennett Institute Physically Challenged Sports of Kennedy Krieger: website + town + state. Evidence: https://www.kennedykrieger.org/community/initiatives/physically-challenged-sports
UPDATE organizations SET website_url = 'https://www.kennedykrieger.org/community/initiatives/physically-challenged-sports', last_ok_at = NULL, city = 'Baltimore', state = 'MD', state_name = 'Maryland', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6783a3b2-2311-4a78-8de7-9233049a15e1' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Bennett Institute Physically Challenged Sports Prog. of Kennedy Krieger: website + town. Evidence: https://www.kennedykrieger.org/community/initiatives/physically-challenged-sports
UPDATE organizations SET website_url = 'https://www.kennedykrieger.org/community/initiatives/physically-challenged-sports', last_ok_at = NULL, city = 'Baltimore', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2f674a24-6bde-4652-ba8f-f149892586d9' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Pit Steelwheelers: website + town + state. Evidence: https://www.steelwheelers.com/
UPDATE organizations SET website_url = 'https://www.steelwheelers.com/', last_ok_at = NULL, city = 'Pittsburgh', state = 'PA', state_name = 'Pennsylvania', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3e23f748-1169-47e5-be27-057fa620c378' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Special Olympics Kansas: website. Evidence: https://soks.org/about-us/organizational-structure/
UPDATE organizations SET website_url = 'https://soks.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '48904446-a035-41ae-8f35-cc8ab8fd7aff' AND (website_url IS NULL OR website_url = '');

-- Wausau Curling Club: website + town. Evidence: https://wausaucurling.org/
UPDATE organizations SET website_url = 'https://wausaucurling.org/', last_ok_at = NULL, city = 'Wausau', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3d080cd8-bfaa-4751-8a6c-fa2ace22f6b9' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Orlando Magic Wheels: website + town. Evidence: https://www.orlandomagicwheels.org/
UPDATE organizations SET website_url = 'https://www.orlandomagicwheels.org/', last_ok_at = NULL, city = 'Orlando', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '823091b0-a3b6-4b71-b6c4-9a375c3f4103' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- University of Michigan Adaptive Sports & Fitness: website + town. Evidence: https://www.umadaptivesports.com/
UPDATE organizations SET website_url = 'https://www.umadaptivesports.com/', last_ok_at = NULL, city = 'Ann Arbor', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8b6dc9e0-9ffb-4402-8fe1-2813823ee93f' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Para-Cliffhangers Inc.: website. Evidence: https://www.paracliffhangers.org/
UPDATE organizations SET website_url = 'https://www.paracliffhangers.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2a7881b3-a236-4f87-84a7-18f94f6e39f1' AND (website_url IS NULL OR website_url = '');

-- USA Boccia: website. Evidence: https://usaboccia.org/
UPDATE organizations SET website_url = 'https://usaboccia.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3bb339c9-21a3-4123-b056-c5add0289a7d' AND (website_url IS NULL OR website_url = '');

-- City of Reno: website + town + state. Evidence: https://www.reno.gov/parks-and-recreation/adaptive-recreation/index.php
UPDATE organizations SET website_url = 'https://www.reno.gov/parks-and-recreation/adaptive-recreation/index.php', last_ok_at = NULL, city = 'Reno', state = 'NV', state_name = 'Nevada', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '475b572d-b323-4dda-b84b-3858aea37f13' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- VeloVets: website + town. Evidence: https://velovetssierravistaaz.org/
UPDATE organizations SET website_url = 'https://velovetssierravistaaz.org/', last_ok_at = NULL, city = 'Sierra Vista', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '47b94273-3a3c-4aed-9251-4a8f28049ffb' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Special Olympics Nevada: website. Evidence: https://sonv.org/
UPDATE organizations SET website_url = 'https://sonv.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fa44111c-e2dc-429f-809c-a99684c191d7' AND (website_url IS NULL OR website_url = '');

-- Kelly Brush Foundation: website + town + state. Evidence: https://kbf.org/contact-us/
UPDATE organizations SET website_url = 'https://kbf.org/', last_ok_at = NULL, city = 'Burlington', state = 'VT', state_name = 'Vermont', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fc127390-519f-454a-b705-4460fe6e9e63' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Reno Ice Sled: website + town + state. Evidence: https://www.renoice.com/sled-hockey
UPDATE organizations SET website_url = 'https://www.renoice.com/sled-hockey', last_ok_at = NULL, city = 'Reno', state = 'NV', state_name = 'Nevada', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7011155a-4144-44ab-b376-962bca502fda' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Special Olympics Arizona: website. Evidence: https://specialolympicsarizona.org/
UPDATE organizations SET website_url = 'https://specialolympicsarizona.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd8b9a8dd-ac92-4a45-abb6-8636c77e6aa5' AND (website_url IS NULL OR website_url = '');

-- Sharp Rehabilitation Center Recreation Therapy Department: website + town. Evidence: https://www.sharp.com/services/physical-rehabilitation
UPDATE organizations SET website_url = 'https://www.sharp.com/services/physical-rehabilitation', last_ok_at = NULL, city = 'San Diego', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '489c09ab-d5e5-486f-8387-7dda320daf0e' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- USA Stars of Salt Lake City: website + town. Evidence: http://saltlakecityjudo.org/
UPDATE organizations SET website_url = 'http://saltlakecityjudo.org/', last_ok_at = NULL, city = 'South Salt Lake', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0812a669-b561-4309-a2b6-b2245a7a6f81' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- San Diego Silverbacks: website + town + state. Evidence: https://www.rolltosuccess.org/silverbacks
UPDATE organizations SET website_url = 'https://www.rolltosuccess.org/silverbacks', last_ok_at = NULL, city = 'San Diego', state = 'CA', state_name = 'California', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ffd991aa-ece9-42ff-9aec-78123ee2043c' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- University of Wisconsin-Whitewater: website + town + state. Evidence: https://www.uww.edu/wheelchair-athletics
UPDATE organizations SET website_url = 'https://www.uww.edu/wheelchair-athletics', last_ok_at = NULL, city = 'Whitewater', state = 'WI', state_name = 'Wisconsin', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e2e9efc0-4bf1-42fc-875c-f9daa7f7a812' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- IM ABLE Foundation: website + town + state. Evidence: https://imablefoundation.org/group-classes/
UPDATE organizations SET website_url = 'https://imablefoundation.org/', last_ok_at = NULL, city = 'Reading', state = 'PA', state_name = 'Pennsylvania', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5e4cacff-6f0d-453e-a5fc-3fee7351700f' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Minnesota Sled Hockey Association: website. Evidence: https://www.mnsledhockey.org/player-registration
UPDATE organizations SET website_url = 'https://www.mnsledhockey.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ca6eae9c-3d70-42be-93a5-c465ba74ce6b' AND (website_url IS NULL OR website_url = '');

-- BISFed USA Boccia: website. Evidence: https://usaboccia.org/bisfed/
UPDATE organizations SET website_url = 'https://usaboccia.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ae73ee35-8784-4d31-bc67-45f73bdc5682' AND (website_url IS NULL OR website_url = '');

-- Milwaukee Curling Club: website + town. Evidence: https://milwaukeecurlingclub.com/
UPDATE organizations SET website_url = 'https://milwaukeecurlingclub.com/', last_ok_at = NULL, city = 'Cedarburg', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7f7c2343-9e9a-4a37-b0ab-1a31cc6c7908' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Ohio Sled Hockey: website. Evidence: https://ohiosledhockey.org/ohio-teams/
UPDATE organizations SET website_url = 'https://ohiosledhockey.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '1bf59b83-5d0c-4826-9e46-07fb2fea038f' AND (website_url IS NULL OR website_url = '');

-- Louisville Lightning Green: website + town + state. Evidence: https://sites.google.com/jefferson.kyschools.us/athletic-directors/adapted-sports-program
UPDATE organizations SET website_url = 'https://sites.google.com/jefferson.kyschools.us/athletic-directors/adapted-sports-program', last_ok_at = NULL, city = 'Louisville', state = 'KY', state_name = 'Kentucky', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'cc44dfa2-8067-463f-88fc-b44fe66e837a' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Association of Blind Athletes of New Jersey: website. Evidence: https://njblindsports.org/
UPDATE organizations SET website_url = 'https://njblindsports.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5571a520-91a0-4f3f-9725-95853a04cfe5' AND (website_url IS NULL OR website_url = '');

-- Los Angeles Kings Sled Hockey: website + town. Evidence: https://www.lakingssledhockey.com/
UPDATE organizations SET website_url = 'https://www.lakingssledhockey.com/', last_ok_at = NULL, city = 'Riverside', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '1c69cfd2-ede0-4750-85a3-886724b5a951' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- AdaptX: website + town + state. Evidence: https://www.adaptx.org/
UPDATE organizations SET website_url = 'https://www.adaptx.org/', last_ok_at = NULL, city = 'Lancaster', state = 'MA', state_name = 'Massachusetts', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '19e627cb-1ac6-4997-9486-f2bb4d981eb7' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- LWSRA Hawks: website + town + state. Evidence: https://lwsra.org/
UPDATE organizations SET website_url = 'https://lwsra.org/', last_ok_at = NULL, city = 'New Lenox', state = 'IL', state_name = 'Illinois', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '42b45ebd-dd90-4366-979f-948fe4fc3391' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Special Olympics New Mexico: website + town. Evidence: https://sonm.org/
UPDATE organizations SET website_url = 'https://sonm.org/', last_ok_at = NULL, city = 'Albuquerque', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2c1c7c28-196d-4bda-9235-44a702efd403' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Special Olympics Mississippi: website + town. Evidence: https://specialolympicsms.org/
UPDATE organizations SET website_url = 'https://specialolympicsms.org/', last_ok_at = NULL, city = 'Jackson', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '129c87c6-b9d6-471a-806c-6736b651c935' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- University of Missouri Wheelchair Basketball: website + town. Evidence: https://mizzourec.missouri.edu/mizzou-wheelchair-basketball/
UPDATE organizations SET website_url = 'https://mizzourec.missouri.edu/mizzou-wheelchair-basketball/', last_ok_at = NULL, city = 'Columbia', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a9cf5e49-57c3-4e4b-ad68-b73e82e28613' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Bellacatio: town. Evidence: https://www.bellacatio.org/vetcafe
UPDATE programs SET city = 'Chambersburg', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '83574b07-6879-5c9e-8c37-b6469d0cfeaf' AND (city IS NULL OR city = '');

-- Adaptive CrossFit: website + town. Evidence: https://movement-rx.com/san-diego-adaptive-training/
UPDATE organizations SET website_url = 'https://movement-rx.com/san-diego-adaptive-training/', last_ok_at = NULL, city = 'San Diego', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2af7b089-245e-45fb-9d5b-d389f5f8c6e3' AND website_url = 'https://movement-rx.com/' AND (city IS NULL OR city = '');

-- New England Nordic Ski Association, Maine: website. Evidence: https://nensa.net/para-nordic-skiing/
UPDATE programs SET website_url = 'https://nensa.net/para-nordic-skiing/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7badae23-251c-4453-b588-5344a517da56' AND website_url = 'https://www.nensa.net/';

-- S.M.C.L. Foundation & Associates Inc. Adaptive & Disability Sports Organization: website + town + state. Evidence: https://smclf.org/
UPDATE organizations SET website_url = 'https://smclf.org/', last_ok_at = NULL, city = 'New Orleans', state = 'LA', state_name = 'Louisiana', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e8d0ec26-effd-48a2-9a16-663220725322' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Brooks Rehabilitation Adaptive Sports and Recreation – Jacksonville: town. Evidence: https://brooksrehab.org/news/brooks-adaptive-sports-and-recreation-awarded-public-service-grant/
UPDATE organizations SET city = 'Jacksonville', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '98298c40-ec50-4988-84ac-a6dc6517c684' AND (city IS NULL OR city = '');

-- Easton Salt Lake Archery Center: website + town + state. Evidence: https://www.eastonsaltlakearcherycenter.org/
UPDATE organizations SET website_url = 'https://www.eastonsaltlakearcherycenter.org/', last_ok_at = NULL, city = 'Salt Lake City', state = 'UT', state_name = 'Utah', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f4f1c665-2783-43c0-be07-cf3efb8b23dd' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Disabled Sports USA Sitting Volleyball: website. Evidence: https://moveunitedsport.org/
UPDATE organizations SET website_url = 'https://moveunitedsport.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3c39822f-b87a-4661-8622-0c2414b894fc' AND (website_url IS NULL OR website_url = '');

-- Special Olympics Oklahoma: website + town. Evidence: https://www.sook.org/
UPDATE organizations SET website_url = 'https://www.sook.org/', last_ok_at = NULL, city = 'Tulsa', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'db179856-05b8-4f55-90f4-ee880045d4cb' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- USA Goalball: website. Evidence: https://www.usaba.org/usa-goalball
UPDATE organizations SET website_url = 'https://www.usaba.org/usa-goalball', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f86c19e1-bbb8-4d1f-8dde-c61718a952bf' AND (website_url IS NULL OR website_url = '');

-- Arizona Disabled Sports | AZDS: website + town + state. Evidence: https://www.arizonadisabledsports.com/who
UPDATE organizations SET website_url = 'https://www.arizonadisabledsports.com/', last_ok_at = NULL, city = 'Mesa', state = 'AZ', state_name = 'Arizona', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '160ad7a7-fbc5-40d0-b4ef-acebd41fae80' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Team River Runner Richmond: website + town. Evidence: https://www.teamriverrunner.org/richmond/
UPDATE organizations SET website_url = 'https://www.teamriverrunner.org/richmond/', last_ok_at = NULL, city = 'Richmond', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '61d2c68b-7443-4a00-a497-30aec26a951a' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Team River Runner Menlo Pak & Palo Alto: website + town. Evidence: https://www.teamriverrunner.org/get-involved/chapters/california-palo-alto/
UPDATE organizations SET website_url = 'https://www.teamriverrunner.org/get-involved/chapters/california-palo-alto/', last_ok_at = NULL, city = 'Palo Alto', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3c58f0e8-dd5d-467f-ae03-fd829c433e99' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Katie’s Komets: website + town. Evidence: https://www.katieskomets.org/
UPDATE organizations SET website_url = 'https://www.katieskomets.org/', last_ok_at = NULL, city = 'Philadelphia', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0a217daa-5f65-4f70-84f2-f2a4b9af2b06' AND website_url = 'http://www.katieskomets.org/' AND (city IS NULL OR city = '');

-- Central California Adaptive Sports Center: website + town. Evidence: https://www.centralcaladaptive.org/contact
UPDATE organizations SET website_url = 'https://www.centralcaladaptive.org/', last_ok_at = NULL, city = 'Shaver Lake', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a3974ea8-0557-473d-81d4-f931dd73c5d0' AND website_url = 'http://www.centralcaladaptive.org' AND (city IS NULL OR city = '');

-- ASL Fred Lamback Disability Meet: website + town. Evidence: https://www.usparaswimming.org/fred-lamback-para-open-2026
UPDATE organizations SET website_url = 'https://www.usparaswimming.org/fred-lamback-para-open-2026', last_ok_at = NULL, city = 'Augusta', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4d9501d5-045a-4da4-bf8a-e549991df03b' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Paralyzed Veterans of America Wisconsin Chapter | PVA: website + town + state. Evidence: https://wisconsinpva.org/contact-us
UPDATE organizations SET website_url = 'https://wisconsinpva.org/', last_ok_at = NULL, city = 'Milwaukee', state = 'WI', state_name = 'Wisconsin', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '10b9a884-25ad-4f28-b7d1-b162c4bb563b' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Challenged Athletes Foundation Track & Field: website. Evidence: https://www.challengedathletes.org/programs/
UPDATE organizations SET website_url = 'https://www.challengedathletes.org/programs/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b20f1381-d963-492d-9d25-fb3b653d8900' AND (website_url IS NULL OR website_url = '');

-- Nebraska Adaptive Sports: website + state. Evidence: https://nebraskaadaptivesports.org/about-us/
UPDATE organizations SET website_url = 'https://nebraskaadaptivesports.org/', last_ok_at = NULL, state = 'NE', state_name = 'Nebraska', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e5fbeb2e-0a31-40ce-b467-d6ee9c85cfb4' AND (website_url IS NULL OR website_url = '') AND (state IS NULL OR state = '');

-- BlazeSports Jr Hawks-RED: website + town + state. Evidence: https://blazesports.org/youth/wheelchairbasketball/
UPDATE organizations SET website_url = 'https://blazesports.org/youth/wheelchairbasketball/', last_ok_at = NULL, city = 'Atlanta', state = 'GA', state_name = 'Georgia', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '22f7dc6e-880b-4254-86a7-b070460bc604' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Team River Runner – Johnson City / Tri-Cities: town. Evidence: https://www.teamriverrunner.org/get-involved/chapters/tennessee-johnson-citytricities-northern-tn/
UPDATE organizations SET city = 'Johnson City', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '69d2dc48-7b22-486b-9f9d-5519e4996511' AND (city IS NULL OR city = '');

-- Adaptive Outdoor Education Center | AOEC: website + town + state. Evidence: https://www.adaptiveoutdooreducationcenter.org/locations
UPDATE organizations SET website_url = 'https://www.adaptiveoutdooreducationcenter.org/', last_ok_at = NULL, city = 'Carrabassett Valley', state = 'ME', state_name = 'Maine', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3348fd8b-db14-4faa-8a5e-d9e38a404786' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Music City Thunder: website + town + state. Evidence: https://www.ableyouth.org/
UPDATE organizations SET website_url = 'https://www.ableyouth.org/music-city-thunder-wheelchair-basketball/', last_ok_at = NULL, city = 'Nashville', state = 'TN', state_name = 'Tennessee', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ab6edd4e-e0eb-4627-bfd5-2879d70d151b' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Lone Star Paralysis Foundation | LSPF: website + town + state. Evidence: https://www.lonestarparalysis.org/who-we-are
UPDATE organizations SET website_url = 'https://www.lonestarparalysis.org/', last_ok_at = NULL, city = 'Austin', state = 'TX', state_name = 'Texas', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e5d3c8fa-20bb-4ad8-83eb-59a417535362' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Sportsability Alliance: website + town. Evidence: https://www.sportsability.org/
UPDATE organizations SET website_url = 'https://www.sportsability.org/', last_ok_at = NULL, city = 'Tallahassee', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6b23ba61-245a-4327-bd9c-74e4de721dc0' AND website_url = 'http://www.fdoa.org' AND (city IS NULL OR city = '');

-- City of Chattanooga, Parks & Recreation – Therapeutic Recreation: website + town. Evidence: https://chattanooga.gov/things-to-do/athletic-therapeutic/therapeutic-recreation
UPDATE organizations SET website_url = 'https://chattanooga.gov/things-to-do/athletic-therapeutic/therapeutic-recreation', last_ok_at = NULL, city = 'Chattanooga', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd84918a6-4305-472a-9c79-22e91e7cb954' AND website_url = 'https://chattanooga.gov/parks/recreation/therapeutic-recreation' AND (city IS NULL OR city = '');

-- US Adaptive Sailing: website. Evidence: https://www.ussailing.org/education/adult/adaptive-sailing/
UPDATE organizations SET website_url = 'https://www.ussailing.org/education/adult/adaptive-sailing/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'dc25d619-31db-4b10-aa1b-d0c1cf7b286f' AND website_url = 'https://www.ussailing.org/education/adult/adaptive-sailing/#:~:text=Adaptive%20sailing%20refers%20to%20programs,sailing%20for%20persons%20with%20disabilities.';

-- Bowling Green Parks and Recreation: website + town. Evidence: https://bgky.org/bgpr/adaptive-recreation
UPDATE organizations SET website_url = 'https://bgky.org/bgpr/adaptive-recreation', last_ok_at = NULL, city = 'Bowling Green', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a0d85c62-f013-4ac8-b997-f30937f8fd86' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Oklahoma Adaptive Sports Association (OKASA): website. Evidence: https://okasa.org/
UPDATE organizations SET website_url = 'https://okasa.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ef87e95f-eaf7-471b-94fd-0c210da089c3' AND website_url = 'http://okasa.org/';

-- COSTA Therapy, Inc.: website. Evidence: https://www.costasurf.org/
UPDATE organizations SET website_url = 'https://www.costasurf.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd31962be-9af2-4c25-ab5c-157224590ce4' AND website_url = 'https://costasurf.org/';

-- Sea Scout Base Galveston DBA Galveston Community Sailing: website + town. Evidence: https://ssbgalveston.org/about/
UPDATE organizations SET website_url = 'https://ssbgalveston.org/', last_ok_at = NULL, city = 'Galveston', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e29f5cbe-4a00-4278-9090-bc3ba513ff3a' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Adaptive Sports Center Crested Butte: website + town + state. Evidence: https://www.adaptivesports.org/
UPDATE organizations SET website_url = 'https://www.adaptivesports.org/', last_ok_at = NULL, city = 'Crested Butte', state = 'CO', state_name = 'Colorado', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'af9c9ef9-9903-4a7e-9d3d-a837a37ad4ea' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Orlando Magic Dreamers - Varsity: website + town + state. Evidence: https://www.cfldreamplex.com/orlando-magic-dreamers/
UPDATE organizations SET website_url = 'https://www.cfldreamplex.com/orlando-magic-dreamers/', last_ok_at = NULL, city = 'Orlando', state = 'FL', state_name = 'Florida', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8363118d-3f47-4051-8c70-bf3cf9c5547f' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Athletes with Disabilities Network North East Chapter: website + town. Evidence: https://adnnec.org/contact-us.html
UPDATE organizations SET website_url = 'https://adnnec.org/', last_ok_at = NULL, city = 'Moorestown', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '52bead76-a422-4866-a021-9e6ab8b5cdf2' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Team River Runner Fort Carson/Colorado Springs: website + town. Evidence: https://www.teamriverrunner.org/get-involved/chapters/colorado-ft-carsoncolorado-springs/
UPDATE organizations SET website_url = 'https://www.teamriverrunner.org/get-involved/chapters/colorado-ft-carsoncolorado-springs/', last_ok_at = NULL, city = 'Colorado Springs', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c4c66fdc-3b63-4c4a-967b-535473a416a9' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Dallas Jr. Mavs Blue- Prep: website + town + state. Evidence: https://www.dallasjuniorwheelchairmavericks.org/about-3
UPDATE organizations SET website_url = 'https://www.dallasjuniorwheelchairmavericks.org/', last_ok_at = NULL, city = 'Irving', state = 'TX', state_name = 'Texas', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9290f992-edcd-410f-914a-d707c25f12c9' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- USA Lacrosse: website. Evidence: https://www.usalacrosse.com/
UPDATE organizations SET website_url = 'https://www.usalacrosse.com/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6f167934-136b-4ebe-b884-5a51e7326d1c' AND (website_url IS NULL OR website_url = '');

-- BlazeSports Jr. Hawks: website + town + state. Evidence: https://blazesports.org/youth/wheelchairbasketball/
UPDATE organizations SET website_url = 'https://blazesports.org/youth/wheelchairbasketball/', last_ok_at = NULL, city = 'Atlanta', state = 'GA', state_name = 'Georgia', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd009254d-c850-4fa9-ace3-028f7a35f2d4' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Chicago Skyhawks: website + town + state. Evidence: https://www.sralab.org/wheelchair-basketball
UPDATE organizations SET website_url = 'https://www.sralab.org/wheelchair-basketball', last_ok_at = NULL, city = 'Chicago', state = 'IL', state_name = 'Illinois', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8d29a813-81ef-4a05-bd0d-00107b409ef5' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Dallas Jr. Mavs - Varsity: website + town + state. Evidence: https://www.dallasjuniorwheelchairmavericks.org/about-3
UPDATE organizations SET website_url = 'https://www.dallasjuniorwheelchairmavericks.org/', last_ok_at = NULL, city = 'Dallas', state = 'TX', state_name = 'Texas', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '65d9e479-f03e-4feb-b3be-162734dd42a4' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Bogus Basin Nordic Club: website + town. Evidence: https://www.bbnt.ski/
UPDATE organizations SET website_url = 'https://www.bbnt.ski/adaptive', last_ok_at = NULL, city = 'Boise', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b7c14d23-0cc8-45be-a569-6b701d0c768f' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Special Olympics Utah: website. Evidence: https://sout.org/
UPDATE organizations SET website_url = 'https://sout.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5d630795-73b6-495b-9644-0a96384e1ab1' AND (website_url IS NULL OR website_url = '');

-- Central Florida Dreamplex, LLC: website + town + state. Evidence: https://www.cfldreamplex.com/adaptive-sports/
UPDATE organizations SET website_url = 'https://www.cfldreamplex.com/adaptive-sports/', last_ok_at = NULL, city = 'Clermont', state = 'FL', state_name = 'Florida', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '98fe15dc-6b85-41aa-864f-454250207b92' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- University of Utah – TRAILS Program: website + town. Evidence: https://healthcare.utah.edu/neilsen-physical-rehab-hospital/support-services/trails
UPDATE programs SET website_url = 'https://healthcare.utah.edu/neilsen-physical-rehab-hospital/support-services/trails', last_ok_at = NULL, city = 'Salt Lake City', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd9c19e5f-31cb-4412-ae38-407aab579b5d' AND website_url = 'https://healthcare.utah.edu/neilsen-physical-rehab-hospital/support-services/trails/#overview' AND (city IS NULL OR city = '');

-- MO Vets Outdoors: town. Evidence: https://movetsoutdoors.org/events/
UPDATE organizations SET city = 'Silex', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e006037c-fffb-5adb-a3c9-c46c00b7ffe2' AND (city IS NULL OR city = '');

-- Roger C Peace: website + town + state. Evidence: https://greenvillecan.org/gc-organization/rolling-tigers/
UPDATE organizations SET website_url = 'https://greenvillecan.org/gc-organization/rolling-tigers/', last_ok_at = NULL, city = 'Greenville', state = 'SC', state_name = 'South Carolina', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fcabc5cb-2d74-4083-80d7-8dde4e20c649' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Walton Foundation for Independence: website + town. Evidence: https://waltonoptions.org/foundation/
UPDATE organizations SET website_url = 'https://waltonoptions.org/foundation/', last_ok_at = NULL, city = 'Augusta', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '755af09e-e8bf-4b8f-a96b-335f8b37c1cf' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- BlazeSports Jr. Hawks White: website + town + state. Evidence: https://blazesports.org/youth/wheelchairbasketball/
UPDATE organizations SET website_url = 'https://blazesports.org/youth/wheelchairbasketball/', last_ok_at = NULL, city = 'Atlanta', state = 'GA', state_name = 'Georgia', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '53e708f6-99aa-4e9b-9263-572636d75daf' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- ParaSport Spokane – Inland Northwest: website + town. Evidence: https://www.parasportspokane.org/
UPDATE organizations SET website_url = 'https://www.parasportspokane.org/', last_ok_at = NULL, city = 'Spokane', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'bf678ed2-f906-486e-a266-04c4783a710d' AND website_url = 'http://www.parasportspokane.org' AND (city IS NULL OR city = '');

-- Boots to Beyond Inc.: town. Evidence: https://www.bootstobeyond.org/
UPDATE organizations SET city = 'Greenville', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'cb3daf4d-5245-5816-b719-ea946b4e2ba1' AND (city IS NULL OR city = '');

-- Ability360 Sports & Fitness Center: website + town + state. Evidence: https://ability360.org/youth-wheelchair-basketball/
UPDATE organizations SET website_url = 'https://ability360.org/sports-fitness/sports/', last_ok_at = NULL, city = 'Phoenix', state = 'AZ', state_name = 'Arizona', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '93b0f810-111f-459d-bee8-9645f6d5fb4a' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Higher Ground USA, Inc.: website + town + state. Evidence: https://highergroundusa.org/
UPDATE organizations SET website_url = 'https://highergroundusa.org/adaptive-sports/', last_ok_at = NULL, city = 'Ketchum', state = 'ID', state_name = 'Idaho', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0237d28f-a2e1-40a3-9cd3-22b9284aa168' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Kansas City Kings: website + town + state. Evidence: https://www.midwestadaptivesports.org/youth-wheelchair-basketball
UPDATE organizations SET website_url = 'https://www.midwestadaptivesports.org/youth-wheelchair-basketball', last_ok_at = NULL, city = 'Kansas City', state = 'MO', state_name = 'Missouri', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5e746690-d6bf-480c-aa89-8df70b4a5926' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Independence Place: website + town. Evidence: https://independenceplaceky.org/contact/
UPDATE organizations SET website_url = 'https://independenceplaceky.org/', last_ok_at = NULL, city = 'Lexington', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4d6d31c8-7d4d-457a-9c13-f68d74e8f58f' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Rollin' Celtics: website + town + state. Evidence: https://adaptivesportsne.org/adult-wheelchair-basketball/
UPDATE organizations SET website_url = 'https://adaptivesportsne.org/adult-wheelchair-basketball/', last_ok_at = NULL, city = 'Boston', state = 'MA', state_name = 'Massachusetts', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'cd63125e-d5a2-4365-80f2-7816e71c378c' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- New Mexico Veterans Art: town. Evidence: https://nmveteransart.com/about/
UPDATE organizations SET city = 'Albuquerque', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '24ef35dc-6951-5dd5-a0af-83a2f84cfc50' AND (city IS NULL OR city = '');

-- Hillsborough County Parks, Recreation and Conservation: website + town. Evidence: https://hcfl.gov/residents/parks-and-leisure/adaptive-sports
UPDATE organizations SET website_url = 'https://hcfl.gov/residents/parks-and-leisure/adaptive-sports', last_ok_at = NULL, city = 'Tampa', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0bce62a0-d795-4077-9530-46202099eb1c' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Special Olympics Iowa: website. Evidence: https://www.soiowa.org/
UPDATE organizations SET website_url = 'https://www.soiowa.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6573b390-b980-4b19-95d1-f0bfa237162a' AND (website_url IS NULL OR website_url = '');

-- USA Taekwondo Para: website. Evidence: https://www.usatkd.org/usatkd-paralympic-program
UPDATE organizations SET website_url = 'https://www.usatkd.org/usatkd-paralympic-program', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '94d0c266-7dc9-47d4-8530-bd9e83f38d6b' AND (website_url IS NULL OR website_url = '');

-- Navigators Adaptive Sports Club: website + town + state. Evidence: https://www.navigatorsadaptivesports.com/
UPDATE organizations SET website_url = 'https://www.navigatorsadaptivesports.com/', last_ok_at = NULL, city = 'Bayonne', state = 'NJ', state_name = 'New Jersey', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd9dc8497-49cc-4339-bc25-ae5cf37abcb9' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Adaptive Sports Association – Durango: website + town. Evidence: https://asadurango.com/
UPDATE organizations SET website_url = 'https://asadurango.com/', last_ok_at = NULL, city = 'Durango', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'db87d0ad-5c36-4084-a0ce-6a6b896c2fde' AND website_url = 'http://asadurango.com' AND (city IS NULL OR city = '');

-- Special Olympics Arkansas: website. Evidence: https://www.specialolympicsarkansas.org/
UPDATE organizations SET website_url = 'https://www.specialolympicsarkansas.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '30a5fcf5-46b7-415a-b415-54b01822100f' AND (website_url IS NULL OR website_url = '');

-- Special Olympics North Dakota: website. Evidence: https://specialolympicsnd.org/
UPDATE organizations SET website_url = 'https://specialolympicsnd.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '830466cd-f39f-4782-a4c6-84801aa8826c' AND (website_url IS NULL OR website_url = '');

-- Orlando Magic Dreamers - Junior: website + town + state. Evidence: https://www.cfldreamplex.com/orlando-magic-dreamers/
UPDATE organizations SET website_url = 'https://www.cfldreamplex.com/orlando-magic-dreamers/', last_ok_at = NULL, city = 'Orlando', state = 'FL', state_name = 'Florida', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'dc35ec57-aaad-4c48-96e9-f8330e0b1f55' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Tulsa Twisters: website + town + state. Evidence: https://www.tulsacenter.org/wheelchair-basketball-tournament/
UPDATE organizations SET website_url = 'https://www.tulsacenter.org/wheelchair-basketball-tournament/', last_ok_at = NULL, city = 'Tulsa', state = 'OK', state_name = 'Oklahoma', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3f9f7b96-5e4d-4356-9441-ad11ce5aefb6' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Adaptive Sports Association | ASA: website + town + state. Evidence: https://asadurango.com/
UPDATE organizations SET website_url = 'https://asadurango.com/', last_ok_at = NULL, city = 'Durango', state = 'CO', state_name = 'Colorado', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9ca2f81f-3fb1-416e-8b55-fe40b7f3ced9' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Team River Runner Newbury NH: website + town. Evidence: http://www.teamriverrunner.org/get-involved/chapters/new-hampshire-nehsa/
UPDATE organizations SET website_url = 'http://www.teamriverrunner.org/get-involved/chapters/new-hampshire-nehsa/', last_ok_at = NULL, city = 'Newbury', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3790234f-1345-48cf-b256-1db7d6f392b7' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Edinboro University Wheelchair Basketball: website + town. Evidence: https://gofightingscots.com/sports/jv-mens-basketball
UPDATE organizations SET website_url = 'https://gofightingscots.com/sports/jv-mens-basketball', last_ok_at = NULL, city = 'Edinboro', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c31d7844-212c-4a3e-bb55-1e2a6147374d' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Veterans Equine Therapeutic Services (VETS USA): town. Evidence: https://vetsct.org/our-farms-2/
UPDATE organizations SET city = 'Ledyard', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '60c71f8c-099f-5f38-968f-4cc456310401' AND (city IS NULL OR city = '');

-- Blind Athletes Inc: website. Evidence: https://www.blindathletes.org/about
UPDATE organizations SET website_url = 'https://www.blindathletes.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '02c39bac-94ed-4502-bece-5530e2527720' AND (website_url IS NULL OR website_url = '');

-- Adaptive Expeditions – Charleston: website + town. Evidence: https://adaptiveexpeditions.org/contact/
UPDATE organizations SET website_url = 'https://adaptiveexpeditions.org/', last_ok_at = NULL, city = 'Charleston', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '25766bc3-c3ce-4453-98ab-f41588fcdc5b' AND website_url = 'http://www.AdaptiveExpeditions.org' AND (city IS NULL OR city = '');

-- Dixie Wheelchair Athletic Association, Inc.: website. Evidence: https://dixiegames.com/organization-1
UPDATE organizations SET website_url = 'https://dixiegames.com/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6884bc61-6a96-457a-9e16-e4c160432dda' AND (website_url IS NULL OR website_url = '');

-- Special Olympics Alabama: website. Evidence: https://www.specialolympicsalabama.org/
UPDATE organizations SET website_url = 'https://www.specialolympicsalabama.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ce59a36a-cb81-4f1c-84ed-88c69c4174a5' AND (website_url IS NULL OR website_url = '');

-- Junior Tennis Champions Center | JTCC: website + town + state. Evidence: https://jtcc.org/
UPDATE organizations SET website_url = 'https://jtcc.org/', last_ok_at = NULL, city = 'College Park', state = 'MD', state_name = 'Maryland', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9cfbf585-86b9-48ed-a0fb-fc2ea83a0112' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Team River Runner Menlo Park & Palo Alto: town. Evidence: https://www.teamriverrunner.org/get-involved/chapters/california-palo-alto/
UPDATE organizations SET city = 'Palo Alto', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '905b79f2-c5e7-4424-84f9-f4acf0b28dbc' AND (city IS NULL OR city = '');

-- Southeast Alaska Independent Living: town. Evidence: https://www.sailinc.org/contact/
UPDATE organizations SET city = 'Juneau', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3c81a49e-c3c9-4235-8590-4d01c7973410' AND (city IS NULL OR city = '');

-- Fairfax Falcons Prep: website + town + state. Evidence: https://fairfaxfalcons.org/
UPDATE organizations SET website_url = 'https://fairfaxfalcons.org/', last_ok_at = NULL, city = 'Springfield', state = 'VA', state_name = 'Virginia', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5c494319-dec8-4eeb-9727-d3a4b2eb0c8f' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Menomonee Judo Club - Chicago: website + town. Evidence: https://www.menomoneeclub.org/judo/
UPDATE organizations SET website_url = 'https://www.menomoneeclub.org/judo/', last_ok_at = NULL, city = 'Chicago', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ec258877-5984-48c9-abc1-56ed5fdf075a' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Clemson Adaptive Sports: website + town + state. Evidence: https://www.clemson.edu/cbshs/departments/prtm/research/adaptive-sports-recreation/
UPDATE organizations SET website_url = 'https://www.clemson.edu/cbshs/departments/prtm/research/adaptive-sports-recreation/', last_ok_at = NULL, city = 'Clemson', state = 'SC', state_name = 'South Carolina', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd5698c14-6bc4-4c2e-be02-1e6bcd2458db' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Rim of the World Special Athletes Foundation: website + town + state. Evidence: https://rimspecialathletes.org/
UPDATE organizations SET website_url = 'https://rimspecialathletes.org/', last_ok_at = NULL, city = 'Lake Arrowhead', state = 'CA', state_name = 'California', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8a8f9a94-c44d-48a4-b722-79e20c1eb1b1' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Team River Runner Wilmington and the Greater Cape Fear Area: website + town. Evidence: https://www.teamriverrunner.org/north-carolina-wilmington/
UPDATE organizations SET website_url = 'https://www.teamriverrunner.org/north-carolina-wilmington/', last_ok_at = NULL, city = 'Wilmington', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a062a51d-f6f6-4467-b2b5-fe58284d1a25' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Voices of Valor: town. Evidence: https://www.voicesofvalor.org/contact-us/
UPDATE organizations SET city = 'Scotch Plains', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '205b04c0-592e-5ad0-ac4b-e4bbf8cd3e0b' AND (city IS NULL OR city = '');

-- Wutterie: town. Evidence: https://www.wutterie.com/
UPDATE programs SET city = 'Erie', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '1b75a265-9dc2-5a9e-9e53-beee35ef2d17' AND (city IS NULL OR city = '');

-- Bionic Project: website. Evidence: https://www.bionicproject.org/
UPDATE organizations SET website_url = 'https://www.bionicproject.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd6e0af97-435b-44ac-9c17-9957b2f9c89c' AND (website_url IS NULL OR website_url = '');

-- Special Olympics Ohio: website. Evidence: https://sooh.org/
UPDATE organizations SET website_url = 'https://sooh.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '79d97962-88b1-49bf-bf07-5df325b3ef96' AND (website_url IS NULL OR website_url = '');

-- Dairyland Sports: website + town + state. Evidence: https://www.dairylandsports.org/
UPDATE organizations SET website_url = 'https://www.dairylandsports.org/', last_ok_at = NULL, city = 'Madison', state = 'WI', state_name = 'Wisconsin', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f638750a-99a6-43dd-b5b3-db732d0814fd' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Waterville Valley Adaptive Sports: town. Evidence: https://www.watervilleadaptive.com/contact.html
UPDATE organizations SET city = 'Waterville Valley', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '14c5863e-e2a0-408f-9e67-b59f86ee967b' AND (city IS NULL OR city = '');

-- Adaptive Action Sports – Rockies: town. Evidence: https://www.adacs.org/
UPDATE organizations SET city = 'Copper Mountain', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd7811f33-8c89-4e83-b4a6-c965bb7eada5' AND (city IS NULL OR city = '');

-- Special Olympics Illinois: town. Evidence: https://www.soill.org/regions/
UPDATE organizations SET city = 'Normal', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '1ad63975-35c3-485b-869b-a3c4ae346a15' AND (city IS NULL OR city = '');

-- Ability Skateboarding & Action Sports: website + town + state. Evidence: https://abilityskateboarding.org/about-us/
UPDATE organizations SET website_url = 'https://abilityskateboarding.org/', last_ok_at = NULL, city = 'San Antonio', state = 'TX', state_name = 'Texas', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ae7d4727-b060-467b-a470-9d0cd22c7317' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- United Cerebral Palsy of Nassau County, Inc.: website + town. Evidence: https://www.cpnassau.org/about/
UPDATE organizations SET website_url = 'https://www.cpnassau.org/', last_ok_at = NULL, city = 'Roosevelt', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '039916b2-c8b4-4b64-987c-d0565b9899d0' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Not Forgotten Outreach: website + town. Evidence: https://www.notforgottenoutreach.org/
UPDATE organizations SET website_url = 'https://www.notforgottenoutreach.org/', last_ok_at = NULL, city = 'Taos', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c882ab96-5ecd-4fdb-af5d-f4a74258d2f0' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Unbroken Spirit: website + town + state. Evidence: https://unbrokenspirit.org/what-we-do/adaptive-sports-program/
UPDATE organizations SET website_url = 'https://unbrokenspirit.org/what-we-do/adaptive-sports-program/', last_ok_at = NULL, city = 'Park City', state = 'UT', state_name = 'Utah', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5f2226fa-adb0-441e-9631-52486b56d06b' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Valley Children’s Adaptive Sports: website + town + state. Evidence: https://www.valleychildrens.org/services/adaptive-sports-program
UPDATE organizations SET website_url = 'https://www.valleychildrens.org/services/adaptive-sports-program', last_ok_at = NULL, city = 'Madera', state = 'CA', state_name = 'California', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5adae54f-8f6c-40d1-bb77-0ff3e81f968f' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Prairie Grit Adaptive Sports: website + town. Evidence: https://www.prairiegritsports.com/contact
UPDATE organizations SET website_url = 'https://www.prairiegritsports.com/', last_ok_at = NULL, city = 'Minot', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'af186159-4278-4e23-bbe8-acb8689cb3d0' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- IVHA/Junior Reign Sled Hockey: town. Evidence: https://socalsledhockey.blogspot.com/
UPDATE organizations SET city = 'Riverside', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '692c9109-b282-41a7-b3a3-07d9a1155c4d' AND (city IS NULL OR city = '');

-- Team River Runner – Columbia: town. Evidence: https://www.teamriverrunner.org/get-involved/chapters/south-carolina-columbia/
UPDATE organizations SET city = 'Columbia', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f2ec8b0e-ed2e-4af3-8af1-ba599d88a08a' AND (city IS NULL OR city = '');

-- Lifeline Connections: town. Evidence: https://lifelineconnections.org/
UPDATE organizations SET city = 'Vancouver', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3c0e95da-4957-5519-8424-4cdbe4ad9cb3' AND (city IS NULL OR city = '');

-- Journey to the Center of Hope: town. Evidence: https://journeytothecenterofhope.com/
UPDATE organizations SET city = 'Kingman', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f6d0f389-5a9d-513e-a539-3616d4af1931' AND (city IS NULL OR city = '');

-- Special Olympics New Hampshire: website. Evidence: https://www.sonh.org/
UPDATE organizations SET website_url = 'https://www.sonh.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f7b0e93f-448d-45c8-9774-47ccb6edf5dd' AND (website_url IS NULL OR website_url = '');

-- Bay Area Meteorites: website + town + state. Evidence: https://www.borp.org/programs/adult-sports/adult-wheelchair-basketball/
UPDATE organizations SET website_url = 'https://www.borp.org/programs/adult-sports/adult-wheelchair-basketball/', last_ok_at = NULL, city = 'Berkeley', state = 'CA', state_name = 'California', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5735d712-b5f1-4030-8a3c-09af037a6190' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Samaritan Multi-Services Centered on Living (S.M.C.L.) Foundation & Associates, Inc.: website + town. Evidence: https://smclf.org/
UPDATE organizations SET website_url = 'https://smclf.org/', last_ok_at = NULL, city = 'New Orleans', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd08449ac-cb24-4770-9df7-bb2feadfc63e' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Oregon Adaptive Sports | OAS: website + town + state. Evidence: https://oregonadaptivesports.org/about/contact-oas/
UPDATE organizations SET website_url = 'https://oregonadaptivesports.org/', last_ok_at = NULL, city = 'Bend', state = 'OR', state_name = 'Oregon', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2f0b3632-0c11-40f6-ad8e-46bcb36cdd07' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Art of Valor Inc.: town. Evidence: https://www.artofvalor.org/
UPDATE organizations SET city = 'New York', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '30ad1341-6e9a-5707-979c-1083c02256ba' AND (city IS NULL OR city = '');

-- Motor City Wheelz - Prep: website + state. Evidence: https://www.motorcitywheelz.org/
UPDATE organizations SET website_url = 'https://www.motorcitywheelz.org/', last_ok_at = NULL, state = 'MI', state_name = 'Michigan', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3074dff0-7dd0-4649-97f8-52354c49d87b' AND (website_url IS NULL OR website_url = '') AND (state IS NULL OR state = '');

-- EDD Adaptive Sports: website + state. Evidence: https://www.eddfund.org/list-of-programs.html
UPDATE organizations SET website_url = 'https://www.eddfund.org/', last_ok_at = NULL, state = 'NY', state_name = 'New York', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ae349685-28fb-4fec-9dbc-16f53ad3ec73' AND (website_url IS NULL OR website_url = '') AND (state IS NULL OR state = '');

-- City of Reno Parks, Recreation & Community Services: website + town. Evidence: https://www.reno.gov/parks-and-recreation/adaptive-recreation/index.php
UPDATE organizations SET website_url = 'https://www.reno.gov/parks-and-recreation/adaptive-recreation/index.php', last_ok_at = NULL, city = 'Reno', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '1f93891b-103f-4e16-abe6-00eed5952b99' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Nautical Milers Special Needs Swim Team: website + town. Evidence: https://www.usms.org/clubs/nautical-milers-special-needs-swim-team-2104
UPDATE organizations SET website_url = 'https://www.usms.org/clubs/nautical-milers-special-needs-swim-team-2104', last_ok_at = NULL, city = 'Marietta', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f34e015a-2cc1-437e-8cc5-5528901ef2b3' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- RHI Jr. Racers: website + town + state. Evidence: https://www.rhirehab.com/our-programs/community-reintegration/adaptive-sports-program/teams/
UPDATE organizations SET website_url = 'https://www.rhirehab.com/our-programs/community-reintegration/adaptive-sports-program/teams/', last_ok_at = NULL, city = 'Indianapolis', state = 'IN', state_name = 'Indiana', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b9d07c0e-ab8c-4c49-91f5-37dd2ebdbdb8' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- San Antonio Parasport Spurs: website + town + state. Evidence: https://parasports.org/
UPDATE organizations SET website_url = 'https://parasports.org/wheelchair-basketball/', last_ok_at = NULL, city = 'San Antonio', state = 'TX', state_name = 'Texas', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '00f275a0-b1fd-4caf-8141-788478eee418' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Katie's KOMETS Varsity: website + town + state. Evidence: https://www.katieskomets.org/
UPDATE organizations SET website_url = 'https://www.katieskomets.org/', last_ok_at = NULL, city = 'Philadelphia', state = 'PA', state_name = 'Pennsylvania', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '86a429e3-9edb-4146-906b-0307382301ff' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Granite State Adaptive: town. Evidence: https://www.gsadaptivesports.org/contact
UPDATE organizations SET city = 'Wolfeboro', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6d5655cc-74af-4496-b836-f7b50af515fe' AND (city IS NULL OR city = '');

-- National Sports Center for the Disabled | NSCD: website + town + state. Evidence: https://nscd.org/
UPDATE organizations SET website_url = 'https://nscd.org/', last_ok_at = NULL, city = 'Winter Park', state = 'CO', state_name = 'Colorado', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f3488136-f4f5-46c9-936d-0c7a794621f0' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Quad City Sled Hockey Association: website. Evidence: https://www.quadcityhockey.com/page/show/4400011-sled-hockey
UPDATE organizations SET website_url = 'https://www.quadcityhockey.com/page/show/4400011-sled-hockey', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '77fa1db1-6b7d-45df-b3a7-ce4bdca8696d' AND (website_url IS NULL OR website_url = '');

-- Therapeutic Retreats: town. Evidence: https://www.warrior-revival.org/
UPDATE programs SET city = 'Sandy', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7b826da5-2d91-56df-a406-e24d486afb09' AND (city IS NULL OR city = '');

-- Adaptive Sports Northwest | ASNW: website + town + state. Evidence: https://adaptivesportsnw.org/contact/
UPDATE organizations SET website_url = 'https://adaptivesportsnw.org/', last_ok_at = NULL, city = 'Portland', state = 'OR', state_name = 'Oregon', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5802e432-7fb0-4614-8eae-0228cb9c7362' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- USRowing Adaptive: website. Evidence: https://usrowing.org/athletes/para-adaptive
UPDATE organizations SET website_url = 'https://usrowing.org/athletes/para-adaptive', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '892f6931-34bd-4b55-ac83-108fd1c639db' AND (website_url IS NULL OR website_url = '');

-- Ability Montana: website + town + state. Evidence: https://abilitymt.org/contact
UPDATE organizations SET website_url = 'https://abilitymt.org/programs/outdoor-recreation', last_ok_at = NULL, city = 'Bozeman', state = 'MT', state_name = 'Montana', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ab2b54a0-24b3-47db-9b6a-8fade4e6fb06' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- USA Paratriathlon: website. Evidence: https://www.usatriathlon.org/our-community/paratriathlon
UPDATE organizations SET website_url = 'https://www.usatriathlon.org/our-community/paratriathlon', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'db80d5b0-260a-4d0a-8953-c0bb33657ede' AND (website_url IS NULL OR website_url = '');

-- Triangle Thunder Wheelchair Basketball: website + town. Evidence: https://trianglethunder.org/
UPDATE organizations SET website_url = 'https://trianglethunder.org/', last_ok_at = NULL, city = 'Raleigh', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '425eedf4-aa2a-45bc-bc1b-d4af8c639011' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Spaulding Adaptive Sports Centers (Spaulding Rehabilitation Network): website + state. Evidence: https://sasc.spauldingrehab.org/About.aspx
UPDATE organizations SET website_url = 'https://sasc.spauldingrehab.org/', last_ok_at = NULL, state = 'MA', state_name = 'Massachusetts', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '97ea484c-ea50-4946-9466-011eac84c307' AND (website_url IS NULL OR website_url = '') AND (state IS NULL OR state = '');

-- Children’s Lightning Wheels: website + town + state. Evidence: https://moveunitedsport.org/organization/childrens-lightning-wheels/
UPDATE organizations SET website_url = 'https://csh.recdesk.com/Community/Page?pageId=15595', last_ok_at = NULL, city = 'Mountainside', state = 'NJ', state_name = 'New Jersey', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'aa41d2dc-74aa-40fc-adbf-68849a4fa5ee' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- CT Spokebenders: website + state. Evidence: https://c316los.wixsite.com/mysite
UPDATE organizations SET website_url = 'https://c316los.wixsite.com/mysite', last_ok_at = NULL, state = 'CT', state_name = 'Connecticut', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd3f94601-325e-454a-8b5c-ee6d94274903' AND (website_url IS NULL OR website_url = '') AND (state IS NULL OR state = '');

-- North Side Archery Club: website + town. Evidence: https://www.northsidearcheryclub.org/locations
UPDATE organizations SET website_url = 'https://www.northsidearcheryclub.org/', last_ok_at = NULL, city = 'Chicago', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9b6579c7-34ec-4b23-a2cf-12d5354c2e8a' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- LOF Adaptive Skiers: website + town + state. Evidence: https://www.lofadaptiveskiers.org/
UPDATE organizations SET website_url = 'https://www.lofadaptiveskiers.org/', last_ok_at = NULL, city = 'Southbury', state = 'CT', state_name = 'Connecticut', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8ac5b0b0-3b46-421b-a597-4c4b5ee7d8dc' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Ability First Sports: website + town + state. Evidence: https://abilityfirstsports.org/contact/
UPDATE organizations SET website_url = 'https://abilityfirstsports.org/', last_ok_at = NULL, city = 'Chico', state = 'CA', state_name = 'California', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '228727ad-b98f-4ec0-b869-30dbbe53be1f' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Redlands Bicycle Classic: website + town. Evidence: https://redlandsclassic.com/about/
UPDATE organizations SET website_url = 'https://redlandsclassic.com/', last_ok_at = NULL, city = 'Redlands', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ba9e90f5-c533-4b9b-b3db-7067df9ec591' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- University of Wisconsin-Whitewater Wheelchair Athletics: website + town. Evidence: https://www.uww.edu/wheelchair-athletics
UPDATE organizations SET website_url = 'https://www.uww.edu/wheelchair-athletics', last_ok_at = NULL, city = 'Whitewater', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'bccd4e5b-5ddc-4208-84c9-2625e3845628' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Able Athletics: website + state. Evidence: https://ableathletics.org/origins
UPDATE organizations SET website_url = 'https://ableathletics.org/', last_ok_at = NULL, state = 'NY', state_name = 'New York', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6279fa36-174d-40c1-8c06-5f6beb3b0ab2' AND (website_url IS NULL OR website_url = '') AND (state IS NULL OR state = '');

-- Minnesota Wild Sled Hockey: website + state. Evidence: https://www.mnsledhockey.org/player-registration
UPDATE organizations SET website_url = 'https://www.mnsledhockey.org/', last_ok_at = NULL, state = 'MN', state_name = 'Minnesota', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3c3f95e3-3875-4be8-a7e0-e44f0245747e' AND (website_url IS NULL OR website_url = '') AND (state IS NULL OR state = '');

-- WASA Marquette Eagles Junior - Varsity: website + town + state. Evidence: https://www.wasa.org/wheelchair-basketball
UPDATE organizations SET website_url = 'https://www.wasa.org/wheelchair-basketball', last_ok_at = NULL, city = 'Brookfield', state = 'WI', state_name = 'Wisconsin', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '87e05841-d723-4591-909b-a6f59fcfbffb' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- University of Arizona Adaptive Athletic: website + town. Evidence: https://adaptiveathletics.arizona.edu/facilities/hours
UPDATE organizations SET website_url = 'https://adaptiveathletics.arizona.edu/', last_ok_at = NULL, city = 'Tucson', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f62dbc58-902c-4a54-988f-8d7b61122dbe' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- United States Volt Hockey Association: website. Evidence: https://www.volthockeyusa.org/
UPDATE organizations SET website_url = 'https://www.volthockeyusa.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b4ebb8c5-88d5-4e2e-8ee7-95773ea546dc' AND (website_url IS NULL OR website_url = '');

-- Special Olympics Maine: website. Evidence: https://www.somaine.org/contact
UPDATE organizations SET website_url = 'https://www.somaine.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4a50a644-fbd4-4fbc-822e-725c2c97a2ab' AND (website_url IS NULL OR website_url = '');

-- Special Olympics Alaska: website. Evidence: https://specialolympicsalaska.org/
UPDATE organizations SET website_url = 'https://specialolympicsalaska.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5488cb96-c4a4-4ad6-8aa1-ac3520fe7c8e' AND (website_url IS NULL OR website_url = '');

-- Tampa Bay Lightning Sled Hockey: website + town. Evidence: https://lightninghockeydevelopment.com/adaptive-hockey-programs/sledhockey/
UPDATE organizations SET website_url = 'https://lightninghockeydevelopment.com/adaptive-hockey-programs/sledhockey/', last_ok_at = NULL, city = 'Clearwater', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9aa2dc14-3574-4d43-a6a6-04df9a34d66f' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- United States Power Soccer Association: website. Evidence: https://www.powersoccerusa.org/
UPDATE organizations SET website_url = 'https://www.powersoccerusa.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '11827aba-6df2-4548-ab3f-ab7f96fa985d' AND (website_url IS NULL OR website_url = '');

-- Chicago Skyhawks Wheelchair Basketball: website + town. Evidence: https://www.sralab.org/wheelchair-basketball
UPDATE organizations SET website_url = 'https://www.sralab.org/wheelchair-basketball', last_ok_at = NULL, city = 'Chicago', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '95b1a428-db52-4975-a141-ce4934836c9e' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- The Bridge Adaptive Sports and Recreation: website + town + state. Evidence: https://www.thebridgeadaptive.org/
UPDATE organizations SET website_url = 'https://www.thebridgeadaptive.org/', last_ok_at = NULL, city = 'Cincinnati', state = 'OH', state_name = 'Ohio', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '53ca2785-a7ce-40fe-9516-d376b3074bb0' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- University of Alabama Adapted Athletics: website + town. Evidence: https://bamaadapted.com/sports/2021/9/9/about-us
UPDATE organizations SET website_url = 'https://bamaadapted.com/', last_ok_at = NULL, city = 'Tuscaloosa', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4ef34668-47b0-4a5f-b166-d5e79a35ee19' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Adaptive Sports IOWA | ASI: website + town + state. Evidence: https://www.adaptivesportsiowa.org/contact/
UPDATE organizations SET website_url = 'https://www.adaptivesportsiowa.org/', last_ok_at = NULL, city = 'Ames', state = 'IA', state_name = 'Iowa', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '55ec9e60-a473-489b-a306-b37df7d2d8e0' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Special Olympics Washington: website. Evidence: https://specialolympicswashington.org/
UPDATE organizations SET website_url = 'https://specialolympicswashington.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e02175ed-e41a-4b9d-9993-ce4c4e31247f' AND (website_url IS NULL OR website_url = '');

-- Bridge City Rolling Blazers: website + town + state. Evidence: https://katu.com/features/everyday-heroes/everyday-heroes-wheelchair-basketball-team-rolling-blazers-bridge-city-inclusive-sports-soars-to-nationals
UPDATE organizations SET website_url = 'https://www.bridgecityinclusive.com/wheelchair-basketball', last_ok_at = NULL, city = 'Portland', state = 'OR', state_name = 'Oregon', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6fbde220-0edc-4b7b-a3a2-b6abb7d16730' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- MN TWolves: website + state. Evidence: https://account.allinahealth.org/events/54940
UPDATE organizations SET website_url = 'https://account.allinahealth.org/events/54940', last_ok_at = NULL, state = 'MN', state_name = 'Minnesota', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'bf789795-4e5c-4c04-aad5-cfa42f301836' AND (website_url IS NULL OR website_url = '') AND (state IS NULL OR state = '');

-- Envision Blind Sports: website + town + state. Evidence: https://www.envisionblindsports.org/about
UPDATE organizations SET website_url = 'https://www.envisionblindsports.org/', last_ok_at = NULL, city = 'Mercer', state = 'PA', state_name = 'Pennsylvania', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e1f34dc7-9c0b-4ece-879f-5ff7864ce6e3' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Synergy Adaptive Athletics: website + town. Evidence: https://synergyaa.org/index.php/connect-or-register/
UPDATE organizations SET website_url = 'https://synergyaa.org/', last_ok_at = NULL, city = 'Carol Stream', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '57290193-0771-489d-8f65-fb1c93f53631' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- USA Table Tennis: website. Evidence: https://www.usatt.org/usatt-para
UPDATE organizations SET website_url = 'https://www.usatt.org/usatt-para', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '98d4f176-3b9b-42dc-82e1-d2feae20d8c2' AND (website_url IS NULL OR website_url = '');

-- Special Olympics South Dakota: website. Evidence: https://sosd.org/about-special-olympics-of-sd/
UPDATE organizations SET website_url = 'https://sosd.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd3415026-d9e6-4c90-b81d-8de92d0ef3b7' AND (website_url IS NULL OR website_url = '');

-- Salvage Life: website. Evidence: https://www.salvagelifevi.org/
UPDATE organizations SET website_url = 'https://www.salvagelifevi.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'da30ccb9-ac5a-4389-9781-041019c57101' AND (website_url IS NULL OR website_url = '');

-- Charleston Cruisers: website + town + state. Evidence: https://www.lowcountryfca.org/wcbb
UPDATE organizations SET website_url = 'https://www.lowcountryfca.org/wcbb', last_ok_at = NULL, city = 'Charleston', state = 'SC', state_name = 'South Carolina', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3ba69e37-d407-4cce-96db-1e86029b5bf9' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- BORP Ballerz: website + town + state. Evidence: https://www.borp.org/programs/adult-sports/adult-wheelchair-basketball/
UPDATE organizations SET website_url = 'https://www.borp.org/programs/adult-sports/adult-wheelchair-basketball/', last_ok_at = NULL, city = 'Hayward', state = 'CA', state_name = 'California', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '06b32272-707d-437f-838d-bcb99c512a21' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- United States Association of Blind Athletes Goalball: website. Evidence: https://www.usaba.org/usa-goalball
UPDATE organizations SET website_url = 'https://www.usaba.org/usa-goalball', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e6b342a8-f1b6-429a-b893-5da4be8acd17' AND (website_url IS NULL OR website_url = '');

-- Rochester Mustangs Sled Hockey: website + town. Evidence: https://www.rochestersledhockey.org/about-us/
UPDATE organizations SET website_url = 'https://www.rochestersledhockey.org/', last_ok_at = NULL, city = 'Rochester', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'aa79cd3d-1948-4f19-8153-774d7ca3ded3' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- USA Cycling Paracycling: website. Evidence: https://usacycling.org/paracycling
UPDATE organizations SET website_url = 'https://usacycling.org/paracycling', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4f379c67-a228-41ec-a380-a9e103405d0c' AND (website_url IS NULL OR website_url = '');

-- Special Olympics Missouri: website. Evidence: https://somo.org/
UPDATE organizations SET website_url = 'https://somo.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0e0cde1f-25d7-458a-9c47-8f422359b83a' AND (website_url IS NULL OR website_url = '');

-- Team River Runner, Inc. | TRR: website. Evidence: https://www.teamriverrunner.org/
UPDATE organizations SET website_url = 'https://www.teamriverrunner.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '97241818-c560-4c0a-bc6c-2b8d0371b409' AND (website_url IS NULL OR website_url = '');

-- Great Plains Chapter Paralyzed Veterans of America: website + town. Evidence: https://www.greatplainspva.org/site/
UPDATE organizations SET website_url = 'https://www.greatplainspva.org/site/', last_ok_at = NULL, city = 'Omaha', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '150519ca-3efc-4ebe-b835-b5f802d1973e' AND website_url = 'http://www.greatplainspva.org' AND (city IS NULL OR city = '');

-- Semper Fi Barn: town. Evidence: https://www.semperfibarn.org/
UPDATE organizations SET city = 'Central', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '66a25774-8457-5568-9ad8-ff2803505599' AND (city IS NULL OR city = '');

-- Ability360 Phoenix Wheelchair: website + town + state. Evidence: https://ability360.org/sports-fitness/
UPDATE organizations SET website_url = 'https://ability360.org/sports-fitness/', last_ok_at = NULL, city = 'Phoenix', state = 'AZ', state_name = 'Arizona', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2ec3f4cf-460d-4ae4-9e43-2ab043c91d1b' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Adaptive Climbing Group: website + town. Evidence: https://www.adaptiveclimbinggroup.org/
UPDATE organizations SET website_url = 'https://www.adaptiveclimbinggroup.org/', last_ok_at = NULL, city = 'New York', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7e241540-104c-42a6-afe7-515145384cb9' AND website_url = 'http://www.adaptiveclimbinggroup.org/' AND (city IS NULL OR city = '');

-- City of Pasadena Verne Cox Multipurpose Recreation Center: website + town. Evidence: https://pasadenatx.gov/189/Adaptive-Recreation
UPDATE organizations SET website_url = 'https://pasadenatx.gov/189/Adaptive-Recreation', last_ok_at = NULL, city = 'Pasadena', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '226a3e2b-670b-4800-bb1c-345b63739627' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Therapeutic Adventures, Inc.: website + town. Evidence: https://taonline.org/v2/index.php/therapeutic-adventures-new/
UPDATE organizations SET website_url = 'https://taonline.org/v2/', last_ok_at = NULL, city = 'Charlottesville', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f9c2477c-34b5-4ce7-91b2-33c547018eaf' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- North Texas Equestrian Center: website + town. Evidence: https://ntecdfw.com/
UPDATE organizations SET website_url = 'https://ntecdfw.com/', last_ok_at = NULL, city = 'Wylie', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '649958ce-598b-471a-8605-216aa350edab' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- VETSports: website. Evidence: https://www.vetsports.org/chapter-leaders
UPDATE organizations SET website_url = 'https://www.vetsports.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f3116ece-0e86-4bb9-97ff-e4cd65d39ec3' AND website_url = 'http://www.vetsports.org';

-- Vermont Adaptive Ski & Sport: website + state. Evidence: https://www.vermontadaptive.org/
UPDATE organizations SET website_url = 'https://www.vermontadaptive.org/', last_ok_at = NULL, state = 'VT', state_name = 'Vermont', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f485ec3c-c40d-458c-b21b-613b90eda97a' AND (website_url IS NULL OR website_url = '') AND (state IS NULL OR state = '');

-- Maine Organization of Blind Athletic and Leadership Education: website. Evidence: http://mobalesports.blogspot.com/2025/
UPDATE organizations SET website_url = 'https://www.mobale.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '56f27356-d9f6-424f-8866-761789c2313f' AND (website_url IS NULL OR website_url = '');

-- USTA Wheelchair Tennis: website. Evidence: https://www.usta.com/en/home/play/adult-tennis/programs/national/about-wheelchair-tennis.html
UPDATE organizations SET website_url = 'https://www.usta.com/en/home/play/adult-tennis/programs/national/about-wheelchair-tennis.html', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8472000e-0e42-4fb7-af6d-0b14a6ae685f' AND (website_url IS NULL OR website_url = '');

-- Columbus Recreation and Parks Department: website + town. Evidence: https://columbusrecparks.com/facilities/espy-adaptive-sports-complex/
UPDATE organizations SET website_url = 'https://columbusrecparks.com/wellness/therapeutic-recreation/adaptivesports/', last_ok_at = NULL, city = 'Columbus', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '10d1e42e-2ef1-408c-9427-13465c5e4af4' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Western New York Adaptive Water Sports: website + town. Evidence: https://wnyadaptivewatersport.org/wp/programs/
UPDATE organizations SET website_url = 'https://wnyadaptivewatersport.org/wp/', last_ok_at = NULL, city = 'Buffalo', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5393fb6d-0d6d-4624-9bd7-5a83d03de642' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Disabled Sports USA: website. Evidence: https://moveunitedsport.org/
UPDATE organizations SET website_url = 'https://moveunitedsport.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '199c6338-40fe-4c6a-a00b-50101cdae9d1' AND (website_url IS NULL OR website_url = '');

-- Rochester Accessible Adventures: website + town. Evidence: https://rochesteraccessibleadventures.org/
UPDATE organizations SET website_url = 'https://rochesteraccessibleadventures.org/', last_ok_at = NULL, city = 'Rochester', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '11ac10b1-f3ae-4990-8be2-595f95905e39' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Northern Will County Special Recreation Association: town. Evidence: https://nwcsra.org/
UPDATE organizations SET city = 'Romeoville', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd1d70d1f-e6d1-42c2-932a-5fd6732b7ed9' AND (city IS NULL OR city = '');

-- University of Alabama: website + town + state. Evidence: https://bamaadapted.com/sports/mens-wheelchair-basketball
UPDATE organizations SET website_url = 'https://bamaadapted.com/', last_ok_at = NULL, city = 'Tuscaloosa', state = 'AL', state_name = 'Alabama', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e7356a15-2a8e-4196-a1fc-92417fb7f773' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Southern Arizona Association for the Visually Impaired (SAAVI): website + town. Evidence: https://saavi.us/contact-us/
UPDATE organizations SET website_url = 'https://saavi.us/', last_ok_at = NULL, city = 'Tucson', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b5f264f7-3913-4d07-8198-0e48ed7992ce' AND website_url = 'http://www.saavi.us' AND (city IS NULL OR city = '');

-- Mary Free Bed Wheelchair and Adaptive Sports – Grand Rapids: website + town. Evidence: https://www.maryfreebed.com/specialties/wheelchair-adaptive-sports/
UPDATE organizations SET website_url = 'https://www.maryfreebed.com/specialties/wheelchair-adaptive-sports/', last_ok_at = NULL, city = 'Grand Rapids', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ae200b8a-8b08-4ef1-972e-f5445d07d84e' AND website_url = 'http://www.maryfreebed.com/sports' AND (city IS NULL OR city = '');

-- Special Olympics South Carolina: website. Evidence: https://so-sc.org/
UPDATE organizations SET website_url = 'https://so-sc.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f00e6b2d-9f81-460d-b84c-c6ce42dd2599' AND (website_url IS NULL OR website_url = '');

-- Special Olympics Pennsylvania: website. Evidence: https://specialolympicspa.org/
UPDATE organizations SET website_url = 'https://specialolympicspa.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2fdeb1e5-2a0f-480a-b60f-e5269bd8f0bf' AND (website_url IS NULL OR website_url = '');

-- Sports Association, Gaylord Hospital – Paralympic Sport Southern New England: website + town. Evidence: https://sportsassociation.gaylord.org/
UPDATE organizations SET website_url = 'https://sportsassociation.gaylord.org/', last_ok_at = NULL, city = 'Wallingford', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fe5057c2-0f95-491f-a2ed-a5aecf8fa32c' AND website_url = 'http://www.gaylord.org/sports' AND (city IS NULL OR city = '');

-- Veterans Breakfast Club / Military Writers Society of America: town. Evidence: https://veteransbreakfastclub.org/
UPDATE organizations SET city = 'Pittsburgh', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f1a65f32-ff54-553a-8a3c-c01c9f9a55a8' AND (city IS NULL OR city = '');

-- War Paint Collective: town. Evidence: https://warpaintcollective.org/
UPDATE organizations SET city = 'Chandler', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4863cce7-fe49-536b-8328-c35572871d7d' AND (city IS NULL OR city = '');

-- SportsAbility Alliance (Florida Disabled Outdoors Association): town. Evidence: https://www.sportsability.org/
UPDATE programs SET city = 'Tallahassee', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e209699b-0753-4d25-972e-d3905c8942b2' AND (city IS NULL OR city = '');

-- Special Olympics Rhode Island: website. Evidence: https://www.specialolympicsri.org/
UPDATE organizations SET website_url = 'https://www.specialolympicsri.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9981dcc4-b2b3-4faf-a48f-3847ac49402e' AND (website_url IS NULL OR website_url = '');

-- US Adaptive Recreation Center | USARC: website + town + state. Evidence: https://www.usarc.org/contact-us/
UPDATE organizations SET website_url = 'https://www.usarc.org/', last_ok_at = NULL, city = 'Big Bear Lake', state = 'CA', state_name = 'California', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7c5282a9-0adc-4917-a61a-2d1a1d24dd6c' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Special Olympics Massachusetts: website. Evidence: https://www.specialolympicsma.org/
UPDATE organizations SET website_url = 'https://www.specialolympicsma.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd4885d36-d90a-4f44-bc49-460d8991ee83' AND (website_url IS NULL OR website_url = '');

-- Special Olympics Tennessee: website. Evidence: https://www.specialolympicstn.org/
UPDATE organizations SET website_url = 'https://www.specialolympicstn.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '989908b8-3536-474b-a386-d326049693e6' AND (website_url IS NULL OR website_url = '');

-- Warrior Sanctuary: town. Evidence: https://www.warriorsanctuary.org/contact-us
UPDATE organizations SET city = 'Jacksonville', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'cf52846b-1c07-5563-b9f7-972bdfdb9bbf' AND (city IS NULL OR city = '');

-- Sportable Richmond Adaptive Sports & Recreation: website + town. Evidence: https://sportable.org/contact/
UPDATE organizations SET website_url = 'https://sportable.org/', last_ok_at = NULL, city = 'Richmond', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '90b97b9e-3684-4d4b-9f51-414f1c27e11f' AND website_url = 'http://www.sportable.org' AND (city IS NULL OR city = '');

-- Challenge Alaska – Paralympic Sport Alaska: website + town. Evidence: https://www.challengealaska.org/
UPDATE organizations SET website_url = 'https://www.challengealaska.org/', last_ok_at = NULL, city = 'Anchorage', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '26c4f6ed-5822-4bf6-9089-c42508316882' AND website_url = 'http://www.challengealaska.org/index.php?option=com_content&view=article&id=112&Itemid=123' AND (city IS NULL OR city = '');

-- Leaps Of Faith (LOF) Disabled Skiers: website + town. Evidence: https://www.lofadaptiveskiers.org/
UPDATE organizations SET website_url = 'https://www.lofadaptiveskiers.org/', last_ok_at = NULL, city = 'Sandy Hook', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c7ec4e5e-8b94-4522-a930-dc50a5545f6c' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- USA Judo Adaptive: website. Evidence: https://www.usajudo.com/
UPDATE organizations SET website_url = 'https://www.usajudo.com/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '22d3fbd8-4948-4195-9799-db09ce16152f' AND (website_url IS NULL OR website_url = '');

-- USA Track & Field Paralympic: website. Evidence: https://usparatf.org/news/2024/october/30/u-s-paralympics-track-field-program-joins-usa-track-field
UPDATE organizations SET website_url = 'https://www.usatf.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'dda093f1-387e-45af-8faa-0f19bc0726b2' AND (website_url IS NULL OR website_url = '');

-- University of Arizona Adaptive Athletics: website + town + state. Evidence: https://adaptiveathletics.arizona.edu/
UPDATE organizations SET website_url = 'https://adaptiveathletics.arizona.edu/', last_ok_at = NULL, city = 'Tucson', state = 'AZ', state_name = 'Arizona', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c9a80e85-cc9d-4295-8352-1132e15b9ee8' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Salt Lake County: website + state. Evidence: https://www.saltlakecounty.gov/parks-recreation/adaptive/
UPDATE organizations SET website_url = 'https://www.saltlakecounty.gov/parks-recreation/adaptive/', last_ok_at = NULL, state = 'UT', state_name = 'Utah', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '1a78c104-0183-4253-a391-c6bb49ae9b15' AND (website_url IS NULL OR website_url = '') AND (state IS NULL OR state = '');

-- Challenged Athletes Foundation Cycling: website. Evidence: https://www.challengedathletes.org/region/cycling-club/
UPDATE organizations SET website_url = 'https://www.challengedathletes.org/region/cycling-club/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6cbdaa42-8654-40ec-a045-2bca9c06e873' AND (website_url IS NULL OR website_url = '');

-- Holyoke Rows, Inc.: website + town. Evidence: https://www.holyokerows.org/about
UPDATE organizations SET website_url = 'https://www.holyokerows.org/', last_ok_at = NULL, city = 'Holyoke', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '58f977d2-a9a0-4de1-bf8f-93f5fd3cc6d0' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Seven Hills Foundation: website + town + state. Evidence: https://www.sevenhills.org/programs/recreation-and-sports
UPDATE organizations SET website_url = 'https://www.sevenhills.org/programs/recreation-and-sports', last_ok_at = NULL, city = 'Worcester', state = 'MA', state_name = 'Massachusetts', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '37198956-cb15-4438-b4d9-88c5f0a4af16' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Keystone Adaptive Center: town. Evidence: https://boec.org/keystone-adaptive-center/
UPDATE organizations SET city = 'Keystone', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8ab489cb-07bc-4de8-9378-0e2af738ac90' AND (city IS NULL OR city = '');

-- Adaptive Athletics Association: website. Evidence: https://adaptiveathletics.net/about-us/
UPDATE organizations SET website_url = 'https://adaptiveathletics.net/about-us/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f6b29981-df84-41d9-a20c-655766bc1e2e' AND website_url = 'http://www.adaptiveathletics.org';

-- San Diego Ducks Sled: website + town + state. Evidence: https://www.sandiegogulls.com/gulls-hockey-programs/san-diego-gulls-sled-hockey
UPDATE organizations SET website_url = 'https://duckssledhockey.org/', last_ok_at = NULL, city = 'Poway', state = 'CA', state_name = 'California', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '34f59400-6ae9-4a37-96d2-227ea2626e90' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Yes U Can USA: website + town. Evidence: https://yesucanusa.org/
UPDATE organizations SET website_url = 'https://yesucanusa.org/', last_ok_at = NULL, city = 'Newark', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e010bef7-0d8a-4545-bb0e-6a4e6f430b3e' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Adaptive Fitness Legion: website + town + state. Evidence: https://www.adaptivefitnesslegion.org/contact
UPDATE organizations SET website_url = 'https://www.adaptivefitnesslegion.org/', last_ok_at = NULL, city = 'Fairfax', state = 'VA', state_name = 'Virginia', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4336845a-aec0-47a2-bc8d-bb72a8cd326a' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Goalball USA: website. Evidence: https://www.usaba.org/usa-goalball
UPDATE organizations SET website_url = 'https://www.usaba.org/usa-goalball', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd8b80db5-7799-4b57-953d-e506e26c1d97' AND (website_url IS NULL OR website_url = '');

-- Special Olympics Connecticut: website. Evidence: https://www.soct.org/about-us
UPDATE organizations SET website_url = 'https://www.soct.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '392132c5-6a1a-443b-9eb4-c006be128550' AND (website_url IS NULL OR website_url = '');

-- Florida Disabled Outdoors Association: website + town. Evidence: https://www.sportsability.org/
UPDATE organizations SET website_url = 'https://www.sportsability.org/', last_ok_at = NULL, city = 'Tallahassee', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2ec30980-aea5-4aab-ae27-f9b1dd208430' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Desert Challenge Games: website + town. Evidence: https://www.arizonadisabledsports.com/dcgames
UPDATE organizations SET website_url = 'https://www.arizonadisabledsports.com/dcgames', last_ok_at = NULL, city = 'Mesa', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fabc14b9-2b79-49f2-826f-6f05d2dafd48' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Stand Up and Play Foundation: website + town + state. Evidence: https://standupandplayfoundation.org/contact-us/
UPDATE organizations SET website_url = 'https://standupandplayfoundation.org/', last_ok_at = NULL, city = 'Vista', state = 'CA', state_name = 'California', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd9f38390-a20e-47fd-88c1-5284e40913b6' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Friends of Stowe Adaptive Sports: website + town. Evidence: https://greenmtnadaptive.org/
UPDATE organizations SET website_url = 'https://greenmtnadaptive.org/', last_ok_at = NULL, city = 'Stowe', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '472aab94-8390-4f60-87e8-7ed61f8ee1f3' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Pittsburgh Mighty Penguins Sled Hockey: website + town. Evidence: https://penguinssledhockey.org/
UPDATE organizations SET website_url = 'https://www.penguinssledhockey.org/', last_ok_at = NULL, city = 'Pittsburgh', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'efa71cb5-f813-492e-b793-db4bf93aceca' AND website_url = 'http://penguinssledhockey.org/' AND (city IS NULL OR city = '');

-- Nashville Sled Preds: website + town + state. Evidence: https://nationalwheelcats.org/more-about-the-sled-preds
UPDATE organizations SET website_url = 'https://nationalwheelcats.org/more-about-the-sled-preds', last_ok_at = NULL, city = 'Nashville', state = 'TN', state_name = 'Tennessee', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '728c7d06-d189-45d5-bede-9918e4600c46' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- ParaSports – San Antonio: town. Evidence: https://parasports.org/
UPDATE organizations SET city = 'San Antonio', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'bccb7a84-00fd-4fe7-97b5-3292123e2e9a' AND (city IS NULL OR city = '');

-- Pittsburgh Penguins Sled Hockey: website + town + state. Evidence: https://penguinssledhockey.org/
UPDATE organizations SET website_url = 'https://www.penguinssledhockey.org/', last_ok_at = NULL, city = 'Pittsburgh', state = 'PA', state_name = 'Pennsylvania', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '726fbaaa-5f1d-4d17-aa62-fce56504cbff' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Special Olympics Idaho: website. Evidence: https://www.specialolympicsidaho.org/
UPDATE organizations SET website_url = 'https://www.specialolympicsidaho.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b2312fd4-1646-4343-afa4-3d12faf59c82' AND (website_url IS NULL OR website_url = '');

-- Dare2tri Paratriathlon Club: website + town. Evidence: https://dare2tri.org/
UPDATE organizations SET website_url = 'https://dare2tri.org/', last_ok_at = NULL, city = 'Chicago', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5212b9f0-83a6-4ab9-a7ac-197f0e6cdf7e' AND website_url = 'http://www.dare2tri.org' AND (city IS NULL OR city = '');

-- City of Kentwood Parks & Recreation: website + town. Evidence: https://kentwood.us/city_services/city_departments/parks_and_recreation/adaptive.php
UPDATE organizations SET website_url = 'https://kentwood.us/city_services/city_departments/parks_and_recreation/adaptive.php', last_ok_at = NULL, city = 'Kentwood', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '18765bd8-898a-4490-b93a-f623221c50f6' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Special Olympics Wyoming: website. Evidence: https://sowy.org/about
UPDATE organizations SET website_url = 'https://sowy.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7e64ee50-cd2c-489c-996c-4c58127e3738' AND (website_url IS NULL OR website_url = '');

-- Columbus Rec & Parks – Columbus: website + town. Evidence: https://columbusrecparks.com/wellness/therapeutic-recreation/adaptivesports/
UPDATE organizations SET website_url = 'https://columbusrecparks.com/wellness/therapeutic-recreation/adaptivesports/', last_ok_at = NULL, city = 'Columbus', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '626e65a4-2cdc-475a-9ac9-fd50d8f536f8' AND website_url = 'https://columbusrecparks.com/wellness/therapeutic-recreation/adaptivesportsclub/' AND (city IS NULL OR city = '');

-- EA Therapeutics: website + town + state. Evidence: https://chooseea.org/community-youth-specialized-program-adaptive-fitness-for-all-abilities-ea-therapeutic-health
UPDATE organizations SET website_url = 'https://chooseea.org/community-youth-specialized-program-adaptive-fitness-for-all-abilities-ea-therapeutic-health', last_ok_at = NULL, city = 'Rochester', state = 'MN', state_name = 'Minnesota', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a92000c8-82be-4911-b739-f413b4de0122' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Team River Runner – Newbury: town. Evidence: https://www.teamriverrunner.org/get-involved/chapters/new-hampshire-nehsa/
UPDATE organizations SET city = 'Newbury', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9e014589-77dc-4fb5-8ede-cb4227192bff' AND (city IS NULL OR city = '');

-- CNY Adaptive Sports: website + town + state. Evidence: https://cnyadaptivesports.org/about/
UPDATE organizations SET website_url = 'https://cnyadaptivesports.org/', last_ok_at = NULL, city = 'Syracuse', state = 'NY', state_name = 'New York', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9c8ca97f-914b-4bb9-80a0-1cf40ac193a8' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Move United Boccia: website. Evidence: https://moveunitedsport.org/sport/boccia/
UPDATE organizations SET website_url = 'https://moveunitedsport.org/sport/boccia/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8ee96b67-b4e4-479a-9ec2-1469d70ee343' AND (website_url IS NULL OR website_url = '');

-- Grand Strand Miracle League: website + town + state. Evidence: https://grandstrandmiracleleague.com/contact/
UPDATE organizations SET website_url = 'https://grandstrandmiracleleague.com/', last_ok_at = NULL, city = 'Myrtle Beach', state = 'SC', state_name = 'South Carolina', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9c1c3374-4b67-476c-85bb-89613ca804ff' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Wheelchair Sports, Inc. – Wichita: town. Evidence: https://www.wichitaadaptivesports.org/
UPDATE organizations SET city = 'Wichita', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '73d79fee-c992-4dc1-9c43-90647a1dacae' AND (city IS NULL OR city = '');

-- New England Nordic Ski Association, Vermont: website. Evidence: https://nensa.net/para-nordic-skiing/
UPDATE programs SET website_url = 'https://nensa.net/para-nordic-skiing/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'cdb70473-8e29-4e4f-9502-cba4dbed338d' AND website_url = 'https://nensa.net/';

-- Charlotte Curling Club: website + town. Evidence: https://charlottecurling.com/our-club/
UPDATE organizations SET website_url = 'https://charlottecurling.com/', last_ok_at = NULL, city = 'Charlotte', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd92650ec-6eb4-4f90-963e-db4b70eef029' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Heroes On The Water: website. Evidence: https://heroesonthewater.org/chapters/chapters-events/
UPDATE organizations SET website_url = 'https://heroesonthewater.org/chapters/chapters-events/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '023a2407-cc46-4a5e-8c06-e0d019cf9232' AND (website_url IS NULL OR website_url = '');

-- Hospital for Special Care – Paralympic Sport Club Connecticut: website + town. Evidence: https://hfsc.org/
UPDATE organizations SET website_url = 'https://hfsc.org/', last_ok_at = NULL, city = 'New Britain', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '81df50cf-d266-4394-90c3-5652acab9f5f' AND website_url = 'http://www.hfsc.org' AND (city IS NULL OR city = '');

-- NM 66ers: website + town + state. Evidence: https://nmadaptive.org/
UPDATE organizations SET website_url = 'https://nmadaptive.org/', last_ok_at = NULL, city = 'Albuquerque', state = 'NM', state_name = 'New Mexico', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '18e72777-9993-4b4b-8024-0814d8a488a0' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Amputee Coalition: website. Evidence: https://amputee-coalition.org/about-us/
UPDATE organizations SET website_url = 'https://amputee-coalition.org/about-us/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '592375c9-cab3-4f07-8447-13b2f672faf0' AND website_url = 'https://www.amputee-coalition.org/about-us/';

-- Team River Runner – Spokane: town. Evidence: https://www.teamriverrunner.org/get-involved/chapters/washington-spokane/
UPDATE organizations SET city = 'Spokane', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f76d83be-af8b-4c09-aed4-9f34c9fc55b0' AND (city IS NULL OR city = '');

-- Spaulding Rehabilitation Hospital: website + town. Evidence: https://www.spauldingrehab.org/conditions-services/adaptive-sports
UPDATE organizations SET website_url = 'https://www.spauldingrehab.org/conditions-services/adaptive-sports', last_ok_at = NULL, city = 'Boston', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4dab4960-7f4e-4689-8ae3-2b2d94d55613' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Arts for All Wisconsin: town. Evidence: https://www.artsforallwi.org/
UPDATE organizations SET city = 'Madison', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ecd06a14-6e53-5f8f-8ccc-4e47ebd98e11' AND (city IS NULL OR city = '');

-- Promise Landing Farm, Inc.: website + town + state. Evidence: https://www.promiselandingfarm.org/
UPDATE organizations SET website_url = 'https://www.promiselandingfarm.org/', last_ok_at = NULL, city = 'Upper Marlboro', state = 'MD', state_name = 'Maryland', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '93e17896-66a9-44f4-beac-1ca73d55fb89' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Virtua Wings of Steel Sled Hockey: website + town. Evidence: https://wingsofsteel.org/
UPDATE organizations SET website_url = 'https://wingsofsteel.org/', last_ok_at = NULL, city = 'Voorhees', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'cde056df-5197-4541-b88e-72f4e9b044a2' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- USA Fencing Wheelchair: website. Evidence: https://www.usafencing.org/parafencing
UPDATE organizations SET website_url = 'https://www.usafencing.org/parafencing', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fbd8c46e-92d4-4839-8c14-96931a31fd3e' AND (website_url IS NULL OR website_url = '');

-- Blind Stokers Club: website + town. Evidence: https://blindstokersclub.org/
UPDATE organizations SET website_url = 'https://blindstokersclub.org/', last_ok_at = NULL, city = 'San Diego', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fc9ebb4d-e484-4ad4-a825-f76b859d4d86' AND website_url = 'http://www.blindstokersclub.org' AND (city IS NULL OR city = '');

-- Team River Runner – Portland: town. Evidence: https://www.teamriverrunner.org/get-involved/chapters/oregon-portland/
UPDATE organizations SET city = 'Portland', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '99b7d215-75bf-4a5c-add3-f1a605e5aab1' AND (city IS NULL OR city = '');

-- Challenge Games: website + town. Evidence: https://www.challengegames.org/
UPDATE organizations SET website_url = 'https://www.challengegames.org/', last_ok_at = NULL, city = 'Derby', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3ffc8ce5-f316-4c04-865e-b13fe9bb0c28' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Mount Washington Valley Adaptive Sports: town. Evidence: https://mwvas.org/
UPDATE organizations SET city = 'Bartlett', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7fe9e1bf-2c6e-472d-bf46-3772e60ecf5a' AND (city IS NULL OR city = '');

-- Special Olympics Florida: website. Evidence: https://www.specialolympicsflorida.org/contact
UPDATE organizations SET website_url = 'https://www.specialolympicsflorida.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6a013aca-07fd-4643-9d7d-ebf9829db39e' AND (website_url IS NULL OR website_url = '');

-- Angel City Sport: website + town. Evidence: https://angelcitysports.org/
UPDATE organizations SET website_url = 'https://angelcitysports.org/', last_ok_at = NULL, city = 'Los Angeles', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ae26be82-ab18-4449-b7d7-ad3e05e4bf0d' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Tucson Lobos: website + town + state. Evidence: https://www.soazadaptivesports.org/copy-of-programs-2
UPDATE organizations SET website_url = 'https://www.soazadaptivesports.org/copy-of-programs-2', last_ok_at = NULL, city = 'Tucson', state = 'AZ', state_name = 'Arizona', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd49440f6-b532-412e-a176-58d412767aef' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Mem Rollin Grizzlies: website + town + state. Evidence: https://www.rollingrizzlies.org/who-we-are
UPDATE organizations SET website_url = 'https://www.rollingrizzlies.org/', last_ok_at = NULL, city = 'Memphis', state = 'TN', state_name = 'Tennessee', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '930bb98f-5f4d-401b-b7dc-0d4feef052cc' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Amazing Surf Adventures: website + town. Evidence: https://operationsurf.org/
UPDATE organizations SET website_url = 'https://operationsurf.org/', last_ok_at = NULL, city = 'Avila Beach', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ab97946a-90bd-4cdb-9948-ee4c96a0aa8e' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Miami Heat Wheels: website + town. Evidence: https://miamiheatwheels.com/
UPDATE organizations SET website_url = 'https://miamiheatwheels.com/', last_ok_at = NULL, city = 'Miami', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c578d4f8-1355-4454-a59c-db3a11c9c43f' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Summit Adaptive Sports: website + town + state. Evidence: https://www.summitadaptive.org/
UPDATE organizations SET website_url = 'https://www.summitadaptive.org/', last_ok_at = NULL, city = 'New Hartford', state = 'CT', state_name = 'Connecticut', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b7696d70-50f0-44e7-b979-64c3113a044d' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Adaptive Sports New England: website + town. Evidence: https://adaptivesportsne.org/
UPDATE organizations SET website_url = 'https://adaptivesportsne.org/', last_ok_at = NULL, city = 'Boston', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd4a75efa-300e-4f80-92d5-e8a8f6d74033' AND website_url = 'http://www.adaptivesportsne.org' AND (city IS NULL OR city = '');

-- Chicago Hornets: website + town + state. Evidence: https://www.sralab.org/wheelchair-basketball
UPDATE organizations SET website_url = 'https://www.sralab.org/wheelchair-basketball', last_ok_at = NULL, city = 'Chicago', state = 'IL', state_name = 'Illinois', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'cd8f000b-ef33-402e-9d80-3d80fc411a58' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Team River Runner – Minneapolis: website + town. Evidence: https://www.teamriverrunner.org/get-involved/chapters/minnesota-minneapolis/
UPDATE organizations SET website_url = 'https://www.teamriverrunner.org/get-involved/chapters/minnesota-minneapolis/', last_ok_at = NULL, city = 'Minneapolis', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7af384a3-8eca-4866-b971-1cec15e79bf3' AND website_url = 'http://www.teamriverrunner.org/?q=node/1299' AND (city IS NULL OR city = '');

-- USPSA Regional Teams: website. Evidence: https://www.powersoccerusa.org/discover/find-a-team
UPDATE organizations SET website_url = 'https://www.powersoccerusa.org/discover/find-a-team', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'afd35377-8134-41c4-ba3a-889725b7f3d3' AND (website_url IS NULL OR website_url = '');

-- Shawnee County Parks & Recreation: website + town. Evidence: https://parks.snco.us/
UPDATE organizations SET website_url = 'https://parks.snco.us/', last_ok_at = NULL, city = 'Topeka', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b7d2db61-1953-4cdd-a3c3-ae822185b06d' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Cleveland Wheelchair Cavaliers: website + town. Evidence: https://neoadaptivesports.org/about-us
UPDATE organizations SET website_url = 'https://neoadaptivesports.org/about-us', last_ok_at = NULL, city = 'Cleveland', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f5160cce-07c4-4d26-93dd-585c9eb3f1b3' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Michigan Blind Athletes Association: website. Evidence: https://miblindsports.org/
UPDATE organizations SET website_url = 'https://miblindsports.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'af4daa62-2c9a-488c-97e0-a08bc1ec4a08' AND (website_url IS NULL OR website_url = '');

-- Special Olympics Vermont: website. Evidence: https://www.specialolympicsvermont.org/
UPDATE organizations SET website_url = 'https://www.specialolympicsvermont.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '48c0d744-5ab6-49bc-ae76-80879e17f2b8' AND (website_url IS NULL OR website_url = '');

-- Lucky Fin Project: website + town. Evidence: https://luckyfinproject.org/about/
UPDATE organizations SET website_url = 'https://luckyfinproject.org/', last_ok_at = NULL, city = 'Royal Oak', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c1256dcd-2be9-4ff6-ba4f-992f04b59120' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Disabled Athlete Sports Association | DASA: website + town + state. Evidence: https://www.dasasports.org/mission-and-impact
UPDATE organizations SET website_url = 'https://www.dasasports.org/', last_ok_at = NULL, city = 'St. Louis', state = 'MO', state_name = 'Missouri', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9758b6c4-c0ac-4191-bd36-b4c66816c0fe' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- University of Utah Health Care Rehabilitation Center - TRAILS: website + town. Evidence: https://healthcare.utah.edu/neilsen-physical-rehab-hospital/support-services/trails
UPDATE organizations SET website_url = 'https://healthcare.utah.edu/neilsen-physical-rehab-hospital/support-services/trails', last_ok_at = NULL, city = 'Salt Lake City', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7a131cd1-59b6-48a6-86be-8703cdafe411' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Adaptive Sports Program of Ohio: website + town. Evidence: https://adaptivesportsohio.org/contact/
UPDATE programs SET website_url = 'https://adaptivesportsohio.org/', last_ok_at = NULL, city = 'Wooster', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5ca9c948-ede9-4ecb-a061-c952dc50c916' AND website_url = 'http://adaptivesportsohio.org/' AND (city IS NULL OR city = '');

-- Warrior Revival: town. Evidence: https://www.warrior-revival.org/contact
UPDATE organizations SET city = 'Sandy', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ea1d083d-8c7f-58b5-8351-fbdb757cf01d' AND (city IS NULL OR city = '');

-- Virginia Sun Wheelers: website + town. Evidence: https://www.vasunwheelers.org/join-us
UPDATE organizations SET website_url = 'https://www.vasunwheelers.org/', last_ok_at = NULL, city = 'Hampton', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '78133b25-2be3-4134-aa08-323ab85bb6a8' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- WNY Adaptive Water Sports: website + town. Evidence: https://wnyadaptivewatersport.org/wp/programs/
UPDATE organizations SET website_url = 'https://wnyadaptivewatersport.org/wp/', last_ok_at = NULL, city = 'Buffalo', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6ff0b283-b90f-4f59-904c-24cba673a9f8' AND website_url = 'http://www.wnyadaptivewatersports.org' AND (city IS NULL OR city = '');

-- ComMotion – Community in Motion: website + town + state. Evidence: https://commotionnc.org/
UPDATE organizations SET website_url = 'https://commotionnc.org/', last_ok_at = NULL, city = 'Cary', state = 'NC', state_name = 'North Carolina', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'bdec2399-07b9-43c5-91fc-9dbf5a3e4030' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Music City Thunder Varsity: website + town + state. Evidence: https://www.ableyouth.org/
UPDATE organizations SET website_url = 'https://www.ableyouth.org/music-city-thunder-wheelchair-basketball/', last_ok_at = NULL, city = 'Nashville', state = 'TN', state_name = 'Tennessee', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '09bf658c-f8fa-4ea5-b60e-fa4ea9c6bf99' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Boston Athletic Association: website + town + state. Evidence: https://www.baa.org/races/boston-marathon/info-for-para-adaptive-athletes/
UPDATE organizations SET website_url = 'https://www.baa.org/races/boston-marathon/info-for-para-adaptive-athletes/', last_ok_at = NULL, city = 'Boston', state = 'MA', state_name = 'Massachusetts', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8c4b3f9d-a918-4cba-a59a-673ac2bbc59f' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- KC Kings: website + town + state. Evidence: https://www.midwestadaptivesports.org/youth-wheelchair-basketball
UPDATE organizations SET website_url = 'https://www.midwestadaptivesports.org/youth-wheelchair-basketball', last_ok_at = NULL, city = 'Kansas City', state = 'MO', state_name = 'Missouri', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '06fd6c28-767b-4ca4-a5f2-8965b2189e94' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- NE Red Dawgs Jr Varsity: website + town + state. Evidence: https://nebraskaadaptivesports.org/youth-activities/ne-red-dawgs/
UPDATE organizations SET website_url = 'https://nebraskaadaptivesports.org/youth-activities/ne-red-dawgs/', last_ok_at = NULL, city = 'Omaha', state = 'NE', state_name = 'Nebraska', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '1c5b6fba-ff6a-486b-8882-18eedab5d867' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Team River Runner – Wilmington: town. Evidence: https://www.teamriverrunner.org/north-carolina-wilmington/
UPDATE organizations SET city = 'Wilmington', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '933e1c91-f2aa-4b0a-80d4-63eb81ceffa9' AND (city IS NULL OR city = '');

-- Texas Parasport: website + state. Evidence: https://www.texasparasport.org/
UPDATE organizations SET website_url = 'https://www.texasparasport.org/', last_ok_at = NULL, state = 'TX', state_name = 'Texas', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ae4fc938-5ee1-4f78-bf2e-f390244966a0' AND (website_url IS NULL OR website_url = '') AND (state IS NULL OR state = '');

-- PossAbilities Rolling Bears: website + town + state. Evidence: https://teampossabilities.org/rolling-bears/
UPDATE organizations SET website_url = 'https://teampossabilities.org/rolling-bears/', last_ok_at = NULL, city = 'Loma Linda', state = 'CA', state_name = 'California', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'cf3b9b55-1b6b-4804-b027-f8495d38f491' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Rochester Wheels: website + town + state. Evidence: https://rochesteraccessibleadventures.org/
UPDATE organizations SET website_url = 'https://rochesteraccessibleadventures.org/how-we-help/sports-athletes/rochester-wheels/', last_ok_at = NULL, city = 'Rochester', state = 'NY', state_name = 'New York', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a8e095c0-9e54-419c-b302-ddb449a7ad59' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Special Olympics Oregon: website. Evidence: https://soor.org/learn-about-us/
UPDATE organizations SET website_url = 'https://soor.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9e3085fa-73c4-4c61-aacf-dbdf4c4c168c' AND (website_url IS NULL OR website_url = '');

-- PossAbilities at Loma Linda University Medical Center: website + town. Evidence: https://teampossabilities.org/rolling-bears/
UPDATE organizations SET website_url = 'https://teampossabilities.org/', last_ok_at = NULL, city = 'Loma Linda', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8172e53b-ce0a-41d8-b2d1-c5ab2f261792' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Memphis Rollin' Grizzlies: website + town. Evidence: https://www.rollingrizzlies.org/who-we-are
UPDATE organizations SET website_url = 'https://www.rollingrizzlies.org/', last_ok_at = NULL, city = 'Memphis', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e6c253d8-0efa-4502-9abe-9da90bb2a993' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- City of Boise - Parks & Recreation Dept.: website + town. Evidence: https://www.cityofboise.org/departments/parks-and-recreation/adaptive-recreation/
UPDATE organizations SET website_url = 'https://www.cityofboise.org/departments/parks-and-recreation/adaptive-recreation/', last_ok_at = NULL, city = 'Boise', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd2ad9869-6c68-4f5c-8016-1a6a2015243b' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Dairyland Games: website + town. Evidence: https://www.dairylandsports.org/events/dairyland-games/
UPDATE organizations SET website_url = 'https://www.dairylandsports.org/events/dairyland-games/', last_ok_at = NULL, city = 'Verona', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2af5a56b-9083-450a-aa07-107d8819ea07' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- DSUSA Orange County – The Achievers: website + town + state. Evidence: https://www.theachievers.org/about-us
UPDATE organizations SET website_url = 'https://www.theachievers.org/', last_ok_at = NULL, city = 'Ladera Ranch', state = 'CA', state_name = 'California', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3168d3e4-8aed-493d-a10d-19364c9cd618' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Thunder in the Valley Games: town. Evidence: https://www.thunderinthevalleygames.com/
UPDATE organizations SET city = 'Bridgeport', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '06444a7e-c456-4801-affe-fda1f3062b80' AND (city IS NULL OR city = '');

-- VICTOR Community: website. Evidence: https://www.victorcommunity.org/
UPDATE organizations SET website_url = 'https://www.victorcommunity.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'dc6e664a-8e6b-5b95-96c6-93db18393ca3' AND website_url = 'https://www.victorcommunity.org/about';

-- Palmetto Front Line Foundation: website. Evidence: https://palmettofrontline.org/programs-services/
UPDATE organizations SET website_url = 'https://palmettofrontline.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '493796ac-0849-52e4-990b-9a48e3a66cfa' AND website_url = 'https://palmettofrontline.org/programs-services/';

-- Arizona Disabled Sports – Paralympic Sport Mesa: town. Evidence: http://www.arizonadisabledsports.com
UPDATE organizations SET city = 'Mesa', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '549a71f6-5100-4536-b6dc-7c1993d8cda7' AND (city IS NULL OR city = '');

-- Team River Runner Ft. Carson/Colorado Springs: town. Evidence: https://www.teamriverrunner.org/get-involved/chapters/colorado-ft-carsoncolorado-springs/
UPDATE organizations SET city = 'Colorado Springs', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c0b85653-26df-4309-bc45-e9e341f30a71' AND (city IS NULL OR city = '');

-- 5280 Challenge Games: website + town. Evidence: https://5280challenge.wixsite.com/5280challenge
UPDATE organizations SET website_url = 'https://5280challenge.wixsite.com/5280challenge', last_ok_at = NULL, city = 'Aurora', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'cd980fdb-6d0b-4c56-a34a-77edc7a29a53' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Next Step Archery – Northwest: website + town. Evidence: https://nextsteparchery.org/contact-us/
UPDATE organizations SET website_url = 'https://nextsteparchery.org/', last_ok_at = NULL, city = 'Mountlake Terrace', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5deb1847-dc09-486a-b34c-9d89eba02a60' AND website_url = 'https://www.nextsteparchery.org/' AND (city IS NULL OR city = '');

-- Corpus Christi RIMZ: website + town. Evidence: https://www.ccrimz.org/
UPDATE organizations SET website_url = 'https://www.ccrimz.org/', last_ok_at = NULL, city = 'Corpus Christi', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '35b06497-02ed-4130-9ed8-de32929ad371' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Disabled Shooting Services: website. Evidence: https://adaptiveshooting.nra.org/
UPDATE organizations SET website_url = 'https://adaptiveshooting.nra.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '512750d2-e5be-4943-a0df-08854575ea68' AND (website_url IS NULL OR website_url = '');

-- University of Maryland Rehabilitation & Orthopaedic Institute: website + town. Evidence: https://www.umms.org/rehab/health-services/adapted-sports
UPDATE organizations SET website_url = 'https://www.umms.org/rehab/health-services/adapted-sports', last_ok_at = NULL, city = 'Baltimore', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fe345d73-84b2-4edf-9bff-b577fcd6bcbf' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Special Olympics Louisiana: website. Evidence: https://specialolympicsla.org/contact/
UPDATE organizations SET website_url = 'https://specialolympicsla.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '94e46c00-f763-4b95-a44b-73237d2b533e' AND (website_url IS NULL OR website_url = '');

-- South Orlando Rowing Association: website + town. Evidence: https://www.soracrew.com/
UPDATE organizations SET website_url = 'https://www.soracrew.com/', last_ok_at = NULL, city = 'Orlando', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '47602422-aa3c-4c3b-af6e-3b6828bc0489' AND website_url = 'http://www.SORAcrew.com' AND (city IS NULL OR city = '');

-- University of Arizona: website + town. Evidence: https://adaptiveathletics.arizona.edu/
UPDATE organizations SET website_url = 'https://adaptiveathletics.arizona.edu/', last_ok_at = NULL, city = 'Tucson', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '66389716-ec48-42f2-8a9d-30fe5e1eb7d3' AND website_url = 'https://drc.arizona.edu/athletics' AND (city IS NULL OR city = '');

-- Cincinnati Dragons: website + town + state. Evidence: https://cincinnatidragons.com/
UPDATE organizations SET website_url = 'https://cincinnatidragons.com/', last_ok_at = NULL, city = 'Cincinnati', state = 'OH', state_name = 'Ohio', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a7182f71-2498-49f8-909b-32960ab2b1fc' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Special Olympics Swimming: website. Evidence: https://www.specialolympics.org/what-we-do/sports/swimming
UPDATE organizations SET website_url = 'https://www.specialolympics.org/what-we-do/sports/swimming', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '64801219-c684-4a51-a51c-2f4501aebb0d' AND (website_url IS NULL OR website_url = '');

-- Georgia Equine Rescue League: town. Evidence: https://gerlltd.org/
UPDATE organizations SET city = 'Bethlehem', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '89bdbf76-c923-5176-876a-1ec31c3af84b' AND (city IS NULL OR city = '');

-- Adaptive Action Sports, Inc.: website + town. Evidence: https://www.adacs.org/
UPDATE organizations SET website_url = 'https://www.adacs.org/', last_ok_at = NULL, city = 'Copper Mountain', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '18256a31-18a5-4d64-9a19-9f80b5b12e16' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Bennett Blazers: website + town. Evidence: https://www.kennedykrieger.org/community/initiatives/bennett-blazers/faqs
UPDATE organizations SET website_url = 'https://www.kennedykrieger.org/community/initiatives/bennett-blazers', last_ok_at = NULL, city = 'Baltimore', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8e778eb0-016e-4937-a7d3-557e6c8f0343' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Austin Blades Sled Hockey: website + town. Evidence: https://www.austinblades.net/about/
UPDATE organizations SET website_url = 'https://www.austinblades.net/', last_ok_at = NULL, city = 'Austin', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3f0058c9-3b22-4fc5-8996-ef6d105e82db' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- The Brain Group / Patriot Healing Initiative: town. Evidence: https://mybraingroup.org/contact-us
UPDATE programs SET city = 'McComb', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '97fddbd9-e273-55ff-9243-28292271dc5d' AND (city IS NULL OR city = '');

-- Oregon School of Arts / Lion & Poppy: town. Evidence: http://www.lionandpoppy.com/workshops/classes/2025/2/14/veterans-art-class-with-nicole-poole
UPDATE organizations SET city = 'Portland', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c8d9e8b0-de4f-58ff-aa40-33c69933b39e' AND (city IS NULL OR city = '');

-- VA Alaska Health Care: town. Evidence: https://www.va.gov/files/2026-01/Veterans%20Wellness%20Offerings%20update%201.12.26_0.pdf
UPDATE organizations SET city = 'Anchorage', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '58686921-81d3-52ac-89e8-acea49f34160' AND (city IS NULL OR city = '');

-- Higher Ground Sun Valley: website + town. Evidence: https://highergroundusa.org/
UPDATE organizations SET website_url = 'https://highergroundusa.org/', last_ok_at = NULL, city = 'Ketchum', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fd6c0539-b92f-424b-b085-8a555fa68bbf' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Long Island Sled Hockey: website + town + state. Evidence: https://lisledhockey.org/schedule
UPDATE organizations SET website_url = 'https://lisledhockey.org/', last_ok_at = NULL, city = 'Bethpage', state = 'NY', state_name = 'New York', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '500c3de5-980f-43d2-8233-cff216574e99' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Tri-State Wheelchair & Ambulatory Athletics: website. Evidence: http://www.tswaa.com/
UPDATE organizations SET website_url = 'http://www.tswaa.com/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7e1596c9-6b39-4f05-8ced-78f633818211' AND (website_url IS NULL OR website_url = '');

-- San Antonio ParaSports Spurs: website + town + state. Evidence: https://parasports.org/
UPDATE organizations SET website_url = 'https://parasports.org/', last_ok_at = NULL, city = 'San Antonio', state = 'TX', state_name = 'Texas', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7495a01f-d801-46ff-8b8c-8cf489f38940' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Easton Newberry Archery Center: website + town + state. Evidence: https://eastonnewberryarcherycenter.org/the-center
UPDATE organizations SET website_url = 'https://eastonnewberryarcherycenter.org/', last_ok_at = NULL, city = 'Newberry', state = 'FL', state_name = 'Florida', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '726a3edc-3f9c-4f7f-954f-fbbbc25d9bef' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Cerebral Palsy Association of Nassau County: website + town. Evidence: https://www.cpnassau.org/
UPDATE organizations SET website_url = 'https://www.cpnassau.org/', last_ok_at = NULL, city = 'Roosevelt', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a12b76ca-37b8-4184-ab74-35f2d66f366f' AND website_url = 'https://cpnassau.org/' AND (city IS NULL OR city = '');

-- Special Olympics Georgia: website. Evidence: https://www.specialolympicsga.org/
UPDATE organizations SET website_url = 'https://www.specialolympicsga.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a6098b20-d301-4326-97fd-41700a06e68a' AND (website_url IS NULL OR website_url = '');

-- Cincinnati VA Medical Center: website + town. Evidence: https://www.va.gov/cincinnati-health-care/
UPDATE organizations SET website_url = 'https://www.va.gov/cincinnati-health-care/', last_ok_at = NULL, city = 'Cincinnati', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8929dc63-aecd-4e38-9e69-9753bee64c24' AND website_url = 'http://www.cincinnati.va.gov' AND (city IS NULL OR city = '');

-- Special Olympics Michigan: website. Evidence: https://www.somi.org/contact
UPDATE organizations SET website_url = 'https://www.somi.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '338508f0-1a81-4294-ba5a-a3da45c1f512' AND (website_url IS NULL OR website_url = '');

-- USA Volleyball Sitting: website. Evidence: https://usavolleyball.org/play/about-sitting-volleyball/
UPDATE organizations SET website_url = 'https://usavolleyball.org/play/about-sitting-volleyball/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6ebaa15f-a454-41e2-8d78-6a9ca822036b' AND (website_url IS NULL OR website_url = '');

-- Golf 4 The Disabled: website + town. Evidence: https://golf4thedisabled.org/clinics
UPDATE organizations SET website_url = 'https://golf4thedisabled.org/', last_ok_at = NULL, city = 'Englewood', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8b57ceb4-08ec-44b7-9677-12577c7bdbc0' AND website_url = 'http://www.golf4thedisabled.org' AND (city IS NULL OR city = '');

-- Eagle Mount-Great Falls Sled Hockey: website + town. Evidence: https://www.greatfallsiceplex.com/general-9
UPDATE organizations SET website_url = 'https://www.greatfallsiceplex.com/general-9', last_ok_at = NULL, city = 'Great Falls', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a4d9a912-caf8-4c73-aa16-6dd492cc8d80' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Move United: town. Evidence: https://moveunitedsport.org/
UPDATE organizations SET city = 'Rockville', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6d8ad4d4-0077-4800-9317-c0e8370acd3c' AND (city IS NULL OR city = '');

-- University of Texas at Arlington: website + town + state. Evidence: https://www.uta.edu/student-affairs/movin-mavs/about
UPDATE organizations SET website_url = 'https://www.uta.edu/student-affairs/movin-mavs', last_ok_at = NULL, city = 'Arlington', state = 'TX', state_name = 'Texas', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd5443b0c-fce8-487e-8cea-dba235772899' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Unharnessed Potential: town. Evidence: https://www.unharnessedpotential.com/
UPDATE organizations SET city = 'Fountain', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c5716213-1b34-54e9-b8fb-0e81717088e9' AND (city IS NULL OR city = '');

-- Wheelchair Sports and Recreation Association: website + town. Evidence: http://www.wheelchairsportsandrecreation.com/contact/contact.htm
UPDATE organizations SET website_url = 'http://www.wheelchairsportsandrecreation.com/', last_ok_at = NULL, city = 'Destin', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '353fde71-5827-4e54-8244-7e6bc268783e' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- International Tennis Federation Wheelchair Tennis: website. Evidence: https://www.itftennis.com/en/tours/uniqlo-wheelchair-tennis-tour/
UPDATE organizations SET website_url = 'https://www.itftennis.com/en/tours/uniqlo-wheelchair-tennis-tour/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e3959a19-b9dc-42e3-b478-b5e90f657a58' AND (website_url IS NULL OR website_url = '');

-- Challenge America and Ellis County Veterans Treatment Court: website. Evidence: https://www.challengeamerica.com/workshops-events
UPDATE programs SET website_url = 'https://www.challengeamerica.com/workshops-events', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f9a90120-5586-5993-8754-d2d9e14e2a48' AND website_url = 'https://www.challengeamerica.com/';

-- South Coast Wheelchair Tennis Foundation: website + state. Evidence: https://www.southcoastwheelchairtennis.org/about-us
UPDATE organizations SET website_url = 'https://www.southcoastwheelchairtennis.org/', last_ok_at = NULL, state = 'MA', state_name = 'Massachusetts', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '12878910-ba14-4b4a-90c9-7645b6f61406' AND (website_url IS NULL OR website_url = '') AND (state IS NULL OR state = '');

-- Shepherd Lady Stealers (Women's Team): website + town. Evidence: https://shepherd.org/treatment/services-clinics/adaptive-sports/
UPDATE organizations SET website_url = 'https://shepherd.org/treatment/services-clinics/adaptive-sports/', last_ok_at = NULL, city = 'Atlanta', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b07b2716-923e-4f21-b303-e105a929c1d8' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Special Olympics Indiana: website + town. Evidence: https://soindiana.org/contact/
UPDATE organizations SET website_url = 'https://soindiana.org/', last_ok_at = NULL, city = 'Indianapolis', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0ed8f0d1-f46c-4f35-8f80-77ea10f69b82' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Challenged Athletes Foundation: website + town. Evidence: https://www.challengedathletes.org/
UPDATE organizations SET website_url = 'https://www.challengedathletes.org/', last_ok_at = NULL, city = 'San Diego', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '13ca8772-ecd6-4329-8072-d82670f558ef' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Therapeutic Riding, Inc.: website + town + state. Evidence: https://www.therapeuticridinginc.org/
UPDATE organizations SET website_url = 'https://www.therapeuticridinginc.org/', last_ok_at = NULL, city = 'Ann Arbor', state = 'MI', state_name = 'Michigan', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '551fbd1f-564f-4fc7-9713-471731d3f4cb' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Brooks Ballers: website + town + state. Evidence: https://brooksadaptivesports.org/
UPDATE organizations SET website_url = 'https://brooksadaptivesports.org/', last_ok_at = NULL, city = 'Jacksonville', state = 'FL', state_name = 'Florida', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0cf938a7-b679-4a34-b381-2529f6fa8be9' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Sports 4 the Blind: website + town. Evidence: https://www.sports4theblind.org/contact-us.html
UPDATE organizations SET website_url = 'https://www.sports4theblind.org/', last_ok_at = NULL, city = 'Spokane', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2a2080c9-a50d-4694-ba4a-86c674b1287d' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Rec2connect: website + town. Evidence: https://rec2connect.org/contact-us/
UPDATE organizations SET website_url = 'https://rec2connect.org/', last_ok_at = NULL, city = 'Independence', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2bc1110f-e614-4948-bd5d-8d163fb6eb89' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Adaptive Sports Ohio Varsity: website + town + state. Evidence: https://adaptivesportsohio.org/contact/
UPDATE organizations SET website_url = 'https://adaptivesportsohio.org/', last_ok_at = NULL, city = 'Wooster', state = 'OH', state_name = 'Ohio', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2cb9205c-29b3-40b0-93f6-771a17c9337a' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Move United Adaptive Shooting League: website. Evidence: https://moveunitedsport.org/mu-adaptive-shooting-league/
UPDATE organizations SET website_url = 'https://moveunitedsport.org/mu-adaptive-shooting-league/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'cdf72c62-2f16-4884-869b-e58331ba6b87' AND (website_url IS NULL OR website_url = '');

-- Lose the Training Wheels: website. Evidence: https://icanshine.org/
UPDATE organizations SET website_url = 'https://icanshine.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8c65d270-55bc-40c3-8af7-87d4be581bf1' AND (website_url IS NULL OR website_url = '');

-- Special Olympics Virginia: website + town. Evidence: https://www.specialolympicsva.org/
UPDATE organizations SET website_url = 'https://www.specialolympicsva.org/', last_ok_at = NULL, city = 'Richmond', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd90ca313-1860-4c43-af7c-d53e5230f970' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- ASPIRE Inc: website. Evidence: https://www.aspirenewyork.org/
UPDATE organizations SET website_url = 'https://www.aspirenewyork.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5ec63dc1-ea8d-4c12-97e2-8a7db1224143' AND (website_url IS NULL OR website_url = '');

-- Gaylord Sports Association: website + town + state. Evidence: https://sportsassociation.gaylord.org/
UPDATE organizations SET website_url = 'https://sportsassociation.gaylord.org/', last_ok_at = NULL, city = 'Wallingford', state = 'CT', state_name = 'Connecticut', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '51dcf29d-2c87-44ff-b08a-b2c75571cbca' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Adaptive Sports Partners: website + town + state. Evidence: https://adaptivesportspartners.org/
UPDATE organizations SET website_url = 'https://adaptivesportspartners.org/', last_ok_at = NULL, city = 'Littleton', state = 'NH', state_name = 'New Hampshire', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e0025a9b-27f3-4206-b4c6-bf85fd8c889d' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- CHI Health Immanuel Rehabilitation Institute: website + town. Evidence: https://www.chihealth.com/services/rehabilitation/outpatient-rehabilitation/sports-and-leisure-program
UPDATE organizations SET website_url = 'https://www.chihealth.com/services/rehabilitation/outpatient-rehabilitation/sports-and-leisure-program', last_ok_at = NULL, city = 'Omaha', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e607083d-a007-4541-84c9-3e650fdd4de4' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- University of Michigan Adaptive and Inclusive Sports Experience | UMAISE: website + town + state. Evidence: https://www.umadaptivesports.com/
UPDATE organizations SET website_url = 'https://www.umadaptivesports.com/', last_ok_at = NULL, city = 'Ann Arbor', state = 'MI', state_name = 'Michigan', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0d6f3110-4bd4-4684-83f4-b6e1debc6c4f' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Pittsburgh Steelwheelers: website + town. Evidence: https://www.steelwheelers.com/
UPDATE organizations SET website_url = 'https://www.steelwheelers.com/', last_ok_at = NULL, city = 'Pittsburgh', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '35b25dc8-b2e9-474a-9e7c-30b21af95385' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Bridge II Sports Pride - Varsity: website + town + state. Evidence: https://www.bridge2sports.org/
UPDATE organizations SET website_url = 'https://www.bridge2sports.org/', last_ok_at = NULL, city = 'Durham', state = 'NC', state_name = 'North Carolina', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9efb7c40-af78-403f-a760-03cfb23fe634' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- VAIL Harrisonburg Cardinals: website + town + state. Evidence: https://govail.org/vail-harrisonburg-cardinals/
UPDATE organizations SET website_url = 'https://govail.org/vail-harrisonburg-cardinals/', last_ok_at = NULL, city = 'Harrisonburg', state = 'VA', state_name = 'Virginia', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'dc19a00f-e224-424f-afbb-36d932b3110e' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Wisconsin Adaptive Sports Association: website + town. Evidence: https://www.wasa.org/
UPDATE organizations SET website_url = 'https://www.wasa.org/', last_ok_at = NULL, city = 'Brookfield', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6963d01e-faff-479e-8489-83fcb9e01ddb' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Warriors Soar: website + town + state. Evidence: https://warriorssoar.org/about/
UPDATE organizations SET website_url = 'https://warriorssoar.org/', last_ok_at = NULL, city = 'Shelburne', state = 'VT', state_name = 'Vermont', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '650c65cf-1d74-4fa5-b96b-a8bc4cf3d434' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Tucson Lobos Wheelchair Basketball: website + town. Evidence: https://www.soazadaptivesports.org/copy-of-programs-2
UPDATE organizations SET website_url = 'https://www.soazadaptivesports.org/copy-of-programs-2', last_ok_at = NULL, city = 'Tucson', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7367afae-2722-4672-8b8d-5eef9b4deef5' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Special Olympics North Carolina: website + town. Evidence: https://sonc.net/
UPDATE organizations SET website_url = 'https://sonc.net/', last_ok_at = NULL, city = 'Morrisville', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'af464baa-a54d-4565-a408-afe9d8ba5ad9' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Dreams in Motion, Inc.: website + town. Evidence: https://www.dreamsinmotioninc.com/
UPDATE organizations SET website_url = 'https://www.dreamsinmotioninc.com/', last_ok_at = NULL, city = 'Bismarck', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b567dc56-1957-4f28-b1a5-27c780e0adf1' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Gem State Falcons - DIII: website + town + state. Evidence: https://gemstatesports.org/
UPDATE organizations SET website_url = 'https://gemstatesports.org/', last_ok_at = NULL, city = 'Boise', state = 'ID', state_name = 'Idaho', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0f25a84c-5f86-4ac0-b239-5f54ac2bbf29' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Special Olympics Wisconsin: website + town. Evidence: https://specialolympicswisconsin.org/about/contact-us/
UPDATE organizations SET website_url = 'https://specialolympicswisconsin.org/', last_ok_at = NULL, city = 'Madison', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b8c16f89-c757-4c57-8664-2209ffa500e5' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Jimi Flowers Classic Swim Meet: website + town. Evidence: https://www.usparaswimming.org/jimi-flowers-classic-2026
UPDATE organizations SET website_url = 'https://www.usparaswimming.org/jimi-flowers-classic-2026', last_ok_at = NULL, city = 'Colorado Springs', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0e660c85-bc7e-420a-8967-17617dea148f' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Empire State Winter Games: website + town. Evidence: https://empirestatewintergames.com/games/
UPDATE organizations SET website_url = 'https://empirestatewintergames.com/', last_ok_at = NULL, city = 'Lake Placid', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '39eaabed-392a-47f3-b866-270898a663a2' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Denver Judo: website + town. Evidence: https://denverjudo.com/page/location
UPDATE organizations SET website_url = 'https://denverjudo.com/', last_ok_at = NULL, city = 'Denver', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3e012766-720a-4790-8798-6bc5882588d2' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Arizona Adaptive Watersports | AAWS: website + state. Evidence: https://www.azadaptivewatersports.org/
UPDATE organizations SET website_url = 'https://www.azadaptivewatersports.org/', last_ok_at = NULL, state = 'AZ', state_name = 'Arizona', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f1dbd4ed-6b67-49f9-8942-5ee78b28956e' AND (website_url IS NULL OR website_url = '') AND (state IS NULL OR state = '');

-- National Ability Center | NAC: website + town + state. Evidence: https://nationalabilitycenter.org/
UPDATE organizations SET website_url = 'https://nationalabilitycenter.org/', last_ok_at = NULL, city = 'Park City', state = 'UT', state_name = 'Utah', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b44de882-9103-45ff-953e-a6b51a22ada5' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '') AND (state IS NULL OR state = '');

-- Charlottesville Cardinals Wheelchair Basketball: website + town. Evidence: https://cardinalsbasketball.com/about/
UPDATE organizations SET website_url = 'https://cardinalsbasketball.com/', last_ok_at = NULL, city = 'Charlottesville', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c07eeec6-9e98-463c-a621-b5a11e994d4d' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- City of Boulder Parks & Rec EXPAND: website + town. Evidence: https://bouldercolorado.gov/services/expand
UPDATE organizations SET website_url = 'https://bouldercolorado.gov/services/expand', last_ok_at = NULL, city = 'Boulder', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '12ccbe09-38ef-4341-9e21-cc1223f0e5bb' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Camp Abilities Brockport: website + town. Evidence: https://www.campabilities.org/
UPDATE organizations SET website_url = 'https://www.campabilities.org/', last_ok_at = NULL, city = 'Brockport', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fab8586d-d3a7-4663-9ecf-5d01fbc3871a' AND (website_url IS NULL OR website_url = '') AND (city IS NULL OR city = '');

-- Abilities Unlimited of the Carolinas: town from the address on its own website (http://www.aucarolinas.org).
UPDATE organizations SET city = 'Charlotte', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3d84c995-1d59-4b14-85ca-2a5f7010a10a' AND (city IS NULL OR city = '');

-- Access Mammoth: town from the address on its own website (https://accessmammoth.org/).
UPDATE organizations SET city = 'Mammoth Lakes', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b1928916-d445-48f1-8995-d30ce0993cd0' AND (city IS NULL OR city = '');

-- Adaptive Fusion Dragon Boat Club: town from the address on its own website (https://www.adaptivefusion.org/).
UPDATE organizations SET city = 'Long Beach', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '56b8d00d-55ea-4242-8b1a-6936e0594002' AND (city IS NULL OR city = '');

-- Adaptive Sports Northwest – Portland: town from the address on its own website (http://www.adaptivesportsnw.org/).
UPDATE organizations SET city = 'Portland', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '26e936a3-623b-48e2-b250-7256825dcb82' AND (city IS NULL OR city = '');

-- All Out Adventures: town from the address on its own website (http://www.alloutadventures.org).
UPDATE organizations SET city = 'Northampton', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '38e161d3-36c3-46c8-9e66-358c63c44692' AND (city IS NULL OR city = '');

-- Bay Area Association of Disabled Sailors: town from the address on its own website (http://www.baads.org).
UPDATE organizations SET city = 'San Francisco', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '381ebfaf-21b0-4553-ba00-196b7d77ae58' AND (city IS NULL OR city = '');

-- Charles T. Sitrin Health Care Center: town from the address on its own website (http://www.sitrin.com).
UPDATE organizations SET city = 'New Hartford', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9f602c7a-fd1e-4592-b39f-680b2b4927eb' AND (city IS NULL OR city = '');

-- CHD’s Disability Resources: town from the address on its own website (https://chd.org/programs-services/community-care-support/recreational-activities-for-disabled-adults/).
UPDATE organizations SET city = 'Springfield', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd15cfee4-946e-44f2-a71b-d3ca6d4057a3' AND (city IS NULL OR city = '');

-- Cincinnati Recreation Commission: town from the address on its own website (https://www.cincinnati-oh.gov/recreation/latest-news-events/crc-spotlight/cincinnati-paralympic-sports-club/).
UPDATE organizations SET city = 'Cincinnati', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5c54c566-679d-44e2-af88-91389c727c39' AND (city IS NULL OR city = '');

-- City of Boise Adaptive Recreation: town from the address on its own website (https://www.cityofboise.org/departments/parks-and-recreation/adaptive-recreation/).
UPDATE organizations SET city = 'Boise', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a1177699-e933-4de0-bbe3-628c8eeab71a' AND (city IS NULL OR city = '');

-- City of Boulder EXPAND: town from the address on its own website (https://bouldercolorado.gov/services/expand).
UPDATE organizations SET city = 'Boulder', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'dd9cdf52-2a34-47eb-9045-34143f8a1648' AND (city IS NULL OR city = '');

-- City of Lake Jackson Parks & Recreation: town from the address on its own website (http://www.lakejackson-tx.gov/).
UPDATE organizations SET city = 'Lake Jackson', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '956cc279-f0a6-4038-8b75-dfa81eb59003' AND (city IS NULL OR city = '');

-- City of Las Vegas Adaptive Recreation: town from the address on its own website (https://www.lasvegasnevada.gov/).
UPDATE organizations SET city = 'Las Vegas', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd5124a56-5851-43b3-8c7e-9a387e474597' AND (city IS NULL OR city = '');

-- City of Pasadena – Verne Cox Center: town from the address on its own website (https://www.pasadenatx.gov/189/Adaptive-Recreation).
UPDATE organizations SET city = 'Pasadena', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8e7ca741-5358-427d-a008-87a52ce99f76' AND (city IS NULL OR city = '');

-- City of Phoenix Adaptive Recreation (Daring Adventures): town from the address on its own website (https://www.phoenix.gov/parks/adaptive-recreation).
UPDATE organizations SET city = 'Phoenix', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9c0053e7-479f-415f-97ac-1c277cffac95' AND (city IS NULL OR city = '');

-- Community Boating, Inc.: town from the address on its own website (http://www.community-boating.org).
UPDATE organizations SET city = 'Boston', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b41ecdcc-07ce-49e9-9244-f8f4417b328b' AND (city IS NULL OR city = '');

-- DREAM Adaptive Recreation, Inc.: town from the address on its own website (http://www.dreamadaptive.org).
UPDATE organizations SET city = 'Whitefish', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '70771ff4-609d-4f2d-863f-decbb2707c92' AND (city IS NULL OR city = '');

-- Fencing Institute of Texas: town from the address on its own website (https://fenceintexas.org/).
UPDATE organizations SET city = 'Carrollton', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '14c05816-e943-4f39-8632-c8f4e74b6e0b' AND (city IS NULL OR city = '');

-- Fox Valley Special Recreation Association: town from the address on its own website (http://www.fvsra.org).
UPDATE organizations SET city = 'Aurora', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd408e015-7663-4986-a244-6862f5b8b489' AND (city IS NULL OR city = '');

-- Frazier Rehabilitation Hospital – Louisville: town from the address on its own website (https://uoflhealth.org/locations/frazier-rehabilitation-institute/).
UPDATE organizations SET city = 'Louisville', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'afe1021c-0e26-420a-bf1c-b8a2ead8ca6c' AND (city IS NULL OR city = '');

-- Georgia Blind Sports Association: town from the address on its own website (https://www.gablindsports.org/).
UPDATE organizations SET city = 'Smyrna', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ecc745d4-058f-4cb7-bd01-6499bcbf7211' AND (city IS NULL OR city = '');

-- Green Mountain Adaptive Sports: town from the address on its own website (https://greenmtnadaptive.org/).
UPDATE organizations SET city = 'Hyde Park', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a39cd654-56bf-4d3c-996b-5b5ef4a51d01' AND (city IS NULL OR city = '');

-- Helen Hayes Rehabilitation Hospital: town from the address on its own website (http://helenhayeshospital.org).
UPDATE organizations SET city = 'West Haverstraw', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '054f4a64-34b5-422d-8607-ae6fda3905d5' AND (city IS NULL OR city = '');

-- Helen Woodward Animal Center Therapeutic Riding: town from the address on its own website (http://www.animalcenter.org/therapeuticriding/).
UPDATE organizations SET city = 'Rancho Santa Fe', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fa4f5c71-e175-4fa4-945b-4a4290849f76' AND (city IS NULL OR city = '');

-- High Country Adaptive Sports: town from the address on its own website (https://highcountryadaptive.org/).
UPDATE organizations SET city = 'Flagstaff', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3fd30c54-ce35-44f1-b288-91a9b70cedba' AND (city IS NULL OR city = '');

-- Ignite Adaptive Sports: town from the address on its own website (http://IgniteAdaptiveSports.org).
UPDATE organizations SET city = 'Boulder', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'efe5ec4d-05ba-4328-813b-ad6440c1b50a' AND (city IS NULL OR city = '');

-- Lakeshore Foundation – Paralympic Sport Birmingham: town from the address on its own website (http://www.lakeshore.org).
UPDATE organizations SET city = 'Birmingham', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b8a8f78f-8b58-4638-a46f-afa4b5a6f96b' AND (city IS NULL OR city = '');

-- Lakeshore Junior Wheelchair Basketball: town from the address on its own website (https://www.lakeshore.org/?s=wheelchair+basketball).
UPDATE organizations SET city = 'Birmingham', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9105aab9-cb93-4272-b5db-9af5ecd81d29' AND (city IS NULL OR city = '');

-- Lincolnway Special Recreation Association: town from the address on its own website (http://www.lwsra.org).
UPDATE organizations SET city = 'New Lenox', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8e0ad448-76b2-465f-94a1-eb81bd29a676' AND (city IS NULL OR city = '');

-- Madison School & Community Recreation: town from the address on its own website (https://www.mscr.org/our-programs/adapted-recreation).
UPDATE organizations SET city = 'Madison', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '070f57df-48e5-4d54-a407-1f7d498b11f6' AND (city IS NULL OR city = '');

-- Maine Adaptive Sports & Recreation: town from the address on its own website (http://www.maineadaptive.org).
UPDATE organizations SET city = 'Newry', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9c6141d8-4b6c-473e-8bf7-7bb16d44debe' AND (city IS NULL OR city = '');

-- Maine-Niles Association of Special Recreation: town from the address on its own website (http://www.mnasr.org).
UPDATE organizations SET city = 'Morton Grove', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4c700811-51d7-47c1-af8d-d03fae1adbee' AND (city IS NULL OR city = '');

-- Miami Beach Watersports Center – Paralympic Sport South Florida: town from the address on its own website (http://www.rowmiamibeach.com).
UPDATE organizations SET city = 'Miami Beach', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c84cfa55-3b53-4c2d-880f-e3c4a4733f15' AND (city IS NULL OR city = '');

-- Midwest Adaptive Sports (Kansas City): town from the address on its own website (https://www.midwestadaptivesports.org/).
UPDATE organizations SET city = 'Kansas City', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f5ddbea5-747b-4b2b-8d0b-647a24f7fe14' AND (city IS NULL OR city = '');

-- Milwaukee Recreation Department: town from the address on its own website (https://milwaukeerecreation.net/rec/Programs/Adaptive-Athletics.htm).
UPDATE organizations SET city = 'Milwaukee', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '92e504de-835e-4f9a-bd87-b17714b7f832' AND (city IS NULL OR city = '');

-- Northeast Disabled Athletic Association – Burlington: town from the address on its own website (http://www.disabledathletics.org).
UPDATE organizations SET city = 'Burlington', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'dd9c4b9b-a3d4-4e09-bc88-0c233f5e9adf' AND (city IS NULL OR city = '');

-- Northeast DuPage Special Recreation Association: town from the address on its own website (http://www.nedsra.org).
UPDATE organizations SET city = 'Addison', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '460d2164-873f-4901-924f-4ae5a59b653b' AND (city IS NULL OR city = '');

-- Operation Surf: town from the address on its own website (https://operationsurf.org/).
UPDATE organizations SET city = 'San Luis Obispo', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4248d97d-b9a3-4d03-a738-079a98c97eeb' AND (city IS NULL OR city = '');

-- Ozark Adaptive Sports Association (OzASA): town from the address on its own website (https://www.ozasa.org/).
UPDATE organizations SET city = 'Rogers', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'aa92d8a4-c704-47d8-bf22-976b9623259a' AND (city IS NULL OR city = '');

-- Paradox Sports: town from the address on its own website (http://paradoxsports.org/).
UPDATE organizations SET city = 'Boulder', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '599d8bab-9a37-4cc4-a103-713f0470b05b' AND (city IS NULL OR city = '');

-- Pennsylvania Center For Adapted Sports – Philadelphia: town from the address on its own website (http://www.centeronline.com).
UPDATE organizations SET city = 'Philadelphia', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '94a8261c-acb2-4b2c-85f0-1099dbed8f9e' AND (city IS NULL OR city = '');

-- Piers Park Sailing Center – Boston: town from the address on its own website (http://www.piersparksailing.org).
UPDATE organizations SET city = 'Boston', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'af293c1f-647b-4ca5-abdf-4772c2b02038' AND (city IS NULL OR city = '');

-- Powered to Move: town from the address on its own website (http://www.poweredtomove.org/).
UPDATE organizations SET city = 'Allen', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ec067c07-0840-48e1-8fcb-a1ac55fa35b1' AND (city IS NULL OR city = '');

-- Riekes Center for Human Enhancement: town from the address on its own website (http://www.Riekes.org).
UPDATE organizations SET city = 'Menlo Park', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd7b9e35a-b919-4bce-ae05-4355ce8a5c82' AND (city IS NULL OR city = '');

-- Sail To Prevail – Newport: town from the address on its own website (https://sailtoprevail.org/).
UPDATE organizations SET city = 'Newport', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e6f4f91a-7a0d-49a7-a19a-ac56acc992cd' AND (city IS NULL OR city = '');

-- Salute Military Golf Association: town from the address on its own website (http://www.smga.org).
UPDATE organizations SET city = 'Silver Spring', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '72d00e55-dbaa-4e7c-ab2f-55cecb9a8ed5' AND (city IS NULL OR city = '');

-- San Diego District Tennis Association: town from the address on its own website (http://www.sandiegotennis.com).
UPDATE organizations SET city = 'San Diego', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '250fd612-ddcc-413e-8761-d3a76e89c76c' AND (city IS NULL OR city = '');

-- Sea Scout Base Galveston Community Sailing: town from the address on its own website (https://ssbgalveston.org/).
UPDATE organizations SET city = 'Galveston', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f4df1f40-2a04-488a-b418-3d52f18dfa60' AND (city IS NULL OR city = '');

-- Seattle Storm (Women’s Team): town from the address on its own website (http://www.seattleadaptivesports.org/basketball.html).
UPDATE organizations SET city = 'Seattle', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9d23ed9c-e53b-400c-ae3c-93c4325e2a8e' AND (city IS NULL OR city = '');

-- Shared Adventures: town from the address on its own website (http://www.sharedadventures.org).
UPDATE organizations SET city = 'Santa Cruz', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'dbfc2e34-9b01-4197-9ec5-5246f1e58197' AND (city IS NULL OR city = '');

-- Shifting Gears United: town from the address on its own website (https://www.shiftinggearsunited.org/).
UPDATE organizations SET city = 'Tequesta', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'eda805fb-8fa2-4104-a9a7-c3483b49eba4' AND (city IS NULL OR city = '');

-- Shirley Ryan AbilityLab: town from the address on its own website (https://www.sralab.org/).
UPDATE organizations SET city = 'Chicago', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '96f7d490-3dc7-4298-81bc-a5887e50d547' AND (city IS NULL OR city = '');

-- S.M.C.L Foundation & Associates – New Orleans: town from the address on its own website (https://smclf.org/).
UPDATE organizations SET city = 'New Orleans', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2a896d48-7144-44b7-b58e-cd6f45659343' AND (city IS NULL OR city = '');

-- South East Association for Special Parks and Recreation: town from the address on its own website (http://www.seaspar.org).
UPDATE organizations SET city = 'Downers Grove', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a33bd5c0-0636-4e53-8b27-76cfbee7ec5e' AND (city IS NULL OR city = '');

-- Springfield-Greene County Park Board – Springfield: town from the address on its own website (https://www.parkboard.org/334/Accessible-Recreation).
UPDATE organizations SET city = 'Springfield', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'bcfeaaa9-caf3-4e2b-8dd7-b0483f4a6f0c' AND (city IS NULL OR city = '');

-- STRIDE Adaptive Sports: town from the address on its own website (http://www.stride.org).
UPDATE organizations SET city = 'West Sand Lake', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '37f5416f-53de-4c3d-bd6f-582f84326a31' AND (city IS NULL OR city = '');

-- Team River Runner Denver: town from the address on its own website (https://www.teamriverrunner.org/get-involved/chapters/colorado-denver/).
UPDATE organizations SET city = 'Denver', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f6b1795d-0e90-46ce-bbfd-c306d708702b' AND (city IS NULL OR city = '');

-- Team River Runner – St. Louis: town from the address on its own website (https://www.teamriverrunner.org/get-involved/chapters/missouri-st-louis/).
UPDATE organizations SET city = 'St. Louis', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'cb6e1b97-2dd7-453f-be48-95cd413e578d' AND (city IS NULL OR city = '');

-- Telluride Adaptive Sports: town from the address on its own website (http://www.tellurideadaptivesports.org).
UPDATE organizations SET city = 'Telluride', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3888493f-6271-4d91-8d8e-fbcb0b269f51' AND (city IS NULL OR city = '');

-- Texas Regional Paralympic Sport: town from the address on its own website (https://www.lonestarparalysis.org/trps).
UPDATE organizations SET city = 'Austin', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6737bbd4-eb7b-46bf-b826-bb017e6f7d5a' AND (city IS NULL OR city = '');

-- Texas Rowing for All – Austin: town from the address on its own website (http://www.texasrowingforall.org/).
UPDATE organizations SET city = 'Austin', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '65e6dc04-b819-4bce-be76-c1e1c4db2511' AND (city IS NULL OR city = '');

-- The Center for Individuals with Physical Challenges – Tulsa: town from the address on its own website (http://www.tulsacenter.org).
UPDATE organizations SET city = 'Tulsa', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '887e676e-dad9-4ea2-b9e8-b2a64698c48a' AND (city IS NULL OR city = '');

-- Three Rivers Adaptive Sports: town from the address on its own website (http://www.traspa.org).
UPDATE organizations SET city = 'Pittsburgh', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5a588372-96ef-4ffb-8cfb-331be62a9837' AND (city IS NULL OR city = '');

-- Three Rivers Rowing Association: town from the address on its own website (https://www.threeriversrowing.org/adaptive-para).
UPDATE organizations SET city = 'Pittsburgh', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '21fb5f24-2f5c-4582-8909-188d4aeff192' AND (city IS NULL OR city = '');

-- Timpany Center, San Jose: town from the address on its own website (http://www.sjsu.edu/timpany/).
UPDATE organizations SET city = 'San Jose', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '268782cb-38e8-4d70-b7df-1fb87927a7a3' AND (city IS NULL OR city = '');

-- Unite 2 Fight Paralysis: town from the address on its own website (https://u2fp.org).
UPDATE organizations SET city = 'Minneapolis', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '255ef72e-1313-4225-afed-632fd5d4d9e0' AND (city IS NULL OR city = '');

-- University of Maryland Rehab & Orthopaedic Institute: town from the address on its own website (https://www.umms.org/rehab/health-services/adapted-sports).
UPDATE organizations SET city = 'Baltimore', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'af4a8a64-91f6-4ca6-a9ea-852409b0d4c5' AND (city IS NULL OR city = '');

-- University of Texas Arlington – Movin’ Mavs: town from the address on its own website (https://www.uta.edu/student-affairs/movin-mavs/recreation/adaptive-athletics).
UPDATE organizations SET city = 'Arlington', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8e3e2baf-0123-41bc-b739-78a59a05fe30' AND (city IS NULL OR city = '');

-- Western DuPage Special Recreation Association: town from the address on its own website (https://www.wdsra.com/wdsra-programs/adaptive-sports/).
UPDATE organizations SET city = 'Carol Stream', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '816e8345-d7b6-4952-97c6-0dbadb1b6626' AND (city IS NULL OR city = '');

-- West Suburban Special Recreation: town from the address on its own website (http://www.wssra.net).
UPDATE organizations SET city = 'Franklin Park', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '88a251a6-26b2-4c84-ac78-e71575baf73b' AND (city IS NULL OR city = '');

-- Youth Challenge: town from the address on its own website (http://www.youthchallengesports.com).
UPDATE organizations SET city = 'Westlake', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7a0b845b-e815-4b3b-8ab4-9c91d1e1b096' AND (city IS NULL OR city = '');

-- Alabama Veteran: town from the address on its own website (https://alabamaveteran.org/warrior-retreat/).
UPDATE organizations SET city = 'Birmingham', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '75b6714f-0a6a-5a44-ae83-a1dad5f97434' AND (city IS NULL OR city = '');

-- Camaraderie Foundation: town from the address on its own website (https://www.camaraderiefoundation.org/counseling-services/).
UPDATE organizations SET city = 'Orlando', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9477d194-7245-5fd2-b201-5f86f8d87a90' AND (city IS NULL OR city = '');

-- United Way of West Florida / 211 Northwest Florida: town from the address on its own website (https://www.uwwf.org/211).
UPDATE organizations SET city = 'Pensacola', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a0b1ecf7-c0bc-5c63-9aee-5aec0837f239' AND (city IS NULL OR city = '');

-- VA Pacific Islands Health Care: town from the address on its own website (https://www.va.gov/pacific-islands-health-care/).
UPDATE organizations SET city = 'Honolulu', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6e304ee2-407c-5b62-ab99-a76bb497a542' AND (city IS NULL OR city = '');

-- Maryland Park Service / Warrior Hike: town from the address on its own website (https://dnr.maryland.gov/publiclands/pages/walk-off-the-war.aspx).
UPDATE organizations SET city = 'Annapolis', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'dc48efcf-c953-5d4d-b577-29dac239759a' AND (city IS NULL OR city = '');

-- Michigan Operation Freedom Outdoors: town from the address on its own website (https://miofo.org/).
UPDATE organizations SET city = 'Livonia', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '883ad8bd-0cd0-57ef-830d-254906c66d90' AND (city IS NULL OR city = '');

-- NAMI Missouri: town from the address on its own website (https://namimissouri.org/P2P).
UPDATE organizations SET city = 'Jefferson City', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a579ced2-7c34-5bc5-b9c7-29c396be7b19' AND (city IS NULL OR city = '');

-- Veteran Hope Alliance: town from the address on its own website (https://veteranhopealliance.org/).
UPDATE organizations SET city = 'Mendon', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2ce7d43e-c8dd-5a00-87f9-fbc76028e8b0' AND (city IS NULL OR city = '');

-- Mental Health Association in New Jersey: town from the address on its own website (https://www.mhanj.org/veteransmhaoc/).
UPDATE organizations SET city = 'Springfield', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6b96539c-2cb6-5242-a857-ecd274d63888' AND (city IS NULL OR city = '');

-- SPARK! Creative Lab: town from the address on its own website (https://sparklahoma.org/get-involved).
UPDATE organizations SET city = 'Oklahoma City', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd7413d5e-d492-5de7-bdd5-bf057b4d0719' AND (city IS NULL OR city = '');

-- Therapeutic Recreational Group: town from the address on its own website (https://www.therapeuticrg.org/).
UPDATE organizations SET city = 'FLOWER MOUND', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '25897a00-04e9-55e4-90b4-1c2f3d8c4331' AND (city IS NULL OR city = '');

-- Texas Panhandle Centers: town from the address on its own website (https://www.texaspanhandlecenters.org/veterans-services-program/).
UPDATE organizations SET city = 'Amarillo', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6109493b-2b99-5ae8-bee6-32182191b5f3' AND (city IS NULL OR city = '');

-- Continue Mission: town from the address on its own website (https://www.continuemission.org/).
UPDATE organizations SET city = 'Woods Cross', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a29de9a8-c76a-5868-8dc7-7ed542385816' AND (city IS NULL OR city = '');

-- Washington Department of Veterans Affairs: town from the address on its own website (https://dva.wa.gov/vcc).
UPDATE organizations SET city = 'Olympia', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6ed4fac3-305d-5115-a667-3119d90345fe' AND (city IS NULL OR city = '');

-- Pendleton County Hunters Who Help Wounded Outdoors: town from the address on its own website (https://www.phwwo.com/about-us).
UPDATE organizations SET city = 'Buckhannon', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e719962f-e7f9-5e55-9310-9b132b8f2ddb' AND (city IS NULL OR city = '');

-- Warrior Restoration Ranch: town from the address on its own website (https://www.warriorrestorationranch.org/).
UPDATE organizations SET city = 'Green Bay', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2a095006-78f8-5475-ae51-98e6dc75e437' AND (city IS NULL OR city = '');

-- Eastern Colorado VA Health Care System: town from the address on its own website (https://www.va.gov/eastern-colorado-health-care/).
UPDATE organizations SET city = 'Aurora', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c2ad1d8e-00d5-5732-9683-d69c932b6ec7' AND (city IS NULL OR city = '');

-- Crossroads Corral: town from the address on its own website (https://crossroadscorral.org/).
UPDATE organizations SET city = 'Sanford', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9de685eb-b25b-5cfb-84a3-5394998b37ec' AND (city IS NULL OR city = '');

-- Returning Veterans Project: town from the address on its own website (https://returningveterans.org/).
UPDATE organizations SET city = 'Portland', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2bddcf25-b86b-5d4a-b607-be6117b5106e' AND (city IS NULL OR city = '');

-- Mustang 2nd Chance Foundation: town from the address on its own website (https://www.mustang2ndchancefoundation.org/).
UPDATE organizations SET city = 'Lorena', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2b9eb3ca-faeb-5608-89b4-55f31ad68ace' AND (city IS NULL OR city = '');

-- A Broken Spur Riding Academy: town from the address on its own website (https://iserve.wvu.edu/agency/detail/?agency_id=177493).
UPDATE organizations SET city = 'Beaver', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8e7ced8d-df51-58b9-abe2-8f9d5f5dbe15' AND (city IS NULL OR city = '');

-- Artahoochee: town from the address on its own website (https://www.artahoochee.org/).
UPDATE organizations SET city = 'Columbus', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5df146ab-eeda-52fb-9e6d-31243a2eeeb8' AND (city IS NULL OR city = '');

-- New Hampshire Humanities: town from the address on its own website (https://www.nhhumanities.org/news/to-tell-what-they-canrsquot-say-journalism-workshop-for-nh-veterans).
UPDATE organizations SET city = 'Concord', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4e0e3f1e-1ba4-52c9-802a-f841d791bcbc' AND (city IS NULL OR city = '');

-- New Hampshire Writers' Project: town from the address on its own website (https://nhwritersproject.org/Veterans).
UPDATE organizations SET city = 'Bedford', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '1b570ed3-0b83-56fc-8912-c59cc00d0fc5' AND (city IS NULL OR city = '');

-- New Jersey Council for the Humanities / Atlantic Cape Community College: town from the address on its own website (https://njhumanities.org/programs/clemente-course/).
UPDATE organizations SET city = 'Camden', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0b75e74c-502f-5d82-a151-5828768ae6d3' AND (city IS NULL OR city = '');

-- Visual Arts Center of New Jersey: town from the address on its own website (https://www.artcenternj.org/programs/arts-and-healing/).
UPDATE organizations SET city = 'Summit', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3a875e60-daa2-5344-816e-8dd6d108ca09' AND (city IS NULL OR city = '');

-- Waypoint Adventure: town from the address on its own website (https://waypointadventure.org/).
UPDATE organizations SET city = 'Black Mountain', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ada2ce78-640d-4c7a-b157-0f226645e35b' AND (city IS NULL OR city = '');

-- Bay Area Outreach & Recreation Program: town from the address on its own website (http://www.borp.org).
UPDATE programs SET city = 'Berkeley', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '349cac28-0917-4bc5-8d55-495825ed20ba' AND (city IS NULL OR city = '');

-- Pineland Farms VAST Program: town from the address on its own website (https://pinelandfarms.org/recreation/vast/).
UPDATE programs SET city = 'New Gloucester', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '84c9fe29-035f-4444-9587-f97820a2d190' AND (city IS NULL OR city = '');

-- Rehabilitation Hospital of Indiana (RHI) Sports Program – Indianapolis: town from the address on its own website (https://www.rhirehab.com/our-programs/community-reintegration/adaptive-sports-program/).
UPDATE programs SET city = 'Indianapolis', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '77b77320-1cb7-4f88-b334-926a08d508ed' AND (city IS NULL OR city = '');

-- Alaska Vet Centers: town from the address on its own website (https://veterans.alaska.gov/benefits/vet-centers/).
UPDATE programs SET city = 'Anchorage', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5bb65c24-afe2-5b68-8808-e9242c45f7b4' AND (city IS NULL OR city = '');

-- Mecklenburg County Park and Recreation Therapeutic & Inclusive Recreation: town from the address on its own website (https://parkandrec.mecknc.gov/Activities/therapeutic-recreation-activities).
UPDATE programs SET city = 'Charlotte', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '34f3e363-7b2e-4541-a6fa-0fb305af1d91' AND (city IS NULL OR city = '');

-- Idaho Horse Therapy / Wildfire Intensive Healing: town from the address on its own website (https://idahohorsetherapy.com/).
UPDATE programs SET city = 'Shoshone', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2bb51342-9918-5948-b70a-1296ac7bda34' AND (city IS NULL OR city = '');

-- Warriors Welcome: town from the address on its own website (https://www.mhanj.org/veteransmhaoc/).
UPDATE programs SET city = 'Springfield', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e647e9aa-c558-5de9-977a-881b345ef1f7' AND (city IS NULL OR city = '');

-- Veteran creative expression projects: town from the address on its own website (https://sparklahoma.org/get-involved).
UPDATE programs SET city = 'Oklahoma City', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ba2a0048-ad78-5c72-ae2f-9803a12f2d05' AND (city IS NULL OR city = '');

-- Veterans Conservation Corps: town from the address on its own website (https://dva.wa.gov/vcc).
UPDATE programs SET city = 'Olympia', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '93034435-c188-5e62-aeb4-d5b166e4b0d4' AND (city IS NULL OR city = '');


-- ===== descriptions_002_approved.sql
-- docs/data-fixes/descriptions-approved.md. Approved by Alec on 2026-10-21 (315 drafts, read back unchanged from the review docs).
-- Fills a description only where none exists, so it is safe to run twice and never replaces someone else's text.

-- Adaptive Sports at Mount Snow | ASMS
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; bi skiing; Special Olympics ski team. Athletes served: People of all ages with physical, cognitive and sensory disabilities, including students with disabilities through school programs.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '34380ebf-bf06-4de7-800f-d4f4a60d6d0b' AND (description IS NULL OR description = '');

-- Adaptive Sports Foundation
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; sit skiing; snowboarding; ski and snowboard racing; skateboarding; kayaking; canoeing; paddle boarding; swimming; mountain biking; hiking; soccer; basketball; golf; virtual fitness classes. Athletes served: Children and adults with physical and cognitive disabilities and chronic illnesses, ages 5 and up for ski lessons, including people with autism, amputations, cerebral palsy, paralysis and traumatic brain injury.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '90485a4a-7a41-45b9-8d59-ede3ac7e3cae' AND (description IS NULL OR description = '');

-- Black Hills Regional Ski for Light, Inc.
UPDATE organizations SET description = 'Sports and activities: Cross country skiing; downhill skiing; snowshoeing; snowmobiling; cycling; canoeing; kayaking; boating; fishing; hiking. Athletes served: People of all ages who are blind or have low vision or who have mobility disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '728c099c-a7d8-4d8d-ac11-3ee14ab6b071' AND (description IS NULL OR description = '');

-- Blue Ridge Adaptive Snow Sports (BRASS)
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; sit skiing; snowboarding; ski biking. Athletes served: People of all ages with disabilities, including mobility, cognitive, vision and hearing disabilities, autism, Down syndrome, cerebral palsy, spinal cord injury, multiple sclerosis and amputation.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '84a1a725-593d-49e1-9b5d-7c2b46373cd8' AND (description IS NULL OR description = '');

-- Boise Adaptive Snowsport Education | BASE
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; sit skiing; snowboarding. Athletes served: People with physical or cognitive disabilities who need adaptive instruction to ski or snowboard.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f991223c-e3af-4148-a918-5f09e0b19c88' AND (description IS NULL OR description = '');

-- Cannonsburg Challenged Ski Association
UPDATE organizations SET description = 'Sports and activities: Downhill skiing; mono skiing; bi skiing. Athletes served: People ages 6 and older with physical, developmental and learning disabilities, including people who are deaf, hard of hearing, blind or have low vision, and people with paraplegia, quadriplegia or high level amputations.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'adbc8084-0adf-45d6-81a0-4232ed6779b8' AND (description IS NULL OR description = '');

-- Central Cross Country Ski Association – Madison
UPDATE organizations SET description = 'Sports and activities: Cross country skiing; sit skiing; ski racing; biathlon; target shooting; strength training. Athletes served: Youth and adults with physical disabilities or visual impairments, children with disabilities at introductory clinics, race athletes ages 20 and under, and veterans and service members with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9d37cd88-0261-4f84-9f1b-a9698acee719' AND (description IS NULL OR description = '');

-- Challenge Aspen
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; Nordic skiing; snowshoeing; ice skating; tubing; dogsledding; stand up paddleboarding; cycling; mountain biking; hiking; camping; ropes course; fishing; archery; horseback riding; sailing; whitewater rafting; swimming; bowling; music and dance camp. Athletes served: People of all ages with cognitive or physical disabilities, and veterans and active duty service members with service connected disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f28a3bb7-6e25-42b0-90af-db583ffd0673' AND (description IS NULL OR description = '');

-- Eagle Mount Billings
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; cross country skiing; snowshoeing; climbing; cycling; golf; horsemanship; group fitness; summer day camps. Athletes served: Children and adults with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'feb18991-7382-4f49-bcac-dc84b26f0582' AND (description IS NULL OR description = '');

-- Eagle Mount Bozeman
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; cross country skiing; snowshoeing; ice skating; cycling; mountain biking; climbing; hiking; rafting; kayaking; fishing; horseback riding; swimming; arts; horticulture. Athletes served: Children, youth and adults with physical, developmental, cognitive or sensory disabilities, young people with cancer, and veterans with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c7cccde6-1b05-46d5-9f80-ce501f45799a' AND (description IS NULL OR description = '');

-- Eagle Mount Great Falls
UPDATE organizations SET description = 'Sports and activities: Skiing; snowboarding; horseback riding; equine assisted learning; animal activities; paddle sports; sled hockey. Athletes served: Children and adults with physical, developmental, behavioral or mental disabilities, plus inclusive toddler activities for ages 1 to 5.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'dad64d2f-9967-4c69-b3cf-e2b46e138dc4' AND (description IS NULL OR description = '');

-- Foresight Ski Guides, Inc.
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; hiking; stand up paddleboarding; kayaking; swimming; rafting; horseback riding; rock climbing. Athletes served: Youth and adults who are legally blind or have low vision, with a summer camp for youth ages 10 to 21.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ad159233-f344-4ec6-b937-2a3057547716' AND (description IS NULL OR description = '');

-- Greek Peak Adaptive Snowsports
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; mono skiing; bi skiing. Athletes served: People ages 6 and up with disabilities, including people with hearing or vision loss, amputations, developmental disabilities, autism, cerebral palsy and partial paralysis.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'cb639492-5bd8-49a5-97c5-a1f8f71fbb4b' AND (description IS NULL OR description = '');

-- Leaps Of Faith Disabled Skiers – Paralympic Sport Connecticut
UPDATE organizations SET description = 'Sports and activities: Water skiing; wakeboarding; tubing; downhill skiing; sit skiing; snowboarding. Athletes served: Children, adults and veterans with disabilities, of all ages and abilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '37759c33-9686-477f-8aab-c4be9e49e553' AND (description IS NULL OR description = '');

-- National Ability Center – Park City
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; ski racing; Nordic skiing; snowshoeing; sled hockey; fat tire biking; cycling; mountain biking; climbing; challenge course; archery; horseback riding; kayaking; canoeing; paddle boarding; water skiing; wakeboarding; wake surfing; whitewater rafting; golf; pickleball; camps. Athletes served: Youth and adults with physical, cognitive and developmental disabilities, people with mental health diagnoses or neurodiversity, and veterans and service members, along with their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7f66bd7e-f782-4908-be5d-0d9317f35d37' AND (description IS NULL OR description = '');

-- New England Disabled Sports
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; Nordic skiing; snowshoeing; cycling; mountain biking; golf; kayaking; stand up paddleboarding; pickleball. Athletes served: Children and adults ages 4 and up with physical, cognitive, hearing or visual disabilities, including autism, cerebral palsy, Down syndrome, spinal cord injury, traumatic brain injury and amputation, and veterans with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd2c13bb9-edc8-412e-845e-730e8fe50bb4' AND (description IS NULL OR description = '');

-- New England Healing Sports Association (NEHSA)
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; sit skiing; snowboarding; ski biking; kayaking; paddle boarding; hiking. Athletes served: People of all ages with physical and cognitive disabilities, including people with amputations, stroke, cerebral palsy, spina bifida, multiple sclerosis, paralysis, vision or hearing loss and developmental disabilities, and veterans with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8f21c7f6-8403-4792-978e-a83899d83921' AND (description IS NULL OR description = '');

-- Special Outdoor Leisure Opportunities (SOLO, Inc.)
UPDATE organizations SET description = 'Sports and activities: Downhill skiing; cross country skiing; snowshoeing; hiking. Athletes served: Children ages 8 and up and adults who can walk, including people who use crutches, with physical, visual, hearing or significant mental impairments.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7e35c388-e29d-4429-bc56-3c684db25179' AND (description IS NULL OR description = '');

-- Steamboat Adaptive Recreational Sports ‘STARS’
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; Nordic skiing; snowboarding; snowshoeing; cycling; hiking; kayaking; swimming. Athletes served: People of all ages with physical and cognitive disabilities and their families, including skiers who are blind or have low vision, and veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '91660598-fbb3-4f51-9400-d15b743d5a02' AND (description IS NULL OR description = '');

-- Two Top Mountain Adaptive Sports Foundation
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; sit skiing; snowboarding; cycling; water skiing; whitewater rafting. Athletes served: Veterans, children and adults with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '88c8136f-9289-4911-abf8-0bb622a71845' AND (description IS NULL OR description = '');

-- Vermont Adaptive Ski and Sports
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; cross country skiing; snowshoeing; canoeing; kayaking; stand up paddle boarding; cycling; mountain biking; sailing; indoor rock climbing; hiking; tennis; horseback riding; beeper baseball; environmental programs; wellness retreats. Athletes served: Youth and adults of all ages with physical, cognitive, developmental, intellectual, emotional or behavioral disabilities or neurodiversity, athletes who are blind or have low vision, and veterans with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '18a9facb-61f3-4246-8031-79a32a57e54d' AND (description IS NULL OR description = '');

-- Wintergreen Adaptive Sports
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; mono skiing; bi skiing; snowboarding; canoeing; kayaking. Athletes served: People of all ages with all types of disabilities, including injured veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c73b0784-b96a-4754-8962-7807dd896e76' AND (description IS NULL OR description = '');

-- Abilities Unlimited of the Carolinas
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball. Athletes served: Children with physical disabilities, including amputees and children with spina bifida or cerebral palsy, and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3d84c995-1d59-4b14-85ca-2a5f7010a10a' AND (description IS NULL OR description = '');

-- AccesSurf Hawaii Inc. – Paralympic Sport Hawaii
UPDATE organizations SET description = 'Sports and activities: Surfing; swimming; outrigger canoe paddling. Athletes served: People with physical or cognitive disabilities, including wounded warriors.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a00a07e5-617e-4612-923e-05b273422ba3' AND (description IS NULL OR description = '');

-- Adaptive Expeditions – Charleston
UPDATE organizations SET description = 'Sports and activities: Adaptive paddlesports; wheelchair tennis; pickleball; cycling; handcycling; swimming; natural history outings. Athletes served: Individuals with physical and sensory disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '25766bc3-c3ce-4453-98ab-f41588fcdc5b' AND (description IS NULL OR description = '');

-- Adaptive Sports New England
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; rowing; swimming; beep baseball; wheelchair football; sailing; wheelchair track. Athletes served: Youth and adults who are blind or have low vision or mobility disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd4a75efa-300e-4f80-92d5-e8a8f6d74033' AND (description IS NULL OR description = '');

-- Amputee Coalition
UPDATE organizations SET description = 'Sports and activities: Peer mentoring; support groups; youth and family programs; youth camp. Athletes served: People with limb loss and limb difference, and their families and caregivers.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '592375c9-cab3-4f07-8447-13b2f672faf0' AND (description IS NULL OR description = '');

-- Aspen Camp (Deaf & Hard of Hearing)
UPDATE organizations SET description = 'Sports and activities: Skiing; snowboarding; snowshoeing; outdoor camps; ASL immersion camps; job skills training. Athletes served: Deaf and hard of hearing children, youth, adults and families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd82ee02c-72d3-4a4f-8e2f-e1f98977e1c2' AND (description IS NULL OR description = '');

-- BlazeSports America
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; track and field; swimming; wheelchair tennis; adaptive soccer; wheelchair football; archery; cycling; rowing; water aerobics; fitness training; yoga; tennis; bowling; youth camp. Athletes served: Youth, adults, veterans and active duty service members with physical disabilities, including spina bifida, spinal cord injury, traumatic brain injury, cerebral palsy, dwarfism, amputations and visual impairments, and veterans with PTSD.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '56c7c499-0d9a-471d-98d0-59e6201e4d51' AND (description IS NULL OR description = '');

-- Central California Adaptive Sports Center
UPDATE organizations SET description = 'Sports and activities: Sit skiing; stand up skiing; snowshoeing; cross country skiing; mountaineering; hiking; mountain biking; kayaking; paddleboarding; fishing; rock climbing; camping. Athletes served: Persons with cognitive or physical disabilities, including veterans and members of the armed forces with disabilities, people with spinal cord injuries, and people who are blind or have low vision.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a3974ea8-0557-473d-81d4-f931dd73c5d0' AND (description IS NULL OR description = '');

-- Charlotte Rollin Bobcats
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball. Athletes served: Youth and adults with physical disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'dbe02551-b113-4ed6-b507-adc37abaa1fe' AND (description IS NULL OR description = '');

-- City of Fort Collins Adaptive Recreation
UPDATE organizations SET description = 'Sports and activities: Recreation and leisure programs. Athletes served: Community members with physical, intellectual or emotional disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a580f4bf-f3d6-4527-8ed3-f6cd477da549' AND (description IS NULL OR description = '');

-- Columbus Rec & Parks – Columbus
UPDATE organizations SET description = 'Sports and activities: Adaptive aquatics; blind hockey; boccia; wheelchair track and field; wheelchair basketball; wheelchair rugby; wheelchair softball; wheelchair tennis. Athletes served: People with disabilities in Central Ohio and surrounding areas.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '626e65a4-2cdc-475a-9ac9-fd50d8f536f8' AND (description IS NULL OR description = '');

-- Fox Valley Special Recreation Association
UPDATE organizations SET description = 'Sports and activities: Special Olympics sports; basketball; swim team; fitness; aquatics; summer day camp; adult day programs; crafts; performing arts; social outings. Athletes served: Children, teens and adults with disabilities in the Fox Valley region.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd408e015-7663-4986-a244-6862f5b8b489' AND (description IS NULL OR description = '');

-- Green Mountain Adaptive Sports
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; sit skiing; Nordic skiing; swimming; indoor rock climbing; skateboarding; movement classes; kayaking; mountain biking; monoskiing; peer mentoring. Athletes served: People with disabilities living in or visiting Vermont, including people with physical or neurological disabilities and complex disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a39cd654-56bf-4d3c-996b-5b5ef4a51d01' AND (description IS NULL OR description = '');

-- High Country Adaptive Sports
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; kayaking; mountain biking; hiking; climbing; indoor rock climbing. Athletes served: Youth and adults with physical or cognitive disabilities, including people who are blind or have low vision.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3fd30c54-ce35-44f1-b288-91a9b70cedba' AND (description IS NULL OR description = '');

-- Incight
UPDATE organizations SET description = 'Sports and activities: Scholarships; job fairs; career readiness workshops; leadership development. Athletes served: People with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '20d78885-54c6-4266-bcef-f30b277788ee' AND (description IS NULL OR description = '');

-- Kentwood Parks & Recreation
UPDATE organizations SET description = 'Sports and activities: Archery; pickleball; boccia; downhill skiing; rock climbing; bowling; golf; track and field; kayaking; wakeboarding; water skiing; cycling; cooking; dances and social events. Athletes served: People with disabilities in and around Kentwood.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '82c4bec5-30e8-41f6-b5ae-2237c7d3f4e0' AND (description IS NULL OR description = '');

-- Lakeshore Junior Wheelchair Basketball
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball. Athletes served: Youth with physical disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9105aab9-cb93-4272-b5db-9af5ecd81d29' AND (description IS NULL OR description = '');

-- Madison School & Community Recreation
UPDATE organizations SET description = 'Sports and activities: Bocce; bowling; chair exercise; social clubs; dance and movement; pottery; swim lessons; recreational swim; park walks; yoga. Athletes served: Youth and adults with disabilities, along with their family and friends.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '070f57df-48e5-4d54-a407-1f7d498b11f6' AND (description IS NULL OR description = '');

-- Mary Free Bed Wheelchair and Adaptive Sports – Grand Rapids
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; wheelchair rugby; wheelchair tennis; sled hockey; wheelchair lacrosse; goalball; handcycling; power soccer; wheelchair softball. Athletes served: Children and adults with physical disabilities or limited mobility, including athletes who are blind or have low vision and power wheelchair users.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ae200b8a-8b08-4ef1-972e-f5445d07d84e' AND (description IS NULL OR description = '');

-- Midwest Adaptive Sports (Kansas City)
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; wheelchair football; wheelchair rugby; wheelchair softball; wheelchair tennis; pickleball; skiing; snow tubing; water skiing; kayaking; fishing; camps. Athletes served: Youth and adults with physical, cognitive, emotional or behavioral disabilities, including people with spinal cord injuries, amputations and vision impairments.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f5ddbea5-747b-4b2b-8d0b-647a24f7fe14' AND (description IS NULL OR description = '');

-- New England Nordic Ski Association
UPDATE organizations SET description = 'Sports and activities: Nordic skiing; para Nordic skiing; rollerskiing; youth ski programs; racing. Athletes served: Cross country skiers in New England, including para Nordic athletes who sit ski, ski standing, or are visually impaired.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '724ef294-dfe7-4801-8084-c5621945d2a7' AND (description IS NULL OR description = '');

-- Northeast Passage – Southern New Hampshire
UPDATE organizations SET description = 'Sports and activities: Archery; court sports; cycling; golf; ice skating; paddlesports; water skiing; winter sports; sled hockey; wheelchair rugby; power soccer; wheelchair lacrosse; bowling; recreational therapy. Athletes served: People living with visible and invisible disabilities, including veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3ceaf5c4-87b4-4b5e-9f0f-792ae8345daa' AND (description IS NULL OR description = '');

-- Ocean Healing Group
UPDATE organizations SET description = 'Sports and activities: Surfing; snorkeling; fishing; zip line tours; nature tours; horseback riding. Athletes served: Children and young adults with physical disabilities, including spinal cord injuries, and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6194a27a-8240-4ac1-9163-39276a16bbc0' AND (description IS NULL OR description = '');

-- Operation Surf
UPDATE organizations SET description = 'Sports and activities: Adaptive surfing; yoga; mindfulness; peer support. Athletes served: Injured military service members and veterans, including those living with PTSD.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4248d97d-b9a3-4d03-a738-079a98c97eeb' AND (description IS NULL OR description = '');

-- ParaSport Spokane – Inland Northwest
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; track and field; sled hockey; swimming; goalball; strength and conditioning; parafencing; boccia; road racing. Athletes served: Youth and adults with physical disabilities and visual impairments.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'bf678ed2-f906-486e-a266-04c4783a710d' AND (description IS NULL OR description = '');

-- Piers Park Sailing Center – Boston
UPDATE organizations SET description = 'Sports and activities: Adaptive sailing; kayaking; marine science; harbor cruises. Athletes served: Youth and adults of all abilities, including people with mobility disabilities, spinal cord injury, hearing loss, vision loss and sensory sensitivities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'af293c1f-647b-4ca5-abdf-4772c2b02038' AND (description IS NULL OR description = '');

-- Sail To Prevail – Newport
UPDATE organizations SET description = 'Sports and activities: Therapeutic sailing. Athletes served: Children and adults with physical, intellectual and emotional disabilities and serious medical conditions, including paralysis, amputation, stroke, cerebral palsy, blindness, deafness, autism, epilepsy and pediatric cancer, and veterans with disabilities including PTSD.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e6f4f91a-7a0d-49a7-a19a-ac56acc992cd' AND (description IS NULL OR description = '');

-- Seattle Storm (Women’s Team)
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball. Athletes served: Women and teen girls with primarily lower limb disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9d23ed9c-e53b-400c-ae3c-93c4325e2a8e' AND (description IS NULL OR description = '');

-- Shifting Gears United
UPDATE organizations SET description = 'Sports and activities: Tandem cycling; handcycling; running; walking; wheelchair racing; water aerobics; swimming; snorkeling; kayaking; paddleboarding. Athletes served: Wounded veterans, first responders, and children and adults with disabilities, including people who are blind or have low vision.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'eda805fb-8fa2-4104-a9a7-c3483b49eba4' AND (description IS NULL OR description = '');

-- SoCal Soaring Academy
UPDATE organizations SET description = 'Sports and activities: Glider flights; flight school; STEM aviation outreach. Athletes served: Veterans living with PTS and other injuries, and youth.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'cf84e69f-14ed-432b-8833-b6f5f0755ba7' AND (description IS NULL OR description = '');

-- Southern Arizona Association for the Visually Impaired (SAAVI)
UPDATE organizations SET description = 'Sports and activities: Non visual skills training; independent living training; education and employment services; youth summer programs; rock climbing. Athletes served: Children, teens, adults and seniors across Arizona who are blind or have low vision.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b5f264f7-3913-4d07-8198-0e48ed7992ce' AND (description IS NULL OR description = '');

-- STRIDE Adaptive Sports
UPDATE organizations SET description = 'Sports and activities: Bocce; bowling; camping; dance; golf; learn to ride a bike; kayaking; sailing; skiing; snowboarding; ski racing; sled hockey; swimming; tae kwon do; tennis; pickleball; wheelchair basketball; whitewater rafting; fitness classes; youth club. Athletes served: Individuals with disabilities, with a focus on youth and wounded veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '37f5416f-53de-4c3d-bd6f-582f84326a31' AND (description IS NULL OR description = '');

-- Team River Runner – Battle Creek
UPDATE organizations SET description = 'Sports and activities: Adaptive paddle sports. Athletes served: Veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '91fc7802-ecf8-4b29-9ca8-f5f5dcfd0cba' AND (description IS NULL OR description = '');

-- Team River Runner – Columbia
UPDATE organizations SET description = 'Sports and activities: Whitewater paddling; flatwater paddling; adaptive paddle sports. Athletes served: Veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f2ec8b0e-ed2e-4af3-8af1-ba599d88a08a' AND (description IS NULL OR description = '');

-- Team River Runner – Milwaukee
UPDATE organizations SET description = 'Sports and activities: Adaptive paddle sports; lake paddling. Athletes served: Veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f72f1222-059c-4d23-ba5f-b9c7e87d6907' AND (description IS NULL OR description = '');

-- Team River Runner – Southeast PA
UPDATE organizations SET description = 'Sports and activities: Adaptive paddle sports. Athletes served: Veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5be39555-52f2-4d24-bd1b-0f31e8892cec' AND (description IS NULL OR description = '');

-- Team River Runner – Walter Reed
UPDATE organizations SET description = 'Sports and activities: Adaptive paddle sports. Athletes served: Veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e52d32b3-4683-4782-b31f-d1574c8c5f64' AND (description IS NULL OR description = '');

-- Texas Regional Paralympic Sport
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; triathlon; cycling; sport clinics and camps; competitions; adaptive equipment loans. Athletes served: Youth and adults with physical and visual disabilities in Texas.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6737bbd4-eb7b-46bf-b826-bb017e6f7d5a' AND (description IS NULL OR description = '');

-- Three Rivers Adaptive Sports
UPDATE organizations SET description = 'Sports and activities: Bowling; snow skiing; water sports; cycling; paddling. Athletes served: People with disabilities, their families and friends.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5a588372-96ef-4ffb-8cfb-331be62a9837' AND (description IS NULL OR description = '');

-- Triangle Sled Hockey Association
UPDATE organizations SET description = 'Sports and activities: Ice hockey; street hockey. Athletes served: Individuals with cognitive or developmental disabilities, autism, Down syndrome and other disabilities who can stand independently.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5719f643-77a7-47b5-90ad-2248131027e6' AND (description IS NULL OR description = '');

-- Unite 2 Fight Paralysis
UPDATE organizations SET description = 'Sports and activities: Advocacy; education; podcast; annual symposium; research funding; fundraising races. Athletes served: People living with spinal cord injury and the spinal cord injury community.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '255ef72e-1313-4225-afed-632fd5d4d9e0' AND (description IS NULL OR description = '');

-- United States Wheelchair Rugby Association
UPDATE organizations SET description = 'Sports and activities: Wheelchair rugby; low point rugby. Athletes served: Men and women with qualifying disabilities, most with spinal cord injuries, as well as cerebral palsy, muscular dystrophy, amputations, polio and other neurological conditions.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b0213262-cae5-4809-a8f6-0e15f6ab08d8' AND (description IS NULL OR description = '');

-- U.S. Electric Wheelchair Hockey Association
UPDATE organizations SET description = 'Sports and activities: Power wheelchair hockey. Athletes served: People who use an electric power wheelchair in daily life.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7ae1d6c5-2db4-434c-8ad6-3cee11f5b974' AND (description IS NULL OR description = '');

-- Youth Challenge
UPDATE organizations SET description = 'Sports and activities: Basketball; football; soccer; baseball; volleyball; swimming; boccia; bowling; skiing; weightlifting; pickleball; archery; hiking; kayaking; handcycling; gardening; nature programs; ceramics; theatre; culinary arts; music; painting. Athletes served: Young people with physical disabilities, including cerebral palsy, spinal cord injuries and visual impairments, alongside peers without disabilities, plus some adult programs.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7a0b845b-e815-4b3b-8ab4-9c91d1e1b096' AND (description IS NULL OR description = '');

-- Camp Abilities SUNY Brockport
UPDATE organizations SET description = 'Sports and activities: Canoeing; kayaking; stand up paddleboarding; gymnastics; rollerblading; tandem biking; beep baseball; goalball; high ropes course; swimming; track and field; showdown. Athletes served: Children and teens who are blind, have low vision, or are deafblind.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6ff5316f-13ab-404b-890c-c947a1697fcf' AND (description IS NULL OR description = '');

-- Lake of the Woods Adaptive Watersports Foundation
UPDATE organizations SET description = 'Sports and activities: Adaptive water skiing; watersports. Athletes served: Veterans, adults and children with disabilities, and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e99fd44d-fd05-4ba9-979e-be52c9e92e81' AND (description IS NULL OR description = '');

-- Adaptive Sports Program of Ohio
UPDATE programs SET description = 'Sports and activities: Power soccer; sled hockey; wheelchair basketball; wheelchair rugby; handcycling; track and field; road racing; wheelchair softball; wheelchair tennis; wheelchair football; camps and clinics. Athletes served: Youth and adults with physical disabilities, including veterans and people with amputations, spinal cord injury, cerebral palsy, brain injury, stroke, dwarfism and blindness or low vision.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5ca9c948-ede9-4ecb-a061-c952dc50c916' AND (description IS NULL OR description = '');

-- Pineland Farms VAST Program
UPDATE programs SET description = 'Sports and activities: Target archery; laser rifle shooting; cycling; handcycling; fishing; disc golf; boccia; wheelchair basketball; pickleball; snowshoeing; cross country skiing; trail walking. Athletes served: Veterans with physical disabilities, traumatic brain injury or PTS who are eligible for VA support.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '84c9fe29-035f-4444-9587-f97820a2d190' AND (description IS NULL OR description = '');

-- University of Utah – TRAILS Program
UPDATE programs SET description = 'Sports and activities: Indoor cycling; handcycling; kayaking; sailing; target shooting; downhill skiing; cross country skiing; para Nordic skiing; swimming; wheelchair tennis; spinal cord injury wellness and education. Athletes served: People of all ability levels, including individuals with spinal cord injury and complex physical disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd9c19e5f-31cb-4412-ae38-407aab579b5d' AND (description IS NULL OR description = '');

-- Shifting Gears United
UPDATE programs SET description = 'Sports and activities: Tandem cycling; handcycling; running; walking; wheelchair racing; water aerobics; swimming; snorkeling; kayaking; paddleboarding. Athletes served: Wounded veterans, first responders, and children and adults with disabilities, including people who are blind or have low vision.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a2eda344-7c6f-44cb-b276-add9fa4ce1a7' AND (description IS NULL OR description = '');

-- Achilles NYC
UPDATE programs SET description = 'Sports and activities: Running; walking; adaptive cycling; youth workouts; endurance events. Athletes served: People of all ages with disabilities, including blindness or low vision, deafness or hearing loss, dwarfism, cognitive, developmental and intellectual disabilities, limb loss, multiple sclerosis, cerebral palsy, spinal cord injury and traumatic brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '59191997-4b23-5d1f-8ed4-f62ff28cae22' AND (description IS NULL OR description = '');

-- Achilles Denver
UPDATE programs SET description = 'Sports and activities: Running; walking; endurance events. Athletes served: People of all ages with disabilities, including blindness or low vision, deafness or hearing loss, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injury and traumatic brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c98ca704-1a18-45f1-9aab-d851ba9447c1' AND (description IS NULL OR description = '');

-- Achilles Minnesota
UPDATE programs SET description = 'Sports and activities: Running; walking; endurance events. Athletes served: People of all ages with disabilities, including blindness or low vision, deafness or hearing loss, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injury and traumatic brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8ab56d90-af1a-411e-90c7-3f8b6ba8f4fb' AND (description IS NULL OR description = '');

-- Achilles Philadelphia
UPDATE programs SET description = 'Sports and activities: Running; walking; endurance events. Athletes served: People of all ages with disabilities, including blindness or low vision, deafness or hearing loss, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injury and traumatic brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '28b201b0-d606-475a-900c-df203ce2fc47' AND (description IS NULL OR description = '');

-- Achilles San Francisco Bay Area
UPDATE programs SET description = 'Sports and activities: Running; walking; endurance events. Athletes served: People of all ages with disabilities, including blindness or low vision, deafness or hearing loss, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injury and traumatic brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '39ae225d-25b3-58f9-a68d-18e6e38b80f8' AND (description IS NULL OR description = '');

-- Achilles Westchester
UPDATE programs SET description = 'Sports and activities: Running; walking; endurance events. Athletes served: People of all ages with disabilities, including blindness or low vision, deafness or hearing loss, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injury and traumatic brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '15151265-a9c6-517f-8abb-412320eba5ae' AND (description IS NULL OR description = '');

-- Thunder in the Valley Games (One-Day Try-It Clinic)
UPDATE programs SET description = 'Sports and activities: Track and field; air rifle; archery; swimming; powerlifting; handcycling; boccia clinics. Athletes served: Athletes with disabilities, including wheelchair athletes.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '29d3b439-db12-4589-86a7-ac5980280c4b' AND (description IS NULL OR description = '');

-- Ability360 – Paralympic Sport Phoenix
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; wheelchair softball; amputee basketball; cheer and dance; dragon boat; power soccer; wheelchair football; wheelchair rugby; wheelchair tennis; swimming; outrigger canoe; pickleball; curling; golf; fitness; aquatics; camping; hiking; kayaking; rafting; fishing; rock climbing; mountain biking; snow skiing; barge rowing. Athletes served: People with disabilities and their families of different abilities, ages and experience levels, plus youth teams and military members past and present.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b7827006-4eda-47a0-a38d-87ad4d19a73b' AND (description IS NULL OR description = '');

-- Adaptive Adventures
UPDATE organizations SET description = 'Sports and activities: Skiing; snowboarding; cycling; dragon boat racing; kayaking; paddleboarding; rock climbing; waterskiing; wakeboarding; whitewater rafting. Athletes served: Children and youth ages 6 to 20 and adults with physical disabilities, their families, and injured veterans and active duty military.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '387be9ff-5129-4a84-a95f-64809a68863e' AND (description IS NULL OR description = '');

-- Adaptive Fusion Dragon Boat Club
UPDATE organizations SET description = 'Sports and activities: Dragon boat paddling; outrigger canoe training. Athletes served: Paddlers who are blind, deaf, amputees, or have physical or mental challenges, along with support paddlers.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '56b8d00d-55ea-4242-8b1a-6936e0594002' AND (description IS NULL OR description = '');

-- Adaptive Sports Northwest – Portland
UPDATE organizations SET description = 'Sports and activities: Archery; cycling; goalball; pickleball; power soccer; sitting volleyball; swimming; track and field; wheelchair basketball; wheelchair rugby; virtual programs. Athletes served: Children and adults with physical disabilities and visual impairments, from recreational players to athletes training for Paralympic competition.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '26e936a3-623b-48e2-b250-7256825dcb82' AND (description IS NULL OR description = '');

-- Angel City Sports
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; blind soccer; track and field; golf; multisport clinics. Athletes served: Youth, adults, and veterans with physical disabilities or visual impairments, plus first responders at its veterans weekend.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0a952ffb-4765-49fd-a97e-671200072a0d' AND (description IS NULL OR description = '');

-- Aspen Valley Ski and Snowboard Club (AVSC)
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; freestyle skiing; freeride; Nordic skiing; snowboarding; ski mountaineering; mountain biking; trampoline. Athletes served: Youth in the greater Roaring Fork Valley, from recreational lessons to competitive teams.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ac064049-e8cc-4a71-a371-cb8d73f55a57' AND (description IS NULL OR description = '');

-- Bay Area Association of Disabled Sailors
UPDATE organizations SET description = 'Sports and activities: Small boat sailing; keelboat sailing; sailboat racing. Athletes served: People with all forms of disability, with no sailing experience necessary.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '381ebfaf-21b0-4553-ba00-196b7d77ae58' AND (description IS NULL OR description = '');

-- Central Maine Adaptive Sports
UPDATE organizations SET description = 'Sports and activities: Skiing; snowboarding; snowshoeing; sled hockey; track and field; kayaking; cycling. Athletes served: People of all ages with any disability, physical, mental or behavioral, including students training for Special Olympics and para sports.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0715b244-617f-4df8-91c4-eaf88c1bc3e3' AND (description IS NULL OR description = '');

-- CHD’s Disability Resources
UPDATE organizations SET description = 'Sports and activities: Sled hockey; cycling; fishing; rock climbing; wheelchair basketball; dance and movement; swimming; CrossFit. Athletes served: Adults and children with disabilities of all ages and abilities in Western Massachusetts and Connecticut.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd15cfee4-946e-44f2-a71b-d3ca6d4057a3' AND (description IS NULL OR description = '');

-- City of Boise Adaptive Recreation
UPDATE organizations SET description = 'Sports and activities: Adaptive cycling; waterskiing; whitewater rafting; wheelchair basketball; wheelchair rugby; sports clinics; snowshoeing; tubing; disc golf; fishing; camping; fitness; dance; yoga; art and cooking classes; social clubs. Athletes served: Youth, teens and adults with disabilities and their families and friends, with wheelchair sports for people with physical disabilities and a youth sports camp for ages 6 to 19 with physical disabilities that limit mobility.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a1177699-e933-4de0-bbe3-628c8eeab71a' AND (description IS NULL OR description = '');

-- Community Boating, Inc.
UPDATE organizations SET description = 'Sports and activities: Sailing lessons; guided recreational sails; sailboat racing. Athletes served: Anyone who needs additional assistance to sail, including veterans, people with visual impairments, children with developmental disabilities, and adults with chronic injury or illness.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b41ecdcc-07ce-49e9-9244-f8f4417b328b' AND (description IS NULL OR description = '');

-- COSTA Therapy, Inc.
UPDATE organizations SET description = 'Sports and activities: Adaptive surfing; surf therapy; surf and wellness retreats; beach cleanups. Athletes served: Veterans, first responders, service members and their families, adaptive athletes, and military youth and foster youth.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd31962be-9af2-4c25-ab5c-157224590ce4' AND (description IS NULL OR description = '');

-- Disabled Athlete Sports Association – St. Louis
UPDATE organizations SET description = 'Sports and activities: Air rifle; archery; boccia; golf; para powerlifting; power soccer; rock climbing; sled hockey; swimming; tennis; track and field; wheelchair basketball; wheelchair rugby; fitness. Athletes served: Children and adults with physical and visual disabilities, from first time movers to Paralympic hopefuls.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e3cb007a-bf43-470e-8ff2-5927738b49f7' AND (description IS NULL OR description = '');

-- DREAM Adaptive Recreation, Inc.
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; Nordic skiing; cycling; mountain biking; paddling; fishing; watersports. Athletes served: People ages 5 through adulthood with physical, cognitive, intellectual, developmental, and sensory disabilities, including military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '70771ff4-609d-4f2d-863f-decbb2707c92' AND (description IS NULL OR description = '');

-- Groton Parks and Recreation
UPDATE organizations SET description = 'Sports and activities: Basketball; floor hockey; aquatics; track and field; wheelchair track and field; tennis; soccer; cycling; sailing; golf; bocce; bowling; volleyball. Athletes served: Athletes with intellectual disabilities from age 6, plus partners without disabilities on Unified Sports teams.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '77aa6806-0959-4040-a963-d4bbb8567393' AND (description IS NULL OR description = '');

-- Maine Adaptive Sports & Recreation
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; Nordic skiing; snowshoeing; mono skiing; paddling; cycling; mountain biking; climbing; pickleball; golf. Athletes served: People age 4 and older with a permanent physical or cognitive disability, including skiers with visual impairments, sit skiers with paralysis, and veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9c6141d8-4b6c-473e-8bf7-7bb16d44debe' AND (description IS NULL OR description = '');

-- Mount Washington Valley Adaptive Sports
UPDATE organizations SET description = 'Sports and activities: Adaptive skiing; snowboarding. Athletes served: People of all ages with physical or cognitive disabilities, and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7fe9e1bf-2c6e-472d-bf46-3772e60ecf5a' AND (description IS NULL OR description = '');

-- National Sports Center for the Disabled – Winter Park & Denver
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; ski biking; Nordic skiing; snowshoeing; alpine ski racing; fat tire snow biking; rock climbing; archery; air rifle; horseback riding; mountain biking; canoeing; kayaking; paddleboarding; sailing; whitewater rafting; camps. Athletes served: Youth, teens, and adults with any type of disability, including veterans and active duty military with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '22057a75-49fc-42a6-a68e-557692cdea12' AND (description IS NULL OR description = '');

-- Oklahoma Adaptive Sports Association (OKASA)
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; track and field; swimming; water skiing; kayaking; tubing; catamaran and pontoon boat rides. Athletes served: Children and adults age 2 and up with physical disabilities who function at or near age level, including ambulatory athletes and wheelchair users.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ef87e95f-eaf7-471b-94fd-0c210da089c3' AND (description IS NULL OR description = '');

-- Oregon Adaptive Sports – Central Oregon
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; Nordic skiing; snowshoeing; cycling; mountain biking; gravel riding; paddling; golf. Athletes served: Youth and adults with physical, sensory, cognitive, intellectual and developmental disabilities, including people who are blind, low vision, Deaf or hard of hearing, and people with neurological conditions.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e8c182d9-802f-48c7-b007-389c459a9433' AND (description IS NULL OR description = '');

-- ParaSports – San Antonio
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; wheelchair softball; wheelchair racing; youth programs. Athletes served: People with physical challenges, including young athletes.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'bccb7a84-00fd-4fe7-97b5-3292123e2e9a' AND (description IS NULL OR description = '');

-- Pittsburgh Mighty Penguins Sled Hockey
UPDATE organizations SET description = 'Sports and activities: Sled hockey. Athletes served: Children and adults with physical disabilities, with youth teams ages 5 to 17 and adult teams 18 and older.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'efa71cb5-f813-492e-b793-db4bf93aceca' AND (description IS NULL OR description = '');

-- Riekes Center for Human Enhancement
UPDATE organizations SET description = 'Sports and activities: Strength and conditioning; boxing fitness; archery; virtual fitness. Athletes served: Veterans through VA fitness and archery classes, and people with Parkinson''s disease.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd7b9e35a-b919-4bce-ae05-4355ce8a5c82' AND (description IS NULL OR description = '');

-- Salute Military Golf Association
UPDATE organizations SET description = 'Sports and activities: Golf; golf clinics; golf tournaments. Athletes served: Post 9/11 wounded and injured veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '72d00e55-dbaa-4e7c-ab2f-55cecb9a8ed5' AND (description IS NULL OR description = '');

-- Seattle Wheelchair Rugby Association
UPDATE organizations SET description = 'Sports and activities: Wheelchair rugby. Athletes served: People with disabilities, from recreational players to elite athletes, including people with spinal cord injuries.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '42a97335-4961-4ec6-b5a7-8b5029e4e99e' AND (description IS NULL OR description = '');

-- Shirley Ryan AbilityLab
UPDATE organizations SET description = 'Sports and activities: Sled hockey; archery; boccia; cycling; golf; kayaking; mountain biking; rock climbing; wheelchair basketball; wheelchair rugby; wheelchair softball; sailing; fitness. Athletes served: Youth and adults with a primary physical disability, from recreational players to elite athletes, plus a military sports program.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '96f7d490-3dc7-4298-81bc-a5887e50d547' AND (description IS NULL OR description = '');

-- South Orlando Rowing Association
UPDATE organizations SET description = 'Sports and activities: Rowing; sculling; sweep rowing; indoor rowing. Athletes served: Middle and high school students in Central Florida.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '47602422-aa3c-4c3b-af6e-3b6828bc0489' AND (description IS NULL OR description = '');

-- Sportable Richmond Adaptive Sports & Recreation
UPDATE organizations SET description = 'Sports and activities: Archery; wheelchair basketball; wheelchair rugby; power soccer; para swimming; wheelchair pickleball; wheelchair ballroom dance; cycling; paracycling; rock climbing; fitness; boccia. Athletes served: People with physical disabilities, visual impairments, and those needing physical accommodations, including athletes with spina bifida, spinal cord injury, amputation and cerebral palsy.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '90b97b9e-3684-4d4b-9f51-414f1c27e11f' AND (description IS NULL OR description = '');

-- Team River Runner Denver
UPDATE organizations SET description = 'Sports and activities: Kayaking; flatwater and moving water paddling; pool training. Athletes served: Veterans and their family members and caregivers, with adaptive equipment for paddlers with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f6b1795d-0e90-46ce-bbfd-c306d708702b' AND (description IS NULL OR description = '');

-- Team River Runner – Portland
UPDATE organizations SET description = 'Sports and activities: Adaptive paddling; kayaking. Athletes served: Veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '99b7d215-75bf-4a5c-add3-f1a605e5aab1' AND (description IS NULL OR description = '');

-- Team River Runner – Spokane
UPDATE organizations SET description = 'Sports and activities: Adaptive paddling; kayaking. Athletes served: Veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f76d83be-af8b-4c09-aed4-9f34c9fc55b0' AND (description IS NULL OR description = '');

-- Team River Runner – Wilmington
UPDATE organizations SET description = 'Sports and activities: Adaptive paddling; kayaking. Athletes served: Veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '933e1c91-f2aa-4b0a-80d4-63eb81ceffa9' AND (description IS NULL OR description = '');

-- Texas Rowing for All – Austin
UPDATE organizations SET description = 'Sports and activities: Rowing; paddling; summer camps. Athletes served: People with physical, sensory, and intellectual disabilities, and veterans and active military members.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '65e6dc04-b819-4bce-be76-c1e1c4db2511' AND (description IS NULL OR description = '');

-- Three Rivers Rowing Association
UPDATE organizations SET description = 'Sports and activities: Adaptive rowing; para rowing. Athletes served: Athletes age 12 and up with disabilities, novice to elite, including those with limited trunk control, leg impairments, visual impairments or cognitive impairments.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '21fb5f24-2f5c-4582-8909-188d4aeff192' AND (description IS NULL OR description = '');

-- Triumph Foundation
UPDATE organizations SET description = 'Sports and activities: Wheelchair hockey; wheelchair basketball; racquetball; baseball; wheelchair rugby; hand cycling; scuba; wheelchair skating; power wheelchair rodeo; target shooting; 5K walk, run or roll; fitness. Athletes served: Children, adults, and veterans with spinal cord injury or disorder and other people with mobility impairments in Southern California, including the newly injured.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8f3e1aed-c996-4e0d-a2b0-035e1d3ab9d0' AND (description IS NULL OR description = '');

-- United States Adaptive Recreation Center
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; mono skiing; bi skiing; water skiing; paddle sports; fishing. Athletes served: People with physical and cognitive disabilities, regardless of swimming ability for summer water sports.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e1066bc4-0249-49ef-916f-ce9ec0127246' AND (description IS NULL OR description = '');

-- University of Arizona
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; wheelchair track and road racing; tennis; para swimming; golf. Athletes served: University student athletes in wheelchair and adaptive sports, plus young people ages 13 to 26 at its wheelchair basketball camp.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '66389716-ec48-42f2-8a9d-30fe5e1eb7d3' AND (description IS NULL OR description = '');

-- Waterville Valley Adaptive Sports
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; Nordic skiing; adaptive cycling; trail rides. Athletes served: People with disabilities of all ages and abilities, with family and friends welcome on group rides.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '14c5863e-e2a0-408f-9e67-b59f86ee967b' AND (description IS NULL OR description = '');

-- Cincinnati Tennis Foundation
UPDATE organizations SET description = 'Sports and activities: Wheelchair tennis; adaptive tennis; standing adaptive tennis; blind and visually impaired tennis; youth tennis; padel. Athletes served: Cincinnati youth, including those in underserved neighborhoods, adults, and juniors and adults who use wheelchairs or are blind or low vision.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a96e0bfb-d209-4440-9c13-305d906ccaea' AND (description IS NULL OR description = '');

-- Catch A Lift Fund
UPDATE organizations SET description = 'Sports and activities: Fitness programs; coaching; wellness and nutrition support; peer community. Athletes served: Post 9/11 combat injured veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ecda2e7a-a2a4-41ef-b49c-6ad3de0ae158' AND (description IS NULL OR description = '');

-- American Association of Adapted Sports Programs
UPDATE programs SET description = 'Sports and activities: Wheelchair handball; wheelchair basketball; wheelchair football; wheelchair track and field. Athletes served: Students with physical disabilities on school teams across Georgia.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '76744902-91b9-48b7-b6bc-5e1bafe0cce1' AND (description IS NULL OR description = '');

-- Rehabilitation Hospital of Indiana (RHI) Sports Program – Indianapolis
UPDATE programs SET description = 'Sports and activities: Wheelchair basketball; wheelchair tennis; power soccer; beep baseball; wheelchair lacrosse; sled hockey; blind hockey; wheelchair rugby; fencing; archery; water skiing; paratriathlon; racing; track and field; para powerlifting; recreational clinics. Athletes served: Youth and adults with spinal cord, orthopedic, neuromuscular, and visual impairments.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '77b77320-1cb7-4f88-b334-926a08d508ed' AND (description IS NULL OR description = '');

-- USA Volleyball – Sitting Program
UPDATE programs SET description = 'Sports and activities: Sitting volleyball. Athletes served: Women athletes on the U.S. national sitting volleyball team.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '16d14ab5-7a85-4f69-8e51-88b631b5060b' AND (description IS NULL OR description = '');

-- Achilles Washington D.C.
UPDATE programs SET description = 'Sports and activities: Running; walking; adaptive cycling; handcycling; tandem cycling; endurance events. Athletes served: People of all ages with disabilities, including blind or low vision, Deaf or hard of hearing, cognitive, developmental and intellectual disabilities, limb loss, multiple sclerosis, cerebral palsy, spinal cord injury and brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c445482e-e416-4f08-ba5e-5b05b4cfd0cc' AND (description IS NULL OR description = '');

-- Achilles Connecticut
UPDATE programs SET description = 'Sports and activities: Running; walking; endurance events. Athletes served: People of all ages with disabilities, including blind or low vision, Deaf or hard of hearing, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injury and brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4a5f1878-e83d-4da9-a4d1-4c330c44f64a' AND (description IS NULL OR description = '');

-- Achilles St. Louis
UPDATE programs SET description = 'Sports and activities: Running; walking; endurance events. Athletes served: People of all ages with disabilities, including blind or low vision, Deaf or hard of hearing, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injury and brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '564e2466-1668-480a-a660-3de6663ab3d4' AND (description IS NULL OR description = '');

-- Achilles Houston
UPDATE programs SET description = 'Sports and activities: Running; walking; handcycling; endurance events. Athletes served: People of all ages with disabilities, including blind or low vision, Deaf or hard of hearing, cognitive, developmental and intellectual disabilities, limb loss, multiple sclerosis, cerebral palsy, spinal cord injury and brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f3309b46-3602-43fd-b8f0-0affb93d8391' AND (description IS NULL OR description = '');

-- Achilles Boulder
UPDATE programs SET description = 'Sports and activities: Running; walking; endurance events. Athletes served: People of all ages with disabilities, including blind or low vision, Deaf or hard of hearing, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injury and brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '07083bd5-8c5f-54a4-a972-ff302ce8e2c1' AND (description IS NULL OR description = '');

-- Adaptive Adventures, Chicago
UPDATE programs SET description = 'Sports and activities: Skiing; snowboarding; cycling; dragon boat racing; kayaking; paddleboarding; rock climbing; waterskiing; wakeboarding; whitewater rafting. Athletes served: Children and youth ages 6 to 20 and adults with physical disabilities, their families, and injured veterans and active duty military.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '21db8fe7-8c0a-416b-ab6b-5a79f95fb5c1' AND (description IS NULL OR description = '');

-- Ability PLUS, Inc.
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; cross country skiing; snowshoeing; cycling; hiking; kayaking; waterskiing. Athletes served: People age 4 and up with any type of disability, including physical, developmental, cognitive and emotional disabilities and autism.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a199684b-19a9-41da-9b83-82ce3de5a518' AND (description IS NULL OR description = '');

-- Asphalt Green
UPDATE organizations SET description = 'Sports and activities: Swimming; basketball; soccer; playground skills; private sport lessons. Athletes served: Kids and teens of all needs and abilities, including those with ADHD, autism, sensory processing disorder, gross motor delays and Down syndrome.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0027a07d-b676-42ba-9d37-d03a645c2763' AND (description IS NULL OR description = '');

-- Challenge Alaska – Paralympic Sport Alaska
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; Nordic skiing; biathlon; sled hockey; hockey; wheelchair basketball; wheelchair tennis; wheelchair lacrosse; goalball; five a side football; para cycling; mountain biking; rock climbing; archery; precision shooting; track and running; hiking; camping and backpacking; fishing; ice fishing; water sports. Athletes served: Alaskans with physical and intellectual disabilities, including veterans with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '26c4f6ed-5822-4bf6-9089-c42508316882' AND (description IS NULL OR description = '');

-- City of Boulder EXPAND
UPDATE organizations SET description = 'Sports and activities: Volleyball; basketball; swimming; dance; water aerobics; fitness; waterskiing; Special Olympics training. Athletes served: Youth and adults with disabilities, mostly intellectual and developmental disabilities, with adaptive waterskiing for people with physical disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'dd9cdf52-2a34-47eb-9045-34143f8a1648' AND (description IS NULL OR description = '');

-- Community Rowing, Inc. – Boston
UPDATE organizations SET description = 'Sports and activities: Para rowing. Athletes served: Youth and adults with physical, sensory and intellectual disabilities, at all experience levels.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c54340a0-6578-49a0-8961-69d415071253' AND (description IS NULL OR description = '');

-- Dare2tri Paratriathlon Club
UPDATE organizations SET description = 'Sports and activities: Swimming; cycling; running; triathlon. Athletes served: Youth and adults with physical disabilities and visual impairments, and injured service members.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5212b9f0-83a6-4ab9-a7ac-197f0e6cdf7e' AND (description IS NULL OR description = '');

-- Disabled Sports Eastern Sierra
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; Nordic skiing; mountain biking; road cycling; paddling; water sports; climbing; hiking. Athletes served: Kids and adults of all ages and abilities, including people with intellectual and cognitive disabilities, and veterans and active duty service members with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'cd86ffb5-16df-4f2e-a4db-4d41853a46c7' AND (description IS NULL OR description = '');

-- Fayetteville-Cumberland Parks & Rec
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; archery; air gun shooting; buddy football; buddy basketball; buddy baseball. Athletes served: Adults, veterans and service members with disabilities, and children age 5 through grade 12 with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b0228cc8-162b-4193-86ee-f720231aca75' AND (description IS NULL OR description = '');

-- Golden State Road Warriors
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball. Athletes served: Athletes with disabilities who play competitive wheelchair basketball.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'bf382eb5-be37-4b3a-a2d5-13c8ed46ee3d' AND (description IS NULL OR description = '');

-- Happy Trails Riding Academy
UPDATE organizations SET description = 'Sports and activities: Therapeutic horsemanship; equine facilitated psychotherapy; equine services for veterans. Athletes served: Children and adults age six and up with physical, cognitive and emotional disabilities, including ADHD, developmental delay, autism, cerebral palsy, Down syndrome and post traumatic stress, and veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'cddeb5d4-cc81-4a8f-8bab-5e510d32ade9' AND (description IS NULL OR description = '');

-- Hospital for Special Care – Paralympic Sport Club Connecticut
UPDATE organizations SET description = 'Sports and activities: Boccia; power soccer; racing; swimming; table tennis; tennis; track and field; wheelchair basketball; road race training; indoor golf. Athletes served: Children and adults with physical disabilities, from recreation to high level competition.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '81df50cf-d266-4394-90c3-5652acab9f5f' AND (description IS NULL OR description = '');

-- Lincolnway Special Recreation Association
UPDATE organizations SET description = 'Sports and activities: Boccia; wheelchair basketball; wheelchair softball; wheelchair football; Special Olympics sports; adaptive duathlon; recreation and social programs. Athletes served: People of all ages with intellectual or physical disabilities, with adapted sports for people age 3 and up with physical or visual impairments.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8e0ad448-76b2-465f-94a1-eb81bd29a676' AND (description IS NULL OR description = '');

-- Maine-Niles Association of Special Recreation
UPDATE organizations SET description = 'Sports and activities: Volleyball; basketball; track and field; powerlifting; bowling; softball; golf; aquatics; fitness; adaptive sports; cultural arts. Athletes served: Children, teens and adults with disabilities, including youth ages 3 to 22, adults with intellectual disabilities, and adults with physical or visual impairments.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4c700811-51d7-47c1-af8d-d03fae1adbee' AND (description IS NULL OR description = '');

-- Move United
UPDATE organizations SET description = 'Sports and activities: Adaptive skiing; snowboarding; wheelchair basketball; wheelchair rugby; wheelchair football; sled hockey; swimming; track and field; cycling; rock climbing; kayaking; sailing; shooting. Athletes served: People with disabilities of all ages across the country, served mostly through its member organizations, including wounded warfighters.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6d8ad4d4-0077-4800-9317-c0e8370acd3c' AND (description IS NULL OR description = '');

-- National Wheelcats
UPDATE organizations SET description = 'Sports and activities: Sled hockey; wheelchair tennis; wheelchair basketball; wheelchair softball; wheelchair rugby; water skiing; fishing; shooting. Athletes served: Youth and adults with disabilities, mainly in Kentucky and Tennessee, with quad rugby for athletes with quadriplegia.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a04151bd-2359-45f9-bf83-518ce2597127' AND (description IS NULL OR description = '');

-- North Jersey Navigators
UPDATE organizations SET description = 'Sports and activities: Track and field; swimming; archery; triathlon; road racing; boccia. Athletes served: Children, young adults and adults with physical disabilities, ages 7 to 76, including veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6c47d309-c28b-4071-9416-3d5af182b21c' AND (description IS NULL OR description = '');

-- Oklahoma City Boathouse
UPDATE organizations SET description = 'Sports and activities: Para rowing; kayak football; whitewater rafting. Athletes served: People who are blind or have low vision, and veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0851fff7-6cfa-4f1b-8a36-bc94f5dbf19d' AND (description IS NULL OR description = '');

-- Ozark Adaptive Sports Association (OzASA)
UPDATE organizations SET description = 'Sports and activities: Adaptive cycling; archery; fishing; wheelchair pickleball; adaptive mountain biking; bowling; wheelchair basketball; wheelchair tennis. Athletes served: People with physical disabilities in Northwest Arkansas.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'aa92d8a4-c704-47d8-bf22-976b9623259a' AND (description IS NULL OR description = '');

-- PossAbilities at Loma Linda University
UPDATE organizations SET description = 'Sports and activities: Adaptive baseball; wheelchair basketball; adaptive flag football; cycling; adaptive swimming; skiing; Paralympic training. Athletes served: People with permanent physical disabilities and veterans, with baseball and flag football teams for players with cognitive and developmental disabilities, and youth and adult wheelchair basketball teams.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '53ba8186-6257-470c-8809-a6fe72a643ab' AND (description IS NULL OR description = '');

-- Rio Salado Rowing Club – Paralympic Sport Valley of the Sun
UPDATE organizations SET description = 'Sports and activities: Adaptive rowing. Athletes served: People with disabilities and functional limitations, for recreational and competitive rowing.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ccba8a33-ea16-485c-be18-4748f4ad4f7c' AND (description IS NULL OR description = '');

-- S.M.C.L Foundation & Associates – New Orleans
UPDATE organizations SET description = 'Sports and activities: Wheelchair football; adaptive tennis; wheelchair motocross. Athletes served: Military veterans and people with disabilities of all abilities and experience levels.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2a896d48-7144-44b7-b58e-cd6f45659343' AND (description IS NULL OR description = '');

-- Southeast Alaska Independent Living
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; Nordic skiing; snowshoeing; ice skating; hiking; biking; kayaking; fishing; rock climbing; rafting; horseback riding; swimming; camping; challenge course. Athletes served: Seniors and people with disabilities of all ages in Southeast Alaska, including youth ages 7 to 18 in inclusive day camps.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3c81a49e-c3c9-4235-8590-4d01c7973410' AND (description IS NULL OR description = '');

-- Space Coast Hurricanes Sled Hockey
UPDATE organizations SET description = 'Sports and activities: Sled hockey. Athletes served: Youth and adults who are not able to play stand up hockey, including amputees, people with paraplegia, spina bifida, autism or MS, and veterans with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2dad6a35-40e7-4a7a-99ab-ebaf7db0780f' AND (description IS NULL OR description = '');

-- Sports Association, Gaylord Hospital – Paralympic Sport Southern New England
UPDATE organizations SET description = 'Sports and activities: Archery; boccia; boxing; adaptive cycling; fitness; golf; kayaking; paratriathlon; pickleball; rock climbing; skiing; snowboarding; sled hockey; fishing; water skiing; wheelchair rugby; wheelchair tennis. Athletes served: People with physical disabilities or visual impairments, including veterans and service members with physical disabilities, visual impairments or PTSD.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fe5057c2-0f95-491f-a2ed-a5aecf8fa32c' AND (description IS NULL OR description = '');

-- Team Paradise Sailing – Paralympic Sport Miami
UPDATE organizations SET description = 'Sports and activities: Sailing. Athletes served: People of all ages and skill levels, including people with disabilities, veterans and first responders, and underresourced communities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9399efbf-9b24-4925-bc2c-aeb45c759a56' AND (description IS NULL OR description = '');

-- Team River Runner – Fredericksburg
UPDATE organizations SET description = 'Sports and activities: Adaptive paddle sports. Athletes served: Active duty service members, veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3e767cc3-3aef-4c6e-a291-de3d9fceb42d' AND (description IS NULL OR description = '');

-- Team River Runner – Johnson City / Tri-Cities
UPDATE organizations SET description = 'Sports and activities: Adaptive paddle sports; pool sessions; river training. Athletes served: Veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '69d2dc48-7b22-486b-9f9d-5519e4996511' AND (description IS NULL OR description = '');

-- Team River Runner – Newbury
UPDATE organizations SET description = 'Sports and activities: Kayaking. Athletes served: Injured and affected military service members and veterans, people with disabilities of all abilities, and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9e014589-77dc-4fb5-8ede-cb4227192bff' AND (description IS NULL OR description = '');

-- The Ability Experience
UPDATE organizations SET description = 'Sports and activities: Running; walking; wheelchair racing; cycling; hiking. Athletes served: People with and without disabilities who take part in endurance events together.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b21605a2-e61c-4542-85d7-b3e8a80f683b' AND (description IS NULL OR description = '');

-- Thunder in the Valley Games
UPDATE organizations SET description = 'Sports and activities: Track; field; air rifle; archery; powerlifting; handcycling; boccia. Athletes served: Athletes with disabilities, in a Move United sanctioned competition.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '06444a7e-c456-4801-affe-fda1f3062b80' AND (description IS NULL OR description = '');

-- United States Association of Blind Athletes (USABA)
UPDATE organizations SET description = 'Sports and activities: Goalball; blind soccer; beep baseball; cycling; judo; powerlifting; swimming; track and field; triathlon. Athletes served: Children, youth, adults and veterans who are blind or have low vision, from grassroots to Paralympic level.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '928ed8bf-d4ee-4211-818a-8218c7292601' AND (description IS NULL OR description = '');

-- University of Maryland Rehab & Orthopaedic Institute
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; wheelchair tennis; wheelchair rugby; adapted golf. Athletes served: Teens and adults age 15 and up with physical disabilities after stroke, brain injury, spinal cord injury, amputation or other chronic conditions.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'af4a8a64-91f6-4ca6-a9ea-852409b0d4c5' AND (description IS NULL OR description = '');

-- Western DuPage Special Recreation Association
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; boccia. Athletes served: Children, teens and adults with physical disabilities or visual impairments, including veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '816e8345-d7b6-4952-97c6-0dbadb1b6626' AND (description IS NULL OR description = '');

-- Grand Strand Miracle Leagues
UPDATE organizations SET description = 'Sports and activities: Baseball; basketball; cheer; dance; bowling; flag football; golf; soccer; tennis; swim lessons. Athletes served: Individuals with disabilities, with a buddy for each player.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '05f17dfe-984d-40bb-85e9-33e0f119333b' AND (description IS NULL OR description = '');

-- Waypoint Adventure
UPDATE organizations SET description = 'Sports and activities: Hiking; ropes course; rock climbing; kayaking; canoeing; snowshoeing; tandem cycling; backpacking. Athletes served: People with intellectual, physical and social emotional disabilities, from moderate to severe.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ada2ce78-640d-4c7a-b157-0f226645e35b' AND (description IS NULL OR description = '');

-- Team River Runner - Fort Belvoir
UPDATE organizations SET description = 'Sports and activities: Kayaking; paddle sports. Athletes served: Veterans, their families and friends.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ef87e9ba-fc79-4631-8c99-c8b4eafece62' AND (description IS NULL OR description = '');

-- Bay Area Outreach & Recreation Program
UPDATE programs SET description = 'Sports and activities: Wheelchair basketball; wheelchair rugby; power soccer; goalball; pickleball; cycling; kayaking; climbing; fitness; outdoor adventures. Athletes served: Youth and adults with mobility and vision disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '349cac28-0917-4bc5-8d55-495825ed20ba' AND (description IS NULL OR description = '');

-- Southeastern Wisconsin Adaptive Ski Program
UPDATE programs SET description = 'Sports and activities: Alpine skiing; snowboarding. Athletes served: People with all types of disabilities, including physical disabilities, brain injury, intellectual disability, autism, blind or low vision, and Deaf or hard of hearing.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f6dad335-a0e3-4daf-a2e1-2de726f0f8f7' AND (description IS NULL OR description = '');

-- SportsAbility Alliance (Florida Disabled Outdoors Association)
UPDATE programs SET description = 'Sports and activities: Baseball; tennis; kickball; fishing; adaptive sports expos. Athletes served: People of all ages and all disabilities, children and adults, and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e209699b-0753-4d25-972e-d3905c8942b2' AND (description IS NULL OR description = '');

-- Achilles Arkansas
UPDATE programs SET description = 'Sports and activities: Running; walking; cycling; endurance events. Athletes served: People of all ages with disabilities, including blindness or low vision, deafness or hard of hearing, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injuries and traumatic brain injuries, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd139c166-6138-4873-a341-4e6adf6dd7fe' AND (description IS NULL OR description = '');

-- Achilles Chicago
UPDATE programs SET description = 'Sports and activities: Running; walking; cycling; endurance events. Athletes served: People of all ages with disabilities, including blindness or low vision, deafness or hard of hearing, cognitive, developmental and intellectual disabilities, lower limb differences, multiple sclerosis, cerebral palsy, spinal cord injuries and traumatic brain injuries, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ad38ec0c-b2f6-4b09-853f-7b2c17dea322' AND (description IS NULL OR description = '');

-- Achilles Charlotte
UPDATE programs SET description = 'Sports and activities: Running; walking; cycling; endurance events. Athletes served: People of all ages with disabilities, including blindness or low vision, deafness or hard of hearing, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injuries and traumatic brain injuries, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6b4744c7-021c-48f1-ab47-65f8910505db' AND (description IS NULL OR description = '');

-- Achilles Utah
UPDATE programs SET description = 'Sports and activities: Running; walking; cycling; endurance events. Athletes served: People of all ages with disabilities, including blindness or low vision, deafness or hard of hearing, cognitive, developmental and intellectual disabilities, limb loss, multiple sclerosis, cerebral palsy, spinal cord injuries and traumatic brain injuries, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '05a963bc-6453-40eb-bc4e-d17a663b9171' AND (description IS NULL OR description = '');

-- Achilles Pikes Peak
UPDATE programs SET description = 'Sports and activities: Running; walking; cycling; endurance events. Athletes served: People of all ages with disabilities, including blindness or low vision, deafness or hard of hearing, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injuries and traumatic brain injuries, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3fa17519-43c7-50ed-bc73-20fb38f50b4a' AND (description IS NULL OR description = '');

-- Adaptive Adventures Paralympic Sport Front Range
UPDATE programs SET description = 'Sports and activities: Skiing; snowboarding; cycling; dragon boat racing; kayaking; paddleboarding; rock climbing; waterskiing; wakeboarding; whitewater rafting. Athletes served: Children and youth ages 6 to 20 and adults with physical disabilities, injured veterans and active duty military, and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c19c444c-afa1-42e7-adbf-0014894c4151' AND (description IS NULL OR description = '');

-- Access Mammoth
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; Nordic skiing; snowboarding; kayaking; paddleboarding; mountain biking; road cycling; hiking. Athletes served: Kids, adults and seniors of all abilities, including people with physical, sensory or cognitive disabilities, and injured, ill or wounded veterans and service members.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b1928916-d445-48f1-8995-d30ce0993cd0' AND (description IS NULL OR description = '');

-- Adaptive Climbing Group
UPDATE organizations SET description = 'Sports and activities: Indoor climbing; outdoor climbing; youth climbing; competitive paraclimbing. Athletes served: Children and adults with permanent physical, mental or developmental disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7e241540-104c-42a6-afe7-515145384cb9' AND (description IS NULL OR description = '');

-- Adaptive Sports Association – Durango
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; sit skiing; snowboarding; overnight camping; cycling; canoeing; kayaking; whitewater rafting; indoor rock climbing. Athletes served: Children and adults with cognitive and physical disabilities, and military veterans with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'db87d0ad-5c36-4084-a0ce-6a6b896c2fde' AND (description IS NULL OR description = '');

-- Adventure Amputee Camp
UPDATE organizations SET description = 'Sports and activities: Whitewater rafting; ropes courses; zip lining; water skiing; snow skiing; snowboarding; tubing; swimming; scuba diving; adaptive cycling; tennis; basketball; yoga; ice skating. Athletes served: Children ages 8 to 17 with amputations or limb differences.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f1963571-1ec3-49f6-ab77-ddfd6c762d6f' AND (description IS NULL OR description = '');

-- Arizona Disabled Sports – Paralympic Sport Mesa
UPDATE organizations SET description = 'Sports and activities: Archery; bowling; cycling; kayaking; power soccer; swimming; track and field; goalball; air rifle; adaptive dance; pickleball; bocce; basketball; golf; floor hockey; cheerleading; soccer; paddleboarding; hiking. Athletes served: Athletes ages 6 and up with physical disabilities, including cerebral palsy, spinal cord injury, spina bifida, amputation, traumatic brain injury, muscular dystrophy and visual impairment, and people ages 8 and up with intellectual or developmental disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '549a71f6-5100-4536-b6dc-7c1993d8cda7' AND (description IS NULL OR description = '');

-- Break The Barriers, Inc.
UPDATE organizations SET description = 'Sports and activities: Aquatics; archery; dance; aerial silks; gymnastics; tumbling; martial arts; parkour; trampoline; cheer; health and fitness. Athletes served: Children and adults of all abilities and ages, including veterans and active duty military.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6d640a0e-d51d-4b1c-a733-c58e62d57414' AND (description IS NULL OR description = '');

-- Capital Rowing Club – Paralympic Sport Washington, D.C.
UPDATE organizations SET description = 'Sports and activities: Rowing; sculling; sweep rowing. Athletes served: People of all ages and abilities, including rowers with spinal cord injuries, amputations, degenerative diseases, and visual or cognitive impairments.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fc965b14-deff-42d4-9aa0-bd1e73e12723' AND (description IS NULL OR description = '');

-- Challenged Athletes of West Virginia – Mountaineer
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; handcycling; adaptive cycling; whitewater rafting; camping. Athletes served: Children and adults with physical and cognitive disabilities, from age four to senior citizens.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0570c6ef-5821-4693-b576-522f16f9a4e4' AND (description IS NULL OR description = '');

-- City of Chattanooga, Parks & Recreation – Therapeutic Recreation
UPDATE organizations SET description = 'Sports and activities: Recreational therapy programs. Athletes served: Youth and adults with physical, cognitive or emotional disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd84918a6-4305-472a-9c79-22e91e7cb954' AND (description IS NULL OR description = '');

-- City of Pasadena – Verne Cox Center
UPDATE organizations SET description = 'Sports and activities: Fitness classes; swimming; wheelchair sports; wheelchair basketball; community outings; cultural arts; summer day camps; afterschool programs. Athletes served: People ages 5 to 95 with any type of physical or intellectual disability.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8e7ca741-5358-427d-a008-87a52ce99f76' AND (description IS NULL OR description = '');

-- C.O.R.E. Centers, LLC
UPDATE organizations SET description = 'Sports and activities: Restorative exercise; personal training; fitness programs. Athletes served: People of all fitness and ability levels, including people with amputations, cerebral palsy, multiple sclerosis, muscular dystrophy, spinal cord injury, spina bifida, stroke, traumatic brain injury and other disabling conditions, and seniors.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '49d51c6b-df0d-42be-8edc-624ca32f9d05' AND (description IS NULL OR description = '');

-- Courage Kenny Rehabilitation Institute – Twin Cities
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; Nordic skiing; bowling; golf; power soccer; rock climbing; scuba diving; swimming; tennis; track and field; water skiing; wheelchair basketball; wheelchair lacrosse; wheelchair rugby. Athletes served: Youth and adults of all ages and abilities, including injured veterans with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3d82c0f6-0815-4711-b459-2895d8a70602' AND (description IS NULL OR description = '');

-- DC Fire Fighters Burn Foundation
UPDATE organizations SET description = 'Sports and activities: Swimming; boating; ropes courses; archery; arts; skiing; outdoor adventure retreats; peer support. Athletes served: Burn survivors, including children ages 8 to 18, adults and injured firefighters, and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b2a57b7b-381f-45b8-aa47-ec913319af19' AND (description IS NULL OR description = '');

-- Disabled Sports USA Los Angeles – The Unrecables
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; sit skiing. Athletes served: People with physical, intellectual, hearing and visual disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '31e332a5-fb00-40f4-ab40-9f974390bc14' AND (description IS NULL OR description = '');

-- Fencing Institute of Texas
UPDATE organizations SET description = 'Sports and activities: Fencing; foil; epee; wheelchair fencing; blind fencing; historical fencing. Athletes served: Youth and adults from age 6 to seniors, including wheelchair fencers and blind fencers.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '14c05816-e943-4f39-8632-c8f4e74b6e0b' AND (description IS NULL OR description = '');

-- Fundraise With Your School
UPDATE organizations SET description = 'Sports and activities: School clubs; school presentations; classroom inclusion projects. Athletes served: Schools and students, to include students with physical disabilities in sports.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6305d3df-5f07-496d-815a-26646db90f40' AND (description IS NULL OR description = '');

-- Granite State Adaptive
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; sit skiing; adaptive cycling; handcycling; adaptive riding; para equestrian dressage; hippotherapy; equine assisted activities. Athletes served: Children and adults with disabilities, ages 3 and up, including people with autism, amputations, stroke, spinal cord injury, visual impairment, traumatic brain injury, cerebral palsy, Down syndrome and spina bifida.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6d5655cc-74af-4496-b836-f7b50af515fe' AND (description IS NULL OR description = '');

-- Katie’s Komets
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball. Athletes served: Youth with lower limb impairments and other physical disabilities in the Philadelphia area.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0a217daa-5f65-4f70-84f2-f2a4b9af2b06' AND (description IS NULL OR description = '');

-- MAPVA Chargers
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball. Athletes served: Wheelchair basketball players on an NWBA Division I team.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6aa1f37f-14aa-4b58-8891-4eab764756d5' AND (description IS NULL OR description = '');

-- Miami Beach Watersports Center – Paralympic Sport South Florida
UPDATE organizations SET description = 'Sports and activities: Adaptive rowing; para rowing. Athletes served: Athletes with disabilities in South Florida, for recreational and competitive rowing.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c84cfa55-3b53-4c2d-880f-e3c4a4733f15' AND (description IS NULL OR description = '');

-- Milwaukee Recreation Department
UPDATE organizations SET description = 'Sports and activities: Basketball; bocce; bowling; flag football; indoor track and field; soccer; track and field; volleyball. Athletes served: Milwaukee Public Schools students ages 6 to 21 with disabilities, including autism, hearing impairment, intellectual disability, orthopedic impairment and visual impairment.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '92e504de-835e-4f9a-bd87-b17714b7f832' AND (description IS NULL OR description = '');

-- Northeast Disabled Athletic Association – Burlington
UPDATE organizations SET description = 'Sports and activities: Sailing; sled hockey; power soccer; archery; biathlon; bocce; Nordic skiing; handcycling; kayaking; tennis; water skiing; wheelchair basketball. Athletes served: People with physical disabilities in Vermont.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'dd9c4b9b-a3d4-4e09-bc88-0c233f5e9adf' AND (description IS NULL OR description = '');

-- Northwest Association for Blind Athletes – Clark County
UPDATE organizations SET description = 'Sports and activities: Indoor rock climbing; bocce; goalball; swimming; aqua aerobics; running and walking; yoga; tai chi; strength training; Zumba; camps. Athletes served: Children, youth and adults of all ages and abilities who are blind or visually impaired.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e0e06400-f216-419f-b6ca-7b0848f6f856' AND (description IS NULL OR description = '');

-- One Chair At A Time
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; track and field; sports wheelchairs for athletes. Athletes served: Wheelchair users in need of sports wheelchairs, including youth athletes.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '27f69b0a-f713-48be-8e2c-685e4796033b' AND (description IS NULL OR description = '');

-- Paradox Sports
UPDATE organizations SET description = 'Sports and activities: Indoor rock climbing; outdoor rock climbing; ice climbing; mountaineering; youth climbing; competitive climbing. Athletes served: Mainly adults with physical disabilities, including amputation or limb difference, blindness, hearing impairment, spinal cord injury, neurological conditions, traumatic brain injury and PTSD, plus youth climbing sessions.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '599d8bab-9a37-4cc4-a103-713f0470b05b' AND (description IS NULL OR description = '');

-- PDX Fencing
UPDATE organizations SET description = 'Sports and activities: Sabre fencing. Athletes served: Youth and adults.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8e9949dd-f309-4d91-81d9-1295b4587c3f' AND (description IS NULL OR description = '');

-- Powered to Move
UPDATE organizations SET description = 'Sports and activities: Adapted fitness classes; handcycling; assisted running races; dance; boxing fitness; drumming. Athletes served: People of any age with intellectual, developmental or physical disabilities, including autism, Down syndrome, cerebral palsy and spina bifida.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ec067c07-0840-48e1-8fcb-a1ac55fa35b1' AND (description IS NULL OR description = '');

-- RISE Adaptive Sports – North Texas
UPDATE organizations SET description = 'Sports and activities: Boating; tubing; water skiing; canoeing; kayaking; wakesurfing; wakeboarding; fishing; wheelchair football; wheelchair rugby; camping; handcycling. Athletes served: People with disabilities and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0b225fd8-27c2-4c6a-850a-3a220bb7e366' AND (description IS NULL OR description = '');

-- SoCal Adaptive Sports
UPDATE organizations SET description = 'Sports and activities: Handcycling; boccia; hiking; yoga and meditation; basketball; tennis; pickleball; archery; sailing; ice skating; golf; hockey; bowling; wheelchair softball; wheelchair football. Athletes served: People with physical disabilities in Riverside County and other Southern California communities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f7384a71-ef3a-4138-ba9c-9d9cfd45084a' AND (description IS NULL OR description = '');

-- South East Association for Special Parks and Recreation
UPDATE organizations SET description = 'Sports and activities: Power soccer; golf; wheelchair table tennis; wheelchair softball; sled hockey; boccia; goalball; Alpine skiing; athletics; basketball; bocce; bowling; flag football; floor hockey; gymnastics; powerlifting; snowshoeing; soccer; softball; swimming; tennis; volleyball; health and fitness; art; music; day camps. Athletes served: Children, teens and adults with disabilities living in the member park districts, including athletes with physical disabilities and athletes with intellectual disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a33bd5c0-0636-4e53-8b27-76cfbee7ec5e' AND (description IS NULL OR description = '');

-- Special Olympics Hawaii
UPDATE organizations SET description = 'Sports and activities: Basketball; bocce; bowling; flag football; powerlifting; soccer; softball; swimming; track and field; unified sports. Athletes served: Children and adults with intellectual disabilities, and unified partners.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '07b9d5c0-b40e-4593-883f-772ae4749302' AND (description IS NULL OR description = '');

-- Springfield-Greene County Park Board – Springfield
UPDATE organizations SET description = 'Sports and activities: Baseball; bowling; disc golf; accessible bikes; ceramics; chair tai chi; dance; leather stamping. Athletes served: People with disabilities of all abilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'bcfeaaa9-caf3-4e2b-8dd7-b0483f4a6f0c' AND (description IS NULL OR description = '');

-- Team River Runner – Asheville
UPDATE organizations SET description = 'Sports and activities: Kayaking; adaptive paddle sports. Athletes served: Veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '84ba75d8-dd4f-4c43-bd62-8e9fa2c7ad3e' AND (description IS NULL OR description = '');

-- Team River Runner – Bozeman
UPDATE organizations SET description = 'Sports and activities: Kayaking; adaptive paddle sports. Athletes served: Veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2100bf8f-e03e-4ca8-bc34-a5de81215feb' AND (description IS NULL OR description = '');

-- Team River Runner – Ft. Belvoir
UPDATE organizations SET description = 'Sports and activities: Whitewater kayaking; rafting; inflatable kayaking; pool paddling sessions. Athletes served: Veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c58043de-aad0-4afb-9082-64c805f0178a' AND (description IS NULL OR description = '');

-- Team River Runner – Northeast Ohio
UPDATE organizations SET description = 'Sports and activities: Kayaking; adaptive paddle sports. Athletes served: Veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b5ff7dea-51a8-4b34-95bc-805029470258' AND (description IS NULL OR description = '');

-- Team River Runner – St. Louis
UPDATE organizations SET description = 'Sports and activities: Kayaking; whitewater kayaking; paddle sports. Athletes served: Veterans and service members, and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'cb6e1b97-2dd7-453f-be48-95cd413e578d' AND (description IS NULL OR description = '');

-- Telluride Adaptive Sports
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; snowshoeing; Nordic skiing; hiking; cycling; rock climbing; lake sports; horseback riding; tennis; racquet sports; fishing. Athletes served: People ages 4 and up with permanent disabilities, of all abilities, and active military and veterans with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3888493f-6271-4d91-8d8e-fbcb0b269f51' AND (description IS NULL OR description = '');

-- The Center for Individuals with Physical Challenges – Tulsa
UPDATE organizations SET description = 'Sports and activities: Adaptive cycling; adaptive climbing; air rifle; boccia; goalball; power soccer; wheelchair softball; wheelchair basketball; wheelchair racing; adaptive fitness; aquatic therapy; yoga; arts and crafts. Athletes served: Youth and adults with physical challenges, and people who are deaf or hard of hearing.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '887e676e-dad9-4ea2-b9e8-b2a64698c48a' AND (description IS NULL OR description = '');

-- Timpany Center, San Jose
UPDATE organizations SET description = 'Sports and activities: Swimming lessons; aqua fitness; land fitness classes; personal training. Athletes served: People of all ages, fitness and ability levels, in a center designed for people with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '268782cb-38e8-4d70-b7df-1fb87927a7a3' AND (description IS NULL OR description = '');

-- Turnstone Center – Fort Wayne
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; wheelchair rugby; power soccer; sled hockey; track and field; air rifle; boccia; cycling; open gym; camps; fitness and aquatics. Athletes served: Youth ages 5 and up, adults and veterans with physical, visual, intellectual or developmental disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f3450faa-b58f-471b-b8b3-3162641878c7' AND (description IS NULL OR description = '');

-- United States Driving for the Disabled, Inc.
UPDATE organizations SET description = 'Sports and activities: Carriage driving; para equestrian driving. Athletes served: People with physical disabilities in the United States and Canada.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3d041f5b-5619-49f4-b727-505682447b7b' AND (description IS NULL OR description = '');

-- West Suburban Special Recreation
UPDATE organizations SET description = 'Sports and activities: Aquatics; swim team; swim lessons; basketball; bocce; bowling; golf; gymnastics; powerlifting; snowshoeing; softball; track and field; volleyball; sports and fitness; social clubs; day camps; overnight trips. Athletes served: Children and adults of all ages with physical, mental or other disabilities in the partner communities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '88a251a6-26b2-4c84-ac78-e71575baf73b' AND (description IS NULL OR description = '');

-- World Triathlon – Paratriathlon
UPDATE organizations SET description = 'Sports and activities: Paratriathlon (swim, bike, run). Athletes served: Athletes with physical or visual impairments, including wheelchair users.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b5811449-8e99-4366-afeb-254005fcf414' AND (description IS NULL OR description = '');

-- ACCESS of Wilmington
UPDATE organizations SET description = 'Sports and activities: Baseball; adapted fitness; walking club; pickleball; volleyball; adaptive cycling; kayaking; surfing; basketball; field trips. Athletes served: Children and adults with physical, intellectual and invisible disabilities, ages 3 and up, plus veterans with service connected disabilities and first responders.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '07cb76af-0630-4984-b7a6-63f6ba73ed95' AND (description IS NULL OR description = '');

-- North Carolina Adapted Sports
UPDATE organizations SET description = 'Sports and activities: Adaptive cycling; handcycling; climbing; kayaking; swimming; boccia; youth wheelchair basketball. Athletes served: Youth, teens and adults with physical disabilities in the Triangle area.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b5055a83-aa68-400c-8c8d-f8b8c066dc2a' AND (description IS NULL OR description = '');

-- Adaptive Ski Program
UPDATE programs SET description = 'Sports and activities: Alpine skiing; snowboarding; watersports; river rafting; archery; rock climbing. Athletes served: Children and adults with disabilities, with some programs for veterans and for family members and caregivers.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7b8db43e-1900-4e92-81e6-3c696a476b21' AND (description IS NULL OR description = '');

-- Lounsbury Adaptive Ski Program
UPDATE programs SET description = 'Sports and activities: Alpine skiing; sit skiing; mono skiing. Athletes served: Children, young adults and adults ages 5 and up with physical and cognitive disabilities, including spinal cord injury, amputation, Down syndrome, spina bifida, cerebral palsy, multiple sclerosis, traumatic brain injury, visual and hearing impairment, autism and developmental delay.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd81f31e3-378f-4dfd-ae0b-aeb85207374e' AND (description IS NULL OR description = '');

-- UCLA Adaptive Programs
UPDATE programs SET description = 'Sports and activities: Wheelchair basketball; adaptive sports and recreation. Athletes served: UCLA students, faculty and staff and Los Angeles community members, with and without disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a7e22239-6e00-4474-94ba-a48558223359' AND (description IS NULL OR description = '');

-- Mecklenburg County Park and Recreation Therapeutic & Inclusive Recreation
UPDATE programs SET description = 'Sports and activities: Therapeutic recreation programs; inclusion services. Athletes served: Youth, teens and adults with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '34f3e363-7b2e-4541-a6fa-0fb305af1d91' AND (description IS NULL OR description = '');

-- Outdoors for All Foundation (WA)
UPDATE programs SET description = 'Sports and activities: Alpine skiing; sit skiing; snowboarding; Nordic skiing; snowshoeing; adaptive cycling; kayaking; paddle boarding; rock climbing; hiking; camping; river rafting; yoga; day camps. Athletes served: Children and adults with disabilities, including people who use wheelchairs, amputees, and people with balance difficulties, hearing and visual impairments and developmental disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2fd06f8f-be76-5a74-a59d-3c1938157a50' AND (description IS NULL OR description = '');

-- Achilles Greater Phoenix
UPDATE programs SET description = 'Sports and activities: Running; walking; guided running; endurance races. Athletes served: People of all ages with disabilities, including blindness or low vision, deafness or hard of hearing, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injury and traumatic brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '25dd9849-efb9-4581-bb32-21420ad6e414' AND (description IS NULL OR description = '');

-- Achilles Kansas City
UPDATE programs SET description = 'Sports and activities: Running; walking; guided running; endurance races. Athletes served: People of all ages with disabilities, including blindness or low vision, deafness or hard of hearing, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injury and traumatic brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'cb204da1-7712-4319-a0c9-09cd85965e84' AND (description IS NULL OR description = '');

-- Achilles New Jersey
UPDATE programs SET description = 'Sports and activities: Running; walking; guided running; endurance races. Athletes served: People of all ages with disabilities, including blindness or low vision, deafness or hard of hearing, dwarfism, cognitive, developmental and intellectual disabilities, limb loss, multiple sclerosis, cerebral palsy, spinal cord injury and traumatic brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e55d73a5-b546-4e21-9914-f1522199f669' AND (description IS NULL OR description = '');

-- Achilles Tucson
UPDATE programs SET description = 'Sports and activities: Running; walking; guided running; endurance races. Athletes served: People of all ages with disabilities, including blindness or low vision, deafness or hard of hearing, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injury and traumatic brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '86fb6ddd-f719-5aaf-9333-5a3023a3d661' AND (description IS NULL OR description = '');

-- Achilles Austin
UPDATE programs SET description = 'Sports and activities: Running; walking; guided running; endurance races. Athletes served: People of all ages with disabilities, including blindness or low vision, deafness or hard of hearing, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injury and traumatic brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6399b0b5-f898-5072-9387-098f6d9eb67f' AND (description IS NULL OR description = '');

-- New England Nordic Ski Association, Maine
UPDATE programs SET description = 'Sports and activities: Nordic skiing; para Nordic skiing; sit skiing; rollerskiing. Athletes served: Para Nordic skiers, including sit skiers, standing skiers and skiers with visual impairments, alongside youth and adult Nordic skiers.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7badae23-251c-4453-b588-5344a517da56' AND (description IS NULL OR description = '');

-- AccesSport America
UPDATE organizations SET description = 'Sports and activities: Windsurfing; Hawaiian outrigger canoeing; stand up paddling; surfing; kayaking; cycling; soccer; tennis; strength and conditioning; gait training. Athletes served: Children and adults of all disabilities, and veterans facing physical or mental health challenges.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '96261081-78ae-4a03-bf1d-22a6ad1dc2c4' AND (description IS NULL OR description = '');

-- Adaptive CrossFit
UPDATE organizations SET description = 'Sports and activities: Adaptive strength and conditioning. Athletes served: Individuals with traumatic brain injury and/or physical disabilities, including people who use wheelchairs, have limb loss, or are blind.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2af7b089-245e-45fb-9d5b-d389f5f8c6e3' AND (description IS NULL OR description = '');

-- Adaptive Sports Iowa – Central Iowa
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; beep baseball; cycling; sled hockey; track and field; wheelchair tennis; airgun; adaptive fitness; kayaking; canoeing; paddleboarding; fishing. Athletes served: Iowans with physical or visual disabilities, from beginners to seasoned athletes, including veterans and youth.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8b905c04-d630-4a6c-8297-a3b3dc90a1dd' AND (description IS NULL OR description = '');

-- All Out Adventures
UPDATE organizations SET description = 'Sports and activities: Kayaking; stand up paddleboarding; canoeing; cycling; pickleball; camping; hiking; cross country skiing; sit cross country skiing; ice skating; sled skating; snowshoeing. Athletes served: People of all ages and abilities, including people with disabilities and their family and friends, people living with acquired or traumatic brain injury, seniors, and veterans; disabilities represented include limb difference, autism, blindness or low vision, multiple sclerosis, spinal cord injury, Parkinson''s, and intellectual disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '38e161d3-36c3-46c8-9e66-358c63c44692' AND (description IS NULL OR description = '');

-- Auburn University Office of Accessibility – Paralympic Sport Auburn
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; wheelchair tennis; power soccer. Athletes served: College student athletes with disabilities, plus a youth wheelchair basketball camp for ages 12 to 19 with a permanent lower extremity disability.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5566bec2-14f8-4e08-90ce-c826298e7ac4' AND (description IS NULL OR description = '');

-- Bicycling Blind Los Angeles
UPDATE organizations SET description = 'Sports and activities: Tandem cycling; online stoker meetups. Athletes served: Blind and visually impaired cyclists who ride as stokers, and the sighted tandem captains who ride with them.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7f7af9f3-efb2-4858-8afe-c47b5aa5cdf1' AND (description IS NULL OR description = '');

-- Brooks Rehabilitation Adaptive Sports and Recreation – Jacksonville
UPDATE organizations SET description = 'Sports and activities: Cycling; yoga; rugby; bowling; skeet shooting; bocce; horseback riding; kayaking; ice skating; golf; dance. Athletes served: People of all ages living with physical, cognitive, neurological, developmental or visual disabilities, including youth from newborn to 17.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '98298c40-ec50-4988-84ac-a6dc6517c684' AND (description IS NULL OR description = '');

-- Catch A Lift
UPDATE organizations SET description = 'Sports and activities: Personalized fitness training; nutrition coaching; wellness programming; peer support community. Athletes served: Post 9/11 combat injured veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '82f303e4-73db-47a6-b61d-c113044f8531' AND (description IS NULL OR description = '');

-- Charles T. Sitrin Health Care Center
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; biathlon; curling; adaptive paddling; wheelchair road racing; air rifle shooting. Athletes served: People with physical disabilities, at recreational and Paralympic levels.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9f602c7a-fd1e-4592-b39f-680b2b4927eb' AND (description IS NULL OR description = '');

-- Cincinnati Recreation Commission
UPDATE organizations SET description = 'Sports and activities: Therapeutic recreation programs; inclusion support in city recreation programs. Athletes served: Individuals with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5c54c566-679d-44e2-af88-91389c727c39' AND (description IS NULL OR description = '');

-- City of Phoenix Adaptive Recreation (Daring Adventures)
UPDATE organizations SET description = 'Sports and activities: Bowling; cheerleading; adaptive cooking classes; summer camp. Athletes served: Individuals with intellectual and physical disabilities, including youth ages 8 to 16 at summer camp.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9c0053e7-479f-415f-97ac-1c277cffac95' AND (description IS NULL OR description = '');

-- Craig Hospital Paralympic Sports
UPDATE organizations SET description = 'Sports and activities: Recreational therapy; paddleboarding; cycling; kayaking; nature hikes; gardening; adventure travel and outdoor recreation. Athletes served: Patients and former patients with spinal cord injury, brain injury or nervous system injury, and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'acb82e31-821b-4f82-b99b-2b0671c2d953' AND (description IS NULL OR description = '');

-- Georgia Blind Sports Association
UPDATE organizations SET description = 'Sports and activities: Goalball; beep baseball; blind soccer; kayaking; tandem cycling; audio darts. Athletes served: Blind and visually impaired youth and adults; youth players at least 13 years old.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ecc745d4-058f-4cb7-bd01-6499bcbf7211' AND (description IS NULL OR description = '');

-- Great Plains Chapter Paralyzed Veterans of America
UPDATE organizations SET description = 'Sports and activities: Adapted fitness; wheelchair bowling; air guns; archery; billiards; table tennis; power soccer; golf; youth art camp. Athletes served: Paralyzed veterans and other adults and children living with a disability, including people with spinal cord injury or multiple sclerosis; youth art camp for ages 6 and up with a physical disability.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '150519ca-3efc-4ebe-b835-b5f802d1973e' AND (description IS NULL OR description = '');

-- Heroes On The Water – DFW Chapter
UPDATE organizations SET description = 'Sports and activities: Kayak fishing; kayaking; family outdoor events. Athletes served: U.S. active duty military, veterans, law enforcement officers, first responders and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e4beeeed-0b37-4aa1-82d8-487a50a56a69' AND (description IS NULL OR description = '');

-- Ignite Adaptive Sports
UPDATE organizations SET description = 'Sports and activities: Downhill skiing; cross country skiing; snowboarding; snowshoeing; sit skiing; ski biking. Athletes served: People of all ages with disabilities in the Front Range of Colorado, including veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'efe5ec4d-05ba-4328-813b-ad6440c1b50a' AND (description IS NULL OR description = '');

-- Kennedy Krieger Institute – Bennett Institute Sports
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; ambulatory basketball; baseball; boccia; motor development and swim; power soccer; sailing; sled hockey; swimming; tennis; track and field; wheelchair floor hockey; soccer; football; lacrosse; golf. Athletes served: Children and teens ages 2 to 18 with physical disabilities, with some adult teams in sled hockey, swimming, track and wheelchair basketball.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fc8eec3d-b563-4755-adb0-ee81d1ef3cba' AND (description IS NULL OR description = '');

-- Lakeshore Foundation – Paralympic Sport Birmingham
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; power soccer; swimming; track and field; wheelchair rugby; boccia; para powerlifting; wheelchair football; wheelchair tennis; pickleball; adapted cycling; air rifle; archery; aquatics and fitness classes. Athletes served: Youth and adults with a wide range of physical disabilities and chronic health conditions, plus injured military, veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b8a8f78f-8b58-4638-a46f-afa4b5a6f96b' AND (description IS NULL OR description = '');

-- Louisiana GUMBO Inc – Paralympic Sport Louisiana
UPDATE organizations SET description = 'Sports and activities: Track and field. Athletes served: Children and adults ages 5 and up with physical, visual, hearing or intellectual disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '72e41bee-bca5-45c5-b3b7-37b5bf57dc7c' AND (description IS NULL OR description = '');

-- Marty Turcios Therapeutic Golf Foundation
UPDATE organizations SET description = 'Sports and activities: Adaptive golf; therapeutic golf clinics. Athletes served: Children, adults and veterans living with disabilities or recovering from injury.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '550348c7-fe9d-4c2d-9e8d-cb061536ad9e' AND (description IS NULL OR description = '');

-- Nashville Rowing – Freedom Rows
UPDATE organizations SET description = 'Sports and activities: Adaptive rowing; para rowing. Athletes served: Disabled veterans and members of the military, with para rowing open to people of all ages and abilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a592d06a-86da-4293-83a6-c61996142f37' AND (description IS NULL OR description = '');

-- Northeast DuPage Special Recreation Association
UPDATE organizations SET description = 'Sports and activities: Basketball; bocce; bowling; ice skating; floor hockey; golf; gymnastics; powerlifting; soccer; snowshoeing; softball; swimming; tennis; track and field; boccia; cultural arts; camps; veteran fitness and personal training. Athletes served: Youth and adults with intellectual disabilities, autism, physical disabilities and visual impairments, and veterans transitioning to civilian life.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '460d2164-873f-4901-924f-4ae5a59b653b' AND (description IS NULL OR description = '');

-- Operation Rebound
UPDATE organizations SET description = 'Sports and activities: Adaptive sports grants for equipment, competition and training; surf therapy. Athletes served: U.S. veterans, active duty military, law enforcement officers, firefighters and paramedics with permanent physical disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7780080a-8a32-4fd2-b510-a9ed782c82fc' AND (description IS NULL OR description = '');

-- Paralyzed Veterans of America
UPDATE organizations SET description = 'Sports and activities: Air guns; bass fishing; billiards; boccia; bowling; football; online programs; outdoors; paracycling; pickleball; trapshooting; wheelchair basketball; wheelchair rugby. Athletes served: Paralyzed and disabled veterans, including veterans living with spinal cord injury or disease, and their families and caregivers.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6d4a554e-4011-438d-823d-e1b9468c59af' AND (description IS NULL OR description = '');

-- Pennsylvania Center For Adapted Sports – Philadelphia
UPDATE organizations SET description = 'Sports and activities: Birding; climbing; cycling; indoor rowing; kayaking; rowing; sitting volleyball; skiing; snowboarding; triathlon; yoga; pickleball; swimming; track and field; virtual programs. Athletes served: Children and adults with disabilities, with a focus on veterans and young athletes.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '94a8261c-acb2-4b2c-85f0-1099dbed8f9e' AND (description IS NULL OR description = '');

-- Sea Scout Base Galveston Community Sailing
UPDATE organizations SET description = 'Sports and activities: Sailing; power boating; kayaking; fishing; adaptive sports. Athletes served: All people, especially youth, through adaptive sports and veterans programs.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f4df1f40-2a04-488a-b418-3d52f18dfa60' AND (description IS NULL OR description = '');

-- Shared Adventures Edited after approval: "families who have a child with a disability" -> "families of children with disabilities" (the site reads "a child" as an internal note and would hide the text).
UPDATE organizations SET description = 'Sports and activities: Kayaking; outrigger canoeing; scuba diving; beach wheelchair rides; rock climbing; archery; family camp. Athletes served: People of all ages living with physical and/or developmental disabilities, and families of children with disabilities ages 5 to 25.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'dbfc2e34-9b01-4197-9ec5-5246f1e58197' AND (description IS NULL OR description = '');

-- Southern Arizona Adaptive Sports
UPDATE organizations SET description = 'Sports and activities: Wheelchair softball; wheelchair basketball; wheelchair tennis; adaptive cycling; junior wheelchair sports; adaptive sports in schools. Athletes served: Children and adults with disabilities, at recreational and competitive levels.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '35563812-9b64-4df7-9b19-6f87c0cbb6e9' AND (description IS NULL OR description = '');

-- Special Olympics Illinois
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; artistic gymnastics; track and field; basketball; bocce; bowling; cornhole; equestrian; flag football; floor hockey; golf; powerlifting; rhythmic gymnastics; snowshoeing; soccer; softball; swimming; tennis; volleyball. Athletes served: Children and adults with intellectual disabilities, ages 8 and up in traditional sports and ages 2 to 7 in the young athletes program, plus unified partners without disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '1ad63975-35c3-485b-869b-a3c4ae346a15' AND (description IS NULL OR description = '');

-- Team River Runner Ft. Carson/Colorado Springs
UPDATE organizations SET description = 'Sports and activities: Sea kayaking; flatwater paddling; stand up paddleboarding; whitewater paddling; rafting. Athletes served: Active duty service members, veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c0b85653-26df-4309-bc45-e9e341f30a71' AND (description IS NULL OR description = '');

-- Team River Runner Menlo Park & Palo Alto
UPDATE organizations SET description = 'Sports and activities: Pool kayak instruction; sea kayaking; flatwater paddling; whitewater paddling; stand up paddleboarding; rafting. Athletes served: Active duty service members, veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '905b79f2-c5e7-4424-84f9-f4acf0b28dbc' AND (description IS NULL OR description = '');

-- Teton Adaptive Sports, Inc.
UPDATE organizations SET description = 'Sports and activities: Biking; paddling; paragliding; sailing; skiing; sled hockey; swimming; kids skiing; yoga. Athletes served: People with disabilities living in and visiting the Greater Teton Area, including kids.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2491dea6-5b14-4189-8fa4-28d2bafd01da' AND (description IS NULL OR description = '');

-- Therapeutic Adventures – Blue Ridge/Shenandoah
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; archery; backpacking; camping; canoeing; curling; cycling and hand cycling; fitness and conditioning; fly fishing; Nordic skiing; pickleball; racquetball; rock climbing; rowing; sailing; sea kayaking; shooting sports; sled hockey; snowboarding; snowshoeing; stand up paddleboarding; surfing; swimming; track and field; waterskiing; whitewater kayaking; wheelchair basketball; wheelchair tennis; yoga. Athletes served: People of all ages and abilities, including those with physical, developmental and intellectual disabilities, mental health conditions, and chronic or complex medical conditions.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e5a88309-4937-409c-80d5-cb4d08bc2155' AND (description IS NULL OR description = '');

-- United States Equestrian Federation
UPDATE organizations SET description = 'Sports and activities: Para dressage; para driving. Athletes served: Riders and drivers with physical disabilities, including disabled veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'da4bc284-5c3f-406f-a11d-7907fcbd0e71' AND (description IS NULL OR description = '');

-- University of Texas Arlington – Movin’ Mavs
UPDATE organizations SET description = 'Sports and activities: Wheelchair basketball; adapted track and field; adapted recreation; camps and clinics. Athletes served: UTA students with disabilities, plus student allies without disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8e3e2baf-0123-41bc-b739-78a59a05fe30' AND (description IS NULL OR description = '');

-- VETSports
UPDATE organizations SET description = 'Sports and activities: Softball; football; hockey; golf; volleyball; running; healthy living and fitness. Athletes served: Veterans, with healthy living resources also open to first responders, military and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f3116ece-0e86-4bb9-97ff-e4cd65d39ec3' AND (description IS NULL OR description = '');

-- Wheelchair & Ambulatory Sports, USA
UPDATE organizations SET description = 'Sports and activities: Archery; track and field; powerlifting; shooting; swimming; table tennis. Athletes served: Youth and adults with physical disabilities, both wheelchair users and ambulatory athletes.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '4264bf7e-2035-479a-b819-2b009306dbc3' AND (description IS NULL OR description = '');

-- Patriots for Disabled Divers
UPDATE organizations SET description = 'Sports and activities: Scuba diving. Athletes served: People with disabilities, especially disabled veterans, including people with PTSD, autism, paraplegia, quadriplegia and traumatic brain injury; also programs for caregivers.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '15dc9565-45bb-41c3-b887-c76fad9b1678' AND (description IS NULL OR description = '');

-- Chesapeake Region Accessible Boating (CRAB)
UPDATE organizations SET description = 'Sports and activities: Therapeutic sailing; family sails; group sails; radio controlled sailing; regattas; adaptive fishing. Athletes served: People with any disability, including cerebral palsy, deafness, Down syndrome, muscular dystrophy, blindness, autism, PTSD, brain injury, limb difference, paraplegia, quadriplegia and stroke, plus older adults, recovering warriors and youth from underserved communities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'dc9aa62d-7be8-42bf-8e98-3a26d8e7f433' AND (description IS NULL OR description = '');

-- Adaptive Sports Program New Mexico
UPDATE programs SET description = 'Sports and activities: Skiing; snowboarding; watersports; river rafting; archery; rock climbing. Athletes served: Children and adults with disabilities, including veterans, with some programs open to family members and caregivers.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'df8fbabf-3b90-444d-9fd6-aa94d5327492' AND (description IS NULL OR description = '');

-- Universal Access Program – Statewide
UPDATE programs SET description = 'Sports and activities: Adaptive rowing; tandem cycling; adaptive hiking; accessible beaches and skating rinks with adaptive equipment. Athletes served: Visitors of all abilities to Massachusetts state parks.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c99c6f55-ad7f-40d8-b43b-3681145918e3' AND (description IS NULL OR description = '');

-- COSTA Therapy, Inc.
UPDATE programs SET description = 'Sports and activities: Adaptive surf therapy. Athletes served: Veterans, first responders and service members.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9387cdc7-581e-429e-8945-bd6cef88141f' AND (description IS NULL OR description = '');

-- Outdoors For All Foundation (OR)
UPDATE programs SET description = 'Sports and activities: Downhill skiing; Nordic skiing; snowshoeing; cycling; hiking; camping; river rafting; kayaking; rock climbing; day camps; yoga. Athletes served: Children and adults with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3178a800-7371-420f-b6be-0afb0423fb45' AND (description IS NULL OR description = '');

-- Achilles Los Angeles
UPDATE programs SET description = 'Sports and activities: Running; walking; guided running; cycling; endurance races. Athletes served: People of all ages living with a disability, including blindness or low vision, deafness or hard of hearing, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injury and traumatic brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f236d283-bb97-4833-b840-339c486dd1f4' AND (description IS NULL OR description = '');

-- Achilles Boston
UPDATE programs SET description = 'Sports and activities: Running; walking; guided running; cycling; endurance races. Athletes served: People of all ages living with a disability, including blindness or low vision, deafness or hard of hearing, cognitive, developmental and intellectual disabilities, limb loss, multiple sclerosis, cerebral palsy, spinal cord injury and traumatic brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c3883b66-e01f-4dda-a1e0-5d4f7f64a6e7' AND (description IS NULL OR description = '');

-- Achilles Las Vegas
UPDATE programs SET description = 'Sports and activities: Running; walking; guided running; cycling; endurance races. Athletes served: People of all ages living with a disability, including blindness or low vision, deafness or hard of hearing, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injury and traumatic brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '65ae1bed-e304-4af2-93e8-05f9ac656446' AND (description IS NULL OR description = '');

-- Achilles San Diego
UPDATE programs SET description = 'Sports and activities: Running; walking; guided running; cycling; endurance races. Athletes served: People of all ages living with a disability, including blindness or low vision, deafness or hard of hearing, cognitive, developmental and intellectual disabilities, limb difference, multiple sclerosis, cerebral palsy, spinal cord injury and traumatic brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e11d381c-9800-5d8e-ad61-3e9c0c5578f7' AND (description IS NULL OR description = '');

-- Achilles Long Island
UPDATE programs SET description = 'Sports and activities: Running; walking; guided running; cycling; endurance races. Athletes served: People of all ages living with a disability, including blindness or low vision, deafness or hard of hearing, cognitive, developmental and intellectual disabilities, limb loss, multiple sclerosis, cerebral palsy, spinal cord injury and traumatic brain injury, and military veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '67aada0e-260d-5a23-9595-cf776952e3a1' AND (description IS NULL OR description = '');

-- New England Nordic Ski Association, Vermont
UPDATE programs SET description = 'Sports and activities: Para Nordic skiing; sit skiing; learn to ski clinics. Athletes served: Para Nordic skiers, including sit skiers, standing skiers and skiers who are visually impaired.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'cdb70473-8e29-4e4f-9502-cba4dbed338d' AND (description IS NULL OR description = '');

-- Breckenridge Outdoor Education Center (BOEC) (already listed; its approved description goes on the existing row).
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; Nordic skiing; snowshoeing; ski biking; rafting; rock climbing; hiking; cycling; canoeing; camping; high ropes course. Athletes served: Adults and children of all ability levels with physical and cognitive disabilities and sensory differences, including brain injury, multiple sclerosis, Parkinson''s disease, spinal cord injury and autism, and veterans and their families.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'eaacb362-f349-4e89-8391-31a667802fa0' AND (description IS NULL OR description = '');

-- National Sports Center for the Disabled (NSCD) (already listed; its approved description goes on the existing row).
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; ski biking; Nordic skiing; snowshoeing; fat tire snow biking; rock climbing; archery; air rifle; horseback riding; mountain biking; canoeing; kayaking; paddleboarding; sailing; whitewater rafting; hiking. Athletes served: Youth, teens, and adults with any type of disability, including veterans and active duty military living with disabilities.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f3488136-f4f5-46c9-936d-0c7a794621f0' AND (description IS NULL OR description = '');

-- Colorado Discover Ability (already listed; its approved description goes on the existing row).
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; cycling; rafting; kayaking; stand up paddleboarding; hiking; sled hockey; disc golf; horseback riding. Athletes served: Children and adults ages 4 and up with physical and cognitive disabilities, athletes with intellectual disabilities, families, and veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '63c9e62b-c605-4b14-bfcd-25a3ccb00078' AND (description IS NULL OR description = '');

-- Wasatch Adaptive Sports (already listed; its approved description goes on the existing row).
UPDATE organizations SET description = 'Sports and activities: Skiing; snowboarding; sit skiing; cycling; indoor cycling; mountain biking; paddle sports; yoga. Athletes served: People with disabilities in Utah, including veterans.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '529488d7-efee-4db0-84d6-cd3039bffdd6' AND (description IS NULL OR description = '');

-- Adaptive Sports Partners of the North Country (already listed; its approved description goes on the existing row).
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding; mountain biking; hiking; biking; Nordic skiing; rock climbing; swimming; gardening; bocce and boccia; golf; disc golf; bowling; kayaking; fly fishing; sailing. Athletes served: Athletes of all ages with physical, developmental, emotional, and behavioral disabilities in northern New Hampshire and Vermont''s Northeast Kingdom.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b554b41e-d820-47e6-bb3e-7481e28b4054' AND (description IS NULL OR description = '');

-- Summit Adaptive Sports (already listed; its approved description goes on the existing row).
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; Nordic skiing; snowboarding; sit skiing; hiking; kayaking; stand up paddleboarding; mountain biking; cross country biking; disc golf. Athletes served: Individuals with disabilities, including autism, ADHD, blind or low vision, deaf or hard of hearing, cerebral palsy, intellectual disability, traumatic brain injury, spinal cord injury, PTSD, anxiety and limb loss.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b7696d70-50f0-44e7-b979-64c3113a044d' AND (description IS NULL OR description = '');

-- Keystone Adaptive Center
UPDATE organizations SET description = 'Sports and activities: Alpine skiing; snowboarding. Athletes served: People with disabilities, including people who are blind or have low vision, autism, and learning delays, plus military ski and snowboard camps.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8ab489cb-07bc-4de8-9378-0e2af738ac90' AND (description IS NULL OR description = '');

-- Capital Region Nordic Alliance
UPDATE organizations SET description = 'Sports and activities: Biathlon; orienteering; snowshoeing; cross country skiing; Paralympic Nordic skiing. Athletes served: Veterans, adults and youth with disabilities, alongside the wider community.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'facba626-fdbd-4bb0-b7f2-06f383fad46f' AND (description IS NULL OR description = '');

-- Kinetic Kids – San Antonio
UPDATE organizations SET description = 'Sports and activities: Baseball; basketball; wheelchair basketball; soccer; swimming; tennis; track and field; archery; gymnastics; cheerleading; dance; flag football; golf; lacrosse; martial arts; pickleball; rock climbing; skateboarding; snow skiing; volleyball; cycling; fine arts. Athletes served: Children with disabilities, including those with spina bifida, autism and Down syndrome and those who use crutches, walkers or wheelchairs.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a10b1e03-2223-4db7-bdd9-79a067d99f60' AND (description IS NULL OR description = '');

-- Helen Woodward Animal Center Therapeutic Riding
UPDATE organizations SET description = 'Sports and activities: Therapeutic riding; equine assisted activities. Athletes served: Children and adults with disabilities, ages 4 and up.', updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fa4f5c71-e175-4fa4-945b-4a4290849f76' AND (description IS NULL OR description = '');


-- ===== new_listings_2026_10_21.sql
-- docs/data-fixes/descriptions-approved.md. Five programs not in the directory, each checked against every existing row by name and website.
-- INSERT OR IGNORE with a fixed id, and skipped if any row already has the website, so it is safe to run twice.

-- Vail Veterans Program: new listing, from its own site (https://www.vailveteransprogram.org/).
INSERT OR IGNORE INTO organizations (id, name, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT 'f034773a-2c25-59e3-98c4-4fbde6604faa', 'Vail Veterans Program', 'multi', '["Alpine skiing", "snowboarding", "rock climbing", "whitewater rafting", "horseback riding", "zip lining", "mountain biking", "fly fishing", "golf", "bowling", "yoga", "meditation"]', 'https://www.vailveteransprogram.org/', 'Vail', 'CO', 'Colorado', 'United States', 'Sports and activities: Alpine skiing; snowboarding; rock climbing; whitewater rafting; horseback riding; zip lining; mountain biking; fly fishing; golf; bowling; yoga; meditation. Athletes served: Wounded veterans with severe military service injuries, their families, and military caregivers.', 'unverified', 'active', 1, 'ASNM research 2026-10-21', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.vailveteransprogram.org/');

-- Double H Ranch - Adaptive Winter Sports Program: new listing, from its own site (https://www.doublehranch.org/adaptive-winter-sports-program/).
INSERT OR IGNORE INTO organizations (id, name, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT 'ebba825f-7da0-587e-8d8a-39ee618ff801', 'Double H Ranch - Adaptive Winter Sports Program', 'skiing', '["Alpine skiing", "snowboarding"]', 'https://www.doublehranch.org/adaptive-winter-sports-program/', 'Lake Luzerne', 'NY', 'New York', 'United States', 'Sports and activities: Alpine skiing; snowboarding. Athletes served: Children ages 6 to 16 living with chronic and serious illnesses, including campers on the autism spectrum and those with visual impairments.', 'unverified', 'active', 1, 'ASNM research 2026-10-21', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.doublehranch.org/adaptive-winter-sports-program/');

-- Wachusett Mountain Adaptive Program: new listing, from its own site (https://www.wachusett.com/lessons-rentals/lessons/adaptive-lessons/).
INSERT OR IGNORE INTO organizations (id, name, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '7c1f378a-7043-5a7b-9b20-fb31ed27004f', 'Wachusett Mountain Adaptive Program', 'skiing', '["Winter snow sports"]', 'https://www.wachusett.com/lessons-rentals/lessons/adaptive-lessons/', 'Princeton', 'MA', 'Massachusetts', 'United States', 'Sports and activities: Winter snow sports. Athletes served: People of all ages with physical, cognitive, hearing, visual and developmental disabilities.', 'unverified', 'active', 1, 'ASNM research 2026-10-21', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.wachusett.com/lessons-rentals/lessons/adaptive-lessons/');

-- City of Colorado Springs Therapeutic Recreation Program: new listing, from its own site (https://coloradosprings.gov/trp).
INSERT OR IGNORE INTO organizations (id, name, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '4dd9a05a-bcd6-50c2-a436-ede413d37b82', 'City of Colorado Springs Therapeutic Recreation Program', 'multi', '["Adaptive water skiing", "aquatics", "sports and fitness", "arts and culture", "social outings", "outdoor adventures"]', 'https://coloradosprings.gov/trp', 'Colorado Springs', 'CO', 'Colorado', 'United States', 'Sports and activities: Adaptive water skiing; aquatics; sports and fitness; arts and culture; social outings; outdoor adventures. Athletes served: Youth and adults with disabilities.', 'unverified', 'active', 1, 'ASNM research 2026-10-21', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://coloradosprings.gov/trp');

-- Judd Goldman Adaptive Sailing Program: new listing, from its own site (https://juddgoldmansailing.org/).
INSERT OR IGNORE INTO organizations (id, name, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT 'b8bacab7-2c4b-5202-92c3-d2e3c8860e38', 'Judd Goldman Adaptive Sailing Program', 'sailing', '["Sailing"]', 'https://juddgoldmansailing.org/', 'Chicago', 'IL', 'Illinois', 'United States', 'Sports and activities: Sailing. Athletes served: People with physical disabilities.', 'unverified', 'active', 1, 'ASNM research 2026-10-21', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://juddgoldmansailing.org/');


-- ===== locations_2026_10_21.sql
-- docs/data-fixes/descriptions-approved.md. One program row per place an organization actually runs, so a search near
-- Sugarbush or Bretton Woods finds it. Fixed ids with INSERT OR IGNORE, so it is safe to run twice. Once an organization
-- has listed programs, the site shows the programs in its place (src/data.js listingsSnapshot); its own page stays.

-- Vermont Adaptive at Pico Mountain. Evidence: vermontadaptive.org/locations: "Pico Mountain and Killington Resort, Killington". Who it's for: the approved text for Vermont Adaptive Ski and Sports.
INSERT OR IGNORE INTO programs (id, organization_id, name, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, created_at, updated_at)
  VALUES ('448409ae-c9f0-5f21-bc59-db1158f43ca3', '18a9facb-61f3-4246-8031-79a32a57e54d', 'Vermont Adaptive at Pico Mountain', 'skiing', '["Adaptive alpine skiing", "snowboarding", "canoeing", "kayaking", "stand up paddleboarding", "tandem cycling", "mountain biking"]', 'https://www.vermontadaptive.org/', 'Killington', 'VT', 'Vermont', 'United States', 'Sports and activities: Adaptive alpine skiing; snowboarding; canoeing; kayaking; stand up paddleboarding; tandem cycling; mountain biking. Athletes served: Youth and adults of all ages with physical, cognitive, developmental, intellectual, emotional or behavioral disabilities or neurodiversity, athletes who are blind or have low vision, and veterans with disabilities.', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now'));

-- Vermont Adaptive at Sugarbush. Evidence: vermontadaptive.org/locations: "Sugarbush Resort / Mt. Ellen, Waitsfield". Who it's for: the approved text for Vermont Adaptive Ski and Sports.
INSERT OR IGNORE INTO programs (id, organization_id, name, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, created_at, updated_at)
  VALUES ('b84aff41-ec2a-59fc-a84b-0ce718b565fe', '18a9facb-61f3-4246-8031-79a32a57e54d', 'Vermont Adaptive at Sugarbush', 'skiing', '["Adaptive alpine skiing", "snowboarding", "canoeing", "kayaking", "stand up paddleboarding", "tandem cycling", "mountain biking"]', 'https://www.vermontadaptive.org/', 'Waitsfield', 'VT', 'Vermont', 'United States', 'Sports and activities: Adaptive alpine skiing; snowboarding; canoeing; kayaking; stand up paddleboarding; tandem cycling; mountain biking. Athletes served: Youth and adults of all ages with physical, cognitive, developmental, intellectual, emotional or behavioral disabilities or neurodiversity, athletes who are blind or have low vision, and veterans with disabilities.', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now'));

-- Vermont Adaptive at Bolton Valley. Evidence: vermontadaptive.org/locations: "Bolton Valley Resort, Bolton". Who it's for: the approved text for Vermont Adaptive Ski and Sports.
INSERT OR IGNORE INTO programs (id, organization_id, name, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, created_at, updated_at)
  VALUES ('3a4ed219-ca1b-53f6-9ada-e6d933358585', '18a9facb-61f3-4246-8031-79a32a57e54d', 'Vermont Adaptive at Bolton Valley', 'skiing', '["Adaptive alpine skiing", "snowboarding"]', 'https://www.vermontadaptive.org/', 'Bolton', 'VT', 'Vermont', 'United States', 'Sports and activities: Adaptive alpine skiing; snowboarding. Athletes served: Youth and adults of all ages with physical, cognitive, developmental, intellectual, emotional or behavioral disabilities or neurodiversity, athletes who are blind or have low vision, and veterans with disabilities.', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now'));

-- Vermont Adaptive at Saskadena Six. Evidence: vermontadaptive.org/locations: "Saskadena Six (S6), Woodstock Inn & Resort, Pomfret". Who it's for: the approved text for Vermont Adaptive Ski and Sports.
INSERT OR IGNORE INTO programs (id, organization_id, name, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, created_at, updated_at)
  VALUES ('f88d8546-3f54-53eb-bcc9-bd99bde8bc1e', '18a9facb-61f3-4246-8031-79a32a57e54d', 'Vermont Adaptive at Saskadena Six', 'skiing', '["Adaptive alpine skiing", "snowboarding"]', 'https://www.vermontadaptive.org/', 'Pomfret', 'VT', 'Vermont', 'United States', 'Sports and activities: Adaptive alpine skiing; snowboarding. Athletes served: Youth and adults of all ages with physical, cognitive, developmental, intellectual, emotional or behavioral disabilities or neurodiversity, athletes who are blind or have low vision, and veterans with disabilities.', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now'));

-- Vermont Adaptive on Lake Champlain. Evidence: vermontadaptive.org/locations: "Lake Champlain / Burlington / Chittenden County Canoe, Kayak, Stand-up Paddle Boarding, Sailing, Tandem Cycling, Indoor Rock Climbing". Who it's for: the approved text for Vermont Adaptive Ski and Sports.
INSERT OR IGNORE INTO programs (id, organization_id, name, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, created_at, updated_at)
  VALUES ('559f3ff4-bd03-59c1-bc8b-c71172b6f3d4', '18a9facb-61f3-4246-8031-79a32a57e54d', 'Vermont Adaptive on Lake Champlain', NULL, '["Canoeing", "kayaking", "stand up paddleboarding", "sailing", "tandem cycling", "indoor rock climbing"]', 'https://www.vermontadaptive.org/', 'Burlington', 'VT', 'Vermont', 'United States', 'Sports and activities: Canoeing; kayaking; stand up paddleboarding; sailing; tandem cycling; indoor rock climbing. Athletes served: Youth and adults of all ages with physical, cognitive, developmental, intellectual, emotional or behavioral disabilities or neurodiversity, athletes who are blind or have low vision, and veterans with disabilities.', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now'));

-- New England Disabled Sports at Loon Mountain. Evidence: nedisabledsports.org about page: headquartered at Loon Mountain in Lincoln, NH. Who it's for: the approved text for New England Disabled Sports.
INSERT OR IGNORE INTO programs (id, organization_id, name, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, created_at, updated_at)
  VALUES ('bf035510-bb6e-55a6-b815-fee1ac590bdf', 'd2c13bb9-edc8-412e-845e-730e8fe50bb4', 'New England Disabled Sports at Loon Mountain', 'skiing', '["Adaptive alpine skiing", "snowboarding"]', 'https://nedisabledsports.org/', 'Lincoln', 'NH', 'New Hampshire', 'United States', 'Sports and activities: Adaptive alpine skiing; snowboarding. Athletes served: Children and adults ages 4 and up with physical, cognitive, hearing or visual disabilities, including autism, cerebral palsy, Down syndrome, spinal cord injury, traumatic brain injury and amputation, and veterans with disabilities.', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now'));

-- New England Disabled Sports at Bretton Woods. Evidence: nedisabledsports.org about page: a second site at Bretton Woods (town of Carroll, NH). Who it's for: the approved text for New England Disabled Sports.
INSERT OR IGNORE INTO programs (id, organization_id, name, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, created_at, updated_at)
  VALUES ('10f457cc-c848-52a0-8b8b-ae421406ce6c', 'd2c13bb9-edc8-412e-845e-730e8fe50bb4', 'New England Disabled Sports at Bretton Woods', 'skiing', '["Adaptive alpine skiing", "snowboarding"]', 'https://nedisabledsports.org/', 'Carroll', 'NH', 'New Hampshire', 'United States', 'Sports and activities: Adaptive alpine skiing; snowboarding. Athletes served: Children and adults ages 4 and up with physical, cognitive, hearing or visual disabilities, including autism, cerebral palsy, Down syndrome, spinal cord injury, traumatic brain injury and amputation, and veterans with disabilities.', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now'));

-- Eagle Mount at Big Sky Resort. Evidence: Big Sky Resort adaptive lessons page: "Big Sky Resort works with Eagle Mount to provide ski and snowboard lessons". Who it's for: the approved text for Eagle Mount Bozeman.
INSERT OR IGNORE INTO programs (id, organization_id, name, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, created_at, updated_at)
  VALUES ('083e3dde-8832-53f1-a90c-1c01713b3878', 'c7cccde6-1b05-46d5-9f80-ce501f45799a', 'Eagle Mount at Big Sky Resort', 'skiing', '["Adaptive alpine skiing", "snowboarding"]', 'https://eaglemount.org/', 'Big Sky', 'MT', 'Montana', 'United States', 'Sports and activities: Adaptive alpine skiing; snowboarding. Athletes served: Children, youth and adults with physical, developmental, cognitive or sensory disabilities, young people with cancer, and veterans with disabilities.', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now'));


-- ===== hijacked_links_clear.sql
-- docs/data-fixes/hijacked-links.md. URGENT: these links send visitors to gambling, spam or unrelated sites today.
-- Each UPDATE matches the row's id AND the hijacked link, so it is safe to run twice and skips a row someone already fixed.
-- Each UPDATE also sets updated_at, so the public "updated" date and the admin 24-hour count show the change.
-- The two new links (Alabama, Colorado) also get last_checked_at = NULL, as in usta_links_3_clear.sql, so the
-- validate lane checks them first. Rollback: docs/data-fixes/hijacked-links.md, "Rollback".
--
-- Result: 5 listings hide, 2 stay listed by town with no link, Alabama gets bamaadapted.com, Colorado gets cdagj.org.
-- This hides 5 public listings, so it waits for Alec's yes through Chief of Staff. The site reviewer (Faisal) runs it, not an agent.
--
-- Staging first, then live (docs/MAINTAINERS.md). Run db/maintenance/hijacked_links_check.sql before and after each:
--   npx wrangler d1 execute asnm-db-staging --remote --config wrangler.preview.json --file db/maintenance/hijacked_links_clear.sql
--   npx wrangler d1 execute asnm-db --remote --config wrangler.json --file db/maintenance/hijacked_links_clear.sql

-- Alabama Adapted Athletics: the old domain was taken over; its own site is bamaadapted.com ("Alabama Adapted - Official Athletics Website"), checked 2026-10-21.
-- Move United's directory lists bamaadapted.com for University of Alabama Adapted Athletics, and the site gives the UA Tuscaloosa address.
UPDATE organizations SET website_url = 'https://bamaadapted.com/', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f6b95ded-9dba-4a7c-a441-edd5b9c6406b' AND website_url = 'http://alabamaadapted.com/';

-- Coastal Carolina Adaptive Sports & Recreation: https://www.coastaladaptivesports.org/ was taken over (see the doc). No current site of its own was found.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'db949607-6858-4d28-86cd-e2897d7adb19' AND website_url = 'https://www.coastaladaptivesports.org/';

-- Colorado Discover Ability: the old domain was taken over; its own site is cdagj.org ("Home - Colorado Discover Ability"), checked 2026-10-21.
UPDATE organizations SET website_url = 'https://cdagj.org/', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '63c9e62b-c605-4b14-bfcd-25a3ccb00078' AND website_url = 'http://www.coloradodiscoverability.org';

-- Discovery Blind Sports: http://www.discoveryblindsports.org was taken over (see the doc). No current site of its own was found.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2412b1f2-b136-4e90-92bb-9589f71dfcf3' AND website_url = 'http://www.discoveryblindsports.org';

-- Michigan Adaptive Sports: https://www.michiganadaptivesports.com/ was taken over (see the doc). No current site of its own was found.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e0978514-3831-4cd5-8d0f-fb401b73cb96' AND website_url = 'https://www.michiganadaptivesports.com/';

-- Midwest Wheelchair Sport & Social Club: http://www.mdwssc.org was taken over (see the doc). No current site of its own was found.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b707d9db-e8d1-4cf3-89e2-3363b137ca09' AND website_url = 'http://www.mdwssc.org';

-- Sailing 4 All: http://www.gosailing4all.org was taken over (see the doc). No current site of its own was found.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b8e095b5-0d63-44e3-8bae-18dd3a15c905' AND website_url = 'http://www.gosailing4all.org';

-- Helping with Horsepower at Reclamation-Ranch: https://www.reclamation-ranch.com/ was taken over (see the doc). No current site of its own was found.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2c9cfcbc-1af5-5d8b-acf0-fc6a42cb8486' AND website_url = 'https://www.reclamation-ranch.com/';

-- New Freedom Farm: https://www.newfreedomfarm.org/ was taken over (see the doc). No current site of its own was found.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '3b4a166f-3a2b-51fc-b416-1974cb81a914' AND website_url = 'https://www.newfreedomfarm.org/';

-- Review queue. Two pending items were drafted from the hijacked pages; reject them so nobody approves them.
-- item_id is numbered separately in each database (AUTOINCREMENT) and these ids were read on live, so each
-- statement also matches the org, the lane and pending status. On a database where they don't all match (staging,
-- or an item already resolved) it changes nothing. lane 'enrich' is the lane that proposes email, town and ZIP
-- (src/lanes/enrich.js); hijacked_links_check.sql shows each item's lane before you run this.
-- Item 461: a betting company's email for Michigan Adaptive Sports.
UPDATE review_queue SET status = 'rejected', resolved_at = strftime('%Y-%m-%dT%H:%M:%SZ','now'), resolved_by = 'data fix: source page was hijacked' WHERE item_id = 461 AND organization_id = 'e0978514-3831-4cd5-8d0f-fb401b73cb96' AND lane = 'enrich' AND status = 'pending';
-- Item 301: an email, town and ZIP from a casino review site for Colorado Discover Ability.
UPDATE review_queue SET status = 'rejected', resolved_at = strftime('%Y-%m-%dT%H:%M:%SZ','now'), resolved_by = 'data fix: source page was hijacked' WHERE item_id = 301 AND organization_id = '63c9e62b-c605-4b14-bfcd-25a3ccb00078' AND lane = 'enrich' AND status = 'pending';
-- NOT changed here; a person decides each (docs/data-fixes/hijacked-links.md, "Review items left pending"):
-- classify 465 (Colorado) and 584 (Michigan), read off the hijacked domains; 657 (Midwest Wheelchair), read off
-- mdwssc.org on 2026-07-30, hijack date not proven; 293 (Discovery Blind Sports), matched on the listing's name,
-- not drafted from any page; validate 6, 674, 683 and 697, based on HTTP failures from the hijacked domains.


-- ===== dead_links_3_closed.sql
-- Waits for Alec's yes (through Chief of Staff). The site reviewer runs it, staging first. Hides each organization and its programs.
-- docs/data-fixes/dead-links.md. Each UPDATE matches the row's id AND its current link, so it is safe to run twice
-- and skips a row someone already changed.

-- Concord Fencing Club: closed or merged. Concord Monitor (July 2020): club at 126D Hall St shut its doors end of June 2020 due to pandemic revenue loss, planned to evaluate reopening. Domain no longer resolves; no evidenc Evidence: https://www.concordmonitor.com/2020/07/08/a-roundup-of-local-sports-briefs-news-and-announcements-35107317/
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'ce69f3bc-d819-4e04-8664-417d98647c20' AND is_public = 1 AND website_url = 'http://concordfencingclub.org';

-- Team River Runner – Salt Lake City: closed or merged. Team River Runner's current chapter list has no Utah or Salt Lake City chapter (Mountain West shows only Colorado chapters and Boise). Chapter appears inactive. Evidence: https://www.teamriverrunner.org/get-involved/chapters/
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '9f19f0b9-4436-40e3-9f33-b7648b1427de' AND is_public = 1 AND website_url = 'https://www.teamriverrunner.org/get-involved/chapters/utah-salt-lake-city/';

-- Simple Steps LLC: closed or merged. Company site is live but its locations page now lists only Florida, Texas and Virtual veteran outreach services; the Maryland location page is gone (404). Maryland service appears  Evidence: https://simplestepsllc.com/locations/
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd56fff12-184c-5325-a57f-03933bd5570f' AND is_public = 1 AND website_url = 'https://simplestepsllc.com/locations/maryland-veteran-outreach-services/';

-- Bart J Ruggiere Adaptive Sports Center – Manchester: closed or merged. Bart Adaptive Sports Center merged into Vermont Adaptive Ski & Sports (2025); now 'The Bart Center at Vermont Adaptive' at Bromley Mountain. Merger page on vermontadaptive.org. Evidence: https://www.vermontadaptive.org/bart-adaptive-merger/
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'fa911221-2427-4bcd-8d35-b18d9a48fd45' AND is_public = 1 AND website_url = 'https://www.bartadaptive.org/';

-- Virginia Beach Hockey Club Sled Team: closed or merged. virginiabeachhockeyclub.com now redirects to warriorforlifefund.org/programs/wflf-hockey-club/ (a 404), indicating the club folded into Warrior For Life Fund (Virginia Beach). WFLF Evidence: https://www.virginiabeachhockeyclub.com/
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '29bf986f-7137-41b5-91a6-874d7c71b047' AND is_public = 1 AND website_url = 'http://www.virginiabeachhockeyclub.com/vbhc-sled-team';

-- Sarasota Manatee Association for Riding Therapy (SMART): closed or merged. SMART merged with Hooves with HEART (2024) and now operates as SMART with HEART on its Bradenton campus; smartriders.org domain lapsed. New site title confirms the dba. Evidence: https://www.yourobserver.com/news/2024/nov/01/nonprofits-merge-equine-therapy
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '5db02ee1-38f0-51b9-813e-9cd8b4cbf3cb' AND is_public = 1 AND website_url = 'https://www.smartriders.org/';

-- STRAPS – San Antonio: closed or merged. Morgan's Sports page states the YMCA of Greater San Antonio began operating Morgan's Sports in April 2026; STRAPS is now part of the Hartman Family YMCA, with its own YMCA page. Evidence: https://morgans.org/morgans-sports/
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '256182cd-e48b-462d-bc9a-d64b73090eac' AND is_public = 1 AND website_url = 'https://morganswonderlandsports.sportngin.com/page/show/5555444-south-texas-regional-adaptive-and-para-sports';

-- Wheelchair Bucks: closed or merged. Old link was a GoFundMe. The NWBA team page that was the Milwaukee Wheelchair Bucks now carries the name WASA Marquette Eagles; WASA runs Milwaukee wheelchair basketball (Golden Ea Evidence: https://www.nwba.org/page/show/4318194-milwaukee-wheelchair-bucks
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a0456c20-c3ff-4b37-b043-b1d7e85a65d2' AND is_public = 1 AND website_url = 'https://www.gofundme.com/8hdew&aff=GFMse';


-- ===== dead_links_4_no_site.sql
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


-- ===== missing_data_3_closed.sql
-- docs/data-fixes/missing-data.md. Every UPDATE matches the row's id and only fills what is empty (or matches the
-- current value it replaces), so it is safe to run twice and skips anything someone already set.

-- Team River Runner – Houston: closed or merged. Listed URL now lands on the TRR home page. TRR's current chapter list shows only one Texas chapter (San Marcos); no Houston chapter. Evidence: https://www.teamriverrunner.org/get-involved/chapters/
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'a9278bb4-def9-4c96-8d5e-894a6da038b4' AND is_public = 1;

-- Team River Runner – Reno: closed or merged. Listed URL now lands on the TRR home page; current national chapter list has no Nevada/Reno chapter. Evidence: https://www.teamriverrunner.org/get-involved/chapters/
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '6220f136-f2a4-4424-b93e-ab7c73b95da5' AND is_public = 1;

-- Team River Runner – Battle Creek: closed or merged. The Battle Creek chapter URL now shows the Eaton Rapids, MI chapter; the chapter list's only Michigan entry is Eaton Rapids. Likely relocated/renamed. Evidence: https://www.teamriverrunner.org/get-involved/chapters/michigan-battle-creek/
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '91fc7802-ecf8-4b29-9ca8-f5f5dcfd0cba' AND is_public = 1;

-- Team River Runner – San Antonio: closed or merged. Listed URL lands on the TRR home page; current chapter list's only Texas chapter is San Marcos; no San Antonio chapter. Evidence: https://www.teamriverrunner.org/get-involved/chapters/
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b244348a-125d-4212-bf55-5f82b5510bd6' AND is_public = 1;

-- Team River Runner – Northport: closed or merged. Old node URL redirects to the TRR homepage; Northport is not on TRR's current chapter list (New York shows only Western NY and Hudson Valley). Likely inactive. Evidence: https://www.teamriverrunner.org/get-involved/chapters/
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7414974c-f29a-4b4e-9f30-51a4ff0f92bf' AND is_public = 1;

-- Team River Runner – Raleigh: closed or merged. Old node URL redirects to the TRR homepage; Raleigh is not on TRR's current chapter list. Likely inactive. Evidence: https://www.teamriverrunner.org/get-involved/chapters/
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'e6357c63-1250-46e3-a0f4-9609725aec35' AND is_public = 1;

-- Recreation Unlimited, Inc.: closed or merged. Recreation Unlimited became BASE (2019); possible duplicate of the BASE listing. Evidence: https://www.baseidaho.net/history
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'b071c472-d4b4-44ae-abb0-cb18d65e01b4' AND is_public = 1;

-- United States Quad Rugby Association: closed or merged. USQRA renamed USA Wheelchair Rugby; national governing body, town blank. Evidence: https://usawr.org/about/
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '2b9ed626-610d-45a4-a9c1-2e0875327e17' AND is_public = 1;

-- Team River Runner – Cincinnati / N. KY: closed or merged. National TRR site marks this chapter inactive. Evidence: https://www.teamriverrunner.org/get-involved/chapters/ohio-cincinnatinorthern-ky/
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'd05c70a5-ed9d-44fc-96d0-0d024865df99' AND is_public = 1;

-- Team River Runner Cincinnati OH/Northern KY: closed or merged. Same chapter as the 'Team River Runner – Cincinnati / N. KY' listing (likely duplicate). National TRR site marks it inactive. Evidence: https://www.teamriverrunner.org/get-involved/chapters/ohio-cincinnatinorthern-ky/
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '8216784e-8d3b-4554-8149-05fb7aa55870' AND is_public = 1;

-- Heart Ranch: closed or merged. Own homepage announces closing; co-founders retiring. Evidence: https://www.heartranch.org/
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'c9c36d61-280c-5743-830c-d50a7b213617' AND is_public = 1;

-- Urbana University Shooting Sports Club: closed or merged. Urbana University (a branch of Franklin University) closed in 2020, so its shooting sports club no longer exists. Evidence: https://apnews.com/general-news-1ee85e5ef2e87072584c52f58f4c5e64
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '7bec36e4-467b-48d8-a2d7-adf0a747bb08' AND is_public = 1;

-- Rogue Valley Scorpions Wheelchair Basketball: closed or merged. KTVL news, 2017-07-27. Evidence: https://ktvl.com/news/local/scorpions-wheelchair-basketball-ceases-operations
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '41c6ed48-c7ea-483e-8b23-bf11e5274d1e' AND is_public = 1;

-- Wheelchair Tennis Players Association: closed or merged. Historic national players' body (formed 1981 under the NFWT). Wheelchair tennis governance moved into the USTA in 1998. Not a local program; consider hiding. Evidence: https://assets.tenniscanada.com/production/PDFs/USTA-Grass-Roots-wheelchair-booklet.pdf
UPDATE organizations SET is_public = 0, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '0a2819dd-97bf-4fe0-ada3-5dc1848d94e2' AND is_public = 1;

