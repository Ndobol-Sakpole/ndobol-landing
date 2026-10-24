import { english } from '../locales/en.js';

// Source-language keys keep Indonesian copy as the default and avoid a second
// set of page templates. Only exact messages are translated, never substrings.
export function translate(source, language = 'id', values = {}) {
  const key = source.replace(/\s+/g, ' ').trim();
  const message = language === 'en' ? (english[key] ?? (/^\d+(?:,\d+)? MON$/.test(key) ? key.replace(',', '.') : key)) : key;
  return message.replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match);
}

export const currentLanguage = () => typeof document !== 'undefined' && document.documentElement.lang === 'en' ? 'en' : 'id';
export const t = (source, values) => translate(source, currentLanguage(), values);
export const numberLocale = () => currentLanguage() === 'en' ? 'en-US' : 'id-ID';

export function localizedPath(path, language) {
  const base = path === '/en' ? '/' : path.startsWith('/en/') ? path.slice(3) : path;
  return language === 'en' ? (base === '/' ? '/en' : `/en${base}`) : base;
}

export function routeLanguage(path) {
  return path === '/en' || path.startsWith('/en/') ? 'en' : 'id';
}
