'use client';

import { useEffect } from 'react';

const ARM_DELAY = 1500;

/**
 * One IntersectionObserver for the whole page: anything with `.reveal` fades
 * and rises 10px the first time it comes into view.
 *
 * The hidden state is applied here rather than in the stylesheet, so the page
 * is readable when JavaScript does not run, when the visitor prefers reduced
 * motion, or when intersections are never reported. A timer un-arms anything
 * the observer has not reached, so content can never be stranded invisible.
 */
export default function Reveal() {
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || !('IntersectionObserver' in window)) return;

    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    if (nodes.length === 0) return;

    nodes.forEach((node) => node.classList.add('is-armed'));

    const show = (node: HTMLElement) => node.classList.add('is-in');

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          show(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 },
    );

    nodes.forEach((node) => observer.observe(node));

    // Failsafe: whatever has not been reached by now is shown regardless.
    const failsafe = window.setTimeout(() => nodes.forEach(show), ARM_DELAY);

    return () => {
      window.clearTimeout(failsafe);
      observer.disconnect();
    };
  }, []);

  return null;
}
