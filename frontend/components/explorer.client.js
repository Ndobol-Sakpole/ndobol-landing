import { installDialog } from '../lib/dialog.js';
export function installExplorer() {
  const dataElement = document.querySelector('#catalog-data');
  if (!dataElement) return;
  const data = JSON.parse(dataElement.textContent);
  const dialog = document.querySelector('#detail-dialog');
  const modal = installDialog(dialog);
  document.querySelectorAll('[data-item]').forEach(button => {
    button.addEventListener('click', () => {
      const kind = button.dataset.kind;
      const item = data[kind]?.find(entry => entry.id === button.dataset.item);
      if (!item) return;
      const source = `/assets/images/${kind === 'characters' ? 'characters' : 'rafts'}/${item.file}.webp`;
      dialog.querySelector('#detail-image').src = source;
      dialog.querySelector('#detail-image').alt = item.name;
      dialog.querySelector('#detail-name').textContent = item.name;
      dialog.querySelector('#detail-line').textContent = item.line;
      dialog.querySelector('#detail-description').textContent = item.description;
      dialog.querySelector('#detail-download').href = source;
      dialog.querySelector('#detail-download').download = `ndobol-${item.id}.webp`;
      dialog.style.setProperty('--detail-bg', item.color);
      modal.open(button);
    });
  });
  const tabs = [...document.querySelectorAll('[data-tab]')];
  const select = tab => {
    for (const item of tabs) {
      const selected = item === tab;
      item.setAttribute('aria-selected', String(selected));
      item.tabIndex = selected ? 0 : -1;
      document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
    }
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(tab));
    tab.addEventListener('keydown', event => {
      let target;
      if (event.key === 'ArrowRight') target = tabs[(i + 1) % tabs.length];
      if (event.key === 'ArrowLeft') target = tabs[(i - 1 + tabs.length) % tabs.length];
      if (event.key === 'Home') target = tabs[0];
      if (event.key === 'End') target = tabs.at(-1);
      if (target) { event.preventDefault(); select(target); target.focus(); }
    });
  });
}
