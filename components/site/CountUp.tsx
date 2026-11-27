'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';

const useIsoLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * A number that counts up from 0 the first time it scrolls into view.
 *
 * The server renders the final value, so search engines, screen readers and
 * visitors without JavaScript always see the real figure. On the client the
 * number is reset to 0 before the first paint and counted up once.
 * Reduced motion: the final value, no count.
 */
export default function CountUp({
  value,
  locale = 'vi',
  duration = 1800,
  delay = 0,
}: {
  value: number;
  locale?: 'vi' | 'en';
  duration?: number;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [shown, setShown] = useState(value);
  const done = useRef(false);

  useIsoLayoutEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) return;
    setShown(0);
  }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node || done.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;

    let raf = 0;
    let timer = 0;
    const run = () => {
      const t0 = performance.now();
      const frame = (now: number) => {
        const t = Math.min((now - t0) / duration, 1);
        // easeOutExpo: fast start, a long gentle landing on the final figure.
        const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
        setShown(Math.round(value * eased));
        if (t < 1) raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || done.current) return;
        done.current = true;
        io.disconnect();
        timer = window.setTimeout(run, delay);
      },
      { threshold: 0.4 },
    );
    io.observe(node);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
    };
  }, [value, duration, delay]);

  return (
    <span ref={ref} className="u-num">
      {shown.toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN')}
    </span>
  );
}
