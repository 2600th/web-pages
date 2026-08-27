export function initExposureHero() {
  document.querySelectorAll<HTMLElement>('[data-exposure-hero]').forEach((hero) => {
    if (hero.dataset.bound === 'true') return;
    hero.dataset.bound = 'true';
    const control = hero.querySelector<HTMLInputElement>('[data-exposure-control]');
    if (!control) return;

    const render = () => {
      const value = Math.min(66, Math.max(34, Number.parseFloat(control.value) || 50));
      control.value = String(value);
      control.setAttribute('aria-valuetext', `${value}% positive exposure`);
      hero.style.setProperty('--exposure', `${value}%`);
    };

    control.addEventListener('input', render);
    control.addEventListener('change', render);
    render();
  });
}
