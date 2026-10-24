import { t } from '../lib/i18n.js';
export function installNavigation() {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('#mobile-nav');
  if (!toggle || !menu) return;
  const close = () => { toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', t('Buka menu')); menu.hidden = true; };
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', t(open ? 'Tutup menu' : 'Buka menu'));
    menu.hidden = !open;
  });
  menu.addEventListener('click', event => { if (event.target.closest('a')) close(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !menu.hidden) { close(); toggle.focus(); } });
  document.addEventListener('click', event => { if (!menu.hidden && !menu.contains(event.target) && !toggle.contains(event.target)) close(); });
  matchMedia('(min-width: 1001px)').addEventListener('change', close);
}
