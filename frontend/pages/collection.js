import { catalogItem, detailDialog, catalogData } from '../components/catalog.js';
export function collection({ characters, rafts }, type) {
  const isCharacter = type === 'characters';
  const items = isCharacter ? characters : rafts;
  return `<section class="collection-page container"><div class="page-heading"><a class="back-link" href="/">← Kembali ke beranda</a><h1>${isCharacter ? 'Tampang absurd.<br><span>Tingkah tak terbendung.</span>' : 'Getek boleh beda.<br><span>Rusuhnya tetap sama.</span>'}</h1><p>${isCharacter ? 'Empat hewan, masing-masing dengan gayanya sendiri.<br>Klik karakternya dan kenalan dengan calon teman satu getekmu.' : 'Dari bambu polos sampai getek sultan. Enam desain, banyak cerita.<br>Pilih getek untuk melihat lebih dekat.'}</p></div><div class="catalog-grid catalog-grid--full">${items.map(item => catalogItem(item, type, { detail: true })).join('')}</div><p class="collection-note">${isCharacter ? 'Seluruh karakter merupakan desain konsep. Penampilan dapat berkembang selama produksi.' : 'Seluruh getek merupakan desain konsep. Sistem perolehan, harga, dan atribut belum ditetapkan.'}</p></section>${detailDialog()}${catalogData(characters, rafts)}`;
}
