// Work switchboard: point at (or arrow to) a jack and its project lights up everywhere it
// appears, its patch cords glow, related projects answer, and the readout names it.
// With sound on, each jack answers with a relay click and its channel's DTMF digit.
import { sfx, tones } from '../audio.js';

const DTMF = [[941, 1336], [697, 1209], [697, 1336], [697, 1477], [770, 1209], [770, 1336], [770, 1477], [852, 1209], [852, 1336], [852, 1477]];

export function initSwitchboard() {
  const root = document.querySelector('[data-switchboard]');
  if (!root) return;
  const projects = JSON.parse(root.querySelector('[data-swb-projects]')?.textContent ?? '{}');
  const jacks = [...root.querySelectorAll('[data-jack]')];
  const bands = [...root.querySelectorAll('.swb__band')];
  const patches = [...root.querySelectorAll('.swb__patch')];
  const grid = root.querySelector('.swb__grid');
  const out = {
    ch: root.querySelector('[data-swb-ch]'),
    years: root.querySelector('[data-swb-years]'),
    title: root.querySelector('[data-swb-title]'),
    bands: root.querySelector('[data-swb-bands]'),
    role: root.querySelector('[data-swb-role]'),
  };
  const rest = Object.fromEntries(Object.entries(out).map(([key, el]) => [key, el?.textContent ?? '']));
  const pos = new Map(jacks.map((jack) => [jack, { x: parseFloat(jack.style.left), y: parseFloat(jack.style.top) }]));
  let current = null;

  const light = (slug, { sound = true } = {}) => {
    if (slug === current) return;
    current = slug;
    const project = slug ? projects[slug] : null;
    const related = new Set(project?.related ?? []);
    root.toggleAttribute('data-lit', Boolean(project));
    jacks.forEach((jack) => {
      jack.toggleAttribute('data-on', jack.dataset.jack === slug);
      jack.toggleAttribute('data-rel', related.has(jack.dataset.jack));
    });
    bands.forEach((band) => band.toggleAttribute('data-on', band.dataset.slug === slug));
    patches.forEach((patch) => patch.toggleAttribute('data-on', patch.dataset.a === slug || patch.dataset.b === slug));
    if (!project) {
      Object.entries(out).forEach(([key, el]) => { if (el) el.textContent = rest[key]; });
      return;
    }
    out.ch.textContent = `CH ${project.channel}`;
    out.years.textContent = project.years;
    out.title.textContent = project.title;
    out.bands.textContent = project.bands;
    out.role.textContent = project.role;
    if (sound) {
      sfx.tick();
      tones(DTMF[Number(project.channel) % 10], { dur: 0.06, gain: 0.035 });
    }
  };

  jacks.forEach((jack) => {
    jack.addEventListener('pointerenter', () => light(jack.dataset.jack));
    jack.addEventListener('focus', () => light(jack.dataset.jack, { sound: false }));
  });
  grid?.addEventListener('pointerleave', () => { if (!root.contains(document.activeElement)) light(null); });
  root.addEventListener('focusout', (event) => { if (!root.contains(event.relatedTarget)) light(null); });

  // One tab stop into the board; the arrow keys walk between jacks.
  const move = (from, dir) => {
    const a = pos.get(from);
    let best = null;
    let bestScore = Infinity;
    jacks.forEach((jack) => {
      if (jack === from) return;
      const b = pos.get(jack);
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const ok = dir === 'right' ? dx > 0.05 : dir === 'left' ? dx < -0.05 : dir === 'down' ? dy > 0.5 : dy < -0.5;
      if (!ok) return;
      const score = dir === 'right' || dir === 'left' ? Math.abs(dx) + Math.abs(dy) * 4 : Math.abs(dy) + Math.abs(dx) * 0.4;
      if (score < bestScore) { bestScore = score; best = jack; }
    });
    if (!best) return;
    jacks.forEach((jack) => jack.setAttribute('tabindex', jack === best ? '0' : '-1'));
    best.focus();
  };
  const keys = { ArrowRight: 'right', ArrowLeft: 'left', ArrowDown: 'down', ArrowUp: 'up' };
  jacks.forEach((jack) => jack.addEventListener('keydown', (event) => {
    if (!keys[event.key]) return;
    event.preventDefault();
    move(jack, keys[event.key]);
  }));

  // Pointing at a band label lights its trunk and its jacks.
  root.querySelectorAll('.swb__labels [data-band]').forEach((label) => {
    label.addEventListener('pointerenter', () => { root.dataset.band = label.dataset.band; });
    label.addEventListener('pointerleave', () => { delete root.dataset.band; });
  });
}
