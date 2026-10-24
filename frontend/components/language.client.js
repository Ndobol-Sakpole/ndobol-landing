export function installLanguageSwitch() {
  // Keep the current section and campaign query when switching languages.
  // No browser-language detection: unprefixed pages always default to Indonesian.
  const update = () => document.querySelectorAll('[data-language]').forEach(link => {
    const url = new URL(link.href);
    url.hash = location.hash;
    url.search = location.search;
    link.href = url.pathname + url.search + url.hash;
  });
  update();
  window.addEventListener('hashchange', update);
}
