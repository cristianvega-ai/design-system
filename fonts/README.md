# Fonts

This folder holds the eight Latin woff2 files the sheet loads through `@font-face` rules.
It also holds the two license texts, one per type family. Each license is the SIL Open Font License, written out in `OFL-geist.txt` and `OFL-ibm-plex.txt`. `fonts/` must hold eight woff2 files and two license files.

## The eight files

| File | Source |
| --- | --- |
| `geist-latin-600.woff2` | Google Fonts endpoint |
| `ibm-plex-sans-latin-400.woff2` | cristianvega.ai |
| `ibm-plex-sans-latin-400-italic.woff2` | cristianvega.ai |
| `ibm-plex-sans-latin-500.woff2` | Google Fonts endpoint |
| `ibm-plex-sans-latin-600.woff2` | Google Fonts endpoint |
| `ibm-plex-mono-latin-400.woff2` | cristianvega.ai |
| `ibm-plex-mono-latin-500.woff2` | cristianvega.ai |
| `ibm-plex-mono-latin-600.woff2` | Google Fonts endpoint |

Geist carries titles and buttons at weight 600 only, so the sheet ships one Geist file. Add a weight when a rule reads it.

## cristianvega.ai files

These four files and the IBM Plex license come from `cristianvega.ai/src/assets/fonts/`.

```bash
cp ~/Projects/cristianvega.ai/src/assets/fonts/ibm-plex-sans-latin-400.woff2 fonts/
cp ~/Projects/cristianvega.ai/src/assets/fonts/ibm-plex-sans-latin-400-italic.woff2 fonts/
cp ~/Projects/cristianvega.ai/src/assets/fonts/ibm-plex-mono-latin-400.woff2 fonts/
cp ~/Projects/cristianvega.ai/src/assets/fonts/ibm-plex-mono-latin-500.woff2 fonts/
cp ~/Projects/cristianvega.ai/src/assets/fonts/OFL-ibm-plex.txt fonts/
```

## Google Fonts files

The other four files come from the Google Fonts stylesheet endpoint. The script below fetches each weight with its own request. A single request that names two weights for one family once returned the same source file for both weights. Save the script as `fetch-fonts.mjs` in the repository root. Run `node fetch-fonts.mjs`. It prints each file name and its size, then a total count.

```js
import { writeFileSync } from 'node:fs';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
// One request per weight. A single request naming two weights for the same family
// ("IBM+Plex+Sans:wght@500;600") returned the same source file for both weights at
// every subset, so this fetches each weight on its own to avoid that collision.
const requests = ['Geist:wght@600', 'IBM+Plex+Sans:wght@500', 'IBM+Plex+Sans:wght@600', 'IBM+Plex+Mono:wght@600'];
let n = 0;
for (const q of requests) {
  const url = `https://fonts.googleapis.com/css2?family=${q}&display=swap`;
  const css = await (await fetch(url, { headers: { 'User-Agent': UA } })).text();
  const block = css.split('@font-face').slice(1).find((b) => b.match(/unicode-range: ([^;]+)/)?.[1].startsWith('U+0000-00FF'));
  if (!block) throw new Error(`no latin @font-face block for ${q}`);
  const family = block.match(/font-family: '([^']+)'/)[1].toLowerCase().replace(/ /g, '-');
  const weight = block.match(/font-weight: (\d+)/)[1];
  const src = block.match(/url\((https:[^)]+\.woff2)\)/)[1];
  const buf = Buffer.from(await (await fetch(src)).arrayBuffer());
  const file = `fonts/${family}-latin-${weight}.woff2`;
  writeFileSync(file, buf); console.log(file, buf.length, 'bytes'); n++;
}
console.log(n, 'files');
```

Delete `fetch-fonts.mjs` from the repository root after the run.

The Geist license comes from the Geist repository on GitHub. Save it as `OFL-geist.txt`:

```bash
curl -s -o fonts/OFL-geist.txt https://raw.githubusercontent.com/vercel/geist-font/main/LICENSE.txt
```

## Fallback metrics

A fallback face carries measured metrics so text does not reflow when a file arrives. The metrics come from `fontTools`, comparing the primary face to its matching system fallback. Run the command below from the repository root. It creates a temporary virtual environment, measures the three faces, and removes the environment.

```bash
python3 -m venv fontenv
fontenv/bin/pip -q install fonttools brotli
fontenv/bin/python - <<'PYEOF'
from fontTools.ttLib import TTFont, TTCollection
def m(path, n=0):
    f = TTCollection(path).fonts[n] if path.endswith('.ttc') else TTFont(path)
    upm = f['head'].unitsPerEm; h = f['hhea']; o = f['OS/2']
    return dict(upm=upm, asc=h.ascent, desc=abs(h.descent), gap=h.lineGap, avg=o.xAvgCharWidth)
pairs = [('Geist', 'fonts/geist-latin-600.woff2', '/System/Library/Fonts/HelveticaNeue.ttc'),
         ('IBM Plex Sans', 'fonts/ibm-plex-sans-latin-400.woff2', '/System/Library/Fonts/HelveticaNeue.ttc'),
         ('IBM Plex Mono', 'fonts/ibm-plex-mono-latin-400.woff2', '/System/Library/Fonts/Menlo.ttc')]
for name, primary, fallback in pairs:
    p, s = m(primary), m(fallback)
    size = (p['avg'] / p['upm']) / (s['avg'] / s['upm'])
    print(f"{name}: size-adjust: {size*100:.2f}%; ascent-override: {p['asc']/p['upm']/size*100:.2f}%; descent-override: {p['desc']/p['upm']/size*100:.2f}%; line-gap-override: {p['gap']/p['upm']/size*100:.2f}%;")
PYEOF
rm -rf fontenv
```

These values already sit in the sheet's fallback `@font-face` rules. The mono fallback face names Menlo as `local("Menlo Regular")` and `local("Menlo-Regular")`, its full name and its PostScript name.

```
Geist: size-adjust: 127.74%; ascent-override: 78.68%; descent-override: 23.09%; line-gap-override: 0.00%;
IBM Plex Sans: size-adjust: 119.24%; ascent-override: 85.96%; descent-override: 23.06%; line-gap-override: 0.00%;
IBM Plex Mono: size-adjust: 99.66%; ascent-override: 102.85%; descent-override: 27.59%; line-gap-override: 0.00%;
```
