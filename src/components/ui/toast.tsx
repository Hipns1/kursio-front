import { createContext, useCallback, useContext, useState } from 'react'

type ToastKind = 'success' | 'error' | 'info' | 'warning'

interface ToastItem {
  id: number
  message: string
  kind: ToastKind
}

interface ToastCtx {
  toast: (message: string, kind?: ToastKind) => void
}

const Ctx = createContext<ToastCtx>({ toast: () => {} })

let _id = 0

const ICONS: Record<ToastKind, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠'
}

const COLORS: Record<ToastKind, { bg: string; border: string; icon: string }> = {
  success: { bg: 'rgba(169,220,118,0.12)', border: 'rgba(169,220,118,0.30)', icon: '#a9dc76' },
  error: { bg: 'rgba(255,97,136,0.12)', border: 'rgba(255,97,136,0.30)', icon: '#ff6188' },
  info: { bg: 'rgba(171,157,242,0.12)', border: 'rgba(171,157,242,0.30)', icon: '#ab9df2' },
  warning: { bg: 'rgba(255,216,102,0.12)', border: 'rgba(255,216,102,0.30)', icon: '#ffd866' }
}

function Toaster({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: number) => void }) {
  if (toasts.length === 0) return null
  return (
    <div className='fixed top-4 right-4 z-9999 flex flex-col gap-2' style={{ pointerEvents: 'none' }}>
      {toasts.map((t) => {
        const c = COLORS[t.kind]
        return (
          <div
            key={t.id}
            className='animate-fade-up flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium'
            style={{
              background: 'var(--bg-card)',
              border: `1px solid ${c.border}`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
              pointerEvents: 'auto',
              maxWidth: '360px',
              minWidth: '240px'
            }}
          >
            <span
              className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black'
              style={{ background: c.bg, color: c.icon }}
            >
              {ICONS[t.kind]}
            </span>
            <span className='flex-1 leading-snug' style={{ color: 'var(--text-1)' }}>
              {t.message}
            </span>
            <button
              onClick={() => onDismiss(t.id)}
              className='flex h-5 w-5 shrink-0 items-center justify-center rounded text-xs transition-opacity hover:opacity-60'
              style={{ color: 'var(--text-3)' }}
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const toast = useCallback((message: string, kind: ToastKind = 'success') => {
    const id = ++_id
    setToasts((prev) => [...prev, { id, message, kind }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3800)
  }, [])

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <Toaster toasts={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </Ctx.Provider>
  )
}

export function useToast() {
  return useContext(Ctx)
}
