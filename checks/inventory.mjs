import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

// Scope: rules after the "3. Components" comment. A finding is a pixel value in a spacing property
// or a color literal in any property. Element geometry (width, height, min/max sizes) is not spacing
// and is not checked. A 1px line, a 50% circle, and a 0 are never findings.
const SPACING = /^(padding|margin|gap|row-gap|column-gap|top|left|right|bottom|inset|outline-offset|scroll-margin|scroll-padding)/;
const NAMED = /\b(red|blue|green|black|white)\b/; // transparent, currentColor, and inherit are not colors

function rules(css) {
  const marker = css.indexOf('3. Components');
  // The marker sits mid-comment ("/* ... 3. Components ... */"), so slicing from the marker itself
  // would drag the rest of that comment's text into the first selector once comments are stripped
  // (there is no earlier "}" in the slice to reset the accumulator). Start after the comment's own
  // closing "*/" instead, so the first component rule's selector is clean like every other rule's.
  const commentEnd = marker < 0 ? -1 : css.indexOf('*/', marker);
  const start = marker < 0 ? -1 : commentEnd < 0 ? marker : commentEnd + 2;
  const body = start < 0 ? css : css.slice(start);
  const out = [];
  let depth = 0, sel = '', decl = '', inRule = false;
  for (const ch of body.replace(/\/\*[\s\S]*?\*\//g, '')) {
    if (ch === '{') { depth++; if (depth === 1) { inRule = true; } else if (depth === 2) { sel = decl.trim(); decl = ''; inRule = true; } continue; }
    if (ch === '}') { if (inRule && decl.trim()) out.push({ sel: (sel || decl).trim(), decl }); depth--; sel = ''; decl = ''; inRule = false; continue; }
    if (depth === 0) sel += ch; else decl += ch;
  }
  return out;
}

function matches(exc, sel, prop, value) {
  const s = exc.selector.endsWith('*') ? sel.startsWith(exc.selector.slice(0, -1)) : sel === exc.selector;
  return s && (exc.property === '*' || exc.property === prop) && (exc.value === '*' || exc.value === value);
}

export function checkInventory(css, exceptions) {
  const problems = [];
  for (const { sel, decl } of rules(css)) {
    for (const d of decl.split(';')) {
      const i = d.indexOf(':'); if (i < 0) continue;
      const prop = d.slice(0, i).trim(), value = d.slice(i + 1).trim();
      if (prop.startsWith('--')) continue;
      const stripped = value.replace(/var\([^)]*\)/g, '').replace(/\b1px\b/g, '').replace(/\b50%/g, '');
      const findings = [];
      if (SPACING.test(prop) && /\d\.?\d*px/.test(stripped)) findings.push('raw pixel');
      if (/#[0-9a-fA-F]{3,8}\b|rgba?\(/.test(stripped) || NAMED.test(stripped)) findings.push('raw color');
      for (const kind of findings) {
        if (exceptions.allow.some((e) => matches(e, sel, prop, value))) continue;
        problems.push(`${sel} { ${prop}: ${value} } ${kind}`);
      }
    }
  }
  return problems;
}

// Each entry names a file and the css text to scan from it. The sheet scans its whole first
// <style> block; rules() finds its own start at the "3. Components" comment. The document has no
// such comment past the build regions, so rules() scans the slice whole: everything the document's
// own rules hold, from the first <style> tag after the doc-chrome marker (the marker sits right
// before that block's own "</style><style>" boilerplate, which is not a rule and would otherwise
// ride along on the first selector) to EOF.
function sources() {
  const sheet = readFileSync('cristian-vega-design-system.html', 'utf8');
  const sheetCss = sheet.slice(sheet.indexOf('<style>') + 7, sheet.indexOf('</style>'));
  const products = readFileSync('cristian-vega-products.html', 'utf8');
  const marker = '/* /build:doc-chrome */';
  const at = products.indexOf(marker);
  if (at < 0) throw new Error('marker build:doc-chrome: missing');
  const styleAt = products.indexOf('<style>', at);
  if (styleAt < 0) throw new Error('marker build:doc-chrome: no <style> tag follows it');
  const productsCss = products.slice(styleAt + '<style>'.length);
  return [
    ['cristian-vega-design-system.html', sheetCss],
    ['cristian-vega-products.html', productsCss],
  ];
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const exceptions = JSON.parse(readFileSync(new URL('./exceptions.json', import.meta.url), 'utf8'));
  let total = 0;
  for (const [file, css] of sources()) {
    const problems = checkInventory(css, exceptions);
    for (const p of problems) console.error(`inventory: ${file}: ${p}`);
    total += problems.length;
  }
  console.log(total ? `inventory: ${total} finding(s)` : 'inventory: ok');
  process.exit(total ? 1 : 0);
}
