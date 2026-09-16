import fs from 'node:fs';
import { validateBytes } from 'gltf-validator';
import { portableGLB } from './convert-model.mjs';
const assets = JSON.parse(fs.readFileSync('catalog.json'));
let warnings = 0,
  count = 0;
for (const a of assets.filter((a) => ['model', 'rig', 'animation'].includes(a.kind))) {
  // The Khronos validator does not decode Meshopt. Validate a decoded, unquantized
  // in-memory representation so animation, accessors and skins are actually checked.
  const bytes = await portableGLB(fs.readFileSync(a.file));
  const report = await validateBytes(bytes, { maxIssues: 200 });
  count++;
  warnings += report.issues.numWarnings;
  for (const warning of report.issues.messages.filter((m) => m.severity === 1))
    console.warn(`${a.id}: ${warning.code} ${warning.pointer ?? ''}`);
  if (report.issues.numErrors) {
    console.error(a.id, JSON.stringify(report.issues, null, 2));
    process.exitCode = 1;
  }
}
console.log(
  `Khronos validation: ${count} decoded GLBs; ${warnings} warnings. Warnings are diagnostics, errors block release.`,
);
