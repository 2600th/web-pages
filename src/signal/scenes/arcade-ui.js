// The Lab cabinet: pick a cartridge from the roster (click, ↑ ↓, or its number key),
// its card and screen follow, and Enter on the chosen cartridge presses start: the
// build's first link. S opens its source. Until someone plays, the cabinet runs its
// attract mode and cycles the cartridges. With motion on, a 3D upright cabinet (cabinet.js)
// draws over the flat one; if it can't start, the flat cabinet's own CRT (arcade.js) runs.
import { gsap } from 'gsap';
import { sfx, tones } from '../audio.js';
import { mountScene, motionOn } from './mount.js';
import { setStatus } from '../chrome.js';

const pad = (value) => String(value).padStart(2, '0');

export function initArcade() {
  const root = document.querySelector('[data-arcade]');
  if (!root) return;
  root.dataset.ready = 'true';
  const buttons = [...root.querySelectorAll('[data-pick]')];
  const cards = new Map([...root.querySelectorAll('.arcade__card')].map((card) => [card.dataset.build, card]));
  const feeds = new Map([...root.querySelectorAll('[data-feed]')].map((feed) => [feed.dataset.feed, feed]));
  const hud = root.querySelector('[data-arcade-hud]');
  const channel = root.querySelector('[data-arcade-ch]');
  const stick = root.querySelector('.arcade__stick');
  const screen = root.querySelector('[data-arcade-screen]');
  let current = buttons[0]?.dataset.pick;
  let requested = false; // Video plays only after the visitor has picked or pressed something.

  const play = root.querySelector('[data-arcade-play]');
  const playLabel = root.querySelector('[data-arcade-play-label]');
  const syncPlay = () => {
    const video = feeds.get(current)?.querySelector('video');
    play.hidden = !video;
    const on = Boolean(video && !video.paused);
    play.setAttribute('aria-pressed', String(on));
    playLabel.textContent = on ? 'Pause clip' : 'Play clip';
  };
  const syncVideo = () => {
    feeds.forEach((feed, key) => {
      const video = feed.querySelector('video');
      if (!video) return;
      if (key === current && requested && motionOn()) video.play().catch(() => {});
      else video.pause();
    });
    syncPlay();
  };
  feeds.forEach((feed) => {
    const video = feed.querySelector('video');
    video?.addEventListener('play', syncPlay);
    video?.addEventListener('pause', syncPlay);
  });

  const select = (id, { focus = false, dir = 0, attract = false } = {}) => {
    const index = buttons.findIndex((button) => button.dataset.pick === id);
    if (index < 0) return;
    if (!attract) { requested = true; stopAttract(); }
    if (focus) buttons[index].focus();
    if (id === current) { syncVideo(); return; }
    const prev = current;
    current = id;
    buttons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.pick === id)));
    cards.forEach((card, key) => card.toggleAttribute('data-on', key === id));
    feeds.forEach((feed, key) => feed.toggleAttribute('data-on', key === id));
    syncVideo();
    hud.textContent = buttons[index].querySelector('span').textContent;
    channel.textContent = pad(index + 1);
    setStatus('locked', `Cart ${pad(index + 1)} · ${hud.textContent}`);
    root.dispatchEvent(new CustomEvent('arcade:select', { detail: { id, prev } }));
    if (attract) return;
    // An 8-bit blip that climbs with the cartridge number.
    tones([520 + index * 70], { dur: 0.05, gain: 0.04, type: 'square' });
    if (stick) {
      stick.dataset.dir = dir < 0 ? 'up' : dir > 0 ? 'down' : 'push';
      clearTimeout(stick.timer);
      stick.timer = setTimeout(() => { delete stick.dataset.dir; }, 180);
    }
    if (motionOn()) gsap.from(cards.get(id).children, { y: 16, duration: 0.5, stagger: 0.035, ease: 'power3.out', overwrite: 'auto' });
  };

  // Attract mode: while nobody is playing and the cabinet is on screen, it cycles.
  let attractTimer = 0;
  let visible = false;
  const stopAttract = () => {
    clearInterval(attractTimer);
    attractTimer = 0;
    delete root.dataset.attract;
  };
  const runAttract = () => {
    if (requested || attractTimer || !visible || !motionOn()) return;
    root.dataset.attract = 'true';
    attractTimer = setInterval(() => {
      const i = buttons.findIndex((button) => button.dataset.pick === current);
      select(buttons[(i + 1) % buttons.length].dataset.pick, { attract: true });
    }, 4200);
  };
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) runAttract(); else { clearInterval(attractTimer); attractTimer = 0; }
  }, { threshold: 0.35 }).observe(root);
  document.addEventListener('signal:motion', (event) => { if (event.detail.on) runAttract(); else stopAttract(); });
  root.addEventListener('pointerdown', () => { requested = true; stopAttract(); });
  root.addEventListener('focusin', () => { requested = true; stopAttract(); });

  const start = () => {
    const link = cards.get(current)?.querySelector('.sg-ends a');
    if (!link) return;
    sfx.mf('KP');
    setTimeout(() => sfx.mf('ST'), 110);
    root.dataset.starting = 'true';
    setTimeout(() => link.click(), motionOn() ? 260 : 0);
  };

  buttons.forEach((button, i) => {
    button.addEventListener('click', () => select(button.dataset.pick));
    button.addEventListener('keydown', (event) => {
      const n = buttons.length;
      const go = (j, dir) => { event.preventDefault(); select(buttons[(j + n) % n].dataset.pick, { focus: true, dir }); };
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') go(i + 1, 1);
      else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') go(i - 1, -1);
      else if (event.key === 'Home') go(0, -1);
      else if (event.key === 'End') go(n - 1, 1);
      else if (event.key === 'Enter' && button.dataset.pick === current && button.getAttribute('aria-pressed') === 'true' && requested) {
        event.preventDefault();
        start();
      }
    });
  });

  // Anywhere on the page: 1–9 load that cartridge, S opens the loaded one's source.
  addEventListener('keydown', (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey || event.defaultPrevented) return;
    if (document.activeElement?.closest('input, textarea, select, [contenteditable], .sg-console')) return;
    const n = Number(event.key);
    if (n >= 1 && n <= buttons.length) {
      event.preventDefault();
      const i = buttons.findIndex((button) => button.dataset.pick === current);
      select(buttons[n - 1].dataset.pick, { focus: root.contains(document.activeElement), dir: Math.sign(n - 1 - i) });
    } else if (event.key === 's' || event.key === 'S') {
      const source = cards.get(current)?.querySelector('.sg-ends a[data-kind="src"]');
      if (!source) return;
      event.preventDefault();
      sfx.tick();
      source.click();
    }
  });

  // The deck: A presses start, B loads the next cartridge.
  root.querySelectorAll('[data-arcade-press]').forEach((pressable) => {
    pressable.addEventListener('click', () => {
      pressable.dataset.down = 'true';
      setTimeout(() => { delete pressable.dataset.down; }, 140);
      if (pressable.dataset.arcadePress === 'start') { requested = true; start(); }
      else {
        const i = buttons.findIndex((button) => button.dataset.pick === current);
        select(buttons[(i + 1) % buttons.length].dataset.pick, { dir: 1 });
      }
    });
  });

  // The screen's play control (or a click anywhere on the screen) plays or pauses the clip.
  const toggleClip = () => {
    const video = feeds.get(current)?.querySelector('video');
    if (!video) return;
    requested = true;
    stopAttract();
    if (video.paused) video.play().catch(() => {}); else video.pause();
  };
  play?.addEventListener('click', (event) => { event.stopPropagation(); toggleClip(); });
  screen?.addEventListener('click', toggleClip);
  document.addEventListener('signal:motion', (event) => { if (!event.detail.on) feeds.forEach((feed) => feed.querySelector('video')?.pause()); });

  // The flat cabinet leans toward the pointer, just enough to feel physical. (The 3D one
  // turns its own camera.)
  const cab = root.querySelector('.arcade__cab');
  if (cab && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const rx = gsap.quickTo(cab, 'rotationX', { duration: 0.6, ease: 'power3' });
    const ry = gsap.quickTo(cab, 'rotationY', { duration: 0.6, ease: 'power3' });
    cab.addEventListener('pointermove', (event) => {
      if (!motionOn() || cab.dataset.cab3d === 'on') { rx(0); ry(0); return; }
      const rect = cab.getBoundingClientRect();
      ry(((event.clientX - rect.left) / rect.width - 0.5) * 5);
      rx(-((event.clientY - rect.top) / rect.height - 0.5) * 4);
    });
    cab.addEventListener('pointerleave', () => { rx(0); ry(0); });
  }

  // The 3D cabinet, or the flat one's CRT if it can't start (no WebGL2, a driver refusing it).
  const flatCrt = () => {
    let scene = {};
    import('./arcade.js').then((module) => { scene = module.mount(screen) ?? {}; }).catch(() => {});
    return { setMotion: (on) => scene.setMotion?.(on) };
  };
  mountScene(cab, () => import('./cabinet.js').then((module) => ({
    mount(host) {
      try {
        return module.mount(host);
      } catch (error) {
        console.info('[2600th] 3D cabinet not started; using the flat CRT:', error.message);
        host.querySelector('.arcade__3d')?.remove();
        return flatCrt();
      }
    },
  })));
}
