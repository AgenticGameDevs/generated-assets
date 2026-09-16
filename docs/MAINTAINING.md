# Maintain a useful asset library

Optimize for a developer finding the right asset, understanding its limits, importing it successfully, and preserving credit. Favor clear small contributions over a catalog full of poorly described uploads. The library's scope is media, rigs, animations and their generation/import workflows. Weather and world generation systems remain outside it.

## Architecture

- `metadata/` holds source descriptors. `assets/` holds redistributable media, with real files rather than Git LFS pointers. `thumbnails/` shows those actual files.
- `scripts/catalog.mjs` validates descriptors, inspects bytes, derives technical tags and writes `catalog.json` and the source JSON Schema.
- `lib/catalog.mjs` supplies shared filtering/attribution. `packs.json` references existing assets without duplicating files.
- `skills/use-generated-assets/scripts/transfer.mjs` defines bounded transfers and lockfile checks shared by CLI, gallery and MCP.
- `gallery.js`, `lib/selection-ui.mjs` and `viewer.js` implement discovery, selection and isolated 3D previews. Static previews render on demand; animation pauses when hidden.
- Documentation is Markdown rendered with raw HTML disabled. `scripts/build-site.mjs` copies an explicit public allowlist into `dist/`.
- MCP is local and read-only. GitHub Pages serves static files; neither is a submission backend.

## Review an asset PR

1. Read the descriptor and rights statement before running anything. Establish creator, license, provenance and reference rights. The submitting person's assertion is evidence to review, not a substitute for resolving a visible conflict.
2. Compare the thumbnail with the submitted bytes. Inspect an animated character in motion, a texture repeated, and sound from start to finish. Look for accidental logos, copied characters, bad seams, clipping, misleading scale or inconsistent rig names.
3. Confirm that tags and description make the file findable without overstating support. Say what the file contains, likely uses, style, rig/clip requirements, and what is absent.
4. Inspect CI: metadata/checksums, unit tests, decoded glTF validation, generated-doc link checks and browser flows. CI executes contributed code only in a read-only PR context; never switch to `pull_request_target` to make an untrusted workflow convenient.
5. Review code and generator changes as code. Do not automatically run contributed scripts on a maintainer machine to inspect a binary.
6. Merge after rights and quality review. Credit contributors; describe compatibility changes in `CHANGELOG.md`.

## Local checks

```sh
npm ci
npm run build
npm test
npm run verify
npm run validate:gltf
npm run check:links
npx playwright install chromium
npm run test:browser
npm run format:check
```

`validate:gltf` decodes Meshopt and converts unsupported compact texture/geometry extensions in memory before passing each GLB to the Khronos validator. Errors fail; warnings remain diagnostics. It does not establish legal rights or artistic quality. The browser suite tests real pages, animated previews, pack contents/credits/checksums and narrow viewports. Native-engine checks in `examples/import-checks` are optional local checks; report exactly which file/version was tested.

## Releases and deployment

The GitHub Actions workflow validates pull requests and publishes an inspectable site artifact. A separate Windows job verifies the catalog and tooling tests. Only trusted pushes to `main` can deploy to Pages after both jobs pass. Public deployment includes `catalog-info.json` with the commit used by browser lockfiles. Keep the generated catalog, schemas and documentation committed; `dist/` stays ignored.

For a release, update package version/lock and changelog, run required checks, review changed source/binary files, then publish through the normal maintainer merge process. Confirm the Pages run succeeded and verify one live catalog entry, download hash, pack and guide. Tag only the tested release commit. A rollback should revert the faulty change through the same pipeline so the catalog and media remain consistent.

Use the branch controls described in [governance](../GOVERNANCE.md). `CODEOWNERS` alone is not enforcement. With one maintainer, requiring another person's approval would prevent normal self-authored changes; introduce that requirement when there is a second trusted maintainer. Required status checks can still protect every PR.

## Dependency and format maintenance

Dependencies are locked; use `npm ci` in CI and pin vendored browser libraries with their license. Review dependency updates before merging. Dependabot proposes npm and GitHub Actions updates weekly. Do not auto-merge runtime/importer changes without the relevant tests. Re-run conversion and browser checks when updating Three.js, glTF Transform, decoders or image libraries.

Discuss large binaries, additional formats or licenses in an issue first. Budget the download and review cost; prefer focused PRs and useful mobile alternatives. Avoid introducing paid generation or API credentials into validation. Never include production databases, email hashes, private reference files or unreviewed personal images.

## Rights and security reports

Asset problems use the issue form. A credible rights dispute may require temporarily removing an item from the catalog while preserving a non-private explanation and prior provenance. Security issues should follow [SECURITY.md](../SECURITY.md). Record confirmed impact, affected versions and remediation; do not promise response times a volunteer team cannot meet.
