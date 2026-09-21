# Cristian Vega design system

## The repository

This repository holds the Cristian Vega design system. The sheet, `cristian-vega-design-system.html`, holds every token, component, and rule. `tokens.json` is the token file, the source of every token. The build reads the token file and writes `dist/tokens.css` and four regions of the sheet. The checks confirm the sheet, the token file, and the build agree. `AGENTS.md` holds the instructions for coding agents.

## Build

Run `npm install` once to fetch the pinned tools. Run `npm run build` to write `dist/tokens.css` and the sheet's four generated regions. The build needs Node 24 or newer.

## Check

Run `checks/run.sh` to run every check, including the browser check. Install Chromium once with `npx playwright install chromium`. Run `npm run browser` to check the rendered states alone. Run `node checks/text-report.mjs` for the text report.

Run `node checks/text-judge.mjs` for the text judge. It sends every descriptive sentence of the sheet and the documents to TypeSafe's System One model. It asks four questions per sentence: passive voice, more than one topic, another word for an approved term, and detail before the instruction. It prints the sentences at or above the threshold, worst first. It is a report for a person to read, not a check. It needs a key in `TYPESAFE_API_KEY` or in `~/.config/typesafe/api_key`, and a network connection. Options: `--threshold=0.5`, `--limit=40`, `--files=README.md,CHANGELOG.md`.

## The products document

The products document, `cristian-vega-products.html`, draws each product's screens.
The build writes the system into the document.
`npm run build` writes four regions of the document: `build:system`, `build:doc-chrome`, `build:icons`, and the two version stamps.
Never edit inside a region.
Edit the document outside the regions to change a screen.
Run the build and the checks.
Commit the document together with `dist/`.
Every drawn window is a picture.

## Change a token

Edit `tokens.json` to change a token. Run `npm run build`. Run `checks/run.sh`. Commit the sheet and `dist/` together with the token file.

## Add an icon

Add an svg file to `icons/` for the new icon. Add its name to the Icons strip and its caption. Run `npm run build`.

## Record an exception

Add the raw value to `checks/exceptions.json` to record an exception. Name the selector, the property, and the value. The reason must say why the checks allow the value. The reason must name the change that removes it, or say `permanent`.

## Release a version

Move the entries under `Unreleased` in `CHANGELOG.md` to a heading with the new version and the date. Set the version and the date in `tokens.json`. Set the version in `package.json` and in `package-lock.json`. Set the version that `checks/tokens.test.mjs` expects. Run `npm run build` to write the version stamps. Run `checks/run.sh`. Commit, then tag the commit with the version, for example `v1.0.0`.

## Text rules

The rules come from ASD-STE100 Simplified Technical English.

- Keep one topic and 20 words or fewer in every sentence.
- Write every sentence in the active voice.
- Give one instruction per sentence, starting with the verb.
- Use "must" for a requirement, "can" for a possibility, and never "should."
- Use no acronym.
- Use the same word for the same thing.

## Backlog

Each entry has a trigger. No entry starts before its trigger.

| Entry | Trigger |
|---|---|
| A system-appearance listener that sets `data-mode` | a product ships light and dark mode |
| `DesignTokens.swift` output, one more platform in `build/config.mjs` | a native app adopts the system |
| The system symbol names for the sixteen icons | a native app adopts the system |
| Working examples of composite widgets | a product needs one |
| A drawer component | a product needs the drawer |
| Document layout tokens: padding, the 46 px toolbar, the 46 px footer | OpenWrite adopts the system |
| A published package and product-side checks | a product adopts the system |
| Continuous integration for `run.sh` | the repository gets a remote |
| Fold the ground-keyed overrides into the contract | the next release that touches a ground |
| A trash symbol for the sixteen icons | a product needs a delete control in the system |
| The drawn screens' own strings follow the text rules | a product builds that screen |
| The products document in dark mode and light mode | a product ships the mode switch |
| Mark the end of the product system in the sheet, so the extraction follows intent | the next release that moves a rule between sections |
