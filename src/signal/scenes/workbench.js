// About, toolchain: a 90s beige PC on the desk with four floppy disks, one per toolchain row.
// Pick a disk: it slides into the drive, the drive light blinks, and the monitor (a canvas in
// the site's terminal green) lists that row's tools and the work they were used on. Idle, the
// screen boots and waits at a prompt. Model: "PSX Retro Computer" by Tomitos, CC BY 4.0.
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import { loadModel } from './gltf.js';
import { timeScale } from './mount.js';

const URL = '/media/3d/retro-computer.glb';
// The monitor's glass, in model units, and the floppy slot on the tower.
const GLASS = { x: 0, y: 0.322, z: 0.2145, w: 0.366, h: 0.3 };
const SLOT = new THREE.Vector3(0.5, 0.268, 0.302);
const LOOK = new THREE.Vector3(0.2, 0.22, 0.38);
const DISKS = ['FloppyDisk_Black', 'FloppyDisk_Blue', 'FloppyDisk_Green', 'FloppyDisk_Red'];
const TERM = '#7cf0b0';
const DIM = '#3f7a5e';
const SW = 480;
const SH = 360;

/** The monitor: a boot sequence, a prompt, and a listing per disk. */
function createScreen(disks) {
  const canvas = document.createElement('canvas');
  canvas.width = SW;
  canvas.height = SH;
  const ctx = canvas.getContext('2d');
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const BOOT = ['2600th BIOS v2.6', 'Memory ..... 640K OK', 'Drive A: 3.5" 1.44M', '', 'guest@2600th:~$ ls', 'Insert a disk.'];
  const s = { lines: BOOT, typed: 0, t: 0, disk: -1, reading: 0 };
  const listing = (disk) => [
    `A:\\> dir ${disk.label}`,
    ...disk.tools.map((tool) => `  ${tool}`),
    '',
    ...disk.work.map((w) => `  > ${w}`),
  ];
  const paint = () => {
    ctx.fillStyle = '#031208';
    ctx.fillRect(0, 0, SW, SH);
    ctx.font = '700 24px "JetBrains Mono", monospace';
    ctx.textBaseline = 'top';
    let left = s.typed;
    let y = 22;
    let caret = null;
    for (const line of s.lines) {
      const shown = line.slice(0, Math.max(0, left));
      left -= line.length + 1;
      ctx.fillStyle = line.startsWith('  >') ? '#e8b45a' : line.startsWith('A:\\>') || line.startsWith('guest') ? TERM : line.startsWith('  ') ? '#c9f7de' : DIM;
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 6;
      ctx.fillText(shown, 22, y);
      if (left < 0 && !caret) caret = { x: 22 + ctx.measureText(shown).width + 3, y };
      y += 32;
      if (left < 0) break;
    }
    ctx.shadowBlur = 0;
    caret ??= { x: 22, y };
    if (Math.floor(s.t * 2.2) % 2 === 0) { ctx.fillStyle = TERM; ctx.fillRect(caret.x, caret.y + 2, 13, 24); }
    // Drive access bar while a disk is read.
    if (s.reading > 0) {
      ctx.fillStyle = DIM;
      ctx.fillRect(22, SH - 34, SW - 44, 10);
      ctx.fillStyle = TERM;
      ctx.fillRect(22, SH - 34, (SW - 44) * (1 - s.reading), 10);
    }
    // Scanlines and the tube's vignette.
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    for (let yy = 0; yy < SH; yy += 3) ctx.fillRect(0, yy, SW, 1);
    const g = ctx.createRadialGradient(SW / 2, SH / 2, SH * 0.35, SW / 2, SH / 2, SH * 0.85);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.65)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, SW, SH);
    texture.needsUpdate = true;
  };
  paint();
  return {
    texture,
    load(index) { s.disk = index; s.reading = 1; s.lines = listing(disks[index]); s.typed = 0; },
    eject() { s.disk = -1; s.lines = BOOT.slice(4); s.typed = 0; s.reading = 0; },
    tick(dt) {
      s.t += dt;
      if (s.reading > 0) s.reading = Math.max(0, s.reading - dt / 0.8);
      else s.typed += dt * 70;
      paint();
    },
    get reading() { return s.reading > 0; },
  };
}

export async function createWorkbench(canvas, { disks, onState = () => {} }) {
  await document.fonts?.ready;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  scene.environment = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;
  const key = new THREE.DirectionalLight(0xfff1dc, 2.2);
  key.position.set(-1.5, 2.5, 2.5);
  const rim = new THREE.PointLight(0x4d74ff, 3.5, 4);
  rim.position.set(1.4, 1, -0.8);
  scene.add(key, rim);

  const gltf = await loadModel(URL);
  const root = gltf.scene;
  scene.add(root);
  root.updateMatrixWorld(true);

  const screen = createScreen(disks);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(GLASS.w, GLASS.h), new THREE.MeshBasicMaterial({ map: screen.texture, toneMapped: false }));
  glass.position.set(GLASS.x, GLASS.y, GLASS.z);
  root.add(glass);
  const glow = new THREE.PointLight(0x7cf0b0, 0.6, 1.4, 1.8);
  glow.position.set(GLASS.x, GLASS.y, GLASS.z + 0.35);
  root.add(glow);
  // Drive light on the tower, next to the floppy slot.
  const led = new THREE.Mesh(new THREE.CircleGeometry(0.006, 12), new THREE.MeshBasicMaterial({ color: 0x2a0d06 }));
  led.position.set(0.56, 0.268, 0.3015);
  root.add(led);

  // Shadow under the desk set.
  const shadowCanvas = document.createElement('canvas');
  shadowCanvas.width = 256; shadowCanvas.height = 128;
  const sctx = shadowCanvas.getContext('2d');
  const sg = sctx.createRadialGradient(128, 64, 0, 128, 64, 128);
  sg.addColorStop(0, 'rgba(0,0,0,0.55)');
  sg.addColorStop(1, 'rgba(0,0,0,0)');
  sctx.fillStyle = sg;
  sctx.fillRect(0, 0, 256, 128);
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.6), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0.18, 0.001, 0.35);
  scene.add(shadow);

  const floppies = DISKS.map((name) => {
    const mesh = root.getObjectByName(name)?.children.find((c) => c.isMesh) ?? root.getObjectByName(name);
    if (!mesh) return null;
    scene.attach(mesh);
    return { mesh, home: { position: mesh.position.clone(), quaternion: mesh.quaternion.clone() } };
  }).filter(Boolean);

  const camera = new THREE.PerspectiveCamera(30, 1, 0.05, 20);
  const base = new THREE.Vector3(-0.4, 1.05, 2.35);
  camera.position.copy(base);
  camera.lookAt(LOOK);

  const state = { loaded: -1, busy: false, pointer: { x: 0, y: 0 } };
  const emit = () => onState({ loaded: state.loaded, busy: state.busy });

  // A disk goes into the drive edge-first: stood up, facing the slot, then pushed in.
  const slotPose = (disk) => {
    disk.mesh.updateMatrixWorld(true);
    const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI / 2, 0, 0));
    return { position: SLOT.clone(), quaternion: q };
  };
  const move = (disk, to, duration, lift = 0.25) => {
    const from = { position: disk.mesh.position.clone(), quaternion: disk.mesh.quaternion.clone() };
    const p = { t: 0 };
    return gsap.to(p, {
      t: 1, duration, ease: 'power2.inOut',
      onUpdate: () => {
        disk.mesh.position.lerpVectors(from.position, to.position, p.t);
        disk.mesh.position.y += lift * Math.sin(Math.PI * p.t);
        disk.mesh.quaternion.slerpQuaternions(from.quaternion, to.quaternion, Math.min(1, p.t * 1.3));
      },
    });
  };
  const blink = () => gsap.timeline()
    .set(led.material.color, { r: 1, g: 0.55, b: 0.1 })
    .to(led.material.color, { r: 0.16, g: 0.05, b: 0.02, duration: 0.12, repeat: 5, yoyo: true })
    .set(led.material.color, { r: 0.16, g: 0.05, b: 0.02 });

  const takeOut = async () => {
    const disk = floppies[state.loaded];
    const pose = slotPose(disk);
    disk.mesh.visible = true;
    disk.mesh.position.copy(pose.position).add(new THREE.Vector3(0, 0, -0.08));
    await gsap.to(disk.mesh.position, { z: pose.position.z + 0.05, duration: 0.25, ease: 'power2.out' });
    await move(disk, disk.home, 0.7);
  };

  const insert = async (index) => {
    if (state.busy || index === state.loaded || !floppies[index]) return;
    state.busy = true;
    emit();
    if (state.loaded >= 0) await takeOut();
    const disk = floppies[index];
    const pose = slotPose(disk);
    await move(disk, { position: pose.position.clone().add(new THREE.Vector3(0, 0, 0.1)), quaternion: pose.quaternion }, 0.85);
    await gsap.to(disk.mesh.position, { z: pose.position.z - 0.08, duration: 0.25, ease: 'power3.in' });
    disk.mesh.visible = false;
    blink();
    screen.load(index);
    state.loaded = index;
    state.busy = false;
    emit();
  };

  const eject = async () => {
    if (state.busy || state.loaded < 0) return;
    state.busy = true;
    emit();
    await takeOut();
    screen.eject();
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
    screen.tick(Math.min(clock.getDelta() * timeScale(), 1 / 10));
    camera.position.x += (base.x + state.pointer.x * 0.2 - camera.position.x) * 0.05;
    camera.position.y += (base.y + state.pointer.y * 0.1 - camera.position.y) * 0.05;
    camera.lookAt(LOOK);
    renderer.render(scene, camera);
  };
  renderer.setAnimationLoop(frame);

  const ray = new THREE.Raycaster();
  const pick = (event) => {
    const rect = canvas.getBoundingClientRect();
    ray.setFromCamera(new THREE.Vector2(((event.clientX - rect.left) / rect.width) * 2 - 1, -(((event.clientY - rect.top) / rect.height) * 2 - 1)), camera);
    const hit = ray.intersectObjects(floppies.filter((f) => f.mesh.visible).map((f) => f.mesh), false)[0];
    return hit ? floppies.findIndex((f) => f.mesh === hit.object) : -1;
  };
  canvas.addEventListener('pointermove', (event) => {
    const rect = canvas.getBoundingClientRect();
    state.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    state.pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    canvas.style.cursor = pick(event) >= 0 ? 'pointer' : '';
  });
  canvas.addEventListener('pointerleave', () => { state.pointer.x = 0; state.pointer.y = 0; });
  canvas.addEventListener('click', (event) => { const i = pick(event); if (i >= 0) insert(i); });

  return {
    insert, eject,
    get state() { return { ...state }; },
    pause() { renderer.setAnimationLoop(null); },
    resume() { clock.getDelta(); renderer.setAnimationLoop(frame); },
  };
}
