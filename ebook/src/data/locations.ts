import type { SeriesId } from './environmentalData'
import delhiImg from '../assets/images/thumb-delhi.webp'
import uttarakhandImg from '../assets/images/thumb-uttarakhand.webp'
import westbengalImg from '../assets/images/thumb-westbengal.webp'
import punjabImg from '../assets/images/thumb-punjab.webp'

export type LocationKey = 'delhi' | 'uttarakhand' | 'westbengal' | 'punjab'

export type StudyLocation = {
  key: LocationKey
  index: number
  name: string
  region: string
  site: string
  lat: number
  lon: number
  theme: string
  icon: 'wind' | 'thermometer' | 'waves' | 'sprout'
  color: string
  why: string
  /** Thumbnail cropped from the NE-AR team's illustrations (scripts/prepare-assets.mjs). */
  image: string
  series: SeriesId[]
}

// Coordinates are the analysis points used by scripts/fetch-data.mjs.
export const locations: StudyLocation[] = [
  {
    key: 'delhi',
    index: 1,
    name: 'Delhi',
    region: 'National Capital Territory',
    site: 'New Delhi',
    lat: 28.61,
    lon: 77.21,
    theme: 'CO₂ & air pollution',
    icon: 'wind',
    color: '#C8553D',
    why: 'A megacity at the heart of the plains, where winter haze from traffic, industry and crop-residue fires is trapped near the ground.',
    image: delhiImg,
    series: ['delhi_t2m', 'delhi_aod'],
  },
  {
    key: 'uttarakhand',
    index: 2,
    name: 'Uttarakhand',
    region: 'Himalayan state',
    site: 'Dehradun',
    lat: 30.32,
    lon: 78.03,
    theme: 'Temperature & water stress',
    icon: 'thermometer',
    color: '#168AAD',
    why: 'Headwaters of the Ganga. Warmer years change snow, springs and the rain-fed farming of the foothills.',
    image: uttarakhandImg,
    series: ['uttarakhand_t2m', 'uttarakhand_precip', 'uttarakhand_gwetroot'],
  },
  {
    key: 'westbengal',
    index: 3,
    name: 'West Bengal',
    region: 'Ganges delta',
    site: 'Sundarbans',
    lat: 21.95,
    lon: 88.9,
    theme: 'Sea-level rise',
    icon: 'waves',
    color: '#5B5F97',
    why: 'The Sundarbans, the world’s largest mangrove forest, sit barely above high tide on the Bay of Bengal.',
    image: westbengalImg,
    series: ['westbengal_sla', 'westbengal_t2m'],
  },
  {
    key: 'punjab',
    index: 4,
    name: 'Punjab',
    region: 'Upper Indus–Ganga plain',
    site: 'Moga–Ludhiana',
    lat: 30.75,
    lon: 75.6,
    theme: 'Vegetation & agriculture',
    icon: 'sprout',
    color: '#4C956C',
    why: 'One of India’s great wheat and rice granaries, irrigated largely from groundwater.',
    image: punjabImg,
    series: ['punjab_ndvi', 'punjab_precip', 'punjab_t2m'],
  },
]

export const locationByKey = Object.fromEntries(locations.map((l) => [l.key, l])) as Record<LocationKey, StudyLocation>
