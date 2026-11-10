import { Sprout, Thermometer, Waves, Wind } from 'lucide-react'
import type { StudyLocation } from '../../data/locations'

const icons = { wind: Wind, thermometer: Thermometer, waves: Waves, sprout: Sprout }

export function LocationIcon({ icon, size = 14 }: { icon: StudyLocation['icon']; size?: number }) {
  const I = icons[icon]
  return <I size={size} strokeWidth={2} aria-hidden />
}
