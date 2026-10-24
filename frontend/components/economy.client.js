import { t, numberLocale, currentLanguage } from '../lib/i18n.js';
import { simulateReward, formatMonAmount } from '../lib/economy.js';

export function installEconomy() {
  const form = document.querySelector('#reward-simulator');
  if (!form) return;
  const rules = JSON.parse(form.dataset.rules);
  const number = new Intl.NumberFormat(numberLocale(), { maximumFractionDigits: 3 });
  const weight = document.querySelector('#sim-weight');
  const resultField = document.querySelector('#sim-result');
  const raft = document.querySelector('#sim-raft');
  const outputs = ['sim-reward', 'sim-price', 'sim-remaining'].map(id => document.getElementById(id));
  function update() {
    const weightGrams = Math.round(weight.valueAsNumber * 1000);
    const result = weight.validity.valid ? simulateReward({ weightGrams, finishReason: resultField.value, targetPriceWei: raft.value }, rules) : null;
    if (!result) {
      outputs.forEach(output => { output.textContent = '—'; });
      document.querySelector('#sim-message').textContent = t('Masukkan berat antara 0 dan 1.000.000 kg, dengan ketelitian 0,001 kg.');
      return;
    }
    outputs[0].textContent = formatMonAmount(result.rewardWei, currentLanguage());
    outputs[1].textContent = formatMonAmount(result.targetPriceWei, currentLanguage());
    outputs[2].textContent = `${number.format(result.remainingGrams / 1000)} kg`;
    document.querySelector('#sim-message').textContent = t(result.eligible
      ? 'Reward dihitung dari berat sampah game yang dibawa sampai finis. Biaya gas terpisah; klaim on-chain belum dibuka.'
      : 'Getek terbalik atau tenggelam: seluruh reward ronde hangus. Kumpulkan kembali sampah di ronde berikutnya.');
  }
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  form.addEventListener('submit', event => event.preventDefault());
  update();

  const button = document.querySelector('#refresh-impact');
  async function refresh() {
    button.disabled = true;
    const status = document.querySelector('#impact-status');
    status.textContent = t('Memperbarui hasil ronde tersimpan…');
    try {
      const response = await fetch('/api/impact.json', { cache: 'no-store', headers: { Accept: 'application/json' } });
      if (!response.ok) throw new Error('Unavailable');
      const data = await response.json();
      if (data.status !== 'available' || data.environment !== 'development' || ![data.gameItems, data.rounds].every(n => Number.isSafeInteger(n) && n >= 0)) throw new Error('Unavailable');
      document.querySelector('#impact-items').textContent = number.format(data.gameItems);
      document.querySelector('#impact-rounds').textContent = t('{count} ronde tersimpan · Pemain manusia, tanpa bot.', { count: number.format(data.rounds) });
      status.textContent = t('Database pengembangan lokal · Diperbarui {time} · Belum dicatat on-chain.', { time: new Date().toLocaleTimeString(numberLocale(), { hour: '2-digit', minute: '2-digit' }) });
    } catch {
      document.querySelector('#impact-items').textContent = '—';
      document.querySelector('#impact-rounds').textContent = t('Data ronde belum tersedia.');
      status.textContent = t('Sumber data belum terhubung. Angka kosong bukan berarti nol; data contoh tidak dimasukkan ke total.');
    } finally { button.disabled = false; }
  }
  button.addEventListener('click', refresh);
  refresh();
}
