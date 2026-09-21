# Design system completion: revision 2 review

Reviewed: revision 2 of the spec and its standalone summary page.
Recommendation: keep the revised architecture. Correct the validation and state requirements below before implementation.

## What is resolved

The revision addresses the major structural findings from the first review:

- The repository location and ownership are recorded.
- The build and checks arrive together.
- CSS markers use CSS comments and have explicit validation.
- The baseline correctly contains 158 product tokens.
- The token format matches the current web values without claiming standard-format compatibility.
- The build has a source-controlled release date and checks generated metadata.
- The adoption example is generated from the live ground contract.
- Boundary colors use the ground contract, including ink and select hover.
- Simple native controls and deferred composite behavior have separate scopes.
- Swift output, native icon mappings, and app dark mode are deferred with triggers.
- Font fallback adjustments sit on separate fallback faces.
- Work is divided into three reviewable changes.

These are meaningful improvements. Another structural redesign is unnecessary.

## Remaining findings

### 1. Make the browser check part of the routine gate and give it a working invocation

**Priority: high.** [Spec §13](/Users/cvega/Projects/cristian-vega-design-system-src/docs/superpowers/specs/2026-09-15-design-system-completion-design.md:265), [goal](/Users/cvega/Projects/cristian-vega-design-system-src/docs/superpowers/specs/2026-09-15-design-system-completion-design.md:9).

The goal promises one command that proves the requirements on every change.
However, the browser check is explicitly outside `run.sh` and required only for change 2.
A later stylesheet change can remove focus outlines or change a control's token binding while all five routine checks pass.
The token contrast check cannot detect those changes because the token values can remain correct.

The documented command also does not discover `checks/browser.mjs` with the default configuration.
I verified this with Playwright 1.55.0 in a temporary directory: it skipped that filename.
Renaming the same probe to `browser.test.mjs` caused it to be evaluated.
This matches [Playwright's test discovery rules](https://playwright.dev/docs/api/class-testconfig#test-config-test-match).

**Smallest correction:** introduce the browser test in change 2 and add it to `checks/run.sh` from then onward.
Name it `browser.test.mjs` and document its local dependency and installation command.
Use the same pinned Playwright version for the runner and browser installation.
Keep the Python build dependency-free; browser testing is a development dependency.

Keep checks read-only with respect to source and generated outputs. Test reports and temporary artifacts can live in an ignored output directory.
The summary page must describe the same recurring gate.

### 2. Correct the focus acceptance criteria

**Priority: medium.** [Spec §8.3](/Users/cvega/Projects/cristian-vega-design-system-src/docs/superpowers/specs/2026-09-15-design-system-completion-design.md:190), [change 2 acceptance](/Users/cvega/Projects/cristian-vega-design-system-src/docs/superpowers/specs/2026-09-15-design-system-completion-design.md:274).

“Every enabled simple control must receive focus” during Tab traversal is incorrect for the stated control set.
Native radio groups normally have one Tab stop; arrow keys move between their choices.
The static `dialog` container is also not a required Tab stop.
The current criterion could reject correct native behavior or encourage extra tab stops to satisfy the test.

**Correction:** assert the expected keyboard sequence for each kind of control:

- Tab reaches ordinary enabled controls and shows their focus indication.
- Disabled controls are skipped.
- Tab enters a radio group at the appropriate choice; arrows change focus and selection within that group.
- Space changes checkbox and switch state.
- Test the controls inside the static dialog; do not require its container to receive Tab focus.

Give each specimen's radio group its own `name` so examples on different grounds do not become one group.
See the [radio group guidance](https://www.w3.org/WAI/ARIA/apg/patterns/radio/) and [dialog specification](https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element).

### 3. Make static composite examples non-interactive

**Priority: medium.** [Spec §8.2](/Users/cvega/Projects/cristian-vega-design-system-src/docs/superpowers/specs/2026-09-15-design-system-completion-design.md:181).

Wrapping a specimen in `figure role="img"` does not prevent its descendants from receiving focus.
This matters because the native conversion also introduces buttons and inputs into examples such as the palette.
They could remain keyboard stops despite the specimen being described as a static picture.

I reproduced this in Chromium: a button inside the labeled image wrapper still received focus.
Making its inner content inert prevented that focus.

**Correction:** keep the labeled figure accessible, and make its inner specimen markup inert or entirely non-interactive.
Add an assertion that static composite examples contribute no keyboard stops.
Do not make the labeled outer figure inert, which would also hide its description.
The [HTML inert behavior](https://html.spec.whatwg.org/multipage/interaction.html#the-inert-attribute) supports this small solution.

### 4. Narrow the ban on state classes

**Priority: medium.** [Spec §8.1](/Users/cvega/Projects/cristian-vega-design-system-src/docs/superpowers/specs/2026-09-15-design-system-completion-design.md:159), [§11](/Users/cvega/Projects/cristian-vega-design-system-src/docs/superpowers/specs/2026-09-15-design-system-completion-design.md:231).

Section 8 says the sheet has no `is-*` production hooks.
Section 11 retains those names for state supplied by a product model.
The current sheet also uses states such as `.gate.is-pass`, `.apv.is-stale`, and `.row.is-selected`.
Those are not simply aliases for native form states.

**Correction:** remove redundant native-state aliases, including `.is-disabled`, `.is-focus`, and checkbox `.is-on`.
Retain documented model-driven classes where no native state expresses the same fact.
Keep forced appearance for documentation on the example wrapper.
Apply that same wording to the summary page's claim of “no is-* production hooks.”

## Small implementation notes

- Reject cyclic token references as well as missing references. Existing keys can still form a cycle and invalidate their computed CSS values.
  Include a self-reference and a two-token cycle in build tests. This requires no additional schema framework.
  See [CSS variable cycles](https://www.w3.org/TR/css-variables-1/#cycles).
- In the implementation plan, state how change 1 treats known failing boundary pairs before change 2 fixes them.
  Give any temporary contrast exception a named pair and removal change; the current exception file is described only for raw literals.
- Specify which state-bearing CSS property the browser reads. The switch track uses `background-color`, while inputs use borders.
  Read the visible focus outline or ring as well. Checking every control's border color would miss the switch's relevant state.

These details can be folded into the implementation plan. They do not need another architectural phase.

## Proceeding

Make the four targeted corrections in the spec and summary page, then start change 1.
The repository, token extraction, build, and Python checks are a suitable first implementation unit.
Add browser regression coverage with change 2 and retain it for later changes.

The retained writing rules are an editorial choice, not an implementation blocker.
I would still prefer short, clear language over an absolute acronym ban, but this does not need another review cycle.

## Verification scope

Compared the revised spec and page with the first review and inspected the relevant current sheet rules.
Verified test-file discovery using the specified Playwright version and checked static-wrapper focus behavior in Chromium.
No implementation exists in the proposed repository yet, so this is a design review, not a test pass for the proposed implementation.
Only this review document was added to the project.
