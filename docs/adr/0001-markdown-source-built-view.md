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
