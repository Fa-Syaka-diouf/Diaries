import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
  Maximize,
  Minimize,
  MoreHorizontal,
  Printer,
  Rows3,
  Volume2,
  VolumeX,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { useState, type ReactNode } from 'react'
import type { BookMode } from '../../hooks/useBookLayout'

type Props = {
  mode: BookMode
  visiblePages: number[]
  total: number
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
  onOpenPanel: (tab: 'contents' | 'thumbnails') => void
  zoom: number
  onZoom: (z: number) => void
  sound: boolean
  onSound: (on: boolean) => void
  fullscreen: boolean
  onFullscreen: () => void
  onPrint: () => void
  listView: boolean
  onListView: (on: boolean) => void
}

const ZOOMS = [0.8, 0.9, 1, 1.15, 1.3, 1.5]

function Btn({ label, onClick, disabled, active, children }: { label: string; onClick: () => void; disabled?: boolean; active?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      className={`tb-btn${active ? ' is-active' : ''}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={active}
      title={label}
    >
      {children}
    </button>
  )
}

export function pageLabel(visible: number[], total: number) {
  const nums = visible.filter((i) => i < total).map((i) => i + 1)
  if (visible.length && nums.length === 0) return 'Back'
  if (nums.length === 0) return '1'
  return nums.length > 1 ? `${nums[0]}–${nums.at(-1)}` : String(nums[0])
}

export function BookToolbar(p: Props) {
  const [more, setMore] = useState(false)
  const compact = p.mode === 'reflow'
  const last = Math.min(p.total, (p.visiblePages.at(-1) ?? 0) + 1)
  const progress = p.listView ? 1 : last / p.total
  const zi = ZOOMS.indexOf(p.zoom)
  const zoomAllowed = p.mode !== 'reflow' && !p.listView

  const secondary = (
    <>
      {zoomAllowed && (
        <div className="tb-group" role="group" aria-label="Zoom">
          <Btn label="Zoom out" onClick={() => p.onZoom(ZOOMS[Math.max(0, zi - 1)])} disabled={zi <= 0}>
            <ZoomOut size={17} />
          </Btn>
          <span className="tb-zoom" aria-live="polite">
            {Math.round(p.zoom * 100)}%
          </span>
          <Btn label="Zoom in" onClick={() => p.onZoom(ZOOMS[Math.min(ZOOMS.length - 1, zi + 1)])} disabled={zi >= ZOOMS.length - 1}>
            <ZoomIn size={17} />
          </Btn>
        </div>
      )}
      <Btn label={p.sound ? 'Turn page sound off' : 'Turn page sound on'} onClick={() => p.onSound(!p.sound)} active={p.sound}>
        {p.sound ? <Volume2 size={17} /> : <VolumeX size={17} />}
      </Btn>
      <Btn label={p.listView ? 'Back to the book' : 'Scrolling list view'} onClick={() => p.onListView(!p.listView)} active={p.listView}>
        {p.listView ? <BookOpen size={17} /> : <Rows3 size={17} />}
      </Btn>
      <Btn label="Print or save as PDF" onClick={p.onPrint}>
        <Printer size={17} />
      </Btn>
      <Btn label={p.fullscreen ? 'Exit full screen' : 'Full screen'} onClick={p.onFullscreen}>
        {p.fullscreen ? <Minimize size={17} /> : <Maximize size={17} />}
      </Btn>
    </>
  )

  return (
    <nav className={`toolbar${compact ? ' is-compact' : ''}`} aria-label="Reading controls">
      <div className="tb-progress" aria-hidden>
        <span style={{ transform: `scaleX(${progress})` }} />
      </div>
      <div className="tb-row">
        <div className="tb-group">
          <Btn label="Table of contents" onClick={() => p.onOpenPanel('contents')}>
            <List size={17} />
          </Btn>
          <Btn label="Page thumbnails" onClick={() => p.onOpenPanel('thumbnails')}>
            <LayoutGrid size={17} />
          </Btn>
        </div>

        <div className="tb-group tb-nav">
          <Btn label="Previous page" onClick={p.onPrev} disabled={!p.canPrev || p.listView}>
            <ChevronLeft size={20} />
          </Btn>
          <span className="tb-pages" aria-live="polite">
            <span className="sr-only">Page </span>
            <strong>{p.listView ? 'All' : pageLabel(p.visiblePages, p.total)}</strong>
            <span className="tb-of"> / {p.total}</span>
          </span>
          <Btn label="Next page" onClick={p.onNext} disabled={!p.canNext || p.listView}>
            <ChevronRight size={20} />
          </Btn>
        </div>

        {compact ? (
          <div className="tb-group tb-more">
            <Btn label="More reading options" onClick={() => setMore((m) => !m)} active={more}>
              <MoreHorizontal size={18} />
            </Btn>
            {more && (
              <div className="tb-popover" role="group" aria-label="More reading options" onClick={() => setMore(false)}>
                {secondary}
              </div>
            )}
          </div>
        ) : (
          <div className="tb-group">{secondary}</div>
        )}
      </div>
    </nav>
  )
}
