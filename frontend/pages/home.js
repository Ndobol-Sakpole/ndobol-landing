import { gameplayPreview, faqSection } from '../components/promotion.js';
import { playtestSection } from '../components/playtest.js';
import { riverScene } from '../components/river-scene.js';
import { web3Section } from '../components/web3.js';
import { featuredCharacterIds } from '../../data/site.js';
import { buttonLink, asset } from '../lib/html.js';
import { catalogItem, catalogData, detailDialog } from '../components/catalog.js';
export function home({ characters, rafts, scenes, mechanics }) {
  const featured = featuredCharacterIds.map(id => characters.find(item => item.id === id));
  return `<section class="hero" aria-labelledby="hero-title">
    <div class="hero-copy container"><h1 id="hero-title">Satu getek.<br><span>Banyak tingkah.</span></h1><p>Ajak geng paling susah kompak. Jaga keseimbangan, hindari rintangan,<br class="desktop-break"> dan melaju dengan tenaga yang… agak beda.</p><div class="hero-actions">${buttonLink('#playtest', 'Ikut playtest')}${buttonLink('#gameplay', 'Kenali permainannya', 'outline')}</div></div>
    ${riverScene()}
  </section>
  ${gameplayPreview()}<section class="mechanics section container" id="tentang" aria-labelledby="mechanics-title"><div class="mechanics-copy"><h2 id="mechanics-title">Satu tujuan.<br>Tiga bekal berangkat.</h2><p class="section-intro">Satu getek, satu tujuan. Tapi semua punya arah sendiri.</p><div class="mechanic-steps" aria-label="Jelajahi cara bermain">${mechanics.map((step, i) => `<button class="mechanic-step" data-step="${i}" aria-pressed="${i === 0}" aria-controls="mechanic-preview"><span class="step-number">0${i + 1}</span><span><strong>${step.title}</strong><span>${step.text}</span></span></button>`).join('')}</div></div><figure class="mechanics-media" id="mechanic-preview"><img id="mechanic-image" src="${asset('scenes', scenes[mechanics[0].scene].file)}" alt="${scenes[mechanics[0].scene].description}" width="1672" height="941" loading="lazy"><figcaption>Ilustrasi konsep, bukan rekaman gameplay.</figcaption></figure></section>
  <section class="explorer section container" id="jelajahi" aria-labelledby="explorer-title"><div class="section-heading"><h2 id="explorer-title">Pilih teman<br>satu getekmu.</h2><div><p class="section-intro">Empat kawan. Enam getek.<br>Satu rombongan yang susah diatur.</p><div class="tabs" role="tablist" aria-label="Jelajahi dunia Ndobol"><button role="tab" id="tab-characters" aria-selected="true" aria-controls="panel-characters" data-tab="characters">Karakter</button><button role="tab" id="tab-rafts" aria-selected="false" aria-controls="panel-rafts" data-tab="rafts" tabindex="-1">Getek</button></div></div></div>
    <div role="tabpanel" id="panel-characters" aria-labelledby="tab-characters"><div class="catalog-grid">${featured.map(item => catalogItem(item, 'characters')).join('')}</div><div class="explore-more">${buttonLink('/karakter', 'Lihat semua karakter', 'outline')}</div></div>
    <div role="tabpanel" id="panel-rafts" aria-labelledby="tab-rafts" hidden><div class="catalog-grid">${rafts.slice(0, 4).map(item => catalogItem(item, 'rafts')).join('')}</div><div class="explore-more">${buttonLink('/getek', 'Lihat semua getek', 'outline')}</div></div>
  </section>${web3Section()}${playtestSection()}${faqSection()}${detailDialog()}${catalogData(characters, rafts)}<script type="application/json" id="mechanics-data">${JSON.stringify(mechanics.map(step => scenes[step.scene]))}</script>`;
}
