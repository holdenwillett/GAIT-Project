import test from 'node:test';
import assert from 'node:assert/strict';
import { recommend, samples } from '../src/outfits.js';

test('empty and incomplete wardrobes explain what is missing', () => {
  assert.equal(recommend([]).items.length, 0);
  assert.equal(recommend([samples[0]]).items.length, 0);
});
test('everyday and dressier occasions prioritize different pieces', () => {
  assert.equal(recommend(samples).items[0].id, 'sample-1');
  assert.equal(recommend(samples, { occasion: 'Work' }).items[0].id, 'sample-2');
  assert.equal(recommend(samples, { occasion: 'Work' }).items[1].id, 'sample-4');
});
test('cool weather includes a layer; warm weather excludes it', () => {
  assert.ok(recommend(samples, { weather: 'Cool' }).items.some(i => i.category === 'Layers'));
  assert.ok(!recommend(samples, { weather: 'Warm' }).items.some(i => i.category === 'Layers'));
});
test('one-pieces work without a top and bottom', () => {
  const dress = { id: 'dress', category: 'One-pieces', style: 'Smart' };
  assert.deepEqual(recommend([dress]).items, [dress]);
});
test('alternatives use only existing pieces and do not mutate input', () => {
  const copy = JSON.stringify(samples);
  assert.notEqual(recommend(samples, { offset: 0 }).items[0].id, recommend(samples, { offset: 1 }).items[0].id);
  assert.equal(JSON.stringify(samples), copy);
});
