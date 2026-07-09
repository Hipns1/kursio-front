import { useState } from 'react'
import type { Exercise, ExerciseRecord } from '@/types/learning'
import { Feedback, PrimaryBtn } from '@/components/ui'
import { autoGrade } from '@/utils/helpers/learning'

interface MultipleChoiceProps {
  exercise: Exercise
  saved: ExerciseRecord | undefined
  onAnswer: (record: ExerciseRecord) => void
}

export function MultipleChoice({ exercise, onAnswer, saved }: MultipleChoiceProps) {
  const [sel, setSel] = useState<number | null>(saved?.answer ?? null)
  const done = saved !== undefined

  const submit = () => {
    if (sel === null) return
    const ac = autoGrade(exercise, sel)
    onAnswer({ answer: sel, autoCorrect: ac, score: ac ? 100 : 0, type: exercise.type })
  }

  return (
    <div className='space-y-2'>
      {exercise.options!.map((opt, i) => {
        let style: React.CSSProperties
        if (done) {
          if (i === exercise.correct)
            style = {
              background: 'var(--success-bg)',
              border: '1px solid var(--success-border)',
              color: 'var(--success)',
              fontWeight: 500
            }
          else if (i === sel && sel !== exercise.correct)
            style = { background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger)' }
          else style = { background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-3)' }
        } else {
          style =
            sel === i
              ? {
                  background: 'var(--primary-glow)',
                  border: '1px solid var(--primary-glow)',
                  color: '#A5B4FC',
                  fontWeight: 500
                }
              : {
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-2)',
                  cursor: 'pointer'
                }
        }
        return (
          <button
            key={i}
            disabled={done}
            onClick={() => setSel(i)}
            className='w-full rounded-xl px-4 py-3 text-left text-sm transition-all'
            style={style}
          >
            <span className='text-fg-subtle mr-2 font-mono text-xs'>{String.fromCharCode(65 + i)})</span>
            {opt}
          </button>
        )
      })}
      {!done && (
        <div className='mt-3'>
          <PrimaryBtn onClick={submit} disabled={sel === null}>
            Confirmar respuesta
          </PrimaryBtn>
        </div>
      )}
      {done && <Feedback explanation={exercise.explanation} correct={saved.autoCorrect} />}
    </div>
  )
}
