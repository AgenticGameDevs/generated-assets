import { matchesAsset } from '../skills/use-generated-assets/scripts/search.mjs';
export function searchAssets(
  assets,
  {
    query = '',
    kind = '',
    collection = '',
    category = '',
    license = '',
    animated,
    rigged,
    rigTarget,
    maxBytes,
    sort = 'name',
    limit = 24,
    offset = 0,
  } = {},
) {
  const rows = assets.filter((a) => {
    return (
      matchesAsset(a, query) &&
      (!kind || a.kind === kind) &&
      (!collection || a.collection === collection) &&
      (!category || a.category === category) &&
      (!license || a.license === license) &&
      (animated === undefined || Boolean(a.technical?.animations?.length) === animated) &&
      (rigged === undefined || Boolean(a.technical?.rigged) === rigged) &&
      (!rigTarget || a.usage.rigTarget === rigTarget) &&
      (maxBytes === undefined || a.bytes <= maxBytes)
    );
  });
  rows.sort(
    sort === 'size'
      ? (a, b) => a.bytes - b.bytes
      : sort === 'triangles'
        ? (a, b) =>
            (a.technical?.triangles ?? Infinity) - (b.technical?.triangles ?? Infinity) ||
            a.name.localeCompare(b.name)
        : (a, b) => a.name.localeCompare(b.name),
  );
  return { total: rows.length, offset, limit, assets: rows.slice(offset, offset + limit) };
}
export function attributionFor(assets) {
  return [...new Set(assets.map((a) => `${a.attribution} ${a.licenseUrl}`))].join('\n');
}
