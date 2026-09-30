// About: the Atari 2600 stage. The 3D console loads when the section comes near and
// motion is on; the cartridge buttons and a click on a cartridge in the scene load it.
// Each cartridge answers with a clunk and a few square-wave notes, when sound is on.
import { tones } from '../audio.js';
import { mountScene, motionOn } from './mount.js';

// Short made-up jingles, one per cartridge (not the games' own music).
const JINGLES = [[392, 523, 659, 784], [247, 220, 196, 185], [523, 659, 523, 784]];

export function initAtari() {
  const root = document.querySelector('[data-atari]');
  if (!root) return;
  const stage = root.querySelector('[data-atari-stage]');
  const canvas = root.querySelector('[data-atari-canvas]');
  const readout = root.querySelector('[data-atari-readout]');
  const buttons = [...root.querySelectorAll('[data-cart]')];
  let atari = null;
  let ready = null;
  let pending = -1;

  const render = (state) => {
    buttons.forEach((b, i) => b.setAttribute('aria-pressed', String(i === state.loaded)));
    root.toggleAttribute('data-busy', state.busy);
    if (!state.busy) readout.textContent = state.title ? `Cartridge in: ${state.title}` : 'Pick a cartridge';
    if (!state.busy && state.loaded >= 0) {
      tones([110], { dur: 0.05, gain: 0.16, type: 'triangle' });
      JINGLES[state.loaded].forEach((f, k) => tones([f], { dur: 0.09, gain: 0.05, type: 'square', delay: 0.12 + k * 0.1 }));
    }
  };

  mountScene(stage, () => import('./atari.js').then(({ createAtari }) => ({
    mount() {
      ready = createAtari(canvas, { onState: render }).then((scene) => {
        atari = scene;
        root.dataset.ready = 'true';
        new IntersectionObserver(([entry]) => { if (entry.isIntersecting && motionOn()) atari.resume(); else atari.pause(); }).observe(stage);
        if (pending >= 0) atari.insert(pending);
        return scene;
      });
      return { setMotion(on) { if (on) atari?.resume(); else atari?.pause(); } };
    },
  })));

  buttons.forEach((button, i) => button.addEventListener('click', () => {
    if (!atari) { pending = i; readout.textContent = 'Warming up…'; return; }
    if (atari.state.loaded === i) atari.eject(); else atari.insert(i);
  }));
  void ready;
}
