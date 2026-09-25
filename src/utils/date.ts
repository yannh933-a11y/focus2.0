import type { FirstDayOfWeek, HourFormat } from '../types'

export const dateKey = (date: Date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export const parseDateKey = (key: string) => new Date(`${key}T12:00:00`)

export const addDays = (key: string, amount: number) => {
  const date = parseDateKey(key)
  date.setDate(date.getDate() + amount)
  return dateKey(date)
}

export const startOfWeekKey = (key: string, firstDay: FirstDayOfWeek = 1) => {
  const date = parseDateKey(key)
  const day = date.getDay()
  const diff = firstDay === 1 ? (day === 0 ? -6 : 1 - day) : -day
  date.setDate(date.getDate() + diff)
  return dateKey(date)
}

export const formatLongDate = (key: string) =>
  new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'long' }).format(parseDateKey(key))

export const formatWeekday = (key: string) =>
  new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(parseDateKey(key))

export const formatShortDay = (key: string) =>
  new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(parseDateKey(key)).replace('.', '')

export const formatCompactDate = (key: string) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(parseDateKey(key))

export const formatDayMonth = (key: string) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(parseDateKey(key)).replace('.', '').toUpperCase()

export const weekdayLabel = (key: string) => formatShortDay(key).slice(0, 3).toUpperCase()

export const minutesToLabel = (minutes: number) => {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h}h ${m}min` : `${h}h`
}

export const secondsToClock = (seconds: number) => {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return h > 0
    ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export const formatTime = (time: string, format: HourFormat = '24h') => {
  if (format === '24h') return time
  const [hours, minutes] = time.split(':').map(Number)
  const date = new Date(2020, 0, 1, hours, minutes)
  return new Intl.DateTimeFormat('pt-BR', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date)
}

export const taskDateTime = (date: string, time: string) => new Date(`${date}T${time}:00`).getTime()

export const differenceLabel = (date: string, time: string, now = Date.now()) => {
  const diff = Math.round((taskDateTime(date, time) - now) / 60000)
  if (diff > 0) return diff < 60 ? `Em ${diff} min` : `Em ${minutesToLabel(diff)}`
  if (diff < 0) return `${minutesToLabel(Math.abs(diff))} atrasada`
  return 'Agora'
}
