import { useEffect, useState } from 'react'
import type { ExerciseRecord, GradeResult, Progress } from '@/types/learning'
import { CodeBlock, TypeBadge } from '@/components/ui'
import { PHASES } from '@/utils/consts/learning-data'
import { getPhaseExercises } from '@/utils/helpers/learning'
import { CodeAlong } from './code-along'
import { CompleteCode } from './complete-code'
import { FindBug } from './find-bug'
import { ImproveCode } from './improve-code'
import { KnowOutput } from './know-output'
import { MultipleChoice } from './multiple-choice'

interface Phase {
  id: number
  name: string
  icon: string
}

interface ExercisesTabProps {
  phaseId: number
  phase?: Phase
  progress: Progress
  onAnswer: (exerciseId: string, record: ExerciseRecord) => void
  studentToken: string | null
  onGrade?: (exerciseId: string, result: GradeResult) => void
  onNextPhase: () => void
  onBack: () => void
  onGoToLastLesson: () => void
}

export function ExercisesTab({
  phaseId,
  phase,
  progress,
  onAnswer,
  studentToken,
  onGrade,
  onNextPhase,
  onBack,
  onGoToLastLesson,
}: ExercisesTabProps) {
  const exercises = getPhaseExercises(phaseId)
  const firstUnanswered = exercises.findIndex((e) => !progress[e.id])
  const [idx, setIdx] = useState(firstUnanswered !== -1 ? firstUnanswered : 0)
  const [slideDir, setSlideDir] = useState<'right' | 'left'>('right')

  const goTo = (newIdx: number) => {
    setSlideDir(newIdx > idx ? 'right' : 'left')
    setIdx(newIdx)
  }

  useEffect(() => {
    const first = exercises.findIndex((e) => !progress[e.id])
    setIdx(first !== -1 ? first : 0)
  }, [phaseId])

  const ex = exercises[idx]
  const progressPct = exercises.length > 0 ? Math.round(((idx + 1) / exercises.length) * 100) : 100
  const isCurrentAnswered = !!progress[ex.id]
  const allAnswered = exercises.every((e) => !!progress[e.id])
  const pendingReview = exercises.filter((e) => {
    const s = progress[e.id] as ExerciseRecord | undefined
    return s && s.autoCorrect === null && !s.claudeFeedback
  }).length

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-base)' }}>
      {/* Progress bar */}
      <div className="h-0.5 w-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${progressPct}%`,
            background: 'linear-gradient(90deg,#ab9df2,#8b5cf6)',
          }}
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
        <div className="flex items-center gap-3">
          {pendingReview > 0 && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{
                background: 'var(--warning-bg)',
                color: '#ffd866',
                border: '1px solid rgba(255,216,102,0.20)',
              }}
            >
              🤖 {pendingReview} por revisar
            </span>
          )}
          <span className="text-sm font-semibold" style={{ color: '#a78bfa' }}>
            🏆 Ejercicio {idx + 1} de {exercises.length}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-6 max-w-2xl mx-auto w-full">
          {/* Breadcrumb */}
          <p
            className="text-xs font-bold uppercase tracking-widest mb-4"
            style={{ color: 'var(--text-3)' }}
          >
            FASE {phaseId} · {phase?.name}
          </p>

          {/* Exercise card */}
          <div
            key={ex.id}
            className={`rounded-2xl p-5 ${slideDir === 'right' ? 'animate-slide-right' : 'animate-slide-left'}`}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.30)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <TypeBadge type={ex.type} />
              <span className="text-xs font-mono" style={{ color: 'var(--text-3)' }}>
                {ex.id}
              </span>
            </div>
            <p className="text-sm font-medium mb-4 leading-relaxed" style={{ color: 'var(--text-1)' }}>
              {ex.question}
            </p>
            {ex.code && ex.type !== 'complete-code' && <CodeBlock code={ex.code} />}

            {ex.type === 'multiple-choice' && (
              <MultipleChoice
                exercise={ex}
                saved={progress[ex.id] as ExerciseRecord | undefined}
                onAnswer={(d) => onAnswer(ex.id, d)}
              />
            )}
            {ex.type === 'know-output' && (
              <KnowOutput
                exercise={ex}
                saved={progress[ex.id] as ExerciseRecord | undefined}
                onAnswer={(d) => onAnswer(ex.id, d)}
              />
            )}
            {ex.type === 'find-bug' && (
              <FindBug
                exercise={ex}
                saved={progress[ex.id] as ExerciseRecord | undefined}
                onAnswer={(d) => onAnswer(ex.id, d)}
                studentToken={studentToken}
                onGrade={onGrade}
              />
            )}
            {ex.type === 'improve-code' && (
              <ImproveCode
                exercise={ex}
                saved={progress[ex.id] as ExerciseRecord | undefined}
                onAnswer={(d) => onAnswer(ex.id, d)}
                studentToken={studentToken}
                onGrade={onGrade}
              />
            )}
            {ex.type === 'complete-code' && (
              <CompleteCode
                exercise={ex}
                saved={progress[ex.id] as ExerciseRecord | undefined}
                onAnswer={(d) => onAnswer(ex.id, d)}
              />
            )}
            {ex.type === 'code-along' && (
              <CodeAlong
                exercise={ex}
                saved={progress[ex.id] as ExerciseRecord | undefined}
                onAnswer={(d) => onAnswer(ex.id, d)}
                studentToken={studentToken}
                onGrade={onGrade}
              />
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
          onClick={() => (idx === 0 ? onGoToLastLesson() : goTo(idx - 1))}
          className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-2)',
          }}
        >
          ← Anterior
        </button>

        {/* Dot indicators */}
        <div className="flex gap-1.5 items-center">
          {exercises.map((e, i) => {
            const s = progress[e.id] as ExerciseRecord | undefined
            const isPending = s && s.autoCorrect === null && !s.claudeFeedback
            const isGraded = s && (s.autoCorrect !== null || s.claudeFeedback)
            return (
              <button
                key={i}
                onClick={() => {
                  const canJump = i <= idx || !!progress[exercises[i].id]
                  if (canJump) goTo(i)
                }}
                className="rounded-full transition-all"
                style={{
                  width: i === idx ? 20 : 8,
                  height: 8,
                  background:
                    i === idx
                      ? '#ab9df2'
                      : isPending
                        ? 'var(--warning)'
                        : isGraded
                          ? 'var(--success)'
                          : 'rgba(255,255,255,0.12)',
                  cursor: i <= idx || !!progress[exercises[i].id] ? 'pointer' : 'not-allowed',
                  opacity: i > idx && !progress[exercises[i].id] ? 0.4 : 1,
                }}
              />
            )
          })}
        </div>

        {idx < exercises.length - 1 ? (
          <button
            onClick={() => isCurrentAnswered && goTo(idx + 1)}
            disabled={!isCurrentAnswered}
            title={!isCurrentAnswered ? 'Respondé este ejercicio para continuar' : undefined}
            className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
            style={{
              background: 'var(--grad)',
              boxShadow: isCurrentAnswered ? '0 4px 14px var(--primary-glow)' : 'none',
              opacity: isCurrentAnswered ? 1 : 0.35,
              cursor: isCurrentAnswered ? 'pointer' : 'not-allowed',
            }}
          >
            Siguiente →
          </button>
        ) : (
          <button
            onClick={() => allAnswered && onNextPhase()}
            disabled={!allAnswered}
            title={!allAnswered ? 'Completá todos los ejercicios para continuar' : undefined}
            className="px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg,#a9dc76,#75a73e)',
              boxShadow: allAnswered ? '0 4px 14px rgba(169,220,118,0.30)' : 'none',
              opacity: allAnswered ? 1 : 0.35,
              cursor: allAnswered ? 'pointer' : 'not-allowed',
            }}
          >
            {phaseId + 1 < PHASES.length ? 'Siguiente Fase →' : '🏁 Ver resumen →'}
          </button>
        )}
      </div>
    </div>
  )
}
