import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dequantize } from '@gltf-transform/functions';
import { MeshoptDecoder } from 'meshoptimizer';
import sharp from 'sharp';
import { sha256 } from '../lib/inspect.mjs';

// Decode geometry and use PNG textures while preserving skins, clips and materials.
// This is a derivative export, not a catalog replacement or a retargeting operation.
export async function portableGLB(bytes) {
  await MeshoptDecoder.ready;
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
  const doc = await io.readBinary(bytes);
  await doc.transform(dequantize());
  for (const texture of doc.getRoot().listTextures()) {
    if (texture.getMimeType() === 'image/webp')
      texture.setImage(await sharp(texture.getImage()).png().toBuffer()).setMimeType('image/png');
  }
  for (const ext of doc.getRoot().listExtensionsUsed())
    if (
      ['EXT_meshopt_compression', 'KHR_mesh_quantization', 'EXT_texture_webp'].includes(
        ext.extensionName,
      )
    )
      ext.dispose();
  return io.writeBinary(doc);
}
async function main() {
  const [id, out] = process.argv.slice(2);
  if (!id || !out || process.argv.length !== 4)
    throw Error('Usage: npm run convert -- <asset-id> <new-output.glb>');
  if (!out.endsWith('.glb')) throw Error('Output must end in .glb');
  const root = fileURLToPath(new URL('../', import.meta.url));
  const catalog = JSON.parse(await fs.readFile(path.join(root, 'catalog.json'))),
    a = catalog.find((a) => a.id === id);
  if (!a || !['model', 'rig', 'animation'].includes(a.kind))
    throw Error('Choose a catalogued 3D asset');
  const bytes = await fs.readFile(path.join(root, a.file));
  if (sha256(bytes) !== a.sha256) throw Error('Source checksum mismatch; run verification first');
  const result = await portableGLB(bytes),
    credit = {
      ...a,
      derivative: {
        file: path.basename(out),
        sha256: sha256(result),
        bytes: result.length,
        changes:
          'Meshopt decoded, geometry dequantized and WebP textures converted to PNG. No animation resampling or retargeting.',
      },
    };
  const created = [];
  try {
    for (const [file, data] of [
      [out, result],
      [out + '.asset.json', JSON.stringify(credit, null, 2) + '\n'],
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
    await Promise.all(created.map((p) => fs.unlink(p)));
    throw e;
  }
  console.log(
    `Wrote ${out} (${result.length} bytes) and attribution metadata. Preserve the source license; verify scale and animation in your engine.`,
  );
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  main().catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  });
