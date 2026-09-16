import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve('dist');
let checked = 0;
function walk(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}
for (const file of walk(root).filter((p) => p.endsWith('.html'))) {
  const html = fs.readFileSync(file, 'utf8');
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const value = match[1].replaceAll('&amp;', '&');
    if (/^(https?:|mailto:|data:)/.test(value)) continue;
    const url = new URL(value, 'https://local/' + path.relative(root, file)),
      target = path.resolve(root, '.' + decodeURIComponent(url.pathname));
    if (!target.startsWith(root + path.sep) && target !== root)
      throw Error(`Escaping link: ${file}: ${value}`);
    const actual =
      fs.existsSync(target) && fs.statSync(target).isDirectory()
        ? path.join(target, 'index.html')
        : target;
    if (!fs.existsSync(actual)) throw Error(`Broken link: ${path.relative(root, file)} → ${value}`);
    if (
      url.hash &&
      actual.endsWith('.html') &&
      !fs.readFileSync(actual, 'utf8').includes(`id="${decodeURIComponent(url.hash.slice(1))}"`)
    )
      throw Error(`Missing anchor: ${file} → ${value}`);
    checked++;
  }
}
console.log(`Verified ${checked} local links in built HTML.`);
