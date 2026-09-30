// Side B: pick a tape and it plays. The music is the source of truth: rock tapes stream one
// side at a time through YouTube (loaded on the first play, never before), the last tape is
// the site's own tones. The Walkman (walkman.js, motion on) follows along: the tape slides
// in, the reels turn while music plays, and they track the position through the side.
import { sfx, sound } from '../audio.js';
import { setStatus } from '../chrome.js';
import { motionOn } from './mount.js';

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
        timer = setTimeout(next, step === 'seize' ? 2200 : i % SEQ[side].length === 0 ? 1400 : 170);
      };
      next();
    },
    stop() { clearTimeout(timer); },
  };
}

export function initSideB() {
  const root = document.querySelector('[data-sideb]');
  if (!root) return;
  const tapes = JSON.parse(root.querySelector('[data-tapes]').textContent);
  const canvas = root.querySelector('[data-deck-canvas]');
  const card = {
    title: root.querySelector('[data-jcard-title]'),
    note: root.querySelector('[data-jcard-note]'),
    side: root.querySelector('[data-jcard-side]'),
    list: root.querySelector('[data-jcard-list]'),
  };
  const videoHost = root.querySelector('[data-video-host]');
  const tones = tonePlayer();
  const s = { tape: -1, side: 'A', track: -1, playing: false, skipped: new Set() };
  let deck = null;
  let deckLoading = null;
  let yt = null;
  let ytLoading = null;

  const tape = () => tapes[s.tape];
  const tracks = () => tape()?.side[s.side === 'A' ? 'a' : 'b'] ?? [];

  /* ---------- The J-card ---------- */
  const renderCard = () => {
    const t = tape();
    card.title.textContent = t ? t.title : 'No tape';
    card.note.textContent = t ? t.note : 'Pick a tape';
    card.side.textContent = `Side ${s.side}`;
    const items = tracks().map((track, i) => {
      const li = document.createElement('li');
      li.toggleAttribute('data-on', i === s.track);
      li.toggleAttribute('data-skip', s.skipped.has(`${s.tape}:${s.side}:${i}`));
      const label = `${s.side}${i + 1}  ${track.title}${track.artist !== t.note.split(' · ')[0] ? ` · ${track.artist}` : ''}`;
      if (track.id) {
        const a = document.createElement('a');
        a.href = `https://www.youtube.com/watch?v=${track.id}`;
        a.textContent = label;
        a.target = '_blank';
        a.rel = 'noopener';
        li.append(a);
      } else li.textContent = label;
      return li;
    });
    card.list.replaceChildren(...(items.length ? items : [Object.assign(document.createElement('li'), { textContent: 'Pick a tape to see what’s on it.' })]));
    root.querySelectorAll('[data-tape]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.tape) === s.tape)));
  };

  const setPlaying = (on) => {
    s.playing = on;
    root.toggleAttribute('data-playing', on);
    deck?.run(on);
    const t = tape();
    const track = tracks()[s.track];
    if (on && t && track) setStatus('seized', `▶ ${track.title}`);
    else setStatus('locked', t ? `Side B · ${t.title} · ${s.side}` : 'Side B · tape idle');
  };

  /* ---------- The Walkman ---------- */
  const ensureDeck = () => {
    if (!motionOn() || !canvas) return Promise.resolve(null);
    deckLoading ??= import('./walkman.js')
      .then(({ createDeck }) => createDeck(canvas, { tapes, onPick: (i) => selectTape(i) }))
      .then((d) => {
        deck = d;
        root.dataset.ready = 'true';
        if (s.tape >= 0) deck.load(s.tape).then(() => deck.run(s.playing));
        return d;
      })
      .catch((error) => { console.warn('[2600th] Walkman scene failed', error); return null; });
    return deckLoading;
  };
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) { ensureDeck(); deck?.resume(); } else deck?.pause();
  }, { rootMargin: '200px' }).observe(root);
  document.addEventListener('signal:motion', (event) => { if (event.detail?.on) ensureDeck(); else deck?.pause(); });

  /* ---------- The music ---------- */
  const ensureYT = () => {
    ytLoading ??= import('./youtube.js').then(({ createTapePlayer }) => {
      root.dataset.video = 'loading';
      return createTapePlayer(videoHost, {
        onTrack: (i) => { s.track = i; renderCard(); },
        onPlaying: (on) => setPlaying(on),
        onProgress: (p) => deck?.setProgress(p),
        onSideEnd: () => { s.track = -1; renderCard(); setStatus('locked', 'End of side · flip the tape'); },
        onSkip: (i) => { s.skipped.add(`${s.tape}:${s.side}:${i}`); renderCard(); },
      });
    }).then((player) => { yt = player; root.dataset.video = 'ready'; return player; })
      .catch((error) => {
        ytLoading = null;
        root.dataset.video = 'failed';
        const idle = root.querySelector('.sideb__video-idle');
        if (idle) idle.textContent = 'YouTube didn’t load here. Each song on the J-card opens on YouTube.';
        console.warn('[2600th]', error.message);
        return null;
      });
    return ytLoading;
  };

  const startSide = async () => {
    const t = tape();
    if (!t) return;
    tones.stop();
    if (t.source === 'tones') {
      yt?.stop();
      // Playing the tones tape is asking for sound.
      if (!sound.enabled) sound.set(true);
      s.track = 0;
      renderCard();
      tones.start(s.side);
      setPlaying(true);
      return;
    }
    const player = await ensureYT();
    if (!player) return;
    player.side(tracks(), 0);
  };

  const stopAll = () => { tones.stop(); yt?.stop(); setPlaying(false); };

  const selectTape = async (i) => {
    if (i === s.tape) return;
    stopAll();
    s.tape = i;
    s.side = 'A';
    s.track = -1;
    renderCard();
    ensureDeck().then((d) => d?.load(i));
    await startSide();
  };

  /* ---------- Controls ---------- */
  root.addEventListener('click', async (event) => {
    const tapeBtn = event.target.closest('[data-tape]');
    const key = event.target.closest('[data-deck]');
    if (tapeBtn) { sfx.tick(); selectTape(Number(tapeBtn.dataset.tape)); return; }
    if (!key) return;
    sfx.tick();
    deck?.press();
    const k = key.dataset.deck;
    if (s.tape < 0) { if (k === 'play') selectTape(0); return; }
    const isTones = tape().source === 'tones';
    if (k === 'play') {
      if (s.playing) { if (isTones) { tones.stop(); setPlaying(false); } else yt?.pause(); }
      else if (isTones) { tones.start(s.side); setPlaying(true); }
      else if (s.track < 0) startSide();
      else yt?.play();
    } else if (k === 'eject') {
      stopAll();
      s.tape = -1;
      s.track = -1;
      renderCard();
      deck?.eject();
    } else if (k === 'flip') {
      stopAll();
      s.side = s.side === 'A' ? 'B' : 'A';
      s.track = -1;
      renderCard();
      if (deck) await deck.flip();
      startSide();
    } else if (k === 'ff') {
      deck?.wind(1);
      if (!isTones) yt?.next();
    } else if (k === 'rew') {
      deck?.wind(-1);
      if (!isTones) yt?.back();
    }
  });

  renderCard();
}
