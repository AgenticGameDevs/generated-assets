// Extracted from SKYBOUND src/world/props.ts; geometry unchanged. MIT.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
function colored(geo: THREE.BufferGeometry, r: number, g: number, b: number) {
  const count = geo.getAttribute('position').count;
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) { colors[i * 3] = r; colors[i * 3 + 1] = g; colors[i * 3 + 2] = b; }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geo;
}

function pineGeo(snow: boolean) {
  const parts: THREE.BufferGeometry[] = [];
  const trunk = colored(new THREE.CylinderGeometry(0.28, 0.4, 2.2, 6), 0.4, 0.28, 0.16);
  trunk.translate(0, 1.1, 0);
  parts.push(trunk);
  const g1 = snow ? [0.75, 0.8, 0.82] : [0.13, 0.35, 0.16];
  const g2 = snow ? [0.85, 0.89, 0.92] : [0.16, 0.42, 0.19];
  const c1 = colored(new THREE.ConeGeometry(2.4, 4.4, 7), g1[0], g1[1], g1[2]);
  c1.translate(0, 3.6, 0);
  parts.push(c1);
  const c2 = colored(new THREE.ConeGeometry(1.6, 3.4, 7), g2[0], g2[1], g2[2]);
  c2.translate(0, 6.2, 0);
  parts.push(c2);
  return mergeGeometries(parts, false)!;
}

function cactusGeo() {
  const parts: THREE.BufferGeometry[] = [];
  const main = colored(new THREE.CylinderGeometry(0.5, 0.6, 5, 7), 0.25, 0.5, 0.24);
  main.translate(0, 2.5, 0);
  parts.push(main);
  const arm = colored(new THREE.CylinderGeometry(0.32, 0.32, 2, 6), 0.28, 0.55, 0.26);
  arm.rotateZ(Math.PI / 2.4);
  arm.translate(1.1, 3.1, 0);
  parts.push(arm);
  const arm2 = colored(new THREE.CylinderGeometry(0.3, 0.3, 1.6, 6), 0.22, 0.48, 0.22);
  arm2.rotateZ(-Math.PI / 2.5);
  arm2.translate(-1, 2.3, 0);
  parts.push(arm2);
  return mergeGeometries(parts, false)!;
}

function rockGeo() {
  const geo = colored(new THREE.IcosahedronGeometry(1.4, 1), 0.48, 0.46, 0.44);
  geo.scale(1.3, 0.9, 1);
  geo.translate(0, 0.6, 0);
  return geo;
}


export { pineGeo, cactusGeo, rockGeo };
