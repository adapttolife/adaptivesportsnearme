SELECT 'organizations' AS entity, id, name, 'website_url' AS field, website_url AS value
FROM organizations
WHERE website_url IS NOT NULL
  AND trim(website_url) <> ''
  AND lower(website_url) NOT LIKE 'http://%'
  AND lower(website_url) NOT LIKE 'https://%'
UNION ALL
SELECT 'programs', id, name, 'website_url', website_url
FROM programs
WHERE website_url IS NOT NULL
  AND trim(website_url) <> ''
  AND lower(website_url) NOT LIKE 'http://%'
  AND lower(website_url) NOT LIKE 'https://%'
UNION ALL
SELECT 'events', id, title, 'url', url
FROM events
WHERE url IS NOT NULL
  AND trim(url) <> ''
  AND lower(url) NOT LIKE 'http://%'
  AND lower(url) NOT LIKE 'https://%'
UNION ALL
SELECT 'events', id, title, 'recap_url', recap_url
FROM events
WHERE recap_url IS NOT NULL
  AND trim(recap_url) <> ''
  AND lower(recap_url) NOT LIKE 'http://%'
  AND lower(recap_url) NOT LIKE 'https://%'
UNION ALL
SELECT 'grants', id, name, 'application_url', application_url
FROM grants
WHERE application_url IS NOT NULL
  AND trim(application_url) <> ''
  AND lower(application_url) NOT LIKE 'http://%'
  AND lower(application_url) NOT LIKE 'https://%'
UNION ALL
SELECT 'grants', id, name, 'source_url', source_url
FROM grants
WHERE source_url IS NOT NULL
  AND trim(source_url) <> ''
  AND lower(source_url) NOT LIKE 'http://%'
  AND lower(source_url) NOT LIKE 'https://%'
ORDER BY entity, id, field;
