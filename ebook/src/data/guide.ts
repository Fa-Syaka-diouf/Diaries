import cases from './generated/near-cases.json'
import modelHimalaya from '../assets/images/model-himalaya.webp'
import modelThar from '../assets/images/model-thar.webp'
import modelSundarbans from '../assets/images/model-sundarbans.webp'

/**
 * Every link printed or encoded as a QR code in the guide. Change them here
 * only. An empty string shows an honest "coming soon" instead of a code.
 */
export const LINKS = {
  website: 'https://vivivarm.github.io/NEAR/',
  /** Android app (APK), the same link as the QR code on the NE-AR website. */
  arApp: 'https://www.dropbox.com/scl/fi/et3p8otrjsk3ac27pc4bi/near_app.apk?rlkey=9e3yazl18ehz79r2jk7ebhppz&st=qiejoeoj&dl=0',
  arWeb: 'https://www.speaksprouts.com/delhiAR/',
  /** The method, step by step, on the website. */
  algorithm: 'https://vivivarm.github.io/NEAR/#about',
  code: 'https://github.com/vivivarm/NEAR',
  ebook: 'https://ne-ar-diaries-indo-gangetic.netlify.app',
  /** Project demo presentation: link to come. */
  demo: '',
}

export const shortUrl = (u: string) => u.replace(/^https?:\/\//, '').replace(/\/$/, '')

export type Point = { t: number; v: number }
export type CaseSeries = {
  name: string
  unit: string
  points: Point[]
  senSlope: number
  senSlopeCI95: number[]
  pValue: number
  intercept: number
}

const S = cases.series as Record<string, CaseSeries>
export const casesSource = cases.source
export const casesRetrieved = cases.retrieved

export type CaseId = 'himalaya' | 'thar' | 'sundarbans'

export type Case = {
  id: CaseId
  place: string
  where: string
  question: string
  /** Variable shown in the chart and on the AR model. */
  series: CaseSeries
  /** Decimal places for the per-decade rate. */
  dp: number
  color: string
  model: string
  answer: string
  next?: string
}

const perDecade = (s: CaseSeries, dp: number) => {
  const r = s.senSlope * 10
  return `${r > 0 ? '+' : r < 0 ? '−' : ''}${Math.abs(r).toFixed(dp)} ${s.unit} per decade`
}

export const formatP = (p: number) => (p < 0.001 ? 'p < 0.001' : `p = ${p.toFixed(p < 0.01 ? 3 : 2)}`)
export const isSignificant = (s: CaseSeries) => s.pValue < 0.05
export const rateText = (s: CaseSeries, dp: number) => perDecade(s, dp)

const himalaya = S.SNODP_himalaya
const tharT = S.T2M_thar
const tharNight = S.T2M_MIN_thar
const rain = S.PRECTOTCORR_sundarbans

export const CASES: Case[] = [
  {
    id: 'himalaya',
    place: 'Western Himalaya',
    where: 'Uttarakhand & Himachal Pradesh',
    question: 'Is the region storing less water and ice?',
    series: himalaya,
    dp: 1,
    color: '#5b6fd6',
    model: modelHimalaya,
    answer: `Snow depth has grown: ${perDecade(himalaya, 1)} (${formatP(himalaya.pValue)}). But winter snow is not stored ice.`,
    next: 'Next witness: NASA GRACE-FO, which weighs water and ice from space.',
  },
  {
    id: 'thar',
    place: 'Thar Desert',
    where: 'Rajasthan',
    question: 'Is the temperature increasing?',
    series: tharT,
    dp: 2,
    color: '#d1603d',
    model: modelThar,
    answer: `Not in the yearly average (${formatP(tharT.pValue)}). Nights are warming: ${perDecade(tharNight, 2)} (${formatP(tharNight.pValue)}).`,
  },
  {
    id: 'sundarbans',
    place: 'Sundarbans',
    where: 'West Bengal & Bangladesh',
    question: 'Is rainfall changing?',
    series: rain,
    dp: 2,
    color: '#1f9e8f',
    model: modelSundarbans,
    answer: `Yes, it is rising: ${perDecade(rain, 2)} (${formatP(rain.pValue)}).`,
  },
]

export const TEAM: [string, string][] = [
  ['Sanskriti Verma', 'Team lead'],
  ['Rishabh', 'Data & statistics'],
  ['Viviana', 'Website'],
  ['Sachchit', 'AR models'],
  ['Sajan', 'Mobile app'],
  ['Fa Syaka', 'E-book'],
  ['Jithin', 'Team member'],
  ['Prince Raj', 'Data validation'],
]
