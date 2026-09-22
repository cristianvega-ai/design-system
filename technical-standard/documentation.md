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
