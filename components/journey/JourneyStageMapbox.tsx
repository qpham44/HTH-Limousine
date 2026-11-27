'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { preconnect } from 'react-dom';
import Image from 'next/image';
import Link from 'next/link';
import type {
  ExpressionSpecification,
  GeoJSONSource,
  LayerSpecification,
  Map as MLMap,
  MapGeoJSONFeature,
  PaddingOptions,
  StyleSpecification,
} from 'maplibre-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { regions, originInfo, type JourneyRegion } from '@/data/journeys';
import { goodForLabel } from '@/data/journeyExtras';
import { fleetByKey } from '@/data/fleet';
import landmarksData from '@/data/journey/landmarks.json';
import photosData from '@/data/journey/photos.json';
import { formatDuration, formatVnd } from '@/lib/quote';
import { paths, type Locale } from '@/lib/i18n';
import { site } from '@/lib/site';
import { track } from '@/lib/analytics';
import {
  REGION_COLOR,
  clock,
  daysLabel,
  driveFeel,
  figures,
  groupPresets,
  itinerary,
  pointById,
  points,
  priceFor,
  tripStyle,
  vehiclesFor,
  type LandmarkKind,
  type MapPoint,
  type StepKind,
} from './model';
import { DETAIL_ZOOM, buildStyle, type BaseMode, type SatelliteConfig } from './map3d/style';
import {
  ACTIVE_ROUTE_PAINT, DEST_VIEW, INITIAL_VIEW, LIGHT_PRESETS, MAPBOX_STYLE, MAPBOX_TOKEN, MB_BEFORE,
  applyStandardTheme, setLightPreset, type LightPreset,
} from './map3d/mapboxTheme';
import { glyphDisc, limoMark, loadImage, originPin, peakMark, photoBubble, type Drawn } from './map3d/images';
import { along, bearing as bearingOf, bounds, easeInOutCubic, headingAt, measure, slice, turn, type LngLat, type Measured } from './map3d/geo';
import styles from './JourneyMap.module.css';

type Region = JourneyRegion | 'all';
type Tab = 'see' | 'plan' | 'car';

interface Sight {
  id: string;
  destination: string;
  kind: LandmarkKind;
  vi: string;
  en: string;
  lon: number;
  lat: number;
}
interface PeakGeo { id: string; vi: string; en: string; height: number; lon: number; lat: number }
interface GeoData {
  drives: GeoJSON.FeatureCollection<GeoJSON.LineString, { id: string; km: number }>;
  peaks: PeakGeo[];
}
interface Photo { src: string; author: string; license: string; page: string; wide?: string }

const sights = landmarksData.landmarks as unknown as Sight[];
const sightById = Object.fromEntries(sights.map((s) => [s.id, s])) as Record<string, Sight>;
const photos = (photosData as unknown as { photos: Record<string, Photo> }).photos;

const ORIGIN = originInfo.coordinates as LngLat;

/* The MapLibre version keeps active / region / focus in style global state.
   Mapbox has no global-state expression, so the same layer definitions are
   bound to the current values here and re-applied whenever they change. */
type JState = { active: string; region: string; focus: string };
const satellite: SatelliteConfig | null = null;

function bindState<T>(x: T, st: JState): T {
  if (Array.isArray(x)) {
    // Wrapped in 'literal' so ['==', value, ...] is never read as a legacy filter.
    if (x[0] === 'global-state' && typeof x[1] === 'string') return ['literal', (st as Record<string, string>)[x[1]]] as unknown as T;
    return x.map((v) => bindState(v, st)) as unknown as T;
  }
  if (x && typeof x === 'object') {
    return Object.fromEntries(Object.entries(x as Record<string, unknown>).map(([k, v]) => [k, bindState(v, st)])) as T;
  }
  return x;
}
const usesState = (v: unknown) => JSON.stringify(v ?? null).includes('global-state');

/** Mapbox Standard lights every layer; our own lines, dots and labels glow at full strength instead. */
function withEmissive<T extends { type: string; paint?: Record<string, unknown> }>(layer: T): T {
  const keys: Record<string, string[]> = {
    line: ['line-emissive-strength'],
    circle: ['circle-emissive-strength'],
    fill: ['fill-emissive-strength'],
    symbol: ['icon-emissive-strength', 'text-emissive-strength'],
  };
  const add = keys[layer.type];
  if (!add) return layer;
  return { ...layer, paint: { ...(layer.paint ?? {}), ...Object.fromEntries(add.map((k) => [k, 1])) } };
}
const WORKER = '/vendor/maplibre-gl-worker.mjs?v=6.19.0';
const TOUR_MS = 12000;
/** 3D terrain switches on from this zoom, or as soon as a place is chosen. */
const TERRAIN_ZOOM = 8.6;
const EXAGGERATION = 1.4;

/** Names shown on the quiet overview, before the street map loads. */
const PLACES: { vi: string; en: string; at: LngLat; kind: 'country' | 'sea' | 'city' }[] = [
  { vi: 'CAMPUCHIA', en: 'CAMBODIA', at: [104.75, 12.55], kind: 'country' },
  { vi: 'VIỆT NAM', en: 'VIETNAM', at: [107.9, 13.35], kind: 'country' },
  { vi: 'Biển Đông', en: 'East Sea', at: [108.6, 9.4], kind: 'sea' },
  { vi: 'Vịnh Thái Lan', en: 'Gulf of Thailand', at: [103.75, 9.25], kind: 'sea' },
  { vi: 'Phnôm Pênh', en: 'Phnom Penh', at: [104.9282, 11.5564], kind: 'city' },
  { vi: 'Buôn Ma Thuột', en: 'Buon Ma Thuot', at: [108.0378, 12.6667], kind: 'city' },
  { vi: 'Phú Quốc', en: 'Phu Quoc', at: [103.9667, 10.2167], kind: 'city' },
  { vi: 'Côn Đảo', en: 'Con Dao', at: [106.6067, 8.6833], kind: 'city' },
  { vi: 'Long Xuyên', en: 'Long Xuyen', at: [105.4352, 10.3864], kind: 'city' },
  { vi: 'Sóc Trăng', en: 'Soc Trang', at: [105.9739, 9.6025], kind: 'city' },
  { vi: 'Hà Tiên', en: 'Ha Tien', at: [104.4875, 10.3831], kind: 'city' },
];

// Warm the connections to the tile hosts while the page is still being read.
const TILE_HOSTS = [
  'https://tiles.openfreemap.org',
  'https://gibs.earthdata.nasa.gov',
  'https://s3.amazonaws.com',
];
const PANEL_W = 440;

const C = {
  vi: {
    mapLabel: 'Bản đồ 3D các điểm đến của HTH ở miền Nam, tâm là TP. Hồ Chí Minh',
    filter: 'Lọc theo vùng',
    index: 'Danh sách điểm đến',
    layers: 'Lớp bản đồ',
    layerTerrain: 'Địa hình 3D',
    layerRoads: 'Tuyến đường',
    layerSights: 'Điểm tham quan',
    tour: 'Dạo một vòng',
    resetHcm: 'Về TP.HCM',
    viewRoute: 'Toàn cảnh lộ trình',
    viewDest: 'Góc nhìn 3D điểm đến',
    light: 'Ánh sáng bản đồ',
    lightDay: 'Ban ngày',
    lightDusk: 'Hoàng hôn',
    lightNight: 'Buổi tối',
    idealStyle: 'Kiểu chuyến lý tưởng',
    tourStop: 'Dừng',
    surprise: 'Gợi ý ngẫu nhiên',
    start: 'Điểm xuất phát',
    originTitle: 'Khởi hành từ Sài Gòn — Hành trình trọn vẹn theo nhịp riêng của bạn',
    originBody:
      'Xe đón tận nơi tại tư gia, khách sạn hoặc sân bay Tân Sơn Nhất. Mọi cung đường và điểm dừng chân đều được linh hoạt điều chỉnh theo nhu cầu thực tế của Quý khách suốt chuyến đi.',
    legend: 'Chú giải bản đồ',
    legendRegions: 'Màu theo vùng (chạm để lọc)',
    legendOrigin: 'Điểm xuất phát',
    legendRoute: 'Cung đường thực tế',
    legendPeak: 'Đỉnh núi',
    legendSight: 'Điểm tham quan, sân bay',
    hint: 'Chạm vào một điểm trên bản đồ. Kéo để di chuyển, giữ Ctrl và cuộn để phóng to, kéo chuột phải để xoay và nghiêng.',
    distance: 'Quãng đường',
    time: 'Thời gian',
    days: 'Nên đi',
    measured: 'HTH đã chạy',
    estimate: 'ước tính',
    tabSee: 'Đáng ghé',
    tabPlan: 'Lịch trình',
    tabCar: 'Chọn xe',
    goodFor: 'Hợp với',
    eat: 'Nên ăn',
    when: 'Nên biết',
    onTheWay: 'Ghé trên đường',
    showOnMap: 'Xem trên bản đồ',
    day: (n: number) => `Ngày ${n}`,
    planNote: 'Lịch gợi ý, giờ giấc đổi theo ý Quý khách. Tài xế đi cùng suốt chuyến.',
    howMany: 'Đi mấy người?',
    people: 'khách',
    fewer: 'Bớt một người',
    more: 'Thêm một người',
    oneWay: 'Một chiều',
    roundTrip: 'Khứ hồi',
    recommended: 'Đề xuất',
    alt: 'Hoặc',
    perPerson: 'mỗi người',
    multiDay: 'Chuyến nhiều ngày có thể giữ xe và tài xế theo lịch trình; điều phối viên báo giá trọn gói.',
    tooMany: 'Đoàn trên 90 khách: điều phối viên sắp xếp nhiều xe và báo giá riêng.',
    book: (name: string) => `Đặt xe đi ${name}`,
    route: 'Hướng dẫn tuyến →',
    prev: 'Điểm trước',
    next: 'Điểm sau',
    close: 'Về toàn cảnh',
    zoomIn: 'Phóng to',
    zoomOut: 'Thu nhỏ',
    reset: 'Toàn cảnh',
    details: 'Chi tiết',
    from: 'từ',
    fly: 'Bay theo cung đường',
    flyStop: 'Dừng bay',
    flyHint: (km: number) => `Theo xe đi ${km} km từ Quận 1`,
    north: 'Quay về hướng Bắc',
    view2d: 'Chuyển sang 2D',
    view3d: 'Chuyển sang 3D',
    modeMap: 'Bản đồ',
    modeSat: 'Vệ tinh',
    photo: 'Ảnh',
    loading: 'Đang tải bản đồ 3D…',
    noGl: 'Trình duyệt này không hiển thị được bản đồ 3D. Danh sách điểm đến và bảng giá bên dưới vẫn dùng bình thường.',
    gestureWin: 'Giữ Ctrl và cuộn để phóng to bản đồ',
    gestureMac: 'Giữ ⌘ và cuộn để phóng to bản đồ',
    gestureMobile: 'Dùng hai ngón tay để di chuyển bản đồ',
  },
  en: {
    mapLabel: '3D map of HTH destinations in southern Vietnam, centred on Ho Chi Minh City',
    filter: 'Filter by region',
    index: 'List of destinations',
    layers: 'Map layers',
    layerTerrain: '3D terrain',
    layerRoads: 'Routes',
    layerSights: 'Sights',
    tour: 'Take the tour',
    resetHcm: 'Back to HCMC',
    viewRoute: 'Whole route',
    viewDest: '3D close-up',
    light: 'Map light',
    lightDay: 'Day',
    lightDusk: 'Dusk',
    lightNight: 'Night',
    idealStyle: 'Ideal trip style',
    tourStop: 'Stop',
    surprise: 'Surprise me',
    start: 'Starting point',
    originTitle: 'Leaving from Saigon, at your own pace',
    originBody:
      'Collected from your home, hotel or Tan Son Nhat airport. Every road and every stop can change with what you actually want on the day.',
    legend: 'Map key',
    legendRegions: 'Colour by region (tap to filter)',
    legendOrigin: 'Starting point',
    legendRoute: 'The actual road',
    legendPeak: 'Summit',
    legendSight: 'Sights and airports',
    hint: 'Tap a place on the map. Drag to move, hold Ctrl and scroll to zoom, right-drag to rotate and tilt.',
    distance: 'Distance',
    time: 'Drive time',
    days: 'Stay',
    measured: 'timed by HTH',
    estimate: 'estimate',
    tabSee: 'Worth seeing',
    tabPlan: 'Plan',
    tabCar: 'Choose a car',
    goodFor: 'Good for',
    eat: 'Eat',
    when: 'Good to know',
    onTheWay: 'On the way',
    showOnMap: 'Show on map',
    day: (n: number) => `Day ${n}`,
    planNote: 'A suggested plan; the timing is yours to change. The chauffeur stays with you throughout.',
    howMany: 'How many travelling?',
    people: 'people',
    fewer: 'One fewer',
    more: 'One more',
    oneWay: 'One way',
    roundTrip: 'Return',
    recommended: 'Recommended',
    alt: 'Or',
    perPerson: 'per person',
    multiDay: 'On multi-day trips the car and chauffeur can stay with you; the coordinator quotes it as one package.',
    tooMany: 'Over 90 people: the coordinator arranges several vehicles and quotes separately.',
    book: (name: string) => `Book a car to ${name}`,
    route: 'Route guide →',
    prev: 'Previous place',
    next: 'Next place',
    close: 'Back to overview',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    reset: 'Overview',
    details: 'Details',
    from: 'from',
    fly: 'Fly the route',
    flyStop: 'Stop flying',
    flyHint: (km: number) => `Follow the car for ${km} km from District 1`,
    north: 'Reset to north',
    view2d: 'Switch to 2D',
    view3d: 'Switch to 3D',
    modeMap: 'Map',
    modeSat: 'Satellite',
    photo: 'Photo',
    loading: 'Loading the 3D map…',
    noGl: 'This browser cannot show the 3D map. The destination list and prices below still work.',
    gestureWin: 'Hold Ctrl and scroll to zoom the map',
    gestureMac: 'Hold ⌘ and scroll to zoom the map',
    gestureMobile: 'Use two fingers to move the map',
  },
} as const;

/** 12-unit glyphs centred on 0,0, drawn as strokes. */
const ICON: Record<LandmarkKind, string> = {
  beach: 'M-4.5 1.5q1.1-1.8 2.25 0t2.25 0 2.25 0 2.25 0M-4.5-1.5q1.1-1.8 2.25 0t2.25 0 2.25 0 2.25 0',
  temple: 'M-4.5-.5L0-4.5L4.5-.5M-3-.5V4M3-.5V4M-4.5 4H4.5',
  monument: 'M-1.4 4L0-4.5L1.4 4M-3 4H3',
  nature: 'M0-4.5L3.8 2.2H-3.8ZM0 2.2V4.6',
  market: 'M-4.2-.8H4.2L3 4H-3ZM-2.2-.8L-.8-3.8M2.2-.8L.8-3.8',
  airport: 'M0-4.5V4.5M-4.5 .8L0-.8L4.5 .8M-2 4H2',
  park: 'M0-4.5L1.3-1.3L4.5-1L2 1.2L2.8 4.4L0 2.7L-2.8 4.4L-2 1.2L-4.5-1L-1.3-1.3Z',
  golf: 'M-1.8 4.6V-4.6L3.8-2.2L-1.8 0',
  industry: 'M-4.5 4.5V-.5L-1.8 1.2V-.5L1 1.2V-3.8H3.6V4.5Z',
  farm: 'M-3.8 3.8C-3.8-1.8 0-4.5 3.8-4.5C3.8 1 .2 3.8-3.8 3.8ZM-3.8 3.8L1-1',
  craft: 'M0-4.5L3.6 0L0 4.5L-3.6 0Z',
  ferry: 'M-4.5 1H4.5L2.8 4H-2.8ZM0 1V-4.5L3-.8H0',
  food: 'M-4.5 0H4.5A4.5 4.5 0 0 1-4.5 0ZM-1.5-1.8V-4M1.5-1.8V-4.5',
};
/** Apple-Maps-like category colours for sights. */
const KIND_COLOR: Record<LandmarkKind, string> = {
  beach: '#1fa3d6', temple: '#c8742b', monument: '#8a6d4c', nature: '#3d9b4f', market: '#e0892b',
  airport: '#5a6ad8', park: '#2fa36b', golf: '#3e8f3a', industry: '#7a7d86', farm: '#5b9a2f',
  craft: '#b05aa6', ferry: '#2b7fd0', food: '#e56a3a',
};

const STEP_ICON: Record<StepKind, string> = {
  pickup: 'M-4 2V-1L-2.6-3.6H2.6L4-1V2ZM-2.6 2V3.4M2.6 2V3.4',
  break: 'M-3.5-2H2.5V1.5A2.2 2.2 0 0 1 .3 3.7H-1.3A2.2 2.2 0 0 1-3.5 1.5ZM2.5-1H3.8V1H2.5',
  arrive: 'M0-4.2A3 3 0 0 1 3-1.2C3 1.4 0 4.2 0 4.2S-3 1.4-3-1.2A3 3 0 0 1 0-4.2Z',
  see: 'M-4 0Q0-4 4 0Q0 4-4 0ZM0-1.2A1.2 1.2 0 1 1 0 1.2A1.2 1.2 0 1 1 0-1.2',
  eat: 'M-3-4V4M-4.4-4V-1.2A1.4 1.4 0 0 0-1.6-1.2V-4M2.6-4C1.2-4 1.2 0 2.6 0V4',
  rest: 'M2.6-3.6A4 4 0 1 0 3.8 1.6A3.2 3.2 0 1 1 2.6-3.6Z',
  depart: 'M-4 0H3.6M1-2.6L3.6 0L1 2.6',
  home: 'M-4 0L0-3.8L4 0M-2.8-1V3.8H2.8V-1',
};

/** Sun, sun on the horizon, crescent moon: 14x14, drawn in currentColor. */
const LIGHT_ICON: Record<LightPreset, ReactNode> = {
  day: (
    <>
      <circle cx="7" cy="7" r="2.6" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7 1v1.6M7 11.4V13M1 7h1.6M11.4 7H13M2.8 2.8l1.1 1.1M10.1 10.1l1.1 1.1M2.8 11.2l1.1-1.1M10.1 3.9l1.1-1.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </>
  ),
  dusk: (
    <>
      <path d="M3.6 9.5a3.4 3.4 0 0 1 6.8 0" stroke="currentColor" strokeWidth="1.3" />
      <path d="M1 9.5h12M3 12h8M7 2.2v1.6M2.6 4.6l1.1 1.1M11.4 4.6l-1.1 1.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </>
  ),
  night: <path d="M10.8 9.4A4.8 4.8 0 0 1 4.6 3.2a4.8 4.8 0 1 0 6.2 6.2Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />,
};

const pad2 = (n: number) => String(n).padStart(2, '0');
const coordsOf = (p: MapPoint) => p.j.coordinates as LngLat;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

const REGION_MATCH: ExpressionSpecification = [
  'match', ['get', 'region'],
  'nearby', REGION_COLOR.nearby,
  'coast', REGION_COLOR.coast,
  'highlands', REGION_COLOR.highlands,
  'mekong', REGION_COLOR.mekong,
  'business', REGION_COLOR.business,
  '#D69E4A',
];
const inRegion: ExpressionSpecification = [
  'any', ['==', ['global-state', 'region'], 'all'], ['==', ['get', 'region'], ['global-state', 'region']],
];
const noActive: ExpressionSpecification = ['==', ['global-state', 'active'], ''];
// Imagery far out, a night map close in: labels stay light on a dark halo throughout.
const labelColor = '#ffffff';
const labelHalo = 'rgba(8, 12, 22, 0.82)';

/** Our own sources and layers on top of the basemap. */
function overlayLayers(locale: Locale): LayerSpecification[] {
  const font = ['DIN Pro Bold', 'Arial Unicode MS Bold'];
  return [
    {
      id: 'jm-routes-case', type: 'line', source: 'jm-routes', layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': 'rgba(8, 12, 22, 0.8)',
        'line-width': ['interpolate', ['linear'], ['zoom'], 6, 3.8, 10, 6, 14, 8.5],
        'line-opacity': [
          'case',
          ['boolean', ['feature-state', 'hot'], false], 0.95,
          ['==', ['get', 'id'], ['global-state', 'active']], 0,
          ['!', noActive], 0.12,
          ['!', inRegion], 0.08,
          0.55,
        ],
      },
    },
    {
      id: 'jm-routes', type: 'line', source: 'jm-routes', layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': REGION_MATCH,
        'line-width': ['interpolate', ['linear'], ['zoom'], 6, ['case', ['boolean', ['feature-state', 'hot'], false], 3.4, 1.9], 10, ['case', ['boolean', ['feature-state', 'hot'], false], 5, 3.2], 14, 5],
        'line-opacity': [
          'case',
          ['boolean', ['feature-state', 'hot'], false], 1,
          ['==', ['get', 'id'], ['global-state', 'active']], 0,
          ['!', noActive], 0.22,
          ['!', inRegion], 0.12,
          0.9,
        ],
      },
    },
    {
      id: 'jm-active-glow', type: 'line', source: 'jm-active', layout: { 'line-join': 'round', 'line-cap': 'round' },
      // Daylight map: a soft gold halo, a white casing and a deep champagne line, so the drive reads on pale land.
      paint: { 'line-color': '#D4AF37', 'line-width': ['interpolate', ['linear'], ['zoom'], 6, 14, 12, 26], 'line-blur': 11, 'line-opacity': 0.3 },
    },
    {
      id: 'jm-active-case', type: 'line', source: 'jm-active', layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#FFFFFF', 'line-width': ['interpolate', ['linear'], ['zoom'], 6, 6.5, 12, 10, 15, 13], 'line-opacity': 0.92, 'line-blur': 0.5 },
    },
    {
      id: 'jm-active-line', type: 'line', source: 'jm-active', layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: { 'line-color': '#A8781C', 'line-width': ['interpolate', ['linear'], ['zoom'], 6, 3.4, 12, 5.5, 15, 7.5] },
    },
    // ---- symbols (above every basemap label) ----
    {
      id: 'jm-places', type: 'symbol', source: 'jm-places', maxzoom: DETAIL_ZOOM + 0.8,
      layout: {
        'text-field': ['get', 'name'],
        'text-font': ['match', ['get', 'kind'], 'city', ['literal', ['DIN Pro Medium', 'Arial Unicode MS Regular']], ['literal', ['DIN Pro Bold', 'Arial Unicode MS Bold']]],
        'text-size': ['match', ['get', 'kind'], 'country', 13, 'sea', 12.5, 11.5],
        'text-letter-spacing': ['match', ['get', 'kind'], 'country', 0.35, 'sea', 0.12, 0.02],
        'text-allow-overlap': false, 'symbol-sort-key': 90,
      },
      paint: {
        'text-color': ['match', ['get', 'kind'], 'sea', '#bcd6ff', 'country', 'rgba(255,255,255,0.78)', 'rgba(255,255,255,0.9)'],
        'text-halo-color': 'rgba(5, 10, 20, 0.7)', 'text-halo-width': 1.2,
        'text-opacity': ['interpolate', ['linear'], ['zoom'], DETAIL_ZOOM, 1, DETAIL_ZOOM + 0.8, 0],
      },
    },
    {
      id: 'jm-peaks', type: 'symbol', source: 'jm-peaks', minzoom: 9,
      layout: {
        'icon-image': 'jm-peak', 'icon-size': 0.9, 'icon-allow-overlap': false,
        'text-field': ['concat', ['get', 'name'], '\n', ['get', 'h']],
        'text-font': ['DIN Pro Medium', 'Arial Unicode MS Regular'], 'text-size': 11, 'text-anchor': 'top', 'text-offset': [0, 0.7], 'text-optional': true,
        'symbol-sort-key': 50,
      },
      paint: {
        'text-color': '#f3e2c7',
        'text-halo-color': labelHalo, 'text-halo-width': 1.3,
        'icon-opacity': ['case', noActive, 1, 0.75],
        'text-opacity': ['case', noActive, 1, 0.75],
      },
    },
    {
      id: 'jm-sights', type: 'symbol', source: 'jm-sights', minzoom: 11.2,
      filter: ['!=', ['get', 'dest'], ['global-state', 'active']],
      layout: {
        'icon-image': ['coalesce', ['image', ['get', 'photo']], ['image', ['get', 'glyph']]],
        'icon-size': ['interpolate', ['linear'], ['zoom'], 11.2, 0.62, 15, 0.9],
        'icon-anchor': 'bottom', 'icon-allow-overlap': false,
        'text-field': ['get', 'name'], 'text-font': font, 'text-size': 11.5, 'text-anchor': 'top', 'text-offset': [0, 0.2],
        'text-optional': true, 'text-max-width': 9, 'symbol-sort-key': 40,
      },
      paint: { 'text-color': labelColor, 'text-halo-color': labelHalo, 'text-halo-width': 1.4 },
    },
    {
      id: 'jm-dest-dots', type: 'circle', source: 'jm-dest',
      filter: ['all', inRegion, ['!=', ['get', 'id'], ['global-state', 'active']]],
      paint: {
        'circle-radius': ['interpolate', ['linear'], ['zoom'], 5, 3.4, 10, 5.5],
        'circle-color': REGION_MATCH,
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2,
        'circle-opacity': ['case', noActive, 1, 0.6],
        'circle-stroke-opacity': ['case', noActive, 1, 0.6],
        'circle-pitch-alignment': 'viewport',
      },
    },
    {
      id: 'jm-dest', type: 'symbol', source: 'jm-dest',
      filter: ['all', inRegion, ['!=', ['get', 'id'], ['global-state', 'active']]],
      layout: {
        'icon-image': ['coalesce', ['image', ['get', 'icon']], ['image', 'jm-fallback']],
        'icon-size': ['interpolate', ['linear'], ['zoom'], 5, 0.58, 7.5, 0.74, 11, 0.86],
        'icon-anchor': 'bottom', 'icon-allow-overlap': false, 'icon-padding': 1,
        'text-field': ['get', 'name'], 'text-font': font,
        'text-size': ['interpolate', ['linear'], ['zoom'], 6, 11.5, 11, 13.5],
        'text-anchor': 'top', 'text-offset': [0, 0.35], 'text-optional': true, 'text-max-width': 8,
        'symbol-sort-key': ['get', 'sort'],
      },
      paint: {
        'text-color': labelColor, 'text-halo-color': labelHalo, 'text-halo-width': 1.5,
        'icon-opacity': ['case', noActive, 1, 0.62],
        'text-opacity': ['case', noActive, 1, 0.7],
      },
    },
    {
      id: 'jm-pins', type: 'symbol', source: 'jm-pins',
      layout: {
        'icon-image': ['coalesce', ['image', ['get', 'icon']], ['image', ['get', 'glyph']]],
        'icon-size': ['case', ['==', ['get', 'id'], ['global-state', 'focus']], 1.12, ['>', ['get', 'n'], 0], 0.86, 0.66],
        'icon-anchor': 'bottom', 'icon-allow-overlap': true, 'icon-ignore-placement': false,
        'text-field': ['get', 'name'], 'text-font': font, 'text-size': ['case', ['>', ['get', 'n'], 0], 12.5, 11.5],
        'text-anchor': 'top', 'text-offset': [0, 0.25], 'text-optional': true, 'text-max-width': 9,
        'symbol-sort-key': ['-', 10, ['get', 'n']],
      },
      paint: { 'text-color': labelColor, 'text-halo-color': labelHalo, 'text-halo-width': 1.5 },
    },
    {
      id: 'jm-dest-active', type: 'symbol', source: 'jm-dest',
      filter: ['==', ['get', 'id'], ['global-state', 'active']],
      layout: {
        'icon-image': ['coalesce', ['image', ['get', 'iconActive']], ['image', 'jm-fallback']],
        'icon-size': ['interpolate', ['linear'], ['zoom'], 6, 0.85, 12, 1],
        'icon-anchor': 'bottom', 'icon-allow-overlap': true, 'text-allow-overlap': true,
        'text-field': ['get', 'name'], 'text-font': font, 'text-size': 15,
        'text-anchor': 'top', 'text-offset': [0, 0.35],
      },
      paint: { 'text-color': labelColor, 'text-halo-color': labelHalo, 'text-halo-width': 1.8 },
    },
    {
      id: 'jm-origin', type: 'symbol', source: 'jm-origin',
      layout: {
        'icon-image': 'jm-origin', 'icon-anchor': 'bottom', 'icon-allow-overlap': true, 'icon-size': 1,
        'text-field': locale === 'en' ? originInfo.name.en : originInfo.name.vi,
        'text-font': font, 'text-size': 13.5, 'text-anchor': 'top', 'text-offset': [0, 0.3], 'text-optional': true,
      },
      paint: { 'text-color': labelColor, 'text-halo-color': labelHalo, 'text-halo-width': 1.6 },
    },
    {
      id: 'jm-car', type: 'symbol', source: 'jm-car',
      layout: {
        'icon-image': 'jm-car', 'icon-allow-overlap': true, 'icon-ignore-placement': true,
        'icon-rotate': ['get', 'brg'], 'icon-rotation-alignment': 'map', 'icon-pitch-alignment': 'map',
        'icon-size': ['interpolate', ['linear'], ['zoom'], 5, 0.95, 9, 1.05, 13, 1.2, 16, 1.45],
      },
    },
  ] as LayerSpecification[];
}

const emptyFC = (): GeoJSON.FeatureCollection => ({ type: 'FeatureCollection', features: [] });

export default function JourneyStageMapbox({ locale = 'vi' }: { locale?: Locale }) {
  const c = C[locale];
  const en = locale === 'en';
  const t = useCallback((x: { vi: string; en: string }) => (en ? x.en : x.vi), [en]);
  const name = useCallback((p: MapPoint) => (en ? p.j.name.en : p.j.name.vi), [en]);
  const reduced = usePrefersReducedMotion();

  const frameRef = useRef<HTMLDivElement | null>(null);
  const mapNode = useRef<HTMLDivElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const mapRef = useRef<MLMap | null>(null);
  const geoRef = useRef<{ drives: Record<string, Measured>; peaks: PeakGeo[] } | null>(null);
  const baseRef = useRef<StyleSpecification | null>(null);
  const dataRef = useRef<Record<string, GeoJSON.GeoJSON>>({});
  const rafs = useRef({ route: 0, fly: 0, intro: 0 });

  const [size, setSize] = useState({ w: 1200, h: 760 });
  const wide = size.w >= 1000;

  const [near, setNear] = useState(false);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [onScreen, setOnScreen] = useState(false);

  const [active, setActive] = useState<string | null>(null);
  const [focusPin, setFocusPin] = useState<string | null>(null);
  const [region, setRegion] = useState<Region>('all');
  const [touring, setTouring] = useState(false);
  const [flying, setFlying] = useState(false);
  const [tab, setTab] = useState<Tab>('see');
  const [group, setGroup] = useState(4);
  const [roundTrip, setRoundTrip] = useState(true);
  const [layers, setLayers] = useState({ terrain: true, roads: true, sights: true });
  const [mode, setMode] = useState<BaseMode>('map');
  const [cam, setCam] = useState({ bearing: 0, pitch: 0, zoom: 3 });

  const activeRef = useRef<string | null>(null);
  const regionRef = useRef<Region>('all');
  const stateRef = useRef<JState>({ active: '', region: 'all', focus: '' });
  const mbRef = useRef<typeof import('mapbox-gl').default | null>(null);
  const glowRef = useRef<{ remove: () => void } | null>(null);
  const [destView, setDestView] = useState<'dest' | 'route'>('dest');
  const [light, setLight] = useState<LightPreset>('day');
  const lightRef = useRef<LightPreset>('day');
  lightRef.current = light;

  /** Low, tilted close-up on the place itself: 3D buildings show from zoom 15. */
  const flyToDestination = (p: MapPoint, duration?: number) => {
    const map = mapRef.current;
    if (!map) return;
    map.flyTo({
      center: coordsOf(p),
      zoom: DEST_VIEW.zoom,
      pitch: DEST_VIEW.pitch,
      bearing: DEST_VIEW.bearing,
      ...(reduced ? { duration: 0 } : duration ? { duration } : { speed: DEST_VIEW.speed, curve: DEST_VIEW.curve }),
      essential: true,
    } as never);
  };

  /** The whole drive from District 1 in one frame (zoom 8 at most). */
  const flyToRoute = (p: MapPoint) => {
    const map = mapRef.current;
    if (!map) return;
    const m = geoRef.current?.drives[p.j.id];
    const pts = m ? m.coords : [ORIGIN, coordsOf(p)];
    // fitBounds frames the road inside the part of the map the panel leaves free.
    map.fitBounds(bounds(pts), {
      padding: padding(),
      pitch: 45,
      bearing: INITIAL_VIEW.bearing,
      maxZoom: 8,
      duration: reduced ? 0 : 1800,
      essential: true,
    } as never);
  };
  /** Re-apply every layer property that depends on the active place, region or focused pin. */
  const syncState = () => {
    const map = mapRef.current;
    if (!map) return;
    const st = stateRef.current;
    for (const layer of overlayLayers(locale)) {
      if (!map.getLayer(layer.id)) continue;
      const l = layer as unknown as { filter?: unknown; paint?: Record<string, unknown>; layout?: Record<string, unknown> };
      if (usesState(l.filter)) map.setFilter(layer.id, bindState(l.filter, st) as never);
      for (const [k, v] of Object.entries(l.paint ?? {})) if (usesState(v)) map.setPaintProperty(layer.id, k as never, bindState(v, st) as never);
      for (const [k, v] of Object.entries(l.layout ?? {})) if (usesState(v)) map.setLayoutProperty(layer.id, k as never, bindState(v, st) as never);
    }
  };
  const touringRef = useRef(false);
  const layersRef = useRef(layers);
  activeRef.current = active;
  regionRef.current = region;
  touringRef.current = touring;
  layersRef.current = layers;

  const visible = useMemo(() => points.filter((p) => region === 'all' || p.j.region === region), [region]);
  const activePoint = active ? pointById[active] : null;

  /* ------------------------------------------------------------ geometry */

  const padding = useCallback((): PaddingOptions => {
    const node = frameRef.current;
    const w = node?.clientWidth ?? 1200;
    const h = node?.clientHeight ?? 760;
    if (w >= 1000) return { top: Math.min(150, h * 0.2), bottom: 80, left: 60, right: PANEL_W + 70 };
    return { top: 130, bottom: 50, left: 24, right: 24 };
  }, []);

  const pinLngLat = useCallback((pin: string | null): LngLat | null => {
    if (!pin) return null;
    if (pin.startsWith('peak:')) {
      const pk = geoRef.current?.peaks.find((p) => p.id === pin.slice(5));
      return pk ? [pk.lon, pk.lat] : null;
    }
    const s = sightById[pin];
    return s ? [s.lon, s.lat] : null;
  }, []);

  /** Camera that frames a destination with its sights, looking out along the drive. */
  const destCamera = useCallback((p: MapPoint) => {
    const map = mapRef.current!;
    const here = coordsOf(p);
    const pts: LngLat[] = [here];
    for (const pin of p.extra.pins) {
      const ll = pinLngLat(pin);
      if (ll && Math.abs(ll[0] - here[0]) < 0.45 && Math.abs(ll[1] - here[1]) < 0.45) pts.push(ll);
    }
    for (const s of sights) if (s.destination === p.j.id) pts.push([s.lon, s.lat]);
    const heading = bearingOf(ORIGIN, here);
    const brg = Math.max(-35, Math.min(35, turn(0, heading) * 0.5));
    const b = bounds(pts);
    const span = Math.max(b[1][0] - b[0][0], b[1][1] - b[0][1]);
    if (span < 0.01) return { center: here, zoom: 13, pitch: 64, bearing: brg };
    const fit = map.cameraForBounds(b, { padding: padding(), pitch: 0, bearing: brg, maxZoom: 13.4 });
    return { center: fit?.center ?? here, zoom: Math.max(9.8, Math.min(13.6, (fit?.zoom ?? 12) - 0.1)), pitch: 64, bearing: brg };
  }, [padding, pinLngLat]);

  const overviewCamera = useCallback((r: Region) => {
    const map = mapRef.current!;
    const list = points.filter((p) => r === 'all' || p.j.region === r).map(coordsOf);
    const b = bounds([...list, ORIGIN]);
    const narrow = (frameRef.current?.clientWidth ?? 1200) < 700;
    if (r === 'all') {
      return { center: INITIAL_VIEW.center, zoom: INITIAL_VIEW.zoom - (narrow ? 0.7 : 0), pitch: INITIAL_VIEW.pitch, bearing: INITIAL_VIEW.bearing };
    }
    const fit = map.cameraForBounds(b, { padding: padding(), pitch: 0, bearing: INITIAL_VIEW.bearing, maxZoom: 10.5 });
    return { center: fit?.center ?? ORIGIN, zoom: (fit?.zoom ?? 7) - (narrow ? 0.5 : 0.2), pitch: 52, bearing: INITIAL_VIEW.bearing };
  }, [padding]);

  // A soft champagne beacon on the chosen place.
  useEffect(() => {
    glowRef.current?.remove();
    glowRef.current = null;
    const map = mapRef.current;
    const mb = mbRef.current;
    if (!map || !mb || !active || !ready) return;
    const el = document.createElement('div');
    el.className = styles.glowMarker;
    el.innerHTML = '<span></span>';
    glowRef.current = new mb.Marker({ element: el, anchor: 'center' })
      .setLngLat(coordsOf(pointById[active]))
      .addTo(map as unknown as import('mapbox-gl').Map);
  }, [active, ready]);

  /* ---------------------------------------------------------- animations */

  const modelsRef = useRef<import('./map3d/models3d').ModelsHandle | null>(null);
  const carRef = useRef<{ pos: LngLat | null; brg: number }>({ pos: null, brg: 0 });
  const seq = useRef(0); // bumps on every new choice; stale animation steps check it
  const busy = useRef(false); // a choose-and-drive sequence is running
  const tilesRef = useRef<string[] | undefined>(undefined);
  const want3d = useRef(false);
  const terrainOn = useRef(false);

  /** 3D terrain only when it shows: a place is chosen, or the map is close. */
  const syncTerrain = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;
    const want = layersRef.current.terrain;
    if (want === terrainOn.current) return;
    terrainOn.current = want;
    map.setTerrain(want ? { source: 'mapbox-dem', exaggeration: EXAGGERATION } : null);
  }, []);

  const stopFly = useCallback(() => {
    cancelAnimationFrame(rafs.current.fly);
    rafs.current.fly = 0;
    setFlying(false);
  }, []);

  const setActiveLine = useCallback((coords: LngLat[] | null, car: LngLat | null, brg = 0) => {
    const map = mapRef.current;
    if (!map) return;
    (map.getSource('jm-active') as GeoJSONSource | undefined)?.setData(
      coords ? { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: coords } } : emptyFC(),
    );
    (map.getSource('jm-car') as GeoJSONSource | undefined)?.setData(
      car ? { type: 'Feature', properties: { brg }, geometry: { type: 'Point', coordinates: car } } : emptyFC(),
    );
    carRef.current = { pos: car, brg };
    modelsRef.current?.setCar(car, brg);
  }, []);

  /** The whole road drawn, the car parked at the destination. */
  const park = useCallback((id: string | null) => {
    cancelAnimationFrame(rafs.current.route);
    rafs.current.route = 0;
    const m = id ? geoRef.current?.drives[id] : null;
    if (!m) { setActiveLine(null, null); return; }
    setActiveLine(m.coords, m.coords[m.coords.length - 1], headingAt(m, m.total));
  }, [setActiveLine]);
  const parkRef = useRef(park);
  parkRef.current = park;

  /** HTH's limousine leaves District 1 and drives the real road to the place. */
  const drive = useCallback((m: Measured, token: number, done: () => void) => {
    cancelAnimationFrame(rafs.current.route);
    const dur = Math.min(Math.max((m.total / 1000) * 16, 2400), 5200);
    let brg = headingAt(m, 0);
    const t0 = performance.now();
    const frame = (now: number) => {
      if (token !== seq.current) return;
      const k = Math.min((now - t0) / dur, 1);
      const d = m.total * (0.5 - Math.cos(Math.PI * k) / 2); // pull away, cruise, brake
      const pos = along(m, d);
      brg += turn(brg, headingAt(m, d)) * 0.3;
      setActiveLine(slice(m, d), pos, brg);
      if (k < 1) {
        rafs.current.route = requestAnimationFrame(frame);
      } else {
        rafs.current.route = 0;
        done();
      }
    };
    rafs.current.route = requestAnimationFrame(frame);
  }, [setActiveLine]);

  /* -------------------------------------------------------------- actions */

  const goOverview = useCallback((r: Region, duration = 2000) => {
    const map = mapRef.current;
    if (!map) return;
    want3d.current = false;
    map.flyTo({ ...overviewCamera(r), duration: reduced ? 0 : duration, curve: 1.3, essential: true });
  }, [overviewCamera, reduced]);

  /**
   * Choosing a place: frame the whole road, let the limousine drive it from
   * Saigon, then fly down into the destination in 3D.
   */
  const select = useCallback(
    (id: string | null, opts: { fromTour?: boolean } = {}) => {
      if (!opts.fromTour) setTouring(false);
      stopFly();
      const token = ++seq.current;
      activeRef.current = id;
      setActive(id);
      setFocusPin(null);
      const map = mapRef.current;
      if (map) { stateRef.current.active = id ?? ''; syncState(); }
      busy.current = false;
      if (!id) {
        park(null);
        goOverview(regionRef.current);
        return;
      }
      const p = pointById[id];
      setRoundTrip(p.extra.nights === 0);
      if (!opts.fromTour) track('destination_opened', { destination: id });
      if (!map) return;

      const arrive = () => {
        if (token !== seq.current) return;
        busy.current = false;
        want3d.current = true;
        syncTerrain();
        setDestView('dest');
        flyToDestination(p);
      };

      const m = geoRef.current?.drives[id];
      park(id);
      if (!m || reduced) { arrive(); return; }
      // The champagne road grows from District 1 while the camera flies.
      busy.current = true;
      arrive();
      const t0 = performance.now();
      const ms = 3400;
      const grow = (now: number) => {
        if (token !== seq.current) return;
        const k = Math.min((now - t0) / ms, 1);
        const d = m.total * easeInOutCubic(k);
        setActiveLine(slice(m, d), along(m, d), headingAt(m, d));
        if (k < 1) rafs.current.route = requestAnimationFrame(grow);
        else busy.current = false;
      };
      rafs.current.route = requestAnimationFrame(grow);
    },
    [destCamera, drive, goOverview, padding, park, reduced, setActiveLine, stopFly, syncTerrain],
  );

  const chooseRegion = useCallback(
    (r: Region) => {
      setTouring(false);
      stopFly();
      setRegion(r);
      setFocusPin(null);
      const map = mapRef.current;
      { stateRef.current.region = r; syncState(); }
      const a = activeRef.current;
      if (a && r !== 'all' && pointById[a].j.region !== r) {
        seq.current++;
        activeRef.current = null;
        setActive(null);
        { stateRef.current.active = ''; syncState(); }
        park(null);
      }
      goOverview(r);
    },
    [goOverview, park, stopFly],
  );

  /** Back to the overview centred on Ho Chi Minh City, every filter cleared. */
  const resetAll = useCallback(() => {
    setRegion('all');
    regionRef.current = 'all';
    { stateRef.current.region = 'all'; syncState(); }
    select(null);
  }, [select]);

  const step = useCallback(
    (dir: 1 | -1, fromTour = false) => {
      if (!visible.length) return;
      const i = active ? visible.findIndex((p) => p.j.id === active) : -1;
      select(visible[(i + dir + visible.length) % visible.length].j.id, { fromTour });
    },
    [active, select, visible],
  );

  const surprise = useCallback(() => {
    const pool = visible.filter((p) => p.j.id !== active);
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick) select(pick.j.id);
  }, [active, select, visible]);

  const showPin = useCallback(
    (pin: string | null) => {
      const ll = pinLngLat(pin);
      const map = mapRef.current;
      if (!ll || !pin || !map) return;
      setTouring(false);
      stopFly();
      if (rafs.current.route || seq.current) { seq.current++; park(activeRef.current); }
      want3d.current = true;
      syncTerrain();
      setFocusPin(pin);
      map.flyTo({
        center: ll, zoom: pin.startsWith('peak:') ? 12.6 : 15.6, pitch: 64,
        bearing: map.getBearing() + (reduced ? 0 : 18), duration: reduced ? 0 : 2200, curve: 1.5, essential: true,
      });
    },
    [park, pinLngLat, reduced, stopFly, syncTerrain],
  );

  /** Fly along the real road, low and tilted, the car leading the camera. */
  const flyRoute = useCallback(() => {
    const id = activeRef.current;
    const map = mapRef.current;
    const m = id ? geoRef.current?.drives[id] : null;
    if (!map || !m || !id) return;
    if (rafs.current.fly) { stopFly(); return; }
    setTouring(false);
    seq.current++;
    cancelAnimationFrame(rafs.current.route);
    rafs.current.route = 0;
    want3d.current = true;
    syncTerrain();
    setFlying(true);
    const km = m.total / 1000;
    const dur = Math.min(Math.max(km * 150, 9000), 30000);
    const zFar = km > 120 ? 11.3 : km > 50 ? 12 : 12.8;
    const zNear = 13.8;
    let brg = bearingOf(m.coords[0], along(m, 2500));
    map.jumpTo({ center: m.coords[0], zoom: zNear, pitch: 66, bearing: brg });
    const t0 = performance.now();
    const frame = (now: number) => {
      const k = Math.min((now - t0) / dur, 1);
      const e = k < 0.5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2; // ease in-out
      const d = m.total * e;
      const pos = along(m, d);
      const ahead = along(m, d + Math.max(1500, m.total * 0.03));
      const target = bearingOf(pos, ahead);
      brg += turn(brg, target) * 0.045;
      const edge = Math.min(d, m.total - d);
      const z = zFar + (zNear - zFar) * Math.exp(-edge / 9000);
      map.jumpTo({ center: pos, zoom: z, pitch: 66, bearing: brg });
      setActiveLine(slice(m, d), pos, headingAt(m, d));
      if (k < 1) {
        rafs.current.fly = requestAnimationFrame(frame);
      } else {
        rafs.current.fly = 0;
        setFlying(false);
        const p = pointById[id];
        map.flyTo({ ...destCamera(p), duration: 2400, essential: true });
      }
    };
    rafs.current.fly = requestAnimationFrame(frame);
  }, [destCamera, setActiveLine, stopFly, syncTerrain]);

  /* ------------------------------------------------------- map lifecycle */

  // Start loading a little before the section scrolls into view.
  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    if (!('IntersectionObserver' in window)) { setNear(true); setRevealed(true); setOnScreen(true); return; }
    const pre = new IntersectionObserver(([e]) => { if (e.isIntersecting) setNear(true); }, { rootMargin: '1600px 0px' });
    const io = new IntersectionObserver(
      ([entry]) => {
        setOnScreen(entry.isIntersecting);
        if (entry.isIntersecting && entry.intersectionRatio > 0.3) setRevealed(true);
      },
      { threshold: [0, 0.3] },
    );
    pre.observe(node);
    io.observe(node);
    return () => { pre.disconnect(); io.disconnect(); };
  }, []);

  // Fetch the map library and its data while the visitor reads the top of the page.
  useEffect(() => {
    TILE_HOSTS.forEach((h) => preconnect(h, { crossOrigin: 'anonymous' }));
    const warm = () => {
      void import('mapbox-gl');
      void fetch('/data/journey/basemap.json');
      void fetch('/data/journey/geo.json');
      void fetch(WORKER);
    };
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(warm, { timeout: 2500 });
    else window.setTimeout(warm, 1500);
  }, []);

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const r = node.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) setSize({ w: Math.round(r.width), h: Math.round(r.height) });
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setSize({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  // The panel is docked to the right edge; move the floating call dock off it.
  useEffect(() => {
    const root = document.documentElement;
    if (wide && onScreen) root.setAttribute('data-map-panel', '');
    else root.removeAttribute('data-map-panel');
    return () => root.removeAttribute('data-map-panel');
  }, [wide, onScreen]);

  const addOverlays = useCallback((map: MLMap) => {
    const geo = geoRef.current!;
    const add = (id: string, data: GeoJSON.GeoJSON, promoteId?: string) => {
      dataRef.current[id] = data;
      if (!map.getSource(id)) map.addSource(id, { type: 'geojson', data, ...(promoteId ? { promoteId } : {}) });
    };
    add('jm-routes', {
      type: 'FeatureCollection',
      features: points.map((p) => ({
        type: 'Feature',
        properties: { id: p.j.id, region: p.j.region },
        geometry: { type: 'LineString', coordinates: geo.drives[p.j.id]?.coords ?? [ORIGIN, coordsOf(p)] },
      })),
    }, 'id');
    // Shown as a dot at Saigon until the intro grows them.
    (map.getSource('jm-routes') as GeoJSONSource).setData({
      type: 'FeatureCollection',
      features: points.map((p) => ({ type: 'Feature', properties: { id: p.j.id, region: p.j.region }, geometry: { type: 'LineString', coordinates: [ORIGIN, ORIGIN] } })),
    });
    add('jm-places', {
      type: 'FeatureCollection',
      features: PLACES.map((pl) => ({
        type: 'Feature',
        properties: { name: en ? pl.en : pl.vi, kind: pl.kind },
        geometry: { type: 'Point', coordinates: pl.at },
      })),
    });
    add('jm-active', emptyFC());
    add('jm-car', emptyFC());
    add('jm-dest', {
      type: 'FeatureCollection',
      features: points.map((p) => ({
        type: 'Feature',
        properties: {
          id: p.j.id, region: p.j.region, name: en ? p.j.name.en : p.j.name.vi,
          icon: `jm-d-${p.j.id}`, iconActive: `jm-da-${p.j.id}`, sort: p.j.tier * 10 + p.rank / 10,
        },
        geometry: { type: 'Point', coordinates: coordsOf(p) },
      })),
    });
    add('jm-origin', { type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: ORIGIN } });
    add('jm-sights', {
      type: 'FeatureCollection',
      features: sights.map((s) => ({
        type: 'Feature',
        properties: { id: s.id, dest: s.destination, name: en ? s.en : s.vi, photo: `jm-s-${s.id}`, glyph: `jm-k-${s.kind}` },
        geometry: { type: 'Point', coordinates: [s.lon, s.lat] },
      })),
    });
    add('jm-pins', emptyFC());
    add('jm-peaks', {
      type: 'FeatureCollection',
      features: geo.peaks.map((pk) => ({
        type: 'Feature',
        properties: { id: pk.id, name: en ? pk.en : pk.vi, h: `${pk.height.toLocaleString(en ? 'en-US' : 'vi-VN')} m` },
        geometry: { type: 'Point', coordinates: [pk.lon, pk.lat] },
      })),
    });
    const before = map.getLayer(MB_BEFORE) ? MB_BEFORE : undefined;
    for (const layer of overlayLayers(locale)) {
      if (map.getLayer(layer.id)) continue;
      map.addLayer(withEmissive(bindState(layer, stateRef.current)) as never, layer.type === 'symbol' ? undefined : before);
    }
  }, [en, locale]);

  const addImages = useCallback(async (map: MLMap) => {
    const put = (id: string, img: Drawn) => {
      if (map.hasImage(id)) map.updateImage(id, img);
      else map.addImage(id, img, { pixelRatio: 2 });
    };
    put('jm-origin', originPin(34));
    put('jm-peak', peakMark(16));
    put('jm-car', limoMark());
    put('jm-fallback', photoBubble(null, { size: 44, ring: '#ffffff', fallback: '#d6cbb5' }));
    (Object.keys(ICON) as LandmarkKind[]).forEach((k) => put(`jm-k-${k}`, glyphDisc(ICON[k], { size: 24, fill: KIND_COLOR[k] })));

    // Destination bubbles first (they are on screen at once), then the sights.
    await Promise.all(points.map(async (p) => {
      const ph = photos[p.j.id];
      const img = ph ? await loadImage(ph.src).catch(() => null) : null;
      const rc = REGION_COLOR[p.j.region];
      put(`jm-d-${p.j.id}`, photoBubble(img, { size: 46, ring: '#ffffff', accent: rc, fallback: rc }));
      put(`jm-da-${p.j.id}`, photoBubble(img, { size: 66, ring: '#ffd28a', accent: '#e39a2d', fallback: rc }));
    }));
    // Symbols laid out before their picture arrived are laid out again.
    const refresh = (id: string) => {
      const src = map.getSource(id) as GeoJSONSource | undefined;
      const data = dataRef.current[id];
      if (src && data) src.setData(data);
    };
    refresh('jm-dest');
  }, []);

  /** Sight photos only matter close in, so they load the first time the map gets there. */
  const sightsLoaded = useRef(false);
  const loadSightPhotos = useCallback(async (map: MLMap) => {
    if (sightsLoaded.current) return;
    sightsLoaded.current = true;
    await Promise.all(sights.map(async (s) => {
      const ph = photos[s.id];
      if (!ph) return;
      const img = await loadImage(ph.src).catch(() => null);
      if (img && !map.hasImage(`jm-s-${s.id}`)) {
        map.addImage(`jm-s-${s.id}`, photoBubble(img, { size: 36, ring: '#ffffff', accent: KIND_COLOR[s.kind] }), { pixelRatio: 2 });
      }
    }));
    const src = map.getSource('jm-sights') as GeoJSONSource | undefined;
    const data = dataRef.current['jm-sights'];
    if (src && data) src.setData(data);
  }, []);

  // Build the map once the section is near.
  useEffect(() => {
    if (!near || mapRef.current || !mapNode.current) return;
    let cancelled = false;
    (async () => {
      try {
        const [mbMod, geo] = await Promise.all([
          import('mapbox-gl'),
          fetch('/data/journey/geo.json').then((r) => r.json() as Promise<GeoData>),
        ]);
        const mb = ((mbMod as unknown as { default?: unknown }).default ?? mbMod) as typeof import('mapbox-gl').default;
        const ml = mb as unknown as typeof import('maplibre-gl');
        if (cancelled || !mapNode.current) return;
        geoRef.current = {
          drives: Object.fromEntries(geo.drives.features.map((f) => [f.properties.id, measure(f.geometry.coordinates as LngLat[])])),
          peaks: geo.peaks,
        };
        mb.accessToken = MAPBOX_TOKEN;
        mbRef.current = mb;
        const mbMap = new mb.Map({
          container: mapNode.current,
          style: MAPBOX_STYLE,
          center: INITIAL_VIEW.center,
          zoom: INITIAL_VIEW.zoom - ((frameRef.current?.clientWidth ?? 1200) < 700 ? 0.7 : 0),
          pitch: INITIAL_VIEW.pitch,
          bearing: INITIAL_VIEW.bearing,
          projection: 'mercator',
          maxPitch: 78,
          minZoom: 2,
          maxZoom: 18,
          keyboard: false,
          cooperativeGestures: true,
          attributionControl: false,
          antialias: true,
          fadeDuration: 220,
          locale: {
            'ScrollZoomBlocker.CtrlMessage': c.gestureWin,
            'ScrollZoomBlocker.CmdMessage': c.gestureMac,
            'TouchPanBlocker.Message': c.gestureMobile,
          },
        });
        const map = mbMap as unknown as MLMap;
        mapRef.current = map;
        if (process.env.NODE_ENV !== 'production') (window as unknown as { __jm?: MLMap }).__jm = map;
        map.addControl(new ml.AttributionControl({ compact: true }), 'bottom-left');
        map.addControl(new ml.ScaleControl({ maxWidth: 96, unit: 'metric' }), 'bottom-left');

        // Pulse under the starting pin.
        const pulse = document.createElement('div');
        pulse.className = styles.originPulse;
        new ml.Marker({ element: pulse, anchor: 'center', pitchAlignment: 'map', rotationAlignment: 'map' }).setLngLat(ORIGIN).addTo(map);

        let pending = 0;
        const sync = () => {
          if (pending) return;
          pending = requestAnimationFrame(() => {
            pending = 0;
            setCam({ bearing: map.getBearing(), pitch: map.getPitch(), zoom: map.getZoom() });
          });
        };
        map.on('move', sync);
        // Trees are scattered from the park polygons once every tile on screen has arrived.
        map.on('idle', () => modelsRef.current?.refreshTrees());
        map.on('moveend', () => {
          syncTerrain();
          if (map.getZoom() >= 10.5) void loadSightPhotos(map);
        });

        performance.mark('jm:create');
        // Draw our layers as soon as the style is parsed, not after every tile has landed.
        map.once('style.load', () => {
          if (cancelled) return;
          performance.mark('jm:style');
          applyStandardTheme(mbMap, lightRef.current);
          addOverlays(map);
          void addImages(map);
          // Start with the attribution folded into its (i) button.
          map.getContainer().querySelectorAll('.mapboxgl-compact-show').forEach((n) => n.classList.remove('mapboxgl-compact-show'));
          setReady(true);
        });
        map.once('load', () => {
          // The 3D miniatures (three.js) arrive once the map itself is on screen.
          const go = () => {
            if (cancelled || modelsRef.current) return;
            Promise.all([import('./map3d/models3d'), import('@/data/journey/models.json')])
              .then(([mod, data]) => {
                if (cancelled || modelsRef.current) return;
                const h = mod.createModels(map, ml, data.default as unknown as Parameters<typeof mod.createModels>[2], {
                  onReady: () => { if (map.getLayer('jm-car')) map.setLayoutProperty('jm-car', 'visibility', 'none'); },
                });
                map.addLayer(h.layer, map.getLayer(MB_BEFORE) ? MB_BEFORE : undefined);
                modelsRef.current = h;
                h.setLight(lightRef.current);
                h.setCar(carRef.current.pos, carRef.current.brg);
                h.refreshTrees();
              })
              .catch((err) => console.warn('[journey map] 3D models unavailable', err));
          };
          const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
          if (w.requestIdleCallback) w.requestIdleCallback(go, { timeout: 2500 });
          else window.setTimeout(go, 800);
        });
        map.on('error', (e) => {
          // Tile hiccups are normal on mobile networks; only log them.
          if (process.env.NODE_ENV !== 'production') console.warn('[journey map]', e.error?.message ?? e);
        });

        // Any direct handling of the map ends a fly-over or a tour.
        const interrupt = () => {
          if (rafs.current.fly) { cancelAnimationFrame(rafs.current.fly); rafs.current.fly = 0; setFlying(false); }
          if (busy.current) {
            // Mid-journey: park the car at the destination and hand over the camera.
            seq.current++;
            busy.current = false;
            want3d.current = true;
            parkRef.current(activeRef.current);
          }
          setTouring(false);
        };
        map.on('dragstart', interrupt);
        map.on('wheel', (e) => { if (e.originalEvent.ctrlKey || e.originalEvent.metaKey) interrupt(); });
        map.on('touchstart', (e) => { if (e.originalEvent.touches.length > 1) interrupt(); });
      } catch (err) {
        console.error('[journey map]', err);
        setFailed(true);
      }
    })();
    return () => { cancelled = true; };
  }, [near, locale, c, addOverlays, addImages, padding, syncTerrain, loadSightPhotos]);

  useEffect(() => () => {
    const r = rafs.current;
    cancelAnimationFrame(r.route); cancelAnimationFrame(r.fly); cancelAnimationFrame(r.intro);
    mapRef.current?.remove();
    mapRef.current = null;
  }, []);

  /* ------------------------------------------------------- pointer input */

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const order = ['jm-dest-active', 'jm-pins', 'jm-dest', 'jm-dest-dots', 'jm-origin', 'jm-sights'];
    const pick = (x: number, y: number): MapGeoJSONFeature | null => {
      const ids = order.filter((l) => map.getLayer(l));
      const r = 8;
      const hits = map.queryRenderedFeatures([[x - r, y - r], [x + r, y + r]], { layers: ids });
      hits.sort((a, b) => order.indexOf(a.layer.id) - order.indexOf(b.layer.id));
      return hits[0] ?? null;
    };
    let hot: string | null = null;
    const setHot = (id: string | null) => {
      if (hot === id) return;
      if (hot) map.setFeatureState({ source: 'jm-routes', id: hot }, { hot: false });
      hot = id;
      if (hot) map.setFeatureState({ source: 'jm-routes', id: hot }, { hot: true });
    };
    const onMove = (e: { point: { x: number; y: number } }) => {
      const f = pick(e.point.x, e.point.y);
      map.getCanvas().style.cursor = f ? 'pointer' : '';
      const l = f?.layer.id;
      setHot(f && (l === 'jm-dest' || l === 'jm-dest-dots') ? String(f.properties.id) : null);
    };
    const onClick = (e: { point: { x: number; y: number } }) => {
      setRevealed(true);
      const f = pick(e.point.x, e.point.y);
      if (!f) return;
      const l = f.layer.id;
      const id = String(f.properties.id ?? '');
      if (l === 'jm-origin') select(null);
      else if (l === 'jm-dest' || l === 'jm-dest-dots' || l === 'jm-dest-active') {
        if (id === activeRef.current) map.flyTo({ ...destCamera(pointById[id]), duration: 1600, essential: true });
        else select(id);
      } else if (l === 'jm-pins' || l === 'jm-sights') {
        const dest = String(f.properties.dest ?? '');
        if (dest && dest !== activeRef.current && pointById[dest]) { select(dest); setTab('see'); }
        showPin(id);
      }
    };
    const onLeave = () => { map.getCanvas().style.cursor = ''; setHot(null); };
    map.on('mousemove', onMove);
    map.on('click', onClick);
    map.on('mouseout', onLeave);
    return () => { map.off('mousemove', onMove); map.off('click', onClick); map.off('mouseout', onLeave); };
  }, [ready, select, showPin, destCamera]);

  // Chip hover lights the road on the map.
  const hoverChip = useCallback((id: string | null, on: boolean) => {
    const map = mapRef.current;
    if (!map || !ready || !id) return;
    map.setFeatureState({ source: 'jm-routes', id }, { hot: on });
  }, [ready]);

  /* --------------------------------------------------------------- intro */

  // On first sight: the roads grow out of Saigon while the camera tilts a little.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready || !revealed || introDone) return;
    const geo = geoRef.current!;
    const src = map.getSource('jm-routes') as GeoJSONSource;
    const target = overviewCamera(regionRef.current);
    if (reduced) {
      map.jumpTo(target);
      src.setData(dataRef.current['jm-routes']);
      setIntroDone(true);
      return;
    }
    map.easeTo({ ...target, duration: 1800, essential: true });
    const longest = Math.max(...Object.values(geo.drives).map((m) => m.total));
    const t0 = performance.now() + 250;
    const dur = 1900;
    const frame = (now: number) => {
      const k = Math.max(0, Math.min((now - t0) / dur, 1));
      const d = longest * easeInOutCubic(k);
      src.setData({
        type: 'FeatureCollection',
        features: points.map((p) => {
          const m = geo.drives[p.j.id];
          return {
            type: 'Feature',
            properties: { id: p.j.id, region: p.j.region },
            geometry: { type: 'LineString', coordinates: m ? slice(m, d) : [ORIGIN, coordsOf(p)] },
          };
        }),
      });
      if (k < 1) rafs.current.intro = requestAnimationFrame(frame);
      else setIntroDone(true);
    };
    rafs.current.intro = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafs.current.intro);
  }, [ready, revealed, introDone, overviewCamera, reduced]);

  /* ------------------------------------------------------------- pins */

  // The chosen place's sights: numbered photo pins for its three highlights.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const src = map.getSource('jm-pins') as GeoJSONSource | undefined;
    if (!src) return;
    if (!activePoint) { src.setData(emptyFC()); return; }
    const p = activePoint;
    const seen = new Map<string, number>();
    p.extra.pins.forEach((pin, i) => { if (pin && !seen.has(pin)) seen.set(pin, i + 1); });
    for (const s of sights) if (s.destination === p.j.id && !seen.has(s.id)) seen.set(s.id, 0);
    let cancelled = false;
    (async () => {
      const features: GeoJSON.Feature[] = [];
      for (const [pin, n] of seen) {
        const ll = pinLngLat(pin);
        if (!ll) continue;
        const isPeak = pin.startsWith('peak:');
        const s = isPeak ? null : sightById[pin];
        const pk = isPeak ? geoRef.current?.peaks.find((x) => x.id === pin.slice(5)) : null;
        const label = s ? (en ? s.en : s.vi) : pk ? `${en ? pk.en : pk.vi} · ${pk.height.toLocaleString(en ? 'en-US' : 'vi-VN')} m` : '';
        const kind: LandmarkKind = s?.kind ?? 'nature';
        const icon = `jm-p-${pin}-${n}`;
        const glyph = n ? `jm-g-${kind}-${n}` : `jm-k-${kind}`;
        if (n && !map.hasImage(glyph)) map.addImage(glyph, glyphDisc(ICON[kind], { size: 30, fill: '#e39a2d', badge: String(n) }), { pixelRatio: 2 });
        if (!map.hasImage(icon) && photos[pin]) {
          const img = await loadImage(photos[pin].src).catch(() => null);
          if (cancelled) return;
          if (img && !map.hasImage(icon)) {
            map.addImage(icon, photoBubble(img, {
              size: n ? 52 : 38, ring: '#ffffff', accent: n ? '#e39a2d' : KIND_COLOR[kind], badge: n ? String(n) : undefined,
            }), { pixelRatio: 2 });
          }
        }
        features.push({ type: 'Feature', properties: { id: pin, n, name: label, icon, glyph, dest: s?.destination ?? p.j.id }, geometry: { type: 'Point', coordinates: ll } });
      }
      if (!cancelled) src.setData({ type: 'FeatureCollection', features });
    })();
    return () => { cancelled = true; };
  }, [activePoint, ready, en, pinLngLat]);

  useEffect(() => {
    const map = mapRef.current;
    if (map && ready) { stateRef.current.focus = focusPin ?? ''; syncState(); }
  }, [focusPin, ready]);

  /* -------------------------------------------------------------- layers */

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    const vis = (ids: string[], on: boolean) => ids.forEach((id) => map.getLayer(id) && map.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none'));
    vis(['jm-routes', 'jm-routes-case'], layers.roads);
    vis(['jm-sights', 'jm-pins', 'jm-peaks'], layers.sights);
    vis(['hillshade'], layers.terrain);
    syncTerrain();
  }, [layers, ready, syncTerrain]);

  /* --------------------------------------------------------------- light */

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;
    setLightPreset(map as unknown as import('mapbox-gl').Map, light);
    const p = ACTIVE_ROUTE_PAINT[light];
    const paint = (id: string, key: string, value: unknown) => { if (map.getLayer(id)) map.setPaintProperty(id, key as never, value as never); };
    paint('jm-active-glow', 'line-color', p.glow);
    paint('jm-active-glow', 'line-opacity', p.glowOpacity);
    paint('jm-active-case', 'line-color', p.casing);
    paint('jm-active-case', 'line-opacity', p.casingOpacity);
    paint('jm-active-line', 'line-color', p.line);
    modelsRef.current?.setLight(light);
  }, [light, ready]);

  const switchMode = useCallback((m: BaseMode) => {
    const map = mapRef.current;
    const base = baseRef.current;
    if (!map || !base || m === mode) return;
    setMode(m);
    const next = buildStyle(base, locale, m, tilesRef.current);
    map.setStyle(next, {
      transformStyle: (prev, nextStyle) => {
        if (!prev) return nextStyle;
        const keep = Object.fromEntries(Object.entries(prev.sources).filter(([k]) => k.startsWith('jm-')));
        const mine = prev.layers.filter((l) => l.id.startsWith('jm-'));
        const idx = nextStyle.layers.findIndex((l) => l.id === MB_BEFORE);
        const lines = mine.filter((l) => l.type !== 'symbol');
        const syms = mine.filter((l) => l.type === 'symbol');
        const layersOut = idx >= 0
          ? [...nextStyle.layers.slice(0, idx), ...lines, ...nextStyle.layers.slice(idx), ...syms]
          : [...nextStyle.layers, ...mine];
        return {
          ...nextStyle,
          state: prev.state,
          sources: { ...nextStyle.sources, ...keep },
          layers: layersOut,
          terrain: terrainOn.current ? { source: 'mapbox-dem', exaggeration: EXAGGERATION } : undefined,
        };
      },
    });
  }, [locale, mode]);

  /* ------------------------------------------------------------- touring */

  useEffect(() => {
    if (!touring || !onScreen) return;
    const id = window.setTimeout(() => step(1, true), active ? TOUR_MS : 300);
    return () => window.clearTimeout(id);
  }, [touring, onScreen, active, step]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || !active) return;
    const chip = rail.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (!chip) return;
    rail.scrollTo({ left: chip.offsetLeft - rail.clientWidth / 2 + chip.clientWidth / 2, behavior: reduced ? 'auto' : 'smooth' });
  }, [active, reduced]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    const map = mapRef.current;
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (e.key === 'Escape' && (active || flying)) { e.preventDefault(); if (flying) stopFly(); else select(null); }
    else if (e.key === '+' || e.key === '=') map?.zoomIn();
    else if (e.key === '-') map?.zoomOut();
  };

  /* -------------------------------------------------------------- booking */

  const book = (placeName: string, id: string, vehicle?: string) => {
    track('destination_book_clicked', { destination: id, passengers: group, vehicle });
    const form = document.getElementById('dat-xe');
    if (!form) {
      const q = new URLSearchParams({ to: placeName, pax: String(group), ...(vehicle ? { xe: vehicle } : {}) });
      window.location.href = `${paths.booking(locale)}?${q}`;
      return;
    }
    window.dispatchEvent(new CustomEvent('hth:prefill', { detail: { dropoff: placeName, vehicle, pax: group, roundTrip } }));
    form.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    window.setTimeout(() => {
      form.querySelector<HTMLInputElement>('input[name="pickup"]')?.focus({ preventScroll: true });
    }, reduced ? 0 : 700);
  };

  /* ---------------------------------------------------------------- panel */

  const credit = (ph: Photo | undefined) =>
    ph ? (
      <a className={styles.photoCredit} href={ph.page} target="_blank" rel="noopener noreferrer">
        {c.photo}: {ph.author} · {ph.license}
      </a>
    ) : null;

  const originCard = () => (
    <div className={styles.card} key="origin">
      <div className={styles.cardTop}>
        <span className="label">{c.start}</span>
      </div>
      <div className={styles.scroll}>
        {photos.saigon ? (
          <figure className={styles.hero}>
            <img src={photos.saigon.wide ?? photos.saigon.src} alt="" loading="lazy" decoding="async" />
            {credit(photos.saigon)}
          </figure>
        ) : null}
        <h3 className={styles.cardTitle}>{c.originTitle}</h3>
        <p className={styles.tagline}>{c.originBody}</p>

        <div className={styles.legend}>
          <span className="label">{c.legend}</span>
          <p className={styles.legendSub}>{c.legendRegions}</p>
          <ul className={styles.legendRegions}>
            {regions.slice(1).map((r) => {
              const list = points.filter((p) => p.j.region === r.id);
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    className={styles.legendRegion}
                    style={{ ['--rc' as string]: REGION_COLOR[r.id as JourneyRegion] }}
                    onClick={() => chooseRegion(r.id)}
                  >
                    <span className={styles.legendSwatch} aria-hidden="true" />
                    <span className={styles.legendName}>{t(r.name)}</span>
                    <span className={styles.legendPlaces}>
                      {list.slice(0, 4).map((p) => name(p)).join(', ')}
                      {list.length > 4 ? ` +${list.length - 4}` : ''}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <ul className={styles.legendSymbols}>
            <li><span className={styles.symOrigin} aria-hidden="true" />{c.legendOrigin}</li>
            <li><span className={styles.symRoute} aria-hidden="true" />{c.legendRoute}</li>
            <li><span className={styles.symPeak} aria-hidden="true" />{c.legendPeak}</li>
            <li><span className={styles.symSight} aria-hidden="true" />{c.legendSight}</li>
          </ul>
        </div>

        <p className={styles.hint}>{c.hint}</p>
        <a href={`tel:${site.phone.tel}`} className={`tlink ${styles.call}`}>{site.phone.display}</a>
      </div>
    </div>
  );

  const destinationCard = (p: MapPoint) => {
    const j = p.j;
    const f = figures[j.id];
    const x = p.extra;
    const regionName = regions.find((r) => r.id === j.region)!.name;
    const displayName = name(p);
    const placeName = f.place ? (en ? f.place.en : f.place.vi) : displayName;
    const options = vehiclesFor(group);
    const primary = options[0];
    const primaryPrice = primary ? priceFor(f.km, primary, roundTrip) : null;
    const ph = photos[j.id];

    return (
      <div className={styles.card} key={j.id} style={{ ['--rc' as string]: REGION_COLOR[j.region] }}>
        <div className={styles.cardTop}>
          <span className="label">
            {t(regionName)}
            <span className={styles.counter}> · {pad2(p.index)} / {points.length}</span>
          </span>
          <div className={styles.cardNav}>
            <button type="button" onClick={() => step(-1)} aria-label={c.prev}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M8.5 3 4.5 7l4 4" stroke="currentColor" strokeWidth="1.4" /></svg>
            </button>
            <button type="button" onClick={() => step(1)} aria-label={c.next}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="m5.5 3 4 4-4 4" stroke="currentColor" strokeWidth="1.4" /></svg>
            </button>
            <button type="button" onClick={() => select(null)} aria-label={c.close}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="m3.5 3.5 7 7m0-7-7 7" stroke="currentColor" strokeWidth="1.4" /></svg>
            </button>
          </div>
        </div>

        <div className={styles.scroll}>
          {ph ? (
            <figure className={`${styles.hero} ${styles.in}`} style={{ ['--i' as string]: 0 }}>
              <img src={ph.wide ?? ph.src} alt="" loading="lazy" decoding="async" />
              {credit(ph)}
            </figure>
          ) : null}
          <h3 className={`${styles.cardTitle} ${styles.in}`} style={{ ['--i' as string]: 0 }}>{displayName}</h3>
          <p className={`${styles.area} ${styles.in}`} style={{ ['--i' as string]: 1 }}>{t(j.area)}</p>
          <p className={`${styles.tagline} ${styles.in}`} style={{ ['--i' as string]: 1 }}>{t(j.tagline)}</p>

          <button
            type="button"
            className={`${styles.flyBtn} ${styles.in}`}
            style={{ ['--i' as string]: 2 }}
            onClick={flyRoute}
            aria-pressed={flying}
            disabled={!ready}
          >
            <span className={styles.flyIcon} aria-hidden="true">
              {flying ? (
                <svg width="12" height="12" viewBox="0 0 12 12"><rect x="2" y="2" width="8" height="8" rx="1" fill="currentColor" /></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 7.5 12.5 2l-3.6 10.5-2.2-4.1-5.2-.9Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" /></svg>
              )}
            </span>
            <span>
              <strong>{flying ? c.flyStop : c.fly}</strong>
              <small>{c.flyHint(f.km)}</small>
            </span>
          </button>

          <dl className={`${styles.stats3} ${styles.in}`} style={{ ['--i' as string]: 2 }}>
            <div>
              <dt>{c.distance}</dt>
              <dd className="u-num">{f.km} <small>km</small></dd>
            </div>
            <div>
              <dt>{c.time}</dt>
              <dd className="u-num">{formatDuration(f.minutes, locale)}</dd>
              <dd className={styles.statNote}>{f.measured ? c.measured : c.estimate}</dd>
            </div>
            <div>
              <dt>{c.days}</dt>
              <dd className={styles.statText}>{daysLabel(x.nights, locale)}</dd>
            </div>
          </dl>

          <div className={`${styles.spot} ${styles.in}`} style={{ ['--i' as string]: 2 }}>
            <span className={styles.noteKey}>{c.idealStyle}</span>
            <strong className={styles.spotStyle}>{t(tripStyle(p))}</strong>
            <p className={styles.spotFeel}>{t(driveFeel(f.minutes))}</p>
          </div>

          <div className={`${styles.tags} ${styles.in}`} style={{ ['--i' as string]: 3 }}>
            <span className={styles.tagsKey}>{c.goodFor}</span>
            {x.goodFor.map((g) => <span key={g} className={styles.tag}>{t(goodForLabel[g])}</span>)}
          </div>

          <div className={styles.tabs} role="tablist">
            {([['see', c.tabSee], ['plan', c.tabPlan], ['car', c.tabCar]] as const).map(([k, label]) => (
              <button key={k} type="button" role="tab" aria-selected={tab === k} className={styles.tab} onClick={() => setTab(k)}>
                {label}
              </button>
            ))}
          </div>

          {tab === 'see' ? (
            <div className={styles.tabBody} role="tabpanel" key="see">
              <ol className={styles.highlights}>
                {j.highlights.map((h, i) => {
                  const pin = x.pins[i];
                  const has = Boolean(pin && (pin.startsWith('peak:') || sightById[pin]));
                  const pph = pin ? photos[pin] : undefined;
                  return (
                    <li
                      key={i}
                      className={styles.in}
                      style={{ ['--i' as string]: 1 + i }}
                      onMouseEnter={() => { if (has) setFocusPin(pin); }}
                      onMouseLeave={() => setFocusPin(null)}
                    >
                      {pph ? (
                        <img className={styles.hlPhoto} src={pph.src} alt="" loading="lazy" decoding="async" />
                      ) : (
                        <span className={styles.hlNum} data-pin={has}>{i + 1}</span>
                      )}
                      <div>
                        <h4>{pph ? <span className={styles.hlBadge}>{i + 1}</span> : null}{t(h.title)}</h4>
                        <p>{t(h.body)}</p>
                        {has ? (
                          <button type="button" className={styles.pinLink} onClick={() => showPin(pin)}>
                            {c.showOnMap} →
                          </button>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ol>
              {x.eat ? <p className={styles.note}><span className={styles.noteKey}>{c.eat}</span>{t(x.eat)}</p> : null}
              {j.when ? <p className={styles.note}><span className={styles.noteKey}>{c.when}</span>{t(j.when)}</p> : null}
              {x.stops?.length ? (
                <p className={styles.note}>
                  <span className={styles.noteKey}>{c.onTheWay}</span>
                  {x.stops.map((s, i) => (
                    <span key={s}>
                      {i ? ', ' : ''}
                      <button type="button" className={styles.inlineLink} onClick={() => select(s)}>{name(pointById[s])}</button>
                    </span>
                  ))}
                </p>
              ) : null}
            </div>
          ) : null}

          {tab === 'plan' ? (
            <div className={styles.tabBody} role="tabpanel" key="plan">
              {itinerary(p).map((d) => (
                <div key={d.day} className={`${styles.day} ${styles.in}`} style={{ ['--i' as string]: d.day }}>
                  <div className={styles.dayHead}>{c.day(d.day)}</div>
                  <ol className={styles.timeline}>
                    {d.steps.map((s, i) => (
                      <li key={i} data-kind={s.kind}>
                        <span className={styles.time}>{clock(s.at, locale)}</span>
                        <span className={styles.stepIcon} aria-hidden="true">
                          <svg width="16" height="16" viewBox="-6 -6 12 12" fill="none"><path d={STEP_ICON[s.kind]} stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </span>
                        <span className={styles.stepText}>
                          {s.kind === 'see' && pinLngLat(s.pin ?? null) ? (
                            <button type="button" className={styles.inlineLink} onClick={() => showPin(s.pin ?? null)}>{t(s.text)}</button>
                          ) : t(s.text)}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
              <p className={styles.planNote}>{c.planNote}</p>
            </div>
          ) : null}

          {tab === 'car' ? (
            <div className={styles.tabBody} role="tabpanel" key="car">
              <div className={styles.groupRow}>
                <span className={styles.groupLabel}>{c.howMany}</span>
                <div className={styles.stepper}>
                  <button type="button" onClick={() => setGroup((n) => Math.max(1, n - 1))} aria-label={c.fewer}>−</button>
                  <output className="u-num" aria-live="polite">{group} <small>{c.people}</small></output>
                  <button type="button" onClick={() => setGroup((n) => Math.min(120, n + 1))} aria-label={c.more}>+</button>
                </div>
              </div>
              <div className={styles.presets}>
                {groupPresets.map((g) => (
                  <button key={g.n} type="button" className={styles.preset} aria-pressed={group === g.n} onClick={() => setGroup(g.n)}>
                    {t(g.label)} <span>{g.n}</span>
                  </button>
                ))}
              </div>
              <div className={styles.tripToggle} role="group">
                <button type="button" aria-pressed={!roundTrip} onClick={() => setRoundTrip(false)}>{c.oneWay}</button>
                <button type="button" aria-pressed={roundTrip} onClick={() => setRoundTrip(true)}>{c.roundTrip}</button>
              </div>

              {options.length ? options.map((o, i) => {
                const v = fleetByKey[o.key];
                const price = priceFor(f.km, o, roundTrip);
                return (
                  <div key={o.key} className={styles.vehicle} data-primary={i === 0}>
                    <div className={styles.vehicleMedia}>
                      <Image src={v.hero} alt="" width={240} height={180} sizes="112px" />
                    </div>
                    <div className={styles.vehicleBody}>
                      <span className={styles.vehicleTag}>{i === 0 ? c.recommended : c.alt}</span>
                      <h4>{o.count > 1 ? `${o.count} × ` : ''}{en ? v.nameEn : v.name}</h4>
                      <p>{t(o.why)}</p>
                      <div className={styles.vehiclePrice}>
                        <strong className="u-num">{formatVnd(price.low, locale)} – {formatVnd(price.high, locale)}₫</strong>
                        <span className="u-num">≈ {formatVnd(Math.round(price.low / group / 1000) * 1000, locale)}₫ {c.perPerson}</span>
                      </div>
                    </div>
                  </div>
                );
              }) : <p className={styles.note}>{c.tooMany}</p>}
              {x.nights > 0 ? <p className={styles.planNote}>{c.multiDay}</p> : null}
            </div>
          ) : null}

          {j.routeSlug ? (
            <p className={styles.routeLink}>
              <Link href={paths.route(locale, en ? j.routeSlug.en : j.routeSlug.vi)} className="tlink">{c.route}</Link>
            </p>
          ) : null}
        </div>

        <div className={styles.cta}>
          <button type="button" className="btn btn--gold" onClick={() => book(placeName, j.id, primary?.key)}>
            {c.book(displayName)}
          </button>
          {primary && primaryPrice ? (
            <span className={styles.ctaMeta}>
              {group} {c.people} · {en ? fleetByKey[primary.key].nameEn : fleetByKey[primary.key].name}
              {primary.count > 1 ? ` ×${primary.count}` : ''} · {c.from} {formatVnd(primaryPrice.low, locale)}₫
            </span>
          ) : null}
        </div>
      </div>
    );
  };

  const panelBody = () => (activePoint ? destinationCard(activePoint) : originCard());

  const rail = (
    <div className={styles.rail} ref={railRef} role="group" aria-label={c.index}>
      {visible.map((p) => (
        <button
          key={p.j.id}
          type="button"
          data-id={p.j.id}
          className={styles.chip}
          style={{ ['--rc' as string]: REGION_COLOR[p.j.region] }}
          aria-pressed={active === p.j.id}
          onClick={() => select(active === p.j.id ? null : p.j.id)}
          onMouseEnter={() => hoverChip(p.j.id, true)}
          onMouseLeave={() => hoverChip(p.j.id, false)}
          onFocus={() => hoverChip(p.j.id, true)}
          onBlur={() => hoverChip(p.j.id, false)}
        >
          {photos[p.j.id] ? <img className={styles.chipPhoto} src={photos[p.j.id].src} alt="" loading="lazy" decoding="async" /> : null}
          <span className={styles.chipNum}>{pad2(p.index)}</span>
          {name(p)}
        </button>
      ))}
    </div>
  );

  /* -------------------------------------------------------------- render */

  const is3D = cam.pitch > 8;
  const map = mapRef.current;

  return (
    <div
      className={`${styles.stage} ${revealed ? styles.revealed : ''} ${introDone ? styles.introDone : ''} ${onScreen ? '' : styles.paused} ${wide ? styles.wide : ''}`}
      onKeyDown={onKeyDown}
      onFocus={() => setRevealed(true)}
    >
      <div ref={frameRef} className={`${styles.frame} ${styles.frame3d}`} data-mode={mode}>
        <div ref={mapNode} className={styles.map} role="region" aria-label={c.mapLabel} />
        {!ready && !failed ? <div className={styles.loading} role="status">{c.loading}</div> : null}
        {failed ? <div className={styles.loading} role="status">{c.noGl}</div> : null}

        {/* Overlays ----------------------------------------------------------- */}
        <div className={styles.topbar}>
          <div className={styles.filters} role="group" aria-label={c.filter}>
            {regions.map((r) => {
              const count = r.id === 'all' ? points.length : points.filter((p) => p.j.region === r.id).length;
              return (
                <button
                  key={r.id}
                  type="button"
                  className={styles.filter}
                  aria-pressed={region === r.id}
                  onClick={() => chooseRegion(r.id)}
                  style={r.id === 'all' ? undefined : { ['--rc' as string]: REGION_COLOR[r.id as JourneyRegion] }}
                >
                  {r.id === 'all' ? null : <span className={styles.filterSwatch} aria-hidden="true" />}
                  {t(r.name)}
                  <span className={styles.filterCount}>{count}</span>
                </button>
              );
            })}
          </div>
          <div className={styles.subbar}>
            <button
              type="button"
              className={`${styles.tourBtn} ${touring ? styles.tourOn : ''}`}
              aria-pressed={touring}
              onClick={() => { stopFly(); setTouring((v) => !v); }}
              disabled={!ready}
            >
              <span className={styles.tourIcon} aria-hidden="true">
                {touring ? (
                  <svg width="10" height="10" viewBox="0 0 10 10"><rect x="1.5" y="1" width="2.4" height="8" fill="currentColor" /><rect x="6.1" y="1" width="2.4" height="8" fill="currentColor" /></svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 1l7 4-7 4z" fill="currentColor" /></svg>
                )}
              </span>
              {touring ? c.tourStop : c.tour}
              {touring && active ? <span key={active} className={styles.tourProgress} style={{ animationDuration: `${TOUR_MS}ms` }} /> : null}
            </button>
            <button type="button" className={styles.ghostBtn} onClick={surprise} disabled={!ready}>{c.surprise}</button>
            <button type="button" className={styles.resetBtn} onClick={resetAll} disabled={!ready}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><circle cx="6" cy="6" r="4.3" stroke="currentColor" strokeWidth="1.3" /><circle cx="6" cy="6" r="1.6" fill="currentColor" /></svg>
              {c.resetHcm}
            </button>
            <div className={styles.layerToggles} role="group" aria-label={c.layers}>
              {([
                ['terrain', c.layerTerrain],
                ['roads', c.layerRoads],
                ['sights', c.layerSights],
              ] as const).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  className={styles.layerBtn}
                  aria-pressed={layers[k]}
                  onClick={() => setLayers((s) => ({ ...s, [k]: !s[k] }))}
                >
                  <span className={styles.layerTick} aria-hidden="true" />
                  {label}
                </button>
              ))}
            </div>
            <div className={styles.layerToggles} role="group" aria-label={c.light}>
              {LIGHT_PRESETS.map((k) => (
                <button
                  key={k}
                  type="button"
                  className={`${styles.layerBtn} ${styles.lightBtn}`}
                  aria-pressed={light === k}
                  onClick={() => setLight(k)}
                  disabled={!ready}
                >
                  <svg className={styles.lightIcon} width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">{LIGHT_ICON[k]}</svg>
                  {k === 'day' ? c.lightDay : k === 'dusk' ? c.lightDusk : c.lightNight}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Apple-style control column */}
        {active && ready ? (
          <div className={styles.viewSwitch} role="group">
            <button
              type="button"
              aria-pressed={destView === 'route'}
              onClick={() => { setDestView('route'); flyToRoute(pointById[active]); }}
            >
              {c.viewRoute}
            </button>
            <button
              type="button"
              aria-pressed={destView === 'dest'}
              onClick={() => { setDestView('dest'); flyToDestination(pointById[active], 2200); }}
            >
              {c.viewDest}
            </button>
          </div>
        ) : null}

        <div className={styles.ctrlStack}>
          {satellite ? (
            <div className={styles.ctrlGroup} role="group">
              <button type="button" aria-pressed={mode === 'map'} onClick={() => switchMode('map')} title={c.modeMap} aria-label={c.modeMap}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M1.5 3.5 5.5 2l5 2 4-1.5v10l-4 1.5-5-2-4 1.5Z M5.5 2v10 M10.5 4v10" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" /></svg>
              </button>
              <button type="button" aria-pressed={mode === 'satellite'} onClick={() => switchMode('satellite')} title={c.modeSat} aria-label={c.modeSat}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.3" stroke="currentColor" strokeWidth="1.2" /><path d="M1.8 8h12.4M8 1.7c2.2 2 2.2 10.6 0 12.6M8 1.7c-2.2 2-2.2 10.6 0 12.6" stroke="currentColor" strokeWidth="1.1" /></svg>
              </button>
            </div>
          ) : null}
          <div className={styles.ctrlGroup}>
            <button
              type="button"
              className={styles.compass}
              onClick={() => map?.easeTo({ bearing: 0, duration: reduced ? 0 : 700 })}
              title={c.north}
              aria-label={c.north}
            >
              <span style={{ transform: `rotate(${-cam.bearing}deg)` }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M11 2.5 13.4 11H8.6Z" fill="#e5484d" /><path d="M11 19.5 8.6 11h4.8Z" fill="currentColor" opacity="0.55" /></svg>
                <i>N</i>
              </span>
            </button>
            <button
              type="button"
              onClick={() => map?.easeTo(is3D ? { pitch: 0, duration: reduced ? 0 : 800 } : { pitch: 58, duration: reduced ? 0 : 900 })}
              title={is3D ? c.view2d : c.view3d}
              aria-label={is3D ? c.view2d : c.view3d}
              className={styles.dimBtn}
            >
              {is3D ? '2D' : '3D'}
            </button>
          </div>
          <div className={styles.ctrlGroup}>
            <button type="button" onClick={() => map?.zoomIn({ duration: reduced ? 0 : 350 })} aria-label={c.zoomIn}>
              <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.4" /></svg>
            </button>
            <button type="button" onClick={() => map?.zoomOut({ duration: reduced ? 0 : 350 })} aria-label={c.zoomOut}>
              <svg width="12" height="12" viewBox="0 0 12 12"><path d="M1 6h10" stroke="currentColor" strokeWidth="1.4" /></svg>
            </button>
            <button type="button" onClick={() => select(null)} aria-label={c.reset} title={c.reset}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 4V1h3M8 1h3v3M11 8v3H8M4 11H1V8" stroke="currentColor" strokeWidth="1.3" /></svg>
            </button>
          </div>
        </div>

        {wide ? rail : null}

        {!wide && activePoint ? (
          <button
            type="button"
            key={activePoint.j.id}
            className={styles.peek}
            onClick={() => panelRef.current?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })}
          >
            <span className={styles.peekName}>{name(activePoint)}</span>
            <span className={styles.peekMeta}>
              {figures[activePoint.j.id].km} km · {formatDuration(figures[activePoint.j.id].minutes, locale)} · {c.details} ↓
            </span>
          </button>
        ) : null}

        {wide ? (
          <aside ref={panelRef} data-lenis-prevent className={styles.panel} aria-live="polite">
            {panelBody()}
          </aside>
        ) : null}
      </div>

      {!wide ? (
        <>
          {rail}
          <aside ref={panelRef} data-lenis-prevent className={styles.panel} aria-live="polite">
            {panelBody()}
          </aside>
        </>
      ) : null}
    </div>
  );
}
