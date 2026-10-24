import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Readable } from 'node:stream';
import { createPlaytestHandler } from '../backend/playtest.js';
import signup from '../api/playtest.js';
import cancel from '../api/playtest/cancel.js';

function response() {
  return { status: null, body: null, writeHead(status, headers) { this.status = status; this.headers = headers; }, end(body) { this.body = JSON.parse(body); } };
}
function request(body) {
  return Object.assign(Readable.from([]), { body, method: 'POST', headers: { host: 'preview.example', origin: 'https://preview.example', 'content-type': 'application/json' }, socket: { remoteAddress: '192.0.2.3' } });
}
const input = { email: '  Vercel@Example.com ', name: '', device: 'desktop', consent: true };

test('Vercel parsed JSON goes through the same signup and cancellation validation', async () => {
  let saved, deleted;
  const handle = createPlaytestHandler({ store: {
    register: async value => { saved = value; return { token: 'a'.repeat(64) }; },
    cancel: async value => { deleted = value; }
  } });
  const res = response();
  await handle(request(input), res, '/api/playtest');
  assert.equal(res.status, 200); assert.equal(saved.email, 'vercel@example.com');
  const cancellation = response();
  await handle(request({ token: res.body.token }), cancellation, '/api/playtest/cancel');
  assert.equal(cancellation.status, 200); assert.equal(deleted, 'a'.repeat(64));
  for (const [body, expected] of [[[], 400], [null, 400], [{ ...input, consent: false }, 422], [{ ...input, name: 'x'.repeat(5000) }, 413]]) {
    const bad = response(); await handle(request(body), bad, '/api/playtest'); assert.equal(bad.status, expected);
  }
  const malformed = request(input);
  Object.defineProperty(malformed, 'body', { get() { throw new SyntaxError('invalid JSON'); } });
  const bad = response(); await handle(malformed, bad, '/api/playtest'); assert.equal(bad.status, 400);
});

test('Vercel entry points reject reads and never expose subscriber information', async () => {
  for (const handler of [signup, cancel]) {
    const req = request(null); req.method = 'GET'; const res = response();
    await handler(req, res);
    assert.equal(res.status, 405); assert.equal(res.headers.Allow, 'POST');
    assert.equal(res.body.ok, false);
  }
});
