ALTER TABLE profile_login_tokens ADD COLUMN nonce_hash TEXT;
ALTER TABLE organization_login_tokens ADD COLUMN nonce_hash TEXT;
ALTER TABLE admin_login_tokens ADD COLUMN nonce_hash TEXT;

CREATE INDEX IF NOT EXISTS profile_login_tokens_nonce_idx ON profile_login_tokens(nonce_hash);
CREATE INDEX IF NOT EXISTS organization_login_tokens_nonce_idx ON organization_login_tokens(nonce_hash);
CREATE INDEX IF NOT EXISTS admin_login_tokens_nonce_idx ON admin_login_tokens(nonce_hash);
