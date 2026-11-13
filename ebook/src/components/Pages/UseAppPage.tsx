import type { PageContext } from '../Book/BookPage'
import { LINKS, TEAM } from '../../data/guide'
import { QR } from '../Visualizations/QRBlock'
import model from '../../assets/images/model-sundarbans.webp'

const steps = [
  'Scan the code and install the NE-AR app on an Android phone.',
  'Open it and allow the camera.',
  'Point the phone at a table or the floor: the 3D model appears on it.',
  'Walk around it and compare the old years with the recent ones.',
]

export function UseAppPage({ ctx }: { ctx: PageContext }) {
  return (
    <div className="pg">
      <header className="pg-head">
        <p className="kicker">4 · Try it</p>
        <h2>Use the AR app</h2>
      </header>

      <div className="use-grid">
        <ol className="use-steps">
          {steps.map((s, i) => (
            <li key={s}>
              <span className="use-n">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
        <div className="use-qr">
          <QR url={LINKS.arApp} label="Download the NE-AR Android app" size={ctx.mode === 'reflow' ? 120 : 96} />
          <p>Get the app</p>
        </div>
      </div>

      <figure className="read-model">
        <img src={model} alt="NE-AR data model for the Sundarbans" loading="lazy" />
        <figcaption>
          <p className="side-label">How to read a model</p>
          <ul>
            <li>
              <b>One block</b> = one month of NASA data.
            </li>
            <li>
              <b>Back to front</b> = 1981 to 2025.
            </li>
            <li>
              <b>Taller, brighter</b> = further above normal for that month.
            </li>
          </ul>
        </figcaption>
      </figure>

      <section className="team">
        <p className="side-label">Team NE-AR</p>
        <ul>
          {TEAM.map(([n, r]) => (
            <li key={n}>
              <strong>{n}</strong> {r}
            </li>
          ))}
        </ul>
        <p className="team-note">
          NASA Space Apps Challenge project. An independent student project, not a NASA publication and not endorsed by NASA. Data: NASA POWER (MERRA-2), 1981–2025.
        </p>
      </section>
    </div>
  )
}
