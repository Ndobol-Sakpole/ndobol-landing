export default function health(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return;
  }
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(req.method === 'HEAD' ? undefined : JSON.stringify({ status: 'ok', service: 'ndobol-sesarengan' }));
}
