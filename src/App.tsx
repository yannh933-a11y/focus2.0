import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useFocus } from './context/FocusContext'
import { BottomNavigation, type Tab } from './components/navigation/BottomNavigation'
import { TodayPage } from './pages/Today/TodayPage'
import { WeekPage } from './pages/Week/WeekPage'
import { ProgressPage } from './pages/Progress/ProgressPage'
import { ProfilePage } from './pages/Profile/ProfilePage'
import { ToastProvider } from './components/ui/Toast'
import { NotificationWatcher } from './components/tasks/NotificationWatcher'
import { ActiveTimerBar } from './components/tasks/ActiveTimerBar'
import { useTheme } from './hooks/useTheme'

const pages = { today: TodayPage, week: WeekPage, progress: ProgressPage, profile: ProfilePage }

function AppContent(){
  const { hydrated } = useFocus()
  const [tab,setTab]=useState<Tab>(()=>(localStorage.getItem('focus-tab') as Tab)||'week')
  useTheme()
  const change=(next:Tab)=>{setTab(next);localStorage.setItem('focus-tab',next);window.scrollTo({top:0,behavior:'smooth'})}
  const Page=pages[tab]

  if(!hydrated) return <div className="min-h-dvh bg-[var(--bg)] px-5 pt-[calc(28px+env(safe-area-inset-top))] md:ml-64 md:px-8"><div className="mx-auto max-w-5xl animate-pulse"><div className="h-3 w-20 rounded bg-[var(--surface)]"/><div className="mt-4 h-9 w-48 rounded bg-[var(--surface)]"/><div className="mt-8 h-28 rounded-[22px] bg-[var(--surface)]"/><div className="mt-4 h-52 rounded-[22px] bg-[var(--surface)]"/></div></div>

  return <>
    <NotificationWatcher />
    <main className="min-h-dvh pb-[calc(112px+env(safe-area-inset-bottom))] pt-[calc(22px+env(safe-area-inset-top))] md:ml-64 md:pb-14 md:pt-10">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8"><AnimatePresence mode="wait"><motion.div key={tab} initial={{opacity:0,y:5}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-3}} transition={{duration:.15}}><Page/></motion.div></AnimatePresence></div>
    </main>
    <ActiveTimerBar />
    <BottomNavigation active={tab} onChange={change}/>
  </>
}

export default function App(){return <ToastProvider><AppContent/></ToastProvider>}
