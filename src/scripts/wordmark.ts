export function initLivingWordmark() {
  document.querySelectorAll<HTMLElement>('[data-wordmark]').forEach((wordmark) => {
    if (wordmark.dataset.bound === 'true') return;
    wordmark.dataset.bound = 'true';

    const letters = [...wordmark.querySelectorAll<HTMLElement>('.living-letter')];
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || !matchMedia('(pointer: fine)').matches) return;

    const settle = () => {
      for (const letter of letters) letter.style.setProperty('--letter-wdth', '96');
    };

    wordmark.addEventListener('pointermove', (event) => {
      for (const letter of letters) {
        const bounds = letter.getBoundingClientRect();
        const center = bounds.left + bounds.width / 2;
        const distance = Math.abs(event.clientX - center);
        const influence = Math.max(0, 1 - distance / Math.max(window.innerWidth * 0.22, 220));
        letter.style.setProperty('--letter-wdth', String(Math.round(90 + influence * 28)));
      }
    });
    wordmark.addEventListener('pointerleave', settle);
  });
}
