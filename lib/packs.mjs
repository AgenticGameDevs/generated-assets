import { createLock } from '../skills/use-generated-assets/scripts/transfer.mjs';
export function resolvePack(pack, assets) {
  if (
    !/^[a-z0-9-]+$/.test(pack.id) ||
    !pack.name ||
    !pack.description ||
    !Array.isArray(pack.assetIds)
  )
    throw Error('Invalid pack descriptor');
  const selected = pack.assetIds.map((id) => {
    const asset = assets.find((a) => a.id === id);
    if (!asset) throw Error(`Pack ${pack.id}: unknown asset ${id}`);
    return asset;
  });
  createLock(selected);
  return { ...pack, assets: selected, bytes: selected.reduce((n, a) => n + a.bytes, 0) };
}
