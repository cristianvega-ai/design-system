# Change log

## Unreleased

### The technical standard

- `technical-standard/git.md` holds the git standard: branches, commits, merges, and releases. The branch rules move there from `AGENTS.md`, which points to the file.

## 1.0.0 · 2026-09-22

This is the first public release.

### The repository

- The repository is the root of two standards. The visual standard in `visual-standard/` holds the sheet, the products document, and the token file. It also holds the build, the checks, `dist/`, the fonts, and the icons. The technical standard in `technical-standard/` holds the documentation standard and its templates.
- `docs/` holds the repository's records in four folders, `prd/`, `specs/`, `adr/`, and `plans/`, each with an index. The first records are there: the requirements document, the spec, the plan, and the decision record for the source format.
- `docs/glossary.md` holds the approved words. The text judge reads them from it.
- `AGENTS.md` holds the instructions for coding agents. It names Simplified Technical English as the standard for the text rules. It sets one standard for branch names and bans a trailer on a commit message.
- `README.md` holds the steps to build, check, and release a version.

### The brand

- The accent is cool. Azure `#0369A1` anchors the light ground and carries signal text. Sky `#38BDF8` lights the dark ground and carries the focus ring. The gradient runs between them.
- The token names follow the hue: `azure`, `azure-dark`, and `sky`. The two light tints for text on ink are `mist` and `mist-2`.
- Measured: azure reads 5.93:1 on white as signal text, and sky reads 8.69:1 on ink as the focus ring. Azure-dark reads 7.56:1, and the two tints 14.02:1 and 11.16:1. All 49 contrast pairs hold.
- The signal button and the danger button are different colors. The one action in a view and the destructive action never look alike.
- The accent shares no family with a status. Green is success, amber is warning, red is error, and the brand is blue.
- The system takes the person's name. The sheet is `cristian-vega-design-system.html`. The products document is `cristian-vega-products.html`. The built stylesheets are `dist/cristian-vega.css` and `dist/cristian-vega-doc.css`. The header the build writes into every generated file names the person. The token file's metadata namespace is `$extensions['cristian-vega']`.
- The mark is diagonal: two 16 px rings in one box. The first sits at the top left and the second at the bottom right, so the box gives the offset. Six places size the mark and follow it: the lockup, the large form, and the small form. The application icon, the menu bar icon, the favicon, and the agent avatar follow it too.
- The wordmark joins the two names with no space and marks the join with tone. The given name takes the meta color and the family name takes the foreground. An `<i>` carries the given name, because a `<span>` inside the wordmark means the product suffix and takes weight 500.
- Measured on both grounds at both wordmark sizes: the given name reads 6.83:1 on ink and 5.54:1 on surface. The family name reads 15.16:1 and 17.79:1.
- The accessible name keeps the space, so a screen reader says two names. File names keep the two words apart, because they are paths, not the wordmark.
- The products are OpenBuild, OpenWrite, and OpenDictate, and their sites sit under the personal domain.

### Components

- The eyebrow's dash rides in the text flow. A label that wraps to two lines keeps the dash on the first line at any width.

### Adoption

- cristianvega.ai is adopted. It reads the token names, the azure accent, Geist, the diagonal mark, and the joined wordmark. It keeps three layout names the system does not define: `--footer-height`, `--footer-reserve`, and `--gutter`. It ships no Plex Sans 500 or 600, because no rule there reads them.

### The products document

- The masthead and the tab bar together fill the first screen. A person lands on the whole masthead with the bar at its foot. The page script measures the bar. The masthead subtracts that height, so the two fill the screen at every width.
- The bar lifts a shadow when it leaves the masthead. It pins to the top as a lift, not as a jump.
- The document resets its own tab buttons, because no ground holds them. A tab has a resting state, a hover state, and a selected state. The selected state raises the tab above its gradient line.
- A deep link lands below the bar. The scroll offset includes the bar's height.
- OpenDictate's cancel rule holds only when the person keeps history on. Descriptive rules and cancellation announcements carry the condition, and the drawn examples state that history is on.
- OpenWrite's prose column matches the rendered layout. Inside the frame border, the Reader is 928 px at rest and 628 px with the agent pane open. With 56 px padding on each side, the prose reaches 760 px and then 516 px. The open pane caps both measure choices, and the document states that limit. The Reader widths read from the agent pane, not from a run, because an approval opens the pane too.
- The source paths name the standalone product folders beside this repository.

### Checks

- The browser check asserts the first screen and the tab buttons' own look. It asserts the selected tab's raised state and the bar's pinned mark. It also measures all three OpenWrite Note drawings, with the agent shown and with its track removed.
- The text report reads the sheet, the products document, and any Markdown file passed as an argument.
