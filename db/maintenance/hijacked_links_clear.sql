-- docs/data-fixes/hijacked-links.md. URGENT: these links send visitors to gambling, spam or unrelated sites today.
-- Each UPDATE matches the row's id AND the hijacked link, so it is safe to run twice and skips a row someone already fixed.
-- Each UPDATE also sets updated_at, so the public "updated" date and the admin 24-hour count show the change.
--
-- Result: 5 listings hide, 2 stay listed by town with no link, Alabama gets bamaadapted.com, Colorado gets cdagj.org.
-- This hides 5 public listings, so it waits for Alec's yes. Running it is the site reviewer's step, not an agent's.
--
-- Staging first, then live (docs/MAINTAINERS.md). Run db/maintenance/hijacked_links_check.sql before and after each:
--   npx wrangler d1 execute asnm-db-staging --remote --config wrangler.preview.json --file db/maintenance/hijacked_links_clear.sql
--   npx wrangler d1 execute asnm-db --remote --config wrangler.json --file db/maintenance/hijacked_links_clear.sql

-- Alabama Adapted Athletics: the old domain was taken over; its own site is bamaadapted.com ("Alabama Adapted - Official Athletics Website"), checked 2026-10-21.
-- Move United's directory lists bamaadapted.com for University of Alabama Adapted Athletics, and the site gives the UA Tuscaloosa address.
UPDATE organizations SET website_url = 'https://bamaadapted.com/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f6b95ded-9dba-4a7c-a441-edd5b9c6406b' AND website_url = 'http://alabamaadapted.com/';

-- Coastal Carolina Adaptive Sports & Recreation: https://www.coastaladaptivesports.org/ was taken over (see the doc). No current site of its own was found.
UPDATE organizations SET website_url = NULL, last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'db949607-6858-4d28-86cd-e2897d7adb19' AND website_url = 'https://www.coastaladaptivesports.org/';

-- Colorado Discover Ability: the old domain was taken over; its own site is cdagj.org ("Home - Colorado Discover Ability"), checked 2026-10-21.
UPDATE organizations SET website_url = 'https://cdagj.org/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = '63c9e62b-c605-4b14-bfcd-25a3ccb00078' AND website_url = 'http://www.coloradodiscoverability.org';

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
-- Classify items 293, 465, 584 and 657 are NOT changed here. Their source pages were probably already hijacked,
-- so a person checks each against the org's real site before approving, or rejects it (docs/data-fixes/hijacked-links.md).
