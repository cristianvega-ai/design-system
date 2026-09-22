---
title: Documentation standard
status: released
date: 2026-09-22
prd: ../prd/0001-documentation-standard.md
plan: ../plans/0001-documentation-standard.md
---

# Documentation standard

## Summary

This spec defines the documents that every repository holds, the shape of each, and the rules that bind them. It also defines how this repository adopts the standard: which files move, which files go, and which files change. The standard came out of a conversation on 2026-09-22, part by part. This document is the record of it. `technical-standard/documentation.md` becomes the living copy that later work amends.

The design system is two standards. The visual standard, in `visual-standard/`, says how the products look. The technical standard, in `technical-standard/`, says how the products are built and documented. This spec creates the technical standard with its first content: the documentation standard.

## Architecture

### The document set

Every repository answers four questions: why a thing exists, what it must do, how it works, and what was decided. A person or an agent finds each answer without leaving the repository.

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

Two kinds, one rule each:

- A **living** document describes now. When code changes what it says, the document changes in the same commit. It carries the date of its last update and no status.
- A **record** has a number, a date, and a status. After approval, only its front matter changes: the status, and a link when a related record appears. A later record supersedes it.

`README.md`, `AGENTS.md`, and `CHANGELOG.md` follow the standards they already follow. `AGENTS.md` stays at 100 lines. No repository holds a `CLAUDE.md`, because Claude Code reads `AGENTS.md` when no `CLAUDE.md` exists.

### The layout of every repository

```
README.md
AGENTS.md
ARCHITECTURE.md
CHANGELOG.md
docs/
  README.md        the map of docs/, with a link to the standard
  product.md       one per product
  glossary.md      only where there is no product document
  prd/             README.md, 0001-slug.md, ...
  specs/           README.md, 0001-slug.md, ...
  adr/             README.md, 0001-slug.md, ...
  plans/           README.md, 0001-slug.md, ...
  runbooks/        release.md, ...
```

A repository holds its own records. A product repository gets its `docs/` on the day it exists, before its code moves in. The standard itself and the templates live in one place, the design system.

### The layout of this repository

```
design-system/
  README.md
  AGENTS.md
  CHANGELOG.md          one version for the whole system
  docs/                 this repository's records, and the glossary
  visual-standard/      the token file, the sheet, the products document, the build, the checks, dist/, the fonts, the icons
  technical-standard/
    README.md           the map of the folder
    documentation.md    the documentation standard
    templates/          one template per document type
```

`technical-standard/text.md`, `git.md`, and `agents.md` come later. The text rules stay in `README.md` and the git rules in `AGENTS.md` until a later piece moves them.

### The chain

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

### This repository

The repository follows the standard as its first adopter. The plan delivers six things:

1. `technical-standard/` holds `README.md`, `documentation.md`, and `templates/` with seven templates.
2. `docs/prd/`, `docs/specs/`, `docs/adr/`, and `docs/plans/` each hold a `README.md` index. `docs/README.md` maps the folder and links to the standard.
3. `docs/glossary.md` holds the approved words, because this repository has no product document. `checks/text-judge.mjs` reads the glossary from it.
4. `checks/text-report.mjs` reads a Markdown file, as the judge does, so the report covers `docs/` and `technical-standard/`.
5. `AGENTS.md` points to `technical-standard/documentation.md` and to `docs/`. `README.md` holds one section on the two standards. `CHANGELOG.md` names them in the first release.
6. Four records document the work: `prd/0001`, `specs/0001`, `plans/0001`, and `adr/0001` for the source format.

## Interfaces

Templates, indexes, and the later view build read these shapes. A change here is a change to every document.

### Front matter

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

### File names and numbers

A record is named `0001-slug.md`: four digits, a hyphen, and a lowercase slug. Each folder counts from `0001`, and a number is never reused. Numbers do not align across folders; the front matter links them. A living document has a fixed name.

### Statuses

| Record | Statuses |
|---|---|
| requirements document, spec, plan | draft → approved → released |
| decision record | draft → approved → superseded |

A decision is never released. It holds as approved until a later record supersedes it. A released record that a later record replaces also becomes superseded. The two name each other in the front matter. A draft can change or be deleted. After approval, only the front matter changes: the status, and a link when a related record appears. The one exception is the plan: Progress, Decision log, and Findings stay open.

### The index

Each record folder holds a `README.md` with one table and nothing else:

| Number | Title | Status | Date |
|---|---|---|---|

### The requirements document

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

### The spec

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

### The decision record

| # | Section | What goes in it |
|---|---|---|
| 1 | Metadata | front matter: status, date, link to the spec or requirements document that raised it |
| 2 | Context | the situation and the forces at play |
| 3 | Options | each option considered, one line each |
| 4 | Decision | what was chosen, and why |
| 5 | Consequences | what gets easier, what gets harder |

Nothing optional. One page.

### The plan

| # | Section | What goes in it |
|---|---|---|
| 1 | Metadata | front matter: status, date, links to the requirements document and the spec |
| 2 | Summary | what the plan delivers, and the command that proves it when done |
| 3 | Tasks | numbered and ordered; each names its files and its check |
| 4 | Progress | one checkbox per task; the agent ticks it as it works |
| 5 | Decision log | dated lines for choices made during the work |

Optional: Findings, Retrospective. A plan is the one record an agent edits after approval, and only in Progress, Decision log, and Findings.

### The product document

| # | Section | What goes in it |
|---|---|---|
| 1 | Vision | what the product is, in one paragraph |
| 2 | Users | who uses it, and for what |
| 3 | Principles | the rules every feature follows |
| 4 | Out of scope | what the product is not |
| 5 | Features | a table: each feature, its status, a link to its requirements document |
| 6 | Glossary | one word for one thing |

### The architecture document

| # | Section | What goes in it |
|---|---|---|
| 1 | Overview | what the system does and its main parts, in one screen |
| 2 | Code map | each top-level folder and what it holds; names modules, never links to files |
| 3 | Invariants | what must always hold, including absences |
| 4 | Cross-cutting concerns | errors, logging, accessibility, tokens |
| 5 | Decisions | links to the decision records that shaped it |

### The runbook

| # | Section | What goes in it |
|---|---|---|
| 1 | Purpose | when to use this runbook |
| 2 | Prerequisites | what must be true before step 1 |
| 3 | Steps | numbered; each step names its expected result |
| 4 | Rollback | how to undo, step by step |

### The rules

1. Markdown is the source of every document. The design-system view is built from it, in a later piece of work.
2. `technical-standard/documentation.md` in the design system holds the standard. `docs/README.md` in every repository maps its `docs/` and links to the standard.
3. `technical-standard/templates/` holds one template per document type. A new document starts as a copy.
4. Prose cites a record by number: "decision record 3". Links are relative.
5. The text rules apply to every document. In sentences, the names are "requirements document", "spec", "decision record", and "plan".
6. A requirements document fits in 150 lines. A decision record fits in 60. `AGENTS.md` stays at 100.
7. A template carries its section list and one line of guidance per section, and nothing else.

## Decisions

- 2026-09-22. Markdown is the source; the design-system view is built from it. Becomes decision record 1.
- 2026-09-22. The standard lives in this repository. Each product repository adopts it when it adopts the system.
- 2026-09-22. Four record folders. The spec is the technical decision as a whole; the decision record is one part that outlives the feature.
- 2026-09-22. Every record is numbered. Each folder counts from `0001`.
- 2026-09-22. Section and status names are the common ones: Overview, Functional requirements, Acceptance criteria; draft, approved, released.
- 2026-09-22. One thing per section. "Goals and non-goals" splits into Goals and Out of scope.
- 2026-09-22. The glossary lives in `docs/glossary.md`, because this repository has no product document.
- 2026-09-22. No `CLAUDE.md`.
- 2026-09-22. The design system is two standards: the visual standard in `visual-standard/` and the technical standard in `technical-standard/`. Both share one version and one change log.
- 2026-09-22. A product's records live in the product's own repository from its first day. This repository holds no product records.
- 2026-09-22. Whether the view build tracks its rendered files is decided with that piece of work, not here.

## Alternatives considered

- **The documents as web pages, with a Markdown twin for agents.** Richest layout, and the products document already works this way. Rejected. Each agent edit costs 1.7 to 3.8 times the tokens. Diffs are noisy. GitHub shows raw source. A hand-styled page drifts from the tokens.
- **Markdown only, no view.** Simplest. Rejected: the design system must be able to show its own documents.
- **Three record folders, with no spec.** Fewer types. Rejected: the owner wants the whole technical design in one place, apart from the plan.
- **A separate documents repository.** Rejected: two repositories to keep in step, for one person.
- **Dates in file names.** Rejected: people cite numbers, not dates.
- **One number sequence across all folders.** Rejected: a gap in one folder confuses more than a mismatch across folders.
- **Section names from the source material: Jobs, Verification, Non-goals.** Rejected: the common names cost nothing and every reader knows them.
- **A repository named `standards` with `design-system/` and `technical-standard/` inside.** Rejected: the design system is the umbrella, and the rename buys nothing. Two folders under the current name say the same thing.
- **The products' records in this repository under `docs/products/`, until the product repositories adopt the system.** Rejected: a repository holds its own records, and a product repository can hold `docs/` before its code.

## Testing

The requirements document lists thirteen acceptance criteria. The plan runs the shell tests among them after each task. Three gates need a person: the standard's text, the templates, and the rendering on GitHub. Every task ends with `checks/run.sh` exiting 0. The text report runs on every file under `docs/` and `technical-standard/` and must print zero.
