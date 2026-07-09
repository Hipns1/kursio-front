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
  onAnswer,
  onBack,
  onGoToLastLesson,
  onGrade,
  onNextPhase,
  phase,
  phaseId,
  progress,
  studentToken
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

  if (exercises.length === 0) {
    return (
      <div className='bg-surface flex min-h-screen flex-col'>
        <div className='bg-nav border-hairline flex items-center border-b px-5 py-3.5 backdrop-blur-[20px]'>
          <button
            onClick={onBack}
            className='text-fg-muted flex items-center gap-1.5 text-sm font-medium transition-all hover:opacity-70'
          >
            ← Volver
          </button>
        </div>
        <div className='flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center'>
          <span className='font-serif text-4xl font-normal'>🏗️</span>
          <p className='text-fg text-lg font-bold'>Esta fase todavía no tiene ejercicios</p>
          <p className='text-fg-subtle text-sm'>Revisá la teoría y volvé más adelante.</p>
          <button
            onClick={onNextPhase}
            className='bg-grad text-on-primary rounded-xl px-5 py-2.5 text-sm font-bold transition-all hover:opacity-90'
          >
            Continuar
          </button>
        </div>
      </div>
    )
  }

  const ex = exercises[idx]
  const progressPct = Math.round(((idx + 1) / exercises.length) * 100)
  const isCurrentAnswered = !!progress[ex.id]
  const allAnswered = exercises.every((e) => !!progress[e.id])
  const pendingReview = exercises.filter((e) => {
    const s = progress[e.id] as ExerciseRecord | undefined
    return s?.autoCorrect === null && !s.claudeFeedback
  }).length

  return (
    <div className='bg-surface flex min-h-screen flex-col'>
      <div className='bg-tint-strong h-0.5 w-full'>
        <div
          className='h-full transition-all duration-500'
          style={{
            background: 'var(--grad)',
            width: `${progressPct}%`
          }}
        />
      </div>

      <div className='bg-nav border-hairline flex items-center justify-between border-b px-5 py-3.5 backdrop-blur-[20px]'>
        <button
          onClick={onBack}
          className='text-fg-muted flex items-center gap-1.5 text-sm font-medium transition-all hover:opacity-70'
        >
          ← Volver
        </button>
        <div className='flex items-center gap-3'>
          {pendingReview > 0 && (
            <span className='bg-warning-bg border-warning-border text-warning rounded-full border px-2 py-0.5 text-xs font-semibold'>
              🤖 {pendingReview} por revisar
            </span>
          )}
          <span className='text-primary text-sm font-semibold'>
            🏆 Ejercicio {idx + 1} de {exercises.length}
          </span>
        </div>
      </div>

      <div className='flex-1 overflow-y-auto'>
        <div className='mx-auto w-full max-w-2xl px-4 py-6'>
          <p className='text-fg-subtle mb-4 text-xs font-bold tracking-widest uppercase'>
            FASE {phaseId} · {phase?.name}
          </p>

          <div
            key={ex.id}
            className={`rounded-2xl p-5 ${slideDir === 'right' ? 'animate-slide-right' : 'animate-slide-left'}`}
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.30)'
            }}
          >
            <div className='mb-3 flex items-center gap-2'>
              <TypeBadge type={ex.type} />
              <span className='text-fg-subtle font-mono text-xs'>{ex.id}</span>
            </div>
            <p className='text-fg mb-4 text-sm leading-relaxed font-medium'>{ex.question}</p>
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

      <div className='bg-nav border-hairline sticky bottom-0 flex items-center justify-between gap-3 border-t px-4 py-3.5 backdrop-blur-[20px]'>
        <button
          onClick={() => (idx === 0 ? onGoToLastLesson() : goTo(idx - 1))}
          className='bg-elevated border-hairline text-fg-muted rounded-xl border px-5 py-2.5 text-sm font-medium transition-all hover:opacity-80'
        >
          ← Anterior
        </button>

        <div className='flex items-center gap-1.5'>
          {exercises.map((e, i) => {
            const s = progress[e.id] as ExerciseRecord | undefined
            const isPending = s?.autoCorrect === null && !s.claudeFeedback
            const isGraded = s && (s.autoCorrect !== null || s.claudeFeedback)
            return (
              <button
                key={i}
                onClick={() => {
                  const canJump = i <= idx || !!progress[exercises[i].id]
                  if (canJump) goTo(i)
                }}
                className='rounded-full transition-all'
                style={{
                  background:
                    i === idx
                      ? 'var(--primary)'
                      : isPending
                        ? 'var(--warning)'
                        : isGraded
                          ? 'var(--success)'
                          : 'var(--tint-2)',
                  cursor: i <= idx || !!progress[exercises[i].id] ? 'pointer' : 'not-allowed',
                  height: 8,
                  opacity: i > idx && !progress[exercises[i].id] ? 0.4 : 1,
                  width: i === idx ? 20 : 8
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
            className='text-on-primary rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90'
            style={{
              background: 'var(--grad)',
              boxShadow: isCurrentAnswered ? '0 4px 14px var(--primary-glow)' : 'none',
              cursor: isCurrentAnswered ? 'pointer' : 'not-allowed',
              opacity: isCurrentAnswered ? 1 : 0.35
            }}
          >
            Siguiente →
          </button>
        ) : (
          <button
            onClick={() => allAnswered && onNextPhase()}
            disabled={!allAnswered}
            title={!allAnswered ? 'Completá todos los ejercicios para continuar' : undefined}
            className='text-on-primary rounded-xl px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90'
            style={{
              background: 'var(--grad-success)',
              boxShadow: allAnswered ? '0 4px 14px var(--success-border)' : 'none',
              cursor: allAnswered ? 'pointer' : 'not-allowed',
              opacity: allAnswered ? 1 : 0.35
            }}
          >
            {phaseId + 1 < PHASES.length ? 'Siguiente Fase →' : '🏁 Ver resumen →'}
          </button>
        )}
      </div>
    </div>
  )
}
