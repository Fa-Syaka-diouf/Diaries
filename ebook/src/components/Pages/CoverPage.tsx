import type { PageContext } from '../Book/BookPage'
import coverImage from '../../assets/images/cover-black-marble.webp'
import logo from '../../assets/images/ne-ar-logo.webp'
import { getSeries } from '../../data/environmentalData'
import { co2In2100, scenarioInfo, scenarios } from '../../data/projections'

/** Observed CO₂ (1981–2024) and the three SSP end-points in 2100, on one time axis. */
function PastPresentFuture() {
  const co2 = getSeries('global_co2').points
  const W = 400
  const H = 74
  const t0 = 1981
  const t1 = 2100
  const v0 = 320
  const v1 = 900
  const x = (t: number) => ((t - t0) / (t1 - t0)) * W
  const y = (v: number) => H - ((v - v0) / (v1 - v0)) * H
  const d = co2.map((p, i) => `${i ? 'L' : 'M'}${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`).join('')
  const last = co2.at(-1)!
  return (
    <div className="ppf">
      <svg viewBox={`-6 -10 ${W + 52} ${H + 44}`} className="ppf-svg" aria-hidden>
        <defs>
          <linearGradient id="ppf-future" x1="0" x2="1">
            <stop offset="0" stopColor="#7cc6d9" stopOpacity="0.28" />
            <stop offset="1" stopColor="#7cc6d9" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x={x(2025)} y={-10} width={W - x(2025) + 46} height={H + 10} fill="url(#ppf-future)" />
        <path d={d} fill="none" stroke="#7cc6d9" strokeWidth={2} strokeLinecap="round" />
        <circle cx={x(last.t)} cy={y(last.v)} r={3.2} fill="#fff" />
        {scenarios.map((s) => (
          <g key={s}>
            <circle cx={x(2100)} cy={y(co2In2100[s])} r={3.2} fill={scenarioInfo[s].color} stroke="#fff" strokeWidth={1} />
            <text x={x(2100) + 7} y={y(co2In2100[s]) + 3} className="ppf-end">
              {co2In2100[s]}
            </text>
          </g>
        ))}
        <line x1={0} x2={W} y1={H + 8} y2={H + 8} stroke="#fff" strokeOpacity={0.5} />
        {[
          { t: 1981, l: 'PAST' },
          { t: 2024, l: 'PRESENT' },
          { t: 2100, l: 'FUTURE' },
        ].map((m) => (
          <g key={m.l} transform={`translate(${x(m.t)} ${H + 8})`}>
            <circle r={3.4} fill="#071b33" stroke="#fff" strokeWidth={1.4} />
            <text y={15} className="ppf-mark" textAnchor={m.t === 1981 ? 'start' : m.t === 2100 ? 'end' : 'middle'}>
              {m.l}
              <tspan x={0} dy="1.25em" className="ppf-year">
                {m.t}
              </tspan>
            </text>
          </g>
        ))}
      </svg>
      <p className="ppf-cap">
        Atmospheric CO₂ (ppm): observed at Mauna Loa 1981–{last.t} ({last.v.toFixed(0)} ppm), and where three IPCC scenarios lead by 2100.
      </p>
    </div>
  )
}

export function CoverPage({ ctx }: { ctx: PageContext }) {
  return (
    <div className="pg cover">
      <img className="cover-img" src={coverImage} alt="" decoding="async" />
      <div className="cover-veil" aria-hidden />

      <header className="cover-top">
        <span className="cover-logo">
          <img src={logo} alt="NE-AR logo" />
        </span>
        <span className="cover-brand">
          <strong>NE-AR</strong>
          <span>Naturalists Explorer – Augmented Reality</span>
        </span>
        <span className="cover-edition">NASA Space Apps Challenge · project book</span>
      </header>

      <div className="cover-title">
        <p className="cover-kicker">An interactive scientific book</p>
        <h1>
          Diaries of the
          <br />
          Indo-Gangetic Plains
        </h1>
        <p className="cover-sub">Stories from the Past, Present and Future</p>
      </div>

      <div className="cover-bottom">
        <PastPresentFuture />
        <p className="cover-intro">
          Seen from orbit at night, the plains between the Himalaya and the Bay of Bengal glow with the lights of hundreds of millions of people. This book follows four of
          their places through open satellite and climate records, tests what has truly changed, and asks where each path may lead.
        </p>
        {!ctx.isThumb && (
          <p className="cover-credit">
            Cover: NASA VIIRS Black Marble (2016) via NASA GIBS. A NASA Space Apps Challenge team project — not a NASA publication and not endorsed by NASA.
          </p>
        )}
      </div>
    </div>
  )
}
