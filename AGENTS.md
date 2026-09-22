# Cristian Vega design system: agent instructions

This repository holds the design system: the visual standard in `visual-standard/` and the technical standard in `technical-standard/`.
Optimize for agreement between the sheet, `tokens.json`, and `dist/`.

## Precedence

The owner's request in the conversation comes first. This file comes second.
A nested `AGENTS.md` adds rules for its own directory.
If two rules conflict, follow the more specific rule and name the conflict in your summary.

## Language

Write everything about the work in ASD-STE100 Simplified Technical English.
This covers replies, commit messages, comments, test names, and documents, including this file.

- Keep one topic and 20 words or fewer in each sentence.
- Use the active voice.
- Give one instruction per sentence, and start it with the verb.
- Use "must" for a requirement and "can" for a possibility. Do not use "should".
- Use the same word for the same thing.

The text in the sheet and in the products document follows the same rules. `README.md` holds the full list.
Run `node checks/text-report.mjs` to find each sentence that breaks them.

## Commands

```bash
cd visual-standard && npm install   # once, and run every command from that folder
npm run build      # writes dist/ and the generated regions of both documents
checks/run.sh      # the required gate: every check, including the browser check
npm run browser    # rendered states only
```

The build needs Node 24 or newer. Run `npx playwright install chromium` once per machine.

## Where to look

- Use `README.md` when you change a token, add an icon, record an exception, or release a version.
- Use `CHANGELOG.md` to find why a rule exists.
- Use `technical-standard/documentation.md` to write a document, and `docs/` to find a recorded decision.
- Use `docs/glossary.md` for the approved words. The text judge reads it.

## Working rules

- Read each file before you change it, and follow the pattern already in it.
- Make the smallest change that satisfies the request. Report other problems as follow-ups.
- Edit `tokens.json` to change a token. The build overwrites the generated regions, so an edit inside a region is lost.
- This repository is public. Keep each key, private path, and account detail out of tracked files.

### Proceed without asking

Run the build and every check. Edit the token file, the products document, and the sheet outside its generated regions.
These actions are local and reversible.

### Ask first

- adding a dependency, because the tool versions are pinned;
- changing or deleting a check, or adding an entry to `checks/exceptions.json`;
- renaming a token, because products read the names;
- running `node checks/text-judge.mjs`, because it sends text to an external service;
- merging into `main`, releasing a version, or pushing a tag;
- any destructive Git command.

## Git

- Follow `technical-standard/git.md` for branches, commits, merges, and releases.
- Stage files by explicit path. A stage-all also adds private files that `.gitignore` does not cover.
- Confirm what you staged before you write the message.
- Write the subject as one plain sentence that states the change. Use no prefix and no trailer.
- Commit the sheet, the products document, and `dist/` together with the token file.

## Done

A change is complete when:

- `checks/run.sh` passes;
- `git status` shows no accidental files and no uncommitted build output;
- the README and the change log describe each changed command, token, or rule.
