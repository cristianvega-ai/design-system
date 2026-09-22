import { test } from 'node:test';
import assert from 'node:assert/strict';
import { textReport, markdownRuns } from './text-report.mjs';

// The report reads a Markdown file when the file name ends in .md. Front matter is not text.
// A backticked name is the word "code". A table cell is its own sentence.
test('textReport reads a Markdown file and skips its front matter', () => {
  const markdown = [
    '---',
    'title: A record',
    'owner: ABC',
    '---',
    '',
    '# A record',
    '',
    'This sentence holds `AGENTS.md` and stays short.',
    '',
    '| Number | Title |',
    '|---|---|',
    '| 1 | One two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty twenty-one. |',
  ].join('\n');
  const report = textReport(markdown, 'a.md');
  assert.deepEqual(report.acronyms, []);
  assert.deepEqual(report.longSentences.map((sentence) => [sentence.line, sentence.words]), [[12, 21]]);
});

test('textReport keeps the web page walk when the file is not Markdown', () => {
  const html = '<html><body><p>Short sentence.</p></body></html>';
  assert.equal(textReport(html).sentences.length, 1);
  assert.equal(textReport(html, 'page.html').sentences.length, 1);
});

// A fence closes only on a fence of the same character and at least the same length, so a
// four-backtick block can hold a three-backtick block.
test('markdownRuns keeps a nested fence inside a longer fence', () => {
  const markdown = [
    'Before.',
    '````markdown',
    'Inside the outer fence.',
    '```',
    'tree line one',
    '```',
    'Still inside.',
    '````',
    'After.',
  ].join('\n');
  assert.deepEqual(markdownRuns(markdown).map((run) => run.text), ['Before.', 'After.']);
});
