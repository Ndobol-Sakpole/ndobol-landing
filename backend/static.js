import { createReadStream } from 'node:fs';
import { stat, realpath } from 'node:fs/promises';
import path from 'node:path';
const mime = { '.html': 'text/html; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.png': 'image/png', '.webp': 'image/webp', '.ttf': 'font/ttf', '.zip': 'application/zip', '.md': 'text/markdown; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
export async function sendFile(req, res, root, pathname, { download = false } = {}) {
  const file = path.resolve(root, '.' + pathname);
  // Check both lexical path and resolved symlinks; never expose files outside the public root.
  if (!file.startsWith(path.resolve(root) + path.sep)) return false;
  let info;
  try {
    const resolved = await realpath(file);
    if (!resolved.startsWith(await realpath(root) + path.sep)) return false;
    info = await stat(resolved);
    if (!info.isFile() || !mime[path.extname(resolved)]) return false;
  } catch { return false; }
  const etag = `W/"${info.size}-${Math.floor(info.mtimeMs)}"`;
  res.setHeader('ETag', etag);
  res.setHeader('Cache-Control', process.env.NODE_ENV === 'production' ? 'public, max-age=3600' : 'no-cache');
  if (req.headers['if-none-match'] === etag) { res.writeHead(304); res.end(); return true; }
  res.setHeader('Content-Type', mime[path.extname(file)]);
  res.setHeader('Content-Length', info.size);
  if (download) res.setHeader('Content-Disposition', `attachment; filename="${path.basename(file)}"`);
  res.writeHead(200);
  if (req.method === 'HEAD') res.end();
  else {
    const stream = createReadStream(file);
    stream.on('error', () => res.destroy());
    res.on('close', () => stream.destroy());
    stream.pipe(res);
  }
  return true;
}
