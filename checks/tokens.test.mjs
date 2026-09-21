import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const TYPES = new Set(['color', 'dimension', 'number', 'fontFamily', 'shadow', 'duration', 'cubicBezier', 'border', 'expression']);

function walk(node, path, out) {
  for (const [key, value] of Object.entries(node)) {
    if (key.startsWith('$')) continue;
    if (value && typeof value === 'object' && '$value' in value) out.push({ key, path: [...path, key], token: value });
    else if (value && typeof value === 'object') walk(value, [...path, key], out);
  }
  return out;
}

test('tokens.json holds 165 product tokens with unique keys and known types', () => {
  const tokens = JSON.parse(readFileSync(new URL('../tokens.json', import.meta.url), 'utf8'));
  const all = walk(tokens, [], []);
  assert.equal(all.length, 165);
  const keys = all.map((t) => t.key);
  assert.equal(new Set(keys).size, keys.length, 'duplicate key');
  for (const { key, token } of all) {
    assert.ok(TYPES.has(token.$type), `${key}: unknown $type ${token.$type}`);
    assert.equal(typeof token.$value, 'string', `${key}: $value must be a string`);
  }
  assert.equal(tokens.$extensions['cristian-vega'].version, '1.0.0');
  assert.match(tokens.$extensions['cristian-vega'].date, /^\d{4}-\d{2}-\d{2}$/);
});

test('every reference points at an existing path', () => {
  const tokens = JSON.parse(readFileSync(new URL('../tokens.json', import.meta.url), 'utf8'));
  const all = walk(tokens, [], []);
  const paths = new Set(all.map((t) => t.path.join('.')));
  for (const { key, token } of all) {
    for (const m of token.$value.matchAll(/\{([^}]+)\}/g)) {
      assert.ok(paths.has(m[1]), `${key}: reference {${m[1]}} does not exist`);
    }
  }
});

test('the token file names match the sheet', () => {
  const tokens = JSON.parse(readFileSync(new URL('../tokens.json', import.meta.url), 'utf8'));
  const sheet = readFileSync(new URL('../cristian-vega-design-system.html', import.meta.url), 'utf8');
  const root = sheet.slice(sheet.indexOf(':root {'), sheet.indexOf('/* documentation chrome'));
  const sheetNames = [...root.matchAll(/--([a-z0-9-]+):/g)].map((m) => m[1]);
  const fileNames = walk(tokens, [], []).map((t) => t.key);
  assert.deepEqual(new Set(fileNames), new Set(sheetNames));
});
