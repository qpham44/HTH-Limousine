"""
Photographs for the 3D journey map: one picture per destination, landmark
and summit, taken from the lead image of its Wikipedia article.

Only files hosted on Wikimedia Commons are used, so every picture carries a
free licence (CC BY, CC BY-SA, CC0 or public domain). The author, licence and
source page are written next to the picture so the site can credit them.

Writes
  public/img/journey/photos/<id>.webp   square 256 px thumbnails
  data/journey/photos.json              credits, keyed by the same id
Run:   python scripts/journey/photos.py
"""

import html
import io
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request

from PIL import Image, ImageOps

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
CACHE = os.path.join(ROOT, '.atlas-cache', 'wiki.json')
OUT_DIR = os.path.join(ROOT, 'public', 'img', 'journey', 'photos')
OUT_JSON = os.path.join(ROOT, 'data', 'journey', 'photos.json')
UA = 'journey-map-photo-builder/1.0 (static site build script)'
SIZE = 128

# id -> candidate articles, tried in order. ('en', title) or ('vi', title).
# A '@File:...' entry pins a specific Commons file instead of an article.
SUBJECTS: dict[str, list[tuple[str, str]]] = {
    # Destinations and the starting point
    'saigon': [('en', 'Ho Chi Minh City Hall'), ('en', 'Ho Chi Minh City')],
    'cu-chi': [('en', 'Củ Chi tunnels')],
    'binh-duong': [('vi', 'Khu du lịch Đại Nam'), ('en', 'Thủ Dầu Một')],
    'bien-hoa': [('vi', 'Văn miếu Trấn Biên'), ('en', 'Biên Hòa')],
    'nhon-trach': [('vi', 'Nhơn Trạch'), ('en', 'Nhơn Trạch district')],
    'long-thanh': [('en', 'Long Thành International Airport')],
    'tan-an': [('vi', 'Tân An'), ('en', 'Tân An')],
    'can-gio': [('en', 'Cần Giờ Mangrove Biosphere Reserve'), ('vi', 'Rừng Sác'), ('en', 'Cần Giờ district')],
    'tay-ninh': [('en', 'Bà Đen Mountain'), ('vi', 'Núi Bà Đen')],
    'vung-tau': [('en', 'Vũng Tàu')],
    'long-hai': [('vi', 'Long Hải (thị trấn)'), ('vi', 'Dinh Cô (Long Hải)')],
    'ho-tram': [('vi', 'Hồ Tràm'), ('vi', 'Phước Thuận, Xuyên Mộc')],
    'binh-chau': [('vi', 'Suối khoáng nóng Bình Châu'), ('vi', 'Bình Châu, Xuyên Mộc')],
    'phan-thiet': [('en', 'Phan Thiết')],
    'mui-ne': [('en', 'Mũi Né')],
    'phan-rang': [('en', 'Po Klong Garai'), ('en', 'Phan Rang–Tháp Chàm')],
    'nha-trang': [('en', 'Nha Trang')],
    'bao-loc': [('en', 'Bảo Lộc'), ('vi', 'Bảo Lộc')],
    'da-lat': [('en', 'Da Lat')],
    'my-tho': [('en', 'Mỹ Tho')],
    'ben-tre': [('en', 'Bến Tre')],
    'vinh-long': [('en', 'Vĩnh Long')],
    'can-tho': [('en', 'Cái Răng floating market'), ('en', 'Cần Thơ')],
    'chau-doc': [('vi', 'Miếu Bà Chúa Xứ Núi Sam'), ('en', 'Châu Đốc')],
    'rach-gia': [('en', 'Rạch Giá')],
    'ca-mau': [('en', 'Cà Mau Cape'), ('vi', 'Mũi Cà Mau'), ('en', 'Cà Mau')],

    # Landmarks (ids from data/journey/landmarks.json)
    'dinh-doc-lap': [('en', 'Independence Palace')],
    'nha-tho-duc-ba': [('en', 'Notre-Dame Cathedral Basilica of Saigon')],
    'cho-ben-thanh': [('en', 'Bến Thành Market')],
    'landmark-81': [('en', 'Landmark 81')],
    'tan-son-nhat': [('en', 'Tan Son Nhat International Airport')],
    'long-thanh-airport': [('en', 'Long Thành International Airport')],
    'lien-khuong': [('en', 'Lien Khuong International Airport')],
    'cam-ranh': [('en', 'Cam Ranh International Airport')],
    'can-tho-airport': [('en', 'Can Tho International Airport')],
    'ben-duoc': [('vi', 'Địa đạo Bến Dược'), ('en', 'Củ Chi tunnels')],
    'ben-dinh': [('vi', 'Địa đạo Bến Đình'), ('vi', 'Địa đạo Củ Chi')],
    'vsip': [('en', 'Vietnam-Singapore Industrial Park')],
    'tuong-binh-hiep': [('vi', 'Làng sơn mài Tương Bình Hiệp')],
    'dai-nam': [('vi', 'Khu du lịch Đại Nam'), ('en', 'Đại Nam Văn Hiến Tourist Area')],
    'amata': [],
    'van-mieu-tran-bien': [('vi', 'Văn miếu Trấn Biên')],
    'buu-long': [('vi', 'Khu du lịch Bửu Long')],
    'kcn-nhon-trach': [],
    'tan-lap': [('vi', 'Làng nổi Tân Lập')],
    'nha-tram-cot': [('vi', 'Nhà Trăm Cột')],
    'dao-khi': [('vi', 'Lâm Viên Cần Giờ'), ('vi', 'Đảo Khỉ (Cần Giờ)')],
    'vam-sat': [('vi', 'Khu du lịch sinh thái Vàm Sát')],
    'cho-hang-duong': [],
    'toa-thanh': [('en', 'Cao Đài Holy See'), ('en', 'Tây Ninh Holy See')],
    'trang-bang': [('vi', 'Bánh canh Trảng Bàng'), ('vi', 'Bánh tráng phơi sương')],
    'sun-world-ba-den': [('vi', 'Núi Bà Đen'), ('en', 'Bà Đen Mountain')],
    'chua-kito': [('en', 'Christ of Vũng Tàu')],
    'hai-dang-vung-tau': [('vi', 'Hải đăng Vũng Tàu')],
    'bai-sau': [('vi', 'Bãi Sau')],
    'dinh-co': [('vi', 'Dinh Cô (Long Hải)'), ('vi', 'Dinh Cô')],
    'minh-dam': [('vi', 'Núi Minh Đạm'), ('vi', 'Căn cứ Minh Đạm')],
    'cho-phuoc-hai': [],
    'the-bluffs': [('en', 'The Bluffs Ho Tram Strip')],
    'rung-binh-chau': [('vi', 'Khu bảo tồn thiên nhiên Bình Châu – Phước Bửu')],
    'suoi-khoang-binh-chau': [('vi', 'Suối khoáng nóng Bình Châu')],
    'ho-coc': [('vi', 'Bãi biển Hồ Cốc'), ('vi', 'Hồ Cốc')],
    'ke-ga': [('en', 'Kê Gà Lighthouse'), ('vi', 'Hải đăng Kê Gà')],
    'po-sah-inu': [('en', 'Po Sah Inu')],
    'doi-cat-bay': [('vi', 'Đồi cát bay'), ('vi', 'Đồi Cát Bay Mũi Né')],
    'bau-trang': [('vi', 'Bàu Trắng')],
    'suoi-tien': [('vi', 'Suối Tiên (Mũi Né)'), ('vi', 'Suối Tiên (Bình Thuận)')],
    'po-klong-garai': [('en', 'Po Klong Garai')],
    'vinh-hy': [('vi', 'Vịnh Vĩnh Hy')],
    'hon-mun': [('vi', 'Hòn Mun'), ('vi', 'Khu bảo tồn biển Hòn Mun')],
    'vinwonders-nt': [('en', 'VinWonders Nha Trang'), ('vi', 'VinWonders Nha Trang'), ('en', 'Vinpearl Cable Car')],
    'po-nagar': [('en', 'Po Nagar')],
    'dambri': [('vi', 'Thác Đambri'), ('vi', 'Thác Dambri')],
    'linh-quy': [('vi', 'Chùa Linh Quy Pháp Ấn')],
    'xuan-huong': [('en', 'Xuân Hương Lake')],
    'vuon-hoa-da-lat': [('vi', 'Vườn hoa thành phố Đà Lạt')],
    'ga-da-lat': [('en', 'Đà Lạt railway station')],
    'thoi-son': [('vi', 'Cù lao Thới Sơn')],
    'vinh-trang': [('en', 'Vĩnh Tràng Temple')],
    'con-phung': [('vi', 'Cồn Phụng')],
    'cho-lach': [('vi', 'Chợ Lách'), ('en', 'Chợ Lách district')],
    'mang-thit': [('vi', 'Làng gốm Mang Thít'), ('vi', 'Mang Thít')],
    'van-thanh-mieu-vl': [('vi', 'Văn Thánh Miếu Vĩnh Long')],
    'cai-rang': [('en', 'Cái Răng floating market')],
    'binh-thuy': [('vi', 'Nhà cổ Bình Thủy')],
    'ninh-kieu': [('vi', 'Bến Ninh Kiều')],
    'ba-chua-xu': [('vi', 'Miếu Bà Chúa Xứ Núi Sam'), ('en', 'Lady of the Realm Temple')],
    'tra-su': [('vi', 'Rừng tràm Trà Sư')],
    'cho-chau-doc': [],
    'ben-tau-rach-gia': [],
    'nguyen-trung-truc': [('vi', 'Đền thờ Nguyễn Trung Trực (Rạch Giá)'), ('vi', 'Đình Nguyễn Trung Trực')],
    'mui-ca-mau': [('en', 'Cà Mau Cape'), ('vi', 'Mũi Cà Mau')],
    'u-minh-ha': [('vi', 'Vườn quốc gia U Minh Hạ'), ('en', 'U Minh Hạ National Park')],

    # Summits (ids from data/journey/peaks.json, prefixed as in the pins)
    'peak:bidoup': [('en', 'Bidoup Núi Bà National Park')],
    'peak:langbiang': [('en', 'Lang Biang'), ('vi', 'Núi Lang Biang')],
    'peak:ba-den': [('en', 'Bà Đen Mountain')],
    'peak:chua-chan': [('vi', 'Núi Chứa Chan')],
    'peak:nui-cam': [('vi', 'Núi Cấm')],
    'peak:ta-cu': [('vi', 'Núi Tà Cú')],
    'peak:nui-chua': [('en', 'Núi Chúa National Park')],
}

# When no article lead image is usable: search Commons directly. Every result
# is checked by eye on the contact sheet before it ships.
COMMONS_SEARCH = {
    'binh-chau': 'Bình Châu hot spring',
    'my-tho': 'Mỹ Tho Tiền river',
    'vinh-long': 'Vĩnh Long river',
    'cai-rang': 'Cai Rang floating market',
    'ga-da-lat': 'Da Lat railway station',
    'po-sah-inu': 'Po Sah Inu',
    'doi-cat-bay': 'Mui Ne red sand dunes',
    'hon-mun': 'Hon Mun Nha Trang',
    'linh-quy': 'Linh Quy Phap An',
    'con-phung': 'Con Phung Ben Tre',
    'binh-thuy': 'Binh Thuy ancient house',
    'nguyen-trung-truc': 'Nguyen Trung Truc temple Rach Gia',
    'tan-lap': 'Tan Lap floating village',
    'dao-khi': 'Can Gio monkey island',
    'suoi-khoang-binh-chau': 'Bình Châu hot spring',
    'mang-thit': 'Mang Thit kiln',
}

# Destinations (and the starting point) also get a 16:9 picture for the panel.
WIDE = {
    'saigon', 'cu-chi', 'binh-duong', 'bien-hoa', 'nhon-trach', 'long-thanh', 'tan-an', 'can-gio',
    'tay-ninh', 'vung-tau', 'long-hai', 'ho-tram', 'binh-chau', 'phan-thiet', 'mui-ne', 'phan-rang',
    'nha-trang', 'bao-loc', 'da-lat', 'my-tho', 'ben-tre', 'vinh-long', 'can-tho', 'chau-doc',
    'rach-gia', 'ca-mau',
}

# Lead images that are maps, flags, seals or diagrams rather than photographs.
SKIP_FILE = re.compile(r'(\.svg$|map|flag|seal|logo|emblem|location|locator|coat_of_arms|vị_trí|bản_đồ|huy_hiệu)', re.I)


def load_cache() -> dict:
    if os.path.exists(CACHE):
        with open(CACHE, encoding='utf-8') as f:
            return json.load(f)
    return {}


def save_cache(cache: dict) -> None:
    os.makedirs(os.path.dirname(CACHE), exist_ok=True)
    with open(CACHE, 'w', encoding='utf-8') as f:
        json.dump(cache, f, ensure_ascii=False)


def get_json(url: str, cache: dict) -> dict:
    if url in cache:
        return cache[url]
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    for attempt in range(6):
        try:
            with urllib.request.urlopen(req, timeout=40) as r:
                data = json.loads(r.read().decode('utf-8'))
            cache[url] = data
            time.sleep(1.2)
            return data
        except Exception as e:  # noqa: BLE001
            print(f'  retry {attempt + 1}: {e}', file=sys.stderr)
            time.sleep(20 * (attempt + 1))
    raise RuntimeError(url)


def lead_image(lang: str, title: str, cache: dict) -> str | None:
    q = urllib.parse.urlencode({
        'action': 'query', 'format': 'json', 'formatversion': 2, 'redirects': 1,
        'prop': 'pageimages', 'piprop': 'name', 'titles': title,
    })
    data = get_json(f'https://{lang}.wikipedia.org/w/api.php?{q}', cache)
    pages = data.get('query', {}).get('pages', [])
    if not pages or pages[0].get('missing'):
        return None
    return pages[0].get('pageimage')


def commons_info(name: str, cache: dict) -> dict | None:
    q = urllib.parse.urlencode({
        'action': 'query', 'format': 'json', 'formatversion': 2,
        'prop': 'imageinfo', 'iiprop': 'url|extmetadata|size', 'iiurlwidth': 480,
        'titles': f'File:{name}',
    })
    data = get_json(f'https://commons.wikimedia.org/w/api.php?{q}', cache)
    pages = data.get('query', {}).get('pages', [])
    if not pages or pages[0].get('missing') or 'imageinfo' not in pages[0]:
        return None  # not on Commons: possibly non-free, never used
    return pages[0]['imageinfo'][0]


def clean(s: str) -> str:
    s = re.sub(r'<[^>]+>', '', s or '')
    return html.unescape(s).strip()


def fetch_bytes(url: str) -> bytes:
    req = urllib.request.Request(url, headers={'User-Agent': UA})
    for attempt in range(6):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read()
        except Exception as e:  # noqa: BLE001
            print(f'  retry {attempt + 1}: {e}', file=sys.stderr)
            time.sleep(20 * (attempt + 1))
    raise RuntimeError(url)


def commons_search(query: str, cache: dict) -> list[str]:
    """Photographs on Commons matching a query, best match first (JPEG only)."""
    q = urllib.parse.urlencode({
        'action': 'query', 'format': 'json', 'formatversion': 2,
        'list': 'search', 'srnamespace': 6, 'srlimit': 8, 'srsearch': f'{query} filetype:bitmap',
    })
    data = get_json(f'https://commons.wikimedia.org/w/api.php?{q}', cache)
    out = []
    for hit in data.get('query', {}).get('search', []):
        title = hit['title'].removeprefix('File:')
        if re.search(r'\.jpe?g$', title, re.I):
            out.append(title.replace(' ', '_'))
    return out[:4]


def main() -> None:
    cache = load_cache()
    os.makedirs(OUT_DIR, exist_ok=True)
    credits: dict[str, dict] = {}
    try:
        for sid, candidates in SUBJECTS.items():
            picked = None
            tries: list[tuple[str, str, str | None]] = [(lang, title, None) for lang, title in candidates]
            if sid in COMMONS_SEARCH:
                q = COMMONS_SEARCH[sid]
                tries += [('commons', q, n) for n in commons_search(q, cache)]
            for lang, title, direct in tries:
                name = direct or lead_image(lang, title, cache)
                if not name or SKIP_FILE.search(name):
                    continue
                info = commons_info(name, cache)
                if not info:
                    continue
                meta = info.get('extmetadata', {})
                lic = clean(meta.get('LicenseShortName', {}).get('value', ''))
                if not re.search(r'(CC|Public domain|PD|cc0)', lic, re.I):
                    continue
                picked = (lang, title, name, info, lic, meta)
                break
            if not picked:
                print(f'{sid:24s} -- no free photo', file=sys.stderr)
                continue
            lang, title, name, info, lic, meta = picked
            fname = sid.replace(':', '-') + '.webp'
            out = os.path.join(OUT_DIR, fname)
            if not os.path.exists(out):
                raw = fetch_bytes(info['thumburl'])
                im = Image.open(io.BytesIO(raw)).convert('RGB')
                im = ImageOps.fit(im, (SIZE, SIZE), Image.LANCZOS, centering=(0.5, 0.45))
                im.save(out, 'WEBP', quality=80, method=6)
                time.sleep(1.5)
            credits[sid] = {
                'src': f'/img/journey/photos/{fname}',
                'file': name,
                'author': clean(meta.get('Artist', {}).get('value', ''))[:120] or 'Wikimedia Commons',
                'license': lic,
                'page': info.get('descriptionurl', ''),
                'article': '' if lang == 'commons' else f'https://{lang}.wikipedia.org/wiki/{urllib.parse.quote(title.replace(" ", "_"))}',
            }
            # A wider picture for the header of the destination card.
            if sid in WIDE:
                wname = sid + '-wide.webp'
                wout = os.path.join(OUT_DIR, wname)
                if not os.path.exists(wout):
                    url = re.sub(r'/\d+px-', '/960px-', info['thumburl'])
                    try:
                        raw = fetch_bytes(url)
                    except RuntimeError:
                        raw = fetch_bytes(info['thumburl'])
                    im = Image.open(io.BytesIO(raw)).convert('RGB')
                    im = ImageOps.fit(im, (880, 495), Image.LANCZOS, centering=(0.5, 0.5))
                    im.save(wout, 'WEBP', quality=78, method=6)
                    time.sleep(1.5)
                credits[sid]['wide'] = f'/img/journey/photos/{wname}'
            print(f'{sid:24s} {lic:14s} {name}', file=sys.stderr)
    finally:
        save_cache(cache)
    with open(OUT_JSON, 'w', encoding='utf-8') as f:
        json.dump({
            'source': 'Lead images of Wikipedia articles, hosted on Wikimedia Commons under free licences.',
            'photos': credits,
        }, f, ensure_ascii=False, indent=1)
    print(f'{len(credits)} photos', file=sys.stderr)


if __name__ == '__main__':
    main()
