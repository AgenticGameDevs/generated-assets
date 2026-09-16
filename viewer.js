import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
const status = document.getElementById('status');
try {
  const asset = new URLSearchParams(location.search).get('asset');
  const catalog = await fetch('catalog.json').then((r) => r.json());
  const entry = catalog.find(
    (a) => a.file === asset && ['model', 'rig', 'animation'].includes(a.kind),
  );
  if (!entry) throw Error('Choose a catalogued 3D asset.');
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  document.body.prepend(renderer.domElement);
  const scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(35, innerWidth / innerHeight, 0.01, 1000);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x7d8971, 2.7));
  const sun = new THREE.DirectionalLight(0xffffff, 3);
  sun.position.set(3, 6, 4);
  scene.add(sun);
  const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(asset);
  scene.add(gltf.scene);
  gltf.scene.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(gltf.scene);
  if (box.isEmpty())
    gltf.scene.traverse((n) => box.expandByPoint(n.getWorldPosition(new THREE.Vector3())));
  const center = box.getCenter(new THREE.Vector3()),
    radius = Math.max(box.getSize(new THREE.Vector3()).length() / 2, 0.05);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(center);
  const render = () => renderer.render(scene, camera);
  function fit() {
    const angle = Math.min(
      THREE.MathUtils.degToRad(camera.fov / 2),
      Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect),
    );
    const distance = (radius / Math.sin(angle)) * 1.2;
    camera.near = radius / 100;
    camera.far = distance + radius * 20;
    camera.position
      .copy(center)
      .add(new THREE.Vector3(1, 0.45, 1.5).normalize().multiplyScalar(distance));
    camera.updateProjectionMatrix();
    controls.update();
    render();
  }
  if (!gltf.scene.getObjectByProperty('isSkinnedMesh', true)) {
    const names = new Set(entry.technical.skeleton.map((j) => j.name));
    gltf.scene.traverse((n) => {
      if (names.has(n.name)) n.isBone = true;
    });
  }
  const skeleton = new THREE.SkeletonHelper(gltf.scene);
  skeleton.material.depthTest = false;
  skeleton.visible = entry.kind !== 'model';
  scene.add(skeleton);
  const panel = document.createElement('div');
  panel.id = 'controls';
  document.body.append(panel);
  const button = (text, fn) => {
    const b = document.createElement('button');
    b.textContent = text;
    b.onclick = fn;
    panel.append(b);
    return b;
  };
  let paused = matchMedia('(prefers-reduced-motion: reduce)').matches,
    mixer = null,
    active = null,
    scrub = null,
    last = performance.now();
  function updateLoop() {
    last = performance.now();
    renderer.setAnimationLoop(
      mixer && !paused && !document.hidden
        ? (now) => {
            mixer.update(Math.min((now - last) / 1000, 0.05));
            last = now;
            if (scrub) scrub.value = active.time;
            render();
          }
        : null,
    );
    render();
  }
  if (gltf.animations.length) {
    mixer = new THREE.AnimationMixer(gltf.scene);
    const select = document.createElement('select');
    select.setAttribute('aria-label', 'Animation clip');
    for (const clip of gltf.animations) {
      const option = document.createElement('option');
      option.textContent =
        clip.name.replace('Fjordfall_', '') + ' · ' + clip.duration.toFixed(2) + 's';
      option.value = clip.name;
      select.append(option);
    }
    select.value =
      gltf.animations.find((a) => /Idle/.test(a.name))?.name ?? gltf.animations[0].name;
    const play = () => {
      active?.stop();
      const clip = gltf.animations.find((a) => a.name === select.value);
      active = mixer.clipAction(clip);
      active.reset().play();
      if (scrub) {
        scrub.max = clip.duration;
        scrub.value = 0;
      }
      mixer.update(0);
      updateLoop();
    };
    select.onchange = play;
    panel.append(select);
    const pause = button(paused ? 'Play' : 'Pause', () => {
      paused = !paused;
      pause.textContent = paused ? 'Play' : 'Pause';
      updateLoop();
    });
    const speed = document.createElement('select');
    speed.setAttribute('aria-label', 'Playback speed');
    for (const rate of [0.25, 0.5, 1, 2]) {
      const option = document.createElement('option');
      option.value = rate;
      option.textContent = rate + '×';
      speed.append(option);
    }
    speed.value = '1';
    speed.onchange = () => {
      mixer.timeScale = Number(speed.value);
    };
    panel.append(speed);
    scrub = document.createElement('input');
    scrub.type = 'range';
    scrub.min = 0;
    scrub.step = 0.001;
    scrub.setAttribute('aria-label', 'Animation time');
    scrub.oninput = () => {
      paused = true;
      pause.textContent = 'Play';
      active.time = Number(scrub.value);
      mixer.update(0);
      updateLoop();
    };
    panel.append(scrub);
    play();
  }
  if (entry.technical.jointCount) {
    const bones = button(skeleton.visible ? 'Hide skeleton' : 'Show skeleton', () => {
      skeleton.visible = !skeleton.visible;
      bones.textContent = skeleton.visible ? 'Hide skeleton' : 'Show skeleton';
      render();
    });
  }
  if (entry.technical.meshes) {
    let wire = false;
    button('Wireframe', () => {
      wire = !wire;
      gltf.scene.traverse((n) => {
        for (const m of n.material ? (Array.isArray(n.material) ? n.material : [n.material]) : [])
          m.wireframe = wire;
      });
      render();
    });
  }
  button('Reset view', fit);
  controls.addEventListener('change', render);
  fit();
  updateLoop();
  addEventListener('resize', () => {
    camera.aspect = innerWidth / innerHeight;
    renderer.setSize(innerWidth, innerHeight);
    fit();
  });
  document.addEventListener('visibilitychange', updateLoop);
  renderer.domElement.addEventListener('webglcontextlost', () => {
    status.textContent = 'Graphics context lost. Reload the preview to continue.';
  });
  addEventListener(
    'pagehide',
    () => {
      renderer.setAnimationLoop(null);
      controls.dispose();
      mixer?.stopAllAction();
      mixer?.uncacheRoot(gltf.scene);
      const resources = new Set();
      gltf.scene.traverse((n) => {
        if (n.geometry) resources.add(n.geometry);
        for (const m of n.material ? (Array.isArray(n.material) ? n.material : [n.material]) : []) {
          resources.add(m);
          for (const v of Object.values(m)) if (v?.isTexture) resources.add(v);
        }
      });
      for (const resource of resources) resource.dispose();
      skeleton.dispose();
      renderer.dispose();
    },
    { once: true },
  );
  status.textContent = 'Drag to orbit · Scroll to zoom';
  window.previewReady = true;
} catch (e) {
  status.textContent = `Preview unavailable: ${e.message}. You can still download the original file.`;
  window.previewError = e.message;
}
