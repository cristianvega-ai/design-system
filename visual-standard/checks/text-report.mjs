import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// A report on the descriptive text of the sheet, the products document, and any Markdown file passed as an argument.
// It is a report, not a check: it always exits 0, and run.sh does not run it.
// Run it by hand: node checks/text-report.mjs
//
// The report reads every file in FILES. It drops every specimen, splits the rest into sentences,
// and prints two lists per file: every sentence over WORD_LIMIT words (with its file, its line,
// and its first 90 characters), and every capitalized word that is not an allowed name. The last
// line is one summary over every file.
//
// A specimen is an element whose class starts with one of SPECIMEN_CLASS_PREFIXES, an element
// whose class is one of SPECIMEN_CLASSES, or an element named in SPECIMEN_TAGS. The walk tracks
// nesting, so a specimen ends at its own closing tag, not at the first nested one.
// A <code> element becomes the word "code", so a class name or a token name inside it is not a word.
// A sentence ends at ".", "!", or "?", at a <br>, at the end of an element named in
// SENTENCE_END_TAGS, or at the end of a link or a button inside a nav, so a table cell, a list
// item, an index link, and a tab in a tab strip each count on their own.
// A word is a token with at least one letter or digit; a separator such as "·" or "/" is not a word.

const WORD_LIMIT = 20;

// The documents the report reads.
export const FILES = ['cristian-vega-design-system.html', 'cristian-vega-products.html'];
// A file argument that ends in .md is read as Markdown: front matter is skipped and fenced code is dropped.

// Names that are written in capitals but are not acronyms: a company, a word, two file names,
// specimen copy in a gate row, a conformance level, part of a license's name, and the wordmarks.
// The products document adds the names it needs: a database, a view class, a search
// extension, a protocol, a subtitle file format, and the first word of an editor's name.
const ALLOWED_NAMES = new Set([
  'IBM', 'OK', 'README', 'CHANGELOG', 'SBOM', 'AA', 'SIL',
  'CRISTIANVEGA', 'CRISTIAN', 'VEGA', 'OPENBUILD', 'OPENWRITE', 'OPENDICTATE', 'DESIGN', 'SYSTEM',
  'SQLite', 'WKWebView', 'FTS5', 'MCP', 'SRT', 'VS',
]);

// "sk-" and "stage" are the products document's drawn screens. Every drawn window already sits
// inside a "picture", so they add nothing today; they keep a screen outside a picture specimen.
const SPECIMEN_CLASS_PREFIXES = ['spec', 'picture', 'ground-test', 'example', 'demo', 'sk-', 'stage'];
const SPECIMEN_CLASSES = new Set(['s']); // the sample text in the Type scale
const SPECIMEN_TAGS = new Set(['pre', 'style', 'script', 'svg']);
const VOID_TAGS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const SENTENCE_END_TAGS = new Set([
  'td', 'th', 'li', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'dt', 'dd', 'figcaption',
  'div', 'section', 'article', 'header', 'footer', 'nav', 'main', 'ul', 'ol', 'table', 'tr', 'figure', 'blockquote', 'caption',
]);

const NAMED_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', times: '×', rarr: '→', larr: '←', hellip: '…', mdash: '—', ndash: '–', middot: '·' };

function decodeEntities(raw) {
  return raw.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (whole, body) => {
    if (body[0] !== '#') return NAMED_ENTITIES[body] ?? ' ';
    const code = body[1] === 'x' || body[1] === 'X' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
    return String.fromCodePoint(code);
  });
}

function isSpecimen(tag, attributes) {
  if (SPECIMEN_TAGS.has(tag)) return true;
  const classMatch = /\bclass="([^"]*)"/.exec(attributes);
  if (!classMatch) return false;
  return classMatch[1].split(/\s+/).some((name) =>
    SPECIMEN_CLASSES.has(name) || SPECIMEN_CLASS_PREFIXES.some((prefix) => name.startsWith(prefix)));
}

// Walks the body tag by tag and returns the descriptive text as runs: { text, index }, where index
// is the position in the sheet of the run's first visible character. A run holds one or more sentences.
export function descriptiveRuns(html) {
  const runs = [];
  let current = { text: '', index: -1 };
  const endRun = () => { if (current.text.trim()) runs.push(current); current = { text: '', index: -1 }; };
  const addText = (text, index) => {
    const firstVisible = text.search(/\S/);
    if (current.index < 0 && firstVisible >= 0) current.index = index + firstVisible;
    current.text += text;
  };

  const open = []; // the stack of open element names
  let specimenDepth = -1; // the stack depth where the current specimen began; -1 outside a specimen
  const tagPattern = /<!--[\s\S]*?-->|<\/?([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>/g;
  let position = html.indexOf('<body>');
  tagPattern.lastIndex = position;
  for (let match; (match = tagPattern.exec(html));) {
    if (specimenDepth < 0 && match.index > position) addText(decodeEntities(html.slice(position, match.index)), position);
    position = match.index + match[0].length;
    if (match[0].startsWith('<!--')) continue;
    const tag = match[1].toLowerCase();
    const attributes = match[2];
    if (match[0].startsWith('</')) {
      const at = open.lastIndexOf(tag);
      if (at >= 0) open.length = at;
      if (specimenDepth >= 0 && open.length <= specimenDepth) specimenDepth = -1;
      const endsRun = SENTENCE_END_TAGS.has(tag) || ((tag === 'a' || tag === 'button') && open.includes('nav'));
      if (specimenDepth < 0 && endsRun) endRun();
      continue;
    }
    if (tag === 'br' && specimenDepth < 0) endRun();
    if (VOID_TAGS.has(tag) || attributes.trimEnd().endsWith('/')) continue;
    if (specimenDepth < 0 && tag === 'code') addText(' code ', match.index);
    if (specimenDepth < 0 && (tag === 'code' || isSpecimen(tag, attributes))) specimenDepth = open.length;
    open.push(tag);
  }
  endRun();
  return runs;
}

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

const lineOf = (html, index) => html.slice(0, index).split('\n').length;
const countWords = (sentence) => sentence.split(/\s+/).filter((token) => /[\p{L}\p{N}]/u.test(token)).length;

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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const files = process.argv.slice(2).filter((argument) => !argument.startsWith('--'));
  let longTotal = 0;
  let acronymTotal = 0;
  for (const file of files.length ? files : FILES) {
    const { longSentences, acronyms } = textReport(readFileSync(file, 'utf8'), file);
    for (const sentence of longSentences) console.log(`${file}:${sentence.line} · ${sentence.words} words: ${sentence.text.slice(0, 90)}`);
    for (const acronym of acronyms) console.log(`${file}:${acronym.line} · acronym: ${acronym.word}`);
    longTotal += longSentences.length;
    acronymTotal += acronyms.length;
  }
  console.log(`text report: ${longTotal} long sentences, ${acronymTotal} acronyms`);
}
