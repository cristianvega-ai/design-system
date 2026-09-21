# Two Grounds, Three Modes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Retire the paper ground, make surface the only light ground, and add a frame attribute `data-mode` (default, dark, light) that maps a frame's edge and main regions to grounds.

**Architecture:** The ground contract (39 `--g-*` names) stays. The `.g--surface` block takes the whole contract; a `.g--well` modifier mirrors `.g--deep`; the ground blocks gain frame selectors so a mode copies no color. The checks learn the two grounds and the mode table. The sheet's text loses the word "paper".

**Tech Stack:** Node 24, Style Dictionary 5.5.3, Playwright 1.63.0, the existing `checks/` scripts.

**Spec:** `docs/superpowers/specs/2026-09-17-two-grounds-three-modes-design.md` (the authority). Terms and text rules of `docs/superpowers/specs/2026-09-15-design-system-completion-design.md` still apply where the new spec does not change them.

## Global Constraints

- The repository is `~/Projects/design-system/`. The sheet is `cristian-vega-design-system.html` at its root. Every path below is relative to that root. Work on branch `two-grounds`.
- Four generated regions are never edited by hand: `/* build:tokens */`…`/* /build:tokens */` in `:root`, `<!-- build:token-block -->`, `<!-- build:ground-contract -->` (rendered from the stylesheet slice between the `.g { background` rule and the `.mono {` rule; the literal `  .g { background` anchor must stay), and `<!-- build:icons -->`. After a change to `tokens.json` or to that slice, run `npm run build` and commit the sheet and `dist/` together.
- The token file holds 163 tokens after Task 1: 164 minus `paper` and `panel`, plus `surface-well`. Group `on-paper` becomes `on-surface`. Renamed keys: `focus-paper` → `focus-surface`, `ring-paper` → `ring-surface`, `mark2-paper` → `mark2-surface`, `grid-line-paper` → `grid-line-surface`. Values do not change.
- The contract names do not change. `.g--surface` sets all 39. `--g-bg: var(--surface)`, `--g-well: var(--surface-well)`, `--g-line: var(--line)`; every other name keeps the value the paper block set.
- The mode table: default = edge ink-deep, main surface; dark = edge ink-deep, main ink; light = edge surface-well, main surface.
- Component rules use tokens only; a raw pixel or hex value in a component rule is a finding (the inventory check enforces it; `1px` borders and `50%` radii are already allowed).
- The checks never write a file inside the repository. Scratch files go in `/private/tmp/claude-501/-Users-cvega-Projects/c70fd5ed-c36c-4648-b52f-da4ec4ec4866/scratchpad/`.
- Descriptive text on the sheet and in the documents follows the text rules: one topic and 20 words or fewer per sentence; active voice; "must" for a requirement, "can" for a possibility, never "should"; no acronym (a class, token, attribute, element, or method name, a command, or a file extension is not one); the same word for the same thing (the terms in the spec, section 2). Specimen text does not change. After this work the word "paper" appears in no key, value, or description of `tokens.json`, in no class name on the sheet, and in no `--` name in the stylesheet. Descriptive text says "surface" and "the well".
- A task that changes something visible ends with screenshots of the affected specimens at 1280 wide light, 1280 wide dark (`data-theme="dark"` on the root element), and 400 wide, taken with Playwright from a throwaway script in the scratchpad (import `chromium` from `/Users/cvega/Projects/design-system/node_modules/playwright/index.mjs`; `reducedMotion: 'reduce'`; open the sheet from disk; wait for `document.fonts.ready`; never an MCP browser tool). A text-only task ends with the checks.
- Every task ends with `checks/run.sh` exiting 0 and `node checks/text-report.mjs` printing `0 long sentences, 0 acronyms`.
- Two approval gates: after Task 1 (the white light ground) and after Task 3 (the light sidebar and the Modes specimen). The controller shows the user the screenshots; the plan does not continue past a gate without approval.
- Commit after every task. Commit messages end with `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

## File Structure

| Path | Responsibility | Task |
|---|---|---|
| `tokens.json` | ground values, renamed names, group `on-surface` | 1 |
| `cristian-vega-design-system.html` | stylesheet blocks, frames, the Modes specimen, the light sidebar, captions | 1, 2, 3, 4 |
| `dist/tokens.css` | generated | 1 |
| `checks/contrast.mjs` | pairs on surface and on the well | 1 |
| `checks/browser.mjs` | boundary grounds; Modes section | 1, 2 |
| `checks/tokens.test.mjs`, `checks/build.test.mjs` | count 163; the renamed focus token; the no-paper test | 1, 4 |
| `README.md`, `CHANGELOG.md` | backlog swap; 2.0.0 | 4 |

---

### Task 1: Retire the paper ground

Everything that names a ground changes together, so the checks pass at the end of the task.

**Files:**
- Modify: `tokens.json`, `cristian-vega-design-system.html`, `checks/contrast.mjs`, `checks/browser.mjs`, `checks/tokens.test.mjs`, `checks/build.test.mjs`
- Generated: `dist/tokens.css`, the four regions

**Interfaces:**
- Produces: token keys `surface-well`, `focus-surface`, `ring-surface`, `mark2-surface`, `grid-line-surface`; group `on-surface`; the class `g--well`; the pair set on surface and on the well; the browser check's grounds `surface`, `well`, `ink`.

- [ ] **Step 1: Tests first**

In `checks/tokens.test.mjs` change the title and the assertion from 164 to 163. In `checks/build.test.mjs` change `assert.equal(decls.length, 164)` to 163 and the line `assert.match(css, /^\s*--focus-paper: 2px solid var\(--crimson\);/m, …)` to `--focus-surface`. Run `npm test` → both tests FAIL (the file still holds 164 and `--focus-paper`).

- [ ] **Step 2: The token file**

In `tokens.json`:
- In group `ground`: delete the `panel` token. Rename the key `paper` to `surface-well` and keep its value `#F1F3F6`; give it `"$description": "the recess on surface: inputs, wells, the light edge"`. Place it after `surface-2`.
- Rename the group `on-paper` to `on-surface`; its description becomes `"text and lines on surface. The sites' --meta (#586173) is --muted here."`. Inside it rename `mark2-paper` to `mark2-surface`. Change the `line-control` description to `"control boundary on surface and on the well, 3:1 or more; chosen by checks/contrast.mjs"`.
- In group `focus`: rename `focus-paper` to `focus-surface` and `ring-paper` to `ring-surface` (values unchanged).
- In group `on-ink`: rename `grid-line-paper` to `grid-line-surface`.
- `grep -c 'paper\|panel' tokens.json` → 0. `grep -o '{[a-z-]*\.[a-z0-9-]*}' tokens.json | sort -u` must show no reference to a removed or renamed key.

Run `npm test` → the count test passes (163); the build test still fails until Step 4 rebuilds.

- [ ] **Step 3: The stylesheet**

In the sheet's stylesheet (outside the generated regions):
- Documentation chrome: `--doc-bg: var(--paper)` → `--doc-bg: var(--surface-well)`; `--doc-focus: var(--focus-paper)` → `--doc-focus: var(--focus-surface)`.
- The block `.g--paper, .g--surface {` becomes `.g--surface {` and its three values change: `--g-bg: var(--surface)`, `--g-well: var(--surface-well)`, `--g-line: var(--line)` (the line value is already `var(--line)`, so only `--g-bg` and `--g-well` change text). Also `--g-mark2: var(--mark2-surface)`, `--g-focus: var(--focus-surface)`, `--g-ring: var(--ring-surface)`.
- Delete the override rule `.g--surface { --g-bg: var(--surface); --g-well: var(--paper); --g-line: var(--hairline); }`.
- After the `.g--deep { --g-bg: var(--ink-deep); }` rule add:

```css
  .g--well { --g-bg: var(--surface-well); --g-well: var(--surface); --g-raise: var(--surface); }
```

- `.g--paper .apv__cmd, .g--surface .apv__cmd {` → `.g--surface .apv__cmd {`.
- `.wire .w--paper { background: var(--paper); color: var(--muted); }` → `.wire .w--main { background: var(--surface-well); color: var(--muted); }`; `.wire--overlay { … background: var(--paper); … }` → `background: var(--surface-well)`.
- `grep -c 'var(--paper)\|var(--panel)\|var(--focus-paper)\|var(--ring-paper)\|var(--mark2-paper)' cristian-vega-design-system.html` → 0 outside the generated regions (the regions still hold the old names until Step 4).

- [ ] **Step 4: The markup and the build**

- Replace every ` g--paper` class token with ` g--surface` (44 frames; use a global replace of the string `g--paper` → `g--surface`; then check that no element carries `g--surface` twice: `grep -c 'g--surface g--surface'` → 0).
- Replace every `w--paper` class with `w--main` in the wireframes.
- The ground test (`div.ground-test` in the masthead): its three frames become `g g--ink`, `g g--surface`, and `g g--surface g--well`, in that order; each `.g-name` label says `ink`, `surface`, `well`; the `aria-label` becomes `The same set of components on an ink ground, a surface ground, and the well.`
- The Components heading `Every component, on paper and on ink.` becomes `Every component, on surface and on ink.`; the Colors heading `Ink, paper, crimson, ember.` becomes `Ink, surface, crimson, ember.`; the sentence `The ground test below proves it: one markup, three grounds.` becomes `The ground test below proves it: one markup, two grounds, three frames.`
- Run `npm run build`. The token region, the token block, the ground contract, and `dist/tokens.css` now carry the new names. Run `npm test` → PASS, every test.

- [ ] **Step 5: The contrast pairs**

In `checks/contrast.mjs` replace the pairs that name `paper` or `panel`:

```js
  { fg: 'fg', bg: 'surface', purpose: 'body text on surface', limit: 4.5 },
  { fg: 'fg', bg: 'surface-well', purpose: 'body text on the well', limit: 4.5 },
  { fg: 'muted', bg: 'surface-well', purpose: 'muted text on the well', limit: 4.5 },
  // keep: muted on surface, muted on surface-2
  { fg: 'meta', bg: 'surface-well', purpose: 'meta text on the well', limit: 4.5 },
  // keep: meta on surface
  { fg: 'meta', bg: 'raise', ground: 'surface', purpose: 'meta text on the raised tint', limit: 4.5 },
  { fg: 'crimson', bg: 'surface-well', purpose: 'links on the well', limit: 4.5 },
  // keep: links on surface
  { fg: 'crimson-dark', bg: 'ember-bg', ground: 'surface', purpose: 'live chip text on surface', limit: 4.5 },
  { fg: 'teal', bg: 'surface', purpose: 'teal text on surface', limit: 4.5 },
  { fg: 'teal', bg: 'surface-well', purpose: 'teal text on the well', limit: 4.5 },
  { fg: 'red', bg: 'surface', purpose: 'danger button text on surface', limit: 4.5 },
  { fg: 'red', bg: 'surface-well', purpose: 'danger button text on the well', limit: 4.5 },
  { fg: 'red', bg: 'red-bg', ground: 'surface', purpose: 'failed chip text', limit: 4.5 },
  { fg: 'crimson', bg: 'surface', purpose: 'focus ring on surface', limit: 3 },
  { fg: 'crimson', bg: 'surface-well', purpose: 'focus ring on the well', limit: 3 },
  { fg: 'line-control', bg: 'surface', purpose: 'control boundary on surface', limit: 3 },
  { fg: 'line-control', bg: 'surface-well', purpose: 'control boundary on the well', limit: 3 },
```

Rules: a pair that had `bg: 'paper'` becomes `bg: 'surface-well'` (the same value it measured) and gains a twin with `bg: 'surface'` unless that twin already exists; a pair that had `bg: 'panel'` becomes `bg: 'surface-well'` (drop it if the well pair now exists); `ground: 'paper'` becomes `ground: 'surface'`. Every other pair stays. Update the header comment if it names paper. Run `node checks/contrast.mjs` → `contrast: ok, N pairs` (about 52); a failing pair is a finding, not a value to tune.

- [ ] **Step 6: The browser check's grounds**

In `checks/browser.mjs`: the `expect` map keys become `surface`, `well`, `ink` with `well` equal to the old `paper` entry; the boundary loop list becomes `[['surface', '.spec.g--surface:has(.input input)'], ['ink', '.spec.g--ink:has(.input input)'], ['well', '.ground-test .g--well']]`; update the comments that name paper. Run `npm run browser; echo "exit $?"` → `browser: ok`, `exit 0`.

- [ ] **Step 7: Checks, screenshots, commit**

Run `checks/run.sh; echo "exit $?"` → `exit 0`. Run `node checks/text-report.mjs` → `0 long sentences, 0 acronyms`. Take before (from `git show main:cristian-vega-design-system.html` written to the scratchpad) and after screenshots of the Inputs, Cards, and Feedback sections at the three sizes; look at them: light frames now sit on white with gray wells; nothing on ink changed. `grep -c -i 'paper' tokens.json` → 0; `grep -c 'g--paper' cristian-vega-design-system.html` → 0.

```bash
git add -A
git commit -m "Retire the paper ground: surface is the light ground, the well is its recess

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

**Gate 1:** the controller shows the user the before-and-after screenshots. The plan continues only after approval.

---

### Task 2: The frame rules and the Modes specimen

**Files:**
- Modify: `cristian-vega-design-system.html` (the ground blocks' selector lists, the frame rules, the Layouts section, the Principles Frame item), `checks/browser.mjs` (a Modes section)

**Interfaces:**
- Produces: `div.frame[data-mode]` with `.frame__edge` and `.frame__main`; the mode table on the sheet; the browser check's Modes section.

- [ ] **Step 1: The frame selectors on the ground blocks**

Inside the ground-contract slice:
- The ink block's selector list (the rule that starts `.g--ink, .code, .toast, .tip, …`) gains `.frame[data-mode="dark"] > .frame__main, .frame[data-mode="default"] > .frame__edge, .frame[data-mode="dark"] > .frame__edge`.
- `.g--deep { --g-bg: var(--ink-deep); }` becomes `.g--deep, .frame[data-mode="default"] > .frame__edge, .frame[data-mode="dark"] > .frame__edge { --g-bg: var(--ink-deep); }`.
- `.g--surface {` becomes `.g--surface, .frame[data-mode="default"] > .frame__main, .frame[data-mode="light"] > .frame__main, .frame[data-mode="light"] > .frame__edge {`.
- `.g--well {` becomes `.g--well, .frame[data-mode="light"] > .frame__edge {`.
- After the `.g--well` rule add, still inside the slice (before `.mono {`):

```css
  .frame__edge, .frame__main { background: var(--g-bg); color: var(--g-fg); }
```

Do not touch the `  .g { background` anchor line.

- [ ] **Step 2: The frame layout rules**

In the components part of the stylesheet, after the `.spec--side` rules:

```css
  .frame { display: grid; grid-template-columns: var(--space-9) 1fr; grid-template-rows: var(--control-m) 1fr; min-height: calc(var(--space-9) * 2); border: 1px solid var(--doc-hairline); border-radius: var(--radius-lg); overflow: hidden; font-size: var(--fs-meta); }
  .frame__edge { display: flex; flex-direction: column; gap: var(--space-2); padding: var(--space-2) var(--space-3); border-inline-end: 1px solid var(--g-line); }
  .frame__edge--bar { grid-column: 1 / -1; flex-direction: row; align-items: center; border-inline-end: 0; border-block-end: 1px solid var(--g-line); }
  .frame__main { padding: var(--space-3); display: grid; align-content: start; gap: var(--space-2); }
  .frame__item { padding: var(--space-0) var(--space-2); border-radius: var(--radius-xs); color: var(--g-muted); }
  .frame__item.is-active { background: var(--g-raise); color: var(--g-fg); }
```

Run `node checks/inventory.mjs` → `inventory: ok`.

- [ ] **Step 3: The Modes specimen**

In the Layouts section (`id="layouts"`), before the `<div class="d-grid d-grid--2">` that holds the wireframes, insert:

```html
      <div class="d-sub" id="c-modes"><h3>Modes</h3><span class="sub">.frame[data-mode] · .frame__edge · .frame__main</span></div>
      <div class="rowx rowx--loose rowx--top">
        <figure class="picture" role="img" aria-label="Default mode: an ink-deep edge and a surface main region"><div class="picture__body" inert><div class="frame" data-mode="default"><div class="frame__edge frame__edge--bar"><b>OpenWrite</b></div><aside class="frame__edge"><span class="frame__item is-active">Notes</span><span class="frame__item">Tags</span><span class="frame__item">Trash</span></aside><main class="frame__main"><div class="card"><h4>Weekly sync</h4><p>Notes from the call.</p></div><div class="input"><input value="Search notes" aria-label="Search notes"></div></main></div></div></figure>
        <figure class="picture" role="img" aria-label="Dark mode: an ink-deep edge and an ink main region"><div class="picture__body" inert><div class="frame" data-mode="dark">…the same inner markup…</div></div></figure>
        <figure class="picture" role="img" aria-label="Light mode: a well edge and a surface main region"><div class="picture__body" inert><div class="frame" data-mode="light">…the same inner markup…</div></div></figure>
      </div>
      <div class="d-table d-table--wrap">
        <table>
          <caption class="vh">Modes: edge ground, main ground, recess, seam</caption>
          <thead><tr><th scope="col">Mode</th><th scope="col">Edge ground</th><th scope="col">Main ground</th><th scope="col">Recess</th><th scope="col">Seam</th></tr></thead>
          <tbody>
            <tr><td class="k">default</td><td>ink-deep</td><td>surface</td><td>the well on surface; ink-well on the edge</td><td>a tone change</td></tr>
            <tr><td class="k">dark</td><td>ink-deep</td><td>ink</td><td>ink-well</td><td>a tone change</td></tr>
            <tr><td class="k">light</td><td>surface-well</td><td>surface</td><td>white on the edge; the well on surface</td><td>a hairline</td></tr>
          </tbody>
        </table>
      </div>
      <p class="d-cap"><b>frame</b> · A component reads its ground. A frame reads its mode. The mode maps the edge and the main region to grounds. It adds no color. A product sets <code>data-mode</code> from a setting or from the system appearance. The edge holds the sidebar, the title bar, or the masthead; the main region holds the content.</p>
```

Write the "same inner markup" out in full in the file (no ellipsis). Use the `.card` markup pattern the Cards section uses (adapt the tag names; specimen text as shown).

- [ ] **Step 4: The Layouts head and the Frame principle**

- The Layouts heading `Ink at the edges. Paper in the middle.` becomes `Ink at the edge. Surface in the middle.`; the intro sentence `Each one puts navigation and agents on ink and puts the user's content on paper or surface.` becomes `Each one puts navigation and agents on the edge and the user's content in the main region. The mode maps them to grounds.`
- The Frame principle item: `<b>Frame</b> · an app has one frame: ink at the edges, paper in the middle. v1 has no app-wide dark mode. The theme toggle on this sheet recolors documentation chrome only.` becomes `<b>Frame</b> · an app has one frame with an edge and a main region. The mode maps them to grounds. Default is ink at the edge and surface in the middle. The theme toggle on this sheet recolors documentation chrome only.`

- [ ] **Step 5: The browser check's Modes section**

In `checks/browser.mjs`, after the boundary section, add a Modes section: for each `figure.picture .frame[data-mode]`, read the computed `backgroundColor` of `.frame__edge` (the aside) and `.frame__main` and compare, through the `rgba()` normalizer, to `color('ink-deep')`/`color('surface')` for default, `color('ink-deep')`/`color('ink')` for dark, `color('surface-well')`/`color('surface')` for light. Print one line per mode; each mismatch is a problem. Fault proof: temporarily change `data-mode="dark"` to `"light"` on the second picture, run `npm run browser` → a `dark edge` or `dark main` problem, `exit 1`; revert with `git checkout -- cristian-vega-design-system.html`.

- [ ] **Step 6: Build, checks, screenshots, commit**

Run `npm run build` (the slice changed), `checks/run.sh; echo "exit $?"` → `exit 0`, `node checks/text-report.mjs` → zero. Screenshot the Modes specimen and its table at the three sizes; look at them: three frames, the mode table fits at 1280 and scrolls at 400.

```bash
git add -A
git commit -m "Add the frame with data-mode and the Modes specimen

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: The light sidebar

**Files:**
- Modify: `cristian-vega-design-system.html` (the Lists section: a second sidebar frame, the `spec__k` labels, the side caption, the side note)

- [ ] **Step 1: The second frame**

Duplicate the block `<div class="spec spec--side g g--ink g--deep">…</div>` (about lines 1843–1858; it holds the "new" control, the group labels, the items, the tags, and the meter). The copy follows the original and has the classes `spec spec--side g g--surface g--well`. Its `spec__k` reads `side · surface, well`; the original's reads `side · ink-deep`. Specimen text inside does not change.

- [ ] **Step 2: The rules the light sidebar needs**

Check the sidebar rules against the well ground: `.side-item:hover` and `.side-item.is-active` read `--g-raise` (white on the well); the meter track reads `--g-raise`; chips and dots read their tag and dot names. If a sidebar rule reads a hard-coded ink value (for example `var(--ink-2)` or `var(--mast-…)`), change it to the contract name that gives the same value on ink (`--g-well`, `--g-raise`, `--g-line`) so the light copy renders. List every rule you changed in the report.

- [ ] **Step 3: The caption and the side note**

- The Lists caption's `<b>side</b> · the app sidebar on ink-deep.` becomes `<b>side</b> · the app sidebar. On ink-deep in default and dark mode; on the well in light mode.` Keep the rest of the sentence group.
- The side note `The sidebar has one ground: ink-deep. There is no paper form.` becomes `The sidebar has two forms: ink-deep, and the well in light mode.` Keep the rest of the note.

- [ ] **Step 4: Checks, screenshots, commit**

Run `checks/run.sh; echo "exit $?"` → `exit 0`; `node checks/text-report.mjs` → zero. Screenshot the Lists section's sidebar pair and the Modes specimen at the three sizes; look at them: the light sidebar sits on the gray well tone with a white active row, white meter track, slate chips, teal and amber dots.

```bash
git add -A
git commit -m "Show the sidebar on the well for light mode

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

**Gate 2:** the controller shows the user the sidebar pair and the Modes specimen screenshots. The plan continues only after approval.

---

### Task 4: The paper test, the text, the documents, the tag

**Files:**
- Create: `checks/paper.test.mjs`
- Modify: `cristian-vega-design-system.html` (descriptive text), `README.md`, `CHANGELOG.md`

- [ ] **Step 1: The paper test, red first**

```js
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
```

Run `node --test checks/paper.test.mjs` → PASS already if Tasks 1–3 were complete; prove the test by temporarily adding `class="paper"` to one element → FAIL; revert.

- [ ] **Step 2: The sheet's descriptive text**

`grep -n -o -i '[^.>]*\bpaper\b[^.<]*' cristian-vega-design-system.html | grep -v '^[0-9]*:  '` lists every remaining sentence and cell (about 120, many in tables). For each: "on paper" → "on surface" when it names the light page; "paper" → "the well" when it names the recess tone; a table column `Text on paper` → `Text on surface`, `Background on paper` → `Background on surface`, `Value on Paper` → `Value on surface`. Specimen text does not change (a specimen never says paper today; verify). The eyebrow "Ink, surface, crimson, ember." and the tokens' printed descriptions come from the build. After the pass, `grep -c -i '\bpaper\b' cristian-vega-design-system.html` → 0. Run `node checks/text-report.mjs` → zero.

- [ ] **Step 3: README and CHANGELOG**

- `README.md`: remove the backlog row `| Dark mode for the app frame | an app must follow system appearance |`; add `| A system-appearance listener that sets data-mode | a product ships light and dark mode |`.
- `CHANGELOG.md`: rename `## Unreleased` to `## 2.0.0 · <today>` and keep the text judge line under it. Above that line add a `Breaking changes` list: the paper ground removed (`.g--paper` frames are `.g--surface`); the panel value removed; a table of renamed names (the four tokens and the group). Then `Modes`: the mode table. Then one line per task 1–4. Then the browser check's output lines.
- Text rules on every new sentence.

- [ ] **Step 4: Final run, tag**

Run `checks/run.sh; echo "exit $?"` → `exit 0`; `npm run browser; echo "exit $?"` → `exit 0`; `node checks/text-report.mjs` → zero; `node checks/text-judge.mjs --files=cristian-vega-design-system.html --threshold=0.7` once and paste its summary line in the report (a report, not a gate). Screenshot the masthead, the Inputs section, and the Modes specimen at the three sizes; keep them outside the repository.

```bash
git add -A
git commit -m "Release 2.0.0: two grounds, three modes

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
git tag -a v2.0.0 -m "Design system 2.0.0"
```

**Accepted when:** the token file names no paper and holds 163 tokens; drift passes; `.g--paper` appears nowhere; the ground test shows surface, well, and ink; the three mode pictures render the mode table's grounds and the browser check proves it; the light sidebar renders on the well; every contrast pair passes; the text report prints zero; `checks/run.sh` exits 0; the user approved gate 1 and gate 2.

---

## Plan self-review

**Spec coverage.** §4 tokens: Task 1 Steps 1–2. §5.1–5.2 surface block and well: Task 1 Step 3. §5.3 frame: Task 2 Steps 1–3. §5.4: no component rule changes (Task 1 Step 3 touches only ground and wire rules). §6 sidebar: Task 3; masthead: shown as the frame's title bar in Task 2. §7 Modes specimen: Task 2 Steps 3–4. §8 checks: Task 1 Steps 5–6, Task 2 Step 5, Task 4 Step 1. §9 documents: Task 4 Steps 2–3. §10 order and gates: after Task 1 and Task 3. §11 acceptance: Task 4 Step 4. §12 backlog: Task 4 Step 3. §13 version: Task 4 Step 4.

**Placeholders.** `<today>` in Task 4 is the release day. The "same inner markup" note in Task 2 Step 3 tells the implementer to write the markup out; the first picture shows it in full.

**Names used across tasks.** `g--well`, `frame`, `frame__edge`, `frame__edge--bar`, `frame__main`, `frame__item`, `surface-well`, `focus-surface`, `ring-surface`, `mark2-surface`, `grid-line-surface`, `on-surface`; the browser check's ground keys `surface`, `well`, `ink`; the test file `checks/paper.test.mjs`.
