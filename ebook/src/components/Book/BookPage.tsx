import type { CSSProperties, ReactNode, Ref } from 'react'
import type { BookMode } from '../../hooks/useBookLayout'

export type PageSide = 'cover' | 'left' | 'right' | 'single'

export type PageContext = {
  mode: BookMode
  scale: number
  side: PageSide
  /** Miniature rendering for thumbnails: no interaction, no animation. */
  isThumb?: boolean
  /** Static list / print rendering. */
  isStatic?: boolean
}

type Props = {
  ref?: Ref<HTMLDivElement>
  number: number
  runningHead?: string
  ctx: PageContext
  hard?: boolean
  dark?: boolean
  children: ReactNode
}

/**
 * One leaf of the book. The flip engine owns the root element (position, clip,
 * paper), so all styling lives on the inner wrappers.
 */
export function BookPage({ ref, number, runningHead, ctx, hard, dark, children }: Props) {
  const { mode, scale, side } = ctx
  const canvasStyle = mode === 'reflow' ? undefined : ({ '--page-scale': scale } as CSSProperties)
  return (
    <div ref={ref} className="leaf" data-density={hard ? 'hard' : 'soft'}>
      <div className={`leaf-shell side-${side} mode-${mode}${dark ? ' is-dark' : ''}`}>
        <article
          className="page-canvas"
          style={canvasStyle}
          aria-label={`Page ${number}${runningHead ? ` — ${runningHead}` : ''}`}
        >
          {children}
          {runningHead && (
            <footer className="folio">
              <span className="folio-head">{runningHead}</span>
              <span className="folio-num">{number}</span>
            </footer>
          )}
        </article>
        <div className="gutter-shade" aria-hidden="true" />
      </div>
    </div>
  )
}
