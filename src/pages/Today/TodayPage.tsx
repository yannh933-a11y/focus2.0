import { useMemo, useState } from 'react'
import { Copy, Flame, Plus, Trash2 } from 'lucide-react'
import { useFocus } from '../../context/FocusContext'
import { bestStreak, currentStreak, dayStats } from '../../utils/analytics'
import { differenceLabel, formatLongDate, formatTime, formatWeekday, minutesToLabel, taskDateTime } from '../../utils/date'
import { TaskItem } from '../../components/tasks/TaskItem'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { TaskForm } from '../../components/tasks/TaskForm'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useClock } from '../../hooks/useClock'
import { useToast } from '../../components/ui/Toast'

export function TodayPage() {
  const { state, today, deleteTask, duplicateTask } = useFocus()
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deleteScope, setDeleteScope] = useState<'instance' | 'all'>('instance')
  const now = useClock(30000)
  const toast = useToast()

  const tasks = useMemo(() => state.tasks.filter(t => t.date === today).sort((a,b) => a.order - b.order || a.time.localeCompare(b.time)), [state.tasks, today])
  const selected = tasks.find(t => t.id === selectedId) ?? null
  const stats = dayStats(state.tasks, today)
  const streak = currentStreak(state, today)
  const best = bestStreak(state)
  const next = tasks.filter(t => !t.completed).sort((a,b) => taskDateTime(a.date,a.time)-taskDateTime(b.date,b.time))[0]
  const studySeconds = tasks.filter(t => t.categoryId === 'study').reduce((sum,t) => sum + t.actualDurationSeconds,0)

  const removeSelected = () => {
    if (!selected) return
    deleteTask(selected.id, deleteScope)
    setConfirmOpen(false)
    setSelectedId(null)
    toast('Atividade removida')
  }

  return <div className="max-w-3xl">
    <header className="mb-5 flex items-end justify-between gap-4">
      <div><div className="eyebrow">Focus</div><h1 className="page-title capitalize">{formatWeekday(today)}</h1><p className="mt-1 text-sm text-[var(--muted)]">{formatLongDate(today)}</p></div>
      <button onClick={() => setCreateOpen(true)} className="primary-icon-button" aria-label="Adicionar atividade"><Plus size={20}/></button>
    </header>

    <section className="mb-5 overflow-hidden rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div><div className="eyebrow">Progresso de hoje</div><div className="mt-1 text-[22px] font-semibold tracking-[-.03em]">{stats.completed} de {stats.total} concluídas</div></div>
        <div className="text-right"><div className="text-[22px] font-semibold tabular-nums">{stats.percent}%</div><div className="mt-1 flex items-center justify-end gap-1 text-[11px] text-[var(--muted)]"><Flame size={13} className="text-[var(--warning)]"/>{streak} dias</div></div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--surface-2)]"><div className={`h-full rounded-full transition-[width] duration-300 ${stats.percent === 100 && stats.total > 0 ? 'bg-[var(--success)]' : 'bg-[var(--accent)]'}`} style={{ width: `${stats.percent}%` }}/></div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--muted)]"><span>Recorde: {best} dias</span><span>{Math.floor(studySeconds/3600)}h {Math.floor((studySeconds%3600)/60)}min estudados</span></div>
    </section>

    {next && <section className="mb-6 border-l-2 border-[var(--accent)] pl-4">
      <div className="eyebrow">Próxima atividade</div>
      <div className="mt-1 flex items-start justify-between gap-3"><div><div className="text-[17px] font-semibold">{next.title}</div><div className="mt-1 text-xs text-[var(--muted)]">{formatTime(next.time, state.settings.hourFormat)} · {minutesToLabel(next.plannedDurationMinutes)}</div></div><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${taskDateTime(next.date,next.time) < now ? 'bg-[var(--warning-soft)] text-[var(--warning)]' : 'bg-[var(--accent-soft)] text-[var(--accent)]'}`}>{differenceLabel(next.date,next.time,now)}</span></div>
    </section>}

    <div className="mb-3 flex items-center justify-between"><h2 className="text-[15px] font-semibold">Minha rotina</h2><span className="text-xs text-[var(--muted)]">{tasks.length} atividades</span></div>
    <div className="divide-y divide-[var(--border)] overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--surface)]">
      {tasks.length ? tasks.map(task => <TaskItem key={task.id} task={task} now={now} onOpen={() => setSelectedId(task.id)} />) : <div className="px-5 py-9 text-center"><h3 className="font-semibold">Seu dia está livre.</h3><p className="mt-1 text-sm text-[var(--muted)]">Adicione uma atividade ou configure sua rotina semanal.</p><button onClick={() => setCreateOpen(true)} className="mt-4 text-sm font-semibold text-[var(--accent)]">Adicionar atividade</button></div>}
    </div>

    <button onClick={() => setCreateOpen(true)} className="floating-add md:hidden" aria-label="Adicionar atividade"><Plus size={22}/></button>

    <BottomSheet open={createOpen} onClose={() => setCreateOpen(false)} title="Nova atividade"><TaskForm defaultDate={today} onDone={() => { setCreateOpen(false); toast('Atividade adicionada') }} /></BottomSheet>
    <BottomSheet open={!!selected} onClose={() => setSelectedId(null)} title="Editar atividade">
      {selected && <><TaskForm task={selected} onDone={() => { setSelectedId(null); toast('Alterações salvas') }} /><div className="mt-3 grid grid-cols-2 gap-2"><button className="secondary-action" onClick={() => { duplicateTask(selected.id); setSelectedId(null); toast('Atividade duplicada') }}><Copy size={15}/>Duplicar</button><button className="danger-action" onClick={() => setConfirmOpen(true)}><Trash2 size={15}/>Excluir</button></div></>}
    </BottomSheet>
    <ConfirmDialog open={confirmOpen} title="Excluir atividade?" description={selected?.routineId ? 'Você pode excluir apenas este dia ou a rotina futura.' : 'Esta ação removerá a atividade.'} onCancel={() => setConfirmOpen(false)} onConfirm={removeSelected} confirmLabel={selected?.routineId && deleteScope === 'all' ? 'Excluir rotina futura' : 'Excluir'} />
    {confirmOpen && selected?.routineId && <div className="fixed bottom-28 left-1/2 z-[80] flex -translate-x-1/2 gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] p-2 shadow-soft"><button className={`rounded-xl px-3 py-2 text-xs font-semibold ${deleteScope==='instance'?'bg-[var(--accent)] text-white':'text-[var(--muted)]'}`} onClick={() => setDeleteScope('instance')}>Só hoje</button><button className={`rounded-xl px-3 py-2 text-xs font-semibold ${deleteScope==='all'?'bg-[var(--accent)] text-white':'text-[var(--muted)]'}`} onClick={() => setDeleteScope('all')}>Rotina futura</button></div>}
  </div>
}
