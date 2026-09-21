# Design system completion: review

Date: 2026-09-15
Recommendation: revise the spec before implementation.

## Verdict

The foundation is sound: shared tokens, a small build, reusable components, and a common color contract.
Keep those boundaries. The completion plan adds work without a current consumer while leaving gaps in its checks.

The right target is a dependable system for the current sheet. Add another platform or behavior when a product needs it.

## Required corrections

### 1. Put working checks beside the first change

**Priority: high.** [Spec §1.1](/Users/cvega/Projects/cristian-vega-design-system-src/docs/superpowers/specs/2026-09-15-design-system-completion-design.md:13), [§13](/Users/cvega/Projects/cristian-vega-design-system-src/docs/superpowers/specs/2026-09-15-design-system-completion-design.md:235).

Step nine introduces checks, but every earlier task must already pass them. The HTML also requires `drift.py` in step one.
Move the build and its checks into one initial change. Extend checks when each later feature arrives.

I ran the existing scripts. Both exit successfully. The contrast report includes 19 rows containing `FAIL`.
Those rows include forbidden examples and text thresholds applied to boundary colors; they are not 19 confirmed product defects.

More importantly, [contrast.py](/Users/cvega/Projects/.claude/checks/contrast.py:48) repeats colors by hand.
It still tests `#0C8B72` as teal text, although the sheet uses `#0A7A64` for text.
Simply moving this script preserves an existing source of drift.

Require the following:

- Contrast pairs reference token names and resolve current values. Each pair declares its purpose and threshold.
- Inventory violations produce a nonzero exit status. Exceptions identify a selector, property, value, and reason.
- Drift checks compare without rewriting the files being checked. Include generated metadata as well as token and icon regions.
- The one check command runs the required unit tests. Define the markup and browser checks and their dependencies explicitly.
- Prove that checks detect an edited output, a failing contrast pair, and an unapproved literal.

Screenshots are useful review evidence. They do not prove keyboard behavior or accessible names.

### 2. Correct the marker syntax before building

**Priority: high.** [Spec §4](/Users/cvega/Projects/cristian-vega-design-system-src/docs/superpowers/specs/2026-09-15-design-system-completion-design.md:78).

The proposed `<!-- build:tokens -->` markers sit inside `:root`. HTML comments are not CSS declaration comments.
In a Chromium reproduction, the first token after the opening marker disappeared.
The first documentation token after the closing marker disappeared too.

Use `/* build:tokens */` and `/* /build:tokens */` inside the stylesheet.
Keep HTML comments for regions in the HTML body. This follows the [CSS parsing rules](https://www.w3.org/TR/css-syntax-3/#consume-list-of-declarations).

Require exactly one complete marker pair per region. Reject missing, duplicate, or reversed markers before writing anything.
Keep the release date in source data so identical inputs produce identical output on another day.

### 3. Make the token contract represent the current sheet

**Priority: high.** [Spec §6](/Users/cvega/Projects/cristian-vega-design-system-src/docs/superpowers/specs/2026-09-15-design-system-completion-design.md:102).

The first `:root` contains **175 declarations: 158 product tokens and 17 documentation tokens**.
Requiring 175 generated product names conflicts with excluding `--doc-*` from the token file.
Record and preserve the actual product name set, then add the explicitly approved tokens.

The format also needs concrete examples before implementation:

- `--track-display-xl` currently uses `em`.
- `--fs-display-xl` currently uses `clamp()` and viewport units.
- `--grad` includes a direction as well as color stops.

The specified DTCG `dimension` type accepts numeric `px` or `rem` values. Its gradient type describes stops.
Those definitions do not directly encode all three existing expressions. See the [DTCG format](https://www.designtokens.org/tr/2025.10/format/).

Keep JSON if it remains the chosen source. Document a bounded format and any web extensions using these actual examples.
Specify name mappings, reference errors, and unsupported values. Avoid building a general token translation framework.

Defer the Swift generator until a native app adopts the system. A compiling enum alone does not establish equivalent typography or behavior.

### 4. Choose an honest contract for control behavior

**Priority: high.** [Spec §8](/Users/cvega/Projects/cristian-vega-design-system-src/docs/superpowers/specs/2026-09-15-design-system-completion-design.md:160).

Changing tags does not supply all the promised behavior:

- `button.select[aria-expanded]` is a button, not a native select. Use `<select>` for ordinary choices.
- Tabs and menus need keyboard handling and related panels or menu containers. Tab-through testing alone is insufficient.
- `aria-selected` is not supported on `menuitem`. Choose the role appropriate to the action or choice.
- `<dialog open>` does not establish the modal behavior promised by the existing caption.
- `[aria-invalid]` also matches `aria-invalid="false"`. Use an explicit state value.
- Native disabled controls are skipped by Tab. Radio groups and composite controls also have their own keyboard rules.

These distinctions follow the [tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/), [menu pattern](https://www.w3.org/WAI/ARIA/apg/patterns/menubar/), [menuitem definition](https://www.w3.org/TR/wai-aria-1.2/#menuitem), and [dialog specification](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element).

Use native state as the production source of truth. Retaining every `is-*` alternative for an unspecified framework doubles the state contract.
A class that dims a button and blocks pointer events does not disable keyboard activation.
Keep forced visual states confined to clearly marked documentation examples where needed.

Use real labels and relationships. The current secret field contains Reveal and Copy controls.
Its whole wrapper cannot become a label for the input and those additional buttons.

My recommendation: native simple controls now; small working examples for the complex patterns actually needed today.
Explicitly defer any remaining interactive behavior and remove claims that it has been implemented.

### 5. Check the boundaries the components actually render

**Priority: high.** [Spec §7](/Users/cvega/Projects/cristian-vega-design-system-src/docs/superpowers/specs/2026-09-15-design-system-completion-design.md:150).

The spec assumes the six boundaries use `--line-strong`, and that the ink versions already use the passing 35% white border.
Existing [input rules](/Users/cvega/Projects/cristian-vega-design-system.html:629) use `--g-line` instead.
Browser computed styles confirmed these input borders:

| Ground | Current input border |
|---|---|
| Paper | `#DEE2E9` |
| Surface | `#E8EBF1` |
| Ink | `rgba(255,255,255,.1)` |

The ink input therefore does not use the 35% white token measured in the spec.
Also, `.select:hover` currently restores `--g-line-strong`; fixing the default border alone leaves that state behind.

Add a contextual name such as `--g-line-control` to the existing ground contract.
Map it to the light boundary token on paper/surface and the verified ink boundary token on ink.
Test rendered default, hover, focus, checked, and error states where applicable across all three grounds.

Describe the accessibility rule accurately: required visual control and state indicators need sufficient contrast against adjacent colors.
The rule does not require a contrasting perimeter on every text button. See [non-text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).

### 6. Close the remaining sources of drift

**Priority: medium.** [Spec §4](/Users/cvega/Projects/cristian-vega-design-system-src/docs/superpowers/specs/2026-09-15-design-system-completion-design.md:51), [§13](/Users/cvega/Projects/cristian-vega-design-system-src/docs/superpowers/specs/2026-09-15-design-system-completion-design.md:235).

The ground contract is duplicated in the [live stylesheet](/Users/cvega/Projects/cristian-vega-design-system.html:295) and the [Adoption example](/Users/cvega/Projects/cristian-vega-design-system.html:2193).
Neither copy is included in the proposed generated token region. The new boundary alias and dark-frame rule could diverge between them.
Generate that example from the live contract, or add a focused equality check.

The sheet is also partly handwritten source and partly generated output. Markers are a reasonable small solution.
Document this ownership accurately and include the handwritten sheet in version control.
The source folder alone cannot reconstruct its components and prose.

The spec and summary page need one authority. Keep the Markdown spec authoritative and update the page in the same change.
The recently added order section demonstrates why this rule is needed; it does not require another documentation framework.

## Scope to simplify

| Keep now | Defer or narrow |
|---|---|
| One token source, one small build | Unused Swift output and unactivated dark-frame support |
| Existing color contract and component composition | Framework compatibility states without a named consumer |
| Local assets for offline use; shared icon paths | SF Symbols mappings until native adoption |
| Audit every documented promise | Building a component only because prose mentions it; deleting unsupported prose is valid |
| Plain language and consistent names | Mandatory 20-word sentences and an acronym ban across all code comments and documents |
| Tests for changed behavior and generated output | Three screenshots after every task, including copy-only changes |
| Shared design tokens and explicit local geometry | Turning every numeric literal into a public token |

Define completeness against current supported components. Leave future ideas in a short backlog with a concrete trigger for implementation.

## Smaller corrections

- **Fonts:** fallback metrics belong on a fallback face declared with `src: local(...)`.
  Applying fallback adjustments to the downloaded primary face changes that face instead.
  See the [CSS Fonts example](https://www.w3.org/TR/css-fonts-5/#font-metrics-override-desc).
  Load the used weights locally first; add measured fallback tuning when needed.
  Font URLs must resolve from the sibling sheet, so a bare `fonts/` URL would point to the wrong directory.
- **Overlays:** retain a short behavior table, but account for the browser's top layer when using modal dialogs.
  A larger tooltip `z-index` does not place an ordinary external element above a modal in that layer.
  Decide the behavior and placement before treating five numbers as a complete layering solution.
- **Readability:** the current sheet uses 9–11 px metadata and long technical captions.
  Separate short usage instructions from detailed reference material. Check essential small text at actual size and increased zoom.
  Passing a color ratio alone does not establish comfortable reading.

## How to proceed

### First: revise the spec and summary together

Resolve the six findings above. Replace the nine-step sequence with the three implementation changes below.
Record the version-control location and a maintainer before implementation. Package distribution can wait.

### Change 1: source and checks

Extract the current product tokens without redesigning them. Define the few required expression mappings.
Implement the build, valid markers, and non-mutating checks together.
Keep all handwritten source under version control. Cover the copied ground contract.

Accept this change when repeated builds are identical, existing values are preserved, and intentional violations fail the checks.
Any existing failure needs a precise temporary exception or a fix, with removal tied to the next change.

### Change 2: current controls

Fix contrast through the ground contract. Convert simple controls to native elements.
Resolve complex interaction scope and remove conflicting production state hooks.

Accept this change after keyboard and state checks, plus review of the affected specimens on all three grounds and a narrow viewport.
Include the requested before/after comparison for the boundary change.

### Change 3: assets and documentation

Localize the required fonts and consolidate icon paths. Complete the audit by implementing or explicitly deferring each supported promise.
Shorten guidance, synchronize the summary, and record the release.

Accept this change when local assets resolve offline, generated content matches, and the supported examples pass their checks.

### Ongoing process

For each change: state the current need, reuse an existing component when possible, update source and examples together, run one check command.
Record an exception only when needed, with its scope and removal condition. Review visual changes in the affected specimens.

Once a product adopts the system, add checks in that product. This sheet-only project cannot enforce consistency in excluded apps and sites.

## Review evidence and limits

Reviewed the Markdown spec, standalone summary page, current sheet, and both existing Python check scripts.
Confirmed that section 1.1 contains the nine steps.
Ran both scripts, counted the initial root tokens, and reproduced the marker parsing failure in installed Chromium.
Inspected the rendered summary and sampled sheet output; read actual input styles at desktop light/dark and 400 px widths.
This was not a full keyboard or screen-reader audit. No existing implementation or specification file was changed.
