import { useState } from 'react'
import type { Lesson } from '@/types/learning'
import { LessonBlock } from './lesson-block'

interface LessonCardProps {
  lesson: Lesson
  idx: number
  isRead: boolean
  onRead: () => void
}

export function LessonCard({ lesson, idx, isRead, onRead }: LessonCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{
        border: isRead ? '1px solid rgba(169,220,118,0.25)' : '1px solid var(--border-subtle)',
        background: isRead ? 'rgba(169,220,118,0.05)' : 'var(--bg-card)',
      }}
    >
      <button className="w-full text-left px-4 py-3.5 flex items-center gap-3" onClick={() => setOpen((o) => !o)}>
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          style={{
            background: isRead ? 'var(--success)' : 'rgba(255,255,255,0.05)',
            color: isRead ? '#fff' : 'var(--text-3)',
            border: isRead ? 'none' : '1px solid var(--border-subtle)',
          }}
        >
          {isRead ? '✓' : idx + 1}
        </span>
        <span className="text-sm font-medium flex-1 text-left" style={{ color: isRead ? '#6EE7B7' : 'var(--text-1)' }}>
          {lesson.title}
        </span>
        <span className="text-xs ml-2" style={{ color: 'var(--text-3)' }}>
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div className="px-4 pb-4 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {lesson.blocks.map((block, i) => (
            <LessonBlock key={i} block={block} />
          ))}
          {!isRead ? (
            <button
              onClick={onRead}
              className="w-full mt-3 text-white font-semibold py-2.5 rounded-xl text-sm transition-all"
              style={{ background: 'var(--success)', boxShadow: '0 4px 12px rgba(169,220,118,0.25)' }}
            >
              ✓ Marcar como leído
            </button>
          ) : (
            <p className="text-center text-xs font-medium mt-2 py-2" style={{ color: 'var(--success)' }}>
              ✓ Leído
            </p>
          )}
        </div>
      )}
    </div>
  )
}
