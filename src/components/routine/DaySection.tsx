import type { TaskInstance } from '../../types'
import { dayStats } from '../../utils/analytics'
import { formatDayMonth, formatWeekday } from '../../utils/date'
import { WeekTaskRow } from './WeekTaskRow'

interface Props {
  day: string
  today: string
  tasks: TaskInstance[]
  onOpenTask: (id: string) => void
  onToggleTask: (task: TaskInstance) => void
  onAdd: (day: string) => void
  now: number
}

export function DaySection({ day, today, tasks, onOpenTask, onToggleTask, onAdd, now }: Props) {
  const stats = dayStats(tasks, day)
  const sorted = [...tasks].sort((a, b) => a.order - b.order || a.time.localeCompare(b.time))
  const isToday = day === today

  return <section className="day-section">
    <div className="mb-3 flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <h2 className="text-[14px] font-semibold capitalize tracking-[-.01em]">{formatWeekday(day)}</h2>
          {isToday && <span className="today-pill">HOJE</span>}
        </div>
        <div className="mt-0.5 text-[11px] font-medium text-[var(--muted)]">{formatDayMonth(day)} · {stats.completed}/{stats.total || 0} concluídas</div>
      </div>
      <div className="text-right"><div className="text-sm font-semibold tabular-nums">{stats.percent}%</div><div className="mt-1 h-1 w-16 overflow-hidden rounded-full bg-[var(--surface-2)]"><div className={`h-full rounded-full ${stats.percent === 100 && stats.total > 0 ? 'bg-[var(--success)]' : 'bg-[var(--accent)]'}`} style={{ width: `${stats.percent}%` }}/></div></div>
    </div>

    <div className="divide-y divide-[var(--border)] overflow-hidden rounded-[18px] border border-[var(--border)] bg-[var(--surface)]">
      {sorted.length ? sorted.map(task => <WeekTaskRow key={task.id} task={task} today={today} now={now} onOpen={() => onOpenTask(task.id)} onToggle={() => onToggleTask(task)} />) : <button onClick={() => onAdd(day)} className="focus-ring tap w-full px-4 py-5 text-left text-sm text-[var(--muted)] hover:bg-[var(--surface-2)]">Nenhuma atividade. <span className="font-semibold text-[var(--accent)]">Adicionar</span></button>}
    </div>
  </section>
}
