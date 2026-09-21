import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contrast, resolve, checkContrast } from './contrast.mjs';

test('contrast follows the Web Content Accessibility Guidelines formula', () => {
  assert.equal(contrast('#14181F', '#F1F3F6').toFixed(2), '16.01');
  assert.equal(contrast('#0A7A64', '#E7F3F0').toFixed(2), '4.64');
  assert.equal(contrast('rgba(255,255,255,.35)', '#14181F').toFixed(2), '3.22');
});

test('resolve follows references and composites tints over a ground', () => {
  const tokens = { color: { crimson: { $type: 'color', $value: '#D42A3C' }, signal: { $type: 'color', $value: '{color.crimson}' } } };
  assert.equal(resolve(tokens).get('signal'), '#D42A3C');
});

test('a pair under its limit is a finding, and a pair names its purpose', () => {
  const tokens = { color: { fg: { $type: 'color', $value: '#14181F' }, paper: { $type: 'color', $value: '#F1F3F6' }, ember: { $type: 'color', $value: '#F2792B' } } };
  const pairs = [
    { fg: 'fg', bg: 'paper', purpose: 'body text', limit: 4.5 },
    { fg: 'ember', bg: 'paper', purpose: 'ember words on paper', limit: 4.5 },
  ];
  assert.deepEqual(checkContrast(tokens, pairs), ['ember on paper (ember words on paper): 2.50 < 4.5']);
});
