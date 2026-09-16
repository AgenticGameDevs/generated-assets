# Workflow case studies from the founding collections

These notes document the initial contributed collections: AI generation, authored Blender meshes and procedural synthesis. They preserve provenance and examples rather than prescribing a game, aesthetic or tool for future contributions. For practical creation and organization guides, start with [the learning hub](../learn/README.md).

See these assets in use in [the deployed Fjordfall game](https://fjordfall.fly.dev).

## Images: recipe → master → export → in-game review

The historical recipes are in [`provenance/fjordfall/game-images.json`](../provenance/fjordfall/game-images.json). Each records a prompt, intended use, output size, alpha requirement and byte budget. The recorded model is historical provenance, not a promise that the same API model remains available.

1. Specify one material or isolated UI element. Terrain albedo prompts ask for an orthogonal view, flat lighting, no writing, no perspective, and restrained color. Do not treat generated RGB detail as a physically valid normal or displacement map.
2. Make one deliberate generation request. Keep the lossless master, exact prompt/spec, model, usage receipt and file hashes. A timeout does not prove the request was never billed; do not automatically retry an ambiguous paid request.
3. Resize to the runtime dimensions, preserve alpha, convert to sRGB WebP, and reduce encoding quality only as needed to meet the byte budget. Retain the master. The five ground materials also have 512-pixel mobile variants.
4. Check dimensions, format, alpha extrema, byte size and opposing-edge discontinuities. A numeric tiling check is a diagnostic, not artistic approval. Review a repeated grid and inspect for baked shadows, text, border artifacts and recognizable repetition.
5. Preview at actual game scale. Paper goes beneath live text; the postcard border surrounds a real capture. UI meaning remains in the application rather than being painted into a mockup.

The original Fjordfall command sequence was `npm run assets:image -- plan <id>`, `generate <id>`, `validate <id> <run>`, then `install <id> <run>`. That API tool belongs to the game and is not required to use this collection. Existing files and prompts are provided here without credentials or paid requests.

## Models: Meshy → Blender → compact GLB

Available text prompts are in the other JSON files under `provenance/fjordfall/`. For example, the farmhouse recipe specifies a single Norwegian white clapboard building with a slate roof and excludes bases, vegetation, people and multiple buildings.

Meshy was used for source meshes, some texture passes and a character auto-rig. Blender supplied cleanup, original props, rig-preserving body work and authored animation. Many small props in this release are entirely Blender-authored.

- Keep the uncompressed source. Inspect scale, axes, silhouette, texture seams and topology before packing. Do not confuse a triangle budget with visual quality.
- For character edits, preserve bone names, parent hierarchy, inverse-bind matrices and existing action curves. Weld duplicate vertices where appropriate; retain at most four positive influences per vertex and normalize weights before export.
- Test the packed mesh, not only the Blender viewport: idle/walk/run, skateboard foot contact, hip motion and extreme poses exposed errors that static inspection missed.
- Pack geometry with Meshopt and appropriately sized WebP textures. Retain required glTF extension support in the consumer. Embedded textures and animation are included in the exported GLB, but game IK and cloth shaders are not.
- Compare extracted animation curves, rig hierarchy and texture appearance before/after packing. Then load the packed file in a real browser with the intended decoder.

For newly generated models, establish rights to any supplied reference images separately. Generator output ownership cannot establish rights to a copied character design or an unknown reference sheet.

## Reusing rigs and animation

Both Travellers are included: the owner confirmed rights to their character reference sheets and authorized sharing the resulting models. All four rigged Fjordfall characters include a 24-joint rig and nine clips; the shepherd is static. Use the complete character GLB for the most direct import.

The `fjordfall/rigs/humanoid-24` asset provides the mesh-free hierarchy and rest pose. Its GLB extras retain the original inverse-bind matrices and joint order. The animation collection provides individual clips and one combined pack targeting that hierarchy. These files contain no skin weights or character mesh; retargeting to another skeleton requires checking names, hierarchy, rest pose and scale in your engine. Root motion and loop seams are not independently certified.

Run `node scripts/export-rig.mjs` after `npm ci` to reproduce these exports from the included rider. Tests compare the original curves, hierarchy and inverse binds. Previews are separate rendered thumbnails; inspect regenerated clips in the gallery before publishing.

## Procedural scenery from SKYBOUND

[`generators/skybound/props.ts`](../generators/skybound/props.ts) extracts the game's pine, snow-pine, cactus and boulder builders. It preserves their geometry and vertex colors while removing game placement and destruction dependencies. `npm run export:models` writes four standalone GLBs.

The gallery uses the Three.js practices applied during extraction: retain vertex attributes, export glTF, configure Meshopt decoding, frame the object using its bounds, and dispose temporary geometry/materials after export. These are the relevant practices, not a redistributed third-party skill bundle.

## Sounds: publish the synthesis, respect the sample license

The two Fjordfall bell clips are original additive synthesis. Church bells combine damped inharmonic partials and previous-strike tails to make a loop. Flock bells combine a fixed strike score with partial ratios and decay envelopes; that recording was already dedicated to CC0.

SKYBOUND generates sounds using noise, oscillators and biquad filters. The reusable Web Audio class is in `generators/skybound/audio.ts`. The Godot source and deterministic WAV exporter are in `generators/skybound/godot/`. From the repository root, run `godot --headless --path generators/skybound/godot --editor --import --quit`, then `godot --headless --path generators/skybound/godot --script export.gd` to reproduce the six effects. Listen for clipping, cut tails and bad loop joins. WAV files are mono PCM at 22,050 Hz; the laser file is a loop, the others are one-shots.

ElevenLabs clips from the game are deliberately absent: a license to include a sound in a game is not necessarily a license to redistribute the standalone sample in a library.

## Preparing a public pack

Use a file allowlist, not a recursive copy of a game checkout. Record project-relative sources, descriptions, licenses and current-byte SHA-256 hashes in `metadata/` and the generated `catalog.json`. Keep unresolved items in `excluded.json`. Never include production saves, private player pictures, credentials or signed service download links.

Run `npm run catalog` after model/audio exports and `npm run verify` before release. Preview the gallery on desktop and mobile, open a compressed character and a procedural model, play a sound, and verify download links. Record which generator workflows are fully executable here and which are historical documentation requiring the original game sources.
