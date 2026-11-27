# design-sync notes — HTH Limousine

Findings and decisions from the 2026-09-16 exploration run. No build or upload
happened: design-system authorization was unavailable in that session.

## Status

- Scope agreed, nothing built yet. The next run starts from a clean slate with
  the decisions below already made.
- No `projectId` is recorded, so the next run correctly treats this as a
  first-time import and creates a new Claude Design project.

## Blocker that stopped the first attempt

`DesignSync` returned:

> DesignSync needs design-system authorization, but /design-login requires an
> interactive terminal and is not available in this environment.

The session was the VS Code extension, which has no interactive terminal.
`/design-consent` had already failed twice with HTTP 403 for the same reason.
Fix before re-running: run `/design-login` in a terminal Claude Code session,
or use "Send to Claude Code Web" from Claude Design.

## Repo shape — this is not a design-system package

`hth-limousine` is a Next.js 15 App Router site, not a component library:

- `package.json` is `private: true` with no `main`, `module`, or `exports`, so
  there is no library entry for the converter to bundle.
- There is no `dist/`. The `.next/` directory is an application build and is
  not usable as component output.
- 12 of the 25 files under `components/` import from `next/` (`next/image`,
  `next/link`, `Metadata`), and 7 are `"use client"`.

The converter's package shape will therefore not run unmodified. The sync has
to follow the skill's off-script path: bundle the selected components directly
with esbuild, shimming `next/link` and `next/image`, compile the CSS Modules,
and hand-author the previews. The verification gates still apply in full —
`package-validate.mjs` must exit clean and every preview must be graded on the
absolute rubric before upload.

## Agreed scope: reusable parts plus tokens

In scope:

- Tokens from `app/globals.css` — 82 custom properties, already organised as
  surfaces, ink, rules, the gold accent, the type scale, and layout. This is
  the strongest design-system material in the repo.
- `components/site/Header.tsx`, `Footer.tsx`, `MobileBar.tsx`, `SiteShell.tsx`,
  `PageParts.tsx` (Breadcrumbs and siblings), `Reveal.tsx`, `InView.tsx`
- `components/rates/RateTable.tsx`
- `components/booking/BookingModule.tsx`

Out of scope:

- Everything under `components/pages/` — `HomePage`, `FleetPages`,
  `JournalPages`, `RoutePages`, `StaticPages`, and `services/ServicePage`.
  These are whole pages that take a `locale` and read from `data/`, and several
  also export `Metadata` helpers. They are compositions, not design-system
  components.
- `components/site/Analytics.tsx` and `JsonLd.tsx` — infrastructure with no
  visual surface.
- `components/site/OfficeMap.tsx` and `booking/QuoteMap.tsx` — Leaflet maps
  that need runtime tiles; revisit only if map cards are wanted later.

## Notes for the next run

- Every in-scope component takes an optional `locale` prop (`'vi' | 'en'`,
  defaulting to `'vi'`). Previews should show the Vietnamese default, since
  that is what the live site serves first.
- Styling idiom is CSS Modules plus the `globals.css` custom properties. The
  conventions header should teach `var(--gold)`, `var(--ink)`, `var(--step-lg)`
  and friends by their real names, and state that class names come from the
  component's own `.module.css` rather than a utility vocabulary.
- `RateTable` needs `rows` data; source realistic examples from `data/` rather
  than inventing rates.
- The repo is not under version control, so there is nothing to commit. If git
  is initialised later, commit `.design-sync/` along with the source.
