# Build a consistent texture set

**Goal:** make two or three related color textures that another developer can use together. Start with one material, prove the workflow, then make variants. This is an illustrative workflow; the example prompt below is not a historical recipe for a catalog asset.

## Write the material brief first

Decide the material, visual style, apparent feature size, target use, dimensions, transparency and byte budget. “Old wood” leaves most decisions open. “Muted painted timber boards for a stylized building, with restrained grain and no strong directional lighting” gives both a creator and a reviewer something to evaluate.

For a small exercise, choose dry timber, worn painted timber and a darker weathered variant. Keep board width, grain scale, palette range and contrast consistent. Use filenames and IDs that explain the difference. If the image is intended to tile, include that intent in the brief without claiming it already passes.

## An example generation prompt

```text
One square color texture of muted blue painted timber boards for a stylized game.
Straight-on orthographic view; board widths stay consistent across the image.
Restrained grain and small patches of worn paint; low contrast at a distance.
Even lighting, with no cast shadows, highlights, perspective, text or framing.
Designed to repeat in both directions, without a single prominent landmark.
Output an opaque color image; do not draw a material sphere or a preview scene.
```

Use this as a brief, not a guarantee. If working by hand, apply the same constraints while painting. If using a generator, keep the actual prompt, tool/model identifier, available seed or settings, and source/reference rights. Keep the lossless master before resizing or compression.

## Check the result where it will be used

View a repeated grid and inspect every boundary. Look for a continuous edge but also for obvious repeated knots, stains and alternating bands. A technically matching border can still look repetitive. Repair the master, repeat the view, and record what you checked.

Put the image on a flat surface in a simple scene. Check apparent detail size from both near and far away, under lighting that differs from the generation preview. A color texture should not be treated as a ready-made normal or roughness map. Build and check those maps separately if you need them.

Export a useful full-size version and, if it helps a real use case, a smaller variant. Inspect both after compression. PNG and WebP are accepted by this library; preserve alpha when the asset needs it. Disk size is not the same as runtime texture memory. The target engine's import and compression settings still matter; see [Godot's image-import guide](https://docs.godotengine.org/en/stable/tutorials/assets_pipeline/importing_images.html) for one engine's tradeoffs.

## Package the context

- Describe the material, style and variant without subjective quality claims.
- Tag material and use, such as `wood`, `painted`, `stylized` and `surface`.
- Record whether tiling was checked in `usage.seamlessVerified`; leave it false or absent if unverified.
- State any visible limits, such as repeating features or baked lighting you could not remove.
- Include the actual tool/source method and a recipe when sharing rights permit it.

The gallery's **Repeat texture** preview helps reviewers inspect your exported image. Submit one material first using [the contribution flow](../CONTRIBUTING.md), then propose a coherent pack as the set grows. A useful follow-up is a lower-resolution variant with a clear use case, not dozens of nearly identical outputs.
