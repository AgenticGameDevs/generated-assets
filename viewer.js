import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
const status=document.getElementById('status');
try{
 const asset=new URLSearchParams(location.search).get('asset');
 if(!/^assets\/(fjordfall|skybound)\/models\/[\w-]+\.glb$/.test(asset??''))throw Error('Choose a model from the gallery.');
 const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(innerWidth,innerHeight);document.body.prepend(renderer.domElement);
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(35,innerWidth/innerHeight,0.01,1000);
 scene.add(new THREE.HemisphereLight(0xffffff,0x7d8971,2.7));const sun=new THREE.DirectionalLight(0xffffff,3);sun.position.set(3,6,4);scene.add(sun);
 const loader=new GLTFLoader();loader.setMeshoptDecoder(MeshoptDecoder);
 const gltf=await loader.loadAsync(asset);scene.add(gltf.scene);gltf.scene.updateMatrixWorld(true);
 const box=new THREE.Box3().setFromObject(gltf.scene),center=box.getCenter(new THREE.Vector3()),extent=box.getSize(new THREE.Vector3());
 const radius=Math.max(extent.length()/2,0.05),distance=radius/Math.sin(THREE.MathUtils.degToRad(camera.fov/2))*1.13;
 camera.near=radius/100;camera.far=distance+radius*20;camera.updateProjectionMatrix();camera.position.copy(center).add(new THREE.Vector3(1,.65,1.2).normalize().multiplyScalar(distance));
 const controls=new OrbitControls(camera,renderer.domElement);controls.target.copy(center);controls.enableDamping=true;controls.update();
 let mixer=null;if(gltf.animations.length){mixer=new THREE.AnimationMixer(gltf.scene);mixer.clipAction(gltf.animations.find(a=>/Idle/.test(a.name))??gltf.animations[0]).play();}
 const clock=new THREE.Clock();renderer.setAnimationLoop(()=>{mixer?.update(Math.min(clock.getDelta(),.05));controls.update();renderer.render(scene,camera);});
 addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
 status.textContent=`Drag to orbit · Scroll to zoom${gltf.animations.length?' · Animated':''}`;window.previewReady=true;
}catch(e){status.textContent=`Preview unavailable: ${e.message}. The original file can still be downloaded.`;window.previewError=e.message;}
