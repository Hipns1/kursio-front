import type { Exercise, ExerciseRecord } from '@/types/learning'
import { CodeBlock, TypeBadge } from '@/components/ui'
import { CodeAlong } from '@/components/phase/exercises/code-along'
import { CompleteCode } from '@/components/phase/exercises/complete-code'
import { FindBug } from '@/components/phase/exercises/find-bug'
import { ImproveCode } from '@/components/phase/exercises/improve-code'
import { KnowOutput } from '@/components/phase/exercises/know-output'
import { MultipleChoice } from '@/components/phase/exercises/multiple-choice'
import type { ExForm } from './types'

export function ExerciseLivePreview({ form }: { form: ExForm }) {
  const type = (form.exerciseType ?? 'multiple-choice') as Exercise['type']
  const hasQuestion = !!form.question?.trim()
  const hasExplanation = !!form.explanation?.trim()
  const hasOptions = type !== 'multiple-choice' || (form.options?.length ?? 0) >= 2
  const hasBlanks = type !== 'complete-code' || (form.code?.includes('___') && (form.blanks?.length ?? 0) > 0)
  const isReady = hasQuestion && hasExplanation && hasOptions && hasBlanks

  const ex: Exercise = {
    blanks: form.blanks,
    code: form.code || undefined,
    correct: form.correct ?? 0,
    explanation: form.explanation ?? '',
    id: 'preview',
    keywords: form.keywords,
    options: form.options,
    phase: 0,
    question: form.question ?? '',
    type
  }

  const noop = (_: ExerciseRecord) => {}

  if (!isReady) {
    return (
      <div className='space-y-3 py-8 text-center'>
        <p className='font-serif text-3xl font-normal'>✏️</p>
        <p className='text-fg-subtle text-xs font-semibold'>Completá los campos para ver la vista previa</p>
        <ul className='text-fg-subtle mt-1 space-y-1 text-xs'>
          {!hasQuestion && <li>• Falta la pregunta</li>}
          {!hasExplanation && <li>• Falta la explicación</li>}
          {!hasOptions && <li>• Necesitás al menos 2 opciones</li>}
          {!hasBlanks && <li>• El código necesita ___ y respuestas</li>}
        </ul>
      </div>
    )
  }

  return (
    <div
      key={type}
      className='rounded-2xl p-4'
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
      }}
    >
      <div className='mb-3 flex items-center gap-2'>
        <TypeBadge type={ex.type} />
      </div>
      <p className='text-fg mb-4 text-sm leading-relaxed font-medium'>{ex.question}</p>
      {ex.code && ex.type !== 'complete-code' && <CodeBlock code={ex.code} />}
      {ex.type === 'multiple-choice' && (
        <MultipleChoice key={JSON.stringify(ex.options)} exercise={ex} saved={undefined} onAnswer={noop} />
      )}
      {ex.type === 'know-output' && <KnowOutput exercise={ex} saved={undefined} onAnswer={noop} />}
      {ex.type === 'find-bug' && <FindBug exercise={ex} saved={undefined} onAnswer={noop} studentToken={null} />}
      {ex.type === 'improve-code' && (
        <ImproveCode exercise={ex} saved={undefined} onAnswer={noop} studentToken={null} />
      )}
      {ex.type === 'complete-code' && <CompleteCode key={ex.code} exercise={ex} saved={undefined} onAnswer={noop} />}
      {ex.type === 'code-along' && <CodeAlong exercise={ex} saved={undefined} onAnswer={noop} studentToken={null} />}
    </div>
  )
}
