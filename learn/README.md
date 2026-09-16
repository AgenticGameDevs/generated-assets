# Make assets. Share what you learn.

The library grows when people contribute both useful files and the knowledge behind them. These guides help you turn a small idea into something another developer can find, inspect, adapt and credit. You can use hand-authored work, procedural tools or a generative workflow.

## Choose a starting point

| You want to…                                     | Start here                                            | What you will prepare                                       |
| ------------------------------------------------ | ----------------------------------------------------- | ----------------------------------------------------------- |
| Turn a folder of assets into a useful collection | [Organize an asset library](ORGANIZE.md)              | Stable IDs, descriptions, tags, variants and reusable packs |
| Make a small set of related materials            | [Build a consistent texture set](TEXTURES.md)         | A material brief, checked images and documented exports     |
| Share a generated or modeled object              | [From concept to reusable 3D prop](MODELS.md)         | An inspected GLB, actual preview and honest technical notes |
| Make a small effect without a sample library     | [A sound effect from code](SOUNDS.md)                 | A runnable WAV recipe and a documented variation            |
| Share something you already made                 | [Contribute an asset](../CONTRIBUTING.md)             | One reviewed pull request with the file and its context     |
| Explain an approach that worked for you          | [Recipe and walkthrough template](RECIPE_TEMPLATE.md) | A short reproducible guide with evidence and limitations    |

The image and model prompts here are new illustrative briefs, not claims about how an existing catalog file was generated. The audio guide includes runnable source. Historical recipes and exports from the founding collections are kept separately in the [workflow case studies](../workflows/README.md).

## One useful asset is enough

Good first projects have a small surface area: one wooden crate, a two-size fabric texture, a short UI sound, or an animation with an explicit target rig. Define what another developer needs before making a large pack. Try the exported file in a small scene, check its metadata, then submit it for review.

A contribution can improve existing work, too. Explain a confusing license note, add a useful tag, check an animation seam, supply a smaller texture variant, or write down a reliable import procedure. Do not mark a property as verified unless you actually checked it.

## Share a process another person can repeat

Use the [template](RECIPE_TEMPLATE.md) for a guide or short post. Include the goal, tool/version, inputs you can share, prompt or code, cleanup/export steps, evidence, known limitations, and the next useful variation. Show the exported result rather than presenting concept art as if it were the asset.

Open a focused PR with the Markdown under `learn/`, link any included catalog assets by stable ID, and add the guide to this index. A new published article also needs an entry in `scripts/build-docs.mjs` and its output in `scripts/build-site.mjs`. Run the build and link checks described in [contributing](../CONTRIBUTING.md). The [contribution skill](../skills/contribute-game-assets/SKILL.md) helps with asset submissions; a guide-only PR follows the same review process with media fields marked not applicable.

Guides are reviewed for clarity and reproducibility. A published recipe is not a certification of a vendor, a promise about generation costs, or approval of every output. Record what was tested and leave unknowns visible. Keep private receipts, reference material you cannot share, API keys and signed download URLs out of the post.

[Discuss an idea](https://github.com/AgenticGameDevs/generated-assets/discussions) before a large project, or [propose a recipe](https://github.com/AgenticGameDevs/generated-assets/issues/new?template=recipe.yml). No particular game, aesthetic or generator is required.
