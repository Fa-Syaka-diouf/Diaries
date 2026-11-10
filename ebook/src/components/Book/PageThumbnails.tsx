import { memo } from 'react'
import { PAGE_H, PAGE_W } from '../../hooks/useBookLayout'
import { PAGES } from '../Pages/pageRegistry'
import { BookPage } from './BookPage'

type Props = { current: number[]; onSelect: (index: number) => void }

const THUMB_W = 132
const scale = THUMB_W / PAGE_W

/** Real miniatures of the five pages, rendered from the same components. */
export const PageThumbnails = memo(function PageThumbnails({ current, onSelect }: Props) {
  return (
    <div className="thumbs">
      {PAGES.map((p, i) => {
        const active = current.includes(i)
        const ctx = { mode: 'single' as const, scale, side: 'single' as const, isThumb: true }
        return (
          // A div with button semantics: the miniature page inside contains (inert) buttons,
          // which a real <button> may not.
          <div
            key={p.number}
            role="button"
            tabIndex={0}
            className={`thumb${active ? ' is-active' : ''}`}
            onClick={() => onSelect(i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(i)
              }
            }}
            aria-label={`Go to page ${p.number}: ${p.title}`}
            aria-current={active ? 'page' : undefined}
          >
            <span className="thumb-page" style={{ width: THUMB_W, height: Math.round(PAGE_H * scale) }} inert>
              <BookPage number={p.number} runningHead={p.runningHead} dark={p.dark} ctx={ctx}>
                <p.Component ctx={ctx} />
              </BookPage>
            </span>
            <span className="thumb-label">
              <strong>{p.number}</strong> {p.kicker}
            </span>
          </div>
        )
      })}
    </div>
  )
})
