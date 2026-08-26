import { trackEvent } from './analytics';

export function indexForRange(value: number, count: number): number {
  if (count <= 0) return -1;
  return Math.min(count - 1, Math.max(0, Math.round(value)));
}

export function initMotionStudy() {
  document.querySelectorAll<HTMLElement>('[data-motion-study]').forEach((root) => {
    if (root.dataset.bound === 'true') return;
    root.dataset.bound = 'true';
    const frames = [...root.querySelectorAll<HTMLElement>('[data-motion-frame]')];
    const range = root.querySelector<HTMLInputElement>('[data-motion-range]');
    const previous = root.querySelector<HTMLButtonElement>('[data-motion-previous]');
    const next = root.querySelector<HTMLButtonElement>('[data-motion-next]');
    if (!range || frames.length === 0) return;

    let activeIndex = indexForRange(Number(range.value), frames.length);

    const render = (requestedIndex: number, announce = false) => {
      activeIndex = indexForRange(requestedIndex, frames.length);
      range.value = String(activeIndex);
      frames.forEach((frame, index) => {
        frame.hidden = index !== activeIndex;
        frame.setAttribute('aria-hidden', String(index !== activeIndex));
      });
      previous?.toggleAttribute('disabled', activeIndex === 0);
      next?.toggleAttribute('disabled', activeIndex === frames.length - 1);
      const active = frames[activeIndex];
      range.setAttribute('aria-valuetext', `${active?.dataset.year}: ${active?.dataset.label}`);
      if (announce) trackEvent('motion_study_seek', { year: active?.dataset.year ?? '', project: active?.dataset.label ?? '' });
    };

    range.addEventListener('input', () => render(Number(range.value), false));
    range.addEventListener('change', () => render(Number(range.value), true));
    previous?.addEventListener('click', () => render(activeIndex - 1, true));
    next?.addEventListener('click', () => render(activeIndex + 1, true));
    render(activeIndex);
  });
}
