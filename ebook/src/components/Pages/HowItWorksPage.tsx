import { Box, Calendar, Database, Gauge, Satellite, Sigma } from 'lucide-react'
import type { PageContext } from '../Book/BookPage'

const steps = [
  { icon: Satellite, title: 'NASA data', text: 'Monthly NASA POWER records (MERRA-2), 1981–2025, for every grid point in the region.' },
  { icon: Database, title: 'One regional series', text: 'The grid points are averaged into one record per variable.' },
  { icon: Calendar, title: 'Yearly averages', text: 'Twelve months become one value, which removes the seasons.' },
  { icon: Sigma, title: 'Mann–Kendall test', text: 'Is the trend real? Significant when p < 0.05.' },
  { icon: Gauge, title: 'Sen’s slope', text: 'How fast is it changing? A rate per decade.' },
  { icon: Box, title: 'Verdict and AR model', text: 'Each month becomes a 3D block you can explore in the app.' },
]

export function HowItWorksPage(_props: { ctx: PageContext }) {
  return (
    <div className="pg">
      <header className="pg-head">
        <p className="kicker">2 · How it works</p>
        <h2>From NASA data to a verdict</h2>
        <p className="standfirst">The same six steps run for every place and every variable, on the website and in the app.</p>
      </header>

      <ol className="flow guide-flow">
        {steps.map((s, i) => (
          <li key={s.title} className="flow-step">
            <span className="flow-icon">
              <s.icon size={17} strokeWidth={2} aria-hidden />
            </span>
            <div>
              <p className="flow-title">
                <span className="flow-n">{i + 1}</span> {s.title}
              </p>
              <p className="flow-text">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="guide-stats">
        <div className="stat-box">
          <p className="stat-name">Mann–Kendall</p>
          <p>Compares every pair of years: is the later one higher or lower? Many more rises than falls means a real upward trend.</p>
        </div>
        <div className="stat-box">
          <p className="stat-name">Sen’s slope</p>
          <p>The median of all year-to-year slopes, so one extreme year cannot pull the rate around.</p>
        </div>
      </div>
    </div>
  )
}
