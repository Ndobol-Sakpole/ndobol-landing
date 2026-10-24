import test from 'node:test';
import assert from 'node:assert/strict';
import { renderPage, paths } from '../backend/render.js';
import { localizeHtml } from '../backend/localize.js';
import { translate, localizedPath, routeLanguage } from '../frontend/lib/i18n.js';

const jsonData = (html, id) => JSON.parse(html.match(new RegExp(`<script[^>]+id="${id}"[^>]*>([\\s\\S]*?)</script>`))[1]);

test('Indonesian is the default and English has equivalent routes and language metadata', () => {
  assert.equal(paths.length, 18);
  for (const path of paths.filter(path => !path.startsWith('/en'))) {
    const id = renderPage(path);
    const en = renderPage(localizedPath(path, 'en'));
    assert.equal(id.status, 200);
    assert.equal(en.status, 200);
    assert.match(id.html, /<html lang="id">/);
    assert.match(en.html, /<html lang="en">/);
    assert.match(en.html, /property="og:locale" content="en_US"/);
    assert.ok(en.html.includes(`hreflang="id" href="${path}"`));
    assert.ok(en.html.includes(`hreflang="en" href="${localizedPath(path, 'en')}"`));
    assert.match(id.html, /data-language="id"[^>]*aria-current="true"/);
    assert.match(en.html, /data-language="en"[^>]*aria-current="true"/);
  }
  assert.match(renderPage('/').html, /Satu getek\./);
  assert.match(renderPage('/en').html, /One raft\./);
  assert.equal(renderPage('/en/missing').status, 404);
  assert.match(renderPage('/en/missing').html, /Back to home/);
  assert.equal(routeLanguage('/energy'), 'id');
  assert.equal(localizedPath('/en/ekonomi', 'id'), '/ekonomi');
});

test('English links stay in English while assets, downloads, game and Indonesian switch remain intact', () => {
  const { html } = renderPage('/en');
  assert.match(html, /href="\/en\/ekonomi"/);
  assert.match(html, /href="https:\/\/ndobol-game-teal\.vercel\.app\/apps\/web\/index\.html">Play the demo/);
  assert.match(html, /data-language="id" href="\/"/);
  assert.match(html, /href="\/en\/self-host"/);
  assert.match(html, /src="\/assets\/images\/logo.webp"/);
  assert.doesNotMatch(html, /(?:href|src)="\/en\/(?:assets|styles|app|downloads|api)\//);
  assert.match(renderPage('/en/press-kit').html, /href="\/downloads\/ndobol-press-kit.zip"/);
});

test('English interactive catalog data is translated without changing lookup IDs or files', () => {
  const id = jsonData(renderPage('/').html, 'catalog-data');
  const en = jsonData(renderPage('/en').html, 'catalog-data');
  assert.equal(en.characters[0].name, 'Dog');
  assert.equal(en.characters[0].id, id.characters[0].id);
  assert.equal(en.characters[0].file, id.characters[0].file);
  assert.equal(en.characters[0].color, id.characters[0].color);
  assert.notEqual(en.characters[0].description, id.characters[0].description);
  const scenes = jsonData(renderPage('/en/galeri').html, 'scenes-data');
  assert.equal(scenes[0].name, 'Everyone can move freely');
});

test('translation preserves executable content, code samples and submitted form values', () => {
  const source = '<p>  Karakter  </p><button aria-label="Buka menu">Getek</button><input name="device" value="Karakter"><pre><code>Getek &amp; Karakter</code></pre><script>const title = "Karakter";</script><style>.Karakter { color: red; }</style><a href="/karakter?x=1&amp;y=2#detail">Karakter</a>';
  const html = localizeHtml(source, 'en', ['/karakter']);
  assert.match(html, /<p>  Characters  <\/p>/);
  assert.match(html, /aria-label="Open menu"/);
  assert.match(html, /value="Karakter"/);
  assert.match(html, /<code>Getek &amp; Karakter<\/code>/);
  assert.match(html, /const title = "Karakter"/);
  assert.match(html, /\.Karakter \{ color: red; \}/);
  assert.match(html, /href="\/en\/karakter\?x=1&amp;y=2#detail"/);
  const id = renderPage('/playtest').html;
  const en = renderPage('/en/playtest').html;
  const fields = html => [...html.matchAll(/<(?:input|option)[^>]*\bvalue="[^"]*"[^>]*>/g)].map(([tag]) => tag.match(/value="([^"]*)"/)[1]);
  assert.deepEqual(fields(en), fields(id));
  assert.match(en, /Your gaming device/);
  assert.match(en, /privacy policy/);
  assert.equal(translate('{count} ronde tersimpan · Pemain manusia, tanpa bot.', 'en', { count: 7 }), '7 saved rounds · Human players, excluding bots.');
  assert.equal(translate('Periksa alamat emailmu, misalnya kamu@contoh.com.', 'en'), 'Check your email address, for example you@example.com.');
});
