import { AnimatePresence, motion } from 'framer-motion'
import { Button } from './Button'

export function ConfirmDialog({ open, title, description, onCancel, onConfirm, confirmLabel = 'Excluir' }: { open: boolean; title: string; description: string; onCancel: () => void; onConfirm: () => void; confirmLabel?: string }) {
  return <AnimatePresence>{open && <div className="fixed inset-0 z-[70] grid place-items-center px-5">
    <motion.button aria-label="Cancelar" className="absolute inset-0 bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel} />
    <motion.div className="surface relative z-10 w-full max-w-sm p-5 shadow-soft" initial={{ opacity: 0, scale: .96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .96 }}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">{description}</p>
      <div className="mt-5 flex justify-end gap-2"><Button variant="ghost" onClick={onCancel}>Cancelar</Button><Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button></div>
    </motion.div>
  </div>}</AnimatePresence>
}
