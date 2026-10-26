-- Adaptive pickleball across the US (docs/data-fixes/adaptive-pickleball.md). Researched 2026-10-26 from each organization's own page.
-- Safe to run twice: fixed ids with INSERT OR IGNORE, and each insert is skipped when the row already exists.
-- Look first: each says what to check. Run only the ones that check out. Program inserts here need migration 0015.

-- LOOK FIRST: Same parks department as Exeter Parks and Recreation Adaptive Pickleball (file 1). Add this as a second program under that listing rather than a second organization.
-- Exeter Parks and Recreation Special Olympics Pickleball (Exeter, NH). Source: https://www.exeternh.gov/recreation/2026-special-olympics-pickleball
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT 'bf5dabe7-b9b6-5d6a-a9c1-be3339825cfa', 'Exeter Parks and Recreation Special Olympics Pickleball', 'Parks and recreation', 'Pickleball', 'pickleball', '["pickleball"]', 'https://www.exeternh.gov/recreation/2026-special-olympics-pickleball', 'Exeter', 'NH', 'New Hampshire', 'United States',
    'Exeter Parks and Recreation runs a free Wednesday morning pickleball program with Special Olympics New Hampshire, where volunteers teach and play at each participant''s pace. All are welcome, and registration is open to Exeter and nearby towns.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.exeternh.gov/recreation/2026-special-olympics-pickleball' OR (name = 'Exeter Parks and Recreation Special Olympics Pickleball' COLLATE NOCASE AND state = 'NH'));

-- LOOK FIRST: Own page lists the program but no dated sessions; its only 2026 evidence is equipment support credited on the Exeter town page, and its event listings found were 2021 to 2023.
-- Northeast Passage – Southern New Hampshire: adaptive pickleball (Durham, NH). Source: https://www.nepassage.org/court-sports
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '848f9b8e-783c-5ced-870c-2b3034bc349d', '3ceaf5c4-87b4-4b5e-9f0f-792ae8345daa', 'Pickleball', 'Pickleball', 'pickleball', 'https://www.nepassage.org/court-sports', 'Durham', 'NH', 'New Hampshire', 'United States',
    'Northeast Passage provides staff, instruction and sport wheelchairs for a series of wheelchair pickleball events through the year. The program is offered to individuals of all abilities, with standing and seated players welcome.', '[]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '3ceaf5c4-87b4-4b5e-9f0f-792ae8345daa')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '3ceaf5c4-87b4-4b5e-9f0f-792ae8345daa' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '3ceaf5c4-87b4-4b5e-9f0f-792ae8345daa' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- LOOK FIRST: Program page is live but its calendar did not load and shows no 2025 or 2026 session dates.
-- All Out Adventures: adaptive pickleball (Northampton, MA). Source: https://www.alloutadventures.org/programs/pickleball
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '5f757853-1fc4-5697-b994-36fc431927d8', '38e161d3-36c3-46c8-9e66-358c63c44692', 'Pickleball', 'Pickleball', 'pickleball', 'https://www.alloutadventures.org/programs/pickleball', 'Northampton', 'MA', 'Massachusetts', 'United States',
    'All Out Adventures runs a pickleball program with beginner sessions and games, using tennis chairs, paddle grip adaptations and colored balls. It is open to people of all ages and abilities, with priority for veterans and people with brain injuries.', '[]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '38e161d3-36c3-46c8-9e66-358c63c44692')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '38e161d3-36c3-46c8-9e66-358c63c44692' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '38e161d3-36c3-46c8-9e66-358c63c44692' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- LOOK FIRST: Confirmed only on the USA Pickleball adaptive directory (official partner) and December 2025 local news; no pickleball page found on the organization's own site.
-- Special Olympics Rhode Island: adaptive pickleball (Smithfield, RI). Source: https://usapickleball.org/adaptive/
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT 'fbc97692-7449-538f-af10-acb3af526644', '9981dcc4-b2b3-4faf-a48f-3847ac49402e', 'Pickleball', 'Pickleball', 'pickleball', 'https://usapickleball.org/adaptive/', 'Smithfield', 'RI', 'Rhode Island', 'United States',
    'Special Olympics Rhode Island offers a six week pickleball program in summer and fall. It serves people with intellectual and developmental disabilities.', '["summer", "fall"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '9981dcc4-b2b3-4faf-a48f-3847ac49402e')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '9981dcc4-b2b3-4faf-a48f-3847ac49402e' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '9981dcc4-b2b3-4faf-a48f-3847ac49402e' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- LOOK FIRST: The pickleball line has no year; the only date on the page is a Fall 2026 county therapeutic recreation newsletter heading. Confirm the 2026 session with the township.
-- Bernards Township Adaptive Pickleball (Basking Ridge, NJ). Source: https://www.bernards.org/recreation-page-list/534-adaptive-programs
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT 'e0b3080c-497b-55ca-a5e9-d66c7448a18c', 'Bernards Township Adaptive Pickleball', 'Parks and recreation', 'Pickleball', 'pickleball', '["pickleball"]', 'https://www.bernards.org/recreation-page-list/534-adaptive-programs', 'Basking Ridge', 'NJ', 'New Jersey', 'United States',
    'Bernards Township Recreation runs fall adaptive pickleball and basketball sessions as part of its adaptive programs. The programs are for township residents age 15 and older with developmental disabilities, with a caregiver staying on site.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.bernards.org/recreation-page-list/534-adaptive-programs' OR (name = 'Bernards Township Adaptive Pickleball' COLLATE NOCASE AND state = 'NJ'));

-- LOOK FIRST: Only a July 2025 announcement was found; the fall 2026 township clinic list does not include adaptive pickleball, so it may have been a one season offering.
-- Nutley Recreation Adaptive Pickleball Lessons (Nutley, NJ). Source: https://www.nutleynj.org/news/post/21403/
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT 'd4fde25d-c9d5-50e4-9c9c-99b6f537cd2d', 'Nutley Recreation Adaptive Pickleball Lessons', 'Parks and recreation', 'Pickleball', 'pickleball', '["pickleball"]', 'https://www.nutleynj.org/news/post/21403/', 'Nutley', 'NJ', 'New Jersey', 'United States',
    'The Township of Nutley Recreation Department offered summer adaptive pickleball lessons on Tuesdays at the Msgr. Owens Park courts with trained instructors. The lessons are for people of all abilities, including beginners building confidence on the court.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.nutleynj.org/news/post/21403/' OR (name = 'Nutley Recreation Adaptive Pickleball Lessons' COLLATE NOCASE AND state = 'NJ'));

-- LOOK FIRST: The live page lists a fall session without a year, and the launch post is dated May 25 with no year. The program is paid ($400 per 10 week session).
-- Montclair Pickleball Bergen County Adaptive Pickleball Academy (Fair Lawn, NJ). Source: https://www.montclairpickleballbc.com/adaptive-pickleball
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '3f5f4391-95d4-56a4-ac90-33183bd4df3d', 'Montclair Pickleball Bergen County Adaptive Pickleball Academy', 'Club', 'Pickleball', 'pickleball', '["pickleball"]', 'https://www.montclairpickleballbc.com/adaptive-pickleball', 'Fair Lawn', 'NJ', 'New Jersey', 'United States',
    'The Adaptive Pickleball Academy runs small group instructional clinics at Superdome Sports in Fair Lawn, led by coaches with special education experience and with a sensory friendly area. It is for children 10 to 17 and adults 18 and older with any level of ability or disability.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.montclairpickleballbc.com/adaptive-pickleball' OR (name = 'Montclair Pickleball Bergen County Adaptive Pickleball Academy' COLLATE NOCASE AND state = 'NJ'));

-- LOOK FIRST: Pickleball appears only as a checkbox on an undated registration form; no pickleball schedule found, and the 2024 summer schedule did not include it.
-- Burke Rehabilitation Hospital Adaptive Sports Pickleball (White Plains, NY). Source: https://www.burke.org/medical-services/adaptive-sports-recreation/
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT 'cca70310-a5c7-5c89-87dd-39a66dbf0d14', 'Burke Rehabilitation Hospital Adaptive Sports Pickleball', 'Hospital program', 'Pickleball', 'pickleball', '["pickleball"]', 'https://www.burke.org/medical-services/adaptive-sports-recreation/', 'White Plains', 'NY', 'New York', 'United States',
    'Burke Rehabilitation Hospital''s Therapeutic Recreation department runs adaptive sports and recreation programs and lists pickleball among the activities on its registration form. The programs are for adults with a disability or physical medicine diagnosis.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.burke.org/medical-services/adaptive-sports-recreation/' OR (name = 'Burke Rehabilitation Hospital Adaptive Sports Pickleball' COLLATE NOCASE AND state = 'NY'));

-- LOOK FIRST: The YMCA page lists the program but no dates; the latest dated clinic listings found were early 2025 on Active.com.
-- YMCA of Greater Brandywine Adaptive Pickleball (Downingtown, PA). Source: https://ymcagbw.org/adaptive-programs-ymca
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT 'd26442f5-7da4-5af6-b8e0-21ce1e8ee92b', 'YMCA of Greater Brandywine Adaptive Pickleball', 'Ymca', 'Pickleball', 'pickleball', '["pickleball"]', 'https://ymcagbw.org/adaptive-programs-ymca', 'Downingtown', 'PA', 'Pennsylvania', 'United States',
    'Adaptive Pickleball Clinics at the YMCA Pickleball Center at Downingtown help participants learn the game and make friends, with all equipment provided. The clinics are open to adults ages 18 and up with developmental disabilities.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://ymcagbw.org/adaptive-programs-ymca' OR (name = 'YMCA of Greater Brandywine Adaptive Pickleball' COLLATE NOCASE AND state = 'PA'));

-- LOOK FIRST: Annual fundraiser tournament held in White Marsh, not a regular program; the adult program page lists no weekly pickleball. Also duplicate org rows exist (6783a3b2, fc8eec3d).
-- Bennett Institute Physically Challenged Sports Prog. of Kennedy Krieger: adaptive pickleball (Baltimore, MD). Source: https://www.kennedykrieger.org/community/initiatives/physically-challenged-sports/for-adults/news-events
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '37fab5fb-778a-5144-9736-8fd48d30e991', '2f674a24-6bde-4652-ba8f-f149892586d9', 'Pickleball', 'Pickleball', 'pickleball', 'https://www.kennedykrieger.org/community/initiatives/physically-challenged-sports/for-adults/news-events', 'Baltimore', 'MD', 'Maryland', 'United States',
    'Kennedy Krieger holds an accessible pickleball tournament with a beginner clinic, games for all skill levels and mixed doubles with adaptive and non adaptive teams. It is for adaptive athletes and players of all levels, and no experience is needed.', '["fall"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '2f674a24-6bde-4652-ba8f-f149892586d9')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '2f674a24-6bde-4652-ba8f-f149892586d9' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '2f674a24-6bde-4652-ba8f-f149892586d9' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- NOT A SQL CHANGE. Special Olympics Maryland Anne Arundel County Pickleball (Severna Park, MD) is already listed as program e0c8f7e2-13bf-5be1-8053-fdcc8dc902a6, filed under 'Organization not yet assigned'. Its adaptive pickleball page: https://www.somd.org/local-programs/anne-arundel-county/ . When that program gets its organization, add pickleball there.

-- LOOK FIRST: Dates are listed only through May 2026; confirm whether the clinic continues. MACS is a national group that travels to host clinics.
-- Military Adaptive Court Sports Maryland Pickleball Clinic (Millersville, MD). Source: https://www.militaryadaptivecourtsports.org/events/maryland-pickleball-clinic-millersville-md
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '6bab87a6-31ab-50a8-a2f5-c47eeddfa98d', 'Military Adaptive Court Sports Maryland Pickleball Clinic', 'Veterans group', 'Pickleball', 'pickleball', '["pickleball"]', 'https://www.militaryadaptivecourtsports.org/events/maryland-pickleball-clinic-millersville-md', 'Millersville', 'MD', 'Maryland', 'United States',
    'Military Adaptive Court Sports holds a twice monthly adaptive pickleball clinic on Wednesdays at Putaway Pickleball in Millersville. It is for veterans and active duty service members with visible and invisible injuries.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.militaryadaptivecourtsports.org/events/maryland-pickleball-clinic-millersville-md' OR (name = 'Military Adaptive Court Sports Maryland Pickleball Clinic' COLLATE NOCASE AND state = 'MD'));

-- LOOK FIRST: A single three day clinic in April 2026, not a standing local program.
-- Military Adaptive Court Sports Pittsburgh Pickleball Clinic (Sewickley, PA). Source: https://www.militaryadaptivecourtsports.org/events/pittsburgh-pickleball-clinic
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '4ebf33f8-7198-517a-978c-6cc580948643', 'Military Adaptive Court Sports Pittsburgh Pickleball Clinic', 'Veterans group', 'Pickleball', 'pickleball', '["pickleball"]', 'https://www.militaryadaptivecourtsports.org/events/pittsburgh-pickleball-clinic', 'Sewickley', 'PA', 'Pennsylvania', 'United States',
    'Military Adaptive Court Sports held a free beginner pickleball clinic at Matts Pickle and Padel in Sewickley. It is for local veterans who want to learn the basics of the game.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.militaryadaptivecourtsports.org/events/pittsburgh-pickleball-clinic' OR (name = 'Military Adaptive Court Sports Pittsburgh Pickleball Clinic' COLLATE NOCASE AND state = 'PA'));

-- LOOK FIRST: Only news coverage of a single August 2025 event; the org's own USTA page is empty and no 2026 edition was found.
-- Wheelchair Tennis Program of Delaware Wheelchair Pickleball Palooza (Newport, DE). Source: https://www.wdel.com/news/wheelin-and-picklin-in-newport/article_5c2e1267-f8fb-441e-babe-92079219c295.html
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '882b1f01-9895-52e7-9901-f396ad97bc30', 'Wheelchair Tennis Program of Delaware Wheelchair Pickleball Palooza', 'Nonprofit', 'Pickleball', 'pickleball', '["pickleball"]', 'https://www.wdel.com/news/wheelin-and-picklin-in-newport/article_5c2e1267-f8fb-441e-babe-92079219c295.html', 'Newport', 'DE', 'Delaware', 'United States',
    'The Wheelchair Tennis Program of Delaware hosted a Wheelchair Pickleball Palooza clinic at Dill Dinkers in Newport. It drew wheelchair pickleball players from novice level to medal winners from along the Atlantic seaboard.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.wdel.com/news/wheelin-and-picklin-in-newport/article_5c2e1267-f8fb-441e-babe-92079219c295.html' OR (name = 'Wheelchair Tennis Program of Delaware Wheelchair Pickleball Palooza' COLLATE NOCASE AND state = 'DE'));

-- NOT A SQL CHANGE. Palm Beach Gardens Tennis and Pickleball Center, Wheelchair Pickleball (Palm Beach Gardens, FL) is already listed as program ce0d0394-b36a-5da6-894b-2ec88ccd6d28, filed under 'Organization not yet assigned'. Its adaptive pickleball page: https://www.pbgfl.gov/1309/Adaptive-Pickleball-Programs . When that program gets its organization, add pickleball there.

-- LOOK FIRST: Page lists pickleball inside veteran programming but gives no schedule or dates.
-- Hillsborough County Parks, Recreation and Conservation: adaptive pickleball (Tampa, FL). Source: https://hcfl.gov/residents/parks-and-leisure/recreation/recreation-for-people-with-disabilities
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '372fc64d-6529-551a-bae3-53b92b49165c', '0bce62a0-d795-4077-9530-46202099eb1c', 'Pickleball', 'Pickleball', 'pickleball', 'https://hcfl.gov/residents/parks-and-leisure/recreation/recreation-for-people-with-disabilities', 'Tampa', 'FL', 'Florida', 'United States',
    'HC Adaptive Sports runs competitive programming for veterans at Miller Park and Life Center, and pickleball is one of the listed sports. The county program serves children and adults with physical disabilities year round.', '["spring", "summer", "fall", "winter"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '0bce62a0-d795-4077-9530-46202099eb1c')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '0bce62a0-d795-4077-9530-46202099eb1c' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '0bce62a0-d795-4077-9530-46202099eb1c' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- NOT A SQL CHANGE. Palm Beach County Therapeutic Recreation, Adaptive Pickleball (Lake Worth, FL) is already listed as program ac1b0296-1a97-5f9a-b15a-a15dc4abd79a, filed under 'Organization not yet assigned'. Its adaptive pickleball page: https://activeproject.kellybrushfoundation.org/programs/palm-beach-county-parks-and-recreation-department/ . When that program gets its organization, add pickleball there.

-- LOOK FIRST: Own site loaded with almost no content and a 2024 grant notice; no 2025 or 2026 event or club list found. National body, not a local program.
-- United States Wheelchair Pickleball Association (USWPA) (Cape Coral, FL). Source: https://www.uswpa.org/
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '5c8b9183-e53c-530d-88f1-38f5f392f4b5', 'United States Wheelchair Pickleball Association (USWPA)', 'National nonprofit', 'Pickleball', 'pickleball', '["pickleball"]', 'https://www.uswpa.org/', 'Cape Coral', 'FL', 'Florida', 'United States',
    'USWPA is a nonprofit that grows wheelchair pickleball through clinics, exhibitions and tournaments. It is for wheelchair pickleball players across the country.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.uswpa.org/' OR (name = 'United States Wheelchair Pickleball Association (USWPA)' COLLATE NOCASE AND state = 'FL'));

-- LOOK FIRST: Single day event (past) on an aggregator page; the hospital's own page describes a patient pickleball program, not a community series. The aggregator Adaptive Athletics Association is already listed (f6b29981) but is not the host.
-- Christine E. Lynn Rehabilitation Center, Adaptive Pickleball Social (Aventura, FL). Source: https://adaptiveathletics.net/event/adaptive-pickleball-social/
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '3f8d6671-0fa0-5805-9395-f2e80d6f6e3c', 'Christine E. Lynn Rehabilitation Center, Adaptive Pickleball Social', 'Hospital adaptive sports program', 'Pickleball', 'pickleball', '["pickleball"]', 'https://adaptiveathletics.net/event/adaptive-pickleball-social/', 'Aventura', 'FL', 'Florida', 'United States',
    'The recreational therapy department at Christine E. Lynn Rehabilitation Center hosted an indoor and outdoor adaptive pickleball clinic and social. It was for people with spinal cord injuries and other physical disabilities.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://adaptiveathletics.net/event/adaptive-pickleball-social/' OR (name = 'Christine E. Lynn Rehabilitation Center, Adaptive Pickleball Social' COLLATE NOCASE AND state = 'FL'));

-- LOOK FIRST: Annual one day senior games event seen only on a third party listing; host's own page not loaded.
-- Good Life Games, Wheelchair Pickleball (Clearwater, FL). Source: https://daisydink.com/event/good-life-games-pickleball-2026-wheelchair-pickleball-clearwater-fl
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '5a6f909b-0903-55d8-a34a-d76051c0fb33', 'Good Life Games, Wheelchair Pickleball', 'Parks and recreation', 'Pickleball', 'pickleball', '["pickleball"]', 'https://daisydink.com/event/good-life-games-pickleball-2026-wheelchair-pickleball-clearwater-fl', 'Clearwater', 'FL', 'Florida', 'United States',
    'Good Life Games holds a wheelchair pickleball event at North Greenwood Community Center. Top finishers in each age group can qualify for the Florida State Senior Games.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://daisydink.com/event/good-life-games-pickleball-2026-wheelchair-pickleball-clearwater-fl' OR (name = 'Good Life Games, Wheelchair Pickleball' COLLATE NOCASE AND state = 'FL'));

-- LOOK FIRST: Source is a supporting club page with no dates; Special Olympics Florida's own pickleball page loaded almost empty. USA Pickleball lists Special Olympics Florida as a seasonal clinic and match play program.
-- Special Olympics Florida: adaptive pickleball (The Villages, FL). Source: https://www.villagerspickleballtrips.com/special-olympics
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '291aec94-fb3b-59cc-b744-27893b3558ce', '6a013aca-07fd-4643-9d7d-ebf9829db39e', 'Pickleball', 'Pickleball', 'pickleball', 'https://www.villagerspickleballtrips.com/special-olympics', 'The Villages', 'FL', 'Florida', 'United States',
    'The Sumter County Special Olympics pickleball team holds weekly training for athletes from The Villages, working on serving, returning and rallying. A local pickleball club supports the team with volunteers and fundraising.', '[]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '6a013aca-07fd-4643-9d7d-ebf9829db39e')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '6a013aca-07fd-4643-9d7d-ebf9829db39e' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '6a013aca-07fd-4643-9d7d-ebf9829db39e' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- LOOK FIRST: Own site has no schedule or dates; currency rests on a September 2026 local news story.
-- Hazelwood Pickleball (Augusta, GA). Source: https://hazelwoodpickleball.org/
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '212aec38-e3aa-5fab-8165-efe8b09f24f9', 'Hazelwood Pickleball', 'Nonprofit', 'Pickleball', 'pickleball', '["pickleball"]', 'https://hazelwoodpickleball.org/', 'Augusta', 'GA', 'Georgia', 'United States',
    'Hazelwood Pickleball is a nonprofit that uses adaptive pickleball to serve people with disabilities, veterans, children and seniors at community centers across Richmond County. It also offers adaptive pickleball for players in wheelchairs.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://hazelwoodpickleball.org/' OR (name = 'Hazelwood Pickleball' COLLATE NOCASE AND state = 'GA'));

-- LOOK FIRST: Only a November 2025 ALTA magazine story; ALTA wheelchair league page has no pickleball schedule.
-- ALTA Wheelchair Pickleball (Atlanta, GA). Source: https://www.netnewsmag.com/articles/league-news-wheelchair-pickleball-is-off-and-running-in-atlanta/
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT 'f55ed79e-637c-56ed-aca7-26c1c6ee00d0', 'ALTA Wheelchair Pickleball', 'League', 'Pickleball', 'pickleball', '["pickleball"]', 'https://www.netnewsmag.com/articles/league-news-wheelchair-pickleball-is-off-and-running-in-atlanta/', 'Atlanta', 'GA', 'Georgia', 'United States',
    'The Atlanta Lawn Tennis Association held its first wheelchair pickleball mixer in metro Atlanta with lessons for new players and round robin play. ALTA hopes to make it annual and a winter sport for its wheelchair community.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.netnewsmag.com/articles/league-news-wheelchair-pickleball-is-off-and-running-in-atlanta/' OR (name = 'ALTA Wheelchair Pickleball' COLLATE NOCASE AND state = 'GA'));

-- LOOK FIRST: May 2025 story about one clinic; no current schedule. Atlanta VA is listed twice already (dab425ea and 5bb7ff81).
-- Atlanta VA Medical Center: adaptive pickleball (Decatur, GA). Source: https://www.va.gov/atlanta-health-care/stories/veterans-pickle-up-a-new-sport-at-atlanta-va/
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '219bdb43-7bd5-54c7-aa07-3d8ec505c7a0', 'dab425ea-747f-4f11-97e1-8bdffb10333a', 'Pickleball', 'Pickleball', 'pickleball', 'https://www.va.gov/atlanta-health-care/stories/veterans-pickle-up-a-new-sport-at-atlanta-va/', 'Decatur', 'GA', 'Georgia', 'United States',
    'Atlanta VA recreation therapy ran an eight week beginner pickleball clinic to help veterans build skills and prepare for national competition. It is part of the VA recreation therapy and adaptive sports offerings for enrolled veterans.', '["spring"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = 'dab425ea-747f-4f11-97e1-8bdffb10333a')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = 'dab425ea-747f-4f11-97e1-8bdffb10333a' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = 'dab425ea-747f-4f11-97e1-8bdffb10333a' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- NOT A SQL CHANGE. Fayetteville Cumberland Parks and Recreation, Adaptive Pickleball Clinic (Fayetteville, NC) is already listed as program 7952e88d-dc8e-5cdd-8cfd-fa4ea4e30c2c, filed under 'Organization not yet assigned'. Its adaptive pickleball page: https://www.fayettevillenc.gov/Parks-and-Recreation/Facilities/Recreation-Centers/Dorothy-D.-Gilmore-Adaptive-Recreation-Center . When that program gets its organization, add pickleball there.

-- NOT A SQL CHANGE. Atrium Health Adaptive Sports and Adventures Program, Adaptive Pickleball Clinic (Charlotte, NC) is already listed as program e6f1d5a9-d657-5cce-9593-399711056696, filed under 'Organization not yet assigned'. Its adaptive pickleball page: https://atriumhealth.org/medical-services/specialty-care/rehabilitation/adaptive-sports-and-adventures-program . When that program gets its organization, add pickleball there.

-- NOT A SQL CHANGE. Greensboro Parks and Recreation AIR, Adaptive Pickleball Clinic (Greensboro, NC) is already listed as program a8aee594-1137-4139-aa7a-473102fb90e2, filed under 'Organization not yet assigned'. Its adaptive pickleball page: https://allevents.in/greensboro/adaptive-pickleball-clinic/200028490310142 . When that program gets its organization, add pickleball there.

-- NOT A SQL CHANGE. Greenville Recreation and Parks Specialized Recreation, Adaptive Pickleball Clinic (Greenville, NC) is already listed as program fa249fe9-50a6-53bb-a62a-dbeceb8d1d48, filed under 'Organization not yet assigned'. Its adaptive pickleball page: https://greenvillenc.gov/government/recreation-parks/programs-and-activities/specialized-recreation . When that program gets its organization, add pickleball there.

-- LOOK FIRST: No dates or schedule on the page.
-- Tennessee Junior Pickleball Association, Adaptive Pickleball (Nashville, TN). Source: https://www.tnjuniorpickleball.org/adaptive-pickleball
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '5a6807cc-5c35-505f-8c4f-510816f78328', 'Tennessee Junior Pickleball Association, Adaptive Pickleball', 'Nonprofit', 'Pickleball', 'pickleball', '["pickleball"]', 'https://www.tnjuniorpickleball.org/adaptive-pickleball', 'Nashville', 'TN', 'Tennessee', 'United States',
    'The Tennessee Junior Pickleball Association trains volunteers and runs inclusive pickleball clinics for Special Olympics athletes across the state. It also hosts adaptive pickleball workshops for churches, schools and clubs.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.tnjuniorpickleball.org/adaptive-pickleball' OR (name = 'Tennessee Junior Pickleball Association, Adaptive Pickleball' COLLATE NOCASE AND state = 'TN'));

-- LOOK FIRST: Sport is listed but no schedule or dates on the page.
-- Tri-State Adaptive Sports Association: adaptive pickleball (Memphis, TN). Source: https://tasaweb.org/adaptive-sports
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '199e4281-fe27-53fc-be95-26a99dd32ca1', 'e98bc491-cd22-5a76-8232-c78a5168a262', 'Pickleball', 'Pickleball', 'pickleball', 'https://tasaweb.org/adaptive-sports', 'Memphis', 'TN', 'Tennessee', 'United States',
    'TASA lists pickleball among its adaptive sports, using verbal cues, court orientation, extra bounces and audible equipment when available. It serves people with disabilities in the Memphis tri state area, including blind and low vision players.', '[]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = 'e98bc491-cd22-5a76-8232-c78a5168a262')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = 'e98bc491-cd22-5a76-8232-c78a5168a262' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = 'e98bc491-cd22-5a76-8232-c78a5168a262' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- LOOK FIRST: Pickleball is a general center activity; no adaptive specific pickleball session or date confirmed.
-- Berrytown Recreation Center – Louisville: adaptive pickleball (Louisville, KY). Source: https://louisvilleky.gov/government/parks/berrytown-recreation-center-adaptive-and-inclusive-recreation
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '2d0080af-d945-595f-ab20-3afb47e12020', 'f3abd147-d875-4a1a-becb-79a0e9056238', 'Pickleball', 'Pickleball', 'pickleball', 'https://louisvilleky.gov/government/parks/berrytown-recreation-center-adaptive-and-inclusive-recreation', 'Louisville', 'KY', 'Kentucky', 'United States',
    'Berrytown Recreation Center, home of Louisville Parks Adaptive and Inclusive Recreation, offers pickleball among its activities. The center serves people of all ages and abilities.', '[]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = 'f3abd147-d875-4a1a-becb-79a0e9056238')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = 'f3abd147-d875-4a1a-becb-79a0e9056238' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = 'f3abd147-d875-4a1a-becb-79a0e9056238' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- LOOK FIRST: Sessions listed in September, October and November 2026 but no host organization, time or cost is named.
-- City Walk BHAM, Wheelchair Pickleball (Birmingham, AL). Source: https://citywalkbham.com/event/wheelchair-pickleball-2/
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT 'e31ea59e-5ed7-50dd-9426-1db3c8de4ed3', 'City Walk BHAM, Wheelchair Pickleball', 'Parks and recreation', 'Pickleball', 'pickleball', '["pickleball"]', 'https://citywalkbham.com/event/wheelchair-pickleball-2/', 'Birmingham', 'AL', 'Alabama', 'United States',
    'City Walk BHAM holds pickleball sessions on its downtown courts designed for wheelchair athletes. Sessions are open to wheelchair players of all skill levels.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://citywalkbham.com/event/wheelchair-pickleball-2/' OR (name = 'City Walk BHAM, Wheelchair Pickleball' COLLATE NOCASE AND state = 'AL'));

-- LOOK FIRST: Season listed without a year.
-- The Exceptional Foundation: adaptive pickleball (Homewood, AL). Source: https://www.exceptionalfoundation.org/recsports
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '7a8ec333-110d-55af-8284-02624b0aee5d', 'a5d38469-e9a2-588f-a1bd-a8e611f161b9', 'Pickleball', 'Pickleball', 'pickleball', 'https://www.exceptionalfoundation.org/recsports', 'Homewood', 'AL', 'Alabama', 'United States',
    'The Exceptional Foundation runs a recreational Unified pickleball league where each team pairs a participant with a Unified Partner. It is for its participants with intellectual and developmental disabilities.', '["spring"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = 'a5d38469-e9a2-588f-a1bd-a8e611f161b9')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = 'a5d38469-e9a2-588f-a1bd-a8e611f161b9' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = 'a5d38469-e9a2-588f-a1bd-a8e611f161b9' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- LOOK FIRST: No session dates or year shown for the pickleball program.
-- City of Madison, Can Play Adaptive Youth Pickleball (Madison, AL). Source: https://al-madison2.civicplus.com/1329/Special-Needs-Programs
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT 'a27a4853-ad23-5217-b63d-20645110b8d4', 'City of Madison, Can Play Adaptive Youth Pickleball', 'Parks and recreation', 'Pickleball', 'pickleball', '["pickleball"]', 'https://al-madison2.civicplus.com/1329/Special-Needs-Programs', 'Madison', 'AL', 'Alabama', 'United States',
    'Madison''s Can Play Adaptive Youth Pickleball introduces youth with disabilities to pickleball basics at Town Madison Wellness Center. It is for children ages 8 to 17.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://al-madison2.civicplus.com/1329/Special-Needs-Programs' OR (name = 'City of Madison, Can Play Adaptive Youth Pickleball' COLLATE NOCASE AND state = 'AL'));

-- LOOK FIRST: University volunteer listing; host organization not named. May belong to City of Mobile Therapeutic Programs (existing program 8b490c14).
-- Adaptive Pickleball, Mobile (South Serves listing) (Mobile, AL). Source: https://southserves.southalabama.edu/need/detail/?need_id=1326267
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '5b9c8827-bcb9-596c-95d1-4f45df23104a', 'Adaptive Pickleball, Mobile (South Serves listing)', 'Unknown', 'Pickleball', 'pickleball', '["pickleball"]', 'https://southserves.southalabama.edu/need/detail/?need_id=1326267', 'Mobile', 'AL', 'Alabama', 'United States',
    'An adaptive pickleball program in Mobile lets participants learn, practice and enjoy the game in a supportive, inclusive setting. It welcomes players of all experience levels.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://southserves.southalabama.edu/need/detail/?need_id=1326267' OR (name = 'Adaptive Pickleball, Mobile (South Serves listing)' COLLATE NOCASE AND state = 'AL'));

-- LOOK FIRST: Page dated July 2023; no 2025 or 2026 clinic found.
-- Bayou Gulf States Paralyzed Veterans of America: adaptive pickleball (Gulfport, MS). Source: https://www.bayougulfstatespva.org/ova_por/pickleball/
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT 'cebbd7de-16d3-569c-b104-29c20c6f600d', '92a7bf11-04fc-5b98-a830-163a1968bbed', 'Pickleball', 'Pickleball', 'pickleball', 'https://www.bayougulfstatespva.org/ova_por/pickleball/', 'Gulfport', 'MS', 'Mississippi', 'United States',
    'The Bayou Gulf States Paralyzed Veterans of America chapter hosted pickleball clinics in Gulfport for all skill levels. They were for veterans, their families and community members.', '[]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '92a7bf11-04fc-5b98-a830-163a1968bbed')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '92a7bf11-04fc-5b98-a830-163a1968bbed' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '92a7bf11-04fc-5b98-a830-163a1968bbed' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- LOOK FIRST: Location page shows a standing 1st Monday schedule but no dated 2026 session; the partner page says North Kansas City dates return in the fall.
-- Chicken N Pickle North Kansas City Adaptive Pickleball (North Kansas City, MO). Source: https://chickennpickle.com/ways-to-play-kansas-city/
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '83c1bf7e-8a0a-5486-a8a0-c6216f3cdd43', 'Chicken N Pickle North Kansas City Adaptive Pickleball', 'Venue', 'Pickleball', 'pickleball', '["pickleball"]', 'https://chickennpickle.com/ways-to-play-kansas-city/', 'North Kansas City', 'MO', 'Missouri', 'United States',
    'Chicken N Pickle runs free monthly adaptive pickleball practice sessions with sports wheelchairs and equipment provided onsite. The program is for people with physical disabilities and all skill levels are welcome.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://chickennpickle.com/ways-to-play-kansas-city/' OR (name = 'Chicken N Pickle North Kansas City Adaptive Pickleball' COLLATE NOCASE AND state = 'MO'));

-- LOOK FIRST: Own page shows no year; it partners with the two Chicken N Pickle KC listings, so decide whether it is a separate listing or the organizer of those.
-- Adaptive Warrior KC Adaptive Pickleball (Kansas City, MO). Source: https://adaptivewarriorkc.com/pickleball/
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT 'bc5f0fb5-ebca-5bb6-bfff-ee8b17248056', 'Adaptive Warrior KC Adaptive Pickleball', 'Nonprofit', 'Pickleball', 'pickleball', '["pickleball"]', 'https://adaptivewarriorkc.com/pickleball/', 'Kansas City', 'MO', 'Missouri', 'United States',
    'Adaptive Warrior KC hosts free two hour adaptive pickleball sessions at Chicken N Pickle in North Kansas City and Overland Park with all equipment provided. It is for adults and kids 12 and older with physical disabilities, with an RSVP for each session.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://adaptivewarriorkc.com/pickleball/' OR (name = 'Adaptive Warrior KC Adaptive Pickleball' COLLATE NOCASE AND state = 'MO'));

-- LOOK FIRST: Program list has no schedule or dates, and its Learn More button points to adapttolife.org rather than a pickleball page.
-- Chicago Adaptive Sports Wheelchair Pickleball (Chicago, IL). Source: https://www.chicagoadaptivesports.com/list-of-programs
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '0e621ded-af2b-56c5-ad77-5af371cc5db6', 'Chicago Adaptive Sports Wheelchair Pickleball', 'Nonprofit', 'Pickleball', 'pickleball', '["pickleball"]', 'https://www.chicagoadaptivesports.com/list-of-programs', 'Chicago', 'IL', 'Illinois', 'United States',
    'Chicago Adaptive Sports lists wheelchair pickleball among its adaptive programs. It is for athletes who play from a wheelchair.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.chicagoadaptivesports.com/list-of-programs' OR (name = 'Chicago Adaptive Sports Wheelchair Pickleball' COLLATE NOCASE AND state = 'IL'));

-- NOT A SQL CHANGE. RHI Sports Adaptive Pickleball Clinic (Indianapolis, IN) is already listed as program 77b77320-1cb7-4f88-b334-926a08d508ed, filed under 'Organization not yet assigned'. Its adaptive pickleball page: https://www.linkedin.com/posts/rehabilitation-hospital-of-indiana_adaptivesports-adaptivepickleball-pickleball-activity-7452437511626313728-SNUY . When that program gets its organization, add pickleball there.

-- LOOK FIRST: Own site footer reads 2022 and shows no dated sessions; only a third party guide dated 2026.
-- Pick-A-Ball Adaptive Racket and Paddle Sports (South Bend, IN). Source: https://www.pickaball.org/get_involved
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '1e2b43eb-87ee-5e67-834e-e9dac8308b0b', 'Pick-A-Ball Adaptive Racket and Paddle Sports', 'Nonprofit', 'Pickleball', 'pickleball', '["pickleball"]', 'https://www.pickaball.org/get_involved', 'South Bend', 'IN', 'Indiana', 'United States',
    'Pick-A-Ball offers lessons, clinics, play days and tournament opportunities in racket and paddle sports. It is for youth and adults with or without physical disabilities, including wheelchair users and veterans.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.pickaball.org/get_involved' OR (name = 'Pick-A-Ball Adaptive Racket and Paddle Sports' COLLATE NOCASE AND state = 'IN'));

-- LOOK FIRST: Pickleball is listed with no schedule or dates. Note the directory has two Kentwood rows (also 18765bd8-898a-4490-b93a-f623221c50f6).
-- Kentwood Parks & Recreation: adaptive pickleball (Kentwood, MI). Source: https://www.kentwood.us/city_services/city_departments/parks_and_recreation/adaptive.php
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '73269972-dc50-56fd-a3c6-af71672d449c', '82c4bec5-30e8-41f6-b5ae-2237c7d3f4e0', 'Pickleball', 'Pickleball', 'pickleball', 'https://www.kentwood.us/city_services/city_departments/parks_and_recreation/adaptive.php', 'Kentwood', 'MI', 'Michigan', 'United States',
    'Kentwood Parks and Recreation lists pickleball among its adaptive recreation programs. The programs are for people of all abilities with disabilities in and outside Kentwood.', '[]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '82c4bec5-30e8-41f6-b5ae-2237c7d3f4e0')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '82c4bec5-30e8-41f6-b5ae-2237c7d3f4e0' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '82c4bec5-30e8-41f6-b5ae-2237c7d3f4e0' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- LOOK FIRST: Only LinkedIn posts confirm it; the organization's own recreation page does not mention pickleball, and the clinics were one-day events.
-- Disability Network Eastern Michigan Adaptive Pickleball Clinic (Warren, MI). Source: https://www.linkedin.com/posts/dnemichigan_dnem-recconnect-adaptivesports-activity-7411428113873727488-EJ3J
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '5d269329-4f02-5d0b-9167-f69e6a6e85cb', 'Disability Network Eastern Michigan Adaptive Pickleball Clinic', 'Center for independent living', 'Pickleball', 'pickleball', '["pickleball"]', 'https://www.linkedin.com/posts/dnemichigan_dnem-recconnect-adaptivesports-activity-7411428113873727488-EJ3J', 'Warren', 'MI', 'Michigan', 'United States',
    'Disability Network Eastern Michigan ran adaptive pickleball clinics with sports wheelchairs, paddles and recreational therapists to help with adaptations. The clinics are for adults with physical disabilities and, in a separate clinic, adults with intellectual disabilities.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.linkedin.com/posts/dnemichigan_dnem-recconnect-adaptivesports-activity-7411428113873727488-EJ3J' OR (name = 'Disability Network Eastern Michigan Adaptive Pickleball Clinic' COLLATE NOCASE AND state = 'MI'));

-- LOOK FIRST: A single free clinic, not a regular program; a partner post says it is run with Reimagine Life Foundation.
-- Royal Oak Parks and Recreation Adaptive Pickleball Clinic (Royal Oak, MI). Source: https://www.romi.gov/DocumentCenter/View/41755/Insight-Magazine--Fall-2026
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT 'da478358-d8ab-511d-aa6b-45d0113cd72c', 'Royal Oak Parks and Recreation Adaptive Pickleball Clinic', 'Parks and recreation', 'Pickleball', 'pickleball', '["pickleball"]', 'https://www.romi.gov/DocumentCenter/View/41755/Insight-Magazine--Fall-2026', 'Royal Oak', 'MI', 'Michigan', 'United States',
    'Royal Oak Parks and Recreation added a free adaptive pickleball clinic to its fall special events. It is for people with disabilities who want to try or learn adaptive pickleball.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.romi.gov/DocumentCenter/View/41755/Insight-Magazine--Fall-2026' OR (name = 'Royal Oak Parks and Recreation Adaptive Pickleball Clinic' COLLATE NOCASE AND state = 'MI'));

-- LOOK FIRST: Only a directory listing names pickleball; no schedule or dated session found on the program's own site.
-- University of Michigan Adaptive and Inclusive Sports Experience | UMAISE: adaptive pickleball (Ann Arbor, MI). Source: https://adaptiverechub.org/programs/umaise-university-of-michigan-adaptive-inclusive-sports-experience/
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '8d9a86cb-c173-5dce-be1e-167f43d9141b', '0d6f3110-4bd4-4684-83f4-b6e1debc6c4f', 'Pickleball', 'Pickleball', 'pickleball', 'https://adaptiverechub.org/programs/umaise-university-of-michigan-adaptive-inclusive-sports-experience/', 'Ann Arbor', 'MI', 'Michigan', 'United States',
    'The University of Michigan adaptive and inclusive sports program lists pickleball among its sports. It serves youth, teens and adults with disabilities.', '[]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '0d6f3110-4bd4-4684-83f4-b6e1debc6c4f')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '0d6f3110-4bd4-4684-83f4-b6e1debc6c4f' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '0d6f3110-4bd4-4684-83f4-b6e1debc6c4f' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- LOOK FIRST: Page shows session dates but no year; 8/4 falling on a Tuesday matches 2026.
-- Mayfield Village Adapted Pickleball Class (Mayfield Village, OH). Source: https://www.mayfieldheightsohio.gov/1042/Adaptive-Recreation
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '2b90bb79-c927-513d-bde7-cb5195be57b9', 'Mayfield Village Adapted Pickleball Class', 'Parks and recreation', 'Pickleball', 'pickleball', '["pickleball"]', 'https://www.mayfieldheightsohio.gov/1042/Adaptive-Recreation', 'Mayfield Village', 'OH', 'Ohio', 'United States',
    'Mayfield area adaptive recreation offers an inclusive pickleball class run with Empower Sports that teaches skills, rules and game play at a comfortable pace. It is for ages 13 and older with physical, cognitive or developmental disabilities.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.mayfieldheightsohio.gov/1042/Adaptive-Recreation' OR (name = 'Mayfield Village Adapted Pickleball Class' COLLATE NOCASE AND state = 'OH'));

-- LOOK FIRST: The registration pages now redirect to an organizer list, and the city's adaptive sports page does not list pickleball; dates come from search titles only. Also 10d1e42e-2ef1-408c-9427-13465c5e4af4 is a duplicate Columbus row.
-- Columbus Rec & Parks – Columbus: adaptive pickleball (Columbus, OH). Source: https://origin-a3.active.com/columbus-oh/classes/adaptive-pickle-ball-adults-2026
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT 'e48e777d-5ed8-5d4f-a4d1-5e72df972206', '626e65a4-2cdc-475a-9ac9-fd50d8f536f8', 'Pickleball', 'Pickleball', 'pickleball', 'https://origin-a3.active.com/columbus-oh/classes/adaptive-pickle-ball-adults-2026', 'Columbus', 'OH', 'Ohio', 'United States',
    'Columbus Recreation and Parks runs an adaptive pickleball class for adults at the Espy Adaptive Sports Complex. It is for adults with physical and intellectual disabilities.', '["fall", "winter"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '626e65a4-2cdc-475a-9ac9-fd50d8f536f8')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '626e65a4-2cdc-475a-9ac9-fd50d8f536f8' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '626e65a4-2cdc-475a-9ac9-fd50d8f536f8' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- LOOK FIRST: Own newsroom story from November 2025; no 2026 schedule page found.
-- OhioHealth Ontario Health and Fitness Center Adaptive Pickleball (Ontario, OH). Source: https://newsroom.ohiohealth.com/adaptive-pickleball-class-offers-comfort-recovery-for-patients-with-neurological-conditions/
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '290cf079-23bc-52e4-8368-bd24cc50faab', 'OhioHealth Ontario Health and Fitness Center Adaptive Pickleball', 'Hospital fitness center', 'Pickleball', 'pickleball', '["pickleball"]', 'https://newsroom.ohiohealth.com/adaptive-pickleball-class-offers-comfort-recovery-for-patients-with-neurological-conditions/', 'Ontario', 'OH', 'Ohio', 'United States',
    'The OhioHealth Ontario Health and Fitness Center offers an adaptive pickleball class in a relaxed setting. It is for people with neurological conditions.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://newsroom.ohiohealth.com/adaptive-pickleball-class-offers-comfort-recovery-for-patients-with-neurological-conditions/' OR (name = 'OhioHealth Ontario Health and Fitness Center Adaptive Pickleball' COLLATE NOCASE AND state = 'OH'));

-- LOOK FIRST: Only news coverage from 2025; the organization's own site was not loaded and no 2026 season was found.
-- SOCIL Adaptive Pickleball League (Athens, OH). Source: https://theconwaybulletin.com/news/pickleball/198834/athens-launches-free-adaptive-pickleball-league-opening-doors-for-inclusive-play/
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '591726f0-bc7f-5b4b-b367-2db4fc38f46c', 'SOCIL Adaptive Pickleball League', 'Center for independent living', 'Pickleball', 'pickleball', '["pickleball"]', 'https://theconwaybulletin.com/news/pickleball/198834/athens-launches-free-adaptive-pickleball-league-opening-doors-for-inclusive-play/', 'Athens', 'OH', 'Ohio', 'United States',
    'The Southeastern Ohio Center for Independent Living runs a free weekly adaptive pickleball league at the Athens Community Center. It is open to anyone with a disability age 8 and older.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://theconwaybulletin.com/news/pickleball/198834/athens-launches-free-adaptive-pickleball-league-opening-doors-for-inclusive-play/' OR (name = 'SOCIL Adaptive Pickleball League' COLLATE NOCASE AND state = 'OH'));

-- LOOK FIRST: An annual tournament run by PVA national with the Wisconsin chapter, not a weekly program; decide whether it belongs under the chapter.
-- Paralyzed Veterans of America Wisconsin Chapter | PVA: adaptive pickleball (Franklin, WI). Source: https://pva.org/sports-recreation/pickleball/
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '589b0af6-6aff-5331-b493-652f5033086f', '10b9a884-25ad-4f28-b7d1-b162c4bb563b', 'Pickleball', 'Pickleball', 'pickleball', 'https://pva.org/sports-recreation/pickleball/', 'Franklin', 'WI', 'Wisconsin', 'United States',
    'Paralyzed Veterans of America holds a wheelchair pickleball tournament in Franklin with a clinic on rules, techniques and strategy. It is for veterans and other wheelchair players of all ability levels.', '["spring"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '10b9a884-25ad-4f28-b7d1-b162c4bb563b')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '10b9a884-25ad-4f28-b7d1-b162c4bb563b' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '10b9a884-25ad-4f28-b7d1-b162c4bb563b' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- LOOK FIRST: Only a 2025 job posting shows the program; the adapted recreation page does not list pickleball.
-- Madison School & Community Recreation: adaptive pickleball (Madison, WI). Source: https://mscr.org/?p=3981
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT 'e28c8eb0-69a8-5440-b541-96f23e82434f', '070f57df-48e5-4d54-a407-1f7d498b11f6', 'Pickleball', 'Pickleball', 'pickleball', 'https://mscr.org/?p=3981', 'Madison', 'WI', 'Wisconsin', 'United States',
    'Madison School and Community Recreation hires instructors for an adapted indoor pickleball program. Its adapted recreation programs are open to any individual with a disability.', '["summer"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '070f57df-48e5-4d54-a407-1f7d498b11f6')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '070f57df-48e5-4d54-a407-1f7d498b11f6' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '070f57df-48e5-4d54-a407-1f7d498b11f6' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- LOOK FIRST: Confirmed only by a September 2026 local news story; no VA page with a schedule was loaded.
-- Tomah VA Medical Center: adaptive pickleball (Tomah, WI). Source: https://monroecountyherald.com/stories/vets-got-game,183091
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT 'bb030a8f-be9e-57ba-b088-01e7f562ad1a', 'f38f62d4-63df-554e-ac0c-d22dec155cf1', 'Pickleball', 'Pickleball', 'pickleball', 'https://monroecountyherald.com/stories/vets-got-game,183091', 'Tomah', 'WI', 'Wisconsin', 'United States',
    'The Tomah VA Medical Center runs adaptive sports clinics where pickleball draws the most interest, with equipment provided. It is for veterans.', '[]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = 'f38f62d4-63df-554e-ac0c-d22dec155cf1')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = 'f38f62d4-63df-554e-ac0c-d22dec155cf1' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = 'f38f62d4-63df-554e-ac0c-d22dec155cf1' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- LOOK FIRST: Latest dated evidence is 2024; the current class list did not show a pickleball session.
-- Courage Kenny Rehabilitation Institute | CKRI: adaptive pickleball (Golden Valley, MN). Source: https://www.allinahealth.org/allina-news/2024/05/allina-health-holds-clinic-to-showcase-adaptive-pickleball
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '69b4bc9c-c29f-59de-876c-57a13c8ac424', 'b2a0602e-8e6d-4fbb-b0ea-6b7322a022aa', 'Pickleball', 'Pickleball', 'pickleball', 'https://www.allinahealth.org/allina-news/2024/05/allina-health-holds-clinic-to-showcase-adaptive-pickleball', 'Golden Valley', 'MN', 'Minnesota', 'United States',
    'Courage Kenny''s sports and recreation program has run adaptive pickleball clinics and a league with sports wheelchairs supplied. It is for wheelchair users and standing players with disabilities.', '["summer"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = 'b2a0602e-8e6d-4fbb-b0ea-6b7322a022aa')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = 'b2a0602e-8e6d-4fbb-b0ea-6b7322a022aa' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = 'b2a0602e-8e6d-4fbb-b0ea-6b7322a022aa' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- LOOK FIRST: No dates or schedule; newest pickleball photos are from April 2025.
-- QCA Adaptive Sports Wheelchair Pickleball (Davenport, IA). Source: https://qcaadaptivesports.com/locations/
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '3a19621c-9283-56ec-9c2d-3ddc6207f0f3', 'QCA Adaptive Sports Wheelchair Pickleball', 'Nonprofit', 'Pickleball', 'pickleball', '["pickleball"]', 'https://qcaadaptivesports.com/locations/', 'Davenport', 'IA', 'Iowa', 'United States',
    'QCA Adaptive Sports holds a wheelchair pickleball clinic in Davenport and a wheelchair pickleball tournament in Moline. It serves children and adults in the Quad Cities who use adaptive sports.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://qcaadaptivesports.com/locations/' OR (name = 'QCA Adaptive Sports Wheelchair Pickleball' COLLATE NOCASE AND state = 'IA'));

-- LOOK FIRST: No dated pickleball session visible; the existing id is Can Play, the partner, not the city.
-- Can Play Adapted: adaptive pickleball (Des Moines, IA). Source: http://www.dsm.city/departments/parks_recreation/activities/adapted.php
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '78b01bf7-b184-513a-844c-d0a1d5277189', '4f268cbd-9518-59be-b0bf-444251f63ba6', 'Pickleball', 'Pickleball', 'pickleball', 'http://www.dsm.city/departments/parks_recreation/activities/adapted.php', 'Des Moines', 'IA', 'Iowa', 'United States',
    'Des Moines Parks and Recreation runs a four week try it adapted pickleball program in partnership with Can Play. It is for children with disabilities or chronic health conditions.', '[]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '4f268cbd-9518-59be-b0bf-444251f63ba6')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '4f268cbd-9518-59be-b0bf-444251f63ba6' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '4f268cbd-9518-59be-b0bf-444251f63ba6' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- LOOK FIRST: Page names 2026 league teams but gives no dated schedule.
-- Champion Athletes of the Ozarks Pickleball (Springfield, MO). Source: https://www.championathletes.org/pickleball
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '3ede521a-025f-5662-ace1-125eeb7d67bc', 'Champion Athletes of the Ozarks Pickleball', 'Nonprofit', 'Pickleball', 'pickleball', '["pickleball"]', 'https://www.championathletes.org/pickleball', 'Springfield', 'MO', 'Missouri', 'United States',
    'Champion Athletes of the Ozarks runs an eight week summer pickleball league that ends with a regional tournament, with equipment provided. It is for children and adults with mental and physical disabilities.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.championathletes.org/pickleball' OR (name = 'Champion Athletes of the Ozarks Pickleball' COLLATE NOCASE AND state = 'MO'));

-- LOOK FIRST: Pickleball is one of several rotating sports, and the page shows no year (metadata dated August 2026).
-- Family Wellness Fargo Adaptive Sports Series (Fargo, ND). Source: https://www.familywellnessfargo.org/programs/17187/adaptive-sports-series/
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '2ec26fa0-4a30-59e4-9460-7d18a70d3cff', 'Family Wellness Fargo Adaptive Sports Series', 'Fitness center', 'Pickleball', 'pickleball', '["pickleball"]', 'https://www.familywellnessfargo.org/programs/17187/adaptive-sports-series/', 'Fargo', 'ND', 'North Dakota', 'United States',
    'Family Wellness Fargo runs a free weekly drop in adaptive sports series that includes pickleball, basketball and volleyball. It is for adults of all abilities age 15 and older.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.familywellnessfargo.org/programs/17187/adaptive-sports-series/' OR (name = 'Family Wellness Fargo Adaptive Sports Series' COLLATE NOCASE AND state = 'ND'));

-- LOOK FIRST: A clinic on set dates, not a regular program; other regions left one-off clinics out.
-- Military Adaptive Court Sports Harker Heights Pickleball Clinic (Harker Heights, TX). Source: https://www.militaryadaptivecourtsports.org/events?tag=Texas
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT 'd2effa2f-48f8-5ab3-a274-f7cd8df1fdde', 'Military Adaptive Court Sports Harker Heights Pickleball Clinic', 'Nonprofit', 'Pickleball', 'pickleball', '["pickleball"]', 'https://www.militaryadaptivecourtsports.org/events?tag=Texas', 'Harker Heights', 'TX', 'Texas', 'United States',
    'Military Adaptive Court Sports runs a weekly adaptive pickleball clinic every Thursday at the Harker Heights Athletic Club. It is for veterans and service members of all skill levels.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.militaryadaptivecourtsports.org/events?tag=Texas' OR (name = 'Military Adaptive Court Sports Harker Heights Pickleball Clinic' COLLATE NOCASE AND state = 'TX'));

-- LOOK FIRST: A clinic on set dates, not a regular program; other regions left one-off clinics out.
-- Military Adaptive Court Sports Colorado Springs Pickleball Clinic (Colorado Springs, CO). Source: https://www.militaryadaptivecourtsports.org/events
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '9668dbd7-9fc4-5d07-a4e2-e6a020d4d82d', 'Military Adaptive Court Sports Colorado Springs Pickleball Clinic', 'Nonprofit', 'Pickleball', 'pickleball', '["pickleball"]', 'https://www.militaryadaptivecourtsports.org/events', 'Colorado Springs', 'CO', 'Colorado', 'United States',
    'Military Adaptive Court Sports runs a weekly pickleball clinic every Wednesday at Peak Pickleball in Colorado Springs. It is for veterans and service members of all skill levels.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.militaryadaptivecourtsports.org/events' OR (name = 'Military Adaptive Court Sports Colorado Springs Pickleball Clinic' COLLATE NOCASE AND state = 'CO'));

-- LOOK FIRST: Page has no venue, day or dated session; only a 2026 footer.
-- City of Reno Adaptive Recreation: adaptive pickleball (Reno, NV). Source: https://reno.gov/parks-and-recreation/adaptive-recreation/adaptive-programs.php
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '52432f58-e8a1-5c85-970f-c15987b28782', 'ef737210-2286-4829-a0a8-0bec820cabbb', 'Pickleball', 'Pickleball', 'pickleball', 'https://reno.gov/parks-and-recreation/adaptive-recreation/adaptive-programs.php', 'Reno', 'NV', 'Nevada', 'United States',
    'City of Reno Adaptive Recreation lists wheelchair pickleball as a new adult program in its September to April season. It is designed for all skill levels.', '["spring", "fall", "winter"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = 'ef737210-2286-4829-a0a8-0bec820cabbb')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = 'ef737210-2286-4829-a0a8-0bec820cabbb' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = 'ef737210-2286-4829-a0a8-0bec820cabbb' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- LOOK FIRST: Season listed without a year; no 2026 session dates on the page.
-- City of Chandler Unified Pickleball (Chandler, AZ). Source: https://www.chandleraz.gov/explore/chandler-recreation/programs-and-activities/adaptive-recreation/special-olympics-sports
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '2aa47487-c234-5624-893d-97bc29ef29c2', 'City of Chandler Unified Pickleball', 'Parks and recreation', 'Pickleball', 'pickleball', '["pickleball"]', 'https://www.chandleraz.gov/explore/chandler-recreation/programs-and-activities/adaptive-recreation/special-olympics-sports', 'Chandler', 'AZ', 'Arizona', 'United States',
    'Chandler Adaptive Recreation runs a unified pickleball season that teaches the game and prepares players for Special Olympics Arizona competition. It is for individuals with disabilities, who may bring a unified partner.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.chandleraz.gov/explore/chandler-recreation/programs-and-activities/adaptive-recreation/special-olympics-sports' OR (name = 'City of Chandler Unified Pickleball' COLLATE NOCASE AND state = 'AZ'));

-- LOOK FIRST: Only a March 2025 news article; Ability360's own sports page (updated October 2026) does not list pickleball.
-- Ability360 Sports & Fitness Center: adaptive pickleball (Phoenix, AZ). Source: https://www.statepress.com/article/2025/03/ability360-adaptive-pickleball
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '8d6d2818-a204-551b-ac54-f8248284533c', '93b0f810-111f-459d-bee8-9645f6d5fb4a', 'Pickleball', 'Pickleball', 'pickleball', 'https://www.statepress.com/article/2025/03/ability360-adaptive-pickleball', 'Phoenix', 'AZ', 'Arizona', 'United States',
    'Ability360 has run a weekly inclusive pickleball group on Wednesday mornings at Telephone Pioneers Park in Phoenix, split by skill level. It is for players of all ages and abilities.', '["spring"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '93b0f810-111f-459d-bee8-9645f6d5fb4a')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '93b0f810-111f-459d-bee8-9645f6d5fb4a' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '93b0f810-111f-459d-bee8-9645f6d5fb4a' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- LOOK FIRST: Program page lists no upcoming sessions or dates; registration is by contacting staff.
-- The Picklr Cheyenne Adaptive Pickleball (Cheyenne, WY). Source: https://cheyenne.thepicklr.com/programs/adaptive-pickleball
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '98823e3e-2478-5145-97f4-cbe0c2b62462', 'The Picklr Cheyenne Adaptive Pickleball', 'Pickleball venue', 'Pickleball', 'pickleball', '["pickleball"]', 'https://cheyenne.thepicklr.com/programs/adaptive-pickleball', 'Cheyenne', 'WY', 'Wyoming', 'United States',
    'The Picklr Cheyenne offers free adaptive pickleball play on fully accessible courts. It is designed for players with special needs of all skill levels.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://cheyenne.thepicklr.com/programs/adaptive-pickleball' OR (name = 'The Picklr Cheyenne Adaptive Pickleball' COLLATE NOCASE AND state = 'WY'));

-- LOOK FIRST: Single dated event, not a stated recurring program.
-- Teton Adaptive Sports, Inc.: adaptive pickleball (Jackson, WY). Source: https://tetonadaptive.org/events/maf4ys3fbwqb6x6ukoly9apvjzvdfd-lymd4-ayrwd
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT 'f78e569d-7483-546f-96fe-3b436f45949e', '2491dea6-5b14-4189-8fa4-28d2bafd01da', 'Pickleball', 'Pickleball', 'pickleball', 'https://tetonadaptive.org/events/maf4ys3fbwqb6x6ukoly9apvjzvdfd-lymd4-ayrwd', 'Jackson', 'WY', 'Wyoming', 'United States',
    'Teton Adaptive Sports held an adaptive pickleball afternoon at the Teton County and Jackson Community Recreation Center. It is part of the group''s summer adaptive recreation calendar for people with disabilities.', '["summer"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '2491dea6-5b14-4189-8fa4-28d2bafd01da')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '2491dea6-5b14-4189-8fa4-28d2bafd01da' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '2491dea6-5b14-4189-8fa4-28d2bafd01da' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- LOOK FIRST: Current page but no day, time or dated session shown.
-- Ozark Adaptive Sports Association (OzASA): adaptive pickleball (Springdale, AR). Source: https://www.ozasa.org/pickleball
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT 'a6a736b8-3d8d-5d89-9fcb-7b79da1c5309', 'aa92d8a4-c704-47d8-bf22-976b9623259a', 'Pickleball', 'Pickleball', 'pickleball', 'https://www.ozasa.org/pickleball', 'Springdale', 'AR', 'Arkansas', 'United States',
    'The Ozark Adaptive Sports Association runs a year round adaptive pickleball program at Springdale Parks and Recreation. It is designed for individuals with physical disabilities, new or experienced.', '["spring", "summer", "fall", "winter"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = 'aa92d8a4-c704-47d8-bf22-976b9623259a')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = 'aa92d8a4-c704-47d8-bf22-976b9623259a' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = 'aa92d8a4-c704-47d8-bf22-976b9623259a' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- LOOK FIRST: Listing marked previously held (ended August 25, 2026); confirm a fall session.
-- Sycamore Park Community Center Adaptive Pickleball Open Play (Farmington, NM). Source: https://farmingtonnm.org/events/adaptive-pickleball-open-play
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '738bb630-5d4d-5556-81cd-aa39eb5c4d1a', 'Sycamore Park Community Center Adaptive Pickleball Open Play', 'Parks and recreation', 'Pickleball', 'pickleball', '["pickleball"]', 'https://farmingtonnm.org/events/adaptive-pickleball-open-play', 'Farmington', 'NM', 'New Mexico', 'United States',
    'Sycamore Park Community Center held free adaptive pickleball open play every Tuesday afternoon with all equipment provided. It is for adults 18 and up of all skill levels and abilities.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://farmingtonnm.org/events/adaptive-pickleball-open-play' OR (name = 'Sycamore Park Community Center Adaptive Pickleball Open Play' COLLATE NOCASE AND state = 'NM'));

-- LOOK FIRST: Registration listing is current but has no description; confirm it is for people with disabilities. existing_id is the city's Inclusive Recreation listing (Inclusive Swim).
-- City of Albuquerque Inclusive Swim: adaptive pickleball (Albuquerque, NM). Source: https://nmalbuquerqueweb.myvscloud.com/webtrac/web/iteminfo.html?FMID=167468702&Module=AR
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '8b4deac6-472f-5c95-a9f8-b0f843f072a8', 'c8b74fc0-a596-4e9b-b1ab-892a62534ada', 'Pickleball', 'Pickleball', 'pickleball', 'https://nmalbuquerqueweb.myvscloud.com/webtrac/web/iteminfo.html?FMID=167468702&Module=AR', 'Albuquerque', 'NM', 'New Mexico', 'United States',
    'The City of Albuquerque lists a morning inclusive pickleball session four days a week at Cesar Chavez Community Center. The listing does not say who it is designed for.', '["spring", "summer", "fall", "winter"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = 'c8b74fc0-a596-4e9b-b1ab-892a62534ada')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = 'c8b74fc0-a596-4e9b-b1ab-892a62534ada' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = 'c8b74fc0-a596-4e9b-b1ab-892a62534ada' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- LOOK FIRST: Page cites a 2024 grant; no 2025 or 2026 schedule shown.
-- New Mexico and Arizona Pickleball Association Pickleball for Parkinson's (Las Cruces, NM). Source: https://www.nmapickleball.org/pickleball-and-parkinsons
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '32460071-df97-5ba3-8bed-bc26e8177244', 'New Mexico and Arizona Pickleball Association Pickleball for Parkinson''s', 'Nonprofit', 'Pickleball', 'pickleball', '["pickleball"]', 'https://www.nmapickleball.org/pickleball-and-parkinsons', 'Las Cruces', 'NM', 'New Mexico', 'United States',
    'The New Mexico and Arizona Pickleball Association runs pickleball programs for people with Parkinson''s disease in Las Cruces and Farmington. It is for people with Parkinson''s and their care partners.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.nmapickleball.org/pickleball-and-parkinsons' OR (name = 'New Mexico and Arizona Pickleball Association Pickleball for Parkinson''s' COLLATE NOCASE AND state = 'NM'));

-- LOOK FIRST: Registration link points to a coming soon page; no dates.
-- Adaptive Arena Wheelchair Pickleball (Bluffdale, UT). Source: https://adaptivearena.org/athletes/
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT 'f8ba9efd-5b49-54eb-8215-69aaa81c65e9', 'Adaptive Arena Wheelchair Pickleball', 'Nonprofit', 'Pickleball', 'pickleball', '["pickleball"]', 'https://adaptivearena.org/athletes/', 'Bluffdale', 'UT', 'Utah', 'United States',
    'Adaptive Arena is an indoor gym that lists wheelchair pickleball among its organized adaptive sports. It is for athletes with disabilities, and using a wheelchair is optional.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://adaptivearena.org/athletes/' OR (name = 'Adaptive Arena Wheelchair Pickleball' COLLATE NOCASE AND state = 'UT'));

-- LOOK FIRST: Schedule is only in a members app; no dated session on the site. Overlaps the Picklr Thornton entry.
-- Adaptive Sports for All Wheelchair Pickleball Clinics (Thornton, CO). Source: https://www.adaptivesportsforall.org/events
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '081a285d-d48b-5c83-a0ff-a49a0b1df6b6', 'Adaptive Sports for All Wheelchair Pickleball Clinics', 'Nonprofit', 'Pickleball', 'pickleball', '["pickleball"]', 'https://www.adaptivesportsforall.org/events', 'Thornton', 'CO', 'Colorado', 'United States',
    'Adaptive Sports for All hosts wheelchair pickleball clinics around the Denver metro area and the Northern Front Range, including at The Picklr in Thornton and Loveland. It is for people who use wheelchairs, from first timers up.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.adaptivesportsforall.org/events' OR (name = 'Adaptive Sports for All Wheelchair Pickleball Clinics' COLLATE NOCASE AND state = 'CO'));

-- LOOK FIRST: Confirmed only on the Active.com registration listing; the city's own page was not loaded and the listing does not spell out the disability focus beyond the program name.
-- City of Tracy Every Star Counts Adaptive Pickleball (Tracy, CA). Source: https://www.active.com/tracy-ca/racquet-sports/tennis-classes/every-star-counts-adaptive-pickleball-18-yrs-2026-110440722
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '712d4437-43e9-5e81-ace9-4a122787add4', 'City of Tracy Every Star Counts Adaptive Pickleball', 'Parks_and_recreation', 'Pickleball', 'pickleball', '["pickleball"]', 'https://www.active.com/tracy-ca/racquet-sports/tennis-classes/every-star-counts-adaptive-pickleball-18-yrs-2026-110440722', 'Tracy', 'CA', 'California', 'United States',
    'The City of Tracy offers Every Star Counts Adaptive Pickleball, a Saturday class at Kenner Park with sessions for adults and for youth. A parent or guardian takes part alongside each player.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.active.com/tracy-ca/racquet-sports/tennis-classes/every-star-counts-adaptive-pickleball-18-yrs-2026-110440722' OR (name = 'City of Tracy Every Star Counts Adaptive Pickleball' COLLATE NOCASE AND state = 'CA'));

-- LOOK FIRST: Confirmed only on the Active.com registration listing, not on a city page; session was short and may not repeat.
-- City of Lomita FUNatics Unified Pickleball (Lomita, CA). Source: https://www.active.com/lomita-ca/racquet-sports/tennis-classes/funatics-unified-pickleball-for-individuals-w-disabilities-2026-110265950
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '11b48f98-869d-522e-a1a0-be403e504c7a', 'City of Lomita FUNatics Unified Pickleball', 'Parks_and_recreation', 'Pickleball', 'pickleball', '["pickleball"]', 'https://www.active.com/lomita-ca/racquet-sports/tennis-classes/funatics-unified-pickleball-for-individuals-w-disabilities-2026-110265950', 'Lomita', 'CA', 'California', 'United States',
    'The City of Lomita runs FUNatics Unified Pickleball on Monday afternoons at the Lomita Recreation Center courts, teaching basic strokes through games. It is for adults age 18 and up with disabilities.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.active.com/lomita-ca/racquet-sports/tennis-classes/funatics-unified-pickleball-for-individuals-w-disabilities-2026-110265950' OR (name = 'City of Lomita FUNatics Unified Pickleball' COLLATE NOCASE AND state = 'CA'));

-- LOOK FIRST: Page lists a pickleball season but shows no year or dates, so currency is not proven.
-- City of Pittsburg Adult Adaptive Sports Pickleball (Pittsburg, CA). Source: https://www.pittsburgrec.com/classes-programs/sports/adult-adaptive-sports
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '79899ea8-1af1-57f0-ba14-caec016fc275', 'City of Pittsburg Adult Adaptive Sports Pickleball', 'Parks_and_recreation', 'Pickleball', 'pickleball', '["pickleball"]', 'https://www.pittsburgrec.com/classes-programs/sports/adult-adaptive-sports', 'Pittsburg', 'CA', 'California', 'United States',
    'Pittsburg Recreation runs an adult adaptive sports program that rotates through sports during the year, with pickleball from July through September. It is for adults with disabilities who want to build strength, skills and community through sport.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.pittsburgrec.com/classes-programs/sports/adult-adaptive-sports' OR (name = 'City of Pittsburg Adult Adaptive Sports Pickleball' COLLATE NOCASE AND state = 'CA'));

-- LOOK FIRST: Latest evidence is the Summer 2025 activity guide; no 2026 session was found.
-- City of Duarte Adaptive Sports Bocce and Pickleball (Duarte, CA). Source: https://www.flipbook.thesaucecs.com/DuarteSummer/files/basic-html/page14.html
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '51562a5c-df72-5fec-b8be-1cf65eae34b2', 'City of Duarte Adaptive Sports Bocce and Pickleball', 'Parks_and_recreation', 'Pickleball', 'pickleball', '["pickleball"]', 'https://www.flipbook.thesaucecs.com/DuarteSummer/files/basic-html/page14.html', 'Duarte', 'CA', 'California', 'United States',
    'The City of Duarte offers an eight week adaptive bocce and pickleball class at Royal Oaks Park led by recreation staff. It is for people age 8 and up with physical and developmental disabilities.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.flipbook.thesaucecs.com/DuarteSummer/files/basic-html/page14.html' OR (name = 'City of Duarte Adaptive Sports Bocce and Pickleball' COLLATE NOCASE AND state = 'CA'));

-- LOOK FIRST: Event pages show no dates and pickleball is not on the remaining 2026 trip calendar; the program itself is active in 2026.
-- Casa Colina Inclusive Pickleball (Pomona, CA). Source: https://www.casacolina.org/events/event-details/?event=38971
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT 'c9f544c4-c725-55b3-be26-7f313577088f', 'Casa Colina Inclusive Pickleball', 'Hospital_program', 'Pickleball', 'pickleball', '["pickleball"]', 'https://www.casacolina.org/events/event-details/?event=38971', 'Pomona', 'CA', 'California', 'United States',
    'Casa Colina''s Outdoor Adventures and Wheelchair Sports program holds inclusive pickleball sessions with warm up, instruction and doubles play, with paddles and balls provided. It is for people with disabilities who sign up through the program''s participant forms.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.casacolina.org/events/event-details/?event=38971' OR (name = 'Casa Colina Inclusive Pickleball' COLLATE NOCASE AND state = 'CA'));

-- LOOK FIRST: Only the Summer 2025 catalog shows it; the current Disability Services page does not mention pickleball.
-- City of Irvine Disability Services Pickleball for All (Irvine, CA). Source: https://online.flippingbook.com/view/1029983113/4/
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '43ac08d8-a2fc-5626-bd8f-18e2bdfe7089', 'City of Irvine Disability Services Pickleball for All', 'Parks_and_recreation', 'Pickleball', 'pickleball', '["pickleball"]', 'https://online.flippingbook.com/view/1029983113/4/', 'Irvine', 'CA', 'California', 'United States',
    'City of Irvine Disability Services runs Pickleball for All, staff led court sessions on Thursday evenings in multi week blocks. It is for adults 18 and up served by Disability Services.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://online.flippingbook.com/view/1029983113/4/' OR (name = 'City of Irvine Disability Services Pickleball for All' COLLATE NOCASE AND state = 'CA'));

-- LOOK FIRST: Source is a March 2025 partner news post; the city's own Therapeutic Recreation page does not mention pickleball.
-- City of San Jose Therapeutic Recreation Wheelchair Pickleball (San Jose, CA). Source: https://norcalsci.org/news/zlcgcui33hod8tuinmn3q0aiur8j5k
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '07f4ca0b-41c9-5c15-b59f-2348031cb686', 'City of San Jose Therapeutic Recreation Wheelchair Pickleball', 'Parks_and_recreation', 'Pickleball', 'pickleball', '["pickleball"]', 'https://norcalsci.org/news/zlcgcui33hod8tuinmn3q0aiur8j5k', 'San Jose', 'CA', 'California', 'United States',
    'The City of San Jose''s adaptive recreation program has offered Sunday wheelchair pickleball with loaner sports chairs. It is for people age 13 and up with mobility impairments, and newcomers are welcome.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://norcalsci.org/news/zlcgcui33hod8tuinmn3q0aiur8j5k' OR (name = 'City of San Jose Therapeutic Recreation Wheelchair Pickleball' COLLATE NOCASE AND state = 'CA'));

-- LOOK FIRST: Listed in the Summer 2026 TRS newsletter, but it may be general gym open play rather than a session run for people with disabilities.
-- City of San Diego Therapeutic Recreation Services — Wheelchair Basketball: adaptive pickleball (San Diego, CA). Source: https://www.sandiego.gov/sites/default/files/trscalendarsummer.pdf
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '8b592fe9-23b8-53c3-bf50-794634a89786', '22c3cab0-31a1-437d-866b-731572484d33', 'Pickleball', 'Pickleball', 'pickleball', 'https://www.sandiego.gov/sites/default/files/trscalendarsummer.pdf', 'San Diego', 'CA', 'California', 'United States',
    'The City of San Diego Therapeutic Recreation Services newsletter lists free drop in pickleball open play at the Park de la Cruz gym on Tuesday and Thursday. The newsletter serves children and adults with any type of disability.', '["summer"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '22c3cab0-31a1-437d-866b-731572484d33')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '22c3cab0-31a1-437d-866b-731572484d33' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '22c3cab0-31a1-437d-866b-731572484d33' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- LOOK FIRST: Current page with an online registration link, but no dates are shown.
-- Cosumnes CSD Recreation Adventures — Open Gym: adaptive pickleball (Elk Grove, CA). Source: https://www.cosumnescsd.gov/380/Adaptive-Inclusive-Recreation
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '20359759-1a55-52aa-911f-f2236f12bb37', '8ccf79db-3988-4556-a56c-1d7492def559', 'Pickleball', 'Pickleball', 'pickleball', 'https://www.cosumnescsd.gov/380/Adaptive-Inclusive-Recreation', 'Elk Grove', 'CA', 'California', 'United States',
    'Cosumnes CSD''s adaptive and inclusive recreation program offers RAD Pickleball lessons twice a month at Wackman Park. It is for people age 10 and up with disabilities.', '[]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '8ccf79db-3988-4556-a56c-1d7492def559')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '8ccf79db-3988-4556-a56c-1d7492def559' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '8ccf79db-3988-4556-a56c-1d7492def559' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- LOOK FIRST: Program page loads with no body text; latest dated event is February 2025.
-- City of Tukwila Adaptive Pickleball (Tukwila, WA). Source: https://www.tukwilawa.gov/departments/parks-and-recreation/adult-enrichment/adaptive-pickleball/
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT '228bb2d6-4d34-5f51-8dde-bc29f4a0da1c', 'City of Tukwila Adaptive Pickleball', 'Parks_and_recreation', 'Pickleball', 'pickleball', '["pickleball"]', 'https://www.tukwilawa.gov/departments/parks-and-recreation/adult-enrichment/adaptive-pickleball/', 'Tukwila', 'WA', 'Washington', 'United States',
    'The City of Tukwila has hosted free adaptive pickleball play days at its community center with a limited number of sport chairs. They are for people with disabilities and their friends and family.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.tukwilawa.gov/departments/parks-and-recreation/adult-enrichment/adaptive-pickleball/' OR (name = 'City of Tukwila Adaptive Pickleball' COLLATE NOCASE AND state = 'WA'));

-- LOOK FIRST: Social outing within a broader activities program rather than an adaptive pickleball program; may be for enrolled clients only.
-- The Arc of Spokane Pickleball (Spokane, WA). Source: https://www.arc-spokane.org/events/2026/8/4/pickleball
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT 'abc65071-f455-548a-9799-e5916102afd7', 'The Arc of Spokane Pickleball', 'Nonprofit', 'Pickleball', 'pickleball', '["pickleball"]', 'https://www.arc-spokane.org/events/2026/8/4/pickleball', 'Spokane', 'WA', 'Washington', 'United States',
    'The Arc of Spokane holds pickleball outings at local parks and indoor courts as part of its community activities calendar. They are for people with intellectual and developmental disabilities served by The Arc.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.arc-spokane.org/events/2026/8/4/pickleball' OR (name = 'The Arc of Spokane Pickleball' COLLATE NOCASE AND state = 'WA'));

-- LOOK FIRST: Listed by EASE PD but run independently of it; no date on the page proves it is current.
-- Santa Cruz Parkinson's Pickleball (Santa Cruz, CA). Source: https://www.easepd.org/pickleball
INSERT OR IGNORE INTO organizations (id, name, org_type, sport, sport_key, sports_json, website_url, city, state, state_name, country, description, verification_status, status, is_public, primary_data_source, created_at, updated_at)
  SELECT 'cf5a469b-192b-5ed2-90b8-5f99f1e8bfa5', 'Santa Cruz Parkinson''s Pickleball', 'Community_group', 'Pickleball', 'pickleball', '["pickleball"]', 'https://www.easepd.org/pickleball', 'Santa Cruz', 'CA', 'California', 'United States',
    'A weekly pickleball group for people with Parkinson''s meets Wednesday mornings at Brommer Park, with paddles, balls and instruction provided for a small donation. It is for people with Parkinson''s who are steady on their feet, and care partners are encouraged to play.', 'unverified', 'active', 1, 'ASNM research 2026-10-26', strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE website_url = 'https://www.easepd.org/pickleball' OR (name = 'Santa Cruz Parkinson''s Pickleball' COLLATE NOCASE AND state = 'CA'));

-- LOOK FIRST: The adaptive pickleball page now returns 404 and pickleball is no longer listed on the Access Leisure sports menu; quote is from a cached copy.
-- Access Leisure – Paralympic Sport Sacramento: adaptive pickleball (Sacramento, CA). Source: https://www.cityofsacramento.gov/ypce/access-leisure/sports
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '121810d1-e352-5f9d-a81a-9d24f01fb42e', '7b9940cf-d09d-47aa-9dfb-e3f11266d612', 'Pickleball', 'Pickleball', 'pickleball', 'https://www.cityofsacramento.gov/ypce/access-leisure/sports', 'Sacramento', 'CA', 'California', 'United States',
    'The City of Sacramento''s Access Leisure program has offered adaptive pickleball for injured, ill or wounded veterans and adults with physical disabilities. It is for adults 18 and up.', '[]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '7b9940cf-d09d-47aa-9dfb-e3f11266d612')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '7b9940cf-d09d-47aa-9dfb-e3f11266d612' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '7b9940cf-d09d-47aa-9dfb-e3f11266d612' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- LOOK FIRST: One clinic in November 2025 (post dated January 2026); no recurring schedule found.
-- Northwest Association for Blind Athletes – Clark County: adaptive pickleball (Gresham, OR). Source: https://nwaba.org/blog/blind-adaptive-pickleball-clinic-gresham-oregon/
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '14403a32-6273-5531-b5f3-a2f6900ab6d2', 'e0e06400-f216-419f-b6ca-7b0848f6f856', 'Pickleball', 'Pickleball', 'pickleball', 'https://nwaba.org/blog/blind-adaptive-pickleball-clinic-gresham-oregon/', 'Gresham', 'OR', 'Oregon', 'United States',
    'NWABA hosted a blind adaptive pickleball clinic in Gresham using rattle balls, tactile court lines and verbal cues, and introduced pickleball into its sports outreach. It is for people who are blind or have low vision.', '[]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = 'e0e06400-f216-419f-b6ca-7b0848f6f856')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = 'e0e06400-f216-419f-b6ca-7b0848f6f856' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = 'e0e06400-f216-419f-b6ca-7b0848f6f856' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- LOOK FIRST: Schedule is current but the page does not say the session is adaptive; it may be general veteran play.
-- Break The Barriers, Inc.: adaptive pickleball (Fresno, CA). Source: https://www.btbvets.org/programs/
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '98508a78-5ae6-5aa9-b267-8a430f2d36b1', '6d640a0e-d51d-4b1c-a733-c58e62d57414', 'Pickleball', 'Pickleball', 'pickleball', 'https://www.btbvets.org/programs/', 'Fresno', 'CA', 'California', 'United States',
    'Break the Barriers offers free pickleball for veterans three mornings a week at its Fresno center. It is for veterans age 18 and up.', '["spring", "summer", "fall", "winter"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '6d640a0e-d51d-4b1c-a733-c58e62d57414')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '6d640a0e-d51d-4b1c-a733-c58e62d57414' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '6d640a0e-d51d-4b1c-a733-c58e62d57414' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- LOOK FIRST: Annual event rather than a regular program; page is a partner host site, not the VA's own.
-- VA Pacific Islands Health Care: adaptive pickleball (Honolulu, HI). Source: https://bigtirebootcamp.com/koa-challenge
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '4807b576-8a4d-55a1-8a94-41351f3ee037', '6e304ee2-407c-5b62-ab99-a76bb497a542', 'Pickleball', 'Pickleball', 'pickleball', 'https://bigtirebootcamp.com/koa-challenge', 'Honolulu', 'HI', 'Hawaii', 'United States',
    'The Koa Challenge Veteran Games are an annual week of adaptive competition across Oahu, launched by VA Pacific Islands Health Care System, and pickleball is one of the events. They are for veterans, including those with disabilities.', '["fall"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '6e304ee2-407c-5b62-ab99-a76bb497a542')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '6e304ee2-407c-5b62-ab99-a76bb497a542' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '6e304ee2-407c-5b62-ab99-a76bb497a542' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');

-- LOOK FIRST: Occasional clinic tied to the October 2026 triathlon weekend, not a regular program.
-- Challenged Athletes Foundation: adaptive pickleball (San Diego, CA). Source: https://www.challengedathletes.org/articles/2026-sdtc-adaptive-sports-clinics/
INSERT OR IGNORE INTO programs (id, organization_id, name, sport, sport_key, website_url, city, state, state_name, country, description, seasons_json, kind, listing, verification_status, status, is_public, created_at, updated_at)
  SELECT '2cf02cb9-c6c3-59e3-8bb5-71c1f2122426', '13ca8772-ecd6-4329-8072-d82670f558ef', 'Pickleball', 'Pickleball', 'pickleball', 'https://www.challengedathletes.org/articles/2026-sdtc-adaptive-sports-clinics/', 'San Diego', 'CA', 'California', 'United States',
    'Challenged Athletes Foundation runs drop in adaptive pickleball sessions as part of its San Diego clinic weekends. They are for athletes with physical disabilities and their families.', '["fall"]', 'program', 'with_org', 'unverified', 'active', 1, strftime('%Y-%m-%dT%H:%M:%SZ','now'), strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE EXISTS (SELECT 1 FROM organizations WHERE id = '13ca8772-ecd6-4329-8072-d82670f558ef')
    AND NOT EXISTS (SELECT 1 FROM programs WHERE organization_id = '13ca8772-ecd6-4329-8072-d82670f558ef' AND sport_key = 'pickleball');
UPDATE organizations SET sports_json = json_insert(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END, '$[#]', 'pickleball'), updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now')
  WHERE id = '13ca8772-ecd6-4329-8072-d82670f558ef' AND NOT EXISTS (SELECT 1 FROM json_each(CASE WHEN json_valid(sports_json) AND json_type(sports_json) = 'array' THEN sports_json ELSE '[]' END) WHERE value = 'pickleball');
