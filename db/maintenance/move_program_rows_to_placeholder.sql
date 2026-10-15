INSERT INTO organizations (id, name, org_type, is_public, status, created_at, updated_at)
VALUES ('a461f29b-0b89-4e17-b879-6a80e0abd101', 'Organization not yet assigned', 'placeholder', 1, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT(id) DO UPDATE SET name = excluded.name, updated_at = excluded.updated_at;

INSERT INTO programs (
  id, organization_id, name, sport, sport_key, sports_json, website_url, email, phone,
  city, state, state_name, zip, publicity_consent, country, lat, lng, geo_precision,
  description, cost_note, equipment_provided, ages, verification_status,
  verification_method, status, is_public, last_ok_at, created_at, updated_at
)
SELECT
  id, 'a461f29b-0b89-4e17-b879-6a80e0abd101', name, sport, sport_key, sports_json,
  website_url, email, phone, city, state, state_name, zip, publicity_consent, country,
  lat, lng, geo_precision, description, cost_note, equipment_provided, ages,
  verification_status, verification_method, status, is_public, last_ok_at, created_at, updated_at
FROM organizations
WHERE id <> 'a461f29b-0b89-4e17-b879-6a80e0abd101'
  AND (lower(COALESCE(org_type, '')) LIKE '%program%' OR lower(name) LIKE '%program%')
ON CONFLICT(id) DO UPDATE SET
  organization_id = excluded.organization_id, name = excluded.name, sport = excluded.sport,
  sport_key = excluded.sport_key, sports_json = excluded.sports_json, website_url = excluded.website_url,
  email = excluded.email, phone = excluded.phone, city = excluded.city, state = excluded.state,
  state_name = excluded.state_name, zip = excluded.zip, publicity_consent = excluded.publicity_consent,
  country = excluded.country, lat = excluded.lat, lng = excluded.lng, geo_precision = excluded.geo_precision,
  description = excluded.description, cost_note = excluded.cost_note, equipment_provided = excluded.equipment_provided,
  ages = excluded.ages, verification_status = excluded.verification_status,
  verification_method = excluded.verification_method, status = excluded.status,
  is_public = excluded.is_public, last_ok_at = excluded.last_ok_at, updated_at = excluded.updated_at;

DELETE FROM organizations
WHERE id <> 'a461f29b-0b89-4e17-b879-6a80e0abd101'
  AND (lower(COALESCE(org_type, '')) LIKE '%program%' OR lower(name) LIKE '%program%');

