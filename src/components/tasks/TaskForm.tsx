import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import type { TaskDraft, TaskInstance } from '../../types'
import { useFocus } from '../../context/FocusContext'
import { Button } from '../ui/Button'
import { dateKey } from '../../utils/date'

const weekdays = [
  { value: 1, label: 'SEG' }, { value: 2, label: 'TER' }, { value: 3, label: 'QUA' },
  { value: 4, label: 'QUI' }, { value: 5, label: 'SEX' }, { value: 6, label: 'SÁB' }, { value: 0, label: 'DOM' },
]

interface Props {
  task?: TaskInstance | null
  defaultDate?: string
  defaultRecurrence?: TaskDraft['recurrence']
  onDone: () => void
}

export function TaskForm({ task, defaultDate, defaultRecurrence = 'none', onDone }: Props) {
  const { state, addTask, updateTask } = useFocus()
  const routine = useMemo(() => task?.routineId ? state.routines.find(r => r.id === task.routineId) : null, [task, state.routines])
  const [scope, setScope] = useState<'instance' | 'all'>(task?.routineId ? 'all' : 'instance')
  const [draft, setDraft] = useState<TaskDraft>(() => ({
    title: task?.title ?? '',
    categoryId: task?.categoryId ?? 'study',
    date: task?.date ?? defaultDate ?? dateKey(new Date()),
    time: task?.time ?? '17:00',
    plannedDurationMinutes: task?.plannedDurationMinutes ?? 45,
    recurrence: routine?.recurrence ?? defaultRecurrence,
    daysOfWeek: routine?.daysOfWeek ?? [1,2,3,4,5],
    reminderMinutes: task ? task.reminderMinutes : state.settings.defaultReminderMinutes,
    required: task?.required ?? true,
    notes: task?.notes ?? '',
  }))

  const change = <K extends keyof TaskDraft>(key: K, value: TaskDraft[K]) => setDraft(prev => ({ ...prev, [key]: value }))
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!draft.title.trim()) return
    if (draft.recurrence === 'weekly' && draft.daysOfWeek.length === 0) return
    if (task) updateTask(task.id, draft, scope)
    else addTask(draft)
    onDone()
  }

  const showRecurrence = !task || (!!task.routineId && scope === 'all')

  return <form onSubmit={submit} className="space-y-4">
    <label className="block"><span className="field-label">Nome</span><input autoFocus className="field" placeholder="Ex.: Estudar Física" value={draft.title} onChange={e => change('title', e.target.value)} /></label>

    <div className="grid grid-cols-2 gap-3">
      <label><span className="field-label">Categoria</span><select className="field" value={draft.categoryId} onChange={e => change('categoryId', e.target.value)}>{state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label><span className="field-label">Data</span><input type="date" className="field" value={draft.date} onChange={e => change('date', e.target.value)} disabled={!!task?.routineId && scope === 'all'} /></label>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <label><span className="field-label">Horário</span><input type="time" className="field" value={draft.time} onChange={e => change('time', e.target.value)} /></label>
      <label><span className="field-label">Duração</span><select className="field" value={draft.plannedDurationMinutes} onChange={e => change('plannedDurationMinutes', Number(e.target.value))}>{[10,15,20,30,45,60,75,90,120,150,180,240].map(v => <option key={v} value={v}>{v < 60 ? `${v} min` : `${Math.floor(v/60)}h${v%60 ? ` ${v%60}min` : ''}`}</option>)}</select></label>
    </div>

    {task?.routineId && <div className="surface-soft p-3"><p className="mb-2 text-xs text-[var(--muted)]">Aplicar edição a:</p><div className="segmented"><button type="button" onClick={() => setScope('instance')} className={scope === 'instance' ? 'segmented-active' : ''}>Só este dia</button><button type="button" onClick={() => setScope('all')} className={scope === 'all' ? 'segmented-active' : ''}>Rotina futura</button></div></div>}

    {showRecurrence && <label className="block"><span className="field-label">Recorrência</span><select className="field" value={draft.recurrence} onChange={e => change('recurrence', e.target.value as TaskDraft['recurrence'])}>{!task?.routineId && <option value="none">Somente uma vez</option>}<option value="daily">Todos os dias</option><option value="weekly">Dias específicos</option></select></label>}

    {showRecurrence && draft.recurrence === 'weekly' && <div><span className="field-label">Dias da semana</span><div className="grid grid-cols-4 gap-2 sm:grid-cols-7">{weekdays.map(day => { const active = draft.daysOfWeek.includes(day.value); return <button type="button" key={day.value} onClick={() => change('daysOfWeek', active ? draft.daysOfWeek.filter(d => d !== day.value) : [...draft.daysOfWeek, day.value])} className={`day-chip ${active ? 'day-chip-active' : ''}`}>{day.label}</button> })}</div></div>}

    <div className="grid grid-cols-2 gap-3">
      <label><span className="field-label">Lembrete</span><select className="field" value={draft.reminderMinutes ?? -1} onChange={e => change('reminderMinutes', Number(e.target.value) < 0 ? null : Number(e.target.value))}><option value={-1}>Desligado</option><option value={0}>No horário</option><option value={5}>5 min antes</option><option value={10}>10 min antes</option><option value={15}>15 min antes</option><option value={30}>30 min antes</option></select></label>
      <label><span className="field-label">Tipo</span><select className="field" value={draft.required ? 'required' : 'optional'} onChange={e => change('required', e.target.value === 'required')}><option value="required">Obrigatória</option><option value="optional">Opcional</option></select></label>
    </div>

    <label className="block"><span className="field-label">Observações</span><textarea className="field min-h-20 resize-none" placeholder="Opcional" value={draft.notes} onChange={e => change('notes', e.target.value)} /></label>
    <Button full type="submit">{task ? 'Salvar alterações' : 'Adicionar atividade'}</Button>
  </form>
}
