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
  phaseId,
  phase,
  progress,
  onMarkRead,
  onBack,
  onGoToExercises,
  startAt,
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--bg-base)' }}>
        <p className="text-sm" style={{ color: 'var(--text-3)' }}>
          No hay lecciones en esta fase.
        </p>
        <button
          onClick={onGoToExercises}
          className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold"
          style={{ background: 'var(--grad)' }}
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
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>
      {/* Progress bar */}
      <div className="h-0.5 w-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${progressPct}%`, background: '#22c55e' }}
        />
      </div>

      {/* Nav */}
      <div
        className="px-5 py-3.5 flex items-center justify-between"
        style={{
          background: 'var(--nav-bg)',
          borderBottom: '1px solid var(--border-subtle)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm font-medium transition-all hover:opacity-70"
          style={{ color: 'var(--text-2)' }}
        >
          ← Volver
        </button>
        <span className="text-sm font-semibold" style={{ color: '#22c55e' }}>
          📖 Lección {idx + 1} de {lessons.length}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-7 max-w-2xl mx-auto w-full">
          {/* Breadcrumb */}
          <p
            className="text-xs font-bold uppercase tracking-widest mb-5"
            style={{ color: 'var(--text-3)' }}
          >
            FASE {phaseId} · {phase?.name}
          </p>

          <div
            key={currentLesson.id}
            className={slideDir === 'right' ? 'animate-slide-right' : 'animate-slide-left'}
          >
            {/* Title */}
            <div className="flex items-center gap-3 mb-7">
              <span className="text-3xl">{phase?.icon}</span>
              <h1 className="font-black text-2xl leading-tight" style={{ color: 'var(--text-1)' }}>
                {currentLesson.title}
              </h1>
            </div>

            {/* Content card */}
            <div
              className="rounded-2xl p-6 mb-4"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
            >
              {currentLesson.blocks.map((block, i) => (
                <LessonBlock key={i} block={block} />
              ))}
            </div>

            {(isCurrentRead || justMarked) && (
              <div
                className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl animate-fade-in"
                style={{
                  background: 'rgba(34,197,94,0.08)',
                  border: '1px solid rgba(34,197,94,0.20)',
                  color: '#a9dc76',
                }}
              >
                ✓ Lección leída
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div
        className="sticky bottom-0 px-4 py-3.5 flex items-center justify-between gap-3"
        style={{
          background: 'var(--nav-bg)',
          borderTop: '1px solid var(--border-subtle)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <button
          onClick={goPrev}
          className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-2)',
          }}
        >
          ← {idx === 0 ? 'Volver' : 'Anterior'}
        </button>

        {/* Dot indicators */}
        <div className="flex gap-1.5 items-center">
          {lessons.map((l, i) => {
            const read = !!readMap[l.id]
            return (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="rounded-full transition-all"
                style={{
                  width: i === idx ? 20 : 8,
                  height: 8,
                  background:
                    i === idx
                      ? '#22c55e'
                      : read
                        ? 'rgba(34,197,94,0.45)'
                        : 'rgba(255,255,255,0.15)',
                }}
              />
            )
          })}
        </div>

        <button
          onClick={goNext}
          className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: '#16a34a', boxShadow: '0 4px 14px rgba(22,163,74,0.30)' }}
        >
          {isLast ? (allRead ? 'Ir a ejercicios →' : 'Listo →') : 'Siguiente →'}
        </button>
      </div>
    </div>
  )
}
