# Generated Assets

**An open library and toolkit for organizing, discovering and sharing game assets.** Keep models, textures, artwork, sounds, rigs and animations together with the descriptions, tags, provenance and licenses that make them useful to another developer.

[Browse assets](https://agenticgamedevs.github.io/generated-assets/) · [Learn to make assets](learn/README.md) · [Organize a collection](learn/ORGANIZE.md) · [Contribute](CONTRIBUTING.md) · [Agent skills and MCP](AGENTS.md)

This is a shared resource for developers and creators, hosted by [AgenticGameDevs](https://github.com/AgenticGameDevs). Collections can come from an artist, a material study, a tool experiment or a game. Authored, procedural and AI-assisted work is welcome. You do not need to work on an existing project or match its art style to contribute.

## Find, organize, reuse

- **Find the right file.** Search descriptions and tags; filter by type, collection, license, animation and size. Preview models, textures and sounds before choosing them.
- **Keep context attached.** Every asset has an individual descriptor, creator credit, source information, technical details and a checksum. Stable IDs make assets easy to reference from tools and projects.
- **Organize useful sets.** Collections give assets a lasting home. Curated packs group existing IDs for a use case; your own selection can mix collections without duplicating source files.
- **Share reproducible downloads.** Export a ZIP with files, metadata, credits and a lockfile pinned to the deployed commit. Share a selection link with a teammate or restore a lockfile through the CLI.
- **Use it from your tools.** The JSON catalog, portable agent skill and local read-only MCP server expose the same assets. [Integration contract](docs/CATALOG.md).

The [usage guide](docs/GUIDE.md) covers engine imports, animation compatibility, textures, audio and attribution. It includes a runnable Three.js example and a GLB converter for importers without Meshopt/WebP support. Read each file's limitations; available animation or a successful import does not establish scale, collision or gameplay behavior.

## Help grow the library

Start with one useful contribution: a prop, a material variant, a short sound, an animation, better metadata, or a recipe that another creator can follow. Create your own collection when the work needs one. You keep creator credit; maintainers review rights, metadata and quality through pull requests.

[Make your first contribution](CONTRIBUTING.md) or use the [contribution skill](skills/contribute-game-assets/SKILL.md). A focused submission is easier to review and improve than an unexplained folder of outputs.

The [learning hub](learn/README.md) has practical guides for texture sets, reusable 3D props and procedural sound effects. Share the process along with the result: prompts or parameters, export decisions, checks, known limitations, and what someone could change next. Use the [recipe template](learn/RECIPE_TEMPLATE.md) to contribute a guide or short walkthrough.

For questions, ideas and examples of your work, use [Discussions](https://github.com/AgenticGameDevs/generated-assets/discussions). [Community guidance](GOVERNANCE.md) explains review and stewardship.

## Work with the repository

```sh
git clone https://github.com/AgenticGameDevs/generated-assets.git
cd generated-assets
npm start
```

Open http://127.0.0.1:4178. Browsing locally requires Node 22+; the viewer and ZIP helper are vendored. Install dependencies for imports, conversion, validation and MCP:

```sh
npm ci
npm run build
npm test
npm run verify
```

Source media lives in `assets/`; editable descriptors live in `metadata/`; rendered previews live in `thumbnails/`. `catalog.json` is generated from those sources, and `packs.json` references existing IDs. [Organization guide](learn/ORGANIZE.md).

The public catalog and portable download tools target this community repository. You can keep a local clone and use its structure for your work, but a separate branded deployment needs its own repository/URL configuration; the current tooling is not a one-click private hosting service.

## Licenses and provenance

Media uses the open license in each asset's record: currently CC BY 4.0 or CC0. Keep the supplied attribution and note modifications. Code and documentation are MIT; vendored dependencies retain their own notices. See [LICENSE.md](LICENSE.md) for details and the founding collection's generator provenance.

Source method is recorded per asset. Tool choice does not establish quality or redistribution rights. Contributors must be able to share both the output and any included third-party material under the stated license. Unresolved files stay outside the public catalog; historic exclusions are recorded in [excluded.json](excluded.json).

## Origins and examples

The initial collection was contributed from Fjordfall and SKYBOUND. They are examples of assets used in real projects, not requirements for new collections. [Play Fjordfall](https://fjordfall.fly.dev) for a deployed game made with some of these files, or read the [founding collection's workflow notes](workflows/README.md).

## Maintain and extend

See the [maintenance guide](docs/MAINTAINING.md), [catalog API and versioning](docs/CATALOG.md), [changelog](CHANGELOG.md), and [security reporting](SECURITY.md). Pull requests run metadata, checksum, unit, browser, format, link and glTF checks, with separate Windows tooling verification. The gallery deploys after required checks pass.
