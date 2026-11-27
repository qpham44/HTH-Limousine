import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { rateRows } from '@/data/rates';
import { routes } from '@/data/routes';
import { services } from '@/data/services';
import { site } from '@/lib/site';
import { localised, paths, t, type Locale } from '@/lib/i18n';
import { alternates } from '@/lib/routeMap';
import { pageOpenGraph } from '@/lib/seo';
import BookingModule from '@/components/booking/BookingModule';
import GoogleMapEmbed from '@/components/site/GoogleMapEmbed';
import InView from '@/components/site/InView';
import JsonLd, { breadcrumbLd, faqLd } from '@/components/site/JsonLd';
import {
  Breadcrumbs,
  Checklist,
  CtaBand,
  FaqList,
  LinkList,
  PageHero,
  Steps,
  pageStyles,
} from '@/components/site/PageParts';
import RateTable from '@/components/rates/RateTable';
import serviceStyles from '@/app/(vi)/dich-vu/services.module.css';
import clientStyles from '@/app/(vi)/khach-hang/clients.module.css';
import aboutStyles from '@/app/(vi)/ve-chung-toi/about.module.css';
import contactStyles from '@/app/(vi)/lien-he/contact.module.css';
import bookingStyles from '@/app/(vi)/dat-xe/booking.module.css';

const C = {
  vi: {
    servicesTitle: 'Dịch vụ thuê xe có tài xế tại TP.HCM',
    servicesDescription:
      'Năm nhóm dịch vụ của HTH Limousine tại TP.HCM: đưa đón sân bay Tân Sơn Nhất, thuê xe theo giờ, theo ngày, hợp đồng đưa đón doanh nghiệp và tour đi tỉnh.',
    servicesH1: 'Năm nhóm dịch vụ, một chuẩn mực phục vụ',
    servicesLead:
      'Dù là đón một vị khách tại sân bay hay vận hành tuyến đưa đón cho cả doanh nghiệp, quy trình của HTH vẫn nhất quán: thống nhất lịch trình, chọn xe phù hợp và chốt giá trước khi khởi hành.',
    servicesCtaTitle: 'Nhu cầu nằm ngoài năm nhóm trên?',
    servicesCtaBody: 'Xe cưới, đoàn phim, lịch lưu diễn hay đón đoàn ngoại giao. Quý khách chỉ cần mô tả nhu cầu, chúng tôi sẽ sắp xếp phù hợp.',
    servicesMore: 'Xem chi tiết →',

    ratesTitle: 'Bảng giá thuê xe có tài xế tại TP.HCM',
    ratesDescription:
      'Bảng giá trọn gói thuê xe có tài xế của HTH Limousine: đưa đón sân bay, nội thành nửa ngày và trọn ngày, các tuyến đi tỉnh. Xe 4 đến 45 chỗ.',
    ratesH1: 'Giá trọn gói, chốt trước khi khởi hành',
    ratesLead:
      'Một mức giá cho cả chuyến đi, đã gồm xe, tài xế, nhiên liệu và phí cầu đường. Không có khoản phí bất ngờ nào phát sinh khi kết thúc hành trình.',
    ratesCaption: 'Đơn vị: đồng. Giá một chiều hoặc trọn gói theo thời lượng ghi ở mỗi dòng.',
    ratesNote:
      'Với tuyến hoặc lịch trình không có trong bảng, Quý khách có thể dùng công cụ tính giá ở trang chủ để xem mức tạm tính, hoặc gọi hotline để nhận báo giá chính xác.',
    includedH2: 'Giá đã bao gồm những gì',
    includedLead:
      'Nếu có khoản nào nằm ngoài danh sách này, điều phối viên sẽ thông báo trước khi Quý khách xác nhận. Đó là toàn bộ chính sách giá của chúng tôi.',
    included: [
      'Xe đúng dòng đã xác nhận',
      'Tài xế riêng',
      'Nhiên liệu trong phạm vi lịch trình',
      'Phí cầu đường và cao tốc',
      'Bảo hiểm hành khách',
      'Vệ sinh và kiểm tra xe trước mỗi chuyến',
    ],
    byRoute: 'Chi tiết từng tuyến đường',
    byRouteLead: 'Mỗi tuyến có trang riêng với quãng đường, thời gian di chuyển thực tế và những lưu ý cần biết trước chuyến đi.',
    ratesFaqH2: 'Câu hỏi về giá',
    ratesFaqLead: (phone: string) => `Nếu còn điều gì chưa rõ, Quý khách vui lòng gọi ${phone}.`,
    ratesFaq: [
      {
        q: 'Giá trong bảng đã là giá cuối cùng chưa?',
        a: 'Đây là giá trọn gói cho đúng tuyến và đúng thời lượng ghi trong bảng. Nếu lịch trình thay đổi, chẳng hạn thêm điểm ghé, kéo dài thời gian hay đổi lộ trình, điều phối viên sẽ báo lại mức giá cụ thể trước khi Quý khách xác nhận.',
      },
      {
        q: 'Tại sao BMW 5 Series không có giá cho lịch nhiều ngày?',
        a: 'Với hành trình từ hai ngày trở lên, sedan bốn chỗ hiếm khi là lựa chọn phù hợp vì hạn chế cả về không gian lẫn chỗ để hành lý. Chúng tôi báo giá riêng thay vì đưa ra một con số dễ gây hiểu nhầm.',
      },
      {
        q: 'Giá có thay đổi theo mùa không?',
        a: 'Cuối tuần cao điểm và dịp lễ có mặt bằng giá khác. Khi báo giá, điều phối viên sẽ nêu rõ mức giá cho đúng ngày Quý khách đi, không để phát sinh lúc thanh toán.',
      },
      {
        q: 'Hợp đồng xe theo tháng cho doanh nghiệp được tính thế nào?',
        a: 'Hợp đồng tháng có bảng giá riêng theo số chuyến, quãng đường và khung giờ. Quý khách gửi tuyến, chúng tôi sẽ khảo sát rồi báo giá.',
      },
    ],

    clientsTitle: 'Khách hàng của HTH Limousine',
    clientsDescription:
      'Đoàn nghệ sĩ quốc tế, phòng thương mại, doanh nghiệp sản xuất và hãng lữ hành đã tin chọn HTH: DJ Hardwell, Hà Anh Vũ, AmCham, Uber, Unilever, Logitem, Asian Trails.',
    clientsH1: 'Khách hàng tiêu biểu của HTH',
    clientsLead:
      'Đoàn nghệ sĩ, phòng thương mại, doanh nghiệp sản xuất và các hãng lữ hành quốc tế. Phần lớn quay lại vì một lý do chung: lịch trình luôn được thực hiện đúng như đã hẹn.',
    notable: [
      {
        name: 'DJ Hardwell',
        what: 'Đưa đón nghệ sĩ trong đêm diễn tại TP.HCM',
        detail:
          'Lịch trình của một đêm diễn khác hẳn một chuyến đi thông thường: giờ ra sân bay, giờ sound check, giờ lên sân khấu và giờ rời đi đều có thể thay đổi. Nhiệm vụ của chúng tôi là bảo đảm xe luôn có mặt đúng chỗ, dù lịch trình biến động thế nào.',
      },
      {
        name: 'Hà Anh Vũ',
        what: 'Xe riêng phục vụ siêu mẫu',
        detail: 'Xe riêng phục vụ dài ngày, một tài xế cố định và sự kín đáo tuyệt đối. Ba yếu tố này quan trọng ngang nhau.',
      },
    ],
    corporateH2: 'Hợp đồng và tuyến cố định',
    corporateLead:
      'Đưa đón nhân viên, tuyến nhà máy, đón đoàn và xe phục vụ khách của doanh nghiệp. Mảng công việc này ít người thấy nhưng chiếm phần lớn lịch chạy hằng tuần.',
    corporate: [
      { name: 'AmCham', what: 'Đưa đón đoàn và sự kiện' },
      { name: 'Uber', what: 'Hợp đồng đưa đón doanh nghiệp' },
      { name: 'Unilever', what: 'Tuyến đưa đón nhân viên' },
      { name: 'Logitem', what: 'Tuyến nhà máy' },
      { name: 'Asian Trails', what: 'Đoàn khách du lịch quốc tế' },
    ],
    whyEyebrow: 'Vì sao khách hàng quay lại',
    whyH2: 'Điều tạo nên khác biệt không nằm ở chiếc xe',
    why: [
      'Xe của các đơn vị trong ngành phần lớn tương đồng. Điều khác biệt nằm ở cách xử lý khi lịch trình không diễn ra như kế hoạch: chuyến bay trễ bốn tiếng, đoàn cần thêm một xe lúc chín giờ tối, hay tài xế phải chờ thêm hai tiếng ở nơi không có chỗ đỗ.',
      'HTH là đơn vị đầu tiên đưa D’Car Limousine về Việt Nam, và đó là lý do nhiều khách hàng tìm đến lần đầu. Còn lý do họ quay lại thì giản dị hơn: luôn có người nghe máy, và xe luôn có mặt đúng hẹn.',
    ],
    clientsCtaTitle: 'Đoàn của Quý khách cần bao nhiêu xe?',
    clientsCtaBody: 'Sự kiện, hội nghị, lịch lưu diễn hay đón đoàn nhiều ngày. Quý khách gửi lịch trình, phần điều phối đã có chúng tôi lo.',

    aboutTitle: 'Về HTH Limousine',
    aboutDescription:
      'HTH hoạt động tại TP.HCM từ năm 2013 và là đơn vị đầu tiên đưa D’Car Limousine về Việt Nam. Hơn 4.000 chuyến xe, đội xe từ 4 đến 47 chỗ, điều phối trực 24/7.',
    aboutH1: 'Mười ba năm bền bỉ phía sau mỗi chuyến đi',
    aboutLead: (year: number) =>
      `HTH khởi đầu tại Sài Gòn năm ${year} với vài chiếc xe và một số điện thoại. Đến nay, chúng tôi đã thực hiện hơn 4.000 chuyến xe, vận hành đội xe từ 4 đến 47 chỗ cùng bộ phận điều phối trực suốt ngày đêm.`,
    dcarH2: 'Chiếc D’Car đầu tiên ở Việt Nam là của HTH',
    dcar: [
      'Khi chưa có đơn vị nào tại Việt Nam khai thác dòng D’Car, HTH là đơn vị đầu tiên đưa dòng xe này về. Quyết định đó đã định hình con đường phát triển của công ty: khoang khách rộng, ghế ngả sâu, khoang hành lý riêng và một tiêu chuẩn phục vụ xứng tầm với chiếc xe.',
      'Hiện nay HTH khai thác D’Car trên hai nền xe Hyundai Solati và Ford Transit, bên cạnh sedan, MPV, xe 16 chỗ và xe khách 45 chỗ. Dù vậy, D’Car vẫn là dòng xe được khách hàng quan tâm nhiều nhất.',
    ],
    principlesEyebrow: 'Cách chúng tôi làm việc',
    principlesH2: 'Ba nguyên tắc không thay đổi',
    principles: [
      {
        title: 'Tài xế gắn bó lâu năm',
        body: 'Phần lớn tài xế đã gắn bó với HTH nhiều năm. Họ mặc đồng phục, thành thạo quy trình đón khách quốc tế và có thể giao tiếp tiếng Anh khi cần. Khách hàng thường xuyên hay yêu cầu đích danh tài xế quen, và chúng tôi đáp ứng được vì đội ngũ ít biến động.',
      },
      {
        title: 'Xe được kiểm tra trước mỗi chuyến',
        body: 'Bảo dưỡng theo lịch cố định, vệ sinh xe trước giờ đón. Nếu phát sinh sự cố dọc đường, điều phối viên điều xe thay thế ngay. Đó là lý do chúng tôi luôn giữ xe dự phòng thay vì khai thác hết công suất mỗi ngày.',
      },
      {
        title: 'Linh hoạt khi lịch trình thay đổi',
        body: 'Chuyến bay trễ giờ, thêm điểm dừng hay đổi lộ trình giữa chừng. Một người phụ trách theo sát hành trình từ lúc báo giá đến khi trả khách, nên Quý khách không phải trình bày lại với người thứ hai.',
      },
    ],
    processEyebrow: 'Quy trình',
    processH2: 'Một chuyến xe được thực hiện ra sao',
    process: [
      { title: 'Quý khách gửi lịch trình', body: 'Qua biểu mẫu, Zalo hoặc điện thoại: điểm đón, điểm đến, ngày giờ và số khách.' },
      { title: 'Chúng tôi báo giá', body: 'Một mức giá trọn gói cho đúng lịch trình, kèm đề xuất dòng xe nếu Quý khách chưa chọn.' },
      { title: 'Xác nhận xe', body: 'Quý khách nhận thông tin xe và tài xế trước ngày đi, không phải chờ đến sát giờ.' },
      { title: 'Khởi hành', body: 'Tài xế nắm đầy đủ lịch trình. Nếu có phát sinh dọc đường, Quý khách gọi điều phối viên, số máy luôn có người trực 24/7.' },
    ],
    seeFleet: 'Xem đội xe →',

    contactTitle: 'Liên hệ HTH Limousine',
    contactDescription:
      'Hotline 0903 760 187 trực 24/7, Zalo, WhatsApp và email sales4@hth.com.vn. Văn phòng tại tòa nhà Millennium, 132 Bến Vân Đồn, TP. Hồ Chí Minh.',
    contactH1: 'Gọi bất kể giờ nào cũng có người nghe máy',
    contactLead:
      'Điều phối viên trực suốt ngày đêm. Gọi điện là cách nhanh nhất, vì người nghe máy có thể trả lời ngay về xe, giá và lịch còn trống.',
    urgent: 'Hotline · 24/7',
    contactWhichEyebrow: 'Gọi điện hay nhắn tin',
    contactWhichH2: 'Nên chọn cách nào',
    contactWhich: [
      'Nếu cần xe trong hôm nay hoặc ngày mai, Quý khách nên gọi điện. Điều phối viên nắm ngay xe nào còn trống và báo giá ngay trong cuộc gọi.',
      'Với lịch trình dài, nhiều điểm dừng hoặc hợp đồng doanh nghiệp, Quý khách nên nhắn Zalo hoặc gửi email. Có văn bản để đối chiếu sẽ thuận tiện hơn cho cả hai bên.',
    ],
    sendRequest: 'Gửi yêu cầu và nhận báo giá →',
    officeName: 'Millennium, Bến Vân Đồn',

    bookingTitle: 'Đặt xe và nhận báo giá',
    bookingDescription:
      'Gửi điểm đón, điểm đến và giờ khởi hành để nhận báo giá trọn gói từ HTH Limousine. Xem lộ trình và giá tạm tính ngay trên trang, hoặc gọi 0903 760 187.',
    bookingH1: 'Gửi lịch trình, nhận báo giá trọn gói',
    bookingLead:
      'Nhập điểm đón và điểm đến, có thể là tên khu vực, khách sạn hay địa chỉ cụ thể, để xem quãng đường, thời gian di chuyển và giá tạm tính ngay trên trang. Giá chính thức do điều phối viên xác nhận.',
    urgentLabel: 'Cần xe gấp',
    urgentBody: 'Trực 24/7. Gọi điện nhanh hơn điền biểu mẫu, và người nghe máy biết ngay xe nào còn trống.',
    afterEyebrow: 'Sau khi gửi',
    afterH2: 'Các bước tiếp theo',
    afterLead: 'Quý khách không cần theo dõi thêm bước nào. Chúng tôi chủ động liên hệ, Quý khách chỉ việc xác nhận.',
    after: [
      'Điều phối viên gọi lại để xác nhận xe và chốt giá',
      'Quý khách nhận thông tin tài xế và biển số xe trước ngày đi',
      'Tài xế liên hệ trước giờ đón',
      'Mọi phát sinh dọc đường, Quý khách gọi thẳng điều phối viên, không qua tổng đài',
    ],
    whichServiceH2: 'Chưa rõ nên chọn gói nào?',
    whichServiceLead: 'Mỗi trang dịch vụ trình bày rõ gói đó bao gồm những gì và mức giá ra sao. Quý khách cũng có thể gửi lịch trình để chúng tôi đề xuất.',
  },

  en: {
    servicesTitle: 'Chauffeured car services in Ho Chi Minh City',
    servicesDescription:
      'The five things HTH does in Ho Chi Minh City: Tan Son Nhat airport transfers, hourly hire, daily hire, corporate shuttles and intercity trips.',
    servicesH1: 'Five services, one way of working',
    servicesLead:
      'Collecting one guest from the airport or running a shuttle for a whole company, the process is the same: fix the schedule, fix the car, fix the price before anyone sets off.',
    servicesCtaTitle: 'Something outside those five?',
    servicesCtaBody: 'Weddings, film crews, artist tours, diplomatic parties. Call and describe the situation and we will arrange it.',
    servicesMore: 'Read more →',

    ratesTitle: 'Chauffeured car rates in Ho Chi Minh City',
    ratesDescription:
      'All-in rates from HTH Limousine: airport transfers, half and full days in the city, and routes out to the provinces, for vehicles from 4 to 45 seats.',
    ratesH1: 'One price, agreed before the car sets off',
    ratesLead:
      'A single figure for the whole trip, covering the car, the chauffeur, fuel and tolls. There is no second price list waiting at the end of the journey.',
    ratesCaption: 'In Vietnamese dong. One way or all-in for the duration shown on each row.',
    ratesNote:
      'For a route or a plan that is not in the table, use the quote tool on the home page for an indicative figure, or call the hotline for an exact one.',
    includedH2: 'What sits inside the number',
    includedLead:
      'If anything falls outside it, the coordinator tells you before you confirm. That is the whole of our pricing policy.',
    included: [
      'The vehicle class you confirmed',
      'The chauffeur',
      'Fuel across the agreed itinerary',
      'Road and expressway tolls',
      'Passenger insurance',
      'Cleaning and a check before every trip',
    ],
    byRoute: 'Look at a route in detail',
    byRouteLead: 'Every route has its own page with the distance, the real drive time and what is worth knowing before you go.',
    ratesFaqH2: 'About the prices',
    ratesFaqLead: (phone: string) => `If something is still unclear, call ${phone}.`,
    ratesFaq: [
      {
        q: 'Is the table price the final price?',
        a: 'It is the all-in price for exactly the route and duration shown. If the plan changes, adding a stop, running longer, taking a different road, the coordinator gives you the revised figure before you confirm.',
      },
      {
        q: 'Why is there no multi-day price for the BMW 5 Series?',
        a: 'On trips of two days or more a four-seat sedan is rarely the right car, because both luggage and space run short. We quote those individually rather than publish a figure that misleads.',
      },
      {
        q: 'Do prices change with the season?',
        a: 'Busy weekends and public holidays sit at a different level. The coordinator gives you the figure for your actual date when quoting, rather than letting it appear at the end.',
      },
      {
        q: 'How do monthly company bookings work?',
        a: 'Monthly contracts are priced separately on the number of runs, the distance and the hours. Send the route and we survey it before quoting.',
      },
    ],

    clientsTitle: 'HTH Limousine clients',
    clientsDescription:
      'Artists, chambers of commerce, manufacturers and tour operators who travel with HTH: DJ Hardwell, Ha Anh Vu, AmCham, Uber, Unilever, Asian Trails.',
    clientsH1: 'A few of the names that have travelled with us',
    clientsLead:
      'Artist parties, chambers of commerce, manufacturers and international tour operators. Most come back for the same reason: the schedule runs as agreed.',
    notable: [
      {
        name: 'DJ Hardwell',
        what: 'Artist transport, show in Ho Chi Minh City',
        detail:
          'A show night runs on a different kind of schedule. Airport time, sound check, stage time and departure can all move. Our job is that the car is in the right place when they do.',
      },
      {
        name: 'Ha Anh Vu',
        what: 'Private car for the supermodel',
        detail: 'A private car over several days, the same chauffeur, and discretion. All three matter equally.',
      },
    ],
    corporateH2: 'Contracts and fixed routes',
    corporateLead:
      'Staff shuttles, factory routes, delegation transfers and cars for company visitors. Nobody sees this part of the work, and it fills most of the week.',
    corporate: [
      { name: 'AmCham', what: 'Delegation transfers and events' },
      { name: 'Uber', what: 'Corporate transport contract' },
      { name: 'Unilever', what: 'Staff routes' },
      { name: 'Logitem', what: 'Factory routes' },
      { name: 'Asian Trails', what: 'Inbound tour groups' },
    ],
    whyEyebrow: 'Why they come back',
    whyH2: 'Not because of the car',
    why: [
      'The cars in this industry are largely the same. What differs is what happens when the plan does not hold: a flight four hours late, a group that needs an extra vehicle at nine at night, a chauffeur waiting two extra hours at an address with nowhere to park.',
      'HTH was the first company to bring the D’Car limousine to Vietnam, and that is why many people call the first time. Why they call again is simpler: someone answers, and the car turns up.',
    ],
    clientsCtaTitle: 'How many cars does your group need?',
    clientsCtaBody: 'Events, conferences, tour schedules or multi-day delegations. Send the plan and we handle the dispatch.',

    aboutTitle: 'About HTH Limousine',
    aboutDescription:
      'HTH has run in Ho Chi Minh City since 2013 and was first to bring the D’Car limousine to Vietnam. Over 4,000 trips, 4 to 47 seats, dispatch 24/7.',
    aboutH1: 'Thirteen years, mostly work nobody sees',
    aboutLead: (year: number) =>
      `HTH started in ${year} in Saigon with a handful of cars and one phone number. Today that is over 4,000 trips, a fleet from 4 to 47 seats, and a dispatch desk staffed through the night.`,
    dcarH2: 'The first D’Car in Vietnam was ours',
    dcar: [
      'When nobody in Vietnam was running the D’Car, HTH brought the first one in. That decision shaped everything after it: a wide cabin, deep-reclining seats, a separate luggage hold, and a standard of service that had to keep up with the car.',
      'Today HTH runs two D’Car platforms, on the Hyundai Solati and the Ford Transit, alongside sedans, MPVs, a 16-seat van and 45-seat coaches. The D’Car is still what people ask for most.',
    ],
    principlesEyebrow: 'How we work',
    principlesH2: 'Three things that do not change',
    principles: [
      {
        title: 'Chauffeurs who stay',
        body: 'Most of our chauffeurs have been here for years. Uniformed, used to receiving international guests, English-speaking when a guest needs it. Regulars often ask for someone by name, and we can honour that because the drivers do not turn over.',
      },
      {
        title: 'Every car checked before it goes out',
        body: 'A fixed service schedule and a clean before each pickup. If something fails on the road, the coordinator sends a replacement immediately. That is why we hold spare vehicles instead of running every car every day.',
      },
      {
        title: 'Plans change, and that is normal',
        body: 'A delayed flight, an added stop, a different road halfway. One person owns your trip from the quote to the drop-off, so you never have to explain it twice.',
      },
    ],
    processEyebrow: 'Process',
    processH2: 'How a trip actually runs',
    process: [
      { title: 'You send the plan', body: 'By form, Zalo or phone. Pickup, destination, date and time, how many people.' },
      { title: 'We quote', body: 'One all-in figure for that exact plan, with a vehicle suggestion if you are unsure.' },
      { title: 'The car is confirmed', body: 'You get the vehicle and chauffeur details before the day, not at the last minute.' },
      { title: 'You travel', body: 'The chauffeur has the full plan. Anything that comes up on the road goes to the coordinator, on a number staffed 24/7.' },
    ],
    seeFleet: 'See the fleet →',

    contactTitle: 'Contact HTH Limousine',
    contactDescription:
      'Hotline 0903 760 187 staffed 24/7, plus Zalo, WhatsApp and sales4@hth.com.vn. Office at Millennium tower, 132 Ben Van Don, Ho Chi Minh City.',
    contactH1: 'Someone answers, whatever the hour',
    contactLead:
      'A coordinator is on duty through the night. If you can call, call: it is faster than the form, and whoever answers can tell you about cars, prices and availability on the spot.',
    urgent: 'Hotline · 24/7',
    contactWhichEyebrow: 'Call or message',
    contactWhichH2: 'Which is quicker',
    contactWhich: [
      'If you need a car today or tomorrow, call. The coordinator knows immediately what is free and can quote on that call.',
      'For a long itinerary, several stops or a company contract, use Zalo or email. Having it in writing is easier for both sides.',
    ],
    sendRequest: 'Send a request and get a quote →',
    officeName: 'Millennium, Ben Van Don',

    bookingTitle: 'Book a car and get a quote',
    bookingDescription:
      'Send a pickup, a destination and a time for an all-in quote. See the route and an indicative price on the page, or call 0903 760 187.',
    bookingH1: 'Send the plan, get a price',
    bookingLead:
      'Type a pickup and a destination, an area, a hotel or a street address, to see the distance, the drive time and an indicative price right on the page. A coordinator confirms the final figure.',
    urgentLabel: 'Need a car now',
    urgentBody: 'On duty 24/7. Calling is quicker than the form, and whoever answers knows what is free.',
    afterEyebrow: 'After you send it',
    afterH2: 'What happens next',
    afterLead: 'There is no step you have to chase. We make contact, you confirm.',
    after: [
      'A coordinator calls to confirm the car and fix the price',
      'You get the chauffeur details and plate number before the day',
      'The chauffeur messages before pickup',
      'Anything on the road goes straight to the coordinator, not to a call centre',
    ],
    whichServiceH2: 'Not sure which service you need',
    whichServiceLead: 'Each service page sets out what it covers and what it costs. Or just send the plan and we will suggest one.',
  },
} as const;

/* Services index ------------------------------------------------------------ */

export function servicesIndexMetadata(locale: Locale): Metadata {
  return {
    title: C[locale].servicesTitle,
    description: C[locale].servicesDescription,
    alternates: { canonical: paths.services(locale), languages: alternates('/dich-vu') },
    openGraph: pageOpenGraph({
      locale,
      title: C[locale].servicesTitle,
      description: C[locale].servicesDescription,
      path: paths.services(locale),
    }),
  };
}

export function ServicesIndexPage({ locale = 'vi' }: { locale?: Locale }) {
  const copy = t(locale);
  const c = C[locale];
  const trail = [{ name: copy.nav.services, href: paths.services(locale) }];

  return (
    <>
      <JsonLd data={breadcrumbLd(trail)} />
      <Breadcrumbs trail={trail} locale={locale} />

      <PageHero
        eyebrow={copy.eyebrow.services}
        title={c.servicesH1}
        lead={c.servicesLead}
        image="/img/transit-dcar.webp"
        imageAlt="Ford Transit D’Car Limousine của HTH mở cửa trượt, lộ ghế da khoang khách"
        locale={locale}
      />

      <section className="section--tight">
        <div className="wrap">
          <div className={serviceStyles.list}>
            {services.map((base) => {
              const service = localised(base, locale);
              return (
                <article key={base.slug} className={`${serviceStyles.item} reveal`}>
                  <Link href={paths.service(locale, service.slug)} className={serviceStyles.media}>
                    <Image
                      src={base.image}
                      alt={base.imageAlt}
                      width={1200}
                      height={900}
                      sizes="(max-width: 760px) 100vw, 33vw"
                    />
                  </Link>
                  <div className="stack stack-10">
                    <h2 className={serviceStyles.name}>
                      <Link href={paths.service(locale, service.slug)}>{service.h1}</Link>
                    </h2>
                    <p className={serviceStyles.lead}>{service.lead}</p>
                  </div>
                  <Link href={paths.service(locale, service.slug)} className="tlink">
                    {c.servicesMore}
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <CtaBand title={c.servicesCtaTitle} body={c.servicesCtaBody} locale={locale} />
        </div>
      </section>
    </>
  );
}

/* Rates --------------------------------------------------------------------- */

export function ratesMetadata(locale: Locale): Metadata {
  return {
    title: C[locale].ratesTitle,
    description: C[locale].ratesDescription,
    alternates: { canonical: paths.rates(locale), languages: alternates('/bang-gia') },
    openGraph: pageOpenGraph({
      locale,
      title: C[locale].ratesTitle,
      description: C[locale].ratesDescription,
      path: paths.rates(locale),
    }),
  };
}

export function RatesPage({ locale = 'vi' }: { locale?: Locale }) {
  const copy = t(locale);
  const c = C[locale];
  const trail = [{ name: copy.nav.rates, href: paths.rates(locale) }];

  return (
    <>
      <JsonLd data={breadcrumbLd(trail)} />
      <JsonLd data={faqLd([...c.ratesFaq])} />
      <Breadcrumbs trail={trail} locale={locale} />

      <PageHero
        eyebrow={copy.eyebrow.rates}
        title={c.ratesH1}
        lead={c.ratesLead}
        image="/img/bmw.webp"
        imageAlt="BMW 5 Series của HTH Limousine đỗ trước sảnh khách sạn buổi tối"
        locale={locale}
      />

      <section className="section--tight">
        <div className="wrap">
          <RateTable rows={rateRows} caption={c.ratesCaption} note={c.ratesNote} locale={locale} />
        </div>
      </section>

      <section className="section section--alt section--rule-top">
        <div className="wrap">
          <div className={pageStyles.split}>
            <div className="stack stack-20">
              <div className="eyebrow">{copy.eyebrow.included}</div>
              <h2>{c.includedH2}</h2>
              <p className="u-lead">{c.includedLead}</p>
            </div>
            <Checklist items={[...c.included]} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="head">
            <div className="head-title">
              <div className="eyebrow">{copy.eyebrow.routes}</div>
              <h2>{c.byRoute}</h2>
            </div>
            <p className="u-lead">{c.byRouteLead}</p>
          </div>
          <LinkList
            items={routes.map((base) => {
              const route = localised(base, locale);
              return { href: paths.route(locale, route.slug), label: `${route.h1} · ${base.km} km` };
            })}
          />
        </div>
      </section>

      <section className="section section--alt section--rule-top">
        <div className="wrap">
          <div className={pageStyles.split}>
            <div className="stack stack-20">
              <div className="eyebrow">{copy.eyebrow.faq}</div>
              <h2>{c.ratesFaqH2}</h2>
              <p className="u-lead">{c.ratesFaqLead(site.phone.display)}</p>
            </div>
            <FaqList faq={[...c.ratesFaq]} />
          </div>
        </div>
      </section>

      <section className="section--tight">
        <div className="wrap">
          <CtaBand locale={locale} />
        </div>
      </section>
    </>
  );
}

/* Clients ------------------------------------------------------------------- */

export function clientsMetadata(locale: Locale): Metadata {
  return {
    title: C[locale].clientsTitle,
    description: C[locale].clientsDescription,
    alternates: { canonical: paths.clients(locale), languages: alternates('/khach-hang') },
    openGraph: pageOpenGraph({
      locale,
      title: C[locale].clientsTitle,
      description: C[locale].clientsDescription,
      path: paths.clients(locale),
    }),
  };
}

export function ClientsPage({ locale = 'vi' }: { locale?: Locale }) {
  const copy = t(locale);
  const c = C[locale];
  const trail = [{ name: copy.eyebrow.clients, href: paths.clients(locale) }];

  return (
    <>
      <JsonLd data={breadcrumbLd(trail)} />
      <Breadcrumbs trail={trail} locale={locale} />

      <PageHero
        eyebrow={copy.eyebrow.clients}
        title={c.clientsH1}
        lead={c.clientsLead}
        image="/img/dcar-showroom.webp"
        imageAlt="Hai xe D’Car Limousine của HTH trong xưởng"
        locale={locale}
      />

      <section className="section--tight">
        <div className="wrap">
          <div className={clientStyles.notable}>
            {c.notable.map((client) => (
              <article key={client.name} className={clientStyles.notableItem}>
                <div className="stack stack-10">
                  <span className="label">{client.what}</span>
                  <h2 className={clientStyles.notableName}>{client.name}</h2>
                </div>
                <p className={clientStyles.notableDetail}>{client.detail}</p>
                {/* Photography pending from HTH; permission is already confirmed. */}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt section--rule-top">
        <div className="wrap">
          <div className="head">
            <div className="head-title">
              <div className="eyebrow">{copy.nav.services}</div>
              <h2>{c.corporateH2}</h2>
            </div>
            <p className="u-lead">{c.corporateLead}</p>
          </div>

          <div className={clientStyles.list}>
            {c.corporate.map((client) => (
              <div key={client.name} className={clientStyles.listItem}>
                <span className={clientStyles.listName}>{client.name}</span>
                <span className={clientStyles.listWhat}>{client.what}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className={pageStyles.split}>
            <div className="stack stack-20">
              <div className="eyebrow">{c.whyEyebrow}</div>
              <h2>{c.whyH2}</h2>
            </div>
            <div className="stack stack-20">
              {c.why.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="u-lead">{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section--tight">
        <div className="wrap">
          <CtaBand title={c.clientsCtaTitle} body={c.clientsCtaBody} locale={locale} />
        </div>
      </section>
    </>
  );
}

/* About --------------------------------------------------------------------- */

export function aboutMetadata(locale: Locale): Metadata {
  return {
    title: C[locale].aboutTitle,
    description: C[locale].aboutDescription,
    alternates: { canonical: paths.about(locale), languages: alternates('/ve-chung-toi') },
    openGraph: pageOpenGraph({
      locale,
      title: C[locale].aboutTitle,
      description: C[locale].aboutDescription,
      path: paths.about(locale),
    }),
  };
}

export function AboutPage({ locale = 'vi' }: { locale?: Locale }) {
  const copy = t(locale);
  const c = C[locale];
  const trail = [{ name: copy.nav.about, href: paths.about(locale) }];

  return (
    <>
      <JsonLd data={breadcrumbLd(trail)} />
      <Breadcrumbs trail={trail} locale={locale} />

      <PageHero
        eyebrow={copy.eyebrow.about}
        title={c.aboutH1}
        lead={c.aboutLead(site.foundedYear)}
        image="/img/universe-fleet.webp"
        imageAlt="Đội xe khách Hyundai Universe của HTH xếp hàng chờ đón đoàn trước nhà ga"
        locale={locale}
      />

      <section className="section--tight">
        <div className="wrap">
          <div className={pageStyles.split}>
            <div className="stack stack-20">
              <div className="eyebrow">D’Car Limousine</div>
              <h2>{c.dcarH2}</h2>
            </div>
            <div className="stack stack-20">
              {c.dcar.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="u-lead">{paragraph}</p>
              ))}
              <div>
                <Link href={paths.fleet(locale)} className="tlink">{c.seeFleet}</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt section--rule-top">
        <div className="wrap">
          <div className="head">
            <div className="head-title">
              <div className="eyebrow">{c.principlesEyebrow}</div>
              <h2>{c.principlesH2}</h2>
            </div>
          </div>
          <div className={aboutStyles.principles}>
            {c.principles.map((point) => (
              <article key={point.title} className={aboutStyles.principle}>
                <h3 className={aboutStyles.principleTitle}>{point.title}</h3>
                <p>{point.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className={aboutStyles.media}>
            <figure className={aboutStyles.mediaWide}>
              <Image
                src="/img/solati-luggage.webp"
                alt="Khoang hành lý phía sau xe Solati D’Car xếp năm vali nhôm và hai túi xách"
                width={1760}
                height={894}
                sizes="(max-width: 820px) 100vw, 62vw"
              />
            </figure>
            <figure className={aboutStyles.mediaTall}>
              <Image
                src="/img/solati-cabin-portrait.webp"
                alt="Khoang khách D’Car với ghế da nâu và bó hoa đặt sẵn trên ghế trước chuyến đón khách"
                width={1122}
                height={1402}
                sizes="(max-width: 820px) 100vw, 34vw"
              />
            </figure>
          </div>
        </div>
      </section>

      <section className="section section--alt section--rule-top">
        <div className="wrap">
          <div className="head">
            <div className="head-title">
              <div className="eyebrow">{c.processEyebrow}</div>
              <h2>{c.processH2}</h2>
            </div>
          </div>
          <Steps steps={[...c.process]} />
        </div>
      </section>

      <section className="section--tight">
        <div className="wrap">
          <CtaBand locale={locale} />
        </div>
      </section>
    </>
  );
}

/* Contact ------------------------------------------------------------------- */

export function contactMetadata(locale: Locale): Metadata {
  return {
    title: C[locale].contactTitle,
    description: C[locale].contactDescription,
    alternates: { canonical: paths.contact(locale), languages: alternates('/lien-he') },
    openGraph: pageOpenGraph({
      locale,
      title: C[locale].contactTitle,
      description: C[locale].contactDescription,
      path: paths.contact(locale),
    }),
  };
}

export function ContactPage({ locale = 'vi' }: { locale?: Locale }) {
  const copy = t(locale);
  const c = C[locale];
  const trail = [{ name: copy.nav.contact, href: paths.contact(locale) }];

  return (
    <>
      <JsonLd data={breadcrumbLd(trail)} />
      <Breadcrumbs trail={trail} locale={locale} />

      <section className="section--tight">
        <div className="wrap">
          <div className={contactStyles.top}>
            <div className="stack stack-20">
              <div className="eyebrow">{copy.eyebrow.contact}</div>
              <h1>{c.contactH1}</h1>
              <p className="u-lead" style={{ maxWidth: '34rem' }}>{c.contactLead}</p>
            </div>

            <div className={contactStyles.callCard}>
              <span className="label">{c.urgent}</span>
              <a href={`tel:${site.phone.tel}`} className={contactStyles.phone}>{site.phone.display}</a>
              <div className={contactStyles.callActions}>
                <a href={site.phone.zalo} target="_blank" rel="noopener" className="btn btn--gold">
                  {copy.chatZalo}
                </a>
                <a href={site.phone.whatsapp} target="_blank" rel="noopener" className="btn btn--outline">
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section--tight">
        <div className="wrap">
          <div className={contactStyles.grid}>
            <div className={contactStyles.details}>
              <div className={contactStyles.detail}>
                <span className={contactStyles.detailKey}>{copy.contactLabels.email}</span>
                <a href={`mailto:${site.email}`} className={contactStyles.detailValue}>{site.email}</a>
              </div>
              <div className={contactStyles.detail}>
                <span className={contactStyles.detailKey}>{copy.contactLabels.office}</span>
                <p className={contactStyles.detailValue}>
                  {site.address.line}
                  <br />
                  {site.address.ward}, {site.address.city}
                </p>
              </div>
              <div className={contactStyles.detail}>
                <span className={contactStyles.detailKey}>{copy.contactLabels.company}</span>
                <p className={contactStyles.detailValue}>{site.legalName}</p>
              </div>
              <div className={contactStyles.detail}>
                <span className={contactStyles.detailKey}>{copy.contactLabels.messaging}</span>
                <div className={contactStyles.channels}>
                  <a className={contactStyles.channel} href={site.phone.zalo} target="_blank" rel="noopener">Zalo</a>
                  <a className={contactStyles.channel} href={site.phone.whatsapp} target="_blank" rel="noopener">WhatsApp</a>
                  <a className={contactStyles.channel} href={site.phone.messenger} target="_blank" rel="noopener">Messenger</a>
                </div>
              </div>
              <div className={contactStyles.detail}>
                <span className={contactStyles.detailKey}>{copy.contactLabels.booking}</span>
                <p className={contactStyles.detailValue}>
                  <Link href={paths.booking(locale)} className="tlink">{c.sendRequest}</Link>
                </p>
              </div>
            </div>

            <div className={contactStyles.officeCard}>
              <div className={contactStyles.officeMap}>
                <InView>
                  <GoogleMapEmbed locale={locale} title={copy.contactLabels.headOffice} />
                </InView>
              </div>
              <div className={contactStyles.officeFoot}>
                <div>
                  <div className="label" style={{ marginBottom: 7 }}>{copy.contactLabels.headOffice}</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 600, lineHeight: 1.4 }}>{c.officeName}</div>
                </div>
                <a href={site.address.mapsUrl} target="_blank" rel="noopener" className="tlink">
                  {copy.contactLabels.openMap}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className={pageStyles.split}>
            <div className="stack stack-20">
              <div className="eyebrow">{c.contactWhichEyebrow}</div>
              <h2>{c.contactWhichH2}</h2>
            </div>
            <div className="stack stack-20">
              {c.contactWhich.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="u-lead">{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

/* Booking ------------------------------------------------------------------- */

export function bookingMetadata(locale: Locale): Metadata {
  return {
    title: C[locale].bookingTitle,
    description: C[locale].bookingDescription,
    alternates: { canonical: paths.booking(locale), languages: alternates('/dat-xe') },
    openGraph: pageOpenGraph({
      locale,
      title: C[locale].bookingTitle,
      description: C[locale].bookingDescription,
      path: paths.booking(locale),
    }),
  };
}

export function BookingPage({ locale = 'vi' }: { locale?: Locale }) {
  const copy = t(locale);
  const c = C[locale];
  const trail = [{ name: copy.eyebrow.booking, href: paths.booking(locale) }];

  return (
    <>
      <JsonLd data={breadcrumbLd(trail)} />
      <Breadcrumbs trail={trail} locale={locale} />

      <section className="section--tight">
        <div className="wrap">
          <div className={bookingStyles.intro}>
            <div className="stack stack-20">
              <div className="eyebrow">{copy.eyebrow.booking}</div>
              <h1>{c.bookingH1}</h1>
              <p className="u-lead" style={{ maxWidth: '36rem' }}>{c.bookingLead}</p>
            </div>
            <div className={bookingStyles.callout}>
              <span className="label">{c.urgentLabel}</span>
              <a href={`tel:${site.phone.tel}`} className={bookingStyles.phone}>{site.phone.display}</a>
              <p>{c.urgentBody}</p>
              <div className={bookingStyles.calloutActions}>
                <a href={site.phone.zalo} target="_blank" rel="noopener" className="btn btn--outline">
                  {copy.chatZalo}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section--tight" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <BookingModule locale={locale} />
        </div>
      </section>

      <section className="section section--alt section--rule-top">
        <div className="wrap">
          <div className={pageStyles.split}>
            <div className="stack stack-20">
              <div className="eyebrow">{c.afterEyebrow}</div>
              <h2>{c.afterH2}</h2>
              <p className="u-lead">{c.afterLead}</p>
            </div>
            <Checklist items={[...c.after]} />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="head">
            <div className="head-title">
              <div className="eyebrow">{copy.nav.services}</div>
              <h2>{c.whichServiceH2}</h2>
            </div>
            <p className="u-lead">{c.whichServiceLead}</p>
          </div>
          <LinkList
            items={services.map((base) => {
              const service = localised(base, locale);
              return { href: paths.service(locale, service.slug), label: service.h1 };
            })}
          />
        </div>
      </section>
    </>
  );
}
