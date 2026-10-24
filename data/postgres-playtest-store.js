import { createHash, createHmac, randomBytes } from 'node:crypto';
import { playtestConsentVersion } from './promotion.js';

const digest = value => createHash('sha256').update(value).digest('hex');

// query(text, parameters) returns rows. Keeping the transport outside this module
// lets the same SQL run against Neon in production and Postgres in the tests.
export function createPostgresStore(query, secret) {
  if (!secret) throw new Error('A rate-limit secret is required');
  return {
    async register({ email, name, device }) {
      const token = randomBytes(32).toString('hex');
      const rows = await query(`INSERT INTO playtest_signups
        (email, name, device, consent_version, cancellation_hash)
        VALUES ($1, $2, $3, $4, $5) ON CONFLICT(email) DO NOTHING RETURNING email`,
      [email, name, device, playtestConsentVersion, digest(token)]);
      return { token: rows.length ? token : null };
    },
    async cancel(token) {
      await query('DELETE FROM playtest_signups WHERE cancellation_hash = $1', [digest(token)]);
    },
    async allowRequest(address, maxRequests, windowMs, now = Date.now()) {
      const key = createHmac('sha256', secret).update(address).digest('hex');
      const rows = await query(`WITH cleanup AS (
          DELETE FROM playtest_request_limits WHERE expires_at <= $4 AND key_hash <> $1
        )
        INSERT INTO playtest_request_limits (key_hash, request_count, expires_at)
        VALUES ($1, 1, $2)
        ON CONFLICT(key_hash) DO UPDATE SET
          request_count = CASE WHEN playtest_request_limits.expires_at <= $4 THEN 1
            ELSE LEAST(playtest_request_limits.request_count + 1, $3) END,
          expires_at = CASE WHEN playtest_request_limits.expires_at <= $4 THEN $2
            ELSE playtest_request_limits.expires_at END
        RETURNING request_count, expires_at`, [key, now + windowMs, maxRequests + 1, now]);
      return { allowed: rows[0].request_count <= maxRequests, retryAfter: Math.max(1, Math.ceil((Number(rows[0].expires_at) - now) / 1000)) };
    }
  };
}
