import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkMarkup } from './markup.mjs';

test('balanced markup passes, an unclosed tag fails, void elements are ignored', () => {
  assert.deepEqual(checkMarkup('<div><p>a<br><img src="x"></p></div>'), []);
  assert.deepEqual(checkMarkup('<div><p>a</div>'), ['unclosed <p> at line 1']);
  assert.deepEqual(checkMarkup('</p>'), ['stray </p> at line 1']);
});
