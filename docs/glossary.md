---
title: Glossary
date: 2026-09-22
---

# Glossary

Use these words for these things. Do not use other words for them. The text judge reads this file.

- The repository: the git repository that holds the design system.
- The sheet: the file `cristian-vega-design-system.html` in `visual-standard/`.
- The products document: the file `cristian-vega-products.html` in `visual-standard/`. It draws the screens of the three products.
- The token file: `tokens.json` in `visual-standard/`.
- The build: Style Dictionary, run through `build/config.mjs`, followed by `build/inject.mjs`. Both run with `npm run build`.
- The checks: the Node scripts in `checks/`, run by the one command `npm run check`, which `checks/run.sh` calls.
- Descriptive text: the captions, notes, headings, table cells, and the do and do not lists on the sheet.
- Specimen text: the product copy inside a component specimen, for example a button label.
- A marked example: a specimen wrapped in `<div class="example" data-state="…">`. It shows a state the sheet cannot enter on its own, such as focus.
- A simple control: a control with a native element: button, text input, textarea, select, checkbox, radio, switch, dialog.
- A composite widget: a control made of several parts with its own keyboard rules: tabs, menu, popover list, palette.
- A ground: one of the two color contexts on the sheet: surface and ink.
- The contract: the set of `--g-*` names that a ground sets and a component reads.
- The text rules: the writing rules in `README.md`.
- The document: the note that OpenWrite renders on the screen. It is not the sheet.
