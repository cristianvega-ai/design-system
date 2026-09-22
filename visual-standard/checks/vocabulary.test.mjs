import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { descriptiveRuns, FILES } from './text-report.mjs';

// Two words the sheet and the products document must not carry.
//
// 1. "paper". The system has two grounds, surface and ink. The light page is surface and its
//    recess is surface-well, called the well. The word is banned in descriptive text, in a class
//    attribute, in a custom property name, and in a label. No other scan reads a label, so a label
//    is checked too, both the aria-label text and the text of every element an aria-labelledby names.
//    Specimen text is out of scope, so a drawn screen can still show a product's own string:
//    descriptiveRuns drops every specimen, and ALLOWED_SENTENCE keeps the one specimen list item
//    that reads "Draft on paper."
// 2. A class name that aliases a native state. The state naming rule says the attribute carries
//    the state, so the class is a second source of truth that drifts. The classes a product sets
//    from its own model stay allowed: is-active, is-selected, is-open, is-now, is-sorted,
//    is-waiting, is-pass, is-fail, is-run, is-decided, is-stale, is-denied, is-over, is-accepted,
//    is-rejected, is-here, is-sub, is-loading, is-live, and is-fall.

const ROOT = new URL('../', import.meta.url);
const read = (file) => readFileSync(new URL(file, ROOT), 'utf8');
const lineOf = (html, index) => html.slice(0, index).split('\n').length;

const GROUND = /paper/i;
const ALLOWED_SENTENCE = 'Draft on paper.';
const NATIVE_STATE_ALIASES = new Set(['is-on', 'is-checked', 'is-pressed', 'is-disabled', 'is-focus', 'is-error']);

const classAttributes = (html) => html.matchAll(/\bclass="([^"]*)"/g);

const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', middot: '·', hellip: '…', mdash: '—', ndash: '–', times: '×', rarr: '→', larr: '←' };
const plain = (markup) => markup
  .replace(/<[^>]*>/g, ' ')
  .replace(/&([a-zA-Z]+|#x[0-9a-fA-F]+|#\d+);/g, (whole, body) => (body[0] === '#' ? ' ' : ENTITIES[body] ?? ' '))
  .replace(/\s+/g, ' ')
  .trim();

// The markup an element holds, from the "<" of its opening tag to its matching closing tag. The
// walk counts the same tag name in and out, so a nested one does not end the element early.
function elementMarkup(html, at) {
  const open = /^<([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>/.exec(html.slice(at));
  if (!open) return '';
  const tag = open[1].toLowerCase();
  if (VOID_TAGS.has(tag) || open[2].trimEnd().endsWith('/')) return '';
  const start = at + open[0].length;
  const pattern = new RegExp(`</?${tag}\\b[^>]*>`, 'gi');
  pattern.lastIndex = start;
  let depth = 1;
  for (let match; (match = pattern.exec(html));) {
    if (match[0][1] === '/') { if (--depth === 0) return html.slice(start, match.index); }
    else if (!match[0].endsWith('/>')) depth++;
  }
  return '';
}

// Every label a browser would read: the aria-label text, and the text of each element an
// aria-labelledby names. Each run carries the position of the attribute that asked for it.
export function labelRuns(html) {
  const runs = [];
  for (const match of html.matchAll(/\baria-label="([^"]*)"/g)) {
    runs.push({ kind: 'aria-label', text: plain(match[1]), index: match.index });
  }
  for (const match of html.matchAll(/\baria-labelledby="([^"]*)"/g)) {
    for (const id of match[1].trim().split(/\s+/).filter(Boolean)) {
      const at = html.search(new RegExp(`<[a-zA-Z][a-zA-Z0-9-]*[^>]*\\bid="${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
      if (at < 0) continue;
      runs.push({ kind: `aria-labelledby=${id}`, text: plain(elementMarkup(html, at)), index: match.index });
    }
  }
  return runs;
}

export function findGround(html) {
  const found = [];
  for (const run of descriptiveRuns(html)) {
    for (const piece of run.text.replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+/)) {
      if (piece === ALLOWED_SENTENCE || !GROUND.test(piece)) continue;
      found.push(`${lineOf(html, run.index)}: ${piece.slice(0, 80)}`);
    }
  }
  for (const match of classAttributes(html)) {
    if (GROUND.test(match[1])) found.push(`${lineOf(html, match.index)}: class="${match[1]}"`);
  }
  for (const match of html.matchAll(/--[a-z0-9-]*paper[a-z0-9-]*/gi)) {
    found.push(`${lineOf(html, match.index)}: ${match[0]}`);
  }
  for (const run of labelRuns(html)) {
    if (GROUND.test(run.text)) found.push(`${lineOf(html, run.index)}: ${run.kind} "${run.text.slice(0, 80)}"`);
  }
  return found;
}

export function findStateAliases(html) {
  const found = [];
  for (const match of classAttributes(html)) {
    for (const name of match[1].split(/\s+/)) {
      if (NATIVE_STATE_ALIASES.has(name)) found.push(`${lineOf(html, match.index)}: class="${match[1]}"`);
    }
  }
  return found;
}

test('neither document names the retired ground', () => {
  for (const file of FILES) assert.deepEqual(findGround(read(file)), [], file);
});

test('neither document carries a class that aliases a native state', () => {
  for (const file of FILES) assert.deepEqual(findStateAliases(read(file)), [], file);
});
