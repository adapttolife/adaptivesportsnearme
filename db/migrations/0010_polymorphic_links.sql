ALTER TABLE link_checks RENAME TO link_checks_old;
CREATE TABLE link_checks (
  check_id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id TEXT,
  url TEXT NOT NULL,
  ok INTEGER NOT NULL,
  http_status INTEGER,
  detail TEXT,
  lane TEXT NOT NULL DEFAULT 'validate',
  checked_at TEXT NOT NULL
);
INSERT INTO link_checks (check_id, organization_id, url, ok, http_status, detail, lane, checked_at)
SELECT check_id, organization_id, url, ok, http_status, detail, lane, checked_at FROM link_checks_old;
DROP TABLE link_checks_old;
CREATE INDEX link_checks_org_idx ON link_checks (organization_id, checked_at);

ALTER TABLE review_queue RENAME TO review_queue_old;
CREATE TABLE review_queue (
  item_id INTEGER PRIMARY KEY AUTOINCREMENT,
  organization_id TEXT,
  lane TEXT NOT NULL,
  proposed_change TEXT NOT NULL,
  evidence TEXT,
  confidence REAL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TEXT NOT NULL,
  resolved_at TEXT,
  resolved_by TEXT
);
INSERT INTO review_queue (item_id, organization_id, lane, proposed_change, evidence, confidence, status, created_at, resolved_at, resolved_by)
SELECT item_id, organization_id, lane, proposed_change, evidence, confidence, status, created_at, resolved_at, resolved_by FROM review_queue_old;
DROP TABLE review_queue_old;
CREATE INDEX review_queue_status_idx ON review_queue (status, created_at);

ALTER TABLE events RENAME TO events_old;
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  org_id TEXT,
  sport_key TEXT REFERENCES sports(sport_key),
  venue TEXT,
  city TEXT,
  state TEXT,
  url TEXT,
  starts_at TEXT NOT NULL,
  ends_at TEXT,
  all_day INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled','cancelled')),
  is_public INTEGER NOT NULL DEFAULT 1,
  source TEXT NOT NULL DEFAULT 'admin',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
INSERT INTO events SELECT * FROM events_old;
DROP TABLE events_old;
CREATE INDEX idx_events_public_starts ON events (is_public, status, starts_at);

ALTER TABLE profile_favorites RENAME TO profile_favorites_old;
CREATE TABLE profile_favorites (
  profile_id TEXT NOT NULL REFERENCES profiles(id),
  org_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (profile_id, org_id)
);
INSERT INTO profile_favorites SELECT * FROM profile_favorites_old;
DROP TABLE profile_favorites_old;
CREATE INDEX idx_profile_favorites_org ON profile_favorites (org_id);
