import { t } from '../lib/i18n.js';
import { installDialog } from '../lib/dialog.js';
export function installGallery() {
  const dataElement = document.querySelector('#scenes-data');
  if (!dataElement) return;
  const scenes = JSON.parse(dataElement.textContent);
  const dialog = document.querySelector('#gallery-dialog');
  const modal = installDialog(dialog);
  let current = 0;
  const show = index => {
    current = (index + scenes.length) % scenes.length;
    const scene = scenes[current];
    dialog.querySelector('#gallery-dialog-image').src = `/assets/images/scenes/${scene.file}.webp`;
    dialog.querySelector('#gallery-dialog-image').alt = scene.description;
    dialog.querySelector('#gallery-dialog-title').textContent = scene.name;
    dialog.querySelector('#gallery-dialog-description').textContent = scene.description;
    dialog.querySelector('#gallery-count').textContent = `${current + 1} / ${scenes.length} · ${t('Visual konsep')}`;
  };
  document.querySelectorAll('[data-scene]').forEach(button => button.addEventListener('click', () => { show(Number(button.dataset.scene)); modal.open(button); }));
  dialog.querySelector('[data-gallery-prev]').addEventListener('click', () => show(current - 1));
  dialog.querySelector('[data-gallery-next]').addEventListener('click', () => show(current + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); show(current + (event.key === 'ArrowRight' ? 1 : -1)); }
  });
}
