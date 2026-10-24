import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { createServer } from '../backend/server.js';

async function fixture(t, options = {}) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'ndobol-playtest-'));
  const database = path.join(dir, 'playtest.sqlite');
  const server = createServer({ playtestDatabasePath: database, playtestRateLimit: 100, ...options });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  t.after(async () => { await new Promise(resolve => server.close(resolve)); await rm(dir, { recursive: true, force: true }); });
  const base = `http://127.0.0.1:${server.address().port}`;
  return { database, base, post: (body, route = '/api/playtest', headers = {}) => fetch(base + route, { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) }) };
}
const valid = { email: 'qa@example.com', name: 'QA', device: 'desktop', consent: true, company: '' };

test('registration persists consent, deduplicates normalized email, and only the original token can cancel', async t => {
  const { database, post, base } = await fixture(t);
  const response = await post({ ...valid, email: '  QA@Example.com ' });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const { token } = await response.json();
  assert.match(token, /^[a-f0-9]{64}$/);
  const duplicate = await (await post({ ...valid, name: 'Different', device: 'ios' })).json();
  assert.equal(duplicate.token, null);
  const db = new DatabaseSync(database);
  const rows = db.prepare('SELECT * FROM playtest_signups').all();
  assert.equal(rows.length, 1); assert.equal(rows[0].email, 'qa@example.com');
  assert.equal(rows[0].name, 'QA'); assert.equal(rows[0].device, 'desktop');
  assert.equal(rows[0].consent_version, '2026-10-24');
  assert.notEqual(rows[0].cancellation_hash, token);
  assert.equal((await fetch(base + '/api/playtest')).status, 405);
  assert.equal((await fetch(base + '/data/playtest.sqlite')).status, 404);
  await post({ token: '0'.repeat(64) }, '/api/playtest/cancel');
  assert.equal(db.prepare('SELECT count(*) AS n FROM playtest_signups').get().n, 1);
  const removed = await post({ token }, '/api/playtest/cancel');
  assert.equal(removed.status, 200);
  assert.equal(db.prepare('SELECT count(*) AS n FROM playtest_signups').get().n, 0);
  db.close();
});

test('invalid, unconsented, oversized, cross-origin and non-JSON submissions are rejected', async t => {
  const { post, base } = await fixture(t);
  for (const change of [{ email: 'broken' }, { consent: false }, { device: 'unknown' }, { name: 'x'.repeat(61) }, { email: '<svg>@example.com' }]) {
    assert.equal((await post({ ...valid, ...change })).status, 422);
  }
  assert.equal((await post({ ...valid, name: 'x'.repeat(5000) })).status, 413);
  assert.equal((await post(valid, '/api/playtest', { Origin: 'https://elsewhere.example' })).status, 403);
  assert.equal((await post(valid, '/api/playtest', { 'Sec-Fetch-Site': 'cross-site' })).status, 403);
  assert.equal((await post(valid, '/api/playtest', { 'Content-Type': 'text/plain' })).status, 415);
  assert.equal((await fetch(base + '/api/playtest', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' })).status, 400);
  assert.equal((await post(valid, '/api/playtest', { Origin: base })).status, 200);
});

test('honeypot saves no registration and repeated requests are limited', async t => {
  const { database, post } = await fixture(t, { playtestRateLimit: 2 });
  assert.equal((await post({ ...valid, company: 'bot' })).status, 200);
  assert.equal((await post(valid)).status, 200);
  const limited = await post(valid);
  assert.equal(limited.status, 429); assert.ok(Number(limited.headers.get('retry-after')) > 0);
  const db = new DatabaseSync(database);
  assert.equal(db.prepare('SELECT count(*) AS n FROM playtest_signups').get().n, 1);
  db.close();
});

test('storage failure returns a retryable failure, never a success or internal detail', async t => {
  const { database, post } = await fixture(t);
  await writeFile(database, 'invalid database');
  const response = await post(valid);
  assert.equal(response.status, 503);
  const body = await response.json();
  assert.equal(body.ok, false); assert.match(body.message, /belum bisa disimpan/);
  assert.doesNotMatch(body.message, /sqlite|database|INSERT|example.com/i);
});
