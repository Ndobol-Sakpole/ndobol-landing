import { buttonLink } from '../lib/html.js';
import { riverScene } from './river-scene.js';
import { site } from '../../data/site.js';
import { socialMenu } from './social.js';
export function footer({ scenic = false } = {}) {
  return `<footer class="site-footer${scenic ? ' site-footer--scenic' : ''}">
  ${scenic ? `<section class="footer-visual" aria-labelledby="footer-title"><div class="footer-invitation"><h2 id="footer-title">Sampai finis.<br><span>Masih ketawa bareng.</span></h2><p>Satu perjalanan selesai. Siap bikin kekacauan lagi?</p>${buttonLink('/#playtest', 'Ikut playtest')}</div>${riverScene({ footer: true })}</section>` : ''}
  <div class="footer-panel"><div class="footer-directory container">
    <div class="footer-top"><a class="footer-wordmark" href="/">Ndobol Sesarengan<span aria-hidden="true">✳</span></a><nav aria-label="Navigasi footer"><a href="/karakter">Karakter</a><a href="/ekonomi">Ekonomi & dampak</a><a href="/self-host">Host sendiri</a><a href="/press-kit">Press kit</a><a href="/privasi">Privasi</a></nav></div>
    <div class="footer-community"><p>Tetap satu rombongan.</p>${socialMenu()}</div>
    <div class="footer-bottom"><span class="footer-copyright">© 2026 Ndobol Sesarengan.</span><p class="team-credit">${site.credit}</p></div>
  </div></div>
  </footer>`;
}
