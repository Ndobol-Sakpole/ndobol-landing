import { mkdir, rm, cp, writeFile, readFile } from 'node:fs/promises';
import { unavailableImpact } from '../backend/impact.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { site } from '../data/site.js';
import { escapeHtml } from '../frontend/lib/html.js';
import { renderPage, paths } from '../backend/render.js';
const root = fileURLToPath(new URL('../', import.meta.url));
const out = path.join(root, 'dist');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const route of paths) {
  const dir = path.join(out, route.slice(1));
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, 'index.html'), renderPage(route).html);
}
await writeFile(path.join(out, '404.html'), renderPage('/404').html);
await writeFile(path.join(out, 'en/404.html'), renderPage('/en/404').html);
// Static deployments show unavailable data until connected to a live API.
// Never publish local development database totals in the static bundle.
await mkdir(path.join(out, 'api'), { recursive: true });
await writeFile(path.join(out, 'api/impact.json'), JSON.stringify(unavailableImpact()));
for (const entry of ['assets', 'styles', 'locales', 'app.js', 'lib/dialog.js', 'lib/economy.js', 'lib/i18n.js', 'components/language.client.js', 'components/navigation.client.js', 'components/explorer.client.js', 'components/mechanics.client.js', 'components/gallery.client.js', 'components/economy.client.js', 'components/playtest.client.js']) {
  await mkdir(path.dirname(path.join(out, entry)), { recursive: true });
  await cp(path.join(root, 'frontend', entry), path.join(out, entry), { recursive: true });
}
await cp(path.join(root, 'data/downloads'), path.join(out, 'downloads'), { recursive: true });
// The browser reward simulator needs only this arithmetic module, not the game.
await mkdir(path.join(out, 'shared/game'), { recursive: true });
await cp(path.join(root, 'shared/game/rewards.js'), path.join(out, 'shared/game/rewards.js'));
await cp(path.join(root, 'infra/static-headers.txt'), path.join(out, '_headers'));
console.log(`Built ${paths.length} pages, 404s, client modules, assets, and downloads into dist/.`);

await writeFile(path.join(out, 'robots.txt'), `User-agent: *\nAllow: /\n${site.origin ? `Sitemap: ${site.origin}/sitemap.xml\n` : ''}`);
if (site.origin) await writeFile(path.join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(route => `<url><loc>${escapeHtml(site.origin + route)}</loc></url>`).join('')}</urlset>`);
