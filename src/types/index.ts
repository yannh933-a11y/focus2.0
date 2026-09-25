export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'late' | 'missed' | 'future'
export type RecurrenceType = 'none' | 'daily' | 'weekly'
export type ThemeMode = 'dark' | 'light' | 'system'
export type HourFormat = '24h' | '12h'
export type FirstDayOfWeek = 0 | 1

export interface Category {
  id: string
  name: string
  icon: 'book' | 'dumbbell' | 'user' | 'briefcase' | 'heart' | 'sparkles'
  color: 'accent' | 'success' | 'warning' | 'neutral'
}

export interface RoutineTask {
  id: string
  title: string
  categoryId: string
  time: string
  plannedDurationMinutes: number
  reminderMinutes: number | null
  required: boolean
  notes: string
  recurrence: RecurrenceType
  daysOfWeek: number[]
  startDate: string
  active: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export interface TaskInstance {
  id: string
  routineId: string | null
  title: string
  categoryId: string
  date: string
  time: string
  plannedDurationMinutes: number
  actualDurationSeconds: number
  reminderMinutes: number | null
  required: boolean
  notes: string
  completed: boolean
  completedAt: string | null
  order: number
  createdAt: string
  updatedAt: string
}

export interface StudySession {
  id: string
  taskId: string
  startedAt: string
  endedAt: string
  durationSeconds: number
}

export interface TimerState {
  taskId: string | null
  startedAt: number | null
  accumulatedMs: number
  paused: boolean
}

export interface Goals {
  weeklyStudyMinutes: number
  weeklyWorkouts: number
  minimumRoutinePercent: number
  streakTarget: number
}

export interface AppSettings {
  theme: ThemeMode
  notificationsEnabled: boolean
  defaultReminderMinutes: number
  firstDayOfWeek: FirstDayOfWeek
  hourFormat: HourFormat
  showDuration: boolean
  showCategories: boolean
}

export interface AppState {
  version: number
  categories: Category[]
  routines: RoutineTask[]
  tasks: TaskInstance[]
  studySessions: StudySession[]
  goals: Goals
  settings: AppSettings
  timer: TimerState
  lastOpenDate: string
}

export interface TaskDraft {
  title: string
  categoryId: string
  date: string
  time: string
  plannedDurationMinutes: number
  recurrence: RecurrenceType
  daysOfWeek: number[]
  reminderMinutes: number | null
  required: boolean
  notes: string
}
