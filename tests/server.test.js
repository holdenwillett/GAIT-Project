import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from '../server.js';
const server = createServer(); let base;
before(async () => { await new Promise(r => server.listen(0, '127.0.0.1', r)); base = `http://127.0.0.1:${server.address().port}`; });
after(async () => { server.closeAllConnections(); await new Promise(r => server.close(r)); });
test('serves the app, shared outfit module and security headers', async () => {
  for (const path of ['/', '/app.js', '/styles.css', '/outfits.js']) {
    const response = await fetch(base + path); assert.equal(response.status, 200, path);
    assert.ok(response.headers.get('content-security-policy')); assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  }
});
test('environment files and source modules are not exposed', async () => {
  for (const path of ['/.env', '/src/provider.js', '/package.json']) assert.equal((await fetch(base + path)).status, 404);
});
test('AI requires explicit consent', async () => {
  const response = await fetch(base + '/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ photo: 'data:image/png;base64,aGVsbG8=' }) });
  assert.equal(response.status, 400); assert.match((await response.json()).error, /Allow photo processing/);
});
test('rejects cross-origin processing', async () => {
  const response = await fetch(base + '/api/preview', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://other.example' }, body: '{}' });
  assert.equal(response.status, 403);
});
test('rejects malformed JSON and unsupported content types', async () => {
  const response = await fetch(base + '/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
  assert.equal(response.status, 400);
  assert.equal((await fetch(base + '/api/analyze', { method: 'POST', body: '{}' })).status, 415);
});
