---
name: contribute-game-assets
description: Prepare a new asset contribution to the Generated Assets community library, validate its metadata and preview, and open a focused pull request when the user requests submission. Use for adding models, rigs, animations, textures, artwork or sounds to this specific library.
---

# Contribute game assets

Repository: https://github.com/jonathanwmaddison/generated-assets . Read its current `CONTRIBUTING.md`, `GOVERNANCE.md`, `schemas/asset.schema.json` and PR template from the checkout before preparing a submission. This skill is portable; all contribution rules live in the repository.

1. Inspect the asset and establish who created it, its source workflow, and redistribution rights—including supplied reference images. Acceptable asset licenses are CC0 or CC BY 4.0. Do not relabel a third-party asset or assume a generator subscription permits standalone redistribution. Record uncertainty and keep unresolved files out of a public PR.
2. Work on a feature branch in a clean clone/fork. Preserve unrelated work. Use a stable ID `collection/kind/slug`; `kind` is the path segment `models`, `rigs`, `animations`, `tex`, `ui`, or `sfx`. Retain the same ID for revisions and discuss breaking replacements first.
3. Fill an asset descriptor using `examples/submission.json`. Supply the actual creator and license, a useful description and search tags, provenance, and candid technical limitations. Use a rendered preview for GLB submissions; do not substitute concept art or a different asset. Keep scene units and tiling unverified unless measured.
4. Import with `npm run new-asset -- --metadata /path/submission.json --file /path/asset.glb --preview /path/preview.png` (omit preview for images and sounds). Run `npm ci`, `npm run build`, `npm test`, and `npm run verify`. Inspect the gallery at desktop and mobile sizes, relevant animations/texture repetition, or listen to the full audio clip. Automated checks cannot certify ownership or visual quality.
5. Review `git diff` and the staged file list. Include the descriptor, binary, thumbnail and regenerated catalog; exclude secrets, private saves, reference files with unconfirmed rights, build output and dependencies. A source recipe is helpful only if its dependencies and regeneration steps are explained.
6. If the user asked to submit, use GitHub CLI to fork if needed, push the branch and open a PR against `jonathanwmaddison/generated-assets:main`. Follow `.github/pull_request_template.md`; name the assets, licenses, source methods, rights basis, validation and known limitations. Use `gh pr create --body-file` for the prepared description. If the request was only to prepare a contribution, stop with the reviewable local branch instead.

Wait for maintainers to review provenance and quality. Fix relevant failed checks; do not weaken validation to accept an asset, merge your own PR without maintainer authority, or run deployment from an untrusted contribution. Do not send unrelated messages or seek external permissions on the user's behalf.
