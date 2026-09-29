import '../shared/base.css';
import './style.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { hasWebGL, bindMotionToggle } from '../shared/env.js';
import { sound, sfx } from './audio.js';
import { decode, initCursor, initMagnetic, initTilt, toast, flash, onKonami, consoleHello } from './fx.js';
import { setStatus, initTuner, initLines, initLog, animateMeter, initBlueBox, initCopy, initDial } from './ui.js';
import { initEggs, setHooks, unlock } from './eggs.js';

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);
// Wall-clock timing: text decodes finish on schedule even when a weak GPU drops frames.
gsap.ticker.lagSmoothing(0);
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const motionOn = () => root.dataset.motion === 'on';

/* ---------------- Engine stub until WebGL is ready ---------------- */
const pending = { state: { detune: 0, targetDetune: 0, assemble: 1, morph: 0, mode: 0, seize: 0, pointer: {}, motion: true }, wake() {}, seize() {}, setMotion() {}, setBackground() {} };
let engine = pending;

/* ---------------- Preferences ---------------- */
const getMotion = bindMotionToggle($('[data-motion-toggle]'), (on) => {
  engine.setMotion(on);
  ScrollTrigger.refresh();
  if (!on) tuner?.finishIntro();
  $$('video').forEach((v) => { if (!on) v.pause(); });
});
engine.state.motion = getMotion();

const soundBtn = $('[data-sound-toggle]');
soundBtn.addEventListener('click', () => {
  const on = soundBtn.getAttribute('aria-pressed') !== 'true';
  sound.set(on);
  soundBtn.setAttribute('aria-pressed', String(on));
  $('[data-sound-label]').textContent = on ? 'Sound on' : 'Sound off';
  root.dataset.sound = on ? 'on' : 'off';
  if (on) sfx.dialTone();
});
document.addEventListener('pointerover', (e) => {
  const el = e.target.closest?.('[data-sfx="tick"]');
  if (el && !el.contains(e.relatedTarget)) sfx.tick();
});

/* ---------------- Header ---------------- */
const header = $('[data-header]');
addEventListener('scroll', () => { header.dataset.scrolled = String(scrollY > 40); }, { passive: true });

/* ---------------- Hero intro ---------------- */
setStatus('idle', 'Dialing');
const heroTitle = $('[data-hero-title]');
heroTitle.setAttribute('aria-label', heroTitle.textContent.replace(/\s+/g, ' ').trim());
if (motionOn()) {
  $$('.sg-h1-line, .sg-hero h1 em', heroTitle).forEach((el, i) => decode(el, { duration: 1.1 + i * 0.4 }));
  gsap.from('.sg-kicker, .sg-lede, .sg-actions, .sg-incoming, .sg-cue', { opacity: 0, y: 18, duration: 0.9, ease: 'power3.out', stagger: 0.08, delay: 0.2 });
  gsap.from('.sg-tuner', { opacity: 0, y: 30, duration: 1, ease: 'power3.out', delay: 0.5 });
}

let tuner = null;

/* ---------------- WebGL portrait ---------------- */
async function startEngine() {
  const loading = $('[data-loading]');
  const pct = $('[data-loading-pct]');
  if (!hasWebGL()) throw new Error('WebGL2 unavailable');
  // Three.js loads after the page is interactive; content never waits on it.
  const { createSignalEngine } = await import('./engine.js');
  engine = await createSignalEngine({
    canvas: $('[data-canvas]'), stage: $('[data-stage]'), motion: motionOn(),
    onProgress: (p) => { pct.textContent = String(Math.round(p * 100)).padStart(2, '0'); },
  });
  loading.hidden = true;
  tuner = initTuner(engine);
  if (!motionOn() || scrollY > innerHeight) { engine.state.assemble = 1; tuner.finishIntro(); }
  // If the stage scrolls away mid-intro, its loop pauses; finish the lock on time anyway.
  setTimeout(() => { if (engine.state.assemble < 1) { engine.state.assemble = 1; engine.wake(); } tuner.finishIntro(); }, 3200);
  wireStory();
  // Pointer drives the portrait's interference field.
  addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    Object.assign(engine.state.pointer, { x: (e.clientX / innerWidth) * 2 - 1, clientX: e.clientX, clientY: e.clientY, active: true });
    engine.wake();
  }, { passive: true });
  document.addEventListener('pointerleave', () => { engine.state.pointer.active = false; });
}

/* ---------------- Origin story: figure → traces ---------------- */
const SCOPE = [
  { f: '2600.0 Hz', t: '384.6 µs', mode: 'Idle tone' },
  { f: '≈ 2600 Hz', t: '≈ 384.6 µs', mode: 'Toy whistle' },
  { f: '1100 + 1700 Hz', t: 'KP · 2 of 6', mode: 'Blue box MF' },
  { f: 'Carrier held', t: 'Line open', mode: 'Handoff' },
];
function wireStory() {
  const scope = $('[data-scope]');
  const set = (i) => {
    const s = SCOPE[i];
    decode($('[data-scope-f]'), { text: s.f, duration: 0.5 });
    decode($('[data-scope-t]'), { text: s.t, duration: 0.5 });
    decode($('[data-scope-mode]'), { text: s.mode, duration: 0.5 });
  };
  const intro = $('.sg-beat--intro');
  ScrollTrigger.create({
    trigger: intro, start: 'top bottom', end: 'center center', scrub: true,
    onUpdate: (st) => {
      if (!motionOn()) { engine.state.morph = 0; return; }
      engine.state.morph = st.progress;
      engine.state.gridAmount = 0.45 + st.progress * 0.55;
      scope.dataset.on = String(st.progress > 0.7);
      engine.wake();
    },
  });
  $$('.sg-beat[data-beat]').forEach((beat) => {
    const i = Number(beat.dataset.beat);
    if (!i) return;
    ScrollTrigger.create({
      trigger: beat, start: 'top 55%', end: 'bottom 45%',
      onToggle: (st) => {
        if (!st.isActive) return;
        gsap.to(engine.state, { mode: i - 1, duration: motionOn() ? 1 : 0, ease: 'power2.inOut', onUpdate: () => engine.wake() });
        set(i - 1);
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

/* ---------------- Reveals and section juice ---------------- */
function initReveals() {
  $$('[data-decode]').forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => decode(el, { duration: 0.9 }) });
  });
  $$('.sg-meter').forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => animateMeter(el) });
  });
  if (!motionOn()) return;
  const groups = ['.sg-proof li', '.sg-line', '.sg-monitor', '.sg-era', '.sg-feature', '.sg-build', '.sg-tx li', '.sg-contact__copy > *', '.sg-box-wrap'];
  groups.forEach((sel) => {
    ScrollTrigger.batch(sel, {
      start: 'top 92%', once: true,
      // Movement only: reading content is never hidden or dimmed at rest (DESIGN.md).
      onEnter: (els) => gsap.from(els, { y: 32, duration: 0.9, ease: 'power3.out', stagger: 0.07, overwrite: true }),
    });
  });
  $$('.sg-beat h3, .sg-beat p, .sg-beat h2').forEach((el) => {
    gsap.from(el, { y: 40, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', toggleActions: 'play none none none' } });
  });
}

/* ---------------- Media ---------------- */
function initMedia() {
  const feature = $('[data-inview-video]');
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting && motionOn()) feature.play().catch(() => {}); else feature.pause();
  }, { threshold: 0.4 }).observe(feature);
  $$('[data-hover-video]').forEach((v) => {
    const card = v.closest('.sg-build');
    card.addEventListener('pointerenter', () => { if (motionOn()) v.play().catch(() => {}); });
    card.addEventListener('pointerleave', () => v.pause());
  });
  $$('[data-hover-decode]').forEach((el) => {
    el.closest('a').addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') decode(el, { duration: 0.5 }); });
  });
  $$('.sg-build > a:first-child').forEach((a) => { a.dataset.cursorText = a.href.includes('github.com') ? 'Source' : 'Launch'; });
  $('[data-tune]').dataset.cursorText = 'Tune';
  $('[data-seize]').dataset.cursorText = '2600 Hz';
}

/* ---------------- Easter eggs ---------------- */
function seizeLine() {
  sfx.seize();
  engine.seize();
  flash(0.8);
  setStatus('seized', 'Line seized');
  setTimeout(() => setStatus('locked', 'Locked · 2600 Hz'), 2400);
  unlock('seize');
}
function togglePhreak() {
  const on = root.dataset.phreak !== 'on';
  root.dataset.phreak = on ? 'on' : 'off';
  engine.setBackground(on ? '#061247' : '#03040a');
  sfx.mf('KP'); setTimeout(() => sfx.mf('ST'), 160);
  toast(on ? 'Phreak mode. The whole page is a blue box now.' : 'Phreak mode off.');
  if (on) unlock('phreak');
}
function goto(id) {
  const el = document.getElementById(id === 'top' ? 'top' : id);
  el?.scrollIntoView({ behavior: motionOn() ? 'smooth' : 'auto' });
}
setHooks({ seize: seizeLine, phreak: togglePhreak, goto });
onKonami(togglePhreak);
initEggs();

// Phones: header menu.
const menu = $('[data-menu]');
const nav = $('#primary-nav');
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  nav.dataset.open = String(open);
});
nav.addEventListener('click', (e) => { if (e.target.closest('a')) { menu.setAttribute('aria-expanded', 'false'); nav.dataset.open = 'false'; } });
let savedTitle = document.title;
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { savedTitle = document.title; document.title = 'Line idle · 2600th'; } else document.title = savedTitle;
});
consoleHello();

/* ---------------- Boot ---------------- */
initDial();
initLines();
initLog();
initBlueBox({ seize: () => engine.seize(), get state() { return engine.state; } });
initCopy();
initMedia();
initCursor();
initMagnetic();
initTilt();
initReveals();

startEngine().catch((error) => {
  console.warn('[signal] static fallback:', error.message);
  root.classList.add('no-webgl');
  $('[data-loading]').hidden = true;
  tuner = initTuner(engine);
  tuner.finishIntro();
});
