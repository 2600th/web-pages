// Side B on the About page: pick a tape and the Walkman plays it. The 3D scene
// (walkman.js) loads only when the section comes near and motion is on.
import { sfx } from '../audio.js';
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
    loading ??= import('./walkman.js').then(({ createDeck }) => createDeck(canvas, { tapes, onState: render })).then((d) => { deck = d; root.dataset.ready = 'true'; return d; });
    return loading;
  };
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) { if (motionOn()) ensure(); deck?.resume(); } else deck?.pause();
  }, { rootMargin: '200px' }).observe(root);
}
