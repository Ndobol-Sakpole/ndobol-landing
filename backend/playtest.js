import { playtestDevices } from '../data/promotion.js';

const maxBodyBytes = 4096;
const error = (status, message) => Object.assign(new Error(message), { status });
const send = (res, status, body, headers = {}) => {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers });
  res.end(JSON.stringify(body));
};

async function readBody(req) {
  if (Number(req.headers['content-length'] || 0) > maxBodyBytes) {
    req.resume(); throw error(413, 'Isian terlalu panjang. Ringkas data dan coba lagi.');
  }
  // Vercel parses JSON before invoking a Node handler; local HTTP uses a stream.
  if ('body' in req) {
    try {
      const body = req.body;
      if (Buffer.byteLength(JSON.stringify(body) || '') > maxBodyBytes) throw error(413, 'Isian terlalu panjang. Ringkas data dan coba lagi.');
      if (!body || Array.isArray(body) || typeof body !== 'object') throw error(400, 'Isian tidak terbaca. Muat ulang halaman dan coba lagi.');
      return body;
    } catch (failure) {
      throw failure.status ? failure : error(400, 'Isian tidak terbaca. Muat ulang halaman dan coba lagi.');
    }
  }
  return new Promise((resolve, reject) => {
    let size = 0, chunks = [], exceeded = false;
    req.on('data', chunk => {
      size += chunk.length;
      if (size > maxBodyBytes) {
        if (!exceeded) reject(error(413, 'Isian terlalu panjang. Ringkas data dan coba lagi.'));
        exceeded = true; chunks = []; return;
      }
      if (!exceeded) chunks.push(chunk);
    });
    req.on('end', () => {
      if (exceeded) return;
      try {
        const body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
        if (!body || Array.isArray(body) || typeof body !== 'object') throw new Error();
        resolve(body);
      } catch { reject(error(400, 'Isian tidak terbaca. Muat ulang halaman dan coba lagi.')); }
    });
    req.on('error', () => reject(error(400, 'Pengiriman terputus. Coba lagi.')));
    req.on('aborted', () => reject(error(400, 'Pengiriman terputus. Coba lagi.')));
  });
}

export function createPlaytestHandler({ store, databasePath, maxRequests = 10, windowMs = 15 * 60 * 1000, getClientAddress = req => req.socket.remoteAddress }) {
  store ??= {
    async register(data) { const local = await import('../data/playtest-store.js'); return local.registerPlaytester(databasePath, data); },
    async cancel(token) { const local = await import('../data/playtest-store.js'); return local.cancelPlaytester(databasePath, token); }
  };
  const requests = new Map();
  return async (req, res, pathname) => {
    if (!['/api/playtest', '/api/playtest/cancel'].includes(pathname)) return false;
    if (req.method !== 'POST') {
      send(res, 405, { ok: false, message: 'Gunakan formulir playtest untuk mengirim data.' }, { Allow: 'POST' }); return true;
    }
    try {
      let sameOrigin = true;
      if (req.headers.origin) {
        try {
          const origin = new URL(req.headers.origin);
          sameOrigin = ['http:', 'https:'].includes(origin.protocol) && origin.host === req.headers.host;
        } catch { sameOrigin = false; }
      }
      if (!sameOrigin || req.headers['sec-fetch-site'] === 'cross-site') throw error(403, 'Kirim formulir dari website Ndobol.');
      if (req.headers['content-type']?.split(';')[0].trim().toLowerCase() !== 'application/json') throw error(415, 'Aktifkan JavaScript lalu gunakan formulir playtest.');
      const key = getClientAddress(req);
      let limit;
      if (store.allowRequest) {
        limit = await store.allowRequest(key, maxRequests, windowMs);
      } else {
        const now = Date.now();
        for (const [key, value] of requests) if (value.reset <= now) requests.delete(key);
        const bucket = requests.get(key) || { count: 0, reset: now + windowMs };
        limit = { allowed: bucket.count < maxRequests && (requests.has(key) || requests.size < 10000), retryAfter: Math.ceil((bucket.reset - now) / 1000) };
        if (limit.allowed) { bucket.count++; requests.set(key, bucket); }
      }
      if (!limit.allowed) {
        send(res, 429, { ok: false, message: 'Terlalu banyak percobaan. Tunggu beberapa menit sebelum mencoba lagi.' }, { 'Retry-After': String(limit.retryAfter) });
        req.resume(); return true;
      }
      const body = await readBody(req);
      if (pathname.endsWith('/cancel')) {
        if (typeof body.token !== 'string' || !/^[a-f0-9]{64}$/.test(body.token)) throw error(422, 'Masukkan kode pembatalan 64 karakter yang kamu simpan.');
        await store.cancel(body.token);
        send(res, 200, { ok: true, message: 'Jika kode cocok, pendaftaran dan datanya sudah dihapus.' }); return true;
      }
      if (body.company) {
        send(res, 200, { ok: true, token: null }); return true;
      }
      const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
      const name = typeof body.name === 'string' ? body.name.trim() : '';
      if (email.length > 254 || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i.test(email)) throw error(422, 'Periksa alamat emailmu, misalnya kamu@contoh.com.');
      if (name.length > 60 || /[\u0000-\u001f\u007f]/.test(name)) throw error(422, 'Nama panggilan maksimal 60 karakter tanpa karakter kontrol.');
      if (!playtestDevices.some(device => device.value === body.device)) throw error(422, 'Pilih perangkat yang akan kamu gunakan.');
      if (body.consent !== true) throw error(422, 'Persetujuan untuk dihubungi perlu dicentang.');
      const result = await store.register({ email, name, device: body.device });
      send(res, 200, { ok: true, ...result });
    } catch (failure) {
      // Do not log request bodies, subscriber addresses, or database error details.
      if (!res.destroyed) send(res, failure.status || 503, { ok: false, message: failure.status ? failure.message : 'Pendaftaran belum bisa disimpan. Coba lagi sebentar; isianmu tetap ada.' });
      req.resume();
    }
    return true;
  };
}
