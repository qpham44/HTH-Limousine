"""
Roads for the journey map, from OpenStreetMap (ODbL, "© OpenStreetMap contributors").

Fetches motorways (cao tốc) and trunk roads (quốc lộ) inside the plate window
from the Overpass API, projects them onto the plate, simplifies them and
writes SVG paths plus a few route-number shields.

Writes data/journey/roads.json
Run:   python scripts/journey/roads.py
"""

import json
import math
import os
import sys
import urllib.parse
import urllib.request

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
CACHE = os.path.join(ROOT, '.atlas-cache', 'overpass-roads.json')
OUT = os.path.join(ROOT, 'data', 'journey', 'roads.json')

W, S, E, N = 103.55, 8.3, 110.0, 13.0
PLATE_W = 1200
RAD = math.pi / 180


def merc_y(lat):
    return math.log(math.tan(math.pi / 4 + lat * RAD / 2))


K = PLATE_W / ((E - W) * RAD)


def project(lon, lat):
    return ((lon - W) * RAD * K, (merc_y(N) - merc_y(lat)) * K)


QUERY = f"""
[out:json][timeout:240];
(
  way["highway"~"^(motorway|trunk)$"]({S},{W},{N},{E});
);
out geom tags;
"""


def fetch():
    if os.path.exists(CACHE):
        with open(CACHE, encoding='utf-8') as f:
            return json.load(f)
    os.makedirs(os.path.dirname(CACHE), exist_ok=True)
    data = urllib.parse.urlencode({'data': QUERY}).encode()
    req = urllib.request.Request(
        'https://overpass-api.de/api/interpreter', data=data,
        headers={'User-Agent': 'hth-map-build/1.0'},
    )
    with urllib.request.urlopen(req, timeout=300) as r:
        raw = json.loads(r.read().decode('utf-8'))
    with open(CACHE, 'w', encoding='utf-8') as f:
        json.dump(raw, f)
    return raw


def simplify(pts, tol):
    if len(pts) < 3:
        return pts
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        a, b = stack.pop()
        ax, ay = pts[a]
        bx, by = pts[b]
        dx, dy = bx - ax, by - ay
        den = math.hypot(dx, dy) or 1e-9
        best, at = 0.0, -1
        for i in range(a + 1, b):
            px, py = pts[i]
            d = abs(dy * px - dx * py + bx * ay - by * ax) / den
            if d > best:
                best, at = d, i
        if best > tol and at > 0:
            keep[at] = True
            stack.append((a, at))
            stack.append((at, b))
    return [p for p, k in zip(pts, keep) if k]


def chain(lines):
    """Join lines that meet end to end where exactly two lines meet."""
    key = lambda p: (round(p[0], 2), round(p[1], 2))
    ends = {}
    for i, l in enumerate(lines):
        ends.setdefault(key(l[0]), []).append(i)
        ends.setdefault(key(l[-1]), []).append(i)
    used = [False] * len(lines)
    out = []
    for i, l in enumerate(lines):
        if used[i]:
            continue
        used[i] = True
        cur = list(l)
        for forward in (True, False):
            while True:
                tip = key(cur[-1] if forward else cur[0])
                cand = [j for j in ends.get(tip, []) if not used[j]]
                if len(ends.get(tip, [])) != 2 or not cand:
                    break
                j = cand[0]
                used[j] = True
                nxt = lines[j]
                if key(nxt[0]) != tip:
                    nxt = nxt[::-1]
                if forward:
                    cur = cur + nxt[1:]
                else:
                    cur = nxt[::-1][:-1] + cur if key(nxt[0]) == tip else nxt[:-1] + cur
        out.append(cur)
    return out


def fmt(n):
    return f'{n:.1f}'.rstrip('0').rstrip('.')


def path(lines):
    out = []
    for pts in lines:
        if len(pts) < 2:
            continue
        out.append('M' + 'L'.join(f'{fmt(x)} {fmt(y)}' for x, y in pts))
    return ''.join(out)


def length(pts):
    return sum(math.hypot(b[0] - a[0], b[1] - a[1]) for a, b in zip(pts, pts[1:]))


def main():
    raw = fetch()
    ways = [e for e in raw['elements'] if e.get('type') == 'way' and e.get('geometry')]
    print(f'{len(ways)} ways', file=sys.stderr)

    layers = {'motorway': [], 'trunk': []}
    by_ref = {}
    raw_lines = {'motorway': [], 'trunk': []}
    for w in ways:
        tags = w.get('tags', {})
        kind = tags.get('highway')
        if kind not in layers:
            continue
        pts = [project(g['lon'], g['lat']) for g in w['geometry']]
        raw_lines[kind].append((tags.get('oneway') == 'yes', pts))
        ref = (tags.get('ref') or '').split(';')[0].strip()
        if ref:
            by_ref.setdefault((kind, ref), []).append(pts)

    # OSM splits roads into thousands of short ways, and draws dual
    # carriageways twice. At map scale both are noise: chain the ways end to
    # end, then drop a carriageway that runs on top of one already drawn.
    occupied = set()
    CELL = 0.7

    def cells(pts, step=0.35):
        out = []
        for a, b in zip(pts, pts[1:]):
            n = max(1, int(math.hypot(b[0] - a[0], b[1] - a[1]) / step))
            for i in range(n + 1):
                t = i / n
                out.append((int((a[0] + (b[0] - a[0]) * t) / CELL), int((a[1] + (b[1] - a[1]) * t) / CELL)))
        return out

    def covered(c):
        x, y = c
        return any((x + dx, y + dy) in occupied for dx in (-1, 0, 1) for dy in (-1, 0, 1))

    for kind in ('motorway', 'trunk'):
        chains = chain([p for _, p in raw_lines[kind] if True])
        # Longest first, so the main line claims the space before its twin.
        chains.sort(key=length, reverse=True)
        for pts in chains:
            cs = cells(pts)
            if cs and sum(covered(c) for c in cs) / len(cs) > 0.75:
                continue
            simple = simplify(pts, 0.3)
            if length(simple) < 1.2:
                continue
            layers[kind].append(simple)
            occupied.update(cs)

    # Shields: for each numbered road, one label on its longest piece.
    # Kept to roads a traveller from Saigon actually uses.
    wanted = ['QL.1', 'QL.13', 'QL.14', 'QL.20', 'QL.22', 'QL.27', 'QL.28', 'QL.50', 'QL.51', 'QL.55',
              'QL.57', 'QL.60', 'QL.61', 'QL.80', 'QL.91', 'QL.1A', 'QL.1K', 'QL.62', 'QL.30',
              'CT.01', 'CT.02', 'CT.11', 'CT.12', 'CT.13', 'CT.15', 'CT.41']

    def norm(ref):
        r = ref.upper().replace(' ', '').replace('QL', 'QL.').replace('QL..', 'QL.')
        r = r.replace('CT', 'CT.').replace('CT..', 'CT.')
        return r

    shields = []
    seen = {}
    for (kind, ref), pieces in by_ref.items():
        n = norm(ref)
        if n not in wanted:
            continue
        pieces = sorted(pieces, key=length, reverse=True)
        best = pieces[0]
        # Point at half the length of the longest piece.
        half, acc = length(best) / 2, 0.0
        px, py = best[0]
        for a, b in zip(best, best[1:]):
            seg = math.hypot(b[0] - a[0], b[1] - a[1])
            if acc + seg >= half:
                t = (half - acc) / (seg or 1)
                px, py = a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t
                break
            acc += seg
        if not (0 < px < PLATE_W and 0 < py < 890):
            continue
        key = n
        if key in seen and seen[key]['len'] >= length(best):
            continue
        seen[key] = {'ref': n.replace('.', '').replace('QL', 'QL').replace('CT', 'CT'), 'kind': kind,
                     'x': round(px, 1), 'y': round(py, 1), 'len': length(best)}
    shields = [{k: v for k, v in s.items() if k != 'len'} for s in seen.values()]

    out = {
        'source': 'OpenStreetMap contributors (ODbL), via Overpass API: highway=motorway|trunk',
        'motorway': path(layers['motorway']),
        'trunk': path(layers['trunk']),
        'shields': shields,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False)
    print(f"motorway {len(out['motorway'])//1024} KB, trunk {len(out['trunk'])//1024} KB, shields {[s['ref'] for s in shields]}", file=sys.stderr)


if __name__ == '__main__':
    main()
