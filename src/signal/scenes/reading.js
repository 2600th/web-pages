// Reading a note is receiving it: the signature lights up as far as you have read, the
// current section is marked, and a thin reception meter follows you down the page.
// Everything here is state, not animation, so it runs with motion off too.
import { toast } from '../fx.js';
import { setStatus } from '../chrome.js';

const clamp = (value) => Math.min(1, Math.max(0, value));
const docY = (element) => element.getBoundingClientRect().top + scrollY;

export function initReading() {
  const prose = document.querySelector('[data-tx-prose]');
  if (!prose) return;
  const header = document.querySelector('.tx-head');
  const sig = document.querySelector('[data-signature]');
  const clip = sig?.querySelector('[data-signature-clip]');
  const head = sig?.querySelector('[data-signature-head]');
  const items = sig ? [...sig.querySelectorAll('.sig__marks li')] : [];
  const segs = items.map((li) => ({
    li,
    left: parseFloat(li.style.left) / 100,
    width: parseFloat(li.style.width) / 100,
    slug: li.querySelector('[data-signature-mark]')?.dataset.signatureMark,
    label: li.querySelector('.sig__tip')?.firstChild?.textContent ?? '',
  }));
  // Sectioned notes map reading position section by section; short notes map it linearly.
  const sectioned = segs.length > 0 && segs.every((seg, index) => seg.slug || index === 0);
  const meter = document.querySelector('[data-tx-meter]');
  const pct = meter?.querySelector('[data-tx-meter-pct]');
  const bar = meter?.querySelector('[data-tx-meter-bar]');
  const sectionLabel = meter?.querySelector('[data-tx-meter-section]');

  // The meter pins just under the site header, whatever height it has at this width.
  const siteHeader = document.querySelector('.sg-top');
  const pin = () => meter?.style.setProperty('--tx-meter-top', `${siteHeader?.offsetHeight ?? 0}px`);
  pin();
  addEventListener('resize', pin);

  // The sections rail: one row per section, filled as far as you have read it.
  const rail = [...document.querySelectorAll('[data-tx-rail] li')].map((li) => ({
    li, target: document.getElementById(li.dataset.rail), fill: li.querySelector('[data-rail-fill]'),
  })).filter((row) => row.target);

  let active = -2;
  let lastPct = -1;
  const locate = () => {
    const probe = scrollY + innerHeight * 0.35;
    const top = docY(prose);
    const end = top + prose.offsetHeight;
    const progress = clamp((probe - top) / Math.max(end - top, 1));
    if (!segs.length) return { x: progress, index: -1, progress };
    if (!sectioned) {
      const index = segs.findIndex((seg) => progress <= seg.left + seg.width + 0.001);
      return { x: progress, index, progress };
    }
    const starts = segs.map((seg) => (seg.slug ? docY(document.getElementById(seg.slug) ?? prose) : top));
    let index = -1;
    starts.forEach((start, i) => { if (start <= probe) index = i; });
    if (index < 0) return { x: 0, index, progress };
    const next = starts[index + 1] ?? end;
    const within = clamp((probe - starts[index]) / Math.max(next - starts[index], 1));
    return { x: segs[index].left + segs[index].width * within, index, progress };
  };

  let queued = false;
  const update = () => {
    queued = false;
    const { x, index, progress } = locate();
    if (clip) clip.setAttribute('width', String(x * 1000));
    if (head) { head.setAttribute('x1', String(x * 1000)); head.setAttribute('x2', String(x * 1000)); }
    if (index !== active) {
      segs.forEach((seg, i) => seg.li.toggleAttribute('data-current', i === index));
      active = index;
      if (sectionLabel) sectionLabel.textContent = segs[index]?.label ?? '';
    }
    if (rail.length) {
      const probe = scrollY + innerHeight * 0.35;
      const tops = rail.map((row) => docY(row.target));
      const end = docY(prose) + prose.offsetHeight;
      let current = -1;
      rail.forEach((row, i) => {
        const next = tops[i + 1] ?? end;
        const fill = clamp((probe - tops[i]) / Math.max(next - tops[i], 1));
        row.fill.style.transform = `scaleX(${fill})`;
        if (tops[i] <= probe) current = i;
      });
      rail.forEach((row, i) => row.li.toggleAttribute('data-current', i === current));
    }
    if (meter) {
      const past = header ? header.getBoundingClientRect().bottom < 0 : true;
      const done = prose.getBoundingClientRect().bottom < innerHeight * 0.3;
      meter.dataset.on = String(past && !done);
      if (pct) pct.textContent = String(Math.round(progress * 100)).padStart(2, '0');
      const reading = Math.round(progress * 100);
      if (reading !== lastPct) {
        lastPct = reading;
        if (done || reading >= 99) setStatus('seized', 'EOT · end of transmission');
        else if (reading > 0) setStatus('locked', `RX ${String(reading).padStart(2, '0')}%`);
      }
      if (bar) bar.style.transform = `scaleX(${progress})`;
    }
  };
  const request = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener('scroll', request, { passive: true });
  addEventListener('resize', request);
  update();

  // Wide tables say so, and stop saying so once you reach their end.
  prose.querySelectorAll('.table-scroll').forEach((box) => {
    const hint = document.createElement('p');
    hint.className = 'tx-scroll-hint';
    hint.setAttribute('aria-hidden', 'true');
    hint.textContent = 'Scroll the table →';
    box.after(hint);
    const check = () => {
      const more = box.scrollWidth > box.clientWidth + 2 && box.scrollLeft + box.clientWidth < box.scrollWidth - 4;
      box.dataset.overflow = String(more);
      hint.hidden = !more;
    };
    box.addEventListener('scroll', check, { passive: true });
    new ResizeObserver(check).observe(box);
    check();
  });

  animateFigures(prose);

  // Every section heading gets a link to itself; a click copies it.
  prose.querySelectorAll('h2[id], h3[id]').forEach((heading) => {
    const link = document.createElement('a');
    link.className = 'tx-anchor';
    link.href = `#${heading.id}`;
    link.setAttribute('aria-label', `Copy a link to “${heading.textContent}”`);
    link.textContent = '#';
    link.addEventListener('click', async (event) => {
      event.preventDefault();
      const url = `${location.origin}${location.pathname}#${heading.id}`;
      history.replaceState(null, '', `#${heading.id}`);
      heading.scrollIntoView({ block: 'start' });
      try { await navigator.clipboard.writeText(url); toast('Section link copied.'); } catch { /* clipboard blocked: the address bar has it */ }
    });
    heading.append(link);
  });
}

/** Figures earn their motion: budget bars fill and count, a stage chain carries a pulse. */
function animateFigures(prose) {
  const motion = document.documentElement.dataset.motion === 'on';
  const seen = (element, fn) => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      fn();
    }, { threshold: 0.35 });
    observer.observe(element);
  };
  prose.querySelectorAll('.budget-figure').forEach((figure) => {
    if (!motion) return;
    const rows = [...figure.querySelectorAll('.budget-figure__row')].map((row) => ({
      bar: row.querySelector('.budget-figure__track i'),
      value: row.querySelector('strong'),
    }));
    rows.forEach(({ bar }) => { if (bar) { bar.dataset.width = bar.style.width; bar.style.width = '0%'; } });
    seen(figure, () => rows.forEach(({ bar, value }, i) => {
      const final = value?.textContent ?? '';
      const number = parseFloat(final);
      const unit = final.replace(/^[\d.,\s]+/, '');
      const start = performance.now() + i * 120;
      const tick = (now) => {
        const t = Math.min(1, Math.max(0, (now - start) / 1100));
        const e = 1 - (1 - t) ** 3;
        if (bar) bar.style.width = `${parseFloat(bar.dataset.width) * e}%`;
        if (value && !Number.isNaN(number)) value.textContent = `${(number * e).toFixed(1)} ${unit}`.trim();
        if (t < 1) requestAnimationFrame(tick); else if (value) value.textContent = final;
      };
      requestAnimationFrame(tick);
    }));
  });
  prose.querySelectorAll('.stage-flow').forEach((figure) => {
    figure.dataset.live = 'true';
    if (!motion) return;
    seen(figure, () => figure.dataset.pulse = 'on');
  });
}
