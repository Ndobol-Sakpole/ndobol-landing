import { buttonLink } from '../lib/html.js';
import { site } from '../../data/site.js';

export function web3Section() {
  return `<section class="blockchain-summary section container" id="web3" aria-labelledby="web3-title">
    <div class="summary-heading"><div><h2 id="web3-title">Geteknya unik.<br><span>Kontribusinya tercatat.</span></h2></div><p>Kami menyiapkan koleksi getek dan catatan kontribusi di Monad. Demo publik menggunakan wallet di Monad Testnet.</p></div>
    <ol class="contribution-flow"><li><span class="flow-number">01</span><h3>Main & kumpulkan</h3><p>Arahkan getek, ambil sampah di sungai, dan selesaikan perjalanan bersama.</p></li><li><span class="flow-number">02</span><h3>Periksa kontribusi</h3><p>Hasil permainan divalidasi sebelum masuk ke catatan kontribusi. Setiap item dihitung sekali.</p></li><li><span class="flow-number">03</span><h3>Simpan jejaknya</h3><p>Bukti berat sampah direncanakan tercatat di Monad. Reward MON berasal dari kontrak yang didanai pengelola.</p></li></ol>
    <div class="summary-bottom"><div><span class="summary-monad">M</span><p><strong>Menuju Monad</strong>Blockchain Layer 1 yang kompatibel dengan EVM.<br><a href="${site.monadDocsUrl}" target="_blank" rel="noopener noreferrer">Kenali teknologinya ↗</a></p></div>${buttonLink('/ekonomi', 'Lihat ekonomi & dampak', 'outline')}</div>
    <p class="summary-note">Koleksi, reward, dan pencatatan on-chain masih dalam pengembangan. Sampah dalam game dan sampah fisik terverifikasi memiliki catatan terpisah.</p>
  </section>`;
}
