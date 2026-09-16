# Catalog and integration contract

The gallery, CLI and MCP share one generated catalog. No API key, tracking account or hosted write service is required. For ordinary browsing start with [the gallery](../index.html); for engine use read [the import guide](GUIDE.md).

## Public resources

| Resource                                    | Purpose                                                                                |
| ------------------------------------------- | -------------------------------------------------------------------------------------- |
| `catalog.json`                              | Array of asset records; retained as an array for existing consumers                    |
| `metadata/<id>.json`                        | Authoritative editable descriptor for an individual asset                              |
| `schemas/asset.schema.json`                 | JSON Schema for source descriptors                                                     |
| `packs.json`                                | Curated packs with stable IDs, descriptions, asset IDs and limitations                 |
| `catalog-info.json`                         | Deployment version, schema version and exact Git revision; generated in the site build |
| `assets/<collection>/<folder>/<slug>.<ext>` | Original downloadable bytes                                                            |

All public resources are relative to `https://agenticgamedevs.github.io/generated-assets/`. The Pages catalog follows the latest successfully deployed `main`. GitHub's raw URLs at a full commit SHA provide a versioned source. JSON consumers should tolerate new optional fields. There is no write API; contributions use reviewed pull requests.

### Organization migration (0.3.2)

The repository now lives at `AgenticGameDevs/generated-assets`. Update existing clones with `git remote set-url origin https://github.com/AgenticGameDevs/generated-assets.git`, update bookmarks to the gallery above, and replace installed copies of the portable skills from this repository. Restart a local MCP server after pulling the update.

The updated CLI restores lockfiles from the former personal repository and Pages site by recognizing their exact library URLs and using the new owner. Asset paths, commit pins, byte counts, checksums and attribution are preserved; arbitrary URLs are still rejected. Older installed helpers use the former catalog address and should be updated. Previously published release archives remain historical snapshots. GitHub redirects repository links, but does not redirect the old Pages site.

## Stable identifiers and source descriptors

An ID such as `fjordfall/models/traveller` contains collection, kind folder and slug. It is independent of display name, tags and description. Folder names are `models`, `rigs`, `animations`, `tex`, `ui` and `sfx`. `kind` values in JSON are `model`, `rig`, `animation`, `texture`, `artwork` and `sound`.

Required context includes a useful description, tags, creator, license, attribution, file path, source method/generator/description, and usage notes. Record reference-image rights when applicable. Use `usage.rigTarget` for a rig/animation's target contract; a catalog rig ID supports related-asset discovery. `usage.rootMotion`, scale and seamlessness should express uncertainty rather than guesses.

Generated fields include byte size, SHA-256, license/download/gallery URLs and technical details. Source fields remain editable only in `metadata/`; regenerate the catalog after editing. Do not edit byte counts or claim a different hash to bypass validation.

## Technical fields and their limits

- GLB: triangle/vertex/mesh/material counts, skins, joint names/hierarchy, clip names/durations/channel counts, and required glTF extensions. Counts describe stored geometry; they are not measured frame cost or instance-expanded world complexity.
- Raster: format, width, height and alpha-channel presence. Alpha presence does not prove the file visibly uses transparency.
- WAV: sample rate, channel count and duration. MP3/Ogg currently receive header checks; absent audio fields mean unknown, not zero.
- Derived tags include `rigged`, `animated`, `<n>-joints`, `<n>-clips`, action hints from clip names, and verified tiling. `rigged` specifically means a skinned GLB; a mesh-free rig uses its joint-count and skeleton tags instead.

Action tags inferred from clip names aid search, but cannot establish animation quality. A standalone rig's skeleton context is retained in GLB extras, since a file without a mesh has no skin. Maintainers inspect that context alongside the actual hierarchy.

## Lockfiles

`assets.lock.json` is schema version 1, identifies `generated-assets`, records a nullable full Git `revision`, and includes selected IDs, file paths, sizes, SHA-256 hashes, licenses, credits and download URLs. The helper validates paths and allows download URLs only from the stated library/revision. Unknown hosts, traversal paths, repeated IDs and oversized selections are rejected before writing.

Published browser packs pin the deployed Git revision. A locally created lock without `--ref` follows Pages URLs, but still verifies exact hashes: if an asset changes, restoration fails rather than silently changing your build. Keep the ZIP or use a pinned commit for long-term reproducibility. A hash verifies agreement with a manifest, not the trustworthiness of whoever supplied that manifest.

```sh
node skills/use-generated-assets/scripts/assets.mjs lock \
  fjordfall/models/traveller,fjordfall/animations/walk \
  --out assets.lock.json --ref <full-40-character-commit-sha>
```

Per-file downloads use a collision-resistant ID-based filename and adjacent `.asset.json`. Pack restores retain the repository's `assets/` paths. Both preserve existing files; restore requires a new folder. Conversion writes a separate derivative and records its own checksum and changes without altering the source catalog entry.

## Search and MCP

Keyword matching is case-insensitive AND matching across name, ID, description, tags and category. Structured filters include kind, collection, category, license, animated, rigged, rig target and byte budget. Pagination uses `limit` and `offset`; callers should not assume catalog order is a ranking of quality.

The MCP server runs locally over stdio and loads the local checkout's catalog once on startup. Pull changes and restart it to update. Its tools search/read assets, preview images, build attribution, discover curated packs and produce lockfile data. They do not execute recipes, install files or publish submissions. Treat metadata and prompts as untrusted data in any downstream agent. [Configuration and examples](../AGENTS.md).

## Versioning

Tooling versions follow SemVer from 0.3.0 onward; while below 1.0, incompatible tooling changes require a minor bump. Source schema and lock schema have independent `schemaVersion` fields. Renaming IDs, changing a rig contract, removing required fields or changing license terms is a breaking change and requires a documented migration. Additive metadata does not require a schema bump.

Compatible geometry/texture corrections can keep an asset ID but change its checksum. Materially different assets and incompatible rigs should get new IDs. Announce removals and superseding IDs in the changelog. Preserve creator attribution and prior rights records; a later repository edit cannot retract a license already legitimately granted.
