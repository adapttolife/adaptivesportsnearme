-- Adaptive pickleball across the US (docs/data-fixes/adaptive-pickleball.md). Researched 2026-10-26 from each organization's own page.
-- Safe to run twice: fixed ids with INSERT OR IGNORE, and each insert is skipped when the row already exists.
-- Organizations already listed that run adaptive pickleball: adds a Pickleball program on the organization's card (listing 'with_org', with seasons) and adds pickleball to its sports. NEEDS migration 0015 (docs/specs/programs-that-come-back.md).

-- Maine Adaptive Sports & Recreation: adaptive pickleball (South Portland, ME). Source: https://maineadaptive.org/tennis/
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '70239040-8dd6-517b-9958-2b8af1b2175a', '9c6141d8-4b6c-473e-8bf7-7bb16d44debe', 'Pickleball', 'Pickleball', 'pickleball', 'https://maineadaptive.org/tennis/', 'South Portland', 'ME', 'Maine', 'United States',
    'Maine Adaptive runs free adaptive pickleball lessons at the Wicked Pickle in South Portland, played standing or in a court sports chair, with equipment and instruction provided. The program is open to children and adults with a variety of disabilities.', '["summer", "fall"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '9c6141d8-4b6c-473e-8bf7-7bb16d44debe')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '9c6141d8-4b6c-473e-8bf7-7bb16d44debe' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '9c6141d8-4b6c-473e-8bf7-7bb16d44debe' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- Spaulding Adaptive Sports Centers (Spaulding Rehabilitation Network): adaptive pickleball (Salem, MA). Source: https://sasc.spauldingrehab.org/activitydescription.aspx?event=26493
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '6c19056b-3f2b-5b12-8cdb-51e9f45f7c4a', '97ea484c-ea50-4946-9466-011eac84c307', 'Pickleball', 'Pickleball', 'pickleball', 'https://sasc.spauldingrehab.org/activitydescription.aspx?event=26493', 'Salem', 'MA', 'Massachusetts', 'United States',
    'Spaulding Adaptive Sports Centers run coached indoor pickleball sessions in Salem and Plymouth with drills and game play, and court sport wheelchairs and all gear are provided. Sessions are for new and returning players of all abilities, playing seated or standing.', '["fall", "winter"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '97ea484c-ea50-4946-9466-011eac84c307')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '97ea484c-ea50-4946-9466-011eac84c307' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '97ea484c-ea50-4946-9466-011eac84c307' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- Special Olympics Massachusetts: adaptive pickleball (Mashpee, MA). Source: https://specialolympicsma.org/volunteer-job/mashpee-pickleball-volunteer-19cc0
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '749a42f8-8640-5cd1-981a-da1a23fbd9d3', 'd4885d36-d90a-4f44-bc49-460d8991ee83', 'Pickleball', 'Pickleball', 'pickleball', 'https://specialolympicsma.org/volunteer-job/mashpee-pickleball-volunteer-19cc0', 'Mashpee', 'MA', 'Massachusetts', 'United States',
    'Special Olympics Massachusetts runs seasonal pickleball clinics where athletes work on skills and drills from an instructor''s lesson plan, at sites including Mashpee, Peabody and Salisbury. Clinics are for athletes ages 16 and over, and no prior experience is needed.', '["spring", "summer", "fall", "winter"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = 'd4885d36-d90a-4f44-bc49-460d8991ee83')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = 'd4885d36-d90a-4f44-bc49-460d8991ee83' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = 'd4885d36-d90a-4f44-bc49-460d8991ee83' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- Gaylord Sports Association: adaptive pickleball (Wallingford, CT). Source: https://sportsassociation.gaylord.org/our-programs-at-gaylord-sports-association
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '38cd02b3-bafa-5403-acac-b60cf677d286', '51dcf29d-2c87-44ff-b08a-b2c75571cbca', 'Pickleball', 'Pickleball', 'pickleball', 'https://sportsassociation.gaylord.org/our-programs-at-gaylord-sports-association', 'Wallingford', 'CT', 'Connecticut', 'United States',
    'Gaylord Sports Association holds adaptive pickleball sessions at the Gaylord tennis courts from May through August, with coaching and sports chairs available to reserve. Sessions are for players of all ability and skill levels, standing or seated.', '["spring", "summer"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '51dcf29d-2c87-44ff-b08a-b2c75571cbca')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '51dcf29d-2c87-44ff-b08a-b2c75571cbca' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '51dcf29d-2c87-44ff-b08a-b2c75571cbca' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- STRIDE Adaptive Sports: adaptive pickleball (Glenville, NY). Source: https://www.stride.org/tennis-pickleball/
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '20042e50-d547-5994-985e-5bad64076f73', '37f5416f-53de-4c3d-bd6f-582f84326a31', 'Pickleball', 'Pickleball', 'pickleball', 'https://www.stride.org/tennis-pickleball/', 'Glenville', 'NY', 'New York', 'United States',
    'STRIDE Adaptive Sports runs a fall pickleball program on Sunday mornings at Indian Meadows Park in Glenville. It is part of STRIDE''s free and low cost adaptive sport lessons for people with disabilities ages 8 and up.', '["fall"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '37f5416f-53de-4c3d-bd6f-582f84326a31')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '37f5416f-53de-4c3d-bd6f-582f84326a31' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '37f5416f-53de-4c3d-bd6f-582f84326a31' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- Rochester Accessible Adventures: adaptive pickleball (East Rochester, NY). Source: https://rochesteraccessibleadventures.org/connecting-through-pickleball/
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT 'e1d9323c-e767-5e26-a2c4-73f63eb52f81', '11ac10b1-f3ae-4990-8be2-595f95905e39', 'Pickleball', 'Pickleball', 'pickleball', 'https://rochesteraccessibleadventures.org/connecting-through-pickleball/', 'East Rochester', 'NY', 'New York', 'United States',
    'Rochester Accessible Adventures offers free try it clinics, six week beginner courses and weekly drop in pickleball sessions at Dinkers Pickleball in East Rochester. The program is for people living with Parkinson''s disease and related disorders and their caregivers.', '["spring", "winter"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '11ac10b1-f3ae-4990-8be2-595f95905e39')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '11ac10b1-f3ae-4990-8be2-595f95905e39' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '11ac10b1-f3ae-4990-8be2-595f95905e39' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- Pennsylvania Center for Adapted Sports | PCAS: adaptive pickleball (Philadelphia, PA). Source: https://centeronline.com/pickleball
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT 'f61978b5-9230-5402-bdfd-d1551e22cc91', '046a3daf-0743-4ec2-9481-c738ae37a816', 'Pickleball', 'Pickleball', 'pickleball', 'https://centeronline.com/pickleball', 'Philadelphia', 'PA', 'Pennsylvania', 'United States',
    'PCAS runs small group adapted pickleball sessions with adapted equipment and beginner friendly court setups, and all equipment is provided. The program is for people with physical disabilities of all ages, and no experience is needed.', '["spring", "summer", "fall", "winter"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '046a3daf-0743-4ec2-9481-c738ae37a816')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '046a3daf-0743-4ec2-9481-c738ae37a816' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '046a3daf-0743-4ec2-9481-c738ae37a816' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- Brooks Rehabilitation Adaptive Sports and Recreation – Jacksonville: adaptive pickleball (Jacksonville, FL). Source: https://brooksadaptivesports.org/event/pickleball-2-2-2/2026-10-16/
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT 'acf01e14-aacd-507d-8d2b-afe2f606b5bd', '98298c40-ec50-4988-84ac-a6dc6517c684', 'Pickleball', 'Pickleball', 'pickleball', 'https://brooksadaptivesports.org/event/pickleball-2-2-2/2026-10-16/', 'Jacksonville', 'FL', 'Florida', 'United States',
    'Brooks Adaptive Sports and Recreation runs a recurring adaptive pickleball series at the Brooks Family YMCA. Sessions welcome players of all abilities and skill levels, with paddles and balls provided.', '["spring", "summer", "fall", "winter"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '98298c40-ec50-4988-84ac-a6dc6517c684')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '98298c40-ec50-4988-84ac-a6dc6517c684' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '98298c40-ec50-4988-84ac-a6dc6517c684' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- Buddy Up for Life: adaptive pickleball (Tampa, FL). Source: https://buddyupforlife.org/chapters/tampa-fl/
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '682dd32a-18e5-5cfc-8e5d-529d2c8f0512', '95b11bca-0c14-5038-86ff-c14cd342eb25', 'Pickleball', 'Pickleball', 'pickleball', 'https://buddyupforlife.org/chapters/tampa-fl/', 'Tampa', 'FL', 'Florida', 'United States',
    'The Tampa chapter of Buddy Up for Life runs Buddy Up Pickleball on Sunday mornings at Tampa Pickleball Crew, with ball control drills, pickleball instruction and one on one volunteer Buddy support. It is for athletes ages 12 and up with Down syndrome.', '["winter"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '95b11bca-0c14-5038-86ff-c14cd342eb25')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '95b11bca-0c14-5038-86ff-c14cd342eb25' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '95b11bca-0c14-5038-86ff-c14cd342eb25' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- Walton Options for Independent Living - Adaptive Sports: adaptive pickleball (North Augusta, SC). Source: https://waltonoptions.org/happy-people-play-pickleball/
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '598ed55f-e51d-514a-8beb-9f3aff7cd555', '867e2263-03cd-5462-989b-c052349cab69', 'Pickleball', 'Pickleball', 'pickleball', 'https://waltonoptions.org/happy-people-play-pickleball/', 'North Augusta', 'SC', 'South Carolina', 'United States',
    'Walton Options runs open accessible pickleball play on Sundays at Riverview Park Activities Center in North Augusta. Its adaptive sports program serves people with disabilities in the Augusta area.', '["spring", "summer", "fall", "winter"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '867e2263-03cd-5462-989b-c052349cab69')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '867e2263-03cd-5462-989b-c052349cab69' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '867e2263-03cd-5462-989b-c052349cab69' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- Special Olympics South Carolina: adaptive pickleball (Hilton Head Island, SC). Source: https://so-sc.org/event/2026-pickleball-invitational
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '264e05ff-9426-5bea-92e3-79ffb67ee68b', 'f00e6b2d-9f81-460d-b84c-c6ce42dd2599', 'Pickleball', 'Pickleball', 'pickleball', 'https://so-sc.org/event/2026-pickleball-invitational', 'Hilton Head Island', 'SC', 'South Carolina', 'United States',
    'Special Olympics South Carolina offers traditional and Unified pickleball with a state championship and an invitational. It is for athletes with intellectual disabilities and their Unified partners.', '["spring", "fall"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = 'f00e6b2d-9f81-460d-b84c-c6ce42dd2599')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = 'f00e6b2d-9f81-460d-b84c-c6ce42dd2599' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = 'f00e6b2d-9f81-460d-b84c-c6ce42dd2599' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- Special Olympics Virginia: adaptive pickleball (Richmond, VA). Source: https://www.specialolympicsva.org/sports/state-games/2025-fall-championships/fall-championships-pickleball-competition
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT 'f6313c7c-e525-5a80-a514-22902396d11c', 'd90ca313-1860-4c43-af7c-d53e5230f970', 'Pickleball', 'Pickleball', 'pickleball', 'https://www.specialolympicsva.org/sports/state-games/2025-fall-championships/fall-championships-pickleball-competition', 'Richmond', 'VA', 'Virginia', 'United States',
    'Special Olympics Virginia offers pickleball with a Fall Championships competition and a Team Virginia squad. It is for athletes with intellectual disabilities and Unified partners.', '["fall"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = 'd90ca313-1860-4c43-af7c-d53e5230f970')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = 'd90ca313-1860-4c43-af7c-d53e5230f970' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = 'd90ca313-1860-4c43-af7c-d53e5230f970' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- Special Olympics North Carolina: adaptive pickleball (Morrisville, NC). Source: https://sonc.net/sports-competitions/pickleball/
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT 'df9e9548-9b43-5884-8db2-cde8672cdc49', 'af464baa-a54d-4565-a408-afe9d8ba5ad9', 'Pickleball', 'Pickleball', 'pickleball', 'https://sonc.net/sports-competitions/pickleball/', 'Morrisville', 'NC', 'North Carolina', 'United States',
    'Special Olympics North Carolina trains athletes in pickleball and made it a statewide sport at the 2026 Fall Tournament. It is for athletes with intellectual disabilities of all ages and ability levels.', '["fall"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = 'af464baa-a54d-4565-a408-afe9d8ba5ad9')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = 'af464baa-a54d-4565-a408-afe9d8ba5ad9' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = 'af464baa-a54d-4565-a408-afe9d8ba5ad9' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- Special Olympics Tennessee: adaptive pickleball (Nashville, TN). Source: https://www.specialolympicstn.org/sports/state-games/pickelball-summer-games
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '5c4ad34f-a076-548c-9914-07cabeb7b235', '989908b8-3536-474b-a386-d326049693e6', 'Pickleball', 'Pickleball', 'pickleball', 'https://www.specialolympicstn.org/sports/state-games/pickelball-summer-games', 'Nashville', 'TN', 'Tennessee', 'United States',
    'Special Olympics Tennessee offers traditional and Unified pickleball with area competitions, Summer Games and a 2026 Team Tennessee squad. It is for athletes with intellectual disabilities.', '["summer"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '989908b8-3536-474b-a386-d326049693e6')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '989908b8-3536-474b-a386-d326049693e6' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '989908b8-3536-474b-a386-d326049693e6' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- GLASA Adaptive Pickleball: adaptive pickleball (Lake Forest, IL). Source: https://glasa.org/sports-programs/
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '66cfaf45-f452-5190-b4cc-525021ba901b', 'df48ba7e-d7fb-4a98-9f9d-0e79de1c40ee', 'Pickleball', 'Pickleball', 'pickleball', 'https://glasa.org/sports-programs/', 'Lake Forest', 'IL', 'Illinois', 'United States',
    'GLASA offers weekly pickleball practice with instruction on rules, strategy and technique, and sport chairs available on request. It is for youth, teens and adults who play from a wheelchair or standing.', '["spring", "summer", "fall", "winter"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = 'df48ba7e-d7fb-4a98-9f9d-0e79de1c40ee')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = 'df48ba7e-d7fb-4a98-9f9d-0e79de1c40ee' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = 'df48ba7e-d7fb-4a98-9f9d-0e79de1c40ee' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- Northern Illinois Special Recreation Association: adaptive pickleball (Crystal Lake, IL). Source: https://www.nisra.org/wp-content/uploads/2026-Fall-Brochure.pdf
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '3b2e0439-546c-53dd-8cc9-fb2504e132c8', '278bff6c-73ce-4565-98ec-ded225a73085', 'Pickleball', 'Pickleball', 'pickleball', 'https://www.nisra.org/wp-content/uploads/2026-Fall-Brochure.pdf', 'Crystal Lake', 'IL', 'Illinois', 'United States',
    'Northern Illinois Special Recreation Association offers a pickleball class that introduces the sport to its participants. It is for teens and adults age 16 and older served by NISRA.', '["summer", "fall"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '278bff6c-73ce-4565-98ec-ded225a73085')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '278bff6c-73ce-4565-98ec-ded225a73085' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '278bff6c-73ce-4565-98ec-ded225a73085' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- Maine-Niles Association of Special Recreation: adaptive pickleball (Morton Grove, IL). Source: https://mnasr.org/wp-content/uploads/2025/11/MNASR-winter-spring-2026-digital-brochure-final-1.pdf
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '3fde315f-de35-53d7-ac71-9418e8319537', '4c700811-51d7-47c1-af8d-d03fae1adbee', 'Pickleball', 'Pickleball', 'pickleball', 'https://mnasr.org/wp-content/uploads/2025/11/MNASR-winter-spring-2026-digital-brochure-final-1.pdf', 'Morton Grove', 'IL', 'Illinois', 'United States',
    'M-NASR runs a pickleball program held jointly with its physical and visual impairment area so the game can be adapted to each player. It is for participants with disabilities in the M-NASR service area.', '["spring", "winter"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '4c700811-51d7-47c1-af8d-d03fae1adbee')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '4c700811-51d7-47c1-af8d-d03fae1adbee' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '4c700811-51d7-47c1-af8d-d03fae1adbee' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- Northern Will County Special Recreation Association: adaptive pickleball (Romeoville, IL). Source: https://nwcsra.org/wp-content/uploads/2025/12/Winter-Spring-2026-Brochure-final-2025-12-16-Web.pdf
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '7fca1022-5430-5211-b684-206dd6dfc463', 'd1d70d1f-e6d1-42c2-932a-5fd6732b7ed9', 'Pickleball', 'Pickleball', 'pickleball', 'https://nwcsra.org/wp-content/uploads/2025/12/Winter-Spring-2026-Brochure-final-2025-12-16-Web.pdf', 'Romeoville', 'IL', 'Illinois', 'United States',
    'Northern Will County Special Recreation Association offers a weekly pickleball class where staff teach the basics, run drills and play games. It is for teens and adults age 16 and older with disabilities in its member communities.', '["spring", "winter"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = 'd1d70d1f-e6d1-42c2-932a-5fd6732b7ed9')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = 'd1d70d1f-e6d1-42c2-932a-5fd6732b7ed9' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = 'd1d70d1f-e6d1-42c2-932a-5fd6732b7ed9' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- Turnstone Center – Fort Wayne: adaptive pickleball (Fort Wayne, IN). Source: https://turnstone.org/about/blog/s-r-active-now
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT 'd2a63981-27be-5880-a465-aee4fd2111e7', 'f3450faa-b58f-471b-b8b3-3162641878c7', 'Pickleball', 'Pickleball', 'pickleball', 'https://turnstone.org/about/blog/s-r-active-now', 'Fort Wayne', 'IN', 'Indiana', 'United States',
    'Turnstone runs a weekly athlete led pickleball practice with parastanding and wheelchair divisions at the Turnstone Fieldhouse. It is for players age 12 and older with physical disabilities.', '["spring", "fall", "winter"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = 'f3450faa-b58f-471b-b8b3-3162641878c7')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = 'f3450faa-b58f-471b-b8b3-3162641878c7' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = 'f3450faa-b58f-471b-b8b3-3162641878c7' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- Mary Free Bed Wheelchair and Adaptive Sports – Grand Rapids: adaptive pickleball (Grand Rapids, MI). Source: https://www.maryfreebed.com/wp-content/uploads/2026/05/Brochure_RecConnect_Summer_5_26_Web.pdf
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '1335be72-91af-5fb4-85f7-1d02531e4410', 'ae200b8a-8b08-4ef1-972e-f5445d07d84e', 'Pickleball', 'Pickleball', 'pickleball', 'https://www.maryfreebed.com/wp-content/uploads/2026/05/Brochure_RecConnect_Summer_5_26_Web.pdf', 'Grand Rapids', 'MI', 'Michigan', 'United States',
    'Mary Free Bed Wheelchair and Adaptive Sports hosts a wheelchair pickleball series with the Grand Rapids Pickleball Club that teaches the basics and lots of play. It is for anyone age 15 and up with a physical disability who uses a wheelchair.', '["summer", "fall"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = 'ae200b8a-8b08-4ef1-972e-f5445d07d84e')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = 'ae200b8a-8b08-4ef1-972e-f5445d07d84e' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = 'ae200b8a-8b08-4ef1-972e-f5445d07d84e' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- Thrive Through Tennis Foundation: adaptive pickleball (Broadview Heights, OH). Source: https://www.thrivetennis.org/pages/index.cfm?siteid=23196
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '9ad1228b-e015-59c3-b164-84b8f59f02c9', 'b77f51ba-f2e7-501a-8e22-a7d062088219', 'Pickleball', 'Pickleball', 'pickleball', 'https://www.thrivetennis.org/pages/index.cfm?siteid=23196', 'Broadview Heights', 'OH', 'Ohio', 'United States',
    'Thrive Tennis runs a year round wheelchair tennis and adaptive pickleball program with no prior experience needed. It is for players age 13 and older who use a wheelchair.', '["spring", "summer", "fall", "winter"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = 'b77f51ba-f2e7-501a-8e22-a7d062088219')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = 'b77f51ba-f2e7-501a-8e22-a7d062088219' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = 'b77f51ba-f2e7-501a-8e22-a7d062088219' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- Wisconsin Adaptive Sports Association: adaptive pickleball (Brookfield, WI). Source: https://www.wasa.org/adaptive-pickleball
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '6f62500f-f797-5d8e-b464-24215cacaa04', '6963d01e-faff-479e-8489-83fcb9e01ddb', 'Pickleball', 'Pickleball', 'pickleball', 'https://www.wasa.org/adaptive-pickleball', 'Brookfield', 'WI', 'Wisconsin', 'United States',
    'WASA runs a year round wheelchair pickleball program started in 2023 and lends sport chairs so anyone can play. It is for players with physical, sensory or intellectual disabilities and welcomes able bodied players in a chair.', '["spring", "summer", "fall", "winter"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '6963d01e-faff-479e-8489-83fcb9e01ddb')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '6963d01e-faff-479e-8489-83fcb9e01ddb' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '6963d01e-faff-479e-8489-83fcb9e01ddb' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- City of Las Vegas Adaptive Recreation: adaptive pickleball (Las Vegas, NV). Source: https://www.lasvegasnevada.gov/Government/Departments/Parks-Recreation/Adaptive-Recreation
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '45969387-9ae2-5267-a41b-56c29c4b521a', 'd5124a56-5851-43b3-8c7e-9a387e474597', 'Pickleball', 'Pickleball', 'pickleball', 'https://www.lasvegasnevada.gov/Government/Departments/Parks-Recreation/Adaptive-Recreation', 'Las Vegas', 'NV', 'Nevada', 'United States',
    'City of Las Vegas Adaptive Recreation offers an inclusive pickleball program and pickleball for disabled veterans at Dula Community Center. It is for players of all abilities and experience levels.', '["spring", "summer", "fall", "winter"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = 'd5124a56-5851-43b3-8c7e-9a387e474597')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = 'd5124a56-5851-43b3-8c7e-9a387e474597' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = 'd5124a56-5851-43b3-8c7e-9a387e474597' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- National Ability Center | NAC: adaptive pickleball (Park City, UT). Source: https://nationalabilitycenter.org/program/inclusive-pickleball-league-in-park-city-utah/
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '5eee703e-9ef4-5a2d-80f3-cc4fb9bbdacd', 'b44de882-9103-45ff-953e-a6b51a22ada5', 'Pickleball', 'Pickleball', 'pickleball', 'https://nationalabilitycenter.org/program/inclusive-pickleball-league-in-park-city-utah/', 'Park City', 'UT', 'Utah', 'United States',
    'The National Ability Center runs an inclusive pickleball league in Park City with warm ups, skills and drills, and structured games using adapted rules. It is for players ages 4 and up with and without disabilities, grouped by age and ability.', '["spring", "summer", "fall", "winter"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = 'b44de882-9103-45ff-953e-a6b51a22ada5')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = 'b44de882-9103-45ff-953e-a6b51a22ada5' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = 'b44de882-9103-45ff-953e-a6b51a22ada5' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- Arizona Disabled Sports | AZDS: adaptive pickleball (Gilbert, AZ). Source: https://www.arizonadisabledsports.com/calendar-events/2026/10/1/pickleball
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT 'e6281da6-c6d6-5221-af2f-a0d812d38967', '160ad7a7-fbc5-40d0-b4ef-acebd41fae80', 'Pickleball', 'Pickleball', 'pickleball', 'https://www.arizonadisabledsports.com/calendar-events/2026/10/1/pickleball', 'Gilbert', 'AZ', 'Arizona', 'United States',
    'Arizona Disabled Sports holds pickleball sessions at Gilbert Regional Park as part of its adaptive sports programs. It is for people with physical disabilities.', '[]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '160ad7a7-fbc5-40d0-b4ef-acebd41fae80')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '160ad7a7-fbc5-40d0-b4ef-acebd41fae80' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '160ad7a7-fbc5-40d0-b4ef-acebd41fae80' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- The Center for Individuals with Physical Challenges – Tulsa: adaptive pickleball (Tulsa, OK). Source: https://www.tulsacenter.org/service/adaptive-sports/
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '34aa0417-2f92-5f97-b456-0f77fdbc40b4', '887e676e-dad9-4ea2-b9e8-b2a64698c48a', 'Pickleball', 'Pickleball', 'pickleball', 'https://www.tulsacenter.org/service/adaptive-sports/', 'Tulsa', 'OK', 'Oklahoma', 'United States',
    'The Center in Tulsa offers weekly pickleball on Wednesday afternoons as one of its adaptive sports for members. It is for children, teens, adults and seniors with physical disabilities.', '["spring", "summer", "fall", "winter"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '887e676e-dad9-4ea2-b9e8-b2a64698c48a')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '887e676e-dad9-4ea2-b9e8-b2a64698c48a' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '887e676e-dad9-4ea2-b9e8-b2a64698c48a' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- Salt Lake County Adaptive Recreation: adaptive pickleball (Midvale, UT). Source: https://adaptiverechub.org/events/wheelchair-pickleball/
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '779d912c-3edb-54d6-bdb6-5ef78f3809de', '751c5515-73e4-4653-8d1d-e1b1ae5e61c5', 'Pickleball', 'Pickleball', 'pickleball', 'https://adaptiverechub.org/events/wheelchair-pickleball/', 'Midvale', 'UT', 'Utah', 'United States',
    'Salt Lake County Parks and Recreation runs free drop in wheelchair pickleball every Wednesday evening at Copperview Recreation Center. It is open to all, with room for up to 40 participants.', '["spring", "summer", "fall", "winter"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '751c5515-73e4-4653-8d1d-e1b1ae5e61c5')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '751c5515-73e4-4653-8d1d-e1b1ae5e61c5' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '751c5515-73e4-4653-8d1d-e1b1ae5e61c5' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- Lone Star Paralysis Foundation | LSPF: adaptive pickleball (Austin, TX). Source: https://www.lonestarparalysis.org/adapted-sports
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '24c798b9-13ca-5c49-bf6b-0a9de787cae8', 'e5d3c8fa-20bb-4ad8-83eb-59a417535362', 'Pickleball', 'Pickleball', 'pickleball', 'https://www.lonestarparalysis.org/adapted-sports', 'Austin', 'TX', 'Texas', 'United States',
    'Lone Star Paralysis Foundation and Austin Adapted Sports hold wheelchair tennis and pickleball every Monday evening in Austin, with equipment provided. It is for people with paralysis and other disabilities at all experience levels.', '["spring", "summer", "fall", "winter"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = 'e5d3c8fa-20bb-4ad8-83eb-59a417535362')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = 'e5d3c8fa-20bb-4ad8-83eb-59a417535362' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = 'e5d3c8fa-20bb-4ad8-83eb-59a417535362' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- Tennis Buddies of Reno: adaptive pickleball (Reno, NV). Source: https://playtennis.usta.com/sierrajuniortennisassociation/Coaching/Course/7dcc1a64-e13b-4859-a333-6204309d3eb2
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '1525d93c-5bc5-5bfd-90ec-15ffdbbb2fa7', 'a9535abb-50e4-548e-bee2-423845220d75', 'Pickleball', 'Pickleball', 'pickleball', 'https://playtennis.usta.com/sierrajuniortennisassociation/Coaching/Course/7dcc1a64-e13b-4859-a333-6204309d3eb2', 'Reno', 'NV', 'Nevada', 'United States',
    'Tennis Buddies of Reno runs a winter indoor pickleball session at 3rd Shot Pickleball with a trained volunteer paired to each athlete. It is for youth and adults with developmental disabilities.', '["winter"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = 'a9535abb-50e4-548e-bee2-423845220d75')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = 'a9535abb-50e4-548e-bee2-423845220d75' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = 'a9535abb-50e4-548e-bee2-423845220d75' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- City of Los Angeles PlayLA Adaptive Sports: adaptive pickleball (Los Angeles, CA). Source: https://recreation.parks.lacity.gov/activity-details?activity_id=621226301
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '60963c9d-050f-5087-86aa-f5cd2de32479', '91254b36-ae06-4a46-84bb-4811c41aa0af', 'Pickleball', 'Pickleball', 'pickleball', 'https://recreation.parks.lacity.gov/activity-details?activity_id=621226301', 'Los Angeles', 'CA', 'California', 'United States',
    'LA Recreation and Parks runs free PlayLA All Abilities Pickleball classes at Westwood Recreation Center in eight week sessions. Classes are for youth ages 5 to 17 of all abilities, split into two age groups.', '["spring", "fall"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '91254b36-ae06-4a46-84bb-4811c41aa0af')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '91254b36-ae06-4a46-84bb-4811c41aa0af' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '91254b36-ae06-4a46-84bb-4811c41aa0af' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- Sports for Exceptional Athletes: adaptive pickleball (San Diego, CA). Source: https://www.s4ea.org/pickleball
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT 'e99413ff-ccf2-5544-bc29-f731a671d34d', 'e08f93bb-4dc3-4714-8a63-f772faa1dbd7', 'Pickleball', 'Pickleball', 'pickleball', 'https://www.s4ea.org/pickleball', 'San Diego', 'CA', 'California', 'United States',
    'Sports for Exceptional Athletes runs fall and spring pickleball seasons at Park de la Cruz with San Diego Parks and Recreation. It serves athletes with developmental and intellectual disabilities.', '["spring", "fall"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = 'e08f93bb-4dc3-4714-8a63-f772faa1dbd7')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = 'e08f93bb-4dc3-4714-8a63-f772faa1dbd7' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = 'e08f93bb-4dc3-4714-8a63-f772faa1dbd7' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- Special Olympics Washington: adaptive pickleball (None, WA). Source: https://specialolympicswashington.org/sports/pickleball/
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '9e2f8829-8b28-5273-8f32-6bee5db1fe39', 'e02175ed-e41a-4b9d-9993-ce4c4e31247f', 'Pickleball', 'Pickleball', 'pickleball', 'https://specialolympicswashington.org/sports/pickleball/', NULL, 'WA', 'Washington', 'United States',
    'Special Olympics Washington offers pickleball recreationally through local programs, with skills assessments and unified doubles play. It is for athletes with intellectual disabilities and their unified partners.', '["fall"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = 'e02175ed-e41a-4b9d-9993-ce4c4e31247f')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = 'e02175ed-e41a-4b9d-9993-ce4c4e31247f' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = 'e02175ed-e41a-4b9d-9993-ce4c4e31247f' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- Adaptive Sports Northwest | ASNW: adaptive pickleball (Portland, OR). Source: https://adaptivesportsnw.org/sports/pickleball/
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT 'ed4b2970-42bb-57c3-886c-41db37132994', '5802e432-7fb0-4614-8eae-0228cb9c7362', 'Pickleball', 'Pickleball', 'pickleball', 'https://adaptivesportsnw.org/sports/pickleball/', 'Portland', 'OR', 'Oregon', 'United States',
    'Adaptive Sports Northwest holds free adaptive pickleball nights at East Portland Community Center on the first and third Wednesday of each month. Players of all abilities, including wheelchair users, are welcome and friends and family can play alongside them.', '["spring", "summer", "fall", "winter"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '5802e432-7fb0-4614-8eae-0228cb9c7362')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '5802e432-7fb0-4614-8eae-0228cb9c7362' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '5802e432-7fb0-4614-8eae-0228cb9c7362' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');
