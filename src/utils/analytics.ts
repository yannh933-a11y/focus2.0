import type { AppState, TaskInstance } from '../types'
import { addDays, dateKey } from './date'

export const tasksForDate = (tasks: TaskInstance[], day: string) => tasks.filter(t => t.date === day)

export const dayStats = (tasks: TaskInstance[], day: string) => {
  const list = tasksForDate(tasks, day)
  const required = list.filter(t => t.required)
  const completed = list.filter(t => t.completed)
  const requiredCompleted = required.filter(t => t.completed)
  const percent = list.length ? Math.round((completed.length / list.length) * 100) : 0
  const requiredPercent = required.length ? Math.round((requiredCompleted.length / required.length) * 100) : list.length ? percent : 0
  const studySeconds = list.filter(t => t.categoryId === 'study').reduce((sum, t) => sum + t.actualDurationSeconds, 0)
  const workouts = list.filter(t => t.categoryId === 'gym' && t.completed).length
  return { total: list.length, completed: completed.length, percent, requiredPercent, requiredTotal: required.length, studySeconds, workouts, completeRequired: required.length > 0 && requiredCompleted.length === required.length }
}

export const currentStreak = (state: AppState, today = dateKey(new Date())) => {
  let cursor = today
  let streak = 0
  let hasStarted = false
  for (let i = 0; i < 3650; i++) {
    const stats = dayStats(state.tasks, cursor)
    if (stats.requiredTotal === 0) {
      cursor = addDays(cursor, -1)
      continue
    }
    if (!hasStarted && cursor === today && !stats.completeRequired) {
      cursor = addDays(cursor, -1)
      continue
    }
    hasStarted = true
    if (!stats.completeRequired) break
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}

export const bestStreak = (state: AppState) => {
  const dates = state.tasks.map(t => t.date).sort()
  if (!dates.length) return 0
  let cursor = dates[0]
  const end = dates[dates.length - 1]
  let best = 0
  let current = 0
  let guard = 0
  while (cursor <= end && guard < 3650) {
    const stats = dayStats(state.tasks, cursor)
    if (stats.requiredTotal > 0) {
      current = stats.completeRequired ? current + 1 : 0
      best = Math.max(best, current)
    }
    cursor = addDays(cursor, 1)
    guard += 1
  }
  return best
}

export const rangeDays = (end: string, count: number) => Array.from({ length: count }, (_, i) => addDays(end, i - count + 1))
