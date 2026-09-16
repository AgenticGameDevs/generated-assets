# Bring an asset into your game

Generated Assets is an open library and toolkit for organizing and reusing models, rigs, animations, textures, artwork and sounds. Browse the catalog, collect useful files into a pack, and keep the context needed to use them in another project. To add your own work, start with [the learning hub](../learn/README.md) and [collection organization](../learn/ORGANIZE.md).

## The quickest path

1. Open the [gallery](../index.html). Search by name, material, action or tags such as `rigged`, `animated`, `walking`, `24-joints` and `transparent`. Filter by type, collection, license and size, or use a curated pack for a small related set.
2. Open a preview. Read the description, file size, license, source and limitations. For characters, switch clips, pause, scrub the timeline and show the skeleton. Static models also have a wireframe view. Reduced-motion preferences pause animation initially.
3. Download one file, or **Add to pack** and choose **Download ZIP + credits**. Packs contain original files, per-asset metadata, `CREDITS.txt`, a short README and `assets.lock.json`. Each file is checked against its SHA-256 before it enters the ZIP. Packs are limited to 40 files and 64 MiB to keep browser memory reasonable.
4. Import the asset into your engine. Test at your game's actual scale, lighting, camera distance and frame budget. Create collision, behavior and interaction separately.
5. Publish the supplied attribution with your game and note any modifications. Keep the lockfile and metadata in your project so the next developer can trace the source.

Selection is saved in your browser when storage is available. **Copy share link** opens the same selected IDs for a teammate without an account. It shares the current versions of those IDs; the downloaded lockfile records exact bytes and, on the published site, an immutable Git commit. Clearing selection does not delete downloaded files.

## Choose the right character download

The following existing character family is a worked example of complete models versus standalone rigs and motion. Other contributors can add different skeletons and styles with their own compatibility contracts.

| You need                             | Choose                                                     | What is included                                                                                                    |
| ------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| A usable animated traveller          | Traveller 1 or Traveller 2                                 | Skinned mesh, textures, 24-joint hierarchy, skin weights and all nine clips                                         |
| The rest hierarchy to build around   | Fjordfall humanoid rig                                     | Nodes and rest transforms; original joint order and inverse binds in `extras.assetLibrary`; no mesh or skin weights |
| Existing motion for the matching rig | Individual animation or nine-animation pack                | Mesh-free joint hierarchy and original animation channels                                                           |
| Motion on another character design   | Start with a compatible rig or retarget in your DCC/engine | Compatibility must be checked; names alone are insufficient                                                         |

The nine clips are idle, jog, jump, row, sail, skate cruise, skate push, skate tuck and walk. All four rigged Fjordfall characters carry them; the separate shepherd model is static. The two Travellers are included with confirmed ownership of their reference images and permission to share derivatives, recorded in their metadata.

`usage.rigTarget` links related assets to `fjordfall/rigs/humanoid-24`. Preserve bone names, parent hierarchy, rest transforms and inverse-bind conventions. Retargeting requires checking all of them, along with scale and axes. A mesh-free animation GLB is not itself a wearable skin or a universal humanoid rig. Game IK, board attachment, cloth behavior and foot-contact solving are not included.

## Three.js: load, clone, play

The [runnable character example](../examples/three-character.html) loads one traveller, creates two properly cloned skinned instances, and controls their animation independently. It uses the repository's vendored Three.js and works under `npm start` without a build tool.

```js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import { AnimationMixer } from 'three';

const source = await new GLTFLoader()
  .setMeshoptDecoder(MeshoptDecoder)
  .loadAsync('/assets/traveller.glb'); // your downloaded file's actual path
const character = clone(source.scene);
scene.add(character);
const mixer = new AnimationMixer(character);
mixer.clipAction(source.animations.find((c) => c.name === 'Fjordfall_Walk')).play();
// In your frame loop: mixer.update(deltaSeconds).
// On removal: stopAllAction(), uncacheRoot(character), then release owned resources.
```

Use `SkeletonUtils.clone` for a skinned hierarchy. Geometry and materials may still be shared, so dispose them only after their final user is removed. Set the Meshopt decoder before loading compact GLBs; do not strip required extensions. See the official [GLTFLoader documentation](https://threejs.org/docs/pages/GLTFLoader.html), [SkeletonUtils reference](https://threejs.org/docs/pages/module-SkeletonUtils.html), and [animation guide](https://threejs.org/manual/en/animation-system.html).

## Blender, Godot and other importers

Some originals require `EXT_meshopt_compression`, `KHR_mesh_quantization` or `EXT_texture_webp`. Support varies by importer/version. The catalog reports the exact required extensions; an empty list means no required extensions, not a guarantee of artistic or engine compatibility.

For an importer without those extensions, create a derivative GLB locally:

```sh
git clone https://github.com/jonathanwmaddison/generated-assets.git
cd generated-assets
npm ci
npm run convert -- fjordfall/models/traveller /path/to/new-traveller.glb
```

The converter decodes Meshopt, dequantizes geometry and converts WebP textures to PNG. It preserves skins, materials and clips without resampling animation. It writes a new GLB plus `.asset.json` recording the source, derivative checksum and modifications. It refuses to overwrite either output. Other extensions are preserved; inspect them if an importer still rejects the file. The larger output is expected.

In Blender use **File → Import → glTF 2.0** and inspect the armature and actions. In Godot copy the converted file into your project, let the editor import it, then inspect its Skeleton3D and animation tracks. Use an inherited scene for game behavior so reimporting media does not erase your gameplay edits. For Godot's pipeline see the official [format guide](https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/importing_3d_scenes/available_formats.html).

### What has actually been tested

| Check                                      | Result                                                     | Scope                                                   |
| ------------------------------------------ | ---------------------------------------------------------- | ------------------------------------------------------- |
| Browser previews with vendored Three.js    | Character meshes, standalone rigs and animation packs load | Covered by Chromium tests for representative assets     |
| Converted Traveller 1 in Blender 5.2.1 LTS | One armature, 24 bones, nine actions                       | Local import check; not a visual approval of every pose |
| Converted Traveller 1 in Godot 4.7.1       | 24 bones and nine clips                                    | Local GLTFDocument scene import check                   |
| Khronos glTF Validator                     | Decoded collection has no errors                           | Required for release; warnings are reported             |
| Unity / Unreal                             | Not tested here                                            | Use a suitable glTF importer and verify your pipeline   |

Checks were run for the 0.3.0 release. Do not infer certification for every engine version or for a contributor's new file. Scale, animation loop seams and root-motion behavior remain unverified unless the individual descriptor states otherwise. The included `examples/import-checks/` scripts make the Blender/Godot structural checks repeatable.

## Textures, artwork and audio

Textures are color images, not automatically normal, roughness or displacement maps. Set the appropriate color space in your renderer. Check the gallery's repeat view before using an image as a terrain tile; only `seamlessVerified: true` is an affirmative tiling claim. The `-512` variants are smaller alternatives. Preserve alpha on illustrated overlays and UI marks.

Listen to audio at a comfortable volume and test it in your mix. A laser hum is intended to loop; impacts and movement effects are one-shots. Generator terms permitting use inside a game do not necessarily permit standalone redistribution. This library excludes the game's ElevenLabs SFX and includes original procedural sounds with documented licenses instead.

## Reproducible downloads and agents

The [agent guide](../AGENTS.md) covers the local read-only MCP server and portable skill. The helper requires Node 22+ and has no npm dependencies:

```sh
node skills/use-generated-assets/scripts/assets.mjs search "traveller rigged"
node skills/use-generated-assets/scripts/assets.mjs info fjordfall/models/traveller
node skills/use-generated-assets/scripts/assets.mjs download fjordfall/models/traveller --out ./downloads
node skills/use-generated-assets/scripts/assets.mjs restore ./assets.lock.json --out ./restored-pack
```

Restore requires a new output directory and verifies every file. It removes only that newly created directory if any download fails. A hash mismatch is a reason to stop and inspect the catalog/source; it is not fixed by accepting changed bytes silently. For a pinned catalog use `--ref` with a full 40-character Git commit SHA. See [the catalog contract](CATALOG.md) for automation and stability.

## Credits that travel with the game

Use each record's attribution and license URL. The pack's `CREDITS.txt` provides a starting point, including a line to describe modifications. Put credits in a place your game's users can find, such as a credits screen or bundled attribution document. CC0 does not require attribution; preserving source information is still helpful. See [the licenses](../LICENSE.md) for the actual grants and third-party notices.

## An example in use

For an example of these files used in a deployed project, [play Fjordfall](https://fjordfall.fly.dev). Its rendering and gameplay show one application of the library; use the assets and workflows in your own project as their licenses permit.

## When something goes wrong

- **Model missing in the editor:** check required extensions and try the converter. Also check scene scale, object visibility and alpha handling.
- **Skeleton loads without a body:** a standalone rig or animation file is intentionally mesh-free. Download the complete character instead.
- **Animation twists another character:** stop and compare rest pose, hierarchy and scale; the shared rig ID does not make arbitrary rigs interchangeable.
- **Assets missing from a share link:** reset filters. Share links track stable IDs, while lockfiles preserve exact versions.
- **Pack download fails:** check the message, reduce selection size, or retry later after checking connectivity. No partial ZIP is offered when verification fails.
- **Preview unavailable:** the download can still work; check browser WebGL support or open a supported desktop browser.

Report the asset ID, catalog/release revision, engine/importer version, reproduction steps and an appropriate screenshot in an [asset problem report](https://github.com/jonathanwmaddison/generated-assets/issues/new?template=asset-problem.yml). Keep private game files and personal information out of public reports.
