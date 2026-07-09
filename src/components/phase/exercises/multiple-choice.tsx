import { useState } from 'react'
import type { Exercise, ExerciseRecord } from '@/types/learning'
import { Feedback, PrimaryBtn } from '@/components/ui'
import { autoGrade } from '@/utils/helpers/learning'

interface MultipleChoiceProps {
  exercise: Exercise
  saved: ExerciseRecord | undefined
  onAnswer: (record: ExerciseRecord) => void
}

export function MultipleChoice({ exercise, saved, onAnswer }: MultipleChoiceProps) {
  const [sel, setSel] = useState<number | null>(saved?.answer ?? null)
  const done = saved !== undefined

  const submit = () => {
    if (sel === null) return
    const ac = autoGrade(exercise, sel)
    onAnswer({ type: exercise.type, answer: sel, autoCorrect: ac, score: ac ? 100 : 0 })
  }

  return (
    <div className="space-y-2">
      {exercise.options!.map((opt, i) => {
        let style: React.CSSProperties
        if (done) {
          if (i === exercise.correct)
            style = { background: 'rgba(169,220,118,0.10)', border: '1px solid rgba(169,220,118,0.40)', color: '#6EE7B7', fontWeight: 500 }
          else if (i === sel && sel !== exercise.correct)
            style = { background: 'rgba(255,97,136,0.08)', border: '1px solid rgba(255,97,136,0.35)', color: '#ffb3c6' }
          else
            style = { background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--text-3)' }
        } else {
          style =
            sel === i
              ? { background: 'rgba(171,157,242,0.12)', border: '1px solid rgba(171,157,242,0.50)', color: '#A5B4FC', fontWeight: 500 }
              : { background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-2)', cursor: 'pointer' }
        }
        return (
          <button key={i} disabled={done} onClick={() => setSel(i)} className="w-full text-left rounded-xl px-4 py-3 text-sm transition-all" style={style}>
            <span className="font-mono mr-2 text-xs" style={{ color: 'var(--text-3)' }}>{String.fromCharCode(65 + i)})</span>
            {opt}
          </button>
        )
      })}
      {!done && (
        <div className="mt-3">
          <PrimaryBtn onClick={submit} disabled={sel === null}>Confirmar respuesta</PrimaryBtn>
        </div>
      )}
      {done && <Feedback explanation={exercise.explanation} correct={saved!.autoCorrect} />}
    </div>
  )
}
