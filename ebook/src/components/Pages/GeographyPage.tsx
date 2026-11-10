import type { PageContext } from '../Book/BookPage'
import { locations } from '../../data/locations'
import { LocationMap } from '../Visualizations/LocationMap'
import { LocationIcon } from './LocationIcon'

export function GeographyPage({ ctx }: { ctx: PageContext }) {
  return (
    <div className="pg">
      <header className="pg-head">
        <p className="kicker">Chapter 1 · Place</p>
        <h2>Understanding the Indo-Gangetic Plains</h2>
        <p className="standfirst">
          Built by the Indus, Ganga and Brahmaputra, this alluvial plain is one of the most densely populated and intensively farmed regions on Earth. Four places,
          from the Himalayan headwaters to the delta, each carry one environmental question.
        </p>
      </header>

      <LocationMap compact={ctx.mode === 'reflow' && ctx.scale < 0.8} />

      <ul className="loc-cards">
        {locations.map((l) => (
          <li key={l.key} className="loc-card" style={{ ['--c' as string]: l.color }}>
            <div className="loc-thumb">
              <img src={l.image} alt="" loading="lazy" decoding="async" />
              <span className="loc-num">{l.index}</span>
            </div>
            <div className="loc-body">
              <p className="loc-theme">
                <LocationIcon icon={l.icon} size={11} /> {l.theme}
              </p>
              <h3>{l.name}</h3>
              <p className="loc-why">{l.why}</p>
              <p className="loc-coord">
                {l.site} · {l.lat.toFixed(2)}° N, {l.lon.toFixed(2)}° E
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
