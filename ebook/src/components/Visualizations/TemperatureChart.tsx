import { CartesianGrid, Line, LineChart, ReferenceLine, Tooltip, XAxis, YAxis } from 'recharts'
import { Sized } from './EnvironmentalChart'
import { baselinePeriod, getSeries } from '../../data/environmentalData'
import { locations } from '../../data/locations'

type Props = { height: number; width?: number; quiet?: boolean }

const AXIS = { fontSize: 8.5, fill: '#5d6d7e', fontFamily: 'var(--font-sans)' }

/** Annual 2 m air-temperature anomalies at the four study points (same unit, same axis). */
export function TemperatureChart({ height, width, quiet }: Props) {
  const series = locations.map((l) => ({ l, s: getSeries(`${l.key}_t2m` as const) }))
  const years = series[0].s.points.map((p) => p.t)
  const rows = years.map((t, i) => Object.fromEntries([['t', t], ...series.map(({ l, s }) => [l.key, s.points[i]?.v])]))

  return (
    <figure className="chart" aria-label="Annual air temperature anomalies at the four study points, 1981–2024">
      <figcaption className="chart-cap">
        <span className="chart-title">Temperature anomaly, four sites</span>
        <span className="chart-unit">°C vs {baselinePeriod[0]}–{baselinePeriod[1]}</span>
      </figcaption>
      <div style={{ height }}>
        <Sized width={width} height={height}>
          <LineChart data={rows} margin={{ top: 4, right: 6, bottom: 0, left: -8 }} width={width} height={width ? height : undefined}>
            <CartesianGrid stroke="#e3e7ec" vertical={false} />
            <XAxis dataKey="t" type="number" domain={['dataMin', 'dataMax']} ticks={[1981, 1990, 2000, 2010, 2020]} tick={AXIS} tickLine={false} axisLine={{ stroke: '#c9d1da' }} />
            <YAxis tick={AXIS} tickLine={false} axisLine={false} width={34} tickFormatter={(v: number) => v.toFixed(1)} tickCount={5} />
            <ReferenceLine y={0} stroke="#8796a6" strokeWidth={0.8} />
            {!quiet && (
              <Tooltip
                isAnimationActive={false}
                cursor={{ stroke: '#9fb0c0', strokeWidth: 0.8 }}
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <div className="chart-tip">
                      <strong>{label}</strong>
                      {payload.map((p) => (
                        <span key={String(p.dataKey)} style={{ color: p.color }}>
                          {locations.find((l) => l.key === p.dataKey)?.name}: {Number(p.value) > 0 ? '+' : ''}
                          {Number(p.value).toFixed(2)} °C
                        </span>
                      ))}
                    </div>
                  ) : null
                }
              />
            )}
            {series.map(({ l }) => (
              <Line key={l.key} dataKey={l.key} stroke={l.color} strokeWidth={1.3} dot={false} isAnimationActive={false} activeDot={{ r: 2.5 }} />
            ))}
          </LineChart>
        </Sized>
      </div>
      <div className="chart-legend">
        {locations.map((l) => (
          <span key={l.key}>
            <i style={{ background: l.color }} />
            {l.name}
          </span>
        ))}
      </div>
      <p className="chart-source">NASA POWER (MERRA-2) · T2M annual means · 1981–2024</p>
    </figure>
  )
}
