import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);

export function checkMarkup(html) {
  const problems = [];
  const stack = [];
  const text = html.replace(/<!--[\s\S]*?-->/g, (c) => c.replace(/[^\n]/g, ' '))
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, (c) => c.replace(/[^\n]/g, ' '));
  const line = (i) => text.slice(0, i).split('\n').length;
  for (const m of text.matchAll(/<\/?([a-zA-Z][a-zA-Z0-9-]*)(?:\s[^<>]*?)?\/?>/g)) {
    const tag = m[1].toLowerCase();
    if (m[0].startsWith('</')) {
      const i = stack.lastIndexOf(tag);
      if (i < 0) { problems.push(`stray </${tag}> at line ${line(m.index)}`); continue; }
      while (stack.length > i + 1) problems.push(`unclosed <${stack.pop()}> at line ${line(m.index)}`);
      stack.pop();
    } else if (!VOID.has(tag) && !m[0].endsWith('/>')) {
      stack.push(tag);
    }
  }
  for (const tag of stack) problems.push(`unclosed <${tag}> at end of file`);
  return problems;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const files = ['cristian-vega-design-system.html', 'cristian-vega-products.html'];
  let total = 0;
  for (const file of files) {
    const problems = checkMarkup(readFileSync(file, 'utf8'));
    for (const p of problems) console.error(`markup: ${file}: ${p}`);
    total += problems.length;
  }
  console.log(total ? `markup: ${total} problem(s)` : 'markup: ok');
  process.exit(total ? 1 : 0);
}
