import { useState } from 'react'
import mapData from '../../data/generated/map-igp.json'
import baseImage from '../../assets/images/map-blue-marble.webp'
import hazeImage from '../../assets/images/haze-viirs-2017-11-07.webp'
import { getSeries, signed, type Point } from '../../data/environmentalData'
import { locationByKey, type LocationKey } from '../../data/locations'
import { seaLevel2100 } from '../../data/projections'
import { rateOf } from './StatisticalResults'
import { project } from './LocationMap'
import { Sparkline } from './Sparkline'

export type ARLayer = 'temperature' | 'air' | 'vegetation' | 'water' | 'sea' | 'future'

export const AR_LAYERS: { key: ARLayer; label: string }[] = [
  { key: 'temperature', label: 'Temperature' },
  { key: 'air', label: 'Air' },
  { key: 'vegetation', label: 'Vegetation' },
  { key: 'water', label: 'Water' },
  { key: 'sea', label: 'Sea level' },
  { key: 'future', label: 'Futures' },
]

const GISTEMP_FIRST = 1884
const GISTEMP_LAST = 2022
const gistemp = (y: number) => `${import.meta.env.BASE_URL}gistemp/${y}.webp`

/** Visible width of the map inside the portrait phone screen, in map units. */
const SCREEN_ASPECT = 162 / 336
const VIEW_W = mapData.height * SCREEN_ASPECT

type PinProps = { loc: LocationKey; title: string; value: string; sub: string; series?: Point[] }

function Pin({ loc, title, value, sub, series }: PinProps) {
  const l = locationByKey[loc]
  const [x, y] = project(l.lon, l.lat)
  const w = 300
  const h = 156
  const below = y < 320
  const cy = below ? y + 70 : y - 70 - h
  return (
    <g>
      <circle cx={x} cy={y} r={34} fill={l.color} opacity={0.3}>
        <animate attributeName="r" values="22;44;22" dur="2.6s" repeatCount="indefinite" />
      </circle>
      <circle cx={x} cy={y} r={14} fill={l.color} stroke="#fff" strokeWidth={4} />
      <line x1={x} y1={y + (below ? 14 : -14)} x2={x} y2={below ? cy : cy + h} stroke="#fff" strokeWidth={2.5} />
      <g transform={`translate(${x - w / 2} ${cy})`}>
        <rect width={w} height={h} rx={18} fill="#071b33" fillOpacity={0.84} stroke="#7cc6d9" strokeOpacity={0.6} strokeWidth={2} />
        <text x={20} y={36} className="ar-pin-title">
          {title}
        </text>
        <text x={20} y={88} className="ar-pin-value">
          {value}
        </text>
        <text x={20} y={126} className="ar-pin-sub">
          {sub}
        </text>
        {series && (
          <foreignObject x={196} y={56} width={88} height={56}>
            <Sparkline points={series} width={88} height={52} stroke="#7cc6d9" strokeWidth={1.5} />
          </foreignObject>
        )}
      </g>
    </g>
  )
}

const LAYER_TARGET: Record<'vegetation' | 'water' | 'sea' | 'future', LocationKey> = {
  vegetation: 'punjab',
  water: 'uttarakhand',
  sea: 'westbengal',
  future: 'westbengal',
}

function MapLayer({ layer }: { layer: keyof typeof LAYER_TARGET }) {
  const W = mapData.width
  const H = mapData.height
  const target = locationByKey[LAYER_TARGET[layer]]
  const [tx] = project(target.lon, target.lat)
  const vx = Math.max(0, Math.min(W - VIEW_W, tx - VIEW_W / 2))
  const ndvi = getSeries('punjab_ndvi')
  const gw = getSeries('uttarakhand_gwetroot')
  const sla = getSeries('westbengal_sla')
  return (
    <svg viewBox={`${vx} 0 ${VIEW_W} ${H}`} preserveAspectRatio="xMidYMid slice" className="ar-map" aria-hidden>
      <image href={baseImage} x={0} y={0} width={W} height={H} preserveAspectRatio="none" />
      <rect width={W} height={H} fill="#071b33" opacity={0.25} />
      <path d={mapData.india} fill="none" stroke="#fff" strokeOpacity={0.7} strokeWidth={3} />
      {/* faint AR grid draped over the terrain */}
      {Array.from({ length: 14 }, (_, i) => (
        <line key={`h${i}`} x1={0} x2={W} y1={i * 60} y2={i * 60} stroke="#7cc6d9" strokeOpacity={0.14} strokeWidth={1.5} />
      ))}
      {Array.from({ length: 19 }, (_, i) => (
        <line key={`v${i}`} y1={0} y2={H} x1={i * 60} x2={i * 60} stroke="#7cc6d9" strokeOpacity={0.14} strokeWidth={1.5} />
      ))}
      {layer === 'vegetation' && (
        <Pin loc="punjab" title="NDVI · Punjab" value={ndvi.latest.v.toFixed(2)} sub={`${rateOf('punjab_ndvi').value} / decade`} series={ndvi.points} />
      )}
      {layer === 'water' && (
        <Pin loc="uttarakhand" title="Soil wetness" value={gw.latest.v.toFixed(2)} sub={`rain ${rateOf('uttarakhand_precip').value} mm/dec`} series={gw.points} />
      )}
      {layer === 'sea' && (
        <Pin
          loc="westbengal"
          title="Bay of Bengal sea level"
          value={`${signed((sla.lastDecade.mean - sla.firstDecade.mean) / 10, 1)} cm`}
          sub={`2015–24 vs 1993–2002`}
          series={sla.points}
        />
      )}
      {layer === 'future' && (
        <Pin loc="westbengal" title="Global sea, 2100" value={`${seaLevel2100['SSP1-2.6'].median}–${seaLevel2100['SSP3-7.0'].median} m`} sub="SSP1-2.6 → SSP3-7.0" />
      )}
    </svg>
  )
}

type Props = { layer: ARLayer; interactive: boolean }

/** Concept mock-up of the NE-AR phone experience (not an app screenshot). */
export function PhoneMockup({ layer, interactive }: Props) {
  const [year, setYear] = useState(GISTEMP_LAST)
  const aod = getSeries('delhi_aod')
  return (
    <div className="phone" aria-label="Concept mock-up of the NE-AR augmented-reality app">
      <div className="phone-screen">
        {layer === 'temperature' && (
          <div className="ar-photo">
            <img src={gistemp(year)} alt={`NASA GISTEMP surface temperature anomaly map, South Asia, ${year}`} loading="lazy" decoding="async" />
            <div className="ar-badge">{year}</div>
            <div className="ar-temp-scale" aria-hidden>
              <span>cooler</span>
              <i />
              <span>warmer</span>
            </div>
          </div>
        )}
        {layer === 'air' && (
          <div className="ar-photo">
            <img src={hazeImage} alt="Haze over the Indo-Gangetic Plains seen by Suomi NPP VIIRS on 7 November 2017" loading="lazy" decoding="async" style={{ objectPosition: '38% 50%' }} />
            <div className="ar-badge">7 Nov 2017</div>
            <div className="ar-air-card">
              <b>Delhi aerosol optical depth</b>
              <span className="ar-air-val">{aod.latest.v.toFixed(2)}</span>
              <span>
                {aod.latest.t} mean · {rateOf('delhi_aod').value} / decade
              </span>
            </div>
          </div>
        )}
        {layer !== 'temperature' && layer !== 'air' && <MapLayer layer={layer} />}

        <div className="ar-chrome" aria-hidden>
          <span className="ar-status">
            <b>NE-AR</b> · AR view
          </span>
          <span className="ar-reticle" />
        </div>

        {layer === 'temperature' && (
          <label className="ar-slider">
            <span className="sr-only">Year of the GISTEMP map</span>
            <input type="range" min={GISTEMP_FIRST} max={GISTEMP_LAST} value={year} step={1} disabled={!interactive} onChange={(e) => setYear(Number(e.target.value))} />
            <span className="ar-slider-ends">
              <span>{GISTEMP_FIRST}</span>
              <span>{GISTEMP_LAST}</span>
            </span>
          </label>
        )}
        <span className="ar-ribbon">Concept mock-up</span>
      </div>
      <span className="phone-notch" aria-hidden />
    </div>
  )
}
