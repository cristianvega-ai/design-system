import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, cpSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from '../build/config.mjs';
import { readInputs } from '../build/inject.mjs';

const ROOT = new URL('..', import.meta.url).pathname;

test('the build writes one declaration per token, references as var(), descriptions as comments', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'ds-build-'));
  try {
    await build(dir + '/');
    const css = readFileSync(join(dir, 'tokens.css'), 'utf8');
    const decls = [...css.matchAll(/^\s*--([a-z0-9-]+):\s*([^;]+);/gm)];
    assert.equal(decls.length, 165);
    assert.ok(css.startsWith(':root {'), 'starts with :root');
    assert.match(css, /^\s*--fs-ui: 13px; \/\* the console ground: controls, menus, messages, row titles \*\/$/m);
    assert.match(css, /^\s*--signal: var\(--azure\);/m, 'a reference is written as var()');
    assert.match(css, /^\s*--focus-surface: 2px solid var\(--azure\);/m, 'a reference inside a longer value is written as var()');
    assert.match(css, /^\s*--fs-display-xl: clamp\(38px, 4\.9vw, 60px\);/m, 'an expression is copied as written');
    assert.doesNotMatch(css, /version|Do not edit/, 'no file header, no metadata');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('readInputs refuses a root whose icons/ is missing or empty', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ds-icons-'));
  try {
    for (const f of ['cristian-vega-design-system.html', 'cristian-vega-products.html', 'tokens.json', 'dist']) cpSync(join(ROOT, f), join(dir, f), { recursive: true });
    assert.throws(() => readInputs(dir), /icons\/ is missing or empty/, 'no icons/ folder');
    mkdirSync(join(dir, 'icons'));
    assert.throws(() => readInputs(dir), /icons\/ is missing or empty/, 'an empty icons/ folder');
    writeFileSync(join(dir, 'icons', 'dot.svg'), '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="2"/></svg>');
    assert.deepEqual(readInputs(dir).icons, [{ name: 'dot', body: '<circle cx="8" cy="8" r="2"/>' }]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
