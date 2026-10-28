CREATE TABLE IF NOT EXISTS profile_saved_sports (
  profile_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sport_key TEXT NOT NULL REFERENCES sports(sport_key),
  created_at TEXT NOT NULL,
  PRIMARY KEY (profile_id, sport_key)
);

CREATE INDEX IF NOT EXISTS profile_saved_sports_profile_idx
  ON profile_saved_sports(profile_id, created_at DESC);
