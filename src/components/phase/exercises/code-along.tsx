import { useState } from 'react'
import type { Exercise, ExerciseRecord, GradeResult } from '@/types/learning'
import { CodeEditor, Feedback, PrimaryBtn } from '@/components/ui'
import { useAutoGrade } from '@/hooks/phase/use-auto-grade'
import { ApiErrorMsg, GradingIndicator } from './find-bug'

interface CodeAlongProps {
  exercise: Exercise
  saved: ExerciseRecord | undefined
  onAnswer: (record: ExerciseRecord) => void
  studentToken: string | null
  onGrade?: (exerciseId: string, result: GradeResult) => void
}

export function CodeAlong({ exercise, onAnswer, onGrade, saved, studentToken }: CodeAlongProps) {
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
      <CodeEditor value={val} onChange={done ? undefined : setVal} readOnly={done} minHeight={260} />
      {!done && (
        <div className='mt-3'>
          <PrimaryBtn onClick={submit} disabled={!val.trim()} color='violet'>
            Enviar y auto-calificar 🤖
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
