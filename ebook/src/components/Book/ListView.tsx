import { PAGE_H, PAGE_W } from '../../hooks/useBookLayout'
import { PAGES } from '../Pages/pageRegistry'
import { FindingsTable } from '../Visualizations/FindingsTable'
import { BookPage } from './BookPage'
import { references } from '../../data/references'

type Props = {
  /** Available width for one page, in CSS px. */
  width: number
  /** Print edition: fixed A5 page size. */
  print?: boolean
  notice?: string
}

/**
 * Fallback reading view: the five pages one below the other, plus a data
 * appendix. Used when the reader asks for it, when the flip engine fails, and
 * as the print / PDF edition.
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
      <section className="list-appendix" aria-label="Data appendix">
        <h2>Data appendix — every trend result in this book</h2>
        <p>
          Values computed by <code>scripts/fetch-data.mjs</code> from the datasets listed in each row. Annual means; Mann–Kendall two-sided test; Sen’s slope with
          95 % confidence interval (Gilbert 1987).
        </p>
        <FindingsTable />
        <h2>References and credits</h2>
        <ol className="ref-list">
          {references.map((r) => (
            <li key={r.id}>
              {r.text}{' '}
              {r.url && (
                <a href={r.url} rel="noreferrer">
                  {r.url.replace(/^https?:\/\//, '')}
                </a>
              )}
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
