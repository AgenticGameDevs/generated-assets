import fs from 'node:fs';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune } from '@gltf-transform/functions';
import { MeshoptDecoder } from 'meshoptimizer';
await MeshoptDecoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
const source = 'assets/fjordfall/models/rider.glb';
const original = await io.read(source),
  skin = original.getRoot().listSkins()[0];
const skeleton = skin.listJoints().map((n) => ({
  name: n.getName(),
  children: n
    .listChildren()
    .filter((c) => skin.listJoints().includes(c))
    .map((c) => c.getName()),
  translation: n.getTranslation(),
  rotation: n.getRotation(),
  scale: n.getScale(),
}));
const inverseBindMatrices = Array.from(skin.getInverseBindMatrices().getArray());
const names = original
  .getRoot()
  .listAnimations()
  .map((a) => a.getName());
for (const clip of [null, 'all', ...names]) {
  const doc = await io.read(source),
    root = doc.getRoot(),
    kind = clip === null ? 'rig' : 'animation',
    folder = kind === 'rig' ? 'rigs' : 'animations',
    slug =
      clip === null
        ? 'humanoid-24'
        : clip === 'all'
          ? 'humanoid-full-pack'
          : clip
              .replace('Fjordfall_', '')
              .replace(/([a-z])([A-Z])/g, '$1-$2')
              .toLowerCase();
  for (const n of root.listNodes()) {
    n.setMesh(null);
    n.setSkin(null);
  }
  for (const s of root.listSkins()) s.dispose();
  for (const m of root.listMeshes()) m.dispose();
  for (const m of root.listMaterials()) m.dispose();
  for (const t of root.listTextures()) t.dispose();
  for (const ext of root.listExtensionsUsed()) ext.dispose();
  for (const a of root.listAnimations())
    if (clip === null || (clip !== 'all' && a.getName() !== clip)) a.dispose();
  root.setExtras({
    assetLibrary: {
      rigTarget: 'fjordfall/rigs/humanoid-24',
      skeleton,
      inverseBindMatrices,
      sourceAsset: 'fjordfall/models/rider',
      note: 'Mesh-free export; skin inverse binds retained here in original joint order.',
    },
  });
  await doc.transform(prune({ keepLeaves: true }));
  fs.mkdirSync(`assets/fjordfall/${folder}`, { recursive: true });
  const file = `assets/fjordfall/${folder}/${slug}.glb`;
  await io.write(file, doc);
  const id = `fjordfall/${folder}/${slug}`,
    name =
      clip === null
        ? 'Fjordfall humanoid · 24-joint rig'
        : clip === 'all'
          ? 'Fjordfall humanoid · Nine-animation pack'
          : clip.replace('Fjordfall_', '').replace(/([a-z])([A-Z])/g, '$1 $2') +
            ' · Humanoid animation';
  const metadata = {
    schemaVersion: 1,
    id,
    name,
    kind,
    collection: 'fjordfall',
    category: kind === 'rig' ? 'Rigs' : 'Animations',
    description:
      clip === null
        ? 'Mesh-free 24-joint Fjordfall humanoid skeleton, preserving the shipped rider’s node hierarchy and rest transforms. Original inverse bind matrices are retained in GLB extras.'
        : `Mesh-free ${clip === 'all' ? 'nine-clip animation pack' : clip.replace('Fjordfall_', '') + ' animation'} for the Fjordfall 24-joint humanoid. Original animation channels, interpolation and target node names are preserved. Retargeting is required for other skeletons.`,
    tags: ['humanoid', kind, 'skeleton', 'fjordfall'],
    creator: { name: 'Jonathan Maddison', url: 'https://github.com/jonathanwmaddison' },
    license: 'CC-BY-4.0',
    attribution: `${name} by Jonathan Maddison, Generated Assets (CC BY 4.0). Base rig created with Meshy; animation authored in Blender.`,
    file,
    preview: `thumbnails/fjordfall-${folder}-${slug}.png`,
    source: {
      method: 'mixed',
      generator: 'Meshy + Blender + glTF Transform',
      description:
        'Extracted from the included helmeted rider. Meshy auto-rig refined in Blender; authored animation preserved without resampling. Recipe: scripts/export-rig.mjs.',
    },
    usage: {
      units: 'metres',
      upAxis: 'Y',
      scaleVerified: false,
      rigTarget: 'fjordfall/rigs/humanoid-24',
      rootMotion: 'unspecified',
      notes: [
        'No character mesh, skin weights, IK constraints or game cloth behavior.',
        'Bone names and hierarchy are a compatibility contract; this is not automatically compatible with other humanoids.',
        'Root motion and loop seams have not been independently certified.',
      ],
    },
  };
  fs.mkdirSync(`metadata/fjordfall/${folder}`, { recursive: true });
  fs.writeFileSync(`metadata/${id}.json`, JSON.stringify(metadata, null, 2) + '\n');
  console.log(file);
}
