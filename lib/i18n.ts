/**
 * Two languages, one set of components.
 *
 * Vietnamese sits at the root; English is mirrored under /en/ with its own
 * slugs, because an English reader searching for "airport transfer Ho Chi Minh
 * City" should not land on a Vietnamese URL. hreflang pairs the two.
 *
 * The English is written, not translated. Where a literal rendering of the
 * Vietnamese would read stiffly, the English says the same thing the way an
 * English speaker would say it.
 */

export type Locale = 'vi' | 'en';

export const locales: Locale[] = ['vi', 'en'];

/** Root paths. English pages are all prefixed. */
export const localePrefix: Record<Locale, string> = { vi: '', en: '/en' };

export function localeHref(locale: Locale, path: string): string {
  const clean = path === '/' ? '' : path;
  return `${localePrefix[locale]}${clean}` || '/';
}

interface Dictionary {
  htmlLang: string;
  /** Chrome */
  skipToContent: string;
  homeLabel: string;
  mainNavLabel: string;
  breadcrumbLabel: string;
  menuOpen: string;
  menuClose: string;
  menuLabel: string;
  menuCloseLabel: string;
  menuExplore: string;
  otherLanguage: string;
  otherLanguageName: string;
  callAction: string;
  book: string;
  chatZalo: string;
  home: string;

  /** Navigation labels */
  nav: { services: string; fleet: string; rates: string; about: string; journal: string; contact: string };

  /** Section furniture reused across page types */
  eyebrow: {
    services: string;
    fleet: string;
    rates: string;
    routes: string;
    contact: string;
    about: string;
    clients: string;
    journal: string;
    faq: string;
    booking: string;
    included: string;
    howToBook: string;
    beforeYouBook: string;
    theDrive: string;
    otherServices: string;
    otherRoutes: string;
    suitsYou: string;
  };

  cta: { title: string; body: string; quote: string; details: string; seeAllFleet: string; seeAll: string; readMore: string };

  booking: {
    title: string;
    note: string;
    pickup: string;
    pickupPlaceholder: string;
    dropoff: string;
    dropoffPlaceholder: string;
    date: string;
    time: string;
    passengers: string;
    vehicle: string;
    vehicleAuto: string;
    trip: string;
    oneWay: string;
    roundTrip: string;
    phone: string;
    phonePlaceholder: string;
    name: string;
    namePlaceholder: string;
    note2: string;
    notePlaceholder: string;
    submit: string;
    sending: string;
    consent: string;
    missingDateTime: string;
    pastTime: string;
    invalidPhone: string;
    routeAndQuote: string;
    distance: string;
    driveTime: string;
    estimate: string;
    mapHint: string;
    statusSearching: string;
    statusMeasured: string;
    statusRoad: string;
    statusApprox: string;
    statusEstimate: string;
    statusSameArea: string;
    statusUnknownPlace: string;
    statusRegion: string;
    sameAreaShort: string;
    sameAreaNote: string;
    approxNote: string;
    quoteNoteSuffix: (vehicle: string, roundTrip: boolean) => string;
    quoteNoteEmpty: string;
    sentTitle: string;
    sentTitleFallback: string;
    sentDelivered: string;
    sentFallback: string;
    sendZalo: string;
    email: string;
    newRequest: string;
    serviceGroup: string;
    services: { id: string; label: string }[];
    emailSubject: string;
    messageHeading: string;
    messageLabels: {
      service: string; pickup: string; dropoff: string; when: string; passengers: string;
      vehicle: string; estimate: string; customer: string; note: string; oneWay: string; roundTrip: string;
      located: string;
    };
  };

  rates: { route: string; unit: string; onRequest: string };
  facts: { seats: string; luggage: string; distance: string; driveTime: string; vehiclesSuited: string; from: string };
  footer: { blurb: (year: number) => string; servicesHead: string; fleetHead: string; routesHead: string; contactHead: string; operating: string };
  contactLabels: { hotline: string; office: string; email: string; messaging: string; company: string; booking: string; openMap: string; headOffice: string };
}

const vi: Dictionary = {
  htmlLang: 'vi',
  skipToContent: 'Chuyển đến nội dung chính',
  homeLabel: 'Trang chủ HTH Limousine',
  mainNavLabel: 'Điều hướng chính',
  breadcrumbLabel: 'Đường dẫn',
  menuOpen: 'Mở menu',
  menuClose: 'Đóng menu',
  menuLabel: 'Menu',
  menuCloseLabel: 'Đóng',
  menuExplore: 'Khám phá',
  otherLanguage: 'EN',
  otherLanguageName: 'English',
  callAction: 'Gọi',
  book: 'Đặt xe',
  chatZalo: 'Nhắn Zalo',
  home: 'Trang chủ',

  nav: {
    services: 'Dịch vụ',
    fleet: 'Đội xe',
    rates: 'Bảng giá',
    about: 'Về chúng tôi',
    journal: 'Cẩm nang',
    contact: 'Liên hệ',
  },

  eyebrow: {
    services: 'Dịch vụ',
    fleet: 'Đội xe',
    rates: 'Bảng giá',
    routes: 'Tuyến đường',
    contact: 'Liên hệ',
    about: 'Về HTH',
    clients: 'Khách hàng',
    journal: 'Cẩm nang',
    faq: 'Câu hỏi thường gặp',
    booking: 'Đặt xe',
    included: 'Giá đã bao gồm',
    howToBook: 'Quy trình đặt xe',
    beforeYouBook: 'Lưu ý trước khi đặt',
    theDrive: 'Cung đường',
    otherServices: 'Dịch vụ khác',
    otherRoutes: 'Tuyến khác',
    suitsYou: 'Phù hợp với',
  },

  cta: {
    title: 'Quý khách cần đi đâu, vào lúc nào?',
    body: 'Chỉ cần gửi điểm đón, điểm đến và giờ khởi hành. Điều phối viên sẽ gọi lại để xác nhận xe và chốt giá trước chuyến đi.',
    quote: 'Nhận báo giá',
    details: 'Chi tiết →',
    seeAllFleet: 'Xem toàn bộ đội xe →',
    seeAll: 'Xem tất cả →',
    readMore: 'Xem chi tiết →',
  },

  booking: {
    title: 'Đặt xe hoặc nhận báo giá',
    note: 'Điều phối viên trực 24/7, cả ngoài giờ hành chính',
    pickup: 'Điểm đón',
    pickupPlaceholder: 'Khách sạn, địa chỉ, sân bay…',
    dropoff: 'Điểm đến',
    dropoffPlaceholder: 'Điểm đến hoặc lịch trình',
    date: 'Ngày đón',
    time: 'Giờ đón',
    passengers: 'Số khách',
    vehicle: 'Dòng xe',
    vehicleAuto: 'Nhờ HTH tư vấn',
    trip: 'Loại chuyến',
    oneWay: 'Một chiều',
    roundTrip: 'Khứ hồi',
    phone: 'Số điện thoại / Zalo',
    phonePlaceholder: 'Để chúng tôi gọi lại xác nhận',
    name: 'Họ và tên',
    namePlaceholder: 'Anh / Chị',
    note2: 'Yêu cầu thêm',
    notePlaceholder: 'Số hiệu chuyến bay, ghế trẻ em, bảng đón tên…',
    submit: 'Gửi yêu cầu',
    sending: 'Đang gửi…',
    consent: 'Khi gửi yêu cầu, Quý khách đồng ý để HTH Limousine sử dụng họ tên và số điện thoại nhằm liên hệ báo giá và xác nhận chuyến đi.',
    missingDateTime: 'Quý khách vui lòng chọn ngày và giờ đón.',
    pastTime: 'Thời điểm đón đã qua. Quý khách vui lòng chọn lại ngày giờ.',
    invalidPhone: 'Số điện thoại chưa hợp lệ. Quý khách vui lòng kiểm tra lại.',
    routeAndQuote: 'Lộ trình và giá tạm tính',
    distance: 'Quãng đường',
    driveTime: 'Thời gian di chuyển',
    estimate: 'Giá tạm tính',
    mapHint: 'Nhập điểm đón và điểm đến, bản đồ sẽ vẽ lộ trình và tính giá tạm.',
    statusSearching: 'Đang tìm địa điểm…',
    statusMeasured: 'Cự ly HTH đo thực tế',
    statusRoad: 'Theo lộ trình đường bộ',
    statusApprox: 'Vị trí xác định qua bản đồ',
    statusEstimate: 'Cự ly ước tính',
    statusSameArea: 'Trong cùng khu vực',
    statusUnknownPlace: 'Chưa xác định được địa điểm',
    statusRegion: 'TP.HCM và các tỉnh phía Nam',
    sameAreaShort: 'Nội khu',
    sameAreaNote: 'Chuyến ngắn trong cùng khu vực áp dụng mức giá tối thiểu.',
    approxNote: 'Vị trí được định vị tự động từ bản đồ; điều phối viên sẽ kiểm tra lại địa chỉ.',
    quoteNoteSuffix: (vehicle, roundTrip) =>
      `${vehicle}, ${roundTrip ? 'khứ hồi' : 'một chiều'}. Đã gồm xe, tài xế, nhiên liệu và phí cầu đường; giá chính thức do điều phối viên xác nhận trước giờ khởi hành.`,
    quoteNoteEmpty:
      'Nếu bản đồ chưa nhận ra địa điểm, Quý khách vẫn có thể gửi yêu cầu. Chúng tôi sẽ báo giá qua điện thoại hoặc Zalo.',
    sentTitle: 'HTH đã nhận yêu cầu',
    sentTitleFallback: 'Còn một bước nữa',
    sentDelivered: 'Yêu cầu đã được chuyển tới bộ phận điều phối. Chúng tôi sẽ gọi lại sớm nhất để xác nhận xe và giá.',
    sentFallback: 'Nội dung yêu cầu đã được soạn sẵn. Quý khách vui lòng gửi qua WhatsApp hoặc email, nhắn Zalo, hoặc gọi thẳng hotline.',
    sendZalo: 'Nhắn Zalo',
    email: 'Email',
    newRequest: 'Gửi yêu cầu khác',
    serviceGroup: 'Chọn loại dịch vụ',
    services: [
      { id: 'airport', label: 'Đưa đón sân bay' },
      { id: 'hourly', label: 'Thuê theo giờ' },
      { id: 'daily', label: 'Thuê theo ngày' },
      { id: 'corporate', label: 'Doanh nghiệp' },
      { id: 'tour', label: 'Tour và đi tỉnh' },
    ],
    emailSubject: 'Yêu cầu đặt xe từ website',
    messageHeading: 'YÊU CẦU ĐẶT XE · HTH LIMOUSINE',
    messageLabels: {
      service: 'Dịch vụ', pickup: 'Điểm đón', dropoff: 'Điểm đến', when: 'Thời gian',
      passengers: 'Số khách', vehicle: 'Dòng xe', estimate: 'Giá tạm tính',
      customer: 'Khách hàng', note: 'Ghi chú', oneWay: 'Một chiều', roundTrip: 'Khứ hồi',
      located: 'định vị',
    },
  },

  rates: { route: 'Tuyến', unit: 'Đơn vị: đồng.', onRequest: 'Liên hệ' },
  facts: {
    seats: 'Số chỗ', luggage: 'Hành lý', distance: 'Quãng đường',
    driveTime: 'Thời gian di chuyển', vehiclesSuited: 'Xe phù hợp', from: 'Giá từ',
  },
  footer: {
    blurb: (year) => `Dịch vụ xe limousine và xe du lịch có tài xế tại TP. Hồ Chí Minh từ năm ${year}.`,
    servicesHead: 'Dịch vụ', fleetHead: 'Đội xe', routesHead: 'Tuyến đường',
    contactHead: 'Liên hệ', operating: 'TP. Hồ Chí Minh · Điều phối trực 24/7',
  },
  contactLabels: {
    hotline: 'Hotline', office: 'Văn phòng', email: 'Email', messaging: 'Nhắn tin',
    company: 'Công ty', booking: 'Đặt xe', openMap: 'Mở bản đồ →',
    headOffice: 'Trụ sở · TP. Hồ Chí Minh',
  },
};

const en: Dictionary = {
  htmlLang: 'en',
  skipToContent: 'Skip to content',
  homeLabel: 'HTH Limousine, home',
  mainNavLabel: 'Main navigation',
  breadcrumbLabel: 'Breadcrumb',
  menuOpen: 'Open menu',
  menuClose: 'Close menu',
  menuLabel: 'Menu',
  menuCloseLabel: 'Close',
  menuExplore: 'Explore',
  otherLanguage: 'VI',
  otherLanguageName: 'Tiếng Việt',
  callAction: 'Call',
  book: 'Book a car',
  chatZalo: 'Message on Zalo',
  home: 'Home',

  nav: {
    services: 'Services',
    fleet: 'Fleet',
    rates: 'Rates',
    about: 'About',
    journal: 'Guides',
    contact: 'Contact',
  },

  eyebrow: {
    services: 'Services',
    fleet: 'Fleet',
    rates: 'Rates',
    routes: 'Routes',
    contact: 'Contact',
    about: 'About HTH',
    clients: 'Clients',
    journal: 'Guides',
    faq: 'Common questions',
    booking: 'Book',
    included: 'What the price covers',
    howToBook: 'How it works',
    beforeYouBook: 'Before you book',
    theDrive: 'The drive',
    otherServices: 'Other services',
    otherRoutes: 'Other routes',
    suitsYou: 'Suited to',
  },

  cta: {
    title: 'Tell us where you need to be',
    body: 'Send a pickup point, a destination and a time. A coordinator calls back, confirms the car and fixes the price before you travel.',
    quote: 'Get a quote',
    details: 'Details →',
    seeAllFleet: 'See the whole fleet →',
    seeAll: 'See all →',
    readMore: 'Read more →',
  },

  booking: {
    title: 'Book a car or get a quote',
    note: 'Dispatch answers around the clock, including outside office hours',
    pickup: 'Pickup',
    pickupPlaceholder: 'Hotel, address, airport…',
    dropoff: 'Drop-off',
    dropoffPlaceholder: 'Destination or itinerary',
    date: 'Pickup date',
    time: 'Pickup time',
    passengers: 'Passengers',
    vehicle: 'Vehicle',
    vehicleAuto: 'Recommend one for me',
    trip: 'Trip',
    oneWay: 'One way',
    roundTrip: 'Return',
    phone: 'Phone / Zalo / WhatsApp',
    phonePlaceholder: 'So we can call you back',
    name: 'Your name',
    namePlaceholder: 'Mr / Ms',
    note2: 'Anything else',
    notePlaceholder: 'Flight number, child seat, name board…',
    submit: 'Send request',
    sending: 'Sending…',
    consent: 'By sending this request you agree that HTH Limousine may use your name and phone number to quote and confirm the trip.',
    missingDateTime: 'Please choose a pickup date and time.',
    pastTime: 'That pickup time has already passed. Please choose another.',
    invalidPhone: 'That phone number does not look right. Please check it.',
    routeAndQuote: 'Route and indicative price',
    distance: 'Distance',
    driveTime: 'Drive time',
    estimate: 'Indicative price',
    mapHint: 'Enter a pickup and a destination and the map draws the route and prices it.',
    statusSearching: 'Looking up the address…',
    statusMeasured: 'Distance measured by HTH',
    statusRoad: 'Road route',
    statusApprox: 'Located on the map',
    statusEstimate: 'Estimated distance',
    statusSameArea: 'Same area',
    statusUnknownPlace: 'Place not found yet',
    statusRegion: 'Ho Chi Minh City and the south',
    sameAreaShort: 'Local',
    sameAreaNote: 'Short trips within one area are charged at the minimum fare.',
    approxNote: 'The address was located automatically; a coordinator will check it.',
    quoteNoteSuffix: (vehicle, roundTrip) =>
      `${vehicle}, ${roundTrip ? 'return' : 'one way'}. Covers the car, the chauffeur, fuel and tolls. A coordinator confirms the final price before the car sets off.`,
    quoteNoteEmpty:
      'If the map cannot find a place, send the request anyway and we will quote by phone or Zalo.',
    sentTitle: 'Request received',
    sentTitleFallback: 'One more step',
    sentDelivered: 'Your request is with dispatch. We will call shortly to confirm the car and the price.',
    sentFallback: 'Your request is written out below. Send it by WhatsApp or email, message us on Zalo, or call the hotline.',
    sendZalo: 'Message on Zalo',
    email: 'Email',
    newRequest: 'Send another request',
    serviceGroup: 'Choose a service',
    services: [
      { id: 'airport', label: 'Airport transfer' },
      { id: 'hourly', label: 'By the hour' },
      { id: 'daily', label: 'By the day' },
      { id: 'corporate', label: 'Corporate' },
      { id: 'tour', label: 'Tours, intercity' },
    ],
    emailSubject: 'Booking request from the website',
    messageHeading: 'BOOKING REQUEST · HTH LIMOUSINE',
    messageLabels: {
      service: 'Service', pickup: 'Pickup', dropoff: 'Drop-off', when: 'When',
      passengers: 'Passengers', vehicle: 'Vehicle', estimate: 'Estimate',
      customer: 'Customer', note: 'Notes', oneWay: 'One way', roundTrip: 'Return',
      located: 'located as',
    },
  },

  rates: { route: 'Route', unit: 'In Vietnamese dong.', onRequest: 'On request' },
  facts: {
    seats: 'Seats', luggage: 'Luggage', distance: 'Distance',
    driveTime: 'Drive time', vehiclesSuited: 'Suitable vehicles', from: 'From',
  },
  footer: {
    blurb: (year) => `Chauffeured limousines and passenger vehicles in Ho Chi Minh City since ${year}.`,
    servicesHead: 'Services', fleetHead: 'Fleet', routesHead: 'Routes',
    contactHead: 'Contact', operating: 'Ho Chi Minh City · Dispatch on duty 24/7',
  },
  contactLabels: {
    hotline: 'Hotline', office: 'Office', email: 'Email', messaging: 'Messaging',
    company: 'Company', booking: 'Booking', openMap: 'Open in Maps →',
    headOffice: 'Head office · Ho Chi Minh City',
  },
};

const dictionaries: Record<Locale, Dictionary> = { vi, en };

export function t(locale: Locale): Dictionary {
  return dictionaries[locale];
}

/* -------------------------------------------------------------------------- */
/* Content helpers                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Merge an entry's English block over its Vietnamese fields, so a page can read
 * one shape regardless of language. Vietnamese entries pass straight through.
 */
export function localised<T extends { en: Partial<T> }>(item: T, locale: Locale): T {
  return locale === 'en' ? ({ ...item, ...item.en } as T) : item;
}

/** Path builders, so a link is written once and resolves per language. */
export const paths = {
  home: (l: Locale) => localeHref(l, '/'),
  services: (l: Locale) => localeHref(l, l === 'en' ? '/services' : '/dich-vu'),
  service: (l: Locale, slug: string) => localeHref(l, `/${slug}`),
  fleet: (l: Locale) => localeHref(l, l === 'en' ? '/fleet' : '/doi-xe'),
  vehicle: (l: Locale, slug: string) => localeHref(l, `${l === 'en' ? '/fleet' : '/doi-xe'}/${slug}`),
  routes: (l: Locale) => localeHref(l, l === 'en' ? '/routes' : '/tuyen-duong'),
  route: (l: Locale, slug: string) => localeHref(l, `${l === 'en' ? '/routes' : '/tuyen-duong'}/${slug}`),
  rates: (l: Locale) => localeHref(l, l === 'en' ? '/rates' : '/bang-gia'),
  clients: (l: Locale) => localeHref(l, l === 'en' ? '/clients' : '/khach-hang'),
  about: (l: Locale) => localeHref(l, l === 'en' ? '/about' : '/ve-chung-toi'),
  contact: (l: Locale) => localeHref(l, l === 'en' ? '/contact' : '/lien-he'),
  booking: (l: Locale) => localeHref(l, l === 'en' ? '/book' : '/dat-xe'),
  journal: (l: Locale) => localeHref(l, l === 'en' ? '/guides' : '/cam-nang'),
  article: (l: Locale, slug: string) => localeHref(l, `${l === 'en' ? '/guides' : '/cam-nang'}/${slug}`),
};

export const otherLocale = (l: Locale): Locale => (l === 'vi' ? 'en' : 'vi');
