-- Safe to re-run on both databases. No content changes or uniqueness changes.
-- Public directory page ORDER BY no longer sorts/scans the entire directory.
CREATE INDEX IF NOT EXISTS organizations_public_order_idx
  ON organizations (is_public, status, (sport_key IS NULL), (state IS NULL), name);

-- External admin export's case-insensitive order; full exports still read N rows.
CREATE INDEX IF NOT EXISTS organizations_name_nocase_idx
  ON organizations (name COLLATE NOCASE);
CREATE INDEX IF NOT EXISTS data_sources_name_nocase_idx
  ON data_sources (source_name COLLATE NOCASE);

-- Existing primary key starts with organization_id. Reverse lookup/grouping
-- needs source_id first to avoid scanning the table for each source.
CREATE INDEX IF NOT EXISTS organization_data_sources_source_idx
  ON organization_data_sources (source_id, organization_id);

-- Also ensure the original queue index exists on installations missing it.
-- Supports both oldest-first external reviews and newest-first site admin.
CREATE INDEX IF NOT EXISTS review_queue_status_idx
  ON review_queue (status, created_at);
