import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
export const sha256=b=>crypto.createHash('sha256').update(b).digest('hex');
export function containedFile(root,relative){
 const target=path.resolve(root,relative);if(!target.startsWith(path.resolve(root)+path.sep))throw Error('Path escapes collection');
 const actual=fs.realpathSync(target);if(actual!==target||!fs.statSync(actual).isFile())throw Error('Symlinks and non-files are not accepted');return actual;
}
export async function inspectAsset(root,a){
 const file=containedFile(root,a.file),bytes=fs.readFileSync(file);if(!bytes.length||bytes.length>25*1024*1024)throw Error(`${a.id}: file must be between 1 byte and 25 MiB`);
 let technical={format:path.extname(file).slice(1)};
 if(['model','rig','animation'].includes(a.kind)){
  if(bytes.toString('ascii',0,4)!=='glTF'||bytes.readUInt32LE(4)!==2||bytes.readUInt32LE(8)!==bytes.length||bytes.readUInt32LE(16)!==0x4e4f534a)throw Error(`${a.id}: invalid GLB 2.0`);
  const j=JSON.parse(bytes.toString('utf8',20,20+bytes.readUInt32LE(12)));if(a.kind==='model'&&!j.meshes?.length)throw Error(`${a.id}: no meshes`);
  if(a.kind==='animation'&&!j.animations?.length)throw Error(`${a.id}: no animation clips`);
  const joints=[...new Set((j.skins??[]).flatMap(s=>s.joints))];
  const skeleton=joints.length?joints.map(i=>({name:j.nodes[i].name??`Joint ${i}`,children:(j.nodes[i].children??[]).filter(n=>joints.includes(n)).map(n=>j.nodes[n].name??`Joint ${n}`)})):j.extras?.assetLibrary?.skeleton??[];
  if(a.kind==='rig'&&!skeleton.length)throw Error(`${a.id}: no rig joints or documented skeleton`);
  for(const x of [...j.buffers??[],...j.images??[]])if(x.uri&&!x.uri.startsWith('data:'))throw Error(`${a.id}: external GLB dependencies are not accepted`);
  let triangles=0,vertices=0;for(const m of j.meshes??[])for(const p of m.primitives){const n=j.accessors?.[p.indices??p.attributes.POSITION]?.count??0;vertices+=j.accessors?.[p.attributes.POSITION]?.count??0;triangles+=(p.mode??4)===4?n/3:[5,6].includes(p.mode)?Math.max(0,n-2):0;}
  const clips=(j.animations??[]).map((x,i)=>{const accessors=x.samplers.map(s=>j.accessors[s.input]);const start=Math.min(...accessors.map(a=>a.min?.[0]??0)),end=Math.max(...accessors.map(a=>a.max?.[0]??0));return {name:x.name??`Animation ${i+1}`,durationSeconds:Number((end-start).toFixed(3)),channels:x.channels.length};});
  technical={...technical,triangles:Math.round(triangles),vertices,meshes:j.meshes?.length??0,materials:j.materials?.length??0,rigged:Boolean(j.skins?.length),jointCount:skeleton.length,skeleton,animations:clips.map(c=>c.name),clips,extensions:j.extensionsRequired??[]};
 }else if(['texture','artwork'].includes(a.kind)){
  const m=await sharp(bytes,{limitInputPixels:4096*4096}).metadata();if(!m.width||!m.height||m.width>4096||m.height>4096)throw Error(`${a.id}: image exceeds 4096px`);technical={...technical,width:m.width,height:m.height,alpha:Boolean(m.hasAlpha)};
 }else if(technical.format==='wav'){
  if(bytes.toString('ascii',0,4)!=='RIFF'||bytes.toString('ascii',8,12)!=='WAVE')throw Error(`${a.id}: invalid WAV`);
  let rate,channels,byteRate,dataLength;for(let o=12;o+8<=bytes.length;){const chunk=bytes.toString('ascii',o,o+4),n=bytes.readUInt32LE(o+4);if(o+8+n>bytes.length)throw Error('Truncated WAV');if(chunk==='fmt '&&n>=16){channels=bytes.readUInt16LE(o+10);rate=bytes.readUInt32LE(o+12);byteRate=bytes.readUInt32LE(o+16);}if(chunk==='data')dataLength=n;o+=8+n+(n%2);}
  if(!byteRate||dataLength===undefined)throw Error('Missing WAV format/data');technical={...technical,sampleRate:rate,channels,durationSeconds:Number((dataLength/byteRate).toFixed(3))};
 }else if(technical.format==='mp3'){
  if(bytes.toString('ascii',0,3)!=='ID3'&&!(bytes[0]===255&&(bytes[1]&224)===224))throw Error('Invalid MP3 header');
 }else if(technical.format==='ogg'&&bytes.toString('ascii',0,4)!=='OggS')throw Error('Invalid Ogg header');
 if(a.preview){const m=await sharp(containedFile(root,a.preview)).metadata();if(!m.width||m.width>1600||m.height>1600)throw Error('Preview must be at most 1600px');}
 return {bytes:bytes.length,sha256:sha256(bytes),technical};
}
