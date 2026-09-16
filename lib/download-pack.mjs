import {
  createLock,
  fetchVerified,
  creditsFor,
} from '../skills/use-generated-assets/scripts/transfer.mjs';
export async function collectPack(
  assets,
  { revision = null, fetcher = fetch, onProgress = () => {}, signal } = {},
) {
  const lock = createLock(assets, revision),
    entries = {};
  const encode = (s) => new TextEncoder().encode(s);
  for (const [i, a] of lock.assets.entries()) {
    onProgress(i, assets.length, a.id);
    entries[a.file] = await fetchVerified(a, a.downloadUrl, fetcher, signal);
    entries[`metadata/${a.id}.json`] = encode(JSON.stringify(assets[i], null, 2) + '\n');
  }
  entries['assets.lock.json'] = encode(JSON.stringify(lock, null, 2) + '\n');
  entries['CREDITS.txt'] = encode(creditsFor(lock.assets));
  entries['README.md'] = encode(
    '# Your Generated Assets pack\n\nKeep CREDITS.txt with your project and publish its credits with your game. Update modification notes when you edit an asset. Individual licenses are recorded in the lockfile and metadata.\n\nImport guide: https://jonathanwmaddison.github.io/generated-assets/guide.html\n\nassets.lock.json records exact byte counts and SHA-256 hashes. Restore it with the portable CLI; published packs pin a Git commit. These files do not include gameplay code, collision or IK.\n',
  );
  onProgress(assets.length, assets.length, 'Complete');
  return entries;
}
export async function downloadPack(assets, options = {}) {
  const entries = await collectPack(assets, options);
  const { zip } = await import('../vendor/fflate/browser.js');
  const bytes = await new Promise((resolve, reject) =>
    zip(entries, { level: 0 }, (error, result) => (error ? reject(error) : resolve(result))),
  );
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/zip' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = 'generated-assets-pack.zip';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}
