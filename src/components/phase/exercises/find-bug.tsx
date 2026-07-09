import { useState } from 'react'
import type { Exercise, ExerciseRecord, GradeResult } from '@/types/learning'
import { DarkTextarea, Feedback, PrimaryBtn } from '@/components/ui'
import { useAutoGrade } from '@/hooks/phase/use-auto-grade'

interface GradingIndicatorProps {}
function GradingIndicator(_: GradingIndicatorProps) {
  return (
    <div className='border-line bg-primary-glow mt-3 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm text-[#A5B4FC]'>
      <span className='animate-pulse'>🤖</span>
      <span>Claude Haiku calificando...</span>
    </div>
  )
}

function ApiErrorMsg({ msg }: { msg: string }) {
  return (
    <div className='bg-danger-bg border-danger-border text-danger mt-3 rounded-xl border px-3 py-2.5 text-xs'>
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

export function FindBug({ exercise, onAnswer, onGrade, saved, studentToken }: FindBugProps) {
  const [val, setVal] = useState(saved?.userAnswer ?? '')
  const { apiError, grade, grading } = useAutoGrade(exercise, onGrade, studentToken)
  const done = saved !== undefined

  const submit = async () => {
    if (!val.trim()) return
    onAnswer({ autoCorrect: null, type: exercise.type, userAnswer: val })
    await grade(val)
  }

  return (
    <div>
      <DarkTextarea
        value={val}
        onChange={(e) => setVal(e.target.value)}
        disabled={done}
        placeholder='Describí el bug y cómo lo corregirías...'
        rows={4}
      />
      {!done && (
        <div className='mt-3'>
          <PrimaryBtn onClick={submit} disabled={!val.trim()} color='red'>
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
