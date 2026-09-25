import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, Copy, Plus, Trash2 } from 'lucide-react'
import { useFocus } from '../../context/FocusContext'
import type { TaskInstance } from '../../types'
import { addDays, formatCompactDate, startOfWeekKey, weekdayLabel } from '../../utils/date'
import { dayStats } from '../../utils/analytics'
import { DaySection } from '../../components/routine/DaySection'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { TaskForm } from '../../components/tasks/TaskForm'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useToast } from '../../components/ui/Toast'
import { useClock } from '../../hooks/useClock'

export function WeekPage() {
  const { state, today, ensureDate, toggleComplete, deleteTask, duplicateTask, moveTask } = useFocus()
  const firstDay = state.settings.firstDayOfWeek
  const [anchor, setAnchor] = useState(() => startOfWeekKey(today, firstDay))
  const [selectedDay, setSelectedDay] = useState(today)
  const [mode, setMode] = useState<'day' | 'full'>('day')
  const [createForDay, setCreateForDay] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [deleteScope, setDeleteScope] = useState<'instance' | 'all'>('instance')
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [futureTask, setFutureTask] = useState<TaskInstance | null>(null)
  const toast = useToast()
  const now = useClock(30000)

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(anchor, i)), [anchor])
  const weekTasks = useMemo(() => state.tasks.filter(t => days.includes(t.date)), [state.tasks, days])
  const selectedTask = state.tasks.find(t => t.id === selectedId) ?? null

  useEffect(() => { days.forEach(ensureDate) }, [days, ensureDate])
  useEffect(() => {
    const currentAnchor = startOfWeekKey(today, firstDay)
    setAnchor(currentAnchor)
    setSelectedDay(today)
  }, [firstDay, today])

  const summaries = days.map(day => ({ day, ...dayStats(state.tasks, day) }))
  const elapsedDays = days.filter(day => day <= today)
  const elapsedTasks = weekTasks.filter(t => elapsedDays.includes(t.date))
  const completed = elapsedTasks.filter(t => t.completed).length
  const weekPercent = elapsedTasks.length ? Math.round((completed / elapsedTasks.length) * 100) : 0
  const selectedTasks = weekTasks.filter(t => t.date === selectedDay)

  const changeWeek = (amount: number) => {
    const next = addDays(anchor, amount * 7)
    setAnchor(next)
    const nextDays = Array.from({ length: 7 }, (_, i) => addDays(next, i))
    setSelectedDay(nextDays.includes(today) ? today : nextDays[0])
  }

  const requestToggle = (task: TaskInstance) => {
    if (task.date > today && !task.completed) {
      setFutureTask(task)
      return
    }
    toggleComplete(task.id)
  }

  const confirmFuture = () => {
    if (futureTask) toggleComplete(futureTask.id)
    setFutureTask(null)
  }

  const removeSelected = () => {
    if (!selectedTask) return
    deleteTask(selectedTask.id, deleteScope)
    setDeleteOpen(false)
    setSelectedId(null)
    toast('Atividade removida')
  }

  const openAdd = (day: string) => setCreateForDay(day)
  const goCurrent = () => {
    setAnchor(startOfWeekKey(today, firstDay))
    setSelectedDay(today)
  }

  return <div className="pb-4">
    <header className="mb-5 flex items-end justify-between gap-4">
      <div><div className="eyebrow">Sua rotina</div><h1 className="page-title">Semana</h1><p className="mt-1 text-sm text-[var(--muted)]">Veja e marque sua rotina sem sair desta tela.</p></div>
      <button onClick={() => openAdd(selectedDay)} className="primary-icon-button" aria-label="Nova atividade"><Plus size={20}/></button>
    </header>

    <section className="mb-4">
      <div className="flex items-center justify-between gap-2">
        <button className="nav-arrow" onClick={() => changeWeek(-1)} aria-label="Semana anterior"><ChevronLeft size={19}/></button>
        <button onClick={goCurrent} className="focus-ring tap min-h-11 rounded-2xl px-4 text-center">
          <div className="text-sm font-semibold tabular-nums">{formatCompactDate(days[0])} — {formatCompactDate(days[6])}</div>
          <div className="mt-0.5 text-[11px] text-[var(--muted)]">{elapsedTasks.length ? `${completed}/${elapsedTasks.length} · ${weekPercent}% concluído` : days[0] > today ? 'Semana planejada' : 'Sem atividades'}</div>
        </button>
        <button className="nav-arrow" onClick={() => changeWeek(1)} aria-label="Próxima semana"><ChevronRight size={19}/></button>
      </div>
    </section>

    <div className="mb-4 segmented max-w-sm">
      <button className={mode === 'day' ? 'segmented-active' : ''} onClick={() => setMode('day')}>Dia selecionado</button>
      <button className={mode === 'full' ? 'segmented-active' : ''} onClick={() => setMode('full')}>Semana completa</button>
    </div>

    <div className="week-day-strip mb-5" role="tablist" aria-label="Dias da semana">
      {summaries.map(item => {
        const active = item.day === selectedDay
        const isToday = item.day === today
        return <button key={item.day} role="tab" aria-selected={active} onClick={() => { setSelectedDay(item.day); setMode('day') }} className={`week-day-tab ${active ? 'week-day-tab-active' : ''}`}>
          <span className="text-[10px] font-semibold tracking-[.08em]">{weekdayLabel(item.day)}</span>
          <span className="mt-1 text-sm font-semibold tabular-nums">{Number(item.day.slice(-2))}</span>
          <span className={`mt-2 h-1.5 w-1.5 rounded-full ${item.percent === 100 && item.total > 0 ? 'bg-[var(--success)]' : item.completed > 0 ? 'bg-[var(--accent)]' : isToday ? 'bg-[var(--text)]' : 'bg-[var(--border-strong)]'}`}/>
        </button>
      })}
    </div>

    {mode === 'day' ? <div className="max-w-2xl">
      <DaySection day={selectedDay} today={today} tasks={selectedTasks} onOpenTask={setSelectedId} onToggleTask={requestToggle} onAdd={openAdd} now={now}/>
      <button onClick={() => openAdd(selectedDay)} className="focus-ring tap mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-[16px] border border-dashed border-[var(--border-strong)] text-sm font-semibold text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"><Plus size={17}/>Adicionar neste dia</button>
    </div> : <div className="grid gap-7 lg:grid-cols-2 xl:grid-cols-3">
      {days.map(day => <DaySection key={day} day={day} today={today} tasks={weekTasks.filter(t => t.date === day)} onOpenTask={setSelectedId} onToggleTask={requestToggle} onAdd={openAdd} now={now}/>) }
    </div>}

    <button onClick={() => openAdd(selectedDay)} className="floating-add md:hidden" aria-label="Nova atividade"><Plus size={22}/></button>

    <BottomSheet open={!!createForDay} onClose={() => setCreateForDay(null)} title="Nova atividade">
      {createForDay && <TaskForm defaultDate={createForDay} onDone={() => { setCreateForDay(null); toast('Atividade adicionada') }}/>} 
    </BottomSheet>

    <BottomSheet open={!!selectedTask} onClose={() => setSelectedId(null)} title="Editar atividade">
      {selectedTask && <>
        <TaskForm task={selectedTask} onDone={() => { setSelectedId(null); toast('Alterações salvas') }}/>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button className="secondary-action" onClick={() => moveTask(selectedTask.id, -1)}><ArrowUp size={15}/>Subir</button>
          <button className="secondary-action" onClick={() => moveTask(selectedTask.id, 1)}><ArrowDown size={15}/>Descer</button>
          <button className="secondary-action" onClick={() => { duplicateTask(selectedTask.id); setSelectedId(null); toast('Atividade duplicada') }}><Copy size={15}/>Duplicar</button>
          <button className="danger-action" onClick={() => setDeleteOpen(true)}><Trash2 size={15}/>Excluir</button>
        </div>
      </>}
    </BottomSheet>

    <ConfirmDialog open={deleteOpen} title="Excluir atividade?" description={selectedTask?.routineId ? 'Escolha se quer remover somente esta ocorrência ou interromper a rotina futura.' : 'Esta atividade será removida.'} onCancel={() => setDeleteOpen(false)} onConfirm={removeSelected} confirmLabel={selectedTask?.routineId && deleteScope === 'all' ? 'Excluir rotina futura' : 'Excluir'} />
    {deleteOpen && selectedTask?.routineId && <div className="fixed bottom-28 left-1/2 z-[80] flex -translate-x-1/2 gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-2 shadow-soft"><button className={`rounded-xl px-3 py-2 text-xs font-semibold ${deleteScope === 'instance' ? 'bg-[var(--accent)] text-white' : 'text-[var(--muted)]'}`} onClick={() => setDeleteScope('instance')}>Só este dia</button><button className={`rounded-xl px-3 py-2 text-xs font-semibold ${deleteScope === 'all' ? 'bg-[var(--accent)] text-white' : 'text-[var(--muted)]'}`} onClick={() => setDeleteScope('all')}>Rotina futura</button></div>}

    <ConfirmDialog open={!!futureTask} title="Concluir antes do dia?" description="Esta atividade está em uma data futura. Confirme apenas se você realmente quer registrá-la como concluída antecipadamente." onCancel={() => setFutureTask(null)} onConfirm={confirmFuture} confirmLabel="Concluir mesmo assim" />
  </div>
}
