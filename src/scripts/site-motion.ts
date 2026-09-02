import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export type MotionMode = 'none' | 'static' | 'enhanced';

export type MotionConditions = {
  reducedMotion: boolean;
  hasTargets: boolean;
};

export function resolveMotionMode({ reducedMotion, hasTargets }: MotionConditions): MotionMode {
  if (!hasTargets) return 'none';
  if (reducedMotion) return 'static';
  return 'enhanced';
}

export function initSiteMotion(root: ParentNode = document): () => void {
  const scopes = Array.from(root.querySelectorAll<HTMLElement>('[data-motion-scope]'));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mode = resolveMotionMode({ reducedMotion: reduceMotion, hasTargets: scopes.length > 0 });

  if (mode === 'none') return () => undefined;

  if (mode === 'static') {
    scopes.forEach((scope) => {
      scope.dataset.motionState = 'static';
      delete scope.dataset.motionEnhanced;
    });
    return () => scopes.forEach((scope) => delete scope.dataset.motionState);
  }

  gsap.registerPlugin(ScrollTrigger);
  const eventCleanups: Array<() => void> = [];
  const timelines: gsap.core.Timeline[] = [];
  const contextRoot = root instanceof Document ? root.body : root.querySelector<HTMLElement>('[data-motion-scope]') ?? document.body;

  scopes.forEach((scope) => {
    scope.dataset.motionEnhanced = 'true';
    scope.dataset.motionState = 'enhanced';
  });

  const context = gsap.context(() => {
    root.querySelectorAll<HTMLElement>('[data-motion-reveal]').forEach((element, index) => {
      const revealOffset = element.closest('[data-work-opening-media]') ? 0 : 28;
      gsap.fromTo(
        element,
        // Keep offscreen text and links in the accessibility tree and tab order.
        { y: revealOffset },
        {
          y: 0,
          duration: 0.85,
          delay: Math.min(index * 0.06, 0.18),
          ease: 'power3.out',
          scrollTrigger: { trigger: element, start: 'top 88%', once: true },
        },
      );
    });

    const hero = root.querySelector<HTMLElement>('[data-velvet-hero]');
    if (hero) {
      const signal = hero.querySelector<HTMLElement>('[data-hero-signal]');
      const signalWord = hero.querySelector<HTMLElement>('[data-hero-signal-word]');
      const domains = Array.from(hero.querySelectorAll<HTMLElement>('[data-domain-trace]'));
      const domainMarkers = Array.from(hero.querySelectorAll<HTMLElement>('[data-domain-marker]'));
      const figure = hero.querySelector<HTMLElement>('.velvet-hero__figure');
      const domainPlane = hero.querySelector<HTMLElement>('.velvet-hero__domains');

      if (signal && signalWord) {
        const signalTimeline = gsap.timeline({ repeat: -1, repeatDelay: 2.6, delay: 2.8 });
        signalTimeline
          .fromTo(signal, { '--signal-progress': '0%' }, { '--signal-progress': '100%', duration: 1.1, ease: 'power2.inOut' })
          .to(signalWord, { color: '#edeae2', textShadow: '0 0 18px rgba(49, 94, 245, 0.35)', duration: 0.5 }, '<0.35')
          .to(signalWord, { color: '#d6a248', textShadow: 'none', duration: 0.8 }, '+=1.6')
          .to(signal, { autoAlpha: 0, y: -6, duration: 0.45, ease: 'power2.in' }, '+=0.45')
          .set(signal, { '--signal-progress': '0%', y: 6 })
          .to(signal, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'power3.out' }, '+=0.3');
        timelines.push(signalTimeline);
      }

      if (domains.length) {
        const domainTimeline = gsap.timeline({ repeat: -1, delay: 3.2 });
        domains.forEach((domain) => {
          const marker = domainMarkers.find((candidate) => candidate.dataset.domainMarker === domain.dataset.domainTrace);
          domainTimeline
            .to(domainMarkers, { opacity: 0.58, duration: 0.35, ease: 'power2.out' })
            .to(marker ?? [], { opacity: 1, scale: 1.24, filter: 'drop-shadow(0 0 0.9rem rgba(214, 162, 72, 0.58))', duration: 0.45, ease: 'power2.out' }, '<')
            .to(marker ?? [], { opacity: 0.68, scale: 1, filter: 'none', duration: 0.5, delay: 1.2 });
        });
        timelines.push(domainTimeline);
      }

      if (figure && window.matchMedia('(pointer: fine)').matches) {
        const parallaxTargets = domainPlane ? [figure, domainPlane] : [figure];
        const moveX = parallaxTargets.map((target) => gsap.quickTo(target, 'x', { duration: 0.9, ease: 'power3.out' }));
        const moveY = parallaxTargets.map((target) => gsap.quickTo(target, 'y', { duration: 0.9, ease: 'power3.out' }));
        const onPointerMove = (event: PointerEvent) => {
          const bounds = hero.getBoundingClientRect();
          const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 12;
          const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 8;
          moveX.forEach((move) => move(x));
          moveY.forEach((move) => move(y));
        };
        const onPointerLeave = () => {
          moveX.forEach((move) => move(0));
          moveY.forEach((move) => move(0));
        };
        hero.addEventListener('pointermove', onPointerMove, { passive: true });
        hero.addEventListener('pointerleave', onPointerLeave);
        eventCleanups.push(() => {
          hero.removeEventListener('pointermove', onPointerMove);
          hero.removeEventListener('pointerleave', onPointerLeave);
        });
      }
    }

    const aboutDiorama = root.querySelector<HTMLElement>('[data-about-diorama]');
    if (aboutDiorama) {
      gsap.fromTo(
        aboutDiorama,
        { yPercent: 4 },
        { yPercent: -4, ease: 'none', scrollTrigger: { trigger: aboutDiorama, start: 'top bottom', end: 'bottom top', scrub: 0.8 } },
      );
    }
  }, contextRoot);

  const onVisibilityChange = () => timelines.forEach((timeline) => (document.hidden ? timeline.pause() : timeline.resume()));
  document.addEventListener('visibilitychange', onVisibilityChange);
  eventCleanups.push(() => document.removeEventListener('visibilitychange', onVisibilityChange));

  return () => {
    eventCleanups.forEach((cleanup) => cleanup());
    timelines.forEach((timeline) => timeline.kill());
    context.revert();
    scopes.forEach((scope) => {
      delete scope.dataset.motionEnhanced;
      delete scope.dataset.motionState;
    });
  };
}
