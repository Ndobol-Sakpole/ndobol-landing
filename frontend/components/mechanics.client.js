export function installMechanics() {
  const dataElement = document.querySelector('#mechanics-data');
  if (!dataElement) return;
  const scenes = JSON.parse(dataElement.textContent);
  const image = document.querySelector('#mechanic-image');
  const buttons = [...document.querySelectorAll('[data-step]')];
  buttons.forEach(button => button.addEventListener('click', () => {
    const scene = scenes[Number(button.dataset.step)];
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    image.src = `/assets/images/scenes/${scene.file}.webp`;
    image.alt = scene.description;
  }));
}
