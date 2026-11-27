# HTH Heritage Atlas

The engraved map of HTH's network: Ho Chi Minh City plus fourteen destinations.
It's on the homepage (`#atlas`, between the D'Car band and the rates) and on
`/tuyen-duong` and `/en/routes`.

## Files

| File | Holds |
|---|---|
| `data/destinations.ts` | Origin and 14 destinations: `[lon, lat]`, source, independent cross-check |
| `lib/atlas/validate.ts` | Integrity rules. `next.config.ts` runs them and **refuses to build** on any problem |
| `lib/atlas/projection.ts` | Spherical Mercator fitted to fixed windows (main plate + locator) |
| `scripts/build-atlas.mts` | Downloads Natural Earth, clips, projects, simplifies → `data/atlas/geometry.json` |
| `data/atlas/geometry.json` | Pre-projected SVG paths (42KB, server-rendered, not in the JS bundle) |
| `data/atlas/vietnam-outline.json` | Vietnam in lon/lat, used only by the tests |
| `components/atlas/*` | `HeritageAtlas` (server), `AtlasLayers` (static plate), `AtlasPlate` (client: network, selection, index) |
| `tests/atlas.test.mjs` | `npm run test:atlas` |

```bash
npm run test:atlas    # 9 tests: validation, in-Vietnam, bearing from Saigon, validator rejects bad data
npm run build:atlas   # only if the plate windows in projection.ts change
```

Both need Node 22.18+ (they import TypeScript directly).

## Geographic data and licences

- **Natural Earth 1:10m v5.1.2**: public domain. The country layer is the
  Vietnam point-of-view edition (`ne_10m_admin_0_countries_vnm`), so Hoàng Sa
  and Trường Sa are drawn as Vietnamese territory on the locator.
- **GeoNames**: CC BY 4.0, credited in the caption.
- **Wikipedia** coordinates, **NGA GEOnet Names Server**, **OpenStreetMap** (ODbL) for cross-checks.
- GADM was not used. Its licence doesn't allow commercial use without permission.

**No provincial boundaries are drawn, on purpose.** Vietnam went from 63 to 34
provinces on 1 July 2025. Natural Earth and most open datasets still carry the
old lines. Drawing them would put a wrong map on a Vietnamese company's site.
Add them only from a post-2025 source with a clear licence.

## Coordinates

Every point is checked against a second, independent source. The build fails if
they disagree by more than 6 km.

| # | Destination | Point used | Source | Cross-check | Gap |
|---|---|---|---|---|---|
| — | TP. Hồ Chí Minh | City centre 10.77556, 106.70194 | Wikipedia | NGA GNS | 0.2 km |
| 01 | Đà Lạt | 11.94646, 108.44193 | GeoNames 1584071 | Natural Earth | 3.0 km |
| 02 | Phan Thiết | 10.92889, 108.10208 | GeoNames 1571058 | Natural Earth | 0.6 km |
| 03 | Nha Trang | 12.24507, 109.19432 | GeoNames 1572151 | Natural Earth | 2.7 km |
| 04 | Cần Thơ | 10.03711, 105.78825 | GeoNames 1586203 | Natural Earth | 2.5 km |
| 05 | An Giang | **Châu Đốc / Núi Sam** 10.70039, 105.11667 | Natural Earth | Wikipedia | <0.1 km |
| 06 | Đồng Tháp | **Cao Lãnh** 10.46017, 105.63294 | GeoNames 1586151 | Natural Earth | 0.8 km |
| 07 | Cà Mau | 9.17682, 105.15242 | GeoNames 1586443 | Natural Earth | 0.3 km |
| 08 | Hồ Tràm | Coast, 10.48333, 107.43333 | Wikipedia | OpenStreetMap | 0.3 km |
| 09 | Cần Giờ | Former Cần Thạnh (beach) 10.42, 106.94444 | Wikipedia | GeoNames 1586288 | 1.5 km |
| 10 | Tây Ninh | City 11.31004, 106.09828 | GeoNames 1566559 | Natural Earth | 5.5 km |
| 11 | Mỹ Tho | 10.36004, 106.35996 | GeoNames 1574023 | Natural Earth | 1.5 km |
| 12 | Bảo Lộc | 11.54798, 107.80772 | GeoNames 1588275 | findlatitudeandlongitude | 3.8 km |
| 13 | Phan Rang | 11.56432, 108.98858 | GeoNames 1571067 | Natural Earth | 0.6 km |
| 14 | Rạch Giá | 10.01245, 105.08091 | GeoNames 1568510 | Natural Earth | 1.2 km |

**Province names.** Since the 2025 merger, An Giang's centre is Rạch Giá and
Đồng Tháp's is Mỹ Tho, and both are already on the list. So An Giang is shown
at Châu Đốc (Bà Chúa Xứ temple, Núi Sam), and Đồng Tháp at Cao Lãnh. The panel
says so ("Điểm đại diện"). **Confirm with HTH** that these are the places
customers actually go. Sa Đéc is the obvious alternative for Đồng Tháp.

**Tây Ninh** is the city. If most trips go to Núi Bà Đen, move the point to the
mountain and update the source.

## What the map does not say

The lines are connections, not roads. No distances, drive times, highways or
traffic are shown or implied, and the caption says so. The panel shows only
facts that come straight from the coordinates (compass direction, DMS
coordinates). It links to the five existing route guides where they exist.

## Note for lib/quote.ts (not changed)

The quote place list has Hồ Tràm at 10.464, 107.33. That is about 11.5 km west of
the beach strip (10.483, 107.433). It's worth correcting there, because it
feeds fare estimates.
