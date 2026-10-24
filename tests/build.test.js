import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, stat, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

test('deployment output has both languages and required assets, without private source or signup data', async () => {
  const root = fileURLToPath(new URL('../', import.meta.url));
  await promisify(execFile)(process.execPath, ['infra/build.js'], {
    cwd: root, env: { ...process.env, SITE_URL: 'https://ndobol.example', GAME_URL: 'https://game.ndobol.example/' }
  });
  const dist = path.join(root, 'dist');
  const files = await readdir(dist, { recursive: true });
  assert.equal(files.filter(file => file.endsWith('.html')).length, 20);
  assert.ok(!files.some(file => /(?:^|\/)(?:backend|data|node_modules|\.git|\.env)(?:\/|$)|\.sqlite/.test(file)));
  for (const file of files.filter(file => file.endsWith('.html') || file.endsWith('.css'))) {
    const source = await readFile(path.join(dist, file), 'utf8');
    const resources = [...source.matchAll(/(?:src|href)="(\/(?:assets|styles|downloads)\/[^"?#]+)|url\(['"]?(\/assets\/[^)'"?#]+)/g)].map(match => match[1] || match[2]);
    for (const resource of resources) assert.ok((await stat(path.join(dist, resource))).isFile(), `${file}: ${resource}`);
  }
  const en = await readFile(path.join(dist, 'en/index.html'), 'utf8');
  assert.match(en, /href="https:\/\/game.ndobol.example\/"/);
  assert.match(en, /rel="canonical" href="https:\/\/ndobol.example\/en"/);
  assert.match(en, /property="og:image" content="https:\/\/ndobol.example\/assets\/images\/logo.webp"/);
  assert.match(await readFile(path.join(dist, 'sitemap.xml'), 'utf8'), /https:\/\/ndobol.example\/en\/playtest/);
  assert.equal(JSON.parse(await readFile(path.join(dist, 'api/impact.json'), 'utf8')).gameItems, null);
  assert.ok((await stat(path.join(dist, 'shared/game/rewards.js'))).isFile());
});
