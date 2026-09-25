import { BarChart3, CalendarDays, ListTodo, Settings2 } from 'lucide-react'

export type Tab = 'today' | 'week' | 'progress' | 'profile'
const items = [
  { id: 'today' as const, label: 'Hoje', icon: ListTodo },
  { id: 'week' as const, label: 'Semana', icon: CalendarDays },
  { id: 'progress' as const, label: 'Progresso', icon: BarChart3 },
  { id: 'profile' as const, label: 'Ajustes', icon: Settings2 },
]

export function BottomNavigation({ active, onChange }: { active: Tab; onChange: (tab: Tab) => void }) {
  return <>
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[var(--nav)] pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl md:hidden">
      <div className="mx-auto grid max-w-lg grid-cols-4 px-2 py-1.5">{items.map(({ id, label, icon: Icon }) => {
        const selected = active === id
        return <button key={id} className={`focus-ring tap flex min-h-[56px] flex-col items-center justify-center gap-1 rounded-2xl text-[10px] font-semibold transition ${selected ? 'text-[var(--accent)]' : 'text-[var(--muted)]'}`} onClick={() => onChange(id)}><Icon size={20} strokeWidth={selected ? 2.35 : 1.8} /><span>{label}</span></button>
      })}</div>
    </nav>
    <aside className="fixed bottom-0 left-0 top-0 z-30 hidden w-64 border-r border-[var(--border)] bg-[var(--surface)] p-5 backdrop-blur-xl md:flex md:flex-col">
      <div className="mb-9 px-2 pt-2"><div className="text-xl font-semibold tracking-[-.03em]">Focus</div><div className="mt-1 text-xs text-[var(--muted)]">Seu sistema pessoal</div></div>
      <div className="space-y-1">{items.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => onChange(id)} className={`focus-ring tap flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition ${active === id ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'}`}><Icon size={19} />{label}</button>)}</div>
      <div className="mt-auto rounded-2xl border border-[var(--border)] p-3 text-xs leading-5 text-[var(--muted)]">Offline-first<br/><span className="text-[var(--success)]">●</span> Dados salvos neste dispositivo</div>
    </aside>
  </>
}
