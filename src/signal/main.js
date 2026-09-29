// Homepage: the 2600 Hz portrait, the tuner, the origin story and the blue box.
// Header, preferences, console and shared components come from chrome.js.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { hasWebGL } from './env.js';
import { sfx } from './audio.js';
import { decode, initTilt, toast, flash } from './fx.js';
import { initTuner, initLines, initLog, animateMeter, initBlueBox, initDial } from './ui.js';
import { initChrome, setHooks, setStatus, unlock } from './chrome.js';
import { hooks } from './eggs.js';

initChrome();
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const motionOn = () => root.dataset.motion === 'on';

/* ---------------- Engine: a stub until WebGL is running ---------------- */
const stub = { state: { detune: 0, targetDetune: 0, assemble: 1, morph: 0, mode: 0, seize: 0, pointer: {}, motion: false }, wake() {}, seize() {}, setMotion() {}, setBackground() {} };
let engine = stub;
let engineStarted = false;
// Everything else talks to the engine through this proxy, so it works before (and without) WebGL.
const live = { get state() { return engine.state; }, wake: () => engine.wake(), seize: () => engine.seize() };

document.addEventListener('signal:motion', ({ detail: { on } }) => {
  engine.setMotion(on);
  if (on && !engineStarted) boot3D();
});

/* ---------------- Hero ---------------- */
const heroTitle = $('[data-hero-title]');
heroTitle.setAttribute('aria-label', heroTitle.textContent.replace(/\s+/g, ' ').trim());
if (motionOn()) {
  $$('.sg-h1-line, .sg-hero h1 em', heroTitle).forEach((el, i) => decode(el, { duration: 1 + i * 0.35 }));
  // Movement only, so nothing readable starts hidden.
  gsap.from('.sg-kicker, .sg-lede, .sg-actions, .sg-heroproof, .sg-incoming', { y: 16, duration: 0.9, ease: 'power3.out', stagger: 0.06, delay: 0.15 });
  gsap.from('.sg-tuner', { y: 24, duration: 1, ease: 'power3.out', delay: 0.4 });
}
const tuner = initTuner(live);
setStatus('locked', 'Locked · 2600 Hz');

/* ---------------- WebGL portrait (motion only) ---------------- */
async function startEngine() {
  const loading = $('[data-loading]');
  const pct = $('[data-loading-pct]');
  if (!hasWebGL()) throw new Error('WebGL2 unavailable');
  loading.hidden = false;
  // Three.js loads after the page is interactive; content never waits on it.
  const { createSignalEngine } = await import('./engine.js');
  engine = await createSignalEngine({
    canvas: $('[data-canvas]'), stage: $('[data-stage]'), motion: motionOn(),
    onProgress: (p) => { pct.textContent = String(Math.round(p * 100)).padStart(2, '0'); },
  });
  loading.hidden = true;
  if (motionOn() && scrollY < innerHeight * 0.5) {
    tuner.startIntro();
    // If the stage scrolls away mid-intro its loop pauses; finish the lock on time anyway.
    setTimeout(() => { if (engine.state.assemble < 1) { engine.state.assemble = 1; engine.wake(); } tuner.finishIntro(); }, 3000);
  } else { engine.state.assemble = 1; tuner.finishIntro(); }
  wireStory();
  addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    Object.assign(engine.state.pointer, { x: (e.clientX / innerWidth) * 2 - 1, clientX: e.clientX, clientY: e.clientY, active: true });
    engine.wake();
  }, { passive: true });
  root.addEventListener('mouseleave', () => { engine.state.pointer.active = false; });
}
function boot3D() {
  engineStarted = true;
  const go = () => startEngine().catch((error) => {
    console.warn('[signal] static portrait:', error.message);
    root.classList.add('no-webgl');
    $('[data-loading]').hidden = true;
  });
  // Let the first paint and the headline settle before the heavy lifting.
  if ('requestIdleCallback' in window) requestIdleCallback(go, { timeout: 700 }); else setTimeout(go, 200);
}
$('[data-loading]').hidden = true;
if (motionOn()) boot3D();

/* ---------------- Origin story: portrait → traces → portrait ---------------- */
// Beats 1–3 are the network's tones; beat 4 is the person behind the system, so the
// traces fold back into the portrait; the handoff holds it.
const SCOPE = [
  { f: '2600.0 Hz', t: '384.6 µs', mode: 'Idle tone', morph: 1 },
  { f: '≈ 2600 Hz', t: '≈ 384.6 µs', mode: 'Toy whistle', morph: 1 },
  { f: '1100 + 1700 Hz', t: 'KP · 2 of 6', mode: 'Blue box MF', morph: 1 },
  { f: 'Human factor', t: 'Social layer', mode: 'Portrait', morph: 0 },
  { f: 'Line held', t: 'Handoff', mode: 'Your move', morph: 0 },
];
function wireStory() {
  const scope = $('[data-scope]');
  let beatMorph = 1;
  const set = (s) => {
    decode($('[data-scope-f]'), { text: s.f, duration: 0.5 });
    decode($('[data-scope-t]'), { text: s.t, duration: 0.5 });
    decode($('[data-scope-mode]'), { text: s.mode, duration: 0.5 });
  };
  ScrollTrigger.create({
    trigger: '.sg-beat--intro', start: 'top bottom', end: 'center center', scrub: true,
    onUpdate: (st) => {
      if (!motionOn()) { engine.state.morph = 0; scope.dataset.on = 'false'; return; }
      engine.state.morph = st.progress * beatMorph;
      engine.state.gridAmount = 0.45 + st.progress * 0.55;
      scope.dataset.on = String(st.progress > 0.7);
      engine.wake();
    },
  });
  $$('.sg-beat[data-beat]').forEach((beat) => {
    const i = Number(beat.dataset.beat);
    if (!i) return;
    const s = SCOPE[i - 1];
    ScrollTrigger.create({
      trigger: beat, start: 'top 55%', end: 'bottom 45%',
      onToggle: (st) => {
        if (!st.isActive) return;
        beatMorph = s.morph;
        const duration = motionOn() ? 1.1 : 0;
        gsap.to(engine.state, { mode: Math.min(i - 1, 2), morph: motionOn() ? s.morph : 0, duration, ease: 'power2.inOut', onUpdate: () => engine.wake() });
        set(s);
        if (i === 3) sfx.mf('KP'); else if (i < 3) sfx.mf('2600');
      },
    });
  });
  ScrollTrigger.create({
    trigger: '.sg-origin', start: 'top bottom', end: 'bottom top',
    onLeave: () => { scope.dataset.on = 'false'; }, onEnterBack: () => { if (engine.state.morph > 0.7) scope.dataset.on = 'true'; },
  });
  ScrollTrigger.create({ trigger: '.sg-beat--handoff', start: 'top 55%', onEnter: () => decode($('.sg-beat--handoff h3'), { duration: 0.9 }) });
}

/* ---------------- Home reveals ---------------- */
function initReveals() {
  $$('.sg-meter[data-count]').forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => animateMeter(el) });
  });
  if (!motionOn()) return;
  ['.sg-proof li', '.sg-line', '.sg-monitor', '.sg-era', '.sg-box-wrap'].forEach((sel) => {
    ScrollTrigger.batch(sel, {
      start: 'top 92%', once: true,
      // Movement only: reading content is never hidden or dimmed at rest (DESIGN.md).
      onEnter: (els) => gsap.from(els, { y: 32, duration: 0.9, ease: 'power3.out', stagger: 0.07, overwrite: 'auto' }),
    });
  });
  $$('.sg-beat h3, .sg-beat p, .sg-beat h2').forEach((el) => {
    gsap.from(el, { y: 40, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none none' } });
  });
}

/* ---------------- Easter eggs with the engine attached ---------------- */
const siteGoto = hooks.goto;
setHooks({
  seize() {
    sfx.seize();
    engine.seize();
    flash(0.8);
    setStatus('seized', 'Line seized');
    setTimeout(() => setStatus('locked', 'Locked · 2600 Hz'), 2400);
    unlock('seize');
  },
  phreak() {
    const on = root.dataset.phreak !== 'on';
    root.dataset.phreak = on ? 'on' : 'off';
    engine.setBackground(on ? '#061247' : '#03040a');
    sfx.mf('KP'); setTimeout(() => sfx.mf('ST'), 160);
    toast(on ? 'Phreak mode. The whole page is a blue box now.' : 'Phreak mode off.');
    if (on) unlock('phreak');
  },
  goto(id) {
    const section = document.getElementById(id === 'home' ? 'top' : id);
    if (section) { section.scrollIntoView({ behavior: motionOn() ? 'smooth' : 'auto' }); return true; }
    return siteGoto(id);
  },
});

$('[data-tune]').dataset.cursorText = 'Tune';
$('[data-seize]').dataset.cursorText = '2600 Hz';

initDial();
initLines();
initLog();
initBlueBox(live);
initTilt();
initReveals();
