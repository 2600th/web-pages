// PROTOTYPE: the cassette player in two placements.
//   A  initSideB()     a "Side B" section on the About page
//   B  initTapeDock()  a pocket player in the site header, opened as a drawer on any page
// Both load the 3D player (walkman.js) only when they are first seen or opened.
import { sfx, sound } from '../audio.js';
import { motionOn } from './mount.js';

const pad = (n) => String(n).padStart(2, '0');

/** The line-tones tape: the site's own MF and supervisory tones, looped while it plays. */
function tonePlayer() {
  const SEQ = { A: ['KP', '2', '6', '0', '0', 'ST', 'seize'], B: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] };
  let timer = 0;
  return {
    start(side) {
      clearTimeout(timer);
      let i = 0;
      const next = () => {
        const step = SEQ[side][i % SEQ[side].length];
        if (step === 'seize') sfx.seize(); else sfx.mf(step);
        i += 1;
        timer = setTimeout(next, step === 'seize' ? 2200 : 170);
      };
      next();
    },
    stop() { clearTimeout(timer); },
  };
}

function wire(root, deckPromise, tapes, ui) {
  const tones = tonePlayer();
  const render = (s) => {
    root.querySelectorAll('[data-tape]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.tape) === s.loaded)));
    root.toggleAttribute('data-playing', s.playing);
    const tape = tapes[s.loaded];
    if (ui.title) ui.title.textContent = tape ? tape.title : 'No tape';
    if (ui.side) ui.side.textContent = `Side ${s.side}`;
    if (ui.list) {
      const tracks = tape ? tape.side[s.side === 'A' ? 'a' : 'b'] : [];
      ui.list.replaceChildren(...(tracks.length ? tracks : ['Pick a tape to see what’s on it.']).map((t, i) => {
        const li = document.createElement('li');
        li.textContent = tracks.length ? `${s.side}${i + 1}  ${t}` : t;
        return li;
      }));
    }
    if (tape?.source === 'tones' && s.playing) tones.start(s.side); else tones.stop();
  };
  root.addEventListener('click', async (event) => {
    const tapeBtn = event.target.closest('[data-tape]');
    const key = event.target.closest('[data-deck]');
    if (!tapeBtn && !key) return;
    const deck = await deckPromise();
    if (!deck) return;
    sfx.tick();
    if (tapeBtn) { await deck.load(Number(tapeBtn.dataset.tape)); deck.play(); return; }
    const k = key.dataset.deck;
    if (k === 'play') deck.state.playing ? deck.stop() : deck.play();
    else if (k === 'eject') deck.state.playing ? deck.stop() : deck.eject();
    else if (k === 'flip') { await deck.flip(); deck.play(); }
    else if (k === 'ff') deck.wind(1);
    else if (k === 'rew') deck.wind(-1);
  });
  return render;
}

/* ---------- A: Side B on About ---------- */
export function initSideB() {
  const root = document.querySelector('[data-sideb]');
  if (!root) return;
  const tapes = JSON.parse(root.querySelector('[data-tapes]').textContent);
  const canvas = root.querySelector('[data-deck-canvas]');
  let deck = null;
  let loading = null;
  const ui = { title: root.querySelector('[data-jcard-title]'), side: root.querySelector('[data-jcard-side]'), list: root.querySelector('[data-jcard-list]') };
  const render = wire(root, () => ensure(), tapes, ui);
  const ensure = () => {
    loading ??= import('./walkman.js').then(({ createDeck }) => createDeck(canvas, { tapes, layout: 'stage', onState: render })).then((d) => { deck = d; root.dataset.ready = 'true'; return d; });
    return loading;
  };
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) { if (motionOn()) ensure(); deck?.resume(); } else deck?.pause();
  }, { rootMargin: '200px' }).observe(root);
}

/* ---------- B: a pocket player in the header ---------- */
export function initTapeDock() {
  const params = new URLSearchParams(location.search);
  if (!params.has('dock')) return;
  const controls = document.querySelector('.sg-controls');
  const tapesJson = document.querySelector('[data-dock-tapes]');
  if (!controls || !tapesJson) return;
  const tapes = JSON.parse(tapesJson.textContent);
  const chip = document.createElement('button');
  chip.type = 'button';
  chip.className = 'sg-chip tdock__chip';
  chip.setAttribute('aria-expanded', 'false');
  chip.setAttribute('aria-controls', 'tape-dock');
  chip.innerHTML = '<span class="tdock__reels" aria-hidden="true"><i></i><i></i></span> Tape';
  (controls.querySelector('[data-sound-toggle]') ?? controls.lastElementChild).before(chip);

  const drawer = document.createElement('section');
  drawer.id = 'tape-dock';
  drawer.className = 'tdock';
  drawer.hidden = true;
  drawer.setAttribute('aria-label', 'Tape player');
  drawer.innerHTML = `
    <header class="tdock__head"><p><span>Now playing</span><b data-jcard-title>No tape</b><i data-jcard-side>Side A</i></p><button type="button" class="tdock__close" aria-label="Close tape player">✕</button></header>
    <canvas class="tdock__canvas" aria-hidden="true"></canvas>
    <ol class="tdock__tapes">${tapes.map((t, i) => `<li><button type="button" data-tape="${i}" aria-pressed="false" style="--tape:${t.label};--tape-ink:${t.ink}"><b>${pad(i + 1)}</b>${t.title}</button></li>`).join('')}</ol>
    <div class="tdock__keys" role="group" aria-label="Player"><button type="button" data-deck="eject" aria-label="Stop and eject">⏏</button><button type="button" data-deck="rew" aria-label="Rewind">◀◀</button><button type="button" data-deck="play" class="is-play" aria-label="Play">▶</button><button type="button" data-deck="ff" aria-label="Fast forward">▶▶</button><button type="button" data-deck="flip">Flip</button></div>
    <ol class="tdock__list" data-jcard-list></ol>`;
  document.body.append(drawer);
  const ui = { title: drawer.querySelector('[data-jcard-title]'), side: drawer.querySelector('[data-jcard-side]'), list: drawer.querySelector('[data-jcard-list]') };
  let loading = null;
  const render = wire(drawer, () => ensure(), tapes, ui);
  const onState = (s) => { render(s); chip.toggleAttribute('data-playing', s.playing); };
  const ensure = () => {
    loading ??= import('./walkman.js').then(({ createDeck }) => createDeck(drawer.querySelector('canvas'), { tapes, layout: 'compact', onState }));
    return loading;
  };
  const setOpen = (open) => {
    drawer.hidden = !open;
    chip.setAttribute('aria-expanded', String(open));
    if (open) ensure();
  };
  chip.addEventListener('click', () => setOpen(drawer.hidden));
  drawer.querySelector('.tdock__close').addEventListener('click', () => setOpen(false));
  if (params.get('dock') === 'open') setOpen(true);
  void sound;
}
