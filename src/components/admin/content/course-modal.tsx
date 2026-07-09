import type { ReactNode } from 'react'

export function CourseModal({ children, onClose, title }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.65)] p-4 backdrop-blur-[8px]'
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className='animate-fade-up bg-card border-hairline w-full max-w-lg rounded-2xl border'>
        <div className='border-hairline flex items-center justify-between border-b px-6 py-4'>
          <h2 className='text-fg text-sm font-bold'>{title}</h2>
          <button
            onClick={onClose}
            className='text-fg-subtle bg-tint flex h-7 w-7 items-center justify-center rounded-lg text-sm transition-all hover:opacity-70'
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
