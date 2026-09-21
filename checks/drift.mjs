import { readFileSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from '../build/config.mjs';
import { readInputs } from '../build/inject.mjs';
import { inject, injectProducts, extractStylesheets, findRegion } from '../build/lib.mjs';

const TYPES = new Set(['color', 'dimension', 'number', 'fontFamily', 'shadow', 'duration', 'cubicBezier', 'border', 'expression']);

export function validateTokens(tokens) {
  const problems = [], seen = new Set();
  const nodes = new Map(), order = [];
  (function walk(node, path) {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$')) continue;
      if (v && typeof v === 'object' && '$value' in v) {
        if (seen.has(k)) problems.push(`duplicate key ${k}`); seen.add(k);
        if (!TYPES.has(v.$type)) problems.push(`${k}: unknown $type ${v.$type}`);
        if (typeof v.$value !== 'string') { problems.push(`${k}: $value must be a string`); continue; }
        const full = [...path, k].join('.');
        nodes.set(full, { key: k, value: v.$value });
        order.push(full);
      } else if (v && typeof v === 'object') walk(v, [...path, k]);
    }
  })(tokens, []);

  const state = new Map();
  function resolve(full) {
    if (state.get(full) === 1) return full;
    if (state.get(full) === 2) return null;
    state.set(full, 1);
    const node = nodes.get(full);
    for (const m of node.value.matchAll(/\{([^}]+)\}/g)) {
      if (!nodes.has(m[1])) continue;
      const cycle = resolve(m[1]);
      if (cycle) { state.set(full, 2); return cycle; }
    }
    state.set(full, 2);
    return null;
  }
  for (const full of order) {
    if (state.has(full)) continue;
    const cycle = resolve(full);
    if (cycle) problems.push(`reference cycle at ${nodes.get(cycle).key}`);
  }

  return problems;
}

const REGIONS = [['tokens', 'css'], ['token-block', 'html'], ['ground-contract', 'html'], ['icons', 'html']];
const PRODUCT_REGIONS = [['system', 'css'], ['doc-chrome', 'css'], ['icons', 'html']];

export async function checkDrift(root = '.') {
  const problems = validateTokens(JSON.parse(readFileSync(join(root, 'tokens.json'), 'utf8')));
  if (problems.length) return problems;
  const tmp = mkdtempSync(join(tmpdir(), 'ds-fresh-'));
  const cwd = process.cwd();
  try {
    process.chdir(root);
    await build(tmp + '/');
    const fresh = readFileSync(join(tmp, 'tokens.css'), 'utf8');
    const committed = readFileSync(join(root, 'dist/tokens.css'), 'utf8');
    if (fresh !== committed) problems.push('dist/tokens.css differs from a fresh build');
    const inputs = readInputs(root);
    const expected = inject({ ...inputs, tokensCss: fresh });
    for (const [name, kind] of REGIONS) {
      const a = findRegion(inputs.sheet, name, kind), b = findRegion(expected, name, kind);
      if (inputs.sheet.slice(a.start, a.end) !== expected.slice(b.start, b.end)) problems.push(`sheet region ${name} differs from a fresh build`);
    }
    const stamp = /v\d+(?:\.\d+)* · \d{4}-\d{2}-\d{2}/g;
    if ((inputs.sheet.match(stamp) ?? []).join() !== (expected.match(stamp) ?? []).join()) problems.push('version or date differs from tokens.json');

    // The products document reads the built system off the same fresh sheet.
    const { version, date } = inputs.tokens.$extensions['cristian-vega'];
    const { systemCss, chromeCss } = extractStylesheets(expected, fresh, version, date);

    // The two built stylesheets themselves, so a hand edit to either one is drift.
    for (const [name, content] of [['dist/cristian-vega.css', systemCss], ['dist/cristian-vega-doc.css', chromeCss]]) {
      if (readFileSync(join(root, name), 'utf8') !== content) problems.push(`${name} differs from a fresh build`);
    }
    const expectedProducts = injectProducts({ products: inputs.products, systemCss, chromeCss, icons: inputs.icons, version, date });
    for (const [name, kind] of PRODUCT_REGIONS) {
      const a = findRegion(inputs.products, name, kind), b = findRegion(expectedProducts, name, kind);
      if (inputs.products.slice(a.start, a.end) !== expectedProducts.slice(b.start, b.end)) problems.push(`document region ${name} differs from a fresh build`);
    }
    if ((inputs.products.match(stamp) ?? []).join() !== (expectedProducts.match(stamp) ?? []).join()) problems.push('document version or date differs from tokens.json');
  } finally {
    process.chdir(cwd);
    rmSync(tmp, { recursive: true, force: true });
  }
  return problems;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const problems = await checkDrift(process.cwd());
  for (const p of problems) console.error('drift:', p);
  console.log(problems.length ? `drift: ${problems.length} problem(s)` : 'drift: ok');
  process.exit(problems.length ? 1 : 0);
}
