#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { McpServer, ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { searchAssets, attributionFor } from '../lib/catalog.mjs';
import { resolvePack } from '../lib/packs.mjs';
import { createLock } from '../skills/use-generated-assets/scripts/transfer.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
export function createServer() {
  const assets = JSON.parse(fs.readFileSync(path.join(root, 'catalog.json')));
  const server = new McpServer({ name: 'generated-assets', version: '0.3.2' });
  const packs = JSON.parse(fs.readFileSync(path.join(root, 'packs.json')));
  const annotations = {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  };
  const result = (value) => ({
    content: [{ type: 'text', text: JSON.stringify(value, null, 2) }],
    structuredContent: value,
  });
  const get = (id) => {
    const a = assets.find((a) => a.id === id);
    if (!a) throw Error('Unknown asset ID');
    return a;
  };
  const fail = (e) => ({ isError: true, content: [{ type: 'text', text: e.message }] });
  server.registerTool(
    'list_packs',
    {
      description:
        'Discover small curated starter packs, descriptions, included asset IDs and limitations.',
      annotations,
      inputSchema: {},
    },
    async () => result({ packs }),
  );
  server.registerTool(
    'get_pack',
    {
      description:
        'Read a curated pack and the complete metadata for every included asset. No downloads or writes.',
      annotations,
      inputSchema: { id: z.string().max(80) },
    },
    async ({ id }) => {
      try {
        const pack = packs.find((p) => p.id === id);
        if (!pack) throw Error('Unknown pack ID');
        return result({ pack: resolvePack(pack, assets) });
      } catch (e) {
        return fail(e);
      }
    },
  );
  server.registerTool(
    'create_asset_lock',
    {
      description:
        'Return a checksum lockfile for 1–40 selected asset IDs, limited to 64 MiB. This plans an import; it does not write or download. Unpinned Pages URLs are used; hashes stop silently changed bytes.',
      annotations,
      inputSchema: { ids: z.array(z.string().max(200)).min(1).max(40) },
    },
    async ({ ids }) => {
      try {
        return result({ lock: createLock(ids.map(get)) });
      } catch (e) {
        return fail(e);
      }
    },
  );
  server.registerTool(
    'search_assets',
    {
      description:
        'Search open game assets by keywords, type, collection, license, animation and byte budget. Returns metadata, verified hashes and public download URLs; never installs files.',
      annotations,
      inputSchema: {
        query: z.string().max(200).optional(),
        kind: z.enum(['model', 'rig', 'animation', 'texture', 'artwork', 'sound']).optional(),
        collection: z.string().max(80).optional(),
        category: z.string().max(80).optional(),
        license: z.enum(['CC0-1.0', 'CC-BY-4.0']).optional(),
        animated: z.boolean().optional(),
        rigged: z.boolean().optional(),
        rigTarget: z.string().max(120).optional(),
        maxBytes: z.number().int().positive().optional(),
        limit: z.number().int().min(1).max(50).default(12),
        offset: z.number().int().nonnegative().default(0),
      },
    },
    async (args) => result(searchAssets(assets, args)),
  );
  server.registerTool(
    'get_asset',
    {
      description:
        'Read an exact asset record, including license, attribution, technical requirements, source and download checksum.',
      annotations,
      inputSchema: { id: z.string().max(200) },
    },
    async ({ id }) => {
      try {
        return result({ asset: get(id) });
      } catch (e) {
        return fail(e);
      }
    },
  );
  server.registerTool(
    'get_asset_preview',
    {
      description:
        'View a catalogued model thumbnail or raster asset. No arbitrary file paths or external fetches.',
      annotations,
      inputSchema: { id: z.string().max(200) },
    },
    async ({ id }) => {
      try {
        const a = get(id),
          relative = a.preview ?? (['texture', 'artwork'].includes(a.kind) ? a.file : null);
        if (!relative) throw Error('No image preview for this asset');
        const target = path.resolve(root, relative);
        if (!target.startsWith(path.resolve(root) + path.sep) || fs.realpathSync(target) !== target)
          throw Error('Invalid preview path');
        const bytes = fs.readFileSync(target);
        if (bytes.length > 3 * 1024 * 1024) throw Error('Preview too large; use the gallery URL');
        return {
          content: [
            {
              type: 'image',
              data: bytes.toString('base64'),
              mimeType: target.endsWith('.png')
                ? 'image/png'
                : target.endsWith('.jpg')
                  ? 'image/jpeg'
                  : 'image/webp',
            },
          ],
        };
      } catch (e) {
        return fail(e);
      }
    },
  );
  server.registerTool(
    'get_attribution',
    {
      description:
        'Build attribution text for selected asset IDs. Retain these credits when adding assets to a project.',
      annotations,
      inputSchema: { ids: z.array(z.string().max(200)).min(1).max(50) },
    },
    async ({ ids }) => {
      try {
        return result({ text: attributionFor(ids.map(get)) });
      } catch (e) {
        return fail(e);
      }
    },
  );
  server.registerTool(
    'list_collections',
    { description: 'List available collections and asset counts.', annotations, inputSchema: {} },
    async () =>
      result({
        collections: [...new Set(assets.map((a) => a.collection))].map((id) => ({
          id,
          count: assets.filter((a) => a.collection === id).length,
        })),
      }),
  );
  server.registerResource(
    'catalog',
    'assets://catalog',
    { mimeType: 'application/json', description: 'Complete open asset catalog.' },
    async (uri) => ({
      contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(assets) }],
    }),
  );
  server.registerResource(
    'asset',
    new ResourceTemplate('assets://item/{collection}/{kind}/{slug}', { list: undefined }),
    { mimeType: 'application/json' },
    async (uri, { collection, kind, slug }) => ({
      contents: [
        {
          uri: uri.href,
          mimeType: 'application/json',
          text: JSON.stringify(get(`${collection}/${kind}/${slug}`)),
        },
      ],
    }),
  );
  return server;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  await createServer().connect(new StdioServerTransport());
