import { playtestDevices } from '../../data/promotion.js';
import { site } from '../../data/site.js';
import { arrow, escapeHtml } from '../lib/html.js';

export function playtestSection() {
  return `<section class="playtest-section container" id="playtest" aria-labelledby="playtest-title">
    <div class="playtest-invitation"><h2 id="playtest-title">Satu kursi<br><span>buat kamu.</span></h2><p>Ikut jadi rombongan pertama yang mencoba, menemukan tingkah tak terduga, dan membantu Ndobol jadi makin seru.</p><ul><li>Coba versi yang sedang kami bangun</li><li>Bagikan cerita dan masukanmu</li><li>Bantu uji permainan di perangkatmu</li></ul><img src="/assets/images/characters/04-monyet.webp" alt="" width="200" height="200" loading="lazy"></div>
    <div class="playtest-form-panel"><form id="playtest-form" action="/api/playtest" method="post" aria-labelledby="signup-title"><h3 id="signup-title">Masuk rombongan.</h3><p class="form-intro">Tinggalkan email. Kami kabari saat sesi yang sesuai siap dibuka.</p>
      <label for="playtest-name">Nama panggilan <small>(opsional)</small></label><input id="playtest-name" name="name" autocomplete="nickname" maxlength="60" placeholder="Mau dipanggil siapa?">
      <label for="playtest-email">Email</label><input id="playtest-email" name="email" type="email" autocomplete="email" maxlength="254" placeholder="kamu@contoh.com" required>
      <label for="playtest-device">Perangkat untuk bermain</label><select id="playtest-device" name="device" required><option value="">Pilih perangkatmu</option>${playtestDevices.map(d => `<option value="${d.value}">${d.label}</option>`).join('')}</select>
      <div class="form-trap" aria-hidden="true"><label for="playtest-company">Kosongkan kolom ini</label><input id="playtest-company" name="company" tabindex="-1" autocomplete="off"></div>
      <label class="consent-label"><input name="consent" type="checkbox" required><span>Saya setuju dihubungi tim DeEs untuk playtest dan memahami <a href="/privasi" target="_blank" rel="noopener">kebijakan privasi</a>.</span></label>
      <button type="submit" class="button button--gold">Daftar playtest ${arrow}</button><p class="form-message" id="playtest-message" role="status" aria-live="polite"></p><p class="form-footnote">Jadwal menyusul. Pendaftaran ini adalah daftar minat, belum menjadi konfirmasi slot.</p><noscript><p>Aktifkan JavaScript untuk mengirim formulir ini dengan aman.</p></noscript>
    </form><div class="playtest-success" id="playtest-success" tabindex="-1" hidden><span class="success-mark" aria-hidden="true">✓</span><h3>Terima kasih,<br>calon kawan segetek!</h3><p>Permintaanmu diterima. Jika emailmu sudah terdaftar, data sebelumnya tetap digunakan. Tim DeEs dapat menghubungimu ketika sesi yang sesuai siap.</p><div id="playtest-receipt" hidden><label for="playtest-code">Simpan kode pembatalanmu</label><input id="playtest-code" readonly autocomplete="off"><p>Kode ini hanya ditampilkan di sini. Simpan untuk menghapus pendaftaran melalui <a href="/playtest#batalkan">halaman playtest</a>.</p></div><a class="text-link" href="${escapeHtml(site.playUrl)}">${site.playLabel} ${arrow}</a></div></div>
  </section>`;
}

export function cancellationForm() {
  return `<section class="cancel-playtest container" id="batalkan"><details><summary>Sudah daftar dan ingin membatalkan?</summary><p>Masukkan kode pembatalan yang kamu simpan saat mendaftar. Data pendaftaran yang cocok akan dihapus.</p><form id="cancel-playtest-form" action="/api/playtest/cancel" method="post"><label for="cancel-code">Kode pembatalan</label><input id="cancel-code" name="token" required minlength="64" maxlength="64" pattern="[a-f0-9]{64}" autocomplete="off" spellcheck="false"><button class="button button--outline" type="submit">Hapus pendaftaran saya</button><p class="form-message" role="status" aria-live="polite"></p></form><noscript>Aktifkan JavaScript untuk membatalkan pendaftaran.</noscript></details></section>`;
}
