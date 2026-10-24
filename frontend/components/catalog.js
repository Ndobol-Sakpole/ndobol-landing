import { arrow, asset, escapeHtml, closeIcon } from '../lib/html.js';
export function catalogItem(item, type, { detail = false } = {}) {
  const group = type === 'characters' ? 'characters' : 'rafts';
  return `<button class="catalog-item${group === 'rafts' ? ' catalog-item--raft' : ''}" data-item="${item.id}" data-kind="${type}" aria-haspopup="dialog" aria-label="Kenalan dengan ${escapeHtml(item.name)}"><span class="catalog-art"><span class="catalog-ground" style="--ground:${item.color}"></span><img src="${asset(group, item.file)}" alt="${escapeHtml(item.name)}" width="700" height="700" loading="lazy" decoding="async"></span><span class="catalog-name">${escapeHtml(item.name)} ${arrow}</span>${detail ? `<span class="catalog-line">${escapeHtml(item.line)}</span>` : ''}</button>`;
}
export function detailDialog() {
  return `<dialog id="detail-dialog" class="detail-dialog" aria-labelledby="detail-name"><button class="dialog-close" aria-label="Tutup detail">${closeIcon}</button><div class="detail-layout"><div class="detail-art"><img id="detail-image" alt="" width="700" height="700"></div><div class="detail-copy"><h2 id="detail-name"></h2><p class="detail-line" id="detail-line"></p><p id="detail-description"></p><p class="detail-note">Desain konsep · Dapat berkembang selama produksi.</p><a class="button button--outline" id="detail-download" download>Lihat aset ${arrow}</a></div></div></dialog>`;
}
export function catalogData(characters, rafts) {
  return `<script type="application/json" id="catalog-data">${JSON.stringify({ characters, rafts }).replace(/</g, '\\u003c')}</script>`;
}
