# Ndobol Sesarengan — landing page

[English](README.md) · Bahasa Indonesia

Website promosi Ndobol Sesarengan, game kerja sama di atas getek buatan tim DeEs. Isinya katalog karakter dan getek, penjelasan ekonomi MON, press kit, dan formulir daftar playtest.

Frontend memakai HTML, CSS, dan JavaScript biasa. Node merender halaman saat build. Vercel menyajikan file hasil build dan menjalankan API pendaftaran secara terpisah. Bahasa bawaan adalah Indonesia; versi English ada di `/en`.

Kode game ada di repository [ndobol-game](https://github.com/Ndobol-Sakpole/ndobol-game). Repository ini tidak menjalankan ruang multiplayer atau deploy smart contract.

## Jalankan di komputer sendiri

Pasang Node.js 24 LTS, lalu:

```sh
git clone https://github.com/Ndobol-Sakpole/ndobol-landing.git
cd ndobol-landing
npm ci
cp .env.example .env
npm run dev
```

Buka [localhost:4173](http://localhost:4173). Di Windows, salin `.env.example` menjadi `.env` lewat editor atau `Copy-Item .env.example .env`.

Tanpa URL database, pendaftaran lokal disimpan di `storage/playtest.sqlite`. File ini tidak ikut Git. Formulir tidak mengirim email otomatis.

## Deploy ke Vercel

1. Import repository ini ke Vercel. Pilih root repository dan framework **Other**. File `vercel.json` sudah mengatur `npm ci`, `npm run build`, dan output `dist`. Gunakan Node.js **24.x**.
2. Buat database Neon Postgres melalui Vercel Marketplace atau Neon. Gunakan database atau branch terpisah untuk preview.
3. Masukkan connection string Neon ke `DATABASE_URL` di `.env` lokal, lalu jalankan `npm run db:migrate`. Perintah ini membuat tabel pendaftaran tanpa menghapus data lama. Jalankan untuk setiap database yang dipakai.
4. Isi `DATABASE_URL` di environment variables Vercel. Jika sudah tersedia, isi `GAME_URL` dengan alamat game dan `SITE_URL` dengan alamat website, misalnya `https://domain-kamu.example`.
5. Deploy. Buka beranda, ganti ke English, coba daftar, lalu batalkan dengan kode yang muncul setelah pendaftaran.

Kalau `DATABASE_URL` belum diisi atau migrasi belum dijalankan, website tetap terbuka tetapi form menampilkan pesan gagal. Form tidak akan mengaku berhasil menyimpan data. SQLite hanya dipakai saat pengembangan lokal; function Vercel tidak memakainya.

Biarkan `GAME_URL` kosong selama game belum dideploy. Tombol prototipe akan menuju panduan menjalankan game. Konfigurasi publik dibaca saat build, jadi lakukan deploy ulang setelah mengubahnya.

Catatan operasional lengkap ada di [panduan deployment](docs/deployment.md), dalam bahasa English. Konfigurasi mengacu pada dokumentasi [Node runtime Vercel](https://vercel.com/docs/functions/runtimes/node-js) dan [konfigurasi proyek](https://vercel.com/docs/project-configuration/vercel-json).

## Konfigurasi

| Variabel | Kegunaan |
| --- | --- |
| `DATABASE_URL` | Connection string Neon Postgres. Wajib untuk pendaftaran di Vercel. Hanya untuk server. |
| `GAME_URL` | URL HTTP(S) game yang bisa dibuka publik. Opsional. |
| `SITE_URL` | Alamat website untuk canonical URL, preview tautan, dan sitemap. Boleh kosong sebelum rilis. |
| `PLAYTEST_DATABASE_PATH` | Lokasi SQLite lokal; bawaan `storage/playtest.sqlite`. |
| `PORT`, `HOST` | Server lokal; bawaan `4173` dan `127.0.0.1`. |

Simpan kredensial di `.env` untuk lokal dan environment variables Vercel untuk produksi. Jangan taruh di `frontend/` atau commit ke Git.

## Struktur folder

```text
frontend/        Template halaman, CSS, interaksi browser, terjemahan, aset
backend/         Render halaman, validasi, server HTTP lokal
api/             Pintu masuk function Vercel
data/            Katalog, konfigurasi publik, adapter database, migrasi SQL
shared/game/     Salinan kecil aturan harga dan reward dari game
infra/           Script build statis dan migrasi database
tests/           Pengujian route, bahasa, pendaftaran, penyimpanan, reward
```

- Teks dan tautan: `data/site.js`, `data/promotion.js`, `frontend/pages/`.
- Ilustrasi dan tampilan: `frontend/assets/`, `frontend/styles/`. Layout hero dan footer terpisah.
- Terjemahan English: `frontend/locales/`. Teks Indonesia menjadi kunci terjemahan.
- Harga getek: `shared/game/rafts.js`, disimpan sebagai string bilangan bulat wei dan ditampilkan dalam MON. Baca [catatan sumber](shared/game/README.md) sebelum mengubahnya.
- Penjelasan ekonomi dan usulan pembagian dana: `data/economy.js`. Menampilkan harga tidak berarti pembelian atau klaim sudah aktif.

Panel dampak belum tersambung ke data produksi. Data yang belum tersedia tidak diganti angka buatan. Sampah dalam game juga tidak dianggap sebagai sampah fisik terukur atau kredit karbon terverifikasi.

## Pengujian dan build

```sh
npm test
npm run build
```

Pengujian mencakup kedua bahasa, tautan aset, pembatasan akses file privat, validasi form, email ganda, pembatalan, kegagalan penyimpanan, dan query PostgreSQL. Pengujian Postgres memakai PGlite secara lokal tanpa kredensial. Setelah deploy, tetap lakukan uji singkat langsung di Neon/Vercel.

Folder `dist/` berisi website statis. Mengunggah folder itu saja ke hosting statis tidak menjalankan API pendaftaran. Vercel memasang function dari folder `api/` bersama hasil build tersebut.

Template GitHub Actions tersedia di `infra/ci/github-actions.yml`, tetapi belum aktif. Untuk mengaktifkannya, salin isinya ke `.github/workflows/ci.yml` lewat editor web GitHub, atau push dengan kredensial yang memiliki akses workflow. Workflow ini menjalankan pengujian dan build tanpa secret deployment.

## Kontribusi dan lisensi

Baca [CONTRIBUTING.md](CONTRIBUTING.md) untuk perubahan kode dan [SECURITY.md](SECURITY.md) untuk laporan privat. Jangan sertakan data pendaftar, kredensial, database lokal, atau hasil build dalam commit.

Kode dan dokumentasi memakai [lisensi MIT](LICENSE). Font mengikuti lisensinya sendiri. Ketentuan ilustrasi dan identitas merek ada di [ASSETS.md](ASSETS.md); lisensi MIT tidak otomatis mencakup gambar tersebut. Lihat juga [catatan pihak ketiga](THIRD_PARTY_NOTICES.md).

Created by Ndobol Sesarengan - Monad Blitz Hackathon team DeEs.
