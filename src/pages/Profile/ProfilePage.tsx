import { useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Bell, ChevronRight, Database, Download, Moon, Plus, RotateCcw, Tags, Trash2, Upload } from 'lucide-react'
import { useFocus } from '../../context/FocusContext'
import type { AppState, Category, RoutineTask, TaskDraft } from '../../types'
import { BottomSheet } from '../../components/ui/BottomSheet'
import { Button } from '../../components/ui/Button'
import { CategoryIcon } from '../../components/ui/CategoryIcon'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useToast } from '../../components/ui/Toast'
import { requestNotificationPermission } from '../../services/notifications'
import { dateKey } from '../../utils/date'

const iconOptions: Category['icon'][] = ['book','dumbbell','user','briefcase','heart','sparkles']
const dayNames: Record<number,string> = { 0:'DOM',1:'SEG',2:'TER',3:'QUA',4:'QUI',5:'SEX',6:'SÁB' }

function RoutineForm({ routine, onDone }: { routine?: RoutineTask | null; onDone:()=>void }) {
  const { state, addTask, updateRoutine } = useFocus()
  const [draft,setDraft]=useState({
    title:routine?.title ?? '',
    categoryId:routine?.categoryId ?? 'study',
    time:routine?.time ?? '17:00',
    plannedDurationMinutes:routine?.plannedDurationMinutes ?? 45,
    reminderMinutes:routine ? routine.reminderMinutes : state.settings.defaultReminderMinutes,
    required:routine?.required ?? true,
    notes:routine?.notes ?? '',
    recurrence:(routine?.recurrence === 'daily' ? 'daily' : 'weekly') as 'daily'|'weekly',
    daysOfWeek:routine?.daysOfWeek ?? [1,2,3,4,5],
    active:routine?.active ?? true,
  })
  const weekdays=[['SEG',1],['TER',2],['QUA',3],['QUI',4],['SEX',5],['SÁB',6],['DOM',0]] as const

  const save=(event:FormEvent)=>{
    event.preventDefault()
    if(!draft.title.trim() || (draft.recurrence === 'weekly' && !draft.daysOfWeek.length)) return
    if(routine){ updateRoutine(routine.id,{...draft, daysOfWeek:draft.recurrence==='daily'?[0,1,2,3,4,5,6]:draft.daysOfWeek}) }
    else {
      const taskDraft:TaskDraft={...draft,date:dateKey(new Date())}
      addTask(taskDraft)
    }
    onDone()
  }

  return <form className="space-y-4" onSubmit={save}>
    <label className="block"><span className="field-label">Nome</span><input autoFocus className="field" value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})} placeholder="Ex.: Academia"/></label>
    <div className="grid grid-cols-2 gap-3">
      <label><span className="field-label">Categoria</span><select className="field" value={draft.categoryId} onChange={e=>setDraft({...draft,categoryId:e.target.value})}>{state.categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
      <label><span className="field-label">Horário</span><input type="time" className="field" value={draft.time} onChange={e=>setDraft({...draft,time:e.target.value})}/></label>
    </div>
    <div className="grid grid-cols-2 gap-3">
      <label><span className="field-label">Duração</span><select className="field" value={draft.plannedDurationMinutes} onChange={e=>setDraft({...draft,plannedDurationMinutes:Number(e.target.value)})}>{[10,15,20,30,45,60,75,90,120,150,180,240].map(v=><option key={v} value={v}>{v < 60 ? `${v} min` : `${Math.floor(v/60)}h${v%60?` ${v%60}min`:''}`}</option>)}</select></label>
      <label><span className="field-label">Recorrência</span><select className="field" value={draft.recurrence} onChange={e=>setDraft({...draft,recurrence:e.target.value as 'daily'|'weekly'})}><option value="daily">Todos os dias</option><option value="weekly">Dias específicos</option></select></label>
    </div>
    {draft.recurrence==='weekly' && <div><span className="field-label">Dias da semana</span><div className="grid grid-cols-4 gap-2 sm:grid-cols-7">{weekdays.map(([label,value])=>{const active=draft.daysOfWeek.includes(value);return <button type="button" key={value} onClick={()=>setDraft({...draft,daysOfWeek:active?draft.daysOfWeek.filter(d=>d!==value):[...draft.daysOfWeek,value]})} className={`day-chip ${active?'day-chip-active':''}`}>{label}</button>})}</div></div>}
    <div className="grid grid-cols-2 gap-3">
      <label><span className="field-label">Lembrete</span><select className="field" value={draft.reminderMinutes??-1} onChange={e=>setDraft({...draft,reminderMinutes:Number(e.target.value)<0?null:Number(e.target.value)})}><option value={-1}>Desligado</option><option value={0}>No horário</option><option value={5}>5 min antes</option><option value={10}>10 min antes</option><option value={15}>15 min antes</option><option value={30}>30 min antes</option></select></label>
      <label><span className="field-label">Tipo</span><select className="field" value={draft.required?'required':'optional'} onChange={e=>setDraft({...draft,required:e.target.value==='required'})}><option value="required">Obrigatória</option><option value="optional">Opcional</option></select></label>
    </div>
    <label className="block"><span className="field-label">Observações</span><textarea className="field min-h-20 resize-none" value={draft.notes} onChange={e=>setDraft({...draft,notes:e.target.value})}/></label>
    <Button full type="submit">{routine?'Salvar rotina':'Criar rotina'}</Button>
  </form>
}

export function ProfilePage(){
  const {state,updateGoals,updateSettings,setTheme,updateRoutine,deleteRoutine,addCategory,updateCategory,deleteCategory,importBackup,resetAll}=useFocus()
  const toast=useToast()
  const fileRef=useRef<HTMLInputElement>(null)
  const [routineOpen,setRoutineOpen]=useState(false)
  const [editingRoutine,setEditingRoutine]=useState<RoutineTask|null>(null)
  const [categoryOpen,setCategoryOpen]=useState(false)
  const [editingCategory,setEditingCategory]=useState<Category|null>(null)
  const [categoryName,setCategoryName]=useState('')
  const [categoryIcon,setCategoryIcon]=useState<Category['icon']>('sparkles')
  const [resetOpen,setResetOpen]=useState(false)
  const [deleteRoutineId,setDeleteRoutineId]=useState<string|null>(null)

  const enableNotifications=async()=>{
    if(state.settings.notificationsEnabled){updateSettings({notificationsEnabled:false});toast('Notificações desativadas');return}
    const result=await requestNotificationPermission()
    if(result==='granted'){updateSettings({notificationsEnabled:true});toast('Notificações ativadas')}
    else toast(result==='unsupported'?'Notificações não suportadas':'Permissão não concedida')
  }

  const exportBackup=()=>{
    const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'})
    const url=URL.createObjectURL(blob)
    const link=document.createElement('a')
    link.href=url
    link.download=`focus-backup-${dateKey(new Date())}.json`
    link.click()
    URL.revokeObjectURL(url)
    toast('Backup exportado')
  }

  const handleImport=async(file?:File)=>{
    if(!file)return
    try{
      const incoming=JSON.parse(await file.text()) as AppState
      if(!Array.isArray(incoming.tasks)||!Array.isArray(incoming.categories)||!incoming.settings||!incoming.goals) throw new Error('invalid')
      importBackup(incoming)
      toast('Backup restaurado')
    }catch{ toast('Arquivo de backup inválido') }
  }

  const openNewCategory=()=>{setEditingCategory(null);setCategoryName('');setCategoryIcon('sparkles');setCategoryOpen(true)}
  const openEditCategory=(category:Category)=>{setEditingCategory(category);setCategoryName(category.name);setCategoryIcon(category.icon);setCategoryOpen(true)}
  const saveCategory=()=>{
    if(!categoryName.trim())return
    if(editingCategory) updateCategory(editingCategory.id,{name:categoryName.trim(),icon:categoryIcon})
    else addCategory(categoryName,categoryIcon)
    setCategoryOpen(false)
    toast(editingCategory?'Categoria atualizada':'Categoria criada')
  }

  return <div className="max-w-3xl">
    <header className="mb-6"><div className="eyebrow">Sistema</div><h1 className="page-title">Ajustes</h1><p className="mt-1 text-sm text-[var(--muted)]">Personalize sua rotina sem complicar o uso.</p></header>

    <SettingsSection title="Minha rotina" icon={<Database size={16}/>} action={<button onClick={()=>{setEditingRoutine(null);setRoutineOpen(true)}} className="mini-add"><Plus size={15}/>Nova</button>}>
      {state.routines.length ? <div className="divide-y divide-[var(--border)]">{[...state.routines].sort((a,b)=>a.time.localeCompare(b.time)).map(routine=><button key={routine.id} onClick={()=>{setEditingRoutine(routine);setRoutineOpen(true)}} className="settings-row w-full text-left"><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{routine.title}</div><div className="mt-1 text-[11px] text-[var(--muted)]">{routine.time} · {routine.recurrence==='daily'?'Todos os dias':routine.daysOfWeek.map(d=>dayNames[d]).join(' · ')}</div></div><span className={`mr-2 h-2 w-2 rounded-full ${routine.active?'bg-[var(--success)]':'bg-[var(--muted)]/30'}`}/><ChevronRight size={16} className="text-[var(--muted)]"/></button>)}</div> : <div className="p-5 text-sm text-[var(--muted)]">Nenhuma rotina recorrente.</div>}
    </SettingsSection>

    <SettingsSection title="Metas" icon={<Tags size={16}/>}>
      <NumberSetting label="Estudo semanal" suffix="min" value={state.goals.weeklyStudyMinutes} onChange={value=>updateGoals({weeklyStudyMinutes:value})}/>
      <NumberSetting label="Treinos por semana" suffix="treinos" value={state.goals.weeklyWorkouts} onChange={value=>updateGoals({weeklyWorkouts:value})}/>
      <NumberSetting label="Meta de rotina" suffix="%" value={state.goals.minimumRoutinePercent} onChange={value=>updateGoals({minimumRoutinePercent:value})}/>
      <NumberSetting label="Streak desejado" suffix="dias" value={state.goals.streakTarget} onChange={value=>updateGoals({streakTarget:value})}/>
    </SettingsSection>

    <SettingsSection title="Preferências" icon={<Moon size={16}/> }>
      <SelectSetting label="Tema" value={state.settings.theme} onChange={value=>setTheme(value as 'dark'|'light'|'system')} options={[['dark','Escuro OLED'],['light','Claro'],['system','Sistema']]}/>
      <SelectSetting label="Primeiro dia da semana" value={String(state.settings.firstDayOfWeek)} onChange={value=>updateSettings({firstDayOfWeek:Number(value) as 0|1})} options={[["1","Segunda-feira"],["0","Domingo"]]}/>
      <SelectSetting label="Horário" value={state.settings.hourFormat} onChange={value=>updateSettings({hourFormat:value as '24h'|'12h'})} options={[["24h","24 horas"],["12h","12 horas"]]}/>
      <ToggleSetting label="Mostrar duração" checked={state.settings.showDuration} onChange={checked=>updateSettings({showDuration:checked})}/>
      <ToggleSetting label="Mostrar categorias" checked={state.settings.showCategories} onChange={checked=>updateSettings({showCategories:checked})}/>
    </SettingsSection>

    <SettingsSection title="Notificações" icon={<Bell size={16}/> }>
      <button onClick={enableNotifications} className="settings-row w-full text-left"><div className="flex-1"><div className="text-sm font-semibold">Lembretes</div><div className="mt-1 text-[11px] text-[var(--muted)]">Permissão é solicitada apenas quando você ativa.</div></div><span className={`toggle ${state.settings.notificationsEnabled?'toggle-on':''}`}><span/></span></button>
      <SelectSetting label="Lembrete padrão" value={String(state.settings.defaultReminderMinutes)} onChange={value=>updateSettings({defaultReminderMinutes:Number(value)})} options={[["0","No horário"],["5","5 min antes"],["10","10 min antes"],["15","15 min antes"],["30","30 min antes"]]}/>
    </SettingsSection>

    <SettingsSection title="Categorias" icon={<Tags size={16}/>} action={<button onClick={openNewCategory} className="mini-add"><Plus size={15}/>Nova</button>}>
      <div className="divide-y divide-[var(--border)]">{state.categories.map(category=><button key={category.id} onClick={()=>openEditCategory(category)} className="settings-row w-full text-left"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[var(--surface-2)] text-[var(--muted)]"><CategoryIcon icon={category.icon} size={16}/></span><span className="flex-1 text-sm font-semibold">{category.name}</span><ChevronRight size={16} className="text-[var(--muted)]"/></button>)}</div>
    </SettingsSection>

    <SettingsSection title="Backup e dados" icon={<Database size={16}/> }>
      <button onClick={exportBackup} className="settings-row w-full"><Download size={17} className="text-[var(--muted)]"/><span className="flex-1 text-left text-sm font-semibold">Exportar backup</span><ChevronRight size={16} className="text-[var(--muted)]"/></button>
      <button onClick={()=>fileRef.current?.click()} className="settings-row w-full"><Upload size={17} className="text-[var(--muted)]"/><span className="flex-1 text-left text-sm font-semibold">Importar backup</span><ChevronRight size={16} className="text-[var(--muted)]"/></button>
      <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={e=>{void handleImport(e.target.files?.[0]);e.currentTarget.value=''}}/>
      <button onClick={()=>setResetOpen(true)} className="settings-row w-full text-[var(--danger)]"><RotateCcw size={17}/><span className="flex-1 text-left text-sm font-semibold">Redefinir dados locais</span></button>
    </SettingsSection>

    <BottomSheet open={routineOpen} onClose={()=>setRoutineOpen(false)} title={editingRoutine?'Editar rotina':'Nova rotina'}>
      <RoutineForm routine={editingRoutine} onDone={()=>{setRoutineOpen(false);toast(editingRoutine?'Rotina atualizada':'Rotina criada')}}/>
      {editingRoutine && <div className="mt-3 grid grid-cols-2 gap-2"><button className="secondary-action" onClick={()=>{updateRoutine(editingRoutine.id,{active:!editingRoutine.active});setRoutineOpen(false);toast(editingRoutine.active?'Rotina pausada':'Rotina ativada')}}>{editingRoutine.active?'Pausar rotina':'Ativar rotina'}</button><button className="danger-action" onClick={()=>setDeleteRoutineId(editingRoutine.id)}><Trash2 size={15}/>Excluir</button></div>}
    </BottomSheet>

    <BottomSheet open={categoryOpen} onClose={()=>setCategoryOpen(false)} title={editingCategory?'Editar categoria':'Nova categoria'}>
      <div className="space-y-4"><label className="block"><span className="field-label">Nome</span><input className="field" autoFocus value={categoryName} onChange={e=>setCategoryName(e.target.value)} placeholder="Ex.: Curso"/></label><div><span className="field-label">Ícone</span><div className="grid grid-cols-6 gap-2">{iconOptions.map(icon=><button key={icon} onClick={()=>setCategoryIcon(icon)} className={`grid aspect-square place-items-center rounded-xl border ${categoryIcon===icon?'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]':'border-[var(--border)] bg-[var(--surface-2)] text-[var(--muted)]'}`}><CategoryIcon icon={icon}/></button>)}</div></div><Button full onClick={saveCategory}>{editingCategory?'Salvar categoria':'Criar categoria'}</Button>{editingCategory && !['study','gym','personal'].includes(editingCategory.id) && <Button full variant="danger" onClick={()=>{deleteCategory(editingCategory.id);setCategoryOpen(false);toast('Categoria removida')}}>Excluir categoria</Button>}</div>
    </BottomSheet>

    <ConfirmDialog open={!!deleteRoutineId} title="Excluir rotina?" description="O histórico dos dias anteriores será preservado. As ocorrências futuras pendentes serão removidas." onCancel={()=>setDeleteRoutineId(null)} onConfirm={()=>{if(deleteRoutineId)deleteRoutine(deleteRoutineId);setDeleteRoutineId(null);setRoutineOpen(false);toast('Rotina excluída')}} confirmLabel="Excluir rotina"/>
    <ConfirmDialog open={resetOpen} title="Redefinir o Focus?" description="Os dados locais serão substituídos pelos dados iniciais. Exporte um backup antes se quiser conservar o histórico." onCancel={()=>setResetOpen(false)} onConfirm={()=>{resetAll();setResetOpen(false);toast('Focus redefinido')}} confirmLabel="Redefinir"/>
  </div>
}

function SettingsSection({title,icon,action,children}:{title:string;icon:ReactNode;action?:ReactNode;children:ReactNode}){
  return <section className="mb-6"><div className="mb-2 flex items-center gap-2 text-[var(--muted)]">{icon}<h2 className="text-xs font-semibold uppercase tracking-[.1em]">{title}</h2><div className="ml-auto">{action}</div></div><div className="overflow-hidden rounded-[20px] border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)]">{children}</div></section>
}

function NumberSetting({label,suffix,value,onChange}:{label:string;suffix:string;value:number;onChange:(value:number)=>void}){
  return <label className="settings-row"><span className="flex-1 text-sm font-semibold">{label}</span><input type="number" min={0} className="w-20 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-2 py-2 text-right text-sm outline-none" value={value} onChange={e=>onChange(Number(e.target.value))}/><span className="w-12 text-xs text-[var(--muted)]">{suffix}</span></label>
}

function SelectSetting({label,value,onChange,options}:{label:string;value:string;onChange:(value:string)=>void;options:[string,string][]}){
  return <label className="settings-row"><span className="flex-1 text-sm font-semibold">{label}</span><select className="max-w-[170px] bg-transparent text-right text-xs font-semibold text-[var(--accent)] outline-none" value={value} onChange={e=>onChange(e.target.value)}>{options.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
}

function ToggleSetting({label,checked,onChange}:{label:string;checked:boolean;onChange:(checked:boolean)=>void}){
  return <button className="settings-row w-full" onClick={()=>onChange(!checked)}><span className="flex-1 text-left text-sm font-semibold">{label}</span><span className={`toggle ${checked?'toggle-on':''}`}><span/></span></button>
}
