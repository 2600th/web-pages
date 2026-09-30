// The Atari 2600 on the About page: the console, its joysticks and three cartridges from
// the model, in front of a colour TV (crt.js). Pick a cartridge and it
// lifts off the pile and seats in the slot with a clunk, and the TV warms up on channel 3
// with a title card; pick another and the TV retunes; take it out and the TV switches off.
// The camera leans with the pointer.
// Model: "Atari 2600" by dark_igorek, CC BY 4.0 (optimised for the web).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import { loadModel } from './gltf.js';
import { buildCrt } from './crt.js';
import { timeScale } from './mount.js';

const URL = '/media/3d/atari-2600.glb';
// Top of the cartridge slot, in model units (console is about 3.5 wide).
const SLOT = new THREE.Vector3(0, 0.9, -0.39);
const SEAT = 0.4; // how far a cartridge sinks into the slot
const LOOK = new THREE.Vector3(-0.3, 1.55, -1.7);
const CARTS = [
  { node: 'pitfall_0', title: 'Pitfall!' },
  { node: 'space_invaders_1', title: 'Space Invaders' },
  { node: 'super_breakout_2', title: 'Super Breakout' },
];

export async function createAtari(canvas, { onState = () => {} } = {}) {
  await document.fonts?.ready;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.7;
  const key = new THREE.DirectionalLight(0xfff1dc, 2.4);
  key.position.set(-3, 6, 5);
  const rim = new THREE.PointLight(0x4d74ff, 40, 14);
  rim.position.set(3.5, 2.5, -3.5);
  const warm = new THREE.PointLight(0xe8b45a, 10, 10);
  warm.position.set(-4, 1.2, 3);
  scene.add(key, rim, warm);

  const gltf = await loadModel(URL);
  const root = gltf.scene;
  scene.add(root);
  root.updateMatrixWorld(true);
  const tv = await buildCrt({ width: 3.9, stand: 0.75 });
  tv.group.position.set(-0.25, 0, -4.1);
  scene.add(tv.group);

  // Soft shadow under the set.
  const shadowTex = (() => {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 128;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(128, 64, 0, 128, 64, 128);
    g.addColorStop(0, 'rgba(0,0,0,0.6)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 256, 128);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(13, 11), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(-0.4, 0.002, -1.9);
  scene.add(shadow);

  // Cartridges: lift each out of the hierarchy so it can move freely, and remember its pose.
  const carts = CARTS.map((cart) => {
    const node = root.getObjectByName(cart.node);
    const mesh = node?.children.find((child) => child.isMesh) ?? node;
    scene.attach(mesh);
    return { ...cart, mesh, home: { position: mesh.position.clone(), quaternion: mesh.quaternion.clone() } };
  }).filter((cart) => cart.mesh);

  // Seated pose: upright in the slot, label facing the front, connector end down. Label on +y, its top toward -z.
  const seated = (cart) => {
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));
    const scale = cart.mesh.scale.y;
    const half = 0.41 * scale;
    return { position: new THREE.Vector3(SLOT.x, SLOT.y + half - SEAT * scale, SLOT.z), quaternion: q };
  };

  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 60);
  const base = new THREE.Vector3(-0.3, 4.2, 12.9);
  camera.position.copy(base);
  camera.lookAt(LOOK);

  const state = { loaded: -1, busy: false, pointer: { x: 0, y: 0 } };
  const emit = () => onState({ loaded: state.loaded, title: carts[state.loaded]?.title ?? null, busy: state.busy });

  // Move a cartridge between poses on an arc that clears the console.
  const move = (cart, to, duration) => {
    const from = { position: cart.mesh.position.clone(), quaternion: cart.mesh.quaternion.clone() };
    const lift = Math.max(from.position.y, to.position.y) + 1.1;
    const p = { t: 0 };
    return gsap.to(p, {
      t: 1, duration, ease: 'power2.inOut',
      onUpdate: () => {
        const t = p.t;
        cart.mesh.position.lerpVectors(from.position, to.position, t);
        cart.mesh.position.y += (lift - Math.max(from.position.y, to.position.y)) * Math.sin(Math.PI * Math.min(1, t * 1.15));
        cart.mesh.quaternion.slerpQuaternions(from.quaternion, to.quaternion, Math.min(1, t * 1.25));
      },
    });
  };

  const insert = async (index) => {
    if (state.busy || index === state.loaded || !carts[index]) return;
    state.busy = true;
    emit();
    if (state.loaded >= 0) {
      const out = carts[state.loaded];
      tv.off();
      await gsap.to(out.mesh.position, { y: out.mesh.position.y + SEAT * out.mesh.scale.y * 1.2, duration: 0.25, ease: 'power2.out' });
      await move(out, out.home, 0.8);
    }
    const cart = carts[index];
    const seat = seated(cart);
    const above = { position: seat.position.clone().add(new THREE.Vector3(0, 0.7, 0)), quaternion: seat.quaternion };
    await move(cart, above, 0.95);
    await gsap.to(cart.mesh.position, { y: seat.position.y, duration: 0.22, ease: 'power3.in' });
    // The console takes the weight, and the TV comes on with the game.
    gsap.fromTo(root.position, { y: -0.03 }, { y: 0, duration: 0.35, ease: 'elastic.out(1, 0.4)' });
    tv.show(index, cart.title);
    state.loaded = index;
    state.busy = false;
    emit();
  };

  const eject = async () => {
    if (state.busy || state.loaded < 0) return;
    state.busy = true;
    const out = carts[state.loaded];
    tv.off();
    await gsap.to(out.mesh.position, { y: out.mesh.position.y + SEAT * out.mesh.scale.y * 1.2, duration: 0.25, ease: 'power2.out' });
    await move(out, out.home, 0.8);
    state.loaded = -1;
    state.busy = false;
    emit();
  };

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  const clock = new THREE.Clock();
  const frame = () => {
    tv.tick(Math.min(clock.getDelta() * timeScale(), 1 / 10));
    camera.position.x += (base.x + state.pointer.x * 0.9 - camera.position.x) * 0.05;
    camera.position.y += (base.y + state.pointer.y * 0.5 - camera.position.y) * 0.05;
    camera.lookAt(LOOK);
    renderer.render(scene, camera);
  };
  renderer.setAnimationLoop(frame);

  canvas.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    state.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    state.pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    const hit = pick(event);
    canvas.style.cursor = hit >= 0 ? 'pointer' : '';
  });
  canvas.addEventListener('pointerleave', () => { state.pointer.x = 0; state.pointer.y = 0; });

  const ray = new THREE.Raycaster();
  const pick = (event) => {
    const rect = canvas.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -(((event.clientY - rect.top) / rect.height) * 2 - 1)), camera);
    const hit = ray.intersectObjects(carts.map((c) => c.mesh), false)[0];
    return hit ? carts.findIndex((c) => c.mesh === hit.object) : -1;
  };
  canvas.addEventListener('click', (event) => {
    const index = pick(event);
    if (index < 0) return;
    if (index === state.loaded) eject(); else insert(index);
  });

  return {
    insert, eject,
    titles: carts.map((c) => c.title),
    get state() { return { ...state }; },
    pause() { renderer.setAnimationLoop(null); },
    resume() { clock.getDelta(); renderer.setAnimationLoop(frame); },
  };
}
