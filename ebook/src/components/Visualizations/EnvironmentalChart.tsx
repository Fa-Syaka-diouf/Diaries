import { Bar, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ReactElement } from 'react'
import { getSeries, withFit, type SeriesId } from '../../data/environmentalData'
import { seriesDisplay } from '../../data/seriesDisplay'

type Props = {
  id: SeriesId
  color: string
  height: number
  /** Fixed width on the designed page canvas; omitted in reflow, where the chart follows its container. */
  width?: number
  /** Static rendering (thumbnails, print): no tooltip. */
  quiet?: boolean
  title?: string
}

const AXIS = { fontSize: 8.5, fill: '#5d6d7e', fontFamily: 'var(--font-sans)' }

/**
 * Fixed-size charts render synchronously (book pages, thumbnails, print);
 * without a width the chart follows its container (phone reflow).
 */
export function Sized({ width, height, children }: { width?: number; height: number; children: ReactElement }) {
  if (width) return children
  return (
    <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 300, height }}>
      {children}
    </ResponsiveContainer>
  )
}

/**
 * One variable, one unit, one axis: observed annual values plus the Sen's
 * slope trend line (dashed) estimated from the same data.
 */
export function EnvironmentalChart({ id, color, height, width, quiet, title }: Props) {
  const s = getSeries(id)
  const d = seriesDisplay[id]
  const rows = withFit(s)
  const fmt = (v: number) => (Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(d.valueDigits))
  const ticks = rows.filter((r) => r.t % 10 === 0 || r.t === rows[0].t).map((r) => r.t)

  return (
    <figure className="chart" aria-label={`${d.short}, ${s.coverage}, ${s.unit}`}>
      <figcaption className="chart-cap">
        <span className="chart-title">{title ?? d.short}</span>
        <span className="chart-unit">{d.axisUnit}</span>
      </figcaption>
      <div style={{ height }}>
        <Sized width={width} height={height}>
          <ComposedChart data={rows} margin={{ top: 4, right: 6, bottom: 0, left: -8 }} width={width} height={width ? height : undefined}>
            <CartesianGrid stroke="#e3e7ec" strokeDasharray="0" vertical={false} />
            <XAxis dataKey="t" type="number" domain={['dataMin', 'dataMax']} ticks={ticks} tick={AXIS} tickLine={false} axisLine={{ stroke: '#c9d1da' }} />
            <YAxis tick={AXIS} tickLine={false} axisLine={false} width={34} tickFormatter={fmt} domain={['auto', 'auto']} tickCount={height < 100 ? 3 : 5} />
            {d.zeroLine && <ReferenceLine y={0} stroke="#8796a6" strokeWidth={0.8} />}
            {!quiet && (
              <Tooltip
                cursor={{ stroke: '#9fb0c0', strokeWidth: 0.8 }}
                isAnimationActive={false}
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <div className="chart-tip">
                      <strong>{label}</strong>
                      <span>
                        {fmt(Number(payload.find((p) => p.dataKey === 'v')?.value))} {s.unit === 'dimensionless' ? '' : s.unit}
                      </span>
                    </div>
                  ) : null
                }
              />
            )}
            {d.kind === 'bar' ? (
              <Bar dataKey="v" fill={color} fillOpacity={0.55} isAnimationActive={false} />
            ) : (
              <Line dataKey="v" stroke={color} strokeWidth={1.6} dot={{ r: 1.4, strokeWidth: 0, fill: color }} isAnimationActive={false} activeDot={{ r: 3 }} />
            )}
            <Line
              dataKey="fit"
              stroke={s.trend.significant ? '#0b2545' : '#8796a6'}
              strokeWidth={1.2}
              strokeDasharray="4 3"
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </Sized>
      </div>
      <p className="chart-source">
        {s.dataset.split('(')[0].split('—')[0].trim()} · {s.coverage}
      </p>
    </figure>
  )
}
