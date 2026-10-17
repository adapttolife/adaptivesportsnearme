-- PR #60, choice 3 of 3. 44 listings: 36 organizations, 8 programs.
-- Clear the USTA link. No page of their own was found for these listings. Each line
-- empties the website, so the listing shows Suggest a website instead of sending
-- people to the general USTA page.
--
-- Look it over, delete any line you do not want, then run it on staging, then live:
--   npx wrangler d1 execute asnm-db-staging --config wrangler.preview.json --remote --file db/maintenance/usta_links_3_clear.sql
--   npx wrangler d1 execute asnm-db --config wrangler.json --remote --file db/maintenance/usta_links_3_clear.sql
--
-- Safe to run twice: a line changes its listing only while that listing still has the
-- general USTA page, and a line whose id is not in a database does nothing there.
-- Each change also clears the listing check dates (they were for the USTA page), so the
-- listing shows not checked yet until the new link is checked.

-- Adapted Physical Education, Danbury, CT | organization
-- Note: USTA gives only a school district contact. This looks like the district’s adapted PE for its own students. No page found.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'bfc08d71-7a70-56a8-9621-4e1d6186727e' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Bunny’s Buddies (is with the Central Iowa Tennis Alliance), Adel, IA | organization
-- Note: USTA gives only a personal contact. Its parent group has an empty USTA club page with nothing on the program.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '0bd36c4a-900a-5123-9e01-0d33cc984888' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Independent North, Algona-Dyson Special Olympics Tennis, Algona, IA | organization
-- Note: USTA gives only a personal contact. Special Olympics Iowa has no Algona listing. No page found.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '480c6535-f57c-5321-9e9a-a4133f43f4b3' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Nancy’s Stars, Bluegrass, IA | organization
-- Note: USTA gives only a personal contact. No page found.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '1124638c-1be2-50d5-9500-f7c3540b7f7e' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- USTA Iowa Allstars, Clinton, IA | organization
-- Note: An annual special needs tournament co-hosted in Clinton only USTA news stories cover it. No page of its own.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '24b7208b-d255-5ee9-aaa1-6412cc1b7b42' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Orofino Community Tennis, Orofino, ID | organization
-- Note: USTA gives only a school district contact. No page found.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'f7dee15a-0cf0-579e-b6f5-5496f6de0e9e' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Adaptive Tennis at Marquette Park, Chicago, IL | organization
-- Note: USTA gives only a personal contact (the same volunteer as Tennis for Veterans). No program page found.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'ab76317d-8f18-5a87-87d4-9b1de25b92f8' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Lincoln Way Area Tennis, Mokena, IL | organization
-- Note: USTA gives only a personal contact. No site or USTA club page found the only mention online is a 2019 event listing.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '65989bab-100d-5655-baeb-c332b2260d4d' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Midwest Unified Doubles Showdown, Homewood, IL | organization
-- Note: A doubles event with the same contact as iCan Dream Tennis. No event page found.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'daedc1e2-a4eb-50d9-8098-65b5edba4d5c' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Tennis for Veterans, Chicago, IL | organization
-- Note: USTA gives only a personal contact. It met at McKinley Park no current page found.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '8ffda8ce-33d3-5e33-a943-100ed5723bba' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Tiebreaks, Park Forest, IL | organization
-- Note: USTA gives only a personal contact. No page found, and the Park Forest club’s site no longer exists.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'abf7bfa9-93f5-51e0-951c-0d11552a72fe' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- CBTP Adaptive Tennis Club of Topeka, Topeka, KS | organization
-- Note: USTA gives only a school district contact this looks like the district’s transition program. No page found.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '04ec1d9e-2183-5691-9457-1326301a3e80' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Tennis For All, Fort Riley, KS | organization
-- Note: USTA gives only a personal contact, a volunteer who teaches soldiers at Fort Riley. No page found.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '2606b978-af5d-51f1-9c71-ac63d5eb9260' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Warriors in Transition, Fort Riley, KS | organization
-- Note: The Fort Riley unit it served was inactivated on August 14, 2026. Probably no longer runs: worth removing.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'b0cd94c4-5e59-5284-ac7b-c8fd3223b849' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Special Populations, FEAT, Louisville, KY | organization
-- Note: Same contact as FEAT: Autism Camp. FEAT’s site shows no current tennis program. No page found.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '4e93f1f4-8af6-502c-b94a-66fb35ebb7aa' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Adaptive Play Day, Holland, MI | organization
-- Note: A one-time play day. No page found.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '1b916ec6-ede8-5d78-bf21-5196b9111160' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Bay City Unified Adaptive Tennis, Bay City, MI | organization
-- Note: Run by the Bay Community Tennis Association, whose USTA club page is empty. Its Facebook page may help it needs a person to check.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '64402e8c-5c09-5e45-802e-d0cf5ab22fb2' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Free Community Event, See website / multiple locations, MI | organization
-- Note: USTA’s line has no organization, contact or town it may be a stray piece of the Got Ability Sports Tennis (Brighton) entry. Worth removing.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '5c397e74-f452-5baa-be94-5dd908554e53' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Battlefield BVI Tennis, Jackson, MS | organization
-- Note: USTA gives only a personal contact. Only news stories mention it USTA Mississippi’s adaptive list does not include it.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '81d10726-8cb7-5821-a306-ed96fc8c2e87' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Love United Adaptive Tennis, Meridian, MS | organization
-- Note: USTA gives only a school district contact. No page found. The Meridian clinic with a page is a separate listing (Meridian Roll and Run).
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '7a61af4f-5def-588f-95bf-a78a62ddcfee' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Count Me In, Inc., Exeter, Hampton, NH | organization
-- Note: A small registered nonprofit with no website, USTA club page or social page found.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'a5833071-6941-56a7-b99d-ccc231eee4f5' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Adaptive Tennis US, Lawrenceville, NJ | organization
-- Note: Its site, adaptivetennisus.com, no longer exists. No page found for a Lawrenceville program.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '26180418-e831-50e5-aed0-aa1f58cd1c29' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Adaptive Tennis and Fitness, Dix Hills, NY | organization
-- Note: USTA gives no contact, and no group by this name was found. The area’s adaptive program is NEYSA’s, which has its own listing: this may be a duplicate.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'a63d31d5-337e-51fc-8b14-851caa19066f' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Adaptive Tennis for Students with Autism, Jamaica, NY | organization
-- Note: USTA gives only a personal contact. No page found.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '9a5831db-0395-5e09-a61f-eda282750d98' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Serving Heroes, Kings Park, Northport, NY | organization
-- Note: USTA gives only a personal contact. Possibly the free veterans tennis at SPORTIME Kings Park, but nothing online uses this name.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '618343a6-b4c0-5223-aa39-35eebd8aa0b4' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- SPIRIT Tennis, Blauvelt, NY | organization
-- Note: USTA gives only a personal contact. No page found.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '247531e5-830a-5c4f-a977-9051c78acd9d' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Walnut Hills Outreach, Cincinnati, OH | organization
-- Note: USTA gives only a personal contact. The Cincinnati Tennis Foundation is a separate listing, so its site was not used.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'ee4c384e-91d3-58f6-9f1e-8e9f3953ca01' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Cheltenham Youth Tennis, Wyncote, PA | organization
-- Note: Its USTA club page is empty, and the last session found is from 2020. No other site.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '12519b06-9325-5299-85d7-17a88e7b0831' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Delco Special Olympics, Haverford, PA | organization
-- Note: Its own site, sodelco.org, is down now (it had a tennis page in 2020). Worth checking again later.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '1d689db8-4b66-51c3-9d05-fc28cfbcfc2c' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Matchpoint Tennis Social Club, Philadelphia, PA | organization
-- Note: USTA gives only a personal contact. No page found (the MatchPoint club on USTA’s site is a different club, in New York).
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '09702970-6d21-544e-b8d9-7e93b2199fba' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Exceptional Islanders Tennis, John’s Island, SC | organization
-- Note: USTA gives only a school district contact likely a high school program on Johns Island. No page found.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'c86cec63-ecab-58ea-b070-4163e6020bed' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Adaptive Tennis Kick-Off Event, Blacksburg, VA | organization
-- Note: A one-time Virginia Tech wheelchair tennis clinic in February 2020. No current program: worth removing.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'd0161778-c9e7-55d7-a172-4e9cfb24e03d' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- EXPO Tennis, Enumclaw, WA | organization
-- Note: A coach’s seasonal class sold through Enumclaw parks registration no lasting page. Possibly related, not confirmed: enumclawspecialolympics.com/tennis.html.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'f2038dc6-0f71-5857-a6ef-dad4becd3d8e' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Lakeland Area Special Olympics, Minocqua, WI | organization
-- Note: Special Olympics Wisconsin lists the Lakeland Area program but gives it no page. No site found.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '6d6ae8ab-4df4-58d6-9ee3-9d232d6db0d9' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Grayhound Youth Sports, Northfork, WV | organization
-- Note: Real, but no website or official social page found only news stories.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '1bfd588f-bd29-523f-9268-ad2472450a28' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- I Play Tennis, Inc., Huntington, Ona, WV | organization
-- Note: USTA gives only a personal contact. No page found (the similar iplaytennis domains belong to other people).
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, last_checked_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'af1c0265-ff7a-5a1f-b16a-b5fc3b1f3a81' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Special Olympics Summit County, Breckenridge, CO | program
-- Note: Real (practices in Breckenridge), but no page of its own. Special Olympics Colorado has only a regional page that names Summit County among 23 counties.
UPDATE programs SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '72588d7a-6900-594c-8bdd-611ecc8e2cc9' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- ACE Program, Atlantic Beach, FL | program
-- Note: USTA gives only a contact email. No page found.
UPDATE programs SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '007c9dc6-6b24-5776-903f-7c23125545e6' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Tennis People, Inc., McDonough, GA | program
-- Note: A real McDonough nonprofit (weekly tennis for people with intellectual disabilities), but no website, USTA page or Facebook page found.
UPDATE programs SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '87e1b3a7-71b4-5a57-b823-01f6a532eb82' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Scott County Masters, Riverdale, IA | program
-- Note: USTA gives only a personal contact. Named once in a 2024 USTA Iowa story no page.
UPDATE programs SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'de35d6a2-3b10-5aba-88c2-ca538d4fff50' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Acadiana Junior Tennis League, Lafayette, LA | program
-- Note: USTA’s contact is a country club’s tennis director, but no page mentions this league.
UPDATE programs SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'dc988aed-e743-5414-b81c-ab9630fe82f0' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Blind Tennis, Youngsville, LA | program
-- Note: USTA gives only a personal contact. No blind tennis program found in Youngsville or Lafayette.
UPDATE programs SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'ef1cc611-6541-56a7-a083-ba2f0349ceab' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Shot of the Day Tennis, Frederick, MD | program
-- Note: USTA gives only a personal contact. No page found.
UPDATE programs SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = '2e9cd981-3d1c-5d0c-9542-b6bd616fd3d1' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');

-- Barnegat High School Challenger Tennis Program, Barnegat, NJ | program
-- Note: The high school’s Challenger League page does not mention tennis. No tennis page found.
UPDATE programs SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
WHERE id = 'b9128131-83cb-5d17-877c-d0e485f83328' AND website_url IN ('https://www.usta.com/en/home/about-usta/who-we-are/national/about-adaptive-tennis.html', 'https://www.usta.com/en/home/about-usta/national-filtered.html#/filter=who-we-are');
