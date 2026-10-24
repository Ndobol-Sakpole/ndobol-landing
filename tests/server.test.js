import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createServer } from '../backend/server.js';
import { paths } from '../backend/render.js';
let server, base;
before(async () => { server = createServer(); await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); }); base = `http://127.0.0.1:${server.address().port}`; });
after(async () => { if (server?.listening) await new Promise(resolve => server.close(resolve)); });
test('every clean route returns complete server-rendered HTML and working local resources', async () => {
  const resources = new Set();
  for (const route of paths) {
    const res = await fetch(base + route);
    assert.equal(res.status, 200, route);
    const html = await res.text();
    assert.ok(html.includes(`<html lang="${route.startsWith('/en') ? 'en' : 'id'}">`));
    assert.match(html, /<h1[ >]/);
    assert.doesNotMatch(html, /\{\{[A-Z]+\}\}/);
    for (const match of html.matchAll(/(?:src|href)="(\/(?:assets|styles|downloads)\/[^"#]+)"/g)) resources.add(match[1]);
  }
  for (const resource of resources) {
    const res = await fetch(base + resource, { method: 'HEAD' });
    assert.equal(res.status, 200, resource);
    assert.ok(Number(res.headers.get('content-length')) > 0, resource);
  }
});
test('unknown pages have an actual 404 status and helpful navigation', async () => {
  const res = await fetch(base + '/hilang');
  assert.equal(res.status, 404);
  assert.match(await res.text(), /Balik ke beranda/);
});
test('private source paths and path traversal are never served', async () => {
  for (const path of ['/backend/server.js', '/data/catalog.js', '/.git/config', '/output/ndobol-marketing-kit/copy/marketing-copy.md', '/assets/%2e%2e%2f%2e%2e%2fpackage.json', '/assets/%00.png']) {
    const status = await new Promise((resolve, reject) => { http.get(base + path, res => { res.resume(); resolve(res.statusCode); }).on('error', reject); });
    assert.ok(status === 400 || status === 404, `${path}: ${status}`);
  }
});
test('downloads are attachments; caching and HEAD work', async () => {
  const res = await fetch(base + '/downloads/ndobol-press-kit.zip', { method: 'HEAD' });
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-disposition'), /^attachment/);
  assert.equal(await res.text(), '');
  const image = await fetch(base + '/assets/images/logo.webp', { method: 'HEAD' });
  assert.equal(image.headers.get('content-type'), 'image/webp');
  const cached = await fetch(base + '/assets/images/logo.webp', { headers: { 'If-None-Match': image.headers.get('etag') } });
  assert.equal(cached.status, 304);
});
test('canonical routes preserve query strings and reject writes', async () => {
  const res = await fetch(base + '/karakter/?asal=beranda', { redirect: 'manual' });
  assert.equal(res.status, 308);
  assert.equal(res.headers.get('location'), '/karakter?asal=beranda');
  assert.equal((await fetch(base + '/api/health', { method: 'POST' })).status, 405);
  assert.deepEqual(await (await fetch(base + '/api/health')).json(), { status: 'ok', service: 'ndobol-sesarengan' });
});

test('prototype CTA reaches the self-host guide; the browser calculator module is served', async () => {
  const home = await (await fetch(base + '/')).text();
  assert.match(home, /href="\/self-host">Jalankan prototipe/);
  assert.equal((await fetch(base + '/shared/game/rewards.js')).status, 200);
  for (const resource of ['/apps/web/index.html', '/shared/game/rafts.js', '/services/api/server.js', '/.env']) {
    assert.equal((await fetch(base + resource)).status, 404, resource);
  }
});
test('self-host guide links the published repository and does not promise enabled mint', async () => {
  const html = await (await fetch(base + '/self-host')).text();
  assert.match(html, /npm run game/);
  assert.match(html, /https:\/\/github.com\/Ndobol-Sakpole\/ndobol-game/);
  assert.doesNotMatch(html, /menunggu publikasi/);
  const home = await (await fetch(base + '/')).text();
  assert.match(home, /Koleksi, reward, dan pencatatan on-chain masih dalam pengembangan/);
  assert.doesNotMatch(home, /id="reward-simulator"/);
  const economy = await (await fetch(base + '/ekonomi')).text();
  assert.match(economy, /id="reward-simulator"/);
  assert.match(economy, /Pembelian, mint, dan klaim MON belum dibuka/);
  assert.match(home, /Monad Blitz Hackathon team DeEs/);
});

test('public impact endpoint exposes aggregates only and has no cache', async () => {
  const response = await fetch(base + '/api/impact.json');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /application\/json/);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const result = await response.json();
  assert.deepEqual(Object.keys(result).sort(), ['status','environment','gameItems','rounds','physicalKg','carbonKgCO2e','updatedAt'].sort());
  assert.ok(['available','unavailable'].includes(result.status));
  assert.equal(result.physicalKg, null);
  assert.equal(result.carbonKgCO2e, null);
  const head = await fetch(base + '/api/impact.json', { method: 'HEAD' });
  assert.equal(await head.text(), '');
});
