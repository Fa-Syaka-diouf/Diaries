import { PAGE_H, PAGE_W } from '../../hooks/useBookLayout'
import { PAGES } from '../Pages/pageRegistry'
import { BookPage } from './BookPage'
import { CASES, casesRetrieved, casesSource, formatP, LINKS, rateText } from '../../data/guide'

type Props = {
  /** Available width for one page, in CSS px. */
  width: number
  /** Print edition: fixed A5 page size. */
  print?: boolean
  notice?: string
}

/**
 * Fallback reading view: the five pages one below the other, plus a short
 * data note. Used when the reader asks for it, when the flip engine fails,
 * and as the print / PDF edition.
 */
export function ListView({ width, print, notice }: Props) {
  const reflow = !print && width < 480
  const scale = print ? 559 / PAGE_W : Math.min(1.25, width / PAGE_W)
  const mode = reflow ? ('reflow' as const) : ('single' as const)

  return (
    <div className={`list-view${print ? ' is-print' : ''}`}>
      {notice && <p className="list-notice">{notice}</p>}
      {PAGES.map((p) => {
        const ctx = { mode, scale: reflow ? 1 : scale, side: 'single' as const, isStatic: true }
        return (
          <section
            key={p.number}
            className="list-page"
            style={reflow ? undefined : { width: Math.round(PAGE_W * scale), height: Math.round(PAGE_H * scale) }}
            aria-label={`Page ${p.number}`}
          >
            <BookPage number={p.number} runningHead={p.runningHead} dark={p.dark} ctx={ctx}>
              <p.Component ctx={ctx} />
            </BookPage>
          </section>
        )
      })}
      <section className="list-appendix" aria-label="Data note">
        <h2>Data note</h2>
        <p>
          {casesSource} Retrieved {casesRetrieved}. Trends: Mann–Kendall two-sided test and Sen’s slope on yearly means, re-checked with the e-book’s own code.
        </p>
        <ul className="ref-list">
          {CASES.map((c) => (
            <li key={c.id}>
              <strong>{c.place}</strong> · {c.series.name}: {rateText(c.series, c.dp)}, {formatP(c.series.pValue)}
            </li>
          ))}
        </ul>
        <p>
          Method and code: <a href={LINKS.algorithm}>{LINKS.algorithm}</a> · <a href={LINKS.code}>{LINKS.code}</a>
        </p>
      </section>
    </div>
  )
}
