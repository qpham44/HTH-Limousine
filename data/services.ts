import type { RateRow } from '@/data/rates';

/**
 * Service pages. Copy describes how HTH actually works — no invented policies,
 * no surcharge or VAT detail (per the owner interview, both stay in the quote).
 */

export interface ServiceStep {
  title: string;
  body: string;
}

export interface Faq {
  q: string;
  a: string;
}

export interface ServiceCopy {
  slug: string;
  nav: string;
  h1: string;
  title: string;
  description: string;
  eyebrow: string;
  lead: string;
  steps: ServiceStep[];
  included: string[];
  rateNote?: string;
  faq: Faq[];
}

export interface Service {
  slug: string;
  /** Header and breadcrumb label. */
  nav: string;
  h1: string;
  title: string;
  description: string;
  eyebrow: string;
  lead: string;
  image: string;
  imageAlt: string;
  /** Booking really is a sequence, so these are numbered. */
  steps: ServiceStep[];
  included: string[];
  /** Which published rows to show, or null to show none. */
  rateFilter: ((row: RateRow) => boolean) | null;
  rateNote?: string;
  /** Vehicle slugs, most relevant first. */
  vehicles: string[];
  faq: Faq[];
  /** Written for an English reader, not translated from the Vietnamese. */
  en: ServiceCopy;
}

export const services: Service[] = [
  {
    slug: 'dua-don-san-bay-tan-son-nhat',
    nav: 'Đưa đón sân bay',
    h1: 'Đưa đón sân bay Tân Sơn Nhất',
    title: 'Đưa đón sân bay Tân Sơn Nhất',
    description:
      'Xe đưa đón sân bay Tân Sơn Nhất có tài xế, giá cố định theo tuyến. Tài xế theo dõi giờ hạ cánh và đón tại cửa ra kèm bảng tên. Đặt xe nhanh qua Zalo.',
    eyebrow: 'Dịch vụ',
    lead:
      'Giá cố định theo tuyến, tài xế đón tận cửa ra với bảng tên, và luôn có người trực máy khi chuyến bay thay đổi giờ.',
    image: '/img/solati-cabin-airport.webp',
    imageAlt: 'Khoang khách Solati D’Car nhìn ra sân đỗ máy bay lúc hoàng hôn',
    steps: [
      {
        title: 'Gửi số hiệu chuyến bay và điểm đến',
        body: 'Điền biểu mẫu hoặc nhắn Zalo. Số hiệu chuyến bay là thông tin quan trọng nhất để chúng tôi canh đúng giờ đón.',
      },
      {
        title: 'Nhận báo giá và xác nhận xe',
        body: 'Điều phối viên gọi lại, thống nhất dòng xe và giá trọn gói trước ngày bay.',
      },
      {
        title: 'Tài xế liên hệ trước giờ hạ cánh',
        body: 'Quý khách nhận được tên, số điện thoại và biển số xe qua tin nhắn, nên không phải tìm kiếm khi vừa ra khỏi cửa.',
      },
      {
        title: 'Đón tại cửa ra ga đến',
        body: 'Tài xế cầm sẵn bảng tên và hỗ trợ mang hành lý ra xe. Nếu muốn đổi điểm hẹn trong sân bay, Quý khách chỉ cần nhắn trước.',
      },
    ],
    included: [
      'Theo dõi chuyến bay, chờ theo giờ hạ cánh thực tế',
      'Bảng đón tên khách',
      'Hỗ trợ hành lý từ cửa ra đến xe',
      'Nước suối và khăn lạnh trên xe',
      'Giá trọn gói đã gồm xe, tài xế, nhiên liệu và phí cầu đường',
    ],
    rateFilter: (row) => row.route.includes('Tân Sơn Nhất'),
    rateNote:
      'Giá tuyến sân bay tính cho một chiều. Với điểm đến ngoài trung tâm, Quý khách có thể dùng công cụ tính giá ở trang chủ hoặc gọi hotline.',
    vehicles: ['kia-carnival', 'ford-transit-dcar-limousine', 'hyundai-solati-dcar-limousine', 'bmw-520i'],
    faq: [
      {
        q: 'Nếu chuyến bay hạ cánh trễ thì sao?',
        a: 'Chúng tôi theo dõi số hiệu chuyến bay nên tài xế sẽ chờ theo giờ hạ cánh thực tế, không theo giờ in trên vé. Quý khách không cần gọi báo lại.',
      },
      {
        q: 'Tài xế đón ở đâu trong sân bay?',
        a: 'Tài xế đón tại cửa ra ga đến, cầm bảng tên của khách. Nếu muốn gặp ở vị trí khác như bãi đỗ xe, ga đi hoặc phòng chờ của hãng bay, Quý khách vui lòng báo trước cho điều phối viên.',
      },
      {
        q: 'Đoàn đông, nhiều hành lý nên chọn xe nào?',
        a: 'Khi đặt xe, Quý khách cho biết cả số người lẫn số vali. Điều phối viên sẽ chọn xe phù hợp, hoặc bố trí hai xe nếu một xe không đủ chỗ cho hành lý.',
      },
      {
        q: 'Nên đặt xe trước bao lâu?',
        a: 'Đặt càng sớm càng chắc chắn có xe, nhất là vào cuối tuần và dịp lễ. Chúng tôi vẫn nhận chuyến gấp nếu còn xe trống; khi đó Quý khách nên gọi hotline thay vì điền biểu mẫu để được xử lý nhanh hơn.',
      },
    ],
    en: {
      slug: 'airport-transfer-tan-son-nhat',
      nav: 'Airport transfers',
      h1: 'Tan Son Nhat airport transfers',
      title: 'Tan Son Nhat airport transfers',
      description:
        'Chauffeured airport transfers at Tan Son Nhat, Ho Chi Minh City. Fixed price by route, flight tracked, and a driver waiting at arrivals with a name board.',
      eyebrow: 'Service',
      lead:
        'A fixed price for the route, a chauffeur waiting at arrivals with a name board, and a number that someone answers when your flight slips.',
      steps: [
        {
          title: 'Send your flight number and destination',
          body: 'Through the form or on Zalo. The flight number is the only thing we genuinely need to get the timing right.',
        },
        {
          title: 'Get a price and confirm the car',
          body: 'A coordinator calls back, agrees the vehicle class and fixes the all-in price before you fly.',
        },
        {
          title: 'Your chauffeur messages before you land',
          body: 'You get a name, a phone number and a plate number in writing, so you are not looking around for anyone when the doors open.',
        },
        {
          title: 'Met at the arrivals gate',
          body: 'Name board in hand, help with the bags to the car. If you would rather meet somewhere else in the terminal, tell us in advance.',
        },
      ],
      included: [
        'Flight tracking, with waiting time based on when you actually land',
        'Name board at arrivals',
        'Help with luggage from the gate to the car',
        'Bottled water and cold towels',
        'One price covering the car, chauffeur, fuel and tolls',
      ],
      rateNote:
        'Airport routes are priced one way. For destinations outside the centre, use the quote tool on the home page or call the hotline.',
      faq: [
        {
          q: 'What happens if my flight is late?',
          a: 'We track the flight number and the chauffeur waits according to the actual landing time, not the time printed on your ticket. You do not need to call ahead.',
        },
        {
          q: 'Where does the chauffeur meet me?',
          a: 'At the arrivals gate, holding a name board. If you would rather meet at the car park, at departures or at an airline lounge, tell the coordinator beforehand.',
        },
        {
          q: 'We are a group with a lot of luggage. Which car?',
          a: 'Give us the number of passengers and the number of cases together. The coordinator picks the vehicle on that basis, or sends two cars if the boot will not take it.',
        },
        {
          q: 'How far ahead should I book?',
          a: 'Earlier is safer, especially at weekends and around holidays. We still take last-minute bookings when a car is free, though for those it is quicker to call than to fill in the form.',
        },
      ],
    },
  },

  {
    slug: 'thue-xe-theo-gio',
    nav: 'Thuê theo giờ',
    h1: 'Thuê xe theo giờ có tài xế',
    title: 'Thuê xe theo giờ có tài xế tại TP.HCM',
    description:
      'Thuê xe có tài xế theo giờ tại TP.HCM, gói từ bốn giờ. Xe phục vụ theo lịch của Quý khách: gặp đối tác, khảo sát công trình, đón khách, dự tiệc. Giá trọn gói.',
    eyebrow: 'Dịch vụ',
    lead:
      'Gói tối thiểu bốn giờ. Xe và tài xế đi theo lịch trình của Quý khách trong thành phố; việc tìm chỗ đỗ và chờ đợi đã có chúng tôi lo.',
    image: '/img/bmw.webp',
    imageAlt: 'BMW 5 Series của HTH chờ khách trước sảnh khách sạn',
    steps: [
      {
        title: 'Gửi lịch trình trong ngày',
        body: 'Giờ bắt đầu, các điểm cần ghé và giờ dự kiến kết thúc. Không cần chính xác đến từng phút.',
      },
      {
        title: 'Chốt xe và giá',
        body: 'Điều phối viên đề xuất dòng xe theo số khách, sau đó chốt giá trọn gói cho khung giờ đã chọn.',
      },
      {
        title: 'Một tài xế suốt buổi',
        body: 'Cùng một tài xế từ đầu đến cuối. Xe chờ ở vị trí thuận tiện gần nhất và quay lại ngay khi Quý khách gọi.',
      },
      {
        title: 'Phát sinh thêm giờ, trao đổi tại chỗ',
        body: 'Cuộc họp kéo dài hay cần ghé thêm một điểm, Quý khách chỉ cần báo tài xế mà không phải gọi lại tổng đài.',
      },
    ],
    included: [
      'Xe và tài xế túc trực trong suốt khung giờ đã đặt',
      'Nhiên liệu và phí cầu đường trong nội thành',
      'Nước suối và khăn lạnh',
      'Tài xế giao tiếp tiếng Anh theo yêu cầu',
    ],
    rateFilter: (row) => row.route.includes('Nội thành'),
    rateNote:
      'Giá áp dụng cho nội thành. Nếu lịch trình trong ngày ra khỏi thành phố, Quý khách xem giá theo tuyến hoặc gọi hotline.',
    vehicles: ['bmw-520i', 'kia-carnival', 'ford-transit-dcar-limousine', 'hyundai-solati-dcar-limousine'],
    faq: [
      {
        q: 'Gói thuê ngắn nhất là bao lâu?',
        a: 'Bốn giờ. Với nhu cầu dưới bốn giờ, đặt theo tuyến một chiều thường hợp lý hơn, và điều phối viên sẽ tư vấn phương án tiết kiệm nhất.',
      },
      {
        q: 'Xe chờ ở đâu giữa các điểm?',
        a: 'Tài xế tìm chỗ đỗ hợp lệ gần nhất và quay lại khi Quý khách gọi. Ở khu vực cấm dừng đỗ, tài xế sẽ hẹn trước một điểm đón cụ thể.',
      },
      {
        q: 'Gói theo giờ có đi ra ngoại thành được không?',
        a: 'Được, nhưng khi đó tính theo tuyến hoặc theo ngày thường hợp lý hơn. Quý khách cho biết lịch trình cụ thể, chúng tôi sẽ báo phương án có lợi nhất.',
      },
    ],
    en: {
      slug: 'hourly-chauffeur-hire',
      nav: 'By the hour',
      h1: 'Hourly chauffeur hire',
      title: 'Hourly chauffeur hire in Ho Chi Minh City',
      description:
        'Hire a car and chauffeur by the hour in Ho Chi Minh City, from four hours. Meetings, site visits, client pickups, dinner. One all-in price.',
      eyebrow: 'Service',
      lead:
        'From four hours. The car and chauffeur follow your schedule around the city, and where to wait is our problem, not yours.',
      steps: [
        {
          title: 'Send the day',
          body: 'Start time, the places you need to stop, roughly when you expect to finish. It does not have to be exact.',
        },
        {
          title: 'Agree the car and the price',
          body: 'The coordinator suggests a vehicle for the group size and fixes one price for that block of hours.',
        },
        {
          title: 'The same chauffeur all day',
          body: 'One driver from start to finish. The car waits somewhere sensible nearby and comes back when you call.',
        },
        {
          title: 'Running over is normal',
          body: 'If the meeting drags or you add a stop, say so to the driver. You do not have to ring the office again.',
        },
      ],
      included: [
        'Car and chauffeur on hand for the whole booked block',
        'Fuel and city tolls',
        'Bottled water and cold towels',
        'An English-speaking chauffeur on request',
      ],
      rateNote:
        'City rates. If the day takes you out of town, look at the route prices or call the hotline.',
      faq: [
        {
          q: 'What is the shortest booking?',
          a: 'Four hours. Below that a one-way transfer is usually the better deal, and the coordinator will say so rather than sell you the bigger package.',
        },
        {
          q: 'Where does the car wait between stops?',
          a: 'The chauffeur finds legal parking nearby and comes back when you call. Where stopping is not allowed, they agree a specific pickup point with you first.',
        },
        {
          q: 'Can an hourly booking leave the city?',
          a: 'Yes, though at that point a route or full-day price is usually cheaper. Tell us the real plan and we will quote the cheaper option.',
        },
      ],
    },
  },

  {
    slug: 'thue-xe-theo-ngay',
    nav: 'Thuê theo ngày',
    h1: 'Thuê xe theo ngày có tài xế',
    title: 'Thuê xe theo ngày có tài xế tại TP.HCM',
    description:
      'Thuê xe có tài xế trọn ngày tại TP.HCM hoặc đi các tỉnh miền Nam. Một tài xế đồng hành suốt hành trình, giá trọn gói chốt trước khi khởi hành.',
    eyebrow: 'Dịch vụ',
    lead:
      'Trọn ngày trong thành phố hoặc một chặng đi tỉnh. Một tài xế đồng hành suốt hành trình, không đổi người giữa chừng.',
    image: '/img/solati-cabin.webp',
    imageAlt: 'Khoang khách Hyundai Solati D’Car với ghế da ngả sâu',
    steps: [
      {
        title: 'Mô tả hành trình',
        body: 'Điểm xuất phát, các nơi cần ghé, giờ khởi hành và giờ dự kiến quay về.',
      },
      {
        title: 'Chọn xe theo số khách và hành lý',
        body: 'Lượng hành lý quyết định việc chọn xe nhiều hơn số ghế. Quý khách cho biết số vali để tránh phải đổi xe vào phút chót.',
      },
      {
        title: 'Chốt giá trọn gói',
        body: 'Một mức giá cho cả ngày, đã gồm xe, tài xế, nhiên liệu và phí cầu đường.',
      },
      {
        title: 'Khởi hành',
        body: 'Tài xế nắm trước lịch trình, lộ trình và các điểm dừng. Nếu cần thay đổi giữa chừng, Quý khách gọi điều phối viên.',
      },
    ],
    included: [
      'Xe và tài xế trọn ngày theo lịch đã thống nhất',
      'Nhiên liệu và phí cầu đường trên lộ trình',
      'Nước suối và khăn lạnh',
      'Bảo hiểm hành khách',
    ],
    rateFilter: (row) => row.duration === '1 ngày' || row.duration.includes('Trọn ngày'),
    rateNote: 'Lịch trình từ hai ngày trở lên có giá riêng. Quý khách xem bảng giá đầy đủ hoặc gọi hotline.',
    vehicles: ['kia-carnival', 'hyundai-solati-dcar-limousine', 'ford-transit-dcar-limousine', 'ford-transit-16-cho'],
    faq: [
      {
        q: 'Một ngày được tính bao nhiêu giờ?',
        a: 'Thông thường từ 8 đến 10 giờ với lịch trình nội thành. Lịch đi tỉnh tính theo tuyến chứ không tính theo giờ, vì thời gian di chuyển đã nằm trong giá tuyến.',
      },
      {
        q: 'Có đổi tài xế giữa hành trình không?',
        a: 'Không. Một tài xế đồng hành suốt chuyến. Với lịch trình nhiều ngày liên tục, nếu quy định về thời gian lái xe buộc phải bố trí khác, chúng tôi sẽ báo trước.',
      },
      {
        q: 'Có thể ghé thêm điểm giữa đường không?',
        a: 'Được. Quý khách báo tài xế hoặc gọi điều phối viên; nếu phát sinh đáng kể so với lịch ban đầu, chúng tôi sẽ thông báo trước khi tính thêm phí.',
      },
    ],
    en: {
      slug: 'daily-car-hire',
      nav: 'By the day',
      h1: 'Daily car hire with a chauffeur',
      title: 'Daily chauffeured car hire',
      description:
        'Chauffeured car hire by the day in Ho Chi Minh City or out to the southern provinces. One driver for the whole trip, one price agreed before you leave.',
      eyebrow: 'Service',
      lead:
        'A full day in the city, or a run out to the provinces. One chauffeur for the whole trip, with no change of driver halfway.',
      steps: [
        { title: 'Describe the trip', body: 'Where you start, where you need to stop, what time you leave and when you want to be back.' },
        { title: 'Choose on luggage, not seats', body: 'Cases decide more than seats do. Tell us how many, so nobody has to swap cars at the kerb.' },
        { title: 'Fix the price', body: 'One number for the day, covering the car, the chauffeur, fuel and tolls.' },
        { title: 'Go', body: 'The chauffeur has the full plan and knows the stops. If the day changes, call the coordinator.' },
      ],
      included: [
        'Car and chauffeur for the agreed day',
        'Fuel and tolls along the route',
        'Bottled water and cold towels',
        'Passenger insurance',
      ],
      rateNote: 'Trips of two days or more are priced separately. See the full rate table or call the hotline.',
      faq: [
        {
          q: 'How long is a day?',
          a: 'Usually eight to ten hours for city work. Provincial trips are priced by route rather than by the clock, because the driving time is already in the route price.',
        },
        {
          q: 'Will the driver change during the trip?',
          a: 'No. One chauffeur stays with you. On long consecutive multi-day schedules we tell you in advance if driving-hours rules force a different arrangement.',
        },
        {
          q: 'Can we add a stop along the way?',
          a: 'Yes. Tell the chauffeur or call the coordinator. If it adds significantly to the original plan we tell you before anything is charged.',
        },
      ],
    },
  },

  {
    slug: 'thue-xe-doanh-nghiep',
    nav: 'Doanh nghiệp',
    h1: 'Đưa đón nhân viên và khách doanh nghiệp',
    title: 'Đưa đón nhân viên và khách doanh nghiệp',
    description:
      'Xe đưa đón nhân viên, tuyến nhà máy và xe cho ban giám đốc tại TP.HCM và các tỉnh lân cận. Hợp đồng theo tháng, một đầu mối điều phối, có bảng kê chuyến.',
    eyebrow: 'Dịch vụ',
    lead:
      'Tuyến đưa đón nhân viên, tuyến nhà máy, xe cho ban giám đốc và khách của doanh nghiệp. Hợp đồng theo tháng, có một người phụ trách cố định.',
    image: '/img/transit16.webp',
    imageAlt: 'Ford Transit 16 chỗ của HTH đỗ chờ đón nhân viên',
    steps: [
      {
        title: 'Gửi tuyến và khung giờ',
        body: 'Điểm đón, điểm trả, số người mỗi chuyến và các ngày chạy trong tuần.',
      },
      {
        title: 'Khảo sát và chốt phương án',
        body: 'Chúng tôi chạy thử tuyến để nắm thời gian thực tế vào giờ cao điểm, sau đó mới báo giá.',
      },
      {
        title: 'Ký hợp đồng theo tháng',
        body: 'Giá cố định hằng tháng, kèm bảng kê chuyến để đối chiếu cuối kỳ.',
      },
      {
        title: 'Một đầu mối điều phối',
        body: 'Một số điện thoại cho mọi thay đổi: đổi giờ, thêm chuyến hay điều xe thay thế khi có sự cố.',
      },
    ],
    included: [
      'Xe và tài xế cố định cho từng tuyến',
      'Bảng kê chuyến hằng tháng',
      'Một điều phối viên phụ trách toàn bộ hợp đồng',
      'Xe thay thế khi có sự cố dọc đường',
    ],
    rateFilter: null,
    rateNote:
      'Hợp đồng tháng và tuyến cố định được báo giá riêng theo số chuyến, quãng đường và khung giờ. Quý khách gửi tuyến, chúng tôi khảo sát rồi báo giá.',
    vehicles: ['ford-transit-16-cho', 'hyundai-universe-45-cho', 'bmw-520i', 'kia-carnival'],
    faq: [
      {
        q: 'Thời hạn hợp đồng ngắn nhất là bao lâu?',
        a: 'Chúng tôi ký theo tháng. Với sự kiện hoặc đợt cao điểm ngắn hạn, chúng tôi báo giá theo từng đợt mà không cần hợp đồng dài hạn.',
      },
      {
        q: 'Nếu xe hỏng giữa tuyến thì sao?',
        a: 'Điều phối viên điều xe thay thế và báo ngay cho người phụ trách phía doanh nghiệp. Đó là lý do chúng tôi luôn giữ xe dự phòng thay vì khai thác hết công suất.',
      },
      {
        q: 'HTH có phục vụ tuyến nhà máy ngoài TP.HCM không?',
        a: 'Có. Bình Dương, Đồng Nai và Long An là những tuyến chúng tôi chạy thường xuyên.',
      },
      {
        q: 'HTH có xuất hóa đơn cho doanh nghiệp không?',
        a: 'Có. Quý khách gửi thông tin xuất hóa đơn khi ký hợp đồng, bộ phận kế toán sẽ xuất theo từng kỳ.',
      },
    ],
    en: {
      slug: 'corporate-transport',
      nav: 'Corporate',
      h1: 'Staff shuttles and corporate transport',
      title: 'Corporate transport and staff shuttles',
      description:
        'Staff shuttles, factory routes and executive cars in Ho Chi Minh City and nearby provinces. Monthly contracts with one coordinator and a trip log.',
      eyebrow: 'Service',
      lead:
        'Staff routes, factory runs, cars for the board and transport for your visitors. Monthly contracts with one person permanently on the account.',
      steps: [
        { title: 'Send the route and the hours', body: 'Pickup points, drop-off, how many people per run, which days of the week.' },
        { title: 'We drive it before we price it', body: 'We run the route to see what it actually takes at peak, then quote.' },
        { title: 'Sign a monthly contract', body: 'A fixed monthly price with a trip log you can reconcile at the end of the period.' },
        { title: 'One coordinator', body: 'One number for every change: a new time, an extra run, a replacement car when something goes wrong.' },
      ],
      included: [
        'A regular car and chauffeur for each route',
        'A monthly trip log',
        'One coordinator across the whole contract',
        'A replacement car if a vehicle fails on the road',
      ],
      rateNote:
        'Monthly contracts and fixed routes are priced individually on the number of runs, the distance and the hours. Send us the route and we will survey it before quoting.',
      faq: [
        {
          q: 'What is the shortest contract?',
          a: 'We work monthly. For an event or a short busy period we quote per project instead, with no long contract needed.',
        },
        {
          q: 'What if a vehicle breaks down mid-route?',
          a: 'The coordinator sends a replacement and tells your contact directly. That is why we keep spare vehicles rather than running every car every day.',
        },
        {
          q: 'Do you cover factory routes outside the city?',
          a: 'Yes. Binh Duong, Dong Nai and Long An are routes we run regularly.',
        },
        {
          q: 'Can you invoice the company?',
          a: 'Yes. Send the invoicing details when the contract is signed and accounts handles it each period.',
        },
      ],
    },
  },

  {
    slug: 'tour-du-lich',
    nav: 'Tour và đi tỉnh',
    h1: 'Thuê xe đi tỉnh và tour du lịch',
    title: 'Thuê xe đi tỉnh và tour miền Nam',
    description:
      'Thuê xe có tài xế đi Vũng Tàu, Hồ Tràm, Phan Thiết, Đà Lạt, Nha Trang và miền Tây. Lộ trình sắp xếp theo giờ nhận phòng, giá trọn gói theo tuyến.',
    eyebrow: 'Dịch vụ',
    lead:
      'Vũng Tàu, Hồ Tràm, Phan Thiết, Đà Lạt, Nha Trang và miền Tây. Lộ trình được sắp xếp theo giờ nhận phòng và nhịp nghỉ ngơi thực tế của đoàn.',
    image: '/img/solati-cabin-sunset.webp',
    imageAlt: 'Khoang khách D’Car nhìn ra hoàng hôn trên đường đi tỉnh',
    steps: [
      {
        title: 'Cho biết điểm đến và số ngày',
        body: 'Kèm tên khách sạn nếu đã đặt, vì giờ nhận phòng quyết định giờ khởi hành hợp lý.',
      },
      {
        title: 'Chúng tôi đề xuất lộ trình',
        body: 'Bao gồm điểm dừng nghỉ và nơi ăn trưa dọc đường, dựa trên những chặng chúng tôi chạy thường xuyên.',
      },
      {
        title: 'Chốt xe và giá trọn tuyến',
        body: 'Một mức giá cho cả hành trình, không tính lại theo giờ khi quay về.',
      },
      {
        title: 'Một tài xế suốt chuyến',
        body: 'Tài xế thông thạo đường, biết chỗ đỗ xe ở các điểm tham quan và những khung giờ nên tránh cửa ngõ thành phố.',
      },
    ],
    included: [
      'Xe và tài xế cho toàn bộ hành trình',
      'Nhiên liệu và phí cầu đường trên tuyến',
      'Nước suối và khăn lạnh',
      'Gợi ý điểm dừng nghỉ trên đường',
    ],
    rateFilter: (row) => !row.route.includes('Nội thành') && !row.route.includes('Tân Sơn Nhất'),
    rateNote:
      'Với tuyến ngoài bảng hoặc lịch trình dài ngày, Quý khách vui lòng gọi hotline. Chúng tôi lên lộ trình rồi báo một mức giá trọn gói.',
    vehicles: ['hyundai-solati-dcar-limousine', 'ford-transit-dcar-limousine', 'kia-carnival', 'hyundai-universe-45-cho'],
    faq: [
      {
        q: 'Giá đã gồm chi phí ăn nghỉ của tài xế chưa?',
        a: 'Với lịch trình từ hai ngày, chi phí ăn nghỉ của tài xế được ghi rõ trong báo giá gửi Quý khách, không phát sinh vào ngày đi.',
      },
      {
        q: 'HTH có hỗ trợ lên lộ trình không?',
        a: 'Có. Quý khách cho biết điểm đến và số ngày, chúng tôi sẽ đề xuất lộ trình dựa trên các chặng chạy thường xuyên, gồm cả điểm dừng nghỉ.',
      },
      {
        q: 'Đi Đà Lạt hoặc Nha Trang nên chọn xe nào?',
        a: 'Với chặng dài, khoang xe cao và ghế ngả sâu tạo khác biệt rõ rệt. D’Car Solati hoặc Transit là lựa chọn quen thuộc của khách trên những tuyến này.',
      },
    ],
    en: {
      slug: 'tours-and-intercity',
      nav: 'Tours, intercity',
      h1: 'Tours and intercity travel',
      title: 'Chauffeured trips to Da Lat and the Mekong',
      description:
        'Chauffeured trips from Ho Chi Minh City to Vung Tau, Ho Tram, Phan Thiet, Da Lat, Nha Trang and the Mekong Delta. Routes planned around your check-in time.',
      eyebrow: 'Service',
      lead:
        'Vung Tau, Ho Tram, Phan Thiet, Da Lat, Nha Trang, the Mekong. Routes built around real check-in times and the pace people actually travel at.',
      steps: [
        { title: 'Tell us where and how long', body: 'Include the hotel if you have booked one. Check-in time decides what a sensible departure looks like.' },
        { title: 'We suggest the route', body: 'Including where to stop and where lunch works, based on the roads we drive every week.' },
        { title: 'Fix one price for the trip', body: 'One number for the whole journey, with no meter running on the way home.' },
        { title: 'One chauffeur throughout', body: 'Someone who knows the road, knows where to park at the sights, and knows which hours to avoid at the city limits.' },
      ],
      included: [
        'Car and chauffeur for the whole journey',
        'Fuel and tolls on the route',
        'Bottled water and cold towels',
        'Suggested rest stops along the way',
      ],
      rateNote:
        'For a route outside the table or a longer itinerary, call the hotline. We plan the trip and then quote one all-in price.',
      faq: [
        {
          q: 'Does the price include the chauffeur food and lodging?',
          a: 'On trips of two days or more, those costs are written into the quote we send you, not mentioned for the first time on the day.',
        },
        {
          q: 'Will you plan the itinerary?',
          a: 'Yes. Tell us the destination and the number of days and we will propose a route, rest stops included, based on the roads we run regularly.',
        },
        {
          q: 'Which car for Da Lat or Nha Trang?',
          a: 'On long runs a high cabin and a deep-reclining seat make a real difference. The Solati and the Transit D’Car are what most people on those routes choose.',
        },
      ],
    },
  },
];

export const serviceBySlug = Object.fromEntries(services.map((s) => [s.slug, s]));
