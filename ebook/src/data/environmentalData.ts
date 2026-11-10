// Typed access to the observational record produced by scripts/fetch-data.mjs.
// Every value here comes from a downloaded dataset — nothing is hand-entered.
import raw from './generated/observations.json'

export type Point = { t: number; v: number }

export type Trend = {
  n: number
  start: number
  end: number
  S: number
  Z: number
  pValue: number | string
  kendallTau: number
  senSlope: number
  senSlopeCI95: [number, number]
  significant: boolean
  direction: 'increasing' | 'decreasing' | 'no significant trend'
}

export type Series = {
  location: string
  variable: string
  unit: string
  provider: string
  dataset: string
  sourceVariable: string
  resolution: string
  coverage: string
  sourceUrl: string
  landing: string
  note: string
  baselineValue?: number
  points: Point[]
  trend: Trend
  firstDecade: { from: number; to: number; mean: number }
  lastDecade: { from: number; to: number; mean: number }
  latest: Point
}

export type SeriesId =
  | 'delhi_t2m'
  | 'delhi_aod'
  | 'uttarakhand_t2m'
  | 'uttarakhand_precip'
  | 'uttarakhand_gwetroot'
  | 'westbengal_t2m'
  | 'westbengal_sla'
  | 'punjab_t2m'
  | 'punjab_precip'
  | 'punjab_ndvi'
  | 'global_co2'

const data = raw as unknown as {
  generatedAt: string
  baseline: [number, number]
  series: Record<SeriesId, Series>
}

export const observations = data.series
export const dataRetrieved = data.generatedAt
export const baselinePeriod = data.baseline

export function getSeries(id: SeriesId): Series {
  return data.series[id]
}

/** Sen's slope fit line: intercept = median(v − slope·t) (Conover 1980). */
export function senLine(s: Series): Point[] {
  const b = s.trend.senSlope
  const residuals = s.points.map((p) => p.v - b * p.t).sort((x, y) => x - y)
  const m = residuals.length
  const a = m % 2 ? residuals[(m - 1) / 2] : (residuals[m / 2 - 1] + residuals[m / 2]) / 2
  return s.points.map((p) => ({ t: p.t, v: a + b * p.t }))
}

/** Points with the trend line merged, for Recharts. */
export function withFit(s: Series) {
  const fit = senLine(s)
  return s.points.map((p, i) => ({ t: p.t, v: p.v, fit: fit[i].v }))
}

export function formatP(p: number | string): string {
  if (typeof p === 'string') return `p ${p.replace('<', '< ')}`
  if (p < 0.001) return 'p < 0.001'
  return `p = ${p.toFixed(3)}`
}

/** Format a number with a fixed number of significant decimals and an explicit sign. */
export function signed(x: number, digits: number): string {
  const s = x.toFixed(digits)
  return x > 0 ? `+${s}` : s.replace('-', '−')
}
