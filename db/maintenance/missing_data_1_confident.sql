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
