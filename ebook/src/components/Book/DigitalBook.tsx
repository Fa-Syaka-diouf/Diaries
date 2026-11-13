import { useMemo, useState, type Ref } from 'react'
import HTMLFlipBook, { type BookSnapshot, type FlipBookHandle } from '@gullabs/react-flipbook'
import type { BookLayout } from '../../hooks/useBookLayout'
import { PAGES } from '../Pages/pageRegistry'
import { BackCover } from '../Pages/BackCover'
import { BookPage, type PageSide } from './BookPage'

/** Leaves in the engine: the five designed pages plus the back board. */
export const LEAF_COUNT = PAGES.length + 1
export const BACK_COVER = PAGES.length

type Props = {
  layout: BookLayout
  /** Page to open on when the engine (re)mounts. */
  initialPage: number
  /** Leaf indices currently on screen. */
  visiblePages: number[]
  bookRef: Ref<FlipBookHandle | null>
  onSnapshot: (s: BookSnapshot) => void
}

function sideOf(index: number, layout: BookLayout): PageSide {
  if (index === 0 || index === BACK_COVER) return 'cover'
  if (layout.mode !== 'spread') return 'single'
  return index % 2 === 1 ? 'left' : 'right'
}

export function DigitalBook({ layout, initialPage, visiblePages, bookRef, onSnapshot }: Props) {
  const { mode, pageW, pageH, scale } = layout

  // Page elements must keep a stable identity while a page is being turned.
  const leaves = useMemo(
    () => [
      ...PAGES.map((p, i) => {
        const ctx = { mode, scale, side: sideOf(i, layout) }
        return (
          <BookPage key={p.number} number={p.number} runningHead={p.runningHead} hard={p.hard} dark={p.dark} ctx={ctx}>
            <p.Component ctx={ctx} />
          </BookPage>
        )
      }),
      <BookPage key="back" number={0} hard dark ctx={{ mode, scale, side: 'cover' }}>
        <BackCover />
      </BookPage>,
    ],
    // `layout` keeps its identity until the geometry changes (the engine remounts then anyway)
    [mode, scale, layout],
  )

  const [turning, setTurning] = useState(false)
  const isSpread = mode === 'spread'
  const first = visiblePages[0] ?? 0
  const onCover = visiblePages.length <= 1 && first === 0
  const onBack = visiblePages.length <= 1 && first === BACK_COVER
  // A closed book sits centred; it slides as the cover starts to open, like a real book.
  const closed = (onCover || onBack) && !turning
  const shift = isSpread && closed ? (onCover ? -pageW / 2 : pageW / 2) : 0
  const frameW = isSpread ? pageW * 2 : pageW
  const read = Math.max(0, Math.min(1, first / (LEAF_COUNT - 1)))
  const open = isSpread && !onCover && !onBack

  return (
    <div className={`book-frame mode-${mode}${onCover ? ' is-closed' : ''}${onBack ? ' is-back' : ''}`} style={{ width: frameW, height: pageH }}>
      <div className="book-slide" style={{ transform: `translateX(${shift}px)` }}>
        {open && (
          <>
            <div className="page-edges edges-left" style={{ ['--edge' as string]: `${2 + read * 5}px` }} aria-hidden />
            <div className="page-edges edges-right" style={{ ['--edge' as string]: `${2 + (1 - read) * 5}px` }} aria-hidden />
          </>
        )}
        <div className="book-shadow" aria-hidden />
        <HTMLFlipBook
          key={`${mode}-${pageW}-${pageH}`}
          ref={bookRef}
          className="flipbook"
          width={pageW}
          height={pageH}
          sizing="fixed"
          initialPage={initialPage}
          usePortrait={!isSpread}
          hardCovers
          drawShadow
          maxShadowOpacity={0.42}
          flippingTime={850}
          flipOnClick="corners"
          foldCornerOnHover={!layout.isTouch}
          allowTouchScroll={mode === 'reflow'}
          respectInteractiveContent
          swipeDistance={mode === 'reflow' ? 40 : 30}
          pageBackground="#fbfaf6"
          useKeyboard={false}
          controls="auto"
          controlLabels={{ previous: 'Previous page', next: 'Next page' }}
          aria-label="NE-AR user guide: three places, three questions"
          roleDescription="book"
          liveRegionText={(_page, _count, info) => {
            const nums = info.pages.filter((i) => i < BACK_COVER).map((i) => i + 1)
            return nums.length ? `Page ${nums.join(' and ')} of ${PAGES.length}` : 'Back cover'
          }}
          onLoaded={onSnapshot}
          onPageChange={onSnapshot}
          onChangeState={({ state }) => setTurning(state === 'flipping' || state === 'user_fold')}
        >
          {leaves}
        </HTMLFlipBook>
        {open && <div className="spine" aria-hidden />}
      </div>
    </div>
  )
}
