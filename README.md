# HTH Limousine

Bilingual marketing and booking site for HTH Limousine, Ho Chi Minh City.
Next.js App Router, statically generated, deployed on Vercel.

## Running it

```bash
npm install
npm run dev      # http://localhost:3100
npm run build
npm start        # uses $PORT (Hostinger sets it), else 3000
npm run start:local   # http://localhost:3100
```

## How it is put together

Content is data, not pages. Adding a route or a vehicle means adding an entry,
not writing a page.

| File | Holds |
|---|---|
| `data/fleet.ts` | Six vehicles, both languages, gallery and reference price |
| `data/services.ts` | Five services, steps, inclusions, FAQ |
| `data/routes.ts` | Five routes, measured distance and drive time |
| `data/journal.ts` | Guides |
| `data/rates.ts` | The published rate table |
| `data/redirects.ts` | The 301 map from the old Joomla site |
| `lib/quote.ts` | Place list and matching, measured legs, tariff, fare band |
| `app/api/lead/route.ts` | Booking delivery: email, Telegram, webhook |
| `app/api/geocode/route.ts` | Free-text address lookup for the quote map |
| `lib/i18n.ts` | Locale type, UI dictionary, path builders |
| `lib/routeMap.ts` | Every page and its counterpart, for hreflang and the language switch |

Vietnamese lives at the root, English under `/en/` with its own slugs. Each
language has its own root layout under `app/(vi)` and `app/(en)` so the
`<html lang>` attribute is correct for both.

## Environment

Copy `.env.example` to `.env.local`. Everything is optional; the site runs
without any of it.

Booking requests (`/api/lead`) go out on every channel that is configured, and
count as delivered when at least one accepts. Configure at least one before
launch:

- `RESEND_API_KEY`, `LEAD_FROM_ADDRESS` (+ optional `LEAD_TO_ADDRESS`): email,
  default recipient sales4@hth.com.vn. The sending domain must be verified in Resend.
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`: a message in the dispatch group.
- `LEAD_WEBHOOK_URL`: JSON POST to anything. `scripts/google-sheets-lead-log.gs`
  turns a Google Sheet into a free lead log in five minutes.

With no channel set, the form falls back to pre-filled Zalo, WhatsApp and mail
links. The endpoint drops spam silently (hidden honeypot field, sub-2.5-second
submissions), rejects cross-origin posts and rate limits each IP.

Other settings:

- `NEXT_PUBLIC_GA_ID`: turns on GA4 and four conversion events. Nothing loads
  without it, so the site currently ships with no third-party script.
- `NEXT_PUBLIC_MAP_TILES`, `NEXT_PUBLIC_MAP_ATTRIBUTION`: basemap provider.
  Defaults to keyless OpenStreetMap tiles, inverted in CSS for the dark theme.
- `GEOCODER_URL`: address lookup behind `/api/geocode`, used when a typed place
  is not in HTH's own list. Defaults to the public Photon instance.

## Before launch

The 301 map in `data/redirects.ts` is empty and must be filled in from the old
site's URL export. The build refuses to start if the map contains a chain, a
loop or a duplicate. This is the single largest risk in the project: the domain
carries about fourteen years of indexed URLs.

Open items are tracked in `TODO.md`.
