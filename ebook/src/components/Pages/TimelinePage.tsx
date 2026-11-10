import { useId, useState, type KeyboardEvent } from 'react'
import type { PageContext } from '../Book/BookPage'
import { getSeries, type SeriesId } from '../../data/environmentalData'
import { locationByKey, type LocationKey } from '../../data/locations'
import { EnvironmentalChart } from '../Visualizations/EnvironmentalChart'
import { FindingCard, rateOf } from '../Visualizations/StatisticalResults'
import { HistoricalTimeline } from '../Visualizations/HistoricalTimeline'
import { ScenarioPanel } from '../Visualizations/ScenarioPanel'
import { TemperatureChart } from '../Visualizations/TemperatureChart'
import { LocationIcon } from './LocationIcon'

type TabKey = LocationKey | 'global'

const GLOBAL_COLOR = '#0b2545'

function tabConfig(key: TabKey): { charts: SeriesId[]; cards: SeriesId[]; note: string } {
  switch (key) {
    case 'delhi': {
      const a = rateOf('delhi_aod')
      return {
        charts: ['delhi_aod', 'delhi_t2m'],
        cards: ['delhi_aod', 'delhi_t2m'],
        note: `Haze has thickened: aerosol optical depth rose by ${a.value} per decade since 2001. AOD measures particles in the whole air column; it is not ground-level PM2.5, and no surface PM2.5 or NO₂ record is included in this edition. CO₂ is a global gas — see Global.`,
      }
    }
    case 'uttarakhand':
      return {
        charts: ['uttarakhand_gwetroot', 'uttarakhand_t2m'],
        cards: ['uttarakhand_precip', 'uttarakhand_gwetroot', 'uttarakhand_t2m'],
        note: 'At this ~50 km reanalysis cell, rainfall and root-zone soil wetness rose and annual temperature shows no significant trend. These records do not show a drying trend; spring flow, groundwater and heat extremes need finer local data.',
      }
    case 'westbengal': {
      const s = getSeries('westbengal_sla')
      const cm = ((s.lastDecade.mean - s.firstDecade.mean) / 10).toFixed(0)
      return {
        charts: ['westbengal_sla', 'westbengal_t2m'],
        cards: ['westbengal_sla', 'westbengal_t2m'],
        note: `The clearest signal in this book: the Bay of Bengal’s 2015–2024 mean sea level stands about ${cm} cm above 1993–2002. Sinking delta land adds to the rise felt on Sundarbans shores and is not included here.`,
      }
    }
    case 'punjab':
      return {
        charts: ['punjab_ndvi', 'punjab_precip'],
        cards: ['punjab_ndvi', 'punjab_precip', 'punjab_t2m'],
        note: 'Fields grew slightly greener and rainfall rose. Irrigation keeps NDVI high even in dry years, so greenness says nothing about the groundwater beneath — a limit of this indicator.',
      }
    case 'global': {
      const c = getSeries('global_co2')
      return {
        charts: ['global_co2'],
        cards: ['global_co2'],
        note: `CO₂ climbed from ${c.points[0].v.toFixed(0)} ppm in ${c.points[0].t} to ${c.latest.v.toFixed(0)} ppm in ${c.latest.t}. Annual mean temperature at the four grid points shows no significant trend; irrigation cooling, aerosol dimming and coarse grids are possible reasons, not tested here.`,
      }
    }
  }
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'delhi', label: 'Delhi' },
  { key: 'uttarakhand', label: 'Uttarakhand' },
  { key: 'westbengal', label: 'West Bengal' },
  { key: 'punjab', label: 'Punjab' },
  { key: 'global', label: 'Global' },
]

export function TimelinePage({ ctx }: { ctx: PageContext }) {
  const [tab, setTab] = useState<TabKey>('westbengal')
  const id = useId()
  const quiet = ctx.isThumb || ctx.isStatic
  // two columns of the 452 px text block, 14 px gutter
  const chartW = ctx.mode === 'reflow' ? undefined : 219
  const cfg = tabConfig(tab)
  const color = tab === 'global' ? GLOBAL_COLOR : locationByKey[tab].color

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
    e.preventDefault()
    e.stopPropagation()
    const i = TABS.findIndex((t) => t.key === tab)
    const n = TABS[(i + (e.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length]
    setTab(n.key)
    document.getElementById(`${id}-${n.key}`)?.focus()
  }

  return (
    <div className="pg">
      <header className="pg-head">
        <p className="kicker">Chapter 3 · Evidence</p>
        <h2>Reading Earth’s Environmental Story</h2>
      </header>

      <HistoricalTimeline />

      <div className="tabs" role="tablist" aria-label="Choose a place" onKeyDown={onKey}>
        {TABS.map((t) => {
          const sel = t.key === tab
          const c = t.key === 'global' ? GLOBAL_COLOR : locationByKey[t.key].color
          return (
            <button
              key={t.key}
              id={`${id}-${t.key}`}
              role="tab"
              type="button"
              aria-selected={sel}
              aria-controls={`${id}-panel`}
              tabIndex={sel ? 0 : -1}
              className={`tab${sel ? ' is-active' : ''}`}
              style={{ ['--c' as string]: c }}
              onClick={() => setTab(t.key)}
            >
              {t.key !== 'global' && <LocationIcon icon={locationByKey[t.key].icon} size={10} />}
              {t.label}
            </button>
          )
        })}
      </div>

      <section id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${tab}`} className="evidence">
        <div className="ev-charts">
          {cfg.charts.map((s) => (
            <EnvironmentalChart key={s} id={s} color={color} height={120} width={chartW} quiet={quiet} />
          ))}
          {tab === 'global' && <TemperatureChart height={120} width={chartW} quiet={quiet} />}
        </div>
        <div className={`ev-cards n-${cfg.cards.length}`}>
          {cfg.cards.map((s) => (
            <FindingCard key={s} id={s} color={color} compact={cfg.cards.length > 2} />
          ))}
        </div>
        <p className="ev-note">{cfg.note}</p>
      </section>

      <section className="future">
        <p className="future-head">
          <strong>Future pathways.</strong> Assessed global projections from IPCC AR6 (based on CMIP6 models), not local forecasts for these four places.
        </p>
        <ScenarioPanel />
        <p className="fig-credit">
          Observed: trend line dashed (Sen’s slope), dark if significant at p &lt; 0.05. Projections: IPCC AR6 WGI Table SPM.1, §B.5.3; CO₂ inputs Meinshausen et al. 2020.
          Downscaled regional projections (e.g. NASA NEX-GDDP-CMIP6) are not yet integrated.
        </p>
      </section>
    </div>
  )
}
