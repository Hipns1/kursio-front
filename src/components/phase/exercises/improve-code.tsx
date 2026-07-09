import { useState } from 'react'
import type { Exercise, ExerciseRecord, GradeResult } from '@/types/learning'
import { CodeEditor, Feedback, PrimaryBtn } from '@/components/ui'
import { useAutoGrade } from '@/hooks/phase/use-auto-grade'
import { GradingIndicator, ApiErrorMsg } from './find-bug'

interface ImproveCodeProps {
  exercise: Exercise
  saved: ExerciseRecord | undefined
  onAnswer: (record: ExerciseRecord) => void
  studentToken: string | null
  onGrade?: (exerciseId: string, result: GradeResult) => void
}

export function ImproveCode({ exercise, saved, onAnswer, studentToken, onGrade }: ImproveCodeProps) {
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
      <CodeEditor value={val} onChange={done ? undefined : setVal} readOnly={done} minHeight={220} />
      {!done && (
        <div className="mt-3">
          <PrimaryBtn onClick={submit} disabled={!val.trim()} color="orange">
            Enviar mejora y auto-calificar 🤖
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
