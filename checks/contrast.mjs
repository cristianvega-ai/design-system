import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export function parse(c) {
  c = c.trim();
  if (c.startsWith('#')) {
    let h = c.slice(1); if (h.length === 3) h = [...h].map((x) => x + x).join('');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), 1];
  }
  const m = c.match(/rgba?\(([^)]*)\)/);
  if (!m) throw new Error(`not a color: ${c}`);
  const p = m[1].split(',').map((x) => parseFloat(x));
  return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
}
export const over = (fg, bg) => { const [r, g, b, a] = parse(fg); const [R, G, B] = parse(bg); return [r * a + R * (1 - a), g * a + G * (1 - a), b * a + B * (1 - a), 1]; };
const lum = ([r, g, b]) => { const ch = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b); };
export function contrast(fg, bg, ground = bg) {
  const bgc = over(bg, ground); const fgc = over(fg, `rgba(${bgc[0]},${bgc[1]},${bgc[2]},1)`);
  const [l1, l2] = [lum(fgc), lum(bgc)];
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function resolve(tokens) {
  const byPath = new Map(), byKey = new Map();
  (function walk(node, path) {
    for (const [k, v] of Object.entries(node)) {
      if (k.startsWith('$')) continue;
      if (v && typeof v === 'object' && '$value' in v) { byPath.set([...path, k].join('.'), v.$value); byKey.set(k, [...path, k].join('.')); }
      else if (v && typeof v === 'object') walk(v, [...path, k]);
    }
  })(tokens, []);
  const value = (p, depth = 0) => {
    if (depth > 10) throw new Error(`reference loop at ${p}`);
    return byPath.get(p).replace(/\{([^}]+)\}/g, (_, ref) => { if (!byPath.has(ref)) throw new Error(`missing reference {${ref}}`); return value(ref, depth + 1); });
  };
  const out = new Map();
  for (const [k, p] of byKey) out.set(k, value(p));
  return out;
}

// fg, bg, and the optional ground are token keys. A tint (rgba) composites over the ground first.
export const PAIRS = [
  { fg: 'fg', bg: 'surface', purpose: 'body text on surface', limit: 4.5 },
  { fg: 'fg', bg: 'surface-well', purpose: 'body text on the well', limit: 4.5 },
  { fg: 'muted', bg: 'surface-well', purpose: 'muted text on the well', limit: 4.5 },
  // keep: muted on surface, muted on surface-2
  { fg: 'muted', bg: 'surface', purpose: 'muted text on surface', limit: 4.5 },
  { fg: 'muted', bg: 'surface-2', purpose: 'muted text on surface-2', limit: 4.5 },
  { fg: 'meta', bg: 'surface-well', purpose: 'meta text on the well', limit: 4.5 },
  // keep: meta on surface
  { fg: 'meta', bg: 'surface', purpose: 'meta text on surface', limit: 4.5 },
  { fg: 'meta', bg: 'raise', ground: 'surface', purpose: 'meta text on the raised tint', limit: 4.5 },
  { fg: 'meta', bg: 'raise', ground: 'surface-well', purpose: 'meta text on the raised tint on the well', limit: 4.5 },
  { fg: 'azure', bg: 'surface-well', purpose: 'links on the well', limit: 4.5 },
  // keep: links on surface
  { fg: 'azure', bg: 'surface', purpose: 'links on surface', limit: 4.5 },
  { fg: 'azure', bg: 'surface-2', purpose: 'gate evidence links on surface-2', limit: 4.5 },
  { fg: 'azure-dark', bg: 'sky-bg', ground: 'surface', purpose: 'live chip text on surface', limit: 4.5 },
  { fg: 'azure-dark', bg: 'sky-bg', ground: 'surface-well', purpose: 'live chip text on the well', limit: 4.5 },
  { fg: 'signal-fg', bg: 'azure', purpose: 'text on the signal fill', limit: 4.5 },
  { fg: 'signal-fg', bg: 'azure-dark', purpose: 'text on the signal fill, hover', limit: 4.5 },
  { fg: 'teal', bg: 'teal-bg', purpose: 'done chip text', limit: 4.5 },
  { fg: 'teal', bg: 'surface', purpose: 'teal text on surface', limit: 4.5 },
  { fg: 'teal', bg: 'surface-well', purpose: 'teal text on the well', limit: 4.5 },
  { fg: 'teal', bg: 'surface-2', purpose: 'act done state on surface-2', limit: 4.5 },
  { fg: 'amber', bg: 'amber-bg', purpose: 'needs-you chip text', limit: 4.5 },
  { fg: 'amber', bg: 'surface-2', purpose: 'act needs-you state on surface-2', limit: 4.5 },
  { fg: 'red', bg: 'surface', purpose: 'danger button text on surface', limit: 4.5 },
  { fg: 'red', bg: 'surface-well', purpose: 'danger button text on the well', limit: 4.5 },
  { fg: 'red', bg: 'red-bg', ground: 'surface', purpose: 'failed chip text', limit: 4.5 },
  { fg: 'red', bg: 'red-bg', ground: 'surface-well', purpose: 'failed chip text on the well', limit: 4.5 },
  { fg: 'tag-slate', bg: 'tag-slate-bg', purpose: 'slate tag text', limit: 4.5 },
  { fg: 'tag-muted', bg: 'tag-muted-bg', purpose: 'muted tag text', limit: 4.5 },
  { fg: 'mast-text', bg: 'ink', purpose: 'text on ink', limit: 4.5 },
  { fg: 'mast-muted', bg: 'ink', purpose: 'muted text on ink', limit: 4.5 },
  { fg: 'mast-meta', bg: 'ink', purpose: 'meta text on ink', limit: 4.5 },
  { fg: 'mast-meta', bg: 'ink-2', purpose: 'meta text on the raised ink surface', limit: 4.5 },
  { fg: 'mast-meta', bg: 'ink-well', purpose: 'meta text in a well', limit: 4.5 },
  { fg: 'mist-2', bg: 'ink', purpose: 'links on ink', limit: 4.5 },
  { fg: 'mist', bg: 'sky-bg', ground: 'ink', purpose: 'live chip text on ink', limit: 4.5 },
  { fg: 'teal-on-ink', bg: 'teal-bg-on-ink', ground: 'ink', purpose: 'done chip text on ink', limit: 4.5 },
  { fg: 'amber-on-ink', bg: 'amber-bg-on-ink', ground: 'ink', purpose: 'needs-you chip text on ink', limit: 4.5 },
  { fg: 'red-on-ink', bg: 'red-bg-on-ink', ground: 'ink', purpose: 'failed chip text on ink', limit: 4.5 },
  { fg: 'tag-slate-on-ink', bg: 'tag-slate-bg-on-ink', ground: 'ink', purpose: 'slate tag text on ink', limit: 4.5 },
  { fg: 'tag-muted-on-ink', bg: 'tag-muted-bg-on-ink', ground: 'ink', purpose: 'muted tag text on ink', limit: 4.5 },
  { fg: 'code-text', bg: 'code-bg', purpose: 'code text', limit: 4.5 },
  { fg: 'code-accent', bg: 'code-bg', purpose: 'code values', limit: 4.5 },
  { fg: 'sky', bg: 'ink', purpose: 'focus ring on ink', limit: 3 },
  { fg: 'azure', bg: 'surface', purpose: 'focus ring on surface', limit: 3 },
  { fg: 'azure', bg: 'surface-well', purpose: 'focus ring on the well', limit: 3 },
  { fg: 'mast-line-strong', bg: 'ink', purpose: 'strong line on ink as a boundary', limit: 3 },
  { fg: 'line-control', bg: 'surface', purpose: 'control boundary on surface', limit: 3 },
  { fg: 'line-control', bg: 'surface-well', purpose: 'control boundary on the well', limit: 3 },
  { fg: 'line-control', bg: 'surface-2', purpose: 'control boundary on surface-2', limit: 3 },
];

export function checkContrast(tokens, pairs = PAIRS) {
  const v = resolve(tokens);
  const problems = [];
  for (const p of pairs) {
    for (const k of [p.fg, p.bg, p.ground].filter(Boolean)) if (!v.has(k)) throw new Error(`unknown token ${k}`);
    const ratio = contrast(v.get(p.fg), v.get(p.bg), p.ground ? v.get(p.ground) : v.get(p.bg));
    if (ratio < p.limit) problems.push(`${p.fg} on ${p.bg} (${p.purpose}): ${ratio.toFixed(2)} < ${p.limit}`);
  }
  return problems;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const tokens = JSON.parse(readFileSync('tokens.json', 'utf8'));
  const problems = checkContrast(tokens);
  for (const p of problems) console.error('contrast:', p);
  console.log(problems.length ? `contrast: ${problems.length} pair(s) under the limit` : `contrast: ok, ${PAIRS.length} pairs`);
  process.exit(problems.length ? 1 : 0);
}
