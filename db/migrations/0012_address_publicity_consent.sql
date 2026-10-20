ALTER TABLE organizations ADD COLUMN address_publicity_consent INTEGER NOT NULL DEFAULT 0 CHECK (address_publicity_consent IN (0, 1));
