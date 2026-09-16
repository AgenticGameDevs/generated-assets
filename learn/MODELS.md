# From concept to reusable 3D prop

**Goal:** publish one small static prop with an inspectable silhouette, a self-contained GLB and enough context to use it in a different project. This guide works for modeled, procedural and AI-assisted starting points. It does not require the visual style of an existing collection.

## Scope a small object

A storage crate, planter or stool is a useful first project. Define its role and main proportions. Decide whether parts need to be separate, whether the camera will get close, and whether the object needs a backside and underside. Set a target budget appropriate to that use; a triangle count alone is not a quality target.

Example brief for a source mesh:

```text
A single low-poly wooden storage crate with a separate flat lid.
Simple readable silhouette, rounded worn edges and restrained painted color.
Closed sides and underside, no ground plane, surroundings, text or branding.
An isolated prop intended to be viewed from all directions.
```

This is a new example brief, not a claimed generation result. A model generator may ignore topology, separation or scale instructions. Inspect what it actually produces. Keep editable source and any references you have rights to use.

## Inspect before optimizing

Open the result in your modeling tool. Rotate it through all sides and inspect surfaces at likely camera distances. Check for unwanted geometry, holes, detached fragments, stretched UVs, texture seams, material mistakes and an origin that makes placement awkward. If you change transforms, check the exported result again rather than assuming the editor's display matches it.

Give the prop a deliberate up axis and scale. State what was measured and what is merely intended. Test in a neutral scene with another object of known dimensions. If it will be placed on a floor or shelf, check where its origin and base sit.

Reduce detail where it will not be visible. Compare the silhouette and material appearance before and after simplification or texture resizing. A low-resolution texture can be sufficient for one use and unsuitable for another; explain the intended viewing distance instead of promising universal performance.

## Export one reusable file

Export GLB with embedded resources. Reopen the export in a separate viewer and check materials, alpha, scale and orientation. A preview rendered from the authoring scene is insufficient if the export differs. Use the exported file for the catalog thumbnail.

Some compression choices require importer extensions. Keep that requirement visible in metadata, preserve the editable master, and test with your intended loader. The library inspects required extensions and provides a [conversion/import guide](../docs/GUIDE.md) for compact files. Do not add a collider, rig or animation tag when those features are only planned.

For animated submissions, add an explicit target-rig contract, inspect clip transitions and extreme poses, and document root motion and loops only after checking them. Start with a static prop if those tasks are outside your current scope.

## Turn the result into a contribution

Create a descriptor with a clear description, tags, source method and redistribution basis. For example: “Painted low-poly storage crate with a separate lid, embedded color texture and no collider. Static GLB; scale checked against a one-metre reference.” Only include that last claim if you performed the check.

Follow [CONTRIBUTING.md](../CONTRIBUTING.md) to import the file and preview, build the catalog and run checks. Add a short [recipe](RECIPE_TEMPLATE.md) if the workflow is worth repeating. A complementary prop or documented mobile variant is a useful next contribution after the first one is reviewed.
