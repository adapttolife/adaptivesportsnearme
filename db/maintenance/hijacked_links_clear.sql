-- docs/data-fixes/hijacked-links.md. URGENT: these links send visitors to gambling, spam or unrelated sites today.
-- Each UPDATE matches the row's id AND the hijacked link, so it is safe to run twice and skips a row someone already fixed.

-- Alabama Adapted Athletics: http://alabamaadapted.com/ now goes to another site (see docs/data-fixes/hijacked-links.md).
UPDATE organizations SET website_url = NULL, last_ok_at = NULL WHERE id = 'f6b95ded-9dba-4a7c-a441-edd5b9c6406b' AND website_url = 'http://alabamaadapted.com/';

-- Coastal Carolina Adaptive Sports & Recreation: https://www.coastaladaptivesports.org/ now goes to another site (see docs/data-fixes/hijacked-links.md).
UPDATE organizations SET website_url = NULL, last_ok_at = NULL WHERE id = 'db949607-6858-4d28-86cd-e2897d7adb19' AND website_url = 'https://www.coastaladaptivesports.org/';

-- Colorado Discover Ability: the old domain now redirects to a casino review page. Its own site is cdagj.org (checked 2026-10-21).
UPDATE organizations SET website_url = 'https://cdagj.org/', last_ok_at = NULL WHERE id = '63c9e62b-c605-4b14-bfcd-25a3ccb00078' AND website_url = 'http://www.coloradodiscoverability.org';

-- Discovery Blind Sports: http://www.discoveryblindsports.org now goes to another site (see docs/data-fixes/hijacked-links.md).
UPDATE organizations SET website_url = NULL, last_ok_at = NULL WHERE id = '2412b1f2-b136-4e90-92bb-9589f71dfcf3' AND website_url = 'http://www.discoveryblindsports.org';

-- Michigan Adaptive Sports: https://www.michiganadaptivesports.com/ now goes to another site (see docs/data-fixes/hijacked-links.md).
UPDATE organizations SET website_url = NULL, last_ok_at = NULL WHERE id = 'e0978514-3831-4cd5-8d0f-fb401b73cb96' AND website_url = 'https://www.michiganadaptivesports.com/';

-- Midwest Wheelchair Sport & Social Club: http://www.mdwssc.org now goes to another site (see docs/data-fixes/hijacked-links.md).
UPDATE organizations SET website_url = NULL, last_ok_at = NULL WHERE id = 'b707d9db-e8d1-4cf3-89e2-3363b137ca09' AND website_url = 'http://www.mdwssc.org';

-- Sailing 4 All: http://www.gosailing4all.org now goes to another site (see docs/data-fixes/hijacked-links.md).
UPDATE organizations SET website_url = NULL, last_ok_at = NULL WHERE id = 'b8e095b5-0d63-44e3-8bae-18dd3a15c905' AND website_url = 'http://www.gosailing4all.org';

-- Helping with Horsepower at Reclamation-Ranch: https://www.reclamation-ranch.com/ now goes to another site (see docs/data-fixes/hijacked-links.md).
UPDATE organizations SET website_url = NULL, last_ok_at = NULL WHERE id = '2c9cfcbc-1af5-5d8b-acf0-fc6a42cb8486' AND website_url = 'https://www.reclamation-ranch.com/';

-- New Freedom Farm: https://www.newfreedomfarm.org/ now goes to another site (see docs/data-fixes/hijacked-links.md).
UPDATE organizations SET website_url = NULL, last_ok_at = NULL WHERE id = '3b4a166f-3a2b-51fc-b416-1974cb81a914' AND website_url = 'https://www.newfreedomfarm.org/';
