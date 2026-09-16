#!/usr/bin/env node
import fs from 'node:fs/promises';import path from 'node:path';import crypto from 'node:crypto';
const base='https://jonathanwmaddison.github.io/generated-assets/';
export async function verifiedDownload(a,directory,fetcher=fetch){
 if(!/^assets\/[a-z0-9-]+\/(models|rigs|animations|tex|ui|sfx)\/[a-z0-9_-]+\.(glb|png|webp|jpg|mp3|wav|ogg)$/.test(a.file)||!/^\w{64}$/.test(a.sha256)||!Number.isInteger(a.bytes)||a.bytes<1||a.bytes>25*1024*1024)throw Error('Invalid asset metadata');
 const r=await fetcher(new URL(a.file,base),{signal:AbortSignal.timeout(30000)});if(!r.ok)throw Error(`Download failed (${r.status})`);
 const reader=r.body.getReader(),chunks=[];let length=0;for(;;){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>a.bytes){await reader.cancel();throw Error('Download exceeds declared size');}chunks.push(value);}
 const b=Buffer.concat(chunks);if(b.length!==a.bytes||crypto.createHash('sha256').update(b).digest('hex')!==a.sha256)throw Error('Download checksum mismatch');
 await fs.mkdir(directory,{recursive:true});const target=path.join(directory,a.id.replaceAll('/','--')+path.extname(a.file));
 // Reserve both destinations first. Only files created by this call are removed on failure.
 const created=[];try{for(const p of [target,target+'.asset.json']){const h=await fs.open(p,'wx');created.push(p);await h.close();}await fs.writeFile(target,b);await fs.writeFile(target+'.asset.json',JSON.stringify(a,null,2)+'\n');}catch(e){await Promise.all(created.map(p=>fs.unlink(p)));throw e;}return target;
}
if(import.meta.url===new URL('file://'+path.resolve(process.argv[1]??'')).href){
 const [command,value,...args]=process.argv.slice(2);if(!['search','info','download'].includes(command))throw Error('Use search <keywords>, info <id>, or download <id> --out <directory>');
 const response=await fetch(base+'catalog.json',{signal:AbortSignal.timeout(15000)});if(!response.ok)throw Error(`Catalog unavailable (${response.status})`);const catalog=await response.json();
 if(command==='search'){const terms=(value??'').toLowerCase().split(/\s+/);console.log(JSON.stringify(catalog.filter(a=>terms.every(t=>`${a.name} ${a.description} ${a.tags.join(' ')}`.toLowerCase().includes(t))).slice(0,20),null,2));}
 else{const a=catalog.find(a=>a.id===value);if(!a)throw Error('Unknown asset ID');if(command==='info')console.log(JSON.stringify(a,null,2));else{if(args[0]!=='--out'||!args[1]||args.length!==2)throw Error('download requires --out <directory>');console.log(await verifiedDownload(a,args[1]));}}
}
