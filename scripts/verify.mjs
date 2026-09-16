import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import {makeCatalog,root} from './catalog.mjs';
const actual=await makeCatalog();assert.deepEqual(JSON.parse(fs.readFileSync(path.join(root,'catalog.json'))),actual,'Catalog is stale: npm run catalog');console.log(`Verified metadata, files, previews, checksums and technical details for ${actual.length} assets.`);
