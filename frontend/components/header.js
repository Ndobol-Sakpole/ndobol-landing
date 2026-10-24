import { arrow, escapeHtml } from '../lib/html.js';
import { site } from '../../data/site.js';
import { localizedPath } from '../lib/i18n.js';
export function header(path, language = 'id') {
  const links = [['/#tentang', 'Tentang game'], ['/karakter', 'Karakter'], ['/getek', 'Getek'], ['/ekonomi', 'Ekonomi & dampak']];
  return `<header class="site-header"><div class="header-inner container">
    <a class="brand" href="/" aria-label="Ndobol Sesarengan — Beranda"><img src="/assets/images/logo.webp" alt="Ndobol Sesarengan" width="480" height="268" fetchpriority="high"></a>
    <nav class="desktop-nav" aria-label="Navigasi utama">${links.map(([url, name]) => `<a href="${url}"${path === url ? ' aria-current="page"' : ''}>${name}</a>`).join('')}</nav>
    <div class="header-actions">
    <nav class="language-switch" aria-label="Bahasa website">${[['id', 'ID', 'Bahasa Indonesia'], ['en', 'EN', 'English']].map(([locale, label, name]) => `<a data-language="${locale}" href="${escapeHtml(localizedPath(path, locale))}" lang="${locale}" hreflang="${locale}" aria-label="${name}"${language === locale ? ' aria-current="true"' : ''}>${label}</a>`).join('')}</nav>
    <a class="button button--dark header-cta" href="${escapeHtml(site.playUrl)}">${site.playLabel} ${arrow}</a>
    <button class="menu-toggle" aria-expanded="false" aria-controls="mobile-nav" aria-label="Buka menu"><span></span><span></span></button>
    </div>
  </div><nav class="mobile-nav" id="mobile-nav" aria-label="Navigasi seluler" hidden>${links.map(([url, name]) => `<a href="${url}"${path === url ? ' aria-current="page"' : ''}>${name}${arrow}</a>`).join('')}<a href="${escapeHtml(site.playUrl)}">${site.playLabel} ${arrow}</a><a href="/press-kit">Press kit ${arrow}</a></nav></header>`;
}
