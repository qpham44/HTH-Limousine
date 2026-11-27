import type { RateRow } from '@/data/rates';

/**
 * Route pages — generated from data, never hand-written one by one.
 * Adding a route is adding an entry here.
 *
 * Distances and drive times come from the measured pairs in lib/quote.ts,
 * which are HTH's own numbers. Everything else describes the drive as it
 * actually is; nothing about traffic or timing is invented.
 */

export interface RouteFaq {
  q: string;
  a: string;
}

export interface RouteCopy {
  slug: string;
  nav: string;
  h1: string;
  title: string;
  description: string;
  lead: string;
  body: string[];
  notes: { title: string; body: string }[];
  faq: RouteFaq[];
}

export interface Route {
  slug: string;
  nav: string;
  h1: string;
  title: string;
  description: string;
  lead: string;
  /** Measured one way. */
  km: number;
  /** Minutes, one way, outside peak. */
  minutes: number;
  image: string;
  imageAlt: string;
  /** Two or three paragraphs about the drive itself. */
  body: string[];
  /** Concrete things worth knowing before booking this route. */
  notes: { title: string; body: string }[];
  rateFilter: (row: RateRow) => boolean;
  vehicles: string[];
  faq: RouteFaq[];
  related: string[];
  /** Written for an English reader, not translated. */
  en: RouteCopy;
}

export const routes: Route[] = [
  {
    slug: 'sai-gon-di-vung-tau',
    nav: 'Sài Gòn – Vũng Tàu',
    h1: 'Thuê xe Sài Gòn đi Vũng Tàu',
    title: 'Thuê xe Sài Gòn đi Vũng Tàu có tài xế',
    description:
      'Thuê xe có tài xế từ TP.HCM đi Vũng Tàu: 125 km, khoảng 2 giờ 15 phút. Giá trọn gói một chiều, trong ngày hoặc 2 ngày 1 đêm cho xe 4 đến 45 chỗ.',
    lead: 'Tuyến đường HTH phục vụ nhiều nhất. Quãng đường 125 km qua cao tốc Long Thành; nếu khởi hành sáng sớm, chỉ hơn hai tiếng là tới biển.',
    km: 125,
    minutes: 135,
    image: '/img/solati.webp',
    imageAlt: 'Hai xe Hyundai Solati D’Car Limousine của HTH chờ khách trước sảnh khách sạn',
    body: [
      'Lộ trình gần như cố định: cao tốc TP.HCM – Long Thành – Dầu Giây, rẽ vào quốc lộ 51, qua Bà Rịa rồi xuống Vũng Tàu. Vì hầu như không có lựa chọn đường khác, thời gian di chuyển phụ thuộc chủ yếu vào giờ Quý khách rời thành phố.',
      'Khung giờ cần lưu ý là chiều thứ Sáu và sáng thứ Bảy, khi quốc lộ 51 đoạn qua Bà Rịa thường ùn tắc. Khách đi nghỉ cuối tuần thường chọn khởi hành trước 6 giờ sáng hoặc sau 20 giờ để tránh đoạn này.',
      'Chặng đường đủ ngắn để đi về trong ngày nhưng cũng đủ dài để chất lượng ghế ngồi tạo nên khác biệt. Đoàn từ sáu khách trở lên phần lớn chọn D’Car; nhóm nhỏ hơn thường đi Carnival cho gọn nhẹ.',
    ],
    notes: [
      {
        title: 'Có thể đi về trong ngày',
        body: 'Khởi hành lúc 6 giờ, tới biển trước 9 giờ và về đến thành phố khoảng 19 giờ. Đây là lịch trình phần lớn khách lựa chọn cho tuyến này.',
      },
      {
        title: 'Trạm dừng trên cao tốc',
        body: 'Khoảng giữa chặng có một trạm dừng nghỉ thuận tiện. Tài xế sẽ ghé nếu Quý khách cần, còn không thì đi thẳng.',
      },
      {
        title: 'Đón nhiều điểm trong thành phố',
        body: 'Đón khách ở hai, ba địa chỉ trước khi lên cao tốc là việc thường xuyên. Quý khách báo trước để chúng tôi sắp xếp thứ tự đón hợp lý.',
      },
    ],
    rateFilter: (row) => row.route.includes('Vũng Tàu'),
    vehicles: ['kia-carnival', 'hyundai-solati-dcar-limousine', 'ford-transit-dcar-limousine', 'hyundai-universe-45-cho'],
    faq: [
      {
        q: 'Sài Gòn đi Vũng Tàu bao nhiêu km và mất bao lâu?',
        a: '125 km tính từ trung tâm Quận 1. Ngoài giờ cao điểm, thời gian di chuyển khoảng 2 giờ 15 phút; chiều thứ Sáu và sáng thứ Bảy có thể lâu hơn 30 đến 45 phút do ùn tắc trên quốc lộ 51.',
      },
      {
        q: 'Giá đã gồm phí cao tốc chưa?',
        a: 'Đã bao gồm. Giá trọn gói gồm xe, tài xế, nhiên liệu, phí cầu đường và bảo hiểm hành khách.',
      },
      {
        q: 'Giá đi trong ngày và 2 ngày 1 đêm khác nhau thế nào?',
        a: 'Gói trong ngày tính trọn một ngày. Gói hai ngày một đêm cao hơn vì xe và tài xế lưu lại cùng đoàn. Mức giá cụ thể có trong bảng bên dưới.',
      },
      {
        q: 'Xe có chờ tại Vũng Tàu trong lúc đoàn tham quan không?',
        a: 'Có, gói trong ngày đã bao gồm thời gian chờ. Tài xế đỗ xe gần nơi Quý khách nghỉ và quay lại ngay khi được gọi.',
      },
    ],
    related: ['sai-gon-di-ho-tram', 'sai-gon-di-phan-thiet'],
    en: {
      slug: 'saigon-to-vung-tau',
      nav: 'Saigon to Vung Tau',
      h1: 'Car and chauffeur, Saigon to Vung Tau',
      title: 'Saigon to Vung Tau by chauffeured car',
      description:
        'Chauffeured car from Ho Chi Minh City to Vung Tau: 125 km, about 2 hours 15 minutes. All-in prices one way, for the day or two days and a night.',
      lead: 'The route we drive most. 125 km on the Long Thanh expressway, and a little over two hours if you leave early.',
      body: [
        'The road barely varies: the Ho Chi Minh City to Long Thanh expressway, onto Highway 51, through Ba Ria and down into Vung Tau. There is no meaningful choice of route, so the time depends almost entirely on when you leave the city.',
        'The hours to watch are Friday afternoon and Saturday morning, when Highway 51 around Ba Ria backs up. Weekenders usually leave before six in the morning or after eight at night to miss it.',
        'The trip is short enough to do in a day and long enough that the seat matters. Groups of six and up mostly take a D’Car; smaller parties usually go in the Carnival.',
      ],
      notes: [
        { title: 'A day trip works', body: 'Leave at six, be on the beach before nine, back in the city around seven. That is how most people book this route.' },
        { title: 'One sensible stop', body: 'There is a rest area about halfway. The chauffeur pulls in if you want it, otherwise drives straight through.' },
        { title: 'Several pickups in town', body: 'Collecting people from two or three addresses before the expressway is routine. Tell us in advance so we can order the stops sensibly.' },
      ],
      faq: [
        {
          q: 'How far is Saigon to Vung Tau, and how long does it take?',
          a: '125 km from District 1. Outside peak it takes about 2 hours 15 minutes. Friday afternoon and Saturday morning can add 30 to 45 minutes because of Highway 51.',
        },
        { q: 'Are tolls included?', a: 'Yes. The price covers the car, the chauffeur, fuel, tolls and passenger insurance.' },
        {
          q: 'What is the difference between a day trip and two days?',
          a: 'A day trip is priced as a single day out. Two days and a night costs more because the car and chauffeur stay with you. The figures are in the table below.',
        },
        {
          q: 'Can the car wait while we are at the beach?',
          a: 'Yes, that is how the day package works. The chauffeur parks near where you are and comes back when you call.',
        },
      ],
    },
  },

  {
    slug: 'sai-gon-di-ho-tram',
    nav: 'Sài Gòn – Hồ Tràm',
    h1: 'Thuê xe Sài Gòn đi Hồ Tràm',
    title: 'Thuê xe Sài Gòn đi Hồ Tràm có tài xế',
    description:
      'Thuê xe có tài xế TP.HCM đi Hồ Tràm: 130 km, khoảng 2 giờ 30 phút. Giá trọn gói cho resort Hồ Tràm và sân golf The Bluffs, xe 4 đến 45 chỗ.',
    lead: 'Xa hơn Vũng Tàu khoảng mười lăm phút nhưng yên tĩnh hơn hẳn. Đây là tuyến quen thuộc của khách nghỉ dưỡng và các golfer đến sân The Bluffs.',
    km: 130,
    minutes: 150,
    image: '/img/transit-dcar-golf.webp',
    imageAlt: 'Bốn bộ gậy golf xếp trong cốp sau xe Ford Transit D’Car của HTH',
    body: [
      'Lộ trình trùng với hướng đi Vũng Tàu đến Bà Rịa, sau đó rẽ sang đường ven biển qua Long Hải tới Hồ Tràm. Đoạn cuối chạy sát biển, đường rộng và thưa xe.',
      'Khách chơi golf thường đặt giờ đón rất sớm để kịp giờ tee-off, tức là rời thành phố khoảng 4 giờ sáng. Tài xế của HTH đã quen với lịch trình này nên Quý khách không cần dặn dò nhiều.',
      'Túi gậy golf là lý do chính khiến khách chọn Transit D’Car cho tuyến này: cốp sau đủ sâu để xếp đứng bốn bộ gậy mà không phải gập ghế.',
    ],
    notes: [
      {
        title: 'Giờ tee-off',
        body: 'Quý khách chỉ cần cho biết giờ tee-off; chúng tôi sẽ tính ngược ra giờ khởi hành, có trừ hao thời gian qua cửa ngõ thành phố.',
      },
      {
        title: 'Chỗ để gậy golf',
        body: 'Cốp sau Transit D’Car xếp vừa bốn bộ gậy. Nếu nhiều hơn, Quý khách báo trước để chúng tôi đổi xe hoặc bố trí thêm xe.',
      },
      {
        title: 'Các resort cách xa nhau',
        body: 'Các khu nghỉ dưỡng dọc Hồ Tràm cách nhau vài cây số. Quý khách vui lòng cho biết tên resort cụ thể để tài xế đưa đến tận nơi.',
      },
    ],
    rateFilter: (row) => row.route.includes('Hồ Tràm'),
    vehicles: ['ford-transit-dcar-limousine', 'hyundai-solati-dcar-limousine', 'kia-carnival', 'bmw-520i'],
    faq: [
      {
        q: 'Sài Gòn đi Hồ Tràm mất bao lâu?',
        a: 'Quãng đường 130 km, mất khoảng 2 giờ 30 phút ngoài giờ cao điểm. Nếu khởi hành từ 4 đến 5 giờ sáng, đường gần như vắng xe.',
      },
      {
        q: 'Xe chở được mấy bộ gậy golf?',
        a: 'Cốp sau Transit D’Car xếp đứng vừa bốn bộ mà không phải gập ghế. Với đoàn mang nhiều gậy hơn, chúng tôi sẽ bố trí xe lớn hơn hoặc thêm xe.',
      },
      {
        q: 'Có đón tại sân bay Tân Sơn Nhất đi thẳng Hồ Tràm không?',
        a: 'Có. Quý khách gửi số hiệu chuyến bay, tài xế sẽ đón tại cửa ra và đi thẳng tới Hồ Tràm mà không cần ghé thành phố.',
      },
    ],
    related: ['sai-gon-di-vung-tau', 'sai-gon-di-phan-thiet'],
    en: {
      slug: 'saigon-to-ho-tram',
      nav: 'Saigon to Ho Tram',
      h1: 'Car and chauffeur, Saigon to Ho Tram',
      title: 'Saigon to Ho Tram by chauffeured car',
      description:
        'Chauffeured car from Ho Chi Minh City to Ho Tram: 130 km, about 2 hours 30 minutes. All-in prices for the Ho Tram resorts and The Bluffs golf course.',
      lead: 'About fifteen minutes further than Vung Tau and far quieter. The usual run for resort guests and for tee times at The Bluffs.',
      body: [
        'The same road as Vung Tau as far as Ba Ria, then off onto the coast road through Long Hai to Ho Tram. The last stretch runs beside the sea, wide and largely empty.',
        'Golfers book very early pickups to make their tee time, which means leaving the city around four in the morning. Our chauffeurs take that booking often enough that it needs no explaining.',
        'Golf bags are the main reason people pick the Transit D’Car for this route. The rear hold is deep enough to take four sets standing, without folding a seat.',
      ],
      notes: [
        { title: 'Give us the tee time', body: 'Tell us when you tee off rather than when you want collecting. We work backwards and allow for the city limits.' },
        { title: 'Room for the clubs', body: 'Four sets fit in the Transit D’Car. More than that, say so in advance and we will change the car or add one.' },
        { title: 'The resorts are spread out', body: 'The properties along Ho Tram sit kilometres apart. Give the exact resort so the chauffeur takes you to the door.' },
      ],
      faq: [
        { q: 'How long does Saigon to Ho Tram take?', a: '130 km, about 2 hours 30 minutes outside peak. Leaving between four and five in the morning, the road is almost empty.' },
        {
          q: 'How many golf bags fit?',
          a: 'Four sets stand in the rear hold of the Transit D’Car without folding a seat. For more we arrange a larger vehicle or a second car.',
        },
        {
          q: 'Can you collect from Tan Son Nhat and drive straight to Ho Tram?',
          a: 'Yes. Send the flight number and the chauffeur meets you at arrivals and goes direct, with no stop in the city.',
        },
      ],
    },
  },

  {
    slug: 'sai-gon-di-da-lat',
    nav: 'Sài Gòn – Đà Lạt',
    h1: 'Thuê xe Sài Gòn đi Đà Lạt',
    title: 'Thuê xe Sài Gòn đi Đà Lạt có tài xế',
    description:
      'Thuê xe có tài xế TP.HCM đi Đà Lạt: 305 km, khoảng 7 giờ chạy. Giá trọn gói một chiều, 2 ngày 1 đêm và 3 ngày 2 đêm cho xe 4 đến 45 chỗ.',
    lead: 'Bảy tiếng trên đường, trong đó có đoạn đèo Bảo Lộc. Trên chặng dài này, chiếc ghế Quý khách ngồi sẽ quyết định Quý khách đến nơi thoải mái hay mệt mỏi.',
    km: 305,
    minutes: 420,
    image: '/img/solati-cabin.webp',
    imageAlt: 'Khoang khách Hyundai Solati D’Car với ghế da ngả sâu',
    body: [
      'Lộ trình đi qua Dầu Giây, Bảo Lộc rồi lên đèo. Đèo Bảo Lộc là đoạn chậm nhất và cũng dễ khiến khách say xe nếu ngồi ghế cứng hoặc hàng ghế cuối.',
      'Bảy tiếng là thời gian thực tế, đã tính hai lần dừng nghỉ. Đi liền một mạch sẽ nhanh hơn, nhưng chưa có khách nào chọn cách đó đến lần thứ hai.',
      'Vì chặng đường dài, phần lớn khách chọn D’Car: ghế ngả sâu và trần cao tạo khác biệt rõ rệt từ tiếng thứ tư trở đi. Sedan bốn chỗ vẫn đi được, nhưng ít khách chọn cho lịch trình đi về trong hai ngày.',
    ],
    notes: [
      {
        title: 'Đèo Bảo Lộc',
        body: 'Tài xế tuyến này đã quen đường đèo. Khách dễ say xe nên ngồi hàng ghế trước và báo tài xế để giảm tốc ở những khúc cua.',
      },
      {
        title: 'Hai điểm dừng',
        body: 'Thông thường xe dừng ở Dầu Giây và trước khi lên đèo. Nếu muốn ghé thêm điểm nào, Quý khách báo trước để chúng tôi đưa vào lịch trình.',
      },
      {
        title: 'Lịch nhiều ngày',
        body: 'Với lịch trình từ hai ngày trở lên, chi phí ăn nghỉ của tài xế được ghi rõ trong báo giá gửi Quý khách.',
      },
    ],
    rateFilter: (row) => row.route.includes('Đà Lạt'),
    vehicles: ['hyundai-solati-dcar-limousine', 'ford-transit-dcar-limousine', 'kia-carnival', 'hyundai-universe-45-cho'],
    faq: [
      {
        q: 'Sài Gòn đi Đà Lạt bao nhiêu km, mất mấy tiếng?',
        a: 'Quãng đường 305 km, mất khoảng 7 giờ kể cả hai lần dừng nghỉ. Đèo Bảo Lộc là đoạn đi chậm nhất.',
      },
      {
        q: 'Chặng này nên chọn xe nào?',
        a: 'D’Car Solati hoặc Transit là lựa chọn quen thuộc của khách đi Đà Lạt: ghế ngả sâu, trần cao, có thể đứng thẳng trong khoang. Từ tiếng thứ tư trở đi, sự khác biệt rất rõ rệt.',
      },
      {
        q: 'Có thể đi đêm không?',
        a: 'Có. Nhiều đoàn khởi hành khoảng 22 giờ để sáng sớm có mặt tại Đà Lạt. Tài xế của chúng tôi chạy tuyến đêm này thường xuyên.',
      },
      {
        q: 'Nếu muốn xe ở lại Đà Lạt vài ngày thì tính thế nào?',
        a: 'Quý khách chọn gói 2 ngày 1 đêm hoặc 3 ngày 2 đêm; xe và tài xế lưu lại cùng đoàn và phục vụ di chuyển trong thành phố. Mức giá có trong bảng bên dưới.',
      },
    ],
    related: ['sai-gon-di-phan-thiet', 'sai-gon-di-vung-tau'],
    en: {
      slug: 'saigon-to-da-lat',
      nav: 'Saigon to Da Lat',
      h1: 'Car and chauffeur, Saigon to Da Lat',
      title: 'Saigon to Da Lat by chauffeured car',
      description:
        'Chauffeured car from Ho Chi Minh City to Da Lat: 305 km, around 7 hours driving. All-in prices one way, two days and three days, for 4 to 45 seats.',
      lead: 'Seven hours on the road, including the Bao Loc pass. This is the trip where the seat you sit in decides what state you arrive in.',
      body: [
        'The road runs through Dau Giay and Bao Loc, then climbs. The Bao Loc pass is the slowest part and the part that makes people car sick if they are in a hard seat or the back row.',
        'Seven hours is the realistic figure and it already includes two stops. Driving it straight through is quicker, but nobody has asked for that twice.',
        'Because it is long, most people take a D’Car. Deep-reclining seats and a high roof make an obvious difference after the fourth hour. A four-seat sedan will do it, though few choose that for a two-day return.',
      ],
      notes: [
        { title: 'The Bao Loc pass', body: 'Our chauffeurs know this climb. Anyone who gets car sick should sit in the front row, and tell the driver so they take the bends slower.' },
        { title: 'Two stops', body: 'Usually at Dau Giay and again before the climb. If you want to add somewhere, say so and we build it into the plan.' },
        { title: 'Multi-day trips', body: 'On two days or more, the chauffeur costs are written into the quote we send you.' },
      ],
      faq: [
        { q: 'How far is Saigon to Da Lat and how long does it take?', a: '305 km. About 7 hours including two rest stops. The Bao Loc pass is the slow section.' },
        {
          q: 'Which car suits this route?',
          a: 'The Solati or the Transit D’Car are what people going to Da Lat usually pick: deep-reclining seats, a high roof, and enough headroom to stand up in the cabin. After the fourth hour the difference is obvious.',
        },
        { q: 'Can we travel overnight?', a: 'Yes. Plenty of groups leave around ten at night to arrive in the morning. Our chauffeurs run that overnight leg regularly.' },
        {
          q: 'What if we want the car with us in Da Lat for a few days?',
          a: 'Take the two-day or three-day package. The car and chauffeur stay with the group and drive you around the town. Prices are in the table below.',
        },
      ],
    },
  },

  {
    slug: 'sai-gon-di-phan-thiet',
    nav: 'Sài Gòn – Phan Thiết',
    h1: 'Thuê xe Sài Gòn đi Phan Thiết, Mũi Né',
    title: 'Thuê xe Sài Gòn đi Phan Thiết, Mũi Né',
    description:
      'Thuê xe có tài xế TP.HCM đi Phan Thiết và Mũi Né: 205 km, khoảng 4 giờ. Giá trọn gói trong ngày và 2 ngày 1 đêm cho xe 4 đến 45 chỗ.',
    lead: 'Khoảng bốn tiếng qua cao tốc Dầu Giây – Phan Thiết, ngắn hơn đáng kể so với Đà Lạt và gần như không có đường đèo.',
    km: 205,
    minutes: 240,
    image: '/img/solati-cabin-sunset.webp',
    imageAlt: 'Khoang khách D’Car nhìn ra hoàng hôn trên đường đi tỉnh',
    body: [
      'Tuyến cao tốc đã rút ngắn chặng này còn khoảng bốn tiếng, nên nay có thể đi Phan Thiết và về trong ngày, điều mà vài năm trước chưa thực sự hợp lý.',
      'Mũi Né cách trung tâm Phan Thiết khoảng hai mươi phút chạy dọc biển. Nếu khách sạn ở Mũi Né, Quý khách nên cộng thêm khoảng thời gian này vào giờ đến.',
      'Sau một ngày tham quan đồi cát, xe thường bám bụi nhiều hơn bình thường. Việc vệ sinh xe đã có chúng tôi lo, Quý khách không cần bận tâm.',
    ],
    notes: [
      {
        title: 'Phan Thiết hay Mũi Né',
        body: 'Hai nơi cách nhau khoảng hai mươi phút. Quý khách vui lòng cho biết địa chỉ khách sạn để chúng tôi tính đúng giờ đến.',
      },
      {
        title: 'Đi về trong ngày',
        body: 'Với bốn tiếng mỗi chiều, đi về trong ngày là khả thi dù khá dài. Đoàn có trẻ nhỏ thường chọn nghỉ lại một đêm.',
      },
      {
        title: 'Đón thẳng từ sân bay',
        body: 'Nhiều khách hạ cánh tại Tân Sơn Nhất rồi đi thẳng Phan Thiết. Quý khách chỉ cần gửi số hiệu chuyến bay.',
      },
    ],
    rateFilter: (row) => row.route.includes('Phan Thiết'),
    vehicles: ['hyundai-solati-dcar-limousine', 'kia-carnival', 'ford-transit-dcar-limousine', 'ford-transit-16-cho'],
    faq: [
      {
        q: 'Sài Gòn đi Phan Thiết mất bao lâu?',
        a: 'Quãng đường 205 km, mất khoảng 4 giờ qua cao tốc Dầu Giây – Phan Thiết. Nếu đi tiếp ra Mũi Né, cộng thêm khoảng 20 phút.',
      },
      {
        q: 'Có đi về trong ngày được không?',
        a: 'Được. Với bốn tiếng mỗi chiều, đó sẽ là một ngày khá dài, nhưng nhiều đoàn vẫn chọn phương án này.',
      },
      {
        q: 'Đoàn 16 người nên chọn xe nào?',
        a: 'Ford Transit 16 chỗ nếu ưu tiên gọn nhẹ và tiết kiệm; hai xe D’Car nếu muốn khoang rộng và ghế ngả. Điều phối viên sẽ báo giá cả hai phương án để Quý khách so sánh.',
      },
    ],
    related: ['sai-gon-di-da-lat', 'sai-gon-di-ho-tram'],
    en: {
      slug: 'saigon-to-phan-thiet',
      nav: 'Saigon to Phan Thiet',
      h1: 'Car and chauffeur, Saigon to Phan Thiet and Mui Ne',
      title: 'Saigon to Phan Thiet and Mui Ne by car',
      description:
        'Chauffeured car from Ho Chi Minh City to Phan Thiet and Mui Ne: 205 km, about 4 hours. All-in prices for a day trip or two days and a night.',
      lead: 'Four hours on the Dau Giay to Phan Thiet expressway. Considerably shorter than Da Lat, and with almost no mountain road.',
      body: [
        'The expressway has cut this run to around four hours, which makes Phan Thiet a sensible day trip. A few years ago it was not.',
        'Mui Ne is another twenty minutes beyond the centre of Phan Thiet, along the coast. If your hotel is in Mui Ne, add that to the arrival time.',
        'Sand and sun are the two things guests forget: the car will be dustier after a day at the dunes than when it set off. That is our problem to deal with, not yours.',
      ],
      notes: [
        { title: 'Phan Thiet or Mui Ne', body: 'The two are about twenty minutes apart. Give the hotel address so the arrival time is right.' },
        { title: 'There and back in a day', body: 'Four hours each way makes a day trip possible, if long. Groups with small children usually stay the night.' },
        { title: 'Straight from the airport', body: 'Plenty of guests land at Tan Son Nhat and drive straight out. The flight number is all we need.' },
      ],
      faq: [
        { q: 'How long is Saigon to Phan Thiet?', a: '205 km, about 4 hours on the Dau Giay to Phan Thiet expressway. Carrying on to Mui Ne adds roughly 20 minutes.' },
        { q: 'Can it be done in one day?', a: 'Yes. Four hours each way makes for a long day, but many groups still choose it.' },
        {
          q: 'What car for a group of 16?',
          a: 'A 16-seat Transit if you want it simple and economical, or two D’Cars for the wider cabin and reclining seats. The coordinator quotes both so you can compare.',
        },
      ],
    },
  },

  {
    slug: 'sai-gon-di-can-tho',
    nav: 'Sài Gòn – Cần Thơ',
    h1: 'Thuê xe Sài Gòn đi Cần Thơ, miền Tây',
    title: 'Thuê xe Sài Gòn đi Cần Thơ, miền Tây',
    description:
      'Thuê xe có tài xế TP.HCM đi Cần Thơ và miền Tây: 170 km, khoảng 3 giờ 15 phút. Giá trọn gói trong ngày và 2 ngày 1 đêm cho xe 4 đến 45 chỗ.',
    lead: 'Khoảng ba tiếng mười lăm phút qua cao tốc Trung Lương và cầu Mỹ Thuận, điểm khởi đầu của hầu hết lịch trình miền Tây.',
    km: 170,
    minutes: 195,
    image: '/img/carnival.webp',
    imageAlt: 'Kia Carnival của HTH Limousine chụp nghiêng trước lúc hoàng hôn',
    body: [
      'Xe chạy cao tốc tới Trung Lương, sau đó theo quốc lộ 1 qua Cái Bè, Vĩnh Long và cầu Cần Thơ. Mặt đường tốt, chặng đi khá nhẹ nhàng.',
      'Phần lớn khách không dừng lại ở Cần Thơ mà xem đây là chặng đầu của một lịch trình dài hơn: xuống Sóc Trăng, Cà Mau hoặc vòng qua Bến Tre, Trà Vinh. Nếu Quý khách gửi trước toàn bộ lịch trình, chúng tôi sẽ báo giá trọn tuyến thay vì tính từng chặng.',
      'Chợ nổi Cái Răng họp từ rất sớm, nên khách muốn kịp chợ thường rời Sài Gòn từ khuya hôm trước hoặc nghỉ lại Cần Thơ một đêm.',
    ],
    notes: [
      {
        title: 'Chợ nổi họp sớm',
        body: 'Để kịp chợ nổi Cái Răng, nghỉ lại Cần Thơ một đêm sẽ hợp lý hơn đi về trong ngày.',
      },
      {
        title: 'Đi tiếp xuống miền Tây',
        body: 'Cần Thơ thường chỉ là chặng đầu. Quý khách gửi cả lịch trình để nhận một mức giá trọn tuyến.',
      },
      {
        title: 'Đi phà',
        body: 'Một số điểm ở miền Tây vẫn phải qua phà. Nếu lịch trình có đoạn này, chúng tôi sẽ ghi rõ trong báo giá.',
      },
    ],
    rateFilter: (row) => row.route.includes('Cần Thơ') || row.route.includes('Mỹ Tho'),
    vehicles: ['kia-carnival', 'hyundai-solati-dcar-limousine', 'ford-transit-16-cho', 'hyundai-universe-45-cho'],
    faq: [
      {
        q: 'Sài Gòn đi Cần Thơ bao nhiêu km?',
        a: 'Quãng đường 170 km, mất khoảng 3 giờ 15 phút qua cao tốc Trung Lương và cầu Cần Thơ.',
      },
      {
        q: 'Đi nhiều tỉnh miền Tây trong một chuyến thì báo giá thế nào?',
        a: 'Quý khách gửi toàn bộ lịch trình, chúng tôi sẽ báo một mức giá cho cả tuyến thay vì cộng dồn từng chặng; cách tính này thường tiết kiệm hơn.',
      },
      {
        q: 'Giá đã gồm phí phà chưa?',
        a: 'Nếu lịch trình có đoạn qua phà, chúng tôi sẽ ghi rõ trong báo giá gửi Quý khách trước chuyến đi.',
      },
    ],
    related: ['sai-gon-di-vung-tau', 'sai-gon-di-phan-thiet'],
    en: {
      slug: 'saigon-to-can-tho',
      nav: 'Saigon to Can Tho',
      h1: 'Car and chauffeur, Saigon to Can Tho and the Mekong',
      title: 'Saigon to Can Tho and the Mekong Delta',
      description:
        'Chauffeured car from Ho Chi Minh City to Can Tho and the Mekong Delta: 170 km, about 3 hours 15 minutes. All-in prices for a day or a longer itinerary.',
      lead: 'Three and a quarter hours on the Trung Luong expressway and over the Can Tho bridge. The start of most Mekong itineraries.',
      body: [
        'Expressway as far as Trung Luong, then Highway 1 through Cai Be and Vinh Long and across the Can Tho bridge. Good road, easy going.',
        'Most people going to Can Tho are not stopping at Can Tho. It is the first leg of something longer, down to Soc Trang or Ca Mau, or round through Ben Tre and Tra Vinh. Send the whole itinerary and we price the trip rather than each leg.',
        'Cai Rang floating market starts early, so guests who want to see it either leave Saigon late the night before or stay a night in Can Tho.',
      ],
      notes: [
        { title: 'The market starts early', body: 'To make Cai Rang floating market, staying a night in Can Tho works better than driving down in the morning.' },
        { title: 'Going further into the delta', body: 'Can Tho is usually just the first leg. Send the full itinerary for one price covering the whole trip.' },
        { title: 'Ferries', body: 'A few places in the delta still involve a ferry. Where your itinerary includes one, we say so in the quote.' },
      ],
      faq: [
        { q: 'How far is Saigon to Can Tho?', a: '170 km, about 3 hours 15 minutes via the Trung Luong expressway and the Can Tho bridge.' },
        {
          q: 'How do you price a multi-province Mekong trip?',
          a: 'Send the whole itinerary and we quote one price for the trip instead of adding up the legs. It usually works out cheaper.',
        },
        { q: 'Are ferry fares included?', a: 'If your itinerary involves a ferry, we set it out in the quote we send you before the trip.' },
      ],
    },
  },
];

export const routeBySlug = Object.fromEntries(routes.map((r) => [r.slug, r]));
