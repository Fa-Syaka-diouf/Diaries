import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { formatP, getSeries, signed, type SeriesId } from '../../data/environmentalData'
import { seriesDisplay } from '../../data/seriesDisplay'

export function rateOf(id: SeriesId) {
  const s = getSeries(id)
  const d = seriesDisplay[id]
  const k = d.perDecade ? 10 : 1
  return {
    value: signed(s.trend.senSlope * k, d.rateDigits),
    lo: signed(s.trend.senSlopeCI95[0] * k, d.rateDigits),
    hi: signed(s.trend.senSlopeCI95[1] * k, d.rateDigits),
    unit: d.rateUnit,
  }
}

type Props = { id: SeriesId; color: string; compact?: boolean }

/** Compact result card: direction, rate, uncertainty, significance, period. */
export function FindingCard({ id, color, compact }: Props) {
  const s = getSeries(id)
  const d = seriesDisplay[id]
  const r = rateOf(id)
  const t = s.trend
  const Icon = !t.significant ? Minus : t.senSlope > 0 ? ArrowUpRight : ArrowDownRight
  return (
    <div className={`finding${t.significant ? ' is-sig' : ' is-ns'}${compact ? ' is-compact' : ''}`} style={{ ['--c' as string]: color }}>
      <div className="finding-head">
        <span className="finding-icon" aria-hidden>
          <Icon size={13} strokeWidth={2.4} />
        </span>
        <span className="finding-var">{d.short}</span>
      </div>
      <div className="finding-rate">
        <span className="num">{r.value}</span>
        <span className="finding-unit">{r.unit}</span>
      </div>
      <div className="finding-ci">
        95 % CI {r.lo} to {r.hi}
      </div>
      <div className="finding-meta">
        <span className={`badge${t.significant ? ' badge-sig' : ''}`}>{t.significant ? 'Significant trend' : 'No significant trend'}</span>
        <span>
          {formatP(t.pValue)} · {s.coverage} · n = {t.n}
        </span>
      </div>
    </div>
  )
}
