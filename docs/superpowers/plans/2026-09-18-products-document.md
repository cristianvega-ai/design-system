# Products Document Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move `cristian-vega-products.html` into the repository and make it read the design system that the build writes, instead of carrying its own copy.

**Architecture:** The build extracts two stylesheets from the sheet's own stylesheet and writes them into marked regions of the products document. The document keeps only the rules that draw its own furniture. Every check takes a file list and covers both documents.

**Tech Stack:** Node 24, Style Dictionary 5.5.3, Playwright 1.63.0, the existing `build/` and `checks/` scripts.

**Spec:** `docs/superpowers/specs/2026-09-18-products-document-design.md` (the authority). The 2.0.0 and 1.2.0 specs hold where it does not change them.

## Global Constraints

- The repository is `~/Projects/design-system/`. Work on branch `products-document`. Every path is relative to the repository root.
- The sheet is `cristian-vega-design-system.html`. The document is `cristian-vega-products.html`. The sheet defines the system; the document shows the products.
- Generated regions are never edited by hand. The sheet has four: `/* build:tokens */` in `:root`, and `<!-- build:token-block -->`, `<!-- build:ground-contract -->`, `<!-- build:icons -->` in the body. The document gains four: `/* build:system */` and `/* build:doc-chrome */` inside its `<style>`, `<!-- build:icons -->` in its body, and two version stamps with no marker. Inside a `<style>` a marker must be a stylesheet comment; a markup comment there breaks the stylesheet.
- The literal anchor line `  .g { background` in the sheet must not change; the ground-contract renderer reads from it.
- After any change to `tokens.json`, to the sheet's stylesheet, or to a marked region, run `npm run build` and commit the generated files with the source.
- Component rules use tokens or `--g-*` names only. A raw pixel value in a spacing property, or a raw color, is a finding. `checks/exceptions.json` lists each allowed exception with a reason.
- Descriptive text follows the text rules: one topic and 20 words or fewer per sentence; active voice; "must" for a requirement, "can" for a possibility, never "should"; no acronym (a class, token, attribute, element, or method name, a command, or a file extension is not one); the same word for the same thing. The words inside a drawn screen are specimen text and do not change.
- The checks never write a file inside the repository. Scratch files go in `/private/tmp/claude-501/-Users-cvega-Projects/c70fd5ed-c36c-4648-b52f-da4ec4ec4866/scratchpad/products/`.
- Playwright work uses a throwaway script in the scratch directory: import `chromium` from `/Users/cvega/Projects/design-system/node_modules/playwright/index.mjs`, a context with `reducedMotion: 'reduce'`, the file opened from disk, and `document.fonts.ready` awaited. No browser tool from a server.
- Nothing outside the repository is deleted. A file this work retires moves to `<scratch>/retired/` and the report names the path.
- Every task ends with `checks/run.sh` exiting 0 and `node checks/text-report.mjs` printing zero.
- Two approval gates: after Task 3 (the document's look) and after Task 7 (the screens and the text). The controller shows the user screenshots and waits.
- Commit after every task. Commit messages end with `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.

## File Structure

| Path | Responsibility | Task |
|---|---|---|
| `cristian-vega-products.html` | the document: its own furniture, four generated regions | 1–8 |
| `build/lib.mjs` | `extractSystem`, `extractChrome`, `injectProducts` | 1, 2 |
| `build/inject.mjs` | reads both documents, writes `dist/` and both sets of regions | 1, 2 |
| `dist/cristian-vega.css` | generated: tokens, grounds, components | 1 |
| `dist/cristian-vega-doc.css` | generated: documentation tokens, base rules, furniture | 1 |
| `checks/drift.mjs`, `checks/markup.mjs` | cover both documents | 2 |
| `checks/inventory.mjs` | covers both documents | 3 |
| `checks/browser.mjs` | covers both documents | 6 |
| `checks/text-report.mjs`, `checks/text-judge.mjs` | cover both documents | 7 |
| `README.md`, `CHANGELOG.md`, `tokens.json` | the release | 8 |

---

### Task 1: The document moves in; the build writes two stylesheets

**Files:**
- Create: `cristian-vega-products.html` (moved), `checks/extract.test.mjs`
- Modify: `build/lib.mjs`, `build/inject.mjs`
- Generated: `dist/cristian-vega.css`, `dist/cristian-vega-doc.css`

**Interfaces:**
- Produces: `extractSystem(stylesheet, tokensCss, version, date)` and `extractChrome(stylesheet, version, date)` in `build/lib.mjs`, each returning a stylesheet string; the two files in `dist/`.

- [ ] **Step 1: Move the document**

```bash
cp ~/Projects/cristian-vega-products.html cristian-vega-products.html
mkdir -p <scratch>/retired
mv ~/Projects/cristian-vega-products.html <scratch>/retired/
mv ~/Projects/cristian-vega-schematics-src <scratch>/retired/
```

Report both paths. Do not delete either.

- [ ] **Step 2: Write the failing test**

Create `checks/extract.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extractSystem, extractChrome } from '../build/lib.mjs';

const SHEET = [
  '  :root {',
  '    /* build:tokens */',
  '    --a: 1px;',
  '/* /build:tokens */',
  '    /* documentation chrome · light. Dark redefines these names only. */',
  '    --doc-bg: var(--a);',
  '  }',
  '  body { background: var(--doc-bg); }',
  '  .d-mast { color: red; }',
  '  /* ==========================================================',
  '     2. Grounds. A ground sets the variables that components',
  '     ========================================================== */',
  '  .g { background: var(--g-bg); }',
  '  /* ==========================================================',
  '     3. Components. Class names are the canonical names.',
  '     ========================================================== */',
  '  .btn { padding: var(--space-2); }',
  '  /* ---------- foundations specimens ---------- */',
  '  .swatch { height: 8px; }',
].join('\n');

test('extractSystem holds the tokens, the grounds, and the components, and no chrome or specimen rule', () => {
  const css = extractSystem(SHEET, ':root {\n  --a: 1px;\n}\n', '9.9.9', '2026-01-01');
  assert.match(css, /^\/\* Cristian Vega 9\.9\.9 · 2026-01-01 · generated by npm run build; do not edit \*\/\n/);
  assert.match(css, /--a: 1px;/);
  assert.match(css, /\.g \{ background: var\(--g-bg\); \}/);
  assert.match(css, /\.btn \{ padding: var\(--space-2\); \}/);
  assert.doesNotMatch(css, /\.d-mast/);
  assert.doesNotMatch(css, /\.swatch/);
});

test('extractChrome holds the documentation tokens, the base rules, and the furniture, and no ground or component rule', () => {
  const css = extractChrome(SHEET, '9.9.9', '2026-01-01');
  assert.match(css, /^\/\* Cristian Vega 9\.9\.9 · 2026-01-01 · generated by npm run build; do not edit \*\/\n/);
  assert.match(css, /--doc-bg: var\(--a\);/);
  assert.match(css, /body \{ background: var\(--doc-bg\); \}/);
  assert.match(css, /\.d-mast \{ color: red; \}/);
  assert.doesNotMatch(css, /\.g \{/);
  assert.doesNotMatch(css, /\.btn \{/);
});

test('extractSystem fails loudly when an anchor is missing', () => {
  assert.throws(() => extractSystem('  .g { background: red; }', '', '9.9.9', '2026-01-01'), /2\. Grounds/);
});
```

Run: `node --test checks/extract.test.mjs` → FAIL, "extractSystem is not a function".

- [ ] **Step 3: Write the extractors**

In `build/lib.mjs`, after `renderGroundContract`:

```js
const ANCHORS = {
  chromeStart: '    /* documentation chrome · light. Dark redefines these names only. */',
  grounds: '     2. Grounds.',
  specimens: '  /* ---------- foundations specimens ---------- */',
};

function slice(stylesheet, fromMark, toMark) {
  const from = stylesheet.indexOf(fromMark);
  const to = stylesheet.indexOf(toMark);
  if (from < 0) throw new Error(`stylesheet anchor not found: ${fromMark.trim()}`);
  if (to < 0) throw new Error(`stylesheet anchor not found: ${toMark.trim()}`);
  return stylesheet.slice(from, to);
}

const header = (version, date) => `/* Cristian Vega ${version} · ${date} · generated by npm run build; do not edit */\n`;

// The grounds and the components, with the tokens above them. A product reads this file.
export function extractSystem(stylesheet, tokensCss, version, date) {
  const start = stylesheet.indexOf(ANCHORS.grounds);
  if (start < 0) throw new Error('stylesheet anchor not found: 2. Grounds');
  const commentStart = stylesheet.lastIndexOf('/*', start);
  const body = slice(stylesheet, stylesheet.slice(commentStart), ANCHORS.specimens);
  return header(version, date) + tokensCss.trimEnd() + '\n\n' + body.trimEnd() + '\n';
}

// The documentation tokens, the base rules, and the documentation furniture. A document reads this file.
export function extractChrome(stylesheet, version, date) {
  const start = stylesheet.indexOf(ANCHORS.chromeStart);
  if (start < 0) throw new Error('stylesheet anchor not found: documentation chrome');
  const groundsAt = stylesheet.indexOf(ANCHORS.grounds);
  if (groundsAt < 0) throw new Error('stylesheet anchor not found: 2. Grounds');
  const commentStart = stylesheet.lastIndexOf('/*', groundsAt);
  return header(version, date) + stylesheet.slice(start, commentStart).trimEnd() + '\n';
}
```

The chrome slice opens inside the sheet's `:root`, so its first lines are declarations. Wrap them: the extractor prefixes `:root {\n` and the slice already carries the closing `}` of that block. Read the sheet at the anchor before writing this step and keep the slice balanced; the test in Step 2 proves it.

- [ ] **Step 4: The build writes both files**

In `build/inject.mjs`, after the sheet is written:

```js
  const { version, date } = inputs.tokens.$extensions['cristian-vega'];
  const styleStart = inputs.sheet.indexOf('<style>') + 7;
  const styleEnd = inputs.sheet.indexOf('</style>');
  const stylesheet = inputs.sheet.slice(styleStart, styleEnd);
  writeFileSync('dist/cristian-vega.css', extractSystem(stylesheet, inputs.tokensCss, version, date));
  writeFileSync('dist/cristian-vega-doc.css', extractChrome(stylesheet, version, date));
  console.log('wrote dist/cristian-vega.css and dist/cristian-vega-doc.css');
```

Run `npm run build && npm test`. Expected: both files exist, every test passes. Check by eye that `dist/cristian-vega.css` opens with the header and the token block, holds `.g--surface` and `.btn`, and holds no `.d-` rule.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "Move the products document in; build the system and chrome stylesheets

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: The document's regions; its copied system goes

**Files:**
- Modify: `cristian-vega-products.html`, `build/lib.mjs`, `build/inject.mjs`, `checks/drift.mjs`, `checks/markup.mjs`, `checks/drift.test.mjs`

**Interfaces:**
- Produces: `injectProducts({ products, systemCss, chromeCss, icons, version, date })` in `build/lib.mjs`; `readInputs` returns `products`.

- [ ] **Step 1: The document's markers**

The document has two `<style>` blocks. Replace the first block's whole content with the two markers, in this order:

```css
  /* build:system */
  /* /build:system */
  /* build:doc-chrome */
  /* /build:doc-chrome */
```

Move every rule the document keeps into the second block. Delete from the document, wholesale: its `:root` token block, its `@media (prefers-color-scheme: dark)` and `:root[data-theme="dark"]` token blocks, its `.g`, `.g--paper`, `.g--surface`, `.g--ink`, `.g--deep` blocks, and every rule whose selector names a component the sheet defines. Compare selector by selector: `comm -12` of the document's rule names and the sheet's rule names lists 220 shared names. Delete every shared name's rule from the document. Keep only the seven that the sheet does not define: `.brand__mark--ob`, `.brand__mark--od`, `.brand__mark--ow`, `.card--static`, `.gbtn--xs`, `.kicker--sm`, and the document's own `.g--paper` (which goes with the rest).

In the body, add the icon sprite region right after the opening `<body>` tag:

```html
<!-- build:icons --><!-- /build:icons -->
```

- [ ] **Step 2: The injector**

In `build/lib.mjs`:

```js
// The products document reads the built system. Its own rules follow the two regions.
export function injectProducts({ products, systemCss, chromeCss, icons, version, date }) {
  let out = products;
  out = replaceRegion(out, 'system', 'css', '\n' + systemCss.trimEnd() + '\n');
  out = replaceRegion(out, 'doc-chrome', 'css', '\n' + chromeCss.trimEnd() + '\n');
  out = replaceRegion(out, 'icons', 'html', renderIconSprite(icons));
  return stampVersion(out, version, date);
}
```

In `build/inject.mjs`, add `products: readFileSync(`${root}/cristian-vega-products.html`, 'utf8')` to `readInputs`, and after the sheet and the two stylesheets are written:

```js
  const nextProducts = injectProducts({ products: inputs.products, systemCss, chromeCss, icons: inputs.icons, version, date });
  if (nextProducts !== inputs.products) writeFileSync('cristian-vega-products.html', nextProducts);
  console.log(nextProducts === inputs.products ? 'products unchanged' : 'wrote cristian-vega-products.html');
```

- [ ] **Step 3: The version stamps**

`stampVersion` throws unless the text holds exactly two stamps. Give the document two: one in its masthead, beside its title, and one in its footer. Each reads `v2.0.0 · 2026-09-17` before the build and takes the current value after it. Task 8 moves the release number.

- [ ] **Step 4: Drift and markup cover both documents**

In `checks/drift.mjs`, add the document's regions:

```js
const PRODUCT_REGIONS = [['system', 'css'], ['doc-chrome', 'css'], ['icons', 'html']];
```

After the sheet's region loop, build the expected document with `injectProducts` and compare each region and the stamps, with the message `document region <name> differs from a fresh build`.

In `checks/markup.mjs`, the entry reads both files:

```js
  const files = ['cristian-vega-design-system.html', 'cristian-vega-products.html'];
  let total = 0;
  for (const file of files) {
    const problems = checkMarkup(readFileSync(file, 'utf8'));
    for (const p of problems) console.error(`markup: ${file}: ${p}`);
    total += problems.length;
  }
  console.log(total ? `markup: ${total} problem(s)` : 'markup: ok');
  process.exit(total ? 1 : 0);
```

Add a case to `checks/drift.test.mjs` that edits a declaration inside the document's system region in a copy of the repository and asserts the drift check reports it.

- [ ] **Step 5: Build, check, commit**

Run `npm run build`, then `npm test`, then `node checks/markup.mjs`, then `node checks/drift.mjs`. Expected: every one passes. The document now renders with the system's rules; it will look different from before, and Task 3 finishes the look.

```bash
git add -A
git commit -m "Give the products document the built system in two regions

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: The document's own rules read tokens

**Files:**
- Modify: `cristian-vega-products.html`, `checks/inventory.mjs`, `checks/exceptions.json`

- [ ] **Step 1: Rename the document's token names**

The document's kept rules read names that the sheet does not define. Replace each with the documentation name that holds the same value:

| Document name | Sheet name |
|---|---|
| `--bg` | `--doc-bg` |
| `--surface` (in a kept rule) | `--doc-surface` |
| `--surface-2` (in a kept rule) | `--doc-surface-2` |
| `--text` | `--doc-fg` |
| `--muted` (in a kept rule) | `--doc-muted` |
| `--muted-2` | `--doc-meta` |
| `--line` (in a kept rule) | `--doc-line` |
| `--line-strong` (in a kept rule) | `--doc-line-strong` |
| `--hair` | `--doc-hairline` |
| `--link` | `--crimson` |
| `--focus` | `--doc-focus` |
| `--shadow-card` | `--doc-shadow-1` |
| `--shadow-float` | `--shadow-3` |
| `--code-bg` | `--doc-code-bg` |
| `--grid-line-light` | `--grid-line-surface` |

`--pin`, `--peach`, `--peach-2`, and `--code-accent` already exist in `tokens.json`; keep them as they are. After the pass, `grep -o -- 'var(--[a-z0-9-]*)' cristian-vega-products.html | sort -u` names only tokens the built files define; list any leftover in the report.

- [ ] **Step 2: Raw values in the kept rules**

The kept rules hold raw pixel values. For each, use the token that holds the same value: the spacing scale is 2, 4, 8, 12, 16, 24, 32, 48, 64, 88 as `--space-0` to `--space-9`; the radius scale is `--radius-2xs` to `--radius-xl` and `--radius-pill`; the control heights are `--control-s`, `--control-m`, `--control-l`. A value with no token stays and joins `checks/exceptions.json` with a selector, a property, a value, and a reason. A drawn window's fixed geometry is a legitimate exception; say so in the reason.

- [ ] **Step 3: Inline styles**

The document's markup holds inline `style` attributes. Delete each one and give its element a class that the document's own rules draw, except `--h` on a bar in a drawn chart, which carries data. A one-off width or height on a drawn window is geometry: keep it as a `style` attribute only when it names a `--` custom property; otherwise it becomes a class.

- [ ] **Step 4: The inventory check covers both**

In `checks/inventory.mjs`, the entry reads both files. For the sheet it scans from the "3. Components" comment, as today. For the document it scans from the end of the `/* /build:doc-chrome */` marker to the end of the stylesheet, so the generated regions stay out of scope. Print each finding with its file.

- [ ] **Step 5: Check, screenshot, commit**

Run `checks/run.sh; echo "exit $?"` → `exit 0`. Screenshot the three tabs of the document at 1400 wide light, 1400 wide dark, and 400 wide, and the same three from the copy at `<scratch>/retired/cristian-vega-products.html`. Look at every pair and describe what changed per tab.

```bash
git add -A
git commit -m "Let the products document's own rules read the system's tokens

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

**Gate 1:** the controller shows the user the before-and-after screenshots. The plan continues only after approval.

---

### Task 4: Every drawn window is a frame

**Files:**
- Modify: `cristian-vega-products.html`

- [ ] **Step 1: The frame**

Each drawn window is a `div.sk-app` with `g g--ink` or `g g--paper` on it, inside a `div.stage`. Rewrite each as:

```html
<div class="frame sk-app" data-mode="default" style="width:1440px;height:900px">
  <div class="frame__edge frame__edge--bar titlebar">…</div>
  <aside class="frame__edge sk-side">…</aside>
  <main class="frame__main sk-main">…</main>
</div>
```

The window's own parts keep their `sk-` classes. The ground classes `g g--ink` and `g g--paper` go; the mode's selectors give each region its ground. A part that must stay on ink inside a light region keeps an explicit `g g--ink`, for example a code block or a menu bar popover.

- [ ] **Step 2: The picture**

Each `figure.s-screen` carries `role="img"` and an `aria-label` that names the screen, for example `aria-label="OpenBuild screen 1, Home: the brief, the items that need a person, and the recent sessions"`. The drawn window sits inside `<div class="picture__body" inert>`. The existing `inert` attributes on `.sk-app` go; one inert body per screen replaces them.

- [ ] **Step 3: Native states**

Apply the 2.0.0 rules inside the drawn windows: `is-disabled` becomes the `disabled` attribute on a control or `aria-disabled="true"` on a menu item; `is-focus` becomes a marked example wrapper `div.example[data-state="focus"]`; `is-error` becomes `aria-invalid="true"`; `is-open` on a select becomes `data-state="open"`; `is-on` on an icon button becomes `aria-pressed="true"`. A `span` that draws a button becomes a `button`; a `div.input` gains a real `input`; a `div.select` gains a real `select`. After the pass these counts are zero: `grep -c 'is-disabled\|is-focus\|is-error\|class="switch is-on"\|<span class="btn\|<span class="menu-btn' cristian-vega-products.html`.

- [ ] **Step 4: Check, screenshot, commit**

Run `checks/run.sh; echo "exit $?"` → `exit 0`. Screenshot one screen per product at 1400 wide light and compare with Task 3's shots: the window must look the same, and its edge and main regions must paint the default mode's grounds.

```bash
git add -A
git commit -m "Draw every product window as a frame in default mode

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Every icon draws from the sprite

**Files:**
- Modify: `cristian-vega-products.html`

- [ ] **Step 1: Replace what matches**

Save as `<scratch>/products/use-icons.mjs` and run it from the repository root:

```js
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
let s = readFileSync('cristian-vega-products.html', 'utf8');
const norm = (x) => x.replace(/\s+/g, '');
const byBody = new Map();
for (const f of readdirSync('icons')) {
  const body = readFileSync(`icons/${f}`, 'utf8').replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  byBody.set(norm(body), f.slice(0, -4));
}
let n = 0; const unknown = [];
s = s.replace(/<svg class="ico"([^>]*)>([\s\S]*?)<\/svg>/g, (whole, attrs, body) => {
  const name = byBody.get(norm(body));
  if (!name) { unknown.push(norm(body).slice(0, 60)); return whole; }
  n++;
  const hidden = /aria-hidden/.test(attrs) ? ' aria-hidden="true"' : '';
  return `<svg class="ico"${hidden}><use href="#i-${name}"/></svg>`;
});
writeFileSync('cristian-vega-products.html', s);
console.log(n, 'icons replaced;', unknown.length, 'left inline');
for (const u of [...new Set(unknown)]) console.log('unknown:', u);
```

- [ ] **Step 2: Report the unknown icons**

Every unknown icon stays inline. List each in the report with its screen and what it draws. Do not add a file to `icons/` and do not change an icon's path data.

- [ ] **Step 3: Check, screenshot, commit**

Run `checks/run.sh; echo "exit $?"` → `exit 0`. Screenshot one screen per product and confirm every icon still draws.

```bash
git add -A
git commit -m "Draw the products document's icons from the sprite

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: The browser check covers the document

**Files:**
- Modify: `checks/browser.mjs`

- [ ] **Step 1: Split the run**

`checks/browser.mjs` runs its current checks on the sheet. Wrap them in a function that takes a page, then add a second pass that opens the document and asserts four things:

1. Every tab of the tab bar receives focus with the keyboard, and pressing it shows its panel.
2. A deep link opens its own tab: load the file with `#openwrite` and assert the OpenWrite panel is visible.
3. No control inside a `figure.s-screen` receives focus: count the tab stops inside a picture as problems, as the sheet's check does.
4. Each screen's frame paints the default mode's grounds: the edge reads `ink-deep` and the main region reads `surface`.

Print one line per assertion, as the sheet's pass does.

- [ ] **Step 2: Fault proofs**

Prove two faults on a copy outside the repository: remove `inert` from one picture body and add a real link inside it; the check reports a tab stop inside a picture. Change one frame's `data-mode` to `dark`; the check reports the wrong ground. Revert both and paste both outputs.

- [ ] **Step 3: Check and commit**

Run `npm run browser; echo "exit $?"` → `exit 0`, then `checks/run.sh; echo "exit $?"` → `exit 0`.

```bash
git add -A
git commit -m "Check the products document in the browser: tabs, deep links, pictures, modes

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: The document's text

**Files:**
- Modify: `cristian-vega-products.html`, `checks/text-report.mjs`, `checks/text-judge.mjs`

- [ ] **Step 1: The reports read both documents**

`checks/text-report.mjs` reads a file list, prints each finding with its file, and ends with one summary line. Its specimen strip gains the document's specimen classes: an element whose class starts with `sk-`, `stage`, or `picture` is specimen text. `checks/text-judge.mjs` adds the document to `DEFAULT_FILES`.

- [ ] **Step 2: The rewrite**

Run `node checks/text-report.mjs` and record the baseline. Rewrite the document's descriptive text, section by section, from the top: the masthead copy, each tab's brief, each section head, each screen's caption, each region table cell, each flow step, and each note. Keep every number, every class name, and every fact. Run the report after each section and stop when it prints zero.

- [ ] **Step 3: The judge**

Run `node checks/text-judge.mjs --files=cristian-vega-products.html --threshold=0.7` once. Read its list and fix what it finds that the rules cover. Paste its summary line in the report.

- [ ] **Step 4: Check, screenshot, commit**

Run `checks/run.sh; echo "exit $?"` → `exit 0`. Screenshot one screen per product with its region table at 1400 wide light.

```bash
git add -A
git commit -m "Rewrite the products document's descriptive text to the text rules

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

**Gate 2:** the controller shows the user the screenshots. The plan continues only after approval.

---

### Task 8: The release

**Files:**
- Modify: `README.md`, `CHANGELOG.md`, `tokens.json`, `cristian-vega-design-system.html`

- [ ] **Step 1: The sheet's Adoption band**

The Adoption table lists the products and what each one uses. Add a row for the document: the name `cristian-vega-products.html`, its tokens cell `the built system`, its fonts cell `the built system`, its state `current`, and its next step `none`.

- [ ] **Step 2: The readme**

Add a section `## The products document` after `## Check`: what the document is, that the build writes the system into it, how to change a screen (edit the document, run the build, run the checks), and that its drawn windows are pictures.

- [ ] **Step 3: The change log**

Add `## 2.1.0 · <today>` above `## 2.0.0`, holding the unreleased Geist line and three new parts: the display face, the document's move, and the document's adoption of the system. One line per task of this plan.

- [ ] **Step 4: The version and the tag**

Set `$extensions['cristian-vega'].version` to `2.1.0` and `date` to today in `tokens.json`. Set `package.json`'s version to `2.1.0`. Run `npm run build`; both documents' stamps follow. Run `checks/run.sh; echo "exit $?"` → `exit 0`, `npm run browser; echo "exit $?"` → `exit 0`, `node checks/text-report.mjs` → zero.

```bash
git add -A
git commit -m "Release 2.1.0: Geist, and the products document reads the system

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
git tag -a v2.1.0 -m "Design system 2.1.0"
```

**Accepted when:** the document holds no token block, no ground block, and no component rule of its own; the build writes four regions in each document and drift passes; every drawn window is a frame in default mode inside an inert picture; no alias class for a native state remains; every icon draws from the sprite or the report lists it; the text report prints zero for both documents; `checks/run.sh` exits 0; the user approved both gates.

---

## Plan self-review

**Spec coverage.** §4 home and files: Task 1 Step 1. §5 the built stylesheets: Task 1 Steps 2–4. §6 regions: Task 2. §7 the document's own rules: Task 3. §8 the screens: Task 4. §9 icons: Task 5. §10 text: Task 7. §11 checks: Task 2 Step 4, Task 3 Step 4, Task 6, Task 7 Step 1. §12 documents and release: Task 8. §13 order and gates: after Task 3 and Task 7. §14 acceptance: Task 8.

**Placeholders.** `<scratch>` is the scratch directory named in the Global Constraints. `<today>` is the release day. Task 3's raw-value pass and Task 7's rewrite cannot list every line in advance; each names its method, its check, and its stopping condition.

**Names used across tasks.** `extractSystem`, `extractChrome`, `injectProducts`, `readInputs`, `replaceRegion`, `renderIconSprite`, `stampVersion`, `checkMarkup`, `checkInventory`, `checkDrift`; the regions `system`, `doc-chrome`, `icons`; the files `dist/cristian-vega.css` and `dist/cristian-vega-doc.css`.
