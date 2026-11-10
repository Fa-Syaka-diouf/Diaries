import { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import type { BookSnapshot, FlipBookHandle } from '@gullabs/react-flipbook'
import { DigitalBook, LEAF_COUNT } from './components/Book/DigitalBook'
import { BookToolbar } from './components/Book/BookToolbar'
import { NavigationPanel } from './components/Book/NavigationPanel'
import { BookLoader } from './components/Book/BookLoader'
import { ListView } from './components/Book/ListView'
import { BookErrorBoundary } from './components/Book/BookErrorBoundary'
import { TOTAL_PAGES } from './components/Pages/pageRegistry'
import { useBookLayout } from './hooks/useBookLayout'
import { playPageTurn } from './lib/pageSound'
import coverImage from './assets/images/cover-black-marble.webp'

function readStartPage() {
  const m = /^#page-(\d)$/.exec(window.location.hash)
  const n = m ? Number(m[1]) - 1 : 0
  return n >= 0 && n < TOTAL_PAGES ? n : 0
}

export default function App() {
  const [zoom, setZoom] = useState(1)
  const layout = useBookLayout(zoom)
  const bookRef = useRef<FlipBookHandle | null>(null)

  const [head, setHead] = useState(readStartPage)
  const [visible, setVisible] = useState<number[]>(() => [readStartPage()])
  const [panel, setPanel] = useState<'contents' | 'thumbnails' | null>(null)
  const [sound, setSound] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [listView, setListView] = useState(false)
  const [engineFailed, setEngineFailed] = useState(false)
  const [printing, setPrinting] = useState(false)
  const [assetsReady, setAssetsReady] = useState(false)
  const [bookReady, setBookReady] = useState(false)

  const soundRef = useRef(sound)
  useEffect(() => {
    soundRef.current = sound
  }, [sound])

  // ------------------------------------------------------------ loading
  useEffect(() => {
    const img = new Image()
    img.src = coverImage
    const minDelay = new Promise((r) => setTimeout(r, 700))
    Promise.allSettled([document.fonts.ready, img.decode(), minDelay]).then(() => setAssetsReady(true))
  }, [])
  // Never block reading if the engine never reports ready.
  useEffect(() => {
    const t = setTimeout(() => setBookReady(true), 4000)
    return () => clearTimeout(t)
  }, [])

  const onSnapshot = useCallback((s: BookSnapshot) => {
    setBookReady(true)
    setHead((prev) => {
      if (prev !== s.page && soundRef.current) playPageTurn()
      return s.page
    })
    setVisible(s.visiblePages.length ? s.visiblePages : [s.page])
    const hashPage = Math.min(s.page, TOTAL_PAGES - 1)
    history.replaceState(null, '', hashPage === 0 ? window.location.pathname : `#page-${hashPage + 1}`)
  }, [])

  // ------------------------------------------------------------ navigation
  const prev = useCallback(() => bookRef.current?.flipPrev(), [])
  const next = useCallback(() => bookRef.current?.flipNext(), [])
  const goTo = useCallback(
    (i: number) => {
      if (listView || engineFailed) {
        document.querySelectorAll('.list-page')[i]?.scrollIntoView({ behavior: 'smooth' })
        return
      }
      if (!bookRef.current?.flipToPage(i)) bookRef.current?.turnToPage(i)
    },
    [listView, engineFailed],
  )

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => undefined)
    else document.documentElement.requestFullscreen?.().catch(() => undefined)
  }, [])

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (panel || e.altKey || e.ctrlKey || e.metaKey) return
      const t = e.target as HTMLElement
      if (t.closest('input, textarea, select, [role=slider], [role=tablist]')) return
      const actions: Record<string, () => void> = {
        ArrowRight: next,
        PageDown: next,
        ArrowLeft: prev,
        PageUp: prev,
        Home: () => goTo(0),
        End: () => goTo(TOTAL_PAGES - 1),
        f: toggleFullscreen,
        F: toggleFullscreen,
      }
      const action = actions[e.key]
      if (!action) return
      e.preventDefault()
      action()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [next, prev, goTo, toggleFullscreen, panel])

  // ------------------------------------------------------------ forgiving swipes
  // The engine only treats gestures under 250 ms as swipes. On phones, a clear
  // horizontal swipe that was a little slower also turns the page, unless the
  // engine already turned it.
  const headRef = useRef(head)
  useEffect(() => {
    headRef.current = head
  }, [head])
  useEffect(() => {
    if (layout.mode === 'spread') return
    let start: { x: number; y: number; t: number; head: number } | null = null
    const down = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' || !(e.target as HTMLElement).closest?.('.flipbook')) return
      start = { x: e.clientX, y: e.clientY, t: performance.now(), head: headRef.current }
    }
    const up = (e: PointerEvent) => {
      const s = start
      start = null
      if (!s || e.pointerType === 'mouse') return
      const dx = e.clientX - s.x
      const dy = e.clientY - s.y
      const dt = performance.now() - s.t
      if (Math.abs(dx) < 50 || Math.abs(dy) > Math.abs(dx) * 0.6 || dt > 700) return
      window.setTimeout(() => {
        if (headRef.current !== s.head) return // the engine handled it
        if (dx < 0) bookRef.current?.flipNext()
        else bookRef.current?.flipPrev()
      }, 120)
    }
    window.addEventListener('pointerdown', down, true)
    window.addEventListener('pointerup', up, true)
    return () => {
      window.removeEventListener('pointerdown', down, true)
      window.removeEventListener('pointerup', up, true)
    }
  }, [layout.mode])

  // ------------------------------------------------------------ print edition
  useEffect(() => {
    const before = () => flushSync(() => setPrinting(true))
    const after = () => setPrinting(false)
    window.addEventListener('beforeprint', before)
    window.addEventListener('afterprint', after)
    return () => {
      window.removeEventListener('beforeprint', before)
      window.removeEventListener('afterprint', after)
    }
  }, [])
  const print = useCallback(() => {
    flushSync(() => setPrinting(true))
    // give charts one frame to lay out before the print dialog snapshots the page
    requestAnimationFrame(() => requestAnimationFrame(() => window.print()))
  }, [])

  const lastVisible = visible.at(-1) ?? head
  const showList = listView || engineFailed
  const listWidth = Math.min(layout.viewportW - 32, 640)

  return (
    <div className={`app mode-${layout.mode}`}>
      <BookLoader done={assetsReady && bookReady} />

      <main className={`stage${showList ? ' is-list' : ''}`} aria-label="Reading stage">
        {showList ? (
          <ListView
            width={listWidth}
            notice={engineFailed ? 'The page-turning view could not start in this browser, so the book is shown as a scrolling edition.' : undefined}
          />
        ) : (
          <BookErrorBoundary fallback={null} onError={() => setEngineFailed(true)}>
            <DigitalBook layout={layout} initialPage={head} visiblePages={visible} bookRef={bookRef} onSnapshot={onSnapshot} />
          </BookErrorBoundary>
        )}
      </main>

      {!showList && layout.mode !== 'reflow' && head === 0 && assetsReady && (
        <p className="open-hint" aria-hidden>
          Click the cover corner or press → to open the book
        </p>
      )}

      <BookToolbar
        mode={layout.mode}
        visiblePages={visible}
        total={TOTAL_PAGES}
        canPrev={head > 0}
        canNext={lastVisible < LEAF_COUNT - 1}
        onPrev={prev}
        onNext={next}
        onOpenPanel={setPanel}
        zoom={zoom}
        onZoom={setZoom}
        sound={sound}
        onSound={setSound}
        fullscreen={fullscreen}
        onFullscreen={toggleFullscreen}
        onPrint={print}
        listView={showList}
        onListView={(on) => !engineFailed && setListView(on)}
      />

      <NavigationPanel open={panel} onClose={() => setPanel(null)} onTab={setPanel} current={showList ? [] : visible} onSelect={goTo} />

      {printing && (
        <div className="print-edition" aria-hidden>
          <ListView width={559} print />
        </div>
      )}
    </div>
  )
}
