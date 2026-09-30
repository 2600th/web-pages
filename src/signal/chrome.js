// Site-wide behaviour for every page: header, preferences, cursor, reveals, media
// and the console. The homepage adds its engine on top through setHooks().
import { gsap } from 'gsap';
if (import.meta.env.DEV) window.__gsap = gsap; // lets preview recordings slow every tween
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

// What this page's line light says at rest (the header renders it per page).
let restingStatus = null;
const pageStatus = () => restingStatus ?? 'Locked · 2600 Hz';

export function setStatus(state, label) {
  restingStatus ??= $('[data-status-label]')?.textContent ?? null;
  const el = $('.sg-status');
  if (!el) return;
  if (state) el.dataset.state = state;
  else delete el.dataset.state;
  const text = $('[data-status-label]', el);
  if (text) text.textContent = label;
}

/* Pages without the engine still speak the language: 2600 Hz, a flash, the status light. */
const ROUTES = { work: '/work/', lab: '/lab/', notes: '/notes/', about: '/about/', log: '/about/', home: '/', top: '#page-top', contact: '#contact' };
setHooks({
  seize() {
    sfx.seize(); flash(0.8);
    setStatus('seized', 'Line seized');
    setTimeout(() => setStatus('locked', pageStatus()), 2400);
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
  const setOpen = (open) => {
    menu?.setAttribute('aria-expanded', String(open));
    if (menu) menu.textContent = open ? 'Close' : 'Menu';
    if (panel) panel.dataset.open = String(open);
  };
  menu?.addEventListener('click', () => setOpen(menu.getAttribute('aria-expanded') !== 'true'));
  panel?.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  header.addEventListener('focusout', (e) => { if (panel?.dataset.open === 'true' && !header.contains(e.relatedTarget)) setOpen(false); });
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
/* Arrival: the shell path types itself, the title's accent word decodes from noise,
   and navigation labels flicker when a pointer finds them. Text is always in the HTML;
   this only plays over it. */
function initBoot() {
  if (!motionOn()) return;
  $$('.pg-path').forEach((path) => {
    const steps = Math.max(8, Math.round(path.textContent.trim().length * 0.8));
    gsap.fromTo(path, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 0.55, ease: `steps(${steps})`, delay: 0.15, clearProps: 'clipPath' });
  });
  $$('.pg-open h1 em').forEach((em) => decode(em, { duration: 1.1 }));
  // Readout values tick over like a counter settling.
  $$('.pg-open .pg-readout b, .case-hero__meta b').forEach((value, i) => {
    const text = value.textContent;
    gsap.to(value, { duration: 0.8, delay: 0.25 + i * 0.08, scrambleText: { text, chars: '0123456789', speed: 0.6 }, ease: 'none' });
  });
  $$('.sg-nav a, .sg-foot__nav a').forEach((link) => {
    const text = link.textContent;
    link.addEventListener('pointerenter', () => {
      if (!motionOn()) return;
      gsap.to(link, { duration: 0.35, scrambleText: { text, chars: '▓▒░01', speed: 1 }, ease: 'none', overwrite: 'auto' });
    });
  });
}

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
/* Hang up, from the line key (back to top): the handset goes down, the picture switches off
   like a CRT into the idle 2600 Hz trace, the trace flattens to a dot, the page returns to the
   top underneath, and the line comes back. It only plays from more than two screens down;
   nearer the top, and without motion (or JavaScript), the key is an ordinary jump to the top. */
function initHangup() {
  const links = $$('[data-hangup]');
  if (!links.length) return;
  let fx = null;
  let busy = false;
  let passthrough = false;
  const W = 1200;
  const H = 80;
  const build = () => {
    const el = document.createElement('div');
    el.className = 'sg-hang';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `<i class="sg-hang__shutter sg-hang__shutter--top"></i><i class="sg-hang__shutter sg-hang__shutter--bottom"></i>
      <svg class="sg-hang__trace" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none"><path /></svg>
      <b class="sg-hang__dot"></b><p class="sg-hang__label"></p>`;
    document.body.append(el);
    return el;
  };
  // 26 cycles across the screen: a nod to 2600, drawn at whatever amplitude the line has left.
  const draw = (path, a) => {
    let d = '';
    for (let x = 0; x <= W; x += 6) d += `${x ? 'L' : 'M'}${x} ${(H / 2 - Math.sin((x / W) * 26 * Math.PI * 2) * a * (H / 2 - 6)).toFixed(1)}`;
    path.setAttribute('d', d);
  };
  const status = $('.sg-status');
  const restStatus = status ? [status.dataset.state, $('[data-status-label]', status)?.textContent ?? ''] : null;

  const play = (link) => {
    fx ??= build();
    const [top, bottom] = $$('.sg-hang__shutter', fx);
    const trace = $('.sg-hang__trace', fx);
    const path = $('path', trace);
    const dot = $('.sg-hang__dot', fx);
    const label = $('.sg-hang__label', fx);
    const amp = { a: 0.9 };
    draw(path, amp.a);
    setStatus('idle', 'Line idle');
    return gsap.timeline({ defaults: { ease: 'power3.in' } })
      .set(fx, { visibility: 'visible', '--edge': 1 })
      .set(trace, { scaleX: 1, opacity: 0 })
      .set(label, { opacity: 1, textContent: '' })
      .fromTo(top, { yPercent: -101 }, { yPercent: 0, duration: 0.32 }, 0)
      .fromTo(bottom, { yPercent: 101 }, { yPercent: 0, duration: 0.32 }, 0)
      .to(trace, { opacity: 1, duration: 0.1, ease: 'none' }, 0.05)
      .to(amp, { a: 0, duration: 0.34, ease: 'power2.in', onUpdate: () => draw(path, amp.a) }, 0.08)
      .to(label, { duration: 0.3, scrambleText: { text: 'Line idle · 2600 Hz', chars: '0123456789', speed: 0.6 }, ease: 'none' }, 0.12)
      .to(trace, { scaleX: 0.004, duration: 0.18, ease: 'power4.in' }, 0.36)
      .to(fx, { '--edge': 0, duration: 0.12, ease: 'none' }, 0.36)
      .fromTo(dot, { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.08, ease: 'power2.out' }, 0.5)
      .set(trace, { opacity: 0 }, 0.54)
      .add(() => {
        // Jump natively under the cover, so focus and the address behave exactly as without
        // JavaScript. Smooth scrolling stays off until the picture is back.
        root.style.scrollBehavior = 'auto';
        passthrough = true;
        link.click();
        passthrough = false;
        scrollTo({ top: 0, behavior: 'instant' });
      }, 0.54)
      .to(dot, { scale: 0, opacity: 0, duration: 0.2, ease: 'power2.in' }, 0.62)
      .to(label, { opacity: 0, duration: 0.2, ease: 'none' }, 0.62)
      .set(fx, { '--edge': 1 }, 0.66)
      .to(top, { yPercent: -101, duration: 0.36, ease: 'power3.out' }, 0.66)
      .to(bottom, { yPercent: 101, duration: 0.36, ease: 'power3.out' }, 0.66)
      .set(fx, { visibility: 'hidden' })
      .add(() => {
        root.style.scrollBehavior = '';
        // Back to the page's own status, unless something else has taken the line since.
        if (restStatus) setTimeout(() => { if (status.dataset.state === 'idle') setStatus(...restStatus); }, 1800);
      });
  };

  links.forEach((link) => link.addEventListener('click', (e) => {
    if (passthrough) return;
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (!motionOn() || busy || scrollY < innerHeight * 2) return;
    e.preventDefault();
    busy = true;
    sfx.hangup();
    // Touch has no hover: show the handset, put it down, then hang up.
    link.classList.add('is-hanging', 'is-down');
    setTimeout(() => {
      link.classList.remove('is-down');
      play(link).then(() => { busy = false; link.classList.remove('is-hanging'); });
    }, 180);
  }));
}

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
  initBoot();
  onKonami(() => hooks.phreak());
  initEggs();
  initHangup();
  consoleHello();
  // Hidden tab keeps the name; only the state changes.
  const title = document.title;
  document.addEventListener('visibilitychange', () => { document.title = document.hidden ? 'Line idle · Pranshul Chandhok' : title; });
}
