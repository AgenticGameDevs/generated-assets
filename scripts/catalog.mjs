import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { assetSchema, licenseURLs } from '../lib/schema.mjs';
import { inspectAsset } from '../lib/inspect.mjs';
export const root = fileURLToPath(new URL('../', import.meta.url));
export function walk(dir) {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}
export async function makeCatalog() {
  const rows = [],
    ids = new Set(),
    files = new Set();
  for (const file of walk(path.join(root, 'metadata'))
    .filter((p) => p.endsWith('.json'))
    .sort()) {
    const a = assetSchema.parse(JSON.parse(fs.readFileSync(file)));
    if (ids.has(a.id) || files.has(a.file)) throw Error(`Duplicate asset ${a.id}`);
    ids.add(a.id);
    files.add(a.file);
    if (
      path.relative(path.join(root, 'metadata'), file).split(path.sep).join('/') !==
      a.id + '.json'
    )
      throw Error(`Metadata filename must match ID: ${a.id}`);
    const info = await inspectAsset(root, a),
      t = info.technical,
      tags = new Set(
        a.tags.filter(
          (tag) => !/^(rigged|animated|transparent|seamless|\d+-joints|\d+-clips)$/.test(tag),
        ),
      );
    if (t.rigged) tags.add('rigged');
    if (t.jointCount) tags.add(`${t.jointCount}-joints`);
    if (t.animations?.length) {
      tags.add('animated');
      tags.add(`${t.animations.length}-clips`);
      for (const [re, tag] of [
        [/walk/i, 'walking'],
        [/jog|run/i, 'running'],
        [/idle/i, 'idle'],
        [/jump/i, 'jumping'],
        [/row/i, 'rowing'],
        [/sail/i, 'sailing'],
        [/skate/i, 'skating'],
      ])
        if (t.animations.some((n) => re.test(n))) tags.add(tag);
    }
    if (t.alpha) tags.add('transparent');
    if (a.usage.seamlessVerified) tags.add('seamless');
    rows.push({
      ...a,
      tags: [...tags],
      path: a.file,
      sourceProject: a.collection,
      provenance: a.source.description,
      ...info,
      licenseUrl: licenseURLs[a.license],
      downloadUrl: `https://agenticgamedevs.github.io/generated-assets/${a.file}`,
      pageUrl: `https://agenticgamedevs.github.io/generated-assets/?asset=${encodeURIComponent(a.id)}`,
    });
  }
  for (const file of walk(path.join(root, 'assets'))) {
    const p = path.relative(root, file).split(path.sep).join('/');
    if (!p.endsWith('.json') && !files.has(p)) throw Error(`Uncatalogued media: ${p}`);
  }
  for (const a of rows) {
    const target = a.usage.rigTarget;
    if (target?.includes('/rigs/') && !rows.some((r) => r.id === target && r.kind === 'rig'))
      throw Error(`${a.id}: missing target rig ${target}`);
  }
  return rows.sort((a, b) => a.id.localeCompare(b.id));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const rows = await makeCatalog();
  fs.writeFileSync(path.join(root, 'catalog.json'), JSON.stringify(rows, null, 2) + '\n');
  fs.mkdirSync(path.join(root, 'schemas'), { recursive: true });
  fs.writeFileSync(
    path.join(root, 'schemas/asset.schema.json'),
    JSON.stringify(z.toJSONSchema(assetSchema), null, 2) + '\n',
  );
  console.log(`Built catalog: ${rows.length} assets`);
}
