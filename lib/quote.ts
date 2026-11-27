/**
 * Quote engine — ported from the approved prototype, with the placeholder
 * tariff replaced by rates fitted to HTH's confirmed reference table
 * (market survey 17/08/2026; BMW column rescaled to the 3.500.000₫ / 8h anchor).
 *
 * The estimate is deliberately a range. A coordinator confirms the real price.
 */

export type VehicleKey =
  | 'auto'
  | 'bmw'
  | 'carnival'
  | 'transit16'
  | 'transitdcar'
  | 'solati'
  | 'bus45';

export interface Place {
  id: string;
  vi: string;
  en: string;
  lat: number;
  lng: number;
  /** Unaccented search keys. */
  kw: string[];
  /** Resolved by the geocoder from free text, not from HTH's own list. */
  approx?: boolean;
}

/* -------------------------------------------------------------------------- */
/* Places                                                                      */
/* Former district names are kept as search keys: customers still use them,   */
/* whatever the 2025 ward reorganisation says. Coordinates are area centroids, */
/* close enough for an indicative price; the coordinator confirms the address. */
/* -------------------------------------------------------------------------- */

export const places: Place[] = [
  { id: 'q1', vi: 'Quận 1, TP.HCM', en: 'District 1, Ho Chi Minh City', lat: 10.7769, lng: 106.7009, kw: ['quan 1', 'district 1', 'ben thanh', 'nguyen hue', 'dong khoi', 'trung tam sai gon', 'sai gon', 'tphcm', 'ho chi minh', 'saigon', 'pham ngu lao', 'bui vien', 'nha tho duc ba', 'dinh doc lap', 'nha hat thanh pho', 'bitexco', 'thao cam vien', 'rex', 'caravelle', 'park hyatt', 'sheraton', 'continental', 'majestic', 'reverie', 'intercontinental', 'new world', 'lotte legend', 'le meridien', 'renaissance riverside', 'liberty central'] },
  { id: 'tsn', vi: 'Sân bay Tân Sơn Nhất', en: 'Tan Son Nhat Airport', lat: 10.8188, lng: 106.652, kw: ['san bay tan son nhat', 'tan son nhat', 'san bay', 'airport', 'sgn', 'tsn', 'ga quoc te', 'ga quoc noi', 'nha ga t3'] },
  { id: 'q3', vi: 'Quận 3', en: 'District 3', lat: 10.7838, lng: 106.687, kw: ['quan 3', 'district 3', 'vo van tan', 'ho con rua'] },
  { id: 'q4', vi: 'Quận 4 – Khánh Hội', en: 'District 4 – Khanh Hoi', lat: 10.759, lng: 106.704, kw: ['quan 4', 'district 4', 'khanh hoi', 'ben van don', 'millennium', 'vinh khanh'] },
  { id: 'q5', vi: 'Quận 5 – Chợ Lớn', en: 'District 5 – Cho Lon', lat: 10.754, lng: 106.6634, kw: ['quan 5', 'district 5', 'cho lon', 'chinatown', 'windsor plaza'] },
  { id: 'q6', vi: 'Quận 6', en: 'District 6', lat: 10.748, lng: 106.635, kw: ['quan 6', 'district 6', 'cho binh tay'] },
  { id: 'q7', vi: 'Quận 7 – Phú Mỹ Hưng', en: 'District 7 – Phu My Hung', lat: 10.7295, lng: 106.7215, kw: ['quan 7', 'district 7', 'phu my hung', 'crescent mall', 'secc', 'saigon south'] },
  { id: 'q8', vi: 'Quận 8', en: 'District 8', lat: 10.724, lng: 106.6286, kw: ['quan 8', 'district 8'] },
  { id: 'q10', vi: 'Quận 10', en: 'District 10', lat: 10.773, lng: 106.668, kw: ['quan 10', 'district 10', 'van hanh mall'] },
  { id: 'q11', vi: 'Quận 11', en: 'District 11', lat: 10.763, lng: 106.65, kw: ['quan 11', 'district 11', 'dam sen'] },
  { id: 'q12', vi: 'Quận 12', en: 'District 12', lat: 10.8671, lng: 106.6413, kw: ['quan 12', 'district 12'] },
  { id: 'q2', vi: 'Thảo Điền – Quận 2', en: 'Thao Dien – District 2', lat: 10.803, lng: 106.736, kw: ['quan 2', 'district 2', 'thao dien', 'an phu', 'masteri thao dien'] },
  { id: 'thuthiem', vi: 'Thủ Thiêm', en: 'Thu Thiem', lat: 10.773, lng: 106.718, kw: ['thu thiem', 'sala', 'empire city', 'the metropole'] },
  { id: 'binhthanh', vi: 'Bình Thạnh – Landmark 81', en: 'Binh Thanh – Landmark 81', lat: 10.7951, lng: 106.7218, kw: ['binh thanh', 'landmark 81', 'landmark', 'vinhomes central park'] },
  { id: 'phunhuan', vi: 'Phú Nhuận', en: 'Phu Nhuan', lat: 10.7995, lng: 106.68, kw: ['phu nhuan'] },
  { id: 'tanbinh', vi: 'Tân Bình', en: 'Tan Binh', lat: 10.7972, lng: 106.644, kw: ['tan binh', 'etown', 'cong hoa'] },
  { id: 'tanphu', vi: 'Tân Phú', en: 'Tan Phu', lat: 10.7918, lng: 106.6278, kw: ['tan phu', 'aeon tan phu'] },
  { id: 'govap', vi: 'Gò Vấp', en: 'Go Vap', lat: 10.8387, lng: 106.6653, kw: ['go vap'] },
  { id: 'binhtan', vi: 'Bình Tân', en: 'Binh Tan', lat: 10.7652, lng: 106.6039, kw: ['binh tan', 'aeon binh tan'] },
  { id: 'thuduc', vi: 'Thủ Đức', en: 'Thu Duc', lat: 10.85, lng: 106.7717, kw: ['thu duc', 'quan 9', 'district 9', 'vinhomes grand park', 'lang dai hoc'] },
  { id: 'nhabe', vi: 'Nhà Bè', en: 'Nha Be', lat: 10.695, lng: 106.704, kw: ['nha be'] },
  { id: 'binhchanh', vi: 'Bình Chánh', en: 'Binh Chanh', lat: 10.6874, lng: 106.5938, kw: ['binh chanh'] },
  { id: 'hocmon', vi: 'Hóc Môn', en: 'Hoc Mon', lat: 10.886, lng: 106.592, kw: ['hoc mon'] },
  { id: 'cuchi', vi: 'Củ Chi', en: 'Cu Chi', lat: 10.974, lng: 106.494, kw: ['cu chi', 'dia dao cu chi'] },
  { id: 'cangio', vi: 'Cần Giờ', en: 'Can Gio', lat: 10.411, lng: 106.955, kw: ['can gio'] },
  { id: 'thudaumot', vi: 'Bình Dương – Thủ Dầu Một', en: 'Binh Duong – Thu Dau Mot', lat: 10.98, lng: 106.65, kw: ['binh duong', 'thu dau mot', 'vsip', 'dai nam'] },
  { id: 'bienhoa', vi: 'Biên Hòa – Đồng Nai', en: 'Bien Hoa – Dong Nai', lat: 10.945, lng: 106.818, kw: ['bien hoa', 'dong nai', 'amata', 'long binh'] },
  { id: 'nhontrach', vi: 'Nhơn Trạch – Đồng Nai', en: 'Nhon Trach – Dong Nai', lat: 10.716, lng: 106.914, kw: ['nhon trach'] },
  { id: 'longthanh', vi: 'Sân bay Long Thành', en: 'Long Thanh Airport', lat: 10.776, lng: 107.011, kw: ['long thanh', 'san bay long thanh', 'san golf long thanh'] },
  { id: 'longan', vi: 'Tân An – Long An', en: 'Tan An – Long An', lat: 10.5359, lng: 106.4137, kw: ['long an', 'tan an'] },
  { id: 'baria', vi: 'Bà Rịa', en: 'Ba Ria', lat: 10.4963, lng: 107.1685, kw: ['ba ria'] },
  { id: 'vungtau', vi: 'Vũng Tàu', en: 'Vung Tau', lat: 10.346, lng: 107.0843, kw: ['vung tau', 'bai sau', 'bai truoc'] },
  { id: 'longhai', vi: 'Long Hải', en: 'Long Hai', lat: 10.386, lng: 107.21, kw: ['long hai'] },
  { id: 'hotram', vi: 'Hồ Tràm', en: 'Ho Tram', lat: 10.464, lng: 107.33, kw: ['ho tram', 'the grand ho tram', 'melia ho tram', 'the bluffs'] },
  { id: 'binhchau', vi: 'Bình Châu', en: 'Binh Chau', lat: 10.545, lng: 107.46, kw: ['binh chau'] },
  { id: 'phanthiet', vi: 'Phan Thiết', en: 'Phan Thiet', lat: 10.933, lng: 108.1, kw: ['phan thiet', 'binh thuan'] },
  { id: 'muine', vi: 'Mũi Né', en: 'Mui Ne', lat: 10.954, lng: 108.287, kw: ['mui ne'] },
  { id: 'baoloc', vi: 'Bảo Lộc', en: 'Bao Loc', lat: 11.548, lng: 107.807, kw: ['bao loc'] },
  { id: 'dalat', vi: 'Đà Lạt', en: 'Da Lat', lat: 11.9404, lng: 108.4583, kw: ['da lat', 'lam dong'] },
  { id: 'lienkhuong', vi: 'Sân bay Liên Khương', en: 'Lien Khuong Airport', lat: 11.75, lng: 108.367, kw: ['lien khuong', 'san bay lien khuong', 'san bay da lat', 'dli'] },
  { id: 'phanrang', vi: 'Phan Rang – Ninh Thuận', en: 'Phan Rang – Ninh Thuan', lat: 11.565, lng: 108.988, kw: ['phan rang', 'ninh thuan', 'thap cham'] },
  { id: 'nhatrang', vi: 'Nha Trang', en: 'Nha Trang', lat: 12.2388, lng: 109.1967, kw: ['nha trang', 'khanh hoa'] },
  { id: 'camranh', vi: 'Sân bay Cam Ranh', en: 'Cam Ranh Airport', lat: 11.9982, lng: 109.2194, kw: ['cam ranh', 'san bay cam ranh', 'cxr'] },
  { id: 'tayninh', vi: 'Tây Ninh – Núi Bà Đen', en: 'Tay Ninh – Ba Den Mountain', lat: 11.366, lng: 106.1, kw: ['tay ninh', 'nui ba den', 'ba den'] },
  { id: 'mytho', vi: 'Mỹ Tho – Tiền Giang', en: 'My Tho – Tien Giang', lat: 10.36, lng: 106.36, kw: ['my tho', 'tien giang'] },
  { id: 'bentre', vi: 'Bến Tre', en: 'Ben Tre', lat: 10.2415, lng: 106.3759, kw: ['ben tre'] },
  { id: 'vinhlong', vi: 'Vĩnh Long', en: 'Vinh Long', lat: 10.2537, lng: 105.9722, kw: ['vinh long'] },
  { id: 'cantho', vi: 'Cần Thơ', en: 'Can Tho', lat: 10.0452, lng: 105.7469, kw: ['can tho', 'mien tay', 'mekong'] },
  { id: 'chaudoc', vi: 'Châu Đốc – An Giang', en: 'Chau Doc – An Giang', lat: 10.7065, lng: 105.1166, kw: ['chau doc', 'an giang', 'nui sam'] },
  { id: 'rachgia', vi: 'Rạch Giá – Kiên Giang', en: 'Rach Gia – Kien Giang', lat: 10.0124, lng: 105.0809, kw: ['rach gia', 'kien giang'] },
  { id: 'camau', vi: 'Cà Mau', en: 'Ca Mau', lat: 9.1768, lng: 105.1524, kw: ['ca mau', 'dat mui', 'mui ca mau'] },
];

/* -------------------------------------------------------------------------- */
/* Road distances — measured pairs beat the great-circle estimate              */
/* -------------------------------------------------------------------------- */

const legs: Record<string, [km: number, minutes: number]> = {
  'q1|vungtau': [125, 135], 'tsn|vungtau': [130, 140], 'q1|hotram': [130, 150], 'tsn|hotram': [135, 155],
  'dalat|q1': [305, 420], 'dalat|tsn': [310, 425], 'muine|q1': [220, 255], 'phanthiet|q1': [205, 240],
  'nhatrang|q1': [435, 510], 'cantho|q1': [170, 195], 'mytho|q1': [72, 90], 'bentre|q1': [85, 105],
  'q1|tayninh': [100, 130], 'cangio|q1': [60, 95], 'q1|tsn': [8, 25], 'q7|tsn': [14, 35],
  'q2|tsn': [12, 30], 'thuduc|tsn': [18, 42], 'bienhoa|tsn': [35, 62], 'thudaumot|tsn': [30, 55],
  'cuchi|tsn': [40, 65], 'longthanh|q1': [45, 60], 'longthanh|tsn': [48, 65], 'q1|q7': [9, 26],
  'binhthanh|tsn': [10, 28], 'q1|thuduc': [15, 38], 'longhai|q1': [110, 125], 'hotram|vungtau': [45, 60],
};

/* -------------------------------------------------------------------------- */
/* Tariff — fitted to the confirmed reference table                            */
/* -------------------------------------------------------------------------- */

interface Tariff {
  /** Marginal rate per chargeable kilometre. */
  km: number;
  /** Floor: the published airport-transfer price, which also covers short city work. */
  min: number;
}

/**
 * Fitted to two anchors in the published table — Vũng Tàu one way (125 km) and
 * Đà Lạt one way (305 km) — with a fixed 800.000₫ dispatch base. Every vehicle
 * lands within 7% of its published figure at both anchors, so the estimator and
 * /bang-gia never contradict each other.
 *
 * transit16 has no column in the survey; it sits between the Carnival and the
 * Transit D’Car, which is where HTH prices it.
 */
const DISPATCH_BASE = 800_000;

const rates: Record<VehicleKey, Tariff> = {
  auto:        { km: 24_100, min: 1_400_000 },
  bmw:         { km: 34_600, min: 2_100_000 },
  carnival:    { km: 24_100, min: 1_200_000 },
  transit16:   { km: 23_000, min: 1_600_000 },
  transitdcar: { km: 24_100, min: 1_600_000 },
  solati:      { km: 28_400, min: 1_800_000 },
  bus45:       { km: 41_200, min: 2_000_000 },
};

/** Round trip costs less than two one-ways: the car is already there. */
const ROUND_TRIP = 1.75;

/**
 * The first 25 km sit inside the base. Beyond that the rate tapers, because on
 * a long run the driver's day costs more than the extra fuel does.
 */
const TAPER = { freeKm: 25, nearKm: 50, midKm: 200, mid: 0.8, far: 0.62 } as const;

/** Published as a band, never a single number. */
const BAND = 0.08;

/** Chargeable kilometres after the taper. */
function chargeableKm(km: number): number {
  const near = Math.max(0, Math.min(km, TAPER.nearKm) - TAPER.freeKm);
  const mid = Math.max(0, Math.min(km, TAPER.midKm) - TAPER.nearKm);
  const far = Math.max(0, km - TAPER.midKm);
  return near + mid * TAPER.mid + far * TAPER.far;
}

/* -------------------------------------------------------------------------- */
/* Matching                                                                    */
/* -------------------------------------------------------------------------- */

export function normalise(input: string): string {
  return (input || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Keys match on whole words, so "quan 10" never resolves to "quan 1" and
 * "rex" inside "rexbury" does not count. A partial key is accepted only as a
 * word-start prefix, which covers someone still typing "tan son".
 */
export function matchPlace(input: string): Place | null {
  const q = normalise(input);
  if (q.length < 2) return null;
  const hay = ` ${q} `;

  let best: Place | null = null;
  let bestScore = 0;

  for (const place of places) {
    const keys = [...place.kw, normalise(place.vi), normalise(place.en)];
    let score = 0;
    for (const key of keys) {
      if (!key) continue;
      let s = 0;
      if (q === key) s = 100 + key.length;
      else if (key.length >= 3 && hay.includes(` ${key} `)) s = 60 + key.length;
      else if (q.length >= 4 && ` ${key}`.includes(` ${q}`)) s = 40 + q.length;
      if (s > score) score = s;
    }
    if (score > bestScore) { bestScore = score; best = place; }
  }
  return best;
}

/**
 * `measured` marks the pairs HTH actually drives and has timed. Those beat any
 * routing service: the public OSRM demo returns 102 km for Tân Sơn Nhất to
 * Vũng Tàu, which is not the road anyone takes.
 */
export function legFor(a: Place, b: Place): { km: number; minutes: number; measured: boolean } {
  const fixed = legs[`${a.id}|${b.id}`] ?? legs[`${b.id}|${a.id}`];
  if (fixed) return { km: fixed[0], minutes: fixed[1], measured: true };

  const R = 6371;
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  const straight = 2 * R * Math.asin(Math.sqrt(h));

  // City streets wander more than highways do.
  const km = Math.round(straight * (straight < 30 ? 1.45 : 1.28));
  return { km, minutes: typicalMinutes(km), measured: false };
}

/**
 * Door-to-door time at typical Saigon traffic. OSRM's free-flow durations are
 * far too short in the city (it quotes 12 km in 15 minutes), so a live route is
 * never allowed to come in under this.
 */
export function typicalMinutes(km: number): number {
  return Math.round(km < 30 ? (km / 22) * 60 + 6 : (km / 52) * 60 + 12);
}

export function fare(km: number, vehicle: VehicleKey, roundTrip: boolean) {
  const rate = rates[vehicle] ?? rates.auto;

  let total = DISPATCH_BASE + chargeableKm(km) * rate.km;
  total = Math.max(total, rate.min);
  if (roundTrip) total *= ROUND_TRIP;

  const to50k = (n: number) => Math.round(n / 50_000) * 50_000;
  return { low: to50k(total * (1 - BAND)), high: to50k(total * (1 + BAND)) };
}

export function formatVnd(value: number, locale: 'vi' | 'en' = 'vi'): string {
  return value.toLocaleString(locale === 'en' ? 'en-US' : 'vi-VN');
}

export function formatDuration(minutes: number, locale: 'vi' | 'en' = 'vi'): string {
  const hours = Math.floor(minutes / 60);
  const rest = Math.round((minutes % 60) / 5) * 5;
  if (!hours) return locale === 'en' ? `${rest || 15} min` : `${rest || 15} phút`;
  if (locale === 'en') return `${hours} h${rest ? ` ${rest} min` : ''}`;
  return `${hours} giờ${rest ? ` ${rest} phút` : ''}`;
}
