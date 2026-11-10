import mapData from '../../data/generated/map-igp.json'
import baseImage from '../../assets/images/map-blue-marble.webp'
import { locations } from '../../data/locations'

type MapJson = {
  bbox: [number, number, number, number]
  width: number
  height: number
  standardParallel: number
  india: string
  neighbours: { name: string; d: string }[]
  states: Record<string, string>
  stateBorders: string[]
  rivers: { name: string; d: string }[]
}
const map = mapData as unknown as MapJson

// Same projection as scripts/prepare-assets.mjs: equirectangular, standard parallel 26.5° N.
const K = 60
const COS = Math.cos((map.standardParallel * Math.PI) / 180)
export const project = (lon: number, lat: number): [number, number] => [(lon - map.bbox[0]) * COS * K, (map.bbox[3] - lat) * K]

const labels: { text: string; lon: number; lat: number; kind: 'country' | 'water' | 'feature' }[] = [
  { text: 'PAKISTAN', lon: 73.6, lat: 29.6, kind: 'country' },
  { text: 'NEPAL', lon: 83.2, lat: 28.75, kind: 'country' },
  { text: 'CHINA', lon: 86.0, lat: 32.0, kind: 'country' },
  { text: 'BHUTAN', lon: 90.5, lat: 27.8, kind: 'country' },
  { text: 'BANGLADESH', lon: 89.2, lat: 24.2, kind: 'country' },
  { text: 'INDIA', lon: 79.0, lat: 23.2, kind: 'country' },
  { text: 'Bay of Bengal', lon: 88.0, lat: 20.6, kind: 'water' },
  { text: 'H I M A L A Y A', lon: 80.4, lat: 30.95, kind: 'feature' },
  { text: 'Ganga', lon: 82.6, lat: 25.55, kind: 'water' },
]

type Props = { compact?: boolean }

/**
 * The four study sites on NASA Blue Marble shaded relief, with Natural Earth
 * boundaries (India's official point of view) and the main rivers.
 */
export function LocationMap({ compact }: Props) {
  const W = map.width
  const H = map.height
  const scaleBarKm = 200
  const scaleBarPx = (scaleBarKm / 111.32) * K // 1° latitude ≈ 111.32 km
  const graticuleLon = [74, 78, 82, 86, 90]
  const graticuleLat = [22, 26, 30]

  return (
    <figure className="map-figure">
      <svg viewBox={`0 0 ${W} ${H}`} className="map-svg" role="img" aria-labelledby="map-title map-desc">
        <title id="map-title">Map of the Indo-Gangetic Plains with the four study sites</title>
        <desc id="map-desc">
          {locations.map((l) => `${l.index}. ${l.name} (${l.site}) at ${l.lat}° N, ${l.lon}° E — ${l.theme}.`).join(' ')}
        </desc>
        <image href={baseImage} x={0} y={0} width={W} height={H} preserveAspectRatio="none" />
        <rect width={W} height={H} fill="#071b33" opacity={0.18} />

        {map.neighbours.map((n) => (
          <path key={n.name} d={n.d} fill="#f2f5f8" fillOpacity={0.1} stroke="#ffffff" strokeOpacity={0.45} strokeWidth={1.4} />
        ))}
        <path d={map.india} fill="#ffffff" fillOpacity={0.12} stroke="#ffffff" strokeWidth={2.6} strokeOpacity={0.9} />
        {map.stateBorders.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#ffffff" strokeOpacity={0.25} strokeWidth={1} />
        ))}
        {locations.map((l) => (
          <path key={l.key} d={map.states[l.key]} fill={l.color} fillOpacity={0.42} stroke={l.color} strokeWidth={2.4} />
        ))}
        {map.rivers.map((r, i) => (
          <path key={i} d={r.d} fill="none" stroke="#7cc6d9" strokeWidth={2.2} strokeLinecap="round" opacity={0.9} />
        ))}

        {/* graticule ticks */}
        {graticuleLon.map((lon) => {
          const [x] = project(lon, 0)
          return (
            <g key={lon}>
              <line x1={x} x2={x} y1={0} y2={10} stroke="#fff" strokeOpacity={0.7} strokeWidth={1.4} />
              <text x={x} y={26} className="map-grid">{lon}°E</text>
            </g>
          )
        })}
        {graticuleLat.map((lat) => {
          const [, y] = project(0, lat)
          return (
            <g key={lat}>
              <line x1={0} x2={10} y1={y} y2={y} stroke="#fff" strokeOpacity={0.7} strokeWidth={1.4} />
              <text x={14} y={y + 6} className="map-grid" textAnchor="start">{lat}°N</text>
            </g>
          )
        })}

        {labels.map((lb) => {
          const [x, y] = project(lb.lon, lb.lat)
          return (
            <text key={lb.text} x={x} y={y} className={`map-label map-${lb.kind}`}>
              {lb.text}
            </text>
          )
        })}

        {locations.map((l) => {
          const [x, y] = project(l.lon, l.lat)
          return (
            <g key={l.key} transform={`translate(${x} ${y})`}>
              <circle r={30} fill={l.color} opacity={0.25} />
              <circle r={17} fill={l.color} stroke="#fff" strokeWidth={3.5} />
              <text y={6.5} className="map-marker-num">{l.index}</text>
              {!compact && (
                <text x={l.key === 'westbengal' ? -28 : 28} y={7} className="map-marker-label" textAnchor={l.key === 'westbengal' ? 'end' : 'start'}>
                  {l.name}
                </text>
              )}
            </g>
          )
        })}

        {/* scale bar and north arrow */}
        <g transform={`translate(34 ${H - 40})`}>
          <rect x={-10} y={-26} width={scaleBarPx + 20} height={44} rx={6} fill="#071b33" opacity={0.55} />
          <rect width={scaleBarPx / 2} height={7} fill="#fff" />
          <rect x={scaleBarPx / 2} width={scaleBarPx / 2} height={7} fill="none" stroke="#fff" strokeWidth={1.4} />
          <text x={0} y={-8} className="map-grid" textAnchor="start">0</text>
          <text x={scaleBarPx} y={-8} className="map-grid" textAnchor="end">{scaleBarKm} km</text>
        </g>
        <g transform={`translate(${W - 40} 52)`}>
          <circle r={22} fill="#071b33" opacity={0.55} />
          <path d="M0 -15 L7 7 L0 2 L-7 7 Z" fill="#fff" />
          <text y={-24} className="map-grid">N</text>
        </g>
      </svg>
      <figcaption className="fig-credit">
        Base: NASA Blue Marble shaded relief (GIBS). Boundaries & rivers: Natural Earth 1:10 m, India point of view. Equirectangular projection, standard parallel 26.5° N.
        Thumbnails below: conceptual illustrations by the NE-AR team, not photographs.
      </figcaption>
    </figure>
  )
}
