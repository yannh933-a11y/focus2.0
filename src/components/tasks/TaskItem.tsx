import { motion } from 'framer-motion'
import { Check, Clock3, MoreHorizontal, Play } from 'lucide-react'
import type { TaskInstance } from '../../types'
import { useFocus } from '../../context/FocusContext'
import { CategoryIcon } from '../ui/CategoryIcon'
import { dateKey, formatTime, minutesToLabel, taskDateTime } from '../../utils/date'

export function TaskItem({ task, onOpen, now = Date.now() }: { task: TaskInstance; onOpen: () => void; now?: number }) {
  const { state, toggleComplete, startTimer } = useFocus()
  const category = state.categories.find(c => c.id === task.categoryId)
  const isTimer = state.timer.taskId === task.id
  const late = !task.completed && task.date === dateKey(new Date()) && now > taskDateTime(task.date, task.time)
  const missed = !task.completed && task.date < dateKey(new Date())
  const status = task.completed ? 'Concluída' : isTimer ? 'Em andamento' : missed ? 'Não realizada' : late ? 'Atrasada' : 'Pendente'
  const study = task.categoryId === 'study'
  const anotherTimerActive = !!state.timer.taskId && state.timer.taskId !== task.id

  return <motion.div layout className={`task-row ${task.completed ? 'task-row-complete' : ''}`}>
    <motion.button
      whileTap={{ scale: .9 }}
      aria-label={task.completed ? 'Marcar como pendente' : 'Concluir tarefa'}
      onClick={() => toggleComplete(task.id)}
      className={`task-check focus-ring ${task.completed ? 'task-check-complete' : ''}`}
    >{task.completed && <Check size={17} strokeWidth={2.7}/>}</motion.button>

    <button onClick={onOpen} className="focus-ring min-w-0 flex-1 rounded-xl text-left">
      <div className="flex items-center gap-2">
        <span className={`truncate text-[15px] font-semibold tracking-[-.01em] ${task.completed ? 'text-[var(--muted)] line-through decoration-[var(--muted)]/50' : ''}`}>{task.title}</span>
        {!task.required && <span className="badge">Opcional</span>}
      </div>
      <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[var(--muted)]">
        <span className="flex items-center gap-1"><Clock3 size={12}/>{formatTime(task.time, state.settings.hourFormat)}</span>
        {state.settings.showDuration && <><span>•</span><span>{minutesToLabel(task.plannedDurationMinutes)}</span></>}
        {state.settings.showCategories && category && <><span>•</span><span className="flex items-center gap-1 text-[var(--muted-strong)]"><CategoryIcon icon={category.icon} size={12}/>{category.name}</span></>}
      </div>
      <div className={`mt-1 text-[10px] font-semibold ${late || missed ? 'text-[var(--warning)]' : isTimer ? 'text-[var(--accent)]' : task.completed ? 'text-[var(--success)]' : 'text-[var(--muted)]'}`}>{status}</div>
    </button>

    {study && !task.completed && !isTimer && !anotherTimerActive
      ? <button aria-label="Iniciar sessão" onClick={() => startTimer(task.id)} className="focus-ring tap grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[var(--accent)] text-white"><Play size={16} fill="currentColor" /></button>
      : <button aria-label="Mais opções" onClick={onOpen} className="focus-ring tap grid h-11 w-11 shrink-0 place-items-center rounded-[14px] text-[var(--muted)] hover:bg-[var(--surface-2)]"><MoreHorizontal size={19}/></button>}
  </motion.div>
}
