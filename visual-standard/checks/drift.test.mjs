import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkDrift, validateTokens } from './drift.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
function copyRepo() {
  const dir = mkdtempSync(join(tmpdir(), 'ds-drift-'));
  for (const f of ['cristian-vega-design-system.html', 'cristian-vega-products.html', 'tokens.json', 'dist', 'icons', 'build']) {
    try { cpSync(join(ROOT, f), join(dir, f), { recursive: true }); } catch {}
  }
  return dir;
}

test('the committed sheet and dist match a fresh build', async () => {
  const dir = copyRepo();
  try { assert.deepEqual(await checkDrift(dir), []); } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('an edited declaration inside a generated region is drift', async () => {
  const dir = copyRepo();
  try {
    const p = join(dir, 'cristian-vega-design-system.html');
    writeFileSync(p, readFileSync(p, 'utf8').replace('--fs-ui: 13px;', '--fs-ui: 14px;'));
    const problems = await checkDrift(dir);
    assert.ok(problems.some((x) => x.startsWith('sheet region tokens differs')), problems.join('\n'));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('an edited declaration inside the document\'s system region is drift', async () => {
  const dir = copyRepo();
  try {
    const p = join(dir, 'cristian-vega-products.html');
    writeFileSync(p, readFileSync(p, 'utf8').replace('--fs-ui: 13px;', '--fs-ui: 14px;'));
    const problems = await checkDrift(dir);
    assert.ok(problems.some((x) => x.startsWith('document region system differs')), problems.join('\n'));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('an edited dist/tokens.css is drift', async () => {
  const dir = copyRepo();
  try {
    writeFileSync(join(dir, 'dist/tokens.css'), '/* stale */\n');
    const problems = await checkDrift(dir);
    assert.ok(problems.some((x) => x.startsWith('dist/tokens.css differs')));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('an edited dist/cristian-vega.css is drift', async () => {
  const dir = copyRepo();
  try {
    const p = join(dir, 'dist/cristian-vega.css');
    writeFileSync(p, readFileSync(p, 'utf8').replace('--fs-ui: 13px;', '--fs-ui: 14px;'));
    const problems = await checkDrift(dir);
    assert.ok(problems.some((x) => x.startsWith('dist/cristian-vega.css differs')), problems.join('\n'));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('an edited dist/cristian-vega-doc.css is drift', async () => {
  const dir = copyRepo();
  try {
    const p = join(dir, 'dist/cristian-vega-doc.css');
    writeFileSync(p, readFileSync(p, 'utf8').replace('--doc-pin: ', '--doc-pin-edited: '));
    const problems = await checkDrift(dir);
    assert.ok(problems.some((x) => x.startsWith('dist/cristian-vega-doc.css differs')), problems.join('\n'));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('validateTokens rejects a duplicate key and an unknown type', () => {
  assert.deepEqual(validateTokens({ a: { x: { $type: 'color', $value: '#000' } }, b: { x: { $type: 'color', $value: '#fff' } } }), ['duplicate key x']);
  assert.deepEqual(validateTokens({ a: { y: { $type: 'length', $value: '1px' } } }), ['y: unknown $type length']);
});

test('validateTokens rejects a self-reference cycle', () => {
  assert.deepEqual(validateTokens({ g: { a: { $type: 'color', $value: '{g.a}' } } }), ['reference cycle at a']);
});

test('validateTokens rejects a two-token reference cycle', () => {
  assert.deepEqual(
    validateTokens({ g: { a: { $type: 'color', $value: '{g.b}' }, b: { $type: 'color', $value: '{g.a}' } } }),
    ['reference cycle at a'],
  );
});

test('validateTokens rejects a non-string $value without crashing', () => {
  assert.deepEqual(validateTokens({ a: { x: { $type: 'color', $value: 13 } } }), ['x: $value must be a string']);
});
