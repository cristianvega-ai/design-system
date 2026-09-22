---
title: Documentation standard
status: released
date: 2026-09-22
prd: ../prd/0001-documentation-standard.md
spec: ../specs/0001-documentation-standard.md
---

# Documentation standard

## Summary

This plan creates the technical standard with its first content, the documentation standard, and makes this repository follow it. It delivers `technical-standard/` with the standard and seven templates. It adds the indexes under `docs/`, the first decision record, and Markdown support in the text report. It updates the root documents. Requirements document 1 states what must be true. Spec 1 states the shapes and the rules. Read both before task 1.

The proof when done: every acceptance criterion in requirements document 1 passes, and `checks/run.sh` exits 0 from `visual-standard/`.

> For agentic workers: use the subagent-driven-development skill or the executing-plans skill to work this plan task by task. Steps use checkbox syntax for tracking. Tick a task's box in Progress when its commit exists.

### Constraints for every task

- Work on the branch `documentation/documentation-standard`, created from a current `main`.
- Run every command from `visual-standard/` unless a step says the repository root.
- Every sentence you write follows the text rules, listed here.
- Keep one topic and 20 words or fewer in each sentence.
- Use the active voice.
- Give one instruction per sentence, and start it with the verb.
- Use "must" for a requirement and "can" for a possibility. Never write "should".
- Use no acronym.
- Use the same word for the same thing.
- Write file names, paths, commands, and identifiers in backticks. The text report counts a backticked name as the word "code".
- `AGENTS.md` must end at 100 lines or fewer.
- A record's file name is four digits, a hyphen, and a lowercase slug: `0001-slug.md`.
- Do not edit `tokens.json`, the sheet, the products document, or `dist/`. Do not add a dependency. Do not run `node checks/text-judge.mjs`.
- Stage files by explicit path. Never use `git add -A` or `git add .`.
- A commit subject is one plain sentence that states the change, with no prefix and no trailer.
- Every task ends with `checks/run.sh` exiting 0 and a commit.

## Tasks

### Task 1: the text report reads Markdown

The report today walks a web page. Every later task writes Markdown that must pass it, so this comes first.

**Files:**
- Modify: `visual-standard/checks/text-report.mjs`
- Modify: `visual-standard/checks/text-judge.mjs` (remove `markdownRuns`, import it instead)
- Modify: `visual-standard/checks/text-judge.test.mjs` (line 3, the import)
- Create: `visual-standard/checks/text-report.test.mjs`

**Interfaces:**
- Produces: `markdownRuns(text)` exported from `text-report.mjs`, unchanged in behavior except fence handling. `fileRuns(text, file)` returns `{ line, text }` runs for any file. `textReport(text, file = '')` reads Markdown when `file` ends in `.md`.
- Later tasks run: `node checks/text-report.mjs <files>` and expect the last line `text report: 0 long sentences, 0 acronyms`.

- [ ] **Step 1: Create the branch and commit this plan**

The owner approved this plan in conversation. At the repository root:

```bash
git checkout main
git status --short          # expect only: ?? docs/plans/
git checkout -b documentation/documentation-standard
```

Set `status: approved` in the front matter of `docs/plans/0001-documentation-standard.md`. Then:

```bash
git add docs/plans/0001-documentation-standard.md
git commit -m "$(cat <<'EOF'
Plan 1 lays out the documentation standard work
EOF
)"
cd visual-standard
```

- [ ] **Step 2: Write the failing tests**

Create `visual-standard/checks/text-report.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { textReport, markdownRuns } from './text-report.mjs';

// The report reads a Markdown file when the file name ends in .md. Front matter is not text.
// A backticked name is the word "code". A table cell is its own sentence.
test('textReport reads a Markdown file and skips its front matter', () => {
  const markdown = [
    '---',
    'title: A record',
    'owner: ABC',
    '---',
    '',
    '# A record',
    '',
    'This sentence holds `AGENTS.md` and stays short.',
    '',
    '| Number | Title |',
    '|---|---|',
    '| 1 | One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twenty-one. |',
  ].join('\n');
  const report = textReport(markdown, 'a.md');
  assert.deepEqual(report.acronyms, []);
  assert.deepEqual(report.longSentences.map((sentence) => [sentence.line, sentence.words]), [[12, 21]]);
});

test('textReport keeps the web page walk when the file is not Markdown', () => {
  const html = '<html><body><p>Short sentence.</p></body></html>';
  assert.equal(textReport(html).sentences.length, 1);
  assert.equal(textReport(html, 'page.html').sentences.length, 1);
});

// A fence closes only on a fence of the same character and at least the same length, so a
// four-backtick block can hold a three-backtick block.
test('markdownRuns keeps a nested fence inside a longer fence', () => {
  const markdown = [
    'Before.',
    '````markdown',
    'Inside the outer fence.',
    '```',
    'tree line one',
    '```',
    'Still inside.',
    '````',
    'After.',
  ].join('\n');
  assert.deepEqual(markdownRuns(markdown).map((run) => run.text), ['Before.', 'After.']);
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `node --test checks/text-report.test.mjs`
Expected: three failures. The first fails because `textReport` walks the Markdown as a web page and finds no `<body>`. The third fails because `markdownRuns` is not exported from `text-report.mjs`.

- [ ] **Step 4: Move `markdownRuns` into `text-report.mjs` and teach it fence lengths**

In `visual-standard/checks/text-judge.mjs`, delete the whole `markdownRuns` function with its two comment lines. It starts at the comment `// Descriptive runs of a markdown file`. It ends at the closing brace before `const lineOf`. Change the import at the top of the file from:

```js
import { descriptiveRuns } from './text-report.mjs';
```

to:

```js
import { descriptiveRuns, markdownRuns } from './text-report.mjs';
```

In `visual-standard/checks/text-report.mjs`, add the function after `descriptiveRuns` and before `const lineOf`. This is the moved function with one change: the fence handling.

```js
// Descriptive runs of a Markdown file: headings, paragraphs, list items, and table cells, with
// the line where each run starts. Fenced code is dropped; inline code becomes the word "code".
// A fence closes on a fence of the same character with at least the opening fence's length.
export function markdownRuns(text) {
  const runs = [];
  const lines = text.split('\n');
  let fence = null; // { char, length } while inside a fenced block
  let paragraph = null; // { line, parts }
  const endParagraph = () => {
    if (paragraph) runs.push({ line: paragraph.line, text: paragraph.parts.join(' ') });
    paragraph = null;
  };
  const clean = (raw) => raw.replace(/`[^`]*`/g, ' code ').replace(/\*\*|__|(?<!\w)[*_](?!\w)|(?<!\w)[*_](?=\w)|(?<=\w)[*_](?!\w)/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\s+/g, ' ').trim();
  lines.forEach((raw, index) => {
    const line = index + 1;
    const opening = /^\s*(`{3,}|~{3,})/.exec(raw);
    if (opening) {
      const char = opening[1][0];
      const length = opening[1].length;
      if (!fence) { fence = { char, length }; endParagraph(); return; }
      if (fence.char === char && length >= fence.length) { fence = null; return; }
    }
    if (fence) return;
    const trimmed = raw.trim();
    if (!trimmed) { endParagraph(); return; }
    if (/^\|?\s*:?-{3,}/.test(trimmed) && trimmed.includes('-')) { endParagraph(); return; } // a table's rule row
    if (trimmed.startsWith('|')) {
      endParagraph();
      for (const cell of trimmed.replace(/^\||\|$/g, '').split('|')) {
        const text = clean(cell);
        if (text) runs.push({ line, text });
      }
      return;
    }
    const heading = /^#{1,6}\s+(.*)$/.exec(trimmed);
    if (heading) { endParagraph(); const text = clean(heading[1]); if (text) runs.push({ line, text }); return; }
    const item = /^(?:[-*+]|\d+[.)])\s+(.*)$/.exec(trimmed);
    if (item) { endParagraph(); const text = clean(item[1]); if (text) runs.push({ line, text }); return; }
    const text = clean(trimmed);
    if (!text) return;
    if (paragraph) paragraph.parts.push(text); else paragraph = { line, parts: [text] };
  });
  endParagraph();
  return runs;
}
```

- [ ] **Step 5: Make `textReport` read Markdown**

In `visual-standard/checks/text-report.mjs`, replace the `textReport` function with these three definitions. `lineOf` and `countWords` stay as they are above them.

```js
// Blanks the front matter of a Markdown file, so its fields are not sentences, and keeps the line count.
const blankFrontMatter = (text) => text.replace(/^---\n[\s\S]*?\n---\n/, (block) => block.replace(/[^\n]/g, ''));

// The runs of a file as { line, text }: a Markdown file through markdownRuns, any other file through the walk.
export function fileRuns(text, file = '') {
  if (file.endsWith('.md')) return markdownRuns(blankFrontMatter(text));
  return descriptiveRuns(text).map((run) => ({ line: lineOf(text, run.index), text: run.text }));
}

export function textReport(text, file = '') {
  const sentences = [];
  for (const run of fileRuns(text, file)) {
    for (const piece of run.text.replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+/)) {
      if (piece) sentences.push({ line: run.line, text: piece, words: countWords(piece) });
    }
  }
  const longSentences = sentences.filter((sentence) => sentence.words > WORD_LIMIT);
  const acronyms = [];
  for (const sentence of sentences) {
    for (const match of sentence.text.matchAll(/\b[A-Z]{2,}[A-Za-z0-9-]*\b/g)) {
      const word = match[0];
      if (!ALLOWED_NAMES.has(word) && !/^[0-9A-F]{6}$/.test(word)) acronyms.push({ line: sentence.line, word });
    }
  }
  return { sentences, longSentences, acronyms };
}
```

In the command block at the bottom of the file, change the call `textReport(readFileSync(file, 'utf8'))` to `textReport(readFileSync(file, 'utf8'), file)`.

In the header comment of the file, change the first sentence to: `// A report on the descriptive text of the sheet, the products document, and any Markdown file passed as an argument.`. After the line that names `FILES`, add: `// A file argument that ends in .md is read as Markdown: front matter is skipped and fenced code is dropped.`.

- [ ] **Step 6: Fix the judge's test import**

In `visual-standard/checks/text-judge.test.mjs`, replace line 3:

```js
import { markdownRuns, splitSentences, glossaryFrom, buildBatches, collectFlags, formatReport, askBatch } from './text-judge.mjs';
```

with:

```js
import { splitSentences, glossaryFrom, buildBatches, collectFlags, formatReport, askBatch } from './text-judge.mjs';
import { markdownRuns } from './text-report.mjs';
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `node --test checks/text-report.test.mjs checks/text-judge.test.mjs checks/vocabulary.test.mjs`
Expected: every test passes.

Run: `node checks/text-report.mjs ../docs/prd/0001-documentation-standard.md ../docs/specs/0001-documentation-standard.md ../docs/glossary.md`
Expected last line: `text report: 0 long sentences, 0 acronyms`

Run: `node checks/text-report.mjs`.
Expected: the same output as before this task for the sheet and the products document. The last line is the same.

- [ ] **Step 8: Run the gate and commit**

```bash
checks/run.sh              # expect exit 0
git add checks/text-report.mjs checks/text-report.test.mjs checks/text-judge.mjs checks/text-judge.test.mjs
git status --short         # expect only those four files staged
git commit -m "$(cat <<'EOF'
The text report reads a Markdown file passed as an argument
EOF
)"
```

### Task 2: the technical standard folder and the standard

**Files:**
- Create: `technical-standard/README.md`
- Create: `technical-standard/documentation.md`

**Interfaces:**
- Produces: `technical-standard/documentation.md`, the living standard. Tasks 3 to 6 link to it. Its section names are the ones the templates and the indexes use.

- [ ] **Step 1: Create `technical-standard/README.md`**

```markdown
---
title: Technical standard
date: 2026-09-22
---

# Technical standard

The technical standard says how the products are built and documented. The visual standard, in `../visual-standard/`, says how they look. Both share one version and one change log.

| File | What it holds |
|---|---|
| `documentation.md` | the documentation standard: the documents every repository holds, their shapes, and the rules |
| `templates/` | one template per document type; a new document starts as a copy |

The text rules live in `../README.md`. The git rules and the agent-file rules live in `../AGENTS.md`. Later work moves them here.
```

- [ ] **Step 2: Create `technical-standard/documentation.md`**

````markdown
---
title: Documentation standard
date: 2026-09-22
---

# Documentation standard

This standard names the documents that every repository holds, the shape of each, and the rules that bind them. It serves two readers: a person and a coding agent. A repository answers four questions: why a thing exists, what it must do, how it works, and what was decided. A reader finds each answer without leaving the repository.

The standard lives in the design system at `technical-standard/documentation.md`. The templates live next to it in `technical-standard/templates/`. Spec 1 in the design system's `docs/specs/` records why the standard is shaped this way.

## The documents

| Document | The question it answers | Kind |
|---|---|---|
| `README.md` | How do I build, check, and release this? | living |
| `AGENTS.md` | Where does an agent look? | living |
| `ARCHITECTURE.md` | How is the code organized, and what must always hold? | living |
| `CHANGELOG.md` | What changed for a user? | living |
| `docs/README.md` | What is in `docs/`, and where is the standard? | living |
| `docs/product.md` | Why does this product exist, for whom, and what is it not? | living |
| `docs/glossary.md` | Which word names which thing, in a repository with no product document? | living |
| `docs/prd/0001-slug.md` | What must this one feature do, and what proves it? | record |
| `docs/specs/0001-slug.md` | How do we build it, as a whole, and what did we reject? | record |
| `docs/adr/0001-slug.md` | What did we choose, and why? | record |
| `docs/plans/0001-slug.md` | In what order, and how far along are we? | record |
| `docs/runbooks/task.md` | How do I sign, ship, and roll back? | living |

A **living** document describes now. When code changes what it says, the document changes in the same commit. It carries the date of its last update and no status.

A **record** has a number, a date, and a status. After approval, only its front matter changes: the status, and a link when a related record appears. A later record supersedes it.

`README.md`, `AGENTS.md`, and `CHANGELOG.md` follow the standards they already follow. `AGENTS.md` stays at 100 lines or fewer. No repository holds a `CLAUDE.md`. Claude Code reads `AGENTS.md` when no `CLAUDE.md` exists.

In sentences, the records are "the requirements document", "the spec", "the decision record", and "the plan". The folder names `prd/` and `adr/` are paths, not words.

## The layout

```
README.md
AGENTS.md
ARCHITECTURE.md
CHANGELOG.md
docs/
  README.md        the map of docs/, with a link to this standard
  product.md       one per product
  glossary.md      only where there is no product document
  prd/             README.md, 0001-slug.md, ...
  specs/           README.md, 0001-slug.md, ...
  adr/             README.md, 0001-slug.md, ...
  plans/           README.md, 0001-slug.md, ...
  runbooks/        release.md, ...
```

A repository holds its own records. A product repository gets its `docs/` on the day it exists, before its code moves in.

## The chain

One feature moves through the records in this order:

```
prd/0007    what it must do, and the proof
specs/0005  how, as a whole: structure, interfaces, data, alternatives
adr/0003    one choice pulled out, because later work depends on it
plans/0009  the order of work, with progress
code, then CHANGELOG.md
```

Not every feature needs every link:

- The requirements document is always written.
- The spec is written when the how is not obvious from the requirements.
- A decision record is written when a choice outlives the feature. A boundary, a format, a vendor, or a rule the next feature depends on qualifies. A choice that only this feature cares about stays in the spec's Decisions section.
- A plan is written when the work spans more than one session.

The spec owns the design. A decision record holds one part of it that must outlive it. The spec links to each record it produced, so no decision is written twice. `ARCHITECTURE.md` is the living summary of what all the specs built.

## Front matter

Every document starts with front matter. GitHub renders it as a table.

| Field | Who carries it | Value |
|---|---|---|
| `title` | every document | the title, with no number |
| `status` | every record | one of the statuses below |
| `date` | every document | a record's creation date, or a living document's last update |
| `product` | a requirements document | the product's name |
| `prd`, `spec`, `plan` | a record | a relative link to the related record |
| `supersedes` | a record | a relative link to the record it replaces |
| `superseded-by` | a record | a relative link to the record that replaced it |

The number lives in the file name only. A missing link is left out, not left empty.

## File names and numbers

A record is named `0001-slug.md`: four digits, a hyphen, and a lowercase slug. Each folder counts from `0001`, and a number is never reused. Numbers do not align across folders; the front matter links them. A living document has a fixed name.

## Statuses

| Record | Statuses |
|---|---|
| requirements document, spec, plan | draft → approved → released |
| decision record | draft → approved → superseded |

A decision is never released. It holds as approved until a later record supersedes it. A released record that a later record replaces also becomes superseded. The two name each other in the front matter. A draft can change or be deleted. After approval, only the front matter changes: the status, and a link when a related record appears. The one exception is the plan: Progress, Decision log, and Findings stay open.

## The index

Each record folder holds a `README.md` with front matter, a heading, and one table:

| Number | Title | Status | Date |
|---|---|---|---|

The number is a link to the file. The front matter carries the title and the date of the last update.

## The requirements document

Required in every requirements document:

| # | Section | What goes in it |
|---|---|---|
| 1 | Metadata | front matter: number in the file name, product, status, date, links to its spec and plan |
| 2 | Overview | the problem, who has it, what success looks like |
| 3 | Goals | three to five outcomes |
| 4 | Out of scope | what this feature does not do |
| 5 | Functional requirements | `F1` to `Fn`: what the system does |
| 6 | Non-functional requirements | `N1` to `Nn`: speed, accessibility, privacy, offline, platform |
| 7 | Acceptance criteria | numbered; each cites its requirement and names the proof; the last one is end to end |

Optional, in this order between Out of scope and Acceptance criteria:

| Section | Include it when |
|---|---|
| User stories | the problem needs a scene to make sense |
| User experience | the feature has screens or flows; link into the products document |
| Dependencies | the feature waits on another feature, a library, or a platform release |
| Constraints | an outside limit binds: a platform rule, a sandbox, a budget |
| Success metrics | the product can measure the outcome after release |
| Open questions | the status is draft; an approved document has none |

Three rules for the requirements themselves:

- A requirement is one sentence with "must". A conditional one reads "When *trigger*, the *system* must *response*."
- A requirement states an outcome, not a solution. "The console must mark the approval stale" is a requirement. "Add a `stale` field" belongs in the spec.
- Every requirement has at least one acceptance criterion. Each criterion names its proof: test, browser check, eval, or manual gate.

A requirements document fits in 150 lines.

## The spec

| # | Section | What goes in it |
|---|---|---|
| 1 | Metadata | front matter: status, date, link to the requirements document it serves |
| 2 | Summary | what this builds, in one paragraph |
| 3 | Architecture | the parts and how they connect |
| 4 | Interfaces | what other code calls: endpoints, the Swift-to-Rust boundary, component contracts |
| 5 | Decisions | one dated line per choice; a link when the choice became a decision record |
| 6 | Alternatives considered | what was rejected, and why |
| 7 | Testing | how the design gets verified |

Optional: Data model, Security, Migration, Risks, Open questions.

## The decision record

| # | Section | What goes in it |
|---|---|---|
| 1 | Metadata | front matter: status, date, link to the spec or requirements document that raised it |
| 2 | Context | the situation and the forces at play |
| 3 | Options | each option considered, one line each |
| 4 | Decision | what was chosen, and why |
| 5 | Consequences | what gets easier, what gets harder |

Nothing optional. A decision record fits in 60 lines.

## The plan

| # | Section | What goes in it |
|---|---|---|
| 1 | Metadata | front matter: status, date, links to the requirements document and the spec |
| 2 | Summary | what the plan delivers, and the command that proves it when done |
| 3 | Tasks | numbered and ordered; each names its files and its check |
| 4 | Progress | one checkbox per task; the agent ticks it as it works |
| 5 | Decision log | dated lines for choices made during the work |

Optional: Findings, Retrospective. A plan is the one record an agent edits after approval, and only in Progress, Decision log, and Findings.

## The product document

| # | Section | What goes in it |
|---|---|---|
| 1 | Vision | what the product is, in one paragraph |
| 2 | Users | who uses it, and for what |
| 3 | Principles | the rules every feature follows |
| 4 | Out of scope | what the product is not |
| 5 | Features | a table: each feature, its status, a link to its requirements document |
| 6 | Glossary | one word for one thing |

## The architecture document

| # | Section | What goes in it |
|---|---|---|
| 1 | Overview | what the system does and its main parts, in one screen |
| 2 | Code map | each top-level folder and what it holds; names modules, never links to files |
| 3 | Invariants | what must always hold, including absences |
| 4 | Cross-cutting concerns | errors, logging, accessibility, tokens |
| 5 | Decisions | links to the decision records that shaped it |

## The runbook

| # | Section | What goes in it |
|---|---|---|
| 1 | Purpose | when to use this runbook |
| 2 | Prerequisites | what must be true before step 1 |
| 3 | Steps | numbered; each step names its expected result |
| 4 | Rollback | how to undo, step by step |

## The rules

1. Markdown is the source of every document. The design-system view is built from it.
2. `docs/README.md` in every repository maps its `docs/` and links to this standard.
3. A new document starts as a copy of its template.
4. Prose cites a record by number: "decision record 3". Links are relative.
5. The text rules apply to every document.
6. A template carries its section list and one line of guidance per section, and nothing else.

## Write a new record

1. Copy the template from `technical-standard/templates/`.
2. Name the file with the next number in its folder and a slug.
3. Fill the front matter. Leave out a link that does not exist yet.
4. Write the sections. Delete an optional section that does not apply.
5. Add the record to the folder's `README.md`.
6. Run the text report on the file.
7. Set the status to approved when the owner approves it.
````

- [ ] **Step 3: Check the text and the gate, then commit**

```bash
node checks/text-report.mjs ../technical-standard/README.md ../technical-standard/documentation.md
# expect the last line: text report: 0 long sentences, 0 acronyms
checks/run.sh              # expect exit 0
cd .. && git add technical-standard/README.md technical-standard/documentation.md && cd visual-standard
git commit -m "$(cat <<'EOF'
The technical standard appears with the documentation standard
EOF
)"
```

### Task 3: the seven templates

**Files:**
- Create: `technical-standard/templates/prd.md`
- Create: `technical-standard/templates/spec.md`
- Create: `technical-standard/templates/adr.md`
- Create: `technical-standard/templates/plan.md`
- Create: `technical-standard/templates/product.md`
- Create: `technical-standard/templates/architecture.md`
- Create: `technical-standard/templates/runbook.md`

**Interfaces:**
- Consumes: the section lists in `technical-standard/documentation.md`.
- Produces: seven files a writer copies. Each carries its front matter, its section headings in order, and one line of guidance per section.

- [ ] **Step 1: Create `templates/prd.md`**

```markdown
---
title: The feature
status: draft
date: YYYY-MM-DD
product: the product
spec: ../specs/0000-slug.md
plan: ../plans/0000-slug.md
---

# The feature

## Overview

State the problem, who has it, and what success looks like, in one screen at most.

## Goals

List three to five outcomes.

## Out of scope

List what this feature does not do.

## User stories

Optional. Include it when the problem needs a scene. Write "As a ..., I want ..., so that ...".

## Functional requirements

- **F1.** Write one sentence with "must" that states an outcome, not a solution. A conditional one reads "When *trigger*, the *system* must *response*."

## Non-functional requirements

- **N1.** Write one sentence with "must" about speed, accessibility, privacy, offline, or platform.

## User experience

Optional. Include it when the feature has screens or flows, and link into the products document.

## Dependencies

Optional. Include it when the feature waits on another feature, a library, or a platform release.

## Constraints

Optional. Include it when an outside limit binds: a platform rule, a sandbox, a budget.

## Success metrics

Optional. Include it when the product can measure the outcome after release, with one measure and one counter-measure.

## Open questions

Optional. Include it while the status is draft; an approved document has none.

## Acceptance criteria

1. F1, test or browser check or eval or manual gate: state the check and its expected result. Every requirement gets at least one criterion.
2. End to end, manual gate: state the one check that proves the whole feature.
```

- [ ] **Step 2: Create `templates/spec.md`**

```markdown
---
title: The feature
status: draft
date: YYYY-MM-DD
prd: ../prd/0000-slug.md
plan: ../plans/0000-slug.md
---

# The feature

## Summary

State what this builds, in one paragraph.

## Architecture

Name the parts and how they connect.

## Interfaces

Name what other code calls: endpoints, the Swift-to-Rust boundary, component contracts.

## Data model

Optional. Include it when the feature stores or exchanges structured data.

## Security

Optional. Include it when the feature touches keys, permissions, sandboxes, or the network.

## Migration

Optional. Include it when existing data or users move.

## Risks

Optional. Include it when a part can fail in a way that changes the design.

## Decisions

- YYYY-MM-DD. Write one dated line per choice, with a link when the choice became a decision record.

## Alternatives considered

- **The rejected option.** State why it lost.

## Testing

State how the design gets verified.

## Open questions

Optional. Include it while the status is draft; an approved spec has none.
```

- [ ] **Step 3: Create `templates/adr.md`**

```markdown
---
title: The decision, as one sentence
status: draft
date: YYYY-MM-DD
spec: ../specs/0000-slug.md
---

# The decision, as one sentence

## Context

Describe the situation and the forces at play.

## Options

1. Name each option considered, one line each.

## Decision

State what was chosen, and why.

## Consequences

State what gets easier and what gets harder.
```

- [ ] **Step 4: Create `templates/plan.md`**

```markdown
---
title: The feature
status: draft
date: YYYY-MM-DD
prd: ../prd/0000-slug.md
spec: ../specs/0000-slug.md
---

# The feature

## Summary

State what the plan delivers, and the command that proves it when done.

## Tasks

### Task 1: the first deliverable

Name the files, the steps in order, the check that proves the task, and the commit.

## Progress

- [ ] Task 1: the first deliverable

## Decision log

- YYYY-MM-DD. Write one dated line per choice made during the work.

## Findings

Optional. Record what the work revealed that changes the spec or the requirements.

## Retrospective

Optional. Write it once, when the plan completes: what worked, and what to change next time.
```

- [ ] **Step 5: Create `templates/product.md`**

```markdown
---
title: The product
date: YYYY-MM-DD
---

# The product

## Vision

State what the product is, in one paragraph.

## Users

Name who uses it, and for what.

## Principles

List the rules every feature follows.

## Out of scope

State what the product is not.

## Features

| Feature | Status | Requirements document |
|---|---|---|
| Name each feature | its status | a link to its requirements document |

## Glossary

- The word: one word for one thing, as a bullet per term.
```

- [ ] **Step 6: Create `templates/architecture.md`**

```markdown
---
title: Architecture
date: YYYY-MM-DD
---

# Architecture

## Overview

State what the system does and its main parts, in one screen.

## Code map

Name each top-level folder and what it holds. Name modules, and never link to files, because links rot.

## Invariants

List what must always hold, including absences such as "no raw hex in a view".

## Cross-cutting concerns

Describe errors, logging, accessibility, and tokens.

## Decisions

- Link each decision record that shaped the architecture.
```

- [ ] **Step 7: Create `templates/runbook.md`**

```markdown
---
title: The task
date: YYYY-MM-DD
---

# The task

## Purpose

State when to use this runbook.

## Prerequisites

List what must be true before step 1.

## Steps

1. Write one step per line, and name its expected result.

## Rollback

1. Write how to undo, step by step.
```

- [ ] **Step 8: Check the text and the gate, then commit**

```bash
node checks/text-report.mjs ../technical-standard/templates/*.md
# expect the last line: text report: 0 long sentences, 0 acronyms
ls ../technical-standard/templates | wc -l     # expect 7
checks/run.sh              # expect exit 0
cd .. && git add technical-standard/templates && cd visual-standard
git status --short         # expect the seven template files staged and nothing else
git commit -m "$(cat <<'EOF'
Seven templates give every document type a starting copy
EOF
)"
```

### Task 4: the first decision record

**Files:**
- Create: `docs/adr/0001-markdown-source-built-view.md`

**Interfaces:**
- Consumes: `templates/adr.md` from task 3.
- Produces: decision record 1, which task 5 indexes.

- [ ] **Step 1: Create the record**

```markdown
---
title: Markdown is the source of every document
status: approved
date: 2026-09-22
spec: ../specs/0001-documentation-standard.md
---

# Markdown is the source of every document

## Context

The design system's documents serve a person and a coding agent. The sheet and the products document are hand-written web pages with generated regions. A hand-styled web page copies the tokens, and the copy drifts from the system.

An agent that edits a web page pays for the markup. The products document is 3.5 times its visible text. The sheet is 3.8 times. A spec as a web page is 1.7 times its Markdown. GitHub shows a web page as raw source and renders Markdown.

## Options

1. Web pages as the source, with a Markdown twin generated for agents.
2. Markdown as the source, with a design-system view built from it.
3. Markdown only, with no view.

## Decision

Markdown is the source of every text document. A later piece of work builds a design-system view from it. Hand-written web pages remain only for the sheet and the products document, because they draw.

The agent reads and edits the source. The person reads the view. Each document carries front matter that the view build and the checks read.

## Consequences

Easier: an agent edits a small file, and a diff shows the words. GitHub renders every record. One stylesheet styles every view, so no document drifts.

Harder: until the view build exists, a figure that needs a component is a markup block inside the Markdown. The view is one build step away from the source.
```

- [ ] **Step 2: Check the text and the gate, then commit**

```bash
node checks/text-report.mjs ../docs/adr/0001-markdown-source-built-view.md
# expect the last line: text report: 0 long sentences, 0 acronyms
wc -l ../docs/adr/0001-markdown-source-built-view.md     # expect 60 or fewer
checks/run.sh              # expect exit 0
cd .. && git add docs/adr/0001-markdown-source-built-view.md && cd visual-standard
git commit -m "$(cat <<'EOF'
Decision record 1 records Markdown as the source of every document
EOF
)"
```

### Task 5: the indexes and the links

**Files:**
- Create: `docs/README.md`
- Create: `docs/prd/README.md`
- Create: `docs/specs/README.md`
- Create: `docs/adr/README.md`
- Create: `docs/plans/README.md`
- Modify: `docs/prd/0001-documentation-standard.md` (front matter only)
- Modify: `docs/specs/0001-documentation-standard.md` (front matter only)

**Interfaces:**
- Consumes: the four records that exist: `prd/0001`, `specs/0001`, `adr/0001`, `plans/0001`.
- Produces: one index per folder, and the map of `docs/`.

- [ ] **Step 1: Create `docs/README.md`**

```markdown
---
title: Documents
date: 2026-09-22
---

# Documents

This folder holds the design system's own records and its glossary. The standard that shapes them is [the documentation standard](../technical-standard/documentation.md).

| Folder or file | What it holds |
|---|---|
| `glossary.md` | the approved words; the text judge reads it |
| `prd/` | the requirements documents: what a feature must do, and the proof |
| `specs/` | the specs: how, as a whole |
| `adr/` | the decision records: one choice that outlives a feature |
| `plans/` | the plans: the order of work, with progress |

To write a new record, copy its template from `../technical-standard/templates/`. Give it the next number, and add it to the folder's `README.md`.
```

- [ ] **Step 2: Create the four folder indexes**

`docs/prd/README.md`:

```markdown
---
title: Requirements documents
date: 2026-09-22
---

# Requirements documents

| Number | Title | Status | Date |
|---|---|---|---|
| [0001](0001-documentation-standard.md) | Documentation standard | approved | 2026-09-22 |
```

`docs/specs/README.md`:

```markdown
---
title: Specs
date: 2026-09-22
---

# Specs

| Number | Title | Status | Date |
|---|---|---|---|
| [0001](0001-documentation-standard.md) | Documentation standard | approved | 2026-09-22 |
```

`docs/adr/README.md`:

```markdown
---
title: Decision records
date: 2026-09-22
---

# Decision records

| Number | Title | Status | Date |
|---|---|---|---|
| [0001](0001-markdown-source-built-view.md) | Markdown is the source of every document | approved | 2026-09-22 |
```

`docs/plans/README.md`:

```markdown
---
title: Plans
date: 2026-09-22
---

# Plans

| Number | Title | Status | Date |
|---|---|---|---|
| [0001](0001-documentation-standard.md) | Documentation standard | approved | 2026-09-22 |
```

- [ ] **Step 3: Add the plan link to the two approved records**

In `docs/prd/0001-documentation-standard.md`, add one line to the front matter after the `spec:` line:

```yaml
plan: ../plans/0001-documentation-standard.md
```

In `docs/specs/0001-documentation-standard.md`, add one line to the front matter after the `prd:` line:

```yaml
plan: ../plans/0001-documentation-standard.md
```

Change nothing else in either file. The standard allows this: after approval, a link can join the front matter when a related record appears.

- [ ] **Step 4: Verify the indexes cover every record**

At the repository root:

```bash
for d in prd specs adr plans; do
  for f in docs/$d/[0-9]*.md; do
    n=$(basename "$f" .md | cut -c1-4)
    grep -q "\[$n\]" "docs/$d/README.md" || echo "missing $f in docs/$d/README.md"
  done
done
echo "index check done"      # expect no "missing" line above
```

- [ ] **Step 5: Check the text and the gate, then commit**

From `visual-standard/`:

```bash
node checks/text-report.mjs ../docs/README.md ../docs/prd/README.md ../docs/specs/README.md ../docs/adr/README.md ../docs/plans/README.md
# expect the last line: text report: 0 long sentences, 0 acronyms
checks/run.sh              # expect exit 0
cd .. && git add docs/README.md docs/prd/README.md docs/specs/README.md docs/adr/README.md docs/plans/README.md docs/prd/0001-documentation-standard.md docs/specs/0001-documentation-standard.md && cd visual-standard
git commit -m "$(cat <<'EOF'
Every record folder gets its index and docs/ gets its map
EOF
)"
```

### Task 6: the root documents

**Files:**
- Modify: `AGENTS.md` (lines 3 and 41; the file must stay at 100 lines or fewer)
- Modify: `README.md` (the first paragraph, and one new section after "## The repository")
- Modify: `CHANGELOG.md` (the release entry)

**Interfaces:**
- Consumes: the paths from tasks 2 to 5.
- Produces: the root documents that name the standard.

- [ ] **Step 1: Edit `AGENTS.md`**

Line 3 reads:

```
This repository holds the design system. The visual standard in `visual-standard/` holds the sheet, the token file, and the build.
```

Change it to:

```
This repository holds the design system: the visual standard in `visual-standard/` and the technical standard in `technical-standard/`.
```

Line 41 reads:

```
- Use `docs/` when a change touches a recorded decision.
```

Change it to:

```
- Use `technical-standard/documentation.md` to write a document, and `docs/` to find a recorded decision.
```

Change nothing else. Run `wc -l AGENTS.md` and expect 100.

- [ ] **Step 2: Edit `README.md`**

In the first paragraph under "## The repository", after the sentence `The visual standard lives in \`visual-standard/\`.`, add:

```
The technical standard lives in `technical-standard/`.
```

After the "## The repository" section and before "## Build", add this section:

```markdown
## The documents

`technical-standard/documentation.md` defines the documents every repository holds: the living documents and the records. `technical-standard/templates/` holds one template per document type. `docs/` holds this repository's records and the glossary, with an index in each folder.

To write a new record, copy its template and give it the next number in its folder. Add it to the folder's `README.md`. Run `node checks/text-report.mjs ../docs/prd/0002-slug.md` from `visual-standard/` to check its text.
```

- [ ] **Step 3: Edit `CHANGELOG.md`**

In `CHANGELOG.md`, under the release heading, after the `### The repository` block, add:

```markdown
### The technical standard

- `technical-standard/documentation.md` defines the documents every repository holds. `technical-standard/templates/` holds one template per document type.
- `docs/` gains four record folders: `prd/`, `specs/`, `adr/`, and `plans/`. Each has an index. The first records are there: the requirements document, the spec, the plan, and the decision record for the source format.
- The text report reads a Markdown file passed as an argument.
```

- [ ] **Step 4: Verify and commit**

At the repository root:

```bash
wc -l AGENTS.md                                   # expect 100
grep -c "technical-standard/documentation.md" AGENTS.md README.md   # expect 1 and 2 or more
```

From `visual-standard/`:

```bash
git show HEAD:README.md > /tmp/readme-before.md
node checks/text-report.mjs /tmp/readme-before.md | tail -1
node checks/text-report.mjs ../README.md | tail -1
# The readme holds older sentences that break the rules. The two last lines must show the same
# numbers: your edit adds no long sentence and no acronym. Do the same for CHANGELOG.md.
checks/run.sh              # expect exit 0
cd .. && git add AGENTS.md README.md CHANGELOG.md && cd visual-standard
git commit -m "$(cat <<'EOF'
The root documents name the technical standard and the records
EOF
)"
```

### Task 7: acceptance and release

**Files:**
- Modify: `docs/plans/0001-documentation-standard.md` (Progress, Decision log, Retrospective, status)
- Modify: `docs/prd/0001-documentation-standard.md` (status only)
- Modify: `docs/specs/0001-documentation-standard.md` (status only)
- Modify: `docs/prd/README.md`, `docs/specs/README.md`, `docs/plans/README.md` (the status column)

- [ ] **Step 1: Run every testable acceptance criterion**

At the repository root:

```bash
# 2. Folders and file names
ls docs/prd docs/specs docs/adr docs/plans > /dev/null
find docs/prd docs/specs docs/adr docs/plans -type f ! -name README.md | grep -vE '/[0-9]{4}-[a-z0-9-]+\.md$'
echo "criterion 2: no file name above"

# 3. Index coverage
for d in prd specs adr plans; do
  for f in docs/$d/[0-9]*.md; do
    n=$(basename "$f" .md | cut -c1-4)
    grep -q "\[$n\]" "docs/$d/README.md" || echo "missing $f"
  done
done
echo "criterion 3: no missing line above"

# 5. Front matter
for f in docs/*/[0-9]*.md; do
  head -1 "$f" | grep -q '^---$' || echo "no front matter: $f"
  for k in title status date; do grep -q "^$k:" "$f" || echo "no $k: $f"; done
done
grep -q '^prd:' docs/specs/0001-documentation-standard.md && echo "criterion 5: spec names its requirements document"

# 6. The judge's test and the glossary
(cd visual-standard && node --test checks/text-judge.test.mjs > /dev/null) && echo "criterion 6: judge test passes"
[ "$(grep -c '^- ' docs/glossary.md)" -eq 15 ] && echo "criterion 6: fifteen terms"

# 7. The root documents
[ -e technical-standard/README.md ] && echo "criterion 7: the technical standard has its map"
grep -q 'technical-standard/documentation.md' AGENTS.md && echo "criterion 7: AGENTS.md names the standard"

# 8. The four records
ls docs/prd/0001-*.md docs/specs/0001-*.md docs/plans/0001-*.md docs/adr/0001-*.md

# 9. The text report over docs/ and technical-standard/
(cd visual-standard && node checks/text-report.mjs ../docs/*.md ../docs/*/*.md ../technical-standard/*.md ../technical-standard/templates/*.md | tail -1)
# expect: text report: 0 long sentences, 0 acronyms

# 10 and 11. Lengths
wc -l AGENTS.md docs/prd/0001-documentation-standard.md docs/adr/0001-markdown-source-built-view.md
# expect 100 or fewer, 150 or fewer, 60 or fewer
```

Every line must match its expectation. If one does not, fix the cause in the task that owns it. Commit the fix and run this step again.

- [ ] **Step 2: Dry-run the end-to-end criterion**

At the repository root:

```bash
cp technical-standard/templates/prd.md docs/prd/0002-dry-run.md
(cd visual-standard && node checks/text-report.mjs ../docs/prd/0002-dry-run.md | tail -1)
# expect: text report: 0 long sentences, 0 acronyms
rm docs/prd/0002-dry-run.md
git status --short         # expect no output
```

The owner performs the real end-to-end gate with the first product requirements document. Record the dry run in Findings.

- [ ] **Step 3: Close the plan and set the statuses**

In `docs/plans/0001-documentation-standard.md`: tick every box in Progress. Add the Findings and the Retrospective sections at the end. Set `status: released` in the front matter.

In `docs/prd/0001-documentation-standard.md` and `docs/specs/0001-documentation-standard.md`: set `status: released`. Change nothing else.

In `docs/prd/README.md`, `docs/specs/README.md`, and `docs/plans/README.md`: change the status cell of record 0001 to `released`.

- [ ] **Step 4: Gate, commit, and hand over**

From `visual-standard/`:

```bash
checks/run.sh              # expect exit 0
cd .. && git add docs/plans/0001-documentation-standard.md docs/prd/0001-documentation-standard.md docs/specs/0001-documentation-standard.md docs/prd/README.md docs/specs/README.md docs/plans/README.md && cd visual-standard
git commit -m "$(cat <<'EOF'
The documentation standard's records are released
EOF
)"
git log --oneline main..HEAD    # expect eight commits
```

Report the eight commit hashes and the output of step 1 to the owner. The owner merges the branch into `main` and deletes it. Do not merge.

## Progress

- [x] Task 1: the text report reads Markdown
- [x] Task 2: the technical standard folder and the standard
- [x] Task 3: the seven templates
- [x] Task 4: the first decision record
- [x] Task 5: the indexes and the links
- [x] Task 6: the root documents
- [x] Task 7: acceptance and release

## Decision log

- 2026-09-22. The text report gains Markdown support in task 1, before any Markdown is written. Every later task can then check its own text.
- 2026-09-22. `markdownRuns` moves from the text judge to the text report. The judge imports it. The report cannot import from the judge without a cycle.
- 2026-09-22. A fence closes only on a fence of the same character and at least the same length. This plan holds three-backtick blocks inside four-backtick blocks, and the report must read it.
- 2026-09-22. The templates use `YYYY-MM-DD` and `0000-slug` as placeholders. Angle brackets would vanish when GitHub renders the page.
- 2026-09-22. The owner performs the end-to-end gate on the first product requirements document. Task 7 dry-runs it with a copy of the template and removes the copy.

## Findings

- 2026-09-22. The dry run copied `technical-standard/templates/prd.md` to `docs/prd/0002-dry-run.md`. The text report printed zero long sentences and zero acronyms. The dry run then removed the copy. `git status --short` printed no output.
- 2026-09-22. The spec template and the plan template wrap `YYYY-MM-DD` in backticks. A bare placeholder is an acronym in the text report. Front matter keeps the placeholder bare, because front matter is not text.
- 2026-09-22. A living document carries no `status` field. Requirement F5 names `status` on every document. The standard gives `status` to a record only. Acceptance criterion 5 tests records only.
- 2026-09-22. The spec says an index holds one table and nothing else. The standard allows front matter, a heading, and one table. The indexes in this repository follow the standard.
- 2026-09-22. The plan's task 6 comment expects two or more mentions of `technical-standard/documentation.md` in `README.md`. The specified section holds one mention. That count is the one this work accepts.
- 2026-09-22. `docs/glossary.md` has front matter, as every document has. The text judge reads a file through `fileRuns`, so front matter never reaches it. One test covers it.

## Retrospective

Task 1 taught the text report to read Markdown before any later task wrote a document. Each later task could check its own text. The next plan can keep that order.

The two date placeholders in prose needed backticks. The next template can wrap a capital placeholder the same way.
