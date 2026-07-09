import { useState } from 'react'
import type { Exercise, ExerciseRecord } from '@/types/learning'
import { DarkInput, Feedback, PrimaryBtn } from '@/components/ui'
import { autoGrade } from '@/utils/helpers/learning'

interface KnowOutputProps {
  exercise: Exercise
  saved: ExerciseRecord | undefined
  onAnswer: (record: ExerciseRecord) => void
}

export function KnowOutput({ exercise, onAnswer, saved }: KnowOutputProps) {
  const [val, setVal] = useState(saved?.userAnswer ?? '')
  const done = saved !== undefined

  const submit = () => {
    if (!val.trim()) return
    const ac = autoGrade(exercise, val)
    onAnswer({ autoCorrect: ac, score: ac ? 100 : 0, type: exercise.type, userAnswer: val })
  }

  return (
    <div>
      <DarkInput
        value={val}
        onChange={(e) => setVal(e.target.value)}
        disabled={done}
        placeholder='Tu respuesta...'
        onKeyDown={(e) => e.key === 'Enter' && !done && submit()}
      />
      {!done && (
        <div className='mt-3'>
          <PrimaryBtn onClick={submit} disabled={!val.trim()}>
            Confirmar
          </PrimaryBtn>
        </div>
      )}
      {done && <Feedback explanation={exercise.explanation} correct={saved.autoCorrect} />}
    </div>
  )
}
