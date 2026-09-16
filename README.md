# Generated Assets

An open asset collection from **Fjordfall** and **SKYBOUND** (the local Superman flight-game prototype). Models, textures, illustrated UI pieces, procedural sound effects, and the workflows behind them.

**[Browse the gallery](https://jonathanwmaddison.github.io/generated-assets/)** · [Asset catalog](catalog.json) · [Contribute](CONTRIBUTING.md) · [Agent skills and MCP](AGENTS.md) · [Workflows](workflows/README.md) · [Licenses](LICENSE.md)

**[Play Fjordfall](https://fjordfall.fly.dev)** for a deployed example of a game made with these assets. Its lighting, weather, world generation and gameplay belong to the game; this library focuses on reusable media and the workflows for contributing it.

The collection contains 172 assets, including four rigged characters, a standalone 24-joint humanoid skeleton, nine individual animation clips and their combined pack. Traveller 1 and Traveller 2 are included with the reference owner's permission. Every asset has a description, searchable tags, provenance, license and verified technical metadata. The gallery supports animation playback and skeleton previews.

## Use the collection

Download individual files through the gallery, clone this repository, or use GitHub's **Code → Download ZIP**. Everything under `assets/` is a real file, not a Git LFS pointer.

```sh
git clone https://github.com/jonathanwmaddison/generated-assets.git
cd generated-assets
npm start
```

Open http://127.0.0.1:4178. Serving the gallery needs only Node 22+, with no install step. Its Three.js viewer is vendored for offline use. The gallery also works as a static site on GitHub Pages.

Models are GLB/glTF 2.0. Some Fjordfall models require `EXT_meshopt_compression`, `KHR_mesh_quantization`, or `EXT_texture_webp`; use a compatible loader or convert them for your engine. Embedded images and vertex colors stay with each GLB. Game-specific wind shaders, collision, IK and behavior are not baked into these files. Character GLBs retain their authored animation clips.

Textures are WebP or PNG. The `-512` files are smaller mobile variants. An image intended to tile is not a guarantee of a perfectly invisible seam. The preview provides neutral lighting rather than reproducing either game's rendering.

## Licenses and attribution

Most media is **CC BY 4.0**. The original flock-bell recording retains its **CC0** dedication. Generator and gallery code is **MIT**; vendored Three.js keeps its own MIT notice. Per-file media licenses are in `catalog.json` and the gallery. Descriptors under `metadata/` are authoritative; `manifest.json` is a legacy export inventory.

Suggested attribution: “Assets by Jonathan Maddison, Generated Assets (CC BY 4.0). Meshy-generated models created with Meshy.” Link to this repository, retain the license link, and note your modifications. The Meshy credit is retained because historical account tiers were not independently verified; it also satisfies the attribution requirement for free-plan generations.

## What is included

- Fjordfall: buildings, vegetation, wildlife, boats, furniture, road props, reusable characters, generated surface textures, illustrated marks, and original synthesized bells.
- SKYBOUND: four exported procedural scenery models, six exported synthesized effects, and the source geometry/audio generators.
- Historical image/model prompts where available, sanitized provenance, SHA-256 checksums, and a reusable agent skill.

ElevenLabs-generated sound files are **excluded**: their standalone redistribution restriction is incompatible with an asset library. Hero-specific artwork and files without sufficient provenance are listed in [excluded.json](excluded.json). Game databases, user pictures, email hashes and private save data are not part of this repository.

## Contribute and discover

Submit additions through a pull request using [CONTRIBUTING.md](CONTRIBUTING.md) or the [contribution skill](skills/contribute-game-assets/SKILL.md). CI validates metadata, media and generated files before deployment; maintainers review rights and quality. [GOVERNANCE.md](GOVERNANCE.md) describes community responsibilities and decisions.

Agents can use the portable search/download skill or the local, read-only MCP server described in [AGENTS.md](AGENTS.md). Downloads include checksums and attribution. The static gallery is hosted on GitHub Pages; MCP runs locally through stdio.

## Maintain or regenerate

```sh
npm ci                         # needed for validation and regeneration
npm run export:models
# Godot 4.x is needed for sound regeneration:
godot --headless --path generators/skybound/godot --editor --import --quit
godot --headless --path generators/skybound/godot --script export.gd
npm run catalog
npm run build
npm test
npm run verify
```

The reusable skill lives in [`skills/game-asset-pipeline`](skills/game-asset-pipeline/SKILL.md). Point your agent at it in this checkout so its relative links to workflows and recipes resolve. It describes the practices used in these projects; it is newly packaged for this release, not a claim that a historical skill ran every generation.
