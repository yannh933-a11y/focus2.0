import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  full?: boolean
}

export function Button({ children, variant = 'primary', full, className = '', ...props }: Props) {
  const variants = {
    primary: 'bg-[var(--accent)] text-white hover:brightness-110',
    secondary: 'bg-[var(--surface-2)] text-[var(--text)] border border-[var(--border)] hover:brightness-110',
    ghost: 'bg-transparent text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]',
    danger: 'bg-red-500/[0.12] text-red-400 border border-red-500/20 hover:bg-red-500/18',
  }
  return <button className={`focus-ring tap min-h-11 rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${variants[variant]} ${full ? 'w-full' : ''} ${className}`} {...props}>{children}</button>
}
