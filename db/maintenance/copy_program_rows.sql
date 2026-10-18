INSERT INTO programs (id, organization_id, name, sport, sport_key, sports_json, website_url, email, phone, city, state, state_name, zip, publicity_consent, country, lat, lng, geo_precision, description, cost_note, equipment_provided, ages, verification_status, verification_method, status, is_public, last_ok_at, created_at, updated_at)
SELECT id, 'a461f29b-0b89-4e17-b879-6a80e0abd101', name, sport, sport_key, sports_json, website_url, email, phone, city, state, state_name, zip, publicity_consent, country, lat, lng, geo_precision, description, cost_note, equipment_provided, ages, verification_status, verification_method, status, is_public, last_ok_at, created_at, updated_at
FROM organizations
WHERE id <> 'a461f29b-0b89-4e17-b879-6a80e0abd101'
  AND (lower(COALESCE(org_type, '')) LIKE '%program%' OR lower(name) LIKE '%program%');
