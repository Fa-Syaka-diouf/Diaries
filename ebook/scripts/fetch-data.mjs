// Downloads the open datasets used by the ebook, aggregates them to annual
// values and computes Mann–Kendall / Sen's slope statistics.
//
//   node scripts/fetch-data.mjs
//
// Output: src/data/generated/observations.json (committed, so the site builds
// offline). Raw responses are cached in scripts/.cache/ (git-ignored).
//
// Nothing in the output is hand-written: every number shown in the book's
// charts and finding cards comes from this file.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mannKendallSen } from './lib/trend.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = join(ROOT, 'scripts', '.cache');
const OUT = join(ROOT, 'src', 'data', 'generated', 'observations.json');

const FIRST_YEAR = 1981;
const LAST_YEAR = 2024; // last complete calendar year for all sources
const BASELINE = [1991, 2020]; // WMO climatological standard normal

export const LOCATIONS = {
  delhi: { name: 'Delhi', lat: 28.61, lon: 77.21 },
  uttarakhand: { name: 'Dehradun, Uttarakhand', lat: 30.32, lon: 78.03 },
  westbengal: { name: 'Sundarbans, West Bengal', lat: 21.95, lon: 88.9 },
  punjab: { name: 'Moga–Ludhiana cropland, Punjab', lat: 30.75, lon: 75.6 },
};

// ---------------------------------------------------------------- helpers
async function cached(name, url, { json = false, headers = {} } = {}) {
  const file = join(CACHE, name);
  if (existsSync(file)) {
    const txt = await readFile(file, 'utf8');
    return json ? JSON.parse(txt) : txt;
  }
  let lastErr;
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'ne-ar-ebook-data/1.0', ...headers } });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${url}`);
      const txt = await res.text();
      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, txt);
      return json ? JSON.parse(txt) : txt;
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 1500 * attempt));
    }
  }
  throw lastErr;
}

const round = (x, d = 3) => (x == null || Number.isNaN(x) ? null : Math.round(x * 10 ** d) / 10 ** d);
const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const daysIn = (y, m) => new Date(Date.UTC(y, m, 0)).getUTCDate();

function summarise(points, { digits = 3, slopeDigits = 4 } = {}) {
  const trend = mannKendallSen(points);
  const first = points.slice(0, 10).map((p) => p.v);
  const last = points.slice(-10).map((p) => p.v);
  return {
    points: points.map((p) => ({ t: p.t, v: round(p.v, digits) })),
    trend: {
      ...trend,
      Z: round(trend.Z, 3),
      pValue: trend.pValue < 1e-4 ? '<0.0001' : round(trend.pValue, 4),
      kendallTau: round(trend.kendallTau, 3),
      senSlope: round(trend.senSlope, slopeDigits),
      senSlopeCI95: trend.senSlopeCI95.map((x) => round(x, slopeDigits)),
      varS: round(trend.varS, 1),
    },
    firstDecade: { from: points[0].t, to: points[Math.min(9, points.length - 1)].t, mean: round(mean(first), digits) },
    lastDecade: { from: points.at(-10).t, to: points.at(-1).t, mean: round(mean(last), digits) },
    latest: { t: points.at(-1).t, v: round(points.at(-1).v, digits) },
  };
}

// ---------------------------------------------------------- NASA POWER
async function power(key) {
  const { lat, lon } = LOCATIONS[key];
  const params = 'T2M,PRECTOTCORR,GWETROOT,AOD_55';
  const url =
    `https://power.larc.nasa.gov/api/temporal/monthly/point?parameters=${params}` +
    `&community=AG&longitude=${lon}&latitude=${lat}&start=${FIRST_YEAR}&end=${LAST_YEAR}&format=JSON`;
  const j = await cached(`power_${key}.json`, url, { json: true });
  const P = j.properties.parameter;

  const annual = (param, agg) => {
    const out = [];
    for (let y = FIRST_YEAR; y <= LAST_YEAR; y++) {
      const months = [];
      for (let m = 1; m <= 12; m++) {
        const v = P[param][`${y}${String(m).padStart(2, '0')}`];
        if (v == null || v === -999) break;
        months.push({ m, v });
      }
      if (months.length === 12) out.push({ t: y, v: agg(months, y) });
    }
    return out;
  };
  const avg = (ms) => mean(ms.map((x) => x.v));
  const total = (ms, y) => ms.reduce((s, x) => s + x.v * daysIn(y, x.m), 0); // mm/day -> mm/yr

  return {
    url,
    t2m: annual('T2M', avg),
    precip: annual('PRECTOTCORR', total),
    gwetroot: annual('GWETROOT', avg),
    aod: annual('AOD_55', avg),
  };
}

function anomalies(points) {
  const base = points.filter((p) => p.t >= BASELINE[0] && p.t <= BASELINE[1]).map((p) => p.v);
  const b = mean(base);
  return { baseline: round(b, 2), points: points.map((p) => ({ t: p.t, v: p.v - b })) };
}

// ------------------------------------------------- NOAA GML Mauna Loa CO2
async function co2() {
  const url = 'https://gml.noaa.gov/webdata/ccgg/trends/co2/co2_annmean_mlo.txt';
  const txt = await cached('co2_annmean_mlo.txt', url);
  const pts = txt
    .split('\n')
    .filter((l) => l.trim() && !l.startsWith('#'))
    .map((l) => l.trim().split(/\s+/).map(Number))
    .filter(([y]) => y >= FIRST_YEAR && y <= LAST_YEAR)
    .map(([y, v]) => ({ t: y, v }));
  return { url, points: pts };
}

// ---------------------------- NOAA LSA altimetry: Bay of Bengal sea level
async function seaLevel() {
  const url = 'https://www.star.nesdis.noaa.gov/socd/lsa/SeaLevelRise/slr/slr_sla_bob_free_ref_90.csv';
  const txt = await cached('slr_sla_bob_free_ref_90.csv', url);
  const byYear = new Map();
  for (const line of txt.split('\n')) {
    if (!line || line.startsWith('#') || line.startsWith('year')) continue;
    const cols = line.split(',');
    const t = Number(cols[0]);
    const vals = cols.slice(1).filter((c) => c.trim() !== '').map(Number);
    if (!vals.length) continue;
    const y = Math.floor(t);
    // overlapping missions at the same epoch are averaged
    (byYear.get(y) ?? byYear.set(y, []).get(y)).push(mean(vals));
  }
  const pts = [...byYear.entries()]
    .filter(([y]) => y >= 1993 && y <= LAST_YEAR) // 1992 and 2025 are partial years
    .map(([y, v]) => ({ t: y, v: mean(v) }))
    .sort((a, b) => a.t - b.t);
  return { url, points: pts };
}

// -------------------------------------- MODIS MOD13Q1 NDVI (ORNL DAAC API)
async function ndvi(key) {
  const { lat, lon } = LOCATIONS[key];
  const base = 'https://modis.ornl.gov/rst/api/v1/MOD13Q1';
  const datesJ = await cached(`modis_dates_${key}.json`, `${base}/dates?latitude=${lat}&longitude=${lon}`, {
    json: true,
    headers: { Accept: 'application/json' },
  });
  const dates = datesJ.dates
    .map((d) => d.modis_date)
    .filter((d) => {
      const y = Number(d.slice(1, 5));
      return y >= 2001 && y <= LAST_YEAR;
    });

  const values = new Map(); // year -> composite means
  for (let i = 0; i < dates.length; i += 10) {
    const chunk = dates.slice(i, i + 10);
    const url =
      `${base}/subset?latitude=${lat}&longitude=${lon}&band=250m_16_days_NDVI` +
      `&startDate=${chunk[0]}&endDate=${chunk.at(-1)}&kmAboveBelow=1&kmLeftRight=1`;
    const j = await cached(`modis_ndvi_${key}_${chunk[0]}.json`, url, {
      json: true,
      headers: { Accept: 'application/json' },
    });
    for (const s of j.subset) {
      const valid = s.data.filter((x) => x >= -2000); // -3000 = fill value
      if (!valid.length) continue;
      const y = Number(s.modis_date.slice(1, 5));
      (values.get(y) ?? values.set(y, []).get(y)).push(mean(valid) * 0.0001);
    }
    process.stdout.write('.');
  }
  process.stdout.write('\n');
  const pts = [...values.entries()]
    .filter(([, v]) => v.length >= 22)
    .map(([y, v]) => ({ t: y, v: mean(v) }))
    .sort((a, b) => a.t - b.t);
  return { url: `${base}/subset (ORNL DAAC MODIS Web Service)`, points: pts };
}

// ------------------------------------------------------------------ main
const POWER_META = {
  provider: 'NASA Langley Research Center — POWER Project',
  dataset: 'NASA POWER monthly point data (Agroclimatology community), v2',
  resolution: '0.5° × 0.625° (MERRA-2 grid)',
  landing: 'https://power.larc.nasa.gov/',
};

const result = { generatedAt: new Date().toISOString().slice(0, 10), baseline: BASELINE, locations: LOCATIONS, series: {} };

for (const key of Object.keys(LOCATIONS)) {
  console.log(`NASA POWER: ${key}`);
  const p = await power(key);
  const loc = LOCATIONS[key];

  const an = anomalies(p.t2m);
  result.series[`${key}_t2m`] = {
    location: key,
    variable: 'Air temperature at 2 m — annual mean anomaly',
    unit: '°C',
    ...POWER_META,
    sourceVariable: 'T2M (derived from MERRA-2 reanalysis)',
    coverage: `${p.t2m[0].t}–${p.t2m.at(-1).t}`,
    sourceUrl: p.url,
    note: `Anomaly relative to the ${BASELINE[0]}–${BASELINE[1]} mean (${an.baseline} °C) at ${loc.lat}° N, ${loc.lon}° E.`,
    baselineValue: an.baseline,
    ...summarise(an.points, { digits: 3, slopeDigits: 4 }),
  };

  if (key === 'uttarakhand' || key === 'punjab') {
    result.series[`${key}_precip`] = {
      location: key,
      variable: 'Annual precipitation (bias-corrected)',
      unit: 'mm yr⁻¹',
      ...POWER_META,
      sourceVariable: 'PRECTOTCORR (MERRA-2, bias-corrected with GPCP/CPC)',
      coverage: `${p.precip[0].t}–${p.precip.at(-1).t}`,
      sourceUrl: p.url,
      note: 'Annual total = Σ(monthly mean rate × days in month).',
      ...summarise(p.precip, { digits: 1, slopeDigits: 2 }),
    };
  }
  if (key === 'uttarakhand') {
    result.series[`${key}_gwetroot`] = {
      location: key,
      variable: 'Root-zone soil wetness — annual mean',
      unit: 'fraction (0–1)',
      ...POWER_META,
      sourceVariable: 'GWETROOT (MERRA-2 land surface)',
      coverage: `${p.gwetroot[0].t}–${p.gwetroot.at(-1).t}`,
      sourceUrl: p.url,
      note: '0 = completely dry, 1 = saturated. Used here as a water-stress indicator.',
      ...summarise(p.gwetroot, { digits: 4, slopeDigits: 5 }),
    };
  }
  if (key === 'delhi') {
    result.series[`${key}_aod`] = {
      location: key,
      variable: 'Aerosol optical depth at 550 nm — annual mean',
      unit: 'dimensionless',
      ...POWER_META,
      sourceVariable: 'AOD_55 (MERRA-2 aerosol reanalysis, assimilates MODIS AOD)',
      coverage: `${p.aod[0].t}–${p.aod.at(-1).t}`,
      sourceUrl: p.url,
      note: 'AOD is a column measure of particles (haze, dust, smoke). It is a proxy for particulate pollution, not a surface PM2.5 concentration.',
      ...summarise(p.aod, { digits: 3, slopeDigits: 4 }),
    };
  }
}

console.log('NOAA GML CO2');
const c = await co2();
result.series.global_co2 = {
  location: 'global',
  variable: 'Atmospheric CO₂ — annual mean, Mauna Loa Observatory',
  unit: 'ppm',
  provider: 'NOAA Global Monitoring Laboratory (Scripps / NOAA record)',
  dataset: 'Mauna Loa CO₂ annual mean data',
  sourceVariable: 'CO₂ dry-air mole fraction',
  resolution: 'Single station (19.5° N, 155.6° W) — global background',
  coverage: `${c.points[0].t}–${c.points.at(-1).t}`,
  sourceUrl: c.url,
  landing: 'https://gml.noaa.gov/ccgg/trends/',
  note: 'Well-mixed background CO₂. It is NOT a Delhi measurement and NOT an air-pollution indicator.',
  ...summarise(c.points, { digits: 2, slopeDigits: 3 }),
};

console.log('NOAA LSA sea level');
const s = await seaLevel();
result.series.westbengal_sla = {
  location: 'westbengal',
  variable: 'Mean sea-level anomaly — Bay of Bengal (annual mean)',
  unit: 'mm',
  provider: 'NOAA Laboratory for Satellite Altimetry (TOPEX/Poseidon, Jason-1/2/3, Sentinel-6MF)',
  dataset: 'NOAA LSA regional mean sea level time series — Bay of Bengal, seasonal signal removed',
  sourceVariable: 'Sea-level anomaly (no GIA correction)',
  resolution: 'Basin average, ±66° altimetry coverage',
  coverage: `${s.points[0].t}–${s.points.at(-1).t}`,
  sourceUrl: s.url,
  landing: 'https://www.star.nesdis.noaa.gov/socd/lsa/SeaLevelRise/',
  note: 'Basin-wide satellite altimetry. Local land subsidence in the Sundarbans delta adds to the relative rise felt on the coast and is not included. Altimetry data are provided by NOAA Laboratory for Satellite Altimetry.',
  ...summarise(s.points, { digits: 1, slopeDigits: 2 }),
};

console.log('MODIS NDVI (Punjab)');
const nd = await ndvi('punjab');
result.series.punjab_ndvi = {
  location: 'punjab',
  variable: 'NDVI — annual mean of 16-day composites',
  unit: 'NDVI (unitless, −1 to 1)',
  provider: 'NASA LP DAAC; subset via ORNL DAAC MODIS Web Service',
  dataset: 'MODIS/Terra Vegetation Indices 16-Day L3 Global 250 m (MOD13Q1, Collection 6.1)',
  sourceVariable: '250m_16_days_NDVI (scale 0.0001)',
  resolution: '250 m pixels, averaged over a ~2 × 2 km window',
  coverage: `${nd.points[0].t}–${nd.points.at(-1).t}`,
  sourceUrl: nd.url,
  landing: 'https://modis.ornl.gov/data/modis_webservice.html',
  note: 'Fill values removed; no per-pixel quality filtering applied. Annual mean spans both the rabi (wheat) and kharif (rice) seasons.',
  ...summarise(nd.points, { digits: 4, slopeDigits: 5 }),
};

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(result, null, 2));
console.log(`\nWrote ${OUT}`);
for (const [id, v] of Object.entries(result.series)) {
  const t = v.trend;
  console.log(
    `${id.padEnd(22)} n=${String(t.n).padStart(2)} ${v.coverage}  sen=${t.senSlope} ${v.unit}/yr  CI=[${t.senSlopeCI95}]  p=${t.pValue}  ${t.direction}`,
  );
}
