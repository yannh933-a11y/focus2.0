import { createContext, useCallback, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'

const ToastContext = createContext<(message: string) => void>(() => undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null)
  const show = useCallback((text: string) => {
    setMessage(text)
    window.setTimeout(() => setMessage(current => current === text ? null : current), 2200)
  }, [])
  return <ToastContext.Provider value={show}>{children}<AnimatePresence>{message && <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="fixed left-1/2 top-[calc(16px+env(safe-area-inset-top))] z-[100] flex -translate-x-1/2 items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold shadow-soft"><CheckCircle2 size={17} className="text-[var(--success)]" />{message}</motion.div>}</AnimatePresence></ToastContext.Provider>
}

export const useToast = () => useContext(ToastContext)
