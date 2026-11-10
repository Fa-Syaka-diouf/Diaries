import { PAGES } from '../Pages/pageRegistry'

type Props = { current: number[]; onSelect: (index: number) => void }

/** Table of contents: direct page selection. */
export function PageNavigation({ current, onSelect }: Props) {
  return (
    <ol className="toc">
      {PAGES.map((p, i) => {
        const active = current.includes(i)
        return (
          <li key={p.number}>
            <button type="button" className={`toc-item${active ? ' is-active' : ''}`} onClick={() => onSelect(i)} aria-current={active ? 'page' : undefined}>
              <span className="toc-num">{String(p.number).padStart(2, '0')}</span>
              <span className="toc-text">
                <span className="toc-kicker">{p.kicker}</span>
                <span className="toc-title">{p.title}</span>
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
