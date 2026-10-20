-- Read only: the duplicates report. No rows back means no duplicates. Run any time, on asnm-db or asnm-db-staging:
--   npx wrangler d1 execute asnm-db --remote --command="$(cat db/maintenance/duplicates_report.sql)"
-- A duplicate here: two organizations with the same name, or two programs with the same name (case and outer spaces ignored).
-- Different organizations or places that share a name carry their place in the name (Portland Vet Center (Maine), Achilles Boston).
SELECT 'organizations share a name' AS problem, MIN(name) AS name, COUNT(*) AS how_many, group_concat(id, ' ') AS ids FROM organizations GROUP BY lower(trim(name)) HAVING COUNT(*) > 1
UNION ALL SELECT 'programs share a name', MIN(name), COUNT(*), group_concat(id, ' ') FROM programs GROUP BY lower(trim(name)) HAVING COUNT(*) > 1
UNION ALL SELECT 'a program points at no organization', name, 1, id FROM programs WHERE organization_id NOT IN (SELECT id FROM organizations)
UNION ALL SELECT 'a source link points at no organization', source_id, 1, organization_id FROM organization_data_sources WHERE organization_id NOT IN (SELECT id FROM organizations)
ORDER BY 1, 3 DESC, 2;
