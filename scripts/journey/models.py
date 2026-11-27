"""
Real-world footprints for the 3D miniatures on the journey map.

For each landmark we model, the building outline is taken from OpenStreetMap
(Overpass API, ODbL) and reduced to an oriented rectangle: centre, length,
width and the compass bearing of the long side. The miniature is then built
to those dimensions and turned to face the right way. Heights are the
published heights of each monument.

For the cable-stayed bridges on HTH's routes the deck line comes from OSM;
main span and pylon height are the published figures.

Writes data/journey/models.json
Run:   python scripts/journey/models.py
"""

import json
import math
import os
import sys
import time
import urllib.parse
import urllib.request

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
CACHE = os.path.join(ROOT, '.atlas-cache', 'overpass-models.json')
LANDMARKS = os.path.join(ROOT, 'data', 'journey', 'landmarks.json')
OUT = os.path.join(ROOT, 'data', 'journey', 'models.json')
UA = 'journey-map-model-builder/1.0 (static site build script)'
APIS = [
    'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass-api.de/api/interpreter',
    'https://overpass.private.coffee/api/interpreter',
]

# landmark id -> (archetype, height in metres, words to prefer in the OSM name)
MONUMENTS = {
    'nha-tho-duc-ba': ('cathedral', 57, ['Đức Bà', 'Notre']),
    'dinh-doc-lap': ('palace', 26, ['Độc Lập', 'Thống Nhất', 'Independence']),
    'cho-ben-thanh': ('market', 28, ['Bến Thành']),
    'hai-dang-vung-tau': ('lighthouse', 18, ['Hải đăng']),
    'ke-ga': ('lighthouse-stone', 35, ['Kê Gà', 'Hải đăng']),
    'chua-kito': ('statue', 32, ['Kitô', 'Chúa']),
    'po-nagar': ('cham', 23, ['Ponagar', 'Po Nagar', 'Tháp Bà']),
    'po-klong-garai': ('cham', 21, ['Po Klong', 'Poklong']),
    'po-sah-inu': ('cham', 15, ['Po Sah', 'Pô Sah']),
    'toa-thanh': ('caodai', 36, ['Tòa Thánh', 'Cao Đài']),
    'vinh-trang': ('pagoda', 15, ['Vĩnh Tràng']),
    'ba-chua-xu': ('temple-green', 18, ['Bà Chúa Xứ']),
    'van-mieu-tran-bien': ('temple', 13, ['Văn miếu', 'Văn Miếu']),
    'nguyen-trung-truc': ('temple', 12, ['Nguyễn Trung Trực']),
    'dinh-co': ('temple', 11, ['Dinh Cô']),
    'van-thanh-mieu-vl': ('temple', 11, ['Văn Thánh']),
    'ga-da-lat': ('station', 20, ['Ga Đà Lạt']),
    'binh-thuy': ('house', 9, ['Nhà cổ']),
    'linh-quy': ('pagoda', 14, ['Linh Quy']),
}

# name in OSM -> (main span m, pylon height m, deck clearance m, approximate centre lat, lon)
# The centre keeps the search on the right river: several bridges share these names.
BRIDGES = {
    'Cầu Cần Thơ': (550, 175, 37, 10.04, 105.79),
    'Cầu Mỹ Thuận': (350, 124, 37, 10.27, 105.91),
    'Cầu Mỹ Thuận 2': (350, 124, 37, 10.27, 105.92),
    'Cầu Rạch Miễu': (270, 112, 37, 10.33, 106.36),
    'Cầu Phú Mỹ': (380, 145, 45, 10.745, 106.743),
    'Cầu Vàm Cống': (450, 150, 37, 10.33, 105.55),
    'Cầu Cổ Chiên': (390, 135, 37, 10.06, 106.33),
}


def load_cache():
    if os.path.exists(CACHE):
        with open(CACHE, encoding='utf-8') as f:
            return json.load(f)
    return {}


def save_cache(cache):
    os.makedirs(os.path.dirname(CACHE), exist_ok=True)
    with open(CACHE, 'w', encoding='utf-8') as f:
        json.dump(cache, f, ensure_ascii=False)


def overpass(q, cache):
    if q in cache:
        return cache[q]
    data = urllib.parse.urlencode({'data': q}).encode()
    for attempt in range(6):
        api = APIS[attempt % len(APIS)]
        try:
            req = urllib.request.Request(api, data=data, headers={'User-Agent': UA})
            with urllib.request.urlopen(req, timeout=75) as r:
                out = json.loads(r.read().decode('utf-8'))
            cache[q] = out
            save_cache(cache)
            time.sleep(1.5)
            return out
        except Exception as e:  # noqa: BLE001
            print(f'  retry {attempt + 1}: {e}', file=sys.stderr)
            time.sleep(4 * (attempt + 1))
    raise RuntimeError(q)


def local(points, lat0, lon0):
    kx = 111_320 * math.cos(math.radians(lat0))
    ky = 110_540
    return [((lon - lon0) * kx, (lat - lat0) * ky) for lon, lat in points]


def hull(pts):
    pts = sorted(set(pts))
    if len(pts) < 3:
        return pts
    def cross(o, a, b):
        return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0])
    lower, upper = [], []
    for p in pts:
        while len(lower) >= 2 and cross(lower[-2], lower[-1], p) <= 0:
            lower.pop()
        lower.append(p)
    for p in reversed(pts):
        while len(upper) >= 2 and cross(upper[-2], upper[-1], p) <= 0:
            upper.pop()
        upper.append(p)
    return lower[:-1] + upper[:-1]


def min_rect(pts):
    """Minimum-area rectangle: (cx, cy, length, width, bearing of long side in degrees)."""
    h = hull(pts)
    best = None
    for i in range(len(h)):
        x1, y1 = h[i]
        x2, y2 = h[(i + 1) % len(h)]
        a = math.atan2(y2 - y1, x2 - x1)
        c, s = math.cos(a), math.sin(a)
        us = [x * c + y * s for x, y in h]
        vs = [-x * s + y * c for x, y in h]
        area = (max(us) - min(us)) * (max(vs) - min(vs))
        if best is None or area < best[0]:
            cu, cv = (max(us) + min(us)) / 2, (max(vs) + min(vs)) / 2
            best = (area, cu * c - cv * s, cu * s + cv * c, max(us) - min(us), max(vs) - min(vs), a)
    _, cx, cy, du, dv, a = best
    if dv > du:
        du, dv, a = dv, du, a + math.pi / 2
    bearing = (90 - math.degrees(a)) % 180  # compass bearing of the long axis
    return cx, cy, du, dv, bearing


def area(poly):
    return abs(sum(x1 * y2 - x2 * y1 for (x1, y1), (x2, y2) in zip(poly, poly[1:] + poly[:1]))) / 2


def main():
    cache = load_cache()
    lms = {l['id']: l for l in json.load(open(LANDMARKS, encoding='utf-8'))['landmarks']}
    monuments = []
    try:
        for lid, (kind, height, words) in MONUMENTS.items():
            l = lms[lid]
            lat0, lon0 = l['lat'], l['lon']
            q = f'[out:json][timeout:60];(way(around:220,{lat0},{lon0})[building];way(around:220,{lat0},{lon0})[amenity=place_of_worship];way(around:220,{lat0},{lon0})[man_made];);out geom tags;'
            res = overpass(q, cache)
            best = None
            for el in res.get('elements', []):
                geom = el.get('geometry')
                if not geom or len(geom) < 4:
                    continue
                pts = local([(g['lon'], g['lat']) for g in geom], lat0, lon0)
                a = area(pts)
                if a < 30:
                    continue
                name = (el.get('tags') or {}).get('name', '')
                named = any(w.lower() in name.lower() for w in words)
                cx = sum(p[0] for p in pts) / len(pts)
                cy = sum(p[1] for p in pts) / len(pts)
                dist = math.hypot(cx, cy)
                score = (0 if named else 1, dist / 40 - min(a, 20000) / 4000)
                if best is None or score < best[0]:
                    best = (score, pts, name, a)
            entry = {'id': lid, 'kind': kind, 'height': height, 'lon': lon0, 'lat': lat0, 'bearing': 0, 'length': 0, 'width': 0}
            # Only trust a footprint whose OSM name matches the monument; a nearby
            # shop or house would give the miniature the wrong size and bearing.
            if best and best[0][0] == 0 and best[3] < 60_000:
                _, pts, name, a = best
                cx, cy, length, width, brg = min_rect(pts)
                kx = 111_320 * math.cos(math.radians(lat0))
                entry.update({
                    'lon': round(lon0 + cx / kx, 6), 'lat': round(lat0 + cy / 110_540, 6),
                    'length': round(length, 1), 'width': round(width, 1), 'bearing': round(brg, 1), 'osm': name,
                })
            monuments.append(entry)
            print(f"{lid:20s} {entry['length']:7.1f} x {entry['width']:6.1f}  {entry['bearing']:5.1f}°  {entry.get('osm', '')}", file=sys.stderr)

        bridges = []
        for name, (span, pylon, clear, clat, clon) in BRIDGES.items():
            q = f'[out:json][timeout:60];way["bridge"]["name"="{name}"]({clat - 0.12},{clon - 0.12},{clat + 0.12},{clon + 0.12});out geom tags;'
            res = overpass(q, cache)
            pts = [(g['lon'], g['lat']) for el in res.get('elements', []) for g in el.get('geometry', [])]
            if len(pts) < 2:
                print(f'{name}: not found', file=sys.stderr)
                continue
            # OSM splits a bridge into many short ways; its deck is the line through
            # them along their principal axis, end to end.
            lat0 = sum(p[1] for p in pts) / len(pts)
            lon0 = sum(p[0] for p in pts) / len(pts)
            xy = local(pts, lat0, lon0)
            sxx = sum(x * x for x, _ in xy); syy = sum(y * y for _, y in xy); sxy = sum(x * y for x, y in xy)
            ang = 0.5 * math.atan2(2 * sxy, sxx - syy)
            ux, uy = math.cos(ang), math.sin(ang)
            proj = [x * ux + y * uy for x, y in xy]
            lo, hi = min(proj), max(proj)
            kx = 111_320 * math.cos(math.radians(lat0))
            ends = [(lon0 + ux * t / kx, lat0 + uy * t / 110_540) for t in (lo, hi)]
            coords = [[round(x, 6), round(y, 6)] for x, y in ends]
            total = hi - lo
            bridges.append({'name': name, 'span': span, 'pylon': pylon, 'clearance': clear, 'line': coords, 'length': round(total)})
            print(f'{name}: {round(total)} m from {len(pts)} nodes', file=sys.stderr)
    finally:
        os.makedirs(os.path.dirname(CACHE), exist_ok=True)
        with open(CACHE, 'w', encoding='utf-8') as f:
            json.dump(cache, f, ensure_ascii=False)

    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump({
            'source': 'Footprints and bridge lines: OpenStreetMap contributors (ODbL) via Overpass API. Heights, spans and pylons as published.',
            'monuments': monuments,
            'bridges': bridges,
        }, f, ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
