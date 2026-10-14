-- publicity_consent: 1 when the program itself said yes to showing its address,
-- phone and email, which is also what earns the Verified check on the site.
-- Staging got this column by renaming a hand-made [publicity-consent] column
-- (ALTER TABLE organizations RENAME COLUMN [publicity-consent] TO publicity_consent);
-- every other database (production, local) adds it here with the same definition.
ALTER TABLE organizations ADD COLUMN publicity_consent INTEGER NOT NULL DEFAULT 0;
