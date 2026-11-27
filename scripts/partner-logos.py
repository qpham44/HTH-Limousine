"""
Partner logos for the About band: background removed, recoloured to one ivory
so eight logos with eight different backgrounds read as one calm strip on the
dark page. Source files: ../partner's logo (supplied by HTH, 25 Nov 2026).

Run:  python scripts/partner-logos.py      (needs numpy and Pillow)
"""

import os

import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SRC = os.path.join(ROOT, '..', "partner's logo")
OUT = os.path.join(ROOT, 'public', 'img', 'partners')

IVORY = (238, 234, 213)

# file, output id, display name, how the mark separates from its background
LOGOS = [
    ('amcham.jpg', 'amcham', 'AmCham Vietnam', 'bg'),
    ('asian-trails-logo.png', 'asian-trails', 'Asian Trails', 'bg'),
    ('Uber-logo.jpg', 'uber', 'Uber', 'bg'),
    ('logo-png.png', 'logitem', 'Logitem Vietnam', 'alpha'),
    ('hardwell.webp', 'hardwell', 'Hardwell', 'dark'),
    ('SaigonTourist1-ID4566.webp', 'saigontourist', 'Saigontourist', 'bg'),
    ('Vietravel_Logo.png', 'vietravel', 'Vietravel', 'bg'),
    ('66GOv1MTPI_1558584819logo dat viet sua 2018-03.png', 'datviet', 'Đất Việt Tour', 'bg'),
]


def alpha_from_bg(rgb):
    """Distance from the corner colour, so any flat background drops out."""
    h, w, _ = rgb.shape
    corners = np.array([rgb[2, 2], rgb[2, w - 3], rgb[h - 3, 2], rgb[h - 3, w - 3]], dtype=np.float32)
    bg = np.median(corners, axis=0)
    d = np.sqrt(((rgb - bg) ** 2).sum(axis=2))
    return np.clip((d - 40) / 70, 0, 1)


def alpha_from_dark(rgb):
    """Black lettering on a baked-in checkerboard: keep only the dark ink."""
    lum = rgb @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    return np.clip((150 - lum) / 90, 0, 1)


def main():
    os.makedirs(OUT, exist_ok=True)
    for file, oid, name, mode in LOGOS:
        im = Image.open(os.path.join(SRC, file)).convert('RGBA')
        if mode == 'bg':
            # Trim a thin border: JPEG edges and box outlines leave stray lines.
            w, h = im.size
            m = max(3, int(min(w, h) * 0.03))
            im = im.crop((m, m, w - m, h - m))
        a = np.asarray(im, dtype=np.float32)
        rgb, src_alpha = a[:, :, :3], a[:, :, 3] / 255
        if mode == 'alpha':
            alpha = src_alpha
        elif mode == 'dark':
            alpha = alpha_from_dark(rgb) * src_alpha
        else:
            alpha = alpha_from_bg(rgb) * src_alpha
        out = np.zeros_like(a)
        out[:, :, 0], out[:, :, 1], out[:, :, 2] = IVORY
        out[:, :, 3] = alpha * 255
        img = Image.fromarray(out.astype(np.uint8), 'RGBA')
        img = img.crop(img.getbbox())
        img.thumbnail((520, 140), Image.LANCZOS)
        img.save(os.path.join(OUT, f'{oid}.png'), optimize=True)
        print(oid, img.size)


if __name__ == '__main__':
    main()
