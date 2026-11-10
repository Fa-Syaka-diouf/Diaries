import { useState } from 'react'
import type { PageContext } from '../Book/BookPage'
import { dataRetrieved } from '../../data/environmentalData'
import { AR_LAYERS, PhoneMockup, type ARLayer } from '../Visualizations/PhoneMockup'
import { QRBlock } from '../Visualizations/QRBlock'

const layerNote: Record<ARLayer, string> = {
  temperature: 'NASA GISS GISTEMP anomaly maps, 1884–2022 — drag the slider through time.',
  air: 'Real haze over the plains (Suomi NPP VIIRS) with Delhi’s MERRA-2 aerosol record.',
  vegetation: 'MODIS NDVI over Punjab’s fields, with its 2001–2024 record.',
  water: 'Root-zone soil wetness and rainfall at the Ganga headwaters.',
  sea: 'Satellite-altimetry sea level for the Bay of Bengal, 1993–2024.',
  future: 'IPCC AR6 scenario ranges placed where they matter most.',
}

export function ARConclusionPage({ ctx }: { ctx: PageContext }) {
  const [layer, setLayer] = useState<ARLayer>('sea')
  const interactive = !ctx.isThumb && !ctx.isStatic
  return (
    <div className="pg">
      <header className="pg-head">
        <p className="kicker">Chapter 4 · Experience</p>
        <h2>Experience the Changing Earth</h2>
      </header>

      <div className="ar-grid">
        <div className="ar-left">
          <PhoneMockup layer={layer} interactive={interactive} />
          <div className="ar-layers" role="group" aria-label="Environmental layer shown in the mock-up">
            {AR_LAYERS.map((l) => (
              <button key={l.key} type="button" className={`chip${l.key === layer ? ' is-active' : ''}`} aria-pressed={l.key === layer} onClick={() => setLayer(l.key)} disabled={!interactive}>
                {l.label}
              </button>
            ))}
          </div>
          <p className="ar-layer-note">{layerNote[layer]}</p>
        </div>

        <div className="ar-right">
          <p className="lede">
            Charts on a page ask readers to imagine. NE-AR lets them look: point a phone at a map or a table-top, and the same records from this book rise as layers over
            the real geography — temperature, haze, greenness, water and the sea.
          </p>
          <p>
            Each layer keeps its source, its period and its uncertainty attached, so the story stays honest when it becomes interactive. Scenario layers are always
            labelled as projections, never as observations.
          </p>
          <blockquote className="final">The plains have kept a diary for decades. Satellites let us read it — and the next pages are still ours to write.</blockquote>
          <QRBlock />
          <p className="project-info">
            <strong>NE-AR — Naturalists Explorer – Augmented Reality.</strong> A NASA Space Apps Challenge project. Data retrieved {dataRetrieved}. Phone screens are concept
            mock-ups of planned features, not screenshots.
          </p>
        </div>
      </div>

      <section className="credits">
        <p className="side-label">Data & credits</p>
        <ul>
          <li>
            <b>Data</b> NASA LaRC POWER (MERRA-2; Gelaro et al. 2017) · MODIS MOD13Q1 v6.1 (Didan 2021) via ORNL DAAC · NOAA GML Mauna Loa CO₂ · NOAA LSA altimetry.
          </li>
          <li>
            <b>Methods</b> Mann (1945); Kendall (1975); Sen (1968); Gilbert (1987).
          </li>
          <li>
            <b>Projections</b> IPCC AR6 WGI SPM & Ch. 9 (2021); Meinshausen et al. (2020).
          </li>
          <li>
            <b>Imagery</b> NASA GIBS (VIIRS Black Marble, Blue Marble, Suomi NPP VIIRS) · NASA GISS GISTEMP v4 · Natural Earth · illustrations by the NE-AR team.
          </li>
        </ul>
        <p className="credits-more">Full references with links: list view → data appendix.</p>
      </section>
    </div>
  )
}
