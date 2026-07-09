import { DarkInput, DarkTextarea, PrimaryBtn } from '@/components/ui'
import { ExerciseLivePreview } from './exercise-live-preview'
import { PreviewShell } from './preview-shell'
import type { ExForm } from './types'

const EXERCISE_TYPES = [
  { label: 'Opción múltiple', value: 'multiple-choice' },
  { label: 'Encuentra el bug', value: 'find-bug' },
  { label: 'Conoce la salida', value: 'know-output' },
  { label: 'Mejora el código', value: 'improve-code' },
  { label: 'Completa el código', value: 'complete-code' },
  { label: 'Code-along', value: 'code-along' }
]

export function ExerciseForm({
  error,
  form,
  onSubmit,
  setForm,
  submitLabel,
  submitting
}: {
  form: ExForm
  setForm: React.Dispatch<React.SetStateAction<ExForm>>
  onSubmit: () => void
  submitting: boolean
  error: string
  submitLabel: string
}) {
  return (
    <div className='animate-fade-up p-5'>
      <div className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
        <div className='space-y-4'>
          <div>
            <label className='text-fg-subtle mb-1.5 block text-xs font-semibold'>Tipo de ejercicio</label>
            <select
              value={form.exerciseType ?? 'multiple-choice'}
              onChange={(e) => setForm((f) => ({ ...f, exerciseType: e.target.value }))}
              className='bg-surface text-fg border-line w-full rounded-xl border px-3 py-2.5 text-sm font-medium'
            >
              {EXERCISE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='text-fg-subtle mb-1.5 block text-xs font-semibold'>Pregunta / Enunciado</label>
            <DarkTextarea
              value={form.question ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
              placeholder='Enunciado del ejercicio...'
            />
          </div>

          <div>
            <label className='text-fg-subtle mb-1.5 block text-xs font-semibold'>Código (opcional)</label>
            <DarkTextarea
              value={form.code ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value || undefined }))}
              placeholder='Código de ejemplo...'
            />
          </div>

          {form.exerciseType === 'multiple-choice' && (
            <div>
              <label className='text-fg-subtle mb-1.5 block text-xs font-semibold'>Opciones (una por línea)</label>
              <DarkTextarea
                value={(form.options ?? []).join('\n')}
                onChange={(e) => setForm((f) => ({ ...f, options: e.target.value.split('\n').filter(Boolean) }))}
                placeholder={'Opción A\nOpción B\nOpción C\nOpción D'}
              />
              <div className='mt-2 flex items-center gap-2'>
                <label className='text-fg-subtle text-xs'>Correcta (índice desde 0):</label>
                <input
                  type='number'
                  min={0}
                  max={9}
                  value={form.correct ?? 0}
                  onChange={(e) => setForm((f) => ({ ...f, correct: Number(e.target.value) }))}
                  className='bg-surface text-fg border-line w-16 rounded-lg border px-2 py-1 text-xs'
                />
              </div>
            </div>
          )}

          {form.exerciseType === 'know-output' && (
            <div>
              <label className='text-fg-subtle mb-1.5 block text-xs font-semibold'>
                Respuestas aceptadas (separadas por coma)
              </label>
              <DarkInput
                value={(form.keywords ?? []).join(',')}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    keywords: e.target.value
                      .split(',')
                      .map((k) => k.trim())
                      .filter(Boolean)
                  }))
                }
                placeholder='respuesta1, respuesta2'
              />
            </div>
          )}

          {form.exerciseType === 'complete-code' && (
            <div>
              <label className='text-fg-subtle mb-1.5 block text-xs font-semibold'>
                Respuestas de los blancos (una por línea)
              </label>
              <DarkTextarea
                value={(form.blanks ?? []).join('\n')}
                onChange={(e) => setForm((f) => ({ ...f, blanks: e.target.value.split('\n').filter(Boolean) }))}
                placeholder={'string\nint\nDateTime'}
              />
            </div>
          )}

          <div>
            <label className='text-fg-subtle mb-1.5 block text-xs font-semibold'>
              Explicación de la respuesta correcta
            </label>
            <DarkTextarea
              value={form.explanation ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
              placeholder='Explicación de la respuesta correcta...'
            />
          </div>

          {error && <p className='text-danger text-xs'>{error}</p>}

          <div className='w-44'>
            <PrimaryBtn onClick={onSubmit} disabled={!form.question?.trim() || !form.explanation?.trim() || submitting}>
              {submitting ? 'Guardando...' : submitLabel}
            </PrimaryBtn>
          </div>
        </div>

        <PreviewShell>
          <ExerciseLivePreview form={form} />
        </PreviewShell>
      </div>
    </div>
  )
}
