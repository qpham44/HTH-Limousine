'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Renders children only once the block is close to the viewport.
 *
 * Both maps sit well below the fold but were mounting on page load, pulling
 * roughly 140KB of tiles and a third-party connection onto the critical path
 * while the hero image was still decoding.
 *
 * There is deliberately no timer here. An earlier version mounted the children
 * after a couple of seconds as a safety net, which defeated the whole point:
 * the tiles simply loaded a moment later and still competed for bandwidth.
 * The only fallback is for a browser with no IntersectionObserver at all, where
 * the children render immediately.
 */
export default function InView({
  children,
  rootMargin = '200px',
  className,
}: {
  children: React.ReactNode;
  rootMargin?: string;
  className?: string;
}) {
  const holder = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (shown) return;

    const node = holder.current;
    if (!node) return;

    if (!('IntersectionObserver' in window)) {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [shown, rootMargin]);

  return (
    <div ref={holder} className={className} style={{ position: 'absolute', inset: 0 }}>
      {shown ? children : null}
    </div>
  );
}
