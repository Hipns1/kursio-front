import { useState } from 'react'
import type { Lesson } from '@/types/learning'
import { LessonBlock } from './lesson-block'

interface LessonCardProps {
  lesson: Lesson
  idx: number
  isRead: boolean
  onRead: () => void
}

export function LessonCard({ idx, isRead, lesson, onRead }: LessonCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className='overflow-hidden rounded-xl transition-all duration-200'
      style={{
        background: isRead ? 'var(--success-bg)' : 'var(--bg-card)',
        border: isRead ? '1px solid var(--success-border)' : '1px solid var(--border-subtle)'
      }}
    >
      <button className='flex w-full items-center gap-3 px-4 py-3.5 text-left' onClick={() => setOpen((o) => !o)}>
        <span
          className='flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold'
          style={{
            background: isRead ? 'var(--success)' : 'var(--tint-2)',
            border: isRead ? 'none' : '1px solid var(--border-subtle)',
            color: isRead ? 'var(--on-primary)' : 'var(--text-3)'
          }}
        >
          {isRead ? '✓' : idx + 1}
        </span>
        <span
          className='flex-1 text-left text-sm font-medium'
          style={{ color: isRead ? 'var(--success)' : 'var(--text-1)' }}
        >
          {lesson.title}
        </span>
        <span className='text-fg-subtle ml-2 text-xs'>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className='border-hairline border-t px-4 pt-3 pb-4'>
          {lesson.blocks.map((block, i) => (
            <LessonBlock key={i} block={block} />
          ))}
          {!isRead ? (
            <button
              onClick={onRead}
              className='text-on-primary mt-3 w-full rounded-xl py-2.5 text-sm font-semibold transition-all'
              style={{ background: 'var(--success)', boxShadow: '0 4px 12px var(--success-border)' }}
            >
              ✓ Marcar como leído
            </button>
          ) : (
            <p className='text-success mt-2 py-2 text-center text-xs font-medium'>✓ Leído</p>
          )}
        </div>
      )}
    </div>
  )
}
