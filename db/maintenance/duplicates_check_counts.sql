-- Read only. Run before and after each duplicates script on asnm-db and compare with the tables in
-- docs/data-fixes/duplicates-and-tables.md. "listed_on_the_site" uses the same rule as PUBLIC in src/data.js.
SELECT (SELECT COUNT(*) FROM organizations) AS organizations, (SELECT COUNT(*) FROM programs) AS programs, (SELECT COUNT(*) FROM organization_data_sources) AS source_links;
SELECT COUNT(*) AS listed_on_the_site FROM organizations WHERE is_public = 1 AND status = 'active' AND ((website_url IS NOT NULL AND website_url <> '') OR (city IS NOT NULL AND city <> '' AND state IS NOT NULL AND state <> '') OR (publicity_consent = 1 AND email IS NOT NULL AND email <> '') OR (publicity_consent = 1 AND phone IS NOT NULL AND phone <> ''));
SELECT (SELECT COUNT(*) FROM programs WHERE organization_id NOT IN (SELECT id FROM organizations)) AS programs_pointing_at_nothing,
  (SELECT COUNT(*) FROM organization_data_sources WHERE organization_id NOT IN (SELECT id FROM organizations)) AS source_links_pointing_at_nothing,
  (SELECT COUNT(*) FROM link_checks WHERE organization_id IS NOT NULL AND organization_id NOT IN (SELECT id FROM organizations) AND organization_id NOT IN (SELECT id FROM programs)) AS link_checks_pointing_at_nothing,
  (SELECT COUNT(*) FROM review_queue WHERE organization_id IS NOT NULL AND organization_id NOT IN (SELECT id FROM organizations) AND organization_id NOT IN (SELECT id FROM programs)) AS review_items_pointing_at_nothing;
