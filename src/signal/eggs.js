// Easter eggs, tracked as achievements. Nothing here blocks content or is
// required to use the page; everything is keyboard reachable.
import { gsap } from 'gsap';
import { sound, sfx, tones, MF } from './audio.js';
import { toast } from './fx.js';

export const ACHIEVEMENTS = [
  ['seize', 'Seized the line'],
  ['console', 'Opened the console'],
  ['phreak', 'Phreak mode'],
  ['whistle', 'Blew the whistle'],
  ['leet', 'Dialed 1337'],
  ['routed', 'Routed a call'],
  ['devtools', 'Hacked it from devtools'],
];
const KEY = '2600th-achievements';
const KEYS = '2600th-shortcuts';
let shortcutsOn = (() => { try { return localStorage.getItem(KEYS) !== 'off'; } catch { return true; } })();
const found = new Set((() => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } })());

export function unlock(id) {
  const entry = ACHIEVEMENTS.find(([key]) => key === id);
  if (!entry || found.has(id)) return;
  found.add(id);
  try { localStorage.setItem(KEY, JSON.stringify([...found])); } catch { /* private mode */ }
  tones([1300], { dur: 0.06, gain: 0.05 }); tones([1700], { dur: 0.09, gain: 0.05, delay: 0.07 }); tones([2600], { dur: 0.12, gain: 0.04, delay: 0.16 });
  toast(`Achievement ${found.size}/${ACHIEVEMENTS.length} · ${entry[1]}`, 3600);
}

/** Wiring for effects the eggs trigger, supplied by main. */
export const hooks = { seize() {}, phreak() {}, goto() { return false; } };
export function setHooks(h) { Object.assign(hooks, h); }

/* ---------------- Toy whistle: click the logo five times ---------------- */
function whistle() {
  if (sound.enabled) {
    tones([2600], { dur: 0.7, gain: 0.07 });
    tones([2612], { dur: 0.7, gain: 0.02 });
  }
  toast(sound.enabled ? 'Toy whistle: 2600 Hz. Please do not blow this into a 1970s payphone.' : 'Toy whistle blown. Turn sound on to hear 2600 Hz.', 4200);
  unlock('whistle');
}

/* ---------------- Drop-down console ---------------- */
const LOGO = [
  "██████╗   ██████╗   ██████╗   ██████╗  th",
  "╚════██╗ ██╔════╝  ██╔═████╗ ██╔═████╗",
  " █████╔╝ ███████╗  ██║██╔██║ ██║██╔██║",
  "██╔═══╝  ██╔═══██╗ ████╔╝██║ ████╔╝██║",
  "███████╗ ╚██████╔╝ ╚██████╔╝ ╚██████╔╝",
  "╚══════╝  ╚═════╝   ╚═════╝   ╚═════╝",
];
const HELP = [
  ['help', 'this list'], ['whoami', 'who runs this line'], ['neofetch', 'system info'], ['ls', 'list sections'],
  ['cd <section>', 'go to work, lab, notes, about or contact'], ['man 2600', 'the tone behind the name'],
  ['dial <digits>', 'play MF tones, e.g. dial 1337'], ['seize', 'send 2600 Hz'], ['phreak', 'toggle phreak mode'],
  ['ping', 'check the line'], ['achievements', 'what you have found'], ['sound on|off', 'toggle audio'], ['clear', 'clear the screen'], ['exit', 'close'],
];

function buildConsole() {
  const el = document.createElement('section');
  el.className = 'sg-console';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-modal', 'true');
  el.setAttribute('aria-label', 'Console');
  el.hidden = true;
  el.innerHTML = `
    <header class="sg-console__bar">
      <p class="sg-console__title"><i aria-hidden="true"></i>guest@2600th · tty2600</p>
      <p class="sg-console__hint">Tab completes · ↑ history · Esc closes</p>
      <button type="button" class="sg-console__close" data-console-close>Close</button>
    </header>
    <div class="sg-console__log" role="log" aria-live="polite" data-console-log></div>
    <form class="sg-console__line" data-console-form>
      <label for="sg-console-input">guest@2600th:~$</label>
      <input id="sg-console-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" data-console-input />
    </form>`;
  document.body.append(el);
  return el;
}

export function initEggs() {
  const panel = buildConsole();
  const log = panel.querySelector('[data-console-log]');
  const form = panel.querySelector('[data-console-form]');
  const input = panel.querySelector('[data-console-input]');
  const history = [];
  let hIndex = 0;
  let lastFocus = null;
  let greeted = false;

  const append = (node) => { log.append(node); log.scrollTop = log.scrollHeight; };
  const print = (text, cls = '') => {
    const line = document.createElement('pre');
    line.className = cls;
    line.textContent = text;
    append(line);
  };
  // Two-column output as a real list, so descriptions wrap in their own column on phones.
  const rows = (pairs) => {
    const dl = document.createElement('dl');
    dl.className = 'sg-console__rows';
    pairs.forEach(([term, detail]) => {
      const dt = document.createElement('dt'); dt.textContent = term;
      const dd = document.createElement('dd'); dd.textContent = detail;
      dl.append(dt, dd);
    });
    append(dl);
  };

  // While open, the console is modal: everything else is inert, so focus, clicks and
  // screen readers stay inside it until it closes.
  let inerted = [];
  const setModal = (on) => {
    if (on) {
      inerted = [...document.body.children].filter((node) => node !== panel && !node.matches('.sg-toast, script') && !node.inert);
      inerted.forEach((node) => { node.inert = true; });
    } else {
      inerted.forEach((node) => { node.inert = false; });
      inerted = [];
    }
  };

  function open() {
    if (!panel.hidden) return;
    lastFocus = document.activeElement;
    gsap.killTweensOf(panel);
    gsap.set(panel, { clearProps: 'transform' });
    panel.hidden = false;
    setModal(true);
    if (document.documentElement.dataset.motion === 'on') gsap.fromTo(panel, { yPercent: -100 }, { yPercent: 0, duration: 0.35, ease: 'power3.out' });
    if (!greeted) {
      greeted = true;
      print(LOGO.join('\n'), 'is-logo');
      print('2600th console · type help');
    }
    unlock('console');
    input.focus();
    sfx.tick();
  }
  function close() {
    if (panel.hidden) return;
    setModal(false);
    const done = () => { panel.hidden = true; gsap.set(panel, { clearProps: 'transform' }); lastFocus?.focus?.(); };
    if (document.documentElement.dataset.motion === 'on') gsap.to(panel, { yPercent: -100, duration: 0.25, ease: 'power2.in', onComplete: done });
    else done();
  }

  const commands = {
    help: () => rows(HELP),
    whoami: () => print('Pranshul Chandhok (2600th)\nVP Product & Technology, Interior Company at Square Yards.\nGurugram, India.'),
    neofetch: () => {
      const info = [
        'guest@2600th', '------------', 'Name: Pranshul Chandhok', 'Handle: 2600th', 'Role: VP Product & Technology',
        'Uptime: 14+ years', 'Eras: games, XR, design software, AI', 'Stack: TypeScript, Three.js, C++, Unity', 'Patent: IN 395331', 'Shell: curiosity',
      ];
      // Logo and details side by side, stacking when the window is narrow.
      const wrap = document.createElement('div');
      wrap.className = 'sg-console__fetch';
      const art = document.createElement('pre'); art.textContent = LOGO.join('\n');
      const text = document.createElement('pre'); text.textContent = info.join('\n');
      wrap.append(art, text);
      append(wrap);
    },
    ls: () => print('work/   lab/   notes/   about/   contact   README.md'),
    cat: (arg) => arg === 'README.md'
      ? print('I learn by building. This site is one of those builds:\na point cloud, a CRT shader and a synthesized phone network.')
      : print(`cat: ${arg || ''}: No such file`),
    cd: (arg) => {
      const raw = (arg || '').trim();
      const id = raw.replace(/^~\/?|^\//, '').replace(/\/$/, '') || 'home';
      const target = id === '..' ? 'home' : id;
      if (['work', 'log', 'lab', 'notes', 'about', 'contact', 'top', 'home'].includes(target)) { close(); hooks.goto(target); }
      else print(`cd: ${raw}: No such section. Try ls.`);
    },
    man: (arg) => arg === '2600'
      ? print('2600(7)\n\nIn the old North American long-distance network, a 2600 Hz tone meant\n"this trunk is idle". Period: 1/2600 s = 384.6 µs.\nPlay it down a live call and the far switch waits for routing digits,\nsent as MF tone pairs: KP = 1100+1700 Hz, ST = 1500+1700 Hz.\nI first heard about it in a hacking documentary in college. The handle stuck.')
      : print('What manual page do you want? Try: man 2600'),
    dial: (arg) => {
      const digits = (arg || '').replace(/[^0-9]/g, '');
      if (!digits) { print('usage: dial <digits>'); return; }
      const seq = ['KP', ...digits.split(''), 'ST'];
      print(`Dialing ${seq.join(' ')}${sound.enabled ? '' : '  (sound is off: try sound on)'}`);
      seq.forEach((k, i) => setTimeout(() => sfx.mf(k), i * 140));
      if (digits === '1337') setTimeout(() => { print('1337 routed. Welcome, elite.'); unlock('leet'); }, seq.length * 140);
    },
    seize: () => { hooks.seize(); print('2600 Hz sent. Line seized.'); },
    phreak: () => { hooks.phreak(); print('Phreak mode toggled.'); },
    ping: () => {
      print('PING 2600th.com: 56 data bytes');
      [0, 1, 2].forEach((i) => setTimeout(() => {
        print(`64 bytes from 2600th.com: icmp_seq=${i} ttl=26 time=${(26 + Math.random() * 0.4).toFixed(2)} ms`);
        tones([2600], { dur: 0.03, gain: 0.03 });
      }, 300 * (i + 1)));
    },
    uptime: () => print('up 14+ years, load average: games, xr, ai'),
    sudo: () => print('2600th is not in the sudoers file. This incident will be reported.'),
    achievements: () => {
      ACHIEVEMENTS.forEach(([id, name]) => print(`  [${found.has(id) ? 'x' : ' '}] ${found.has(id) ? name : '???'}`));
      print(`  ${found.size}/${ACHIEVEMENTS.length} found`);
    },
    sound: (arg) => {
      const want = arg === 'on' ? true : arg === 'off' ? false : !sound.enabled;
      if (want !== sound.enabled) document.querySelector('[data-sound-toggle]').click();
      print(`sound ${want ? 'on' : 'off'}`);
    },
    clear: () => { log.textContent = ''; },
    exit: () => close(),
    shortcuts: (arg) => { setShortcuts(arg !== 'off'); print(`keyboard shortcuts ${shortcutsOn ? 'on' : 'off'}`); },
    hire: () => print('This is a portfolio, not a job board. Questions and ideas are welcome: 2600th@gmail.com'),
  };
  const names = Object.keys(commands);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const raw = input.value.trim();
    input.value = '';
    if (!raw) return;
    history.push(raw); hIndex = history.length;
    print(raw, 'is-cmd');
    const [cmd, ...rest] = raw.split(/\s+/);
    const fn = commands[cmd.toLowerCase()];
    if (fn) fn(rest.join(' ')); else print(`command not found: ${cmd}. Try help.`);
    sfx.tick();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); hIndex = Math.max(0, hIndex - 1); input.value = history[hIndex] ?? ''; }
    else if (e.key === 'ArrowDown') { e.preventDefault(); hIndex = Math.min(history.length, hIndex + 1); input.value = history[hIndex] ?? ''; }
    else if (e.key === 'Tab' && !e.shiftKey && input.value.trim()) {
      // Complete only a partial command; an empty line keeps normal Tab focus movement.
      const match = names.filter((n) => n.startsWith(input.value.trim().toLowerCase()));
      if (match.length) e.preventDefault();
      if (match.length === 1) input.value = `${match[0]} `;
      else if (match.length > 1) print(match.join('  '));
    } else if (e.key === '`') { e.preventDefault(); close(); }
  });

  // Global keys: backtick opens the console; typing 2600 seizes the line. They never fire
  // while typing in a field or with modifiers, and can be switched off (WCAG 2.1.4).
  let typed = '';
  addEventListener('keydown', (e) => {
    if (!shortcutsOn || e.ctrlKey || e.metaKey || e.altKey || !panel.hidden) return;
    const active = document.activeElement;
    // Fields take their own typing, and the blue box handles its own keypad.
    if (active?.closest('input, textarea, select, [contenteditable]:not([contenteditable="false"]), .sg-box-wrap')) return;
    if (e.key === '`' || e.key === '~') { e.preventDefault(); panel.hidden ? open() : close(); return; }
    if (/^[0-9]$/.test(e.key)) {
      typed = (typed + e.key).slice(-4);
      sfx.mf(e.key);
      if (typed === '2600') { typed = ''; hooks.seize(); toast('You spoke the network’s language. Line seized.'); }
    }
  });
  // Esc and backtick close from anywhere inside; Tab cycles between the close button and the prompt.
  panel.addEventListener('keydown', (e) => {
    if (e.target === input) return;
    if (e.key === 'Escape' || e.key === '`') { e.preventDefault(); close(); }
  });
  panel.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab' || e.defaultPrevented) return;
    const closeBtn = panel.querySelector('[data-console-close]');
    if (!e.shiftKey && document.activeElement === input) { e.preventDefault(); closeBtn.focus(); }
    else if (e.shiftKey && document.activeElement === closeBtn) { e.preventDefault(); input.focus(); }
  });
  // A press on the dimmed page closes the console, as a scrim should.
  document.addEventListener('pointerdown', (e) => { if (!panel.hidden && !panel.contains(e.target)) close(); });
  document.querySelector('[data-console-open]')?.addEventListener('click', open);
  panel.querySelector('[data-console-close]').addEventListener('click', close);
  const keysBtn = document.querySelector('[data-shortcuts]');
  const syncKeys = () => { keysBtn?.setAttribute('aria-pressed', String(shortcutsOn)); if (keysBtn) keysBtn.textContent = `Keyboard shortcuts ${shortcutsOn ? 'on' : 'off'}`; };
  function setShortcuts(on) { shortcutsOn = on; try { localStorage.setItem(KEYS, on ? 'on' : 'off'); } catch { /* private mode */ } syncKeys(); }
  keysBtn?.addEventListener('click', () => setShortcuts(!shortcutsOn));
  syncKeys();

  // Logo: five quick clicks blows the whistle.
  let clicks = [];
  document.querySelector('.sg-mark').addEventListener('click', () => {
    const now = performance.now();
    clicks = clicks.filter((t) => now - t < 2000).concat(now);
    if (clicks.length >= 5) { clicks = []; whistle(); }
  });

  // For the people who open devtools first.
  Object.assign(window, {
    seize: () => { hooks.seize(); unlock('devtools'); return '2600 Hz sent. Line seized.'; },
    phreak: () => { hooks.phreak(); unlock('devtools'); return 'Phreak mode toggled.'; },
    dial: (n = '1337') => { commands.dial(String(n)); unlock('devtools'); return `Dialing KP ${String(n).split('').join(' ')} ST`; },
  });

  return { open, close, MF };
}
