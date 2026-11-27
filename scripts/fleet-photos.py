"""
Fleet photography, from the folders HTH maintains next to the project
(../45 seaters, ../BMW 5 series, ../Ford Limousine DCAR, ../Kia Carnival,
../Solati Limousine DCAR). Every file in those folders is published: the
first entry for each vehicle is its hero, the rest its gallery.

Writes public/img/fleet/<file>.webp (longest side 1920 px, quality 82) and
data/fleetPhotos.json, which data/fleet.ts reads.

Run:  python scripts/fleet-photos.py      (needs Pillow)
"""

import json
import os

from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
SRC = os.path.abspath(os.path.join(ROOT, '..'))
OUT = os.path.join(ROOT, 'public', 'img', 'fleet')
DATA = os.path.join(ROOT, 'data', 'fleetPhotos.json')

# slug -> folder, then (source file, output name, alt vi, alt en); first is the hero.
PHOTOS = {
    'hyundai-solati-dcar-limousine': ('Solati Limousine DCAR', [
        ('hyundai1.png', 'solati-pair-hotel', 'Hai xe Solati D’Car của HTH trước sảnh khách sạn', 'Two HTH Solati D’Car vans at a hotel entrance'),
        ('limousine.png', 'solati-showroom', 'Hai xe Solati D’Car trong showroom', 'Two Solati D’Car vans in the showroom'),
        ('1786078633.png', 'solati-cabin-dusk', 'Khoang khách Solati D’Car lúc hoàng hôn', 'The Solati D’Car cabin at dusk'),
        ('limo2.png', 'solati-cabin-runway', 'Khoang khách Solati D’Car nhìn ra đường băng', 'The Solati D’Car cabin looking out to the runway'),
        ('limoo1.png', 'solati-cabin-door', 'Khoang khách Solati D’Car nhìn từ cửa trượt', 'The Solati D’Car cabin from the sliding door'),
        ('solati.png', 'solati-cabin-stars', 'Trần đèn sao trong khoang Solati D’Car', 'The star-light ceiling in the Solati D’Car'),
        ('solati3.png', 'solati-cabin-ceiling', 'Hàng ghế da và trần đèn LED trong Solati D’Car', 'Leather seats under the LED ceiling of the Solati D’Car'),
        ('solati1.png', 'solati-flowers', 'Hoa tươi đặt sẵn trên ghế Solati D’Car', 'Fresh flowers waiting on a Solati D’Car seat'),
        ('big trunk.png', 'solati-luggage-hold', 'Khoang hành lý Solati D’Car xếp vali nhôm và túi xách', 'The Solati D’Car luggage hold with aluminium cases and bags'),
    ]),
    'ford-transit-dcar-limousine': ('Ford Limousine DCAR', [
        ('ford12.png', 'transit-dcar-street', 'Ford Transit D’Car màu đen của HTH đỗ bên đường', 'HTH’s black Ford Transit D’Car parked on the street'),
        ('ford4.png', 'transit-dcar-door', 'Ford Transit D’Car mở cửa trượt, nhìn vào khoang ghế', 'The Ford Transit D’Car with its sliding door open'),
        ('ford.png', 'transit-dcar-cabin-door', 'Khoang khách Ford Transit D’Car nhìn từ cửa trượt', 'The Ford Transit D’Car cabin from the sliding door'),
        ('ford1.png', 'transit-dcar-aisle', 'Lối đi sàn gỗ giữa hai hàng ghế Ford Transit D’Car', 'The wood-floored aisle of the Ford Transit D’Car'),
        ('trunk.png', 'transit-dcar-golf-bags', 'Bốn bộ gậy golf trong cốp sau Ford Transit D’Car', 'Four golf bags in the Ford Transit D’Car rear hold'),
    ]),
    'bmw-520i': ('BMW 5 series', [
        ('bmw2.png', 'bmw-hotel-front', 'BMW 5 Series màu xanh đậm của HTH trước sảnh khách sạn', 'HTH’s dark blue BMW 5 Series at a hotel entrance'),
        ('w.png', 'bmw-hotel-rear', 'BMW 5 Series nhìn từ phía sau trước khách sạn', 'The BMW 5 Series from the rear at a hotel'),
        ('cockpit.png', 'bmw-cockpit-hth', 'Bảng điều khiển BMW 5 Series với logo HTH trên màn hình', 'BMW 5 Series dashboard with the HTH logo on screen'),
        ('interior.png', 'bmw-rear-seats', 'Hàng ghế sau bọc da đen của BMW 5 Series', 'The black leather rear seats of the BMW 5 Series'),
    ]),
    'kia-carnival': ('Kia Carnival', [
        ('carnival1111.png', 'carnival-front', 'Kia Carnival màu đen của HTH', 'HTH’s black Kia Carnival'),
        ('Luxury Minivan at Modern Lobby.png', 'carnival-lobby', 'Kia Carnival đỗ trước sảnh tòa nhà', 'The Kia Carnival outside a building lobby'),
        ('7ac0663f-169a-401f-bcfd-213aff9c669d.png', 'carnival-recline', 'Hành khách ngả ghế thương gia hàng hai Kia Carnival', 'A passenger reclined in the Kia Carnival’s second-row captain seat'),
        ('5fb36b80-e0dc-4e84-9a87-08da49c1a74b.png', 'carnival-dash', 'Bảng điều khiển Kia Carnival với logo HTH trên màn hình', 'Kia Carnival dashboard with the HTH logo on screen'),
        ('carnival-3.jpg', 'carnival-boot', 'Hàng ghế sau gập phẳng, chất vali trong Kia Carnival', 'Rear seats folded flat with cases loaded in the Kia Carnival'),
    ]),
    'hyundai-universe-45-cho': ('45 seaters', [
        ('White Limousine Coach at Hyundai Dealership.png', 'universe-dealership', 'Xe khách Hyundai Universe 45 chỗ của HTH trước đại lý Hyundai', 'An HTH Hyundai Universe 45-seat coach at a Hyundai dealership'),
        ('44.png', 'universe-terminal', 'Đội xe Universe của HTH xếp hàng trước nhà ga', 'A row of HTH Universe coaches outside a terminal'),
        ('HTH Limousine Bus Lineup editted.png', 'universe-lineup', 'Năm xe khách HTH xếp hàng trên phố', 'Five HTH coaches lined up in the city'),
        ('edited.png', 'universe-roadside', 'Hai xe khách Universe của HTH trên đường hàng cây', 'Two HTH Universe coaches on a tree-lined road'),
        ('23481.png', 'universe-front', 'Xe khách Universe của HTH nhìn từ phía trước', 'An HTH Universe coach from the front'),
        ('1786078114.png', 'universe-cabin-day', 'Khoang khách Universe với ghế da hai tông màu và rèm cửa', 'The Universe cabin: two-tone leather seats and curtains'),
        ('interior.png', 'universe-cabin-evening', 'Khoang khách Universe buổi tối dưới đèn trần ấm', 'The Universe cabin at night under warm ceiling light'),
    ]),
}


def main():
    os.makedirs(OUT, exist_ok=True)
    data = {}
    for slug, (folder, items) in PHOTOS.items():
        src_dir = os.path.join(SRC, folder)
        listed = {i[0] for i in items}
        on_disk = {f for f in os.listdir(src_dir) if not f.startswith('.')}
        missing = on_disk - listed
        if missing:
            raise SystemExit(f'{folder}: not published yet: {sorted(missing)}')
        photos = []
        for file, name, alt, alt_en in items:
            im = Image.open(os.path.join(src_dir, file)).convert('RGB')
            im.thumbnail((1920, 1920), Image.LANCZOS)
            im.save(os.path.join(OUT, f'{name}.webp'), 'WEBP', quality=82, method=6)
            photos.append({'src': f'/img/fleet/{name}.webp', 'alt': alt, 'altEn': alt_en,
                           'width': im.width, 'height': im.height})
        data[slug] = photos
        print(f'{slug}: {len(photos)} photos')
    with open(DATA, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
