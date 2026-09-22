import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const read = (file) => readFileSync(new URL(file, root), 'utf8');

test('the token file names no paper', () => {
  assert.equal((read('tokens.json').match(/paper/gi) ?? []).length, 0);
});

test('the sheet has no paper class and no paper custom property', () => {
  const html = read('cristian-vega-design-system.html');
  assert.deepEqual(html.match(/class="[^"]*paper[^"]*"/g) ?? [], []);
  assert.deepEqual(html.match(/--[a-z0-9-]*paper[a-z0-9-]*/g) ?? [], []);
});
