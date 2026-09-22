import { test } from 'node:test';
import assert from 'node:assert/strict';
import { findRegion, replaceRegion, renderTokenRegion, renderTokenBlock, renderIconSprite, stampVersion } from '../build/lib.mjs';

test('findRegion locates a css marker pair and rejects bad pairs', () => {
  const ok = 'a\n/* build:x */\nbody\n/* /build:x */\nz';
  const r = findRegion(ok, 'x', 'css');
  assert.equal(ok.slice(r.start, r.end), '\nbody\n');
  assert.throws(() => findRegion('no markers', 'x', 'css'), /missing/);
  assert.throws(() => findRegion(ok + '\n/* build:x */\n/* /build:x */', 'x', 'css'), /duplicate/);
  assert.throws(() => findRegion('/* /build:x */\n/* build:x */', 'x', 'css'), /reversed/);
});

test('replaceRegion keeps everything outside the markers', () => {
  const t = '<p>1</p>\n<!-- build:y -->old<!-- /build:y -->\n<p>2</p>';
  assert.equal(replaceRegion(t, 'y', 'html', 'new'), '<p>1</p>\n<!-- build:y -->new<!-- /build:y -->\n<p>2</p>');
});

test('renderTokenRegion writes group comments and the css lines in token-file order', () => {
  const css = ':root {\n  --b: 2px;\n  --a: 1px; /* one */\n}\n';
  const tokens = { $extensions: {}, g: { $description: 'group one', a: { $type: 'dimension', $value: '1px', $description: 'one' }, b: { $type: 'dimension', $value: '2px' } } };
  assert.equal(renderTokenRegion(css, tokens), '\n    /* group one */\n    --a: 1px; /* one */\n    --b: 2px;\n');
  assert.throws(() => renderTokenRegion(':root {\n}\n', tokens), /--a is not in tokens.css/);
});

test('renderTokenBlock wraps literal values in <i> and comments in <em>, and escapes markup', () => {
  const region = '\n    /* faces */\n    --font-display: "A", sans-serif;\n    --signal: var(--crimson); /* on <paper> */\n';
  assert.equal(renderTokenBlock(region),
    ':root {\n  <em>/* faces */</em>\n  --font-display: <i>"A", sans-serif</i>;\n  --signal: var(--crimson); <em>/* on &lt;paper&gt; */</em>\n}');
});

test('renderIconSprite writes one symbol per file on the 16 grid', () => {
  const out = renderIconSprite([{ name: 'search', body: '<circle cx="7" cy="7" r="4.5"/>' }]);
  assert.equal(out, '<svg hidden aria-hidden="true"><symbol id="i-search" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="4.5"/></symbol></svg>');
  assert.equal(renderIconSprite([]), '<svg hidden aria-hidden="true"></svg>');
});

test('stampVersion replaces exactly two stamps', () => {
  const t = 'v1.1 · 2026-09-15 … v1.1 · 2026-09-15';
  assert.equal(stampVersion(t, '1.2.0', '2026-09-16'), 'v1.2.0 · 2026-09-16 … v1.2.0 · 2026-09-16');
  assert.throws(() => stampVersion('v1.1 · 2026-09-15', '1.2.0', '2026-09-16'), /expected 2 version stamps/);
});
