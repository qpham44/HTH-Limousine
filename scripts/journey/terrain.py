"""
Terrain for the journey map: a shaded-relief image aligned to the map plate.

Source: Mapzen/Tilezen "Terrarium" elevation tiles on AWS Open Data
(https://registry.opendata.aws/terrain-tiles/), which combine SRTM, GMTED and
ETOPO1. Free to use with attribution ("Terrain: Mapzen, AWS Open Data").

The tiles are Web Mercator, the same spherical Mercator as the plate in
lib/atlas/projection.ts, so a crop to the plate bounds lines up exactly.

Writes
  public/img/journey/terrain.webp   shaded relief (clipped to the coastline by the map)
  data/journey/peaks.json           named summits snapped to the elevation data

Run:  python scripts/journey/terrain.py      (needs numpy and Pillow)
"""

import io
import json
import math
import os
import sys
import urllib.request

import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
CACHE = os.path.join(ROOT, '.atlas-cache', 'terrarium')
OUT_IMG = os.path.join(ROOT, 'public', 'img', 'journey', 'terrain.webp')
OUT_PEAKS = os.path.join(ROOT, 'data', 'journey', 'peaks.json')

# Plate: must match mainPlate in lib/atlas/projection.ts
W, S, E, N = 103.55, 8.3, 110.0, 13.0
PLATE_W = 1200
Z = 9
SCALE = 2  # output pixels per plate unit

RAD = math.pi / 180


def merc_y(lat):
    return math.log(math.tan(math.pi / 4 + lat * RAD / 2))


K = PLATE_W / ((E - W) * RAD)
PLATE_H = (merc_y(N) - merc_y(S)) * K


def project(lon, lat):
    return ((lon - W) * RAD * K, (merc_y(N) - merc_y(lat)) * K)


def tile_xy(lon, lat, z):
    n = 2 ** z
    x = (lon + 180) / 360 * n
    y = (1 - math.log(math.tan(lat * RAD) + 1 / math.cos(lat * RAD)) / math.pi) / 2 * n
    return x, y


def fetch(z, x, y):
    os.makedirs(CACHE, exist_ok=True)
    path = os.path.join(CACHE, f'{z}_{x}_{y}.png')
    if not os.path.exists(path):
        url = f'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png'
        req = urllib.request.Request(url, headers={'User-Agent': 'hth-map-build/1.0'})
        with urllib.request.urlopen(req, timeout=60) as r:
            data = r.read()
        with open(path, 'wb') as f:
            f.write(data)
    return Image.open(path).convert('RGB')


def main():
    x0f, y0f = tile_xy(W, N, Z)
    x1f, y1f = tile_xy(E, S, Z)
    tx0, ty0, tx1, ty1 = int(x0f), int(y0f), int(x1f), int(y1f)
    cols, rows = tx1 - tx0 + 1, ty1 - ty0 + 1
    print(f'tiles {cols}x{rows} at z{Z}', file=sys.stderr)

    mosaic = np.zeros((rows * 256, cols * 256), dtype=np.float32)
    for j in range(rows):
        for i in range(cols):
            a = np.asarray(fetch(Z, tx0 + i, ty0 + j), dtype=np.float32)
            elev = a[:, :, 0] * 256 + a[:, :, 1] + a[:, :, 2] / 256 - 32768
            mosaic[j * 256:(j + 1) * 256, i * 256:(i + 1) * 256] = elev

    # Crop to the plate window (fractional tile coordinates -> pixels).
    px0 = (x0f - tx0) * 256
    py0 = (y0f - ty0) * 256
    px1 = (x1f - tx0) * 256
    py1 = (y1f - ty0) * 256
    out_w = int(round(PLATE_W * SCALE))
    out_h = int(round(PLATE_H * SCALE))
    img = Image.fromarray(mosaic, mode='F').resize(
        (out_w, out_h), Image.BICUBIC, box=(px0, py0, px1, py1)
    )
    elev = np.asarray(img, dtype=np.float32)

    # Ground size of one output pixel, at the plate's middle latitude.
    lat_mid = (S + N) / 2
    m_per_px = (6378137 * math.cos(lat_mid * RAD) * (E - W) * RAD) / out_w

    # Radar noise on the delta (0–5 m) reads as streaks once shaded; smooth
    # the surface a little before taking slopes.
    def blur(a, r):
        k = np.exp(-0.5 * (np.arange(-3 * r, 3 * r + 1) / r) ** 2)
        k /= k.sum()
        a = np.apply_along_axis(lambda v: np.convolve(v, k, mode='same'), 0, a)
        return np.apply_along_axis(lambda v: np.convolve(v, k, mode='same'), 1, a)

    smooth = blur(elev, 1.6)

    # Hillshade, light from the north-west, exaggerated: the south is flat.
    dzdy, dzdx = np.gradient(smooth, m_per_px)
    exaggeration = 2.6
    slope = np.arctan(exaggeration * np.hypot(dzdx, dzdy))
    aspect = np.arctan2(-dzdx, dzdy)
    az, alt = 315 * RAD, 42 * RAD
    shade = np.sin(alt) * np.cos(slope) + np.cos(alt) * np.sin(slope) * np.cos(az - aspect)
    shade = np.clip(shade, 0, 1)
    flat = np.sin(alt)
    rel = shade - flat  # >0 lit slope, <0 shadow
    # Below ~30 m the relief is mostly noise and rice-field banks: fade it out.
    rel *= np.clip((smooth - 8) / 40, 0, 1)

    # Light, Google-terrain-like tint: pale green lowland, khaki hills,
    # warm brown highlands, with soft relief shading on top.
    stops = [
        (0, (226, 238, 214)),
        (60, (230, 238, 212)),
        (250, (232, 233, 205)),
        (600, (226, 220, 190)),
        (1100, (214, 200, 168)),
        (1600, (200, 184, 150)),
        (2300, (186, 168, 134)),
    ]
    e = np.maximum(elev, 0)
    base = np.zeros(e.shape + (3,), dtype=np.float32)
    for (h0, c0), (h1, c1) in zip(stops, stops[1:]):
        m = (e >= h0) & (e < h1)
        k = ((e - h0) / (h1 - h0))[..., None]
        base[m] = (np.array(c0) * (1 - k) + np.array(c1) * k)[m]
    base[e >= stops[-1][0]] = stops[-1][1]
    lit = np.array([255, 253, 246], dtype=np.float32)
    dark = np.array([92, 78, 60], dtype=np.float32)
    up = np.clip(rel, 0, None)[..., None] * 0.55
    down = np.clip(-rel, 0, None)[..., None] * 0.95
    rgb = base * (1 - up - down) + lit * up + dark * down
    rgb = np.clip(rgb, 0, 255)

    # Opaque everywhere: the map clips it to the vector coastline, which is
    # more accurate along the delta than an elevation threshold.
    os.makedirs(os.path.dirname(OUT_IMG), exist_ok=True)
    Image.fromarray(rgb.astype(np.uint8), mode='RGB').save(OUT_IMG, 'WEBP', quality=74, method=6)
    print(f'terrain {out_w}x{out_h} -> {os.path.getsize(OUT_IMG) // 1024} KB', file=sys.stderr)

    # Peaks: approximate location -> snapped to the highest cell within ~6 km.
    peaks = [
        ('bidoup', 'Bidoup', 'Bidoup', 12.10, 108.68, 2287),
        ('langbiang', 'Langbiang', 'Langbiang', 12.05, 108.44, 2167),
        ('ba-den', 'Núi Bà Đen', 'Ba Den Mountain', 11.374, 106.175, 986),
        ('chua-chan', 'Núi Chứa Chan', 'Chua Chan', 10.94, 107.38, 837),
        ('nui-cam', 'Núi Cấm', 'Cam Mountain', 10.505, 104.985, 705),
        ('ta-cu', 'Núi Tà Cú', 'Ta Cu Mountain', 10.83, 107.92, 649),
        ('nui-chua', 'Núi Chúa', 'Nui Chua', 11.72, 109.13, 1039),
    ]
    out = []
    for pid, vi, en, lat, lon, height in peaks:
        x, y = project(lon, lat)
        cx, cy = int(x * SCALE), int(y * SCALE)
        r = int(6 / (m_per_px / 1000))  # 6 km in pixels
        win = elev[max(cy - r, 0):cy + r, max(cx - r, 0):cx + r]
        iy, ix = np.unravel_index(np.argmax(win), win.shape)
        sx = (max(cx - r, 0) + ix) / SCALE
        sy = (max(cy - r, 0) + iy) / SCALE
        out.append({
            'id': pid, 'vi': vi, 'en': en, 'height': height,
            'x': round(float(sx), 1), 'y': round(float(sy), 1),
            'dem': int(win[iy, ix]),
        })
        print(f'  {vi}: dem {int(win[iy, ix])} m, published {height} m', file=sys.stderr)
    os.makedirs(os.path.dirname(OUT_PEAKS), exist_ok=True)
    with open(OUT_PEAKS, 'w', encoding='utf-8') as f:
        json.dump({'source': 'Positions snapped to Terrarium elevation tiles; heights as published.', 'peaks': out}, f, ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
