import type { Map as MBMap } from 'mapbox-gl';

/**
 * HTH luxury theme on Mapbox's dark-v11 style: charcoal land, ink-blue
 * water, metallic-grey 3D buildings, champagne expressways and national
 * roads, no shop and restaurant POIs, real terrain (mapbox-dem) and a warm
 * directional light that casts shadows.
 *
 * The token is a public (pk.) token read from NEXT_PUBLIC_MAPBOX_TOKEN.
 * Restrict it to the site's domains in the Mapbox account.
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

const C = {
  land: '#0B0C0E',
  landSoft: '#0F1114',
  water: '#07111A',
  building: '#1A1D24',
  road: '#C8A97E',
};

/** Where our own layers go: under the basemap's road and place names. */
export const MB_BEFORE = 'road-label';

export function applyLuxuryTheme(map: MBMap, detailZoom = 8) {
  const layers = map.getStyle()?.layers ?? [];
  let firstLabel: string | undefined;
  for (const layer of layers) {
    const { id, type } = layer;
    try {
      if (type === 'symbol' && !firstLabel && (layer.layout as Record<string, unknown> | undefined)?.['text-field']) firstLabel = id;
      if (type === 'background') {
        map.setPaintProperty(id, 'background-color', C.land);
      } else if (type === 'symbol' && /poi|transit|airport|natural-point|natural-line/.test(id)) {
        // Shops, restaurants, bus stops: noise at this scale.
        map.setLayoutProperty(id, 'visibility', 'none');
      } else if (type === 'symbol' && /^settlement/.test(id)) {
        // Our own place names carry the overview; the basemap's take over up close.
        map.setLayerZoomRange(id, detailZoom, 24);
      } else if (/water/.test(id) && type === 'fill') {
        map.setPaintProperty(id, 'fill-color', C.water);
      } else if (/water/.test(id) && type === 'line') {
        map.setPaintProperty(id, 'line-color', C.water);
      } else if (/^(land|landuse|landcover|national-park|land-structure|pitch|golf|hillshade)/.test(id) && type === 'fill') {
        map.setPaintProperty(id, 'fill-color', C.landSoft);
      } else if (/^(road|bridge|tunnel)-(motorway|trunk)/.test(id) && type === 'line' && !/case|shield/.test(id)) {
        map.setPaintProperty(id, 'line-color', C.road);
      } else if (/^(road|bridge|tunnel)-primary/.test(id) && type === 'line' && !/case/.test(id)) {
        map.setPaintProperty(id, 'line-color', 'rgba(200, 169, 126, 0.7)');
      } else if (/^building/.test(id) && type === 'fill') {
        map.setPaintProperty(id, 'fill-color', C.building);
      }
    } catch {
      /* a layer this style version does not have: skip it */
    }
  }

  if (!map.getLayer('jm-3d-buildings') && map.getSource('composite')) {
    map.addLayer(
      {
        id: 'jm-3d-buildings',
        type: 'fill-extrusion',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', ['get', 'extrude'], 'true'],
        minzoom: 13,
        paint: {
          'fill-extrusion-color': C.building,
          'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 13, 0, 14.2, ['get', 'height']],
          'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 13, 0, 14.2, ['get', 'min_height']],
          'fill-extrusion-opacity': 0.94,
          'fill-extrusion-vertical-gradient': true,
          'fill-extrusion-ambient-occlusion-intensity': 0.45,
        },
      },
      firstLabel,
    );
  }

  if (!map.getSource('mapbox-dem')) {
    map.addSource('mapbox-dem', { type: 'raster-dem', url: 'mapbox://mapbox.mapbox-terrain-dem-v1', tileSize: 512, maxzoom: 14 });
  }

  try {
    map.setLights([
      { id: 'ambient', type: 'ambient', properties: { color: '#c3c8d2', intensity: 0.42 } },
      {
        id: 'sun',
        type: 'directional',
        properties: { color: '#E2C290', intensity: 0.62, direction: [210, 38], 'cast-shadows': true, 'shadow-intensity': 0.75 },
      },
    ]);
  } catch {
    /* lights need a WebGL2 context; the map still works without them */
  }
  try {
    map.setFog({ color: '#0B0C0E', 'high-color': '#141820', 'horizon-blend': 0.06, 'space-color': '#050506', 'star-intensity': 0 });
  } catch {
    /* no fog support: fine */
  }
}

/** Camera for a chosen place: low and tilted, so buildings and bridges read in 3D. */
export const DEST_VIEW = { zoom: 15.5, pitch: 65, bearing: -25, speed: 0.9, curve: 1.4 };

/**
 * Mapbox Standard, configured: dusk light (champagne sky, buildings and trees
 * still legible), no shop or restaurant labels, and the terrain source used
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
  set('lightPreset', 'dusk');
  set('showPointOfInterestLabels', false);
  set('showTransitLabels', false);
  set('show3dObjects', true);
  if (!map.getSource('mapbox-dem')) {
    map.addSource('mapbox-dem', { type: 'raster-dem', url: 'mapbox://mapbox.mapbox-terrain-dem-v1', tileSize: 512, maxzoom: 14 });
  }
}
