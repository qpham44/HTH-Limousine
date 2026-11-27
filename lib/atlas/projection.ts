/**
 * Projection for the HTH Heritage Atlas.
 *
 * Spherical Mercator, fitted to a fixed geographic window. Mercator is
 * conformal, so shapes and bearings are true, and across the 8–13°N band the
 * plate covers the scale changes by under 2% from bottom to top: Vietnam's
 * proportions are not bent to fit the layout. The window is fixed in degrees
 * and the plate's aspect ratio is derived from it, never the other way round.
 *
 * This file has no imports so the geometry build script (plain Node) and the
 * React component share the exact same arithmetic.
 */

export interface Plate {
  /** [west, south, east, north] in degrees, WGS84. */
  bounds: [number, number, number, number];
  /** Width of the plate in SVG user units. Height follows from the bounds. */
  width: number;
}

const RAD = Math.PI / 180;

function mercY(lat: number): number {
  return Math.log(Math.tan(Math.PI / 4 + (lat * RAD) / 2));
}

export function plateHeight(plate: Plate): number {
  const [w, s, e, n] = plate.bounds;
  const k = plate.width / ((e - w) * RAD);
  return Math.round((mercY(n) - mercY(s)) * k * 10) / 10;
}

/** [longitude, latitude] → [x, y] in plate units, y down. */
export function project(plate: Plate, [lon, lat]: [number, number]): [number, number] {
  const [w, , e, n] = plate.bounds;
  const k = plate.width / ((e - w) * RAD);
  return [(lon - w) * RAD * k, (mercY(n) - mercY(lat)) * k];
}

/** Kilometres represented by one plate unit at a given latitude. */
export function kmPerUnit(plate: Plate, lat: number): number {
  const [w, , e] = plate.bounds;
  const k = plate.width / ((e - w) * RAD);
  // Mean Earth radius 6371.0088 km (IUGG).
  return (6371.0088 * Math.cos(lat * RAD)) / k;
}

/** The main plate: southern and south-central Vietnam. */
export const mainPlate: Plate = { bounds: [103.55, 8.3, 110.0, 13.0], width: 1200 };

/**
 * The locator: all of Vietnam, including the Hoàng Sa and Trường Sa
 * archipelagos, drawn small in the open sea of the main plate.
 */
export const locatorPlate: Plate = { bounds: [101.8, 7.9, 117.4, 23.6], width: 220 };
