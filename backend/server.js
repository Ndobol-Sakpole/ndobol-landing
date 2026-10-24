import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderPage } from './render.js';
import { persistentStore } from '../data/playtest-persistence.js';
import { sendFile } from './static.js';
import { readImpact } from './impact.js';
import { createPlaytestHandler } from './playtest.js';
const root = fileURLToPath(new URL('../', import.meta.url));
const downloadNames = new Set(['ndobol-press-kit.zip', 'ndobol-logo.png', 'fact-sheet.md']);
export function createServer({ playtestDatabasePath = process.env.PLAYTEST_DATABASE_PATH || path.join(root, 'storage/playtest.sqlite'), playtestStore = process.env.DATABASE_URL ? persistentStore() : undefined, playtestRateLimit } = {}) {
  const handlePlaytest = createPlaytestHandler({ store: playtestStore, databasePath: playtestDatabasePath, maxRequests: playtestRateLimit });
  return http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self'; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'");
    let pathname, url;
    try {
      url = new URL(req.url, 'http://localhost');
      pathname = decodeURIComponent(url.pathname);
      if (pathname.includes('\0') || pathname.includes('\\') || pathname.split('/').includes('..')) throw new Error('Invalid path');
    } catch { res.writeHead(400); res.end('Bad request'); return; }
    try {
      if (await handlePlaytest(req, res, pathname)) return;
      if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end('Method not allowed'); return; }
      if (pathname === '/shared/game/rewards.js') { await sendFile(req, res, path.join(root, 'shared/game'), '/rewards.js'); return; }
      if (pathname === '/api/impact.json') {
        const body = JSON.stringify(readImpact(process.env.IMPACT_DATABASE_PATH || path.join(root, 'data/ndobol.sqlite')));
        res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
        res.end(req.method === 'HEAD' ? undefined : body); return;
      }
      if (pathname === '/api/health') {
        const body = JSON.stringify({ status: 'ok', service: 'ndobol-sesarengan' });
        res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
        res.end(req.method === 'HEAD' ? undefined : body); return;
      }
      if (pathname === '/index.html' || (pathname !== '/' && pathname.endsWith('/'))) {
        res.writeHead(308, { Location: (pathname === '/index.html' ? '/' : pathname.replace(/\/+$/, '')) + url.search }); res.end(); return;
      }
      if (pathname.startsWith('/downloads/')) {
        const name = pathname.slice('/downloads/'.length);
        if (downloadNames.has(name) && await sendFile(req, res, path.join(root, 'data/downloads'), '/' + name, { download: true })) return;
      } else if (/^\/(assets|styles|components|lib|locales)\//.test(pathname) || pathname === '/app.js') {
        if (await sendFile(req, res, path.join(root, 'frontend'), pathname)) return;
      } else if (!path.extname(pathname)) {
        const { html, status } = renderPage(pathname);
        res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
        res.end(req.method === 'HEAD' ? undefined : html); return;
      }
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end(req.method === 'HEAD' ? undefined : 'Not found');
    } catch (error) {
      console.error('Request failed:', error.message);
      if (!res.headersSent) { res.writeHead(500); res.end('Server error'); } else res.destroy();
    }
  });
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 4173);
  const host = process.env.HOST || '127.0.0.1';
  const server = createServer();
  server.listen(port, host, () => console.log(`Ndobol Sesarengan is ready: http://${host}:${port}`));
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => server.close(() => process.exit(0)));
}
