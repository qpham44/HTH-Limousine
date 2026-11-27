'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { regions, originInfo, type JourneyRegion } from '@/data/journeys';
import { goodForLabel } from '@/data/journeyExtras';
import { fleetByKey } from '@/data/fleet';
import { formatDuration, formatVnd } from '@/lib/quote';
import { paths, type Locale } from '@/lib/i18n';
import { site } from '@/lib/site';
import { track } from '@/lib/analytics';
import {
  NO_INSETS,
  driveFeel,
  tripStyle,
  REGION_COLOR,
  clampView,
  clock,
  daysLabel,
  destinationView,
  easeInOut,
  figures,
  fitView,
  graticule,
  groupPresets,
  homeView,
  islands,
  itinerary,
  landmarkById,
  landmarks,
  lerpView,
  origin,
  peaks,
  pinPoint,
  pinView,
  pointById,
  points,
  priceFor,
  regionView,
  scaleBar,
  towns,
  vehiclesFor,
  type Insets,
  type LandmarkKind,
  type MapPoint,
  type StepKind,
  type View,
} from './model';
import styles from './JourneyMap.module.css';


type Region = JourneyRegion | 'all';
type Tab = 'see' | 'plan' | 'car';
type Shield = { ref: string; kind: string; x: number; y: number };

const C = {
  vi: {
    mapLabel: 'Bản đồ điểm đến của HTH ở miền Nam, tâm là TP. Hồ Chí Minh',
    filter: 'Lọc theo vùng',
    index: 'Danh sách điểm đến',
    layers: 'Lớp bản đồ',
    layerTerrain: 'Địa hình',
    layerRoads: 'Đường',
    layerSights: 'Điểm tham quan',
    tour: 'Dạo một vòng',
    resetHcm: 'Về TP.HCM',
    view: 'Kiểu xem',
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
    legendMotorway: 'Cao tốc',
    legendTrunk: 'Quốc lộ',
    legendPeak: 'Đỉnh núi',
    legendSight: 'Điểm tham quan, sân bay',
    hint: 'Chạm vào một điểm trên bản đồ. Kéo để di chuyển, Ctrl + cuộn hoặc nhấp đúp để phóng to.',
    wheelHint: 'Giữ Ctrl và cuộn để phóng to bản đồ',
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
  },
  en: {
    mapLabel: 'Map of HTH destinations in southern Vietnam, centred on Ho Chi Minh City',
    filter: 'Filter by region',
    index: 'List of destinations',
    layers: 'Map layers',
    layerTerrain: 'Terrain',
    layerRoads: 'Roads',
    layerSights: 'Sights',
    tour: 'Take the tour',
    resetHcm: 'Back to HCMC',
    view: 'View',
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
    legendMotorway: 'Expressway',
    legendTrunk: 'National road',
    legendPeak: 'Summit',
    legendSight: 'Sights and airports',
    hint: 'Tap a place on the map. Drag to move; Ctrl + scroll or double-click to zoom.',
    wheelHint: 'Hold Ctrl and scroll to zoom the map',
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
  },
} as const;

const TOUR_MS = 7000;
const TIER_ZOOM = { 1: 0, 2: 1.6, 3: 2.6 } as const;
const PANEL_W = 440;

const ANCHOR: Record<string, { dx: number; dy: number; a: 'start' | 'middle' | 'end' }> = {
  n: { dx: 0, dy: -12, a: 'middle' },
  s: { dx: 0, dy: 21, a: 'middle' },
  e: { dx: 11, dy: 4.5, a: 'start' },
  w: { dx: -11, dy: 4.5, a: 'end' },
  ne: { dx: 8, dy: -9, a: 'start' },
  nw: { dx: -8, dy: -9, a: 'end' },
  se: { dx: 8, dy: 17, a: 'start' },
  sw: { dx: -8, dy: 17, a: 'end' },
};

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

const pad2 = (n: number) => String(n).padStart(2, '0');

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

export default function JourneyStage({
  locale = 'vi',
  shields,
  children,
}: {
  locale?: Locale;
  shields: Shield[];
  children: React.ReactNode;
}) {
  const c = C[locale];
  const en = locale === 'en';
  const reduced = usePrefersReducedMotion();

  const frameRef = useRef<HTMLDivElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const carRef = useRef<SVGAnimateMotionElement | null>(null);

  const [size, setSize] = useState({ w: 1200, h: 760 });
  const wide = size.w >= 1000;
  const aspect = size.w / size.h;
  const aspectRef = useRef(aspect);
  aspectRef.current = aspect;

  // The parts of the frame covered by overlays; the camera frames around them.
  const insets: Insets = useMemo(() => {
    if (!size.w || !size.h) return NO_INSETS;
    if (wide) {
      // The toolbar and rail sit at the left; the far north and south of the
      // network are on the right, so they only need a light vertical inset.
      return { l: 0.01, r: (PANEL_W + 24) / size.w, t: Math.min(0.17, 108 / size.h), b: Math.min(0.1, 64 / size.h) };
    }
    return { l: 0, r: 0, t: 108 / size.h, b: 28 / size.h };
  }, [size.w, size.h, wide]);
  const insetsRef = useRef(insets);
  insetsRef.current = insets;

  const [view, setView] = useState<View>(() => homeView(1200 / 760));
  const viewRef = useRef<View>(view);
  const flight = useRef(0);

  const [active, setActive] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [hoverPin, setHoverPin] = useState<string | null>(null);
  const [focusPin, setFocusPin] = useState<string | null>(null);
  const [region, setRegion] = useState<Region>('all');
  const [touring, setTouring] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [introDone, setIntroDone] = useState(false);
  const [onScreen, setOnScreen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [wheelHint, setWheelHint] = useState(false);
  const [tab, setTab] = useState<Tab>('see');
  const [group, setGroup] = useState(4);
  const [roundTrip, setRoundTrip] = useState(true);
  const [layers, setLayers] = useState({ terrain: true, roads: true, sights: true });
  const is3d = false;

  const u = view.w / Math.max(size.w, 1);
  const home = useMemo(() => homeView(aspect, insets), [aspect, insets]);
  const zoom = home.w / view.w;
  const zoomed = zoom > 1.06;

  const visible = useMemo(() => points.filter((p) => region === 'all' || p.j.region === region), [region]);
  const visibleIds = useMemo(() => new Set(visible.map((p) => p.j.id)), [visible]);
  const activePoint = active ? pointById[active] : null;
  const activePins: (string | null)[] = activePoint ? activePoint.extra.pins : [];

  /* ---------------------------------------------------------------- camera */

  const applyView = useCallback((v: View) => {
    viewRef.current = v;
    setView(v);
  }, []);

  const flyTo = useCallback(
    (target: View, ms = 1100) => {
      cancelAnimationFrame(flight.current);
      const from = viewRef.current;
      const to = clampView(target, aspectRef.current);
      if (reduced || ms <= 0) { applyView(to); return; }
      const dist = Math.hypot(to.x - from.x, to.y - from.y) + Math.abs(to.w - from.w);
      const duration = Math.min(Math.max(ms * (0.55 + dist / 900), 650), 1500);
      const t0 = performance.now();
      const frame = (now: number) => {
        const k = Math.min((now - t0) / duration, 1);
        applyView(lerpView(from, to, easeInOut(k)));
        if (k < 1) flight.current = requestAnimationFrame(frame);
      };
      flight.current = requestAnimationFrame(frame);
    },
    [applyView, reduced],
  );

  useEffect(() => () => cancelAnimationFrame(flight.current), []);

  /* ------------------------------------------------------- size + viewport */

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    // Measure at once so the first frame is already framed correctly.
    const r = node.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) setSize({ w: Math.round(r.width), h: Math.round(r.height) });
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setSize({ w: Math.round(width), h: Math.round(height) });
    });
    ro.observe(node);
    return () => ro.disconnect();
  }, []);

  const activeRef = useRef<string | null>(null);
  const regionRef = useRef<Region>('all');
  activeRef.current = active;
  regionRef.current = region;
  useEffect(() => {
    cancelAnimationFrame(flight.current);
    const a = activeRef.current;
    applyView(a ? destinationView(pointById[a], aspect, insets) : regionView(regionRef.current, aspect, insets));
  }, [aspect, insets, applyView]);

  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    if (!('IntersectionObserver' in window)) { setRevealed(true); setOnScreen(true); return; }
    const io = new IntersectionObserver(
      ([entry]) => {
        setOnScreen(entry.isIntersecting);
        if (entry.isIntersecting && entry.intersectionRatio > 0.25) setRevealed(true);
      },
      { threshold: [0, 0.25] },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!revealed) return;
    const id = window.setTimeout(() => setIntroDone(true), reduced ? 0 : 3800);
    return () => window.clearTimeout(id);
  }, [revealed, reduced]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || typeof svg.pauseAnimations !== 'function') return;
    if (onScreen) svg.unpauseAnimations(); else svg.pauseAnimations();
  }, [onScreen]);

  // The panel is docked to the right edge; move the floating call dock off it.
  useEffect(() => {
    const root = document.documentElement;
    if (wide && onScreen) root.setAttribute('data-map-panel', '');
    else root.removeAttribute('data-map-panel');
    return () => root.removeAttribute('data-map-panel');
  }, [wide, onScreen]);

  /* -------------------------------------------------------------- actions */

  const select = useCallback(
    (id: string | null, opts: { fromTour?: boolean } = {}) => {
      if (!opts.fromTour) setTouring(false);
      setActive(id);
      setFocusPin(null);
      if (id) {
        const p = pointById[id];
        setRoundTrip(p.extra.nights === 0);
        flyTo(destinationView(p, aspectRef.current, insetsRef.current));
        if (!opts.fromTour) track('destination_opened', { destination: id });
      } else {
        flyTo(regionView(regionRef.current, aspectRef.current, insetsRef.current));
      }
    },
    [flyTo],
  );

  const chooseRegion = useCallback(
    (r: Region) => {
      setTouring(false);
      setRegion(r);
      setActive((a) => (a && (r === 'all' || pointById[a].j.region === r) ? a : null));
      setFocusPin(null);
      flyTo(regionView(r, aspectRef.current, insetsRef.current));
    },
    [flyTo],
  );

  /** Back to the overview, centred on Ho Chi Minh City, with every filter cleared. */
  const resetAll = useCallback(() => {
    setTouring(false);
    setRegion('all');
    setActive(null);
    setFocusPin(null);
    flyTo(regionView('all', aspectRef.current, insetsRef.current));
  }, [flyTo]);

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

  const zoomAt = useCallback(
    (f: number, cx?: number, cy?: number, ms = 480) => {
      setTouring(false);
      const v = viewRef.current;
      const px = cx ?? v.x + v.w / 2;
      const py = cy ?? v.y + v.h / 2;
      const w = v.w / f;
      const h = v.h / f;
      flyTo({ x: px - ((px - v.x) / v.w) * w, y: py - ((py - v.y) / v.h) * h, w, h }, ms);
    },
    [flyTo],
  );

  const showPin = useCallback(
    (pin: string | null) => {
      const pt = pinPoint(pin);
      if (!pt || !pin) return;
      setTouring(false);
      setFocusPin(pin);
      flyTo(pinView(pt, aspectRef.current, insetsRef.current));
    },
    [flyTo],
  );

  /* ----------------------------------------------------------------- tour */

  useEffect(() => {
    if (!touring || !onScreen) return;
    const id = window.setTimeout(() => step(1, true), active ? TOUR_MS : 300);
    return () => window.clearTimeout(id);
  }, [touring, onScreen, active, step]);

  useEffect(() => {
    if (!active || reduced) return;
    const anim = carRef.current;
    if (anim && typeof anim.beginElement === 'function') {
      try { anim.beginElement(); } catch { /* no SMIL: the car rests at the end */ }
    }
  }, [active, reduced]);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || !active) return;
    const chip = rail.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (!chip) return;
    rail.scrollTo({ left: chip.offsetLeft - rail.clientWidth / 2 + chip.clientWidth / 2, behavior: reduced ? 'auto' : 'smooth' });
  }, [active, reduced]);

  useEffect(() => {
    if (!wheelHint) return;
    const id = window.setTimeout(() => setWheelHint(false), 1400);
    return () => window.clearTimeout(id);
  }, [wheelHint]);

  /* ------------------------------------------------------------- pointer */

  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{
    x: number; y: number; view: View; moved: boolean; id: number;
    pinch?: { d: number; mx: number; my: number; view: View };
  } | null>(null);

  const toPlate = (clientX: number, clientY: number) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const v = viewRef.current;
    return {
      x: v.x + ((clientX - rect.left) / rect.width) * v.w,
      y: v.y + ((clientY - rect.top) / rect.height) * v.h,
      unit: v.w / rect.width,
    };
  };

  const pinVisible = (id: string, dest: string) => {
    if (activePins.includes(id)) return true;
    if (active && dest === active) return true;
    if (dest === 'saigon') return zoom >= 4;
    return zoom >= 2.2;
  };

  type Hit = { id: string; d: number; type: 'dest' | 'origin' | 'pin' };
  const near = (x: number, y: number, unit: number, radius: number): Hit[] => {
    const hits: Hit[] = [];
    const od = Math.hypot(origin.x - x, origin.y - y) / unit;
    if (od < radius) hits.push({ id: 'origin', d: od, type: 'origin' });
    for (const p of visible) {
      const d = Math.hypot(p.x - x, p.y - y) / unit;
      if (d < radius) hits.push({ id: p.j.id, d, type: 'dest' });
    }
    if (layers.sights) {
      for (const l of landmarks) {
        if (!pinVisible(l.id, l.destination)) continue;
        const d = Math.hypot(l.x - x, l.y - y) / unit;
        if (d < radius * 0.85) hits.push({ id: l.id, d: d + 2, type: 'pin' });
      }
    }
    return hits.sort((a, b) => a.d - b.d);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    setRevealed(true);
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2 && zoomed) {
      const [a, b] = [...pointers.current.values()];
      const m = toPlate((a.x + b.x) / 2, (a.y + b.y) / 2);
      cancelAnimationFrame(flight.current);
      gesture.current = {
        x: e.clientX, y: e.clientY, view: viewRef.current, moved: true, id: e.pointerId,
        pinch: { d: Math.hypot(a.x - b.x, a.y - b.y), mx: m.x, my: m.y, view: viewRef.current },
      };
      return;
    }
    gesture.current = { x: e.clientX, y: e.clientY, view: viewRef.current, moved: false, id: e.pointerId };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;

    if (g?.pinch && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const f = Math.hypot(a.x - b.x, a.y - b.y) / Math.max(g.pinch.d, 1);
      const v0 = g.pinch.view;
      const w = v0.w / f;
      const h = v0.h / f;
      applyView(clampView({
        x: g.pinch.mx - ((g.pinch.mx - v0.x) / v0.w) * w,
        y: g.pinch.my - ((g.pinch.my - v0.y) / v0.h) * h,
        w, h,
      }, aspectRef.current));
      return;
    }

    if (g && zoomed && pointers.current.size === 1) {
      const dx = e.clientX - g.x;
      const dy = e.clientY - g.y;
      if (!g.moved && Math.hypot(dx, dy) > 5) {
        g.moved = true;
        setDragging(true);
        setTouring(false);
        cancelAnimationFrame(flight.current);
        svgRef.current?.setPointerCapture(g.id);
      }
      if (g.moved) {
        const rect = svgRef.current!.getBoundingClientRect();
        const k = g.view.w / rect.width;
        applyView(clampView({ ...g.view, x: g.view.x - dx * k, y: g.view.y - dy * k }, aspectRef.current));
        return;
      }
    }

    if (e.pointerType === 'mouse' && !g) {
      const { x, y, unit } = toPlate(e.clientX, e.clientY);
      const hit = near(x, y, unit, 16)[0];
      setHover(hit && hit.type !== 'pin' && hit.type !== 'origin' ? hit.id : null);
      setHoverPin(hit && hit.type === 'pin' ? hit.id : null);
    }
  };

  const endPointer = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    const g = gesture.current;
    if (pointers.current.size > 0) return;
    gesture.current = null;
    if (dragging) setDragging(false);
    if (!g || g.moved || g.pinch) return;

    const { x, y, unit } = toPlate(e.clientX, e.clientY);
    const hits = near(x, y, unit, e.pointerType === 'mouse' ? 16 : 24);
    if (!hits.length) return;

    // Several places under one finger: zoom into them instead of guessing.
    const crowded = hits.filter((h) => h.d < 28 && h.type !== 'pin');
    if (crowded.length > 2 && zoom < 3.4) {
      setTouring(false);
      const pts = crowded.map((h) => (h.id === 'origin' ? origin : pointById[h.id]));
      flyTo(fitView(pts, aspectRef.current, { edge: 0.25, minW: 90, insets: insetsRef.current }));
      return;
    }
    const top = hits[0];
    if (top.type === 'origin') select(null);
    else if (top.type === 'dest') select(top.id);
    else {
      const l = landmarkById[top.id];
      if (l && l.destination !== active && pointById[l.destination]) {
        select(l.destination);
        setTab('see');
      }
      showPin(top.id);
    }
  };

  const onWheel = (e: React.WheelEvent) => {
    if (!(e.ctrlKey || e.metaKey)) { setWheelHint(true); return; }
    const { x, y } = toPlate(e.clientX, e.clientY);
    zoomAt(e.deltaY < 0 ? 1.35 : 1 / 1.35, x, y, 260);
  };

  // React attaches wheel listeners as passive; Ctrl+wheel must cancel the browser's page zoom.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const stop = (e: WheelEvent) => { if (e.ctrlKey || e.metaKey) e.preventDefault(); };
    svg.addEventListener('wheel', stop, { passive: false });
    return () => svg.removeEventListener('wheel', stop);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const tag = (e.target as HTMLElement).tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (e.key === 'Escape' && active) { e.preventDefault(); select(null); }
    else if (e.key === '+' || e.key === '=') zoomAt(1.5);
    else if (e.key === '-') zoomAt(1 / 1.5);
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

  const name = (p: MapPoint) => (en ? p.j.name.en : p.j.name.vi);
  const t = (x: { vi: string; en: string }) => (en ? x.en : x.vi);

  const originCard = () => (
    <div className={styles.card} key="origin">
      <div className={styles.cardTop}>
        <span className="label">{c.start}</span>
      </div>
      <div className={styles.scroll}>
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
            <li><span className={styles.symMotorway} aria-hidden="true" />{c.legendMotorway}</li>
            <li><span className={styles.symTrunk} aria-hidden="true" />{c.legendTrunk}</li>
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
          <h3 className={`${styles.cardTitle} ${styles.in}`} style={{ ['--i' as string]: 0 }}>{displayName}</h3>
          <p className={`${styles.area} ${styles.in}`} style={{ ['--i' as string]: 1 }}>{t(j.area)}</p>
          <p className={`${styles.tagline} ${styles.in}`} style={{ ['--i' as string]: 1 }}>{t(j.tagline)}</p>

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
                  const has = Boolean(pinPoint(pin));
                  return (
                    <li
                      key={i}
                      className={styles.in}
                      style={{ ['--i' as string]: 1 + i }}
                      onMouseEnter={() => { if (has) setFocusPin(pin); }}
                      onMouseLeave={() => setFocusPin(null)}
                    >
                      <span className={styles.hlNum} data-pin={has}>{i + 1}</span>
                      <div>
                        <h4>{t(h.title)}</h4>
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
                          {s.kind === 'see' && pinPoint(s.pin ?? null) ? (
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
          onMouseEnter={() => setHover(p.j.id)}
          onMouseLeave={() => setHover(null)}
          onFocus={() => setHover(p.j.id)}
          onBlur={() => setHover(null)}
        >
          <span className={styles.chipNum}>{pad2(p.index)}</span>
          {name(p)}
        </button>
      ))}
    </div>
  );

  /* -------------------------------------------------------------- render */

  const bar = scaleBar(u);

  return (
    <div
      className={`${styles.stage} ${revealed ? styles.revealed : ''} ${introDone ? styles.introDone : ''} ${onScreen ? '' : styles.paused} ${wide ? styles.wide : ''}`}
      onKeyDown={onKeyDown}
      onFocus={() => setRevealed(true)}
    >
      <div
        ref={frameRef}
        className={`${styles.frame} ${zoomed && !is3d ? styles.frameZoomed : ''} ${dragging ? styles.frameDragging : ''} ${(hover || hoverPin) && !is3d ? styles.frameHot : ''}`}
        data-terrain={layers.terrain}
        data-roads={layers.roads}
      >
        <svg
          ref={svgRef}
          className={styles.svg}
          viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
          preserveAspectRatio="xMidYMid slice"
          role="img"
          aria-label={c.mapLabel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endPointer}
          onPointerCancel={(e) => { pointers.current.delete(e.pointerId); gesture.current = null; setDragging(false); }}
          onPointerLeave={(e) => { if (e.pointerType === 'mouse') { setHover(null); setHoverPin(null); } }}
          onWheel={onWheel}
          onDoubleClick={(e) => { const { x, y } = toPlate(e.clientX, e.clientY); zoomAt(1.8, x, y); }}
        >
          <defs>
            <radialGradient id="jm-glow">
              <stop offset="0" stopColor="#D69E4A" stopOpacity="0.6" />
              <stop offset="1" stopColor="#D69E4A" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect x={-2000} y={-2000} width={5200} height={4900} className={styles.seaFill} />

          <g className={styles.graticule} aria-hidden="true">
            {graticule.lons.map((l) => (
              <line key={l.lon} x1={l.x} x2={l.x} y1={0} y2={890} strokeWidth={0.7 * u} />
            ))}
            {graticule.lats.map((l) => (
              <line key={l.lat} x1={0} x2={1200} y1={l.y} y2={l.y} strokeWidth={0.7 * u} />
            ))}
          </g>

          {children}

          <g aria-hidden="true">
            {islands.map((i) => (
              <text key={i.vi} x={i.x} y={i.y + 16 * u} fontSize={10.5 * u} className={styles.island} textAnchor="middle" strokeWidth={3 * u}>
                {en ? i.en : i.vi}
              </text>
            ))}
          </g>

          {layers.roads && zoom >= 1.35 ? (
            <g aria-hidden="true" className={styles.shields}>
              {shields.map((s) => {
                const w = (s.ref.length * 6.2 + 8) * u;
                const h = 13 * u;
                return (
                  <g key={s.ref} transform={`translate(${s.x} ${s.y})`}>
                    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={2 * u} className={s.ref.startsWith('CT') ? styles.shieldCt : styles.shield} strokeWidth={0.8 * u} />
                    <text y={3.4 * u} fontSize={9 * u} textAnchor="middle">{s.ref}</text>
                  </g>
                );
              })}
            </g>
          ) : null}

          {zoom >= 1.4 ? (
            <g aria-hidden="true" className={styles.towns}>
              {towns.map((tw) => (
                <g key={tw.vi} transform={`translate(${tw.x} ${tw.y})`}>
                  <circle r={1.8 * u} />
                  <text x={5 * u} y={3.5 * u} fontSize={10 * u} strokeWidth={3 * u}>{en ? tw.en : tw.vi}</text>
                </g>
              ))}
            </g>
          ) : null}

          <g aria-hidden="true" className={styles.peaks}>
            {peaks.map((pk) => {
              const pinned = activePins.includes(`peak:${pk.id}`);
              return (
                <g key={pk.id} transform={`translate(${pk.x} ${pk.y})`} data-focus={focusPin === `peak:${pk.id}` || pinned}>
                  <path d={`M0 ${-5.5 * u}L${5 * u} ${3 * u}H${-5 * u}Z`} strokeWidth={0.9 * u} />
                  {zoom >= 1.25 || pinned ? (
                    <text y={15 * u} fontSize={10 * u} textAnchor="middle" strokeWidth={3 * u}>
                      {en ? pk.en : pk.vi}{' '}
                      <tspan className={styles.peakHeight}>{pk.height.toLocaleString(en ? 'en-US' : 'vi-VN')} m</tspan>
                    </text>
                  ) : null}
                </g>
              );
            })}
          </g>

          <g className={styles.routes} aria-hidden="true">
            {points.map((p) => {
              const inRegion = visibleIds.has(p.j.id);
              const state =
                p.j.id === active ? 'active'
                  : p.j.id === hover ? 'hot'
                    : !inRegion || active ? 'dim'
                      : 'idle';
              return (
                <path
                  key={p.j.id}
                  id={`jm-route-${p.j.id}`}
                  d={p.path}
                  pathLength={1}
                  className={styles.route}
                  data-state={state}
                  strokeWidth={(state === 'hot' ? 4 : 2.2) * u}
                  style={{
                    ['--rc' as string]: REGION_COLOR[p.j.region],
                    ...(introDone ? {} : { transitionDelay: `${0.4 + p.rank * 0.06}s` }),
                  }}
                />
              );
            })}
          </g>

          {!reduced && revealed ? (
            <g className={styles.traffic} aria-hidden="true">
              {points.map((p) => {
                if (!visibleIds.has(p.j.id) || p.j.id === active) return null;
                const dur = `${(3 + p.length / 80).toFixed(2)}s`;
                const begin = `${(-(p.rank * 0.71) % 6).toFixed(2)}s`;
                return (
                  <circle key={p.j.id} r={2.6 * u} className={styles.particle} strokeWidth={1.4 * u} style={{ ['--rc' as string]: REGION_COLOR[p.j.region] }}>
                    <animateMotion dur={dur} begin={begin} repeatCount="indefinite" calcMode="linear">
                      <mpath href={`#jm-route-${p.j.id}`} />
                    </animateMotion>
                    <animate attributeName="opacity" values="0;0.95;0.95;0" keyTimes="0;0.1;0.85;1" dur={dur} begin={begin} repeatCount="indefinite" />
                  </circle>
                );
              })}
            </g>
          ) : null}

          {activePoint ? (
            <g key={activePoint.j.id} aria-hidden="true" style={{ ['--rc' as string]: REGION_COLOR[activePoint.j.region] }}>
              <path d={activePoint.path} className={styles.activeGlow} strokeWidth={9 * u} pathLength={1} />
              <path d={activePoint.path} className={styles.activeLine} strokeWidth={5 * u} pathLength={1} />
              {!reduced ? (
                <g>
                  <circle r={7.5 * u} className={styles.carHalo} />
                  <circle r={4.6 * u} className={styles.carCore} strokeWidth={2.4 * u} />
                  <animateMotion
                    ref={carRef}
                    dur={`${Math.min(Math.max(activePoint.length / 220, 1.2), 2.6).toFixed(2)}s`}
                    begin="indefinite"
                    fill="freeze"
                    calcMode="spline"
                    keyPoints="0;1"
                    keyTimes="0;1"
                    keySplines="0.45 0 0.2 1"
                    path={activePoint.path}
                  />
                </g>
              ) : null}
            </g>
          ) : null}

          {layers.sights ? (
            <g aria-hidden="true">
              {landmarks.map((l) => {
                if (!pinVisible(l.id, l.destination)) return null;
                const pinIndex = activePins.indexOf(l.id);
                const mine = pinIndex >= 0;
                const hot = hoverPin === l.id || focusPin === l.id;
                const own = active === l.destination;
                const showLabel = hot || (mine && zoom >= 2.4) || (!active && zoom >= 5.5) || (own && zoom >= 5.5);
                return (
                  <g
                    key={l.id}
                    transform={`translate(${l.x} ${l.y})`}
                    className={styles.sight}
                    data-kind={l.kind}
                    data-mine={mine}
                    data-hot={hot}
                    data-quiet={Boolean(active) && !mine && !own}
                    style={activePoint ? { ['--rc' as string]: REGION_COLOR[activePoint.j.region] } : undefined}
                  >
                    <circle r={(mine ? 9.5 : 7.5) * u} className={styles.sightDisc} strokeWidth={1 * u} />
                    {mine ? (
                      <text y={3.6 * u} fontSize={10 * u} textAnchor="middle" className={styles.sightNum}>{pinIndex + 1}</text>
                    ) : (
                      <path d={ICON[l.kind]} transform={`scale(${0.95 * u})`} className={styles.sightIcon} strokeWidth={1.1} />
                    )}
                    {showLabel ? (
                      <text x={13 * u} y={4 * u} fontSize={(mine ? 11.5 : 10.5) * u} className={styles.sightLabel} strokeWidth={3.2 * u}>
                        {en ? l.en : l.vi}
                      </text>
                    ) : null}
                  </g>
                );
              })}
            </g>
          ) : null}

          <g transform={`translate(${origin.x} ${origin.y})`} className={styles.origin} aria-hidden="true">
            <circle r={18 * u} className={styles.pulse} />
            <circle r={18 * u} className={`${styles.pulse} ${styles.pulseLate}`} />
            <path
              d={`M0 0C${-2.4 * u} ${-7 * u} ${-10 * u} ${-10 * u} ${-10 * u} ${-18 * u}A${10 * u} ${10 * u} 0 1 1 ${10 * u} ${-18 * u}C${10 * u} ${-10 * u} ${2.4 * u} ${-7 * u} 0 0Z`}
              className={styles.originPin}
              strokeWidth={1.6 * u}
            />
            <circle cy={-18 * u} r={3.8 * u} className={styles.originDot} />
            {zoom < 4 ? (
              <text x={13 * u} y={-16 * u} fontSize={14 * u} className={styles.originLabel} strokeWidth={4.5 * u}>
                {en ? originInfo.name.en : originInfo.name.vi}
              </text>
            ) : null}
          </g>

          <g aria-hidden="true">
            {points.map((p) => {
              const id = p.j.id;
              const inRegion = visibleIds.has(id);
              const isActive = id === active;
              const isHot = id === hover;
              const showLabel = inRegion && (isActive || isHot || zoom >= TIER_ZOOM[p.j.tier]);
              const an = ANCHOR[p.j.anchor];
              return (
                <g
                  key={id}
                  transform={`translate(${p.x} ${p.y})`}
                  className={styles.marker}
                  data-state={isActive ? 'active' : isHot ? 'hot' : inRegion ? 'idle' : 'dim'}
                  style={{
                    ['--rc' as string]: REGION_COLOR[p.j.region],
                    ...(introDone ? {} : { ['--d' as string]: `${1 + p.rank * 0.06}s` }),
                  } as React.CSSProperties}
                >
                  {isActive ? (
                    <>
                      <circle r={14 * u} className={styles.ring} strokeWidth={1.4 * u} />
                      <path
                        d={`M0 0C${-2 * u} ${-6 * u} ${-8.5 * u} ${-8.5 * u} ${-8.5 * u} ${-15.5 * u}A${8.5 * u} ${8.5 * u} 0 1 1 ${8.5 * u} ${-15.5 * u}C${8.5 * u} ${-8.5 * u} ${2 * u} ${-6 * u} 0 0Z`}
                        className={styles.pin}
                        strokeWidth={1.6 * u}
                      />
                      <circle cy={-15.5 * u} r={3.2 * u} className={styles.pinDot} />
                    </>
                  ) : (
                    <circle r={5.2 * u} className={styles.dot} strokeWidth={2 * u} />
                  )}
                  <text
                    x={(isActive ? 0 : an.dx) * u}
                    y={(isActive ? -30 : an.dy) * u}
                    textAnchor={isActive ? 'middle' : an.a}
                    fontSize={(isActive ? 15 : 12.5) * u}
                    strokeWidth={4 * u}
                    className={styles.label}
                    data-show={showLabel}
                  >
                    {name(p)}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>


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
              onClick={() => setTouring((v) => !v)}
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
            <button type="button" className={styles.ghostBtn} onClick={surprise}>{c.surprise}</button>
            <button type="button" className={styles.resetBtn} onClick={resetAll}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"><circle cx="6" cy="6" r="4.3" stroke="currentColor" strokeWidth="1.3" /><circle cx="6" cy="6" r="1.6" fill="currentColor" /></svg>
              {c.resetHcm}
            </button>
            <div className={styles.layerToggles} role="group" aria-label={c.layers} hidden={is3d}>
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
          </div>
        </div>

        <div className={styles.mapControls}>
          <div className={styles.scale} aria-hidden="true" hidden={is3d}>
            <span className={styles.scaleBar} style={{ width: bar.px }} />
            <span>{bar.km} km</span>
          </div>
          <div className={styles.zoomControls}>
            <button type="button" onClick={() => zoomAt(1.6)} aria-label={c.zoomIn}>
              <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.4" /></svg>
            </button>
            <button type="button" onClick={() => zoomAt(1 / 1.6)} aria-label={c.zoomOut} disabled={!is3d && !zoomed}>
              <svg width="12" height="12" viewBox="0 0 12 12"><path d="M1 6h10" stroke="currentColor" strokeWidth="1.4" /></svg>
            </button>
            <button type="button" onClick={resetAll} aria-label={c.resetHcm}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 4V1h3M8 1h3v3M11 8v3H8M4 11H1V8" stroke="currentColor" strokeWidth="1.3" /></svg>
            </button>
          </div>
        </div>

        {wheelHint ? <div className={styles.wheelHint} role="status">{c.wheelHint}</div> : null}

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
          <aside ref={panelRef} className={styles.panel} aria-live="polite">
            {panelBody()}
          </aside>
        ) : null}
      </div>

      {!wide ? (
        <>
          {rail}
          <aside ref={panelRef} className={styles.panel} aria-live="polite">
            {panelBody()}
          </aside>
        </>
      ) : null}
    </div>
  );
}
