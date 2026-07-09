import { useState } from 'react'
import type { Exercise, ExerciseRecord } from '@/types/learning'
import { Feedback, PrimaryBtn } from '@/components/ui'

interface CompleteCodeProps {
  exercise: Exercise
  saved: ExerciseRecord | undefined
  onAnswer: (record: ExerciseRecord) => void
}

export function CompleteCode({ exercise, saved, onAnswer }: CompleteCodeProps) {
  const parts = exercise.code!.split('___')
  const count = parts.length - 1
  const [inputs, setInputs] = useState<string[]>(saved?.answers ?? Array(count).fill(''))
  const [submitted, setSubmitted] = useState(saved !== undefined)
  const [results, setResults] = useState<boolean[] | null>(
    saved?.answers
      ? exercise.blanks!.map((b, i) => (saved.answers![i] ?? '').toLowerCase().trim() === b.toLowerCase())
      : null,
  )

  const update = (i: number, v: string) => {
    const next = [...inputs]
    next[i] = v
    setInputs(next)
  }

  const submit = () => {
    const res = exercise.blanks!.map((b, i) => inputs[i].toLowerCase().trim() === b.toLowerCase())
    setResults(res)
    setSubmitted(true)
    const allCorrect = res.every(Boolean)
    onAnswer({ type: exercise.type, answers: inputs, autoCorrect: allCorrect, score: allCorrect ? 100 : 0 })
  }

  return (
    <div>
      <div
        className="rounded-xl p-4 text-xs leading-relaxed overflow-x-auto font-mono"
        style={{ background: '#0D1117', border: '1px solid var(--border-subtle)' }}
      >
        {parts.map((part, i) => (
          <span key={i}>
            <span className="text-green-300" style={{ whiteSpace: 'pre' }}>{part}</span>
            {i < count && (
              <input
                value={inputs[i]}
                onChange={(e) => !submitted && update(i, e.target.value)}
                disabled={submitted}
                placeholder="___"
                className="w-28 text-center bg-transparent outline-none mx-1 font-mono text-xs"
                style={{
                  borderBottom: submitted
                    ? results?.[i]
                      ? '2px solid #6EE7B7'
                      : '2px solid #ffb3c6'
                    : '2px solid #ffd866',
                  color: submitted ? (results?.[i] ? '#6EE7B7' : '#ffb3c6') : '#FEF08A',
                }}
              />
            )}
          </span>
        ))}
      </div>
      {!submitted && (
        <div className="mt-3">
          <PrimaryBtn onClick={submit} disabled={inputs.some((v) => !v.trim())} color="green">
            Verificar
          </PrimaryBtn>
        </div>
      )}
      {submitted && (
        <Feedback
          explanation={
            results?.every(Boolean)
              ? exercise.explanation
              : `Respuestas correctas: ${exercise.blanks!.join(', ')} — ${exercise.explanation}`
          }
          correct={results?.every(Boolean) ?? false}
        />
      )}
    </div>
  )
}
