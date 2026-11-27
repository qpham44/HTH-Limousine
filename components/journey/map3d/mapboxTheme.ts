import type { Map as MBMap } from 'mapbox-gl';

/**
 * Mapbox settings for the destination map: the Standard style (real 3D
 * buildings, landmarks and trees), the daylight preset, no shop or
 * restaurant labels, and Mapbox Terrain for relief.
 *
 * The token is a public (pk.) token read from NEXT_PUBLIC_MAPBOX_TOKEN
 * (NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN also accepted). Restrict it to the
 * site's domains in the Mapbox account.
 */

export const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN || '';
/** Mapbox Standard: real 3D buildings, landmarks and trees, lit by a light preset. */
export const MAPBOX_STYLE = 'mapbox://styles/mapbox/standard';

export const INITIAL_VIEW = {
  center: [106.7009, 10.7769] as [number, number],
  zoom: 7.4,
  pitch: 60,
  bearing: -20,
};

/** Where our own layers go: under the basemap's road and place names. */
export const MB_BEFORE = 'road-label';

/** Camera for a chosen place: low and tilted, so buildings and bridges read in 3D (zoom >= 15, pitch >= 60). */
export const DEST_VIEW = { zoom: 15.5, pitch: 65, bearing: -25, speed: 0.9, curve: 1.4 };

/**
 * Mapbox Standard, configured: daylight (bright, clear buildings, trees and
 * water), no shop or restaurant labels, and the terrain source used
 * for 3D relief at Da Lat, Bao Loc and Vung Tau.
 */
export function applyStandardTheme(map: MBMap) {
  const set = (key: string, value: unknown) => {
    try {
      map.setConfigProperty('basemap', key, value as never);
    } catch {
      /* an option this style version does not have */
    }
  };
  set('lightPreset', 'day');
  set('showPointOfInterestLabels', false);
  set('showTransitLabels', false);
  set('show3dObjects', true);
  if (!map.getSource('mapbox-dem')) {
    map.addSource('mapbox-dem', { type: 'raster-dem', url: 'mapbox://mapbox.mapbox-terrain-dem-v1', tileSize: 512, maxzoom: 14 });
  }
}
