import { escapeHtml } from '../lib/html.js';
import { site } from '../../data/site.js';

const icons = {
  github: '<path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.86c-2.78.6-3.37-1.18-3.37-1.18-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.03a9.6 9.6 0 0 1 5 0c1.91-1.3 2.75-1.03 2.75-1.03.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.75c0 .26.18.58.69.48A10 10 0 0 0 12 2Z"/>',
  x: '<path d="M18.9 2H22l-6.8 7.78L23.2 22h-6.3L12 14.58 5.5 22H2.4l7.2-8.25L1 2h6.5l4.44 6.71L18.9 2Zm-1.1 18h1.72L6.56 3.88H4.72L17.8 20Z"/>',
  linkedin: '<path d="M5.37 7.56H2V22h3.37V7.56ZM3.68 2a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92ZM22 13.07c0-4.34-2.32-5.76-4.45-5.76a4.15 4.15 0 0 0-3.73 2.05v-1.8H10.4V22h3.42v-7.46c0-1.97.37-3.87 2.82-3.87 2.42 0 2.45 2.24 2.45 4V22H22v-8.93Z"/>'
};

export function socialMenu() {
  return `<details class="social-menu" open><summary>Ikuti kami <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary>
    <nav class="social-links" aria-label="Media sosial">${site.socials.map(({ id, name, url }) => `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" aria-label="${name} · Tab baru"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${icons[id]}</svg><span>${name}</span></a>`).join('')}</nav>
  </details>`;
}
