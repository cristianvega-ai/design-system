import { pathToFileURL } from 'node:url';
import { readFileSync, writeFileSync } from 'node:fs';
import StyleDictionary from 'style-dictionary';

// The custom property is named after the token key, the last segment of the path.
StyleDictionary.registerTransform({
  name: 'name/key',
  type: 'name',
  transform: (token) => token.path.at(-1),
});

export const config = {
  usesDtcg: true,
  source: ['tokens.json'],
  platforms: {
    css: {
      transforms: ['name/key'],
      buildPath: 'dist/',
      files: [{
        destination: 'tokens.css',
        format: 'css/variables',
        options: { outputReferences: true, showFileHeader: false },
      }],
    },
  },
};

export async function build(buildPath = 'dist/') {
  const sd = new StyleDictionary({
    ...config,
    platforms: { css: { ...config.platforms.css, buildPath } },
    log: { verbosity: 'silent' },
  });
  await sd.buildAllPlatforms();

  // Style Dictionary's css/variables format has only two comment styles: 'long'
  // ("/** description */", the default used here) and 'short' ("// description",
  // not a CSS comment at all). Neither matches the single-star "/* description */"
  // this file commits to, so the extra opening star is stripped after the build.
  const outFile = `${buildPath}tokens.css`;
  writeFileSync(outFile, readFileSync(outFile, 'utf8').replaceAll('/**', '/*'));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await build();
  console.log('wrote dist/tokens.css');
}
