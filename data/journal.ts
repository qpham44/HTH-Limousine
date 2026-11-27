/**
 * Guides. Each one answers a question customers actually ask on the phone,
 * and every number in them comes from the fleet data or the measured route
 * table — nothing here is invented, and no article claims a statistic HTH
 * has not confirmed.
 */

export interface Section {
  heading?: string;
  paragraphs?: string[];
  list?: string[];
}

export interface ArticleCopy {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  category: string;
  lead: string;
  sections: Section[];
}

export interface Article {
  slug: string;
  title: string;
  metaTitle: string;
  description: string;
  category: string;
  /** Plain reading time, rounded to the nearest minute. */
  minutes: number;
  lead: string;
  image: string;
  imageAlt: string;
  sections: Section[];
  related: string[];
  /** Written for an English reader, not translated. */
  en: ArticleCopy;
}

export const articles: Article[] = [
  {
    slug: 'doan-16-khach-nen-di-xe-gi',
    title: 'Đoàn 16 khách: một xe 16 chỗ hay hai xe D’Car?',
    metaTitle: 'Đoàn 16 khách nên đi xe 16 chỗ hay D’Car?',
    description:
      'So sánh xe 16 chỗ và hai xe D’Car cho đoàn 16 khách: chỗ ngồi, hành lý, chi phí và trải nghiệm trên chặng dài. Kinh nghiệm điều phối thực tế của HTH.',
    category: 'Chọn xe',
    minutes: 4,
    lead:
      'Cùng một số lượng khách nhưng có hai cách bố trí hoàn toàn khác nhau. Sự khác biệt không lộ ra lúc lên xe mà ở tiếng thứ ba trên đường.',
    image: '/img/transit16.webp',
    imageAlt: 'Ford Transit 16 chỗ của HTH Limousine đỗ bên đường',
    sections: [
      {
        paragraphs: [
          'Đây là câu hỏi chúng tôi nhận được nhiều nhất từ các đoàn công ty và nhóm bạn đi nghỉ. Trên lý thuyết, một chiếc 16 chỗ chở đủ 16 người với chi phí thấp hơn hẳn. Trên thực tế, câu trả lời phụ thuộc vào độ dài chặng đường và lượng hành lý mỗi người mang theo.',
        ],
      },
      {
        heading: 'Một xe 16 chỗ',
        paragraphs: [
          'Ford Transit 16 chỗ đủ ghế cho 16 người, khoang sau chứa khoảng mười vali cỡ vừa. Nếu đoàn đi trong ngày, hành lý gọn nhẹ và chặng đường dưới hai tiếng, đây là phương án hợp lý nhất: một xe, một tài xế, một điểm hẹn.',
          'Vấn đề phát sinh khi mỗi người mang một vali lớn. Mười sáu vali lớn không thể xếp vừa khoang sau, và chất vali lên hàng ghế trống sẽ nhanh chóng biến một chuyến đi thoải mái thành ba tiếng ngồi chật chội.',
        ],
      },
      {
        heading: 'Hai xe D’Car',
        paragraphs: [
          'Hai chiếc D’Car, dù là Solati hay Transit, cho tổng cộng 18 đến 24 chỗ, nghĩa là đoàn 16 người ngồi rộng rãi mà vẫn còn ghế trống. Mỗi xe có khoang hành lý riêng, cộng lại dư sức chứa 16 vali lớn.',
          'Đổi lại là hai tài xế, hai xe và chi phí cao hơn. Với chặng ngắn, khoản chênh lệch này khó xứng đáng. Nhưng với chặng Đà Lạt bảy tiếng hay Phan Thiết bốn tiếng, ghế ngả sâu và trần cao là điều khách nhớ nhất khi xuống xe.',
        ],
      },
      {
        heading: 'Cách chúng tôi tư vấn',
        list: [
          'Chặng dưới hai tiếng, hành lý gọn nhẹ: một xe 16 chỗ.',
          'Chặng dưới hai tiếng, mỗi người một vali lớn: một xe 16 chỗ và một xe nhỏ chở hành lý, hoặc hai xe D’Car.',
          'Chặng trên bốn tiếng: hầu như luôn là hai xe D’Car.',
          'Đoàn có khách VIP cần ngồi riêng: bố trí hai xe, trong đó một chiếc D’Car dành cho nhóm nhỏ.',
        ],
      },
      {
        paragraphs: [
          'Khi liên hệ đặt xe, Quý khách vui lòng cho biết cùng lúc số khách và số vali. Số vali mới là yếu tố quyết định, và cũng là con số khách hàng hay quên nhất.',
        ],
      },
    ],
    related: ['chon-xe-theo-so-vali', 'tan-son-nhat-ve-trung-tam-mat-bao-lau'],
    en: {
      slug: 'one-van-or-two-limousines-for-sixteen',
      title: 'Sixteen guests: one 16-seat van, or two D’Cars?',
      metaTitle: 'Sixteen guests: a 16-seat van or two D’Cars?',
      description:
        'Comparing a 16-seat van with two D’Car limousines for a group of sixteen: seats, luggage, cost and what a long drive actually feels like.',
      category: 'Choosing a car',
      lead: 'Same number of people, two completely different arrangements. The difference shows up in the third hour, not at the kerb.',
      sections: [
        {
          paragraphs: [
            'This is the question we field most often from company groups and from friends travelling together. On paper a 16-seat van holds sixteen people and costs noticeably less. In practice the answer depends on how long the drive is and how much everyone is carrying.',
          ],
        },
        {
          heading: 'One 16-seat van',
          paragraphs: [
            'The Ford Transit seats sixteen and the rear hold takes roughly ten medium cases. For a day trip with light luggage and under two hours on the road, this is the sensible answer: one car, one driver, one meeting point.',
            'It starts to fail when everyone has a large case. Sixteen large cases do not fit in the hold, and stacking them on spare seats is the quickest way to turn a comfortable trip into three cramped hours.',
          ],
        },
        {
          heading: 'Two D’Cars',
          paragraphs: [
            'Two D’Cars, either the Solati or the Transit conversion, give you between 18 and 24 seats, so sixteen people travel with room to spare. Each car has its own luggage hold, which between them handles sixteen large cases comfortably.',
            'The trade is two drivers, two cars and a higher price. On a short run that is hard to justify. On the seven hours to Da Lat, or four to Phan Thiet, the reclining seats and the headroom are what people remember when they get out.',
          ],
        },
        {
          heading: 'How we advise it',
          list: [
            'Under two hours with light luggage: one 16-seat van.',
            'Under two hours with a large case each: a 16-seat van plus a small car for the bags, or two D’Cars.',
            'Over four hours: two D’Cars, almost every time.',
            'A senior guest who needs to travel separately: two cars, with a D’Car for the smaller party.',
          ],
        },
        {
          paragraphs: [
            'When you call, give us the number of people and the number of cases in the same breath. The luggage is the number that decides it, and it is the one people forget.',
          ],
        },
      ],
    },
  },

  {
    slug: 'tan-son-nhat-ve-trung-tam-mat-bao-lau',
    title: 'Từ Tân Sơn Nhất về trung tâm thực sự mất bao lâu?',
    metaTitle: 'Tân Sơn Nhất về trung tâm mất bao lâu?',
    description:
      'Quãng đường và thời gian di chuyển thực tế từ sân bay Tân Sơn Nhất về Quận 1, Quận 2, Quận 7, Bình Thạnh và Thủ Đức, kèm các khung giờ nên tránh.',
    category: 'Sân bay',
    minutes: 3,
    lead:
      'Từ sân bay về Quận 1 chỉ tám cây số. Con số ấy chính xác nhưng ít giá trị, bởi điều thực sự quyết định là Quý khách hạ cánh lúc mấy giờ.',
    image: '/img/solati-cabin-airport.webp',
    imageAlt: 'Khoang khách Solati D’Car nhìn ra sân đỗ máy bay lúc hoàng hôn',
    sections: [
      {
        paragraphs: [
          'Dưới đây là quãng đường và thời gian di chuyển chúng tôi dùng để xếp lịch, được đo từ chính các chuyến xe đã chạy thay vì lấy từ bản đồ. Tất cả đều tính ngoài giờ cao điểm.',
        ],
      },
      {
        heading: 'Từ Tân Sơn Nhất đến',
        list: [
          'Quận 1: 8 km, khoảng 25 phút',
          'Bình Thạnh, khu Landmark 81: 10 km, khoảng 28 phút',
          'Thảo Điền, Quận 2: 12 km, khoảng 30 phút',
          'Quận 7, Phú Mỹ Hưng: 14 km, khoảng 35 phút',
          'Thủ Đức: 18 km, khoảng 42 phút',
        ],
      },
      {
        heading: 'Khung giờ khiến mọi con số thay đổi',
        paragraphs: [
          'Buổi chiều, khoảng từ 16 đến 19 giờ, đường Trường Sơn ra khỏi sân bay và các trục đường về trung tâm đều đông xe. Cùng chặng 8 km ấy có thể mất gần gấp đôi thời gian.',
          'Ngược lại, vào sáng sớm và sau 21 giờ, đường thông thoáng và thời gian thực tế thường còn nhanh hơn các con số trên.',
        ],
      },
      {
        heading: 'Nếu Quý khách có cuộc họp lúc 9 giờ sáng',
        paragraphs: [
          'Hạ cánh trước 7 giờ thì hoàn toàn kịp. Hạ cánh trong khoảng 7 đến 8 giờ vẫn kịp nhưng không còn thời gian dự phòng. Nếu hạ cánh sau 8 giờ, chúng tôi sẽ thẳng thắn khuyên Quý khách dời lịch họp.',
          'Đó cũng là lý do chúng tôi hỏi số hiệu chuyến bay thay vì giờ đón. Tài xế canh theo giờ hạ cánh thực tế, nên khi chuyến bay trễ, lịch đón tự điều chỉnh theo mà Quý khách không cần gọi báo.',
        ],
      },
    ],
    related: ['chon-xe-theo-so-vali', 'doan-16-khach-nen-di-xe-gi'],
    en: {
      slug: 'how-long-from-tan-son-nhat-to-the-centre',
      title: 'How long from Tan Son Nhat to the centre, honestly',
      metaTitle: 'How long from Tan Son Nhat to the centre?',
      description:
        'Real distances and drive times from Tan Son Nhat airport to District 1, District 2, District 7, Binh Thanh and Thu Duc, and the hours to avoid.',
      category: 'Airport',
      lead: 'Eight kilometres from the airport to District 1. That figure is accurate and almost useless, because what decides the trip is what time you land.',
      sections: [
        {
          paragraphs: [
            'These are the distances and times we schedule against, taken from trips we have actually driven rather than from a map. All of them assume you are outside the peak.',
          ],
        },
        {
          heading: 'From Tan Son Nhat to',
          list: [
            'District 1: 8 km, about 25 minutes',
            'Binh Thanh, around Landmark 81: 10 km, about 28 minutes',
            'Thao Dien, District 2: 12 km, about 30 minutes',
            'District 7, Phu My Hung: 14 km, about 35 minutes',
            'Thu Duc: 18 km, about 42 minutes',
          ],
        },
        {
          heading: 'The hours that ruin the arithmetic',
          paragraphs: [
            'Between roughly four and seven in the afternoon, Truong Son out of the airport and every route into the centre is busy. That same eight kilometres can take close to twice as long.',
            'Early morning and after nine at night are the opposite. The road is clear and the figures above have room in them.',
          ],
        },
        {
          heading: 'If you have a nine o’clock meeting',
          paragraphs: [
            'Landing before seven gives you room. Landing between seven and eight still works, but leaves nothing spare if anything goes wrong. Landing after eight, we will tell you plainly to move the meeting.',
            'This is also why we ask for the flight number rather than a pickup time. The chauffeur works from the actual landing time, so when the plane is late the schedule moves on its own and you do not have to call.',
          ],
        },
      ],
    },
  },

  {
    slug: 'chon-xe-theo-so-vali',
    title: 'Chọn xe theo số vali, không phải theo số ghế',
    metaTitle: 'Chọn xe theo số vali, không phải số ghế',
    description:
      'Sức chứa hành lý thực tế của từng dòng xe HTH: BMW 5 Series, Kia Carnival, D’Car Transit, D’Car Solati, Transit 16 chỗ và Universe 45 chỗ.',
    category: 'Chọn xe',
    minutes: 3,
    lead:
      'Hầu hết các trường hợp phải đổi xe vào phút chót đều có chung một nguyên nhân: đủ ghế nhưng thiếu chỗ để hành lý.',
    image: '/img/solati-luggage.webp',
    imageAlt: 'Khoang hành lý phía sau Solati D’Car xếp năm vali nhôm và hai túi xách',
    sections: [
      {
        paragraphs: [
          'Khi đặt xe, hầu hết khách hàng chỉ báo số người, rất ít người nhắc đến số vali. Thế nhưng bốn khách đi công tác ba ngày và bốn khách ra sân bay với hành lý ký gửi là hai bài toán khác nhau, dù cùng cần bốn ghế.',
        ],
      },
      {
        heading: 'Sức chứa thực tế',
        list: [
          'BMW 5 Series: 3 khách, 2 vali lớn',
          'Kia Carnival: 6 khách, 4 vali lớn',
          'Ford Transit D’Car: 9 đến 11 khách, cốp sâu, vừa bốn bộ gậy golf',
          'Hyundai Solati D’Car: 9 đến 12 khách, khoang hành lý riêng, 5 vali lớn và túi xách',
          'Ford Transit 16 chỗ: 16 khách, khoảng 10 vali cỡ vừa',
          'Hyundai Universe 45 chỗ: 45 đến 47 khách, khoang hành lý dưới sàn',
        ],
      },
      {
        heading: 'Một số trường hợp thường gặp',
        paragraphs: [
          'Bốn người ra sân bay với bốn vali lớn: Carnival vừa đủ, sedan thì không. Đây là nhầm lẫn phổ biến nhất.',
          'Đoàn chơi golf: túi gậy cần chiều sâu hơn là diện tích. Cốp sau Transit D’Car xếp đứng được bốn bộ mà không phải gập ghế.',
          'Đoàn đi nhiều ngày: nên cộng thêm khoảng một phần ba so với ước tính ban đầu, vì hiếm ai mang ít hành lý hơn dự tính cho một chuyến ba ngày.',
        ],
      },
      {
        paragraphs: [
          'Cách nhanh nhất để chọn đúng xe là cho biết cùng lúc số khách và số vali. Nếu các con số không phù hợp với dòng xe Quý khách định đặt, điều phối viên sẽ báo ngay, kể cả khi phương án phù hợp hơn là một chiếc xe rẻ hơn.',
        ],
      },
    ],
    related: ['doan-16-khach-nen-di-xe-gi', 'tan-son-nhat-ve-trung-tam-mat-bao-lau'],
    en: {
      slug: 'choose-a-car-by-luggage',
      title: 'Choose the car by luggage, not by seats',
      metaTitle: 'Choose the car by luggage, not by seats',
      description:
        'Real luggage capacity for every HTH vehicle: BMW 5 Series, Kia Carnival, Transit D’Car, Solati D’Car, the 16-seat Transit and the 45-seat Universe.',
      category: 'Choosing a car',
      lead: 'Nearly every last-minute change of car starts in the same place: enough seats, not enough boot.',
      sections: [
        {
          paragraphs: [
            'When people book, they tell us how many passengers. Very few mention the cases. But four people on a three-day trip and four people heading to the airport with checked baggage are two different problems, even though both need four seats.',
          ],
        },
        {
          heading: 'What actually fits',
          list: [
            'BMW 5 Series: 3 passengers, 2 large cases',
            'Kia Carnival: 6 passengers, 4 large cases',
            'Ford Transit D’Car: 9 to 11 passengers, a deep hold that takes four golf bags',
            'Hyundai Solati D’Car: 9 to 12 passengers, a separate rear hold for 5 large cases and soft bags',
            'Ford Transit 16-seat: 16 passengers, roughly 10 medium cases',
            'Hyundai Universe 45-seat: 45 to 47 passengers, under-floor luggage hold',
          ],
        },
        {
          heading: 'A few cases we see often',
          paragraphs: [
            'Four people to the airport with four large cases: the Carnival just about does it, a sedan does not. This is the most common mistake.',
            'Golf parties: bags need depth rather than floor area. The rear hold of the Transit D’Car takes four sets standing, without folding a seat.',
            'Multi-day groups: add about a third to whatever you first estimated. Nobody has ever brought less than they expected on a three-day trip.',
          ],
        },
        {
          paragraphs: [
            'The fastest way to get this right is to give the passenger count and the case count together. If the numbers do not match the car you had in mind, the coordinator will say so straight away, including when the answer is a cheaper car.',
          ],
        },
      ],
    },
  },
];

export const articleBySlug = Object.fromEntries(articles.map((a) => [a.slug, a]));
