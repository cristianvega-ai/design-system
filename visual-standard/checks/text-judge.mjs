import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { fileRuns } from './text-report.mjs';

// A report on the four text rules that no script can count: the active voice, one topic per
// sentence, the same word for the same thing, and the instruction before the detail.
// It is a report, not a check: run.sh does not run it, and it changes no file. Run it by hand:
//   node checks/text-judge.mjs [--threshold=0.5] [--limit=N] [--files=a.md,b.html]
//
// The report collects the descriptive sentences of the sheet and the documents, sends them to
// TypeSafe's System One model with the glossary file's list of approved words, and asks one yes-or-no
// question per rule. The model returns the probability of "yes", where "yes" means the sentence
// breaks the rule. The report prints every sentence at or above the threshold, worst first.
//
// The key comes from the TYPESAFE_API_KEY variable or from ~/.config/typesafe/api_key.
// The report never prints the key.

export const DEFAULT_FILES = [
  'cristian-vega-design-system.html',
  'cristian-vega-products.html',
  '../README.md',
  '../CHANGELOG.md',
  'fonts/README.md',
  '../docs/glossary.md',
];
export const GLOSSARY_FILE = '../docs/glossary.md';
export const ENDPOINT = 'https://api.typesafe.ai/v1/systemone';
export const MODEL = 'jev-latest';

const RULES = {
  passive: {
    rule: 'passive voice',
    question: 'Is the main clause of this sentence in the passive voice?',
    focus: 'Passive needs a form of "be" (is, are, was, were, be, been) directly followed by a past participle of a transitive verb, with the doer missing or after "by". A verb of motion or change (move, come, go, become, fall back, sit, hold, show, get, follow) is active even when the subject is a thing. "is" or "are" followed by an adjective or a noun is not passive. A label with a colon and no verb is not passive.',
    criteria: {
      true: 'A form of "be" plus a past participle of a transitive verb, and no doer or a doer after "by": "The ring is drawn by the rule", "Each test is written before the code", "The folder is removed after the move", "Nothing is built before its trigger".',
      false: 'The subject acts, even on itself: "The rule draws the ring", "The contents move to the root", "The face falls back to Menlo", "The specimen becomes its native element", "The sprite gets display none", "The old names are gone", "Use the token", "Deleted: the toolbar row", a heading, or a list of values.',
    },
  },
  topics: {
    rule: 'more than one topic',
    question: 'Does this sentence carry more than one topic?',
    focus: 'One topic can still hold a list of the same kind of thing, or one instruction with its condition.',
    criteria: {
      true: 'Two or more independent statements or instructions sit in one sentence, joined by "and", "but", "so", a comma, or a semicolon, and each could stand alone (for example "The sheet sets the layer and a product opens it with a script").',
      false: 'The sentence makes one statement, gives one instruction, or lists values of one kind (for example "Sizes are 28, 32, and 40 px").',
    },
  },
  term: {
    rule: 'another word for an approved term',
    question: 'Does this sentence name a thing from `glossary` with a word other than the approved word?',
    focus: 'Only the things in `glossary` count. The approved word is the "word" field; the "meaning" field says what it names. The word "code" stands for a file name, a command, or a class name and is always allowed. A sentence that defines a term ("X is the token file") uses the approved word.',
    criteria: {
      true: 'The sentence refers to one of the glossary things with a different word: "the document", "the page", or "the file" for the sheet; "the repo" or "the project" for the repository; "the tokens file" or "the token source" for the token file; "the widget" for a composite widget; "the guidelines" for the text rules.',
      false: 'The sentence uses the approved word, names the thing only by its file name or command inside "code", defines the term, or names none of the glossary things.',
    },
  },
  order: {
    rule: 'detail before the instruction',
    question: 'In this paragraph, does the reference detail come before the usage instruction?',
    focus: 'A usage instruction says what to use something for, when to use it, or what a product must do. Reference detail is a size, a value, a list of parts, or a definition.',
    criteria: {
      true: 'The paragraph opens with sizes, values, or definitions and gives the instruction only later.',
      false: 'The instruction comes first and the detail follows, or the paragraph holds only detail, or only an instruction.',
    },
  },
};

const SENTENCE_RULES = ['passive', 'topics', 'term'];

export function splitSentences(text) {
  return text.replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+/).map((piece) => piece.trim()).filter(Boolean);
}

// The approved words: each bullet "- Word: meaning" in the glossary file.
export function glossaryFrom(text) {
  const glossary = [];
  for (const match of text.matchAll(/^- (.+?): (.+)$/gm)) {
    glossary.push({ word: match[1].trim(), meaning: match[2].replace(/`/g, '').trim() });
  }
  return glossary;
}

// One unit per run: { file, line, sentences }.
export function unitsFrom(files, read = (file) => readFileSync(file, 'utf8')) {
  const units = [];
  for (const file of files) {
    const text = read(file);
    const runs = fileRuns(text, file);
    for (const run of runs) {
      const sentences = splitSentences(run.text);
      if (sentences.length) units.push({ file, line: run.line, sentences });
    }
  }
  return units;
}

// Batches of questions over shared state. Every batch carries the glossary, a map of sentences,
// and a map of paragraphs; each question names the item it inspects.
export function buildBatches(units, glossary, { sentencesPerBatch = 60 } = {}) {
  const batches = [];
  let batch = null;
  let sentenceCount = 0;
  let paragraphCount = 0;
  const newBatch = () => { batch = { state: { glossary, sentences: {}, paragraphs: {} }, questions: {}, map: {} }; batches.push(batch); };
  for (const unit of units) {
    if (!batch || Object.keys(batch.state.sentences).length + unit.sentences.length > sentencesPerBatch) newBatch();
    for (const sentence of unit.sentences) {
      const id = `s${sentenceCount++}`;
      const text = sentence.trim();
      batch.state.sentences[id] = text;
      for (const key of SENTENCE_RULES) {
        const rule = RULES[key];
        batch.questions[`${id}_${key}`] = {
          type: 'noul',
          instructions: { question: rule.question, inspect: `sentences.${id}`, focus: rule.focus },
          criteria: rule.criteria,
        };
        batch.map[`${id}_${key}`] = { file: unit.file, line: unit.line, rule: rule.rule, text };
      }
    }
    if (unit.sentences.length >= 2) {
      const id = `p${paragraphCount}`;
      const text = unit.sentences.map((sentence) => sentence.trim()).join(' ');
      batch.state.paragraphs[id] = text;
      const rule = RULES.order;
      batch.questions[`${id}_order`] = {
        type: 'noul',
        instructions: { question: rule.question, inspect: `paragraphs.${id}`, focus: rule.focus },
        criteria: rule.criteria,
      };
      batch.map[`${id}_order`] = { file: unit.file, line: unit.line, rule: rule.rule, text };
    }
    paragraphCount += 1;
  }
  return batches;
}

export function readKey(env = process.env, read = (file) => readFileSync(file, 'utf8')) {
  if (env.TYPESAFE_API_KEY) return env.TYPESAFE_API_KEY.trim();
  try { return read(join(homedir(), '.config', 'typesafe', 'api_key')).trim(); } catch { return ''; }
}

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// One request. Retries on 429 and 529 with a short wait; any other failure throws.
export async function askBatch(batch, { key, fetchImpl = fetch, model = MODEL, wait = pause, retries = 3 } = {}) {
  const body = JSON.stringify({ state: batch.state, model, questions: batch.questions });
  for (let attempt = 0; ; attempt++) {
    const response = await fetchImpl(ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body,
    });
    if (response.ok) return response.json();
    const retry = (response.status === 429 || response.status === 529) && attempt < retries;
    if (!retry) throw new Error(`System One request failed with status ${response.status}: ${(await response.text()).slice(0, 200)}`);
    await wait(1000 * (attempt + 1));
  }
}

// Flags from the answers: every question whose probability of "yes" (a rule break) is at or
// above the threshold, worst first.
export function collectFlags(results, threshold) {
  const flags = [];
  for (const { batch, answers } of results) {
    for (const [id, where] of Object.entries(batch.map)) {
      const answer = answers[id];
      if (!answer || typeof answer.noul !== 'number') continue;
      if (answer.noul >= threshold) flags.push({ ...where, probability: answer.noul });
    }
  }
  return flags.sort((a, b) => b.probability - a.probability || a.file.localeCompare(b.file) || a.line - b.line);
}

export function formatReport(flags, { sentences, paragraphs, threshold }) {
  const lines = flags.map((flag) => `${flag.file}:${flag.line} · ${flag.rule} · ${flag.probability.toFixed(2)} · ${flag.text.slice(0, 110)}`);
  lines.push(`text judge: ${sentences} sentences, ${paragraphs} paragraphs, ${flags.length} flag${flags.length === 1 ? '' : 's'} at ${threshold} or above`);
  return lines;
}

function parseArgs(argv) {
  const options = { threshold: 0.5, limit: Infinity, files: DEFAULT_FILES, concurrency: 2 };
  for (const arg of argv) {
    const [name, value] = arg.replace(/^--/, '').split('=');
    if (name === 'threshold') options.threshold = Number(value);
    if (name === 'limit') options.limit = Number(value);
    if (name === 'files') options.files = value.split(',').filter(Boolean);
    if (name === 'concurrency') options.concurrency = Number(value);
  }
  return options;
}

export async function judge(options, deps = {}) {
  const { threshold, limit, files, concurrency } = options;
  const read = deps.read ?? ((file) => readFileSync(file, 'utf8'));
  const glossary = glossaryFrom(read(GLOSSARY_FILE));
  let units = unitsFrom(files, read);
  if (Number.isFinite(limit)) {
    const kept = [];
    let count = 0;
    for (const unit of units) { if (count >= limit) break; kept.push(unit); count += unit.sentences.length; }
    units = kept;
  }
  const batches = buildBatches(units, glossary);
  const results = [];
  let usage = { input_tokens: 0, output_tokens: 0 };
  const queue = [...batches];
  const worker = async () => {
    for (let batch = queue.shift(); batch; batch = queue.shift()) {
      const response = await askBatch(batch, { key: deps.key, fetchImpl: deps.fetchImpl, model: deps.model });
      results.push({ batch, answers: response.answers ?? {} });
      if (response.usage) usage = { input_tokens: usage.input_tokens + (response.usage.input_tokens ?? 0), output_tokens: usage.output_tokens + (response.usage.output_tokens ?? 0) };
    }
  };
  await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker));
  const sentences = units.reduce((sum, unit) => sum + unit.sentences.length, 0);
  const paragraphs = units.filter((unit) => unit.sentences.length >= 2).length;
  const flags = collectFlags(results, threshold);
  return { flags, lines: formatReport(flags, { sentences, paragraphs, threshold }), usage, requests: batches.length };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const options = parseArgs(process.argv.slice(2));
  const key = readKey();
  if (!key) { console.error('text judge: no key. Set TYPESAFE_API_KEY or write ~/.config/typesafe/api_key'); process.exit(1); }
  judge(options, { key }).then(({ lines, usage, requests }) => {
    for (const line of lines) console.log(line);
    console.log(`text judge: ${requests} request${requests === 1 ? '' : 's'}, ${usage.input_tokens} input tokens`);
  }).catch((error) => { console.error(`text judge: ${error.message}`); process.exit(1); });
}
