# Marco Cordova CV

**Live:** https://marco-cordova.vercel.app

An iOS-style portfolio site built with Next.js. Visitors land on a wallpaper carousel, see a live status bar, and can launch four apps from the glass dock:

- **Finder** — file browser over portfolio documents (CV PDF, experience, roadmap)
- **Audio** — music player with configurable track list
- **Portfolio** — GitHub project showcase with live star counts and screenshots
- **CV** — resume rendered as an iOS Notes-style app

On desktop the experience is wrapped in an iPad frame. The dock is frosted glass, wallpapers cycle with `prefers-reduced-motion` respected, and the status bar shows the live local time.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| UI | React 18 |
| Styling | CSS (no UI framework) |
| Deployment | Vercel |

---

## Quick start

```bash
git clone https://github.com/cordova7/cv-site.git
cd cv-site
npm install
cp .env.example .env          # set NEXT_PUBLIC_CV_NAME
npm run dev                    # http://localhost:3000
```

For production:

```bash
npm run build
npm start
```

---

## Project layout

```
cv-site/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout, metadata, font setup
│   ├── page.tsx                  # Home page (renders the iOS shell)
│   ├── loading.tsx               # Loading screen
│   └── [...path]/page.tsx        # Catch-all (redirects to home)
│
├── components/
│   ├── MarcoIosHomeShell.tsx    # Shell: wallpaper, status bar, dock, widget
│   └── WallpaperShowcase.tsx     # Wallpaper carousel with reduced-motion support
│
├── src/marco_frontend/src/     # iOS UI components
│   ├── features/ios-interface/   # Home, StatusBar, Splash, Dock, Notes, Portfolio
│   ├── shared/components/        # FloatingWidget, Finder (PDF/CSV/image viewers)
│   └── config/audioTracks.js     # Audio widget track list
│
└── public/assets/
    ├── portfolio-projects/        # Project screenshots for Portfolio app
    ├── docs/                      # CV PDF, experience CSV, roadmap PNG
    ├── icons/                     # Finder file-type icons
    └── yosemite*.jpg/png           # Wallpaper carousel images
```

---

## Configuration

One environment variable is required:

```env
NEXT_PUBLIC_CV_NAME=Marco Cordova
```

---

## Customising the content

| What | Where |
|---|---|
| CV text | `src/marco_frontend/src/features/ios-interface/components/IOSNotes.jsx` → `defaultNotes` |
| Finder files | `src/marco_frontend/src/shared/components/Finder.jsx` → `fileSystem` |
| Portfolio projects | `src/marco_frontend/src/features/ios-interface/components/IOSPortfolio.jsx` → `PROJECTS` |
| Audio tracks | `src/marco_frontend/src/features/ios-interface/config/audioTracks.js` |
| Wallpapers | `components/MarcoIosHomeShell.tsx` → `WallpaperShowcase images` prop |

---

## License

MIT
