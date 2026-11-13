import type { PageContext } from '../Book/BookPage'
import coverImage from '../../assets/images/cover-black-marble.webp'
import logo from '../../assets/images/ne-ar-logo.webp'
import { CASES } from '../../data/guide'

export function CoverPage({ ctx }: { ctx: PageContext }) {
  return (
    <div className="pg cover">
      <img className="cover-img" src={coverImage} alt="" decoding="async" />
      <div className="cover-veil" aria-hidden />

      <header className="cover-top">
        <span className="cover-logo">
          <img src={logo} alt="NE-AR logo" />
        </span>
        <span className="cover-brand">
          <strong>NE-AR</strong>
          <span>Naturalists Explorer – Augmented Reality</span>
        </span>
        <span className="cover-edition">Trend Detective · user guide</span>
      </header>

      <div className="cover-title">
        <p className="cover-kicker">A five-page guide</p>
        <h1>
          Three places,
          <br />
          three questions
        </h1>
        <p className="cover-sub">Is the change real? 45 years of NASA data, in your hand.</p>
      </div>

      <div className="cover-bottom">
        <ol className="cover-cases">
          {CASES.map((c) => (
            <li key={c.id} style={{ ['--case' as string]: c.color }}>
              <strong>{c.place}</strong>
              <span>{c.question}</span>
            </li>
          ))}
        </ol>
        {!ctx.isThumb && (
          <p className="cover-credit">
            Cover: NASA VIIRS Black Marble (2016) via NASA GIBS. A NASA Space Apps Challenge team project, not a NASA publication and not endorsed by NASA.
          </p>
        )}
      </div>
    </div>
  )
}
