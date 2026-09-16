import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
const host = document.getElementById('scene'),
  status = document.getElementById('status');
try {
  const source = await new GLTFLoader()
    .setMeshoptDecoder(MeshoptDecoder)
    .loadAsync('../assets/fjordfall/models/traveller.glb');
  const scene = new THREE.Scene(),
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  host.append(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x63765d, 3));
  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(3, 5, 4);
  scene.add(light);
  const bounds = new THREE.Box3().setFromObject(source.scene),
    size = bounds.getSize(new THREE.Vector3()),
    center = bounds.getCenter(new THREE.Vector3());
  const mixers = [],
    characters = [];
  for (const [i, id] of ['left', 'right'].entries()) {
    // Clone the common ancestor so the skinned mesh and its bones stay together.
    const character = clone(source.scene);
    character.position.x += (i ? 1 : -1) * size.x;
    scene.add(character);
    characters.push(character);
    const mixer = new THREE.AnimationMixer(character);
    mixers.push(mixer);
    const select = document.getElementById(id);
    for (const clip of source.animations) {
      const option = document.createElement('option');
      option.value = clip.name;
      option.textContent = clip.name.replace('Fjordfall_', '');
      select.append(option);
    }
    select.value = i ? 'Fjordfall_Walk' : 'Fjordfall_Idle';
    let action;
    select.onchange = () => {
      action?.stop();
      action = mixer.clipAction(source.animations.find((c) => c.name === select.value));
      action.reset().play();
      mixer.update(0);
      renderer.render(scene, camera);
    };
  }
  const camera = new THREE.PerspectiveCamera(40, 1, 0.01, 1000),
    controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(center);
  const resize = () => {
    camera.aspect = host.clientWidth / host.clientHeight;
    const radius = Math.max(size.y, size.x * 3);
    camera.position.set(
      center.x,
      center.y + radius * 0.2,
      center.z + (radius * 1.8) / Math.min(1, camera.aspect),
    );
    camera.far = radius * 30;
    camera.updateProjectionMatrix();
    renderer.setSize(host.clientWidth, host.clientHeight);
    controls.update();
    renderer.render(scene, camera);
  };
  resize();
  for (const id of ['left', 'right']) document.getElementById(id).onchange();
  let paused = matchMedia('(prefers-reduced-motion: reduce)').matches,
    last = performance.now();
  const updateLoop = () => {
    last = performance.now();
    renderer.setAnimationLoop(
      paused || document.hidden
        ? null
        : (now) => {
            const dt = Math.min((now - last) / 1000, 0.05);
            last = now;
            for (const mixer of mixers) mixer.update(dt);
            renderer.render(scene, camera);
          },
    );
    document.getElementById('pause').textContent = paused ? 'Play' : 'Pause';
  };
  document.getElementById('pause').onclick = () => {
    paused = !paused;
    updateLoop();
  };
  updateLoop();
  controls.addEventListener('change', () => renderer.render(scene, camera));
  document.addEventListener('visibilitychange', updateLoop);
  addEventListener('resize', resize);
  addEventListener(
    'pagehide',
    () => {
      renderer.setAnimationLoop(null);
      for (const [i, mixer] of mixers.entries()) {
        mixer.stopAllAction();
        mixer.uncacheRoot(characters[i]);
      }
      controls.dispose();
      const resources = new Set();
      source.scene.traverse((n) => {
        if (n.geometry) resources.add(n.geometry);
        for (const m of n.material ? (Array.isArray(n.material) ? n.material : [n.material]) : []) {
          resources.add(m);
          for (const value of Object.values(m)) if (value?.isTexture) resources.add(value);
        }
      });
      for (const r of resources) r.dispose();
      renderer.dispose();
    },
    { once: true },
  );
  status.textContent =
    'Loaded: two independent 24-joint characters, nine clips each. Drag to orbit.';
  window.exampleReady = true;
} catch (e) {
  status.textContent = 'Example could not load: ' + e.message;
  window.exampleError = e.message;
}
