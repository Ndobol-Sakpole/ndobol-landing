import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
import { createPostgresStore } from '../data/postgres-playtest-store.js';
import { persistentStore } from '../data/playtest-persistence.js';
import { createServer } from '../backend/server.js';

let db, store;
before(async () => {
  db = new PGlite();
  const migration = await readFile(new URL('../data/migrations/001-playtest.sql', import.meta.url), 'utf8');
  await db.exec(migration);
  await db.exec(migration); // The initial schema must be safe to apply twice.
  store = createPostgresStore(async (sql, params) => (await db.query(sql, params)).rows, 'test-only-secret');
});
after(async () => db?.close());

test('Postgres stores consent, handles concurrent duplicates, and cancels only by the original code', async () => {
  const signup = { email: 'postgres@example.com', name: "O'Neil", device: 'desktop' };
  const results = await Promise.all(Array.from({ length: 5 }, () => store.register(signup)));
  const tokens = results.filter(result => result.token);
  assert.equal(tokens.length, 1);
  const { rows } = await db.query('SELECT * FROM playtest_signups');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].name, "O'Neil");
  assert.equal(rows[0].consent_version, '2026-10-24');
  assert.notEqual(rows[0].cancellation_hash, tokens[0].token);
  await store.cancel('0'.repeat(64));
  assert.equal((await db.query('SELECT * FROM playtest_signups')).rows.length, 1);
  // A different function instance uses the same database and can cancel it.
  const other = createPostgresStore(async (sql, params) => (await db.query(sql, params)).rows, 'test-only-secret');
  await other.cancel(tokens[0].token);
  assert.equal((await db.query('SELECT * FROM playtest_signups')).rows.length, 0);
});

test('Postgres rate limits are atomic across instances, isolate addresses, and expire', async () => {
  const other = createPostgresStore(async (sql, params) => (await db.query(sql, params)).rows, 'test-only-secret');
  const attempts = await Promise.all(Array.from({ length: 20 }, (_, i) => (i % 2 ? store : other).allowRequest('192.0.2.1', 10, 900000, 1000)));
  assert.equal(attempts.filter(result => result.allowed).length, 10);
  assert.equal(attempts.at(-1).retryAfter, 900);
  assert.equal((await store.allowRequest('192.0.2.2', 10, 900000, 1000)).allowed, true);
  const rows = (await db.query('SELECT * FROM playtest_request_limits')).rows;
  assert.equal(rows.length, 2);
  assert.ok(rows.every(row => /^[a-f0-9]{64}$/.test(row.key_hash)));
  assert.ok(!JSON.stringify(rows).includes('192.0.2'));
  assert.equal((await store.allowRequest('192.0.2.1', 10, 900000, 901000)).allowed, true);
  assert.equal((await db.query('SELECT * FROM playtest_request_limits')).rows.length, 1);
});

test('an unconfigured production database fails closed without creating a local signup', async t => {
  const server = createServer({ playtestStore: persistentStore('') });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  t.after(() => new Promise(resolve => server.close(resolve)));
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/playtest`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'no-database@example.com', name: '', device: 'desktop', consent: true })
  });
  assert.equal(response.status, 503);
  const body = await response.json();
  assert.equal(body.ok, false);
  assert.doesNotMatch(JSON.stringify(body), /DATABASE_URL|postgres|sqlite|no-database@example/);
});
