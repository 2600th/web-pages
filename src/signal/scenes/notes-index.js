// Notes index: the receiver tunes to whichever transmission you point at (on the band or
// in the log), type filters work as band selectors, and log rows preview their card.
import { gsap } from 'gsap';
import { tones } from '../audio.js';
import { mountScene, motionOn } from './mount.js';

const pad = (value) => String(value).padStart(2, '0');

export function initNotesIndex() {
  const rx = document.querySelector('[data-receiver]');
  const log = document.querySelector('[data-tx-log]');
  if (!rx || !log) return;
  const stations = JSON.parse(rx.querySelector('[data-rx-stations]')?.textContent ?? '[]');
  const count = stations.length;
  const screen = rx.querySelector('.rx__screen');
  const needle = rx.querySelector('[data-rx-needle]');
  const marks = [...rx.querySelectorAll('[data-rx-station]')];
  const ch = rx.querySelector('[data-rx-ch]');
  const title = rx.querySelector('[data-rx-title]');
  const meta = rx.querySelector('[data-rx-meta]');
  const rows = [...log.querySelectorAll(':scope > li')];
  let tuned = count;
  let hidden = new Set();

  const tune = (channel, { sound = true } = {}) => {
    if (!channel || channel === tuned || hidden.has(channel)) return;
    tuned = channel;
    const station = stations[channel - 1];
    needle.style.left = `${((channel - 0.5) / count) * 100}%`;
    marks.forEach((mark) => mark.toggleAttribute('data-on', Number(mark.dataset.rxStation) === channel));
    rx.dataset.tone = station.tone;
    ch.textContent = `CH ${pad(channel)}`;
    meta.textContent = `${station.type} · ${station.date} · ${station.minutes} min`;
    if (motionOn()) gsap.to(title, { duration: 0.45, scrambleText: { text: station.title, chars: '01░▒▓', speed: 0.8 }, overwrite: 'auto' });
    else title.textContent = station.title;
    rx.dispatchEvent(new CustomEvent('rx:tune', { detail: { channel } }));
    // Each channel sits on its own pitch, low to high across the band.
    if (sound) tones([520 + channel * 110], { dur: 0.05, gain: 0.03 });
  };

  // Pointing at the band tunes to the nearest station; a click receives it.
  screen.addEventListener('pointermove', (event) => {
    const rect = screen.getBoundingClientRect();
    tune(Math.min(count, Math.max(1, Math.floor(((event.clientX - rect.left) / rect.width) * count) + 1)));
  });
  screen.addEventListener('click', (event) => {
    if (event.target.closest('a')) return;
    const station = stations[tuned - 1];
    if (station) location.assign(`/notes/${station.slug}/`);
  });
  rows.forEach((row) => {
    const channel = Number(row.dataset.channel);
    row.addEventListener('pointerenter', () => tune(channel));
    row.addEventListener('focusin', () => tune(channel, { sound: false }));
  });

  // Band selectors: filter the log and dim the other bands on the receiver.
  const filter = document.querySelector('[data-note-filter]');
  const status = document.querySelector('[data-note-status]');
  filter?.addEventListener('click', (event) => {
    const button = event.target.closest('[data-note-filter-type]');
    if (!button) return;
    const type = button.dataset.noteFilterType;
    filter.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    let visible = 0;
    hidden = new Set();
    rows.forEach((row) => {
      row.hidden = type !== 'all' && row.dataset.noteType !== type;
      if (row.hidden) hidden.add(Number(row.dataset.channel)); else visible += 1;
    });
    marks.forEach((mark) => mark.toggleAttribute('data-off', hidden.has(Number(mark.dataset.rxStation))));
    rx.dispatchEvent(new CustomEvent('rx:filter', { detail: { hidden: [...hidden] } }));
    if (status) status.textContent = `${visible} ${visible === 1 ? 'note' : 'notes'} shown`;
    const first = rows.find((row) => !row.hidden);
    if (first && hidden.has(tuned)) { tuned = 0; tune(Number(first.dataset.channel), { sound: false }); }
  });

  initPreview(rows);
  mountScene(rx, () => import('./receiver.js'), { needsMotion: false });
}

/** A small monitor follows the pointer over the log, showing the note's card. */
function initPreview(rows) {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const box = document.createElement('div');
  box.className = 'tx-preview';
  box.setAttribute('aria-hidden', 'true');
  box.innerHTML = '<img alt="" width="1200" height="630" decoding="async">';
  document.body.append(box);
  const img = box.querySelector('img');
  const x = gsap.quickTo(box, 'x', { duration: 0.45, ease: 'power3' });
  const y = gsap.quickTo(box, 'y', { duration: 0.45, ease: 'power3' });
  let on = false;
  rows.forEach((row) => {
    if (row.classList.contains('tx-row--feature')) return;
    const link = row.querySelector('a');
    link.addEventListener('pointerenter', (event) => {
      if (!motionOn()) return;
      img.src = link.dataset.preview;
      gsap.set(box, { x: event.clientX + 28, y: event.clientY - 90 });
      box.dataset.on = 'true';
      on = true;
    });
    link.addEventListener('pointermove', (event) => { if (on) { x(event.clientX + 28); y(event.clientY - 90); } });
    link.addEventListener('pointerleave', () => { box.dataset.on = 'false'; on = false; });
  });
  addEventListener('scroll', () => { if (on) { box.dataset.on = 'false'; on = false; } }, { passive: true });
}
