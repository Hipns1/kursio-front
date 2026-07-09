import type { ReactNode } from 'react'

interface PageHeaderProps {
  eyebrow?: string
  title: string
  subtitle?: ReactNode
  actions?: ReactNode
}

export function PageHeader({ actions, eyebrow, subtitle, title }: PageHeaderProps) {
  return (
    <div className='border-hairline mb-8 border-b pb-6'>
      <div className='flex items-end justify-between gap-6'>
        <div className='min-w-0'>
          {eyebrow && <p className='text-fg-subtle mb-2 font-mono text-xs tracking-widest uppercase'>{eyebrow}</p>}
          <h1 className='text-fg font-serif text-3xl leading-tight font-normal'>{title}</h1>
          {subtitle && <p className='text-fg-muted mt-2 text-sm'>{subtitle}</p>}
        </div>
        {actions && <div className='flex shrink-0 items-center gap-2'>{actions}</div>}
      </div>
    </div>
  )
}
