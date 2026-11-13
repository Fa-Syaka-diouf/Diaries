import type { ComponentType } from 'react'
import type { PageContext } from '../Book/BookPage'
import { CoverPage } from './CoverPage'
import { DeliverablesPage } from './DeliverablesPage'
import { HowItWorksPage } from './HowItWorksPage'
import { ExamplesPage } from './ExamplesPage'
import { UseAppPage } from './UseAppPage'

export type PageDef = {
  number: number
  title: string
  kicker: string
  /** Running head printed in the page footer (none on the cover). */
  runningHead?: string
  hard?: boolean
  dark?: boolean
  Component: ComponentType<{ ctx: PageContext }>
}

/** The guide contains exactly five designed pages. */
export const PAGES: PageDef[] = [
  { number: 1, kicker: 'Cover', title: 'Three places, three questions', hard: true, dark: true, Component: CoverPage },
  { number: 2, kicker: '1 · What we deliver', title: 'Everything NE-AR gives you', runningHead: 'NE-AR · User guide', Component: DeliverablesPage },
  { number: 3, kicker: '2 · How it works', title: 'From NASA data to a verdict', runningHead: 'How it works', Component: HowItWorksPage },
  { number: 4, kicker: '3 · Our examples', title: 'Three places, three questions', runningHead: 'Himalaya · Thar · Sundarbans', Component: ExamplesPage },
  { number: 5, kicker: '4 · Try it', title: 'Use the AR app', runningHead: 'NE-AR · AR app', Component: UseAppPage },
]

export const TOTAL_PAGES = PAGES.length
