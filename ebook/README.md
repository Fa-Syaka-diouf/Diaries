# Diaries of the Indo-Gangetic Plains

*Stories from the Past, Present and Future* is an interactive scientific ebook for **NE-AR (Naturalists Explorer – Augmented Reality)**, a NASA Space Apps Challenge project. It is not a NASA publication and does not imply NASA endorsement.

The book is five designed pages plus an unnumbered back board, turned with a real page-curl engine:

| Page | Title | Content |
| ---- | ----- | ------- |
| 1 | Cover | NASA VIIRS Black Marble view of the plains; past → present → future CO₂ strip |
| 2 | Understanding the Indo-Gangetic Plains | Map of the four sites on NASA Blue Marble + Natural Earth (India point of view) |
| 3 | How Do We Detect Environmental Change? | Data workflow, datasets, Mann–Kendall and Sen's slope, signal vs noise |
| 4 | Reading Earth's Environmental Story | Timeline, charts per site, trend result cards, IPCC AR6 scenarios |
| 5 | Experience the Changing Earth | AR concept mock-up, conclusion, QR area, credits |

On desktop the cover opens into two-page spreads (2–3, 4–5). Tablets in portrait show one scaled page at a time. On phones the pages reflow at a readable size: swipe to turn a page, scroll down within it.

## Run it

Requires Node.js 20 or later.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run preview    # serve dist/ locally
npm run lint
npm run test:stats # sanity checks for the trend statistics
```

### Reading controls

← → / PageUp PageDown turn pages · Home / End · F toggles full screen. Click or drag a page corner, or swipe on touch screens. The toolbar provides the contents list, page thumbnails, zoom, an optional page sound (off by default), a scrolling list view, print / save as PDF and full screen. `#page-3` in the URL opens page 3 directly.

If the page-turning engine fails, the app falls back to the list view automatically. Without JavaScript, a short text summary is shown.

## Data: everything shown is computed, nothing is hand-entered

`npm run data` (`scripts/fetch-data.mjs`) downloads the records, builds annual series and computes the statistics into `src/data/generated/observations.json`. That file is committed so the site builds offline. Raw responses are cached in `scripts/.cache/`; delete that folder to re-download.

| Series | Dataset / provider | Variable · unit | Resolution | Coverage |
| ------ | ------------------ | --------------- | ---------- | -------- |
| Temperature (4 sites) | NASA LaRC POWER, MERRA-2 | T2M, anomaly vs 1991–2020 · °C | 0.5° × 0.625° | 1981–2024 |
| Rainfall (Uttarakhand, Punjab) | NASA POWER | PRECTOTCORR, annual total · mm | 0.5° × 0.625° | 1981–2024 |
| Soil wetness (Uttarakhand) | NASA POWER | GWETROOT · 0–1 | 0.5° × 0.625° | 1981–2024 |
| Aerosol (Delhi) | NASA POWER, MERRA-2 aerosols | AOD at 550 nm · unitless | 0.5° × 0.625° | 2001–2024 |
| Vegetation (Punjab) | MODIS MOD13Q1 v6.1 via ORNL DAAC | NDVI · unitless | 250 m, ~2 × 2 km mean | 2001–2024 |
| Sea level (West Bengal) | NOAA Laboratory for Satellite Altimetry, Bay of Bengal | Sea-level anomaly · mm | basin mean | 1993–2024 |
| CO₂ (global background) | NOAA GML Mauna Loa | CO₂ · ppm | single station | 1981–2024 |

Source URLs are stored with every series in `observations.json`. Analysis points are listed in `src/data/locations.ts`.

**Statistics** (`scripts/lib/trend.mjs`): two-sided Mann–Kendall test with tie correction, and Sen's slope with its 95 % confidence interval (Gilbert 1987). There is no correction for serial autocorrelation, and the book states this limitation.

**Future scenarios** (`src/data/projections.ts`) are *published* global values from IPCC AR6 WGI (Table SPM.1, §B.5.3, Table 9.9) and SSP CO₂ concentrations from Meinshausen et al. (2020). The book labels them as global projections, not local forecasts. Regional downscaled projections (for example NASA NEX-GDDP-CMIP6) are not yet integrated.

### What the data show (as retrieved 2026-11-10)

- Significant increases: Bay of Bengal sea level (+3.5 mm/yr), Delhi aerosol optical depth, Punjab NDVI, rainfall at both sites, Uttarakhand soil wetness, and CO₂.
- No significant trend: annual mean 2 m temperature at all four grid points. The book reports this as it is and does not claim local warming.

### Replacing or adding data

1. Add a fetch-and-aggregate block to `scripts/fetch-data.mjs` that writes a new entry into `result.series`, using the same fields (`points`, `unit`, `dataset`, `sourceUrl`…) and calling `summarise()`.
2. Add its id to `SeriesId` in `src/data/environmentalData.ts` and a display entry in `src/data/seriesDisplay.ts`.
3. Reference it from a tab in `src/components/Pages/TimelinePage.tsx`, or from a card or chart elsewhere.
4. Run `npm run data`. Charts, cards, the data appendix and the print edition update automatically.

To use your team's own processed results instead of downloads, write them into `observations.json` in the same shape, with real provenance.

## Images and maps

`npm run assets` (`scripts/prepare-assets.mjs`) regenerates:

- NASA GIBS imagery (public domain): VIIRS Black Marble 2016 (cover), Blue Marble shaded relief (map), Suomi NPP VIIRS true colour of 7 Nov 2017 (haze layer).
- Natural Earth 1:10 m boundaries (India point of view) and rivers, projected to SVG paths.
- The NE-AR logo, and thumbnails cropped from the team's past/present/future illustrations in `../image/`. These are conceptual art and are labelled as such in the book.
- NASA GISS GISTEMP frames from `../temp/`, cropped to South Asia, for the AR temperature slider.

The `../sea_level/` frames show Southeast Asia, not West Bengal, so the book does not use them.

## QR code for the AR app

No app URL was provided, so the book shows an honest "link will appear here" area rather than a fake code. To generate a real QR code at build time:

```bash
# .env.local
VITE_AR_APP_URL=https://your-ne-ar-app.example
```

## Deploy

`npm run build` produces a static site in `dist/` with relative paths (`base: './'`), so it works from any folder or sub-path:

- **Netlify / Vercel**: build command `npm run build`, publish directory `dist`, base directory `ebook`.
- **GitHub Pages**: publish the contents of `dist/`.

## Structure

```
scripts/        fetch-data.mjs, prepare-assets.mjs, lib/trend.mjs (+ tests)
src/components/Book/            DigitalBook, BookPage, BookToolbar, PageNavigation,
                                PageThumbnails, NavigationPanel, ListView, BookLoader
src/components/Pages/           CoverPage, GeographyPage, MethodologyPage,
                                TimelinePage, ARConclusionPage, BackCover
src/components/Visualizations/  LocationMap, HistoricalTimeline, EnvironmentalChart,
                                TemperatureChart, StatisticalResults, ScenarioPanel,
                                PhoneMockup, QRBlock, FindingsTable, Sparkline
src/data/       environmentalData, locations, projections, references, seriesDisplay,
                generated/ (observations + map geometry)
src/styles/     book.css (stage, book object, toolbar), pages.css (editorial), print.css
```

Page turning uses [`@gullabs/react-flipbook`](https://github.com/gul-labs/flipbook) (MIT; engine MPL-2.0), a maintained fork of react-pageflip / StPageFlip.
