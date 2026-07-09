import { useState } from 'react'
import type { Progress } from '@/types/learning'
import { LESSONS } from '@/utils/consts/learning-data'
import { LessonBlock } from './lesson-block'

interface Phase {
  id: number
  name: string
  icon: string
}

interface LessonsTabProps {
  phaseId: number
  phase?: Phase
  progress: Progress
  onMarkRead: (lessonId: string) => void
  onBack: () => void
  onGoToExercises: () => void
  startAt?: number
}

export function LessonsTab({
  onBack,
  onGoToExercises,
  onMarkRead,
  phase,
  phaseId,
  progress,
  startAt
}: LessonsTabProps) {
  const lessons = LESSONS.filter((l) => l.phase === phaseId)
  const readMap = progress.__lessons || {}

  const [idx, setIdx] = useState(() => {
    if (startAt !== undefined) return startAt
    const firstUnread = lessons.findIndex((l) => !readMap[l.id])
    return firstUnread !== -1 ? firstUnread : 0
  })
  const [slideDir, setSlideDir] = useState<'right' | 'left'>('right')

  const goTo = (newIdx: number) => {
    setSlideDir(newIdx > idx ? 'right' : 'left')
    setIdx(newIdx)
  }

  if (lessons.length === 0) {
    return (
      <div className='bg-surface flex min-h-screen flex-col items-center justify-center gap-4'>
        <p className='text-fg-subtle text-sm'>No hay lecciones en esta fase.</p>
        <button
          onClick={onGoToExercises}
          className='bg-grad text-on-primary rounded-xl px-5 py-2.5 text-sm font-semibold'
        >
          Ir a ejercicios →
        </button>
      </div>
    )
  }

  const currentLesson = lessons[idx]
  const isCurrentRead = !!readMap[currentLesson.id]
  const allRead = lessons.every((l) => readMap[l.id])
  const progressPct = Math.round(((idx + 1) / lessons.length) * 100)
  const isLast = idx === lessons.length - 1

  const [justMarked, setJustMarked] = useState(false)

  const goNext = () => {
    if (!isCurrentRead) {
      onMarkRead(currentLesson.id)
      setJustMarked(true)
      setTimeout(() => {
        setJustMarked(false)
        if (!isLast) goTo(idx + 1)
        else onGoToExercises()
      }, 600)
    } else {
      if (!isLast) goTo(idx + 1)
      else onGoToExercises()
    }
  }

  const goPrev = () => {
    if (idx > 0) goTo(idx - 1)
    else onBack()
  }

  return (
    <div className='bg-surface flex min-h-screen flex-col'>
      <div className='bg-tint-strong h-0.5 w-full'>
        <div
          className='h-full transition-all duration-500'
          style={{ background: 'var(--success)', width: `${progressPct}%` }}
        />
      </div>

      <div className='bg-nav border-hairline flex items-center justify-between border-b px-5 py-3.5 backdrop-blur-[20px]'>
        <button
          onClick={onBack}
          className='text-fg-muted flex items-center gap-1.5 text-sm font-medium transition-all hover:opacity-70'
        >
          ← Volver
        </button>
        <span className='text-success text-sm font-semibold'>
          📖 Lección {idx + 1} de {lessons.length}
        </span>
      </div>

      <div className='flex-1 overflow-y-auto'>
        <div className='mx-auto w-full max-w-2xl px-4 py-7'>
          <p className='text-fg-subtle mb-5 text-xs font-bold tracking-widest uppercase'>
            FASE {phaseId} · {phase?.name}
          </p>

          <div key={currentLesson.id} className={slideDir === 'right' ? 'animate-slide-right' : 'animate-slide-left'}>
            <div className='mb-7 flex items-center gap-3'>
              <span className='font-serif text-3xl font-normal'>{phase?.icon}</span>
              <h1 className='text-fg font-serif text-2xl leading-tight font-normal'>{currentLesson.title}</h1>
            </div>

            <div className='bg-card border-hairline mb-4 rounded-2xl border p-6'>
              {currentLesson.blocks.map((block, i) => (
                <LessonBlock key={i} block={block} />
              ))}
            </div>

            {(isCurrentRead || justMarked) && (
              <div className='animate-fade-in text-success flex items-center gap-2 rounded-xl border border-[rgba(34,197,94,0.20)] bg-[rgba(34,197,94,0.08)] px-4 py-2.5 text-xs font-semibold'>
                ✓ Lección leída
              </div>
            )}
          </div>
        </div>
      </div>

      <div className='bg-nav border-hairline sticky bottom-0 flex items-center justify-between gap-3 border-t px-4 py-3.5 backdrop-blur-[20px]'>
        <button
          onClick={goPrev}
          className='bg-elevated border-hairline text-fg-muted rounded-xl border px-5 py-2.5 text-sm font-medium transition-all hover:opacity-80'
        >
          ← {idx === 0 ? 'Volver' : 'Anterior'}
        </button>

        <div className='flex items-center gap-1.5'>
          {lessons.map((l, i) => {
            const read = !!readMap[l.id]
            return (
              <button
                key={i}
                onClick={() => goTo(i)}
                className='rounded-full transition-all'
                style={{
                  background: i === idx ? 'var(--success)' : read ? 'var(--success-border)' : 'var(--tint-2)',
                  height: 8,
                  width: i === idx ? 20 : 8
                }}
              />
            )
          })}
        </div>

        <button
          onClick={goNext}
          className='rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90'
          style={{ background: '#16a34a', boxShadow: '0 4px 14px rgba(22,163,74,0.30)' }}
        >
          {isLast ? (allRead ? 'Ir a ejercicios →' : 'Listo →') : 'Siguiente →'}
        </button>
      </div>
    </div>
  )
}
