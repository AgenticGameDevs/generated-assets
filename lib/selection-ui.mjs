import { createLock } from '../skills/use-generated-assets/scripts/transfer.mjs';
import { resolvePack } from './packs.mjs';
import { downloadPack } from './download-pack.mjs';
const $ = (id) => document.getElementById(id);
const node = (tag, text) => {
  const n = document.createElement(tag);
  n.textContent = text;
  return n;
};
export function selectionUI(assets, { onChange, onPreview }) {
  const known = new Map(assets.map((a) => [a.id, a]));
  let ids = new Set(),
    controller;
  try {
    const query = new URLSearchParams(location.search);
    const stored = query.has('pick')
      ? query.get('pick').split(',')
      : JSON.parse(localStorage.getItem('ga-selection') ?? '[]');
    const found = stored.filter((id) => known.has(id));
    if (found.length) createLock(found.map((id) => known.get(id)));
    ids = new Set(found);
  } catch {
    /* Storage can be disabled; selection remains usable. */
  }
  const chosen = () => [...ids].map((id) => known.get(id));
  function refresh() {
    $('selection-bar').hidden = !ids.size;
    $('selection-count').textContent =
      `${ids.size} selected · ${(chosen().reduce((n, a) => n + a.bytes, 0) / 1048576).toFixed(1)} MB`;
    try {
      localStorage.setItem('ga-selection', JSON.stringify([...ids]));
    } catch {}
  }
  function replace(next) {
    try {
      if (next.size) createLock([...next].map((id) => known.get(id)));
      ids = next;
      $('pack-status').textContent = '';
      refresh();
      onChange();
    } catch (e) {
      $('selection-bar').hidden = false;
      $('pack-status').textContent = e.message;
    }
  }
  const api = {
    get ids() {
      return ids;
    },
    toggle(id) {
      const next = new Set(ids);
      next.has(id) ? next.delete(id) : next.add(id);
      replace(next);
    },
  };
  $('clear-pack').onclick = () => replace(new Set());
  $('share-pack').onclick = async () => {
    const url = new URL(location.pathname, location.origin);
    url.searchParams.set('pick', [...ids].join(','));
    url.searchParams.set('selection', '1');
    url.hash = 'collection';
    $('share-link').value = url.href;
    $('share-link').hidden = false;
    try {
      await navigator.clipboard.writeText(url.href);
      $('pack-status').textContent =
        'Share link copied. It contains asset IDs; the ZIP lockfile records exact versions.';
    } catch {
      $('share-link').select();
      $('pack-status').textContent = 'Copy the link shown below.';
    }
  };
  $('cancel-pack').onclick = () => controller?.abort();
  $('download-pack').onclick = async () => {
    controller = new AbortController();
    $('download-pack').disabled = true;
    $('cancel-pack').hidden = false;
    try {
      const info = await fetch('catalog-info.json')
        .then((r) => (r.ok ? r.json() : {}))
        .catch(() => ({}));
      const options = {
        revision: info.revision ?? null,
        signal: controller.signal,
        onProgress: (n, total, id) => {
          $('pack-status').textContent = `Verifying ${n}/${total} · ${id}`;
        },
      };
      // Local previews use the local catalog's bytes; published builds pin their Git commit.
      if (!options.revision)
        options.fetcher = (url, init) => fetch('assets/' + url.split('/assets/')[1], init);
      await downloadPack(chosen(), options);
      $('pack-status').textContent = 'ZIP ready: assets, metadata, credits and lockfile included.';
    } catch (e) {
      $('pack-status').textContent =
        e.name === 'AbortError' ? 'Download cancelled.' : `Pack could not download: ${e.message}`;
    } finally {
      $('download-pack').disabled = false;
      $('cancel-pack').hidden = true;
      controller = null;
    }
  };
  fetch('packs.json')
    .then((r) => {
      if (!r.ok) throw Error('Pack list unavailable');
      return r.json();
    })
    .then((packs) => {
      for (const descriptor of packs) {
        const pack = resolvePack(descriptor, assets),
          card = node('article', '');
        card.className = 'starter-pack';
        const preview = node('button', '');
        preview.className = 'pack-preview';
        preview.setAttribute('aria-label', `Preview ${pack.assets[0].name}`);
        preview.onclick = () => onPreview(pack.assets[0]);
        const image = document.createElement('img');
        image.src = pack.assets[0].preview ?? pack.assets[0].file;
        image.alt = '';
        image.loading = 'lazy';
        if (pack.assets[0].kind === 'sound') preview.append(node('span', '∿'));
        else preview.append(image);
        const heading = node('h3', pack.name),
          description = node('p', pack.description),
          details = node('details', '');
        details.append(node('summary', 'What’s included'), node('p', pack.notes));
        for (const asset of pack.assets) {
          const link = node('a', asset.name);
          link.href = asset.pageUrl;
          link.onclick = (e) => {
            e.preventDefault();
            onPreview(asset);
          };
          details.append(link);
        }
        const add = node('button', `Select pack · ${pack.assets.length} files`);
        add.className = 'select-pack';
        add.onclick = () => replace(new Set([...ids, ...pack.assetIds]));
        card.append(preview, heading, description, details, add);
        $('starter-packs').append(card);
      }
    })
    .catch((e) => {
      $('starter-packs').textContent = e.message;
    });
  refresh();
  return api;
}
