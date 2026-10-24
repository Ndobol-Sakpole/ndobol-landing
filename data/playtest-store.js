import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, chmodSync } from 'node:fs';
import path from 'node:path';
import { createHash, randomBytes } from 'node:crypto';
import { playtestConsentVersion } from './promotion.js';

const digest = token => createHash('sha256').update(token).digest('hex');

function withDatabase(filename, operation) {
  mkdirSync(path.dirname(filename), { recursive: true });
  const db = new DatabaseSync(filename);
  try {
    chmodSync(filename, 0o600);
    db.exec(`PRAGMA busy_timeout = 3000;
      PRAGMA secure_delete = ON;
      CREATE TABLE IF NOT EXISTS playtest_signups (
        email TEXT PRIMARY KEY, name TEXT NOT NULL, device TEXT NOT NULL,
        consent_version TEXT NOT NULL, created_at TEXT NOT NULL,
        cancellation_hash TEXT NOT NULL UNIQUE
      );`);
    return operation(db);
  } finally { db.close(); }
}

export function registerPlaytester(filename, { email, name, device }) {
  return withDatabase(filename, db => {
    const token = randomBytes(32).toString('hex');
    const result = db.prepare(`INSERT INTO playtest_signups
      (email, name, device, consent_version, created_at, cancellation_hash)
      VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(email) DO NOTHING`)
      .run(email, name, device, playtestConsentVersion, new Date().toISOString(), digest(token));
    // A duplicate cannot overwrite a subscriber or obtain their cancellation token.
    return { token: result.changes ? token : null };
  });
}

export function cancelPlaytester(filename, token) {
  return withDatabase(filename, db => {
    db.prepare('DELETE FROM playtest_signups WHERE cancellation_hash = ?').run(digest(token));
  });
}
