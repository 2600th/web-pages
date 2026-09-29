// Every sound on the page is synthesized: no audio files, nothing plays until
// the visitor turns sound on (the blue box keys are the one explicit exception
// the visitor opts into by pressing them, and they still respect the toggle).

// Bell System MF signalling: each key is two of six tones.
export const MF = {
  1: [700, 900], 2: [700, 1100], 3: [900, 1100], 4: [700, 1300], 5: [900, 1300],
  6: [1100, 1300], 7: [700, 1500], 8: [900, 1500], 9: [1100, 1500], 0: [1300, 1500],
  KP: [1100, 1700], ST: [1500, 1700], 2600: [2600],
};

let ctx = null;
let master = null;
let carrier = null;
let enabled = false;
const listeners = new Set();

function ensure() {
  if (ctx) return ctx;
  ctx = new (window.AudioContext || /** @type {any} */ (window).webkitAudioContext)();
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -18;
  master = ctx.createGain();
  master.gain.value = 0.55;
  master.connect(comp).connect(ctx.destination);
  return ctx;
}

export const sound = {
  get enabled() { return enabled; },
  onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  set(on) {
    enabled = on;
    if (on) { ensure(); ctx.resume(); }
    else stopCarrier();
    listeners.forEach((fn) => fn(on));
  },
};

function env(gainNode, t, attack, hold, release, peak) {
  gainNode.gain.cancelScheduledValues(t);
  gainNode.gain.setValueAtTime(0, t);
  gainNode.gain.linearRampToValueAtTime(peak, t + attack);
  gainNode.gain.setValueAtTime(peak, t + attack + hold);
  gainNode.gain.linearRampToValueAtTime(0, t + attack + hold + release);
}

/** Play one or more sine tones together. */
export function tones(freqs, { dur = 0.12, gain = 0.09, type = 'sine', delay = 0 } = {}) {
  if (!enabled) return;
  ensure();
  const t = ctx.currentTime + delay;
  const g = ctx.createGain();
  g.connect(master);
  env(g, t, 0.006, dur, 0.03, gain / Math.sqrt(freqs.length));
  for (const f of freqs) {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.value = f;
    o.connect(g);
    o.start(t);
    o.stop(t + dur + 0.06);
  }
}

function noise(dur, { gain = 0.05, freq = 2400, q = 0.8, delay = 0 } = {}) {
  if (!enabled) return;
  ensure();
  const t = ctx.currentTime + delay;
  const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
  const buffer = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  filter.Q.value = q;
  const g = ctx.createGain();
  env(g, t, 0.004, dur * 0.6, dur * 0.4, gain);
  src.connect(filter).connect(g).connect(master);
  src.start(t);
}

export const sfx = {
  tick() { tones([3200], { dur: 0.008, gain: 0.025, type: 'square' }); },
  lock() { tones([1300], { dur: 0.05, gain: 0.05 }); tones([2600], { dur: 0.09, gain: 0.05, delay: 0.06 }); },
  dialTone() { tones([350, 440], { dur: 0.7, gain: 0.08 }); },
  mf(key) { const f = MF[key]; if (f) tones(f, { dur: key === '2600' ? 0.9 : key === 'KP' ? 0.1 : 0.068, gain: 0.1 }); },
  seize() {
    tones([2600], { dur: 0.95, gain: 0.08 });
    // The trunk "kerchunk": a thump and a burst as the far switch lets go.
    tones([95], { dur: 0.06, gain: 0.2, type: 'triangle', delay: 1.02 });
    noise(0.12, { gain: 0.06, freq: 900, delay: 1.02 });
  },
  channel() { noise(0.22, { gain: 0.045, freq: 3200, q: 0.4 }); },
  denied() { tones([480, 620], { dur: 0.25, gain: 0.07 }); tones([480, 620], { dur: 0.25, gain: 0.07, delay: 0.5 }); },
  era(kind) {
    const map = { square: ['square', 330], sine: ['sine', 440], saw: ['sawtooth', 392], ai: ['triangle', 523] };
    const [type, f] = map[kind] ?? map.sine;
    tones([f], { dur: 0.16, gain: 0.05, type });
    if (kind === 'ai') noise(0.1, { gain: 0.03, freq: 4000 });
  },
};

/** A continuous carrier that follows the tuner while it is being dragged. */
export function carrierFollow(hz) {
  if (!enabled) return;
  ensure();
  if (!carrier) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    g.gain.value = 0;
    o.type = 'sine';
    o.connect(g).connect(master);
    o.start();
    carrier = { o, g };
  }
  carrier.o.frequency.setTargetAtTime(hz, ctx.currentTime, 0.015);
  carrier.g.gain.setTargetAtTime(0.045, ctx.currentTime, 0.04);
}
export function carrierRelease() {
  if (carrier) carrier.g.gain.setTargetAtTime(0, ctx.currentTime, 0.1);
}
function stopCarrier() {
  if (carrier && ctx) carrier.g.gain.setTargetAtTime(0, ctx.currentTime, 0.02);
}
