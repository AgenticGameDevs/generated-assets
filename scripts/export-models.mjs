import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { transform } from 'esbuild';
import { Mesh, MeshStandardMaterial } from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
// Node's Blob supports the browser exporter; supply only the FileReader methods it uses.
globalThis.FileReader = class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then(v=>{this.result=v;this.onloadend?.();}); }
  readAsDataURL(blob) { blob.arrayBuffer().then(v=>{this.result=`data:${blob.type};base64,${Buffer.from(v).toString('base64')}`;this.onloadend?.();}); }
};
const source = readFileSync('generators/skybound/props.ts','utf8');
const {code}=await transform(source,{loader:'ts',format:'esm'});
writeFileSync('generators/skybound/props.mjs',code);
const {pineGeo,cactusGeo,rockGeo}=await import('../generators/skybound/props.mjs');
mkdirSync('assets/skybound/models',{recursive:true});
for(const [name,geo] of [['pine',pineGeo(false)],['snow-pine',pineGeo(true)],['cactus',cactusGeo()],['boulder',rockGeo()]]){
 const material=new MeshStandardMaterial({vertexColors:true,roughness:1});
 const mesh=new Mesh(geo,material);mesh.name=name;
 const glb=await new GLTFExporter().parseAsync(mesh,{binary:true});
 writeFileSync(`assets/skybound/models/${name}.glb`,Buffer.from(glb));
 geo.dispose();material.dispose();console.log(name,glb.byteLength);
}
