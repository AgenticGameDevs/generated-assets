import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import { makeCatalog, root } from './catalog.mjs';
import { resolvePack } from '../lib/packs.mjs';
const actual = await makeCatalog();
assert.deepEqual(
  JSON.parse(fs.readFileSync(path.join(root, 'catalog.json'))),
  actual,
  'Catalog is stale: npm run catalog',
);
console.log(
  `Verified metadata, files, previews, checksums and technical details for ${actual.length} assets.`,
);
const packs = JSON.parse(fs.readFileSync(path.join(root, 'packs.json')));
assert.equal(new Set(packs.map((p) => p.id)).size, packs.length, 'Pack IDs must be unique');
for (const pack of packs) resolvePack(pack, actual);
console.log(`Verified ${packs.length} curated packs.`);
