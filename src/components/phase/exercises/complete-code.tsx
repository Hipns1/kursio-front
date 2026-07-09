import { useState } from 'react'
import type { Exercise, ExerciseRecord } from '@/types/learning'
import { Feedback, PrimaryBtn } from '@/components/ui'

interface CompleteCodeProps {
  exercise: Exercise
  saved: ExerciseRecord | undefined
  onAnswer: (record: ExerciseRecord) => void
}

export function CompleteCode({ exercise, onAnswer, saved }: CompleteCodeProps) {
  const parts = exercise.code!.split('___')
  const count = parts.length - 1
  const [inputs, setInputs] = useState<string[]>(saved?.answers ?? Array(count).fill(''))
  const [submitted, setSubmitted] = useState(saved !== undefined)
  const [results, setResults] = useState<boolean[] | null>(
    saved?.answers
      ? exercise.blanks!.map((b, i) => (saved.answers![i] ?? '').toLowerCase().trim() === b.toLowerCase())
      : null
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
    onAnswer({ answers: inputs, autoCorrect: allCorrect, score: allCorrect ? 100 : 0, type: exercise.type })
  }

  return (
    <div>
      <div className='border-hairline overflow-x-auto rounded-xl border bg-[#0D1117] p-4 font-mono text-xs leading-relaxed'>
        {parts.map((part, i) => (
          <span key={i}>
            <span className='whitespace-pre text-green-300'>{part}</span>
            {i < count && (
              <input
                value={inputs[i]}
                onChange={(e) => !submitted && update(i, e.target.value)}
                disabled={submitted}
                placeholder='___'
                className='mx-1 w-28 bg-transparent text-center font-mono text-xs outline-none'
                style={{
                  borderBottom: submitted
                    ? results?.[i]
                      ? '2px solid var(--success)'
                      : '2px solid var(--danger)'
                    : '2px solid var(--warning)',
                  color: submitted ? (results?.[i] ? 'var(--success)' : 'var(--danger)') : '#FEF08A'
                }}
              />
            )}
          </span>
        ))}
      </div>
      {!submitted && (
        <div className='mt-3'>
          <PrimaryBtn onClick={submit} disabled={inputs.some((v) => !v.trim())} color='green'>
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
