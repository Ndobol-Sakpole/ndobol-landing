import { RAFTS } from '../shared/game/rafts.js';
import { REWARDS } from '../shared/game/rewards.js';

// The game owns prices and reward rates. Marketing reads the same catalogue;
// displaying these development prices does not activate sales or claims.
export const raftEconomy = Object.entries(RAFTS).map(([id, raft]) => ({
  id, priceWei: raft.priceWei, utility: raft.description.id
}));
export const revenueAllocation = [
  { label: 'Pengembangan game', percent: 50, detail: 'Konten, pemeliharaan, dan tim pengembang.' },
  { label: 'Aksi bersih sungai', percent: 20, detail: 'Anggaran mitra lapangan dengan bukti penggunaan.' },
  { label: 'Dana reward MON', percent: 15, detail: 'Tambahan dana kontrak reward yang diisi pengelola.' },
  { label: 'Operasional & verifikasi', percent: 10, detail: 'Server, gas subsidi, dan pemeriksaan bukti.' },
  { label: 'Kreator & komunitas', percent: 5, detail: 'Kolaborasi desain dan kegiatan komunitas.' }
];
export const rewardProposal = Object.freeze({
  weiPerGram: String(REWARDS.weiPerGram),
  pointsPerKg: REWARDS.pointsPerKg
});
