---
title: Git standard
date: 2026-09-22
---

# Git standard

This standard says how a branch, a commit, a merge, and a release look in every repository. The records in `docs/` hold the reasoning. A commit points to a record and does not repeat it. The text rules apply to every line of a commit message.

## Branches

- Create each branch from a current `main`.
- Name the branch `<type>/<description>`, for example `fix/live-gate-retry`.
- Write the description as two to five lowercase words joined by hyphens. State the outcome.
- Keep one outcome in one branch, and delete the branch after it merges.
- A branch that a tool creates keeps the tool's name, for example `dependabot/...`.

| Type | Use it for |
| --- | --- |
| `feature` | new functionality |
| `fix` | a defect correction |
| `content` | published words that do not change behavior |
| `documentation` | words about the repository |
| `test` | test-only changes |
| `performance` | measured performance work |
| `refactor` | restructuring that preserves behavior |
| `chore` | repository or tooling maintenance |

Use the complete word. Do not use a short form such as `feat`, `docs`, or `perf`.

## Commits

- A commit holds one outcome. A plan task is one commit.
- The subject is one sentence that states the change as a fact, in 72 characters or fewer. It has no period, no prefix, and no trailer. Example: `The text report reads a Markdown file passed as an argument`.
- A body is optional. Write one when the subject cannot carry the why, or when the change touches more than one thing.
- A body holds plain paragraphs and `-` bullets, wrapped at 72 characters. It holds no heading, because git drops a line that starts with `#` when the message passes through the editor.
- When a record exists for the work, the body's first line names it, as in `Plan 4, task 2` or `Decision record 2`. Nothing else from the record is repeated.
- The sheet, the products document, `dist/`, and the token file travel in one commit.

## Merges

- A merge into `main` is a merge commit. Its subject states the branch's outcome.
- Every check passes before the merge.

## Releases

- The release commit reads `The design system releases version 1.2.0`. It carries the new version and date in the token file, the package files, and the version test. The built stamps and the change log entry carry them too.
- The tag is `v1.2.0`, annotated with `Design system 1.2.0`.
- `README.md` holds the release steps.
