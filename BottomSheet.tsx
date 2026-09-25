import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'

export function BottomSheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  return <AnimatePresence>
    {open && <>
      <motion.button aria-label="Fechar" className="fixed inset-0 z-40 bg-black/[0.55] backdrop-blur-[2px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.section className="fixed inset-x-0 bottom-0 z-50 mx-auto max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-[28px] border border-[var(--border)] bg-[var(--surface)] px-5 pb-[calc(24px+env(safe-area-inset-bottom))] pt-3 shadow-soft md:bottom-6 md:rounded-[28px]" initial={{ y: '100%', opacity: .8 }} animate={{ y: 0, opacity: 1 }} exit={{ y: '100%', opacity: .8 }} transition={{ type: 'spring', damping: 30, stiffness: 340 }}>
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[var(--muted)]/30 md:hidden" />
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button className="focus-ring tap flex h-11 w-11 items-center justify-center rounded-full text-[var(--muted)] hover:bg-[var(--surface-2)]" onClick={onClose}><X size={20} /></button>
        </div>
        {children}
      </motion.section>
    </>}
  </AnimatePresence>
}
