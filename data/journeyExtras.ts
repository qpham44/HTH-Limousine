/**
 * Trip-planning detail for the journey map, kept beside data/journeys.ts so
 * the descriptive copy and the planning numbers can be edited separately.
 *
 * `pins` lists, for each of the three highlights, the landmark id in
 * data/journey/landmarks.json that marks it on the map (null when the
 * highlight is a dish or a service, not a place).
 */

export type GoodFor = 'family' | 'kids' | 'couple' | 'friends' | 'elders' | 'business' | 'golf' | 'nature' | 'culture' | 'food';

type Text = { vi: string; en: string };

export interface JourneyExtra {
  /** Recommended nights away. 0 = back the same day. */
  nights: 0 | 1 | 2;
  goodFor: GoodFor[];
  pins: [string | null, string | null, string | null];
  /** Destinations worth a stop on the way, by journey id. */
  stops?: string[];
  /** One dish to look for. */
  eat?: Text;
}

export const goodForLabel: Record<GoodFor, Text> = {
  family: { vi: 'Gia đình', en: 'Families' },
  kids: { vi: 'Có trẻ nhỏ', en: 'Young children' },
  couple: { vi: 'Cặp đôi', en: 'Couples' },
  friends: { vi: 'Nhóm bạn', en: 'Friends' },
  elders: { vi: 'Người lớn tuổi', en: 'Older travellers' },
  business: { vi: 'Công tác', en: 'Business' },
  golf: { vi: 'Golf', en: 'Golf' },
  nature: { vi: 'Thiên nhiên', en: 'Nature' },
  culture: { vi: 'Văn hóa, lịch sử', en: 'History and culture' },
  food: { vi: 'Ăn uống', en: 'Food' },
};

export const extras: Record<string, JourneyExtra> = {
  'cu-chi': {
    nights: 0, goodFor: ['family', 'friends', 'culture'], pins: ['ben-duoc', 'ben-duoc', null],
    eat: { vi: 'Bò tơ Củ Chi cuốn bánh tráng', en: 'Cu Chi veal in rice paper' },
  },
  'binh-duong': {
    nights: 0, goodFor: ['business', 'family', 'kids'], pins: ['vsip', 'tuong-binh-hiep', 'dai-nam'],
  },
  'bien-hoa': {
    nights: 0, goodFor: ['business', 'culture'], pins: ['amata', 'van-mieu-tran-bien', 'buu-long'],
  },
  'nhon-trach': {
    nights: 0, goodFor: ['business'], pins: ['kcn-nhon-trach', 'long-thanh-airport', null],
  },
  'long-thanh': {
    nights: 0, goodFor: ['business', 'family', 'elders'], pins: ['long-thanh-airport', 'long-thanh-airport', null],
  },
  'tan-an': {
    nights: 0, goodFor: ['family', 'nature', 'culture'], pins: ['tan-lap', 'nha-tram-cot', null],
  },
  'can-gio': {
    nights: 0, goodFor: ['family', 'kids', 'nature', 'food'], pins: ['vam-sat', 'dao-khi', 'cho-hang-duong'],
    eat: { vi: 'Hải sản chợ Hàng Dương', en: 'Seafood from Hang Duong market' },
  },
  'tay-ninh': {
    nights: 0, goodFor: ['family', 'elders', 'culture'], pins: ['sun-world-ba-den', 'toa-thanh', 'trang-bang'],
    stops: ['cu-chi'],
    eat: { vi: 'Bánh tráng phơi sương Trảng Bàng', en: 'Trang Bang dew-dried rice paper' },
  },
  'vung-tau': {
    nights: 0, goodFor: ['family', 'kids', 'couple', 'friends', 'food'], pins: ['chua-kito', 'hai-dang-vung-tau', 'bai-sau'],
    eat: { vi: 'Bánh khọt, lẩu cá đuối', en: 'Banh khot, stingray hotpot' },
  },
  'long-hai': {
    nights: 1, goodFor: ['family', 'elders', 'food'], pins: ['dinh-co', 'minh-dam', 'cho-phuoc-hai'],
    eat: { vi: 'Hải sản chợ Phước Hải', en: 'Seafood from Phuoc Hai market' },
  },
  'ho-tram': {
    nights: 1, goodFor: ['couple', 'family', 'golf'], pins: ['the-bluffs', 'rung-binh-chau', null],
    stops: ['long-hai'],
  },
  'binh-chau': {
    nights: 1, goodFor: ['family', 'elders', 'nature'], pins: ['suoi-khoang-binh-chau', 'suoi-khoang-binh-chau', 'ho-coc'],
    stops: ['ho-tram'],
  },
  'phan-thiet': {
    nights: 1, goodFor: ['family', 'couple', 'culture'], pins: ['ke-ga', 'po-sah-inu', null],
    eat: { vi: 'Bánh căn, lẩu thả', en: 'Banh can, lau tha' },
  },
  'mui-ne': {
    nights: 1, goodFor: ['couple', 'friends', 'family', 'nature'], pins: ['doi-cat-bay', 'suoi-tien', null],
    stops: ['phan-thiet'],
    eat: { vi: 'Hải sản làng chài Mũi Né', en: 'Seafood at the Mui Ne fishing village' },
  },
  'phan-rang': {
    nights: 2, goodFor: ['couple', 'friends', 'culture', 'nature'], pins: ['po-klong-garai', 'vinh-hy', null],
    stops: ['phan-thiet'],
    eat: { vi: 'Bánh căn, thịt dê', en: 'Banh can and goat' },
  },
  'nha-trang': {
    nights: 2, goodFor: ['family', 'kids', 'couple', 'friends'], pins: ['hon-mun', 'vinwonders-nt', 'po-nagar'],
    stops: ['phan-rang'],
    eat: { vi: 'Bún chả cá, nem nướng Ninh Hòa', en: 'Fish-cake noodles, Ninh Hoa grilled pork' },
  },
  'bao-loc': {
    nights: 1, goodFor: ['couple', 'elders', 'nature'], pins: [null, 'dambri', 'linh-quy'],
  },
  'da-lat': {
    nights: 2, goodFor: ['family', 'couple', 'friends', 'elders', 'nature'], pins: ['peak:langbiang', 'xuan-huong', 'ga-da-lat'],
    stops: ['bao-loc'],
    eat: { vi: 'Bánh căn, lẩu gà lá é', en: 'Banh can, chicken hotpot with e leaves' },
  },
  'my-tho': {
    nights: 0, goodFor: ['family', 'elders', 'culture', 'food'], pins: ['thoi-son', 'vinh-trang', null],
    eat: { vi: 'Hủ tiếu Mỹ Tho', en: 'Hu tieu My Tho' },
  },
  'ben-tre': {
    nights: 0, goodFor: ['family', 'kids', 'nature'], pins: [null, 'con-phung', 'cho-lach'],
    stops: ['my-tho'],
    eat: { vi: 'Cá tai tượng chiên xù, kẹo dừa', en: 'Fried elephant-ear fish, coconut candy' },
  },
  'vinh-long': {
    nights: 1, goodFor: ['family', 'couple', 'nature'], pins: [null, 'mang-thit', 'van-thanh-mieu-vl'],
    stops: ['my-tho'],
  },
  'can-tho': {
    nights: 1, goodFor: ['family', 'elders', 'culture', 'food'], pins: ['cai-rang', 'binh-thuy', 'ninh-kieu'],
    stops: ['my-tho', 'vinh-long'],
    eat: { vi: 'Bánh xèo, lẩu mắm', en: 'Banh xeo, fermented-fish hotpot' },
  },
  'chau-doc': {
    nights: 2, goodFor: ['family', 'elders', 'culture', 'nature'], pins: ['ba-chua-xu', 'tra-su', 'cho-chau-doc'],
    stops: ['can-tho'],
    eat: { vi: 'Bún cá Châu Đốc, mắm', en: 'Chau Doc fish noodles, fermented fish' },
  },
  'rach-gia': {
    nights: 1, goodFor: ['family', 'friends'], pins: ['ben-tau-rach-gia', 'nguyen-trung-truc', null],
    stops: ['can-tho'],
  },
  'ca-mau': {
    nights: 2, goodFor: ['friends', 'nature', 'food'], pins: ['mui-ca-mau', null, 'u-minh-ha'],
    stops: ['can-tho'],
    eat: { vi: 'Cua Cà Mau', en: 'Ca Mau mud crab' },
  },
};
