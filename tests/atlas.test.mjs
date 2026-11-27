/**
 * Coordinate integrity tests for the HTH Heritage Atlas.
 *
 *   npm run test:atlas
 *
 * Needs Node 22.18+ (imports TypeScript sources directly).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { origin, destinations } from '../data/destinations.ts';
import { validateDestinations, haversineKm } from '../lib/atlas/validate.ts';
import { mainPlate, plateHeight, project } from '../lib/atlas/projection.ts';

const outline = JSON.parse(readFileSync(new URL('../data/atlas/vietnam-outline.json', import.meta.url), 'utf8'));
const all = [origin, ...destinations];

function inside([x, y], ring) {
  let hit = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

/** Shortest distance from a point to Vietnam's outline, in km (approximate, fine at this scale). */
function kmToOutline(p) {
  let best = Infinity;
  for (const ring of outline.rings) {
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i];
      const b = ring[(i + 1) % ring.length];
      const dx = b[0] - a[0];
      const dy = b[1] - a[1];
      const t = dx || dy ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy))) : 0;
      best = Math.min(best, haversineKm(p, [a[0] + t * dx, a[1] + t * dy]));
    }
  }
  return best;
}

test('the destination list passes validation', () => {
  assert.deepEqual(validateDestinations(origin, destinations), []);
});

test('there are fourteen destinations and Ho Chi Minh City is the origin', () => {
  assert.equal(destinations.length, 14);
  assert.equal(origin.id, 'ho-chi-minh-city');
  assert.equal(origin.type, 'origin');
});

test('every point lies in Vietnam, or on its coast', () => {
  for (const d of all) {
    const onLand = outline.rings.some((ring) => inside(d.coordinates, ring));
    if (!onLand) {
      const km = kmToOutline(d.coordinates);
      assert.ok(km < 2.5, `${d.id} is ${km.toFixed(1)} km outside Vietnam`);
    }
  }
});

// Written from the map independently of the coordinates: which way each
// destination lies from central Ho Chi Minh City.
const expectedBearing = {
  'da-lat': 'NE',
  'phan-thiet': 'E',
  'nha-trang': 'NE',
  'can-tho': 'SW',
  'an-giang': 'W',
  'dong-thap': 'SW',
  'ca-mau': 'SW',
  'ho-tram': 'SE',
  'can-gio': 'SE',
  'tay-ninh': 'NW',
  'my-tho': 'SW',
  'bao-loc': 'NE',
  'phan-rang': 'E',
  'rach-gia': 'SW',
};

function bearing(from, to) {
  const r = Math.PI / 180;
  const y = Math.sin((to[0] - from[0]) * r) * Math.cos(to[1] * r);
  const x = Math.cos(from[1] * r) * Math.sin(to[1] * r) - Math.sin(from[1] * r) * Math.cos(to[1] * r) * Math.cos((to[0] - from[0]) * r);
  return (Math.atan2(y, x) / r + 360) % 360;
}

const centre = { N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315 };

// Octant plus a 10° allowance either side, so a place that is truly
// east-south-east is accepted as either E or SE but never as N or W.
test('each destination lies in the expected direction from the origin', () => {
  for (const d of destinations) {
    const deg = bearing(origin.coordinates, d.coordinates);
    const off = Math.abs(((deg - centre[expectedBearing[d.id]] + 540) % 360) - 180);
    assert.ok(off <= 32.5, `${d.id}: bearing ${deg.toFixed(0)}° is not ${expectedBearing[d.id]}`);
  }
});

test('every point falls inside the main plate', () => {
  const h = plateHeight(mainPlate);
  for (const d of all) {
    const [x, y] = project(mainPlate, d.coordinates);
    assert.ok(x > 0 && x < mainPlate.width && y > 0 && y < h, `${d.id} projects to ${x}, ${y}`);
  }
});

// ---- the validator itself rejects what it should

const good = destinations[0];
const withOne = (patch) => validateDestinations(origin, [{ ...good, ...patch }, ...destinations.slice(1)]);

test('rejects placeholder and missing coordinates', () => {
  assert.ok(withOne({ coordinates: [0, 0] }).some((p) => p.includes('placeholder')));
  assert.ok(withOne({ coordinates: undefined }).some((p) => p.includes('missing')));
  assert.ok(withOne({ coordinates: [Number.NaN, 11] }).some((p) => p.includes('finite')));
});

test('rejects invalid ranges and swapped latitude/longitude', () => {
  assert.ok(withOne({ coordinates: [200, 11] }).some((p) => p.includes('longitude')));
  assert.ok(withOne({ coordinates: [11.94646, 108.44193] }).some((p) => p.includes('order')));
});

test('rejects duplicate ids, missing names and missing sources', () => {
  assert.ok(withOne({ id: destinations[1].id }).some((p) => p.includes('duplicate')));
  assert.ok(withOne({ name: { vi: '', en: 'Da Lat' } }).some((p) => p.includes('name')));
  assert.ok(withOne({ coordinateSource: '' }).some((p) => p.includes('source')));
});

test('rejects sources that disagree', () => {
  const moved = withOne({ crossCheck: { source: 'test', coordinates: [108.6, 11.95] } });
  assert.ok(moved.some((p) => p.includes('disagree')));
});
