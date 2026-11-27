/**
 * HTH Heritage Atlas — the origin and the fourteen service destinations.
 *
 * Every coordinate here is WGS84 (EPSG:4326), written [longitude, latitude],
 * the GeoJSON order. Each point carries the source it was taken from and an
 * independent second source it was checked against; `lib/atlas/validate.ts`
 * refuses to build if a point is missing, out of range, unsourced, or if the
 * two sources disagree by more than a few kilometres.
 *
 * Several names on HTH's list are provinces, not towns. Since the July 2025
 * provincial mergers, An Giang's administrative centre is Rạch Giá and Đồng
 * Tháp's is Mỹ Tho, both of which are destinations in their own right. Using
 * those centres would stack two pins on one spot, so each province is
 * represented by a named, documented place instead (see `represents`). None
 * of these points is a provincial centroid.
 *
 * Sources
 *   GeoNames  — GeoNames gazetteer (CC BY 4.0), via the all-the-cities 3.1.0
 *               extract; cited by GeoNames feature id.
 *   NE        — Natural Earth 10m populated places, v5.x (public domain).
 *   Wikipedia — the coordinates in the English Wikipedia article infobox,
 *               retrieved 23 Nov 2026.
 *   NGA GNS   — US NGA GEOnet Names Server.
 *   OSM       — OpenStreetMap (ODbL), place node as shown on satellites.pro.
 */

export type DestinationKind = 'city' | 'ward' | 'commune' | 'coastal-area';

export interface CoordinateSource {
  /** Short citation, specific enough to look the point up again. */
  source: string;
  coordinates: [number, number];
}

export interface Destination {
  id: string;
  /** Name as HTH lists it. */
  name: { vi: string; en: string };
  coordinates: [number, number];
  type: 'origin' | 'destination';
  region: { vi: string; en: string };
  kind: DestinationKind;
  /** Where the coordinates come from. */
  coordinateSource: string;
  /** Independent check. */
  crossCheck: CoordinateSource;
  /** Set when the listed name is a province and a specific place stands in for it. */
  represents?: { vi: string; en: string };
  /** Slug of an existing route page, Vietnamese and English. */
  routeSlug?: { vi: string; en: string };
}

const SE = { vi: 'Đông Nam Bộ', en: 'Southeast' };
const MEKONG = { vi: 'Đồng bằng sông Cửu Long', en: 'Mekong Delta' };
const HIGHLANDS = { vi: 'Tây Nguyên', en: 'Central Highlands' };
const SOUTH_CENTRAL = { vi: 'Duyên hải Nam Trung Bộ', en: 'South Central Coast' };

export const origin: Destination = {
  id: 'ho-chi-minh-city',
  name: { vi: 'TP. Hồ Chí Minh', en: 'Ho Chi Minh City' },
  coordinates: [106.70194, 10.77556],
  type: 'origin',
  region: SE,
  kind: 'city',
  coordinateSource: 'Wikipedia, “Ho Chi Minh City” (city centre, 10°46′32″N 106°42′07″E)',
  crossCheck: { source: 'NGA GEOnet Names Server, “Ho Chi Minh” (10:46:36N 106:42:03E)', coordinates: [106.70085, 10.776577] },
};

export const destinations: Destination[] = [
  {
    id: 'da-lat',
    name: { vi: 'Đà Lạt', en: 'Da Lat' },
    coordinates: [108.44193, 11.94646],
    type: 'destination',
    region: HIGHLANDS,
    kind: 'city',
    coordinateSource: 'GeoNames 1584071, “Đà Lạt”',
    crossCheck: { source: 'NE populated places, “Da Lat”', coordinates: [108.41999, 11.93042] },
    routeSlug: { vi: 'sai-gon-di-da-lat', en: 'saigon-to-da-lat' },
  },
  {
    id: 'phan-thiet',
    name: { vi: 'Phan Thiết', en: 'Phan Thiet' },
    coordinates: [108.10208, 10.92889],
    type: 'destination',
    region: SOUTH_CENTRAL,
    kind: 'city',
    coordinateSource: 'GeoNames 1571058, “Phan Thiết”',
    crossCheck: { source: 'NE populated places, “Phan Thiet”', coordinates: [108.10006, 10.93374] },
    routeSlug: { vi: 'sai-gon-di-phan-thiet', en: 'saigon-to-phan-thiet' },
  },
  {
    id: 'nha-trang',
    name: { vi: 'Nha Trang', en: 'Nha Trang' },
    coordinates: [109.19432, 12.24507],
    type: 'destination',
    region: SOUTH_CENTRAL,
    kind: 'city',
    coordinateSource: 'GeoNames 1572151, “Nha Trang”',
    crossCheck: { source: 'NE populated places, “Nha Trang”', coordinates: [109.17002, 12.25004] },
  },
  {
    id: 'can-tho',
    name: { vi: 'Cần Thơ', en: 'Can Tho' },
    coordinates: [105.78825, 10.03711],
    type: 'destination',
    region: MEKONG,
    kind: 'city',
    coordinateSource: 'GeoNames 1586203, “Cần Thơ”',
    crossCheck: { source: 'NE populated places, “Can Tho”', coordinates: [105.77002, 10.04999] },
    routeSlug: { vi: 'sai-gon-di-can-tho', en: 'saigon-to-can-tho' },
  },
  {
    id: 'an-giang',
    name: { vi: 'An Giang', en: 'An Giang' },
    coordinates: [105.11667, 10.70039],
    type: 'destination',
    region: MEKONG,
    kind: 'ward',
    represents: { vi: 'Châu Đốc · Núi Sam', en: 'Chau Doc · Sam Mountain' },
    coordinateSource: 'NE populated places, “Châu Đốc”',
    crossCheck: { source: 'Wikipedia, “Châu Đốc” (10°42′N 105°7′E)', coordinates: [105.11667, 10.7] },
  },
  {
    id: 'dong-thap',
    name: { vi: 'Đồng Tháp', en: 'Dong Thap' },
    coordinates: [105.63294, 10.46017],
    type: 'destination',
    region: MEKONG,
    kind: 'ward',
    represents: { vi: 'Cao Lãnh', en: 'Cao Lanh' },
    coordinateSource: 'GeoNames 1586151, “Cao Lãnh”',
    crossCheck: { source: 'NE populated places, “Cao Lãnh”', coordinates: [105.636, 10.467] },
  },
  {
    id: 'ca-mau',
    name: { vi: 'Cà Mau', en: 'Ca Mau' },
    coordinates: [105.15242, 9.17682],
    type: 'destination',
    region: MEKONG,
    kind: 'city',
    coordinateSource: 'GeoNames 1586443, “Cà Mau”',
    crossCheck: { source: 'NE populated places, “Cà Mau”', coordinates: [105.15, 9.17736] },
  },
  {
    id: 'ho-tram',
    name: { vi: 'Hồ Tràm', en: 'Ho Tram' },
    coordinates: [107.43333, 10.48333],
    type: 'destination',
    region: SE,
    kind: 'coastal-area',
    coordinateSource: 'Wikipedia, “Hồ Tràm” (10°29′00″N 107°26′00″E)',
    crossCheck: {
      source: 'OpenStreetMap hamlet “Hồ Tràm”, via satellites.pro (10°28′51″N 107°25′55″E)',
      coordinates: [107.43194, 10.48083],
    },
    routeSlug: { vi: 'sai-gon-di-ho-tram', en: 'saigon-to-ho-tram' },
  },
  {
    id: 'can-gio',
    name: { vi: 'Cần Giờ', en: 'Can Gio' },
    coordinates: [106.94444, 10.42],
    type: 'destination',
    region: SE,
    kind: 'commune',
    coordinateSource: 'Wikipedia, “Cần Giờ, Ho Chi Minh City” (former Cần Thạnh, 10°25′12″N 106°56′40″E)',
    crossCheck: { source: 'GeoNames 1586288, “Cần Giờ”', coordinates: [106.95474, 10.41115] },
  },
  {
    id: 'tay-ninh',
    name: { vi: 'Tây Ninh', en: 'Tay Ninh' },
    coordinates: [106.09828, 11.31004],
    type: 'destination',
    region: SE,
    kind: 'ward',
    coordinateSource: 'GeoNames 1566559, “Tây Ninh”',
    crossCheck: { source: 'NE populated places, “Tây Ninh”', coordinates: [106.147, 11.323] },
  },
  {
    id: 'my-tho',
    name: { vi: 'Mỹ Tho', en: 'My Tho' },
    coordinates: [106.35996, 10.36004],
    type: 'destination',
    region: MEKONG,
    kind: 'ward',
    coordinateSource: 'GeoNames 1574023, “Mỹ Tho”',
    crossCheck: { source: 'NE populated places, “Mỹ Tho”', coordinates: [106.35004, 10.35041] },
  },
  {
    id: 'bao-loc',
    name: { vi: 'Bảo Lộc', en: 'Bao Loc' },
    coordinates: [107.80772, 11.54798],
    type: 'destination',
    region: HIGHLANDS,
    kind: 'ward',
    coordinateSource: 'GeoNames 1588275, “Bảo Lộc”',
    crossCheck: { source: 'findlatitudeandlongitude.com, “Bao Loc, tinh Lam Dong”', coordinates: [107.778, 11.5306] },
  },
  {
    id: 'phan-rang',
    name: { vi: 'Phan Rang', en: 'Phan Rang' },
    coordinates: [108.98858, 11.56432],
    type: 'destination',
    region: SOUTH_CENTRAL,
    kind: 'ward',
    coordinateSource: 'GeoNames 1571067, “Phan Rang-Tháp Chàm”',
    crossCheck: { source: 'NE populated places, “Phan Rang”', coordinates: [108.98331, 11.56703] },
  },
  {
    id: 'rach-gia',
    name: { vi: 'Rạch Giá', en: 'Rach Gia' },
    coordinates: [105.08091, 10.01245],
    type: 'destination',
    region: MEKONG,
    kind: 'ward',
    coordinateSource: 'GeoNames 1568510, “Rạch Giá”',
    crossCheck: { source: 'NE populated places, “Rạch Giá”', coordinates: [105.09135, 10.01539] },
  },
];

export const atlasPoints: Destination[] = [origin, ...destinations];
