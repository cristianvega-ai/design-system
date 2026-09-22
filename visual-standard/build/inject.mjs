import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { inject, injectProducts, extractStylesheets } from './lib.mjs';

export function readInputs(root = '.') {
  const sheet = readFileSync(`${root}/cristian-vega-design-system.html`, 'utf8');
  const products = readFileSync(`${root}/cristian-vega-products.html`, 'utf8');
  const tokensCss = readFileSync(`${root}/dist/tokens.css`, 'utf8');
  const tokens = JSON.parse(readFileSync(`${root}/tokens.json`, 'utf8'));
  const dir = `${root}/icons`;
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => f.endsWith('.svg')).sort() : [];
  if (!files.length) throw new Error('icons/ is missing or empty; the sprite would have no symbols');
  const inner = (svg) => svg.replace(/^[\s\S]*?<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '').trim();
  const icons = files.map((f) => ({ name: f.slice(0, -4), body: inner(readFileSync(`${dir}/${f}`, 'utf8')) }));
  return { sheet, products, tokensCss, tokens, icons };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const inputs = readInputs();
  const next = inject(inputs);
  if (next !== inputs.sheet) writeFileSync('cristian-vega-design-system.html', next);
  console.log(next === inputs.sheet ? 'sheet unchanged' : 'wrote cristian-vega-design-system.html');

  // Extract the two product-facing stylesheets from the just-built sheet (`next`,
  // not `inputs.sheet`) so a version bump in the same build is reflected here too.
  const { version, date } = inputs.tokens.$extensions['cristian-vega'];
  const { systemCss, chromeCss } = extractStylesheets(next, inputs.tokensCss, version, date);
  writeFileSync('dist/cristian-vega.css', systemCss);
  writeFileSync('dist/cristian-vega-doc.css', chromeCss);
  console.log('wrote dist/cristian-vega.css and dist/cristian-vega-doc.css');

  const nextProducts = injectProducts({ products: inputs.products, systemCss, chromeCss, icons: inputs.icons, version, date });
  if (nextProducts !== inputs.products) writeFileSync('cristian-vega-products.html', nextProducts);
  console.log(nextProducts === inputs.products ? 'products unchanged' : 'wrote cristian-vega-products.html');
}
