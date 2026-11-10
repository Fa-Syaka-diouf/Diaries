import { BarChart3, Database, Filter, Lightbulb, Satellite, Sigma } from 'lucide-react'
import type { PageContext } from '../Book/BookPage'
import { formatP, getSeries } from '../../data/environmentalData'
import { EnvironmentalChart } from '../Visualizations/EnvironmentalChart'
import { rateOf } from '../Visualizations/StatisticalResults'

const steps = [
  { icon: Satellite, title: 'NASA Earth science data', text: 'Reanalysis and satellite records: MERRA-2 via NASA POWER, MODIS Terra.' },
  { icon: Database, title: 'Data collection', text: 'Scripted downloads from open APIs, archived with their source URLs.' },
  { icon: Filter, title: 'Data processing', text: 'Monthly → annual values; fill values removed; temperature as anomalies vs 1991–2020.' },
  { icon: BarChart3, title: 'Historical time series', text: 'One record per place and variable, 1981–2024 where available.' },
  { icon: Sigma, title: 'Statistical trend detection', text: 'Mann–Kendall test for significance; Sen’s slope for the rate.' },
  { icon: Lightbulb, title: 'Scientific interpretation', text: 'Results read against data limits, scale and known physical drivers.' },
]

const datasets = [
  { name: 'NASA POWER', detail: 'MERRA-2 · T2M, rain, soil wetness, AOD', tag: 'NASA' },
  { name: 'MODIS MOD13Q1', detail: 'Terra · NDVI 250 m, 16-day', tag: 'NASA' },
  { name: 'Mauna Loa CO₂', detail: 'NOAA GML · annual mean', tag: 'NOAA' },
  { name: 'Satellite altimetry', detail: 'NOAA LSA · Bay of Bengal', tag: 'NOAA' },
  { name: 'IPCC AR6 projections', detail: 'CMIP6-based · SSP scenarios', tag: 'IPCC' },
]

const planned = 'GLDAS soil moisture, surface PM2.5/NO₂ and downscaled CMIP6 (NEX-GDDP) are planned, not yet used.'

export function MethodologyPage({ ctx }: { ctx: PageContext }) {
  const quiet = ctx.isThumb || ctx.isStatic
  const chartW = ctx.mode === 'reflow' ? undefined : 218
  const noise = getSeries('uttarakhand_t2m')
  const signal = getSeries('westbengal_sla')
  const rn = rateOf('uttarakhand_t2m')
  const rs = rateOf('westbengal_sla')
  return (
    <div className="pg">
      <header className="pg-head">
        <p className="kicker">Chapter 2 · Method</p>
        <h2>How Do We Detect Environmental Change?</h2>
      </header>

      <div className="method-grid">
        <ol className="flow">
          {steps.map((s, i) => (
            <li key={s.title} className="flow-step">
              <span className="flow-icon">
                <s.icon size={14} strokeWidth={2} aria-hidden />
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

        <div className="method-side">
          <p className="side-label">Datasets in this book</p>
          <ul className="ds-list">
            {datasets.map((d) => (
              <li key={d.name}>
                <span className={`ds-tag tag-${d.tag.toLowerCase()}`}>{d.tag}</span>
                <span>
                  <strong>{d.name}</strong>
                  <em>{d.detail}</em>
                </span>
              </li>
            ))}
          </ul>
          <p className="ds-planned">{planned}</p>

          <div className="stat-box">
            <p className="stat-name">Mann–Kendall test</p>
            <p>
              Counts, for every pair of years, whether the later value is higher or lower. If rises clearly outnumber falls, the trend is <em>significant</em> (p &lt; 0.05).
            </p>
          </div>
          <div className="stat-box">
            <p className="stat-name">Sen’s slope</p>
            <p>The median of all year-to-year slopes: a rate of change that a single extreme year cannot drag around.</p>
          </div>
        </div>
      </div>

      <section className="signal">
        <p className="signal-head">
          <strong>Signal or noise?</strong> Year-to-year swings can hide or mimic change. Testing every record the same way tells them apart.
        </p>
        <div className="signal-grid">
          <div>
            <EnvironmentalChart id="uttarakhand_t2m" color="#168aad" height={84} width={chartW} quiet={quiet} title="Noise · Dehradun temperature" />
            <p className="signal-verdict ns">
              {rn.value} {rn.unit}, {formatP(noise.trend.pValue)} — no significant trend
            </p>
          </div>
          <div>
            <EnvironmentalChart id="westbengal_sla" color="#5b5f97" height={84} width={chartW} quiet={quiet} title="Signal · Bay of Bengal sea level" />
            <p className="signal-verdict sig">
              {rs.value} {rs.unit}, {formatP(signal.trend.pValue)} — significant rise
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
