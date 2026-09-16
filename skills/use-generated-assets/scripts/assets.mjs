#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { matchesAsset } from './search.mjs';
import {
  SITE,
  sourceBase,
  createLock,
  validateLock,
  fetchVerified,
  creditsFor,
} from './transfer.mjs';

export async function verifiedDownload(a, directory, fetcher = fetch, base = SITE) {
  const bytes = await fetchVerified(a, base + a.file, fetcher);
  await fs.mkdir(directory, { recursive: true });
  const target = path.join(directory, a.id.replaceAll('/', '--') + path.extname(a.file));
  const created = [];
  try {
    // Exclusive open protects existing files, including symlinks; retain handles while writing.
    for (const [file, data] of [
      [target, bytes],
      [target + '.asset.json', JSON.stringify(a, null, 2) + '\n'],
    ]) {
      const handle = await fs.open(file, 'wx');
      created.push(file);
      try {
        await handle.writeFile(data);
      } finally {
        await handle.close();
      }
    }
  } catch (e) {
    await Promise.all(created.map((file) => fs.unlink(file)));
    throw e;
  }
  return target;
}

export async function restoreLock(input, directory, fetcher = fetch) {
  const lock = validateLock(input);
  // A dedicated, new folder makes the import reversible without touching user files.
  await fs.mkdir(directory);
  try {
    for (const a of lock.assets) {
      const target = path.join(directory, a.file);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, await fetchVerified(a, a.downloadUrl, fetcher), { flag: 'wx' });
    }
    await fs.writeFile(path.join(directory, 'CREDITS.txt'), creditsFor(lock.assets), {
      flag: 'wx',
    });
    await fs.writeFile(
      path.join(directory, 'assets.lock.json'),
      JSON.stringify(lock, null, 2) + '\n',
      { flag: 'wx' },
    );
  } catch (e) {
    await fs.rm(directory, { recursive: true, force: true });
    throw e;
  }
  return directory;
}

async function main() {
  const [command, value, ...args] = process.argv.slice(2),
    options = {};
  for (let i = 0; i < args.length; i += 2) {
    if (!['--out', '--ref'].includes(args[i]) || !args[i + 1] || options[args[i]])
      throw Error('Options: --out <path>, --ref <40-character commit SHA>');
    options[args[i]] = args[i + 1];
  }
  if (command === 'restore') {
    if (!value || !options['--out'] || options['--ref'])
      throw Error('restore <assets.lock.json> --out <new directory>');
    const file = await fs.readFile(value);
    if (file.length > 2 * 1024 * 1024) throw Error('Lockfile too large');
    console.log(await restoreLock(JSON.parse(file), options['--out']));
    return;
  }
  if (!['search', 'info', 'download', 'lock'].includes(command))
    throw Error(
      'Use search <keywords>, info <id>, download <id> --out <directory>, lock <comma-separated IDs> --out <file>, or restore <lockfile> --out <new directory>. Optional --ref pins a full commit SHA.',
    );
  const base = sourceBase(options['--ref']),
    response = await fetch(base + 'catalog.json', { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw Error(`Catalog unavailable (${response.status})`);
  const catalog = await response.json();
  const get = (id) => {
    const a = catalog.find((a) => a.id === id);
    if (!a) throw Error(`Unknown asset ID: ${id}`);
    return a;
  };
  if (command === 'search') {
    console.log(
      JSON.stringify(catalog.filter((a) => matchesAsset(a, value ?? '')).slice(0, 20), null, 2),
    );
    return;
  }
  if (command === 'info') {
    console.log(JSON.stringify(get(value), null, 2));
    return;
  }
  if (!options['--out']) throw Error('--out is required');
  if (command === 'lock') {
    const lock = createLock((value ?? '').split(',').map(get), options['--ref'] ?? null);
    await fs.writeFile(options['--out'], JSON.stringify(lock, null, 2) + '\n', { flag: 'wx' });
    console.log(options['--out']);
  } else console.log(await verifiedDownload(get(value), options['--out'], fetch, base));
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href)
  main().catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  });
