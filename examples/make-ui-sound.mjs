// Original procedural example. MIT, like the repository's other code.
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export function makeUISound() {
  const sampleRate = 22050,
    seconds = 0.18,
    count = Math.round(sampleRate * seconds);
  const startHz = 660,
    endHz = 990,
    gain = 0.3;
  const wav = Buffer.alloc(44 + count * 2);
  wav.write('RIFF', 0);
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write('WAVEfmt ', 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(sampleRate, 24);
  wav.writeUInt32LE(sampleRate * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write('data', 36);
  wav.writeUInt32LE(count * 2, 40);
  let phase = 0;
  for (let i = 0; i < count; i++) {
    const position = i / (count - 1);
    phase += (2 * Math.PI * (startHz + (endHz - startHz) * position)) / sampleRate;
    const envelope = Math.sin(Math.PI * position) ** 2;
    const sample = (gain * envelope * (Math.sin(phase) + 0.2 * Math.sin(phase * 2))) / 1.2;
    wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, sample)) * 32767), 44 + i * 2);
  }
  return wav;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const [output, ...extra] = process.argv.slice(2);
  if (!output?.endsWith('.wav') || extra.length) {
    console.error('Usage: node examples/make-ui-sound.mjs /path/to/new-confirm.wav');
    process.exitCode = 1;
  } else {
    try {
      await fs.writeFile(output, makeUISound(), { flag: 'wx' });
      console.log(
        `Created ${output}: 0.18s, mono PCM, 22050 Hz. Listen and document your changes before contributing.`,
      );
    } catch (error) {
      console.error(error.message);
      process.exitCode = 1;
    }
  }
}
