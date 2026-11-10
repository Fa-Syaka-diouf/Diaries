import type { Point } from '../../data/environmentalData'

type Props = { points: Point[]; width: number; height: number; stroke: string; strokeWidth?: number; fill?: string; className?: string }

/** Minimal SVG sparkline drawn directly from a real series. */
export function Sparkline({ points, width, height, stroke, strokeWidth = 1.5, fill, className }: Props) {
  const xs = points.map((p) => p.t)
  const ys = points.map((p) => p.v)
  const [x0, x1] = [Math.min(...xs), Math.max(...xs)]
  const [y0, y1] = [Math.min(...ys), Math.max(...ys)]
  const sx = (t: number) => ((t - x0) / (x1 - x0 || 1)) * width
  const sy = (v: number) => height - ((v - y0) / (y1 - y0 || 1)) * height
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${sx(p.t).toFixed(1)},${sy(p.v).toFixed(1)}`).join('')
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className={className} aria-hidden>
      {fill && <path d={`${d}L${width},${height}L0,${height}Z`} fill={fill} />}
      <path d={d} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
