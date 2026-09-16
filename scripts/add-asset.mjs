import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assetSchema } from '../lib/schema.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
export function addAsset({ metadata, file, preview }, destination = root) {
  const a = assetSchema.parse(JSON.parse(fs.readFileSync(metadata)));
  if (a.preview && !preview) throw Error('Supply --preview for this model.');
  const targets = [
    [file, a.file],
    ...(a.preview ? [[preview, a.preview]] : []),
    [metadata, `metadata/${a.id}.json`],
  ];
  const paths = targets.map(([, p]) => path.resolve(destination, p));
  if (new Set(paths).size !== paths.length) throw Error('Duplicate output paths');
  for (let i = 0; i < targets.length; i++) {
    if (!fs.statSync(targets[i][0]).isFile()) throw Error('Source must be a file');
    if (!paths[i].startsWith(path.resolve(destination) + path.sep))
      throw Error('Path escapes collection');
    if (fs.existsSync(paths[i])) throw Error(`Refusing to overwrite ${targets[i][1]}`);
    let parent = path.dirname(paths[i]);
    while (!fs.existsSync(parent)) parent = path.dirname(parent);
    if (fs.realpathSync(parent) !== parent) throw Error('Destination contains a symlink');
  }
  for (let i = 0; i < targets.length; i++) {
    fs.mkdirSync(path.dirname(paths[i]), { recursive: true });
    fs.copyFileSync(targets[i][0], paths[i], fs.constants.COPYFILE_EXCL);
  }
  return a.id;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const flags = {};
  for (let i = 2; i < process.argv.length; i += 2) {
    const key = process.argv[i]?.replace(/^--/, '');
    if (!['metadata', 'file', 'preview'].includes(key) || !process.argv[i + 1])
      throw Error(
        'Usage: npm run new-asset -- --metadata submission.json --file asset.glb --preview preview.png',
      );
    flags[key] = process.argv[i + 1];
  }
  if (!flags.metadata || !flags.file) throw Error('--metadata and --file are required');
  console.log(
    `Added ${addAsset(flags)}. Run npm run build, npm test and npm run verify; then open a pull request.`,
  );
}
