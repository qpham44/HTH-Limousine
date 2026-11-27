import photosData from '@/data/journey/photos.json';
import { journeys } from '@/data/journeys';
import type { Locale } from '@/lib/i18n';
import JourneyStage3D from './JourneyStage3D';
import JourneyStageMapbox from './JourneyStageMapbox';

/** Mapbox when a token is configured; otherwise the MapLibre/OpenFreeMap map. */
const withMapbox = Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN);
import styles from './JourneyMap.module.css';

const C = {
  vi: {
    eyebrow: 'Điểm đến',
    title: `${journeys.length} Hành trình Đáng trải nghiệm từ Sài Gòn`,
    lead:
      'Khám phá lộ trình thực tế, thời gian di chuyển chuẩn xác và bảng giá thuê xe trọn gói tương ứng với quy mô đoàn của bạn. Hãy chọn một điểm đến bên dưới để xem gợi ý trải nghiệm, thời lượng lý tưởng và lịch trình tham khảo được HTH thiết kế riêng cho từng hành trình.',
    credit:
      'Đường đi lấy từ OpenStreetMap qua OSRM; quãng đường tính từ Quận 1. Thời gian là của HTH với những tuyến đã chạy thực tế, các tuyến còn lại ước tính theo tốc độ xe thường gặp. Giá là ước tính, điều phối viên xác nhận khi đặt xe. Bản đồ: ' + (withMapbox ? '© Mapbox © OpenStreetMap contributors; địa hình 3D Mapbox Terrain.' : '© OpenStreetMap contributors qua OpenFreeMap/OpenMapTiles; ảnh vệ tinh toàn cảnh NASA Blue Marble; địa hình 3D Mapzen/AWS Terrain Tiles.'),
    photos: 'Nguồn ảnh (Wikimedia Commons, giấy phép mở)',
  },
  en: {
    eyebrow: 'Destinations',
    title: `${journeys.length} journeys worth taking from Saigon`,
    lead:
      'See the real route, the drive time and an all-in price for the size of your group. Pick a destination below for what to see, how long to stay and a suggested plan HTH has put together for each trip.',
    credit:
      'Roads from OpenStreetMap via OSRM; distances from District 1. Times are HTH’s own on routes it has timed, and estimated at typical speeds elsewhere. Prices are estimates a coordinator confirms when you book. Map: ' + (withMapbox ? '© Mapbox © OpenStreetMap contributors; 3D terrain Mapbox Terrain.' : '© OpenStreetMap contributors via OpenFreeMap/OpenMapTiles; overview imagery NASA Blue Marble; 3D terrain Mapzen/AWS Terrain Tiles.'),
    photos: 'Photo credits (Wikimedia Commons, free licences)',
  },
} as const;

type Photo = { src: string; author: string; license: string; page: string; file: string };
const photos = (photosData as unknown as { photos: Record<string, Photo> }).photos;

/** Journey map: a full-bleed 3D map with the planner panel docked beside it. */
export default function JourneyMap({ locale = 'vi' }: { locale?: Locale }) {
  const c = C[locale];
  const credits = Object.entries(photos);

  return (
    <div className={styles.root}>
      <div className="wrap">
        <div className={`head ${styles.head}`}>
          <div className="head-title">
            <div className="eyebrow">{c.eyebrow}</div>
            <h2>{c.title}</h2>
          </div>
          <p className="u-lead">{c.lead}</p>
        </div>
      </div>

      {withMapbox ? <JourneyStageMapbox locale={locale} /> : <JourneyStage3D locale={locale} />}

      <div className="wrap">
        <p className={styles.credit}>{c.credit}</p>
        {credits.length ? (
          <details className={styles.photoCredits}>
            <summary>{c.photos}</summary>
            <ul>
              {credits.map(([id, p]) => (
                <li key={id}>
                  <a href={p.page} target="_blank" rel="noopener noreferrer">{p.file.replace(/_/g, ' ').replace(/\.[a-z]+$/i, '')}</a>
                  {' — '}{p.author}, {p.license}
                </li>
              ))}
            </ul>
          </details>
        ) : null}
      </div>
    </div>
  );
}
