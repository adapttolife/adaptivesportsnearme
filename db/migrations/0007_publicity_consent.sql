-- publicity_consent: 1 when the program itself said yes to showing its address,
-- phone and email, which is also what earns the Verified check on the site.
-- Staging and production already have this column (staging by renaming a
-- hand-made [publicity-consent] column, production added 2026-10-14); a new
-- database gets it here, with production's definition.
ALTER TABLE organizations ADD COLUMN publicity_consent INTEGER NOT NULL DEFAULT 0 CHECK (publicity_consent IN (0, 1));
