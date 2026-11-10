import type { SeriesId } from './environmentalData'

/** How each series is labelled and how its rate of change is expressed. */
export type SeriesDisplay = {
  short: string
  /** Unit shown on chart axes. */
  axisUnit: string
  /** Express Sen's slope per decade (×10) instead of per year. */
  perDecade: boolean
  rateUnit: string
  rateDigits: number
  valueDigits: number
  kind: 'line' | 'bar'
  /** Draw a zero reference line (anomalies). */
  zeroLine?: boolean
}

export const seriesDisplay: Record<SeriesId, SeriesDisplay> = {
  delhi_t2m: { short: 'Air temperature anomaly', axisUnit: '°C', perDecade: true, rateUnit: '°C / decade', rateDigits: 2, valueDigits: 2, kind: 'line', zeroLine: true },
  uttarakhand_t2m: { short: 'Air temperature anomaly', axisUnit: '°C', perDecade: true, rateUnit: '°C / decade', rateDigits: 2, valueDigits: 2, kind: 'line', zeroLine: true },
  westbengal_t2m: { short: 'Air temperature anomaly', axisUnit: '°C', perDecade: true, rateUnit: '°C / decade', rateDigits: 2, valueDigits: 2, kind: 'line', zeroLine: true },
  punjab_t2m: { short: 'Air temperature anomaly', axisUnit: '°C', perDecade: true, rateUnit: '°C / decade', rateDigits: 2, valueDigits: 2, kind: 'line', zeroLine: true },
  delhi_aod: { short: 'Aerosol optical depth (550 nm)', axisUnit: 'AOD', perDecade: true, rateUnit: 'AOD / decade', rateDigits: 3, valueDigits: 2, kind: 'line' },
  uttarakhand_precip: { short: 'Annual precipitation', axisUnit: 'mm', perDecade: true, rateUnit: 'mm / decade', rateDigits: 0, valueDigits: 0, kind: 'bar' },
  punjab_precip: { short: 'Annual precipitation', axisUnit: 'mm', perDecade: true, rateUnit: 'mm / decade', rateDigits: 0, valueDigits: 0, kind: 'bar' },
  uttarakhand_gwetroot: { short: 'Root-zone soil wetness', axisUnit: '0–1', perDecade: true, rateUnit: '/ decade', rateDigits: 3, valueDigits: 2, kind: 'line' },
  punjab_ndvi: { short: 'Vegetation greenness (NDVI)', axisUnit: 'NDVI', perDecade: true, rateUnit: 'NDVI / decade', rateDigits: 3, valueDigits: 3, kind: 'line' },
  westbengal_sla: { short: 'Sea-level anomaly, Bay of Bengal', axisUnit: 'mm', perDecade: false, rateUnit: 'mm / year', rateDigits: 1, valueDigits: 0, kind: 'line', zeroLine: true },
  global_co2: { short: 'Atmospheric CO₂ (Mauna Loa)', axisUnit: 'ppm', perDecade: false, rateUnit: 'ppm / year', rateDigits: 2, valueDigits: 0, kind: 'line' },
}
