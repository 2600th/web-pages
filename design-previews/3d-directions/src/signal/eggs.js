// Easter eggs, tracked as achievements. Nothing here blocks content or is
// required to use the page; everything is keyboard reachable.
import { gsap } from 'gsap';
import { sound, sfx, tones, MF } from './audio.js';
import { toast, flash } from './fx.js';

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
const hooks = { seize() {}, phreak() {}, goto() {} };
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
  '   ___  __   ___   ___  _   _    ',
  '  |_  )/ /  / _ \\ / _ \\| |_| |_  ',
  '   / // _ \\| (_) | (_) |  _| \' \\ ',
  '  /___\\___/ \\___/ \\___/ \\__|_||_|',
];
const HELP = [
  ['help', 'this list'], ['whoami', 'who runs this line'], ['neofetch', 'system info'], ['ls', 'list sections'],
  ['cd <section>', 'jump to work, log, lab, notes or contact'], ['man 2600', 'the tone behind the name'],
  ['dial <digits>', 'play MF tones, e.g. dial 1337'], ['seize', 'send 2600 Hz'], ['phreak', 'toggle phreak mode'],
  ['ping', 'check the line'], ['achievements', 'what you have found'], ['sound on|off', 'toggle audio'], ['clear', 'clear the screen'], ['exit', 'close'],
];

function buildConsole() {
  const el = document.createElement('section');
  el.className = 'sg-console';
  el.setAttribute('role', 'dialog');
  el.setAttribute('aria-label', 'Console');
  el.hidden = true;
  el.innerHTML = `
    <div class="sg-console__log" role="log" aria-live="polite" data-console-log></div>
    <form class="sg-console__line" data-console-form>
      <label for="sg-console-input">guest@2600th:~$</label>
      <input id="sg-console-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" data-console-input />
    </form>
    <p class="sg-console__hint"><span>Tab completes · ↑ history · Esc closes</span><button type="button" class="sg-console__close" data-console-close>Close</button></p>`;
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

  const print = (text, cls = '') => {
    const line = document.createElement('pre');
    line.className = cls;
    line.textContent = text;
    log.append(line);
    log.scrollTop = log.scrollHeight;
  };

  function open() {
    if (!panel.hidden) return;
    lastFocus = document.activeElement;
    panel.hidden = false;
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
    const done = () => { panel.hidden = true; lastFocus?.focus?.(); };
    if (document.documentElement.dataset.motion === 'on') gsap.to(panel, { yPercent: -100, duration: 0.25, ease: 'power2.in', onComplete: done });
    else done();
  }

  const commands = {
    help: () => HELP.forEach(([c, d]) => print(`  ${c.padEnd(15)} ${d}`)),
    whoami: () => print('Pranshul Chandhok (2600th)\nVP Product & Technology, Interior Company at Square Yards.\nGurugram, India.'),
    neofetch: () => {
      const info = [
        'guest@2600th', '------------', 'Name: Pranshul Chandhok', 'Handle: 2600th', 'Role: VP Product & Technology',
        'Uptime: 14+ years', 'Eras: games, XR, design software, AI', 'Stack: TypeScript, Three.js, C++, Unity', 'Patent: IN 395331', 'Shell: curiosity',
      ];
      print(LOGO.map((l, i) => l + '   ' + (info[i] ?? '')).concat(info.slice(LOGO.length).map((l) => ' '.repeat(36) + l)).join('\n'), 'is-logo');
    },
    ls: () => print('work/   log/   lab/   notes/   contact   README.md'),
    cat: (arg) => arg === 'README.md'
      ? print('I learn by building. This page is one of those builds:\na point cloud, a CRT shader and a synthesized phone network.')
      : print(`cat: ${arg || ''}: No such file`),
    cd: (arg) => {
      const id = (arg || '').replace(/\/$/, '');
      if (['work', 'log', 'lab', 'notes', 'contact', 'top'].includes(id)) { close(); hooks.goto(id); }
      else print(`cd: ${arg || ''}: No such section. Try ls.`);
    },
    man: (arg) => arg === '2600'
      ? print('2600(7)\n\nIn the old North American long-distance network, a 2600 Hz tone meant\n"this trunk is idle". Period: 1/2600 s = 384.6 µs.\nPlay it down a live call and the far switch waits for routing digits,\nsent as MF tone pairs: KP = 1100+1700 Hz, ST = 1500+1700 Hz.\nCarriers later moved signalling out of band. The handle stuck.')
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
    print(`guest@2600th:~$ ${raw}`, 'is-cmd');
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

  // Global keys: backtick opens the console; typing 2600 seizes the line. They only
  // fire when nothing is focused, never with modifiers, and can be switched off (WCAG 2.1.4).
  let typed = '';
  addEventListener('keydown', (e) => {
    if (!shortcutsOn || e.ctrlKey || e.metaKey || e.altKey) return;
    const active = document.activeElement;
    if (active && active !== document.body && active !== document.documentElement) return;
    if (e.key === '`' || e.key === '~') { e.preventDefault(); panel.hidden ? open() : close(); return; }
    if (/^[0-9]$/.test(e.key)) {
      typed = (typed + e.key).slice(-4);
      sfx.mf(e.key);
      if (typed === '2600') { typed = ''; hooks.seize(); toast('You spoke the network’s language. Line seized.'); }
    }
  });
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
