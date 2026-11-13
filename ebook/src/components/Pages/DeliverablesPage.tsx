import { BookOpen, Box, Globe2, Presentation, Workflow } from 'lucide-react'
import type { PageContext } from '../Book/BookPage'
import { LINKS, shortUrl } from '../../data/guide'
import { QR } from '../Visualizations/QRBlock'

const withQR = [
  {
    icon: Globe2,
    name: 'Website · Trend Detective',
    text: 'Pick a place and a variable, read the NASA data and run the trend test yourself.',
    url: LINKS.website,
  },
  {
    icon: Box,
    name: 'AR app (Android)',
    text: 'Place the 3D data models on your table and walk around 45 years of change.',
    url: LINKS.arApp,
    extra: { label: 'Web AR', url: LINKS.arWeb },
  },
  {
    icon: Workflow,
    name: 'Algorithm',
    text: 'The method step by step: from NASA data to a verdict. Code on GitHub.',
    url: LINKS.algorithm,
    extra: { label: 'Code', url: LINKS.code },
  },
]

export function DeliverablesPage({ ctx }: { ctx: PageContext }) {
  const qrSize = ctx.mode === 'reflow' ? 96 : 104
  return (
    <div className="pg">
      <header className="pg-head">
        <p className="kicker">1 · What we deliver</p>
        <h2>Everything NE-AR gives you</h2>
        <p className="standfirst">One question runs through all of it: is the change real? Scan a code with your phone camera to open each part.</p>
      </header>

      <ul className="deliver">
        {withQR.map((d) => (
          <li key={d.name} className="deliver-row">
            <QR url={d.url} label={d.name} size={qrSize} />
            <div>
              <p className="deliver-name">
                <d.icon size={13} strokeWidth={2} aria-hidden /> {d.name}
              </p>
              <p className="deliver-text">{d.text}</p>
              <a className="deliver-url" href={d.url} target="_blank" rel="noreferrer">
                {d.url.includes('dropbox') ? 'Download the app (APK)' : shortUrl(d.url)}
              </a>
              {d.extra && (
                <a className="deliver-url is-extra" href={d.extra.url} target="_blank" rel="noreferrer">
                  {d.extra.label}: {shortUrl(d.extra.url)}
                </a>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="deliver-more">
        <div>
          <p className="deliver-name">
            <BookOpen size={13} strokeWidth={2} aria-hidden /> E-book
          </p>
          <p className="deliver-text">You are reading it: the short guide to the project.</p>
          <a className="deliver-url" href={LINKS.ebook} target="_blank" rel="noreferrer">
            {shortUrl(LINKS.ebook)}
          </a>
        </div>
        <div>
          <p className="deliver-name">
            <Presentation size={13} strokeWidth={2} aria-hidden /> Project demo
          </p>
          <p className="deliver-text">The demo presentation of NE-AR.</p>
          {LINKS.demo ? (
            <a className="deliver-url" href={LINKS.demo} target="_blank" rel="noreferrer">
              {shortUrl(LINKS.demo)}
            </a>
          ) : (
            <p className="deliver-url is-soon">Link coming soon</p>
          )}
        </div>
      </div>
    </div>
  )
}
