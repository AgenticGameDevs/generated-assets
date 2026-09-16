import fs from 'node:fs';
import crypto from 'node:crypto';
const manifest=JSON.parse(fs.readFileSync('manifest.json'));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
for(const folder of ['models','sfx'])for(const name of fs.readdirSync(`assets/skybound/${folder}`)){
 const path=`assets/skybound/${folder}/${name}`,b=fs.readFileSync(path);
 const row={path,sourceProject:'skybound',sourcePath:folder==='models'?'src/world/props.ts':'godot/scripts/sfx.gd',bytes:b.length,sha256:hash(b),license:'CC-BY-4.0',provenance:folder==='models'?'Original procedural geometry exported without changing the shapes.':'Original Godot synthesis, fixed seed 20260916, exported as PCM WAV; no external samples.'};
 const i=manifest.assets.findIndex(a=>a.path===path);if(i<0)manifest.assets.push(row);else manifest.assets[i]=row;
}
manifest.assets.sort((a,b)=>a.path.localeCompare(b.path));
fs.writeFileSync('manifest.json',JSON.stringify(manifest,null,2)+'\n');
const media=manifest.assets.filter(a=>a.path.startsWith('assets/'));
fs.writeFileSync('catalog.json',JSON.stringify(media.map(a=>({...a,name:a.path.split('/').at(-1).replace(/\.[^.]+$/,'').replaceAll('_',' ').replaceAll('-',' '),kind:a.path.endsWith('.glb')?'model':/\.(mp3|wav)$/.test(a.path)?'sound':a.path.includes('/ui/')?'artwork':'texture'})),null,2)+'\n');
console.log(`${media.length} gallery assets`);
