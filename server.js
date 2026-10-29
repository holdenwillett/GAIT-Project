import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, sep } from 'node:path';
import { AppError, analyze, preview } from './src/provider.js';

try { process.loadEnvFile(); } catch (error) { if (error.code !== 'ENOENT') throw error; }

const root = fileURLToPath(new URL('./public/', import.meta.url));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };
async function body(req) {
  let size = 0, chunks = [];
  for await (const chunk of req) { size += chunk.length; if (size > 13_000_000) throw new AppError(413, 'Photos are too large. Choose smaller images.'); chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString()); } catch { throw new AppError(400, 'Invalid JSON request.'); }
}
export function createServer() {
  return http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data: blob:; style-src 'self'; script-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    const json = (status, value) => { res.writeHead(status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(value)); };
    try {
      const path = new URL(req.url, 'http://localhost').pathname;
      if (path === '/api/status' && req.method === 'GET') return json(200, { ai: Boolean(process.env.OPENAI_API_KEY), provider: 'OpenAI' });
      if (path.startsWith('/api/')) {
        if (req.method !== 'POST') throw new AppError(405, 'Method not allowed.');
        if (!['/api/analyze', '/api/preview'].includes(path)) throw new AppError(404, 'Not found.');
        if (req.headers.origin && req.headers.origin !== `http://${req.headers.host}`) throw new AppError(403, 'Use this app from its local address.');
        if (!req.headers['content-type']?.startsWith('application/json')) throw new AppError(415, 'Use application/json.');
        const input = await body(req);
        if (input?.consent !== true) throw new AppError(400, 'Allow photo processing before using AI.');
        if (path === '/api/analyze') return json(200, { items: await analyze(input.photo) });
        return json(200, { image: await preview(input) });
      }
      if (req.method !== 'GET' && req.method !== 'HEAD') throw new AppError(405, 'Method not allowed.');
      let file;
      if (path === '/outfits.js') file = fileURLToPath(new URL('./src/outfits.js', import.meta.url));
      else {
        file = resolve(root, '.' + decodeURIComponent(path === '/' ? '/index.html' : path));
        if (!file.startsWith(root.endsWith(sep) ? root : root + sep)) throw new AppError(404, 'Not found.');
      }
      const data = await readFile(file);
      const ext = file.slice(file.lastIndexOf('.'));
      res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      res.end(req.method === 'HEAD' ? undefined : data);
    } catch (error) { json(error.status || (error.code === 'ENOENT' ? 404 : 500), { error: error.status ? error.message : 'Unable to complete the request.' }); }
  });
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3000);
  createServer().listen(port, '127.0.0.1', () => console.log(`Sock Drawer is ready at http://localhost:${port}`));
}
