import type { TimerState } from '../types'

export const elapsedTimerMs = (timer: TimerState, now = Date.now()) =>
  timer.accumulatedMs + (timer.startedAt ? Math.max(0, now - timer.startedAt) : 0)
