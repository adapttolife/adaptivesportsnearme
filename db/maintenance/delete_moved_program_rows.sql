DELETE FROM organizations
WHERE id <> 'a461f29b-0b89-4e17-b879-6a80e0abd101'
  AND (lower(COALESCE(org_type, '')) LIKE '%program%' OR lower(name) LIKE '%program%');
