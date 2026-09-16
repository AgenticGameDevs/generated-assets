import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
const status=document.getElementById('status');
try{
 const asset=new URLSearchParams(location.search).get('asset');
 const catalog=await fetch('catalog.json').then(r=>r.json());const entry=catalog.find(a=>(a.file??a.path)===asset&&['model','rig','animation'].includes(a.kind));if(!entry)throw Error('Choose a catalogued 3D asset.');
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);document.body.prepend(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,innerWidth/innerHeight,.01,1000);scene.add(new THREE.HemisphereLight(0xffffff,0x7d8971,2.7));const sun=new THREE.DirectionalLight(0xffffff,3);sun.position.set(3,6,4);scene.add(sun);
 const gltf=await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(asset);scene.add(gltf.scene);gltf.scene.updateMatrixWorld(true);
 const box=new THREE.Box3().setFromObject(gltf.scene);if(box.isEmpty())gltf.scene.traverse(n=>box.expandByPoint(n.getWorldPosition(new THREE.Vector3())));
 const center=box.getCenter(new THREE.Vector3()),extent=box.getSize(new THREE.Vector3()),radius=Math.max(extent.length()/2,.05),controls=new OrbitControls(camera,renderer.domElement);controls.target.copy(center);controls.enableDamping=true;
 function fit(){const angle=Math.min(THREE.MathUtils.degToRad(camera.fov/2),Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*camera.aspect));const distance=radius/Math.sin(angle)*1.15;camera.near=radius/100;camera.far=distance+radius*20;camera.position.copy(center).add(new THREE.Vector3(1,.45,1.5).normalize().multiplyScalar(distance));camera.updateProjectionMatrix();controls.update();}fit();
 if(!gltf.scene.getObjectByProperty('isSkinnedMesh',true)){const names=new Set(entry.technical?.skeleton?.map(j=>j.name)??gltf.parser.json.extras?.assetLibrary?.skeleton?.map(j=>j.name)??[]);gltf.scene.traverse(n=>{if(names.has(n.name))n.isBone=true;});}
 const skeleton=new THREE.SkeletonHelper(gltf.scene);skeleton.material.depthTest=false;skeleton.visible=entry.kind!=='model';scene.add(skeleton);
 const panel=document.createElement('div');panel.id='controls';document.body.append(panel);const button=(text,fn)=>{const b=document.createElement('button');b.textContent=text;b.onclick=fn;panel.append(b);return b;};
 let paused=false,mixer=null,active=null;
 if(gltf.animations.length){mixer=new THREE.AnimationMixer(gltf.scene);const select=document.createElement('select');select.setAttribute('aria-label','Animation clip');for(const clip of gltf.animations){const o=document.createElement('option');o.textContent=clip.name.replace('Fjordfall_','')+' · '+clip.duration.toFixed(2)+'s';o.value=clip.name;select.append(o);}select.value=gltf.animations.find(a=>/Idle/.test(a.name))?.name??gltf.animations[0].name;const play=()=>{active?.stop();active=mixer.clipAction(gltf.animations.find(a=>a.name===select.value));active.reset().play();};select.onchange=play;panel.append(select);play();const pause=button('Pause',()=>{paused=!paused;pause.textContent=paused?'Play':'Pause';});}
 const bones=button(skeleton.visible?'Hide skeleton':'Show skeleton',()=>{skeleton.visible=!skeleton.visible;bones.textContent=skeleton.visible?'Hide skeleton':'Show skeleton';});
 button('Reset view',fit);let last=performance.now();renderer.setAnimationLoop(now=>{const delta=Math.min((now-last)/1000,.05);last=now;if(!paused)mixer?.update(delta);controls.update();renderer.render(scene,camera);});
 addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;renderer.setSize(innerWidth,innerHeight);fit();});
 addEventListener('pagehide',()=>{renderer.setAnimationLoop(null);controls.dispose();gltf.scene.traverse(n=>{n.geometry?.dispose();for(const m of n.material?Array.isArray(n.material)?n.material:[n.material]:[]){for(const v of Object.values(m))if(v?.isTexture)v.dispose();m.dispose();}});skeleton.dispose();renderer.dispose();});
 status.textContent='Drag to orbit · Scroll to zoom';window.previewReady=true;
}catch(e){status.textContent=`Preview unavailable: ${e.message}. You can still download the original file.`;window.previewError=e.message;}
