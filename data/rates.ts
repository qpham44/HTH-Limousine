/**
 * Published rate table.
 *
 * Source: HTH market reference survey, 17/08/2026 (five Ho Chi Minh City
 * operators, arithmetic mean per route). Confirmed for publication by HTH
 * on 2 Sep 2026.
 *
 * The BMW column is rescaled ×1.4 from the survey and rounded to 100.000₫,
 * anchored on HTH's own figure of 3.500.000₫ for eight hours including driver.
 * Beyond one day a four-seat sedan is the wrong car, so those cells read
 * "Liên hệ" rather than a number that undercuts the twelve-seat limousine.
 *
 * Prices are all-in: car, chauffeur, fuel, tolls and passenger insurance.
 */

export const rateColumns = [
  { key: 'bmw', label: 'BMW 5 Series', short: 'BMW' },
  { key: 'carnival', label: 'Kia Carnival', short: 'Carnival' },
  { key: 'transitdcar', label: 'Transit D’Car', short: 'Transit D’Car' },
  { key: 'solati', label: 'Solati D’Car', short: 'Solati D’Car' },
  { key: 'limo12', label: 'Limousine 12 chỗ', short: 'Limousine 12' },
  { key: 'bus45', label: 'Universe 45 chỗ', short: 'Universe 45' },
] as const;

export type RateColumn = (typeof rateColumns)[number]['key'];

export interface RateRow {
  route: string;
  routeEn: string;
  duration: string;
  durationEn: string;
  /** null renders as "Liên hệ" / "On request". */
  prices: Record<RateColumn, number | null>;
  /** Shown on the homepage summary. */
  featured?: boolean;
}

const row = (
  route: string,
  routeEn: string,
  duration: string,
  durationEn: string,
  [bmw, carnival, transitdcar, solati, limo12, bus45]: (number | null)[],
  featured = false,
): RateRow => ({
  route, routeEn, duration, durationEn,
  prices: { bmw, carnival, transitdcar, solati, limo12, bus45 },
  featured,
});

export const rateRows: RateRow[] = [
  row('Sân bay Tân Sơn Nhất ⇄ trung tâm', 'Tan Son Nhat Airport ⇄ city centre', '1 chiều · 2 giờ', 'One way · 2 h',
    [2_100_000, 1_200_000, 1_600_000, 1_800_000, 1_900_000, 2_000_000], true),
  row('Nội thành TP.HCM', 'Ho Chi Minh City', 'Nửa ngày · 4–5 giờ', 'Half day · 4–5 h',
    [2_200_000, 1_800_000, 2_300_000, 2_700_000, 2_700_000, 3_000_000], true),
  row('Nội thành TP.HCM', 'Ho Chi Minh City', 'Trọn ngày · 8–10 giờ', 'Full day · 8–10 h',
    [3_500_000, 2_500_000, 3_200_000, 3_600_000, 3_800_000, 4_700_000], true),
  row('TP.HCM ⇄ Củ Chi', 'Ho Chi Minh City ⇄ Cu Chi', '1 ngày', 'One day',
    [3_900_000, 3_200_000, 3_200_000, 3_700_000, 3_900_000, 4_000_000]),
  row('TP.HCM ⇄ Bình Dương', 'Ho Chi Minh City ⇄ Binh Duong', '1 ngày', 'One day',
    [3_500_000, 2_800_000, 2_600_000, 2_900_000, 3_200_000, 3_700_000]),
  row('TP.HCM ⇄ Biên Hòa', 'Ho Chi Minh City ⇄ Bien Hoa', '1 ngày', 'One day',
    [3_400_000, 2_600_000, 2_300_000, 2_600_000, 2_700_000, 3_800_000]),
  row('TP.HCM ⇄ Cần Giờ', 'Ho Chi Minh City ⇄ Can Gio', '1 ngày', 'One day',
    [4_200_000, 3_200_000, 3_800_000, 4_300_000, 4_400_000, 4_200_000]),
  row('TP.HCM ⇄ Mỹ Tho / Bến Tre', 'Ho Chi Minh City ⇄ My Tho / Ben Tre', '1 ngày', 'One day',
    [4_500_000, 3_500_000, 3_700_000, 4_200_000, 4_400_000, 4_500_000]),
  row('TP.HCM ⇄ Tây Ninh', 'Ho Chi Minh City ⇄ Tay Ninh', '1 ngày', 'One day',
    [4_900_000, 3_500_000, 4_500_000, 5_200_000, 5_300_000, 6_000_000]),
  row('TP.HCM ⇄ Vũng Tàu', 'Ho Chi Minh City ⇄ Vung Tau', '1 chiều', 'One way',
    [3_900_000, 3_000_000, 2_800_000, 3_200_000, 3_500_000, 4_500_000], true),
  row('TP.HCM ⇄ Vũng Tàu', 'Ho Chi Minh City ⇄ Vung Tau', '1 ngày', 'One day',
    [4_900_000, 3_800_000, 4_000_000, 4_600_000, 4_900_000, 5_600_000]),
  row('TP.HCM ⇄ Vũng Tàu', 'Ho Chi Minh City ⇄ Vung Tau', '2 ngày 1 đêm', '2 days, 1 night',
    [7_700_000, 6_000_000, 6_200_000, 7_100_000, 7_300_000, 8_000_000]),
  row('TP.HCM ⇄ Hồ Tràm', 'Ho Chi Minh City ⇄ Ho Tram', '1 ngày', 'One day',
    [5_300_000, 4_000_000, 3_900_000, 4_500_000, 4_800_000, 6_000_000], true),
  row('TP.HCM ⇄ Hồ Tràm', 'Ho Chi Minh City ⇄ Ho Tram', '2 ngày 1 đêm', '2 days, 1 night',
    [8_100_000, 6_500_000, 6_200_000, 7_100_000, 7_200_000, 8_500_000]),
  row('TP.HCM ⇄ Hồ Tràm, sân golf The Bluffs', 'Ho Chi Minh City ⇄ The Bluffs golf', '1 ngày', 'One day',
    [5_000_000, 3_800_000, 3_800_000, 4_400_000, 4_600_000, 5_000_000]),
  row('TP.HCM ⇄ sân golf Long Thành', 'Ho Chi Minh City ⇄ Long Thanh golf', '8 giờ', '8 h',
    [3_900_000, 3_000_000, 3_100_000, 3_500_000, 3_900_000, 4_700_000]),
  row('TP.HCM ⇄ Cần Thơ', 'Ho Chi Minh City ⇄ Can Tho', '1 ngày', 'One day',
    [5_900_000, 4_500_000, 4_500_000, 5_100_000, 5_400_000, 6_000_000]),
  row('TP.HCM ⇄ Cần Thơ', 'Ho Chi Minh City ⇄ Can Tho', '2 ngày 1 đêm', '2 days, 1 night',
    [null, 6_500_000, 6_800_000, 7_800_000, 8_000_000, 9_500_000]),
  row('TP.HCM ⇄ Phan Thiết / Mũi Né', 'Ho Chi Minh City ⇄ Phan Thiet / Mui Ne', '1 ngày', 'One day',
    [6_300_000, 5_000_000, 5_000_000, 5_700_000, 6_000_000, 7_700_000]),
  row('TP.HCM ⇄ Phan Thiết / Mũi Né', 'Ho Chi Minh City ⇄ Phan Thiet / Mui Ne', '2 ngày 1 đêm', '2 days, 1 night',
    [null, 7_000_000, 6_800_000, 7_800_000, 8_000_000, 9_500_000]),
  row('TP.HCM ⇄ Đà Lạt', 'Ho Chi Minh City ⇄ Da Lat', '1 chiều', 'One way',
    [7_700_000, 5_500_000, 6_000_000, 6_800_000, 7_000_000, 9_000_000], true),
  row('TP.HCM ⇄ Đà Lạt', 'Ho Chi Minh City ⇄ Da Lat', '2 ngày 1 đêm', '2 days, 1 night',
    [null, 9_000_000, 9_200_000, 10_500_000, 11_000_000, 12_000_000]),
  row('TP.HCM ⇄ Đà Lạt', 'Ho Chi Minh City ⇄ Da Lat', '3 ngày 2 đêm', '3 days, 2 nights',
    [null, 12_000_000, 10_700_000, 12_200_000, 12_700_000, 14_500_000]),
  row('TP.HCM ⇄ Nha Trang', 'Ho Chi Minh City ⇄ Nha Trang', '3 ngày 2 đêm', '3 days, 2 nights',
    [null, 13_000_000, 11_500_000, 13_200_000, 13_600_000, 16_000_000]),
];

export const featuredRates = rateRows.filter((r) => r.featured);
