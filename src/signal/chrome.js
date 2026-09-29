// Site-wide behaviour for every page: header, preferences, cursor, reveals, media
// and the console. The homepage adds its engine on top through setHooks().
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { bindMotionToggle } from './env.js';
import { sound, sfx } from './audio.js';
import { decode, initCursor, initMagnetic, toast, flash, onKonami, consoleHello } from './fx.js';
import { initEggs, setHooks, unlock, hooks } from './eggs.js';

export { setHooks, unlock };
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const root = document.documentElement;
const motionOn = () => root.dataset.motion === 'on';
const SOUND_KEY = '2600th-sound';

export function setStatus(state, label) {
  const el = $('.sg-status');
  if (!el) return;
  el.dataset.state = state;
  const text = $('[data-status-label]', el);
  if (text) text.textContent = label;
}

/* Pages without the engine still speak the language: 2600 Hz, a flash, the status light. */
const ROUTES = { work: '/work/', lab: '/lab/', notes: '/notes/', about: '/about/', log: '/about/', home: '/', top: '#page-top', contact: '#contact' };
setHooks({
  seize() {
    sfx.seize(); flash(0.8);
    setStatus('seized', 'Line seized');
    setTimeout(() => setStatus('locked', 'Locked · 2600 Hz'), 2400);
    unlock('seize');
  },
  phreak() {
    const on = root.dataset.phreak !== 'on';
    root.dataset.phreak = on ? 'on' : 'off';
    sfx.mf('KP'); setTimeout(() => sfx.mf('ST'), 160);
    toast(on ? 'Phreak mode. The whole site is a blue box now.' : 'Phreak mode off.');
    if (on) unlock('phreak');
  },
  goto(id) {
    const target = ROUTES[id];
    if (!target) return false;
    if (target.startsWith('#')) document.querySelector(target)?.scrollIntoView({ behavior: motionOn() ? 'smooth' : 'auto' });
    else location.assign(target);
    return true;
  },
});

function initPreferences() {
  bindMotionToggle($('[data-motion-toggle]'), (on) => {
    if (!on) $$('video').forEach((v) => v.pause());
    document.dispatchEvent(new CustomEvent('signal:motion', { detail: { on } }));
    ScrollTrigger.refresh();
  });

  const soundBtn = $('[data-sound-toggle]');
  const syncSound = (on) => {
    soundBtn?.setAttribute('aria-pressed', String(on));
    const label = $('[data-sound-label]');
    if (label) label.textContent = on ? 'Sound on' : 'Sound off';
    root.dataset.sound = on ? 'on' : 'off';
  };
  sound.onChange((on) => {
    syncSound(on);
    try { sessionStorage.setItem(SOUND_KEY, on ? 'on' : 'off'); } catch { /* private mode */ }
  });
  soundBtn?.addEventListener('click', () => {
    const on = !sound.enabled;
    sound.set(on);
    if (on) sfx.dialTone();
  });
  // Sound stays on while moving between pages; browsers still need one gesture per page to play it.
  let wanted = false;
  try { wanted = sessionStorage.getItem(SOUND_KEY) === 'on'; } catch { /* private mode */ }
  if (wanted) {
    syncSound(true);
    const resume = () => { if (!sound.enabled && soundBtn?.getAttribute('aria-pressed') === 'true') sound.set(true); };
    addEventListener('pointerdown', resume, { once: true });
    addEventListener('keydown', resume, { once: true });
  }
  document.addEventListener('pointerover', (e) => {
    const el = e.target.closest?.('[data-sfx="tick"]');
    if (el && !el.contains(e.relatedTarget)) sfx.tick();
  });
}

function initHeader() {
  const header = $('[data-header]');
  const update = () => { header.dataset.scrolled = String(scrollY > 40); };
  addEventListener('scroll', update, { passive: true });
  update();
  const menu = $('[data-menu]');
  const panel = $('[data-menu-panel]');
  const setOpen = (open) => { menu?.setAttribute('aria-expanded', String(open)); if (panel) panel.dataset.open = String(open); };
  menu?.addEventListener('click', () => setOpen(menu.getAttribute('aria-expanded') !== 'true'));
  panel?.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panel?.dataset.open === 'true') { setOpen(false); menu?.focus(); }
  });
}

function initCopy() {
  $$('[data-copy]').forEach((btn) => {
    const label = $('[data-copy-label]', btn);
    btn.addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(btn.dataset.copy); }
      catch {
        const mail = btn.parentElement.querySelector('[data-mail]');
        if (mail) { const range = document.createRange(); range.selectNodeContents(mail); getSelection().removeAllRanges(); getSelection().addRange(range); }
        toast('Selected. Press Ctrl+C or ⌘C to copy.');
        return;
      }
      btn.dataset.state = 'done'; label.textContent = 'Copied';
      sfx.lock();
      toast('Email copied.');
      setTimeout(() => { btn.dataset.state = ''; label.textContent = 'Copy'; }, 2200);
    });
  });
}

/* Playback is always the visitor's choice: explicit play buttons, hover previews on fine pointers only. */
function initMedia() {
  const feature = $('[data-feature-video]');
  const featureBtn = $('[data-feature-play]');
  if (feature && featureBtn) {
    const featureLabel = $('[data-feature-play-label]', featureBtn);
    const setFeature = (play) => {
      if (play) feature.play().catch(() => {}); else feature.pause();
      featureBtn.setAttribute('aria-pressed', String(play));
      featureLabel.textContent = play ? 'Pause clip' : 'Play clip';
    };
    featureBtn.addEventListener('click', () => setFeature(feature.paused));
    new IntersectionObserver(([e]) => { if (!e.isIntersecting && !feature.paused) setFeature(false); }).observe(feature);
  }
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    $$('[data-hover-video]').forEach((v) => {
      const card = v.closest('.sg-build') ?? v.parentElement;
      card.addEventListener('pointerenter', () => { if (motionOn()) v.play().catch(() => {}); });
      card.addEventListener('pointerleave', () => v.pause());
    });
  }
}

/* Movement only: reading content is never hidden or dimmed at rest. */
function initReveals() {
  $$('[data-decode]').forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => decode(el, { duration: 0.9 }) });
  });
  if (!motionOn()) return;
  ['[data-reveal]', '.sg-feature', '.sg-build', '.sg-tx li', '.sg-foot__copy > *'].forEach((sel) => {
    ScrollTrigger.batch(sel, {
      start: 'top 92%', once: true,
      onEnter: (els) => gsap.from(els, { y: 28, duration: 0.9, ease: 'power3.out', stagger: 0.06, overwrite: 'auto' }),
    });
  });
}

let started = false;
/** Idempotent: the layout and the homepage both call it. */
export function initChrome() {
  if (started) return;
  started = true;
  gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);
  // Wall-clock timing: text decodes finish on schedule even when a weak GPU drops frames.
  gsap.ticker.lagSmoothing(0);
  initPreferences();
  initHeader();
  initCopy();
  initMedia();
  initCursor();
  initMagnetic();
  initReveals();
  onKonami(() => hooks.phreak());
  initEggs();
  consoleHello();
  // Hidden tab keeps the name; only the state changes.
  const title = document.title;
  document.addEventListener('visibilitychange', () => { document.title = document.hidden ? 'Line idle · Pranshul Chandhok' : title; });
}
