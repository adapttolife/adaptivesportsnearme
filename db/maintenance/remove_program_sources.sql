DELETE FROM organization_data_sources WHERE organization_id IN (SELECT id FROM programs);
