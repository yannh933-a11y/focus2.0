import { useMemo, useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Award, BookOpen, Dumbbell, Flame } from 'lucide-react'
import { useFocus } from '../../context/FocusContext'
import { addDays, formatCompactDate, formatShortDay, parseDateKey } from '../../utils/date'
import { bestStreak, currentStreak, dayStats, rangeDays } from '../../utils/analytics'

type Period = '7'|'30'|'month'|'all'

export function ProgressPage() {
  const { state, today } = useFocus()
  const [period,setPeriod] = useState<Period>('7')
  const [filter,setFilter] = useState<string>('all')
  const days = useMemo(()=>{
    if(period==='7') return rangeDays(today,7)
    if(period==='30') return rangeDays(today,30)
    if(period==='month'){ const d=parseDateKey(today); return Array.from({length:d.getDate()},(_,i)=>addDays(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`,i)) }
    const all=[...new Set(state.tasks.map(t=>t.date))].sort(); return all.length?all:rangeDays(today,7)
  },[period,state.tasks,today])

  const historicalTasks = state.tasks.filter(t => t.date <= today)
  const filteredTasks = filter==='all' ? historicalTasks : historicalTasks.filter(t=>t.categoryId===filter)
  const chart = days.map(day=>{
    const s=dayStats(filteredTasks,day)
    return { day, label: days.length<=7?formatShortDay(day).slice(0,3):formatCompactDate(day), completion:s.percent, study:Math.round(s.studySeconds/60) }
  })
  const periodTasks=filteredTasks.filter(t=>days.includes(t.date))
  const completed=periodTasks.filter(t=>t.completed).length
  const completion=periodTasks.length?Math.round(completed/periodTasks.length*100):0
  const studyMinutes=Math.round(periodTasks.filter(t=>t.categoryId==='study').reduce((s,t)=>s+t.actualDurationSeconds,0)/60)
  const workouts=periodTasks.filter(t=>t.categoryId==='gym'&&t.completed).length
  const sessions=state.studySessions.filter(s=>periodTasks.some(t=>t.id===s.taskId)).length
  const previousDays = period === 'all' || !days.length ? [] : Array.from({length:days.length},(_,i)=>addDays(days[0], i-days.length))
  const previousTasks = filteredTasks.filter(t=>previousDays.includes(t.date))
  const previousCompleted = previousTasks.filter(t=>t.completed).length
  const previousCompletion = previousTasks.length ? Math.round(previousCompleted/previousTasks.length*100) : 0
  const previousStudyMinutes = Math.round(previousTasks.filter(t=>t.categoryId==='study').reduce((s,t)=>s+t.actualDurationSeconds,0)/60)
  const previousWorkouts = previousTasks.filter(t=>t.categoryId==='gym'&&t.completed).length
  const completionDelta = completion - previousCompletion
  const studyDelta = studyMinutes - previousStudyMinutes
  const workoutDelta = workouts - previousWorkouts
  const streak=currentStreak(state,today)
  const record=bestStreak(state)
  const achievements=[
    {title:'Primeira semana',done:record>=7,detail:'7 dias de consistência'},
    {title:'Streak de 30 dias',done:record>=30,detail:'30 dias completos'},
    {title:'10 sessões de estudo',done:state.studySessions.length>=10,detail:`${state.studySessions.length}/10 sessões`},
    {title:'50 treinos',done:state.tasks.filter(t=>t.categoryId==='gym'&&t.completed).length>=50,detail:`${state.tasks.filter(t=>t.categoryId==='gym'&&t.completed).length}/50 treinos`},
  ]

  return <div>
    <header className="mb-6"><div className="eyebrow">Evolução</div><h1 className="page-title">Progresso</h1><p className="mt-1 text-sm text-[var(--muted)]">Dados reais da sua rotina, estudos e treinos.</p></header>
    <div className="mb-4 flex gap-2 overflow-x-auto pb-1">{(['7','30','month','all'] as Period[]).map(p=><button key={p} onClick={()=>setPeriod(p)} className={`focus-ring tap min-h-10 shrink-0 rounded-xl px-3.5 text-xs font-semibold ${period===p?'bg-[var(--accent)] text-white':'bg-[var(--surface)] text-[var(--muted)]'}`}>{p==='7'?'7 dias':p==='30'?'30 dias':p==='month'?'Mês':'Histórico'}</button>)}</div>
    <div className="mb-5 flex gap-2 overflow-x-auto pb-1">{[['all','Geral'] as [string,string], ...state.categories.map(category => [category.id, category.name] as [string,string])].map(([id,label])=><button key={id} onClick={()=>setFilter(id)} className={`focus-ring tap min-h-9 shrink-0 rounded-xl border px-3 text-[11px] font-semibold ${filter===id?'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]':'border-[var(--border)] text-[var(--muted)]'}`}>{label}</button>)}</div>

    <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <div className="surface p-4"><div className="text-[11px] text-[var(--muted)]">Conclusão</div><div className="mt-2 text-2xl font-semibold tabular-nums">{completion}%</div><div className="mt-1 text-[10px] text-[var(--muted)]">{completed}/{periodTasks.length} tarefas</div>{period!=='all'&&<Delta value={completionDelta} suffix=" p.p."/>}</div>
      <div className="surface p-4"><div className="text-[11px] text-[var(--muted)]">Estudo</div><div className="mt-2 text-2xl font-semibold tabular-nums">{Math.floor(studyMinutes/60)}h {studyMinutes%60}m</div><div className="mt-1 text-[10px] text-[var(--muted)]">{sessions} sessões</div>{period!=='all'&&<Delta value={studyDelta} suffix=" min"/>}</div>
      <div className="surface p-4"><div className="text-[11px] text-[var(--muted)]">Treinos</div><div className="mt-2 text-2xl font-semibold tabular-nums">{workouts}</div><div className="mt-1 text-[10px] text-[var(--muted)]">meta semanal: {state.goals.weeklyWorkouts}</div>{period!=='all'&&<Delta value={workoutDelta} suffix=""/>}</div>
      <div className="surface p-4"><div className="text-[11px] text-[var(--muted)]">Streak</div><div className="mt-2 text-2xl font-semibold tabular-nums">{streak}</div><div className="mt-1 text-[10px] text-[var(--muted)]">recorde {record}</div><div className="mt-2 text-[10px] text-[var(--muted)]">consistência atual</div></div>
    </div>

    <section className="surface mb-4 p-4 sm:p-5"><div className="mb-4"><h2 className="text-sm font-semibold">Conclusão diária</h2><p className="mt-1 text-[11px] text-[var(--muted)]">Percentual de tarefas concluídas por dia.</p></div><div className="h-56"><ResponsiveContainer width="100%" height="100%"><AreaChart data={chart}><defs><linearGradient id="focusFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6" stopOpacity={.28}/><stop offset="100%" stopColor="#3B82F6" stopOpacity={0}/></linearGradient></defs><CartesianGrid vertical={false} stroke="var(--border)"/><XAxis dataKey="label" tick={{fontSize:10,fill:'var(--muted)'}} axisLine={false} tickLine={false} interval={Math.max(0,Math.floor(days.length/7)-1)}/><YAxis domain={[0,100]} tick={{fontSize:10,fill:'var(--muted)'}} axisLine={false} tickLine={false} width={28}/><Tooltip contentStyle={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:14,fontSize:12}}/><Area type="monotone" dataKey="completion" name="Conclusão (%)" stroke="#3B82F6" strokeWidth={2.5} fill="url(#focusFill)" /></AreaChart></ResponsiveContainer></div></section>

    {(filter==='all'||filter==='study')&&<section className="surface mb-6 p-4 sm:p-5"><div className="mb-4"><h2 className="text-sm font-semibold">Tempo de estudo</h2><p className="mt-1 text-[11px] text-[var(--muted)]">Minutos realmente registrados pelo cronômetro.</p></div><div className="h-52"><ResponsiveContainer width="100%" height="100%"><BarChart data={chart}><CartesianGrid vertical={false} stroke="var(--border)"/><XAxis dataKey="label" tick={{fontSize:10,fill:'var(--muted)'}} axisLine={false} tickLine={false} interval={Math.max(0,Math.floor(days.length/7)-1)}/><YAxis tick={{fontSize:10,fill:'var(--muted)'}} axisLine={false} tickLine={false} width={28}/><Tooltip contentStyle={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:14,fontSize:12}}/><Bar dataKey="study" name="Minutos estudados" fill="#3B82F6" radius={[6,6,0,0]} maxBarSize={26}/></BarChart></ResponsiveContainer></div></section>}

    <section><div className="mb-3 flex items-center justify-between"><h2 className="text-base font-semibold">Marcos</h2><Award size={18} className="text-[var(--muted)]"/></div><div className="grid gap-2 sm:grid-cols-2">{achievements.map((a,i)=>{const Icon=i===0?Flame:i===1?Award:i===2?BookOpen:Dumbbell;return <div key={a.title} className={`surface flex items-center gap-3 p-4 ${a.done?'':'opacity-55'}`}><div className={`grid h-11 w-11 place-items-center rounded-2xl ${a.done?'bg-[var(--success-soft)] text-[var(--success)]':'bg-[var(--surface-2)] text-[var(--muted)]'}`}><Icon size={19}/></div><div><div className="text-sm font-semibold">{a.title}</div><div className="mt-1 text-[11px] text-[var(--muted)]">{a.detail}</div></div></div>})}</div></section>
  </div>
}

function Delta({value,suffix}:{value:number;suffix:string}){
  const sign=value>0?'+':''
  return <div className={`mt-2 text-[10px] font-semibold ${value>0?'text-[var(--success)]':value<0?'text-[var(--warning)]':'text-[var(--muted)]'}`}>{sign}{value}{suffix} vs. período anterior</div>
}
