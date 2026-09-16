# A small sound effect from code

**Goal:** create a short UI confirmation sound without a sample library, then make a deliberate variation and explain it. The included Node script uses basic additive synthesis and writes a mono 16-bit PCM WAV. It requires no audio API key or extra dependencies.

## Run the recipe

From a checkout with Node 22+:

```sh
node examples/make-ui-sound.mjs /path/to/new-confirm.wav
```

The output path must be new. The script refuses to overwrite a file. It writes a 0.18-second signal at 22,050 Hz, with a rising pitch, a quiet second harmonic and an envelope that starts and ends at zero. These values make the recipe easy to inspect; they are not a guarantee that the result fits every game's audio style.

Read [the source](../examples/make-ui-sound.mjs) before adapting it. No existing catalog file is replaced and running the example does not submit anything to the library.

## What the controls do

- **Pitch** sets the main tone. The example moves smoothly from 660 Hz toward 990 Hz; changing both values shifts its overall character.
- **Duration** determines how much time the gesture occupies. A confirmation can be brief, while a reward might need a different structure entirely.
- **Harmonic level** adds a quieter tone above the fundamental. More of it can make the effect brighter and less soft.
- **Envelope** fades the signal in and out. Abrupt sample boundaries can click; a smooth envelope gives you a controlled start and tail.
- **Gain** leaves headroom. The script bounds the mixture before writing PCM, but clipping tests cannot decide whether a sound is pleasant.

Change one parameter at a time and give each candidate a meaningful name. Keep the recipe or a small diff alongside the exported WAV so another person can reproduce the variation.

## Listen in context

Start at a comfortable volume. Listen to the whole file, then play it repeatedly at the cadence your UI might trigger it. Check for an unintended click, an abrupt tail, fatigue from repeated playback, and masking against dialogue or music. Try a small speaker and headphones if those are relevant to your game.

This example is a one-shot, not a seamless loop. If you make a loop, check the boundary both visually and by repeated playback. Do not infer a seamless loop merely because a player has a loop button.

## Share the effect and its recipe

Describe the audible purpose and character: “A short rising two-tone UI confirmation, mono PCM, intended as a one-shot.” Add useful tags such as `ui`, `confirmation`, `short` and `synthesized`. Record the code source and changed parameters, choose an accepted media license for a contribution you have rights to share, and include honest usage notes.

The script is MIT-licensed as repository code. Media contributions carry their own per-file license; do not infer a third-party sample's license from the script that processed it. If you add recordings or generator output, establish whether standalone redistribution is allowed before submitting it.

Use [the contribution flow](../CONTRIBUTING.md) for your WAV and [the recipe template](RECIPE_TEMPLATE.md) for a walkthrough. A small set of distinct UI functions is more useful than many nearly indistinguishable exports.
