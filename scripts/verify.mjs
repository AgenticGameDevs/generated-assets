import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const {assets}=JSON.parse(fs.readFileSync('manifest.json'));
const seen=new Set();
for(const a of assets){
 assert(!seen.has(a.path),`Duplicate ${a.path}`);seen.add(a.path);
 assert(!a.path.includes('..')&&!a.path.startsWith('/'));
 const b=fs.readFileSync(a.path);
 assert.equal(b.length,a.bytes,a.path);
 assert.equal(crypto.createHash('sha256').update(b).digest('hex'),a.sha256,a.path);
 assert(['CC-BY-4.0','CC0-1.0','MIT'].includes(a.license));
 if(a.path.endsWith('.glb')){
  assert.equal(b.toString('ascii',0,4),'glTF');assert.equal(b.readUInt32LE(4),2);assert.equal(b.readUInt32LE(8),b.length);
  const j=JSON.parse(b.toString('utf8',20,20+b.readUInt32LE(12)));
  assert(j.meshes?.length>0);for(const x of [...j.buffers??[],...j.images??[]])assert(!x.uri||x.uri.startsWith('data:'),'External dependency '+a.path);
 }
}
const catalog=JSON.parse(fs.readFileSync('catalog.json'));
assert.equal(catalog.length,assets.filter(a=>a.path.startsWith('assets/')).length);
for(const row of catalog)assert(seen.has(row.path));
for(const name of fs.readdirSync('assets/fjordfall/sfx'))assert(['church_bell.mp3','flock_bells.mp3'].includes(name));
console.log(`Verified ${assets.length} manifest records and ${catalog.length} gallery assets.`);
