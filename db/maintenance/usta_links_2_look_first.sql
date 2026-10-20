-- PR #60, choice 2 of 3. 31 listings: 9 organizations, 22 programs.
-- Links to look at first. Each line gives one tennis listing a page we found, with what
-- to look at in the line above it.
--
-- Look it over, delete any line you do not want, then run it on staging, then live:
--   npx wrangler d1 execute asnm-db-staging --config wrangler.preview.json --remote --file db/maintenance/usta_links_2_look_first.sql
--   npx wrangler d1 execute asnm-db --config wrangler.json --remote --file db/maintenance/usta_links_2_look_first.sql
--
-- Safe to run twice: a line changes its listing only while that listing still has the
-- general USTA page, and a line whose id is not in a database does nothing there.
-- Each change also clears the listing check dates (they were for the USTA page), so the
-- listing shows not checked yet until the new link is checked.
-- To clear a listing instead, change its link to NULL.

-- Smart DMS, Des Moines, IA | organization
-- Look at: Our best guess, not confirmed: USTA’s contact works at Life Time, and this is Life Time Des Moines’s tennis page (SMART Tennis is its junior program). Nothing names an adaptive program.
UPDATE organizations SET website_url = 'https://playtennis.usta.com/lifetimeathleticdesmoines/Coaching', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'd9feb281-759d-562d-a7ec-37d0003cf54a' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- iCan Dream Tennis, Homewood, IL | organization
-- Look at: The club where the program ran, per a 2019 USTA story. The page mentions special needs clinics but not iCan Dream.
UPDATE organizations SET website_url = 'https://hfracquetandfitness.com/racquetsports/', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'c0daf07d-07e4-527c-a8ec-26186077b05b' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- FEAT: Autism Camp, Louisville, KY | organization
-- Look at: The right Louisville autism group, but its site shows only a 2015 tennis camp. The camp may have ended.
UPDATE organizations SET website_url = 'https://featoflouisville.org/', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'a17e84df-c45a-5863-aa76-07aac6945b61' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Accelerate4KIDS, Novi, MI | organization
-- Look at: The group’s own USTA page, but the group is in Detroit, not Novi, and the page does not mention adaptive tennis.
UPDATE organizations SET website_url = 'https://playtennis.usta.com/accelerate4kids', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'f5e45171-0068-50f1-ae0d-ede0077fcd36' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- St. Louis Indoor Para-Tennis Championships, St. Louis, MO | organization
-- Look at: The 2026 tournament page (it is now called the Indoor Wheelchair Tennis Championships, in Chesterfield). It will need a new link each year.
UPDATE organizations SET website_url = 'https://playtennis.usta.com/Competitions/pushwheelchairtennisacademy/Tournaments/Overview/19be9dc1-1bc4-4e42-8e3f-6e20d6969b48', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '85f96e48-eb50-5941-9e5f-82a413d433c6' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Meridian Roll and Run Adaptive Tennis, Meridian, MS | organization
-- Look at: The Meridian tennis center whose director is USTA’s contact it ran the state’s first adaptive program, Roll and Run. The page does not mention the program.
UPDATE organizations SET website_url = 'https://playtennis.usta.com/NortheastParkTennisCenter', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '14dc137e-055f-5de9-a307-9472062c92ef' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- BSO BVI Tennis, Philadelphia, PA | organization
-- Look at: The group’s homepage. It no longer lists tennis, so the program may have ended.
UPDATE organizations SET website_url = 'https://www.blindsports.org/', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '2f78da3f-2a6f-5f84-a04e-ad6e33ddaf70' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- MAPLE’S Kids (Multiple Adaptive Play Experiences in Sports), Salem, VA | organization
-- Look at: A September 2025 event page at Roanoke College. The program has no standing page.
UPDATE organizations SET website_url = 'https://www.roanoke.edu/events/maples_(multiple_adaptive_play_experiences_in_sports)_opening_celebration', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'd4561d86-b496-524c-b5de-4b92bd550d91' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Alpine Adaptive Tennis, Laramie, WY | organization
-- Look at: Laramie’s tennis association its board has an adaptive lead. The tie rests on the name and town only.
UPDATE organizations SET website_url = 'https://www.alpine-tennis.org/', last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '7ef623f9-0419-5d3b-8c16-f65251074bb0' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Love Unlimited, Mobile, AL | program | live only
-- Look at: The Mobile Tennis Center’s outreach page: its adaptive clinic and a Love Unlimited video. The clinic now runs under another partner’s name.
UPDATE programs SET website_url = 'https://www.mobiletenniscenter.net/community-outreach/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '9dc6a8ae-456b-5eed-827d-ab74c94e5bc6' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Love Unlimited, Mobile, AL | program | staging only
-- Look at: The Mobile Tennis Center’s outreach page: its adaptive clinic and a Love Unlimited video. The clinic now runs under another partner’s name.
UPDATE programs SET website_url = 'https://www.mobiletenniscenter.net/community-outreach/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '3a727ccb-03c7-4c41-addb-724485a294cc' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Aces for Autism, Inc., Pensacola, FL | program
-- Look at: A Facebook page. The group has no website (the domains with its name are parked).
UPDATE programs SET website_url = 'https://www.facebook.com/people/Aces-for-Autism-Inc/61558168528167/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '418a1a40-7462-5dd5-ae59-bd4a0a999593' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Lipson Foundation, West Palm Beach, FL | program
-- Look at: The right group, but its site now features adaptive fitness and no longer mentions tennis.
UPDATE programs SET website_url = 'https://lipsonfoundation.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '554b80ab-2954-5f4a-8217-15e3865bcefa' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Racquet Club of Cocoa Beach Adaptive Tennis, Cocoa Beach, FL | program
-- Look at: The club’s homepage it lists no adaptive program right now.
UPDATE programs SET website_url = 'https://www.cocoabeachracquetclub.com/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '9d298779-9a66-5718-b1b5-4f518973c78d' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Tennis Starts With Love, Tampa area, FL | program
-- Look at: An empty USTA club page (name and town only) the program may have ended. Clearing may be better.
UPDATE programs SET website_url = 'https://playtennis.usta.com/tennisstartswithlove', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '5e24d597-5bc7-5fff-b8ab-89d985b0fede' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Tennis-4-Everyone / Escambia County Special Olympics, Escambia County, FL | program
-- Look at: Special Olympics Florida’s Escambia County section, which lists tennis. Tennis-4-Everyone has no site of its own.
UPDATE programs SET website_url = 'https://www.specialolympicsflorida.org/northwest#escambia', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '39929da1-07fd-5f52-94b4-ab5683aa43cb' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- ACSquared Tennis, Lithia Springs, GA | program
-- Look at: The coach’s own site, with the same contact as USTA’s listing. No adaptive page.
UPDATE programs SET website_url = 'https://acsquaredtennis.com/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'adb6e442-e7de-56ba-9335-73dc70329d7a' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Sign1U Deaf Youth Tennis Camp, Atlanta, GA | program
-- Look at: The camp’s sign-up page (a tennis camp form). The name Sign1U is not on it.
UPDATE programs SET website_url = 'https://sign1studios.com/summer-camp/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '377fa05d-e779-5cfd-9b67-19e6efb6a429' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- TVI Atlanta, Atlanta, GA | program
-- Look at: A Facebook page (Tennis for Visually Impaired Atlanta). No website exists.
UPDATE programs SET website_url = 'https://www.facebook.com/TVIatlanta/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'f0e80d6e-8626-53ca-a793-5b9165515390' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Windy Hill Community Center, Austell, GA | program
-- Look at: Cobb County’s therapeutic recreation page, held at Windy Hill no tennis on it. Also, Windy Hill is in Smyrna, not Austell.
UPDATE programs SET website_url = 'https://www.cobbcounty.gov/parks/programs/therapeutic-recreation-services', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'c4b5d089-6df5-5236-b4ba-147cc83479e4' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Cedar Rapids Homeschool Assistance Program, Cedar Rapids, IA | program
-- Look at: The school district’s homeschool program page no tennis on it.
UPDATE programs SET website_url = 'https://www.crschools.us/academics-programs/alternative-learning-options/home-school-assistance-program', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'd40750ec-698d-581c-8353-e71e46992ea3' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- West Enders and Scott County Adults, Davenport, Moline, IA | program
-- Look at: Special Olympics Iowa’s page for Scott County Adults, which lists tennis. It covers only half the listing: West Enders has no page.
UPDATE programs SET website_url = 'https://www.soiowa.org/sca-thunder/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'cda538d5-1805-5079-a1aa-543d9e7c90e0' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Acadiana Serves Adaptive Tennis, Lafayette, LA | program
-- Look at: The group’s homepage (it runs Lafayette’s public tennis parks). No adaptive program listed, though Special Olympics Louisiana lists it as a local program.
UPDATE programs SET website_url = 'https://www.acadianaserves.com/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '0bf4bc0c-7c33-5c66-9301-144d6f6fd910' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Special Olympics Play Day, Lafayette, LA | program
-- Look at: Special Olympics Louisiana’s regional page, not the play day itself no page exists for the play day.
UPDATE programs SET website_url = 'https://specialolympicsla.org/state-map/acadiana-area/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '552f755e-e73b-56b5-8ce8-5d575222afe1' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Wounded Warrior Tennis, Gaithersburg, MD | program
-- Look at: The group’s own site, last updated in 2018. The group later became Adaptive Tennis US, whose site is gone.
UPDATE programs SET website_url = 'https://iambearlee.wixsite.com/website-2wwt', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '64f52b8c-e673-5f87-bb6c-12c393694c68' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Dearborn Public Schools, Dearborn, MI | program
-- Look at: The district homepage nothing on tennis. Probably an in-school program.
UPDATE programs SET website_url = 'https://dearbornschools.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '21fb01d6-bfdf-5b9b-bada-3b3355c8b0cd' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- St. Paul Urban Tennis Adaptive Tennis Program (Highland Friendship Club and St. Paul Public Schools (SPPS) Adaptive), St. Paul, MN | program
-- Look at: The organization’s homepage it has no adaptive page.
UPDATE programs SET website_url = 'https://www.stpaulurbantennis.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '4b41a318-559f-5439-a45a-0c1dfe15c567' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Mississippi Gulf Coast CTA Reach Program, Ocean Springs, MS | program
-- Look at: An empty USTA club page for the renamed Gulf Coast CTA. No mention of Reach or adaptive tennis.
UPDATE programs SET website_url = 'https://playtennis.usta.com/coastaltennisalliance', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '2f9e3daf-a5f5-5764-8a61-545c425bb9ce' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Watertown YMCA Adaptive Program, Watertown, NY | program
-- Look at: The Y’s tennis page no adaptive program posted.
UPDATE programs SET website_url = 'https://www.watertownymca.org/programs/racquet-sports/tennis', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'd5866a95-c6b3-5d2b-8ba7-73dfcd9ee351' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- ADN-Northeast Adaptive Tennis Program, Philadelphia, PA | program
-- Look at: The group’s homepage lists an adaptive tennis clinic, but its events date from 2022.
UPDATE programs SET website_url = 'https://adnnec.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '2bf66ca1-27a9-5412-a7f7-d8d56d0bb486' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Mustang Tennis Adaptive Program, Brentwood, TN | program
-- Look at: A school’s athletics page with no tennis on it (the tennis team is on its schedules page), and the team is for the school’s own students.
UPDATE programs SET website_url = 'https://www.curreyingram.org/athletics/mustang-athletics', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'fafdd376-e642-543d-b26f-9a9bf670ebbc' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- T.R.I.N.I.T.Y. TRAILBLAZERS, Midlothian, VA | program
-- Look at: The group’s homepage. Trailblazers is its youth cardio tennis class, not an adaptive program.
UPDATE programs SET website_url = 'https://www.trinitytennis.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '1bbeed53-b57a-5506-b41f-dbd1d89c1505' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');
