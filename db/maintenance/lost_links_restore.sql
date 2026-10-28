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
