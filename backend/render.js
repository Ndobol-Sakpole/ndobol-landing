import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { site } from '../data/site.js';
import { routes, missingRoute } from '../frontend/routes.js';
import { header } from '../frontend/components/header.js';
import { footer } from '../frontend/components/footer.js';
import { escapeHtml } from '../frontend/lib/html.js';
import { localizedPath, routeLanguage } from '../frontend/lib/i18n.js';
import { localizeHtml } from './localize.js';
import * as catalog from '../data/catalog.js';
const template = await readFile(new URL('../frontend/index.html', import.meta.url), 'utf8');
const styles = await Promise.all(['tokens', 'base', 'layout', 'home', 'pages', 'hero', 'web3', 'economy', 'promotion', 'language', 'footer'].map(async name => {
  const source = await readFile(new URL(`../frontend/styles/${name}.css`, import.meta.url));
  const version = createHash('sha256').update(source).digest('hex').slice(0, 10);
  return `<link rel="stylesheet" href="/styles/${name}.css?v=${version}">`;
}));
export function renderPage(path) {
  const language = routeLanguage(path);
  const base = localizedPath(path, 'id');
  const route = routes[base] ?? missingRoute;
  const values = {
    LANG: language, OGLOCALE: language === 'en' ? 'en_US' : 'id_ID',
    ALTERNATES: routes[base] ? `<link rel="alternate" hreflang="id" href="${base}"><link rel="alternate" hreflang="en" href="${localizedPath(base, 'en')}"><link rel="alternate" hreflang="x-default" href="${base}">` : '',
    TITLE: escapeHtml(route.title), DESCRIPTION: escapeHtml(route.description), STYLES: styles.join('\n  '),
    PRELOAD: base === '/' ? '<link rel="preload" as="image" media="(min-width: 761px)" href="/assets/images/scenes-v4/hero-desktop-v4.webp"><link rel="preload" as="image" media="(max-width: 760px)" href="/assets/images/scenes-v4/hero-mobile-v4.webp">' : '',
    HEADER: header(base, language), CONTENT: route.render(catalog), FOOTER: footer({ scenic: route.scenic })
  };
  let html = template.replace(/\{\{([A-Z]+)\}\}/g, (_, name) => values[name] ?? '');
  if (site.origin) {
    html = html.replace('content="/assets/images/logo.webp"', `content="${escapeHtml(site.origin)}/assets/images/logo.webp"`);
    html = html.replace(/(<link rel="alternate"[^>]*href=")([^"]+)(")/g, (_, before, href, after) => before + escapeHtml(site.origin) + href + after);
    if (routes[base]) html = html.replace('</head>', `<link rel="canonical" href="${escapeHtml(site.origin + path)}"><meta property="og:url" content="${escapeHtml(site.origin + path)}"></head>`);
  }
  return { html: localizeHtml(html, language, Object.keys(routes)), status: routes[base] ? 200 : 404 };
}
export const paths = [...Object.keys(routes), ...Object.keys(routes).map(path => localizedPath(path, 'en'))];
