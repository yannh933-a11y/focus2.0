import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { AppState, Category, RoutineTask, TaskDraft, TaskInstance, ThemeMode } from '../types'
import { loadState, saveState } from '../services/storage'
import { addDays, dateKey } from '../utils/date'
import { uid } from '../utils/id'
import { materializeDate } from '../services/routine'
import { elapsedTimerMs } from '../utils/timer'

const nowIso = () => new Date().toISOString()

const defaultCategories: Category[] = [
  { id: 'study', name: 'Estudos', icon: 'book', color: 'accent' },
  { id: 'gym', name: 'Academia', icon: 'dumbbell', color: 'success' },
  { id: 'personal', name: 'Pessoal', icon: 'user', color: 'neutral' },
]

const seedState = (): AppState => {
  const today = dateKey(new Date())
  const createdAt = nowIso()
  const routines: RoutineTask[] = [
    { id: uid(), title: 'Escola', categoryId: 'personal', time: '07:00', plannedDurationMinutes: 420, reminderMinutes: null, required: true, notes: '', recurrence: 'weekly', daysOfWeek: [1,2,3,4,5], startDate: today, active: true, order: 10, createdAt, updatedAt: createdAt },
    { id: uid(), title: 'Academia', categoryId: 'gym', time: '17:00', plannedDurationMinutes: 90, reminderMinutes: 5, required: true, notes: '', recurrence: 'weekly', daysOfWeek: [1,2,3,4,5], startDate: today, active: true, order: 30, createdAt, updatedAt: createdAt },
    { id: uid(), title: 'Estudo focado', categoryId: 'study', time: '15:30', plannedDurationMinutes: 60, reminderMinutes: 5, required: true, notes: '', recurrence: 'weekly', daysOfWeek: [1,2,4,5], startDate: today, active: true, order: 20, createdAt, updatedAt: createdAt },
  ]

  return {
    version: 2,
    categories: defaultCategories,
    routines,
    tasks: [],
    studySessions: [],
    goals: { weeklyStudyMinutes: 420, weeklyWorkouts: 5, minimumRoutinePercent: 85, streakTarget: 30 },
    settings: {
      theme: 'dark', notificationsEnabled: false, defaultReminderMinutes: 5,
      firstDayOfWeek: 1, hourFormat: '24h', showDuration: true, showCategories: true,
    },
    timer: { taskId: null, startedAt: null, accumulatedMs: 0, paused: true },
    lastOpenDate: today,
  }
}

const migrateState = (saved: AppState): AppState => ({
  ...saved,
  version: 2,
  categories: Array.isArray(saved.categories) && saved.categories.length ? saved.categories : defaultCategories,
  routines: (saved.routines ?? []).map((r, index) => ({ ...r, order: r.order ?? (index + 1) * 10 })),
  tasks: (saved.tasks ?? []).map((t, index) => ({ ...t, order: t.order ?? (index + 1) * 10 })),
  studySessions: saved.studySessions ?? [],
  goals: saved.goals ?? { weeklyStudyMinutes: 420, weeklyWorkouts: 5, minimumRoutinePercent: 85, streakTarget: 30 },
  settings: {
    theme: saved.settings?.theme ?? 'dark',
    notificationsEnabled: saved.settings?.notificationsEnabled ?? false,
    defaultReminderMinutes: saved.settings?.defaultReminderMinutes ?? 5,
    firstDayOfWeek: saved.settings?.firstDayOfWeek ?? 1,
    hourFormat: saved.settings?.hourFormat ?? '24h',
    showDuration: saved.settings?.showDuration ?? true,
    showCategories: saved.settings?.showCategories ?? true,
  },
  timer: saved.timer ?? { taskId: null, startedAt: null, accumulatedMs: 0, paused: true },
  lastOpenDate: saved.lastOpenDate || dateKey(new Date()),
})


interface FocusContextValue {
  state: AppState
  hydrated: boolean
  today: string
  ensureDate: (key: string) => void
  addTask: (draft: TaskDraft) => void
  updateTask: (taskId: string, draft: Partial<TaskDraft>, scope?: 'instance' | 'all') => void
  deleteTask: (taskId: string, scope?: 'instance' | 'all') => void
  duplicateTask: (taskId: string) => void
  moveTask: (taskId: string, direction: -1 | 1) => void
  toggleComplete: (taskId: string) => void
  addCategory: (name: string, icon: Category['icon']) => void
  updateCategory: (id: string, patch: Partial<Category>) => void
  deleteCategory: (id: string) => void
  updateGoals: (patch: Partial<AppState['goals']>) => void
  updateSettings: (patch: Partial<AppState['settings']>) => void
  updateRoutine: (id: string, patch: Partial<RoutineTask>) => void
  deleteRoutine: (id: string) => void
  setTheme: (theme: ThemeMode) => void
  startTimer: (taskId: string) => void
  pauseTimer: () => void
  resumeTimer: () => void
  finishTimer: () => void
  importBackup: (incoming: AppState) => void
  resetAll: () => void
}

const FocusContext = createContext<FocusContextValue | null>(null)

export function FocusProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(() => seedState())
  const [hydrated, setHydrated] = useState(false)
  const today = dateKey(new Date())
  const persistTimer = useRef<number | null>(null)

  useEffect(() => {
    loadState().then(saved => {
      let next = saved ? migrateState(saved) : seedState()
      let cursor = next.lastOpenDate || today
      let guard = 0
      while (cursor <= today && guard < 1000) {
        next = materializeDate(next, cursor)
        cursor = addDays(cursor, 1)
        guard += 1
      }
      next = materializeDate(next, today)
      next.lastOpenDate = today
      setState(next)
      setHydrated(true)
    }).catch(() => {
      setState(materializeDate(seedState(), today))
      setHydrated(true)
    })
  }, [])

  useEffect(() => {
    if (!hydrated) return
    const rollDay = () => setState(prev => {
      const current = dateKey(new Date())
      if (current === prev.lastOpenDate) return prev
      let next = prev
      let cursor = addDays(prev.lastOpenDate, 1)
      let guard = 0
      while (cursor <= current && guard < 1000) {
        next = materializeDate(next, cursor)
        cursor = addDays(cursor, 1)
        guard += 1
      }
      return { ...next, lastOpenDate: current }
    })
    const id = window.setInterval(rollDay, 60000)
    document.addEventListener('visibilitychange', rollDay)
    return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', rollDay) }
  }, [hydrated])

  useEffect(() => {
    if (!hydrated) return
    if (persistTimer.current) window.clearTimeout(persistTimer.current)
    persistTimer.current = window.setTimeout(() => { void saveState(state) }, 120)
    return () => { if (persistTimer.current) window.clearTimeout(persistTimer.current) }
  }, [state, hydrated])

  const ensureDate = useCallback((key: string) => setState(prev => materializeDate(prev, key)), [])

  const addTask = useCallback((draft: TaskDraft) => {
    const stamp = nowIso()
    setState(prev => {
      const nextOrder = Math.max(0, ...prev.tasks.filter(t => t.date === draft.date).map(t => t.order)) + 10
      if (draft.recurrence === 'none') {
        return { ...prev, tasks: [...prev.tasks, {
          id: uid(), routineId: null, title: draft.title.trim(), categoryId: draft.categoryId, date: draft.date,
          time: draft.time, plannedDurationMinutes: draft.plannedDurationMinutes, actualDurationSeconds: 0,
          reminderMinutes: draft.reminderMinutes, required: draft.required, notes: draft.notes, completed: false,
          completedAt: null, order: nextOrder, createdAt: stamp, updatedAt: stamp,
        }] }
      }
      const nextRoutineOrder = Math.max(0, ...prev.routines.map(r => r.order)) + 10
      const routine: RoutineTask = {
        id: uid(), title: draft.title.trim(), categoryId: draft.categoryId, time: draft.time,
        plannedDurationMinutes: draft.plannedDurationMinutes, reminderMinutes: draft.reminderMinutes,
        required: draft.required, notes: draft.notes, recurrence: draft.recurrence,
        daysOfWeek: draft.recurrence === 'daily' ? [0,1,2,3,4,5,6] : draft.daysOfWeek,
        startDate: draft.date, active: true, order: nextRoutineOrder, createdAt: stamp, updatedAt: stamp,
      }
      return materializeDate({ ...prev, routines: [...prev.routines, routine] }, draft.date)
    })
  }, [])

  const updateTask = useCallback((taskId: string, draft: Partial<TaskDraft>, scope: 'instance' | 'all' = 'instance') => {
    setState(prev => {
      const target = prev.tasks.find(t => t.id === taskId)
      if (!target) return prev
      const updatedAt = nowIso()
      const sharedPatch = {
        title: draft.title,
        categoryId: draft.categoryId,
        time: draft.time,
        plannedDurationMinutes: draft.plannedDurationMinutes,
        reminderMinutes: draft.reminderMinutes,
        required: draft.required,
        notes: draft.notes,
      }
      const cleanSharedPatch = Object.fromEntries(Object.entries(sharedPatch).filter(([, value]) => value !== undefined))

      if (scope === 'all' && target.routineId) {
        const from = target.date < today ? today : target.date
        const routinePatch: Partial<RoutineTask> = {
          ...cleanSharedPatch,
          ...(draft.recurrence ? { recurrence: draft.recurrence } : {}),
          ...(draft.daysOfWeek ? { daysOfWeek: draft.recurrence === 'daily' ? [0,1,2,3,4,5,6] : draft.daysOfWeek } : {}),
        }
        const nextRoutines = prev.routines.map(r => r.id === target.routineId ? { ...r, ...routinePatch, updatedAt } : r)
        const preserved = prev.tasks.filter(t => !(t.routineId === target.routineId && t.date >= from && !t.completed))
        return materializeDate({ ...prev, routines: nextRoutines, tasks: preserved }, from)
      }

      const instancePatch = { ...cleanSharedPatch, ...(draft.date !== undefined ? { date: draft.date } : {}) }
      return {
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? {
          ...t,
          ...instancePatch,
          routineId: draft.date && draft.date !== target.date ? null : t.routineId,
          updatedAt,
        } : t),
      }
    })
  }, [today])

  const deleteTask = useCallback((taskId: string, scope: 'instance' | 'all' = 'instance') => {
    setState(prev => {
      const target = prev.tasks.find(t => t.id === taskId)
      if (!target) return prev
      const clearedTimer = prev.timer.taskId === taskId ? { taskId: null, startedAt: null, accumulatedMs: 0, paused: true } : prev.timer
      if (scope === 'all' && target.routineId) {
        const from = target.date < today ? today : target.date
        return {
          ...prev,
          timer: clearedTimer,
          routines: prev.routines.map(r => r.id === target.routineId ? { ...r, active: false, updatedAt: nowIso() } : r),
          tasks: prev.tasks.filter(t => !(t.routineId === target.routineId && t.date >= from && !t.completed)),
        }
      }
      return { ...prev, timer: clearedTimer, tasks: prev.tasks.filter(t => t.id !== taskId) }
    })
  }, [today])

  const duplicateTask = useCallback((taskId: string) => setState(prev => {
    const task = prev.tasks.find(t => t.id === taskId)
    if (!task) return prev
    const stamp = nowIso()
    const nextOrder = Math.max(0, ...prev.tasks.filter(t => t.date === task.date).map(t => t.order)) + 10
    return {
      ...prev,
      tasks: [...prev.tasks, {
        ...task, id: uid(), routineId: null, title: `${task.title} — cópia`, completed: false,
        completedAt: null, actualDurationSeconds: 0, order: nextOrder, createdAt: stamp, updatedAt: stamp,
      }],
    }
  }), [])

  const moveTask = useCallback((taskId: string, direction: -1 | 1) => setState(prev => {
    const task = prev.tasks.find(t => t.id === taskId)
    if (!task) return prev
    const sameDay = prev.tasks.filter(t => t.date === task.date).sort((a, b) => a.order - b.order || a.time.localeCompare(b.time))
    const index = sameDay.findIndex(t => t.id === taskId)
    const swapWith = sameDay[index + direction]
    if (!swapWith) return prev
    return {
      ...prev,
      tasks: prev.tasks.map(t => t.id === task.id ? { ...t, order: swapWith.order, updatedAt: nowIso() } : t.id === swapWith.id ? { ...t, order: task.order, updatedAt: nowIso() } : t),
    }
  }), [])

  const toggleComplete = useCallback((taskId: string) => setState(prev => ({
    ...prev,
    tasks: prev.tasks.map(t => t.id === taskId ? {
      ...t,
      completed: !t.completed,
      completedAt: t.completed ? null : nowIso(),
      updatedAt: nowIso(),
    } : t),
  })), [])

  const addCategory = useCallback((name: string, icon: Category['icon']) => setState(prev => ({
    ...prev, categories: [...prev.categories, { id: uid(), name: name.trim(), icon, color: 'neutral' }],
  })), [])
  const updateCategory = useCallback((id: string, patch: Partial<Category>) => setState(prev => ({ ...prev, categories: prev.categories.map(c => c.id === id ? { ...c, ...patch } : c) })), [])
  const deleteCategory = useCallback((id: string) => setState(prev => {
    if (id === 'study' || id === 'gym' || id === 'personal') return prev
    return {
      ...prev,
      categories: prev.categories.filter(c => c.id !== id),
      tasks: prev.tasks.map(t => t.categoryId === id ? { ...t, categoryId: 'personal', updatedAt: nowIso() } : t),
      routines: prev.routines.map(r => r.categoryId === id ? { ...r, categoryId: 'personal', updatedAt: nowIso() } : r),
    }
  }), [])
  const updateGoals = useCallback((patch: Partial<AppState['goals']>) => setState(prev => ({ ...prev, goals: { ...prev.goals, ...patch } })), [])
  const updateSettings = useCallback((patch: Partial<AppState['settings']>) => setState(prev => ({ ...prev, settings: { ...prev.settings, ...patch } })), [])
  const setTheme = useCallback((theme: ThemeMode) => updateSettings({ theme }), [updateSettings])

  const updateRoutine = useCallback((id: string, patch: Partial<RoutineTask>) => setState(prev => {
    const updatedAt = nowIso()
    const nextRoutines = prev.routines.map(r => r.id === id ? { ...r, ...patch, updatedAt } : r)
    const preservedTasks = prev.tasks.filter(t => !(t.routineId === id && t.date >= today && !t.completed))
    return materializeDate({ ...prev, routines: nextRoutines, tasks: preservedTasks }, today)
  }), [today])

  const deleteRoutine = useCallback((id: string) => setState(prev => {
    const removedIds = new Set(prev.tasks.filter(t => t.routineId === id && !t.completed && t.date >= today).map(t => t.id))
    return {
      ...prev,
      timer: prev.timer.taskId && removedIds.has(prev.timer.taskId) ? { taskId: null, startedAt: null, accumulatedMs: 0, paused: true } : prev.timer,
      routines: prev.routines.filter(r => r.id !== id),
      tasks: prev.tasks.filter(t => t.routineId !== id || t.completed || t.date < today),
    }
  }), [today])

  const startTimer = useCallback((taskId: string) => setState(prev => prev.timer.taskId ? prev : ({ ...prev, timer: { taskId, startedAt: Date.now(), accumulatedMs: 0, paused: false } })), [])
  const pauseTimer = useCallback(() => setState(prev => prev.timer.taskId && prev.timer.startedAt ? ({ ...prev, timer: { ...prev.timer, accumulatedMs: prev.timer.accumulatedMs + (Date.now() - prev.timer.startedAt), startedAt: null, paused: true } }) : prev), [])
  const resumeTimer = useCallback(() => setState(prev => prev.timer.taskId && prev.timer.paused ? ({ ...prev, timer: { ...prev.timer, startedAt: Date.now(), paused: false } }) : prev), [])
  const finishTimer = useCallback(() => setState(prev => {
    const timer = prev.timer
    if (!timer.taskId) return prev
    const elapsedMs = elapsedTimerMs(timer)
    const durationSeconds = Math.max(1, Math.floor(elapsedMs / 1000))
    const endedAt = nowIso()
    const startedAt = new Date(Date.now() - elapsedMs).toISOString()
    return {
      ...prev,
      tasks: prev.tasks.map(t => t.id === timer.taskId ? { ...t, actualDurationSeconds: t.actualDurationSeconds + durationSeconds, updatedAt: endedAt } : t),
      studySessions: [...prev.studySessions, { id: uid(), taskId: timer.taskId, startedAt, endedAt, durationSeconds }],
      timer: { taskId: null, startedAt: null, accumulatedMs: 0, paused: true },
    }
  }), [])

  const importBackup = useCallback((incoming: AppState) => setState(migrateState(incoming)), [])
  const resetAll = useCallback(() => setState(materializeDate(seedState(), today)), [today])

  const value = useMemo<FocusContextValue>(() => ({
    state, hydrated, today, ensureDate, addTask, updateTask, deleteTask, duplicateTask, moveTask, toggleComplete,
    addCategory, updateCategory, deleteCategory, updateGoals, updateSettings, updateRoutine, deleteRoutine, setTheme,
    startTimer, pauseTimer, resumeTimer, finishTimer, importBackup, resetAll,
  }), [state, hydrated, today, ensureDate, addTask, updateTask, deleteTask, duplicateTask, moveTask, toggleComplete, addCategory, updateCategory, deleteCategory, updateGoals, updateSettings, updateRoutine, deleteRoutine, setTheme, startTimer, pauseTimer, resumeTimer, finishTimer, importBackup, resetAll])

  return <FocusContext.Provider value={value}>{children}</FocusContext.Provider>
}

export const useFocus = () => {
  const context = useContext(FocusContext)
  if (!context) throw new Error('useFocus must be used inside FocusProvider')
  return context
}
