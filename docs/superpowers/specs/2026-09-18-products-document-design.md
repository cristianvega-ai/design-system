# The products document joins the system

Date: 2026-09-18. Status: approved in conversation, section by section. Release: 2.1.0.

## 1. Goal

The products document shows how the three products use the design system. Today it holds its own copy of the system. It carries its own tokens, its own component rules, and markup from before release 2.0.0. This work makes it a reader of the system instead of a copy of it.

After this work the build writes the system into the document. A change to a token or a component rule reaches the document through `npm run build`. The checks cover the document as they cover the sheet.

The 2.0.0 spec (`2026-09-17-two-grounds-three-modes-design.md`) and the 1.2.0 spec stay as the record of their releases. Their terms and rules hold unless this document changes them.

## 2. Terms

These words join the list in the 1.2.0 spec, section 2.

- The sheet: `cristian-vega-design-system.html`. It defines the system.
- The document: `cristian-vega-products.html`. It shows the products that use the system.
- The system stylesheet: `dist/cristian-vega.css`. It holds the tokens, the grounds, and the component rules.
- The chrome stylesheet: `dist/cristian-vega-doc.css`. It holds the documentation tokens, the base rules, and the documentation furniture.
- A screen: one drawn product window in the document, inside a `figure.s-screen`.
- A region table: the table under a screen that names each numbered part of it.

## 3. Scope

In scope:

- the document's home, its history, and its build
- the two built stylesheets and the regions that carry them
- the document's own rules, its markup, its icons, and its text
- the checks, the readme, the change log, and the tag

Out of scope:

- the products' own code
- a published package; the backlog holds it
- new screens, new flows, or a new product
- the document's router, which keeps its current behavior

## 4. Home and files

- The document moves to the repository root as `cristian-vega-products.html`. Git records its history from the move on.
- The copy at `~/Projects/cristian-vega-products.html` goes. The folder `~/Projects/cristian-vega-schematics-src/` goes; its build script, its render script, and its report are superseded by this repository.
- The document keeps its own script, which drives the tabs, the deep links, and the stage fit.
- The document's masthead and footer carry the system's version and date, as the sheet does.

## 5. The built stylesheets

`build/config.mjs` keeps writing `dist/tokens.css`. `build/inject.mjs` gains an extraction step that writes two more files from the sheet's own stylesheet. The sheet stays the one source.

| File | Content | Source slice |
|---|---|---|
| `dist/cristian-vega.css` | the token block, then the grounds, then the components | `dist/tokens.css`, then the stylesheet from the "2. Grounds" comment to the "foundations specimens" comment |
| `dist/cristian-vega-doc.css` | the documentation tokens, the base rules, and the documentation furniture | the stylesheet from the "documentation chrome" comment to the "2. Grounds" comment |

Both files carry a first line that names the release and forbids hand edits. The chrome slice also carries the sheet's `.demo-frame` rules. They cost a few hundred bytes. No rule reads them in the document.

## 6. The document's regions

Four generated regions live in the document. Inside its `<style>` a marker is a stylesheet comment. In its body a marker is a markup comment.

| Region | Marker | Content |
|---|---|---|
| system | `/* build:system */` | `dist/cristian-vega.css` |
| chrome | `/* build:doc-chrome */` | `dist/cristian-vega-doc.css` |
| icons | `<!-- build:icons -->` | the sprite, as in the sheet |
| version | no marker | two stamps that read `v<version> · <date>` |

Each marker has its closing twin. The build writes each region and never touches the rest of the file. The drift check rebuilds into a temporary folder and compares every region of both documents.

## 7. The document's own rules

- The document deletes every rule it copied from the system: its token block, its ground blocks, and its component rules. The injected regions replace them.
- The document keeps the rules that only it needs. These are the tab bar, the section furniture, the screen figure, the stage, and the drawn window parts. Their names keep the prefixes `s-`, `sk-`, `stage`, `ob-`, `ow-`, and `od-`.
- Every kept rule reads a token or a `--g-*` name. The inventory check covers them, with the same exceptions file.
- Two tokens join `tokens.json` for the document's stage. `stage-max` is `1440px`, the widest drawn window. `stage-scale-floor` is `0.42`, the smallest the stage shrinks a window. The count becomes 165.
- Inline styles go, except `--h` on a bar in a drawn chart. That attribute carries data, not style.

## 8. The screens

- Every drawn window becomes a frame: `div.frame[data-mode="default"]` with `.frame__edge` for its sidebar or title bar and `.frame__main` for its content. A product can then show a screen in another mode without redrawing it.
- Every screen keeps its `figure.s-screen`, its caption, and its region table.
- A drawn window is a picture. The stage carries `role="img"` and a label. The figure keeps its caption and its region table as ordinary content. The stage holds an inert body, so no drawn control is a tab stop. A browser drops an inert subtree, so the role never sits on the inert body. Two figures draw a flowing strip with no stage; there the body carries the role and its own child carries `inert`.
- Controls inside a drawn window keep their real element. A button is a `button`. A field is an `input`. The 2.0.0 rules hold. No alias class names a native state. A pressed icon button carries `aria-pressed`. A disabled menu item carries `aria-disabled`.

## 9. Icons

- 157 of the icons in the document draw from the sprite, across 15 of the 16 symbols.
- The other 72 have no symbol in the system and stay inline.
- An icon whose drawing matches one of the sixteen becomes a `use` of that symbol.
- An icon that matches none of them stays inline, and the report lists it. A later decision adds it to `icons/` or removes it.

## 10. Text

- The document's descriptive text follows the text rules of the 1.2.0 spec, section 5. This covers its section heads, its notes, its captions, its region tables, and its flow steps.
- The words of the drawn screens are specimen text. They do not change.
- The text report and the text judge read both documents.

## 11. Checks

- Every check takes a list of files. `checks/run.sh` runs one command and covers both documents.
- The markup check reads both documents.
- The inventory check reads both documents. For the document it scans the rules outside the generated regions.
- The drift check rebuilds and compares the four regions of the sheet and the four of the document, plus `dist/`.
- The browser check opens both documents. On the document it asserts four things. The tab bar reaches each tab with the keyboard. A deep link opens its own tab. No drawn control is a tab stop. Each screen's frame paints the default mode's grounds.
- The contrast check does not change. The token pairs already cover every color the document draws.
- The text report and the judge read both documents.

## 12. Documents and release

- `README.md` gains one section: what the document is, how to change a screen, and how the build reaches it.
- `CHANGELOG.md` gains `2.1.0` with three parts. The first is the display face change from Geist. The second is the document's move into the repository. The third is the document's adoption of the system.
- The sheet's Adoption band names the document as an adopter, with its state.
- The release is 2.1.0. No token is removed and no name changes, so the release is a feature release.

## 13. Order of work and gates

1. The move, the history, and the two built stylesheets.
2. The document's regions, its deleted copies, and its kept rules. **Gate 1**: screenshots of the three tabs before and after. The user approves the look.
3. The screens as frames, the native controls, and the icons.
4. The text pass. **Gate 2**: screenshots of one screen per product with its region table. The user approves.
5. The checks, the readme, the change log, and the tag.

Every task ends with `checks/run.sh` exiting 0 and the text report printing zero.

## 14. Acceptance

- The document holds no token block, no ground block, and no component rule of its own.
- `npm run build` writes the four regions of both documents; drift passes.
- Every drawn window is a frame in default mode inside an inert picture.
- No alias class for a native state remains in either document.
- Every icon in the document draws from the sprite, or the report lists it as unknown.
- The text report prints zero for both documents.
- `checks/run.sh` exits 0. The user approved gate 1 and gate 2.

## 15. Backlog

- A published package that a product installs, so a product reads the system without this repository. Trigger: a product adopts the system in its own code.
- The drawn screens in dark mode and light mode. Trigger: a product ships the mode switch.
