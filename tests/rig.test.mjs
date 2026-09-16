import test from 'node:test';
import assert from 'node:assert/strict';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { MeshoptDecoder } from 'meshoptimizer';
test('standalone rig and animation exports preserve original hierarchy and curves', async () => {
  await MeshoptDecoder.ready;
  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({ 'meshopt.decoder': MeshoptDecoder });
  const original = await io.read('assets/fjordfall/models/rider.glb'),
    pack = await io.read('assets/fjordfall/animations/humanoid-full-pack.glb'),
    rig = await io.read('assets/fjordfall/rigs/humanoid-24.glb');
  assert.equal(pack.getRoot().listMeshes().length, 0);
  assert.equal(rig.getRoot().listAnimations().length, 0);
  assert.equal(pack.getRoot().listAnimations().length, 9);
  const sourceNodes = new Map(
    original
      .getRoot()
      .listNodes()
      .map((n) => [n.getName(), n]),
  );
  for (const n of rig.getRoot().listNodes()) {
    const src = sourceNodes.get(n.getName());
    assert(src);
    assert.deepEqual(n.getTranslation(), src.getTranslation());
    assert.deepEqual(n.getRotation(), src.getRotation());
    assert.deepEqual(n.getScale(), src.getScale());
    assert.deepEqual(
      n.listChildren().map((c) => c.getName()),
      src.listChildren().map((c) => c.getName()),
    );
  }
  for (const clip of pack.getRoot().listAnimations()) {
    const source = original
      .getRoot()
      .listAnimations()
      .find((a) => a.getName() === clip.getName());
    assert(source);
    assert.equal(clip.listChannels().length, source.listChannels().length);
    for (const [i, c] of clip.listChannels().entries()) {
      const s = source.listChannels()[i];
      assert.equal(c.getTargetNode().getName(), s.getTargetNode().getName());
      assert.equal(c.getTargetPath(), s.getTargetPath());
      assert.equal(c.getSampler().getInterpolation(), s.getSampler().getInterpolation());
      assert.deepEqual(c.getSampler().getInput().getArray(), s.getSampler().getInput().getArray());
      assert.deepEqual(
        c.getSampler().getOutput().getArray(),
        s.getSampler().getOutput().getArray(),
      );
    }
  }
  assert.deepEqual(
    rig.getRoot().getExtras().assetLibrary.inverseBindMatrices,
    Array.from(original.getRoot().listSkins()[0].getInverseBindMatrices().getArray()),
  );
});
