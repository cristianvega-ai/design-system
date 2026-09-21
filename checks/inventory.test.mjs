import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkInventory } from './inventory.mjs';

const css = `
  :root { --x: 1px; }
  /* 3. Components. */
  .btn { padding: 0 var(--space-5); gap: 8px; color: #fff; border: 1px solid var(--g-line); border-radius: 50%; }
  .brand { gap: 10px; }
  .wire .w { padding: 6px; }
`;

test('a raw pixel or hex in a component rule is a finding', () => {
  const problems = checkInventory(css, { allow: [] });
  assert.deepEqual(problems, [
    '.btn { gap: 8px } raw pixel',
    '.btn { color: #fff } raw color',
    '.brand { gap: 10px } raw pixel',
    '.wire .w { padding: 6px } raw pixel',
  ]);
});

test('an exception silences one finding, and a wildcard selector covers a family', () => {
  const exceptions = { allow: [
    { selector: '.btn', property: 'gap', value: '8px', reason: 'test' },
    { selector: '.btn', property: 'color', value: '#fff', reason: 'test' },
    { selector: '.brand', property: 'gap', value: '10px', reason: 'brand constant, permanent' },
    { selector: '.wire*', property: '*', value: '*', reason: 'wireframe geometry, permanent' },
  ] };
  assert.deepEqual(checkInventory(css, exceptions), []);
});

test('1px lines, 50% circles, and rules before the components section are not findings', () => {
  assert.deepEqual(checkInventory(':root { --a: 4px; }\n/* 3. Components. */\n.x { border: 1px solid red; border-radius: 50%; }', { allow: [] }), ['.x { border: 1px solid red } raw color']);
});
