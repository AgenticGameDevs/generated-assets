---
name: game-asset-pipeline
description: Prepare reusable game models, textures, UI artwork and procedural audio with provenance, compact exports and a browsable catalog. Use when generating or packaging game assets, especially from Meshy, image generators, Blender or synthesis code.
---

# Game asset pipeline

Work within the user's requested asset and publishing scope. Choose the existing game-native representation where practical: procedural code for controllable geometry or synthesis, a bitmap generator for new raster artwork, and a mesh pipeline for imported 3D.

Read [the collection workflows](../../workflows/README.md) for the relevant image, model, audio or publication path. Available historic prompts are under `provenance/fjordfall/`; current file provenance and license decisions live in `manifest.json` and `excluded.json`. Preserve the user's model choice; verify current availability before new API requests rather than silently substituting a historical model name.

For image work, preserve the master and exact recipe. Keep alpha and color-space contracts explicit. Do not infer a normal map from albedo. Review tile seams and real-scale application use before installing an export.

For rigged meshes, preserve canonical hierarchy, inverse binds and existing animation curves when replacing a body. Normalize the four retained weights per vertex. Validate the packed GLB and relevant contact poses, not only a static authoring viewport. Keep consumer decoder requirements documented.

For audio, distinguish synthesis with no external samples from generator outputs whose distribution terms may restrict standalone sample libraries. Do not assign a blanket open license based only on a paid subscription or the ability to ship a game.

When packaging, publish only assets whose provenance supports the requested reuse. Sanitize generation receipts; retain project-relative paths, descriptive sources, hashes and prompts, not credentials, signed URLs or player data. Ask about reference rights only where missing information affects a particular asset; continue packaging the independent cleared assets.

After changing the collection, regenerate its catalog and run the verifier. Inspect actual image/model previews and audio playback. Report exclusions and any remaining publishing blocker explicitly. Do not imply that copied procedural code is an AI image/model output, or that documented workflows ran historically through this newly packaged skill.
