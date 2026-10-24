CREATE TABLE IF NOT EXISTS playtest_signups (
  email TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  device TEXT NOT NULL CHECK (device IN ('desktop', 'android', 'ios')),
  consent_version TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cancellation_hash TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS playtest_request_limits (
  key_hash TEXT PRIMARY KEY,
  request_count INTEGER NOT NULL,
  expires_at BIGINT NOT NULL
);
CREATE INDEX IF NOT EXISTS playtest_request_limits_expiry ON playtest_request_limits(expires_at);
