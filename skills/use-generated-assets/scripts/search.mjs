// Keep common spelling and action aliases consistent across CLI, gallery and MCP.
const aliases = {
  traveler: 'traveller',
  travelers: 'traveller',
  travellers: 'traveller',
  characters: 'character',
  animations: 'animation',
  animated: 'animation',
  rigs: 'rig',
  textures: 'texture',
  sounds: 'sound',
  trees: 'tree',
};
export function normalizeSearch(value) {
  return value.toLowerCase().replace(/\b[a-z]+\b/g, (word) => aliases[word] ?? word);
}
export function matchesAsset(asset, query) {
  const terms = normalizeSearch(query).trim().split(/\s+/).filter(Boolean);
  const text = normalizeSearch(
    `${asset.name} ${asset.id} ${asset.description} ${asset.tags.join(' ')} ${asset.category ?? ''} ${asset.kind ?? ''}`,
  );
  return terms.every((term) => text.includes(term));
}
