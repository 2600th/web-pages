import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import hiUrl from './models/2600th-hi.glb?url';
import loUrl from './models/2600th-lo.glb?url';

export const HEIGHT = 1.8;

/** Smaller model for phones, coarse pointers and low-memory devices. */
export function prefersLightModel() {
  const memory = navigator.deviceMemory;
  return matchMedia('(max-width: 760px), (pointer: coarse)').matches || (memory !== undefined && memory <= 4);
}

/**
 * Loads the character scan, normalises it to HEIGHT units with feet at y=0,
 * and returns the mesh plus its source material for directions to restyle.
 */
export async function loadCharacter({ light = prefersLightModel(), onProgress } = {}) {
  const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
  const gltf = await loader.loadAsync(light ? loUrl : hiUrl, (event) => {
    if (onProgress && event.total) onProgress(event.loaded / event.total);
  });
  let mesh;
  gltf.scene.traverse((node) => { if (node.isMesh && !mesh) mesh = node; });
  gltf.scene.updateMatrixWorld(true);
  // Quantized (normalized int) attributes cannot hold transformed values, so
  // expand to float before baking the node transform into the geometry.
  const geometry = new THREE.BufferGeometry().setIndex(mesh.geometry.index);
  for (const [name, attr] of Object.entries(mesh.geometry.attributes)) {
    const out = new Float32Array(attr.count * attr.itemSize);
    for (let i = 0; i < attr.count; i++) {
      for (let c = 0; c < attr.itemSize; c++) out[i * attr.itemSize + c] = attr.getComponent(i, c);
    }
    geometry.setAttribute(name, new THREE.BufferAttribute(out, attr.itemSize));
  }
  geometry.applyMatrix4(mesh.matrixWorld);
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  const size = box.getSize(new THREE.Vector3());
  const scale = HEIGHT / size.y;
  const center = box.getCenter(new THREE.Vector3());
  geometry.translate(-center.x, -box.min.y, -center.z).scale(scale, scale, scale);
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
  const material = mesh.material;
  return { geometry, material, map: material.map, ormMap: material.roughnessMap, light };
}

/**
 * Named anchor points on the figure (normalised to HEIGHT), used for HUD
 * callouts and camera shots. Measured against the scan in a turntable view.
 */
export const ANCHORS = {
  glasses: new THREE.Vector3(0, 1.655, 0.1),
  harness: new THREE.Vector3(0.04, 1.28, 0.12),
  hands: new THREE.Vector3(0.24, 0.93, 0.05),
  boots: new THREE.Vector3(0.1, 0.07, 0.1),
};

/**
 * Moves each anchor onto the front surface of the scan: the most forward
 * vertex inside a small window around the anchor's x/y.
 */
export function snapAnchors(geometry, anchors = ANCHORS, window = 0.03) {
  const pos = geometry.getAttribute('position');
  const out = {};
  for (const [name, a] of Object.entries(anchors)) {
    let best = null;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i);
      if (Math.abs(x - a.x) > window || Math.abs(y - a.y) > window) continue;
      const z = pos.getZ(i);
      if (!best || z > best.z) best = new THREE.Vector3(x, y, z);
    }
    out[name] = (best ?? a.clone()).add(new THREE.Vector3(0, 0, 0.01));
  }
  return out;
}
