// Native <dialog> handles focus trapping, Escape, and inert content behind the modal.
export function installDialog(dialog) {
  if (!dialog) return null;
  let opener;
  const close = () => dialog.close();
  dialog.querySelector('.dialog-close')?.addEventListener('click', close);
  dialog.addEventListener('click', event => {
    const rect = dialog.getBoundingClientRect();
    if (event.target === dialog && (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom)) close();
  });
  dialog.addEventListener('close', () => {
    document.documentElement.style.overflow = '';
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  });
  return {
    open(trigger) {
      opener = trigger ?? document.activeElement;
      dialog.showModal();
      document.documentElement.style.overflow = 'hidden';
      dialog.querySelector('.dialog-close')?.focus({ preventScroll: true });
    }, close
  };
}
