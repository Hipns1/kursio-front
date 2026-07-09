import type { ReactNode } from 'react'

type Width = 'reading' | 'wide'

const WIDTH: Record<Width, string> = {
  reading: 'max-w-3xl',
  wide: 'max-w-6xl'
}

export function ReadingColumn({ children, width = 'reading' }: { children: ReactNode; width?: Width }) {
  return <div className={`mx-auto w-full ${WIDTH[width]} px-5 py-10`}>{children}</div>
}
