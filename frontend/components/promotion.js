import { promotionFaq } from '../../data/promotion.js';
import { escapeHtml, buttonLink } from '../lib/html.js';
import { site } from '../../data/site.js';

export function gameplayPreview() {
  return `<section class="gameplay-preview section container" id="gameplay" aria-labelledby="gameplay-title">
    <div class="gameplay-heading"><div><h2 id="gameplay-title">Sungainya tenang.<br><span>Rombongannya? Belum tentu.</span></h2></div><div><p>Atur posisi, arahkan kentut, dan raih sampah di sepanjang sungai. Satu perjalanan kecil yang butuh kerja sama besar.</p>${buttonLink(site.playUrl, site.playLabel, 'outline')}</div></div>
    <figure class="gameplay-capture"><a href="${escapeHtml(site.playUrl)}" aria-label="Coba prototipe Ndobol Sesarengan"><img src="/assets/images/gameplay-prototype.jpg" alt="Tampilan prototipe: getek bambu di sungai Bengawan dengan indikator ritme dayungan, sampah, dan kekompakan tim" width="1280" height="720" loading="lazy"></a><figcaption>Diambil langsung dari prototipe. Tampilan game masih berkembang.</figcaption></figure>
    <div class="gameplay-facts"><span><strong>Co-op di browser</strong>Solo, bot opsional, atau ruang online</span><span><strong>2 sungai untuk dijelajahi</strong>Selokan Mataram & Kali Progo</span><span><strong>Demo di Monad Testnet</strong>Hubungkan wallet untuk mulai</span></div>
    <p class="gameplay-caption">Prototipe sedang dikembangkan. Mode online membutuhkan server game aktif; visual karakter dan adegan promosi merupakan konsep.</p>
  </section>`;
}

export function faqSection() {
  return `<section class="faq-section section container" id="faq" aria-labelledby="faq-title"><div><h2 id="faq-title">Masih<br> <span>penasaran?</span></h2><p>Beberapa bekal sebelum kita berangkat sesarengan.</p></div><div class="faq-list">${promotionFaq.map(([question, answer]) => `<details><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details>`).join('')}</div></section>`;
}
