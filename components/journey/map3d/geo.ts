/** Small geodesy helpers for animating along a road line. */

export type LngLat = [number, number];

const R = 6371008.8;
const RAD = Math.PI / 180;

export function distance(a: LngLat, b: LngLat): number {
  const dLat = (b[1] - a[1]) * RAD;
  const dLon = (b[0] - a[0]) * RAD;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * RAD) * Math.cos(b[1] * RAD) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export function bearing(a: LngLat, b: LngLat): number {
  const y = Math.sin((b[0] - a[0]) * RAD) * Math.cos(b[1] * RAD);
  const x = Math.cos(a[1] * RAD) * Math.sin(b[1] * RAD) - Math.sin(a[1] * RAD) * Math.cos(b[1] * RAD) * Math.cos((b[0] - a[0]) * RAD);
  return (Math.atan2(y, x) / RAD + 360) % 360;
}

export interface Measured {
  coords: LngLat[];
  /** Cumulative distance in metres at each vertex. */
  cum: number[];
  total: number;
}

export function measure(coords: LngLat[]): Measured {
  const cum = [0];
  for (let i = 1; i < coords.length; i++) cum.push(cum[i - 1] + distance(coords[i - 1], coords[i]));
  return { coords, cum, total: cum[cum.length - 1] || 0 };
}

function indexAt(m: Measured, d: number): number {
  let lo = 0;
  let hi = m.cum.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (m.cum[mid] <= d) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/** The point at distance d (metres) along the line. */
export function along(m: Measured, d: number): LngLat {
  if (d <= 0) return m.coords[0];
  if (d >= m.total) return m.coords[m.coords.length - 1];
  const i = indexAt(m, d);
  const a = m.coords[i];
  const b = m.coords[i + 1];
  const seg = m.cum[i + 1] - m.cum[i] || 1;
  const t = (d - m.cum[i]) / seg;
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

/** The line from its start to distance d. */
export function slice(m: Measured, d: number): LngLat[] {
  if (d <= 0) return [m.coords[0], m.coords[0]];
  if (d >= m.total) return m.coords;
  const i = indexAt(m, d);
  return [...m.coords.slice(0, i + 1), along(m, d)];
}

/** Heading of the line at distance d, looking a little ahead (or back, at the very end). */
export function headingAt(m: Measured, d: number): number {
  const look = Math.max(80, m.total * 0.004);
  return d + look <= m.total
    ? bearing(along(m, d), along(m, d + look))
    : bearing(along(m, Math.max(0, d - look)), along(m, d));
}

/** Shortest signed difference between two bearings, in degrees. */
export function turn(from: number, to: number): number {
  return ((to - from + 540) % 360) - 180;
}

export function bounds(points: LngLat[]): [LngLat, LngLat] {
  let w = Infinity;
  let s = Infinity;
  let e = -Infinity;
  let n = -Infinity;
  for (const [x, y] of points) {
    if (x < w) w = x;
    if (x > e) e = x;
    if (y < s) s = y;
    if (y > n) n = y;
  }
  return [[w, s], [e, n]];
}

export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
