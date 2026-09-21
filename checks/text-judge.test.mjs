import { test } from 'node:test';
import assert from 'node:assert/strict';
import { markdownRuns, splitSentences, glossaryFrom, buildBatches, collectFlags, formatReport, askBatch } from './text-judge.mjs';

test('markdownRuns keeps prose, headings, list items, and table cells; drops code', () => {
  const text = [
    '# Title',
    '',
    'One sentence. Two `code` sentence.',
    '',
    '```js',
    'const x = 1;',
    '```',
    '',
    '- Item one',
    '- Item two',
    '',
    '| Entry | Trigger |',
    '|---|---|',
    '| A drawer | a product needs it |',
  ].join('\n');
  const runs = markdownRuns(text);
  assert.deepEqual(runs.map((run) => [run.line, run.text]), [
    [1, 'Title'],
    [3, 'One sentence. Two code sentence.'],
    [9, 'Item one'],
    [10, 'Item two'],
    [12, 'Entry'], [12, 'Trigger'],
    [14, 'A drawer'], [14, 'a product needs it'],
  ]);
});

test('splitSentences splits at sentence ends and drops empty pieces', () => {
  assert.deepEqual(splitSentences('One here. Two there! Three?  '), ['One here.', 'Two there!', 'Three?']);
  assert.deepEqual(splitSentences('No end'), ['No end']);
});

test('glossaryFrom reads the Terms section of the spec', () => {
  const spec = [
    '## 2. Terms',
    '',
    'Use these words for these things.',
    '',
    '- The sheet: the file `cristian-vega-design-system.html` at the root of the repository.',
    '- A ground: one of the three color contexts on the sheet: paper, surface, and ink.',
    '',
    '## 3. Next',
    '- Not a term: nothing.',
  ].join('\n');
  assert.deepEqual(glossaryFrom(spec), [
    { word: 'The sheet', meaning: 'the file cristian-vega-design-system.html at the root of the repository.' },
    { word: 'A ground', meaning: 'one of the three color contexts on the sheet: paper, surface, and ink.' },
  ]);
});

test('buildBatches asks three questions per sentence and one per paragraph with two or more sentences', () => {
  const units = [
    { file: 'a.md', line: 1, sentences: ['First. ', 'Second.'] },
    { file: 'a.md', line: 5, sentences: ['Alone.'] },
  ];
  const batches = buildBatches(units, [{ word: 'The sheet', meaning: 'the file' }], { sentencesPerBatch: 2 });
  assert.equal(batches.length, 2, 'two sentences per batch: [First, Second] and [Alone]');
  const first = batches[0];
  assert.deepEqual(first.state.glossary, [{ word: 'The sheet', meaning: 'the file' }]);
  const ids = Object.keys(first.questions);
  assert.deepEqual(ids, ['s0_passive', 's0_topics', 's0_term', 's1_passive', 's1_topics', 's1_term', 'p0_order']);
  assert.equal(first.questions.s0_passive.type, 'noul');
  assert.equal(first.state.sentences.s0, 'First.');
  assert.equal(first.questions.s0_passive.instructions.inspect, 'sentences.s0');
  assert.ok(first.questions.s0_passive.criteria.true.length > 10);
  assert.equal(first.state.paragraphs.p0, 'First. Second.');
  assert.equal(first.questions.p0_order.instructions.inspect, 'paragraphs.p0');
  assert.equal(batches[1].questions.p1_order, undefined, 'a one-sentence paragraph gets no order question');
  assert.equal(batches[1].state.sentences.s2, 'Alone.');
  assert.deepEqual(first.map.s0_passive, { file: 'a.md', line: 1, rule: 'passive voice', text: 'First.' });
  assert.deepEqual(first.map.p0_order, { file: 'a.md', line: 1, rule: 'detail before the instruction', text: 'First. Second.' });
});

test('collectFlags keeps answers at or above the threshold, sorted by probability', () => {
  const batch = { map: {
    s0_passive: { file: 'a.md', line: 1, rule: 'passive voice', text: 'First.' },
    s0_topics: { file: 'a.md', line: 1, rule: 'more than one topic', text: 'First.' },
    p0_order: { file: 'a.md', line: 1, rule: 'detail before the instruction', text: 'First. Second.' },
  } };
  const answers = { s0_passive: { type: 'noul', noul: 0.91 }, s0_topics: { type: 'noul', noul: 0.2 }, p0_order: { type: 'noul', noul: 0.5 } };
  const flags = collectFlags([{ batch, answers }], 0.5);
  assert.deepEqual(flags.map((flag) => [flag.rule, flag.probability]), [['passive voice', 0.91], ['detail before the instruction', 0.5]]);
});

test('formatReport prints one line per flag and a summary', () => {
  const lines = formatReport([{ file: 'a.md', line: 3, rule: 'passive voice', probability: 0.91, text: 'The box is drawn by the rule.' }], { sentences: 10, paragraphs: 2, threshold: 0.5 });
  assert.deepEqual(lines, [
    'a.md:3 · passive voice · 0.91 · The box is drawn by the rule.',
    'text judge: 10 sentences, 2 paragraphs, 1 flag at 0.5 or above',
  ]);
});

test('askBatch posts to the System One endpoint with the key and retries once on 429', async () => {
  const calls = [];
  let attempt = 0;
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    attempt += 1;
    if (attempt === 1) return { ok: false, status: 429, text: async () => 'slow down' };
    return { ok: true, status: 200, json: async () => ({ model: 'jev-latest', answers: { s0_passive: { type: 'noul', noul: 0.1 } }, usage: { input_tokens: 5, output_tokens: 1 } }) };
  };
  const batch = { state: { glossary: [] }, questions: { s0_passive: { type: 'noul', instructions: { question: 'q', sentence: 'x' }, criteria: { true: 't', false: 'f' } } }, map: {} };
  const result = await askBatch(batch, { key: 'secret', fetchImpl, model: 'jev-latest', wait: async () => {} });
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, 'https://api.typesafe.ai/v1/systemone');
  assert.equal(calls[0].options.method, 'POST');
  assert.equal(calls[0].options.headers.Authorization, 'Bearer secret');
  const body = JSON.parse(calls[0].options.body);
  assert.equal(body.model, 'jev-latest');
  assert.deepEqual(Object.keys(body.questions), ['s0_passive']);
  assert.deepEqual(body.state, { glossary: [] });
  assert.equal(result.answers.s0_passive.noul, 0.1);
  assert.equal(result.usage.input_tokens, 5);
});
