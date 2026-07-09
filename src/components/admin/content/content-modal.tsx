import type { ReactNode } from 'react'

export function ContentModal({
  children,
  onClose,
  title
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div
      className='fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[rgba(0,0,0,0.65)] p-4 backdrop-blur-[8px]'
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className='animate-fade-up bg-card border-hairline my-8 w-full max-w-4xl rounded-2xl border'>
        <div
          className='sticky top-0 z-10 flex items-center justify-between px-6 py-4'
          style={{
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border-subtle)',
            borderRadius: '1rem 1rem 0 0'
          }}
        >
          <h2 className='text-fg truncate pr-4 text-sm font-bold'>{title}</h2>
          <button
            onClick={onClose}
            className='text-fg-subtle bg-tint flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm transition-all hover:opacity-70'
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
