# Two grounds, three modes

Date: 2026-09-17. Status: approved in conversation, section by section. Release: 2.0.0.

## 1. Goal

The sheet keeps two grounds: ink and surface. The paper ground goes away. A product frame carries one attribute, `data-mode`, with the value `default`, `dark`, or `light`. The mode maps each region of the frame to a ground. Components do not change. They read the ground they sit on.

The 1.2.0 spec (`2026-09-15-design-system-completion-design.md`) stays as the record of the last release. Its terms and rules hold unless this document changes them.

## 2. Terms

Use these words for these things. Do not use other words for them.

- A ground: one of the two color contexts on the sheet, surface and ink. A component reads its ground through the contract.
- Surface: the light ground. Its page is white.
- Ink: the dark ground. Its page is `#14181F`.
- The well: the recess tone of a ground. On surface it is `surface-well`; on ink it is `ink-well`.
- A mode: a map from the regions of a frame to grounds. The modes are `default`, `dark`, and `light`.
- A frame: the outer layout of a product. It has an edge region (sidebar, title bar, or masthead) and a main region (content).
- The contract: the set of `--g-*` names that a ground sets and a component reads. Unchanged from 1.2.0.
- The paper ground: the retired light ground of 1.x. The word "paper" does not appear on the sheet or in the token file after this work.

## 3. Scope

In scope:

- the token file and the stylesheet's ground blocks
- the frame rules, the light sidebar, and the Modes specimen
- the checks
- the sheet's descriptive text, the readme, the change log, and the tag

Out of scope:

- the products' code
- a system-appearance listener; a product sets the attribute
- the documentation chrome's own theme toggle, which does not change
- every backlog entry except "dark mode for the app frame", which this work delivers

## 4. Tokens

### 4.1 Ground values

| Key | Value | Role |
|---|---|---|
| `surface` | `#FFFFFF` | the light page |
| `surface-2` | `#F7F8FA` | a hover or zebra tint on surface |
| `surface-well` | `#F1F3F6` | the recess on surface: wells and the light edge; the 1.x paper value |
| `ink` | `#14181F` | the dark page |
| `ink-deep` | `#0F131A` | the dark edge |
| `ink-well` | unchanged | the recess on ink |

Removed: `paper` (its value becomes `surface-well`) and `panel` (`#E9ECF1`, the well on paper; no rule reads it after this work).

### 4.2 Renamed names

| 1.x name | 2.0.0 name |
|---|---|
| group `on-paper` | group `on-surface` |
| `focus-paper` | `focus-surface` |
| `ring-paper` | `ring-surface` |
| `mark2-paper` | `mark2-surface` |
| `grid-line-paper` | `grid-line-surface` |
| `.g--paper` | removed; the frames become `.g--surface` |

Every reference in the token file, every `var(--…)` in the stylesheet, and every `--doc-*` alias follows. The `line-control` description becomes "control boundary on surface and on the well, 3:1 or more; chosen by checks/contrast.mjs". Group descriptions say "surface" where they said "paper".

### 4.3 Count

The token file holds 163 tokens: 164 minus `paper` and `panel`, plus `surface-well`. `checks/tokens.test.mjs` and `checks/build.test.mjs` assert 163.

## 5. The contract and the frame rules

### 5.1 The surface block

The rule `.g--paper, .g--surface { … }` becomes `.g--surface { … }` and sets every name of the contract. Three names change value from the 1.x paper block:

- `--g-bg: var(--surface)`
- `--g-well: var(--surface-well)`
- `--g-line: var(--line)`

Every other name keeps the value the paper block set. The separate `.g--surface { --g-bg; --g-well; --g-line }` override rule goes away. The ink block does not change. `.g--deep` does not change.

### 5.2 The well modifier

`.g--surface.g--well { --g-bg: var(--surface-well); --g-well: var(--surface); --g-raise: var(--surface); }`

It is the mirror of `.g--deep`. A light sidebar and a light masthead use it. The ground is the recess tone. The wells and the raised rows are white.

### 5.3 The frame

Markup: `<div class="frame" data-mode="default"><aside class="frame__edge">…</aside><main class="frame__main">…</main></div>`. The title bar of an app and the masthead of a site are edge regions too.

Rules: the ground blocks gain frame selectors, so a mode copies no color.

- The ink block's selector list gains `.frame[data-mode="dark"] > .frame__main`, `.frame[data-mode="default"] > .frame__edge`, and `.frame[data-mode="dark"] > .frame__edge`.
- The `.g--deep` rule's selector list gains `.frame[data-mode="default"] > .frame__edge` and `.frame[data-mode="dark"] > .frame__edge`, so those edges are ink-deep.
- The surface block's selector list gains `.frame[data-mode="default"] > .frame__main`, `.frame[data-mode="light"] > .frame__main`, and `.frame[data-mode="light"] > .frame__edge`.
- The `.g--well` rule's selector list gains `.frame[data-mode="light"] > .frame__edge`, so that edge is the well tone.
- `.frame__edge { border-inline-end: 1px solid var(--g-line); }` A title bar or masthead edge uses `border-block-end` instead; the plan names the rule.

The mode map:

| Mode | Edge | Main |
|---|---|---|
| default | ink-deep | surface |
| dark | ink-deep | ink |
| light | surface-well | surface |

The generated ground-contract region prints these blocks, because the build renders the stylesheet slice.

### 5.4 Components

No component rule changes. A component reads `--g-*` names. On the sheet, light frames now sit on white with the gray well as their recess. Cards separate by hairline and the level-one shadow.

## 6. The light sidebar and the light masthead

- The Lists section shows the sidebar twice: on `g--ink g--deep`, as today, and on `g--surface g--well`.
- On the well ground the sidebar reads these names:
  - item text `--g-muted`, 13 px Plex Sans; group labels `--g-meta`
  - the active row and the hovered row take `--g-raise`, which is white
  - count chips are meta text with a line border
  - state dots use the teal and amber dot tokens; the streaming dot is ember
  - the meter track is `--g-raise` and its fill is the brand gradient
  - the "new" control is a bordered fg control
- The masthead of a site is an edge region. It is a `surface-well` band with a line under it. It holds the brand mark in its light form. Its nav links look as the Navigation section shows them on surface. The sheet shows it inside the Modes specimen's title bar, not as a separate component.
- A product's sidebar in light mode is this specimen. A product's sidebar in default and dark mode is the ink-deep specimen.

## 7. The Modes specimen

- Placement: the Layouts section, before the wireframes.
- Markup: three `figure.picture` elements, one per mode. Each holds a `div.frame[data-mode]` with an edge and a main region. The edge is a short sidebar strip and a title bar. The main region holds one card and one input. Each picture carries `role="img"` and an `aria-label` that names the mode and its two grounds. The bodies are inert, as every picture on the sheet.
- A table beside them, in a `d-table` wrapper. One row per mode, with the columns Mode, Edge ground, Main ground, Recess, and Seam.
- The caption: "A component reads its ground. A frame reads its mode. The mode maps the edge and the main region to grounds. It adds no color." Then the rule that a product sets `data-mode` from a setting or from the system appearance.
- The Frame principle in the Principles section becomes: "An app has one frame with an edge and a main region. The mode maps them to grounds. Default is ink at the edge and surface in the middle."

## 8. Checks

- Contrast: every "on paper" pair becomes an "on surface" pair with `surface` as the background. Each of them gets a twin with `surface-well` as the background, which is the value the old pair measured. The boundary pairs cover `line-control` on `surface`, `surface-well`, and `surface-2` at 3:1. The set grows from 44 to about 55 pairs; every pair passes today.
- The ground test on the sheet shows three frames: `g--surface`, `g--surface g--well`, and `g--ink`.
- Browser check: the boundary section reads surface, well, and ink; surface and well expect `line-control`, ink expects `mast-line-strong`. A new Modes section reads the computed `--g-bg` of the edge and the main region inside each mode picture. It compares them to the mode table's tokens.
- Tests:
  - the count becomes 163
  - the group is `on-surface`
  - a new test asserts that the word "paper" appears in no key, value, or description of the token file
  - the same test asserts that no class name on the sheet and no `--` name in the stylesheet contains "paper"
- Drift, inventory, markup: unchanged. The text report prints zero after the text changes. The text judge runs once at the end as a report.

## 9. Documents

- The sheet: every sentence that says "three grounds" or "paper" changes to the two-ground words. The Colors table columns "Text on paper" and "Background on paper" become "Text on surface" and "Background on surface". The note contract column "Value on Paper" becomes "Value on surface". The Frame principle and the Modes caption are new text. The printed contract follows from the build.
- This spec's terms apply to the sheet's descriptive text and to the documents. The text rules of the 1.2.0 spec, section 5, apply.
- `README.md`: the backlog loses "Dark mode for the app frame". The check instructions do not change.
- `CHANGELOG.md`: `## 2.0.0 · <date>` opens with the breaking changes in plain words. It names the paper ground and the panel value as removed and lists the renamed names as a table. Then one line per task, the mode table, and the check outputs.
- The 1.2.0 spec is not edited. The design page of the 1.2.0 spec is not edited.

## 10. Order of work and approval gates

1. Tokens, the surface block, the well modifier, and the frames of the sheet from paper to surface. Then the build. Then the checks that name grounds: the contrast pairs, the ground test, the browser check's boundary grounds, and the tests. Gate 1: before-and-after screenshots of the Inputs, Cards, and Feedback sections at three sizes. The sizes are 1280 wide light, 1280 wide dark, and 400 wide. The user approves the white light ground before the work continues.
2. The frame rules and the Modes specimen with its table and caption. The Frame principle. The browser check's Modes section.
3. The light sidebar frame in the Lists section. Gate 2: screenshots of the sidebar pair and the Modes specimen at the three sizes. The user approves.
4. The paper test, the sheet's text, the readme, the change log, the tag `v2.0.0`.

Every task ends with `checks/run.sh` exiting 0.

## 11. Acceptance

- The token file names no paper and holds 163 tokens; the build reproduces the sheet and `dist/` (drift passes).
- `.g--paper` appears nowhere; every light frame is `.g--surface`; the ground test shows surface, well, and ink.
- The three mode pictures render the mode table's grounds, and the browser check proves it.
- The light sidebar frame renders on the well tone with white raised rows.
- Every contrast pair passes; the text report prints zero; `checks/run.sh` exits 0.
- The user approved gate 1 and gate 2.

## 12. Backlog changes

- Removed: "Dark mode for the app frame", delivered here.
- Added: "A system-appearance listener that sets `data-mode`", trigger: a product ships light and dark mode.

## 13. Version

2.0.0, because a ground class and five token names go away. No product has adopted the tokens yet, so nothing breaks in practice; the number tells future adopters that names moved.
