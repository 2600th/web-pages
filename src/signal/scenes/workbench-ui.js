// About, toolchain: the workbench. The 3D PC loads near the section with motion on; the disk
// buttons (or a click on a disk in the scene) load a disk, and its row in the list lights.
import { tones } from '../audio.js';
import { mountScene, motionOn } from './mount.js';

export function initWorkbench() {
  const root = document.querySelector('[data-workbench]');
  if (!root) return;
  const stage = root.querySelector('[data-bench-stage]');
  const canvas = root.querySelector('[data-bench-canvas]');
  const disks = JSON.parse(root.querySelector('[data-bench-disks]').textContent);
  const buttons = [...root.querySelectorAll('[data-disk]')];
  const rows = [...root.querySelectorAll('[data-row]')];
  let bench = null;
  let pending = -1;

  const render = (state) => {
    buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === state.loaded)));
    rows.forEach((r, i) => r.toggleAttribute('data-on', i === state.loaded));
    // The drive seeks: a few quick clicks.
    if (!state.busy && state.loaded >= 0) [0, 0.07, 0.14, 0.3].forEach((d) => tones([180 + Math.random() * 60], { dur: 0.015, gain: 0.05, type: 'square', delay: d }));
  };

  mountScene(stage, () => import('./workbench.js').then(({ createWorkbench }) => ({
    mount() {
      createWorkbench(canvas, { disks, onState: render }).then((scene) => {
        bench = scene;
        root.dataset.ready = 'true';
        new IntersectionObserver(([entry]) => { if (entry.isIntersecting && motionOn()) bench.resume(); else bench.pause(); }).observe(stage);
        if (pending >= 0) bench.insert(pending);
      });
      return { setMotion(on) { if (on) bench?.resume(); else bench?.pause(); } };
    },
  })));

  buttons.forEach((button, i) => button.addEventListener('click', () => {
    if (!bench) { pending = i; return; }
    if (bench.state.loaded === i) bench.eject(); else bench.insert(i);
  }));
}
