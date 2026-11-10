import { co2In2100, scenarioInfo, scenarios, seaLevel2100, warming } from '../../data/projections'

/** Range plot: best estimate (dot) and assessed range (bar) for each SSP. */
function RangeRows({
  rows,
  max,
  unit,
  ticks,
}: {
  rows: { label: string; sub?: string; color: string; best: number; range: [number, number] }[]
  max: number
  unit: string
  ticks: number[]
}) {
  const W = 200
  const rowH = 21
  const left = 0
  const x = (v: number) => left + (v / max) * W
  const H = rows.length * rowH + 16
  return (
    <svg viewBox={`0 0 ${W + 26} ${H}`} className="range-svg" aria-hidden>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={x(t)} x2={x(t)} y1={0} y2={H - 12} stroke="#e1e6eb" />
          <text x={x(t)} y={H - 2} className="range-tick">
            {t}
            {t === ticks.at(-1) ? ` ${unit}` : ''}
          </text>
        </g>
      ))}
      {rows.map((r, i) => {
        const y = i * rowH + 10
        return (
          <g key={r.label + (r.sub ?? '')}>
            <line x1={x(r.range[0])} x2={x(r.range[1])} y1={y} y2={y} stroke={r.color} strokeWidth={8} strokeLinecap="round" opacity={0.35} />
            <circle cx={x(r.best)} cy={y} r={5} fill={r.color} stroke="#fff" strokeWidth={1.4} />
            <text x={x(r.range[1]) + 6} y={y + 3} className="range-val">
              {r.best.toFixed(r.best < 1 ? 2 : 1)}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function ScenarioPanel() {
  const warmRows = scenarios.map((s) => {
    const w = warming[s].find((x) => x.period === '2081–2100')!
    return { label: s, color: scenarioInfo[s].color, best: w.best, range: w.range }
  })
  const seaRows = scenarios.map((s) => ({ label: s, color: scenarioInfo[s].color, best: seaLevel2100[s].median, range: seaLevel2100[s].range }))

  return (
    <div className="scenarios">
      <div className="sc-legend">
        {scenarios.map((s) => (
          <div key={s} className="sc-key">
            <i style={{ background: scenarioInfo[s].color }} />
            <span>
              <strong>{s}</strong> {scenarioInfo[s].label}
              <em>CO₂ ≈ {co2In2100[s]} ppm in 2100</em>
            </span>
          </div>
        ))}
      </div>
      <div className="sc-plot">
        <p className="sc-title">Global warming, 2081–2100</p>
        <p className="sc-sub">vs 1850–1900 · best estimate & very likely range</p>
        <RangeRows rows={warmRows} max={5} unit="°C" ticks={[0, 1, 2, 3, 4, 5]} />
      </div>
      <div className="sc-plot">
        <p className="sc-title">Global mean sea-level rise, 2100</p>
        <p className="sc-sub">vs 1995–2014 · median & likely range</p>
        <RangeRows rows={seaRows} max={1} unit="m" ticks={[0, 0.25, 0.5, 0.75, 1]} />
      </div>
    </div>
  )
}
