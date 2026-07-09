import type { ReactNode } from 'react'

export function Modal({ children, onClose }: { onClose: () => void; children: ReactNode }) {
  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.65)] p-4 backdrop-blur-[8px]'
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className='animate-fade-up bg-card border-hairline w-full max-w-lg rounded-2xl border'>{children}</div>
    </div>
  )
}
