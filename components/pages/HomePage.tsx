import Image from 'next/image';
import Link from 'next/link';
import BookingModule from '@/components/booking/BookingModule';
import GoogleMapEmbed from '@/components/site/GoogleMapEmbed';
import CountUp from '@/components/site/CountUp';
import InView from '@/components/site/InView';
import JourneyMap from '@/components/journey/JourneyMap';
import { fleet } from '@/data/fleet';
import { featuredRates, rateColumns } from '@/data/rates';
import { formatVnd } from '@/lib/quote';
import { site } from '@/lib/site';
import { paths, t, type Locale } from '@/lib/i18n';
import styles from '@/app/(vi)/home.module.css';

const C = {
  vi: {
    eyebrow: (year: number) => `TP. Hồ Chí Minh · Từ ${year}`,
    h1: 'Dịch vụ Thuê xe Limousine & Xe Du lịch từ 4–45 chỗ tại TP. Hồ Chí Minh',
    lead: 
      'Tiên phong đưa dòng xe D’Car Limousine về Việt Nam. Suốt 13 năm với hơn 6.000 hành trình, giá trị cốt lõi của HTH chưa từng thay đổi: không gian xe tinh tươm chuẩn hạng thương gia, tài xế chuyên nghiệp thông thạo mọi tuyến đường, cùng đội ngũ điều phối viên đồng hành 24/7 cho mọi phát sinh lịch trình.',
    meta: [
      { value: 13, suffix: '+', label: 'Năm kinh nghiệm' },
      { value: 6000, suffix: '+', label: 'Số hành trình' },
      { value: 40, suffix: '+*', label: 'Đội ngũ xe' },
    ],
    statsNote:
      '* Đội ngũ xe bao gồm hệ thống cộng tác viên và đối tác của HTH với quy chuẩn đào tạo chuyên nghiệp, sẵn sàng phục vụ Quý khách.',
    assurances: [
      {
        title: 'Báo giá Trọn gói & Minh bạch',
        body: 'Chi phí được thống nhất rõ ràng trước giờ khởi hành, đã bao gồm xe, tài xế, nhiên liệu và phí cầu đường — cam kết không phát sinh phụ phí ngoài thỏa thuận.',
      },
      {
        title: 'Điều phối Túc trực 24/7',
        body: 'Dù chuyến bay đổi giờ hạ cánh, phát sinh thêm điểm đón hay yêu cầu lúc nửa đêm, đội ngũ điều phối của HTH luôn sẵn sàng tiếp nhận và xử lý tức thì.',
      },
      {
        title: 'Một Đầu mối Chuyên trách Xuyên suốt',
        body: 'Từ lúc tư vấn báo giá đến khi kết thúc hành trình, Quý khách chỉ làm việc với một chuyên viên phụ trách duy nhất để mọi yêu cầu được nắm bắt trọn vẹn và liền mạch.',
      },
      {
        title: 'Đội xe Đa dạng từ 4 đến 47 Chỗ',
        body: 'Đáp ứng mọi quy mô di chuyển với đầy đủ phân khúc: Sedan, MPV, hai dòng D’Car Limousine hạng thương gia, xe 16 chỗ và xe du lịch cỡ lớn 29, 45 chỗ.',
      },
    ],
    fleetH2: 'Những dòng xe HTH chuyên cung cấp:',
    fleetH2b: 'Linh hoạt theo Số lượng Khách & Hành lý',
    fleetLead: 
      'Nếu phân vân giữa các lựa chọn, Quý khách vui lòng chọn “Nhờ HTH tư vấn” ngay trong biểu mẫu. Bộ phận điều phối của HTH sẽ dựa trên cung đường và lượng hành lý thực tế để đề xuất dòng xe phù hợp nhất.',
    dcarH2: 'HTH — Hành trình 13 Năm Kiến tạo Chuẩn mực Di chuyển Thượng lưu tại Việt Nam',
    dcarBody: [
      'Từ năm 2013, HTH tự hào ghi dấu ấn là đơn vị tiên phong đưa dòng xe D’Car Limousine đầu tiên vào khai thác vận chuyển cao cấp tại Việt Nam. Trải qua hơn 13 năm vận hành bền bỉ với hơn 6.000 hành trình an toàn trên khắp mọi cung đường, HTH không chỉ cung cấp phương tiện di chuyển, mà còn kiến tạo một không gian nghỉ ngơi và làm việc chuẩn hạng thương gia cho từng vị khách.',
      'Uy tín của HTH được bảo chứng qua sự tin tưởng của hàng loạt tập đoàn đa quốc gia, tổ chức quốc tế và nghệ sĩ hàng đầu thế giới như AmCham Vietnam, Unilever, Uber, Logitem, Asian Trails cùng những sự kiện tầm cỡ như đón tiếp DJ Hardwell tại Việt Nam. Với kỷ luật vận hành khắt khe, đội xe đời mới và đội ngũ tài xế chuyên nghiệp, HTH nhiều năm liền vinh dự nhận danh hiệu “Nhà cung cấp tiêu biểu của năm” (Supplier of the Year) do Asian Trails và các tập đoàn lữ hành danh tiếng bình chọn.',
    ],
    dcarClosing:
      'Bước sang thập kỷ thứ hai, HTH vẫn giữ trọn cam kết từ những ngày đầu tiên: sự chỉn chu trong từng chi tiết nhỏ, sự đúng giờ tuyệt đối và đồng hành tận tâm trên mọi lộ trình của Quý khách.',
    dcarEyebrow: 'Giới thiệu về HTH',
    partnersLabel: 'Đối tác và khách hàng đã đồng hành cùng HTH',
    photoAlt: 'Đội ngũ HTH nhận bàn giao xe D’Car Limousine tại showroom D’Car',
    photoCaption: 'HTH nhận bàn giao xe D’Car Limousine.',
    quote:
      'Công ty Cổ phần Đầu tư Phát triển HTH — Đối tác chiến lược đầu tiên đưa dòng xe DCar Limousine vào khai thác vận chuyển cao cấp tại Việt Nam từ năm 2013.',
    quoteSource: 'Theo ghi nhận từ VnExpress & Báo Thanh Niên',
    pressLink: 'Xe Đời Sống: DCar bàn giao lô Transit DCar cho HTH →',
    dcarLink: 'Xem hai dòng D’Car →',
    ratesH2: 'Tuyến phổ biến, giá trọn gói',
    ratesLead:
      'Giá đã gồm xe, tài xế, nhiên liệu, phí cầu đường và bảo hiểm hành khách. Với tuyến ngoài bảng hoặc lịch trình nhiều ngày, Quý khách vui lòng liên hệ để nhận báo giá riêng.',
    ratesCaption: 'Đơn vị: đồng. Sáu tuyến được hỏi nhiều nhất.',
    ratesNote:
      'Cột BMW 5 Series được tính theo mức 3.500.000₫ cho tám giờ, đã gồm tài xế. Với lịch trình từ hai ngày trở lên, sedan bốn chỗ không còn là lựa chọn phù hợp nên chúng tôi báo giá riêng.',
    ratesAll: 'Xem bảng giá đầy đủ →',
    aboutH2: 'Mười ba năm bền bỉ phía sau mỗi chuyến đi',
    aboutLead: (year: number) =>
      `HTH khởi đầu tại Sài Gòn năm ${year} với vài chiếc xe và một số điện thoại. Đến nay, chúng tôi đã thực hiện hơn 4.000 chuyến xe, vận hành đội xe từ 4 đến 47 chỗ cùng bộ phận điều phối trực suốt ngày đêm.`,
    points: [
      {
        title: 'Tài xế gắn bó lâu năm',
        body: 'Mặc đồng phục, thành thạo quy trình đón khách quốc tế và có thể giao tiếp tiếng Anh khi cần.',
      },
      {
        title: 'Xe được kiểm tra trước mỗi chuyến',
        body: 'Bảo dưỡng theo lịch cố định, vệ sinh xe trước giờ đón. Nếu phát sinh sự cố dọc đường, xe thay thế được điều đi ngay.',
      },
      {
        title: 'Linh hoạt khi lịch trình thay đổi',
        body: 'Chuyến bay trễ, thêm điểm dừng hay đổi lộ trình giữa chừng, điều phối viên đã nắm sẵn thông tin nên Quý khách không phải trình bày lại từ đầu.',
      },
    ],
    clientsH2: 'Khách hàng tiêu biểu của HTH',
    clientsLead:
      'Đoàn nghệ sĩ, phòng thương mại, doanh nghiệp sản xuất và các hãng lữ hành quốc tế. Phần lớn quay lại vì một lý do chung: lịch trình luôn được thực hiện đúng như đã hẹn.',
    clients: [
      { name: 'DJ Hardwell', what: 'Đưa đón nghệ sĩ trong đêm diễn tại TP.HCM' },
      { name: 'Hà Anh Vũ', what: 'Xe riêng phục vụ siêu mẫu' },
      { name: 'AmCham', what: 'Đưa đón đoàn và sự kiện' },
      { name: 'Uber', what: 'Hợp đồng đưa đón doanh nghiệp' },
      { name: 'Unilever · Logitem', what: 'Tuyến đưa đón nhân viên và nhà máy' },
      { name: 'Asian Trails', what: 'Đoàn khách du lịch quốc tế' },
    ],
    clientsAll: 'Xem trang khách hàng →',
    contactH2: 'Liên Hệ',
    officeName: 'Millennium, Bến Vân Đồn',
  },
  en: {
    eyebrow: (year: number) => `Ho Chi Minh City · Since ${year}`,
    h1: 'Limousine and coach hire, 4 to 45 seats, in Ho Chi Minh City',
    lead: 
      'The first to bring the D’Car limousine to Vietnam. Thirteen years and more than 6,000 trips later, what matters to HTH has not changed: a cabin kept to business-class standard, chauffeurs who know every road, and a coordinator on call 24/7 whenever the plan changes.',
    meta: [
      { value: 13, suffix: '+', label: 'Years on the road' },
      { value: 6000, suffix: '+', label: 'Trips completed' },
      { value: 40, suffix: '+*', label: 'Vehicles' },
    ],
    statsNote:
      '* Includes vehicles from HTH’s partners and affiliates, held to the same training standard.',
    assurances: [
      {
        title: 'One all-in price, agreed upfront',
        body: 'Agreed before departure and covering the car, chauffeur, fuel and tolls. Nothing is added beyond what we agreed.',
      },
      {
        title: 'Dispatch on duty 24/7',
        body: 'A flight lands at a different time, an extra pickup, a request at midnight: HTH’s dispatch desk takes it and sorts it straight away.',
      },
      {
        title: 'One coordinator, start to finish',
        body: 'From the first quote to the final drop-off you deal with one person, so nothing gets lost between handovers.',
      },
      {
        title: 'Vehicles from 4 to 47 seats',
        body: 'Sedans, MPVs, two business-class D’Car limousines, a 16-seater and 29- and 45-seat coaches.',
      },
    ],
    fleetH2: 'The vehicles HTH runs:',
    fleetH2b: 'chosen by passengers and luggage',
    fleetLead: 
      'If you are unsure, choose “Recommend one for me” in the form. Dispatch will suggest the right vehicle from your route and how much luggage is coming.',
    dcarH2: 'HTH: thirteen years setting the standard for chauffeured travel in Vietnam',
    dcarBody: [
      'In 2013 HTH became the first company to put the D’Car limousine into premium passenger service in Vietnam. Thirteen years and more than 6,000 safe trips later, HTH provides more than a vehicle: a quiet, business-class space to rest or work on the road.',
      'That reputation rests on the trust of multinationals, international organisations and world-class artists, among them AmCham Vietnam, Unilever, Uber, Logitem and Asian Trails, and on events such as DJ Hardwell’s visit to Vietnam. Strict operating discipline, a young fleet and professional chauffeurs have earned HTH “Supplier of the Year” from Asian Trails and other leading tour operators, several years running.',
    ],
    dcarClosing:
      'In our second decade the promise is the one we started with: care over the small details, absolute punctuality, and attentive service on every route you take.',
    dcarEyebrow: 'About HTH',
    partnersLabel: 'Partners and clients who have travelled with HTH',
    photoAlt: 'The HTH team taking delivery of D’Car limousines at the D’Car showroom',
    photoCaption: 'HTH taking delivery of D’Car limousines.',
    quote:
      'HTH Development Investment JSC: the first strategic partner to put the DCar Limousine into premium passenger service in Vietnam, from 2013.',
    quoteSource: 'As reported by VnExpress and Thanh Niên',
    pressLink: 'Xe Đời Sống: DCar delivers a Transit DCar batch to HTH →',
    dcarLink: 'See both D’Car classes →',
    ratesH2: 'Popular routes, one all-in price',
    ratesLead:
      'Covering the car, chauffeur, fuel, tolls and passenger insurance. For a route outside the table or a longer itinerary, call for a separate quote.',
    ratesCaption: 'In Vietnamese dong. The six routes people ask about most.',
    ratesNote:
      'The BMW 5 Series column is built from HTH’s own figure of 3,500,000₫ for eight hours including the chauffeur. On trips of two days or more a four-seat sedan is the wrong car, so we quote those separately.',
    ratesAll: 'See the full rate table →',
    aboutH2: 'Thirteen years, mostly work nobody sees',
    aboutLead: (year: number) =>
      `HTH started in ${year} in Saigon with a handful of cars and one phone number. Today that is more than 4,000 trips, a fleet from 4 to 47 seats, and a dispatch desk staffed through the night.`,
    points: [
      {
        title: 'Chauffeurs who stay',
        body: 'Uniformed, used to receiving international guests, and English-speaking when a guest needs it.',
      },
      {
        title: 'Every car checked before it goes out',
        body: 'A fixed service schedule and a clean before each pickup. If something fails on the road, a replacement leaves immediately.',
      },
      {
        title: 'Plans change, and that is normal',
        body: 'A delayed flight, an added stop, a different road halfway. The coordinator absorbs it, and you never explain it twice.',
      },
    ],
    clientsH2: 'A few of the names that have travelled with us',
    clientsLead:
      'Artist parties, chambers of commerce, manufacturers and international tour operators. Most come back for the same reason: the schedule runs as agreed.',
    clients: [
      { name: 'DJ Hardwell', what: 'Artist transport, show in Ho Chi Minh City' },
      { name: 'Ha Anh Vu', what: 'Private car for the supermodel' },
      { name: 'AmCham', what: 'Delegation transfers and events' },
      { name: 'Uber', what: 'Corporate transport contract' },
      { name: 'Unilever · Logitem', what: 'Staff and factory routes' },
      { name: 'Asian Trails', what: 'Inbound tour groups' },
    ],
    clientsAll: 'See the clients page →',
    contactH2: 'Contact',
    officeName: 'Millennium, Ben Van Don',
  },
} as const;

/** Logos supplied by HTH, recoloured by scripts/partner-logos.py. `display` is the rendered height in px. */
const partners = [
  { id: 'amcham', name: 'AmCham Vietnam', w: 520, h: 115, display: 34 },
  { id: 'asian-trails', name: 'Asian Trails', w: 400, h: 128, display: 38 },
  { id: 'uber', name: 'Uber', w: 403, h: 140, display: 26 },
  { id: 'logitem', name: 'Logitem Vietnam', w: 498, h: 90, display: 30 },
  { id: 'hardwell', name: 'Hardwell', w: 400, h: 81, display: 24 },
  { id: 'saigontourist', name: 'Saigontourist', w: 192, h: 140, display: 46 },
  { id: 'vietravel', name: 'Vietravel', w: 520, h: 98, display: 30 },
  { id: 'datviet', name: 'Đất Việt Tour', w: 139, h: 140, display: 46 },
];

export default function HomePage({ locale = 'vi' }: { locale?: Locale }) {
  const copy = t(locale);
  const c = C[locale];
  const en = locale === 'en';

  return (
    <>
      {/* Hero ------------------------------------------------------------- */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <Image
            src="/img/hero-fleet-day.webp"
            alt={
              en
                ? 'The HTH Limousine fleet outside the depot: Kia Carnival, BMW 5 Series, Ford Transit D’Car, Hyundai Solati D’Car and a 45-seat Universe coach'
                : 'Đội xe HTH Limousine xếp hàng trước xưởng: Kia Carnival, BMW 5 Series, Ford Transit D’Car, Hyundai Solati D’Car và xe khách Universe 45 chỗ'
            }
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className={styles.heroScrim} />
        <div className={styles.heroScrimCorner} />

        <div className={`wrap ${styles.heroCopy}`}>
          <div className={styles.heroText}>
            <div className="eyebrow">{c.eyebrow(site.foundedYear)}</div>
            <h1 className={styles.heroTitle}>{c.h1}</h1>
            <p className={styles.heroLead}>{c.lead}</p>
            <dl className={styles.heroStats}>
              {c.meta.map((item, i) => (
                <div key={item.label} className={styles.heroStat}>
                  <dt>{item.label}</dt>
                  <dd>
                    <CountUp value={item.value} locale={locale} delay={250 + i * 180} />
                    <span className={styles.heroStatSuffix}>{item.suffix}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <p className={styles.heroStatsNote}>{c.statsNote}</p>
          </div>
        </div>

        <div className={`wrap ${styles.heroBooking}`}>
          <BookingModule locale={locale} variant="overlay" />
        </div>
      </section>

      {/* Assurances -------------------------------------------------------- */}
      <section className="section--tight">
        <div className="wrap">
          <div className={styles.assure} data-stagger>
            {c.assurances.map((item) => (
              <div key={item.title} className={styles.assureItem}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations: where HTH goes from Saigon ------------------------- */}
      <section className="section section--alt section--rule-top" id="diem-den">
        <JourneyMap locale={locale} />
      </section>

      {/* Fleet -------------------------------------------------------------- */}
      <section className="section section--alt section--rule-top">
        <div className="wrap">
          <div className="head reveal">
            <div className="head-title">
              <div className="eyebrow">{copy.eyebrow.fleet}</div>
              <h2>
                {c.fleetH2}{' '}
                <span className={styles.h2Second}>{c.fleetH2b}</span>
              </h2>
            </div>
            <p className="u-lead">{c.fleetLead}</p>
          </div>

          <div className={styles.fleet} data-stagger>
            {fleet.map((vehicle) => (
              <Link
                key={vehicle.slug}
                href={paths.vehicle(locale, vehicle.slug)}
                className={styles.card}
              >
                <div className={styles.cardMedia} data-parallax="6">
                  <Image
                    src={vehicle.hero}
                    alt={vehicle.heroAlt}
                    width={1200}
                    height={900}
                    sizes="(max-width: 620px) 100vw, (max-width: 1000px) 50vw, 33vw"
                  />
                </div>
                <span className="label">{en ? vehicle.categoryEn : vehicle.category}</span>
                <h3 className={styles.cardName}>{en ? vehicle.nameEn : vehicle.name}</h3>
                <p className={styles.cardBlurb}>{en ? vehicle.blurbEn : vehicle.blurb}</p>
                <div className={styles.cardFoot}>
                  <span className={styles.cardPrice}>
                    {formatVnd(vehicle.from.amount, locale)}₫{' '}
                    <small>· {en ? vehicle.from.labelEn : vehicle.from.label}</small>
                  </span>
                  <span className="u-quiet" style={{ fontSize: 13 }}>
                    {en ? vehicle.seatsEn : vehicle.seats}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* About HTH: the one deliberate dark passage ----------------------------- */}
      <section className={`section section--dark ${styles.story}`} id="gioi-thieu">
        <div className="wrap">
          <div className={styles.storyGrid}>
            <div className={`${styles.storyText} reveal`}>
              <div className="eyebrow eyebrow--dark">{c.dcarEyebrow}</div>
              <h2>{c.dcarH2}</h2>
              {c.dcarBody.map((para) => (
                <p key={para.slice(0, 24)}>{para}</p>
              ))}
            </div>

            <figure className={`${styles.storyFigure} reveal`}>
              <div className={styles.storyPhoto} data-parallax="8">
                <Image
                  src="/img/hth-dcar-handover.webp"
                  alt={c.photoAlt}
                  width={1238}
                  height={1135}
                  sizes="(max-width: 900px) 100vw, 42vw"
                />
              </div>
              <figcaption className={styles.storyCaption}>{c.photoCaption}</figcaption>
              <blockquote className={styles.storyQuote}>
                <p>“{c.quote}”</p>
                <footer>
                  {c.quoteSource}
                  <a
                    href="https://xedoisong.vn/xuat-xuong-lo-xe-ford-transit-dcar-nang-cap-xa-hoa-mung-xuan-giap-ngo"
                    target="_blank"
                    rel="noopener"
                    className="tlink tlink--onDark"
                  >
                    {c.pressLink}
                  </a>
                </footer>
              </blockquote>
            </figure>
          </div>
        </div>

        <div className={styles.partners} aria-label={c.partnersLabel} role="region">
          <div className={`wrap ${styles.partnersLabel}`}>
            <span className="label">{c.partnersLabel}</span>
          </div>
          <div className={styles.marquee}>
            {[0, 1].map((copyIndex) => (
              <ul key={copyIndex} className={styles.marqueeTrack} aria-hidden={copyIndex === 1}>
                {partners.map((p) => (
                  <li key={p.id}>
                    <Image src={`/img/partners/${p.id}.png`} alt={copyIndex === 0 ? p.name : ''} width={p.w} height={p.h} style={{ height: p.display, width: 'auto' }} />
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>

        <div className="wrap">
          <div className={`${styles.storyClosing} reveal`}>
            <p>{c.dcarClosing}</p>
            <Link href={paths.fleet(locale)} className="tlink tlink--onDark">{c.dcarLink}</Link>
          </div>
        </div>
      </section>

      {/* Rates --------------------------------------------------------------- */}
      <section className="section">
        <div className="wrap">
          <div className="head reveal">
            <div className="head-title">
              <div className="eyebrow">{copy.eyebrow.rates}</div>
              <h2>{c.ratesH2}</h2>
            </div>
            <p className="u-lead">{c.ratesLead}</p>
          </div>

          <div className={`${styles.rateTableWrap} reveal`}>
            <table className={styles.rateTable}>
              <caption
                className="u-quiet"
                style={{ captionSide: 'bottom', textAlign: 'left', padding: '14px 18px', fontSize: 13 }}
              >
                {c.ratesCaption}
              </caption>
              <thead>
                <tr>
                  <th scope="col">{copy.rates.route}</th>
                  {rateColumns.map((column) => (
                    <th key={column.key} scope="col" style={{ textAlign: 'right' }}>
                      {column.short}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {featuredRates.map((row) => (
                  <tr key={`${row.route}-${row.duration}`}>
                    <th scope="row" className={styles.rateRoute} style={{ fontWeight: 400 }}>
                      {en ? row.routeEn : row.route}
                      <div className={styles.rateDur}>{en ? row.durationEn : row.duration}</div>
                    </th>
                    {rateColumns.map((column) => {
                      const value = row.prices[column.key];
                      return (
                        <td key={column.key}>
                          {value === null ? copy.rates.onRequest : formatVnd(value, locale)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className={styles.rateNote}>{c.ratesNote}</p>
          <p style={{ marginTop: 18 }}>
            <Link href={paths.rates(locale)} className="tlink">{c.ratesAll}</Link>
          </p>
        </div>
      </section>

      {/* About ---------------------------------------------------------------- */}
      <section className="section section--alt section--rule-top">
        <div className="wrap">
          <div className={styles.about}>
            <div className="stack stack-20 reveal">
              <div className="eyebrow">{copy.eyebrow.about}</div>
              <h2>{c.aboutH2}</h2>
              <p className="u-lead">{c.aboutLead(site.foundedYear)}</p>

              <div className={styles.aboutPoints}>
                {c.points.map((point) => (
                  <div key={point.title} className={styles.point}>
                    <span className={styles.pointRule} aria-hidden="true" />
                    <h3 className={styles.pointTitle}>{point.title}</h3>
                    <p>{point.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${styles.aboutMedia} reveal`}>
              <figure className={styles.aboutWide}>
                <Image
                  src="/img/universe-fleet.webp"
                  alt="Đội xe khách Hyundai Universe của HTH xếp hàng chờ đón đoàn trước nhà ga"
                  width={1672}
                  height={941}
                  sizes="(max-width: 900px) 100vw, 44vw"
                />
              </figure>
              <figure className={styles.aboutSquare}>
                <Image
                  src="/img/solati-luggage.webp"
                  alt="Khoang hành lý phía sau xe Solati D’Car xếp năm vali nhôm và hai túi xách"
                  width={1760}
                  height={894}
                  sizes="(max-width: 900px) 50vw, 22vw"
                />
              </figure>
              <figure className={styles.aboutSquare}>
                <Image
                  src="/img/carnival-hotel.webp"
                  alt="Kia Carnival của HTH chờ khách trước lối vào khách sạn"
                  width={1448}
                  height={1086}
                  sizes="(max-width: 900px) 50vw, 22vw"
                />
              </figure>
            </div>
          </div>
        </div>
      </section>

      {/* Clients ---------------------------------------------------------------- */}
      <section className="section">
        <div className="wrap">
          <div className="head reveal">
            <div className="head-title">
              <div className="eyebrow">{copy.eyebrow.clients}</div>
              <h2>{c.clientsH2}</h2>
            </div>
            <p className="u-lead">{c.clientsLead}</p>
          </div>

          <div className={`${styles.clients} reveal`}>
            {c.clients.map((client) => (
              <div key={client.name} className={styles.client}>
                <span className={styles.clientName}>{client.name}</span>
                <span className={styles.clientWhat}>{client.what}</span>
              </div>
            ))}
          </div>
          <p style={{ marginTop: 22 }}>
            <Link href={paths.clients(locale)} className="tlink">{c.clientsAll}</Link>
          </p>
        </div>
      </section>

      {/* Contact ----------------------------------------------------------------- */}
      <section className="section section--alt section--rule-top">
        <div className="wrap">
          <div className={styles.contact}>
            <div className="stack stack-28 reveal">
              <div className="stack stack-20">
                <div className="eyebrow">{copy.eyebrow.contact}</div>
                <h2>{c.contactH2}</h2>
              </div>

              <div>
                <div className={styles.detail}>
                  <span className={styles.detailKey}>{copy.contactLabels.hotline}</span>
                  <a href={`tel:${site.phone.tel}`} className={styles.detailPhone}>
                    {site.phone.display}
                  </a>
                </div>
                <div className={styles.detail}>
                  <span className={styles.detailKey}>{copy.contactLabels.office}</span>
                  <p className={styles.detailValue}>
                    {site.address.line}
                    <br />
                    {site.address.ward}, {site.address.city}
                  </p>
                </div>
                <div className={styles.detail}>
                  <span className={styles.detailKey}>{copy.contactLabels.email}</span>
                  <a href={`mailto:${site.email}`} className={styles.detailValue}>{site.email}</a>
                </div>
                <div className={styles.detail}>
                  <span className={styles.detailKey}>{copy.contactLabels.messaging}</span>
                  <div className={styles.channels}>
                    <a className={styles.channel} href={site.phone.zalo} target="_blank" rel="noopener">Zalo</a>
                    <a className={styles.channel} href={site.phone.whatsapp} target="_blank" rel="noopener">WhatsApp</a>
                    <a className={styles.channel} href={site.phone.messenger} target="_blank" rel="noopener">Messenger</a>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${styles.officeCard} reveal`}>
              <div className={styles.officeMap}>
                <InView>
                  <GoogleMapEmbed locale={locale} title={copy.contactLabels.headOffice} />
                </InView>
              </div>
              <div className={styles.officeFoot}>
                <div>
                  <div className="label" style={{ marginBottom: 7 }}>{copy.contactLabels.headOffice}</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 600, lineHeight: 1.4 }}>
                    {c.officeName}
                  </div>
                </div>
                <a href={site.address.mapsUrl} target="_blank" rel="noopener" className="tlink">
                  {copy.contactLabels.openMap}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
