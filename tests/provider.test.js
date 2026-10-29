import test from 'node:test';
import assert from 'node:assert/strict';
import { imageData, callOpenAI, analyze, preview } from '../src/provider.js';
const photo = 'data:image/png;base64,aGVsbG8=';
test('photos must be bounded inline raster data, never remote URLs or SVG', () => {
  assert.equal(imageData(photo), photo);
  for (const invalid of ['https://example.com/photo.jpg', 'data:image/svg+xml;base64,aGVsbG8=', '', null]) assert.throws(() => imageData(invalid), { status: 400 });
});
test('missing key fails before transmitting anything', async () => {
  let called = false;
  await assert.rejects(callOpenAI('responses', {}, { key: '', fetcher: () => called = true }), { status: 503 });
  assert.equal(called, false);
});
test('provider failure is actionable without echoing secrets or provider body', async () => {
  await assert.rejects(callOpenAI('responses', {}, { key: 'test', fetcher: async () => ({ ok: false, status: 429 }) }), { status: 502 });
});
test('vision parses a response and disables response storage', async () => {
  const items = await analyze(photo, { key: 'test', fetcher: async (url, request) => {
    assert.equal(url, 'https://api.openai.com/v1/responses');
    assert.equal(JSON.parse(request.body).store, false);
    return { ok: true, json: async () => ({ output: [{ content: [{ type: 'output_text', text: '{"items":[{"name":"Cream tee","category":"Tops"}]}' }] }] }) };
  } });
  assert.equal(items[0].name, 'Cream tee');
});
test('malformed vision response does not become a successful result', async () => {
  await assert.rejects(analyze(photo, { key: 'test', fetcher: async () => ({ ok: true, json: async () => ({ output: [] }) }) }), { status: 502 });
});
test('preview sends person first and reference second with preservation instructions', async () => {
  const result = await preview({ person: photo, reference: photo, prompt: 'A green shirt' }, { key: 'test', fetcher: async (url, request) => {
    assert.equal(url, 'https://api.openai.com/v1/images/edits');
    const body = JSON.parse(request.body);
    assert.equal(body.images.length, 2); assert.match(body.prompt, /Preserve their face/);
    return { ok: true, json: async () => ({ data: [{ b64_json: 'aGVsbG8=' }] }) };
  } });
  assert.equal(result, photo);
});
