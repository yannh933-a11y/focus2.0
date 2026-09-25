import { Check, Clock3, MoreHorizontal, Play } from 'lucide-react'
import { motion } from 'framer-motion'
import type { TaskInstance } from '../../types'
import { useFocus } from '../../context/FocusContext'
import { CategoryIcon } from '../ui/CategoryIcon'
import { formatTime, minutesToLabel, taskDateTime } from '../../utils/date'

interface Props {
  task: TaskInstance
  today: string
  onOpen: () => void
  onToggle: () => void
  now: number
}

export function WeekTaskRow({ task, today, onOpen, onToggle, now }: Props) {
  const { state, startTimer } = useFocus()
  const category = state.categories.find(c => c.id === task.categoryId)
  const future = task.date > today
  const missed = task.date < today && !task.completed
  const late = task.date === today && !task.completed && now > taskDateTime(task.date, task.time)
  const activeTimer = state.timer.taskId === task.id
  const anotherTimerActive = !!state.timer.taskId && state.timer.taskId !== task.id
  const canStartStudy = task.categoryId === 'study' && !task.completed && task.date === today && !activeTimer && !anotherTimerActive

  return <motion.div layout className={`week-task-row ${task.completed ? 'week-task-row-complete' : ''}`}>
    <motion.button
      whileTap={{ scale: .9 }}
      onClick={onToggle}
      aria-label={task.completed ? 'Desmarcar atividade' : future ? 'Concluir atividade futura' : 'Concluir atividade'}
      className={`task-check focus-ring ${task.completed ? 'task-check-complete' : ''}`}
    >{task.completed && <Check size={16} strokeWidth={2.8}/>}</motion.button>

    <button onClick={onOpen} className="focus-ring min-w-0 flex-1 rounded-xl text-left">
      <div className="flex items-center gap-2">
        <span className={`truncate text-[14px] font-semibold tracking-[-.01em] ${task.completed ? 'text-[var(--muted)] line-through decoration-[var(--muted)]/45' : ''}`}>{task.title}</span>
        {!task.required && <span className="badge">Opcional</span>}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[var(--muted)]">
        <span className="flex items-center gap-1"><Clock3 size={11}/>{formatTime(task.time, state.settings.hourFormat)}</span>
        {state.settings.showDuration && <><span>•</span><span>{minutesToLabel(task.plannedDurationMinutes)}</span></>}
        {state.settings.showCategories && category && <><span>•</span><span className="flex items-center gap-1"><CategoryIcon icon={category.icon} size={11}/>{category.name}</span></>}
      </div>
      {(missed || late || activeTimer || future) && <div className={`mt-1 text-[10px] font-semibold ${missed || late ? 'text-[var(--warning)]' : activeTimer ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`}>{missed ? 'Não realizada' : late ? 'Atrasada' : activeTimer ? 'Em andamento' : 'Planejada'}</div>}
    </button>

    {canStartStudy
      ? <button onClick={() => startTimer(task.id)} className="focus-ring tap grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]" aria-label="Iniciar estudo"><Play size={15} fill="currentColor"/></button>
      : <button onClick={onOpen} className="focus-ring tap grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[var(--muted)] hover:bg-[var(--surface-2)]" aria-label="Mais opções"><MoreHorizontal size={18}/></button>}
  </motion.div>
}
