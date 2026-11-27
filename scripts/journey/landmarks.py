"""
Landmarks for the journey map: the sights named in data/journeys.ts, plus
Saigon landmarks and airports, geocoded with OpenStreetMap Nominatim
(ODbL, "© OpenStreetMap contributors"). One request per second, cached.

Each result must fall within `radius` km of the destination it belongs to,
or it is rejected and reported, never silently placed.

Writes data/journey/landmarks.json
Run:   python scripts/journey/landmarks.py
"""

import json
import math
import os
import sys
import time
import urllib.parse
import urllib.request

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
CACHE = os.path.join(ROOT, '.atlas-cache', 'nominatim.json')
OUT = os.path.join(ROOT, 'data', 'journey', 'landmarks.json')

W, S, E, N = 103.55, 8.3, 110.0, 13.0
PLATE_W = 1200
RAD = math.pi / 180
K = PLATE_W / ((E - W) * RAD)


def merc_y(lat):
    return math.log(math.tan(math.pi / 4 + lat * RAD / 2))


def project(lon, lat):
    return ((lon - W) * RAD * K, (merc_y(N) - merc_y(lat)) * K)


def km(a, b):
    (lo1, la1), (lo2, la2) = a, b
    h = math.sin((la2 - la1) * RAD / 2) ** 2 + math.cos(la1 * RAD) * math.cos(la2 * RAD) * math.sin((lo2 - lo1) * RAD / 2) ** 2
    return 2 * 6371 * math.asin(math.sqrt(h))


# Destination centres (from data/journeys.ts) used to validate results.
CENTRE = {
    'saigon': (106.70194, 10.77556), 'cu-chi': (106.4626, 11.1424), 'binh-duong': (106.65, 10.98),
    'bien-hoa': (106.818, 10.945), 'nhon-trach': (106.914, 10.716), 'long-thanh': (107.011, 10.776),
    'tan-an': (106.4137, 10.5359), 'can-gio': (106.94444, 10.42), 'tay-ninh': (106.1749, 11.3741),
    'vung-tau': (107.0843, 10.346), 'long-hai': (107.2386, 10.3884), 'ho-tram': (107.43333, 10.48333),
    'binh-chau': (107.548, 10.5636), 'phan-thiet': (108.10208, 10.92889), 'mui-ne': (108.287, 10.954),
    'phan-rang': (108.98858, 11.56432), 'nha-trang': (109.19432, 12.24507), 'bao-loc': (107.80772, 11.54798),
    'da-lat': (108.44193, 11.94646), 'my-tho': (106.35996, 10.36004), 'ben-tre': (106.3759, 10.2415),
    'vinh-long': (105.9722, 10.2537), 'can-tho': (105.78825, 10.03711), 'chau-doc': (105.11667, 10.70039),
    'rach-gia': (105.08091, 10.01245), 'ca-mau': (105.15242, 9.17682),
}

# id, destination, kind, vi, en, queries (tried in order), radius km
L = [
    # Saigon
    ('dinh-doc-lap', 'saigon', 'monument', 'Dinh Độc Lập', 'Independence Palace', ['Dinh Độc Lập', 'Independence Palace Ho Chi Minh'], 8),
    ('nha-tho-duc-ba', 'saigon', 'temple', 'Nhà thờ Đức Bà', 'Notre-Dame Cathedral', ['Nhà thờ Đức Bà Sài Gòn', 'Saigon Notre-Dame Cathedral Basilica'], 8),
    ('cho-ben-thanh', 'saigon', 'market', 'Chợ Bến Thành', 'Ben Thanh Market', ['Chợ Bến Thành'], 8),
    ('landmark-81', 'saigon', 'monument', 'Landmark 81', 'Landmark 81', ['Landmark 81'], 10),
    ('tan-son-nhat', 'saigon', 'airport', 'Sân bay Tân Sơn Nhất', 'Tan Son Nhat Airport', ['Cảng hàng không quốc tế Tân Sơn Nhất', 'Tan Son Nhat International Airport'], 12),
    # Airports elsewhere
    ('long-thanh-airport', 'long-thanh', 'airport', 'Sân bay Long Thành', 'Long Thanh Airport', ['Cảng hàng không quốc tế Long Thành', 'Long Thanh International Airport'], 15),
    ('lien-khuong', 'da-lat', 'airport', 'Sân bay Liên Khương', 'Lien Khuong Airport', ['Cảng hàng không Liên Khương', 'Lien Khuong Airport'], 35),
    ('cam-ranh', 'nha-trang', 'airport', 'Sân bay Cam Ranh', 'Cam Ranh Airport', ['Cảng hàng không quốc tế Cam Ranh', 'Cam Ranh International Airport'], 45),
    ('can-tho-airport', 'can-tho', 'airport', 'Sân bay Cần Thơ', 'Can Tho Airport', ['Cảng hàng không quốc tế Cần Thơ', 'Can Tho International Airport'], 15),
    # Củ Chi
    ('ben-duoc', 'cu-chi', 'monument', 'Địa đạo Bến Dược', 'Ben Duoc tunnels', ['Địa đạo Củ Chi', 'Khu di tích lịch sử Địa đạo Củ Chi', 'Cu Chi Tunnels'], 15),
    ('ben-dinh', 'cu-chi', 'monument', 'Địa đạo Bến Đình', 'Ben Dinh tunnels', ['Địa đạo Bến Đình', 'Ben Dinh Cu Chi Tunnels'], 20),
    # Bình Dương
    ('vsip', 'binh-duong', 'industry', 'VSIP', 'VSIP', ['Khu công nghiệp Việt Nam - Singapore', 'VSIP 1 Thuận An', 'VSIP'], 20),
    ('tuong-binh-hiep', 'binh-duong', 'craft', 'Làng sơn mài Tương Bình Hiệp', 'Tuong Binh Hiep lacquer village', ['Tương Bình Hiệp'], 15),
    ('dai-nam', 'binh-duong', 'park', 'Khu du lịch Đại Nam', 'Dai Nam park', ['Khu du lịch Đại Nam', 'Đại Nam Văn Hiến', 'Dai Nam Wonderland'], 20),
    # Biên Hòa
    ('amata', 'bien-hoa', 'industry', 'KCN Amata', 'Amata industrial park', ['Khu công nghiệp Amata', 'Amata Industrial Park Bien Hoa'], 15),
    ('van-mieu-tran-bien', 'bien-hoa', 'temple', 'Văn miếu Trấn Biên', 'Tran Bien Temple of Literature', ['Văn miếu Trấn Biên'], 15),
    ('buu-long', 'bien-hoa', 'nature', 'Bửu Long', 'Buu Long', ['Khu du lịch Bửu Long', 'Bửu Long'], 15),
    # Nhơn Trạch
    ('kcn-nhon-trach', 'nhon-trach', 'industry', 'KCN Nhơn Trạch', 'Nhon Trach industrial parks', ['Khu công nghiệp Nhơn Trạch 1', 'Khu công nghiệp Nhơn Trạch', 'Nhon Trach Industrial Park'], 20),
    # Tân An / Long An
    ('tan-lap', 'tan-an', 'nature', 'Làng nổi Tân Lập', 'Tan Lap floating village', ['Làng nổi Tân Lập', 'Tan Lap Floating Village'], 110),
    ('nha-tram-cot', 'tan-an', 'monument', 'Nhà Trăm Cột', 'Hundred-Column House', ['Nhà trăm cột', 'Nhà Trăm Cột Cần Đước'], 45),
    # Cần Giờ
    ('dao-khi', 'can-gio', 'nature', 'Đảo Khỉ', 'Monkey Island', ['Khu du lịch Đảo Khỉ Cần Giờ', 'Đảo Khỉ', 'Lâm viên Cần Giờ'], 30),
    ('vam-sat', 'can-gio', 'nature', 'Vàm Sát', 'Vam Sat', ['Khu du lịch sinh thái Vàm Sát', 'Vàm Sát'], 40),
    ('cho-hang-duong', 'can-gio', 'market', 'Chợ Hàng Dương', 'Hang Duong market', ['Chợ Hàng Dương', 'Bãi biển 30/4 Cần Giờ'], 15),
    # Tây Ninh
    ('toa-thanh', 'tay-ninh', 'temple', 'Tòa Thánh Cao Đài', 'Cao Dai Holy See', ['Tòa Thánh Tây Ninh', 'Cao Dai Holy See', 'Toà Thánh Cao Đài Tây Ninh'], 20),
    ('trang-bang', 'tay-ninh', 'food', 'Trảng Bàng', 'Trang Bang', ['Trảng Bàng'], 50),
    ('sun-world-ba-den', 'tay-ninh', 'park', 'Cáp treo Bà Đen', 'Ba Den cable car', ['Sun World Ba Den Mountain', 'Ga cáp treo Bà Đen', 'Khu du lịch núi Bà Đen'], 10),
    # Vũng Tàu
    ('chua-kito', 'vung-tau', 'monument', 'Tượng Chúa Kitô Vua', 'Christ the King', ['Tượng Chúa Kitô Vua', 'Christ of Vũng Tàu', 'Tượng Chúa Giang Tay'], 10),
    ('hai-dang-vung-tau', 'vung-tau', 'monument', 'Hải đăng Vũng Tàu', 'Vung Tau lighthouse', ['Hải đăng Vũng Tàu', 'Vung Tau Lighthouse'], 10),
    ('bai-sau', 'vung-tau', 'beach', 'Bãi Sau', 'Back Beach', ['Bãi Sau', 'Bãi Sau Vũng Tàu', 'Back Beach Vung Tau'], 10),
    # Long Hải
    ('dinh-co', 'long-hai', 'temple', 'Dinh Cô', 'Dinh Co shrine', ['Dinh Cô', 'Dinh Cô Long Hải'], 10),
    ('minh-dam', 'long-hai', 'nature', 'Núi Minh Đạm', 'Minh Dam mountain', ['Núi Minh Đạm', 'Khu căn cứ Minh Đạm'], 15),
    ('cho-phuoc-hai', 'long-hai', 'market', 'Chợ Phước Hải', 'Phuoc Hai market', ['Chợ Phước Hải'], 15),
    # Hồ Tràm
    ('the-bluffs', 'ho-tram', 'golf', 'The Bluffs Hồ Tràm', 'The Bluffs Ho Tram', ['The Bluffs Ho Tram Strip', 'The Bluffs Hồ Tràm', 'The Grand Hồ Tràm'], 15),
    ('rung-binh-chau', 'ho-tram', 'nature', 'Rừng Bình Châu – Phước Bửu', 'Binh Chau – Phuoc Buu forest', ['Khu bảo tồn thiên nhiên Bình Châu - Phước Bửu', 'Bình Châu - Phước Bửu'], 25),
    # Bình Châu
    ('suoi-khoang-binh-chau', 'binh-chau', 'nature', 'Suối khoáng nóng Bình Châu', 'Binh Chau hot springs', ['Suối khoáng nóng Bình Châu', 'Binh Chau Hot Springs', 'Khu du lịch suối khoáng nóng Bình Châu'], 15),
    ('ho-coc', 'binh-chau', 'beach', 'Biển Hồ Cốc', 'Ho Coc beach', ['Bãi biển Hồ Cốc', 'Hồ Cốc', 'Ho Coc Beach'], 20),
    # Phan Thiết
    ('ke-ga', 'phan-thiet', 'monument', 'Hải đăng Kê Gà', 'Ke Ga lighthouse', ['Hải đăng Kê Gà', 'Ke Ga Lighthouse', 'Mũi Kê Gà'], 40),
    ('po-sah-inu', 'phan-thiet', 'temple', 'Tháp Pô Sah Inư', 'Po Sah Inu towers', ['Tháp Pô Sah Inư', 'Po Sah Inu', 'Tháp Chàm Phú Hài'], 15),
    # Mũi Né
    ('doi-cat-bay', 'mui-ne', 'nature', 'Đồi cát bay', 'Red sand dunes', ['Đồi Cát Bay', 'Đồi cát đỏ Mũi Né', 'Red Sand Dunes'], 15),
    ('bau-trang', 'mui-ne', 'nature', 'Bàu Trắng', 'White dunes', ['Bàu Trắng', 'Đồi cát trắng Bàu Trắng', 'White Sand Dunes Mui Ne'], 50),
    ('suoi-tien', 'mui-ne', 'nature', 'Suối Tiên', 'Fairy Stream', ['Suối Tiên Mũi Né', 'Fairy Stream', 'Suối Tiên'], 15),
    # Phan Rang
    ('po-klong-garai', 'phan-rang', 'temple', 'Tháp Po Klong Garai', 'Po Klong Garai towers', ['Tháp Po Klong Garai', 'Po Klong Garai', 'Tháp Poklong Garai'], 15),
    ('vinh-hy', 'phan-rang', 'nature', 'Vịnh Vĩnh Hy', 'Vinh Hy bay', ['Vịnh Vĩnh Hy', 'Vĩnh Hy', 'Vinh Hy Bay'], 50),
    ('thai-an', 'phan-rang', 'farm', 'Vườn nho Thái An', 'Thai An vineyards', ['Vườn nho Thái An', 'Thái An'], 45),
    # Nha Trang
    ('hon-mun', 'nha-trang', 'nature', 'Hòn Mun', 'Hon Mun', ['Hòn Mun', 'Hon Mun Island'], 25),
    ('vinwonders-nt', 'nha-trang', 'park', 'VinWonders Nha Trang', 'VinWonders Nha Trang', ['VinWonders Nha Trang', 'Vinpearl Land Nha Trang', 'Hòn Tre'], 20),
    ('po-nagar', 'nha-trang', 'temple', 'Tháp Bà Ponagar', 'Po Nagar towers', ['Tháp Bà Ponagar', 'Po Nagar', 'Tháp Bà Nha Trang'], 10),
    # Bảo Lộc
    ('tam-chau', 'bao-loc', 'farm', 'Đồi chè Tâm Châu', 'Tam Chau tea hills', ['Đồi chè Tâm Châu', 'Tâm Châu'], 30),
    ('dambri', 'bao-loc', 'nature', 'Thác Dambri', 'Dambri falls', ['Thác Dambri', 'Dambri Waterfall', 'Thác Đambri'], 30),
    ('linh-quy', 'bao-loc', 'temple', 'Chùa Linh Quy Pháp Ấn', 'Linh Quy Phap An pagoda', ['Linh Quy Pháp Ấn', 'Chùa Linh Quy Pháp Ấn'], 35),
    # Đà Lạt
    ('xuan-huong', 'da-lat', 'nature', 'Hồ Xuân Hương', 'Xuan Huong lake', ['Hồ Xuân Hương', 'Xuan Huong Lake'], 10),
    ('vuon-hoa-da-lat', 'da-lat', 'nature', 'Vườn hoa thành phố', 'Da Lat Flower Park', ['Vườn hoa thành phố Đà Lạt', 'Vườn hoa Đà Lạt', 'Da Lat Flower Park'], 10),
    ('ga-da-lat', 'da-lat', 'monument', 'Ga Đà Lạt', 'Da Lat station', ['Ga Đà Lạt', 'Da Lat Railway Station'], 10),
    # Mỹ Tho
    ('thoi-son', 'my-tho', 'nature', 'Cù lao Thới Sơn', 'Thoi Son island', ['Cồn Thới Sơn', 'Thới Sơn', 'Cù lao Thới Sơn'], 15),
    ('vinh-trang', 'my-tho', 'temple', 'Chùa Vĩnh Tràng', 'Vinh Trang pagoda', ['Chùa Vĩnh Tràng', 'Vinh Trang Pagoda'], 10),
    # Bến Tre
    ('con-phung', 'ben-tre', 'nature', 'Cồn Phụng', 'Phung island', ['Cồn Phụng', 'Con Phung'], 15),
    ('cho-lach', 'ben-tre', 'farm', 'Chợ Lách', 'Cho Lach orchards', ['Chợ Lách'], 40),
    # Vĩnh Long
    ('an-binh', 'vinh-long', 'nature', 'Cù lao An Bình', 'An Binh island', ['Cù lao An Bình', 'An Bình, Long Hồ', 'An Bình'], 15),
    ('mang-thit', 'vinh-long', 'craft', 'Lò gạch Mang Thít', 'Mang Thit kilns', ['Mang Thít', 'Lò gạch Mang Thít'], 35),
    ('van-thanh-mieu-vl', 'vinh-long', 'temple', 'Văn Thánh Miếu', 'Temple of Literature', ['Văn Thánh Miếu Vĩnh Long', 'Văn Thánh Miếu'], 10),
    # Cần Thơ
    ('cai-rang', 'can-tho', 'market', 'Chợ nổi Cái Răng', 'Cai Rang floating market', ['Chợ nổi Cái Răng', 'Cai Rang Floating Market'], 15),
    ('binh-thuy', 'can-tho', 'monument', 'Nhà cổ Bình Thủy', 'Binh Thuy ancient house', ['Nhà cổ Bình Thủy', 'Binh Thuy Ancient House'], 15),
    ('ninh-kieu', 'can-tho', 'monument', 'Bến Ninh Kiều', 'Ninh Kieu wharf', ['Bến Ninh Kiều', 'Ninh Kiều Wharf', 'Công viên Ninh Kiều'], 10),
    # Châu Đốc
    ('ba-chua-xu', 'chau-doc', 'temple', 'Miếu Bà Chúa Xứ', 'Lady of the Realm temple', ['Miếu Bà Chúa Xứ Núi Sam', 'Miếu Bà Chúa Xứ', 'Ba Chua Xu Temple'], 10),
    ('tra-su', 'chau-doc', 'nature', 'Rừng tràm Trà Sư', 'Tra Su forest', ['Rừng tràm Trà Sư', 'Tra Su Cajuput Forest', 'Khu du lịch rừng tràm Trà Sư'], 30),
    ('cho-chau-doc', 'chau-doc', 'market', 'Chợ Châu Đốc', 'Chau Doc market', ['Chợ Châu Đốc', 'Chau Doc Market'], 8),
    # Rạch Giá
    ('ben-tau-rach-gia', 'rach-gia', 'ferry', 'Bến tàu Rạch Giá', 'Rach Gia ferry pier', ['Cảng tàu khách Rạch Giá', 'Bến tàu Rạch Giá', 'Rach Gia Ferry Terminal'], 10),
    ('nguyen-trung-truc', 'rach-gia', 'temple', 'Đền Nguyễn Trung Trực', 'Nguyen Trung Truc temple', ['Đền thờ Nguyễn Trung Trực', 'Đình Nguyễn Trung Trực'], 10),
    # Cà Mau
    ('mui-ca-mau', 'ca-mau', 'monument', 'Mũi Cà Mau', 'Ca Mau cape', ['Mũi Cà Mau', 'Đất Mũi', 'Cape Ca Mau'], 140),
    ('cho-noi-ca-mau', 'ca-mau', 'market', 'Chợ nổi Cà Mau', 'Ca Mau floating market', ['Chợ nổi Cà Mau', 'Chợ nổi Gành Hào Cà Mau'], 15),
    ('u-minh-ha', 'ca-mau', 'nature', 'Rừng U Minh Hạ', 'U Minh Ha forest', ['Vườn quốc gia U Minh Hạ', 'U Minh Hạ', 'U Minh Ha National Park'], 70),
]


# Geocoder misses, corrected by hand. Source noted for each.
MANUAL = {
    # Nominatim returned a different building of the same name.
    'landmark-81': ((106.72186, 10.79497), 'Wikipedia, "Landmark 81" (10°47′42″N 106°43′19″E)'),
    # Nominatim matched a courthouse ("Tòa án").
    'toa-thanh': ((106.1326, 11.2999), 'Wikipedia, "Tây Ninh Holy See" (11°18′N 106°08′E)'),
    # The market itself is not in OSM; Cần Thạnh town centre, where it stands.
    'cho-hang-duong': ((106.955, 10.411), 'lib/quote.ts place "cangio" (Cần Thạnh)'),
}


def load_cache():
    if os.path.exists(CACHE):
        with open(CACHE, encoding='utf-8') as f:
            return json.load(f)
    return {}


def save_cache(c):
    os.makedirs(os.path.dirname(CACHE), exist_ok=True)
    with open(CACHE, 'w', encoding='utf-8') as f:
        json.dump(c, f, ensure_ascii=False)


def search(q, centre, cache):
    key = f'{q}|{centre}'
    if key in cache:
        return cache[key]
    lon, lat = centre
    d = 1.2
    params = {
        'q': q, 'format': 'jsonv2', 'limit': 3, 'accept-language': 'vi',
        'countrycodes': 'vn', 'viewbox': f'{lon - d},{lat + d},{lon + d},{lat - d}', 'bounded': 1,
    }
    url = 'https://nominatim.openstreetmap.org/search?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={'User-Agent': 'hth-map-build/1.0 (static map build)'})
    time.sleep(1.1)
    try:
        with urllib.request.urlopen(req, timeout=40) as r:
            res = json.loads(r.read().decode('utf-8'))
    except Exception as e:  # noqa: BLE001
        print(f'   ! {q}: {e}', file=sys.stderr)
        res = []
    cache[key] = res
    save_cache(cache)
    return res


def main():
    cache = load_cache()
    out, missing = [], []
    for lid, dest, kind, vi, en, queries, radius in L:
        centre = CENTRE[dest]
        hit = None
        if lid in MANUAL:
            (mlon, mlat), note = MANUAL[lid]
            hit = ((mlon, mlat), 'manual: ' + note, '')
        for q in ([] if hit else queries):
            for r in search(q, centre, cache):
                p = (float(r['lon']), float(r['lat']))
                if km(p, centre) <= radius:
                    hit = (p, r.get('display_name', ''), q)
                    break
            if hit:
                break
        if not hit:
            missing.append(lid)
            print(f'MISSING {lid}', file=sys.stderr)
            continue
        (lon, lat), name, q = hit
        x, y = project(lon, lat)
        out.append({
            'id': lid, 'destination': dest, 'kind': kind, 'vi': vi, 'en': en,
            'lon': round(lon, 5), 'lat': round(lat, 5), 'x': round(x, 1), 'y': round(y, 1),
            'osm': name[:90],
        })
        print(f'ok  {lid:22s} {km((lon, lat), centre):5.1f} km  {name[:70]}', file=sys.stderr)
    with open(OUT, 'w', encoding='utf-8') as f:
        json.dump({'source': 'OpenStreetMap contributors (ODbL), geocoded with Nominatim', 'landmarks': out, 'missing': missing}, f, ensure_ascii=False, indent=1)
    print(f'{len(out)} placed, {len(missing)} missing: {missing}', file=sys.stderr)


if __name__ == '__main__':
    main()
