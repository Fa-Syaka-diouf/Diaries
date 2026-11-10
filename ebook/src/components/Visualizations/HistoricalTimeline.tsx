import { observations } from '../../data/environmentalData'

/**
 * Past → Present → Future on a piecewise axis, with the real coverage of every
 * dataset used in the book drawn underneath.
 */
const SEGMENTS = [
  { key: 'past', label: 'Past', sub: 'historical observations', from: 1981, to: 2014, x0: 0, x1: 0.46 },
  { key: 'present', label: 'Present', sub: 'latest decade', from: 2015, to: 2024, x0: 0.46, x1: 0.66 },
  { key: 'future', label: 'Future', sub: 'IPCC AR6 scenarios', from: 2025, to: 2100, x0: 0.66, x1: 1 },
] as const

function pos(year: number) {
  for (const s of SEGMENTS) {
    if (year <= s.to + 1) {
      const f = (Math.max(year, s.from) - s.from) / (s.to + 1 - s.from)
      return s.x0 + f * (s.x1 - s.x0)
    }
  }
  return 1
}

const coverage = [
  { label: 'NASA POWER · temperature, rain, soil wetness', from: 1981, to: 2024, color: '#168aad' },
  { label: 'NOAA GML · CO₂ (shown from 1981)', from: 1981, to: 2024, color: '#0b2545' },
  { label: 'Satellite altimetry · sea level', from: Number(observations.westbengal_sla.coverage.slice(0, 4)), to: 2024, color: '#5b5f97' },
  { label: 'MERRA-2 · aerosol optical depth', from: Number(observations.delhi_aod.coverage.slice(0, 4)), to: 2024, color: '#c8553d' },
  { label: 'MODIS Terra · NDVI', from: Number(observations.punjab_ndvi.coverage.slice(0, 4)), to: 2024, color: '#4c956c' },
  { label: 'IPCC AR6 · SSP projections', from: 2021, to: 2100, color: '#d99a2b', projected: true },
]

export function HistoricalTimeline() {
  return (
    <div className="timeline" role="img" aria-label="Timeline: past observations 1981–2014, present 2015–2024, future projections to 2100, with dataset coverage">
      <div className="tl-segments">
        {SEGMENTS.map((s) => (
          <div key={s.key} className={`tl-seg tl-${s.key}`} style={{ left: `${s.x0 * 100}%`, width: `${(s.x1 - s.x0) * 100}%` }}>
            <span className="tl-label">{s.label}</span>
            <span className="tl-sub">
              {s.from}–{s.to}
              <span className="tl-desc"> · {s.sub}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="tl-axis">
        {[1981, 2000, 2015, 2024, 2050, 2100].map((y) => (
          <span key={y} className="tl-tick" style={{ left: `${pos(y) * 100}%` }}>
            {y}
          </span>
        ))}
      </div>
      <div className="tl-coverage">
        {coverage.map((c) => (
          <div key={c.label} className="tl-cov-row">
            <span
              className={`tl-bar${c.projected ? ' is-projected' : ''}`}
              style={{ left: `${pos(c.from) * 100}%`, width: `${(pos(c.to + 1) - pos(c.from)) * 100}%`, ['--c' as string]: c.color }}
            />
            <span className="tl-cov-label" style={{ left: `${pos(c.from) * 100}%` }}>
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
