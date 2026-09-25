import type { AppState, RoutineTask, TaskInstance } from '../../types'
import { parseDateKey } from '../../utils/date'
import { uid } from '../../utils/id'

export const routineApplies = (routine: RoutineTask, dayKey: string) => {
  if (!routine.active || dayKey < routine.startDate) return false
  if (routine.recurrence === 'daily') return true
  if (routine.recurrence === 'weekly') return routine.daysOfWeek.includes(parseDateKey(dayKey).getDay())
  return dayKey === routine.startDate
}

export const materializeDate = (state: AppState, dayKey: string): AppState => {
  const existing = new Set(state.tasks.filter(task => task.date === dayKey && task.routineId).map(task => task.routineId))
  const createdAt = new Date().toISOString()
  const additions = state.routines
    .filter(routine => routineApplies(routine, dayKey) && !existing.has(routine.id))
    .map<TaskInstance>(routine => ({
      id: uid(),
      routineId: routine.id,
      title: routine.title,
      categoryId: routine.categoryId,
      date: dayKey,
      time: routine.time,
      plannedDurationMinutes: routine.plannedDurationMinutes,
      actualDurationSeconds: 0,
      reminderMinutes: routine.reminderMinutes,
      required: routine.required,
      notes: routine.notes,
      timerEnabled: routine.timerEnabled,
      completed: false,
      completedAt: null,
      order: routine.order,
      createdAt,
      updatedAt: createdAt,
    }))

  return additions.length ? { ...state, tasks: [...state.tasks, ...additions] } : state
}
