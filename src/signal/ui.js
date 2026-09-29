import { gsap } from 'gsap';
import { createLoop } from './env.js';
import { sound, sfx, carrierFollow, carrierRelease } from './audio.js';
import { decode, toast, flash } from './fx.js';
import { unlock } from './eggs.js';
import { setStatus } from './chrome.js';

export { setStatus };
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const motionOn = () => document.documentElement.dataset.motion === 'on';
export const LOCK_HZ = 2600;

/* ---------------- Tuner ---------------- */
export function initTuner(engine) {
  const tuner = $('[data-tuner]');
  const input = $('[data-tune]');
  const readout = $('[data-freq]');
  const lockLabel = $('[data-lock-label]');
  const scope = $('[data-tuner-scope]');
  const ctx = scope.getContext('2d');
  const ticksEl = $('[data-ticks]');
  const TICKS = 41;
  for (let i = 0; i < TICKS; i++) {
    const t = document.createElement('i');
    if (i === Math.round(((LOCK_HZ - 2000) / 1200) * (TICKS - 1))) t.className = 'is-target';
    ticksEl.append(t);
  }
  const ticks = $$('i', ticksEl);
  // HTML ships the settled state (2600 Hz, locked); the intro only runs when the engine does.
  const tuning = { hz: LOCK_HZ, shown: LOCK_HZ, locked: true, intro: false };

  const setReadout = (hz) => { readout.textContent = hz.toFixed(1).padStart(6, '0'); };
  const detuneFor = (hz) => { const off = Math.abs(hz - LOCK_HZ); return off < 6 ? 0 : Math.min(1, Math.pow(off / 500, 0.7)); };

  function setLocked(locked, { silent = false, user = false } = {}) {
    if (locked === tuning.locked) return;
    tuning.locked = locked;
    tuner.dataset.locked = String(locked);
    lockLabel.textContent = locked ? 'Locked' : 'Searching';
    setStatus(locked ? 'locked' : 'tuning', locked ? 'Locked · 2600 Hz' : 'Tuning');
    if (locked && !silent) {
      sfx.lock();
      if (motionOn()) {
        gsap.fromTo(ticks, { scaleY: 1.9 }, { scaleY: 1, duration: 0.6, ease: 'elastic.out(1, 0.4)', stagger: { each: 0.012, from: 'center' } });
        gsap.fromTo(readout, { scale: 1.06 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' });
      }
      if (user) { try { navigator.vibrate?.(8); } catch { /* not allowed */ } }
    }
  }

  input.addEventListener('input', () => {
    let hz = Number(input.value);
    if (Math.abs(hz - LOCK_HZ) < 14) hz = LOCK_HZ;
    tuning.hz = hz; tuning.intro = false;
    engine.state.targetDetune = detuneFor(hz);
    setReadout(hz);
    input.setAttribute('aria-valuetext', `${hz} hertz${hz === LOCK_HZ ? ', locked' : ''}`);
    setLocked(hz === LOCK_HZ, { user: true });
    carrierFollow(hz);
    engine.wake();
    scopeLoop.wake();
  });
  input.addEventListener('change', carrierRelease);
  input.addEventListener('pointerup', carrierRelease);

  $('[data-seize]').addEventListener('click', () => {
    if (tuning.hz === LOCK_HZ) {
      sfx.seize();
      engine.seize();
      flash(0.8);
      setStatus('seized', 'Line seized');
      toast(sound.enabled ? '2600 Hz sent. Line seized.' : 'Line seized. Turn sound on to hear 2600 Hz.');
      setTimeout(() => setStatus('locked', 'Locked · 2600 Hz'), 2400);
      setTimeout(() => unlock('seize'), 3700);
    } else {
      sfx.denied();
      toast('No trunk. Tune the carrier to 2600 Hz first.');
      if (motionOn()) gsap.fromTo(tuner, { x: -6 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
    }
  });

  // Live scope: clean sine when locked, noisy and drifting when detuned.
  let phase = 0;
  function drawScope(dt) {
    const w = scope.width; const h = scope.height;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(234,232,225,0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= w; x += w / 8) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke();
    const d = engine.state.detune;
    phase += (dt || 0.016) * (6 + d * 20);
    const cycles = tuning.shown / 400;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const u = x / w;
      const jitter = (Math.random() - 0.5) * d * h * 0.5;
      const y = h / 2 + Math.sin(u * Math.PI * 2 * cycles - phase) * h * 0.32 * (1 - d * 0.3) + jitter;
      x ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    }
    const locked = tuning.locked && !tuning.intro;
    ctx.strokeStyle = locked ? '#9db6ff' : `rgba(157,182,255,${0.55 + (1 - d) * 0.3})`;
    ctx.shadowColor = '#4d74ff'; ctx.shadowBlur = locked ? 10 : 4;
    ctx.lineWidth = 1.6;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  const scopeLoop = createLoop(scope, (_t, dt) => {
    // Intro: count up with the engine's assembly, then lock.
    if (tuning.intro) {
      const a = engine.state.assemble;
      tuning.shown = 1200 + (LOCK_HZ - 1200) * (1 - Math.pow(1 - a, 3));
      setReadout(tuning.shown);
      if (a >= 1) { tuning.intro = false; tuning.shown = LOCK_HZ; setReadout(LOCK_HZ); setLocked(true); }
    } else tuning.shown = tuning.hz;
    drawScope(dt);
  }, () => motionOn() || tuning.intro);
  scopeLoop.renderOnce();

  return {
    startIntro() {
      tuning.intro = true; tuning.locked = false; tuner.dataset.locked = 'false'; lockLabel.textContent = 'Searching';
      setStatus('idle', 'Listening');
      scopeLoop.wake();
    },
    finishIntro() {
      if (!tuning.intro) return;
      tuning.intro = false; tuning.shown = LOCK_HZ; setReadout(LOCK_HZ); setLocked(true, { silent: true });
      drawScope(0);
    },
    wake: () => scopeLoop.wake(),
  };
}

/* ---------------- Work: lines + channel monitor ---------------- */
export function initLines() {
  const lines = $$('.sg-line');
  const channels = $$('[data-channel]');
  const staticCanvas = $('[data-static]');
  const sctx = staticCanvas.getContext('2d');
  const noNo = $('[data-monitor-no]');
  const title = $('[data-monitor-title]');
  const rec = $('[data-monitor-rec]');
  let active = -1;
  let staticRaf = 0;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const playBtn = $('[data-monitor-play]');
  playBtn.addEventListener('click', () => {
    const video = channels[active]?.querySelector('video');
    if (!video) return;
    const play = video.paused;
    if (play) video.play().catch(() => {}); else video.pause();
    playBtn.setAttribute('aria-pressed', String(play));
    playBtn.textContent = play ? 'Pause loop' : 'Play loop';
    rec.dataset.live = String(play);
  });

  lines.forEach((line, i) => {
    const cycles = [6, 9, 12, 5, 8, 11][i] ?? 7;
    let d = '';
    for (let x = 0; x <= 480; x += 3) d += `${x ? 'L' : 'M'}${x} ${(12 + Math.sin((x / 240) * cycles * Math.PI * 2) * 8).toFixed(2)}`;
    line.querySelector('path').setAttribute('d', d);
    line.querySelector('a').dataset.cursorText = 'Open case';
  });

  function burstStatic(ms = 260) {
    cancelAnimationFrame(staticRaf);
    const img = sctx.createImageData(staticCanvas.width, staticCanvas.height);
    const end = performance.now() + ms;
    staticCanvas.style.opacity = '0.85';
    const tick = (now) => {
      for (let p = 0; p < img.data.length; p += 4) {
        const v = Math.random() * 255;
        img.data[p] = v * 0.8; img.data[p + 1] = v * 0.85; img.data[p + 2] = v; img.data[p + 3] = 255;
      }
      sctx.putImageData(img, 0, 0);
      if (now < end) staticRaf = requestAnimationFrame(tick);
      else staticCanvas.style.opacity = '0';
    };
    staticRaf = requestAnimationFrame(tick);
  }

  function activate(i, { fromUser = true } = {}) {
    if (i === active) return;
    active = i;
    lines.forEach((l, j) => l.classList.toggle('is-active', j === i));
    channels.forEach((ch, j) => {
      const on = j === i;
      const video = ch.querySelector('video');
      if (on) {
        ch.classList.remove('is-tuning'); void ch.offsetWidth;
        if (motionOn()) ch.classList.add('is-tuning');
        if (video && fine && motionOn()) video.play().catch(() => {});
      } else video?.pause();
      ch.classList.toggle('is-on', on);
    });
    const line = lines[i];
    noNo.textContent = String(i + 1).padStart(2, '0');
    decode(title, { text: line.querySelector('.sg-line__title').textContent, duration: 0.45 });
    // Honest media labels: Loop (authentic recording), Capture (real UI), Illustration (editorial).
    const kind = channels[i].dataset.kind;
    const video = channels[i].querySelector('video');
    const playing = Boolean(video) && fine && motionOn();
    rec.dataset.live = String(playing);
    rec.querySelector('span').textContent = kind;
    playBtn.hidden = !video || playing;
    playBtn.setAttribute('aria-pressed', 'false');
    playBtn.textContent = 'Play loop';
    if (motionOn()) burstStatic();
    if (fromUser) { sfx.channel(); sfx.mf(line.dataset.mf); }
  }

  lines.forEach((line, i) => {
    line.addEventListener('pointerenter', () => fine && activate(i));
    line.addEventListener('focusin', () => activate(i));
  });
  // Phones: the monitor sits on top; lines tune as they cross the middle of the screen.
  if (!fine) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) activate(lines.indexOf(e.target), { fromUser: false }); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    lines.forEach((l) => io.observe(l));
  }
  activate(0, { fromUser: false });
}

/* ---------------- Log: four waveforms on one strip ---------------- */
export function initLog() {
  const canvas = $('[data-log-wave]');
  const ctx = canvas.getContext('2d');
  const eras = $$('.sg-era');
  let hover = -1;
  let t = 0;
  const kinds = ['square', 'sine', 'saw', 'ai'];
  const wave = (kind, x, ph, seg) => {
    const s = Math.sin(x * Math.PI * 2 - ph);
    if (kind === 'square') return Math.sign(s) * 0.8;
    if (kind === 'saw') return ((((x - ph / (Math.PI * 2)) % 1) + 1) % 1) * 2 - 1;
    if (kind === 'ai') {
      const resolve = Math.min(1, Math.max(0, (seg - 0.15) / 0.7));
      return s * resolve + (Math.random() - 0.5) * 1.6 * (1 - resolve);
    }
    return s;
  };
  function draw(dt) {
    const pr = Math.min(devicePixelRatio || 1, 2);
    const w = canvas.clientWidth; const h = canvas.clientHeight;
    if (canvas.width !== Math.round(w * pr)) { canvas.width = Math.round(w * pr); canvas.height = Math.round(h * pr); }
    ctx.setTransform(pr, 0, 0, pr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    t += (dt || 0.016);
    const vertical = w < 700;
    const segW = w / 4;
    for (let s = 0; s < 4; s++) {
      const x0 = s * segW;
      const hot = hover === s;
      ctx.fillStyle = hot ? 'rgba(77,116,255,0.08)' : 'transparent';
      ctx.fillRect(x0, 0, segW, h);
      ctx.beginPath();
      for (let x = 0; x <= segW; x += 2) {
        const u = x / segW;
        const y = h / 2 - wave(kinds[s], u * (vertical ? 3 : 5), t * (hot ? 5 : 2.2), u) * h * (hot ? 0.34 : 0.26);
        x ? ctx.lineTo(x0 + x, y) : ctx.moveTo(x0 + x, y);
      }
      ctx.strokeStyle = hot ? '#9db6ff' : s === 3 ? 'rgba(232,180,90,0.85)' : 'rgba(157,182,255,0.7)';
      ctx.shadowColor = '#4d74ff'; ctx.shadowBlur = hot ? 12 : 4;
      ctx.lineWidth = hot ? 2 : 1.4;
      ctx.stroke();
      ctx.shadowBlur = 0;
      if (s) { ctx.fillStyle = 'rgba(234,232,225,0.14)'; ctx.fillRect(x0, 0, 1, h); }
    }
    // Playhead sweeping across the eras.
    const head = ((t * 0.08) % 1) * w;
    ctx.fillStyle = 'rgba(232,180,90,0.6)';
    ctx.fillRect(head, 0, 1, h);
  }
  const loop = createLoop(canvas, (_time, dt) => draw(dt), motionOn);
  eras.forEach((era, i) => {
    const enter = () => { hover = i; eras.forEach((e, j) => e.classList.toggle('is-active', j === i)); sfx.era(kinds[i]); loop.renderOnce(); };
    era.addEventListener('pointerenter', enter);
    era.addEventListener('focusin', enter);
    era.addEventListener('pointerleave', () => { hover = -1; era.classList.remove('is-active'); loop.renderOnce(); });
  });
  new ResizeObserver(() => draw(0)).observe(canvas);
  return loop;
}

/* ---------------- Proof meters ---------------- */
export function animateMeter(el) {
  // Only real quantities count up; years and identifiers stay as written.
  if (!el.dataset.count) return;
  const target = Number(el.dataset.count);
  const suffix = el.dataset.suffix ?? '';
  if (!motionOn()) { el.textContent = `${target}${suffix}`; return; }
  const width = String(target).length;
  const obj = { v: 0 };
  gsap.to(obj, {
    v: target, duration: 1.6, ease: 'power3.out',
    onUpdate: () => { el.textContent = `${String(Math.round(obj.v)).padStart(width, '0')}${suffix}`; },
  });
}

/* ---------------- Blue box ---------------- */
export function initBlueBox(engine) {
  const display = $('[data-box-display]');
  const screen = display.parentElement;
  const soundBtn = $('[data-box-sound]');
  const box = $('[data-box]');
  // `entry` collects digits dialled outside a KP…ST sequence, like a calculator,
  // so typing 2 6 0 0 works as well as the 2600 key. `routing` is the KP number.
  let seized = false; let routing = null; let entry = '';
  const show = (text, state = '') => { display.textContent = text; screen.dataset.state = state; };
  const keyFor = (key) => box.querySelector(`[data-key="${key}"]`);

  function seize() {
    seized = true; routing = null; entry = '';
    show('2600 · SEIZED', 'seized');
    engine?.seize(); setStatus('seized', 'Line seized');
    setTimeout(() => unlock('seize'), 1200);
  }

  function press(key, btn) {
    sfx.mf(key);
    if (btn && motionOn()) { btn.classList.add('is-down'); setTimeout(() => btn.classList.remove('is-down'), key === '2600' ? 420 : 140); }
    if (key === '2600') { seize(); return; }
    if (key === 'KP') { routing = ''; entry = ''; show(seized ? 'KP_' : 'KP · NO TRUNK'); return; }
    if (key === 'ST') {
      const secret = { 1337: ['ELITE · 1337', 'leet'], 2600: ['HELLO, PHREAK'] }[routing];
      if (seized && secret) {
        show(secret[0], 'seized'); flash(0.6);
        if (secret[1]) unlock(secret[1]);
      } else if (seized && routing !== null && routing.length) {
        show('ROUTED ▸ 2600TH', 'seized');
        flash(1);
        toast('Call routed. You found the line: 2600th@gmail.com', 4200);
        setTimeout(() => show('2600TH@GMAIL.COM', 'seized'), 1400);
        setTimeout(() => setStatus('locked', 'Locked · 2600 Hz'), 3000);
        setTimeout(() => unlock('routed'), 4400);
      } else {
        sfx.denied(); show(seized ? 'KP FIRST' : 'SEIZE FIRST · 2600');
      }
      seized = false; routing = null; entry = '';
      return;
    }
    if (routing !== null) { routing = (routing + key).slice(-10); show(`KP ${routing}_`); return; }
    entry = (entry + key).slice(-12);
    if (entry.endsWith('2600')) { seize(); return; }
    show(entry, seized ? 'seized' : '');
  }

  function erase(all) {
    if (routing !== null) { routing = all ? '' : routing.slice(0, -1); show(`KP ${routing}_`); return; }
    entry = all ? '' : entry.slice(0, -1);
    show(entry || (seized ? '2600 · SEIZED' : 'READY'), seized ? 'seized' : '');
  }

  $$('[data-key]').forEach((btn) => {
    btn.dataset.cursorText = 'Dial';
    btn.addEventListener('click', () => press(btn.dataset.key, btn));
  });

  // Keyboard dialling while focus is inside the box: digits, K for KP, S or # for ST.
  box.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase();
    const key = /^[0-9]$/.test(k) ? k : k === 'k' || k === '*' ? 'KP' : k === 's' || k === '#' ? 'ST' : null;
    if (key) { e.preventDefault(); press(key, keyFor(key)); return; }
    if (k === 'backspace' || k === 'delete') { e.preventDefault(); erase(false); }
    else if (k === 'escape') { e.preventDefault(); erase(true); }
  });

  const syncSound = (on) => {
    soundBtn.textContent = on ? 'Tones on' : 'Tones off · turn sound on';
    soundBtn.setAttribute('aria-pressed', String(on));
  };
  soundBtn.addEventListener('click', () => { $('[data-sound-toggle]').click(); });
  sound.onChange(syncSound);
  syncSound(sound.enabled);

  // The box leans toward the pointer.
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const wrap = $('[data-box-wrap]');
    wrap.addEventListener('pointermove', (e) => {
      if (!motionOn()) return;
      const r = wrap.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5; const py = (e.clientY - r.top) / r.height - 0.5;
      box.style.transform = `rotateX(${16 - py * 14}deg) rotateY(${-14 + px * 20}deg) rotateZ(1deg)`;
    });
    wrap.addEventListener('pointerleave', () => { box.style.transform = ''; });
  }
}

/* ---------------- Section dial + nav state ---------------- */
export function initDial() {
  const links = $$('.sg-dial a');
  const navLinks = $$('.sg-nav a');
  const sections = links.map((a) => document.querySelector(a.getAttribute('href')));
  const dial = $('[data-dial]');
  const update = () => {
    dial.dataset.visible = String(scrollY > innerHeight * 0.7);
    let current = 0;
    sections.forEach((s, i) => { if (s && s.getBoundingClientRect().top < innerHeight * 0.45) current = i; });
    links.forEach((a, i) => a.setAttribute('aria-current', String(i === current)));
    const id = sections[current]?.id;
    navLinks.forEach((a) => a.setAttribute('aria-current', String(a.getAttribute('href') === `#${id}`)));
  };
  addEventListener('scroll', update, { passive: true });
  addEventListener('resize', update);
  update();
}
