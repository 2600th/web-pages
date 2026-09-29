// The 404 intercept operator: it plays the special information tones, reads back the
// number you dialed, suggests the nearest real lines, and lets you redial by key.
import { sound, tones } from '../audio.js';
import { toast } from '../fx.js';

const SIT = [913.8, 1370.6, 1776.7];
const DTMF = { 1: [697, 1209], 2: [697, 1336], 3: [697, 1477], 4: [770, 1209], 5: [770, 1336], 6: [770, 1477], 7: [852, 1209], 8: [852, 1336], 9: [852, 1477] };
const clean = (path) => path.toLowerCase().replace(/index\.html$/, '').replace(/^\/+|\/+$/g, '');
const shell = (path) => `~/${clean(path)}`.replace(/\/$/, '') || '~';

function distance(a, b) {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const temp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = temp;
    }
  }
  return row[b.length];
}

/** Rank real routes by how close they are to what was dialed, whole path and last segment. */
function suggest(routes, dialed) {
  const want = clean(dialed);
  const last = want.split('/').pop() ?? '';
  if (!want) return routes.slice(0, 5);
  return routes
    .map((route) => {
      const path = clean(route.path);
      const tail = path.split('/').pop() ?? '';
      const title = route.title.toLowerCase();
      const score = Math.min(
        distance(want, path) / Math.max(want.length, path.length, 1),
        distance(last, tail) / Math.max(last.length, tail.length, 1) + 0.05,
        path.includes(last) || title.includes(last) ? 0.1 : 1,
      );
      return { ...route, score };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);
}

export function initIntercept() {
  const root = document.querySelector('[data-intercept]');
  if (!root) return;
  const routes = JSON.parse(root.querySelector('[data-nf-routes]')?.textContent ?? '[]');
  const list = root.querySelector('[data-nf-lines]');
  const sit = root.querySelector('[data-nf-sit]');
  const dialed = location.pathname;
  root.querySelector('[data-nf-path]').textContent = shell(dialed);

  const render = (lines) => {
    list.replaceChildren(...lines.map((route, index) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = route.path;
      a.dataset.sfx = 'tick';
      a.innerHTML = `<b>${index + 1}</b><span></span><i></i>`;
      a.querySelector('span').textContent = shell(route.path);
      a.querySelector('i').textContent = route.title;
      li.append(a);
      return li;
    }));
  };
  let lines = suggest(routes, dialed);
  render(lines);

  // The three rising tones, each bar lighting as it sounds.
  const play = () => {
    const bars = [...sit.querySelectorAll('i')];
    [0.274, 0.274, 0.38].reduce((at, dur, i) => {
      setTimeout(() => {
        bars.forEach((bar, j) => bar.toggleAttribute('data-on', j === i));
        tones([SIT[i]], { dur, gain: 0.07 });
      }, at * 1000);
      return at + dur + 0.02;
    }, 0);
    setTimeout(() => bars.forEach((bar) => bar.removeAttribute('data-on')), 1100);
  };
  sit.addEventListener('click', () => {
    if (!sound.enabled) toast('Sound is off. Turn it on in the header to hear the tones.');
    play();
  });
  if (sound.enabled) setTimeout(play, 500);

  const dial = (index) => {
    const route = lines[index];
    if (!route) return;
    const link = list.children[index]?.querySelector('a');
    link?.setAttribute('data-dialing', '');
    tones(DTMF[index + 1] ?? [], { dur: 0.16, gain: 0.08 });
    setTimeout(() => location.assign(route.path), 280);
  };
  addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (document.activeElement?.closest('input, textarea, select, .sg-console')) return;
    if (/^[1-9]$/.test(event.key) && Number(event.key) <= lines.length) dial(Number(event.key) - 1);
  });

  root.querySelector('[data-nf-prompt]')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const value = new FormData(event.target).get('path')?.toString().trim() ?? '';
    const exact = routes.find((route) => clean(route.path) === clean(value));
    if (exact) { location.assign(exact.path); return; }
    lines = suggest(routes, value);
    render(lines);
    toast(`cd: ${value || '~'}: not in service. Nearest lines listed.`);
  });
}
