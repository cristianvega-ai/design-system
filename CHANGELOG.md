# Change log

## 1.0.0 · 2026-09-21

This is the first public release. The public repository starts a new history at this version.

### The repository
- The version restarts at 1.0.0. The token file, the package file, and the version test all carry it.
- `AGENTS.md` holds the instructions for coding agents. It names ASD-STE100 as the standard for the text rules.
- `AGENTS.md` sets one standard for branch names: a type, a slash, and a short description.
- The README gains the steps to release a version.
- The entries under "Before the public release" keep the numbers of the private history. They record why each rule exists.

### The brand
- The accent moves from warm to cool. Azure `#0369A1` anchors the light ground and carries signal text. Sky `#38BDF8` lights the dark ground and carries the focus ring. The gradient runs between them.
- The names move with the hue, because a token called `ember` holding blue would lie. `crimson` is `azure`, `crimson-dark` is `azure-dark`, `ember` is `sky`, and the two light tints for text on ink, `peach` and `peach-2`, are `mist` and `mist-2`.
- Measured: azure reads 5.93:1 on white as signal text, sky reads 8.69:1 on ink as the focus ring, azure-dark 7.56:1 and the two tints 14.02:1 and 11.16:1. All 49 contrast pairs still hold.
- The signal button and the danger button are now different colors. Both were red before, so the one action in a view and the destructive action looked alike.
- The accent no longer shares a family with a status. Green is success, amber is warning, red is error, and the brand is blue.
- The system takes the person's name. Every OpenCatalyst string is now Cristian Vega, and the old name appears nowhere in the repository.
- The mark goes diagonal. Two 16 px rings still, but the first sits at the top left of its box and the second at the bottom right, so the box gives the offset. The six places that size the mark all follow: the lockup, the large and small forms, the application icon, the menu bar icon, the favicon, and the agent avatar.
- The sheet is `cristian-vega-design-system.html`. The document is `cristian-vega-products.html`. The built stylesheets are `dist/cristian-vega.css` and `dist/cristian-vega-doc.css`. The header the build writes into every generated file names the person.
- The token file's metadata namespace is `$extensions['cristian-vega']`.
- The wordmark joins the two names with no space and marks the join with tone. The given name takes the meta color and the family name takes the foreground. An `<i>` carries the given name, because a `<span>` inside the wordmark already means the product suffix and takes weight 500.
- Measured on both grounds at both wordmark sizes: the given name reads 6.83:1 on ink and 5.54:1 on surface, and the family name 15.16:1 and 17.79:1.
- The accessible name keeps the space, so a screen reader still says two names.
- File names keep the two words apart. They are paths, not the wordmark.
- The products keep their names. OpenBuild, OpenWrite and OpenDictate are unchanged, and their sites sit under the personal domain.
- The retired umbrella site leaves the Adoption band. `cristianvega.ai` already has its own row and takes over that site's role.
- The OpenDictate dictionary screen named the old brand as a pronunciation entry. It now names a product that still exists.

### Components
- The eyebrow's dash rides in the text flow instead of beside it. The eyebrow was an inline flex box with the dash centred against the whole box, so a label that wrapped to two lines left the dash floating in the gap between them. Both documents wrap that label at 360 px. The dash now sits on the first line at any width. Found by porting the system onto cristianvega.ai.

### Adoption
- cristianvega.ai is adopted. It reads the token names, the azure accent, Geist, the diagonal mark, and the joined wordmark. It keeps three layout names the system does not define, `--footer-height`, `--footer-reserve` and `--gutter`, and ships no Plex Sans 500 or 600, because no rule there reads them.

### The products document
- The masthead and the tab bar together fill the first screen, so a person lands on the whole masthead with the bar at its foot.
- The page script measures the bar. The masthead subtracts that height, so the two always fill the screen at every width.
- The bar lifts a shadow when it leaves the masthead, so it pins to the top as a lift and not as a jump.
- The document resets its own tab buttons. No ground holds them, so the system's button reset never reached them, and the browser drew its own grey button with text a person could not read.
- A tab now has a resting state, a hover state, and a selected state that raises the tab above its gradient line.
- A deep link lands below the bar. The scroll offset now includes the bar's height.

- OpenDictate's cancel rule no longer contradicts the History screen. The rule said that cancel keeps the text in History in every state, but the same screen has an off state and the settings have a switch to keep history. The rule now holds only when the person keeps history on. Descriptive rules and cancellation announcements now carry the condition. The drawn examples state that history is on. History-off announcements no longer promise storage.

- OpenWrite's prose column now matches the rendered layout. Earlier arithmetic missed the frame border, extra pane padding, and old width caps. The drawing gave 492 px with the agent open and 700 px with its track removed. The Reader no longer adds the frame component's padding to its own. The old caps are gone. Inside the frame border, the Reader is 928 px at rest and 628 px with the agent pane open. With 56 px padding on each side, the prose reaches 760 px and then 516 px. The open pane still caps both measure choices. The document states that limit.
- The Reader widths read from the agent pane, not from a run. A run always opens the pane, but an approval opens it too, so a run is not the condition.
- The source paths now name the standalone product folders beside this repository.

### Checks
- The browser check asserts the first screen, the tab buttons' own look, the selected tab's raised state, and the bar's pinned mark. It also measures all three OpenWrite Note drawings, with the agent shown and with its track removed.

## Before the public release

The entries below belong to the private history. Their numbers ran from 1.1 to 2.1.0 before the public repository restarted at 1.0.0.

## 2.1.0 · 2026-09-18

### The display face
- Geist replaces Space Grotesk as the display face.
- One Latin file carries a measured fallback face.
- The two Space Grotesk files and their license left `fonts/`.

### The products document
- The document moved into the repository.
- The build writes the system and the documentation chrome into two marked regions of the document.
- Its own rules read the system's tokens.
- Every drawn window is a frame in default mode inside an inert picture.
- 157 of its icons draw from the sprite, across 15 of the 16 symbols.
- The other 72 have no symbol in the system and stay inline. The backlog holds a trash symbol.
- Its descriptive text follows the text rules.

### The system
- A frame's regions now follow its mode at any depth.
- A product can show a screen in another mode without redrawing it.
- The picture rules moved into the components section, so a document can read them.
- The frame rules moved into the components section, so a product now gets the layout.
- The frame's border reads `--line`, a token every product has, not a documentation name.
- A pressed ghost button now draws the pressed state, as a pressed icon button does.
- Two stage tokens joined the token file.
- The documentation chrome gained a pin color.

### Checks
- Markup, inventory, drift, the browser check, and the two text reports now cover both documents.
- The vocabulary check fails on the retired ground and on a class that aliases a native state.
- Drift now compares `dist/cristian-vega.css` and `dist/cristian-vega-doc.css` against a fresh build.

## 2.0.0 · 2026-09-17

### Breaking changes
- 2.0.0 removes the paper ground. Every `.g--paper` frame is `.g--surface`. Surface is white. Its well, `surface-well`, is the recess on surface and the light edge. A new modifier, `.g--well`, puts a sidebar or a masthead on the well.
- A 1.x `.g--surface` frame drew its lines with `hairline`; its `--g-line` is now `line`, the firmer light line.
- 2.0.0 removes the `panel` value. No rule reads it.
- Renamed names:

| 1.x name | 2.0.0 name |
|---|---|
| group `on-paper` | group `on-surface` |
| `focus-paper` | `focus-surface` |
| `ring-paper` | `ring-surface` |
| `mark2-paper` | `mark2-surface` |
| `grid-line-paper` | `grid-line-surface` |

- OpenWrite's reader themes take the mode names. Paper, Slate, and Dusk become Default, Light, and Dark. Default follows the frame's mode. Light puts the reader on surface. Dark puts it on ink.

### Modes
A frame carries `data-mode` with the value `default`, `dark`, or `light`. A product sets it from a setting or from the system appearance.

| Mode | Edge | Main |
|---|---|---|
| default | ink-deep | surface |
| dark | ink-deep | ink |
| light | surface-well | surface |

### Tasks
- Task 1: the token file, the surface block, the well modifier, and every light frame from paper to surface. The contrast pairs, the ground test, the browser check, and the tests follow.
- Task 2: the frame rules with `data-mode`, the Modes specimen, its table and caption, and the browser check's Modes section.
- Task 3: the sidebar on the well in the Lists section, the light form of the ink-deep sidebar.
- Task 4: `checks/paper.test.mjs`, the sheet's descriptive text without paper, the readme, this change log, and the tag v2.0.0.

The browser check printed these mode lines at Task 4.

```
default mode: edge rgb(15, 19, 26), main rgb(255, 255, 255)
dark mode: edge rgb(15, 19, 26), main rgb(20, 24, 31)
light mode: edge rgb(241, 243, 246), main rgb(255, 255, 255)
browser: ok
```

### Final review
- A frame region behaves as its ground: every ground-keyed rule reaches the edge and the main region.
- The browser check reads the input's background in each mode picture and expects three pictures.
- The wires put the main pane on surface and the four-pane list pane on the well.
- The Modes table's Seam column names what the edge draws: a tone change and a line, or a line.
- Three contrast pairs on surface gain their well twins: meta on raise, the live chip, and the failed chip.
- The Breaking changes list notes that a `.g--surface` frame's `--g-line` moved from `hairline` to `line`.

### Reports
- `checks/text-judge.mjs`: a report on the four text rules no script can count. It asks TypeSafe's System One model one yes-or-no question per rule and sentence. It is not part of `run.sh`.

## 1.2.0 · 2026-09-16

### Change 1: source and checks
- Task 1: the repository and the sheet under version control.
- Task 2: `tokens.json` with the 158 tokens and `package.json` with the pinned tools.
- Task 3: the Style Dictionary build writing `dist/tokens.css`.
  - Style Dictionary's `css/variables` format writes `/**` comments; a post-build step in `build/config.mjs` normalizes them to `/*`. Task 3 anticipated a fallback for a reference that loses its `var()` form inside a longer value, for example `focus-paper`. This Style Dictionary version renders it correctly, so the build needs no fallback.
- Task 4: `build/inject.mjs` and `build/lib.mjs` writing the four generated regions and the version stamp.
- Task 5: `checks/run.sh` with inventory, contrast, markup, and `exceptions.json`.
  - `checks/exceptions.json` lists every allowed raw value with a reason.
- Task 6: the drift check, the tests, and the fault proofs.

### Change 2: current controls
- Task 7: `--line-control` (`#858D9D`, 3:1 or more on paper and white) and the ground name `--g-line-control`. Input, select, textarea, check, radio, and the switch track read it. Text buttons keep no perimeter.
- Task 8: composite widgets (tabs, theme menu, popovers, palette, sidebar, rows, transcript, gates) are inert pictures with a role and a label. The site nav links are real links.
- Task 9: every button specimen is a `button` element. The `disabled` attribute is the only disabled state. A pressed icon button carries `aria-pressed="true"`.
- Task 10: text fields, textareas, and selects are native controls with `label for`, `aria-describedby`, `aria-invalid`, `disabled`, and `readonly`. A state the sheet cannot enter shows in a marked example.
- Task 11: switch, check, and radio are native inputs inside labels. The `:has(:checked)` selector draws the state. The menu item uses `aria-disabled`.
- Task 12: the dialog is a `dialog` element shown open and static. The dismiss controls are buttons.
- Task 13: `npm run check` ends with the browser check: tab order, focus ring, and rendered boundaries.

The check printed these lines at Task 13. The final review later made the check stricter.

```
tab order: 145 stops, 144 expected, 10 disabled skipped, 0 without a ring
paper error border: rgb(179, 38, 30)
paper select hover border: rgb(20, 24, 31)
paper input border at rest: rgb(133, 141, 157); on focus: rgb(212, 42, 60)
ink error border: rgb(224, 133, 133)
ink select hover border: rgb(234, 237, 242)
ink input border at rest: rgba(255, 255, 255, 0.35); on focus: rgb(242, 121, 43)
surface input border at rest: rgb(133, 141, 157); on focus: rgb(212, 42, 60)
browser: ok
```

### Change 3: assets and documentation
- Task 14: nine Latin font files in `fonts/` with measured fallback faces. The sheet needs no network.
- Task 15: sixteen icon files build one sprite. Every icon on the sheet is a `use` of one symbol.
- Task 16: five layer tokens. The overlay table is the contract for overlays.
- Task 17: the state naming rule, the audit outcomes, and the descriptive text rewritten to the text rules.

Audit outcomes, one line per promise in the descriptive text that had no rule and no specimen:
- The drawer, a wireframe and a caption with no component: backlog entry "a drawer component". Trigger: a product needs the drawer.
- The 46 px reader toolbar in the Fixed sizes table: deleted. No rule draws it.
- The narrow 840 container in the Fixed sizes table: deleted. No rule uses it.
- The tip position and the popover offset: the overlay table documents them (Task 16). The Feedback caption says a product implements them.
- The 48 px sides and 44 px top in the Document wire caption go to the backlog. The entry is "Document layout tokens: padding, the 46 px toolbar, the 46 px footer". Trigger: OpenWrite adopts the system. The caption and the wires keep the numbers as layout data.
- The system symbol mapping for the icons: backlog entry (Task 15). Trigger: a native app adopts the system.
- The audit found no other name without a rule.
- Task 18: README, this change log, the spec sync, and the tag v1.2.0.

### Decisions
- The browser check runs inside `npm run check` and `checks/run.sh`, not by hand.
- A picture is a `figure` with a role and a label whose inner body carries `inert`.
- The `is-*` ban covers only native-state aliases, per the state naming rule; model-driven classes such as `is-selected` stay.
- The disabled menu item uses `aria-disabled="true"`.
- A keyboard-focusable scroll container counts as a tab stop; the browser check counts them and fails when the stops differ.
- The overlay table's headers wrap, so the table fits the page at desktop width.

### Final review
- The hidden icon sprite gets `display: none`, so the masthead starts at the top of the page.
- A text field, a select, a textarea, and the composer show one focus ring: the wrapper's.
- The button reset returns to the default cursor, as the Components caption says.
- The select's border stays `--g-line-control` on hover, as the spec says.
- The mono fallback face names `Menlo Regular` and `Menlo-Regular`, so `local()` finds it.
- The browser check asserts the tab-stop count, compares every rendered color to its token, and checks the layout.
- The token file holds five color groups, so the token block shows the five 1.1 headings.
- The two error textareas carry an error line linked with `aria-describedby`.
- The icon strip's hover and active swatches carry `data-state`.
- The radios sit in a group with `role="radiogroup"` and a label.
- Contrast: keep controls off a well on paper, because `line-control` on `panel` measures 2.8:1.

## 1.1 · 2026-09-15
- One type scale, one spacing scale, one radius scale, three elevations, tokenized motion and focus. Teal text moved to `#0A7A64` for contrast. Documented in the sheet's Adoption band.
