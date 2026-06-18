# Marco Cordova CV

**Live:** [marco-cordova.vercel.app](https://marco-cordova.vercel.app)

An iOS-style portfolio site built with Next.js. Visitors land on a wallpaper carousel, see a live status bar, and can launch three apps from the glass dock:

- **Finder**: file-browser over portfolio documents (CV PDF, experience CSV, roadmap image)
- **CV**: the resume, rendered as a Notes-style app
- **Portfolio**: an image grid styled like the iOS Photos app

On desktop the whole experience is wrapped in an iPad frame. The dock is frosted glass, wallpapers cycle with `prefers-reduced-motion` respected, and the status bar shows the live local time.

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
│   ├── PeppleIosHomeShell.tsx    # Shell: wallpaper, status bar, dock, widget
│   └── WallpaperShowcase.tsx     # Wallpaper carousel with reduced-motion support
│
├── src/pepple_frontend/src/     # Shared iOS UI components
│   ├── features/ios-interface/   # Home, StatusBar, Splash, Dock, Notes, Photos, iPadFrame
│   └── shared/components/        # FloatingWidget, Finder (with PDF/CSV/image viewers)
│
└── public/assets/
    ├── icons/                    # Finder file-type icons
    ├── docs/                     # cv.pdf, stack-experience.csv, roadmap.png
    ├── memes-app/                # Portfolio images
    └── yosemite*.jpg/png          # Wallpaper carousel images
```

---

## Configuration

Only one environment variable is required:

```env
NEXT_PUBLIC_CV_NAME=Marco Cordova
```

All other assets (wallpapers, icons, portfolio images) are bundled in `public/` and require no configuration.

---

## Customising the content

| What | Where |
|---|---|
| CV text | `src/pepple_frontend/src/features/ios-interface/components/IOSNotes.jsx` → `defaultNotes` |
| Finder files | `src/pepple_frontend/src/shared/components/Finder.jsx` → `fileSystem` |
| Portfolio images | `src/pepple_frontend/src/features/ios-interface/components/IOSPhotos.jsx` → `DEFAULT_PROJECTS` |
| Wallpapers | `components/PeppleIosHomeShell.tsx` → `WallpaperShowcase images` prop |

---

## License

MIT
