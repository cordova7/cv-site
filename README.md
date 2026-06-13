# cv-site

> An **iOS-style portfolio website** built as a single-page Next.js app —
> a full home-screen shell, dock, status bar, wallpaper carousel, floating
> widgets, and an iPad frame for desktop visitors.

<p align="left">
  <img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue.svg">
  <img alt="Stack: Next.js 14" src="https://img.shields.io/badge/Next.js-14-black">
  <img alt="Stack: React 18" src="https://img.shields.io/badge/React-18-61dafb">
  <img alt="Stack: TypeScript" src="https://img.shields.io/badge/TypeScript-5.7-3178c6">
  <img alt="Status: live" src="https://img.shields.io/badge/status-live-brightgreen">
</p>

## What it does

A self-contained, pixel-honest clone of the iOS home-screen metaphor, served as
a portfolio site. Visitors land on a wallpaper carousel, see a status bar with
the live local time, and can launch three apps from the glass dock:

- **Finder** — file-system-style browser over a portfolio of project folders
- **CV** — the resume, rendered as a Notes-style app
- **Portfolio** — an image grid styled like the iOS Photos app

On desktop viewports, the whole thing is wrapped in a bezeled iPad frame. On
mobile, the dock docks to the bottom and the apps go full-screen. There's a
splash screen, a home indicator, ambient wallpaper rotation, and a status bar
that re-renders every minute.

## Why it's interesting

Building a faithful iOS shell in the browser is mostly a CSS exercise — but
making the dock feel "glass" with real frosted blur, getting the wallpaper
carousel to respect `prefers-reduced-motion`, splitting the desktop vs mobile
rendering paths, and wiring lazy-loaded apps behind a Suspense fallback takes
real care. The result is a portfolio site that **makes recruiters stop
scrolling** because it doesn't look like a portfolio site.

## Tech stack

- **Next.js 14** App Router with React Server Components
- **TypeScript** end-to-end
- **CSS** for the iOS look (no UI framework) — `app/globals.css` is the spine
- **Internet Computer (dfx)** bindings for optional Internet Identity login
- **Supabase** + **Dexscreener** wired in for an optional sparkline widget
  (left in the code, hidden from the visible UI)

## Screenshots

<!-- Mark: drop your desktop + mobile screenshots into ./assets/screenshots/ and uncomment these.

| Desktop (iPad frame) | Mobile (full-screen) |
| :------------------: | :------------------: |
| ![Desktop](./assets/screenshots/desktop.png) | ![Mobile](./assets/screenshots/mobile.png) |

When a dock app is open, the floating widget sits centered:

![Floating widget](./assets/screenshots/widget.png)
-->

## Quick start

```bash
# 1. Install
npm install

# 2. Copy the env template and fill in your name
cp .env.example .env
# edit .env and set NEXT_PUBLIC_CV_NAME="Your Name"

# 3. Dev
npm run dev
# open http://localhost:3000

# 4. Production build
npm run build
npm start
```

The site works **without any env vars** — the only required one is
`NEXT_PUBLIC_CV_NAME` to populate the page title and the CV widget. The
Supabase / ICP / Solana env vars are only needed if you want to re-enable the
optional token-tracking API routes.

## Project layout

```
cv-site/
├── app/                  # Next.js App Router entry points
│   ├── layout.tsx        # Root layout, metadata, font loading
│   ├── page.tsx          # Home page (renders the iOS shell)
│   ├── loading.tsx
│   ├── globals.css       # The CSS spine for the iOS look
│   ├── [...path]/        # Catch-all for sub-routes (home only)
│   └── api/              # Optional server routes (sparkline, token-logo)
├── components/           # Top-level React components
│   ├── PeppleIosHomeShell.tsx   # The whole iOS home + dock + widget
│   ├── WallpaperShowcase.tsx    # Wallpaper carousel w/ reduced-motion
│   └── IosSparklineWidget.tsx   # Optional sparkline widget
├── lib/                  # Server-only utilities
│   ├── dexscreener.ts          # Optional Dexscreener API client
│   ├── solana.ts               # Optional mint-address validation
│   ├── sparkline-svg.ts        # SVG sparkline renderer
│   ├── token-tracking.ts       # Supabase-backed token sampler
│   └── supabase/admin.ts       # Supabase service-role client
├── public/
│   └── assets/           # Icons, wallpapers, the iPad frame
├── src/
│   └── pepple_frontend/  # The original Pepple product shell (used as a
│                         # style/component source by the iOS shell above)
└── schema.sql            # Optional Supabase schema for the token sampler
```

The iOS shell consumes components and CSS from `src/pepple_frontend/` (Finder,
Notes, Photos, the iPad frame, the glass dock, etc.) — that sub-project is
the original Pepple product this site evolved from, kept in the repo for
reference and as the source of truth for the shared visual language.

## License

MIT — see [LICENSE](./LICENSE).
