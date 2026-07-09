import type { Course, ExerciseRecord, Progress } from '@/types/learning'
import { TypeBadge } from '@/components/ui'
import { PHASES, EXERCISES } from '@/utils/consts/learning-data'
import { getExerciseScore } from '@/utils/helpers/learning'

interface ScoresViewProps {
  progress: Progress
  courseData?: Course | null
}

export function ScoresView({ progress, courseData }: ScoresViewProps) {
  // Prefer course-specific data over mutable globals
  const phases = courseData ? courseData.phases : PHASES
  const allExercises = courseData
    ? courseData.phases.flatMap((p) => p.exercises)
    : EXERCISES

  if (phases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-2">
        <p className="text-sm" style={{ color: 'var(--text-3)' }}>No hay datos del curso disponibles.</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {phases.map((ph) => {
        const exercises = allExercises.filter((e) => e.phase === ph.id)
        const scores = exercises
          .map((e) => getExerciseScore(progress[e.id] as ExerciseRecord | undefined))
          .filter((s): s is number => s !== null)
        const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
        const scoredCount = scores.length

        const avgColor = avg === null ? null : avg >= 80 ? '#6EE7B7' : avg >= 50 ? '#ffd866' : '#ffb3c6'
        const avgBg = avg === null ? null : avg >= 80 ? 'rgba(169,220,118,0.10)' : avg >= 50 ? 'rgba(255,216,102,0.10)' : 'rgba(255,97,136,0.10)'
        const avgBorder = avg === null ? null : avg >= 80 ? 'rgba(169,220,118,0.22)' : avg >= 50 ? 'rgba(255,216,102,0.22)' : 'rgba(255,97,136,0.22)'

        return (
          <div key={ph.id}>
            <div className="flex items-center justify-between mb-2.5 px-1">
              <h3 className="font-bold text-sm" style={{ color: 'var(--text-2)' }}>
                {ph.icon} Fase {ph.id + 1} — {ph.name}
              </h3>
              {avg !== null ? (
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full font-mono"
                  style={{ background: avgBg!, color: avgColor!, border: `1px solid ${avgBorder!}` }}
                >
                  ⭐ {avg}/100{' '}
                  <span style={{ opacity: 0.7 }}>({scoredCount}/{exercises.length})</span>
                </span>
              ) : (
                <span className="text-xs italic" style={{ color: 'var(--text-3)' }}>
                  Sin calificar
                </span>
              )}
            </div>

            {exercises.length === 0 ? (
              <p className="text-xs px-3.5 py-2.5" style={{ color: 'var(--text-3)' }}>Sin ejercicios en esta fase.</p>
            ) : (
              <div className="space-y-1.5">
                {exercises.map((ex) => {
                  const saved = progress[ex.id] as ExerciseRecord | undefined
                  const score = getExerciseScore(saved)
                  const isPending = saved && saved.autoCorrect === null && !saved.claudeFeedback
                  const scoreColor = score === null ? null : score >= 80 ? '#6EE7B7' : score >= 50 ? '#ffd866' : '#ffb3c6'

                  return (
                    <div
                      key={ex.id}
                      className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 transition-all"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
                    >
                      <TypeBadge type={ex.type} />
                      <span className="text-xs font-mono shrink-0 hidden sm:block" style={{ color: 'var(--text-3)' }}>
                        {ex.id}
                      </span>
                      <span className="text-xs flex-1 truncate" style={{ color: 'var(--text-2)' }}>
                        {ex.question.slice(0, 60)}{ex.question.length > 60 ? '…' : ''}
                      </span>
                      {score !== null ? (
                        <span
                          className="text-xs font-bold font-mono shrink-0 px-2 py-0.5 rounded-full"
                          style={{
                            color: scoreColor!,
                            background: score >= 80 ? 'rgba(169,220,118,0.10)' : score >= 50 ? 'rgba(255,216,102,0.10)' : 'rgba(255,97,136,0.10)',
                          }}
                        >
                          {score}/100
                        </span>
                      ) : isPending ? (
                        <span
                          className="text-xs font-semibold shrink-0 px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(255,216,102,0.10)', color: '#ffd866', border: '1px solid rgba(255,216,102,0.22)' }}
                        >
                          ⏳ Pendiente
                        </span>
                      ) : !saved ? (
                        <span className="text-xs shrink-0" style={{ color: 'var(--text-3)' }}>—</span>
                      ) : (
                        <span className="text-xs shrink-0" style={{ color: 'var(--text-3)' }}>?</span>
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
