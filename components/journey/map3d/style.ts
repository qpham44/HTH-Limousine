import type {
  ExpressionSpecification,
  LayerSpecification,
  StyleSpecification,
} from 'maplibre-gl';
import type { Locale } from '@/lib/i18n';

/**
 * The basemap for the 3D journey map, built at run time from the OpenFreeMap
 * "Liberty" style (vendored in public/data/journey/basemap.json).
 *
 * Two levels, so the overview stays quiet and loads fast:
 *
 *   • zoomed out (below 8): only NASA Blue Marble imagery, HTH's own routes,
 *     destinations and a handful of place names. The OpenStreetMap vector
 *     tiles are not even requested at these zooms (source minzoom 8), and the
 *     3D terrain is off.
 *   • zoomed in, or once a place is chosen: the imagery fades into a
 *     Apple-Maps-like vector map with relief shading, 3D terrain and buildings
 *     extruded from OpenStreetMap heights.
 *
 * Every source is free for commercial use without a key. A keyed satellite
 * service can be plugged in with NEXT_PUBLIC_SATELLITE_TILES (see .env.example).
 */

export interface SatelliteConfig {
  tiles: string;
  attribution: string;
  maxzoom: number;
}

export const satellite: SatelliteConfig | null = process.env.NEXT_PUBLIC_SATELLITE_TILES
  ? {
      tiles: process.env.NEXT_PUBLIC_SATELLITE_TILES,
      attribution: process.env.NEXT_PUBLIC_SATELLITE_ATTRIBUTION || '',
      maxzoom: Number(process.env.NEXT_PUBLIC_SATELLITE_MAXZOOM) || 19,
    }
  : null;

export type BaseMode = 'map' | 'satellite';

/** Where our own line layers go: above the basemap's buildings, below its labels. */
export const OVERLAY_BEFORE = 'waterway_line_label';
/** Below this zoom the vector basemap is not loaded at all. */
export const DETAIL_ZOOM = 8;

const ATTR = {
  ofm: '<a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> © <a href="https://www.openmaptiles.org/" target="_blank" rel="noopener">OpenMapTiles</a> Data from <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
  nasa: 'Imagery: <a href="https://earthdata.nasa.gov/gibs" target="_blank" rel="noopener">NASA Blue Marble (GIBS)</a>',
  dem: 'Terrain: <a href="https://registry.opendata.aws/terrain-tiles/" target="_blank" rel="noopener">Mapzen / AWS Terrain Tiles</a>',
};

/** Label text in the page language, falling back to the local (Vietnamese) name. */
export function nameField(locale: Locale): ExpressionSpecification {
  return locale === 'en'
    ? ['coalesce', ['get', 'name:en'], ['get', 'name_en'], ['get', 'name:latin'], ['get', 'name']]
    : ['coalesce', ['get', 'name:vi'], ['get', 'name']];
}

/** Daylight palette, after Apple Maps' 3D city view: near-white blocks, bright parks, cyan water. */
const P = {
  land: '#f2f1ec',
  residential: '#efede7',
  landuse: '#eeece5',
  park: '#a6dc8b',
  wood: '#9bd47f',
  grass: '#b4e49c',
  sand: '#f4ead0',
  water: '#7fc8f1',
  waterLine: '#8dcff3',
  waterLabel: '#2f78b5',
  building: '#e9e7e2',
  motorway: '#ffd98a',
  trunk: '#ffffff',
  secondary: '#ffffff',
  minor: '#ffffff',
  path: '#f7f6f2',
  casing: '#d3cfc6',
  rail: '#c9c6bf',
  text: '#2d2d2d',
  halo: 'rgba(255, 255, 255, 0.95)',
  poi: '#d9790f',
};

// Imagery is opaque out to zoom 7.8 and gone by 9.4; the night map fades in under it.
const IMAGERY_OPACITY: ExpressionSpecification = ['interpolate', ['linear'], ['zoom'], 7.8, 1, 9.4, 0];

function patchLayer(l: LayerSpecification, locale: Locale, mode: BaseMode): LayerSpecification | null {
  const id = l.id;
  if (id === 'natural_earth' || id === 'highway-shield-us-interstate' || id === 'road_shield_us') return null;
  if (id.startsWith('road_one_way_arrow') || id === 'road_area_pattern') return null;
  // Hamlets ("Thôn 7", "Ấp 3"…) bury the map in labels; villages are enough.
  if (id === 'label_other' || id.startsWith('label_country') || id === 'label_state') return null;

  const layer = structuredClone(l) as LayerSpecification & {
    paint?: Record<string, unknown>;
    layout?: Record<string, unknown>;
    'source-layer'?: string;
  };
  const paint = (layer.paint ??= {});
  const layout = (layer.layout ??= {});
  const src = layer['source-layer'] ?? '';

  // Fewer labels until the map is close, so the destinations read first.
  const later: Record<string, number> = {
    label_village: 11.5, label_town: 9, label_city: 8, 'highway-shield-non-us': 11,
    'highway-name-major': 12.5, poi_r20: 17.5, poi_r7: 16.5, poi_r1: 15.5, airport: 10.5,
  };
  if (later[id]) layer.minzoom = Math.max(layer.minzoom ?? 0, later[id]);

  if (layer.type === 'symbol' && layout['text-field'] && JSON.stringify(layout['text-field']).includes('name')) {
    if (!id.startsWith('highway-shield')) layout['text-field'] = nameField(locale);
    if (JSON.stringify(layout['text-font'] ?? '').includes('Italic') && !id.startsWith('water')) layout['text-font'] = ['Noto Sans Regular'];
  }

  if (mode === 'satellite') {
    if (layer.type === 'fill' || layer.type === 'fill-extrusion') return null;
    if (layer.type === 'line' && id.includes('casing')) return null;
    if (layer.type === 'line' && /^(road|bridge|tunnel)_/.test(id)) paint['line-opacity'] = 0.45;
    if (layer.type === 'symbol') {
      paint['text-color'] = '#ffffff';
      paint['text-halo-color'] = 'rgba(0,0,0,0.75)';
      paint['text-halo-width'] = 1.4;
    }
    return layer;
  }

  /* ---- fills ---- */
  if (layer.type === 'background') paint['background-color'] = P.land;
  if (layer.type === 'fill') {
    delete paint['fill-pattern'];
    paint['fill-outline-color'] = 'rgba(0,0,0,0)';
    if (id === 'water') paint['fill-color'] = P.water;
    else if (id === 'park') { paint['fill-color'] = P.park; paint['fill-opacity'] = 0.9; }
    else if (id === 'landcover_wood') { paint['fill-color'] = P.wood; paint['fill-opacity'] = 0.75; }
    else if (id === 'landcover_grass' || id === 'landcover_wetland') { paint['fill-color'] = P.grass; paint['fill-opacity'] = 0.7; }
    else if (id === 'landcover_sand') paint['fill-color'] = P.sand;
    else if (id === 'landuse_residential') { paint['fill-color'] = P.residential; paint['fill-opacity'] = 0.8; }
    else if (id === 'building') { paint['fill-color'] = P.building; paint['fill-opacity'] = ['interpolate', ['linear'], ['zoom'], 13, 0, 14, 1]; }
    else if (id.startsWith('aeroway')) paint['fill-color'] = '#3a4666';
    else if (src === 'landuse' || src === 'landcover') { paint['fill-color'] = P.landuse; paint['fill-opacity'] = 0.6; }
  }
  if (id === 'building-3d') {
    layer.minzoom = 13.6;
    paint['fill-extrusion-color'] = [
      'interpolate', ['linear'], ['coalesce', ['get', 'render_height'], 0],
      0, '#eeece7', 40, '#f3f2ee', 150, '#f8f8f6',
    ];
    paint['fill-extrusion-height'] = ['interpolate', ['linear'], ['zoom'], 13.6, 0, 14.6, ['coalesce', ['get', 'render_height'], 0]];
    paint['fill-extrusion-base'] = ['interpolate', ['linear'], ['zoom'], 13.6, 0, 14.6, ['coalesce', ['get', 'render_min_height'], 0]];
    paint['fill-extrusion-opacity'] = 0.96;
    paint['fill-extrusion-vertical-gradient'] = true;
  }

  /* ---- lines ---- */
  if (layer.type === 'line') {
    if (id.startsWith('waterway')) paint['line-color'] = P.waterLine;
    else if (id === 'park_outline') return null;
    else if (id.startsWith('aeroway')) paint['line-color'] = '#56627f';
    else if (id.startsWith('boundary')) {
      paint['line-color'] = 'rgba(120, 110, 140, 0.5)';
      paint['line-dasharray'] = [3, 2];
    } else if (/^(road|bridge|tunnel)_/.test(id)) {
      delete paint['line-pattern'];
      if (id.includes('casing')) paint['line-color'] = P.casing;
      else if (id.includes('rail')) paint['line-color'] = P.rail;
      else if (id.includes('motorway')) paint['line-color'] = P.motorway;
      else if (id.includes('trunk_primary')) paint['line-color'] = P.trunk;
      else if (id.includes('secondary_tertiary')) paint['line-color'] = P.secondary;
      else if (id.includes('path_pedestrian')) paint['line-color'] = P.path;
      else paint['line-color'] = P.minor;
      if (id.startsWith('tunnel')) paint['line-opacity'] = 0.5;
    }
  }

  /* ---- labels ---- */
  if (layer.type === 'symbol') {
    const poi = id.startsWith('poi') || id === 'airport';
    const water = id.startsWith('water');
    paint['text-color'] = poi ? P.poi : water ? P.waterLabel : id.startsWith('highway') ? '#5c5c5c' : P.text;
    paint['text-halo-color'] = P.halo;
    paint['text-halo-width'] = 1.3;
    paint['text-halo-blur'] = 0.3;
    if (id === 'label_town' || id === 'label_village' || id === 'label_city') layout['icon-image'] = '';
  }
  return layer;
}

/** The full style for a given language and base mode. */
export function buildStyle(
  base: StyleSpecification,
  locale: Locale,
  mode: BaseMode,
  vectorTiles?: string[],
): StyleSpecification {
  const layers: LayerSpecification[] = [];
  const firstRoad = base.layers.findIndex((l) => l.id.startsWith('tunnel_'));

  base.layers.forEach((l, i) => {
    if (i === firstRoad) {
      if (mode === 'satellite' && satellite) {
        layers.push({ id: 'satellite', type: 'raster', source: 'satellite', paint: { 'raster-fade-duration': 200 } });
      } else {
        layers.push({
          id: 'bluemarble',
          type: 'raster',
          source: 'bluemarble',
          maxzoom: 9.6,
          paint: {
            'raster-opacity': IMAGERY_OPACITY,
            'raster-saturation': 0.18,
            'raster-contrast': 0.1,
            'raster-brightness-min': 0.06,
            'raster-fade-duration': 250,
          },
        });
      }
      layers.push({
        id: 'hillshade',
        type: 'hillshade',
        source: 'terrain',
        minzoom: DETAIL_ZOOM,
        paint: {
          'hillshade-exaggeration': ['interpolate', ['linear'], ['zoom'], 8, 0.5, 12, 0.4, 15, 0.25],
          'hillshade-shadow-color': 'rgba(70, 60, 45, 0.38)',
          'hillshade-highlight-color': 'rgba(255, 255, 255, 0.3)',
          'hillshade-accent-color': 'rgba(70, 60, 45, 0.2)',
          'hillshade-illumination-direction': 315,
        },
      });
    }
    const patched = patchLayer(l, locale, mode);
    if (patched) layers.push(patched);
  });

  const sources: StyleSpecification['sources'] = {
    // With the tile list known, the source is limited to the detail zooms so the
    // overview never downloads street data. Otherwise fall back to the TileJSON.
    openmaptiles: vectorTiles
      ? { type: 'vector', tiles: vectorTiles, minzoom: DETAIL_ZOOM, maxzoom: 14, attribution: ATTR.ofm }
      : { type: 'vector', url: 'https://tiles.openfreemap.org/planet', attribution: ATTR.ofm },
    bluemarble: {
      type: 'raster',
      tiles: ['https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_ShadedRelief_Bathymetry/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg'],
      tileSize: 256,
      maxzoom: 8,
      attribution: ATTR.nasa,
    },
    // One DEM source drives both the 3D mesh and the relief shading.
    terrain: {
      type: 'raster-dem',
      tiles: ['https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'],
      encoding: 'terrarium',
      tileSize: 256,
      maxzoom: 12,
      attribution: ATTR.dem,
    },
  };
  if (satellite) {
    sources.satellite = { type: 'raster', tiles: [satellite.tiles], tileSize: 256, maxzoom: satellite.maxzoom, attribution: satellite.attribution };
  }

  return {
    version: 8,
    name: 'HTH journey map',
    glyphs: base.glyphs,
    sprite: base.sprite,
    sources,
    layers,
    light: { anchor: 'viewport', color: '#ffffff', intensity: 0.42, position: [1.3, 200, 42] },
    sky: {
      'sky-color': '#8cc7f2',
      'horizon-color': '#e9f4fb',
      'fog-color': '#eef3f6',
      'sky-horizon-blend': 0.6,
      'horizon-fog-blend': 0.75,
      'fog-ground-blend': 0.6,
    },
  };
}
