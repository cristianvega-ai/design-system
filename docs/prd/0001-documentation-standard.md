---
title: Documentation standard
status: released
date: 2026-09-22
product: design system
spec: ../specs/0001-documentation-standard.md
plan: ../plans/0001-documentation-standard.md
---

# Documentation standard

## Overview

Every repository holds documents for two readers: a person and a coding agent. The repositories share no standard for them. This repository holds no records, and the product repositories hold none. A person cannot tell which document answers which question. An agent cannot find a decision without reading everything.

Success looks like this. One standard names each document, its home, its shape, and its life. The standard lives in the design system as its technical standard, next to the visual standard. A new document starts from a template. A reader finds any record by its number. This repository follows the standard first, and each product repository adopts it when it adopts the system.

## Goals

1. One document set for every repository, with one job per document.
2. One shape per document type, with common names for sections and statuses.
3. Records that a person cites by number and an agent finds by path.
4. Templates that a new document starts from.
5. This repository follows the standard before any product does.

## Out of scope

- The design-system view of the documents. A later piece of work builds it from the Markdown.
- The product repositories. Each adopts the standard when it adopts the system.
- The products' requirements documents. They follow in the next piece of work, in each product's own repository.
- The text rules, the git rules, and the agent-file rules as files in `technical-standard/`. They stay in `README.md` and `AGENTS.md` until a later piece moves them.
- A check that reads the front matter or the indexes. It lands with the view.
- A published package for the templates.
- New names for the scripts in `checks/`. That is a follow-up.

## Functional requirements

- **F1.** `technical-standard/documentation.md` must hold the standard: the document set, each shape, and the rules.
- **F2.** `docs/` must hold four record folders: `prd`, `specs`, `adr`, and `plans`.
- **F3.** Each record folder must hold a `README.md` with one table: number, title, status, date.
- **F4.** `technical-standard/templates/` must hold one template per document type: requirements document, spec, decision record, plan, product document, architecture document, and runbook.
- **F5.** Every document must start with front matter that names its title, status, and date.
- **F6.** A record's front matter must link the records it relates to.
- **F7.** A record's file name must be four digits and a slug, and each folder must count from `0001`.
- **F8.** `docs/glossary.md` must hold the approved words, and the text judge must read them from it.
- **F9.** `technical-standard/README.md` must map the folder, and `AGENTS.md` and `README.md` must point to the standard and to `docs/`.
- **F10.** This work must leave four records: this document, its spec, its plan, and one decision record for the source format.

## Non-functional requirements

- **N1.** Every document must follow the text rules.
- **N2.** `AGENTS.md` must stay at 100 lines or fewer.
- **N3.** A requirements document must fit in 150 lines, and a decision record in 60 lines.
- **N4.** Every document must render on GitHub with no build step.
- **N5.** `checks/run.sh` must exit 0 after every task of the plan.
- **N6.** A template must carry its section list and one line of guidance per section, and nothing else.

## Acceptance criteria

1. F1, manual gate: `technical-standard/documentation.md` holds the five parts of the standard as approved on 2026-09-22.
2. F2 and F7, test: `docs/` holds the four folders, and every file in them except `README.md` matches `^[0-9]{4}-[a-z0-9-]+\.md$`.
3. F3, test: each folder's `README.md` names every record in the folder with its status and date.
4. F4 and N6, manual gate: `technical-standard/templates/` holds seven files, and each carries the approved sections in order.
5. F5 and F6, test: each record's front matter holds `title`, `status`, and `date`. Each spec names its requirements document.
6. F8, test: `node --test checks/text-judge.test.mjs` passes, and `docs/glossary.md` holds fifteen terms that the judge reads.
7. F9, test: `technical-standard/README.md` exists, and `AGENTS.md` names `technical-standard/documentation.md`.
8. F10, test: `docs/prd/0001`, `docs/specs/0001`, `docs/plans/0001`, and `docs/adr/0001` exist.
9. N1, test: the text report prints zero long sentences and zero acronyms for every file under `docs/` and `technical-standard/`.
10. N2, test: `wc -l AGENTS.md` prints 100 or less.
11. N3, test: this document has 150 lines or fewer, and `docs/adr/0001` has 60 or fewer.
12. N4, manual gate: each document under `docs/` and `technical-standard/` renders on GitHub with its front matter as a table.
13. End to end, manual gate: a new requirements document starts from the template and takes number `0002`. It appears in the index and passes the text report. `checks/run.sh` exits 0.
