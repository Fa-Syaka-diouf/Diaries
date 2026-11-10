import type { ComponentType } from 'react'
import type { PageContext } from '../Book/BookPage'
import { CoverPage } from './CoverPage'
import { GeographyPage } from './GeographyPage'
import { MethodologyPage } from './MethodologyPage'
import { TimelinePage } from './TimelinePage'
import { ARConclusionPage } from './ARConclusionPage'

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

/** The book contains exactly five designed pages. */
export const PAGES: PageDef[] = [
  { number: 1, kicker: 'Cover', title: 'Diaries of the Indo-Gangetic Plains', hard: true, dark: true, Component: CoverPage },
  {
    number: 2,
    kicker: 'Chapter 1 · Place',
    title: 'Understanding the Indo-Gangetic Plains',
    runningHead: 'Diaries of the Indo-Gangetic Plains',
    Component: GeographyPage,
  },
  {
    number: 3,
    kicker: 'Chapter 2 · Method',
    title: 'How Do We Detect Environmental Change?',
    runningHead: 'Data & methodology',
    Component: MethodologyPage,
  },
  {
    number: 4,
    kicker: 'Chapter 3 · Evidence',
    title: 'Reading Earth’s Environmental Story',
    runningHead: 'Past · Present · Future',
    Component: TimelinePage,
  },
  {
    number: 5,
    kicker: 'Chapter 4 · Experience',
    title: 'Experience the Changing Earth',
    runningHead: 'NE-AR · Augmented reality',
    Component: ARConclusionPage,
  },
]

export const TOTAL_PAGES = PAGES.length
