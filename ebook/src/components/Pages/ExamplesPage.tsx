import type { PageContext } from '../Book/BookPage'
import { CASES, isSignificant, type Case } from '../../data/guide'

/** Yearly values as bars, with the Sen trend line on top. Drawn from the real series. */
function CaseChart({ c }: { c: Case }) {
  const { points, senSlope, intercept, name, unit } = c.series
  const W = 220
  const H = 46
  const ys = points.map((p) => p.v)
  const pad = (Math.max(...ys) - Math.min(...ys)) * 0.12
  const lo = Math.min(...ys) - pad
  const hi = Math.max(...ys) + pad
  const t0 = points[0].t
  const t1 = points.at(-1)!.t
  const bw = W / points.length
  const x = (t: number) => ((t - t0) / (t1 - t0)) * (W - bw) + bw / 2
  const y = (v: number) => H - ((v - lo) / (hi - lo)) * H
  return (
    <figure className="case-chart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={`Yearly ${name.toLowerCase()}, ${t0}–${t1}`}>
        {points.map((p) => (
          <rect key={p.t} x={x(p.t) - bw * 0.36} width={bw * 0.72} y={y(p.v)} height={H - y(p.v)} fill={c.color} opacity={0.42} />
        ))}
        <line
          x1={x(t0)}
          x2={x(t1)}
          y1={y(intercept + senSlope * t0)}
          y2={y(intercept + senSlope * t1)}
          stroke="var(--navy)"
          strokeWidth={1.6}
          strokeDasharray={isSignificant(c.series) ? undefined : '4 3'}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <figcaption>
        <span>
          {name}, {unit}, yearly
        </span>
        <span>
          {t0}–{t1}
        </span>
      </figcaption>
    </figure>
  )
}

export function ExamplesPage(_props: { ctx: PageContext }) {
  return (
    <div className="pg">
      <header className="pg-head">
        <p className="kicker">3 · Our examples</p>
        <h2>Three places, three questions</h2>
      </header>

      <div className="cases">
        {CASES.map((c) => (
          <article key={c.id} className="case" style={{ ['--case' as string]: c.color }}>
            <figure className="case-model">
              <img src={c.model} alt={`NE-AR 3D data model for ${c.place}: one block per month, 1981–2025`} loading="lazy" />
            </figure>
            <div className="case-body">
              <p className="case-place">
                <strong>{c.place}</strong> · {c.where}
              </p>
              <p className="case-q">{c.question}</p>
              <CaseChart c={c} />
              <p className="case-a">{c.answer}</p>
              {c.next && <p className="case-next">{c.next}</p>}
            </div>
          </article>
        ))}
      </div>

      <p className="fig-credit">
        3D models: previews of the NE-AR data models (one block per month; height and colour show distance from normal). Data: NASA POWER regional averages, 1981–2025.
        Solid line: significant trend; dashed: not significant.
      </p>
    </div>
  )
}
