import { searchAssets, attributionFor } from './lib/catalog.mjs';
import { selectionUI } from './lib/selection-ui.mjs';
const $ = (id) => document.getElementById(id),
  size = (b) =>
    b < 1024
      ? `${b} B`
      : b < 1024 ** 2
        ? `${(b / 1024).toFixed(0)} KB`
        : `${(b / 1024 ** 2).toFixed(1)} MB`;
const node = (tag, text, cls) => {
  const n = document.createElement(tag);
  if (text !== undefined) n.textContent = text;
  if (cls) n.className = cls;
  return n;
};
const assets = await fetch('catalog.json')
  .then((r) => {
    if (!r.ok) throw Error();
    return r.json();
  })
  .catch(() => {
    $('summary').textContent =
      'The catalog could not load. Please reload or run npm start locally.';
    return [];
  });
let kind = '',
  limit = 32,
  current = null;
const selection = selectionUI(assets, {
  onChange: () => {
    render();
    if (current) updateSelectButton();
  },
  onPreview: openAsset,
});
function updateSelectButton() {
  const selected = selection.ids.has(current.id);
  $('select-asset').textContent = selected ? 'Remove from pack' : 'Add to pack';
  $('select-asset').setAttribute('aria-pressed', String(selected));
}
for (const [id, values] of [
  ['world', [...new Set(assets.map((a) => a.collection))]],
  ['category', [...new Set(assets.map((a) => a.category))]],
])
  for (const value of values.sort()) {
    const o = node('option', value === 'skybound' ? 'SKYBOUND' : value);
    o.value = value;
    $(id).append(o);
  }
if (assets.length)
  $('summary').textContent =
    `${assets.length} assets · ${new Set(assets.map((a) => a.collection)).size} collections · CC0 & CC BY · Individual downloads`;
function syncURL() {
  const p = new URLSearchParams();
  for (const [key, value] of Object.entries({
    q: $('search').value,
    type: kind,
    collection: $('world').value,
    category: $('category').value,
    license: $('license').value,
    sort: $('sort').value === 'name' ? '' : $('sort').value,
    animated: $('animated').checked ? '1' : '',
    asset: current?.id ?? '',
    pick: [...selection.ids].join(','),
    selection: $('selected-only').checked ? '1' : '',
    maxBytes: $('max-bytes').value,
  }))
    if (value) p.set(key, value);
  history.replaceState(null, '', location.pathname + (p.size ? '?' + p : '') + location.hash);
}
async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    $('copy-status').textContent = 'Copied.';
  } catch {
    $('copy-status').textContent =
      'Clipboard unavailable. Select the attribution below to copy it.';
  }
}
function openAsset(a) {
  current = a;
  updateSelectButton();
  $('select-asset').onclick = () => selection.toggle(a.id);
  $('preview').replaceChildren();
  $('preview').classList.remove('tiled');
  $('preview').style.backgroundImage = '';
  $('copy-status').textContent = '';
  if (['model', 'rig', 'animation'].includes(a.kind)) {
    const frame = document.createElement('iframe');
    frame.title = `Interactive preview of ${a.name}`;
    frame.src = `viewer.html?asset=${encodeURIComponent(a.file)}`;
    $('preview').append(frame);
  } else if (a.kind === 'sound') {
    const audio = document.createElement('audio');
    audio.controls = true;
    audio.preload = 'metadata';
    audio.src = a.file;
    $('preview').append(audio);
  } else {
    const img = document.createElement('img');
    img.src = a.file;
    img.alt = a.name;
    $('preview').append(img);
    if (a.kind === 'texture') {
      const toggle = node('button', 'Repeat texture');
      toggle.className = 'repeat-toggle';
      toggle.onclick = () => {
        const active = $('preview').classList.toggle('tiled');
        img.hidden = active;
        $('preview').style.backgroundImage = active ? `url("${a.file}")` : '';
        toggle.textContent = active ? 'Single image' : 'Repeat texture';
      };
      $('preview').append(toggle);
    }
  }
  $('detail-kind').textContent = `${a.collection.toUpperCase()} / ${a.category}`;
  $('detail-name').textContent = a.name;
  $('description').textContent = a.description;
  $('tags').replaceChildren(...a.tags.map((t) => node('span', t)));
  const related = a.usage.rigTarget
    ? assets.filter((other) => other.id !== a.id && other.usage.rigTarget === a.usage.rigTarget)
    : [];
  $('related-section').hidden = !related.length;
  $('related').replaceChildren(
    ...related.map((other) => {
      const link = node('a', other.name);
      link.href = other.pageUrl;
      link.onclick = (e) => {
        e.preventDefault();
        openAsset(other);
      };
      return link;
    }),
  );
  const t = a.technical,
    fields = [
      ['Format', t.format.toUpperCase()],
      ['Download', size(a.bytes)],
      ['License', a.license],
    ];
  if (['model', 'rig', 'animation'].includes(a.kind))
    fields.push(
      ['Triangles', t.triangles.toLocaleString()],
      ['Skinned mesh', t.rigged ? 'Yes' : 'No'],
      ['Joints', String(t.jointCount)],
      ['Animations', t.animations.length ? `${t.animations.length} clips` : 'None'],
      ['Units', a.usage.scaleVerified ? a.usage.units : 'Scale not verified'],
    );
  if (t.width)
    fields.push(['Dimensions', `${t.width} × ${t.height}`], ['Alpha', t.alpha ? 'Yes' : 'No']);
  if (t.durationSeconds)
    fields.push(
      ['Duration', `${t.durationSeconds}s`],
      ['Audio', `${t.sampleRate} Hz · ${t.channels === 1 ? 'Mono' : 'Stereo'}`],
    );
  $('technical').replaceChildren(...fields.flatMap(([k, v]) => [node('dt', k), node('dd', v)]));
  $('provenance').textContent = `${a.source.generator} · ${a.source.description}`;
  $('metadata').replaceChildren(node('span', 'By '));
  const creator = node('a', a.creator.name);
  creator.href = a.creator.url;
  creator.rel = 'noopener';
  $('metadata').append(creator);
  const notes = [
    ...a.usage.notes,
    ...(t.extensions?.length ? ['Requires ' + t.extensions.join(', ')] : []),
    ...(t.animations?.length ? ['Clips: ' + t.animations.join(', ')] : []),
  ];
  $('usage').replaceChildren(...notes.map((n) => node('li', n)));
  $('download').href = a.file;
  $('source-record').href = `metadata/${a.id}.json`;
  $('credit').textContent = attributionFor([a]);
  $('checksum').textContent = `SHA-256: ${a.sha256}`;
  $('copy-credit').onclick = () => copy(attributionFor([a]));
  $('copy-link').onclick = () => copy(a.pageUrl);
  $('report').href =
    'https://github.com/jonathanwmaddison/generated-assets/issues/new?template=asset-problem.yml&title=' +
    encodeURIComponent('Asset issue: ' + a.id);
  if (!$('detail').open) $('detail').showModal();
  syncURL();
}
function render() {
  const result = searchAssets(
    $('selected-only').checked ? assets.filter((a) => selection.ids.has(a.id)) : assets,
    {
      query: $('search').value,
      kind,
      collection: $('world').value,
      category: $('category').value,
      license: $('license').value,
      animated: $('animated').checked ? true : undefined,
      sort: $('sort').value,
      limit,
      maxBytes: $('max-bytes').value ? Number($('max-bytes').value) : undefined,
    },
  );
  const fragment = document.createDocumentFragment();
  for (const a of result.assets) {
    const card = node('article', undefined, `card ${a.kind}`),
      button = node('button');
    button.type = 'button';
    button.setAttribute('aria-label', `Preview ${a.name}`);
    button.onclick = () => openAsset(a);
    if (a.kind === 'sound') button.append(node('span', '∿', 'placeholder'));
    else {
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.decoding = 'async';
      img.src = a.preview ?? a.file;
      img.alt = a.name;
      img.onerror = () => {
        img.remove();
        button.append(node('span', 'Preview unavailable', 'preview-error'));
      };
      button.append(img);
    }
    button.append(
      node(
        'span',
        a.kind === 'model' && a.technical.animations?.length
          ? 'ANIMATED MODEL'
          : a.kind.toUpperCase(),
        'type',
      ),
    );
    card.append(button);
    const content = node('div', undefined, 'card-copy');
    content.append(node('h3', a.name));
    const meta = node('div', undefined, 'card-meta');
    meta.append(node('span', a.category), node('span', a.license + ' · ' + size(a.bytes)));
    content.append(meta);
    const badges = node('div', undefined, 'tags');
    const highlights = a.tags.filter((t) => /^(rigged|animated|\d+-joints|\d+-clips)$/.test(t));
    badges.append(
      ...(highlights.length
        ? highlights
        : a.tags.filter((t) => t !== a.kind && t !== a.collection).slice(0, 3)
      ).map((t) => node('span', t)),
    );
    content.append(badges);
    const select = node(
      'button',
      selection.ids.has(a.id) ? '✓ In your pack' : '+ Add to pack',
      'select-asset',
    );
    select.setAttribute(
      'aria-label',
      `${selection.ids.has(a.id) ? 'Remove' : 'Add'} ${a.name} ${selection.ids.has(a.id) ? 'from' : 'to'} pack`,
    );
    select.setAttribute('aria-pressed', String(selection.ids.has(a.id)));
    select.onclick = () => selection.toggle(a.id);
    content.append(select);
    card.append(content);
    fragment.append(card);
  }
  $('grid').replaceChildren(fragment);
  $('count').textContent = `${result.total} assets`;
  $('more').hidden = result.assets.length >= result.total;
  $('more').textContent = `Load more (${result.total - result.assets.length} remaining)`;
  $('empty').hidden = result.total > 0;
  document
    .querySelectorAll('[data-kind]')
    .forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.kind === kind)));
  $('characters').setAttribute('aria-pressed', String($('category').value === 'Characters'));
  syncURL();
}
const change = () => {
  limit = 32;
  render();
};
for (const id of ['world', 'category', 'license', 'sort', 'animated', 'selected-only', 'max-bytes'])
  $(id).onchange = change;
$('search').oninput = change;
document.querySelectorAll('[data-kind]').forEach(
  (b) =>
    (b.onclick = () => {
      kind = b.dataset.kind;
      if (kind && kind !== 'model') $('category').value = '';
      change();
    }),
);
$('characters').onclick = () => {
  kind = 'model';
  $('category').value = 'Characters';
  change();
};
function reset() {
  kind = '';
  for (const id of ['search', 'category', 'world', 'license']) $(id).value = '';
  $('animated').checked = false;
  $('selected-only').checked = false;
  $('max-bytes').value = '';
  $('sort').value = 'name';
  change();
}
$('reset').onclick = reset;
$('empty-reset').onclick = reset;
$('more').onclick = () => {
  limit += 32;
  render();
};
$('close').onclick = () => $('detail').close();
$('detail').addEventListener('close', () => {
  if (!$('detail').open) {
    current = null;
    $('preview').replaceChildren();
    $('preview').classList.remove('tiled');
    $('preview').style.backgroundImage = '';
    syncURL();
  }
});
const p = new URLSearchParams(location.search);
for (const [id, key] of [
  ['search', 'q'],
  ['world', 'collection'],
  ['category', 'category'],
  ['license', 'license'],
  ['sort', 'sort'],
  ['max-bytes', 'maxBytes'],
])
  if (p.has(key)) $(id).value = p.get(key);
if (!$('sort').value) $('sort').value = 'name';
kind = p.get('type') ?? '';
$('animated').checked = p.get('animated') === '1';
$('selected-only').checked = p.get('selection') === '1';
const selected = assets.find((a) => a.id === p.get('asset'));
render();
if (selected) openAsset(selected);
