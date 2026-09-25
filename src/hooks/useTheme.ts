import { useEffect } from 'react'
import { useFocus } from '../context/FocusContext'

export function useTheme() {
  const { state } = useFocus()
  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: light)')
    const apply = () => {
      const light = state.settings.theme === 'light' || (state.settings.theme === 'system' && media.matches)
      document.documentElement.classList.toggle('light', light)
      document.querySelector('meta[name=\"theme-color\"]')?.setAttribute('content', light ? '#F4F6F9' : '#050505')
      localStorage.setItem('focus-theme', state.settings.theme)
    }
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [state.settings.theme])
}
