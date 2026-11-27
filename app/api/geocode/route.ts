import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * Free-text address lookup for the quote widget, used only when a typed place
 * is not in HTH's own list (lib/quote.ts).
 *
 * Defaults to the public Photon instance (OpenStreetMap data, keyless, built
 * for search-as-you-type). It asks for fair use, so the client debounces,
 * results are cached here and at the CDN, and each IP is rate limited.
 * GEOCODER_URL points at a self-hosted Photon without touching any code.
 */

const ENDPOINT = process.env.GEOCODER_URL || 'https://photon.komoot.io/api/';

// Southern Vietnam, biased towards central Ho Chi Minh City.
const BBOX = '104.4,8.4,109.5,12.9';
const BIAS = { lat: 10.78, lon: 106.7 };

interface PhotonFeature {
  geometry?: { coordinates?: [number, number] };
  properties?: {
    name?: string;
    housenumber?: string;
    street?: string;
    district?: string;
    city?: string;
    county?: string;
    state?: string;
    countrycode?: string;
  };
}

interface Result {
  label: string;
  full: string;
  lat: number;
  lng: number;
}

const cache = new Map<string, Result | null>();
const CACHE_MAX = 500;

const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 40;

function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 2000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

function toResult(feature: PhotonFeature): Result | null {
  const coords = feature.geometry?.coordinates;
  const p = feature.properties ?? {};
  if (!coords || p.countrycode !== 'VN') return null;

  const street = p.street ? `${p.housenumber ? `${p.housenumber} ` : ''}${p.street}` : '';
  const name = p.name ?? '';
  const label = name && name.length <= 42 ? name : street || name.slice(0, 42);
  const parts = [name, street, p.district, p.city ?? p.county ?? p.state].filter(
    (part, index, all): part is string => Boolean(part) && all.indexOf(part) === index,
  );

  return { label, full: parts.join(', '), lat: coords[1], lng: coords[0] };
}

export async function GET(request: Request) {
  const q = (new URL(request.url).searchParams.get('q') ?? '').trim().slice(0, 120);
  if (q.length < 3) return NextResponse.json({ place: null }, { status: 400 });

  const key = q.toLowerCase();
  if (cache.has(key)) {
    return NextResponse.json(
      { place: cache.get(key) },
      { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } },
    );
  }

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (limited(ip)) return NextResponse.json({ place: null, reason: 'rate-limited' }, { status: 429 });

  const url = new URL(ENDPOINT);
  url.searchParams.set('q', q);
  url.searchParams.set('limit', '3');
  url.searchParams.set('bbox', BBOX);
  url.searchParams.set('lat', String(BIAS.lat));
  url.searchParams.set('lon', String(BIAS.lon));

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'hth-limousine-quote/1.0 (+https://hth.com.vn)' },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error(`geocoder ${response.status}`);
    const json = (await response.json()) as { features?: PhotonFeature[] };
    const place = (json.features ?? []).map(toResult).find(Boolean) ?? null;

    if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value as string);
    cache.set(key, place);

    return NextResponse.json(
      { place },
      { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } },
    );
  } catch (error) {
    console.error('[geocode] lookup failed', error);
    return NextResponse.json({ place: null, reason: 'unavailable' }, { status: 502 });
  }
}
