import type { Course, ExerciseRecord, Progress } from '@/types/learning'
import { TypeBadge } from '@/components/ui'
import { PHASES, EXERCISES } from '@/utils/consts/learning-data'
import { getExerciseScore } from '@/utils/helpers/learning'

interface ScoresViewProps {
  progress: Progress
  courseData?: Course | null
}

export function ScoresView({ courseData, progress }: ScoresViewProps) {
  const phases = courseData ? courseData.phases : PHASES
  const allExercises = courseData ? courseData.phases.flatMap((p) => p.exercises) : EXERCISES

  if (phases.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center gap-2 py-16'>
        <p className='text-fg-subtle text-sm'>No hay datos del curso disponibles.</p>
      </div>
    )
  }

  return (
    <div className='space-y-5'>
      {phases.map((ph) => {
        const exercises = allExercises.filter((e) => e.phase === ph.id)
        const scores = exercises
          .map((e) => getExerciseScore(progress[e.id] as ExerciseRecord | undefined))
          .filter((s): s is number => s !== null)
        const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
        const scoredCount = scores.length

        const avgColor =
          avg === null ? null : avg >= 80 ? 'var(--success)' : avg >= 50 ? 'var(--warning)' : 'var(--danger)'
        const avgBg =
          avg === null ? null : avg >= 80 ? 'var(--success-bg)' : avg >= 50 ? 'var(--warning-bg)' : 'var(--danger-bg)'
        const avgBorder =
          avg === null
            ? null
            : avg >= 80
              ? 'var(--success-border)'
              : avg >= 50
                ? 'var(--warning-border)'
                : 'var(--danger-border)'

        return (
          <div key={ph.id}>
            <div className='mb-2.5 flex items-center justify-between px-1'>
              <h3 className='text-fg-muted text-sm font-bold'>
                {ph.icon} Fase {ph.id + 1} — {ph.name}
              </h3>
              {avg !== null ? (
                <span
                  className='rounded-full px-2.5 py-1 font-mono text-xs font-bold'
                  style={{ background: avgBg!, border: `1px solid ${avgBorder!}`, color: avgColor! }}
                >
                  ⭐ {avg}/100{' '}
                  <span className='opacity-70'>
                    ({scoredCount}/{exercises.length})
                  </span>
                </span>
              ) : (
                <span className='text-fg-subtle text-xs italic'>Sin calificar</span>
              )}
            </div>

            {exercises.length === 0 ? (
              <p className='text-fg-subtle px-3.5 py-2.5 text-xs'>Sin ejercicios en esta fase.</p>
            ) : (
              <div className='space-y-1.5'>
                {exercises.map((ex) => {
                  const saved = progress[ex.id] as ExerciseRecord | undefined
                  const score = getExerciseScore(saved)
                  const isPending = saved?.autoCorrect === null && !saved.claudeFeedback
                  const scoreColor =
                    score === null
                      ? null
                      : score >= 80
                        ? 'var(--success)'
                        : score >= 50
                          ? 'var(--warning)'
                          : 'var(--danger)'

                  return (
                    <div
                      key={ex.id}
                      className='bg-card border-hairline flex items-center gap-2.5 rounded-xl border px-3.5 py-2.5 transition-all'
                    >
                      <TypeBadge type={ex.type} />
                      <span className='text-fg-subtle hidden shrink-0 font-mono text-xs sm:block'>{ex.id}</span>
                      <span className='text-fg-muted flex-1 truncate text-xs'>
                        {ex.question.slice(0, 60)}
                        {ex.question.length > 60 ? '…' : ''}
                      </span>
                      {score !== null ? (
                        <span
                          className='shrink-0 rounded-full px-2 py-0.5 font-mono text-xs font-bold'
                          style={{
                            background:
                              score >= 80
                                ? 'var(--success-bg)'
                                : score >= 50
                                  ? 'var(--warning-bg)'
                                  : 'var(--danger-bg)',
                            color: scoreColor!
                          }}
                        >
                          {score}/100
                        </span>
                      ) : isPending ? (
                        <span className='border-warning-border bg-warning-bg text-warning shrink-0 rounded-full border px-2 py-0.5 text-xs font-semibold'>
                          ⏳ Pendiente
                        </span>
                      ) : !saved ? (
                        <span className='text-fg-subtle shrink-0 text-xs'>—</span>
                      ) : (
                        <span className='text-fg-subtle shrink-0 text-xs'>?</span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
