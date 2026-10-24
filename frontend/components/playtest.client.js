import { t } from '../lib/i18n.js';
async function postForm(path, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: controller.signal });
    const json = response.headers.get('content-type')?.includes('application/json') ? await response.json() : null;
    if (!response.ok || json?.ok !== true) throw new Error(json?.message || 'Layanan pendaftaran belum tersedia di alamat ini. Coba lagi nanti; isianmu tetap ada.');
    return json;
  } catch (error) {
    if (error.name === 'AbortError' || error instanceof TypeError) throw new Error('Koneksi terputus atau terlalu lama. Coba lagi; isianmu tetap ada.');
    throw error;
  } finally { clearTimeout(timer); }
}

export function installPlaytest() {
  const form = document.querySelector('#playtest-form');
  form?.addEventListener('submit', async event => {
    event.preventDefault();
    const button = form.querySelector('button[type=submit]');
    if (button.disabled || !form.reportValidity()) return;
    const message = form.querySelector('.form-message');
    const label = button.innerHTML;
    button.disabled = true; button.textContent = t('Menyimpan…'); form.setAttribute('aria-busy', 'true');
    message.textContent = ''; delete message.dataset.error;
    const data = new FormData(form);
    try {
      const result = await postForm('/api/playtest', { name: data.get('name'), email: data.get('email'), device: data.get('device'), consent: data.get('consent') === 'on', company: data.get('company') });
      if (result.token) {
        document.querySelector('#playtest-code').value = result.token;
        document.querySelector('#playtest-receipt').hidden = false;
      }
      form.reset(); form.hidden = true;
      const success = document.querySelector('#playtest-success');
      success.hidden = false; success.focus();
    } catch (error) { message.textContent = t(error.message); message.dataset.error = 'true'; }
    finally { button.disabled = false; button.innerHTML = label; form.removeAttribute('aria-busy'); }
  });
  const cancelForm = document.querySelector('#cancel-playtest-form');
  cancelForm?.addEventListener('submit', async event => {
    event.preventDefault();
    const button = cancelForm.querySelector('button');
    if (button.disabled || !cancelForm.reportValidity()) return;
    const message = cancelForm.querySelector('.form-message');
    button.disabled = true; message.textContent = t('Menghapus…'); delete message.dataset.error;
    try {
      const result = await postForm('/api/playtest/cancel', { token: new FormData(cancelForm).get('token').trim() });
      message.textContent = t(result.message); cancelForm.reset();
    } catch (error) { message.textContent = t(error.message); message.dataset.error = 'true'; }
    finally { button.disabled = false; }
  });
  if (location.hash === '#batalkan') document.querySelector('#batalkan details')?.setAttribute('open', '');
}
