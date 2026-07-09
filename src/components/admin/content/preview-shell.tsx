import type { ReactNode } from 'react'

export function PreviewShell({ children }: { children: ReactNode }) {
  return (
    <div className='sticky top-4'>
      <div
        className='flex items-center gap-2 rounded-t-2xl px-4 py-2.5'
        style={{
          background: 'var(--accent-glow)',
          border: '1px solid var(--accent-glow)',
          borderBottom: 'none'
        }}
      >
        <span className='h-2 w-2 animate-pulse rounded-full bg-[var(--success)]' />
        <span className='text-accent text-xs font-bold tracking-widest uppercase'>Vista previa en vivo</span>
      </div>
      <div className='bg-surface-raised border-line max-h-[65vh] min-h-[220px] overflow-y-auto rounded-b-2xl border p-5'>
        {children}
      </div>
    </div>
  )
}
