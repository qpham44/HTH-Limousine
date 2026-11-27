"""
Driving lines for the journey map: the road from District 1 to each
destination, from the public OSRM server (OpenStreetMap data, ODbL).

Only the geometry and road distance are kept. OSRM's free-flow durations are
far too short for Vietnamese traffic, so drive times come from lib/quote.ts
(HTH's own timings where measured, its traffic model otherwise).

Writes data/journey/drives.json
Run:   python scripts/journey/drives.py
"""

import json
import math
import os
import sys
import time
import urllib.request

sys.path.insert(0, os.path.dirname(__file__))
from roads import project, simplify, fmt  # noqa: E402

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
CACHE = os.path.join(ROOT, '.atlas-cache', 'osrm.json')
OUT = os.path.join(ROOT, 'data', 'journey', 'drives.json')

START = (106.7009, 10.7769)  # District 1, as in lib/quote.ts

DEST = {
    'cu-chi': (106.4626, 11.1424), 'binh-duong': (106.65, 10.98), 'bien-hoa': (106.818, 10.945),
    'nhon-trach': (106.914, 10.716), 'long-thanh': (107.011, 10.776), 'tan-an': (106.4137, 10.5359),
    'can-gio': (106.94444, 10.42), 'tay-ninh': (106.1749, 11.3741), 'vung-tau': (107.0843, 10.346),
    'long-hai': (107.2386, 10.3884), 'ho-tram': (107.43333, 10.48333), 'binh-chau': (107.548, 10.5636),
    'phan-thiet': (108.10208, 10.92889), 'mui-ne': (108.287, 10.954), 'phan-rang': (108.98858, 11.56432),
    'nha-trang': (109.19432, 12.24507), 'bao-loc': (107.80772, 11.54798), 'da-lat': (108.44193, 11.94646),
    'my-tho': (106.35996, 10.36004), 'ben-tre': (106.3759, 10.2415), 'vinh-long': (105.9722, 10.2537),
    'can-tho': (105.78825, 10.03711), 'chau-doc': (105.11667, 10.70039), 'rach-gia': (105.08091, 10.01245),
    'ca-mau': (105.15242, 9.17682),
}


def main():
    cache = {}
    if os.path.exists(CACHE):
        with open(CACHE, encoding='utf-8') as f:
            cache = json.load(f)
    out = {}
    for did, (lon, lat) in DEST.items():
        if did not in cache:
            url = (f'https://router.project-osrm.org/route/v1/driving/{START[0]},{START[1]};{lon},{lat}'
                   '?overview=full&geometries=geojson')
            req = urllib.request.Request(url, headers={'User-Agent': 'hth-map-build/1.0'})
            time.sleep(1.2)
            with urllib.request.urlopen(req, timeout=60) as r:
                cache[did] = json.loads(r.read().decode('utf-8'))
            with open(CACHE, 'w', encoding='utf-8') as f:
                json.dump(cache, f)
        route = cache[did]['routes'][0]
        pts = [project(c[0], c[1]) for c in route['geometry']['coordinates']]
        simple = simplify(pts, 0.35)
        d = 'M' + 'L'.join(f'{fmt(x)} {fmt(y)}' for x, y in simple)
        length = sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(simple, simple[1:]))
        out[did] = {'d': d, 'km': round(route['distance'] / 1000), 'len': round(length, 1)}
        print(f'{did:12s} {route["distance"]/1000:6.0f} km  {len(simple)} pts', file=sys.stderr)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump({'source': 'OSRM (router.project-osrm.org), OpenStreetMap contributors (ODbL)', 'from': 'District 1', 'drives': out}, f)
    print(f'{os.path.getsize(OUT)//1024} KB', file=sys.stderr)


if __name__ == '__main__':
    main()
