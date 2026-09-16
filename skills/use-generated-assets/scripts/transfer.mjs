// Shared by the browser, CLI and MCP. No filesystem access or dependencies.
export const SITE = 'https://jonathanwmaddison.github.io/generated-assets/';
export const MAX_FILES = 40;
export const MAX_PACK_BYTES = 64 * 1024 * 1024;
const idPattern = /^[a-z0-9-]+\/(models|rigs|animations|tex|ui|sfx)\/[a-z0-9_-]+$/;
export function sourceBase(revision) {
  if (revision === null || revision === undefined) return SITE;
  if (!/^[a-f0-9]{40}$/.test(revision)) throw Error('Revision must be a full Git commit SHA.');
  return `https://raw.githubusercontent.com/jonathanwmaddison/generated-assets/${revision}/`;
}
export function validateEntry(a) {
  if (
    !idPattern.test(a.id) ||
    !new RegExp(`^assets/${a.id}\\.(glb|webp|png|jpg|wav|mp3|ogg)$`).test(a.file) ||
    !/^[a-f0-9]{64}$/.test(a.sha256) ||
    !Number.isInteger(a.bytes) ||
    a.bytes < 1 ||
    a.bytes > 25 * 1024 * 1024
  )
    throw Error('Invalid asset metadata');
  if (
    !['CC0-1.0', 'CC-BY-4.0'].includes(a.license) ||
    typeof a.attribution !== 'string' ||
    !a.attribution.trim()
  )
    throw Error('Missing license or attribution');
  return a;
}
export function createLock(assets, revision = null) {
  const base = sourceBase(revision);
  if (
    !assets.length ||
    assets.length > MAX_FILES ||
    new Set(assets.map((a) => a.id)).size !== assets.length
  )
    throw Error(`Choose 1–${MAX_FILES} unique assets.`);
  if (assets.reduce((n, a) => n + a.bytes, 0) > MAX_PACK_BYTES)
    throw Error('A pack is limited to 64 MiB. Split this selection.');
  return {
    schemaVersion: 1,
    library: 'generated-assets',
    revision,
    assets: assets.map((a) => {
      validateEntry(a);
      return {
        id: a.id,
        file: a.file,
        bytes: a.bytes,
        sha256: a.sha256,
        license: a.license,
        attribution: a.attribution,
        licenseUrl:
          a.license === 'CC0-1.0'
            ? 'https://creativecommons.org/publicdomain/zero/1.0/'
            : 'https://creativecommons.org/licenses/by/4.0/',
        downloadUrl: base + a.file,
      };
    }),
  };
}
export function validateLock(lock) {
  if (
    lock.schemaVersion !== 1 ||
    lock.library !== 'generated-assets' ||
    !Array.isArray(lock.assets)
  )
    throw Error('Unsupported lockfile');
  const normalized = createLock(lock.assets, lock.revision);
  for (let i = 0; i < lock.assets.length; i++)
    if (lock.assets[i].downloadUrl !== normalized.assets[i].downloadUrl)
      throw Error('Lockfile download URL is not from the declared library revision');
  return normalized;
}
export async function fetchVerified(a, url = SITE + a.file, fetcher = fetch, signal) {
  validateEntry(a);
  const timeout = AbortSignal.timeout(30000);
  const response = await fetcher(url, {
    signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
  });
  if (!response.ok) throw Error(`Download failed (${response.status}): ${a.id}`);
  if (!response.body) throw Error('Download has no body');
  const reader = response.body.getReader(),
    chunks = [];
  let length = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > a.bytes) {
      await reader.cancel();
      throw Error(`Download exceeds declared size: ${a.id}`);
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))]
    .map((n) => n.toString(16).padStart(2, '0'))
    .join('');
  if (length !== a.bytes || digest !== a.sha256) throw Error(`Download checksum mismatch: ${a.id}`);
  return bytes;
}
export function creditsFor(assets) {
  return (
    'Generated Assets — asset credits\nhttps://github.com/jonathanwmaddison/generated-assets\n\n' +
    assets
      .map(
        (a) =>
          `${a.id}\n${a.attribution}\n${a.licenseUrl}\nModifications: none (update this line if you modify this asset).`,
      )
      .join('\n\n') +
    '\n'
  );
}
