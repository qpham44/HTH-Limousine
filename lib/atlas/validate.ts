import type { Destination } from '@/data/destinations';

/**
 * Integrity rules for the atlas destinations. `next.config.ts` runs this at
 * build time and refuses to build on any problem, the same way it guards the
 * redirect map, so a placeholder or a typo can never reach production.
 */

/** Two independent sources must agree to within this distance. */
export const MAX_SOURCE_DISAGREEMENT_KM = 6;

/** Generous box around Vietnam's mainland and islands. */
const VIETNAM_BOX = { west: 102, south: 8, east: 118, north: 24 };

export function haversineKm([lon1, lat1]: [number, number], [lon2, lat2]: [number, number]): number {
  const r = Math.PI / 180;
  const dLat = (lat2 - lat1) * r;
  const dLon = (lon2 - lon1) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371.0088 * Math.asin(Math.sqrt(h));
}

function coordinateProblems(label: string, c: unknown): string[] {
  if (!Array.isArray(c) || c.length !== 2) return [`${label}: coordinates missing`];
  const [lon, lat] = c as [unknown, unknown];
  if (typeof lon !== 'number' || typeof lat !== 'number' || !Number.isFinite(lon) || !Number.isFinite(lat)) {
    return [`${label}: coordinates are not finite numbers`];
  }
  const out: string[] = [];
  if (lon < -180 || lon > 180) out.push(`${label}: longitude ${lon} is outside −180…180`);
  if (lat < -90 || lat > 90) out.push(`${label}: latitude ${lat} is outside −90…90`);
  if (lon === 0 && lat === 0) out.push(`${label}: placeholder [0, 0]`);
  if (lon < VIETNAM_BOX.west || lon > VIETNAM_BOX.east || lat < VIETNAM_BOX.south || lat > VIETNAM_BOX.north) {
    out.push(`${label}: [${lon}, ${lat}] is not in Vietnam — check the [longitude, latitude] order`);
  }
  return out;
}

export function validateDestinations(origin: Destination, destinations: Destination[]): string[] {
  const problems: string[] = [];
  const all = [origin, ...destinations];
  const seen = new Set<string>();

  if (origin.type !== 'origin') problems.push(`${origin.id}: origin must have type "origin"`);
  if (destinations.length !== 14) problems.push(`expected 14 destinations, found ${destinations.length}`);

  for (const d of all) {
    const label = d.id || '(missing id)';
    if (!d.id) problems.push('a destination has no id');
    else if (seen.has(d.id)) problems.push(`${d.id}: duplicate id`);
    seen.add(d.id);

    if (!d.name?.vi?.trim() || !d.name?.en?.trim()) problems.push(`${label}: missing name`);
    if (!d.coordinateSource?.trim()) problems.push(`${label}: missing coordinate source`);
    if (!d.crossCheck?.source?.trim()) problems.push(`${label}: missing cross-check source`);

    const own = coordinateProblems(label, d.coordinates);
    const check = coordinateProblems(`${label} cross-check`, d.crossCheck?.coordinates);
    problems.push(...own, ...check);

    if (own.length === 0 && check.length === 0) {
      const km = haversineKm(d.coordinates, d.crossCheck.coordinates);
      if (km > MAX_SOURCE_DISAGREEMENT_KM) {
        problems.push(`${label}: sources disagree by ${km.toFixed(1)} km`);
      }
    }
    if (d !== origin && d.type !== 'destination') problems.push(`${label}: type must be "destination"`);
  }

  return problems;
}
