import { BookOpen, Briefcase, Dumbbell, Heart, Sparkles, UserRound } from 'lucide-react'
import type { Category } from '../../types'

const icons = { book: BookOpen, dumbbell: Dumbbell, user: UserRound, briefcase: Briefcase, heart: Heart, sparkles: Sparkles }

export function CategoryIcon({ icon, size = 18 }: { icon: Category['icon']; size?: number }) {
  const Icon = icons[icon]
  return <Icon size={size} strokeWidth={1.9} />
}
