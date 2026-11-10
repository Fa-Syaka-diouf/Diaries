// Prepares every image and map geometry used by the ebook.
//
//   node scripts/prepare-assets.mjs
//
//  1. NASA GIBS satellite imagery (public domain) for the cover, the map and the
//     haze observation figure.
//  2. Natural Earth vector data (public domain) projected to SVG path strings.
//  3. The NE-AR project's own images re-encoded as WebP.
//  4. NASA GISS GISTEMP frames (already in the repository) cropped to South Asia
//     for the temperature layer of the AR mock-up.

import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { geoPath, geoTransform, geoClipRectangle } from 'd3-geo';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REPO = join(ROOT, '..');
const CACHE = join(ROOT, 'scripts', '.cache');
const IMG_OUT = join(ROOT, 'src', 'assets', 'images');
const GEN = join(ROOT, 'src', 'data', 'generated');
const PUBLIC_GISTEMP = join(ROOT, 'public', 'gistemp');

await Promise.all([IMG_OUT, GEN, PUBLIC_GISTEMP, CACHE].map((d) => mkdir(d, { recursive: true })));

async function download(name, url) {
  const file = join(CACHE, name);
  if (existsSync(file)) return file;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'ne-ar-ebook-assets/1.0' } });
      if (!res.ok) throw new Error(`${res.status} for ${url}`);
      await writeFile(file, Buffer.from(await res.arrayBuffer()));
      return file;
    } catch (e) {
      if (attempt === 4) throw e;
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
}

// ------------------------------------------------------------ 1. NASA GIBS
// bbox = [lonMin, latMin, lonMax, latMax]
const gibs = (layer, bbox, w, h, time) =>
  `https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0` +
  `&LAYERS=${layer}&STYLES=&CRS=EPSG:4326&BBOX=${bbox[1]},${bbox[0]},${bbox[3]},${bbox[2]}` +
  `&WIDTH=${w}&HEIGHT=${h}&FORMAT=image/jpeg${time ? `&TIME=${time}` : ''}`;

// Map frame for page 2. The x axis is compressed by cos(26.5°) so the map is
// an equirectangular projection with a standard parallel through the plains.
export const MAP_BBOX = [72, 20, 92, 33];
const PHI0 = (26.5 * Math.PI) / 180;
const MAP_K = 60; // px per degree of latitude in the generated geometry
const mapW = Math.round((MAP_BBOX[2] - MAP_BBOX[0]) * Math.cos(PHI0) * MAP_K);
const mapH = Math.round((MAP_BBOX[3] - MAP_BBOX[1]) * MAP_K);

const imagery = [
  {
    name: 'cover-black-marble',
    url: gibs('VIIRS_Black_Marble', [70, 6, 94, 40], 1400, 1984, '2016-01-01'),
    out: { width: 1400, height: 1984 },
  },
  {
    name: 'map-blue-marble',
    // fetched in plain lon/lat, then resized horizontally to apply cos(φ0)
    url: gibs('BlueMarble_ShadedRelief_Bathymetry', MAP_BBOX, 2000, 1300),
    out: { width: Math.round(mapW * 1.5), height: Math.round(mapH * 1.5) },
  },
  {
    name: 'haze-viirs-2017-11-07',
    url: gibs('VIIRS_SNPP_CorrectedReflectance_TrueColor', [70, 22, 90, 33], 1600, 880, '2017-11-07'),
    out: { width: 1600, height: 880 },
  },
];

for (const im of imagery) {
  const src = await download(`${im.name}.jpg`, im.url);
  await sharp(src)
    .resize(im.out.width, im.out.height, { fit: 'fill' })
    .webp({ quality: 82 })
    .toFile(join(IMG_OUT, `${im.name}.webp`));
  console.log(`imagery: ${im.name}`);
}

// ------------------------------------------------------ 2. Natural Earth
const NE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/';
const countries = JSON.parse(await readFile(await download('ne_10m_admin_0_countries_ind.geojson', NE + 'ne_10m_admin_0_countries_ind.geojson'), 'utf8'));
const states = JSON.parse(await readFile(await download('ne_10m_admin_1_states_provinces.geojson', NE + 'ne_10m_admin_1_states_provinces.geojson'), 'utf8'));
const rivers = JSON.parse(await readFile(await download('ne_10m_rivers_lake_centerlines.geojson', NE + 'ne_10m_rivers_lake_centerlines.geojson'), 'utf8'));

// Radial-distance simplification of a d3 path string (M/L/Z commands only).
function simplify(d, tol) {
  if (!d) return '';
  const out = [];
  for (const seg of d.split(/(?=M)/)) {
    const closed = seg.endsWith('Z');
    const pts = seg.replace(/[MZ]/g, '').split('L').map((p) => p.split(',').map(Number));
    const kept = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const [x, y] = pts[i];
      const [lx, ly] = kept.at(-1);
      if (Math.hypot(x - lx, y - ly) >= tol || i === pts.length - 1) kept.push(pts[i]);
    }
    if (kept.length < (closed ? 3 : 2)) continue;
    out.push('M' + kept.map(([x, y]) => `${Math.round(x)},${Math.round(y)}`).join('L') + (closed ? 'Z' : ''));
  }
  return out.join('');
}

function makePath(bbox, k, phi0, tol = 1.5) {
  const c = Math.cos(phi0);
  const w = (bbox[2] - bbox[0]) * c * k;
  const h = (bbox[3] - bbox[1]) * k;
  const project = geoTransform({
    point(lon, lat) {
      this.stream.point(round1((lon - bbox[0]) * c * k), round1((bbox[3] - lat) * k));
    },
  });
  const clip = geoClipRectangle(-2, -2, w + 2, h + 2);
  const proj = { stream: (s) => project.stream(clip(s)) };
  const p = geoPath(proj);
  return { w: Math.round(w), h: Math.round(h), path: (f) => simplify(p(f) ?? '', tol), project: (lon, lat) => [round1((lon - bbox[0]) * c * k), round1((bbox[3] - lat) * k)] };
}
const round1 = (x) => Math.round(x * 10) / 10;

const intersects = (f, bb) => {
  const [x0, y0, x1, y1] = f.bbox ?? bboxOf(f.geometry);
  return !(x1 < bb[0] || x0 > bb[2] || y1 < bb[1] || y0 > bb[3]);
};
function bboxOf(g) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const walk = (a) => (typeof a[0] === 'number' ? ((x0 = Math.min(x0, a[0])), (y0 = Math.min(y0, a[1])), (x1 = Math.max(x1, a[0])), (y1 = Math.max(y1, a[1]))) : a.forEach(walk));
  walk(g.coordinates);
  return [x0, y0, x1, y1];
}

const STATE_KEYS = { Delhi: 'delhi', Uttarakhand: 'uttarakhand', 'West Bengal': 'westbengal', Punjab: 'punjab' };
const RIVER_NAMES = /^(Ganges|Ganga|Yamuna|Indus|Sutlej|Beas|Ravi|Chenab|Brahmaputra|Hugli|Hooghly|Ghaghara|Gandak|Kosi|Son|Chambal|Padma|Jamuna|Meghna|Ramganga|Gomti)$/i;

function buildMap(bbox, k, phi0, tol) {
  const m = makePath(bbox, k, phi0, tol);
  const inBox = (fs) => fs.filter((f) => intersects(f, bbox));
  const india = countries.features.find((f) => f.properties.ADM0_A3 === 'IND');
  return {
    bbox,
    width: m.w,
    height: m.h,
    standardParallel: (phi0 * 180) / Math.PI,
    india: m.path(india),
    neighbours: inBox(countries.features.filter((f) => f.properties.ADM0_A3 !== 'IND')).map((f) => ({ name: f.properties.NAME_EN ?? f.properties.NAME, d: m.path(f) })).filter((x) => x.d),
    states: Object.fromEntries(
      states.features
        .filter((f) => f.properties.adm0_a3 === 'IND' && STATE_KEYS[f.properties.name])
        .map((f) => [STATE_KEYS[f.properties.name], m.path(f)]),
    ),
    stateBorders: inBox(states.features.filter((f) => f.properties.adm0_a3 === 'IND')).map((f) => m.path(f)).filter(Boolean),
    rivers: inBox(rivers.features.filter((f) => RIVER_NAMES.test(f.properties.name ?? '') && (f.properties.scalerank ?? 9) <= 8))
      .map((f) => ({ name: f.properties.name, d: m.path(f) }))
      .filter((x) => x.d),
    project: null,
  };
}

const mapIgp = buildMap(MAP_BBOX, MAP_K, PHI0, 2);
const mapIndia = buildMap([66, 6, 98, 37], 14, (21 * Math.PI) / 180, 1.5);
delete mapIndia.stateBorders;
mapIndia.neighbours = [];
await writeFile(join(GEN, 'map-igp.json'), JSON.stringify(mapIgp));
await writeFile(join(GEN, 'map-india.json'), JSON.stringify(mapIndia));
console.log(`map: igp ${mapIgp.width}×${mapIgp.height}, rivers=${mapIgp.rivers.length}, states=${Object.keys(mapIgp.states).join(',')}`);

// ------------------------------------------------ 3. Project images → WebP
const projectImages = {
  'logo_NE-AR.jpg': 'ne-ar-logo',
};
// (the team's past/present/future collages are used as cropped thumbnails below)
for (const [src, name] of Object.entries(projectImages)) {
  await sharp(join(REPO, 'image', src)).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 82 }).toFile(join(IMG_OUT, `${name}.webp`));
}
// Location thumbnails: one panel of each team collage, cropped clear of its caption label.
// [left, top, width, height] as fractions of the source image.
const thumbCrops = {
  delhi: ['IMG-20250930-WA0013.jpg', [0.52, 0.02, 0.46, 0.52]],
  uttarakhand: ['IMG-20250930-WA0009.jpg', [0.02, 0.775, 0.46, 0.205]],
  westbengal: ['IMG-20250930-WA0012.jpg', [0.51, 0.02, 0.48, 0.35]],
  punjab: ['IMG-20250930-WA0008.jpg', [0.505, 0.01, 0.485, 0.52]],
};
for (const [key, [src, [l, t, w, h]]] of Object.entries(thumbCrops)) {
  const img = sharp(join(REPO, 'image', src));
  const { width, height } = await img.metadata();
  await img
    .extract({ left: Math.round(l * width), top: Math.round(t * height), width: Math.round(w * width), height: Math.round(h * height) })
    .resize(240, 280, { fit: 'cover', position: 'attention' })
    .webp({ quality: 80 })
    .toFile(join(IMG_OUT, `thumb-${key}.webp`));
}
console.log('project images: done');

// ------------------------------------ 4. GISTEMP frames cropped to S. Asia
const frames = (await readdir(join(REPO, 'temp'))).filter((f) => /^gt_\d{4}_720x360\.jpg$/.test(f));
for (const f of frames) {
  const year = f.slice(3, 7);
  await sharp(join(REPO, 'temp', f))
    .extract({ left: 440, top: 70, width: 170, height: 150 })
    .resize(340, 300, { kernel: 'lanczos3' })
    .webp({ quality: 75 })
    .toFile(join(PUBLIC_GISTEMP, `${year}.webp`));
}
console.log(`gistemp frames: ${frames.length}`);
