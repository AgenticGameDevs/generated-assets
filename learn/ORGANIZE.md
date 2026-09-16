# Organize an asset library people can use

A directory of files becomes useful when someone can answer: what is this, where did it come from, can I use it, and what does it require? Start with those questions. The library's folders, metadata and packs support them without making a particular game the organizing principle.

## Give each asset a lasting home

A **collection** is a namespace for related work. It can describe a creator's contribution, a coherent art set or an experiment: `studio-props`, `painted-materials` or `ui-sounds`. Choose a name with room for additions. A collection does not have to be named after a game.

An **asset ID** identifies one reusable item, such as `studio-props/models/wooden-crate`. Its display name and description can improve without breaking that reference. Keep compatible revisions under the same ID; use a new ID for a materially different replacement or incompatible rig.

```text
assets/studio-props/models/wooden-crate.glb
metadata/studio-props/models/wooden-crate.json
thumbnails/studio-props-wooden-crate.png
```

The source descriptor owns the context. The build inspects the file and generates catalog fields such as size, checksum, required extensions and animation names. Edit `metadata/`, then rebuild; do not maintain a second hand-written catalog.

## Describe the file, not just the idea

“Wooden crate” is a name. A useful description adds what a developer will see and what is available: “A painted low-poly wooden crate with a separate lid and embedded color texture. Static prop with no collider; scale has not been measured.”

Use tags for complementary search terms: object (`crate`), material (`wood`), style (`low-poly`) and role (`storage`, `prop`). Technical tags such as `rigged`, `animated` and joint/clip counts come from file inspection. Add action tags where useful, but use a real `usage.rigTarget` for compatibility rather than relying on a word like `humanoid`.

Keep provenance separate from the description. A creator's name, source method, generator/version where known, rights to references and a recipe explain how the file came to exist. A usage note explains an integration limit. Mixing everything into a filename makes both search and maintenance harder.

## Use variants deliberately

Create a separate asset ID when a variant is useful to download independently: a smaller texture, a different color treatment, a static prop versus an animated version. Describe the difference and keep comparable tags so people can find both. Do not append `final-final` or a date just to avoid deciding which version should be used.

For a rig family, use the same target-rig ID only where that compatibility is intended and reviewed. Geometry that happens to look similar is not enough. Preserve the existing license and explain modifications when deriving one contribution from another.

## Group by use without duplicating files

A **pack** references asset IDs already in the catalog. It can mix collections to solve a small problem: a handful of UI sounds, a tabletop prop set or a compatible character and motion set. Give it a purpose, a description and limitations. `packs.json` is the source for reviewed packs; validation checks the referenced IDs and download budget.

A **selection** is a personal or temporary group made in the gallery. Add files, download the ZIP with credits, or share its link. Use a lockfile when the exact bytes matter. A share link keeps IDs; a release-pinned lockfile keeps versions.

## Keep working files and published files distinct

Retain editable masters and recipes where you can maintain them, and submit only material whose rights allow sharing. A clean runtime export should not bring private game saves, unrelated source files or personal reference images into a public collection. The submitted preview should show the exact export.

To add a file here, use [the contribution flow](../CONTRIBUTING.md). To automate discovery or imports, use [the catalog contract](../docs/CATALOG.md). The structure also works as a local organization pattern; the bundled public download helper remains configured for this community library.
