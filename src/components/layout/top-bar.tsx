import type { ReactNode } from 'react'

export function TopBar({ actions, children }: { children: ReactNode; actions?: ReactNode }) {
  return (
    <header className='bg-nav border-hairline sticky top-0 z-20 border-b backdrop-blur-[20px]'>
      <div className='mx-auto flex h-14 max-w-6xl items-center gap-4 px-5'>
        <div className='flex min-w-0 flex-1 items-center gap-4'>{children}</div>
        {actions && <div className='flex shrink-0 items-center gap-2'>{actions}</div>}
      </div>
    </header>
  )
}

export function TopBarButton({
  children,
  onClick,
  title
}: {
  children: ReactNode
  onClick: () => void
  title?: string
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className='border-hairline text-fg-muted hover:text-fg rounded border px-2.5 py-1.5 text-xs font-medium transition-colors'
    >
      {children}
    </button>
  )
}
