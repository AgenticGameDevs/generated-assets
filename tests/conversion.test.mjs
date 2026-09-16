import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
import { portableGLB } from '../scripts/convert-model.mjs';
import { validateBytes } from 'gltf-validator';
test('portable character retains skin and exact animation curves without compact required extensions', async () => {
  const input = await fs.readFile('assets/fjordfall/models/traveller.glb'),
    output = await portableGLB(input);
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
  const original = await io.readBinary(input),
    converted = await io.readBinary(output),
    a = original.getRoot(),
    b = converted.getRoot();
  assert.equal(b.listSkins()[0].listJoints().length, 24);
  assert.equal(b.listAnimations().length, 9);
  assert.equal(b.listMeshes().length, a.listMeshes().length);
  assert.deepEqual(
    b.listSkins()[0].getInverseBindMatrices().getArray(),
    a.listSkins()[0].getInverseBindMatrices().getArray(),
  );
  for (const ext of b.listExtensionsRequired())
    assert(
      !['EXT_meshopt_compression', 'KHR_mesh_quantization', 'EXT_texture_webp'].includes(
        ext.extensionName,
      ),
    );
  assert(b.listTextures().every((t) => t.getMimeType() !== 'image/webp'));
  for (const [i, clip] of a.listAnimations().entries())
    for (const [j, sampler] of clip.listSamplers().entries()) {
      const actual = b.listAnimations()[i].listSamplers()[j];
      assert.equal(actual.getInterpolation(), sampler.getInterpolation());
      assert.deepEqual(actual.getInput().getArray(), sampler.getInput().getArray());
      assert.deepEqual(actual.getOutput().getArray(), sampler.getOutput().getArray());
    }
  assert.equal((await validateBytes(output)).issues.numErrors, 0);
});
