# Design System Completion: Design

Date: 2026-09-15, revision 3: Style Dictionary as the build
Status: revised, written for review
Applies to: `cristian-vega-design-system.html` (the sheet), version 1.1

## 1. Goal

Make the Cristian Vega design system complete and dependable for the sheet it has today. After this work, one token file is the source of every token value. A build writes the sheet from it. Every simple control on the sheet is a native element. Every promise in the descriptive text has a rule, a specimen, or a recorded deferral. One command proves all of this on every change.

The apps and the sites do not change in this work. They adopt the system later, and each adoption adds its own checks there.

## 2. Terms

Use these words for these things. Do not use other words for them.

- The repository: the git repository at `~/Projects/design-system/`.
- The sheet: the file `cristian-vega-design-system.html` at the root of the repository.
- The token file: `tokens.json` at the root of the repository.
- The build: Style Dictionary, run through `build/config.mjs`, followed by `build/inject.mjs`. Both run with `npm run build`.
- The checks: the Node scripts in `checks/`, run by the one command `npm run check`, which `checks/run.sh` calls.
- Descriptive text: the captions, notes, headings, table cells, and the do and do not lists on the sheet.
- Specimen text: the product copy inside a component specimen, for example a button label.
- A marked example: a specimen wrapped in `<div class="example" data-state="…">`. It shows a state the sheet cannot enter on its own, such as focus.
- A simple control: a control with a native element: button, text input, textarea, select, checkbox, radio, switch, dialog.
- A composite widget: a control made of several parts with its own keyboard rules: tabs, menu, popover list, palette.
- A ground: one of the three color contexts on the sheet: paper, surface, and ink.
- The contract: the set of `--g-*` names that a ground sets and a component reads.
- The text rules: the writing rules in section 5.
- The document: the note that OpenWrite renders on the screen. It is not the sheet.

## 3. Decisions recorded

- Home: the system moves into its own repository at `~/Projects/design-system/` before change 1. The sheet moves to the repository root. The source folder's contents move to the repository root. The maintainer is the owner of the `cristianvega-ai` repositories.
- Dark mode: this work removes the concept. The sheet keeps its statement that version 1 has no app-wide dark mode. The backlog records it with the trigger "an app must follow system appearance".
- No migration table. The old names are gone from the sheet. The console aliases stay until a product adopts the system.
- The build is Style Dictionary 5, the standard token build. One short Node script then writes the sheet's marked regions. Node 24 is the floor. The checks and the tests use Node too, so the repository has one toolchain.
- The checks arrive with the build, in change 1. Every later change extends them.
- The text rules apply to the descriptive text on the sheet and to this document. Code comments and scripts use plain language. No script counts words.
- No Swift output, no SF Symbols mapping, and no composite widget behavior in this work. The backlog records each with its trigger. Swift output is one more platform in the build configuration when its trigger comes.

## 4. Repository and files

```
design-system/
  cristian-vega-design-system.html   the sheet: handwritten source with four generated regions
  tokens.json                       the source of every token
  package.json                      pins style-dictionary 5.5 and playwright 1.63; defines build, check, browser
  build/
    config.mjs                      the Style Dictionary configuration: one platform, dist/tokens.css
    inject.mjs                      writes the four regions of the sheet from dist/, icons/, and the stylesheet
  checks/
    run.sh                          the one command: tests, inventory, contrast, markup, drift
    inventory.mjs                   fails on a raw value in a component rule
    contrast.mjs                    fails on a pair under its limit
    markup.mjs                      fails on an unbalanced tag
    drift.mjs                       fails when the sheet or dist/ differ from a fresh build in a temporary folder
    browser.mjs                     tab order, focus ring, and rendered boundaries with Playwright; the last step of the checks
    exceptions.json                 each allowed raw value: selector, property, value, reason
    *.test.mjs                      unit tests, run by node --test
  fonts/                            the local latin woff2 files
  icons/                            sixteen vector image files, one per icon name
  dist/tokens.css                   the product :root, identical to the sheet
  docs/superpowers/specs/, plans/   this document, its page, the review, the plan
  CHANGELOG.md                      what changed in each version
  README.md                         how to build, check, and change the sheet
```

The move removes the `.claude/checks/` folder in `~/Projects`. It also removes the folder `~/Projects/cristian-vega-design-system-src/`.

The sheet is handwritten source with four generated regions. The build owns the content between each marker pair and nothing else. A marker inside the stylesheet is a stylesheet comment. A marker in the body is a markup comment.

| Region | Markers | Content |
|---|---|---|
| Product tokens | `/* build:tokens */` … `/* /build:tokens */` inside `:root` | the product custom properties |
| Token block | `<!-- build:token-block -->` … `<!-- /build:token-block -->` in the Adoption band | the same list, marked up for reading |
| Ground contract example | `<!-- build:ground-contract -->` … `<!-- /build:ground-contract -->` in the Adoption band | the live ground rules, copied from the stylesheet |
| Icon sprite | `<!-- build:icons -->` … `<!-- /build:icons -->` at the top of `body` | one `symbol` per icon file |

In plain words, the build fills four places in the sheet. They are the token list inside the stylesheet, the printed token list, the printed ground contract, and the icon drawings. Everything else on the sheet is handwritten.

The `--doc-*` tokens sit in `:root` after the closing token marker. They are not in the token file.

The inject script must find exactly one complete pair per region. It rejects a missing, duplicate, or reversed marker before it writes anything.

The version and the release date live in the token file. The inject script writes both into the masthead and the footer as `v<version> · <date>`. The same inputs give the same output on any day.

## 5. Text rules

Descriptive text on the sheet and this document follow these rules:

- A sentence has one topic and 20 words or fewer.
- Use the active voice. Say who does what.
- One instruction in each sentence. Start an instruction with the verb.
- Use the same word for the same thing. Section 2 lists the words.
- Write "must" for a requirement. Write "can" for a possibility. Do not write "should".
- Do not use an acronym. Write the words. A class name, a token name, or a file extension is not an acronym.
- Separate a short usage instruction from detailed reference material. The instruction comes first.

Specimen text does not change. Code comments and scripts use plain language and consistent names. No script enforces these rules.

## 6. Tokens

### 6.1 Format

A token is one named value: a color, a size, a spacing step, a radius, a shadow, or a duration. The name is what a rule on the sheet uses. The value lives only in the token file. Example: the token `fs-ui` has the value `13px`. The build writes `--fs-ui: 13px;` into the sheet. The rule `.btn--mini { font-size: var(--fs-ui); }` reads the name and never repeats the number.

The token file is a `.json` file that holds one object. It uses groups for organization and one entry per token. A group is an object with a `$description` and its tokens. A token is an object with `$type`, `$value`, and an optional `$description`.

The key of a token is its custom property name without the leading dashes. `fs-ui` makes `--fs-ui`. `space-3` makes `--space-3`. `mast-text` makes `--mast-text`. A name transform in `build/config.mjs` names the property after the key, the last segment of the path. Style Dictionary's default would prefix the group name. Keys are unique across the whole file.

The types are bounded to what the sheet holds today:

| `$type` | `$value` | Examples on the sheet |
|---|---|---|
| `color` | a hex or `rgba()` string, as written | `#14181F`, `rgba(255,255,255,.1)` |
| `dimension` | a number with `px` or `em` | `13px`, `-0.028em` |
| `number` | a number | `1.6`, `.45`, `40` |
| `fontFamily` | a font stack string | `"Space Grotesk", system-ui, …` |
| `shadow` | the shadow list string, as written | `0 1px 2px rgba(20,24,31,.04), …` |
| `duration` | a number with `ms` | `150ms` |
| `cubicBezier` | the function string | `cubic-bezier(.2,.7,.2,1)` |
| `border` | the border shorthand string | `2px solid {crimson}` |
| `expression` | a local type: any other value, copied as written | `clamp(38px, 4.9vw, 60px)`, `linear-gradient(102deg, #D42A3C 0%, #F2792B 100%)` |

A value can reference another token with its path in braces: `{brand.crimson}`. The build writes a reference as `var(--crimson)`, because the configuration keeps references in the output. A reference to a missing path is an error, and Style Dictionary stops. A `$type` outside the table fails the drift check, which validates the token file before it builds.

The inject script writes a group's `$description` as a comment line before the group. Style Dictionary writes a token's `$description` as a comment after the declaration.

### 6.2 Names and values

The token file holds the 158 product tokens that the sheet's `:root` holds today, with their current names and values. Change 1 extracts them from the sheet and does not redesign them. The build must produce those 158 names. It also produces `line-control` from section 7 and the five layer tokens from section 10.

The token file carries `$extensions['cristian-vega'].version` and `$extensions['cristian-vega'].date`. The first values written by the build are `1.2.0` and the release date.

### 6.3 Outputs

`npm run build` runs Style Dictionary, then the inject script. Style Dictionary reads the token file and writes `dist/tokens.css`, which is `:root { … }` with the product declarations. The inject script reads `dist/tokens.css`, the token file, `icons/`, and the live stylesheet. It writes the four regions of the sheet listed in section 4. It also writes the version and the date in the masthead and the footer.

`npm run build` prints each file it wrote and exits 0. It exits 1 on a marker error or a reference error.

## 7. Control boundaries and the contract

The Web Content Accessibility Guidelines, success criterion 1.4.11, set a limit of 3:1. The limit applies to the visual information that identifies a control or its state, against the adjacent colors. The rule does not ask for a contrasting perimeter on every text button.

Today the boundaries do not meet that. The input, select, and textarea read `--g-line`. That is `#DEE2E9` on paper (1.2:1), `#E8EBF1` on surface (1.1:1), and 10% white on ink (1.3:1). The check, radio, and switch read `--g-line-strong`: `#C6CDD8` (1.4:1 on paper, 1.6:1 on white). The select hover restores `--g-line-strong`.

The fix goes into the contract:

- Add `line-control` to the product tokens. Its value is the lightest gray that measures 3:1 or more on paper (`#F1F3F6`) and on white. The contrast check chooses and records it.
- Add `--g-line-control` to the contract. Paper and surface set it to `var(--line-control)`. Ink sets it to `var(--mast-line-strong)`, which measures 3.2:1 on ink.
- These boundaries read `--g-line-control`: `.input`, `.select`, `.textarea`, `.check i`, `.radio i`, and the track of `.switch i` when off. The select hover reads it too. Every other use of `--g-line` and `--g-line-strong` stays.
- Focus, error, and checked keep their own colors: the focus color, red, and the signal.

The contrast check gets one pair per boundary per ground at the 3:1 limit, named by token. The browser check reads the rendered border color of each control on all three grounds. It reads the default, hover, focus, checked, and error states. It compares each color to the expected token value.

The task ends with a before and after screenshot of the Inputs section on the three grounds. You approve the look before the task counts as done.

## 8. Controls

### 8.1 Simple controls

Each simple control specimen becomes its native element. The state comes from the element. The sheet keeps no `is-*` alias for a native state. A native state is disabled, focus, error, open on a select, or on for a toggle or an icon button. Model-driven classes such as `is-selected` and `is-active` stay, per the naming rule.

| Specimen today | Native element | State |
|---|---|---|
| `span.btn`, `span.gbtn`, `span.icon-btn`, `span.menu-btn` | `button` with the same class | `:hover`, `:active`, `:disabled`, `:focus-visible` |
| `div.input` | `div.field` with `label`, `input`, and the hint or error | `:focus-within`, `:has(:disabled)`, `:has([aria-invalid="true"])` |
| `div.textarea` | `textarea` | `:focus-visible`, `:disabled`, `[aria-invalid="true"]` |
| `div.select` | `select` | `:focus-visible`, `:disabled` |
| `span.switch` | `label` around `input[type="checkbox"][role="switch"]` | `:has(:checked)`, `:has(:disabled)` |
| `span.check`, `span.radio` | `label` around `input[type="checkbox"]` or `input[type="radio"]` | `:has(:checked)`, `:has(:disabled)` |
| `div.dialog` | `dialog.dialog[open]` | none on the sheet |

Rules for the conversion:

- A label names its control. A hint or an error is linked with `aria-describedby`. An error sets `aria-invalid="true"`.
- The secret field is a `div.field` with a `label` for the input and two sibling buttons. The label does not wrap the buttons.
- A disabled control carries the `disabled` attribute. The caption says that a disabled control is not in the tab order.
- The dialog shows open as a static example. The caption says that a product opens it with `showModal()`, which traps focus, closes on Escape, and returns focus.
- A state the sheet cannot enter on its own, such as focus or hover, shows inside a marked example. The example wrapper is documentation, not a production hook. The rule reads `.input:focus-within, .example[data-state="focus"] .input`.

### 8.2 Composite widgets

Tabs, menus, popover lists, and the palette need keyboard behavior and related containers that the sheet does not implement. The sheet shows them as static pictures.

- A composite specimen is wrapped in `figure` with `role="img"` and an `aria-label` that names it. It carries no widget role.
- The Feedback caption's table (section 10) states the required keyboard behavior for each composite widget.
- The caption says: the sheet does not implement this behavior. A product implements it and tests it there.
- The backlog records "working examples of composite widgets" with the trigger "a product needs one".

### 8.3 Checks

`checks/browser.mjs` tabs through the sheet and records each element that receives focus. Every enabled simple control must receive focus and show the focus ring. No disabled control may receive focus. The script also reads the rendered boundary colors from section 7.

## 9. Fonts and icons

### 9.1 Fonts

- `fonts/` holds the latin woff2 files for the weights the sheet uses:
  - Space Grotesk 500, 600, and 700. The 600 and 700 weights can share one file, as they do today in cristianvega.ai.
  - IBM Plex Sans 400, 400 italic, 500, and 600.
  - IBM Plex Mono 400, 500, and 600.
- Five files come from `cristianvega.ai/src/assets/fonts/`. The other files come from the Google Fonts style sheet endpoint, which serves one latin file per weight.
- The sheet replaces the Google Fonts link with `@font-face` rules. Each rule has `font-display: swap` and `src: url("fonts/<file>.woff2")`. The path resolves from the sheet, which sits in the same folder as `fonts/`.
- Each face gets a fallback face. The sans faces fall back to `src: local("Helvetica Neue")`. The mono face falls back to `src: local("Menlo Regular"), local("Menlo-Regular")`. A `local()` source needs the face's full name or its PostScript name. The metric overrides `size-adjust`, `ascent-override`, `descent-override`, and `line-gap-override` sit on the fallback face only.
- A temporary virtual environment with fontTools measures the overrides once. The environment is not kept. The measured values and the command go into `fonts/README.md`.
- The sheet must render with the local files only, with no network.

### 9.2 Icons

- `icons/` holds sixteen vector image files, one per icon name. Each file is the current path data on a 16-unit grid, with no fill and a 1.5 stroke.
- The build reads the folder and writes one inline sprite into the icon region. Each icon is a `symbol` with the identifier `i-<name>`.
- Every inline icon on the sheet becomes `<svg class="ico"><use href="#i-<name>"/></svg>`. The sheet still opens from disk.
- The Icons caption drops the promise of a system symbol mapping. The backlog records "SF Symbols names" with the trigger "a native app adopts the system".

## 10. Layers and overlays

- The `layer` group makes `--z-drawer`, `--z-popover`, `--z-toast`, `--z-dialog`, and `--z-tip`. The values are 10, 20, 30, 40, and 50.
- `.dialog`, `.pal`, `.pop`, `.menu`, `.toast`, and `.tip` read their token.
- A modal dialog sits in the browser's top layer. No `z-index` puts an element from the page above it. A tip or a toast that must show over a modal dialog renders inside the dialog element. The Feedback caption states this.
- The Feedback caption becomes a table with one row per overlay: drawer, menu, popover, toast, dialog, palette, tip. The table also has one row for tabs, which is not an overlay. A reader then sees every keyboard rule in one place. The columns are:
  - anchor and offset
  - what opens it
  - what closes it
  - keyboard behavior
  - where focus goes
  - where focus returns
  - scrim
  - layer
- Every cell has a value. A cell that has no value reads "none".

## 11. Naming rule

The do and do not list gets one item. The item says: `is-on` is a toggle state. `is-active` is the current place. `is-selected` is one of many. `is-open` is a disclosure. Use them for visual state that a product sets from its own model, never in place of a native state.

## 12. Completeness audit

- A task reads all descriptive text on the sheet. It lists each component, size, or behavior that the text names and that has no rule and no specimen.
- Known today:
  - the drawer
  - the reader toolbar at 46 pixels
  - the tip position
  - the popover offset
  - the 840-pixel narrow container
  - the document padding of 48 and 44 pixels
  - the system symbol mapping for icons
- Each item gets one of three outcomes. The first is a rule and a specimen on the sheet. The second deletes the promise from the text. The third is a backlog entry with a trigger. Delete a promise that no current component needs. No name stays without an outcome.
- The list of items and their outcomes goes into the change log. The backlog lives in `README.md`.

## 13. Checks and tests

`checks/run.sh` calls `npm run check`, which runs these steps in order and exits 1 if any step fails:

1. The unit tests: `node --test checks/`.
2. `inventory.mjs`: fails when a component rule holds a raw pixel or hex value that is not in `exceptions.json`. Each exception names a selector, a property, a value, and a reason. The reason names the change that removes it, or says "permanent".
3. `contrast.mjs`: reads the token file, resolves references, and measures each listed pair. A pair names two tokens, a purpose, and a limit. Text pairs use 4.5:1. Boundary pairs use 3:1. A pair under its limit fails.
4. `markup.mjs`: fails on an unbalanced tag in the sheet.
5. `drift.mjs`: validates the token file, then runs the build into a temporary folder outside the repository. It fails on a duplicate key or a `$type` outside the table. It fails when any of the four sheet regions, `dist/tokens.css`, or the version and date differ from that build.

The checks never write a file inside the repository. The checks do not read the app or site files.

The inject script, the drift check, and the contrast check have unit tests with the Node test runner. Write each test before the code it tests.

`checks/browser.mjs` runs with `npm run browser`. That command uses the pinned Playwright 1.63 and the Chromium that `npx playwright install chromium` installs. It is the last step of `npm run check`, so `checks/run.sh` runs it. A missing Chromium prints the install command and exits 1. Change 2 records its output in the change log.

A task that changes something visible ends with three screenshots of the affected specimens. The widths are 1280 pixels in light, 1280 pixels in dark, and 400 pixels. A task that changes only text ends with the checks.

## 14. The three changes

| Change | Content | Accepted when |
|---|---|---|
| 1. Source and checks | The repository. `package.json` with pinned versions. The token file extracted from the sheet. Style Dictionary and the inject script with valid markers. The four regions. `dist/tokens.css`. All five checks and their tests. `exceptions.json` with a reason per entry. | Two builds in a row give identical output. Every existing value is preserved. The three intentional faults fail their checks. `run.sh` exits 0. |
| 2. Current controls | `--g-line-control` on three grounds. Native simple controls. Marked examples for forced states. Composite widgets as static pictures with their keyboard table. | `browser.mjs` shows every enabled simple control in the tab order with the ring and the expected boundary color per state and ground. You approved the before and after. `run.sh` exits 0. |
| 3. Assets and documentation | Local fonts with fallback faces. The icon sprite. The layer tokens and the overlay table. The naming rule. The completeness audit. The text rules applied to all descriptive text. The change log and `README.md` for 1.2.0. | The sheet renders with no network. The generated regions match the build. The audit lists no open item. `run.sh` exits 0. |

Each change is one reviewable unit. Each change updates the sheet, the token file, the checks, and this document's page together.

## 15. Backlog

Each entry has a trigger. No entry starts before its trigger.

| Entry | Trigger |
|---|---|
| Dark mode for the app frame | an app must follow system appearance |
| `DesignTokens.swift` output, one more platform in `build/config.mjs` | a native app adopts the system |
| SF Symbols names for the sixteen icons | a native app adopts the system |
| Working examples of composite widgets | a product needs one |
| A published package and product-side checks | a product adopts the system |
| Continuous integration for `run.sh` | the repository gets a remote |

## 16. Out of scope

- Changes to the apps and the sites.
- A migration table.
- Dark mode in any form.
- JavaScript on the sheet beyond the existing index and motion toggle.
- Behavior for composite widgets.

## 17. Done

The work is done when:

- The repository exists, holds the sheet and the sources, and has the change log for 1.2.0.
- The token file is the source. The build writes the four regions and `tokens.css`. `drift.mjs` passes.
- Every simple control specimen is a native element with native states. `browser.mjs` confirms the tab order and the ring.
- `--g-line-control` measures 3:1 or more on all three grounds, and you approved the look.
- The sheet renders with local fonts and one inline icon sprite, with no network.
- The layer tokens exist and the overlay table has no empty cell.
- The naming rule is on the sheet.
- The completeness audit lists no open item, and the backlog has a trigger per entry.
- All descriptive text follows the text rules.
- `checks/run.sh` exits 0.
