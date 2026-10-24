import { economyDetails } from './pages/economy.js';
import { playtest } from './pages/playtest.js';
import { selfHost } from './pages/self-host.js';
import { featuredCharacterIds } from '../data/site.js';
import { home } from './pages/home.js';
import { collection } from './pages/collection.js';
import { gallery } from './pages/gallery.js';
import { press } from './pages/press.js';
import { privacy, notFound } from './pages/legal.js';
export const routes = {
  '/': { title: 'Ndobol Sesarengan — Satu getek. Banyak tingkah.', description: 'Arahkan kentut, hindari rintangan, dan kumpulkan sampah di sungai Indonesia. Kenali Ndobol Sesarengan dan daftar playtest gratis tanpa wallet.', render: home, scenic: true },
  '/ekonomi': { title: 'Ekonomi & Dampak — Ndobol Sesarengan', description: 'Harga getek dalam MON, reward berdasarkan berat sampah game, dan pencatatan kontribusi Ndobol di Monad.', render: economyDetails },
  '/playtest': { title: 'Daftar Playtest — Ndobol Sesarengan', description: 'Daftar minat playtest Ndobol Sesarengan. Gratis, tanpa wallet, dan ikut membantu mengembangkan game bersama tim DeEs.', render: playtest },
  '/karakter': { title: 'Karakter — Ndobol Sesarengan', description: 'Kenalan dengan anjing, monyet, tupai, dan babi dalam Ndobol Sesarengan.', render: data => collection({ ...data, characters: featuredCharacterIds.map(id => data.characters.find(item => item.id === id)) }, 'characters') },
  '/getek': { title: 'Getek — Ndobol Sesarengan', description: 'Jelajahi enam desain getek: bambu polos, botol, ban, drum biru, ranjang hanyut, dan sultan.', render: data => collection(data, 'rafts') },
  '/galeri': { title: 'Galeri konsep — Ndobol Sesarengan', description: 'Enam adegan konsep Ndobol Sesarengan di kanal yang terinspirasi Selokan Mataram.', render: gallery },
  '/press-kit': { title: 'Press kit — Ndobol Sesarengan', description: 'Unduh logo, aset visual konsep, dan fakta proyek Ndobol Sesarengan untuk media dan kreator.', render: press },
  '/self-host': { title: 'Host sendiri — Ndobol Sesarengan', description: 'Panduan menjalankan prototipe Ndobol, kontrol game, build statis, dan hosting sendiri.', render: selfHost },
  '/privasi': { title: 'Privasi — Ndobol Sesarengan', description: 'Informasi privasi website Ndobol Sesarengan.', render: privacy }
};
export const missingRoute = { title: 'Halaman tidak ditemukan — Ndobol Sesarengan', description: 'Halaman tidak ditemukan. Kembali ke dermaga Ndobol Sesarengan.', render: notFound };
