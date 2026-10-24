import { translate, localizedPath } from '../frontend/lib/i18n.js';
import { escapeHtml } from '../frontend/lib/html.js';

const decode = text => text.replace(/&(amp|lt|gt|quot|apos|#39);/g, (_, name) => ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" }[name]));
const translateText = (text, language) => {
  if (!text.trim()) return text;
  return text.match(/^\s*/)[0] + escapeHtml(translate(decode(text), language)) + text.match(/\s*$/)[0];
};
function translateData(value, language) {
  if (typeof value === 'string') return translate(value, language);
  if (Array.isArray(value)) return value.map(item => translateData(item, language));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, translateData(item, language)]));
  return value;
}

// Operates only on our server-rendered templates. Skip executable/code blocks;
// translate text and accessible labels, preserving IDs, input values and assets.
export function localizeHtml(html, language, routePaths) {
  if (language !== 'en') return html;
  return html.replace(/<(script|style|pre|code)\b[^>]*>[\s\S]*?<\/\1>|<!--[\s\S]*?-->|<(?:[^>"']|"[^"]*"|'[^']*')*>|[^<]+/gi, token => {
    if (/^<script\b/i.test(token)) {
      if (!/id="(?:catalog|scenes|mechanics)-data"/.test(token)) return token;
      return token.replace(/(>)([\s\S]*)(<\/script>)/i, (_, start, json, end) => start + JSON.stringify(translateData(JSON.parse(json), language)).replace(/</g, '\\u003c') + end);
    }
    if (/^<(?:style|pre|code)\b|^<!--/i.test(token)) return token;
    if (!token.startsWith('<')) return translateText(token, language);
    let tag = token.replace(/\b(aria-label|alt|placeholder|title|content)=("|')([\s\S]*?)\2/g, (_, name, quote, value) => `${name}=${quote}${translateText(value, language)}${quote}`);
    if (/\bdata-language=|\bhreflang=/.test(tag)) return tag;
    return tag.replace(/\bhref="(\/[^"\s]*)"/g, (attribute, href) => {
      const [pathname] = href.split(/[?#]/);
      if (!routePaths.includes(pathname)) return attribute;
      return `href="${localizedPath(pathname, language)}${href.slice(pathname.length)}"`;
    });
  });
}
