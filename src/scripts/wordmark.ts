export function initLivingWordmark() {
  document.querySelectorAll<HTMLElement>('[data-wordmark]').forEach((wordmark) => {
    if (wordmark.dataset.bound === 'true') return;
    wordmark.dataset.bound = 'true';

    const letters = [...wordmark.querySelectorAll<HTMLElement>('.living-letter')];
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || !matchMedia('(pointer: fine)').matches) return;
    let centers: number[] = [];
    let pointerX = 0;
    let frame = 0;

    const measure = () => {
      centers = letters.map((letter) => {
        const bounds = letter.getBoundingClientRect();
        return bounds.left + bounds.width / 2;
      });
    };

    const render = () => {
      frame = 0;
      const range = Math.max(window.innerWidth * 0.22, 220);
      letters.forEach((letter, index) => {
        const distance = Math.abs(pointerX - centers[index]);
        const influence = Math.max(0, 1 - distance / range);
        letter.style.setProperty('--letter-wdth', String(Math.round(90 + influence * 28)));
      });
    };

    const settle = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      for (const letter of letters) letter.style.setProperty('--letter-wdth', '96');
    };

    wordmark.addEventListener('pointermove', (event) => {
      pointerX = event.clientX;
      if (!frame) frame = requestAnimationFrame(render);
    });
    wordmark.addEventListener('pointerleave', settle);
    const observer = new ResizeObserver(measure);
    observer.observe(wordmark);
    measure();
  });
}
