import { journeys, originInfo, type Journey, type JourneyRegion } from '@/data/journeys';
import { extras, type JourneyExtra } from '@/data/journeyExtras';
import drivesData from '@/data/journey/drives.json';
import landmarksData from '@/data/journey/landmarks.json';
import peaksData from '@/data/journey/peaks.json';
import { mainPlate, project, kmPerUnit } from '@/lib/atlas/projection';
import { fare, legFor, places, typicalMinutes, type Place, type VehicleKey } from '@/lib/quote';

/**
 * Geometry, figures and trip planning for the journey map. Pure functions.
 *
 * Positions are plate units (1200 × 890, spherical Mercator over
 * 103.55–110°E, 8.3–13°N). The land, terrain image, roads and landmarks were
 * all projected onto the same plate by scripts/journey/*.py.
 */

export interface View { x: number; y: number; w: number; h: number }
export interface Insets { l: number; r: number; t: number; b: number }

export const PLATE = { w: 1200, h: 890 };
export const NO_INSETS: Insets = { l: 0, r: 0, t: 0, b: 0 };

/** One colour per region (teal, emerald, jade, champagne, slate), for markers, routes, chips and the key. */
export const REGION_COLOR: Record<JourneyRegion, string> = {
  coast: '#1d6f80',
  highlands: '#2e7a52',
  mekong: '#6f8a2c',
  nearby: '#b07d2a',
  business: '#4a5a6e',
}

const r1 = (n: number) => Math.round(n * 10) / 10;

type Text = { vi: string; en: string };

/* -------------------------------------------------------------------------- */
/* Points and driving lines                                                    */
/* -------------------------------------------------------------------------- */

const [ox, oy] = project(mainPlate, originInfo.coordinates);
export const origin = { x: r1(ox), y: r1(oy) };

const drives = drivesData.drives as Record<string, { d: string; km: number; len: number }>;

export interface MapPoint {
  j: Journey;
  x: number;
  y: number;
  index: number;
  /** Road line from District 1, SVG path in plate units. */
  path: string;
  /** Path length in plate units. */
  length: number;
  /** Order in the opening sequence, nearest first. */
  rank: number;
  extra: JourneyExtra;
}

const unranked: MapPoint[] = journeys.map((j, i) => {
  const [x, y] = project(mainPlate, j.coordinates);
  const drive = drives[j.id];
  return {
    j,
    index: i + 1,
    x: r1(x),
    y: r1(y),
    path: drive?.d ?? `M${origin.x} ${origin.y}L${r1(x)} ${r1(y)}`,
    length: drive?.len ?? Math.hypot(x - origin.x, y - origin.y),
    rank: 0,
    extra: extras[j.id],
  };
});
[...unranked].sort((a, b) => a.length - b.length).forEach((p, i) => { p.rank = i; });

export const points = unranked;
export const pointById = Object.fromEntries(points.map((p) => [p.j.id, p])) as Record<string, MapPoint>;

/* -------------------------------------------------------------------------- */
/* Landmarks, peaks, towns                                                     */
/* -------------------------------------------------------------------------- */

export type LandmarkKind =
  | 'beach' | 'temple' | 'monument' | 'nature' | 'market' | 'airport' | 'park'
  | 'golf' | 'industry' | 'farm' | 'craft' | 'ferry' | 'food';

export interface Landmark {
  id: string;
  destination: string;
  kind: LandmarkKind;
  vi: string;
  en: string;
  x: number;
  y: number;
}

export const landmarks = landmarksData.landmarks as Landmark[];
export const landmarkById = Object.fromEntries(landmarks.map((l) => [l.id, l])) as Record<string, Landmark>;

export interface Peak { id: string; vi: string; en: string; height: number; x: number; y: number }
export const peaks = peaksData.peaks as Peak[];
const peakById = Object.fromEntries(peaks.map((p) => [p.id, p])) as Record<string, Peak>;

/** Resolve a highlight pin ('peak:langbiang' or a landmark id) to a position. */
export function pinPoint(id: string | null): { x: number; y: number } | null {
  if (!id) return null;
  if (id.startsWith('peak:')) return peakById[id.slice(5)] ?? null;
  return landmarkById[id] ?? null;
}

/** Reference towns, for orientation only. Coordinates from Wikipedia infoboxes. */
const townList: [string, string, number, number][] = [
  ['Phnom Penh', 'Phnom Penh', 104.9282, 11.5564],
  ['Long Xuyên', 'Long Xuyen', 105.4352, 10.3864],
  ['Hà Tiên', 'Ha Tien', 104.4875, 10.3831],
  ['Sóc Trăng', 'Soc Trang', 105.9739, 9.6025],
  ['Trà Vinh', 'Tra Vinh', 106.3453, 9.9347],
  ['Bạc Liêu', 'Bac Lieu', 105.7244, 9.285],
  ['Cao Lãnh', 'Cao Lanh', 105.6329, 10.4602],
  ['Long Khánh', 'Long Khanh', 107.2421, 10.9396],
  ['Bà Rịa', 'Ba Ria', 107.1685, 10.4963],
  ['Gia Nghĩa', 'Gia Nghia', 107.6936, 11.9963],
  ['Đồng Xoài', 'Dong Xoai', 106.8994, 11.5349],
  ['Cam Ranh', 'Cam Ranh', 109.1591, 11.9214],
];
export const towns = townList.map(([vi, en, lon, lat]) => {
  const [x, y] = project(mainPlate, [lon, lat]);
  return { vi, en, x: r1(x), y: r1(y) };
});

const islandList: [string, string, number, number][] = [
  ['Côn Đảo', 'Con Dao', 106.6067, 8.6833],
  ['Phú Quốc', 'Phu Quoc', 103.9667, 10.2167],
  ['Nam Du', 'Nam Du', 104.355, 9.678],
];
export const islands = islandList.map(([vi, en, lon, lat]) => {
  const [x, y] = project(mainPlate, [lon, lat]);
  return { vi, en, x: r1(x), y: r1(y) };
});

/* -------------------------------------------------------------------------- */
/* Figures: distance, time                                                     */
/* -------------------------------------------------------------------------- */

const placeById = Object.fromEntries(places.map((p) => [p.id, p])) as Record<string, Place>;
const start = placeById.q1;

export interface Figures {
  km: number;
  minutes: number;
  /** HTH has driven and timed this leg. Otherwise the road distance comes from
   *  OpenStreetMap routing and the time from HTH's traffic model. */
  measured: boolean;
  place: Place | undefined;
}

export const figures: Record<string, Figures> = Object.fromEntries(
  journeys.map((j) => {
    const place = placeById[j.placeId];
    const road = drives[j.id]?.km;
    if (place && start) {
      const leg = legFor(start, place);
      if (leg.measured) return [j.id, { km: leg.km, minutes: leg.minutes, measured: true, place }];
      const km = road ?? leg.km;
      return [j.id, { km, minutes: typicalMinutes(km), measured: false, place }];
    }
    const km = road ?? 0;
    return [j.id, { km, minutes: typicalMinutes(km), measured: false, place }];
  }),
);

export const farthest = journeys.reduce((a, b) => (figures[b.id].km > figures[a.id].km ? b : a));

/* -------------------------------------------------------------------------- */
/* Vehicles by group size                                                      */
/* -------------------------------------------------------------------------- */

export interface VehicleOption {
  key: Exclude<VehicleKey, 'auto'>;
  count: number;
  /** Why this one, in a line. */
  why: Text;
}

export function vehiclesFor(n: number): VehicleOption[] {
  if (n <= 3) {
    return [
      { key: 'carnival', count: 1, why: { vi: 'Rộng chân, chở được 4 vali lớn', en: 'Legroom, and room for four large cases' } },
      { key: 'bmw', count: 1, why: { vi: 'Sedan cho chuyến công tác, 2 vali lớn', en: 'A sedan for business, two large cases' } },
    ];
  }
  if (n <= 6) {
    return [{ key: 'carnival', count: 1, why: { vi: 'Ghế thương gia hàng hai, 4 vali lớn', en: 'Captain seats in row two, four large cases' } }];
  }
  if (n <= 9) {
    return [
      { key: 'solati', count: 1, why: { vi: 'Ghế da ngả sâu, khoang hành lý riêng 5 vali', en: 'Reclining leather seats, a separate hold for five cases' } },
      { key: 'transitdcar', count: 1, why: { vi: 'Khoang rộng, cốp sâu vừa bốn bộ gậy golf', en: 'A wide cabin; four golf bags fit in the back' } },
    ];
  }
  if (n <= 12) {
    return [{ key: 'solati', count: 1, why: { vi: 'Tối đa 12 khách, hành lý gọn', en: 'Up to twelve, with light luggage' } }];
  }
  if (n <= 16) {
    return [{ key: 'transit16', count: 1, why: { vi: '16 chỗ, khoảng 10 vali cỡ vừa', en: 'Sixteen seats, around ten medium cases' } }];
  }
  if (n <= 45) {
    return [{ key: 'bus45', count: 1, why: { vi: 'Ghế ngả, khoang hành lý dưới sàn, micro cho hướng dẫn viên', en: 'Reclining seats, under-floor hold, a PA for the guide' } }];
  }
  if (n <= 90) {
    return [{ key: 'bus45', count: 2, why: { vi: 'Hai xe, một điều phối viên cho cả đoàn', en: 'Two coaches, one coordinator for the group' } }];
  }
  return [];
}

export function priceFor(km: number, option: VehicleOption, roundTrip: boolean) {
  const f = fare(km, option.key, roundTrip);
  return { low: f.low * option.count, high: f.high * option.count };
}

export const groupPresets: { n: number; label: Text }[] = [
  { n: 2, label: { vi: 'Cặp đôi', en: 'Couple' } },
  { n: 4, label: { vi: 'Gia đình 4', en: 'Family of 4' } },
  { n: 7, label: { vi: 'Đại gia đình', en: 'Big family' } },
  { n: 12, label: { vi: 'Nhóm bạn', en: 'Friends' } },
  { n: 25, label: { vi: 'Công ty', en: 'Company' } },
  { n: 45, label: { vi: 'Đoàn lớn', en: 'Large group' } },
];

/* -------------------------------------------------------------------------- */
/* Suggested itinerary                                                         */
/* -------------------------------------------------------------------------- */

export type StepKind = 'pickup' | 'break' | 'arrive' | 'see' | 'eat' | 'rest' | 'depart' | 'home';
export interface Step { at: number; kind: StepKind; text: Text; pin?: string | null }
export interface Day { day: number; steps: Step[] }

const round5 = (m: number) => Math.round(m / 5) * 5;

export function clock(minutes: number, locale: 'vi' | 'en'): string {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const h = Math.floor(m / 60);
  const mm = String(m % 60).padStart(2, '0');
  return locale === 'en' ? `${h}:${mm}` : `${String(h).padStart(2, '0')}:${mm}`;
}

export function daysLabel(nights: number, locale: 'vi' | 'en'): string {
  if (nights === 0) return locale === 'en' ? 'Day trip' : 'Đi về trong ngày';
  return locale === 'en'
    ? `${nights + 1} days, ${nights} night${nights > 1 ? 's' : ''}`
    : `${nights + 1} ngày ${nights} đêm`;
}

const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

/** A sensible plan from the drive time and the three highlights. A suggestion, not a timetable. */
export function itinerary(p: MapPoint): Day[] {
  const j = p.j;
  const f = figures[j.id];
  const x = p.extra;
  const name = j.name;
  const h = j.highlights;
  const stopName = x.stops?.length ? pointById[x.stops[0]]?.j.name : undefined;
  const see = (i: number, at: number): Step => ({ at: round5(at), kind: 'see', text: h[i].title, pin: x.pins[i] });
  const lunch: Text = x.eat
    ? { vi: `Ăn trưa: ${lower(x.eat.vi)}`, en: `Lunch: ${lower(x.eat.en)}` }
    : { vi: 'Ăn trưa', en: 'Lunch' };
  const dinner: Text = x.eat
    ? { vi: `Ăn tối: ${lower(x.eat.vi)}`, en: `Dinner: ${lower(x.eat.en)}` }
    : { vi: 'Ăn tối, nghỉ đêm', en: 'Dinner, and the night' };
  const pause: Text = stopName
    ? { vi: `Dừng nghỉ ở ${stopName.vi}`, en: `Break at ${stopName.en}` }
    : { vi: 'Dừng nghỉ, cà phê', en: 'Coffee stop' };

  if (j.trip === 'transfer') {
    const s = 8 * 60;
    return [{
      day: 1,
      steps: [
        { at: s, kind: 'pickup', text: { vi: 'Đón tại địa chỉ của Quý khách', en: 'Collected from your address' } },
        { at: round5(s + f.minutes), kind: 'arrive', text: { vi: `Đến ${name.vi}`, en: `Arrive at ${name.en}` } },
      ],
    }];
  }

  const s = f.minutes > 240 ? 6 * 60 + 30 : 7 * 60;
  const needsBreak = f.minutes > 150;
  const arriveAt = round5(s + f.minutes + (needsBreak ? 25 : 0));
  const day1: Step[] = [{ at: s, kind: 'pickup', text: { vi: 'Xe đón tại khách sạn hoặc nhà riêng', en: 'Pickup at your hotel or home' } }];
  if (needsBreak) day1.push({ at: round5(s + f.minutes / 2), kind: 'break', text: pause });
  day1.push({ at: arriveAt, kind: 'arrive', text: { vi: `Đến ${name.vi}`, en: `Arrive in ${name.en}` } });

  if (x.nights === 0) {
    const half = j.trip === 'half';
    let t = arriveAt + 10;
    let ate = false;
    for (const i of half ? [0, 1] : [0, 1, 2]) {
      if (!ate && t >= 11 * 60 + 15) {
        day1.push({ at: round5(t), kind: 'eat', text: lunch });
        t += 70;
        ate = true;
      }
      day1.push(see(i, t));
      t += half ? 75 : 95;
    }
    if (!ate) {
      t = Math.max(t, 11 * 60 + 30);
      day1.push({ at: round5(t), kind: 'eat', text: lunch });
      t += 70;
    }
    const leave = round5(Math.max(t, half ? 12 * 60 : 15 * 60));
    day1.push({ at: leave, kind: 'depart', text: { vi: 'Lên xe về', en: 'Head back' } });
    day1.push({ at: round5(leave + f.minutes), kind: 'home', text: { vi: 'Về đến nơi', en: 'Home' } });
    return [{ day: 1, steps: day1 }];
  }

  day1.push(see(0, arriveAt + 30));
  day1.push({ at: 18 * 60 + 30, kind: 'rest', text: dinner });

  if (x.nights === 1) {
    const leave = 14 * 60;
    return [
      { day: 1, steps: day1 },
      {
        day: 2,
        steps: [
          see(1, 8 * 60),
          see(2, 10 * 60),
          { at: 12 * 60, kind: 'eat', text: lunch },
          { at: leave, kind: 'depart', text: { vi: 'Trả phòng, lên xe về', en: 'Check out, head back' } },
          { at: round5(leave + f.minutes + (needsBreak ? 25 : 0)), kind: 'home', text: { vi: 'Về đến nơi', en: 'Home' } },
        ],
      },
    ];
  }

  const leave = f.minutes > 240 ? 8 * 60 : 9 * 60;
  return [
    { day: 1, steps: day1 },
    {
      day: 2,
      steps: [
        see(1, 8 * 60 + 30),
        { at: 12 * 60, kind: 'eat', text: { vi: 'Ăn trưa', en: 'Lunch' } },
        see(2, 14 * 60 + 30),
        { at: 18 * 60 + 30, kind: 'rest', text: { vi: 'Buổi tối tự do', en: 'A free evening' } },
      ],
    },
    {
      day: 3,
      steps: [
        { at: leave, kind: 'depart', text: { vi: 'Trả phòng, lên xe về', en: 'Check out, head back' } },
        ...(needsBreak ? [{ at: round5(leave + f.minutes / 2), kind: 'break' as const, text: pause }] : []),
        { at: round5(leave + f.minutes + (needsBreak ? 40 : 0)), kind: 'home', text: { vi: 'Về đến nơi', en: 'Home' } },
      ],
    },
  ];
}

/* -------------------------------------------------------------------------- */
/* Camera                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * East of 110°E and south of 8.3°N is open sea, so the camera may drift past
 * the plate there (the sea fill extends). West and north it stops at the
 * plate edge, where the land data ends.
 */
const SEA_E = 700;
const SEA_S = 420;

export function clampView(v: View, aspect: number): View {
  const w = Math.min(Math.max(v.w, 100), PLATE.w + SEA_E, (PLATE.h + SEA_S) * aspect);
  const h = w / aspect;
  const x = Math.min(Math.max(v.x, 0), PLATE.w + SEA_E - w);
  const y = Math.min(Math.max(v.y, 0), PLATE.h + SEA_S - h);
  return { x, y, w, h };
}

/**
 * Smallest view that shows every point inside the part of the frame not
 * covered by overlays (`insets`, as fractions of the frame), keeping `edge`
 * of that area clear so names beside markers are not cut.
 */
export function fitView(
  pts: { x: number; y: number }[],
  aspect: number,
  { edge = 0.15, minW = 160, insets = NO_INSETS }: { edge?: number; minW?: number; insets?: Insets } = {},
): View {
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  const y0 = Math.min(...ys), y1 = Math.max(...ys);
  const ax = Math.max(1 - insets.l - insets.r, 0.3);
  const ay = Math.max(1 - insets.t - insets.b, 0.3);
  const free = 1 - 2 * edge;
  const w = Math.max(minW / ax, (x1 - x0) / (ax * free), ((y1 - y0) / (ay * free)) * aspect);
  const h = w / aspect;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  return clampView({ x: cx - w * (insets.l + ax / 2), y: cy - h * (insets.t + ay / 2), w, h }, aspect);
}

export function homeView(aspect: number, insets: Insets = NO_INSETS): View {
  return fitView([origin, ...points], aspect, { edge: 0.04, minW: 0, insets });
}

export function regionView(region: JourneyRegion | 'all', aspect: number, insets: Insets = NO_INSETS): View {
  if (region === 'all') return homeView(aspect, insets);
  const pts = points.filter((p) => p.j.region === region);
  return fitView([origin, ...pts], aspect, { edge: 0.1, minW: 220, insets });
}

const pinsOf = (p: MapPoint) => p.extra.pins.map(pinPoint).filter(Boolean) as { x: number; y: number }[];

/** Origin, destination and the destination's pinned sights. */
export function destinationView(p: MapPoint, aspect: number, insets: Insets = NO_INSETS): View {
  return fitView([origin, p, ...pinsOf(p)], aspect, { edge: 0.12, minW: 150, insets });
}

/** Close-up on one place and its sights. */
export function sightsView(p: MapPoint, aspect: number, insets: Insets = NO_INSETS): View {
  return fitView([p, ...pinsOf(p)], aspect, { edge: 0.2, minW: 70, insets });
}

/** Close-up on a single pin. */
export function pinView(pt: { x: number; y: number }, aspect: number, insets: Insets = NO_INSETS): View {
  return fitView([pt], aspect, { edge: 0.2, minW: 130, insets });
}

/** cubic-bezier(0.77, 0, 0.175, 1): strong ease-in-out for camera moves. */
export function easeInOut(t: number): number {
  const x1 = 0.77, y1 = 0, x2 = 0.175, y2 = 1;
  const bx = (s: number) => 3 * x1 * s * (1 - s) ** 2 + 3 * x2 * s * s * (1 - s) + s ** 3;
  const by = (s: number) => 3 * y1 * s * (1 - s) ** 2 + 3 * y2 * s * s * (1 - s) + s ** 3;
  let lo = 0, hi = 1, s = t;
  for (let i = 0; i < 24; i++) {
    s = (lo + hi) / 2;
    if (bx(s) < t) lo = s; else hi = s;
  }
  return by(s);
}

export const lerpView = (a: View, b: View, t: number): View => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
  w: a.w + (b.w - a.w) * t,
  h: a.h + (b.h - a.h) * t,
});

export function scaleBar(unitsPerPx: number): { km: number; px: number } {
  const kmPerPx = kmPerUnit(mainPlate, 11) * unitsPerPx;
  for (const km of [1, 2, 5, 10, 20, 25, 50, 100, 200]) {
    const px = km / kmPerPx;
    if (px >= 56) return { km, px: Math.round(px) };
  }
  return { km: 200, px: Math.round(200 / kmPerPx) };
}

export const graticule = (() => {
  const lons = [104, 105, 106, 107, 108, 109].map((lon) => ({ lon, x: r1(project(mainPlate, [lon, 10])[0]) }));
  const lats = [9, 10, 11, 12].map((lat) => ({ lat, y: r1(project(mainPlate, [106, lat])[1]) }));
  return { lons, lats };
})();

/* -------------------------------------------------------------------------- */
/* Spotlight: ideal trip style and how the drive feels                         */
/* -------------------------------------------------------------------------- */

export function tripStyle(p: MapPoint): Text {
  const { region, trip } = p.j;
  const nights = p.extra.nights;
  if (region === 'business' || trip === 'transfer') return { vi: 'Sân bay & công tác', en: 'Airport and business' };
  if (region === 'coast' && nights >= 1) return { vi: 'Đưa đón resort', en: 'Resort transfer' };
  if (nights === 0) return { vi: 'Đi về trong ngày', en: 'Day trip' };
  if (nights === 1) return { vi: 'Nghỉ lại một đêm', en: 'One-night stay' };
  return { vi: 'Hành trình nhiều ngày', en: 'Multi-day journey' };
}

/** A plain description of the drive, from its length alone; no road is promised. */
export function driveFeel(minutes: number): Text {
  if (minutes <= 75) return { vi: 'Chặng ngắn, đi về gọn trong một buổi.', en: 'A short hop, there and back in half a day.' };
  if (minutes <= 150) return { vi: 'Một mạch, thường không cần dừng nghỉ.', en: 'One straight run, usually with no stop.' };
  if (minutes <= 300) return { vi: 'Một lần dừng nghỉ giữa đường; ghế ngả D’Car giúp chặng dài nhẹ nhàng.', en: 'One break on the way; reclining D’Car seats make the distance easy.' };
  return { vi: 'Chặng dài: nên khởi hành sớm và dừng nghỉ hai lần.', en: 'A long day on the road: leave early and break twice.' };
}
