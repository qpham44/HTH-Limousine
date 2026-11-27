import type { VehicleKey } from '@/lib/quote';
import type { RateColumn } from '@/data/rates';
import fleetPhotos from '@/data/fleetPhotos.json';

/**
 * Fleet data. Every claim here is either visible in the photograph or was
 * confirmed by HTH. No model years, no invented on-board equipment —
 * per the interview of 2 Sep 2026, specifications stay out until HTH supplies them.
 */

export interface Vehicle {
  slug: string;
  key: Exclude<VehicleKey, 'auto'>;
  name: string;
  nameEn: string;
  category: string;
  categoryEn: string;
  seats: string;
  seatsEn: string;
  luggage: string;
  luggageEn: string;
  /** One honest sentence about what the car is for. */
  blurb: string;
  blurbEn: string;
  intro: string;
  introEn: string;
  hero: string;
  heroAlt: string;
  gallery: { src: string; alt: string; altEn: string }[];
  /** Anchored to the published reference table. */
  from: { label: string; labelEn: string; amount: number };
  /** Column in the published rate table, when the survey covers this class. */
  rateColumn?: RateColumn;
  /** Services this vehicle is actually the right answer for. */
  services: string[];
}

const baseFleet: Vehicle[] = [
  {
    slug: 'hyundai-solati-dcar-limousine',
    key: 'solati',
    name: 'Hyundai Solati D’Car',
    nameEn: 'Hyundai Solati D’Car',
    category: 'Limousine D’Car · 9–12 chỗ',
    categoryEn: 'D’Car limousine · 9–12 seats',
    seats: '9 – 12 khách',
    seatsEn: '9 – 12 passengers',
    luggage: 'Khoang hành lý riêng phía sau, chứa được 5 vali lớn và túi xách',
    luggageEn: 'A separate rear hold that takes five large cases and soft bags',
    blurb: 'Trần cao, có thể đứng thẳng trong khoang. Dòng xe được khách hàng đặt nhiều nhất.',
    blurbEn: 'A high roof you can stand up in. The car our customers ask for most.',
    intro:
      'Ghế da ngả sâu, bàn gỗ giữa hai hàng ghế và khoang hành lý tách riêng phía sau. Xe phù hợp cả những chặng ngắn trong nội thành lẫn cung đường dài Sài Gòn – Đà Lạt, để khách vẫn thoải mái, tỉnh táo khi xuống xe.',
    introEn:
      'Deep-reclining leather seats, a wood table between the rows, and a separate luggage hold at the back. It handles a city morning and a Saigon–Đà Lạt run equally well.',
    hero: '/img/solati.webp',
    heroAlt: 'Hai xe Hyundai Solati D’Car Limousine của HTH đỗ trước sảnh khách sạn',
    gallery: [
      { src: '/img/solati-cabin.webp', alt: 'Khoang khách Solati D’Car với ghế da ngả sâu', altEn: 'Solati D’Car cabin with reclining leather seats' },
      { src: '/img/solati-luggage.webp', alt: 'Khoang hành lý phía sau Solati D’Car xếp năm vali lớn', altEn: 'Solati D’Car rear hold loaded with five large cases' },
      { src: '/img/solati-cabin-airport.webp', alt: 'Nội thất Solati D’Car nhìn ra đường băng lúc hoàng hôn', altEn: 'Solati D’Car cabin looking out onto the apron at dusk' },
    ],
    from: { label: 'Đón/tiễn sân bay', labelEn: 'Airport transfer', amount: 1_800_000 },
    rateColumn: 'solati',
    services: ['dua-don-san-bay-tan-son-nhat', 'thue-xe-theo-ngay', 'tour-du-lich'],
  },
  {
    slug: 'ford-transit-dcar-limousine',
    key: 'transitdcar',
    name: 'Ford Transit D’Car',
    nameEn: 'Ford Transit D’Car',
    category: 'Limousine D’Car · 9–11 chỗ',
    categoryEn: 'D’Car limousine · 9–11 seats',
    seats: '9 – 11 khách',
    seatsEn: '9 – 11 passengers',
    luggage: 'Cốp sau sâu, xếp vừa bốn bộ gậy golf',
    luggageEn: 'A deep rear hold. Four golf bags fit standing',
    blurb: 'Ghế da ngả, bàn gấp và rèm che riêng cho từng khoang.',
    blurbEn: 'Reclining leather, folding tables, a curtain for each bay.',
    intro:
      'Phiên bản D’Car trên nền Ford Transit với khoang khách rộng rãi; vừa mở cửa trượt đã thấy hàng ghế thương gia. Đây là lựa chọn quen thuộc của các đoàn khách nước ngoài và những chuyến ra sân golf từ sáng sớm.',
    introEn:
      'The D’Car conversion on a Ford Transit: a wide cabin, and business-class seats the moment the sliding door opens. A familiar choice for foreign delegations and early tee times.',
    hero: '/img/transit-dcar.webp',
    heroAlt: 'Ford Transit D’Car Limousine của HTH mở cửa trượt, lộ ghế da khoang khách',
    gallery: [
      { src: '/img/transit-dcar-cabin.webp', alt: 'Khoang khách Ford Transit D’Car nhìn từ cửa trượt', altEn: 'Ford Transit D’Car cabin seen from the sliding door' },
      { src: '/img/transit-dcar-golf.webp', alt: 'Bốn bộ gậy golf xếp trong cốp sau Ford Transit D’Car', altEn: 'Four golf bags loaded into the Ford Transit D’Car rear hold' },
      { src: '/img/transit-dcar-cabin2.webp', alt: 'Lối đi giữa hai hàng ghế trong khoang Ford Transit D’Car', altEn: 'The aisle between seat rows in the Ford Transit D’Car' },
    ],
    from: { label: 'Đón/tiễn sân bay', labelEn: 'Airport transfer', amount: 1_600_000 },
    rateColumn: 'transitdcar',
    services: ['dua-don-san-bay-tan-son-nhat', 'thue-xe-theo-gio', 'tour-du-lich'],
  },
  {
    slug: 'bmw-520i',
    key: 'bmw',
    name: 'BMW 5 Series',
    nameEn: 'BMW 5 Series',
    category: 'Sedan doanh nhân · 4 chỗ',
    categoryEn: 'Executive sedan · 4 seats',
    seats: '3 khách',
    seatsEn: '3 passengers',
    luggage: '2 vali lớn',
    luggageEn: 'Two large cases',
    blurb: 'Khoang xe yên tĩnh, phù hợp những dịp cần sự chỉn chu và kín đáo.',
    blurbEn: 'A quiet cabin, for arrivals that call for composure.',
    intro:
      'Đón đối tác tại sảnh khách sạn, đưa ban giám đốc đi họp hay tháp tùng đoàn ngoại giao. Tài xế hiểu khi nào nên trò chuyện và khi nào cần giữ yên lặng.',
    introEn:
      'Meeting a partner under a hotel portico, taking the board to a meeting, following a diplomatic party. The chauffeur knows when to speak and when not to.',
    hero: '/img/bmw.webp',
    heroAlt: 'BMW 5 Series của HTH Limousine đỗ trước sảnh khách sạn buổi tối',
    gallery: [
      { src: '/img/bmw-cockpit.webp', alt: 'Bảng điều khiển BMW 5 Series với logo HTH trên màn hình', altEn: 'BMW 5 Series dashboard with the HTH logo on screen' },
      { src: '/img/bmw-rear.webp', alt: 'BMW 5 Series nhìn từ phía sau tại lối vào khách sạn', altEn: 'BMW 5 Series from the rear at a hotel entrance' },
    ],
    from: { label: 'Đón/tiễn sân bay', labelEn: 'Airport transfer', amount: 2_100_000 },
    rateColumn: 'bmw',
    services: ['dua-don-san-bay-tan-son-nhat', 'thue-xe-theo-gio', 'thue-xe-doanh-nghiep'],
  },
  {
    slug: 'kia-carnival',
    key: 'carnival',
    name: 'Kia Carnival',
    nameEn: 'Kia Carnival',
    category: 'MPV · 7 chỗ',
    categoryEn: 'MPV · 7 seats',
    seats: '6 khách',
    seatsEn: '6 passengers',
    luggage: '4 vali lớn',
    luggageEn: 'Four large cases',
    blurb: 'Cửa trượt điện, hàng ghế thứ hai là ghế thương gia độc lập.',
    blurbEn: 'Power sliding doors and captain seats in the second row.',
    intro:
      'Đủ rộng cho một gia đình hoặc nhóm công tác bốn, năm người mà cốp vẫn còn chỗ cho hành lý. Cửa trượt điện giúp lên xuống xe dễ dàng ở những điểm đỗ chật hẹp trong trung tâm.',
    introEn:
      'Room for a family or a working group of four or five, with the boot still free. The power sliding doors make boarding easy in tight downtown kerbside spots.',
    hero: '/img/carnival.webp',
    heroAlt: 'Kia Carnival của HTH Limousine chụp nghiêng trước lúc hoàng hôn',
    gallery: [
      { src: '/img/carnival-hotel.webp', alt: 'Kia Carnival đỗ trước lối vào khách sạn', altEn: 'Kia Carnival at a hotel entrance' },
      { src: '/img/carnival-cockpit.webp', alt: 'Bảng điều khiển Kia Carnival với logo HTH trên màn hình', altEn: 'Kia Carnival dashboard with the HTH logo on screen' },
    ],
    from: { label: 'Đón/tiễn sân bay', labelEn: 'Airport transfer', amount: 1_200_000 },
    rateColumn: 'carnival',
    services: ['dua-don-san-bay-tan-son-nhat', 'thue-xe-theo-gio', 'thue-xe-theo-ngay'],
  },
  {
    slug: 'ford-transit-16-cho',
    key: 'transit16',
    name: 'Ford Transit 16 chỗ',
    nameEn: 'Ford Transit 16-seat',
    category: 'Xe đoàn · 16 chỗ',
    categoryEn: 'Group van · 16 seats',
    seats: '16 khách',
    seatsEn: '16 passengers',
    luggage: 'Khoang sau chứa khoảng 10 vali cỡ vừa',
    luggageEn: 'Rear hold, around ten medium cases',
    blurb: 'Dòng xe đảm nhận phần lớn các chuyến hằng ngày của HTH.',
    blurbEn: 'The car that does most of HTH’s daily work.',
    intro:
      'Xe phục vụ tuyến đưa đón nhân viên buổi sáng, tuyến nhà máy và các đoàn du lịch cuối tuần. Điều khách hàng cần ở dòng xe này rất rõ ràng: sạch sẽ và đúng giờ, ngày này qua ngày khác.',
    introEn:
      'Morning staff routes, factory shuttles, weekend tour groups. Nothing showy about it. A clean car that turns up on time, day after day.',
    hero: '/img/transit16.webp',
    heroAlt: 'Ford Transit 16 chỗ của HTH Limousine đỗ bên đường tại Diamond Island',
    gallery: [],
    from: { label: 'Đón/tiễn sân bay', labelEn: 'Airport transfer', amount: 1_600_000 },
    services: ['thue-xe-doanh-nghiep', 'tour-du-lich', 'thue-xe-theo-ngay'],
  },
  {
    slug: 'hyundai-universe-45-cho',
    key: 'bus45',
    name: 'Hyundai Universe 45 chỗ',
    nameEn: 'Hyundai Universe 45-seat',
    category: 'Xe khách · 45–47 chỗ',
    categoryEn: 'Coach · 45–47 seats',
    seats: '45 – 47 khách',
    seatsEn: '45 – 47 passengers',
    luggage: 'Khoang hành lý dưới sàn',
    luggageEn: 'Under-floor luggage hold',
    blurb: 'Phục vụ hội nghị, team building và đưa đón sự kiện.',
    blurbEn: 'Conferences, company trips, event shuttles.',
    intro:
      'Ghế ngả có tựa chân, khoang hành lý dưới sàn, hệ thống âm thanh và micro cho hướng dẫn viên. Kể cả với đoàn vài trăm khách, Quý khách vẫn chỉ làm việc với một đầu mối điều phối.',
    introEn:
      'Reclining seats with footrests, an under-floor hold, and a PA system for the guide. A movement of several hundred guests still runs through one coordinator.',
    hero: '/img/universe.webp',
    heroAlt: 'Xe khách Hyundai Universe 45 chỗ của HTH Limousine dưới trời nắng',
    gallery: [
      { src: '/img/universe-fleet.webp', alt: 'Đội xe Hyundai Universe của HTH xếp hàng trước nhà ga', altEn: 'A row of HTH Hyundai Universe coaches outside a terminal' },
      { src: '/img/universe-cabin.webp', alt: 'Khoang khách xe Universe 45 chỗ nhìn dọc lối đi', altEn: 'The cabin of the 45-seat Universe, looking down the aisle' },
    ],
    from: { label: 'Nội thành trọn ngày', labelEn: 'City, full day', amount: 4_700_000 },
    rateColumn: 'bus45',
    services: ['thue-xe-doanh-nghiep', 'tour-du-lich'],
  },
];

/**
 * Photography comes from the folders HTH maintains (see scripts/fleet-photos.py):
 * the first photo is the hero, every other photo goes in the gallery, so a
 * picture added to a folder can never be left off the site.
 */
type Photo = { src: string; alt: string; altEn: string };
const photos = fleetPhotos as Record<string, Photo[]>;

export const fleet: Vehicle[] = baseFleet.map((v) => {
  const set = photos[v.slug];
  if (!set?.length) return v;
  const [hero, ...rest] = set;
  return { ...v, hero: hero.src, heroAlt: hero.alt, gallery: rest };
});

export const fleetBySlug = Object.fromEntries(fleet.map((v) => [v.slug, v]));
export const fleetByKey = Object.fromEntries(fleet.map((v) => [v.key, v]));
