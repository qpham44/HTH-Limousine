'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { paths, type Locale } from '@/lib/i18n';
import { destinations } from '@/data/destinations';
import { directionFromOrigin, dms, originPoint, pad2, points, routes, type Anchor, type AtlasPoint } from './atlasModel';
import styles from './HeritageAtlas.module.css';

const C = {
  vi: {
    mapLabel: (n: number) =>
      `Bản đồ miền Nam và Nam Trung Bộ Việt Nam. Từ TP. Hồ Chí Minh, HTH phục vụ ${n} điểm đến; danh sách đầy đủ ở bên cạnh.`,
    index: 'Danh mục điểm đến',
    prompt: 'Chọn một điểm đến trên bản đồ hoặc trong danh mục.',
    summary: (n: number) => `${n} điểm đến · khởi hành từ TP. Hồ Chí Minh`,
    from: 'Hướng',
    fromSuffix: 'TP. Hồ Chí Minh',
    coords: 'Toạ độ',
    represents: 'Điểm đại diện',
    guide: 'Xem tuyến đường',
    book: 'Đặt xe đi',
    clear: 'Bỏ chọn',
    origin: 'Điểm khởi hành',
  },
  en: {
    mapLabel: (n: number) =>
      `Map of southern and south-central Vietnam. From Ho Chi Minh City, HTH serves ${n} destinations; the full list is alongside.`,
    index: 'Index of destinations',
    prompt: 'Choose a destination on the map or from the index.',
    summary: (n: number) => `${n} destinations · departing Ho Chi Minh City`,
    from: 'Lies',
    fromSuffix: 'of Ho Chi Minh City',
    coords: 'Coordinates',
    represents: 'Shown at',
    guide: 'Read the route guide',
    book: 'Book a car to',
    clear: 'Clear',
    origin: 'Point of departure',
  },
} as const;

/** Label offsets in screen pixels from the marker centre. */
const OFFSET = 11;
function labelPosition(a: Anchor): { dx: number; dy: number; anchor: 'start' | 'middle' | 'end' } {
  switch (a) {
    case 'n': return { dx: 0, dy: -OFFSET - 2, anchor: 'middle' };
    case 's': return { dx: 0, dy: OFFSET + 10, anchor: 'middle' };
    case 'e': return { dx: OFFSET, dy: 4, anchor: 'start' };
    case 'w': return { dx: -OFFSET, dy: 4, anchor: 'end' };
    case 'ne': return { dx: OFFSET - 2, dy: -OFFSET + 1, anchor: 'start' };
    case 'nw': return { dx: -OFFSET + 2, dy: -OFFSET + 1, anchor: 'end' };
    case 'se': return { dx: OFFSET - 2, dy: OFFSET + 8, anchor: 'start' };
    case 'sw': return { dx: -OFFSET + 2, dy: OFFSET + 8, anchor: 'end' };
  }
}

/** Plate width in SVG units, plus the margin the frame labels need. */
const VIEW = { x: -16, y: -30, extraW: 62, extraH: 46 };

export default function AtlasPlate({
  locale,
  width,
  height,
  children,
}: {
  locale: Locale;
  width: number;
  height: number;
  /** The static engraved layers, rendered on the server. */
  children: React.ReactNode;
}) {
  const c = C[locale];
  const holder = useRef<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  // SVG units per CSS pixel. Markers and type are sized in pixels and scaled
  // by this, so they stay the same size on a phone as on a wide screen.
  const [u, setU] = useState(1.55);
  const [compact, setCompact] = useState(false);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const node = holder.current;
    if (!node) return;
    const measure = () => {
      const w = node.getBoundingClientRect().width;
      if (w > 0) {
        setU((width + VIEW.extraW) / w);
        setCompact(w < 640);
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(node);
    return () => ro.disconnect();
  }, [width]);

  // Draw the network in once, the first time the plate is on screen.
  useEffect(() => {
    const node = holder.current;
    if (!node || drawn) return;
    if (!('IntersectionObserver' in window)) { setDrawn(true); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { setDrawn(true); io.disconnect(); }
    }, { threshold: 0.25 });
    io.observe(node);
    return () => io.disconnect();
  }, [drawn]);

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setSelected(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected]);

  const active = hovered ?? selected;
  const toggle = useCallback((id: string) => setSelected((s) => (s === id ? null : id)), []);
  const chosen = useMemo(() => points.find((p) => p.d.id === selected) ?? null, [selected]);

  const routeState = (id: string) =>
    id === selected ? 'selected' : id === hovered ? 'hover' : active ? 'dim' : 'rest';

  const name = (p: AtlasPoint) => p.d.name[locale];

  return (
    <div className={styles.body}>
      <div className={styles.plateWrap}>
        <div ref={holder} className={styles.plate} data-drawn={drawn ? '' : undefined}>
          <svg
            viewBox={`${VIEW.x} ${VIEW.y} ${width + VIEW.extraW} ${height + VIEW.extraH}`}
            role="img"
            aria-label={c.mapLabel(destinations.length)}
            style={{ ['--u' as string]: u } as React.CSSProperties}
            onMouseLeave={() => setHovered(null)}
          >
            {children}

            {/* The network --------------------------------------------------- */}
            <g className="atl-routes" aria-hidden="true">
              {routes.map((r, i) => (
                <path
                  key={r.id}
                  d={r.path}
                  className="atl-route"
                  data-state={routeState(r.id)}
                  style={{
                    strokeDasharray: r.length,
                    strokeDashoffset: drawn ? 0 : r.length,
                    transitionDelay: drawn ? `${0.15 + i * 0.06}s` : undefined,
                  }}
                />
              ))}
            </g>

            {/* Generous invisible hit lines along each route, for the pointer. */}
            <g aria-hidden="true">
              {routes.map((r) => (
                <path
                  key={r.id}
                  d={r.path}
                  className="atl-route-hit"
                  style={{ strokeWidth: 12 * u }}
                  onMouseEnter={() => setHovered(r.id)}
                  onClick={() => toggle(r.id)}
                />
              ))}
            </g>

            {/* Destinations ------------------------------------------------- */}
            <g aria-hidden="true">
              {points.slice(1).map((p) => {
                const state = p.d.id === selected ? 'selected' : p.d.id === hovered ? 'hover' : active ? 'dim' : 'rest';
                const lp = labelPosition(p.anchor);
                const showName = !compact || state === 'selected' || state === 'hover';
                return (
                  <g
                    key={p.d.id}
                    className="atl-dest"
                    data-state={state}
                    transform={`translate(${p.x} ${p.y})`}
                    onMouseEnter={() => setHovered(p.d.id)}
                    onClick={() => toggle(p.d.id)}
                  >
                    <circle className="atl-dest-hit" r={14 * u} />
                    <circle className="atl-dest-halo" r={8.5 * u} />
                    <circle className="atl-dest-dot" r={(state === 'selected' || state === 'hover' ? 4 : 3.2) * u} />
                    {showName ? (
                      <text
                        className="atl-dest-label"
                        x={lp.dx * u}
                        y={lp.dy * u}
                        textAnchor={lp.anchor}
                        style={{ fontSize: 12 * u }}
                      >
                        {name(p)}
                      </text>
                    ) : (
                      <text
                        className="atl-dest-num"
                        x={lp.dx * u * 0.85}
                        y={lp.dy * u * 0.9}
                        textAnchor={lp.anchor}
                        style={{ fontSize: 10.5 * u }}
                      >
                        {pad2(p.index)}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>

            {/* Origin: a bezel of twelve indices around a gold centre. */}
            <g className="atl-origin" transform={`translate(${originPoint.x} ${originPoint.y})`} aria-hidden="true">
              <circle className="atl-origin-ring" r={14 * u} />
              {Array.from({ length: 12 }, (_, i) => {
                const a = (i * Math.PI) / 6;
                const r0 = (i % 3 === 0 ? 15.5 : 17) * u;
                const r1 = 19.5 * u;
                return (
                  <line
                    key={i}
                    className="atl-origin-tick"
                    x1={Math.sin(a) * r0}
                    y1={-Math.cos(a) * r0}
                    x2={Math.sin(a) * r1}
                    y2={-Math.cos(a) * r1}
                  />
                );
              })}
              <circle className="atl-origin-core" r={5 * u} />
              {/* On a phone the panel names the origin; the label would cover the cluster. */}
              {compact ? null : <text
                className="atl-origin-label"
                x={20 * u}
                y={-19 * u}
                style={{ fontSize: 15 * u }}
              >
                {originPoint.d.name[locale]}
              </text>}
            </g>
          </svg>
        </div>
      </div>

      {/* Detail and index ---------------------------------------------------- */}
      <aside className={styles.side}>
        <div className={styles.detail} aria-live="polite">
          {chosen ? (
            <>
              <div className={styles.detailTop}>
                <span className={styles.detailNum}>
                  {pad2(chosen.index)}
                  <span> / {pad2(destinations.length)}</span>
                </span>
                <button type="button" className={styles.clear} onClick={() => setSelected(null)}>
                  {c.clear}
                </button>
              </div>
              <h3 className={styles.detailName}>{chosen.d.name[locale]}</h3>
              <p className={styles.detailRegion}>{chosen.d.region[locale]}</p>
              <dl className={styles.facts}>
                {chosen.d.represents ? (
                  <div>
                    <dt>{c.represents}</dt>
                    <dd>{chosen.d.represents[locale]}</dd>
                  </div>
                ) : null}
                <div>
                  <dt>{c.from}</dt>
                  <dd>
                    {locale === 'vi'
                      ? `Phía ${directionFromOrigin(chosen.d, locale)} ${c.fromSuffix}`
                      : `${directionFromOrigin(chosen.d, locale)} ${c.fromSuffix}`}
                  </dd>
                </div>
                <div>
                  <dt>{c.coords}</dt>
                  <dd className="u-num">{dms(chosen.d.coordinates)}</dd>
                </div>
              </dl>
              <div className={styles.actions}>
                {chosen.d.routeSlug ? (
                  <Link className="tlink" href={paths.route(locale, chosen.d.routeSlug[locale])}>
                    {c.guide}
                  </Link>
                ) : null}
                <Link className="tlink" href={paths.booking(locale)}>
                  {c.book} {chosen.d.name[locale]}
                </Link>
              </div>
            </>
          ) : (
            <>
              <span className={styles.detailNum}>{c.origin}</span>
              <h3 className={styles.detailName}>{originPoint.d.name[locale]}</h3>
              <p className={`${styles.detailRegion} u-num`}>{dms(originPoint.d.coordinates)}</p>
              <p className={styles.prompt}>{c.summary(destinations.length)}. {c.prompt}</p>
            </>
          )}
        </div>

        <h3 className={styles.indexHead}>{c.index}</h3>
        <ol className={styles.index} onMouseLeave={() => setHovered(null)}>
          {points.slice(1).map((p) => (
            <li key={p.d.id}>
              <button
                type="button"
                className={styles.indexItem}
                aria-pressed={selected === p.d.id}
                data-active={active === p.d.id ? '' : undefined}
                onClick={() => toggle(p.d.id)}
                onMouseEnter={() => setHovered(p.d.id)}
                onFocus={() => setHovered(p.d.id)}
                onBlur={() => setHovered(null)}
              >
                <span className={styles.indexNum}>{pad2(p.index)}</span>
                <span className={styles.indexName}>{name(p)}</span>
              </button>
            </li>
          ))}
        </ol>
      </aside>
    </div>
  );
}
