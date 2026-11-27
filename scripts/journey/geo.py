"""
Geographic data for the 3D journey map (MapLibre), in WGS84 longitude/latitude.

  drives  the OSRM road line from District 1 to each destination, at full
          resolution from the cache written by drives.py, simplified to a
          tolerance of about 8 m so it follows every bend of the real road.
  peaks   the summits from peaks.json, converted back from plate units.

Writes public/data/journey/geo.json (loaded by the map at run time, so none of
it enters the JavaScript bundle).
Run:   python scripts/journey/geo.py    (after drives.py and terrain.py)
"""

import json
import math
import os
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OSRM = os.path.join(ROOT, '.atlas-cache', 'osrm.json')
PEAKS = os.path.join(ROOT, 'data', 'journey', 'peaks.json')
OUT = os.path.join(ROOT, 'public', 'data', 'journey', 'geo.json')

# Same window as lib/atlas/projection.ts → mainPlate.
W, S, E, N = 103.55, 8.3, 110.0, 13.0
WIDTH = 1200
RAD = math.pi / 180
K = WIDTH / ((E - W) * RAD)


def merc_y(lat):
    return math.log(math.tan(math.pi / 4 + lat * RAD / 2))


def unproject(x, y):
    lon = W + x / K / RAD
    my = merc_y(N) - y / K
    lat = (2 * math.atan(math.exp(my)) - math.pi / 2) / RAD
    return lon, lat


def simplify(pts, tol_m):
    """Douglas–Peucker in a local equirectangular frame (metres)."""
    if len(pts) < 3:
        return pts
    lat0 = sum(p[1] for p in pts) / len(pts)
    kx = 111_320 * math.cos(lat0 * RAD)
    ky = 110_540
    xy = [(p[0] * kx, p[1] * ky) for p in pts]
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        a, b = stack.pop()
        ax, ay = xy[a]
        bx, by = xy[b]
        dx, dy = bx - ax, by - ay
        den = math.hypot(dx, dy) or 1e-9
        best, at = 0.0, -1
        for i in range(a + 1, b):
            px, py = xy[i]
            d = abs(dy * px - dx * py + bx * ay - by * ax) / den
            if d > best:
                best, at = d, i
        if best > tol_m and at > 0:
            keep[at] = True
            stack.append((a, at))
            stack.append((at, b))
    return [p for p, k in zip(pts, keep) if k]


def main():
    with open(OSRM, encoding='utf-8') as f:
        osrm = json.load(f)
    features = []
    for did, res in osrm.items():
        route = res['routes'][0]
        coords = route['geometry']['coordinates']
        simple = simplify(coords, 8)
        features.append({
            'type': 'Feature',
            'properties': {'id': did, 'km': round(route['distance'] / 1000)},
            'geometry': {'type': 'LineString', 'coordinates': [[round(x, 5), round(y, 5)] for x, y in simple]},
        })
        print(f'{did:12s} {len(coords):5d} -> {len(simple):4d} pts', file=sys.stderr)

    with open(PEAKS, encoding='utf-8') as f:
        peaks = json.load(f)['peaks']
    out_peaks = []
    for p in peaks:
        lon, lat = unproject(p['x'], p['y'])
        out_peaks.append({'id': p['id'], 'vi': p['vi'], 'en': p['en'], 'height': p['height'],
                          'lon': round(lon, 5), 'lat': round(lat, 5)})

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump({
            'source': 'Roads: OSRM (router.project-osrm.org), © OpenStreetMap contributors (ODbL). '
                      'Summits: heights as published, positions snapped to AWS Terrain Tiles.',
            'drives': {'type': 'FeatureCollection', 'features': features},
            'peaks': out_peaks,
        }, f, ensure_ascii=False, separators=(',', ':'))
    print(f'{os.path.getsize(OUT) // 1024} KB', file=sys.stderr)


if __name__ == '__main__':
    main()
