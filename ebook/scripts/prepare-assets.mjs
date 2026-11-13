// Prepares the cover image and the logo used by the guide.
//
//   node scripts/prepare-assets.mjs
//
//  1. NASA GIBS VIIRS Black Marble (public domain) for the cover.
//  2. The NE-AR logo from the repository, re-encoded as WebP.
//
// The three 3D model previews (src/assets/images/model-*.webp) are captured
// from the NE-AR website's AR page; see README.

import { mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const REPO = join(ROOT, '..');
const CACHE = join(ROOT, 'scripts', '.cache');
const IMG_OUT = join(ROOT, 'src', 'assets', 'images');

await Promise.all([IMG_OUT, CACHE].map((d) => mkdir(d, { recursive: true })));

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

// bbox = [lonMin, latMin, lonMax, latMax]
const gibs = (layer, bbox, w, h, time) =>
  `https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?SERVICE=WMS&REQUEST=GetMap&VERSION=1.3.0` +
  `&LAYERS=${layer}&STYLES=&CRS=EPSG:4326&BBOX=${bbox[1]},${bbox[0]},${bbox[3]},${bbox[2]}` +
  `&WIDTH=${w}&HEIGHT=${h}&FORMAT=image/jpeg${time ? `&TIME=${time}` : ''}`;

const cover = await download('cover-black-marble.jpg', gibs('VIIRS_Black_Marble', [70, 6, 94, 40], 1400, 1984, '2016-01-01'));
await sharp(cover).resize(1400, 1984, { fit: 'fill' }).webp({ quality: 82 }).toFile(join(IMG_OUT, 'cover-black-marble.webp'));

await sharp(join(REPO, 'image', 'logo_NE-AR.jpg')).resize({ width: 1200, withoutEnlargement: true }).webp({ quality: 82 }).toFile(join(IMG_OUT, 'ne-ar-logo.webp'));

console.log('assets: cover and logo done');
