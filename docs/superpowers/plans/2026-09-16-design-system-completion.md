# Design System Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Cristian Vega design system complete and dependable: one token file as the source, a Style Dictionary build that writes the sheet, native controls, local assets, and one check command that stops a bad change.

**Architecture:** A new git repository `~/Projects/design-system/` holds the handwritten sheet and its sources. `tokens.json` is the only place a token value is typed. Style Dictionary writes `dist/tokens.css`; a short inject script writes four marked regions of the sheet from that output, the icon files, and the live stylesheet. Five Node checks read the results and exit 1 on a fault; they never write inside the repository.

**Tech Stack:** Node 24 (`node --test` for tests), style-dictionary 5.5.3, playwright 1.63.0 (change 2 only), plain style sheets with custom properties, one sheet of hypertext markup. Python 3.9 with fontTools only inside a throwaway virtual environment for a one-time font measurement.

**Spec:** `docs/superpowers/specs/2026-09-15-design-system-completion-design.md` (revision 3). The visual page beside it is `2026-09-15-design-system-completion-design.html`. The review that shaped revision 2 is `2026-09-15-design-system-completion-review.md`.

## Global Constraints

- The repository is `~/Projects/design-system/`. The sheet is `cristian-vega-design-system.html` at its root. Every path below is relative to that root.
- Node 24 is the floor. `package.json` pins `style-dictionary` at `5.5.3` and `playwright` at `1.63.0`. No other runtime dependency.
- The token file holds the 158 product tokens the sheet's `:root` holds today, with their current names and values. Change 1 extracts them and does not redesign them. Change 2 adds `line-control`. Change 3 adds the five `z-*` layer tokens.
- Inside the stylesheet a marker is a stylesheet comment: `/* build:tokens */` … `/* /build:tokens */`. In the body a marker is a markup comment: `<!-- build:token-block -->`, `<!-- build:ground-contract -->`, `<!-- build:icons -->`, each with its `<!-- /build:… -->` closer. Exactly one complete pair per region.
- The `--doc-*` tokens stay in `:root` after the closing token marker. They are never in the token file.
- The version and the date live in `tokens.json` under `$extensions['cristian-vega']`. The first values the build writes are `1.2.0` and the release date. The masthead `.d-meta` and the footer read `v<version> · <date>`.
- The checks never write a file inside the repository. The drift check builds into a temporary folder outside it.
- No dark mode, no Swift output, no SF Symbols mapping, no composite widget behavior, no migration table. Each has a backlog entry with a trigger in `README.md`.
- The sheet gets no new JavaScript beyond the existing index and motion toggle.
- Descriptive text on the sheet and the documents follow the text rules: one topic per sentence, 20 words or fewer, active voice, "must" for a requirement, no acronym (a class name, token name, or file extension is not one). Specimen text does not change. Code comments use plain language; no script enforces the rules.
- A task that changes something visible ends with three screenshots of the affected specimens: 1280 pixels wide in light, 1280 pixels wide in dark (`data-theme="dark"` on the root element), and 400 pixels wide. A task that changes only text ends with the checks.
- From Task 6 on, every task ends with `checks/run.sh` exiting 0.
- Commit after every task. Commit messages end with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

## File Structure

| Path | Responsibility | Created in |
|---|---|---|
| `cristian-vega-design-system.html` | the sheet: handwritten source with four generated regions | Task 1 (moved) |
| `tokens.json` | the source of every token, version, date | Task 2 |
| `package.json` | pinned dependencies; scripts `build`, `check`, `test`, `browser` | Task 2 |
| `build/config.mjs` | Style Dictionary configuration and the `name/key` transform | Task 3 |
| `build/inject.mjs` | reads `dist/tokens.css`, `tokens.json`, `icons/`, the stylesheet; writes the four regions and the version | Task 4 |
| `build/lib.mjs` | pure functions shared by the inject script and the drift check: markers, region rendering, token-block markup, ground-contract copy, icon sprite, version stamp | Task 4 |
| `checks/run.sh` | the one command | Task 5 |
| `checks/markup.mjs` | tag balance of the sheet | Task 5 |
| `checks/inventory.mjs` | raw pixel or hex in a component rule, minus `exceptions.json` | Task 5 |
| `checks/exceptions.json` | each allowed raw value: selector, property, value, reason | Task 5 |
| `checks/contrast.mjs` | pairs by token name with limits | Task 5 |
| `checks/drift.mjs` | token file validation; fresh build in a temporary folder; comparison | Task 6 |
| `checks/*.test.mjs` | unit tests for lib, inject, contrast, inventory, markup, drift | Tasks 4 to 6 |
| `checks/browser.mjs` | Playwright: tab order, focus ring, rendered borders | Task 13 |
| `fonts/`, `fonts/README.md` | local woff2 files and the measured fallback metrics | Task 14 |
| `icons/*.svg` | sixteen icon files | Task 15 |
| `dist/tokens.css` | generated; committed so a product can read it without building | Task 3 |
| `CHANGELOG.md`, `README.md` | history; how to build, check, change; the backlog | Tasks 6, 18 |

---

## Change 1: source and checks

### Task 1: Create the repository and move the sources

**Files:**
- Create: `~/Projects/design-system/` (git repository), `.gitignore`
- Move: `~/Projects/cristian-vega-design-system.html` → `cristian-vega-design-system.html`
- Move: everything under `~/Projects/cristian-vega-design-system-src/` → repository root (`docs/`)
- Move: `~/Projects/.claude/checks/inventory.py`, `contrast.py` → `docs/reference/` (kept as reference for the ports in Task 5, deleted in Task 6)
- Remove: `~/Projects/cristian-vega-design-system-src/`, `~/Projects/.claude/checks/`

**Interfaces:**
- Produces: the repository root every later task runs from.

- [ ] **Step 1: Create the repository**

```bash
mkdir -p ~/Projects/design-system && cd ~/Projects/design-system
git init -b main
printf 'node_modules/\n.playwright/\n*.log\n.DS_Store\n' > .gitignore
```

- [ ] **Step 2: Move the sheet and the sources**

```bash
cd ~/Projects/design-system
mv ~/Projects/cristian-vega-design-system.html ./cristian-vega-design-system.html
mv ~/Projects/cristian-vega-design-system-src/docs ./docs
mkdir -p docs/reference
mv ~/Projects/.claude/checks/inventory.py docs/reference/inventory.py
mv ~/Projects/.claude/checks/contrast.py docs/reference/contrast.py
rmdir ~/Projects/.claude/checks
rmdir ~/Projects/cristian-vega-design-system-src
ls
```

Expected: `docs  cristian-vega-design-system.html  .gitignore`, and both old folders are gone.

- [ ] **Step 3: Verify the sheet still opens**

Run: `python3 -c "import html.parser,sys; print(open('cristian-vega-design-system.html').read().count('</style>'))"`
Expected: `1`

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "Create the design-system repository with the sheet and its documents

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: package.json and the token file extracted from the sheet

**Files:**
- Create: `package.json`
- Create: `build/extract-once.mjs` (one-time; deleted in Step 8)
- Create: `tokens.json`
- Test: `checks/tokens.test.mjs`

**Interfaces:**
- Produces: `tokens.json` with this shape, read by Tasks 3, 4, 5, 6:

```json
{
  "$extensions": { "cristian-vega": { "version": "1.2.0", "date": "2026-09-16" } },
  "font": {
    "$description": "faces",
    "font-display": { "$type": "fontFamily", "$value": "\"Space Grotesk\", system-ui, -apple-system, sans-serif" }
  },
  "type": {
    "$description": "type scale · one scale, thirteen sizes. Roles share a size when they share a job.",
    "fs-ui": { "$type": "dimension", "$value": "13px", "$description": "the console ground: controls, menus, messages, row titles" }
  }
}
```

Rules the file follows: a group is an object with `$description` and tokens; a token key is the custom property name without the leading dashes; keys are unique across the file; a reference is the token path in braces, `{color.crimson}`; `$type` is one of `color`, `dimension`, `number`, `fontFamily`, `shadow`, `duration`, `cubicBezier`, `border`, `expression`.

- [ ] **Step 1: Write package.json**

```json
{
  "name": "cristian-vega-design-system",
  "version": "1.2.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=24" },
  "scripts": {
    "build": "node build/config.mjs && node build/inject.mjs",
    "test": "node --test checks/",
    "check": "npm test && node checks/inventory.mjs && node checks/contrast.mjs && node checks/markup.mjs && node checks/drift.mjs",
    "browser": "node checks/browser.mjs"
  },
  "devDependencies": {
    "style-dictionary": "5.5.3",
    "playwright": "1.63.0"
  }
}
```

Run: `npm install`
Expected: `node_modules/style-dictionary/package.json` exists and reports `"version": "5.5.3"`.

- [ ] **Step 2: Write the failing test for the token file**

`checks/tokens.test.mjs`:

```js
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

test('tokens.json holds 158 product tokens with unique keys and known types', () => {
  const tokens = JSON.parse(readFileSync(new URL('../tokens.json', import.meta.url), 'utf8'));
  const all = walk(tokens, [], []);
  assert.equal(all.length, 158);
  const keys = all.map((t) => t.key);
  assert.equal(new Set(keys).size, keys.length, 'duplicate key');
  for (const { key, token } of all) {
    assert.ok(TYPES.has(token.$type), `${key}: unknown $type ${token.$type}`);
    assert.equal(typeof token.$value, 'string', `${key}: $value must be a string`);
  }
  assert.equal(tokens.$extensions['cristian-vega'].version, '1.2.0');
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
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL with `ENOENT … tokens.json`.

- [ ] **Step 4: Write the one-time extraction script**

`build/extract-once.mjs` reads the product part of `:root`, groups the declarations by the comment line that precedes them, and writes `tokens.json`. It keeps every value as written and turns `var(--x)` into a path reference.

```js
import { readFileSync, writeFileSync } from 'node:fs';

const sheet = readFileSync('cristian-vega-design-system.html', 'utf8');
const start = sheet.indexOf(':root {') + ':root {'.length;
const end = sheet.indexOf('/* documentation chrome');
const block = sheet.slice(start, end);

// group headings: the first comment on a line that carries no declaration
const GROUP_OF = [
  ['faces', 'font'], ['type scale', 'type'], ['space', 'space'], ['fixed sizes', 'size'],
  ['radius', 'radius'], ['elevation', 'shadow'], ['motion', 'motion'], ['focus and dimming', 'focus'],
  ['grounds', 'color'], ['text and lines on paper', 'color'], ['text and lines on ink', 'color'],
  ['brand', 'color'], ['semantic', 'color'],
];
const TYPE_OF = (name, value) => {
  if (name.startsWith('font-')) return 'fontFamily';
  if (/^(lh|dim)/.test(name) || /^\d+(\.\d+)?$/.test(value)) return 'number';
  if (/^(dur|stagger)/.test(name)) return 'duration';
  if (name.startsWith('ease')) return 'cubicBezier';
  if (name.startsWith('focus-') && name !== 'focus-offset') return 'border';
  if (name.startsWith('shadow')) return 'shadow';
  if (/^(#|rgba?\()/.test(value)) return 'color';
  if (/^-?\d*(\.\d+)?(px|em|ms)$/.test(value)) return value.endsWith('ms') ? 'duration' : 'dimension';
  if (value.startsWith('var(')) return null; // decided by the referenced token below
  return 'expression';
};

const groups = {}; // groupName -> { $description, tokens: {} }
const byName = {};
let current = null;
let pendingComment = '';
for (const rawLine of block.split('\n')) {
  const line = rawLine.trim();
  if (!line) continue;
  const lead = line.match(/^\/\*\s*(.*?)\s*\*\/$/);
  if (lead && !/--[a-z0-9-]+:/.test(line)) {
    const head = lead[1];
    const hit = GROUP_OF.find(([k]) => head.toLowerCase().startsWith(k));
    if (hit) { current = hit[1]; groups[current] ??= { $description: head, tokens: {} }; if (!groups[current].$description.includes(head)) groups[current].$description += ' · ' + head; }
    else pendingComment = head;
    continue;
  }
  // one line can hold several declarations; a trailing comment belongs to the last one
  const trailing = line.match(/\/\*\s*(.*?)\s*\*\/\s*$/);
  const decls = [...line.replace(/\/\*.*?\*\/\s*$/, '').matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)];
  decls.forEach((m, i) => {
    const [, name, value] = m;
    const token = { $type: TYPE_OF(name, value.trim()), $value: value.trim() };
    if (trailing && i === decls.length - 1) token.$description = trailing[1];
    else if (pendingComment) { token.$description = pendingComment; pendingComment = ''; }
    groups[current].tokens[name] = token;
    byName[name] = { group: current, token };
  });
}
// resolve var() references into path references and inherit their type
for (const [name, { token }] of Object.entries(byName)) {
  token.$value = token.$value.replace(/var\(--([a-z0-9-]+)\)/g, (_, ref) => `{${byName[ref].group}.${ref}}`);
  if (token.$type === null) {
    const first = token.$value.match(/\{[a-z]+\.([a-z0-9-]+)\}/)[1];
    token.$type = byName[first].token.$type;
  }
}
const out = { $extensions: { 'cristian-vega': { version: '1.2.0', date: new Date().toISOString().slice(0, 10) } } };
for (const [g, { $description, tokens }] of Object.entries(groups)) out[g] = { $description, ...tokens };
writeFileSync('tokens.json', JSON.stringify(out, null, 2) + '\n');
console.log(Object.keys(byName).length, 'tokens written');
```

- [ ] **Step 5: Run the extraction and the test**

Run: `node build/extract-once.mjs && npm test`
Expected: `158 tokens written`, then all three tests pass. If the count is not 158, print the names that differ:

```bash
node -e "const t=require('./tokens.json');const n=[];(function w(o){for(const[k,v]of Object.entries(o)){if(k.startsWith('$'))continue;if(v&&v.\$value!==undefined)n.push(k);else if(v&&typeof v==='object')w(v)}})(t);console.log(n.length)"
```

- [ ] **Step 6: Read tokens.json once by eye**

Open `tokens.json`. Confirm: `font-display` is `fontFamily`; `fs-display-xl` is `expression` with the `clamp()`; `grad` is `expression`; `focus-paper` is `border` with `{color.crimson}` inside; `signal` is `color` with `$value` `{color.crimson}`; `lh-body` is `number`; `dur-press` is `duration`; `ease-lift` is `cubicBezier`; `shadow-1` is `shadow`. Fix any wrong `$type` by hand in the file. Re-run `npm test`.

- [ ] **Step 7: Verify the sheet did not change**

Run: `git status --short`
Expected: only new files (`package.json`, `package-lock.json`, `tokens.json`, `build/extract-once.mjs`, `checks/tokens.test.mjs`). The sheet is unchanged.

- [ ] **Step 8: Remove the one-time script and commit**

```bash
git rm -q --cached build/extract-once.mjs 2>/dev/null; rm build/extract-once.mjs
git add -A
git commit -m "Add package.json and extract the 158 product tokens into tokens.json

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: The Style Dictionary build writes dist/tokens.css

**Files:**
- Create: `build/config.mjs`
- Create: `dist/tokens.css` (generated, committed)
- Test: `checks/build.test.mjs`

**Interfaces:**
- Consumes: `tokens.json` from Task 2.
- Produces: `export const config`, `export async function build(buildPath = 'dist/')` in `build/config.mjs`. `build()` writes `<buildPath>tokens.css`. Task 6 calls `build(tempDir)`.
- Produces: `dist/tokens.css` with the shape `:root {\n  --name: value; /* description */\n  …\n}`. A reference is written as `var(--name)`.

- [ ] **Step 1: Write the failing test**

`checks/build.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from '../build/config.mjs';

test('the build writes one declaration per token, references as var(), descriptions as comments', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'ds-build-'));
  try {
    await build(dir + '/');
    const css = readFileSync(join(dir, 'tokens.css'), 'utf8');
    const decls = [...css.matchAll(/^\s*--([a-z0-9-]+):\s*([^;]+);/gm)];
    assert.equal(decls.length, 158);
    assert.ok(css.startsWith(':root {'), 'starts with :root');
    assert.match(css, /^\s*--fs-ui: 13px; \/\* the console ground: controls, menus, messages, row titles \*\/$/m);
    assert.match(css, /^\s*--signal: var\(--crimson\);/m, 'a reference is written as var()');
    assert.match(css, /^\s*--focus-paper: 2px solid var\(--crimson\);/m, 'a reference inside a longer value is written as var()');
    assert.match(css, /^\s*--fs-display-xl: clamp\(38px, 4\.9vw, 60px\);/m, 'an expression is copied as written');
    assert.doesNotMatch(css, /version|Do not edit/, 'no file header, no metadata');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL with `Cannot find module … build/config.mjs`.

- [ ] **Step 3: Write build/config.mjs**

```js
import { pathToFileURL } from 'node:url';
import StyleDictionary from 'style-dictionary';

// The custom property is named after the token key, the last segment of the path.
StyleDictionary.registerTransform({
  name: 'name/key',
  type: 'name',
  transform: (token) => token.path.at(-1),
});

export const config = {
  usesDtcg: true,
  source: ['tokens.json'],
  platforms: {
    css: {
      transforms: ['name/key'],
      buildPath: 'dist/',
      files: [{
        destination: 'tokens.css',
        format: 'css/variables',
        options: { outputReferences: true, showFileHeader: false },
      }],
    },
  },
};

export async function build(buildPath = 'dist/') {
  const sd = new StyleDictionary({
    ...config,
    platforms: { css: { ...config.platforms.css, buildPath } },
    log: { verbosity: 'silent' },
  });
  await sd.buildAllPlatforms();
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await build();
  console.log('wrote dist/tokens.css');
}
```

Only the `name/key` transform runs. No color, size, or font transform touches a value, so every value stays exactly as written in the token file.

- [ ] **Step 4: Run the test**

Run: `npm test`
Expected: PASS. Two possible failures and their fixes:
- If `--focus-paper` comes out as `2px solid #D42A3C`, this Style Dictionary version does not keep a reference inside a longer value. Change that token in `tokens.json` to `{"$type": "expression", "$value": "2px solid var(--crimson)"}`, do the same for `focus-ink`, and change the test's expectation to match. Record the decision in `CHANGELOG.md` in Task 6.
- If the description comment is missing, add `commentStyle: 'short'` under `options.formatting` in the file entry and run again.

- [ ] **Step 5: Build dist and inspect**

Run: `node build/config.mjs && head -5 dist/tokens.css && grep -c -- '--' dist/tokens.css`
Expected: `wrote dist/tokens.css`, the file starts with `:root {`, and the count is 158 or more (a reference line counts twice).

- [ ] **Step 6: Commit**

```bash
git add build/config.mjs dist/tokens.css checks/build.test.mjs
git commit -m "Build dist/tokens.css from tokens.json with Style Dictionary

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Markers in the sheet and the inject script

**Files:**
- Modify: `cristian-vega-design-system.html` (four marker pairs, by hand, once)
- Create: `build/lib.mjs`, `build/inject.mjs`
- Test: `checks/lib.test.mjs`

**Interfaces:**
- Consumes: `dist/tokens.css` from Task 3; `tokens.json`; `icons/` (absent until Task 15; the sprite region is then empty).
- Produces in `build/lib.mjs`:
  - `findRegion(text, name, kind)` → `{ start, end }` where `kind` is `'css'` or `'html'`; throws `Error('marker build:<name>: missing | duplicate | reversed')`.
  - `replaceRegion(text, name, kind, content)` → text with the content between the markers replaced.
  - `renderTokenRegion(tokensCss, tokens)` → the lines for the `:root` region, four-space indented, with a group comment before each group.
  - `renderTokenBlock(regionText)` → the marked-up copy for the `<pre>`: values in `<i>`, comments in `<em>`.
  - `renderGroundContract(stylesheet)` → the ground rules copied from the stylesheet, two-space de-indented, escaped, comments in `<em>`.
  - `renderIconSprite(files)` → `<svg hidden aria-hidden="true">…</svg>` from `[{ name, body }]`.
  - `stampVersion(text, version, date)` → text with both version stamps replaced; throws if the count is not 2.
  - `inject({ sheet, tokensCss, tokens, icons })` → the new sheet text.
- Task 6 reuses every function above to compute the expected sheet without writing it.

- [ ] **Step 1: Put the four marker pairs into the sheet**

In the stylesheet, directly after the line `  :root {`, add a line `    /* build:tokens */`. Directly before the line that starts with `    /* documentation chrome · light.`, add a line `    /* /build:tokens */`.

In the Adoption band, find `<pre class="d-code">:root {`. Replace `<pre class="d-code">` on that line with `<pre class="d-code"><!-- build:token-block -->`, and replace the `</pre>` that closes that block with `<!-- /build:token-block --></pre>`.

Find the second `<pre class="d-code">`, the one that starts with `<em>/* A ground sets these names.`. After the closing `*/</em>` of that intro comment, add a new line `<!-- build:ground-contract -->`. Directly before the line `<em>/* deep is ink with a deeper background.` add a line `<!-- /build:ground-contract -->`.

Directly after `<body>` add a line `<!-- build:icons --><!-- /build:icons -->`.

Run: `grep -c 'build:tokens\|build:token-block\|build:ground-contract\|build:icons' cristian-vega-design-system.html`
Expected: `8`

- [ ] **Step 2: Write the failing tests**

`checks/lib.test.mjs`:

```js
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
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npm test`
Expected: FAIL with `Cannot find module … build/lib.mjs`.

- [ ] **Step 4: Write build/lib.mjs**

```js
const MARK = {
  css: (n) => [`/* build:${n} */`, `/* /build:${n} */`],
  html: (n) => [`<!-- build:${n} -->`, `<!-- /build:${n} -->`],
};

export function findRegion(text, name, kind) {
  const [open, close] = MARK[kind](name);
  const count = (s) => text.split(s).length - 1;
  if (count(open) === 0 || count(close) === 0) throw new Error(`marker build:${name}: missing`);
  if (count(open) > 1 || count(close) > 1) throw new Error(`marker build:${name}: duplicate`);
  const start = text.indexOf(open) + open.length;
  const end = text.indexOf(close);
  if (end < start) throw new Error(`marker build:${name}: reversed`);
  return { start, end };
}

export function replaceRegion(text, name, kind, content) {
  const { start, end } = findRegion(text, name, kind);
  return text.slice(0, start) + content + text.slice(end);
}

export function walkTokens(tokens) {
  const groups = [];
  for (const [g, node] of Object.entries(tokens)) {
    if (g.startsWith('$')) continue;
    const keys = Object.keys(node).filter((k) => !k.startsWith('$'));
    groups.push({ name: g, description: node.$description ?? '', keys });
  }
  return groups;
}

export function renderTokenRegion(tokensCss, tokens) {
  const lines = new Map();
  for (const m of tokensCss.matchAll(/^\s*(--([a-z0-9-]+):.*)$/gm)) lines.set(m[2], m[1].trimEnd());
  let out = '\n';
  for (const group of walkTokens(tokens)) {
    if (group.description) out += `    /* ${group.description} */\n`;
    for (const key of group.keys) {
      if (!lines.has(key)) throw new Error(`--${key} is not in tokens.css`);
      out += `    ${lines.get(key)}\n`;
    }
  }
  return out;
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function renderTokenBlock(regionText) {
  const out = [':root {'];
  for (const raw of regionText.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('/*')) { out.push(`  <em>${esc(line)}</em>`); continue; }
    const m = line.match(/^(--[a-z0-9-]+):\s*(.*?);(\s*\/\*.*\*\/)?$/);
    if (!m) throw new Error(`cannot mark up: ${line}`);
    const value = m[2].startsWith('var(') ? esc(m[2]) : `<i>${esc(m[2])}</i>`;
    const comment = m[3] ? ` <em>${esc(m[3].trim())}</em>` : '';
    out.push(`  ${m[1]}: ${value};${comment}`);
  }
  out.push('}');
  return out.join('\n');
}

export function renderGroundContract(stylesheet) {
  const start = stylesheet.indexOf('  .g { background');
  const end = stylesheet.indexOf('  .mono {');
  if (start < 0 || end < 0) throw new Error('ground rules not found in the stylesheet');
  const skip = ['  .g * { box-sizing: border-box; }', '  .g h1, .g h2, .g h3, .g h4 {'];
  const lines = stylesheet.slice(start, end).split('\n').filter((l) => l.trim() && !skip.some((s) => l.startsWith(s)));
  return esc(lines.map((l) => l.replace(/^  /, '')).join('\n')).replace(/\/\*.*?\*\//g, (c) => `<em>${c}</em>`) + '\n';
}

export function renderIconSprite(files) {
  const symbols = files.map(({ name, body }) =>
    `<symbol id="i-${name}" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${body.trim()}</symbol>`);
  return `<svg hidden aria-hidden="true">${symbols.join('')}</svg>`;
}

export function stampVersion(text, version, date) {
  const re = /v\d+(?:\.\d+)* · \d{4}-\d{2}-\d{2}/g;
  const n = (text.match(re) ?? []).length;
  if (n !== 2) throw new Error(`expected 2 version stamps, found ${n}`);
  return text.replace(re, `v${version} · ${date}`);
}

export function inject({ sheet, tokensCss, tokens, icons }) {
  let out = sheet;
  const region = renderTokenRegion(tokensCss, tokens);
  out = replaceRegion(out, 'tokens', 'css', region);
  out = replaceRegion(out, 'token-block', 'html', renderTokenBlock(region));
  const styleStart = out.indexOf('<style>');
  const styleEnd = out.indexOf('</style>');
  out = replaceRegion(out, 'ground-contract', 'html', '\n' + renderGroundContract(out.slice(styleStart, styleEnd)));
  out = replaceRegion(out, 'icons', 'html', renderIconSprite(icons));
  const { version, date } = tokens.$extensions['cristian-vega'];
  return stampVersion(out, version, date);
}
```

- [ ] **Step 5: Write build/inject.mjs**

```js
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { inject } from './lib.mjs';

export function readInputs(root = '.') {
  const sheet = readFileSync(`${root}/cristian-vega-design-system.html`, 'utf8');
  const tokensCss = readFileSync(`${root}/dist/tokens.css`, 'utf8');
  const tokens = JSON.parse(readFileSync(`${root}/tokens.json`, 'utf8'));
  const dir = `${root}/icons`;
  const icons = existsSync(dir)
    ? readdirSync(dir).filter((f) => f.endsWith('.svg')).sort().map((f) => ({ name: f.slice(0, -4), body: readFileSync(`${dir}/${f}`, 'utf8') }))
    : [];
  return { sheet, tokensCss, tokens, icons };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const inputs = readInputs();
  const next = inject(inputs);
  if (next !== inputs.sheet) writeFileSync('cristian-vega-design-system.html', next);
  console.log(next === inputs.sheet ? 'sheet unchanged' : 'wrote cristian-vega-design-system.html');
}
```

- [ ] **Step 6: Run the tests**

Run: `npm test`
Expected: PASS for `lib.test.mjs`, `build.test.mjs`, `tokens.test.mjs`.

- [ ] **Step 7: Run the build and inspect the diff**

Run: `npm run build && git diff --stat`
Expected: `wrote dist/tokens.css`, `wrote cristian-vega-design-system.html`, and the diff touches only the sheet. Then:

Run: `git diff cristian-vega-design-system.html | grep '^[-+]' | grep -v -E '^(\+\+\+|---)' | grep -v -E '^\+\s*(--|/\*|<em>|<i>|:root|}|  --|<!--|<svg)|^-\s*(--|/\*|<em>|  --|:root|})' | head`
Expected: only the two version lines (`v1.1 · 2026-09-15` → `v1.2.0 · <date>`) and the ground contract lines. Every other changed line is a token declaration, a comment, or a marked-up copy.

- [ ] **Step 8: Run the build again to confirm it is stable**

Run: `npm run build && git status --short`
Expected: `sheet unchanged`, and the status shows the same modified files as before with no new change.

- [ ] **Step 9: Screenshots of the Adoption band**

Open the sheet at 1280 pixels wide, scroll to "The token block", and take a screenshot in light and in dark (`data-theme="dark"` on `<html>`), then one at 400 pixels wide. Confirm the token block reads as before: comments dimmed, values highlighted. Keep the screenshots outside the repository.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "Add build markers to the sheet and the inject script that fills them

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: The markup, inventory, and contrast checks

**Files:**
- Create: `checks/markup.mjs`, `checks/inventory.mjs`, `checks/exceptions.json`, `checks/contrast.mjs`, `checks/run.sh`
- Test: `checks/markup.test.mjs`, `checks/inventory.test.mjs`, `checks/contrast.test.mjs`
- Reference: `docs/reference/inventory.py`, `docs/reference/contrast.py` (the Python originals; delete them in Task 6)

**Interfaces:**
- Produces: each check exports a pure function and, when run directly, prints findings and exits 1 on any finding.
  - `checkMarkup(html)` → `string[]` of problems.
  - `checkInventory(css, exceptions)` → `string[]` of problems; `exceptions` is the parsed `exceptions.json`.
  - `resolve(tokens)` → `Map<key, resolvedValue>` with every `{path}` reference replaced by the referenced value.
  - `contrast(fg, bg)` → number; `checkContrast(tokens, pairs)` → `string[]` of problems.
- Consumes: `tokens.json`; the sheet.

- [ ] **Step 1: Write the failing markup test**

`checks/markup.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkMarkup } from './markup.mjs';

test('balanced markup passes, an unclosed tag fails, void elements are ignored', () => {
  assert.deepEqual(checkMarkup('<div><p>a<br><img src="x"></p></div>'), []);
  assert.deepEqual(checkMarkup('<div><p>a</div>'), ['unclosed <p> at line 1']);
  assert.deepEqual(checkMarkup('</p>'), ['stray </p> at line 1']);
});
```

- [ ] **Step 2: Write checks/markup.mjs**

```js
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

export function checkMarkup(html) {
  const problems = [];
  const stack = [];
  const text = html.replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, ' '))
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, (c) => c.replace(/[^\n]/g, ' '));
  const line = (i) => text.slice(0, i).split('\n').length;
  for (const m of text.matchAll(/<\/?([a-zA-Z][a-zA-Z0-9-]*)(?:\s[^<>]*?)?\/?>/g)) {
    const tag = m[1].toLowerCase();
    if (m[0].startsWith('</')) {
      const i = stack.lastIndexOf(tag);
      if (i < 0) { problems.push(`stray </${tag}> at line ${line(m.index)}`); continue; }
      while (stack.length > i + 1) problems.push(`unclosed <${stack.pop()}> at line ${line(m.index)}`);
      stack.pop();
    } else if (!VOID.has(tag) && !m[0].endsWith('/>')) {
      stack.push(tag);
    }
  }
  for (const tag of stack) problems.push(`unclosed <${tag}> at end of file`);
  return problems;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const problems = checkMarkup(readFileSync('cristian-vega-design-system.html', 'utf8'));
  for (const p of problems) console.error('markup:', p);
  console.log(problems.length ? `markup: ${problems.length} problem(s)` : 'markup: ok');
  process.exit(problems.length ? 1 : 0);
}
```

Run: `npm test` → the markup test passes. Then run: `node checks/markup.mjs` → `markup: ok`.

- [ ] **Step 3: Write the failing inventory test**

`checks/inventory.test.mjs`:

```js
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
```

- [ ] **Step 4: Write checks/inventory.mjs and exceptions.json**

`checks/inventory.mjs`:

```js
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// Scope: rules after the "3. Components" comment. A finding is a pixel value in a spacing property
// or a color literal in any property. Element geometry (width, height, min/max sizes) is not spacing
// and is not checked. A 1px line, a 50% circle, and a 0 are never findings.
const SPACING = /^(padding|margin|gap|row-gap|column-gap|top|left|right|bottom|inset|outline-offset|scroll-margin|scroll-padding)/;
const NAMED = /\b(red|blue|green|black|white)\b/; // transparent, currentColor, and inherit are not colors

function rules(css) {
  const start = css.indexOf('3. Components');
  const body = start < 0 ? css : css.slice(start);
  const out = [];
  let depth = 0, sel = '', decl = '', inRule = false;
  for (const ch of body.replace(/\/\*[\s\S]*?\*\//g, '')) {
    if (ch === '{') { depth++; if (depth === 1) { inRule = true; } else if (depth === 2) { sel = decl.trim(); decl = ''; inRule = true; } continue; }
    if (ch === '}') { if (inRule && decl.trim()) out.push({ sel: (sel || decl).trim(), decl }); depth--; sel = ''; decl = ''; inRule = false; continue; }
    if (depth === 0) sel += ch; else decl += ch;
  }
  return out;
}

function matches(exc, sel, prop, value) {
  const s = exc.selector.endsWith('*') ? sel.startsWith(exc.selector.slice(0, -1)) : sel === exc.selector;
  return s && (exc.property === '*' || exc.property === prop) && (exc.value === '*' || exc.value === value);
}

export function checkInventory(css, exceptions) {
  const problems = [];
  for (const { sel, decl } of rules(css)) {
    for (const d of decl.split(';')) {
      const i = d.indexOf(':'); if (i < 0) continue;
      const prop = d.slice(0, i).trim(), value = d.slice(i + 1).trim();
      if (prop.startsWith('--')) continue;
      const stripped = value.replace(/var\([^)]*\)/g, '').replace(/\b1px\b/g, '').replace(/\b50%/g, '');
      const findings = [];
      if (SPACING.test(prop) && /\d\.?\d*px/.test(stripped)) findings.push('raw pixel');
      if (/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(stripped) || NAMED.test(stripped)) findings.push('raw color');
      for (const kind of findings) {
        if (exceptions.allow.some((e) => matches(e, sel, prop, value))) continue;
        problems.push(`${sel} { ${prop}: ${value} } ${kind}`);
      }
    }
  }
  return problems;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const html = readFileSync('cristian-vega-design-system.html', 'utf8');
  const css = html.slice(html.indexOf('<style>') + 7, html.indexOf('</style>'));
  const exceptions = JSON.parse(readFileSync(new URL('./exceptions.json', import.meta.url), 'utf8'));
  const problems = checkInventory(css, exceptions);
  for (const p of problems) console.error('inventory:', p);
  console.log(problems.length ? `inventory: ${problems.length} finding(s)` : 'inventory: ok');
  process.exit(problems.length ? 1 : 0);
}
```

`checks/exceptions.json`, with every entry carrying a reason:

```json
{
  "allow": [
    { "selector": ".brand", "property": "gap", "value": "10px", "reason": "brand constant: the gap from the mark to the word, permanent" },
    { "selector": ".switch i::after", "property": "top", "value": "2px", "reason": "knob inset, element geometry, permanent" },
    { "selector": ".switch i::after", "property": "left", "value": "2px", "reason": "knob inset, element geometry, permanent" },
    { "selector": ".tool.is-open + .code", "property": "margin-top", "value": "-1px", "reason": "hides the shared border under an open tool row, permanent" },
    { "selector": ".lights i:nth-child(1)", "property": "background", "value": "#FF5F57", "reason": "macOS system color, drawn by the system in the apps, permanent" },
    { "selector": ".lights i:nth-child(2)", "property": "background", "value": "#FEBC2E", "reason": "macOS system color, permanent" },
    { "selector": ".lights i:nth-child(3)", "property": "background", "value": "#28C840", "reason": "macOS system color, permanent" },
    { "selector": ".wire*", "property": "*", "value": "*", "reason": "wireframe illustration geometry, permanent" },
    { "selector": ".d-mast::before", "property": "*", "value": "*", "reason": "mask geometry uses #000 as a stop, not a color, permanent" },
    { "selector": ".d-band::before", "property": "*", "value": "*", "reason": "mask geometry, permanent" }
  ]
}
```

Run: `npm test` → the inventory tests pass. Then run: `node checks/inventory.mjs`. Expected: `inventory: ok`. If it lists findings, read each one: a finding that is element geometry or a decided constant gets an entry with a reason; anything else is a real leftover and gets fixed in the sheet with a token. Do not add an entry without a reason.

- [ ] **Step 5: Write the failing contrast test**

`checks/contrast.test.mjs`:

```js
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
```

- [ ] **Step 6: Write checks/contrast.mjs**

The pairs list names tokens, never hex. The first list holds every pair the sheet relies on today. Change 2 adds the six boundary pairs.

```js
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function parse(c) {
  c = c.trim();
  if (c.startsWith('#')) {
    let h = c.slice(1); if (h.length === 3) h = [...h].map((x) => x + x).join('');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1];
  }
  const m = c.match(/rgba?\(([^)]*)\)/);
  if (!m) throw new Error(`not a color: ${c}`);
  const p = m[1].split(',').map((x) => parseFloat(x));
  return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
}
export const over = (fg, bg) => { const [r, g, b, a] = parse(fg); const [R, G, B] = parse(bg); return [r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a), 1]; };
const lum = ([r, g, b]) => { const ch = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b); };
export function contrast(fg, bg, ground = bg) {
  const bgc = over(bg, ground); const fgc = over(fg, `rgba(${bgc[0]},${bgc[1]},${bgc[2]},1)`);
  const [l1, l2] = [lum(fgc), lum(bgc)];
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function resolve(tokens) {
  const byPath = new Map(), byKey = new Map();
  (function walk(node, path) {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$')) continue;
      if (v && typeof v === 'object' && '$value' in v) { byPath.set([...path, k].join('.'), v.$value); byKey.set(k, [...path, k].join('.')); }
      else if (v && typeof v === 'object') walk(v, [...path, k]);
    }
  })(tokens, []);
  const value = (p, depth = 0) => {
    if (depth > 10) throw new Error(`reference loop at ${p}`);
    return byPath.get(p).replace(/\{([^}]+)\}/g, (_, ref) => { if (!byPath.has(ref)) throw new Error(`missing reference {${ref}}`); return value(ref, depth + 1); });
  };
  const out = new Map();
  for (const [k, p] of byKey) out.set(k, value(p));
  return out;
}

// fg, bg, and the optional ground are token keys. A tint (rgba) composites over the ground first.
export const PAIRS = [
  { fg: 'fg', bg: 'paper', purpose: 'body text on paper', limit: 4.5 },
  { fg: 'fg', bg: 'panel', purpose: 'body text on panel', limit: 4.5 },
  { fg: 'muted', bg: 'paper', purpose: 'muted text on paper', limit: 4.5 },
  { fg: 'muted', bg: 'surface', purpose: 'muted text on surface', limit: 4.5 },
  { fg: 'muted', bg: 'surface-2', purpose: 'muted text on surface-2', limit: 4.5 },
  { fg: 'meta', bg: 'paper', purpose: 'meta text on paper', limit: 4.5 },
  { fg: 'meta', bg: 'surface', purpose: 'meta text on surface', limit: 4.5 },
  { fg: 'meta', bg: 'panel', purpose: 'meta text on panel', limit: 4.5 },
  { fg: 'meta', bg: 'raise', ground: 'paper', purpose: 'meta text on the raised tint', limit: 4.5 },
  { fg: 'crimson', bg: 'paper', purpose: 'links on paper', limit: 4.5 },
  { fg: 'crimson', bg: 'surface', purpose: 'links on surface', limit: 4.5 },
  { fg: 'crimson', bg: 'surface-2', purpose: 'gate evidence links on surface-2', limit: 4.5 },
  { fg: 'crimson-dark', bg: 'ember-bg', ground: 'paper', purpose: 'live chip text on paper', limit: 4.5 },
  { fg: 'signal-fg', bg: 'crimson', purpose: 'text on the signal fill', limit: 4.5 },
  { fg: 'signal-fg', bg: 'crimson-dark', purpose: 'text on the signal fill, hover', limit: 4.5 },
  { fg: 'teal', bg: 'teal-bg', purpose: 'done chip text', limit: 4.5 },
  { fg: 'teal', bg: 'paper', purpose: 'teal text on paper', limit: 4.5 },
  { fg: 'teal', bg: 'surface-2', purpose: 'act done state on surface-2', limit: 4.5 },
  { fg: 'amber', bg: 'amber-bg', purpose: 'needs-you chip text', limit: 4.5 },
  { fg: 'amber', bg: 'surface-2', purpose: 'act needs-you state on surface-2', limit: 4.5 },
  { fg: 'red', bg: 'paper', purpose: 'danger button text on paper', limit: 4.5 },
  { fg: 'red', bg: 'red-bg', ground: 'paper', purpose: 'failed chip text', limit: 4.5 },
  { fg: 'tag-slate', bg: 'tag-slate-bg', purpose: 'slate tag text', limit: 4.5 },
  { fg: 'tag-muted', bg: 'tag-muted-bg', purpose: 'muted tag text', limit: 4.5 },
  { fg: 'mast-text', bg: 'ink', purpose: 'text on ink', limit: 4.5 },
  { fg: 'mast-muted', bg: 'ink', purpose: 'muted text on ink', limit: 4.5 },
  { fg: 'mast-meta', bg: 'ink', purpose: 'meta text on ink', limit: 4.5 },
  { fg: 'mast-meta', bg: 'ink-2', purpose: 'meta text on the raised ink surface', limit: 4.5 },
  { fg: 'mast-meta', bg: 'ink-well', purpose: 'meta text in a well', limit: 4.5 },
  { fg: 'peach-2', bg: 'ink', purpose: 'links on ink', limit: 4.5 },
  { fg: 'peach', bg: 'ember-bg', ground: 'ink', purpose: 'live chip text on ink', limit: 4.5 },
  { fg: 'teal-on-ink', bg: 'teal-bg-on-ink', ground: 'ink', purpose: 'done chip text on ink', limit: 4.5 },
  { fg: 'amber-on-ink', bg: 'amber-bg-on-ink', ground: 'ink', purpose: 'needs-you chip text on ink', limit: 4.5 },
  { fg: 'red-on-ink', bg: 'red-bg-on-ink', ground: 'ink', purpose: 'failed chip text on ink', limit: 4.5 },
  { fg: 'tag-slate-on-ink', bg: 'tag-slate-bg-on-ink', ground: 'ink', purpose: 'slate tag text on ink', limit: 4.5 },
  { fg: 'tag-muted-on-ink', bg: 'tag-muted-bg-on-ink', ground: 'ink', purpose: 'muted tag text on ink', limit: 4.5 },
  { fg: 'code-text', bg: 'code-bg', purpose: 'code text', limit: 4.5 },
  { fg: 'code-accent', bg: 'code-bg', purpose: 'code values', limit: 4.5 },
  { fg: 'ember', bg: 'ink', purpose: 'focus ring on ink', limit: 3 },
  { fg: 'crimson', bg: 'paper', purpose: 'focus ring on paper', limit: 3 },
  { fg: 'mast-line-strong', bg: 'ink', purpose: 'strong line on ink as a boundary', limit: 3 },
];

export function checkContrast(tokens, pairs = PAIRS) {
  const v = resolve(tokens);
  const problems = [];
  for (const p of pairs) {
    for (const k of [p.fg, p.bg, p.ground].filter(Boolean)) if (!v.has(k)) throw new Error(`unknown token ${k}`);
    const ratio = contrast(v.get(p.fg), v.get(p.bg), p.ground ? v.get(p.ground) : v.get(p.bg));
    if (ratio < p.limit) problems.push(`${p.fg} on ${p.bg} (${p.purpose}): ${ratio.toFixed(2)} < ${p.limit}`);
  }
  return problems;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const tokens = JSON.parse(readFileSync('tokens.json', 'utf8'));
  const problems = checkContrast(tokens);
  for (const p of problems) console.error('contrast:', p);
  console.log(problems.length ? `contrast: ${problems.length} pair(s) under the limit` : `contrast: ok, ${PAIRS.length} pairs`);
  process.exit(problems.length ? 1 : 0);
}
```

Run: `npm test` → the contrast tests pass. Run: `node checks/contrast.mjs` → `contrast: ok, 41 pairs`. If a pair fails, the token value or the pair is wrong; fix the value in `tokens.json`, never the limit.

- [ ] **Step 7: Write checks/run.sh**

```bash
#!/bin/sh
# The one command. Exits 1 on the first failing step.
set -e
cd "$(dirname "$0")/.."
npm run --silent check
```

Run: `chmod +x checks/run.sh && checks/run.sh`
Expected: the tests pass, then `inventory: ok`, `contrast: ok, 41 pairs`, `markup: ok`, and a failure at `node checks/drift.mjs` because it does not exist yet. That failure is expected until Task 6.

- [ ] **Step 8: Commit**

```bash
git add checks/ 
git commit -m "Add the markup, inventory, and contrast checks with their tests

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: The drift check, the fault proofs, and the first green run

**Files:**
- Create: `checks/drift.mjs`, `checks/drift.test.mjs`, `CHANGELOG.md`
- Delete: `docs/reference/inventory.py`, `docs/reference/contrast.py`

**Interfaces:**
- Consumes: `build(buildPath)` from `build/config.mjs`; `readInputs(root)` from `build/inject.mjs`; `inject`, `walkTokens` from `build/lib.mjs`.
- Produces: `checkDrift(root)` → `string[]` of problems, without writing inside `root`.

- [ ] **Step 1: Write the failing test**

`checks/drift.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checkDrift, validateTokens } from './drift.mjs';

const ROOT = new URL('..', import.meta.url).pathname;
function copyRepo() {
  const dir = mkdtempSync(join(tmpdir(), 'ds-drift-'));
  for (const f of ['cristian-vega-design-system.html', 'tokens.json', 'dist', 'icons', 'build']) {
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

test('an edited dist/tokens.css is drift', async () => {
  const dir = copyRepo();
  try {
    writeFileSync(join(dir, 'dist/tokens.css'), '/* stale */\n');
    const problems = await checkDrift(dir);
    assert.ok(problems.some((x) => x.startsWith('dist/tokens.css differs')));
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('validateTokens rejects a duplicate key and an unknown type', () => {
  assert.deepEqual(validateTokens({ a: { x: { $type: 'color', $value: '#000' } }, b: { x: { $type: 'color', $value: '#fff' } } }), ['duplicate key x']);
  assert.deepEqual(validateTokens({ a: { y: { $type: 'length', $value: '1px' } } }), ['y: unknown $type length']);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL with `Cannot find module … drift.mjs`.

- [ ] **Step 3: Write checks/drift.mjs**

```js
import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from '../build/config.mjs';
import { readInputs } from '../build/inject.mjs';
import { inject, findRegion } from '../build/lib.mjs';

const TYPES = new Set(['color', 'dimension', 'number', 'fontFamily', 'shadow', 'duration', 'cubicBezier', 'border', 'expression']);

export function validateTokens(tokens) {
  const problems = [], seen = new Set();
  (function walk(node) {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$')) continue;
      if (v && typeof v === 'object' && '$value' in v) {
        if (seen.has(k)) problems.push(`duplicate key ${k}`); seen.add(k);
        if (!TYPES.has(v.$type)) problems.push(`${k}: unknown $type ${v.$type}`);
      } else if (v && typeof v === 'object') walk(v);
    }
  })(tokens);
  return problems;
}

const REGIONS = [['tokens', 'css'], ['token-block', 'html'], ['ground-contract', 'html'], ['icons', 'html']];

export async function checkDrift(root = '.') {
  const problems = validateTokens(JSON.parse(readFileSync(join(root, 'tokens.json'), 'utf8')));
  if (problems.length) return problems;
  const tmp = mkdtempSync(join(tmpdir(), 'ds-fresh-'));
  try {
    process.chdir(root);
    await build(tmp + '/');
    const fresh = readFileSync(join(tmp, 'tokens.css'), 'utf8');
    const committed = readFileSync(join(root, 'dist/tokens.css'), 'utf8');
    if (fresh !== committed) problems.push('dist/tokens.css differs from a fresh build');
    const inputs = readInputs(root);
    const expected = inject({ ...inputs, tokensCss: fresh });
    for (const [name, kind] of REGIONS) {
      const a = findRegion(inputs.sheet, name, kind), b = findRegion(expected, name, kind);
      if (inputs.sheet.slice(a.start, a.end) !== expected.slice(b.start, b.end)) problems.push(`sheet region ${name} differs from a fresh build`);
    }
    const stamp = /v\d+(?:\.\d+)* · \d{4}-\d{2}-\d{2}/g;
    if ((inputs.sheet.match(stamp) ?? []).join() !== (expected.match(stamp) ?? []).join()) problems.push('version or date differs from tokens.json');
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  return problems;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const problems = await checkDrift(process.cwd());
  for (const p of problems) console.error('drift:', p);
  console.log(problems.length ? `drift: ${problems.length} problem(s)` : 'drift: ok');
  process.exit(problems.length ? 1 : 0);
}
```

`process.chdir(root)` is needed because Style Dictionary resolves `source: ['tokens.json']` from the working directory. The temporary folder is the only place the check writes.

- [ ] **Step 4: Run the tests**

Run: `npm test`
Expected: PASS for all test files.

- [ ] **Step 5: Prove the three faults fail and then restore**

```bash
cp cristian-vega-design-system.html /tmp/sheet.bak
sed -i '' 's/--fs-ui: 13px;/--fs-ui: 14px;/' cristian-vega-design-system.html; node checks/drift.mjs; echo "exit $?"
cp /tmp/sheet.bak cristian-vega-design-system.html
cp tokens.json /tmp/tokens.bak
node -e "const fs=require('fs');const t=JSON.parse(fs.readFileSync('tokens.json'));t.color.teal.\$value='#40A08A';fs.writeFileSync('tokens.json',JSON.stringify(t,null,2)+'\n')"; node checks/contrast.mjs; echo "exit $?"
cp /tmp/tokens.bak tokens.json
sed -i '' 's/  .btn { display: inline-flex; align-items: center; gap: var(--space-2);/  .btn { display: inline-flex; align-items: center; gap: 9px;/' cristian-vega-design-system.html; node checks/inventory.mjs; echo "exit $?"
cp /tmp/sheet.bak cristian-vega-design-system.html
git status --short
```

Expected: `exit 1` three times, each with one named finding, and `git status --short` shows no change afterwards.

- [ ] **Step 6: First green run**

Run: `checks/run.sh; echo "exit $?"`
Expected: every step prints `ok` and the last line is `exit 0`.

- [ ] **Step 7: Delete the Python references and write the change log**

```bash
git rm -q docs/reference/inventory.py docs/reference/contrast.py && rmdir docs/reference
```

`CHANGELOG.md`:

```markdown
# Change log

## 1.2.0 · in progress

### Change 1: source and checks
- The system lives in its own repository. The sheet is under version control.
- `tokens.json` holds the 158 product tokens. Style Dictionary 5.5.3 writes `dist/tokens.css`. `build/inject.mjs` writes four marked regions of the sheet.
- Five checks run with `checks/run.sh`: tests, inventory, contrast, markup, drift. They exit 1 on a fault and never write inside the repository.
- `checks/exceptions.json` lists every allowed raw value with a reason.

## 1.1 · 2026-09-15
- One type scale, one spacing scale, one radius scale, three elevations, tokenized motion and focus. Teal text moved to `#0A7A64` for contrast. Documented in the sheet's Adoption band.
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "Add the drift check, prove the checks catch faults, start the change log

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

**Change 1 is accepted when:** two builds in a row are identical (Task 4 Step 8), every existing value is preserved (Task 2 Step 5, Task 3 test), the three intentional faults fail their checks (Task 6 Step 5), and `checks/run.sh` exits 0.

---

## Change 2: current controls

### Task 7: `--g-line-control` on three grounds

**Files:**
- Modify: `tokens.json` (add `line-control` to the `color` group)
- Modify: `cristian-vega-design-system.html` (the two ground blocks; `.input`, `.select`, `.select:hover`, `.textarea`, `.check i`, `.radio i`, `.switch i`; the Inputs caption; the Contrast do list)
- Modify: `checks/contrast.mjs` (`PAIRS`)

**Interfaces:**
- Produces: the token `line-control` and the contract name `--g-line-control`, read by the six boundaries. Task 13 reads the rendered values.

- [ ] **Step 1: Take the "before" screenshots**

Open the sheet, scroll to the Inputs section, and screenshot it at 1280 pixels wide in light, at 1280 pixels wide in dark, and at 400 pixels wide. Keep them outside the repository as `before-inputs-*.png`.

- [ ] **Step 2: Choose the value with the contrast script**

```bash
node -e "
import('./checks/contrast.mjs').then(({ contrast }) => {
  const a = [0xC6, 0xCD, 0xD8], b = [0x5F, 0x69, 0x7B]; // from line-strong toward meta, same hue family
  for (let t = 0; t <= 1; t += 0.005) {
    const c = a.map((x, i) => Math.round(x + (b[i] - x) * t));
    const hex = '#' + c.map((x) => x.toString(16).padStart(2, '0')).join('').toUpperCase();
    if (contrast(hex, '#F1F3F6') >= 3 && contrast(hex, '#FFFFFF') >= 3) { console.log(hex, contrast(hex, '#F1F3F6').toFixed(2), contrast(hex, '#FFFFFF').toFixed(2)); break; }
  }
});"
```

Expected: one line, a hex near `#838C9B`, with both ratios at 3.00 or more. Use the printed hex below.

- [ ] **Step 3: Add the token**

In `tokens.json`, inside the `color` group after `line-strong`, add:

```json
"line-control": { "$type": "color", "$value": "<the printed hex>", "$description": "control boundary on paper and white, 3:1 or more; chosen by checks/contrast.mjs" }
```

- [ ] **Step 4: Add the pairs and run the contrast check**

In `checks/contrast.mjs`, add to `PAIRS`:

```js
  { fg: 'line-control', bg: 'paper', purpose: 'control boundary on paper', limit: 3 },
  { fg: 'line-control', bg: 'surface', purpose: 'control boundary on white', limit: 3 },
  { fg: 'line-control', bg: 'surface-2', purpose: 'control boundary on surface-2', limit: 3 },
```

In `checks/tokens.test.mjs` and `checks/build.test.mjs`, change the expected count from 158 to 159.

Run: `node checks/contrast.mjs && npm test`. Expected: `contrast: ok, 44 pairs` and all tests pass.

- [ ] **Step 5: Add the contract name and point the six boundaries at it**

In the stylesheet, in the `.g--paper, .g--surface {` block, after `--g-line-strong: var(--line-strong);` add ` --g-line-control: var(--line-control);`. In the `.g--ink, .code, …` block, after `--g-line-strong: var(--mast-line-strong);` add ` --g-line-control: var(--mast-line-strong);`.

Change these declarations:
- `.input { … border: 1px solid var(--g-line); …}` → `border: 1px solid var(--g-line-control);`
- `.textarea { … border: 1px solid var(--g-line); …}` → `border: 1px solid var(--g-line-control);`
- `.select { … border: 1px solid var(--g-line); …}` → `border: 1px solid var(--g-line-control);`
- `.select:hover { border-color: var(--g-line-strong); }` → `.select:hover { border-color: var(--g-fg); }`
- `.check i { … border: 1.5px solid var(--g-line-strong); …}` → `border: 1.5px solid var(--g-line-control);`
- `.radio i { … border: 1.5px solid var(--g-line-strong); …}` → `border: 1.5px solid var(--g-line-control);`
- `.switch i { … background: var(--g-line-strong); …}` → `background: var(--g-line-control);`

`.pop > .input { border-width: 0 0 1px; border-color: var(--g-hair); …}` stays: the filter field inside a popover is part of a picture (Task 8).

- [ ] **Step 6: Build and run the checks**

Run: `npm run build && checks/run.sh; echo "exit $?"`
Expected: the token region gains `--line-control`, the ground contract example gains `--g-line-control` on both grounds, and `exit 0`.

- [ ] **Step 7: Update the captions**

In the Inputs caption, replace `Focus: the border takes the focus color and a 3 px ring in <code>--g-ring</code>, crimson 12% on paper and ember 18% on ink.` with `The boundary reads <code>--g-line-control</code>: 3:1 or more on paper, on white, and on ink. Focus: the border takes the focus color and a 3 px ring in <code>--g-ring</code>, crimson 12% on paper and ember 18% on ink.`

In the Color section's Contrast do list, add after the "Meta on paper" item:

```html
<li class="do"><span class="vh">Do · </span><b>A control boundary at 3:1.</b> Input, select, textarea, check, radio, and the switch track read <code>--g-line-control</code>. Text buttons need no perimeter.</li>
```

- [ ] **Step 8: Take the "after" screenshots and stop for approval**

Screenshot the Inputs section at the same three sizes as Step 1. Show the user the before and after pairs. The task counts as done only after the user approves the look. If the user asks for a lighter or darker value, change `line-control` in `tokens.json`, run `node checks/contrast.mjs` (it must stay at 3:1 or more), rebuild, and show again.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "Give control boundaries a 3:1 line on every ground through --g-line-control

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: Composite widgets become pictures

Composite widgets need keyboard behavior the sheet does not implement. They become inert pictures, so no focusable element hides inside a presentational subtree when Task 9 converts buttons.

**Files:**
- Modify: `cristian-vega-design-system.html` (wrappers around the tabs, the theme menu, the three popovers, the palette, the sidebar, the note rows and palette rows, the transcript; the `.nav` links; captions)

**Interfaces:**
- Produces: the class `picture` on a `figure` with `role="img"`, `aria-label`, and `inert`. Task 9's converter skips everything inside `figure.picture`.

- [ ] **Step 1: Add the wrapper style**

In the stylesheet, after the `.spec--rows .spec__k` rule, add:

```css
  .picture { margin: 0; display: contents; }
```

`display: contents` keeps the layout of the frame exactly as it is; the figure only carries the role, the label, and `inert`.

- [ ] **Step 2: Wrap each composite specimen**

Wrap these elements, in both the paper frame and the ink frame where both exist:

| Specimen | Wrapper |
|---|---|
| `<div class="tabs">…</div>` | `<figure class="picture" role="img" aria-label="Segmented control: Session, Apps, Fleet, Audit" inert>…</figure>` |
| `<div class="menu">…</div>` (theme picker) and its `<div class="select is-open">` above it | one figure: `aria-label="Select with its menu open: Paper, Slate, Dusk"`; remove `is-open` from the select and give the select the open border in the picture with `data-state="open"` (see Step 3) |
| each `<div class="pop">` and `<div class="pop pop--bar">` | `aria-label="Popover: run target"`, `aria-label="Menu-bar popover, streaming"`, `aria-label="Menu-bar popover, ready"` |
| `<div class="pal">…</div>` | `aria-label="Command palette with two commands"` |
| `<div class="side side--specimen">…</div>` | `aria-label="Sidebar on ink-deep: teams, sessions, tags, spend meter"` |
| the two `<article class="row …">` and two `.pal-row` in the rows specimen | one figure per frame: `aria-label="Note rows and palette rows"` |
| `<div class="chatlog">…</div>` | `aria-label="Transcript with tool calls, a streaming turn, a stopped turn, and an error"` |
| the `<ol class="gates">` | `aria-label="Five publish gates"` |

The static pictures keep their `is-selected`, `is-active`, `is-open` classes: inside a picture they are illustration, not a production hook.

- [ ] **Step 3: Open-state picture for the select**

Replace `.input.is-focus, .textarea.is-focus, .select.is-open {` with `.input:focus-within, .textarea:focus-visible, .select:focus-within, .example[data-state="focus"] .input, .picture [data-state="open"].select {` and keep the declarations. Replace `.g--ink .input.is-focus, .g--ink .textarea.is-focus, .g--ink .select.is-open {` with `.g--ink .input:focus-within, .g--ink .textarea:focus-visible, .g--ink .select:focus-within, .g--ink .example[data-state="focus"] .input, .g--ink .picture [data-state="open"].select {`. Task 10 turns the remaining `.input` and `.textarea` specimens into real controls; the selectors are ready for them.

- [ ] **Step 4: Real links in the site nav**

Change the nav specimen to real links: `<div class="nav"><a class="is-active" href="#c-nav" aria-current="page">Thesis</a><a href="#c-nav">Demo</a><a href="#c-nav">Writing</a><a href="#c-nav">Projects</a></div>` in both frames. Add `.nav a[aria-current="page"]` to the `.nav a.is-active` selector so both spellings share one rule.

- [ ] **Step 5: Captions**

In the Navigation caption, after the tabs sentence `A segmented control has no rail.`, add: `The sheet shows the tabs as a picture. A product implements the keyboard behavior in the overlay table.` In the Inputs caption, after the menu sentences, add: `The sheet shows the menu as a picture.` In the Feedback caption, after the pal sentences, add: `The sheet shows the palette and the popovers as pictures.` In the Agent caption, add: `The sheet shows the transcript as a picture; a product implements the tool toggles.` In the Lists caption, add: `The sheet shows the sidebar and the rows as pictures.`

- [ ] **Step 6: Checks, screenshots, commit**

Run: `checks/run.sh; echo "exit $?"` → `exit 0`. Screenshot the Navigation, Inputs, Lists, Agent, and Feedback sections at the three sizes; nothing may look different from before except the nav links, which now underline on hover as links.

```bash
git add -A
git commit -m "Show composite widgets as inert pictures; make the site nav real links

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: Native buttons

**Files:**
- Modify: `cristian-vega-design-system.html` (every `span.btn`, `span.gbtn`, `span.icon-btn`, `span.menu-btn` outside a picture; the button reset; disabled rules; the Buttons caption)

**Interfaces:**
- Produces: `button.btn`, `button.gbtn`, `button.icon-btn`, `button.menu-btn` with `disabled` as the only disabled state. Task 13 tabs through them.

- [ ] **Step 1: Convert with a one-time script**

Save as `/tmp/buttons.mjs` (outside the repository) and run it from the repository root with `node /tmp/buttons.mjs`:

```js
import { readFileSync, writeFileSync } from 'node:fs';
let s = readFileSync('cristian-vega-design-system.html', 'utf8');
const CLASSES = ['btn', 'gbtn', 'icon-btn', 'menu-btn'];
// skip everything inside figure.picture
const pictures = [];
for (const m of s.matchAll(/<figure class="picture"[\s\S]*?<\/figure>/g)) pictures.push([m.index, m.index + m[0].length]);
const inPicture = (i) => pictures.some(([a, b]) => i >= a && i < b);
let out = '', i = 0, count = 0;
const open = /<span class="((?:btn|gbtn|icon-btn|menu-btn)(?:\s[^"]*)?)"([^>]*)>/g;
let m;
while ((m = open.exec(s))) {
  if (inPicture(m.index)) continue;
  // find the matching </span> by depth
  let depth = 1, j = open.lastIndex;
  const tag = /<\/?span\b[^>]*>/g; tag.lastIndex = j;
  let t;
  while ((t = tag.exec(s))) { depth += t[0].startsWith('</') ? -1 : 1; if (depth === 0) break; }
  const closeStart = t.index, closeEnd = tag.lastIndex;
  let cls = m[1].replace(/\s*\bis-disabled\b/, ''); const disabled = m[1].includes('is-disabled');
  let attrs = m[2].replace(/\s*role="img"/, '');
  const start = `<button type="button" class="${cls}"${attrs}${disabled ? ' disabled' : ''}>`;
  out += s.slice(i, m.index) + start + s.slice(open.lastIndex, closeStart) + '</button>';
  i = closeEnd; count++;
  open.lastIndex = closeEnd;
}
out += s.slice(i);
writeFileSync('cristian-vega-design-system.html', out);
console.log(count, 'buttons converted');
```

Expected: a count above 60, and `grep -c '<span class="btn' cristian-vega-design-system.html` counts only the buttons inside pictures.

- [ ] **Step 2: Reset and state rules**

In the stylesheet:
- `:where(.g) button { font: inherit; color: inherit; background: none; border: 0; cursor: default; text-align: left; }` → add `padding: 0; margin: 0;` and `cursor: pointer;` in place of `cursor: default;`.
- `.btn[disabled], .btn.is-disabled { opacity: var(--dim); }` and `.btn[disabled], .btn.is-disabled, .btn.is-waiting { pointer-events: none; }` → `.btn:disabled { opacity: var(--dim); }` and `.btn:disabled, .btn.is-waiting { pointer-events: none; }`.
- Remove `.g [disabled], .g .is-disabled { opacity: var(--dim); pointer-events: none; }` and add `.g button:disabled { opacity: var(--dim); pointer-events: none; }`.
- `.gbtn:hover`, `.icon-btn:hover`, `.menu-btn:hover` stay. Add `.gbtn:disabled, .icon-btn:disabled, .menu-btn:disabled { color: var(--g-muted); border-color: var(--g-line); transform: none; }` so a disabled toolbar button does not react.

- [ ] **Step 3: Caption**

In the Buttons caption, replace `<b>Disabled</b> · 45%, no hover, no pointer events. The attribute on a button, is-disabled on a link.` with `<b>Disabled</b> · the <code>disabled</code> attribute: 45%, no hover, no pointer events, and not in the tab order. A link is never disabled; remove it instead.` Add before `<b>Waiting</b>`: `Every button is a <code>button</code> element. An icon button carries <code>aria-label</code>.`

- [ ] **Step 4: Checks, screenshots, commit**

Run: `checks/run.sh; echo "exit $?"` → `exit 0`. Open the Buttons section: every button must look as before; press Tab through it: the focus ring appears on each enabled button and skips the disabled one. Screenshot at the three sizes.

```bash
git add -A
git commit -m "Make every button specimen a native button element

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 10: Native text fields, textareas, and selects

**Files:**
- Modify: `cristian-vega-design-system.html` (field specimens in the Inputs, Settings form, Permissions, ground test, and focus sections; `.input`, `.textarea`, `.select`, `.composer` rules; the Inputs caption)

**Interfaces:**
- Produces: `div.input > input`, `textarea.textarea`, `div.select > select + svg.ico`, with `label[for]`, `aria-describedby`, `aria-invalid="true"`, `disabled`, `readonly`.

- [ ] **Step 1: Field rules**

Add to the stylesheet, after the `.input` rule:

```css
  .input input { flex: 1; min-width: 0; border: 0; padding: 0; margin: 0; background: transparent; color: inherit; font: inherit; outline: none; }
  .input input::placeholder, .textarea::placeholder { color: var(--g-meta); font-family: var(--font-mono); font-size: var(--fs-meta); }
  .input:has(:disabled), .textarea:disabled, .select:has(:disabled) { opacity: var(--dim); pointer-events: none; }
  .input:has([aria-invalid="true"]), .textarea[aria-invalid="true"], .select:has([aria-invalid="true"]) { border-color: var(--g-red); }
  .select { position: relative; }
  .select select { flex: 1; min-width: 0; appearance: none; border: 0; padding: 0 var(--space-5) 0 0; margin: 0; background: transparent; color: inherit; font: inherit; outline: none; }
  .select .ico { position: absolute; right: var(--space-3); pointer-events: none; }
  .example { display: contents; }
```

Remove `.input.is-error, .textarea.is-error, .select.is-error { … }` and `.input.is-disabled, .textarea.is-disabled, .select.is-disabled { … }`. Change `.textarea { … }` to also carry `font-family: var(--font-body); resize: vertical;`.

- [ ] **Step 2: Convert the specimens**

Apply these edits in every frame that holds the specimen (paper and ink, and the surface frame in the ground test). Each `id` must be unique on the page: suffix `-p` in the paper frame, `-i` in the ink frame, `-s` on surface.

| Before | After |
|---|---|
| `<div class="field"><label>Workspace name</label><div class="input"><span>Billing tools</span></div><span class="field__hint">Every member sees this name.</span></div>` | `<div class="field"><label for="f-workspace-p">Workspace name</label><div class="input"><input id="f-workspace-p" value="Billing tools" aria-describedby="f-workspace-p-hint"></div><span class="field__hint" id="f-workspace-p-hint">Every member sees this name.</span></div>` |
| `<div class="field"><label>Spend cap</label><div class="input is-error"><span class="mono">$2,5oo</span></div><span class="field__err">Enter a number. Example: 2500.</span></div>` | `<div class="field"><label for="f-cap-p">Spend cap</label><div class="input"><input id="f-cap-p" class="mono" value="$2,5oo" aria-invalid="true" aria-describedby="f-cap-p-err"></div><span class="field__err" id="f-cap-p-err">Enter a number. Example: 2500.</span></div>` |
| `<div class="input"><svg…/><span class="ph">Search notes…</span><span class="kbd">⌘F</span></div>` | `<div class="input"><svg…/><input placeholder="Search notes…" aria-label="Search notes"><span class="kbd">⌘F</span></div>` |
| `<div class="input is-disabled"><span class="ph">Disabled</span></div>` | `<div class="input"><input placeholder="Disabled" aria-label="Disabled field" disabled></div>` |
| `<div class="field"><label>Note body</label><div class="textarea is-focus">Most of the documents in this vault were never typed.<span class="caret"></span></div><span class="field__hint field__hint--count">54 / 2,000</span></div>` | `<div class="field"><label for="f-body-p">Note body</label><textarea class="textarea" id="f-body-p" aria-describedby="f-body-p-count">Most of the documents in this vault were never typed.</textarea><span class="field__hint field__hint--count" id="f-body-p-count">54 / 2,000</span></div>` |
| `<div class="field"><label>Manifest</label><div class="textarea textarea--mono">name: …</div></div>` | `<div class="field"><label for="f-manifest-p">Manifest</label><textarea class="textarea textarea--mono" id="f-manifest-p">name: invoice-reconciler&#10;model: auto&#10;tools: [read, edit]</textarea></div>` |
| `<div class="textarea is-error"><span class="ph">Write the note body here…</span></div>` | `<textarea class="textarea" placeholder="Write the note body here…" aria-label="Note body" aria-invalid="true"></textarea>` |
| `<div class="textarea is-disabled"><span class="ph">Disabled</span></div>` | `<textarea class="textarea" placeholder="Disabled" aria-label="Disabled note body" disabled></textarea>` |
| `<div class="field"><label>Model</label><div class="select">auto → opus<svg…/></div><span class="field__hint">…</span></div>` | `<div class="field"><label for="f-model-p">Model</label><div class="select"><select id="f-model-p" aria-describedby="f-model-p-hint"><option>auto → opus</option><option>opus</option><option>haiku</option></select><svg…/></div><span class="field__hint" id="f-model-p-hint">…</span></div>` |
| the Theme select with its open menu | already a picture (Task 8); leave it |
| `<div class="composer"><div class="composer__field">Ask the agent to write a note…</div>…` | `<div class="composer"><textarea class="composer__field" placeholder="Ask the agent to write a note…" aria-label="Message to the agent"></textarea>…` and add `.composer__field { border: 0; padding: 0; background: transparent; resize: none; width: 100%; }` to the stylesheet |
| the secret field `<div class="field field--secret"><label>Anthropic key</label><div class="input"><span class="mono">••••••••••••7f3a</span><span class="rowx">…gbtn…</span></div></div>` | `<div class="field field--secret"><label for="f-key-p">Anthropic key</label><div class="input"><input id="f-key-p" class="mono" value="••••••••••••7f3a" readonly><span class="rowx">…the two buttons from Task 9…</span></div></div>` |
| the Turn limit `<div class="input"><span class="mono">12</span></div>` | `<div class="input"><input id="f-turns-p" class="mono" value="12" inputmode="numeric" aria-describedby="f-turns-p-hint"></div>` with `for` and `id` on the label and hint |
| the Permissions selects `<div class="select">Ask<svg…/></div>` | `<div class="select"><select id="f-mode-p" aria-describedby="f-mode-p-hint"><option>Ask</option><option>Allow in scope</option><option>Deny</option></select><svg…/></div>` |
| the focus demo `<div class="input input--specimen is-focus"><span class="ph">Search notes</span><span class="caret"></span></div>` | `<div class="example" data-state="focus"><div class="input input--specimen"><span class="ph">Search notes</span><span class="caret"></span></div></div>` (a marked example: it shows the ring without focus, and keeps the caret) |

The `.ph` and `.caret` classes stay for marked examples and pictures only. Add to their rules a comment: `/* used inside a marked example or a picture only */`.

- [ ] **Step 3: Caption**

Replace the field sentences at the start of the Inputs caption with: `<b>field</b> · a <code>label</code> with <code>for</code>, the control, then one hint or one error, each linked with <code>aria-describedby</code>. An error sets <code>aria-invalid="true"</code> and says what to enter. Disabled is the attribute; a disabled control is not in the tab order. A state the sheet cannot enter on its own, such as focus, shows inside a marked example.` Keep the rest of the caption.

- [ ] **Step 4: Checks, screenshots, commit**

Run: `checks/run.sh; echo "exit $?"` → `exit 0`. Open the Inputs, Settings form, and Permissions sections. Type into a field: the ring appears. Tab: the disabled field is skipped. The select opens its native list. Screenshot the three sections at the three sizes.

```bash
git add -A
git commit -m "Make text fields, textareas, and selects native controls with linked labels

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 11: Native switch, check, and radio

**Files:**
- Modify: `cristian-vega-design-system.html` (the toggle specimens in the Inputs, Settings form, and Permissions sections; `.switch`, `.check`, `.radio` rules; the caption)

- [ ] **Step 1: Rules**

Replace the `.switch.is-on i`, `.switch.is-on i::after`, `.check.is-on i`, `.check.is-on i::after`, `.radio.is-on i`, `.radio.is-on i::after` selectors with `:has(:checked)` forms, and add the hidden input and focus rules:

```css
  .switch input, .check input, .radio input { position: absolute; opacity: 0; width: 1px; height: 1px; margin: 0; pointer-events: none; }
  .switch, .check, .radio { position: relative; cursor: pointer; }
  .switch:has(:checked) i { background: var(--g-signal); }
  .switch:has(:checked) i::after { transform: translateX(12px); }
  .check:has(:checked) i { background: var(--g-signal); border-color: var(--g-signal); }
  .check:has(:checked) i::after { content: "✓"; }
  .radio:has(:checked) i { border-color: var(--g-signal); }
  .radio:has(:checked) i::after { content: ""; width: 8px; height: 8px; border-radius: 50%; background: var(--g-signal); }
  .switch:has(:disabled), .check:has(:disabled), .radio:has(:disabled) { opacity: var(--dim); pointer-events: none; }
  .switch:has(:focus-visible) i, .check:has(:focus-visible) i, .radio:has(:focus-visible) i { outline: var(--g-focus); outline-offset: var(--focus-offset); }
```

- [ ] **Step 2: Convert the specimens**

| Before | After |
|---|---|
| `<span class="switch is-on"><i></i>Auto-route</span>` | `<label class="switch"><input type="checkbox" role="switch" checked><i></i>Auto-route</label>` |
| `<span class="switch"><i></i>Local only</span>` | `<label class="switch"><input type="checkbox" role="switch"><i></i>Local only</label>` |
| `<span class="switch is-disabled"><i></i>Disabled</span>` | `<label class="switch"><input type="checkbox" role="switch" disabled><i></i>Disabled</label>` |
| `<span class="check is-on"><i></i>Persist evidence</span>` | `<label class="check"><input type="checkbox" checked><i></i>Persist evidence</label>` |
| `<span class="radio is-on"><i></i>Ask</span>` and its siblings | `<label class="radio"><input type="radio" name="mode-p" checked><i></i>Ask</label>`, `<label class="radio"><input type="radio" name="mode-p"><i></i>Allow in scope</label>`; the Settings form group uses `name="perm-p"` and `name="perm-i"` |
| a switch in a `.switch-row` without text: `<span class="switch is-on"><i></i></span>` | `<label class="switch"><input type="checkbox" role="switch" checked aria-label="Auto-route"><i></i></label>` (the label text is the row title) |

- [ ] **Step 3: Caption**

Replace `<b>switch</b>, <b>check</b>, and <b>radio</b> · crimson when on.` with `<b>switch</b>, <b>check</b>, and <b>radio</b> · a <code>label</code> around a real input: a checkbox with <code>role="switch"</code>, a checkbox, a radio with a shared <code>name</code>. Crimson when checked. Space toggles; arrows move inside a radio group.`

- [ ] **Step 4: Checks, screenshots, commit**

Run: `checks/run.sh; echo "exit $?"` → `exit 0`. Click each toggle: it changes state. Tab to one: the ring sits on the drawn box. Screenshot the Inputs and Settings form sections at the three sizes.

```bash
git add -A
git commit -m "Make switch, check, and radio native inputs inside labels

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 12: The dialog and the dismiss controls

**Files:**
- Modify: `cristian-vega-design-system.html` (the two dialog specimens, the banner dismiss, `.dialog`, `.banner__x`, `.dialog__x` rules; the Feedback caption)

- [ ] **Step 1: Rules**

Add to `.dialog { … }`: `position: static; margin: 0; padding: 0; color: var(--g-fg);` so the open dialog sits in the specimen frame instead of the browser's default absolute position. Keep every other declaration.

- [ ] **Step 2: Convert**

| Before | After |
|---|---|
| `<div class="dialog"><div class="dialog__head"><h3 role="presentation">Revoke this key?</h3><span class="dialog__x" role="img" aria-label="Close">✕</span></div>…</div>` | `<dialog class="dialog" open aria-labelledby="d-revoke-p"><div class="dialog__head"><h3 id="d-revoke-p">Revoke this key?</h3><button type="button" class="dialog__x" aria-label="Close">✕</button></div>…</dialog>` (the foot buttons are already `button` from Task 9) |
| `<i class="banner__x" role="img" aria-label="Dismiss">✕</i>` | `<button type="button" class="banner__x" aria-label="Dismiss">✕</button>` |

- [ ] **Step 3: Caption**

In the Feedback caption, replace `The destructive action is a red ghost on the right. Focus starts on the safe action. Tab stays inside. Escape closes.` with `The destructive action is a red ghost on the right. The sheet shows the dialog open and static. A product opens it with <code>showModal()</code>, which puts it in the top layer, traps focus, closes on Escape, and returns focus to the opener. Focus starts on the safe action.`

- [ ] **Step 4: Checks, screenshots, commit**

Run: `checks/run.sh; echo "exit $?"` → `exit 0`. The dialog looks as before at the three sizes; the close circle is focusable.

```bash
git add -A
git commit -m "Make the dialog a dialog element and the dismiss controls buttons

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 13: The browser check

**Files:**
- Create: `checks/browser.mjs`
- Modify: `CHANGELOG.md`

**Interfaces:**
- Consumes: the sheet; `tokens.json` through `resolve` from `checks/contrast.mjs`.
- Produces: `npm run browser` → prints the tab order and the rendered boundary colors; exits 1 on a mismatch.

- [ ] **Step 1: Install Chromium**

Run: `npx playwright install chromium`
Expected: the browser downloads once into Playwright's cache, outside the repository.

- [ ] **Step 2: Write checks/browser.mjs**

```js
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from './contrast.mjs';

const tokens = resolve(JSON.parse(readFileSync('tokens.json', 'utf8')));
const hex2rgb = (h) => { const n = parseInt(h.slice(1), 16); return `rgb(${n >> 16}, ${(n >> 8) & 255}, ${n & 255})`; };
const rgba = (s) => s.replace(/\s+/g, '').replace('0.', '.');
const expect = { paper: hex2rgb(tokens.get('line-control')), surface: hex2rgb(tokens.get('line-control')), ink: 'rgba(255,255,255,.35)' };

const problems = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
await page.goto(pathToFileURL('cristian-vega-design-system.html').href);

// 1. tab order and the ring
const focusable = await page.$$eval('main button:not(:disabled), main input:not(:disabled), main textarea:not(:disabled), main select:not(:disabled), main a[href]', (els) => els.filter((e) => !e.closest('[inert]')).length);
const disabled = await page.$$eval('main :is(button, input, textarea, select):disabled', (els) => els.length);
const seen = new Set(); let ringMissing = 0;
for (let i = 0; i < focusable + disabled + 50; i++) {
  await page.keyboard.press('Tab');
  const info = await page.evaluate(() => {
    const el = document.activeElement; if (!el || el === document.body) return null;
    const ringEl = el.matches('.switch input, .check input, .radio input') ? el.nextElementSibling : el;
    const cs = getComputedStyle(ringEl);
    return { key: el.tagName + '|' + (el.id || el.className || el.textContent.trim().slice(0, 20)), disabled: el.disabled === true, inMain: !!el.closest('main'), ring: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2 };
  });
  if (!info) break;
  if (seen.has(info.key)) break;
  seen.add(info.key);
  if (info.disabled) problems.push(`disabled control received focus: ${info.key}`);
  if (info.inMain && !info.ring) { ringMissing++; problems.push(`no focus ring on ${info.key}`); }
}
console.log(`tab order: ${seen.size} stops, ${focusable} enabled controls in main, ${disabled} disabled skipped, ${ringMissing} without a ring`);
if (seen.size < focusable) problems.push(`only ${seen.size} of ${focusable} enabled controls received focus`);

// 2. rendered boundaries per ground and state
for (const [ground, sel] of [['paper', '.spec.g--paper:has(.input)'], ['ink', '.spec.g--ink:has(.input)'], ['surface', '.ground-test .g--surface']]) {
  const frame = page.locator(sel).first();
  const input = frame.locator('.input').first();
  const rest = await input.evaluate((e) => getComputedStyle(e).borderTopColor);
  if (rgba(rest) !== rgba(expect[ground])) problems.push(`${ground} input border at rest: ${rest}, expected ${expect[ground]}`);
  await input.locator('input').focus();
  const focus = await input.evaluate((e) => ({ b: getComputedStyle(e).borderTopColor, s: getComputedStyle(e).boxShadow }));
  if (focus.s === 'none') problems.push(`${ground} input focus: no ring`);
  const sw = frame.locator('.switch:has(:checked) i').first();
  if (await sw.count()) { const bg = await sw.evaluate((e) => getComputedStyle(e).backgroundColor); if (rgba(bg) !== rgba(hex2rgb(tokens.get('crimson')))) problems.push(`${ground} checked switch track: ${bg}`); }
  const err = frame.locator('.input:has([aria-invalid="true"])').first();
  if (await err.count()) { const b = await err.evaluate((e) => getComputedStyle(e).borderTopColor); console.log(`${ground} error border: ${b}`); }
  const select = frame.locator('.select').first();
  if (await select.count()) { await select.hover(); console.log(`${ground} select hover border: ${await select.evaluate((e) => getComputedStyle(e).borderTopColor)}`); }
  console.log(`${ground} input border at rest: ${rest}; on focus: ${focus.b}`);
}
await browser.close();
for (const p of problems) console.error('browser:', p);
console.log(problems.length ? `browser: ${problems.length} problem(s)` : 'browser: ok');
process.exit(problems.length ? 1 : 0);
```

- [ ] **Step 3: Run it**

Run: `npm run browser; echo "exit $?"`
Expected: the tab-order line, three ground lines, and `browser: ok`, `exit 0`. A problem line names a control; fix the sheet, not the script, unless the script mis-reads a selector.

- [ ] **Step 4: Record and commit**

Paste the printed lines under a `### Change 2: current controls` heading in `CHANGELOG.md`, with one line per task: the boundary token, pictures, buttons, fields, toggles, dialog.

```bash
git add -A
git commit -m "Add the browser check: tab order, focus ring, rendered boundaries

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

**Change 2 is accepted when:** `npm run browser` shows every enabled simple control in the tab order with the ring and the expected boundary color per ground and state, the user approved the before and after of Task 7, and `checks/run.sh` exits 0.

---

## Change 3: assets and documentation

### Task 14: Local fonts with separate fallback faces

**Files:**
- Create: `fonts/*.woff2`, `fonts/README.md`
- Modify: `cristian-vega-design-system.html` (remove the Google Fonts `<link>` and the two `preconnect` links; add `@font-face` rules at the top of the stylesheet), `tokens.json` (the three font stacks)

- [ ] **Step 1: Copy the five files the sites already ship**

```bash
mkdir -p fonts
cp ~/Projects/cristianvega.ai/src/assets/fonts/space-grotesk-latin-600-700.woff2 fonts/
cp ~/Projects/cristianvega.ai/src/assets/fonts/ibm-plex-sans-latin-400.woff2 fonts/
cp ~/Projects/cristianvega.ai/src/assets/fonts/ibm-plex-sans-latin-400-italic.woff2 fonts/
cp ~/Projects/cristianvega.ai/src/assets/fonts/ibm-plex-mono-latin-400.woff2 fonts/
cp ~/Projects/cristianvega.ai/src/assets/fonts/ibm-plex-mono-latin-500.woff2 fonts/
```

- [ ] **Step 2: Fetch the four missing weights as latin files**

Save as `/tmp/fetch-fonts.mjs` and run `node /tmp/fetch-fonts.mjs` from the repository root:

```js
import { writeFileSync } from 'node:fs';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const url = 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500&family=IBM+Plex+Sans:wght@500;600&family=IBM+Plex+Mono:wght@600&display=swap';
const css = await (await fetch(url, { headers: { 'User-Agent': UA } })).text();
let n = 0;
for (const b of css.split('@font-face').slice(1)) {
  const family = b.match(/font-family: '([^']+)'/)[1].toLowerCase().replace(/ /g, '-');
  const weight = b.match(/font-weight: (\d+)/)[1];
  const style = /font-style: italic/.test(b) ? '-italic' : '';
  const range = b.match(/unicode-range: ([^;]+)/)[1];
  if (!range.startsWith('U+0000-00FF')) continue; // the latin subset starts at U+0000
  const src = b.match(/url\((https:[^)]+\.woff2)\)/)[1];
  const buf = Buffer.from(await (await fetch(src)).arrayBuffer());
  const file = `fonts/${family}-latin-${weight}${style}.woff2`;
  writeFileSync(file, buf); console.log(file, buf.length, 'bytes'); n++;
}
console.log(n, 'files');
```

Expected: `fonts/space-grotesk-latin-500.woff2`, `fonts/ibm-plex-sans-latin-500.woff2`, `fonts/ibm-plex-sans-latin-600.woff2`, `fonts/ibm-plex-mono-latin-600.woff2`, and `4 files`. Nine files in `fonts/` in total.

- [ ] **Step 3: Measure the fallback metrics once**

```bash
python3 -m venv /tmp/fontenv && /tmp/fontenv/bin/pip -q install fonttools brotli
/tmp/fontenv/bin/python - <<'EOF'
from fontTools.ttLib import TTFont, TTCollection
def m(path, n=0):
    f = TTCollection(path).fonts[n] if path.endswith('.ttc') else TTFont(path)
    upm = f['head'].unitsPerEm; h = f['hhea']; o = f['OS/2']
    return dict(upm=upm, asc=h.ascent, desc=abs(h.descent), gap=h.lineGap, avg=o.xAvgCharWidth)
pairs = [('Space Grotesk', 'fonts/space-grotesk-latin-600-700.woff2', '/System/Library/Fonts/HelveticaNeue.ttc'),
         ('IBM Plex Sans', 'fonts/ibm-plex-sans-latin-400.woff2', '/System/Library/Fonts/HelveticaNeue.ttc'),
         ('IBM Plex Mono', 'fonts/ibm-plex-mono-latin-400.woff2', '/System/Library/Fonts/Menlo.ttc')]
for name, primary, fallback in pairs:
    p, s = m(primary), m(fallback)
    size = (p['avg'] / p['upm']) / (s['avg'] / s['upm'])
    print(f"{name}: size-adjust: {size*100:.2f}%; ascent-override: {p['asc']/p['upm']/size*100:.2f}%; descent-override: {p['desc']/p['upm']/size*100:.2f}%; line-gap-override: {p['gap']/p['upm']/size*100:.2f}%;")
EOF
rm -rf /tmp/fontenv
```

Expected: three lines of percentages. Copy them into Step 4 and into `fonts/README.md` with the command above, so anyone can repeat the measurement.

- [ ] **Step 4: The font-face rules and the stacks**

Remove the three `<link>` elements for Google Fonts from the head. At the top of the stylesheet, before the tokens comment, add:

```css
  @font-face { font-family: "Space Grotesk"; font-weight: 500; src: url("fonts/space-grotesk-latin-500.woff2") format("woff2"); font-display: swap; }
  @font-face { font-family: "Space Grotesk"; font-weight: 600 700; src: url("fonts/space-grotesk-latin-600-700.woff2") format("woff2"); font-display: swap; }
  @font-face { font-family: "IBM Plex Sans"; font-weight: 400; src: url("fonts/ibm-plex-sans-latin-400.woff2") format("woff2"); font-display: swap; }
  @font-face { font-family: "IBM Plex Sans"; font-weight: 400; font-style: italic; src: url("fonts/ibm-plex-sans-latin-400-italic.woff2") format("woff2"); font-display: swap; }
  @font-face { font-family: "IBM Plex Sans"; font-weight: 500; src: url("fonts/ibm-plex-sans-latin-500.woff2") format("woff2"); font-display: swap; }
  @font-face { font-family: "IBM Plex Sans"; font-weight: 600; src: url("fonts/ibm-plex-sans-latin-600.woff2") format("woff2"); font-display: swap; }
  @font-face { font-family: "IBM Plex Mono"; font-weight: 400; src: url("fonts/ibm-plex-mono-latin-400.woff2") format("woff2"); font-display: swap; }
  @font-face { font-family: "IBM Plex Mono"; font-weight: 500; src: url("fonts/ibm-plex-mono-latin-500.woff2") format("woff2"); font-display: swap; }
  @font-face { font-family: "IBM Plex Mono"; font-weight: 600; src: url("fonts/ibm-plex-mono-latin-600.woff2") format("woff2"); font-display: swap; }
  /* fallback faces carry the metric overrides, so the layout holds until the file arrives */
  @font-face { font-family: "Space Grotesk Fallback"; src: local("Helvetica Neue"); size-adjust: <measured>; ascent-override: <measured>; descent-override: <measured>; line-gap-override: <measured>; }
  @font-face { font-family: "IBM Plex Sans Fallback"; src: local("Helvetica Neue"); size-adjust: <measured>; ascent-override: <measured>; descent-override: <measured>; line-gap-override: <measured>; }
  @font-face { font-family: "IBM Plex Mono Fallback"; src: local("Menlo"); size-adjust: <measured>; ascent-override: <measured>; descent-override: <measured>; line-gap-override: <measured>; }
```

Replace each `<measured>` with the value from Step 3. In `tokens.json`, change the three stacks: `font-display` to `"Space Grotesk", "Space Grotesk Fallback", system-ui, -apple-system, sans-serif`, `font-body` to `"IBM Plex Sans", "IBM Plex Sans Fallback", system-ui, -apple-system, "Helvetica Neue", sans-serif`, `font-mono` to `"IBM Plex Mono", "IBM Plex Mono Fallback", ui-monospace, "SF Mono", Menlo, monospace`. Run `npm run build`.

- [ ] **Step 5: Prove the sheet renders with no network**

```bash
node -e "
import('playwright').then(async ({ chromium }) => {
  const b = await chromium.launch(); const c = await b.newContext(); await c.setOffline(true);
  const p = await c.newPage(); await p.goto('file://' + process.cwd() + '/cristian-vega-design-system.html');
  await p.evaluate(() => document.fonts.ready);
  const ok = await p.evaluate(() => ['600 16px \"Space Grotesk\"', '400 16px \"IBM Plex Sans\"', '500 12px \"IBM Plex Mono\"'].map((f) => document.fonts.check(f)));
  console.log('fonts loaded offline:', ok); await b.close(); process.exit(ok.every(Boolean) ? 0 : 1);
});"
```

Expected: `fonts loaded offline: [ true, true, true ]`.

- [ ] **Step 6: Caption, README, checks, screenshots, commit**

In the Type section's faces caption, add: `The sheet ships the nine latin files in <code>fonts/</code> and loads them itself. A fallback face with measured metrics holds the layout until a file arrives.` Update the Adoption table's Fonts cell for the sheet if one exists; otherwise leave the table.

Write `fonts/README.md`: the nine files with their source (cristianvega.ai or the Google Fonts endpoint and the fetch command), the measurement command from Step 3, and the three measured lines.

Run: `checks/run.sh; echo "exit $?"` → `exit 0`. Screenshot the masthead and the Type section at the three sizes: the faces must look as before.

```bash
git add -A
git commit -m "Load the nine latin font files locally with measured fallback faces

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 15: One icon sprite

**Files:**
- Create: `icons/<name>.svg` × 16
- Modify: `build/inject.mjs` (`readInputs` takes the inner markup of each file), `cristian-vega-design-system.html` (every inline icon becomes a `use`; the Icons caption)
- Test: `checks/lib.test.mjs` (no change; `renderIconSprite` already takes `body`)

- [ ] **Step 1: Extract the sixteen files from the Icons strip**

Save as `/tmp/icons.mjs`, run from the repository root:

```js
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const s = readFileSync('cristian-vega-design-system.html', 'utf8');
const strip = s.slice(s.indexOf('<div class="icons">'), s.indexOf('</div>', s.indexOf('<div class="icons">')));
mkdirSync('icons', { recursive: true });
let n = 0;
for (const m of strip.matchAll(/<span><svg[^>]*>([\s\S]*?)<\/svg>([a-z]+)<\/span>/g)) {
  writeFileSync(`icons/${m[2]}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${m[1]}</svg>\n`);
  n++;
}
console.log(n, 'icon files');
```

Expected: `16 icon files`, named search, plus, chevron, graph, gear, note, calendar, folder, info, check, warning, close, command, panel, list, stop.

- [ ] **Step 2: Make the inject script read the inner markup**

In `build/inject.mjs`, change the `icons` line to:

```js
  const inner = (svg) => svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();
  const icons = existsSync(dir)
    ? readdirSync(dir).filter((f) => f.endsWith('.svg')).sort().map((f) => ({ name: f.slice(0, -4), body: inner(readFileSync(`${dir}/${f}`, 'utf8')) }))
    : [];
```

Run `npm run build`. Expected: the icon region now holds sixteen `symbol` elements. Run `npm test` → PASS.

- [ ] **Step 3: Replace every inline icon with a use**

Save as `/tmp/use-icons.mjs`, run from the repository root:

```js
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
let s = readFileSync('cristian-vega-design-system.html', 'utf8');
const norm = (x) => x.replace(/\s+/g, '');
const byBody = new Map();
for (const f of readdirSync('icons')) {
  const body = readFileSync(`icons/${f}`, 'utf8').replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  byBody.set(norm(body), f.slice(0, -4));
}
let n = 0, unknown = 0;
s = s.replace(/<svg class="ico"([^>]*)>([\s\S]*?)<\/svg>/g, (whole, attrs, body) => {
  const name = byBody.get(norm(body));
  if (!name) { unknown++; return whole; }
  n++;
  const hidden = /aria-hidden/.test(attrs) ? ' aria-hidden="true"' : '';
  return `<svg class="ico"${hidden}><use href="#i-${name}"/></svg>`;
});
// the strip itself keeps drawing from the sprite too
writeFileSync('cristian-vega-design-system.html', s);
console.log(n, 'icons replaced;', unknown, 'left inline');
```

Expected: `unknown` is 0. If it is not, the inline icon differs from the sixteen; either add it as a new named file (and to the Icons strip and its caption) or fix its path data to match. Every icon on the sheet must come from the sixteen.

- [ ] **Step 4: Caption**

In the Icons caption, replace `On macOS the same names map to SF Symbols at the regular weight.` with `The sixteen files live in <code>icons/</code>. The build writes them into the sheet as one sprite; every icon on the page is a <code>use</code> of one symbol.` The backlog in `README.md` (Task 18) records the system symbol mapping with its trigger.

- [ ] **Step 5: Checks, screenshots, commit**

Run: `checks/run.sh; echo "exit $?"` → `exit 0`. Open the sheet from disk: every icon draws. Screenshot the Icons strip, the Buttons section, and a popover at the three sizes.

```bash
git add -A
git commit -m "Draw every icon from one sprite built from sixteen files

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 16: Layer tokens and the overlay table

**Files:**
- Modify: `tokens.json` (new `layer` group), `cristian-vega-design-system.html` (`.dialog`, `.pal`, `.pop`, `.menu`, `.toast`, `.tip` rules; the Feedback caption becomes a table)

- [ ] **Step 1: Tokens**

Add to `tokens.json` after the `focus` group:

```json
"layer": {
  "$description": "layers · a modal dialog sits in the browser's top layer above all of these",
  "z-drawer": { "$type": "number", "$value": "10" },
  "z-popover": { "$type": "number", "$value": "20", "$description": "popover and menu" },
  "z-toast": { "$type": "number", "$value": "30" },
  "z-dialog": { "$type": "number", "$value": "40", "$description": "dialog and palette when not modal" },
  "z-tip": { "$type": "number", "$value": "50" }
}
```

Update `checks/tokens.test.mjs` and `checks/build.test.mjs`: the count becomes 164 (158 + `line-control` + five layers). Run `npm run build && npm test`.

- [ ] **Step 2: Rules**

Add `z-index: var(--z-dialog);` to `.dialog` and `.pal`, `z-index: var(--z-popover);` to `.pop` and `.menu`, `z-index: var(--z-toast);` to `.toast`, `z-index: var(--z-tip);` to `.tip`. On the sheet nothing is positioned, so nothing moves; a product that positions them gets the order.

- [ ] **Step 3: The overlay table**

Replace the part of the Feedback caption that runs from `<b>Layers</b> · drawer, then popover and menu, then toast, then dialog and palette, then tip on top.` with a sentence `<b>Layers</b> · the table below.` and insert this table before the caption:

```html
<div class="d-table">
  <table>
    <caption class="vh">Overlays: anchor, open, close, keyboard, focus, scrim, layer</caption>
    <thead><tr><th scope="col">Overlay</th><th scope="col">Anchor and offset</th><th scope="col">Opens</th><th scope="col">Closes</th><th scope="col">Keyboard</th><th scope="col">Focus goes to</th><th scope="col">Focus returns to</th><th scope="col">Scrim</th><th scope="col">Layer</th></tr></thead>
    <tbody>
      <tr><td class="k">drawer</td><td>left edge, 232 px, slides in on the lift curve, 300 ms</td><td>the sidebar toggle under 900 px</td><td>Escape, the scrim, the toggle</td><td>arrows move in the list, Enter opens</td><td>the first item</td><td>the toggle</td><td>ink at 35%</td><td><code>--z-drawer</code> 10</td></tr>
      <tr><td class="k">menu</td><td>4 px under its select or menu button</td><td>click, Enter, Space, arrow down</td><td>Escape, a choice, a click outside</td><td>arrows move, Enter runs, Home and End jump</td><td>the selected item</td><td>the trigger</td><td>none</td><td><code>--z-popover</code> 20</td></tr>
      <tr><td class="k">popover</td><td>4 px under its trigger, 320 px wide</td><td>click on the trigger</td><td>Escape, a pick, a click outside</td><td>arrows move, Enter picks, typing filters</td><td>the filter field, else the selected row</td><td>the trigger</td><td>none</td><td><code>--z-popover</code> 20</td></tr>
      <tr><td class="k">toast</td><td>bottom center, 4 s; 8 s with Undo</td><td>a completed action</td><td>time, or its link</td><td>Tab reaches the link only</td><td>nowhere</td><td>unchanged</td><td>none</td><td><code>--z-toast</code> 30</td></tr>
      <tr><td class="k">dialog</td><td>15% from the top, 420 px</td><td>a destructive or wide action</td><td>Escape, Cancel, the close circle</td><td>Tab stays inside</td><td>the safe action</td><td>the opener</td><td>ink at 35%</td><td>top layer via <code>showModal()</code></td></tr>
      <tr><td class="k">palette</td><td>15% from the top, 560 px</td><td>⌘K</td><td>Escape, a run</td><td>arrows move, Enter runs, typing filters</td><td>the input</td><td>the previous focus</td><td>ink at 35%</td><td>top layer via <code>showModal()</code></td></tr>
      <tr><td class="k">tip</td><td>8 px above the control, after 300 ms</td><td>hover or focus</td><td>leave, blur, press, Escape</td><td>Escape hides it</td><td>nowhere</td><td>unchanged</td><td>none</td><td><code>--z-tip</code> 50; inside a modal dialog it renders inside the dialog</td></tr>
      <tr><td class="k">tabs</td><td>not an overlay</td><td>—</td><td>—</td><td>arrows move between tabs, Enter or Space activates, Tab leaves the list</td><td>the active tab</td><td>—</td><td>none</td><td>none</td></tr>
    </tbody>
  </table>
</div>
```

Add after the table, in the caption: `<b>Top layer</b> · a modal dialog and the palette open with <code>showModal()</code>, which puts them in the browser's top layer. No <code>z-index</code> on the page reaches above it. A tip or a toast that must show over a modal renders inside the dialog element. The sheet does not implement any of this behavior; a product does, and this table is its contract.`

- [ ] **Step 4: Checks, screenshots, commit**

Run: `checks/run.sh; echo "exit $?"` → `exit 0`. The table must have no empty cell (a cell reads "none" or "—" where nothing applies). Screenshot the table at the three sizes; at 400 pixels it scrolls sideways inside its wrapper.

```bash
git add -A
git commit -m "Add the five layer tokens and the overlay behavior table

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 17: The naming rule, the completeness audit, and the text rewrite

**Files:**
- Create: `checks/text-report.mjs` (a report, not a check; not part of `run.sh`)
- Modify: `cristian-vega-design-system.html` (the do and do not list; the Fixed sizes table; the wire captions; every caption per the report), `README.md` (the backlog, created here and finished in Task 18)

- [ ] **Step 1: The naming rule**

In the Adoption band's do and do not list, add after the "Set mono on every machine value." item:

```html
<li class="do"><span class="vh">Do · </span><b>Use one word per state.</b> <code>is-on</code> is a toggle state. <code>is-active</code> is the current place. <code>is-selected</code> is one of many. <code>is-open</code> is a disclosure. Use them for visual state a product sets from its own model, never in place of a native state.</li>
```

- [ ] **Step 2: The completeness audit, with its outcomes**

Apply these outcomes; each is a decision, not a question:

| Promise in the text | Outcome |
|---|---|
| the drawer (a wireframe and a caption, no component) | backlog: "a drawer component" · trigger: a product needs the drawer |
| "46 px reader toolbar" in the Fixed sizes table | delete "· 46 px reader toolbar" from the header row; no rule draws it |
| "narrow 840" in the container row | delete "· narrow 840"; no rule uses it |
| the tip position and the popover offset | documented in the overlay table (Task 16); the caption says a product implements them |
| "48 px sides, 44 px top" in the Document wire caption | backlog: "document padding tokens" · trigger: OpenWrite adopts the system; the wire caption keeps the numbers as layout data |
| the system symbol mapping | backlog (Task 15) · trigger: a native app adopts the system |
| any other name the report in Step 3 finds without a rule | the same three outcomes; write the decision in the change log |

Start `README.md` with a `## Backlog` table: columns Entry, Trigger; rows for dark mode for the app frame (an app must follow system appearance), `DesignTokens.swift` output as one more platform in `build/config.mjs` (a native app adopts the system), the system symbol names (a native app adopts the system), working examples of composite widgets (a product needs one), a drawer component (a product needs the drawer), document padding tokens (OpenWrite adopts the system), a published package and product-side checks (a product adopts the system), continuous integration for `run.sh` (the repository gets a remote).

- [ ] **Step 3: The text report**

`checks/text-report.mjs` lists, for the descriptive text only, every sentence over 20 words and every all-caps word that is not an allowed name:

```js
import { readFileSync } from 'node:fs';
const html = readFileSync('cristian-vega-design-system.html', 'utf8');
const body = html.slice(html.indexOf('<body>'));
// descriptive text: captions, notes, heads, card copy, wire captions, do and do not, documentation tables; never a specimen (.spec, .picture, .ground-test)
const stripped = body.replace(/<(div|figure) class="(spec|picture|ground-test)[^"]*"[\s\S]*?<\/\1>/g, ' ').replace(/<pre[\s\S]*?<\/pre>/g, ' ').replace(/<code>[\s\S]*?<\/code>/g, ' code ');
const text = stripped.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;|&#\d+;/g, ' ').replace(/\s+/g, ' ');
const ALLOWED = new Set(['IBM', 'OK', 'ID', 'README', 'CHANGELOG', 'SBOM']);
let long = 0, caps = 0;
for (const s of text.split(/(?<=[.!?])\s+/)) {
  const words = s.trim().split(/\s+/).filter(Boolean);
  if (words.length > 20) { long++; console.log(`${words.length} words: ${s.trim().slice(0, 90)}`); }
}
for (const m of text.matchAll(/\b[A-Z]{2,}[A-Za-z0-9-]*\b/g)) if (!ALLOWED.has(m[0]) && !/^[0-9A-F]{6}$/.test(m[0])) { caps++; console.log('acronym:', m[0]); }
console.log(`text report: ${long} long sentences, ${caps} acronyms`);
```

Run: `node checks/text-report.mjs`. The numbers are the size of the rewrite. `SBOM` is specimen copy inside a gate row that the strip does not catch; it stays allowed. `ID` in "ID" for identifier in the Numbers table is renamed "identifier" in the rewrite, then removed from the allowed set.

- [ ] **Step 4: Rewrite the descriptive text, section by section**

Work from the top of the sheet to the bottom. For each caption, note, head paragraph, card paragraph, wire caption, and do or do not item, apply the rules from the spec's section 5: one topic and 20 words or fewer per sentence; active voice; "must" for a requirement; the same word for the same thing (the sheet, a ground, the contract, a token, a specimen); no acronym. Write out "Web Content Accessibility Guidelines", "the year-month-day date format", "identifier". Keep every number and every class name; change the sentences, not the facts. Put the short usage instruction first and the reference detail after it. Specimen text is never touched.

After each section, run `node checks/text-report.mjs` and `checks/run.sh`. Stop when the report prints `text report: 0 long sentences, 0 acronyms`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Add the state naming rule, resolve every documented promise, rewrite the descriptive text

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 18: The change log, the README, the tag

**Files:**
- Modify: `CHANGELOG.md`, `README.md`, `tokens.json` (the date), `docs/superpowers/specs/2026-09-15-design-system-completion-design.html` (the version line in the footer, if it names 1.1)

- [ ] **Step 1: README**

`README.md` holds, in this order: what the repository is (one paragraph); how to build (`npm install`, `npm run build`); how to check (`checks/run.sh`, and `npm run browser` for the rendered states); how to change a token (edit `tokens.json`, build, check, commit the sheet and `dist/` together); how to add an icon (a file in `icons/`, a name in the Icons strip and its caption, build); how to record an exception (`checks/exceptions.json`, with a reason and the change that removes it); the text rules in five lines; the backlog table from Task 17.

- [ ] **Step 2: Change log and date**

Complete `CHANGELOG.md` for 1.2.0: the three changes with one line per task, the audit outcomes from Task 17, and the browser check output from Task 13. Set `$extensions['cristian-vega'].date` in `tokens.json` to the day of the release and run `npm run build`; the masthead and the footer follow.

- [ ] **Step 3: Final run and screenshots**

Run: `checks/run.sh; echo "exit $?"` and `npm run browser; echo "exit $?"`. Both must print `exit 0`. Take the three screenshots of the masthead, the Inputs section, and the Adoption band, and keep them outside the repository.

- [ ] **Step 4: Commit and tag**

```bash
git add -A
git commit -m "Release 1.2.0: one token source, native controls, local assets, one check command

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git tag -a v1.2.0 -m "Design system 1.2.0"
```

**Change 3 is accepted when:** the sheet renders with no network (Task 14 Step 5), the generated regions match the build (`drift` in `run.sh`), the audit lists no open item (Task 17), the text report prints zero, and `checks/run.sh` exits 0.

---

## Plan self-review

**Spec coverage.** Section 4 (repository, files, markers, version): Tasks 1, 2, 4. Section 5 (text rules): Task 17 and the global constraint. Section 6 (tokens, format, names, outputs): Tasks 2, 3, 4. Section 7 (control boundaries): Task 7, verified by Task 13. Section 8.1 (simple controls): Tasks 9, 10, 11, 12. Section 8.2 (composite widgets): Task 8. Section 8.3 (browser check): Task 13. Section 9.1 (fonts): Task 14. Section 9.2 (icons): Task 15. Section 10 (layers, overlay table): Task 16. Section 11 (naming rule): Task 17. Section 12 (audit): Task 17. Section 13 (checks and tests): Tasks 5, 6; the fault proofs in Task 6 Step 5. Section 14 (three changes): the three headings. Section 15 (backlog): Task 17 Step 2 and Task 18. Section 17 (done): Task 18 Step 3.

**Placeholders.** The only bracketed values are `<the printed hex>` in Task 7 and `<measured>` in Task 14; each is produced by the step right before it and copied in by the executor.

**Names used across tasks.** `build(buildPath)` and `config` in `build/config.mjs`; `readInputs(root)` in `build/inject.mjs`; `findRegion`, `replaceRegion`, `walkTokens`, `renderTokenRegion`, `renderTokenBlock`, `renderGroundContract`, `renderIconSprite`, `stampVersion`, `inject` in `build/lib.mjs`; `checkMarkup`, `checkInventory`, `contrast`, `over`, `parse`, `resolve`, `PAIRS`, `checkContrast`, `validateTokens`, `checkDrift` in `checks/`. The token counts are 158 after Task 2, 159 after Task 7, 164 after Task 16; `checks/tokens.test.mjs` changes at Task 7 (159) and Task 16 (164).

