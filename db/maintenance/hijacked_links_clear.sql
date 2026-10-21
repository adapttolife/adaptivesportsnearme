-- docs/data-fixes/hijacked-links.md. URGENT: these links send visitors to gambling, spam or unrelated sites today.
-- Each UPDATE matches the row's id AND the hijacked link, so it is safe to run twice and skips a row someone already fixed.
-- Updated after #106 merged: if the first version already ran, running this file again only adds Alabama's
-- real link and rejects the review items; everything else matches nothing.

-- Alabama Adapted Athletics: the old domain was taken over; its own site is bamaadapted.com ("Alabama Adapted - Official Athletics Website"), checked 2026-10-21.
UPDATE organizations SET website_url = 'https://bamaadapted.com/', last_ok_at = NULL, updated_at = strftime('%Y-%m-%dT%H:%M:%SZ','now') WHERE id = 'f6b95ded-9dba-4a7c-a441-edd5b9c6406b' AND (website_url = 'http://alabamaadapted.com/' OR website_url IS NULL OR website_url = '');

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

-- Pending review items drafted from the hijacked pages (an email from a betting company, a casino site's town and ZIP,
-- and sport labels read off spam pages). Rejected so nobody approves them.
UPDATE review_queue SET status = 'rejected', resolved_at = strftime('%Y-%m-%dT%H:%M:%SZ','now'), resolved_by = 'data fix: source page was hijacked' WHERE item_id IN (301, 461, 293, 465, 584, 657) AND status = 'pending';

-- Check: every link should read cdagj.org, bamaadapted.com or NULL.
SELECT id, name, website_url, last_ok_at FROM organizations WHERE id IN ('f6b95ded-9dba-4a7c-a441-edd5b9c6406b', 'db949607-6858-4d28-86cd-e2897d7adb19', '63c9e62b-c605-4b14-bfcd-25a3ccb00078', '2412b1f2-b136-4e90-92bb-9589f71dfcf3', 'e0978514-3831-4cd5-8d0f-fb401b73cb96', 'b707d9db-e8d1-4cf3-89e2-3363b137ca09', 'b8e095b5-0d63-44e3-8bae-18dd3a15c905', '2c9cfcbc-1af5-5d8b-acf0-fc6a42cb8486', '3b4a166f-3a2b-51fc-b416-1974cb81a914');
