import geometry from '@/data/atlas/geometry.json';
import { kmPerUnit, locatorPlate, mainPlate, project } from '@/lib/atlas/projection';
import type { Locale } from '@/lib/i18n';

/**
 * The engraved base plate: land, water lines, rivers, graticule, frame,
 * scale and locator. Server-rendered and static, so none of the geometry
 * ships in the JavaScript bundle; the client component only draws the
 * network on top.
 */

const { main, locator } = geometry;
const W = main.width;
const H = main.height;
const [WEST, SOUTH, EAST, NORTH] = mainPlate.bounds;

const P = (lon: number, lat: number) => project(mainPlate, [lon, lat]);

const L = {
  vi: {
    cambodia: 'CAMPUCHIA',
    eastSea: ['BIỂN', 'ĐÔNG'],
    gulf: ['VỊNH', 'THÁI LAN'],
    phuQuoc: 'Phú Quốc',
    conDao: 'Côn Đảo',
    hoangSa: 'Hoàng Sa',
    truongSa: 'Trường Sa',
    vietnam: 'VIỆT NAM',
    north: 'B',
  },
  en: {
    cambodia: 'CAMBODIA',
    eastSea: ['EAST', 'SEA'],
    gulf: ['GULF OF', 'THAILAND'],
    phuQuoc: 'Phu Quoc',
    conDao: 'Con Dao',
    hoangSa: 'Hoang Sa',
    truongSa: 'Truong Sa',
    vietnam: 'VIETNAM',
    north: 'N',
  },
} as const;

/** Minute-track ticks along the frame: every 10′, longer every 30′, labelled every degree. */
function FrameTicks() {
  const ticks: React.ReactNode[] = [];
  const labels: React.ReactNode[] = [];
  const step = 1 / 6;
  for (let lon = Math.ceil(WEST * 6) / 6; lon <= EAST + 1e-9; lon += step) {
    const [x] = P(lon, SOUTH);
    const whole = Math.abs(lon - Math.round(lon)) < 1e-6;
    const half = Math.abs(lon * 2 - Math.round(lon * 2)) < 1e-6;
    const len = whole ? 9 : half ? 6 : 3.5;
    ticks.push(<line key={`t${lon.toFixed(3)}`} x1={x} y1={0} x2={x} y2={len} />);
    ticks.push(<line key={`b${lon.toFixed(3)}`} x1={x} y1={H} x2={x} y2={H - len} />);
    if (whole && x < W - 40) {
      labels.push(
        <text key={`lt${lon}`} x={x} y={-9} textAnchor="middle">{`${Math.round(lon)}°E`}</text>,
      );
    }
  }
  for (let lat = Math.ceil(SOUTH * 6) / 6; lat <= NORTH + 1e-9; lat += step) {
    const [, y] = P(WEST, lat);
    const whole = Math.abs(lat - Math.round(lat)) < 1e-6;
    const half = Math.abs(lat * 2 - Math.round(lat * 2)) < 1e-6;
    const len = whole ? 9 : half ? 6 : 3.5;
    ticks.push(<line key={`l${lat.toFixed(3)}`} x1={0} y1={y} x2={len} y2={y} />);
    ticks.push(<line key={`r${lat.toFixed(3)}`} x1={W} y1={y} x2={W - len} y2={y} />);
    if (whole) {
      labels.push(
        <text key={`ll${lat}`} x={W + 10} y={y} dominantBaseline="middle">{`${Math.round(lat)}°N`}</text>,
      );
    }
  }
  return (
    <>
      <g className="atl-ticks">{ticks}</g>
      <g className="atl-degrees">{labels}</g>
    </>
  );
}

function Graticule() {
  const lines: string[] = [];
  for (let lon = Math.ceil(WEST); lon <= EAST; lon++) {
    const [x] = P(lon, SOUTH);
    lines.push(`M${x.toFixed(1)} 0V${H}`);
  }
  for (let lat = Math.ceil(SOUTH); lat <= NORTH; lat++) {
    const [, y] = P(WEST, lat);
    lines.push(`M0 ${y.toFixed(1)}H${W}`);
  }
  return <path className="atl-graticule" d={lines.join('')} />;
}

/** Scale bar measured at 9°N, where it sits. 100 km, divided every 25. */
function ScaleBar() {
  const units = 100 / kmPerUnit(mainPlate, 9);
  const [x0, y0] = P(103.78, 8.62);
  const segs = [0, 1, 2, 3].map((i) => (
    <rect
      key={i}
      x={x0 + (units / 4) * i}
      y={y0}
      width={units / 4}
      height={4}
      className={i % 2 === 0 ? 'atl-scale-fill' : 'atl-scale-open'}
    />
  ));
  return (
    <g className="atl-scale">
      {segs}
      {[0, 50, 100].map((km) => (
        <text
          key={km}
          className={km === 50 ? 'atl-scale-mid' : undefined}
          x={x0 + (units * km) / 100}
          y={y0 - 7}
          textAnchor="middle"
        >
          {km === 100 ? '100 km' : km}
        </text>
      ))}
    </g>
  );
}

function NorthMark({ letter }: { letter: string }) {
  const [x, y] = P(109.72, 12.66);
  return (
    <g className="atl-north" transform={`translate(${x} ${y})`}>
      <circle r={17} />
      <path d="M0 -26L4 0L0 4L-4 0Z" className="atl-north-up" />
      <path d="M0 26L4 0L0 -4L-4 0Z" className="atl-north-down" />
      <text y={-31} textAnchor="middle">{letter}</text>
    </g>
  );
}

function Locator({ locale }: { locale: Locale }) {
  const l = L[locale];
  // Placed in the open sea, south-east of Côn Đảo.
  const [ox, oy] = P(108.55, 10.42);
  const lw = locator.width;
  const lh = locator.height;
  const [fx0, fy0] = project(locatorPlate, [WEST, NORTH]);
  const [fx1, fy1] = project(locatorPlate, [EAST, SOUTH]);
  const [hx, hy] = project(locatorPlate, [112.0, 16.5]);
  const [tx, ty] = project(locatorPlate, [114.0, 10.2]);
  const [vx, vy] = project(locatorPlate, [105.6, 17.4]);
  return (
    <g className="atl-locator" transform={`translate(${ox.toFixed(1)} ${oy.toFixed(1)})`}>
      <rect className="atl-locator-ground" x={-8} y={-8} width={lw + 16} height={lh + 16} />
      <rect className="atl-locator-frame" x={-4} y={-4} width={lw + 8} height={lh + 8} />
      <path className="atl-locator-neighbours" d={locator.neighbours} />
      <path className="atl-locator-vietnam" d={locator.vietnam} />
      {locator.islands.map(([x, y], i) => (
        <circle key={i} className="atl-locator-island" cx={x} cy={y} r={0.9} />
      ))}
      <rect
        className="atl-locator-window"
        x={fx0}
        y={fy0}
        width={fx1 - fx0}
        height={fy1 - fy0}
      />
      <text className="atl-locator-country" x={vx} y={vy} textAnchor="middle">{l.vietnam}</text>
      <text className="atl-locator-label" x={hx} y={hy - 7} textAnchor="middle">{l.hoangSa}</text>
      <text className="atl-locator-label" x={tx} y={ty - 9} textAnchor="middle">{l.truongSa}</text>
    </g>
  );
}

function SeaLabel({ at, lines, className }: { at: [number, number]; lines: readonly string[]; className: string }) {
  const [x, y] = P(at[0], at[1]);
  return (
    <text className={className} x={x} y={y} textAnchor="middle">
      {lines.map((line, i) => (
        <tspan key={line} x={x} dy={i === 0 ? 0 : '1.35em'}>{line}</tspan>
      ))}
    </text>
  );
}

export const plate = { width: W, height: H };

/** Everything beneath the network. Must be placed inside the atlas <svg>. */
export default function AtlasLayers({ locale }: { locale: Locale }) {
  const l = L[locale];
  const coastal = `${main.neighbours}${main.vietnam}`;
  const [cbx, cby] = P(104.75, 12.35);
  const [pqx, pqy] = P(103.96, 10.03);
  const [cdx, cdy] = P(106.6, 8.56);

  return (
    <>
      <defs>
        <clipPath id="atl-clip">
          <rect x={0} y={0} width={W} height={H} />
        </clipPath>
      </defs>

      <g clipPath="url(#atl-clip)">
        <rect className="atl-sea" x={0} y={0} width={W} height={H} />
        <Graticule />

        {/* Water lines: the coast repeated offshore, as an engraver would cut it. */}
        <g className="atl-waterlines" aria-hidden="true">
          <path d={coastal} className="atl-wl atl-wl-3" />
          <path d={coastal} className="atl-wl-gap atl-wl-gap-3" />
          <path d={coastal} className="atl-wl atl-wl-2" />
          <path d={coastal} className="atl-wl-gap atl-wl-gap-2" />
          <path d={coastal} className="atl-wl atl-wl-1" />
          <path d={coastal} className="atl-wl-gap atl-wl-gap-1" />
        </g>

        <path className="atl-neighbours" d={main.neighbours} />
        <path className="atl-vietnam" d={main.vietnam} />
        <path className="atl-lakes" d={main.lakes} />
        <path className="atl-rivers" d={main.rivers} />
        <path className="atl-boundary" d={main.boundaries} />

        <text className="atl-country" x={cbx} y={cby} textAnchor="middle">{l.cambodia}</text>
        <SeaLabel className="atl-sea-label" at={[107.55, 9.3]} lines={l.eastSea} />
        <SeaLabel className="atl-sea-label" at={[104.25, 9.45]} lines={l.gulf} />
        <text className="atl-island" x={pqx} y={pqy} textAnchor="middle">{l.phuQuoc}</text>
        <text className="atl-island" x={cdx} y={cdy} textAnchor="middle">{l.conDao}</text>

        <ScaleBar />
        <NorthMark letter={l.north} />
        <Locator locale={locale} />
      </g>

      <rect className="atl-frame-inner" x={0} y={0} width={W} height={H} />
      <rect className="atl-frame-outer" x={-5} y={-5} width={W + 10} height={H + 10} />
      <FrameTicks />
    </>
  );
}
