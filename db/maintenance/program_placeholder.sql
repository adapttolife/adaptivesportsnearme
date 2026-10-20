INSERT INTO organizations (id, name, org_type, is_public, status, created_at, updated_at)
VALUES ('a461f29b-0b89-4e17-b879-6a80e0abd101', 'Organization not yet assigned', 'placeholder', 1, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT(id) DO UPDATE SET name = excluded.name, updated_at = excluded.updated_at;
