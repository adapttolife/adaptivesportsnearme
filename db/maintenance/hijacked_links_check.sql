-- Read-only check for db/maintenance/hijacked_links_clear.sql (docs/data-fixes/hijacked-links.md).
-- It changes nothing. Run it before and after the clear, on staging first, then live:
--   npx wrangler d1 execute asnm-db-staging --remote --config wrangler.preview.json --file db/maintenance/hijacked_links_check.sql
--   npx wrangler d1 execute asnm-db --remote --config wrangler.json --file db/maintenance/hijacked_links_check.sql
--
-- Before: 9 rows, every still_hijacked = 1, every shows_publicly = 1.
--         If the totals row isn't 9 / 9 / 9, STOP: don't run the clear, and report what this shows.
-- After:  9 rows, every still_hijacked = 0, updated_at is the run time, last_ok_at is empty, and
--         last_checked_at is empty for Alabama and Colorado.
--         website_url is https://bamaadapted.com/ for Alabama Adapted Athletics, https://cdagj.org/ for
--         Colorado Discover Ability, and empty for the other 7.
--         shows_publicly = 0 for 5 rows. It stays 1 for Alabama and Colorado (new links), and for
--         Helping with Horsepower at Reclamation-Ranch and New Freedom Farm (listed by town, no link).
--         Review items 461 and 301 read rejected; 293, 465, 584, 657 and validate 6, 674, 683, 697 are unchanged.
-- shows_publicly uses the same rule as PUBLIC in src/data.js (is_public, status and ACTIONABLE).

SELECT id, name, website_url, city, state, is_public, status, last_ok_at, last_checked_at, updated_at,
  CASE WHEN website_url IN (
    'http://alabamaadapted.com/',
    'https://www.coastaladaptivesports.org/',
    'http://www.coloradodiscoverability.org',
    'http://www.discoveryblindsports.org',
    'https://www.michiganadaptivesports.com/',
    'http://www.mdwssc.org',
    'http://www.gosailing4all.org',
    'https://www.reclamation-ranch.com/',
    'https://www.newfreedomfarm.org/'
  ) THEN 1 ELSE 0 END AS still_hijacked,
  CASE WHEN is_public = 1 AND status = 'active' AND (
       (website_url IS NOT NULL AND website_url <> '')
    OR (city IS NOT NULL AND city <> '' AND state IS NOT NULL AND state <> '')
    OR (publicity_consent = 1 AND email IS NOT NULL AND email <> '')
    OR (publicity_consent = 1 AND phone IS NOT NULL AND phone <> '')
  ) THEN 1 ELSE 0 END AS shows_publicly
FROM organizations
WHERE id IN (
  'f6b95ded-9dba-4a7c-a441-edd5b9c6406b',
  'db949607-6858-4d28-86cd-e2897d7adb19',
  '63c9e62b-c605-4b14-bfcd-25a3ccb00078',
  '2412b1f2-b136-4e90-92bb-9589f71dfcf3',
  'e0978514-3831-4cd5-8d0f-fb401b73cb96',
  'b707d9db-e8d1-4cf3-89e2-3363b137ca09',
  'b8e095b5-0d63-44e3-8bae-18dd3a15c905',
  '2c9cfcbc-1af5-5d8b-acf0-fc6a42cb8486',
  '3b4a166f-3a2b-51fc-b416-1974cb81a914'
)
ORDER BY name;

-- Totals: before = 9 / 9 / 9; after = 9 / 0 / 4.
SELECT COUNT(*) AS rows_found,
  SUM(CASE WHEN website_url IN (
    'http://alabamaadapted.com/', 'https://www.coastaladaptivesports.org/', 'http://www.coloradodiscoverability.org',
    'http://www.discoveryblindsports.org', 'https://www.michiganadaptivesports.com/', 'http://www.mdwssc.org',
    'http://www.gosailing4all.org', 'https://www.reclamation-ranch.com/', 'https://www.newfreedomfarm.org/'
  ) THEN 1 ELSE 0 END) AS still_hijacked,
  SUM(CASE WHEN is_public = 1 AND status = 'active' AND (
       (website_url IS NOT NULL AND website_url <> '')
    OR (city IS NOT NULL AND city <> '' AND state IS NOT NULL AND state <> '')
    OR (publicity_consent = 1 AND email IS NOT NULL AND email <> '')
    OR (publicity_consent = 1 AND phone IS NOT NULL AND phone <> '')
  ) THEN 1 ELSE 0 END) AS shows_publicly
FROM organizations
WHERE id IN (
  'f6b95ded-9dba-4a7c-a441-edd5b9c6406b', 'db949607-6858-4d28-86cd-e2897d7adb19', '63c9e62b-c605-4b14-bfcd-25a3ccb00078',
  '2412b1f2-b136-4e90-92bb-9589f71dfcf3', 'e0978514-3831-4cd5-8d0f-fb401b73cb96', 'b707d9db-e8d1-4cf3-89e2-3363b137ca09',
  'b8e095b5-0d63-44e3-8bae-18dd3a15c905', '2c9cfcbc-1af5-5d8b-acf0-fc6a42cb8486', '3b4a166f-3a2b-51fc-b416-1974cb81a914'
);

-- Review queue items on these orgs: 461 and 301 (the clear rejects them) and the ones left pending for a person. Before: check that 461 is Michigan Adaptive Sports
-- (e0978514-...) and 301 is Colorado Discover Ability (63c9e62b-...), both lane enrich and pending. If an id
-- points at another org or lane (staging numbers its items separately), the clear file leaves it alone.
-- After: 461 and 301 rejected where they matched. 293, 465, 584 and 657 stay as they were, for a person to check.
SELECT item_id, organization_id, lane, status, resolved_at, resolved_by,
  CASE WHEN lane = 'enrich' AND status = 'pending' AND (
              (item_id = 461 AND organization_id = 'e0978514-3831-4cd5-8d0f-fb401b73cb96')
           OR (item_id = 301 AND organization_id = '63c9e62b-c605-4b14-bfcd-25a3ccb00078')) THEN 'reject'
       WHEN item_id IN (461, 301) AND status = 'rejected' THEN 'rejected'
       WHEN item_id IN (461, 301) THEN 'clear skips it: find the org''s own item by hand'
       ELSE 'check by hand' END AS plan
FROM review_queue
WHERE item_id IN (461, 301, 293, 465, 584, 657, 6, 674, 683, 697)
ORDER BY item_id;
