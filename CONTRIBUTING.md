# Contribute an asset

Anyone can propose an asset, improve metadata, report a problem, or help review. Contributions arrive through pull requests; a maintainer reviews rights and quality before merging. There is no anonymous upload endpoint and no automatic approval.

## Start with a small contribution

1. Fork [generated-assets](https://github.com/jonathanwmaddison/generated-assets/fork), clone your fork, and create a branch such as `asset/wooden-crate`.
2. Install Node 22+ and run `npm ci`.
3. Copy `examples/submission.json` outside the repository and replace every example value. The asset ID is `collection/models/slug`, `collection/tex/slug`, `collection/ui/slug`, or `collection/sfx/slug`. Use your own collection name or discuss additions to an existing one. IDs and paths use lowercase letters, numbers, underscores and hyphens.
4. Import the file and its actual preview:

```sh
npm run new-asset -- --metadata /path/submission.json --file /path/wooden-crate.glb --preview /path/wooden-crate.png
npm run build
npm test
npm run verify
npm start
```

For images and sounds, omit `--preview`; model previews are required. The import command creates separate metadata and asset files and refuses to overwrite existing contributions. For a revision, edit the existing files intentionally on your branch and explain what changed.

5. Inspect your contribution at http://127.0.0.1:4178. Check the actual model and animations, image transparency and seams, or the complete audio clip. Test a narrow viewport as well as desktop.
6. Commit the asset, `metadata/<id>.json`, thumbnail, and generated `catalog.json` (plus a recipe if useful). Do not commit `dist/`, `node_modules/`, caches, credentials, game saves or private reference material.
7. Open a PR against `main`. The PR template asks for the source, rights basis, license, preview, tests and limitations. An agent can use [the contribution skill](skills/contribute-game-assets/SKILL.md) to prepare this flow and submit when requested.

## What we accept

For a working game example, [play Fjordfall](https://fjordfall.fly.dev). Keep contributions focused on reusable assets, rigs, animations and their generation workflows; weather engines and world generation systems are outside the current scope.

Rigs use IDs such as `collection/rigs/slug`; animation packs use `collection/animations/slug`. Both require a real thumbnail and `usage.rigTarget`. Include the joint hierarchy and rest pose, name animation clips, state units and root-motion behavior where verified, and explain retargeting requirements. Mesh-free skeletons and clips are supported. The Fjordfall clips target its 24-joint humanoid rig; matching names alone does not establish compatibility with another rig. Tags such as `rigged`, `animated`, joint count and clip count are derived from file inspection; add descriptive action and style tags as well.

- **Open licenses:** CC0 1.0 or CC BY 4.0 for media. Original tooling uses MIT. You keep ownership; contributing grants users the selected license. There is no ownership transfer or separate CLA. Do not upload work you cannot license, or change someone else's license.
- **Models:** self-contained GLB 2.0, embedded textures, meaningful object orientation, no external file dependencies. Describe required extensions and game-specific limitations. Rigged characters should have useful, named clips and be checked in motion.
- **Images:** PNG, WebP or JPEG, at most 4096 × 4096. Preserve required alpha. Claim seamless tiling only after checking a repeated view.
- **Audio:** WAV, MP3 or Ogg; no clipped transients, abrupt unintended tails, or unlicensed samples. Record whether a clip loops. Generator terms must allow redistribution as a standalone sound library—not just inclusion in a game.
- **Size:** at most 25 MiB per media file and 1600px per preview. Split a large pack into reviewable PRs. Discuss larger formats or other open licenses in an issue before changing validation.
- **Provenance:** distinguish authored, procedural, AI-generated and mixed workflows. Identify the generator and available recipe. Establish rights to input/reference images and any third-party components. Do not attach private receipts, signed download URLs or secrets.

The generator does not determine quality. A useful silhouette, consistent scale, clean texture, well-behaved rig, useful metadata and honest limitations matter more than the tool used.

## What CI verifies

The `Validate library` workflow validates descriptors, unique IDs/paths, licenses, file bounds, file headers, image dimensions, embedded GLB dependencies, previews, byte counts and SHA-256 hashes. It checks the committed catalog matches the source, tests search/import/download/MCP behavior, and builds the site. Missing metadata and uncatalogued media fail validation.

CI cannot establish copyright ownership, certify artistic quality, detect every malicious binary or prove every animation works. Maintainers inspect provenance and previews and may request changes. No PR deployment has write credentials, and fork PRs cannot trigger a production deploy.

## Review and revisions

Use one coherent asset or small related set per PR. Keep stable IDs for compatible revisions; explain geometry, rig, license or scale changes that may break consumers. Do not remove creator credit. Prefer a new asset ID for a materially different replacement. If a source or license is disputed, open an [asset problem report](https://github.com/jonathanwmaddison/generated-assets/issues/new?template=asset-problem.yml).

Community management and maintainer responsibilities are in [GOVERNANCE.md](GOVERNANCE.md). To consume assets rather than submit them, see [AGENTS.md](AGENTS.md).
