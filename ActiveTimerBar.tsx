import { useState } from 'react'
import { Pause, Play, Square } from 'lucide-react'
import { useFocus } from '../../context/FocusContext'
import { useClock } from '../../hooks/useClock'
import { secondsToClock } from '../../utils/date'
import { elapsedTimerMs } from '../../utils/timer'
import { BottomSheet } from '../ui/BottomSheet'

export function ActiveTimerBar() {
  const { state, pauseTimer, resumeTimer, finishTimer } = useFocus()
  const [open, setOpen] = useState(false)
  const now = useClock(1000)
  const timer = state.timer
  if (!timer.taskId) return null
  const task = state.tasks.find(t => t.id === timer.taskId)
  if (!task) return null

  const elapsedMs = elapsedTimerMs(timer, now)
  const seconds = Math.max(0, Math.floor(elapsedMs / 1000))
  const plannedSeconds = task.plannedDurationMinutes * 60
  const progress = Math.min(100, plannedSeconds ? (seconds / plannedSeconds) * 100 : 0)

  return <>
    <div className="timer-dock">
      <button onClick={() => setOpen(true)} className="focus-ring min-w-0 flex-1 rounded-xl text-left">
        <div className="truncate text-[12px] font-semibold">{task.title}</div>
        <div className="mt-0.5 text-[10px] text-[var(--muted)]">Cronômetro da atividade</div>
      </button>
      <button onClick={() => setOpen(true)} className="focus-ring rounded-xl px-2 text-base font-semibold tabular-nums">{secondsToClock(seconds)}</button>
      <button onClick={timer.paused ? resumeTimer : pauseTimer} className="focus-ring tap grid h-10 w-10 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]" aria-label={timer.paused ? 'Continuar' : 'Pausar'}>{timer.paused ? <Play size={15} fill="currentColor"/> : <Pause size={15} fill="currentColor"/>}</button>
    </div>

    <BottomSheet open={open} onClose={() => setOpen(false)} title="Cronômetro da atividade">
      <div className="py-2 text-center">
        <div className="eyebrow text-[var(--accent)]">{timer.paused ? 'Pausada' : 'Em andamento'}</div>
        <h3 className="mt-2 text-xl font-semibold">{task.title}</h3>
        <div className="mt-6 text-[44px] font-semibold tabular-nums tracking-[-.05em]">{secondsToClock(seconds)}</div>
        <div className="mx-auto mt-5 h-2 max-w-md overflow-hidden rounded-full bg-[var(--surface-2)]"><div className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-500" style={{ width: `${progress}%` }}/></div>
        <div className="mt-2 text-xs text-[var(--muted)]">Planejado: {task.plannedDurationMinutes} min</div>
        <div className="mt-7 grid grid-cols-2 gap-3">
          <button onClick={timer.paused ? resumeTimer : pauseTimer} className="secondary-action min-h-12">{timer.paused ? <Play size={16} fill="currentColor"/> : <Pause size={16} fill="currentColor"/>}{timer.paused ? 'Continuar' : 'Pausar'}</button>
          <button onClick={() => { finishTimer(); setOpen(false) }} className="primary-action min-h-12"><Square size={14} fill="currentColor"/>Finalizar</button>
        </div>
      </div>
    </BottomSheet>
  </>
}
