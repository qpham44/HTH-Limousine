import AtlasLayers, { plate } from './AtlasLayers';
import AtlasPlate from './AtlasPlate';
import type { Locale } from '@/lib/i18n';
import styles from './HeritageAtlas.module.css';

const C = {
  vi: {
    eyebrow: 'Bản đồ hành trình',
    title: 'Từ Sài Gòn, mười\u00a0bốn điểm\u00a0đến',
    lead:
      'Mỗi đường nối là một điểm đến HTH phục vụ thường xuyên, từ cao nguyên Lâm Đồng, dọc bờ biển Nam Trung Bộ, đến tận Cà Mau.',
    note:
      'Đường nối trên bản đồ thể hiện điểm đến, không phải lộ trình xe chạy. Lộ trình, thời gian và giá được xác nhận khi đặt xe.',
    credit: 'Dữ liệu địa lý: Natural Earth. Toạ độ: GeoNames, Natural Earth, Wikipedia.',
  },
  en: {
    eyebrow: 'The HTH atlas',
    title: 'Fourteen destinations from\u00a0Saigon',
    lead:
      'Each line is a destination HTH serves regularly, from the Lâm Đồng highlands and along the south-central coast to Cà Mau.',
    note:
      'The lines show where we go, not the road taken. The route, timing and price are confirmed when you book.',
    credit: 'Geography: Natural Earth. Coordinates: GeoNames, Natural Earth, Wikipedia.',
  },
} as const;

/**
 * HTH Heritage Atlas — an engraved map of HTH's service network.
 * The base plate is server-rendered; only the network is interactive.
 */
export default function HeritageAtlas({
  locale = 'vi',
  headingLevel = 'h2',
}: {
  locale?: Locale;
  headingLevel?: 'h2' | 'h3';
}) {
  const c = C[locale];
  const Heading = headingLevel;
  return (
    <div className={styles.atlas}>
      <div className={`head reveal ${styles.head}`}>
        <div className="head-title">
          <div className="eyebrow">{c.eyebrow}</div>
          <Heading className={styles.title}>{c.title}</Heading>
        </div>
        <p className="u-lead">{c.lead}</p>
      </div>

      <AtlasPlate locale={locale} width={plate.width} height={plate.height}>
        <AtlasLayers locale={locale} />
      </AtlasPlate>

      <div className={styles.foot}>
        <p>{c.note}</p>
        <p className={styles.credit}>{c.credit}</p>
      </div>
    </div>
  );
}
