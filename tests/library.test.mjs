import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { assetSchema } from '../lib/schema.mjs';
import { searchAssets } from '../lib/catalog.mjs';
import { addAsset } from '../scripts/add-asset.mjs';
import { verifiedDownload } from '../skills/use-generated-assets/scripts/assets.mjs';
const root = new URL('../', import.meta.url),
  assets = JSON.parse(fs.readFileSync(new URL('catalog.json', root)));
test('descriptors reject traversal, mismatched kinds and missing provenance', () => {
  const a = JSON.parse(fs.readFileSync(new URL('metadata/fjordfall/models/traveller.json', root)));
  assert(assetSchema.safeParse(a).success);
  for (const change of [
    { file: '../secret' },
    { file: 'assets/fjordfall/models/other.glb' },
    { kind: 'sound' },
    { preview: undefined },
    { description: 'x' },
    { source: { method: 'authored' } },
  ])
    assert(!assetSchema.safeParse({ ...a, ...change }).success);
});
test('search discovers both travellers by rig, animation and action tags', () => {
  for (const query of [
    'traveller rigged',
    'traveller animated',
    'traveller walking',
    'traveller rowing',
    'travelers rigged walking',
  ]) {
    const r = searchAssets(assets, { query, limit: 50 });
    assert(
      r.assets.some((a) => a.id === 'fjordfall/models/traveller'),
      query,
    );
    assert(
      r.assets.some((a) => a.id === 'fjordfall/models/female-rider'),
      query,
    );
  }
  const result = searchAssets(assets, { kind: 'sound', license: 'CC0-1.0' });
  assert.deepEqual(
    result.assets.map((a) => a.id),
    ['fjordfall/sfx/flock_bells'],
  );
  const page = searchAssets(assets, { limit: 4, offset: 4 });
  assert.equal(page.assets.length, 4);
  assert.notDeepEqual(page.assets, searchAssets(assets, { limit: 4 }).assets);
});
test('import copies only explicit files and refuses collisions', () => {
  const temp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'asset-import-')));
  try {
    const a = JSON.parse(fs.readFileSync(new URL('metadata/skybound/sfx/thud.json', root)));
    const metadata = path.join(temp, 'submission.json');
    fs.writeFileSync(metadata, JSON.stringify(a));
    const source = new URL(a.file, root);
    const destination = path.join(temp, 'repo');
    fs.mkdirSync(destination);
    addAsset({ metadata, file: source }, destination);
    assert(fs.existsSync(path.join(destination, a.file)));
    assert.throws(() => addAsset({ metadata, file: source }, destination), /overwrite/);
    assert.deepEqual(fs.readFileSync(path.join(destination, a.file)), fs.readFileSync(source));
  } finally {
    fs.rmSync(temp, { recursive: true });
  }
});
test('download verifies bytes and hash, preserves collisions and writes attribution', async () => {
  const temp = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'asset-download-')));
  try {
    const bytes = Buffer.from('sample'),
      a = {
        id: 'test/sfx/sample',
        file: 'assets/test/sfx/sample.wav',
        bytes: bytes.length,
        sha256: crypto.createHash('sha256').update(bytes).digest('hex'),
        attribution: 'Test author, CC0',
        license: 'CC0-1.0',
      };
    await assert.rejects(
      verifiedDownload(a, temp, async () => new Response('broken')),
      /checksum/,
    );
    assert.equal(fs.readdirSync(temp).length, 0);
    const dest = await verifiedDownload(a, temp, async () => new Response(bytes));
    assert.deepEqual(fs.readFileSync(dest), bytes);
    assert.equal(JSON.parse(fs.readFileSync(dest + '.asset.json')).attribution, a.attribution);
    await assert.rejects(
      verifiedDownload(a, temp, async () => new Response(bytes)),
      /EEXIST/,
    );
    assert.deepEqual(fs.readFileSync(dest), bytes);
    await assert.rejects(verifiedDownload({ ...a, file: '../../private' }, temp), /Invalid/);
  } finally {
    fs.rmSync(temp, { recursive: true });
  }
});
