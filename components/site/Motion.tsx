'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Site-wide motion, deliberately unhurried:
 *   • Lenis inertia scroll, driven by GSAP's ticker so ScrollTrigger stays in step;
 *   • main headings rise line by line from behind a mask;
 *   • [data-parallax] photographs drift slightly against the scroll;
 *   • [data-stagger] grids fade up one item after another.
 *
 * Nothing runs for visitors who prefer reduced motion: the page is simply there.
 * Elements inside [data-lenis-prevent] (the map, its panel) keep native scrolling.
 */
export default function Motion() {
  const pathname = usePathname();

  // Inertia scroll, once for the whole visit.
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      anchors: { offset: -90 },
    });
    lenis.on('scroll', ScrollTrigger.update);
    if (process.env.NODE_ENV !== 'production') (window as unknown as { __lenis?: Lenis }).__lenis = lenis;
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  // Scroll-linked motion, rebuilt for each page.
  useEffect(() => {
    const mm = gsap.matchMedia();
    const splits: SplitText[] = [];

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      // Masked line reveal on the main headings.
      const headings = gsap.utils.toArray<HTMLElement>('main h1, main h2').filter(
        (el) => !el.closest('[data-no-split], [data-lenis-prevent]'),
      );
      for (const el of headings) {
        const split = SplitText.create(el, {
          type: 'lines',
          mask: 'lines',
          linesClass: 'gs-line',
          autoSplit: true,
          onSplit(self) {
            return gsap.from(self.lines, {
              yPercent: 110,
              duration: 1.25,
              ease: 'power4.out',
              stagger: 0.1,
              scrollTrigger: { trigger: el, start: 'top 90%', once: true },
            });
          },
        });
        splits.push(split);
      }

      // Depth: photographs drift against the scroll inside their frames.
      for (const frame of gsap.utils.toArray<HTMLElement>('[data-parallax]')) {
        const img = frame.querySelector('img');
        if (!img) continue;
        const amount = Number(frame.dataset.parallax) || 7;
        gsap.fromTo(
          img,
          { yPercent: -amount, scale: 1.14 },
          {
            yPercent: amount,
            scale: 1.14,
            ease: 'none',
            scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
          },
        );
      }

      // Measured, one-after-another entrances.
      for (const group of gsap.utils.toArray<HTMLElement>('[data-stagger]')) {
        gsap.from(group.children, {
          y: 56,
          autoAlpha: 0,
          duration: 1.35,
          ease: 'power3.out',
          stagger: 0.14,
          scrollTrigger: { trigger: group, start: 'top 86%', once: true },
        });
      }
    });

    // Late-loading images change heights; measure again once the page settles.
    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 1200);
    return () => {
      window.clearTimeout(refresh);
      splits.forEach((s) => s.revert());
      mm.revert();
    };
  }, [pathname]);

  return null;
}
