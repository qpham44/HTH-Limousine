/**
 * Builds the HTH Heritage Atlas geometry from Natural Earth.
 *
 *   node scripts/build-atlas.mts
 *
 * Downloads four Natural Earth 1:10m layers (public domain) from the v5.1.2
 * release, clips them to the plate windows in lib/atlas/projection.ts,
 * projects them, simplifies them, and writes:
 *
 *   data/atlas/geometry.json       — SVG path data the component renders
 *   data/atlas/vietnam-outline.json — Vietnam in lon/lat, ~100m tolerance,
 *                                    used only by the tests
 *
 * Nothing is drawn by hand. Vietnam comes from the Vietnam point-of-view
 * edition of the countries layer, which includes the Hoàng Sa (Paracel) and
 * Trường Sa (Spratly) archipelagos as Vietnamese territory.
 *
 * Needs Node 22.18 or later (TypeScript type stripping). Run it again only if
 * the plate windows change; the output is committed.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { locatorPlate, mainPlate, plateHeight, project, type Plate } from '../lib/atlas/projection.ts';

type Pt = [number, number];
type Ring = Pt[];

const NE_TAG = 'v5.1.2';
const NE_BASE = `https://raw.githubusercontent.com/nvkelso/natural-earth-vector/${NE_TAG}/geojson`;
const LAYERS = {
  countries: 'ne_10m_admin_0_countries_vnm.geojson',
  boundaries: 'ne_10m_admin_0_boundary_lines_land.geojson',
  rivers: 'ne_10m_rivers_lake_centerlines.geojson',
  lakes: 'ne_10m_lakes.geojson',
};

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const cache = join(root, '.atlas-cache');

async function load(file: string): Promise<any> {
  const local = join(cache, file);
  if (!existsSync(local)) {
    await mkdir(cache, { recursive: true });
    process.stdout.write(`downloading ${file} … `);
    const res = await fetch(`${NE_BASE}/${file}`);
    if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`);
    await writeFile(local, Buffer.from(await res.arrayBuffer()));
    console.log('ok');
  }
  return JSON.parse(await readFile(local, 'utf8'));
}

// ---------------------------------------------------------------- geometry

function polygonsOf(geom: any): Ring[][] {
  if (!geom) return [];
  if (geom.type === 'Polygon') return [geom.coordinates];
  if (geom.type === 'MultiPolygon') return geom.coordinates;
  return [];
}

function linesOf(geom: any): Pt[][] {
  if (!geom) return [];
  if (geom.type === 'LineString') return [geom.coordinates];
  if (geom.type === 'MultiLineString') return geom.coordinates;
  return [];
}

/** Sutherland–Hodgman against an axis-aligned rectangle. */
function clipRing(ring: Ring, [x0, y0, x1, y1]: [number, number, number, number]): Ring {
  const edges: [(p: Pt) => boolean, (a: Pt, b: Pt) => Pt][] = [
    [(p) => p[0] >= x0, (a, b) => [x0, a[1] + ((b[1] - a[1]) * (x0 - a[0])) / (b[0] - a[0])]],
    [(p) => p[0] <= x1, (a, b) => [x1, a[1] + ((b[1] - a[1]) * (x1 - a[0])) / (b[0] - a[0])]],
    [(p) => p[1] >= y0, (a, b) => [a[0] + ((b[0] - a[0]) * (y0 - a[1])) / (b[1] - a[1]), y0]],
    [(p) => p[1] <= y1, (a, b) => [a[0] + ((b[0] - a[0]) * (y1 - a[1])) / (b[1] - a[1]), y1]],
  ];
  let out = ring;
  for (const [inside, cut] of edges) {
    const input = out;
    out = [];
    for (let i = 0; i < input.length; i++) {
      const cur = input[i];
      const prev = input[(i + input.length - 1) % input.length];
      if (inside(cur)) {
        if (!inside(prev)) out.push(cut(prev, cur));
        out.push(cur);
      } else if (inside(prev)) {
        out.push(cut(prev, cur));
      }
    }
    if (out.length === 0) break;
  }
  return out;
}

/** Splits a polyline into the runs that fall inside the rectangle. */
function clipLine(line: Pt[], [x0, y0, x1, y1]: [number, number, number, number]): Pt[][] {
  const inside = (p: Pt) => p[0] >= x0 && p[0] <= x1 && p[1] >= y0 && p[1] <= y1;
  const runs: Pt[][] = [];
  let run: Pt[] = [];
  for (let i = 0; i < line.length; i++) {
    if (inside(line[i])) {
      if (run.length === 0 && i > 0) run.push(line[i - 1]);
      run.push(line[i]);
    } else if (run.length) {
      run.push(line[i]);
      runs.push(run);
      run = [];
    }
  }
  if (run.length > 1) runs.push(run);
  return runs;
}

function perpDist(p: Pt, a: Pt, b: Pt): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  if (dx === 0 && dy === 0) return Math.hypot(p[0] - a[0], p[1] - a[1]);
  return Math.abs(dy * p[0] - dx * p[1] + b[0] * a[1] - b[1] * a[0]) / Math.hypot(dx, dy);
}

/** Douglas–Peucker, iterative. */
function simplify(points: Pt[], tolerance: number): Pt[] {
  if (points.length <= 2) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = keep[points.length - 1] = 1;
  const stack: [number, number][] = [[0, points.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop()!;
    let max = 0;
    let at = -1;
    for (let i = s + 1; i < e; i++) {
      const d = perpDist(points[i], points[s], points[e]);
      if (d > max) { max = d; at = i; }
    }
    if (max > tolerance && at > 0) {
      keep[at] = 1;
      stack.push([s, at], [at, e]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

function area(ring: Ring): number {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    a += (ring[j][0] + ring[i][0]) * (ring[j][1] - ring[i][1]);
  }
  return Math.abs(a / 2);
}

/** Cheap rejection in degrees before projecting, which also keeps the poles out of Mercator. */
function nearPlate(points: Pt[], plate: Plate): boolean {
  const [w, s, e, n] = plate.bounds;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const [x, y] of points) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  const pad = 2;
  return maxX >= w - pad && minX <= e + pad && maxY >= s - pad && minY <= n + pad && minY > -80 && maxY < 84;
}

const fmt = (n: number) => (Math.round(n * 10) / 10).toString();

function ringPath(ring: Ring): string {
  return 'M' + ring.map((p) => `${fmt(p[0])} ${fmt(p[1])}`).join('L') + 'Z';
}

function linePath(line: Pt[]): string {
  return 'M' + line.map((p) => `${fmt(p[0])} ${fmt(p[1])}`).join('L');
}

interface PlateOptions {
  tolerance: number;
  minArea: number;
  margin: number;
}

function polygonPaths(features: any[], plate: Plate, o: PlateOptions): { d: string; islands: Pt[] } {
  const h = plateHeight(plate);
  const box: [number, number, number, number] = [-o.margin, -o.margin, plate.width + o.margin, h + o.margin];
  let d = '';
  const islands: Pt[] = [];
  for (const f of features) {
    for (const poly of polygonsOf(f.geometry)) {
      poly.forEach((ring, ringIndex) => {
        if (!nearPlate(ring as Pt[], plate)) return;
        const projected = ring.map((p) => project(plate, p as Pt));
        const clipped = clipRing(projected, box);
        if (clipped.length < 3) return;
        const a = area(clipped);
        if (a < o.minArea) {
          // Too small to draw as a shape. Outer rings of tiny islands are kept
          // as points so archipelagos still read on the locator.
          if (ringIndex === 0) {
            const cx = clipped.reduce((s, p) => s + p[0], 0) / clipped.length;
            const cy = clipped.reduce((s, p) => s + p[1], 0) / clipped.length;
            if (cx >= 0 && cx <= plate.width && cy >= 0 && cy <= h) islands.push([+fmt(cx), +fmt(cy)]);
          }
          return;
        }
        const simple = simplify([...clipped, clipped[0]], o.tolerance).slice(0, -1);
        if (simple.length >= 3) d += ringPath(simple);
      });
    }
  }
  return { d, islands };
}

function linePaths(features: any[], plate: Plate, tolerance: number): string {
  const h = plateHeight(plate);
  const box: [number, number, number, number] = [-4, -4, plate.width + 4, h + 4];
  let d = '';
  for (const f of features) {
    for (const line of linesOf(f.geometry)) {
      if (!nearPlate(line, plate)) continue;
      const projected = line.map((p) => project(plate, p as Pt));
      for (const run of clipLine(projected, box)) {
        const simple = simplify(run, tolerance);
        if (simple.length >= 2) d += linePath(simple);
      }
    }
  }
  return d;
}

// ---------------------------------------------------------------- build

const countries = await load(LAYERS.countries);
const boundaries = await load(LAYERS.boundaries);
const rivers = await load(LAYERS.rivers);
const lakes = await load(LAYERS.lakes);

const isVietnam = (f: any) => f.properties.ADM0_A3 === 'VNM';
const vietnam = countries.features.filter(isVietnam);
if (vietnam.length !== 1) throw new Error(`expected one Vietnam feature, found ${vietnam.length}`);
const others = countries.features.filter((f: any) => !isVietnam(f));

const mainOpts: PlateOptions = { tolerance: 0.35, minArea: 1.2, margin: 30 };
const main = {
  width: mainPlate.width,
  height: plateHeight(mainPlate),
  bounds: mainPlate.bounds,
  vietnam: polygonPaths(vietnam, mainPlate, mainOpts).d,
  neighbours: polygonPaths(others, mainPlate, mainOpts).d,
  boundaries: linePaths(boundaries.features, mainPlate, 0.35),
  rivers: linePaths(
    rivers.features.filter((f: any) => f.properties.featurecla === 'River' && f.properties.scalerank <= 9),
    mainPlate,
    0.4,
  ),
  lakes: polygonPaths(lakes.features, mainPlate, mainOpts).d,
};

const locOpts: PlateOptions = { tolerance: 0.3, minArea: 0.35, margin: 12 };
const locVietnam = polygonPaths(vietnam, locatorPlate, locOpts);
const locator = {
  width: locatorPlate.width,
  height: plateHeight(locatorPlate),
  bounds: locatorPlate.bounds,
  vietnam: locVietnam.d,
  islands: locVietnam.islands,
  neighbours: polygonPaths(others, locatorPlate, { ...locOpts, minArea: 2 }).d,
};

const out = {
  generatedBy: 'scripts/build-atlas.mts',
  source: `Natural Earth 1:10m ${NE_TAG} (public domain): ${Object.values(LAYERS).join(', ')}`,
  main,
  locator,
};

await mkdir(join(root, 'data/atlas'), { recursive: true });
await writeFile(join(root, 'data/atlas/geometry.json'), JSON.stringify(out));

// Test fixture: Vietnam's outline in degrees, ~0.001° (≈100 m) tolerance.
const outline: Ring[] = [];
for (const poly of polygonsOf(vietnam[0].geometry)) {
  const outer = poly[0] as Ring;
  if (area(outer) < 0.0005) continue;
  outline.push(simplify(outer, 0.001).map(([x, y]) => [+x.toFixed(4), +y.toFixed(4)] as Pt));
}
await writeFile(
  join(root, 'data/atlas/vietnam-outline.json'),
  JSON.stringify({ source: out.source, rings: outline }),
);

const kb = (s: string) => (s.length / 1024).toFixed(1) + 'KB';
console.log(
  `main ${main.width}×${main.height}: vietnam ${kb(main.vietnam)}, neighbours ${kb(main.neighbours)}, ` +
    `boundaries ${kb(main.boundaries)}, rivers ${kb(main.rivers)}, lakes ${kb(main.lakes)}`,
);
console.log(`locator ${locator.width}×${locator.height}: vietnam ${kb(locator.vietnam)}, ${locator.islands.length} island points`);
console.log(`outline rings: ${outline.length}`);
