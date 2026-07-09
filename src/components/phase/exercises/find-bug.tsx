import { useState } from 'react'
import type { Exercise, ExerciseRecord, GradeResult } from '@/types/learning'
import { DarkTextarea, Feedback, PrimaryBtn } from '@/components/ui'
import { useAutoGrade } from '@/hooks/phase/use-auto-grade'

interface GradingIndicatorProps {}
function GradingIndicator(_: GradingIndicatorProps) {
  return (
    <div
      className="flex items-center gap-2 mt-3 text-sm rounded-xl px-4 py-3"
      style={{ background: 'rgba(171,157,242,0.08)', border: '1px solid var(--border-default)', color: '#A5B4FC' }}
    >
      <span className="animate-pulse">🤖</span>
      <span>Claude Haiku calificando...</span>
    </div>
  )
}

function ApiErrorMsg({ msg }: { msg: string }) {
  return (
    <div
      className="mt-3 text-xs rounded-xl px-3 py-2.5"
      style={{ background: 'var(--danger-bg)', border: '1px solid rgba(255,97,136,0.25)', color: '#ffb3c6' }}
    >
      {msg}
    </div>
  )
}

interface FindBugProps {
  exercise: Exercise
  saved: ExerciseRecord | undefined
  onAnswer: (record: ExerciseRecord) => void
  studentToken: string | null
  onGrade?: (exerciseId: string, result: GradeResult) => void
}

export function FindBug({ exercise, saved, onAnswer, studentToken, onGrade }: FindBugProps) {
  const [val, setVal] = useState(saved?.userAnswer ?? '')
  const { grading, apiError, grade } = useAutoGrade(exercise, onGrade, studentToken)
  const done = saved !== undefined

  const submit = async () => {
    if (!val.trim()) return
    onAnswer({ type: exercise.type, userAnswer: val, autoCorrect: null })
    await grade(val)
  }

  return (
    <div>
      <DarkTextarea
        value={val}
        onChange={(e) => setVal(e.target.value)}
        disabled={done}
        placeholder="Describí el bug y cómo lo corregirías..."
        rows={4}
      />
      {!done && (
        <div className="mt-3">
          <PrimaryBtn onClick={submit} disabled={!val.trim()} color="red">
            Reportar bug y auto-calificar 🤖
          </PrimaryBtn>
        </div>
      )}
      {done && grading && <GradingIndicator />}
      {apiError && <ApiErrorMsg msg={apiError} />}
      {done && !grading && (
        <Feedback
          explanation={exercise.explanation}
          correct={saved?.autoCorrect ?? null}
          claudeFeedback={saved?.claudeFeedback}
          score={saved?.score}
        />
      )}
    </div>
  )
}

export { GradingIndicator, ApiErrorMsg }
