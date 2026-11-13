// Imports the three NE-AR case series and re-checks their trends.
//
// The yearly series come from the NE-AR Trend Detective website
// (https://vivivarm.github.io/NEAR/), which averages NASA POWER (MERRA-2)
// monthly data over every grid point inside each region box, 1981–2025.
// Export them from the site with a browser (see README), then run:
//
//   node scripts/import-cases.mjs path/to/site-scan.json
//
// The trend is recomputed here with our own Mann–Kendall / Sen code, so the
// e-book never shows a number it did not verify.
import fs from 'node:fs'
import { mannKendallSen } from './lib/trend.mjs'

const KEYS = ['SNODP_himalaya', 'T2M_thar', 'T2M_MIN_thar', 'PRECTOTCORR_sundarbans']

const input = process.argv[2]
if (!input) throw new Error('usage: node scripts/import-cases.mjs <site-scan.json>')
const site = JSON.parse(fs.readFileSync(input, 'utf8'))

const out = {
  source:
    'NE-AR Trend Detective website (vivivarm.github.io/NEAR): regional NASA POWER (MERRA-2) monthly data, averaged to yearly means, 1981–2025.',
  retrieved: new Date().toISOString().slice(0, 10),
  series: {},
}

for (const k of KEYS) {
  const v = site.r[k]
  const points = v.yearly.map(([t, val]) => ({ t, v: +val.toFixed(4) }))
  const m = mannKendallSen(points)
  // values are rounded to 4 decimals here, so allow a tiny difference
  const agree = Math.abs(m.senSlope - v.scan.slope) / Math.abs(v.scan.slope) < 1e-3 && Math.abs(m.pValue - v.scan.p) / v.scan.p < 0.05
  console.log(`${k}: Sen ${m.senSlope.toFixed(5)} ${v.meta.unit}/yr, p=${m.pValue.toExponential(2)} (site p=${v.scan.p.toExponential(2)}) ${agree ? 'OK' : 'MISMATCH'}`)
  if (!agree) process.exitCode = 1
  const res = points.map((p) => p.v - m.senSlope * p.t).sort((a, b) => a - b)
  const mid = res.length >> 1
  out.series[k] = {
    name: v.meta.name,
    unit: v.meta.unit,
    points,
    senSlope: m.senSlope,
    senSlopeCI95: m.senSlopeCI95,
    pValue: m.pValue,
    // Sen line passes through the median residual (Conover)
    intercept: res.length % 2 ? res[mid] : (res[mid - 1] + res[mid]) / 2,
  }
}

fs.mkdirSync('src/data/generated', { recursive: true })
fs.writeFileSync('src/data/generated/near-cases.json', JSON.stringify(out, null, 1) + '\n')
