# TODO — open items and placeholders

Updated 6 Sep 2026, after the first Vercel deployment.

## Cutover checklist — do these in order on the day hth.com.vn moves

1. Fill `data/redirects.ts` with the old URL map (see the first item below).
2. Point hth.com.vn at Vercel and attach the domain to the project.
3. **Set `NEXT_PUBLIC_ALLOW_INDEXING=true`** in the Vercel Production environment
   and redeploy. Until this is set, `robots.txt` says `Disallow: /` and every page
   carries `noindex`. That is deliberate while the site lives on
   `hth-limousine.vercel.app` with canonicals pointing at hth.com.vn, but it means
   a live site with the flag unset will never be indexed.
4. Submit `https://hth.com.vn/sitemap.xml` in Search Console, both properties.

## Deployment

- Production: `https://hth-limousine.vercel.app` (project `msquared12/hth-limousine`).
  No custom domain attached, so hth.com.vn still serves the old Joomla site.
- The 6 Sep production deploy that failed was blocked by Vercel for shipping
  next@15.5.4 (CVE-2025-66478). Pinned to 15.5.25, which deploys.
- Deployment Protection is on for the team, so raw `*-<hash>-msquared12.vercel.app`
  URLs ask for Vercel SSO. The `hth-limousine.vercel.app` alias is public.

## Blocking launch (not blocking the build)

- [ ] **Old hth.com.vn URL export.** Roughly fourteen years of indexed Joomla URLs.
      A one-hop 301 map must be in `next.config.mjs → redirects()` *before* the new
      site goes live. A crawl export or the old sitemap is enough. This is the
      single largest risk in the project.
- [ ] **A lead delivery channel.** At least one of: `RESEND_API_KEY` +
      `LEAD_FROM_ADDRESS` (email), `TELEGRAM_BOT_TOKEN` + `TELEGRAM_CHAT_ID`, or
      `LEAD_WEBHOOK_URL` (the Google Sheets script in `scripts/` needs no paid
      account). Until one is set, `/api/lead` returns `delivered: false` and the
      booking module falls back to pre-filled Zalo / WhatsApp / mail links, which
      work but leave no record. Webhook delivery verified end to end on 27 Sep 2026.
- [x] **Hotline confirmed 3 Sep 2026: `0903 760 187`.**

## Awaiting content from HTH

- [ ] Business registration number and tax code for the footer (question 26 was blank).
- [ ] Google Business Profile URL, plus Facebook / TikTok / YouTube — these feed the
      `sameAs` array in the LocalBusiness schema and the footer.
- [ ] Hardwell and Hà Anh Vũ photographs (permission confirmed, images to follow).
- [ ] Per-vehicle equipment lists, if HTH wants them stated. Nothing is claimed today
      beyond capacity, luggage and what the photographs actually show.

## Photography gaps

- [x] Sources converted to WebP at full resolution: **55.4MB to 4.5MB** across 25 images,
      quality 82. The logo stays PNG for its alpha channel. This removed a visible
      delay on first paint — a 2.2MB PNG had to be decoded before every optimisation.
- [x] A dedicated **Kia Carnival** card shot is in use (`Kia Carnival/carnival.png`) —
      the 368×489 crop the prototype used has been dropped.
- [ ] Still missing: D’Car interiors in daylight, a chauffeur in uniform, an airport
      arrival, and the office itself.
- [ ] Resolution ceiling is **1672px**. Comfortable to a 1440 hero, soft above it.
      No layout depends on more, and nothing is upscaled.
- [ ] `BMW 5 series/interior.png` and two of the Carnival files are manufacturer press
      images, not HTH cars in Vietnam (foreign backdrops give them away). Used
      sparingly; replace when HTH shoots its own.

## Pricing

- [x] Published table = the 17/08/2026 market survey, BMW column ×1.4 from the
      3.500.000₫ / 8h anchor, rounded to 100.000₫.
- [x] BMW shows **Liên hệ** beyond one day, where a four-seat sedan would otherwise
      price above the twelve-seat limousine.
- [x] Estimator refitted to that table: within ±7% of the published figure for every
      vehicle at the airport, Vũng Tàu and Đà Lạt anchors, so the quote and
      `/bang-gia` never contradict each other.
- [ ] Per HTH: no VAT line and no surcharge policy on the site. Both stay in the quote.

## Maps

- [ ] CARTO basemaps now require an API key and serve a "KEY REQUIRED" watermark
      without one. Switched to keyless OpenStreetMap raster tiles, desaturated in CSS
      to match the palette. `NEXT_PUBLIC_MAP_TILES` / `NEXT_PUBLIC_MAP_ATTRIBUTION`
      switch providers without touching component code.
- [x] Tile endpoint confirmed from the deployed origin: `tile.openstreetmap.org`
      returns a 256x256 PNG for the office tile with no key. The provider works.
- [x] Map rendering confirmed 27 Sep 2026: tiles load, pins and the route line draw.
- [x] Quote widget: "Quận 10/11/12" no longer resolve to Quận 1 (whole-word matching);
      the place list now covers every former HCMC district, the main Quận 1 hotels,
      Liên Khương and Cam Ranh airports and more provinces; any other address is
      looked up through `/api/geocode`. Live OSRM times are floored to typical city
      traffic, since OSRM's free-flow figures ran 2–3× too short.
- [ ] `router.project-osrm.org` and `photon.komoot.io` are free public services with
      no SLA. Both degrade gracefully (measured table, great-circle estimate, phone
      quote), but at scale move to a paid or self-hosted router and geocoder.
- [ ] Confirm the office pin sits on the right building; centre is 10.7608, 106.7013.

## Atlas (added 23 Nov 2026, see ATLAS.md)

- [ ] Confirm with HTH: An Giang shown at Châu Đốc / Núi Sam, Đồng Tháp at Cao Lãnh,
      Tây Ninh at the city (not Núi Bà Đen). Change the point and its source in
      `data/destinations.ts` if customers mostly go elsewhere.
- [ ] `lib/quote.ts` places Hồ Tràm about 11.5 km inland (10.464, 107.33); the beach strip
      is 10.483, 107.433.
- [ ] No provincial boundaries until there's an open, post-July-2025 dataset.

## Navigation

- [x] Every header, footer and in-page link now points at a real route. No anchors left.
- [x] Footer carries a structured link block to all services, vehicles and routes.

## Progress

**Day 1 — done 3 Sep**
- `/doi-xe` fleet index and six vehicle pages from `data/fleet.ts`, each with a
  per-vehicle slice of the published rate table, gallery, facts and Product + Offer
  schema.
- `/dich-vu` index plus five service pages — `/dua-don-san-bay-tan-son-nhat`,
  `/thue-xe-theo-gio`, `/thue-xe-theo-ngay`, `/thue-xe-doanh-nghiep`, `/tour-du-lich` —
  each with Service + FAQPage schema, a numbered booking sequence, an inclusions list
  and filtered rates.
- Breadcrumbs and BreadcrumbList schema on every page below the root.
- Fourteen statically generated pages. 122KB first-load JS on the homepage,
  111KB on subpages.

**Day 2 — done 4 Sep**
- Five route pages from `data/routes.ts` plus a `/tuyen-duong` index — measured distance
  and drive time, an honest account of the drive, three things worth knowing, filtered
  rates, suitable vehicles, FAQ, related routes.
- `/bang-gia` (full published table), `/khach-hang`, `/ve-chung-toi`, `/lien-he`, `/dat-xe`.
- `/cam-nang` plus three guides written from the fleet and route data — no invented
  statistics — with Article schema.
- Reference study (Blacklane, Wheely, Aman) fed one structural change: the homepage hero
  no longer puts type on the photograph at all. Copy sits on the page ground, the picture
  runs to the right edge, and the light scrim is gone.
- Contrast pass: `--ink-3` and `--gold-ink` darkened so all secondary text clears 4.5:1
  on every ground it appears on.
- Twenty-eight pages, all statically generated. 123KB first-load JS on the homepage,
  111KB on subpages.

**Day 3 — done 5 Sep**
- Full English site under `/en/`, with English slugs rather than mirrored Vietnamese
  ones: `/en/airport-transfer-tan-son-nhat`, `/en/routes/saigon-to-da-lat`,
  `/en/guides/choose-a-car-by-luggage` and so on.
- Two root layouts through route groups, so Vietnamese pages ship `<html lang="vi">`
  and English pages ship `<html lang="en">` rather than one language borrowing the
  other's tag.
- hreflang pairs on all 58 pages, and a language switch that lands on the same page
  in the other language instead of dumping the visitor on the home page.
- English written rather than translated. Nothing in the English copy is a literal
  rendering of the Vietnamese.
- Humanising pass: **63 em dashes removed** from customer-facing copy, each sentence
  restructured rather than the character swapped. Em dashes are one of the most
  reliable tells of machine-written text.
- 58 pages, all statically generated, all with a canonical, one h1, valid JSON-LD,
  titles under 60 characters and descriptions under 158.

## Carried into Day 4

- Day 4 — metadata and JSON-LD across all pages, sitemap entries, image pipeline,
  performance, accessibility and cross-browser QA at 360 / 768 / 1280 / 1920.

**Day 5 — 6 Sep, SEO pass and first deployment**
- Open Graph per page. Eighteen index and static pages were inheriting the layout's
  block, so sharing `/dich-vu`, `/doi-xe`, `/bang-gia` or `/dat-xe` on Facebook, Zalo
  or TikTok produced the home page's title, the home page's description and a link
  back to the home page. Detail pages set a title and description but no `og:url`,
  so their cards had no canonical link either. All 58 pages now carry their own
  `og:title`, `og:description` and an `og:url` equal to their canonical, via
  `lib/seo.ts`.
- `x-default` hreflang added to every page and every sitemap entry, pointing at the
  Vietnamese page.
- Indexing gated behind `NEXT_PUBLIC_ALLOW_INDEXING` (`lib/site.ts`). See the cutover
  checklist at the top.
- `robots.txt` disallows `/api/` once indexing is on.
- Checked and already correct, no change needed: one h1 per page, canonical on all 58,
  hreflang pairs, titles all 60 characters or under and descriptions 160 or under
  (measured in characters, not bytes), alt text on every content image with the footer
  logo correctly `alt="" aria-hidden`, valid Breadcrumb / Product / Service / FAQPage /
  Article JSON-LD, AutoRental schema with address, geo and opening hours.
