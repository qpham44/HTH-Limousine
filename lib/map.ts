/**
 * Basemap configuration.
 *
 * CARTO's `basemaps.cartocdn.com` styles now require an API key and serve a
 * "KEY REQUIRED" watermark without one, so the default here is the keyless
 * OpenStreetMap raster layer. Set NEXT_PUBLIC_MAP_TILES (and _ATTRIBUTION)
 * to move to a keyed provider without touching component code.
 */

export const mapTiles =
  process.env.NEXT_PUBLIC_MAP_TILES ?? 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

export const mapAttribution =
  process.env.NEXT_PUBLIC_MAP_ATTRIBUTION ?? '&copy; OpenStreetMap contributors';

export const mapMaxZoom = 19;
