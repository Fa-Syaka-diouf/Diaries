# NE-AR · Three places, three questions

A five-page user guide e-book for **NE-AR (Naturalists Explorer – Augmented Reality)**, a NASA Space Apps Challenge project. It is not a NASA publication and does not imply NASA endorsement.

Live: https://ne-ar-diaries-indo-gangetic.netlify.app

| Page | Content |
| ---- | ------- |
| 1 | Cover: the three questions |
| 2 | What we deliver: website, AR app, algorithm (with QR codes), e-book, project demo |
| 3 | How it works: the six-step flowchart, Mann–Kendall and Sen's slope |
| 4 | Our examples: Western Himalaya, Thar Desert, Sundarbans, each with its 3D model, yearly chart and verdict |
| 5 | Use the AR app: four steps, how to read a model, the team |

Desktop shows two-page spreads, tablets one page, phones a readable reflow (swipe to turn).

## How it is built

- **Stack**: React 19 + TypeScript + Vite, Tailwind v4, lucide icons, `qrcode`.
- **Page turning**: [`@gullabs/react-flipbook`](https://github.com/gul-labs/flipbook) (MIT; engine MPL-2.0). `src/components/Book/` holds the book object, toolbar, contents, thumbnails, list view and print edition. The five pages are plain React components in `src/components/Pages/`, listed in `pageRegistry.tsx`.
- **Design canvas**: every page is laid out on a 520 × 736 px canvas and scaled as a whole (`src/hooks/useBookLayout.ts`). On phones the same content reflows (`.mode-reflow` rules in `src/styles/guide.css`).
- **Links and QR codes**: all in `src/data/guide.ts` (`LINKS`). QR codes are generated in the browser from those URLs. An empty URL (the demo, for now) shows "coming soon" instead of a code.

## Data

The three examples use the same series as the NE-AR website: NASA POWER (MERRA-2) monthly data averaged over every grid point of each region box, then over each year, 1981–2025.

| Place | Box | Variable |
| ----- | --- | -------- |
| Western Himalaya | 30–34°N · 77–80°E | Snow depth (SNODP) |
| Thar Desert | 25–28°N · 70–73°E | Air temperature (T2M) and night-time minimum (T2M_MIN) |
| Sundarbans | 21.5–22.5°N · 88.5–89.5°E | Rainfall (PRECTOTCORR) |

`scripts/import-cases.mjs` reads the series exported from the website and recomputes every trend with our own Mann–Kendall / Sen code (`scripts/lib/trend.mjs`). It stops if a result differs from the website's. The output, `src/data/generated/near-cases.json`, is committed.

To refresh: open https://vivivarm.github.io/NEAR/ in a browser and, in the console, export `SCAN`, `META` and `seasonal(SER[key], 'all', Y0, Y1)` for the four keys in the script into a JSON file (`{ r: { KEY: { meta, scan, yearly: [[year, value], …] } } }`). Then run `npm run cases -- that-file.json`.

GRACE-FO water storage for the Himalaya is not in the data yet. The book says so ("next witness").

## Images

- Cover: NASA GIBS VIIRS Black Marble 2016 (public domain). Logo: `../image/logo_NE-AR.jpg`. `npm run assets` regenerates both.
- 3D models (`src/assets/images/model-*.webp`): captured from the AR page of the NE-AR website. Replace them with screenshots from the AR app when available, keeping the same file names.

## Run

Requires Node.js 20 or later.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run lint
npm run test:stats # checks for the trend statistics
```

Keys: ← → turn pages, Home / End, F for full screen. `#page-3` in the URL opens page 3.

## Deploy

`npm run build` writes a static site to `dist/` with relative paths. Netlify settings are in `netlify.toml` (base directory `ebook`, build `npm run build`, publish `dist`).
