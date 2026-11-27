import { atlasPoints, destinations, origin, type Destination } from '@/data/destinations';
import { mainPlate, project } from '@/lib/atlas/projection';
import type { Locale } from '@/lib/i18n';

/**
 * Presentation model for the atlas: projected positions, route curves and
 * label placement. Coordinates are read from data/destinations.ts and never
 * edited here; this file only decides how they are drawn.
 */

export type Anchor = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

/** Which side of its marker each name sits on, chosen to keep the cluster around Saigon legible. */
const anchors: Record<string, Anchor> = {
  'ho-chi-minh-city': 'ne',
  'da-lat': 'e',
  'bao-loc': 'w',
  'phan-thiet': 'se',
  'phan-rang': 'e',
  'nha-trang': 'e',
  'ho-tram': 'se',
  'can-gio': 's',
  'my-tho': 's',
  'tay-ninh': 'w',
  'can-tho': 's',
  'rach-gia': 'w',
  'an-giang': 'n',
  'dong-thap': 'n',
  'ca-mau': 'w',
};

export interface AtlasPoint {
  d: Destination;
  /** 1–14 in list order; 0 for the origin. */
  index: number;
  x: number;
  y: number;
  anchor: Anchor;
}

export interface AtlasRoute {
  id: string;
  /** SVG path, origin to destination. */
  path: string;
  length: number;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

export const points: AtlasPoint[] = atlasPoints.map((d) => {
  const [x, y] = project(mainPlate, d.coordinates);
  return {
    d,
    index: d.type === 'origin' ? 0 : destinations.indexOf(d) + 1,
    x: r1(x),
    y: r1(y),
    anchor: anchors[d.id] ?? 'e',
  };
});

export const originPoint = points[0];

/**
 * A gentle arc from the origin to each destination. Every curve bows to the
 * same side of its direction of travel, so the network reads as one system.
 * These are connections, not roads: the curve carries no route information.
 */
export const routes: AtlasRoute[] = points.slice(1).map((p) => {
  const dx = p.x - originPoint.x;
  const dy = p.y - originPoint.y;
  const len = Math.hypot(dx, dy);
  const bow = Math.min(0.16 * len, 70);
  const cx = originPoint.x + dx / 2 + (dy / len) * bow;
  const cy = originPoint.y + dy / 2 - (dx / len) * bow;
  // Quadratic Bézier length, close enough for dash animation.
  const chord = len;
  const control = Math.hypot(cx - originPoint.x, cy - originPoint.y) + Math.hypot(p.x - cx, p.y - cy);
  return {
    id: p.d.id,
    path: `M${originPoint.x} ${originPoint.y}Q${r1(cx)} ${r1(cy)} ${p.x} ${p.y}`,
    length: Math.ceil((2 * chord + control) / 3),
  };
});

/** Degrees, minutes, seconds — e.g. 11°56′47″N 108°26′31″E. */
export function dms([lon, lat]: [number, number]): string {
  const part = (v: number, pos: string, neg: string) => {
    const a = Math.abs(v);
    let deg = Math.floor(a);
    let min = Math.floor((a - deg) * 60);
    let sec = Math.round(((a - deg) * 60 - min) * 60);
    if (sec === 60) { sec = 0; min += 1; }
    if (min === 60) { min = 0; deg += 1; }
    return `${deg}°${String(min).padStart(2, '0')}′${String(sec).padStart(2, '0')}″${v >= 0 ? pos : neg}`;
  };
  return `${part(lat, 'N', 'S')} ${part(lon, 'E', 'W')}`;
}

const compass = {
  vi: ['Bắc', 'Đông Bắc', 'Đông', 'Đông Nam', 'Nam', 'Tây Nam', 'Tây', 'Tây Bắc'],
  en: ['north', 'north-east', 'east', 'south-east', 'south', 'south-west', 'west', 'north-west'],
};

/** Compass direction of a destination from the origin, as a word. */
export function directionFromOrigin(d: Destination, locale: Locale): string {
  const r = Math.PI / 180;
  const [lon1, lat1] = origin.coordinates;
  const [lon2, lat2] = d.coordinates;
  const y = Math.sin((lon2 - lon1) * r) * Math.cos(lat2 * r);
  const x = Math.cos(lat1 * r) * Math.sin(lat2 * r) - Math.sin(lat1 * r) * Math.cos(lat2 * r) * Math.cos((lon2 - lon1) * r);
  const deg = (Math.atan2(y, x) / r + 360) % 360;
  return compass[locale][Math.round(deg / 45) % 8];
}

export const pad2 = (n: number) => String(n).padStart(2, '0');
