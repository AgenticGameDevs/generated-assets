import fs from 'node:fs';
import path from 'node:path';
const target = 'dist';
// Recreate only this script's known generated site directory; no source files are removed.
if (fs.existsSync(target)) {
  if (!fs.existsSync(path.join(target, '.generated-assets-site')))
    throw Error('Refusing to replace unmarked dist directory');
  fs.rmSync(target, { recursive: true });
}
fs.mkdirSync(target);
fs.writeFileSync(path.join(target, '.generated-assets-site'), 'generated\n');
for (const file of [
  'index.html',
  'gallery.css',
  'library.css',
  'gallery.js',
  'viewer.html',
  'viewer.js',
  'catalog.json',
  'excluded.json',
  'licenses.html',
  'workflows.html',
  'contribute.html',
  'governance.html',
  'agents.html',
  'LICENSE',
  'LICENSE.md',
  'README.md',
  'CONTRIBUTING.md',
  'GOVERNANCE.md',
  'AGENTS.md',
  '.nojekyll',
  'assets',
  'metadata',
  'thumbnails',
  'vendor',
  'schemas',
  'skills',
  'workflows',
  'provenance',
  'examples',
  'generators',
  'packs.json',
  'packs.css',
  'docs.css',
  'guide.html',
  'catalog-api.html',
  'maintaining.html',
  'changelog.html',
  'about.html',
  'docs',
  'CHANGELOG.md',
  'SECURITY.md',
])
  fs.cpSync(file, path.join(target, file), { recursive: true });
fs.mkdirSync(path.join(target, 'lib'));
for (const file of ['catalog.mjs', 'packs.mjs', 'selection-ui.mjs', 'download-pack.mjs'])
  fs.copyFileSync('lib/' + file, path.join(target, 'lib', file));
const revision =
  process.env.GITHUB_EVENT_NAME !== 'pull_request' &&
  /^[a-f0-9]{40}$/.test(process.env.GITHUB_SHA ?? '')
    ? process.env.GITHUB_SHA
    : null;
fs.writeFileSync(
  path.join(target, 'catalog-info.json'),
  JSON.stringify(
    { schemaVersion: 1, version: JSON.parse(fs.readFileSync('package.json')).version, revision },
    null,
    2,
  ) + '\n',
);
console.log('Built static gallery in dist/');
