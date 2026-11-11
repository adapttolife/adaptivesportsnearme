ALTER TABLE beta_testers ADD COLUMN name TEXT NOT NULL DEFAULT '';

ALTER TABLE beta_testers ADD COLUMN organization TEXT;

ALTER TABLE beta_testers ADD COLUMN phone TEXT;
