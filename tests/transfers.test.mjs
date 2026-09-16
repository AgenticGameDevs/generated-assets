import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  createLock,
  validateLock,
  fetchVerified,
  sourceBase,
} from '../skills/use-generated-assets/scripts/transfer.mjs';
import { restoreLock } from '../skills/use-generated-assets/scripts/assets.mjs';
import { collectPack } from '../lib/download-pack.mjs';
import { resolvePack } from '../lib/packs.mjs';
const catalog = JSON.parse(await fs.readFile(new URL('../catalog.json', import.meta.url)));
const sample = catalog.find((a) => a.id === 'skybound/sfx/thud'),
  bytes = await fs.readFile(new URL('../' + sample.file, import.meta.url));
const fetcher = async () => new Response(bytes);
test('locks pin library URLs and reject hostile paths, URLs, duplicate IDs and size budgets', () => {
  const lock = createLock([sample], 'a'.repeat(40));
  assert(lock.assets[0].downloadUrl.startsWith(sourceBase('a'.repeat(40))));
  assert.deepEqual(validateLock(lock), lock);
  for (const mutate of [
    (l) => (l.assets[0].downloadUrl = 'https://example.com/a'),
    (l) => (l.assets[0].file = '../../private'),
    (l) => l.assets.push(l.assets[0]),
    (l) => (l.revision = 'main'),
  ]) {
    const copy = structuredClone(lock);
    mutate(copy);
    assert.throws(() => validateLock(copy));
  }
  assert.throws(
    () =>
      createLock(
        Array.from({ length: 3 }, (_, i) => ({
          ...sample,
          id: `test/sfx/item${i}`,
          file: `assets/test/sfx/item${i}.wav`,
          bytes: 25 * 1024 * 1024,
        })),
      ),
    /64 MiB/,
  );
});
test('restore migrates former owner URLs without changing pinned revisions, paths or checksums', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'ga-migration-'));
  try {
    for (const revision of [null, 'c'.repeat(40)]) {
      const current = createLock([sample], revision);
      const legacy = structuredClone(current);
      const oldBase =
        revision === null
          ? 'https://jonathanwmaddison.github.io/generated-assets/'
          : `https://raw.githubusercontent.com/jonathanwmaddison/generated-assets/${revision}/`;
      legacy.assets[0].downloadUrl = oldBase + sample.file;
      assert.deepEqual(validateLock(legacy), current);
      const destination = path.join(root, revision ?? 'unversioned');
      await restoreLock(legacy, destination, async (url) => {
        assert.equal(url, current.assets[0].downloadUrl);
        return new Response(bytes);
      });
      assert.deepEqual(await fs.readFile(path.join(destination, sample.file)), bytes);
      assert.deepEqual(
        JSON.parse(await fs.readFile(path.join(destination, 'assets.lock.json'))),
        current,
      );
      for (const url of [
        oldBase + 'assets/skybound/sfx/other.wav',
        oldBase + sample.file + '?redirect=elsewhere',
        legacy.assets[0].downloadUrl.replace('jonathanwmaddison', 'another-owner'),
        `https://raw.githubusercontent.com/jonathanwmaddison/generated-assets/${'d'.repeat(40)}/${sample.file}`,
      ]) {
        const invalid = structuredClone(legacy);
        invalid.assets[0].downloadUrl = url;
        assert.throws(() => validateLock(invalid), /declared library revision/);
      }
    }
  } finally {
    await fs.rm(root, { recursive: true });
  }
});
test('pack collection verifies bytes and includes metadata, usable credits and a pinned lock', async () => {
  const entries = await collectPack([sample], { revision: 'b'.repeat(40), fetcher });
  assert.deepEqual(Buffer.from(entries[sample.file]), bytes);
  const decode = (b) => new TextDecoder().decode(b);
  assert(decode(entries['CREDITS.txt']).includes(sample.attribution));
  assert(decode(entries[`metadata/${sample.id}.json`]).includes(sample.sha256));
  assert.equal(JSON.parse(decode(entries['assets.lock.json'])).revision, 'b'.repeat(40));
  await assert.rejects(
    collectPack([sample], { fetcher: async () => new Response('corrupt') }),
    /checksum/,
  );
});
test('restore preserves existing folders and rolls back only a failed new import', async () => {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), 'ga-restore-'));
  try {
    const lock = createLock([sample]);
    await assert.rejects(restoreLock(lock, root, fetcher), /EEXIST/);
    const dest = path.join(root, 'new');
    await assert.rejects(
      restoreLock(lock, dest, async () => new Response('bad')),
      /checksum/,
    );
    await assert.rejects(fs.stat(dest), /ENOENT/);
    await restoreLock(lock, dest, fetcher);
    assert.deepEqual(await fs.readFile(path.join(dest, sample.file)), bytes);
    assert(
      (await fs.readFile(path.join(dest, 'CREDITS.txt'), 'utf8')).includes(sample.attribution),
    );
  } finally {
    await fs.rm(root, { recursive: true });
  }
});
test('downloads enforce declared length and pack references must resolve', async () => {
  await assert.rejects(fetchVerified({ ...sample, bytes: 1 }, undefined, fetcher), /exceeds/);
  assert.throws(
    () =>
      resolvePack(
        { id: 'bad', name: 'Bad', description: 'Missing', assetIds: ['missing'] },
        catalog,
      ),
    /unknown asset/,
  );
});
