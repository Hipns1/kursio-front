import { useEffect, useState } from 'react'
import type { AdminExercise, CourseContent, UpdateCoursePayload } from '@/services/backend'
import type { CreateCoursePayload, CreatePhasePayload } from '@/services/backend'
import {
  addExercise,
  addLesson,
  createCourse,
  createPhase,
  deleteCourse,
  deleteExercise,
  deleteLesson,
  deletePhase,
  fetchContent,
  updateCourse,
  updateExercise,
  updateLesson,
  updatePhase
} from '@/services/backend'
import type { Exercise, ExerciseRecord, Lesson } from '@/types/learning'
import {
  CodeBlock,
  ConfirmModal,
  CourseIcon,
  DarkInput,
  DarkTextarea,
  IconPicker,
  PrimaryBtn,
  TypeBadge,
  useToast
} from '@/components/ui'
import { LessonBlock } from '@/components/phase/lessons'
import { CodeAlong } from '@/components/phase/exercises/code-along'
import { CompleteCode } from '@/components/phase/exercises/complete-code'
import { FindBug } from '@/components/phase/exercises/find-bug'
import { ImproveCode } from '@/components/phase/exercises/improve-code'
import { KnowOutput } from '@/components/phase/exercises/know-output'
import { MultipleChoice } from '@/components/phase/exercises/multiple-choice'

type EditableBlock =
  | { t: 'p'; v: string }
  | { t: 'code'; v: string; lang?: string }
  | { t: 'cmp'; ts: string; cs: string }
  | { t: 'tip'; v: string }
  | { t: 'list'; items: string[] }

const BLOCK_LABELS: Record<string, string> = {
  p: '📝 Párrafo',
  code: '💻 Bloque de código',
  cmp: '⚖️ Comparación C# / TypeScript',
  tip: '💡 Consejo',
  list: '📋 Lista de puntos'
}

// ── Live preview ──────────────────────────────────────────────────────────────

function PreviewShell({ children }: { children: React.ReactNode }) {
  return (
    <div className='sticky top-4'>
      <div
        className='flex items-center gap-2 rounded-t-2xl px-4 py-2.5'
        style={{
          background: 'rgba(120,220,232,0.06)',
          border: '1px solid rgba(120,220,232,0.18)',
          borderBottom: 'none'
        }}
      >
        <span className='h-2 w-2 animate-pulse rounded-full' style={{ background: '#22c55e' }} />
        <span className='text-xs font-bold tracking-widest uppercase' style={{ color: 'var(--accent)' }}>
          Vista previa en vivo
        </span>
      </div>
      <div
        className='overflow-y-auto rounded-b-2xl p-5'
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid rgba(120,220,232,0.18)',
          minHeight: 220,
          maxHeight: '65vh'
        }}
      >
        {children}
      </div>
    </div>
  )
}

// ── Exercise live preview ─────────────────────────────────────────────────────

type ExForm = {
  exerciseType?: string
  question?: string
  code?: string
  options?: string[]
  correct?: number
  keywords?: string[]
  blanks?: string[]
  explanation?: string
}

function ExerciseLivePreview({ form }: { form: ExForm }) {
  const type = (form.exerciseType ?? 'multiple-choice') as Exercise['type']
  const hasQuestion = !!form.question?.trim()
  const hasExplanation = !!form.explanation?.trim()
  const hasOptions = type !== 'multiple-choice' || (form.options?.length ?? 0) >= 2
  const hasBlanks = type !== 'complete-code' || (form.code?.includes('___') && (form.blanks?.length ?? 0) > 0)
  const isReady = hasQuestion && hasExplanation && hasOptions && hasBlanks

  const ex: Exercise = {
    id: 'preview',
    phase: 0,
    type,
    question: form.question ?? '',
    code: form.code || undefined,
    options: form.options,
    correct: form.correct ?? 0,
    keywords: form.keywords,
    blanks: form.blanks,
    explanation: form.explanation ?? ''
  }

  const noop = (_: ExerciseRecord) => {}

  if (!isReady) {
    return (
      <div className='space-y-3 py-8 text-center'>
        <p className='text-3xl'>✏️</p>
        <p className='text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
          Completá los campos para ver la vista previa
        </p>
        <ul className='mt-1 space-y-1 text-xs' style={{ color: 'var(--text-3)' }}>
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
      <p className='mb-4 text-sm leading-relaxed font-medium' style={{ color: 'var(--text-1)' }}>
        {ex.question}
      </p>
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

function LessonLivePreview({ title, blocks }: { title: string; blocks: EditableBlock[] }) {
  if (!title.trim() && blocks.length === 0) {
    return (
      <div className='space-y-2 py-8 text-center'>
        <p className='text-3xl'>✏️</p>
        <p className='text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
          Empezá a editar para ver la vista previa
        </p>
      </div>
    )
  }
  return (
    <div>
      {title.trim() && (
        <h2 className='mb-4 text-base leading-snug font-black' style={{ color: 'var(--text-1)' }}>
          {title}
        </h2>
      )}
      {blocks.length === 0 ? (
        <p className='text-xs' style={{ color: 'var(--text-3)' }}>
          Agregá bloques de contenido desde la izquierda.
        </p>
      ) : (
        blocks.map((block, i) => <LessonBlock key={i} block={block as any} />)
      )}
    </div>
  )
}

// ── Block editor ──────────────────────────────────────────────────────────────

function LessonBlockEditor({ blocks, onChange }: { blocks: EditableBlock[]; onChange: (b: EditableBlock[]) => void }) {
  const update = (i: number, block: EditableBlock) => {
    const next = [...blocks]
    next[i] = block
    onChange(next)
  }
  const remove = (i: number) => onChange(blocks.filter((_, idx) => idx !== i))
  const move = (i: number, dir: -1 | 1) => {
    const next = [...blocks]
    const j = i + dir
    if (j < 0 || j >= next.length) return
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }
  const addBlock = (t: string) => {
    const newBlock: EditableBlock =
      t === 'p'
        ? { t: 'p', v: '' }
        : t === 'code'
          ? { t: 'code', v: '', lang: 'csharp' }
          : t === 'cmp'
            ? { t: 'cmp', ts: '', cs: '' }
            : t === 'tip'
              ? { t: 'tip', v: '' }
              : { t: 'list', items: [''] }
    onChange([...blocks, newBlock])
  }

  return (
    <div className='space-y-2'>
      {blocks.length === 0 && (
        <div
          className='rounded-xl py-5 text-center text-xs'
          style={{
            color: 'var(--text-3)',
            border: '1px dashed var(--border-default)',
            background: 'rgba(255,255,255,0.01)'
          }}
        >
          No hay bloques. Agregá uno abajo.
        </div>
      )}

      {blocks.map((block, i) => (
        <div
          key={i}
          className='space-y-2 rounded-xl p-3'
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
        >
          <div className='flex items-center gap-1.5'>
            <span className='flex-1 text-xs font-semibold' style={{ color: 'var(--text-2)' }}>
              {BLOCK_LABELS[block.t]}
            </span>
            <button
              onClick={() => move(i, -1)}
              disabled={i === 0}
              className='rounded px-1.5 py-0.5 text-xs transition-all disabled:opacity-25'
              style={{
                color: 'var(--text-3)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              ↑
            </button>
            <button
              onClick={() => move(i, 1)}
              disabled={i === blocks.length - 1}
              className='rounded px-1.5 py-0.5 text-xs transition-all disabled:opacity-25'
              style={{
                color: 'var(--text-3)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border-subtle)'
              }}
            >
              ↓
            </button>
            <button
              onClick={() => remove(i)}
              className='rounded px-2 py-0.5 text-xs transition-all'
              style={{
                color: '#ffb3c6',
                background: 'rgba(255,97,136,0.08)',
                border: '1px solid rgba(255,97,136,0.20)'
              }}
            >
              ✕
            </button>
          </div>

          {block.t === 'p' && (
            <DarkTextarea
              value={block.v}
              onChange={(e) => update(i, { ...block, v: e.target.value })}
              placeholder='Escribí el texto del párrafo...'
              rows={3}
            />
          )}
          {block.t === 'code' && (
            <>
              <div className='flex items-center gap-2'>
                <label className='shrink-0 text-xs' style={{ color: 'var(--text-3)' }}>
                  Lenguaje:
                </label>
                <select
                  value={block.lang ?? 'csharp'}
                  onChange={(e) => update(i, { ...block, lang: e.target.value })}
                  className='rounded-lg px-2 py-1 text-xs'
                  style={{
                    background: 'var(--bg-base)',
                    color: 'var(--text-1)',
                    border: '1px solid var(--border-default)'
                  }}
                >
                  <option value='csharp'>C#</option>
                  <option value='typescript'>TypeScript</option>
                  <option value='bash'>Bash / Terminal</option>
                  <option value='json'>JSON</option>
                </select>
              </div>
              <DarkTextarea
                value={block.v}
                onChange={(e) => update(i, { ...block, v: e.target.value })}
                placeholder='Pegá o escribí el código...'
                rows={6}
              />
            </>
          )}
          {block.t === 'cmp' && (
            <div className='space-y-2'>
              <div>
                <label className='mb-1 block text-xs font-semibold' style={{ color: '#93C5FD' }}>
                  📘 TypeScript
                </label>
                <DarkTextarea
                  value={block.ts}
                  onChange={(e) => update(i, { ...block, ts: e.target.value })}
                  placeholder='Código TypeScript...'
                  rows={4}
                />
              </div>
              <div>
                <label className='mb-1 block text-xs font-semibold' style={{ color: '#A78BFA' }}>
                  🟣 C#
                </label>
                <DarkTextarea
                  value={block.cs}
                  onChange={(e) => update(i, { ...block, cs: e.target.value })}
                  placeholder='Código C#...'
                  rows={4}
                />
              </div>
            </div>
          )}
          {block.t === 'tip' && (
            <DarkTextarea
              value={block.v}
              onChange={(e) => update(i, { ...block, v: e.target.value })}
              placeholder='Escribí el consejo o nota importante...'
              rows={2}
            />
          )}
          {block.t === 'list' && (
            <div className='space-y-1.5'>
              {block.items.map((item, j) => (
                <div key={j} className='flex gap-2'>
                  <DarkInput
                    value={item}
                    onChange={(e) => {
                      const items = [...block.items]
                      items[j] = e.target.value
                      update(i, { ...block, items })
                    }}
                    placeholder={`Punto ${j + 1}...`}
                  />
                  <button
                    onClick={() => {
                      const items = block.items.filter((_, idx) => idx !== j)
                      update(i, { ...block, items })
                    }}
                    className='shrink-0 rounded px-2 text-xs'
                    style={{
                      color: '#ffb3c6',
                      background: 'rgba(255,97,136,0.08)',
                      border: '1px solid rgba(255,97,136,0.20)'
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                onClick={() => update(i, { ...block, items: [...block.items, ''] })}
                className='rounded-lg px-3 py-1.5 text-xs font-medium'
                style={{
                  color: 'var(--primary)',
                  background: 'rgba(171,157,242,0.08)',
                  border: '1px solid var(--border-default)'
                }}
              >
                + Agregar punto
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Add block toolbar */}
      <div className='pt-1'>
        <p className='mb-2 text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
          Agregar bloque:
        </p>
        <div className='flex flex-wrap gap-2'>
          {Object.entries(BLOCK_LABELS).map(([t, label]) => (
            <button
              key={t}
              onClick={() => addBlock(t)}
              className='rounded-lg px-3 py-1.5 text-xs font-medium transition-all hover:opacity-80'
              style={{
                background: 'rgba(171,157,242,0.10)',
                color: 'var(--primary)',
                border: '1px solid var(--border-default)'
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Shared helpers (exported for admin-dash) ──────────────────────────────────

export function Badge({ ok }: { ok: boolean }) {
  return (
    <span
      className='rounded-full px-2 py-0.5 text-xs font-semibold'
      style={
        ok
          ? { background: 'rgba(169,220,118,0.10)', color: '#6EE7B7', border: '1px solid rgba(169,220,118,0.20)' }
          : { background: 'rgba(255,97,136,0.10)', color: '#ffb3c6', border: '1px solid rgba(255,97,136,0.20)' }
      }
    >
      {ok ? 'Activo' : 'Inactivo'}
    </span>
  )
}

export function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    })
  }
  return (
    <button
      onClick={copy}
      className='ml-1.5 rounded px-1.5 py-0.5 font-mono text-xs transition-all'
      style={{
        background: 'rgba(171,157,242,0.10)',
        color: copied ? '#6EE7B7' : 'var(--primary)',
        border: '1px solid var(--border-default)'
      }}
    >
      {copied ? '✓' : '⧉'}
    </button>
  )
}

export function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function ScoreChip({ score }: { score: number | null }) {
  if (score === null) return <span style={{ color: 'var(--text-3)' }}>—</span>
  const color = score >= 80 ? '#6EE7B7' : score >= 50 ? '#ffd866' : '#ffb3c6'
  return (
    <span className='font-mono font-bold' style={{ color }}>
      {Math.round(score)}
    </span>
  )
}

export function is401(e: unknown) {
  return (e as Error)?.message?.startsWith('401')
}

// ── Wide modal (for exercise / lesson editors) ────────────────────────────────

function ContentModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className='fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4'
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className='animate-fade-up my-8 w-full max-w-4xl rounded-2xl'
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
      >
        <div
          className='sticky top-0 z-10 flex items-center justify-between px-6 py-4'
          style={{
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border-subtle)',
            borderRadius: '1rem 1rem 0 0'
          }}
        >
          <h2 className='truncate pr-4 text-sm font-bold' style={{ color: 'var(--text-1)' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className='flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm transition-all hover:opacity-70'
            style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-3)' }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Small modal (course forms) ────────────────────────────────────────────────

function CourseModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center p-4'
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className='animate-fade-up w-full max-w-lg rounded-2xl'
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
      >
        <div
          className='flex items-center justify-between px-6 py-4'
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <h2 className='text-sm font-bold' style={{ color: 'var(--text-1)' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className='flex h-7 w-7 items-center justify-center rounded-lg text-sm transition-all hover:opacity-70'
            style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-3)' }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// ── Exercise form ─────────────────────────────────────────────────────────────

const EXERCISE_TYPES = [
  { value: 'multiple-choice', label: 'Opción múltiple' },
  { value: 'find-bug', label: 'Encuentra el bug' },
  { value: 'know-output', label: 'Conoce la salida' },
  { value: 'improve-code', label: 'Mejora el código' },
  { value: 'complete-code', label: 'Completa el código' },
  { value: 'code-along', label: 'Code-along' }
]

function ExerciseForm({
  form,
  setForm,
  onSubmit,
  submitting,
  error,
  submitLabel
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
        {/* Form fields */}
        <div className='space-y-4'>
          <div>
            <label className='mb-1.5 block text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
              Tipo de ejercicio
            </label>
            <select
              value={form.exerciseType ?? 'multiple-choice'}
              onChange={(e) => setForm((f) => ({ ...f, exerciseType: e.target.value }))}
              className='w-full rounded-xl px-3 py-2.5 text-sm font-medium'
              style={{
                background: 'var(--bg-base)',
                color: 'var(--text-1)',
                border: '1px solid var(--border-default)'
              }}
            >
              {EXERCISE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className='mb-1.5 block text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
              Pregunta / Enunciado
            </label>
            <DarkTextarea
              value={form.question ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
              placeholder='Enunciado del ejercicio...'
            />
          </div>

          <div>
            <label className='mb-1.5 block text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
              Código (opcional)
            </label>
            <DarkTextarea
              value={form.code ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value || undefined }))}
              placeholder='Código de ejemplo...'
            />
          </div>

          {form.exerciseType === 'multiple-choice' && (
            <div>
              <label className='mb-1.5 block text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
                Opciones (una por línea)
              </label>
              <DarkTextarea
                value={(form.options ?? []).join('\n')}
                onChange={(e) => setForm((f) => ({ ...f, options: e.target.value.split('\n').filter(Boolean) }))}
                placeholder={'Opción A\nOpción B\nOpción C\nOpción D'}
              />
              <div className='mt-2 flex items-center gap-2'>
                <label className='text-xs' style={{ color: 'var(--text-3)' }}>
                  Correcta (índice desde 0):
                </label>
                <input
                  type='number'
                  min={0}
                  max={9}
                  value={form.correct ?? 0}
                  onChange={(e) => setForm((f) => ({ ...f, correct: Number(e.target.value) }))}
                  className='w-16 rounded-lg px-2 py-1 text-xs'
                  style={{
                    background: 'var(--bg-base)',
                    color: 'var(--text-1)',
                    border: '1px solid var(--border-default)'
                  }}
                />
              </div>
            </div>
          )}

          {form.exerciseType === 'know-output' && (
            <div>
              <label className='mb-1.5 block text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
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
              <label className='mb-1.5 block text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
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
            <label className='mb-1.5 block text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
              Explicación de la respuesta correcta
            </label>
            <DarkTextarea
              value={form.explanation ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, explanation: e.target.value }))}
              placeholder='Explicación de la respuesta correcta...'
            />
          </div>

          {error && (
            <p className='text-xs' style={{ color: '#ffb3c6' }}>
              {error}
            </p>
          )}

          <div className='w-44'>
            <PrimaryBtn onClick={onSubmit} disabled={!form.question?.trim() || !form.explanation?.trim() || submitting}>
              {submitting ? 'Guardando...' : submitLabel}
            </PrimaryBtn>
          </div>
        </div>

        {/* Live preview */}
        <PreviewShell>
          <ExerciseLivePreview form={form} />
        </PreviewShell>
      </div>
    </div>
  )
}

// ── Content tab ───────────────────────────────────────────────────────────────

export function ContentTab({ token, onUnauthorized }: { token: string; onUnauthorized: () => void }) {
  const [content, setContent] = useState<CourseContent | null>(null)
  const [loadingContent, setLoadingContent] = useState(true)
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const [selectedPhase, setSelectedPhase] = useState(0)
  const [activeTab, setActiveTab] = useState<'exercises' | 'lessons'>('exercises')
  const [courseSearch, setCourseSearch] = useState('')

  // course edit
  const [showCourseEdit, setShowCourseEdit] = useState(false)
  const [courseForm, setCourseForm] = useState<UpdateCoursePayload>({
    name: '',
    description: '',
    icon: '',
    color: '',
    slug: '',
    order: 1,
    prerequisites: []
  })
  const [savingCourse, setSavingCourse] = useState(false)
  const [courseError, setCourseError] = useState('')

  // phase edit
  const [showPhaseEdit, setShowPhaseEdit] = useState(false)
  const [phaseForm, setPhaseForm] = useState({ name: '', icon: '' })
  const [savingPhase, setSavingPhase] = useState(false)
  const [phaseEditError, setPhaseEditError] = useState('')

  // exercise add
  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState<ExForm>({ exerciseType: 'multiple-choice' })
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')

  // exercise edit
  const [editingExId, setEditingExId] = useState<string | null>(null)
  const [editExForm, setEditExForm] = useState<ExForm>({})
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState('')

  // exercise delete
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteEx, setConfirmDeleteEx] = useState<{ id: string; question: string } | null>(null)

  // lesson delete confirm
  const [confirmDeleteLessonItem, setConfirmDeleteLessonItem] = useState<{ id: string; title: string } | null>(null)

  // lesson edit
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null)
  const [editLessonTitle, setEditLessonTitle] = useState('')
  const [editLessonBlocks, setEditLessonBlocks] = useState<EditableBlock[]>([])
  const [updatingLesson, setUpdatingLesson] = useState(false)
  const [lessonError, setLessonError] = useState('')

  // lesson add
  const [showAddLessonForm, setShowAddLessonForm] = useState(false)
  const [addLessonTitle, setAddLessonTitle] = useState('')
  const [addLessonBlocks, setAddLessonBlocks] = useState<EditableBlock[]>([])
  const [addingLesson, setAddingLesson] = useState(false)
  const [addLessonError, setAddLessonError] = useState('')

  // lesson delete
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null)

  // course delete
  const [confirmDeleteCourse, setConfirmDeleteCourse] = useState<{ id: number; name: string } | null>(null)
  const [deletingCourse, setDeletingCourse] = useState(false)

  // phase delete
  const [confirmDeletePhase, setConfirmDeletePhase] = useState<{ id: number; name: string } | null>(null)
  const [deletingPhase, setDeletingPhase] = useState(false)

  // content search
  const [contentSearch, setContentSearch] = useState('')

  // course create
  const [showCreateCourse, setShowCreateCourse] = useState(false)
  const [createCourseForm, setCreateCourseForm] = useState<CreateCoursePayload>({
    name: '',
    description: '',
    icon: '📚',
    color: '#ab9df2',
    slug: '',
    order: 1
  })
  const [creatingCourse, setCreatingCourse] = useState(false)
  const [createCourseError, setCreateCourseError] = useState('')

  // phase create
  const [showCreatePhase, setShowCreatePhase] = useState(false)
  const [createPhaseForm, setCreatePhaseForm] = useState<Omit<CreatePhasePayload, 'courseId'>>({
    name: '',
    icon: '📖',
    order: 1
  })
  const [creatingPhase, setCreatingPhase] = useState(false)
  const [createPhaseError, setCreatePhaseError] = useState('')

  const { toast } = useToast()

  const loadContent = async () => {
    try {
      const data = await fetchContent(token)
      setContent(data)
    } catch (e) {
      if (is401(e)) onUnauthorized()
    } finally {
      setLoadingContent(false)
    }
  }

  useEffect(() => {
    loadContent()
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (editingExId) {
        setEditingExId(null)
        return
      }
      if (editingLessonId) {
        setEditingLessonId(null)
        return
      }
      if (showAddForm) {
        setShowAddForm(false)
        return
      }
      if (showAddLessonForm) {
        setShowAddLessonForm(false)
        return
      }
      if (confirmDeleteEx) {
        setConfirmDeleteEx(null)
        return
      }
      if (confirmDeleteLessonItem) {
        setConfirmDeleteLessonItem(null)
        return
      }
      if (confirmDeleteCourse) {
        setConfirmDeleteCourse(null)
        return
      }
      if (confirmDeletePhase) {
        setConfirmDeletePhase(null)
        return
      }
      if (showPhaseEdit) {
        setShowPhaseEdit(false)
        return
      }
      if (showCreatePhase) {
        setShowCreatePhase(false)
        return
      }
      if (showCourseEdit) {
        setShowCourseEdit(false)
        return
      }
      if (showCreateCourse) {
        setShowCreateCourse(false)
        return
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [
    editingExId,
    editingLessonId,
    showAddForm,
    showAddLessonForm,
    confirmDeleteEx,
    confirmDeleteLessonItem,
    confirmDeleteCourse,
    confirmDeletePhase,
    showPhaseEdit,
    showCreatePhase,
    showCourseEdit,
    showCreateCourse
  ])

  const courses = content?.courses ?? []
  const currentCourse = courses.find((c) => c.id === selectedCourseId)
  const phases = currentCourse?.phases ?? []
  const currentPhase = phases.find((p) => p.id === selectedPhase)
  const exercises = (currentPhase?.exercises ?? []) as AdminExercise[]
  const lessons = (currentPhase?.lessons ?? []) as Lesson[]

  const switchCourse = (id: number) => {
    const course = courses.find((c) => c.id === id)
    setSelectedCourseId(id)
    setSelectedPhase(course?.phases[0]?.id ?? 0)
    setEditingExId(null)
    setEditingLessonId(null)
    setShowAddForm(false)
    setShowAddLessonForm(false)
    setShowCourseEdit(false)
    setShowPhaseEdit(false)
  }

  const backToCourses = () => {
    setSelectedCourseId(null)
    setEditingExId(null)
    setEditingLessonId(null)
    setShowAddForm(false)
    setShowAddLessonForm(false)
    setShowCourseEdit(false)
    setShowPhaseEdit(false)
  }

  const switchPhase = (id: number) => {
    setSelectedPhase(id)
    setEditingExId(null)
    setEditingLessonId(null)
    setShowAddForm(false)
    setShowAddLessonForm(false)
    setShowPhaseEdit(false)
  }

  const switchTab = (t: 'exercises' | 'lessons') => {
    setActiveTab(t)
    setEditingExId(null)
    setEditingLessonId(null)
    setShowAddForm(false)
    setShowAddLessonForm(false)
    setContentSearch('')
  }

  // ── Course edit ───────────────────────────────────────────────────────────
  const openCourseEdit = () => {
    if (!currentCourse) return
    setCourseForm({
      name: currentCourse.name,
      description: currentCourse.description,
      icon: currentCourse.icon,
      color: currentCourse.color,
      slug: currentCourse.slug,
      order: currentCourse.order,
      prerequisites: currentCourse.prerequisites ?? []
    })
    setCourseError('')
    setShowCourseEdit(true)
  }

  const handleSaveCourse = async () => {
    if (!selectedCourseId || !courseForm.name.trim() || !courseForm.slug.trim()) return
    setSavingCourse(true)
    setCourseError('')
    try {
      const updated = await updateCourse(token, selectedCourseId, courseForm)
      setShowCourseEdit(false)
      setContent((prev) =>
        prev
          ? {
              courses: prev.courses.map((c) => (c.id === selectedCourseId ? { ...c, ...updated } : c))
            }
          : prev
      )
      toast('Curso actualizado', 'success')
    } catch (e) {
      if (is401(e)) {
        onUnauthorized()
        return
      }
      setCourseError((e as Error).message || 'Error al guardar curso')
    } finally {
      setSavingCourse(false)
    }
  }

  // ── Phase edit ────────────────────────────────────────────────────────────
  const openPhaseEdit = () => {
    if (!currentPhase) return
    setPhaseForm({ name: currentPhase.name, icon: currentPhase.icon })
    setPhaseEditError('')
    setShowPhaseEdit(true)
  }

  const handleSavePhase = async () => {
    if (!currentPhase?.dbId || !phaseForm.name.trim()) return
    setSavingPhase(true)
    setPhaseEditError('')
    try {
      await updatePhase(token, currentPhase.dbId, phaseForm)
      setShowPhaseEdit(false)
      setContent((prev) =>
        prev
          ? {
              courses: prev.courses.map((c) =>
                c.id === selectedCourseId
                  ? {
                      ...c,
                      phases: c.phases.map((p) => (p.dbId === currentPhase.dbId ? { ...p, ...phaseForm } : p))
                    }
                  : c
              )
            }
          : prev
      )
      toast('Fase actualizada', 'success')
    } catch (e) {
      if (is401(e)) {
        onUnauthorized()
        return
      }
      setPhaseEditError((e as Error).message || 'Error al guardar fase')
    } finally {
      setSavingPhase(false)
    }
  }

  // ── Exercise add ──────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!addForm.question?.trim() || !addForm.explanation?.trim() || selectedCourseId === null) return
    setAdding(true)
    setAddError('')
    try {
      const newEx = await addExercise(token, {
        courseId: selectedCourseId,
        phaseOrder: selectedPhase,
        exerciseType: addForm.exerciseType!,
        question: addForm.question!,
        code: addForm.code || undefined,
        options: addForm.exerciseType === 'multiple-choice' && addForm.options?.length ? addForm.options : undefined,
        correct: addForm.exerciseType === 'multiple-choice' ? addForm.correct : undefined,
        keywords: addForm.exerciseType === 'know-output' && addForm.keywords?.length ? addForm.keywords : undefined,
        blanks: addForm.exerciseType === 'complete-code' && addForm.blanks?.length ? addForm.blanks : undefined,
        explanation: addForm.explanation!
      })
      setAddForm({ exerciseType: 'multiple-choice' })
      setShowAddForm(false)
      setContent((prev) =>
        prev
          ? {
              courses: prev.courses.map((c) =>
                c.id === selectedCourseId
                  ? {
                      ...c,
                      phases: c.phases.map((p) =>
                        p.id === selectedPhase ? { ...p, exercises: [...p.exercises, newEx] } : p
                      )
                    }
                  : c
              )
            }
          : prev
      )
      toast('Ejercicio creado', 'success')
    } catch (e) {
      if (is401(e)) {
        onUnauthorized()
        return
      }
      setAddError((e as Error).message || 'Error al agregar ejercicio')
    } finally {
      setAdding(false)
    }
  }

  // ── Exercise edit ─────────────────────────────────────────────────────────
  const startEditEx = (ex: AdminExercise) => {
    setEditingExId(ex.id)
    setEditExForm({
      exerciseType: ex.type,
      question: ex.question,
      code: ex.code ?? '',
      options: ex.options ?? [],
      correct: ex.correct ?? 0,
      keywords: ex.keywords ?? [],
      blanks: ex.blanks ?? [],
      explanation: ex.explanation
    })
    setUpdateError('')
    setShowAddForm(false)
  }

  const handleUpdate = async () => {
    if (!editingExId || !editExForm.question?.trim() || !editExForm.explanation?.trim()) return
    setUpdating(true)
    setUpdateError('')
    try {
      await updateExercise(token, editingExId, {
        exerciseType: editExForm.exerciseType!,
        question: editExForm.question!,
        code: editExForm.code || undefined,
        options:
          editExForm.exerciseType === 'multiple-choice' && editExForm.options?.length ? editExForm.options : undefined,
        correct: editExForm.exerciseType === 'multiple-choice' ? editExForm.correct : undefined,
        keywords:
          editExForm.exerciseType === 'know-output' && editExForm.keywords?.length ? editExForm.keywords : undefined,
        blanks:
          editExForm.exerciseType === 'complete-code' && editExForm.blanks?.length ? editExForm.blanks : undefined,
        explanation: editExForm.explanation!
      })
      setEditingExId(null)
      await loadContent()
      toast('Ejercicio actualizado', 'success')
    } catch (e) {
      if (is401(e)) {
        onUnauthorized()
        return
      }
      setUpdateError((e as Error).message || 'Error al actualizar')
    } finally {
      setUpdating(false)
    }
  }

  // ── Exercise delete ───────────────────────────────────────────────────────
  const handleDelete = async (ex: { id: string; question: string }) => {
    setConfirmDeleteEx(ex)
  }

  const doDeleteExercise = async () => {
    if (!confirmDeleteEx) return
    setDeletingId(confirmDeleteEx.id)
    const exId = confirmDeleteEx.id
    try {
      await deleteExercise(token, exId)
      setConfirmDeleteEx(null)
      setContent((prev) =>
        prev
          ? {
              courses: prev.courses.map((c) =>
                c.id === selectedCourseId
                  ? {
                      ...c,
                      phases: c.phases.map((p) =>
                        p.id === selectedPhase ? { ...p, exercises: p.exercises.filter((e: any) => e.id !== exId) } : p
                      )
                    }
                  : c
              )
            }
          : prev
      )
      toast('Ejercicio eliminado', 'success')
    } catch (e) {
      if (is401(e)) {
        onUnauthorized()
        return
      }
      toast((e as Error).message || 'Error al eliminar ejercicio', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  // ── Lesson delete ─────────────────────────────────────────────────────────
  const handleDeleteLesson = (slugId: string, title: string) => {
    setConfirmDeleteLessonItem({ id: slugId, title })
  }

  const doDeleteLesson = async () => {
    if (!confirmDeleteLessonItem) return
    setDeletingLessonId(confirmDeleteLessonItem.id)
    const lessonId = confirmDeleteLessonItem.id
    try {
      await deleteLesson(token, lessonId)
      setConfirmDeleteLessonItem(null)
      setContent((prev) =>
        prev
          ? {
              courses: prev.courses.map((c) =>
                c.id === selectedCourseId
                  ? {
                      ...c,
                      phases: c.phases.map((p) =>
                        p.id === selectedPhase ? { ...p, lessons: p.lessons.filter((l: any) => l.id !== lessonId) } : p
                      )
                    }
                  : c
              )
            }
          : prev
      )
      toast('Lección eliminada', 'success')
    } catch (e) {
      if (is401(e)) {
        onUnauthorized()
        return
      }
      toast((e as Error).message || 'Error al eliminar lección', 'error')
    } finally {
      setDeletingLessonId(null)
    }
  }

  // ── Lesson edit ───────────────────────────────────────────────────────────
  const startEditLesson = (lesson: Lesson) => {
    setEditingLessonId(lesson.id)
    setEditLessonTitle(lesson.title)
    setEditLessonBlocks(lesson.blocks as EditableBlock[])
    setLessonError('')
  }

  const handleUpdateLesson = async () => {
    if (!editingLessonId || !editLessonTitle.trim()) return
    setUpdatingLesson(true)
    setLessonError('')
    try {
      await updateLesson(token, editingLessonId, {
        title: editLessonTitle,
        blocksJson: JSON.stringify(editLessonBlocks)
      })
      setEditingLessonId(null)
      await loadContent()
      toast('Lección actualizada', 'success')
    } catch (e) {
      if (is401(e)) {
        onUnauthorized()
        return
      }
      setLessonError((e as Error).message || 'Error al guardar lección')
    } finally {
      setUpdatingLesson(false)
    }
  }

  // ── Lesson add ────────────────────────────────────────────────────────────
  const handleAddLesson = async () => {
    if (!addLessonTitle.trim() || selectedCourseId === null) return
    setAddingLesson(true)
    setAddLessonError('')
    try {
      const newLesson = await addLesson(token, {
        courseId: selectedCourseId,
        phaseOrder: selectedPhase,
        title: addLessonTitle.trim(),
        blocksJson: JSON.stringify(addLessonBlocks)
      })
      setAddLessonTitle('')
      setAddLessonBlocks([])
      setShowAddLessonForm(false)
      setContent((prev) =>
        prev
          ? {
              courses: prev.courses.map((c) =>
                c.id === selectedCourseId
                  ? {
                      ...c,
                      phases: c.phases.map((p) =>
                        p.id === selectedPhase ? { ...p, lessons: [...p.lessons, newLesson] } : p
                      )
                    }
                  : c
              )
            }
          : prev
      )
      toast('Lección creada', 'success')
    } catch (e) {
      if (is401(e)) {
        onUnauthorized()
        return
      }
      setAddLessonError((e as Error).message || 'Error al agregar lección')
    } finally {
      setAddingLesson(false)
    }
  }

  // ── Course delete ─────────────────────────────────────────────────────────
  const doDeleteCourse = async () => {
    if (!confirmDeleteCourse) return
    setDeletingCourse(true)
    try {
      await deleteCourse(token, confirmDeleteCourse.id)
      setContent((prev) => (prev ? { courses: prev.courses.filter((c) => c.id !== confirmDeleteCourse.id) } : prev))
      setConfirmDeleteCourse(null)
      if (selectedCourseId === confirmDeleteCourse.id) backToCourses()
      toast('Curso eliminado', 'success')
    } catch (e) {
      if (is401(e)) {
        onUnauthorized()
        return
      }
      toast((e as Error).message || 'Error al eliminar curso', 'error')
    } finally {
      setDeletingCourse(false)
    }
  }

  // ── Phase delete ──────────────────────────────────────────────────────────
  const doDeletePhase = async () => {
    if (!confirmDeletePhase) return
    setDeletingPhase(true)
    try {
      await deletePhase(token, confirmDeletePhase.id)
      setContent((prev) => {
        if (!prev) return prev
        return {
          courses: prev.courses.map((c) =>
            c.id === selectedCourseId ? { ...c, phases: c.phases.filter((p) => p.dbId !== confirmDeletePhase.id) } : c
          )
        }
      })
      setConfirmDeletePhase(null)
      toast('Fase eliminada', 'success')
    } catch (e) {
      if (is401(e)) {
        onUnauthorized()
        return
      }
      toast((e as Error).message || 'Error al eliminar fase', 'error')
    } finally {
      setDeletingPhase(false)
    }
  }

  // ── Course create ─────────────────────────────────────────────────────────
  const handleCreateCourse = async () => {
    if (!createCourseForm.name.trim() || !createCourseForm.slug.trim()) return
    setCreatingCourse(true)
    setCreateCourseError('')
    try {
      const newCourse = await createCourse(token, createCourseForm)
      setShowCreateCourse(false)
      setCreateCourseForm({ name: '', description: '', icon: '📚', color: '#ab9df2', slug: '', order: 1 })
      setContent((prev) =>
        prev
          ? { courses: [...prev.courses, { ...newCourse, phases: [] }] }
          : { courses: [{ ...newCourse, phases: [] }] }
      )
      toast('Curso creado', 'success')
    } catch (e) {
      if (is401(e)) {
        onUnauthorized()
        return
      }
      setCreateCourseError((e as Error).message || 'Error al crear curso')
    } finally {
      setCreatingCourse(false)
    }
  }

  // ── Phase create ──────────────────────────────────────────────────────────
  const handleCreatePhase = async () => {
    if (!createPhaseForm.name.trim() || selectedCourseId === null) return
    setCreatingPhase(true)
    setCreatePhaseError('')
    try {
      const newPhase = await createPhase(token, { ...createPhaseForm, courseId: selectedCourseId })
      setShowCreatePhase(false)
      setCreatePhaseForm({ name: '', icon: '📖', order: 1 })
      setContent((prev) => {
        if (!prev) return prev
        return {
          courses: prev.courses.map((c) =>
            c.id === selectedCourseId ? { ...c, phases: [...c.phases, { ...newPhase, lessons: [], exercises: [] }] } : c
          )
        }
      })
      toast('Fase creada', 'success')
    } catch (e) {
      if (is401(e)) {
        onUnauthorized()
        return
      }
      setCreatePhaseError((e as Error).message || 'Error al crear fase')
    } finally {
      setCreatingPhase(false)
    }
  }

  if (loadingContent) {
    return (
      <div className='flex items-center justify-center gap-3 py-16'>
        <span className='h-2 w-2 animate-pulse rounded-full' style={{ background: 'var(--primary)' }} />
        <span className='animate-pulse text-sm' style={{ color: 'var(--text-3)' }}>
          Cargando contenido...
        </span>
      </div>
    )
  }

  // ── Course picker (no course selected yet) ────────────────────────────────
  if (!currentCourse) {
    return (
      <div className='animate-fade-up space-y-5'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-base leading-tight font-black' style={{ color: 'var(--text-1)' }}>
              Seleccioná un curso para editar
            </h3>
            <p className='mt-1 text-xs' style={{ color: 'var(--text-3)' }}>
              Elegí el curso cuyo contenido querés modificar.
            </p>
          </div>
          <button
            onClick={() => setShowCreateCourse(true)}
            className='shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80'
            style={{ background: 'var(--grad)', color: '#fff', boxShadow: '0 2px 8px var(--primary-glow)' }}
          >
            ➕ Nuevo curso
          </button>
        </div>

        <div
          className='flex items-center gap-2 rounded-xl px-3 py-2'
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)' }}
        >
          <span className='text-sm' style={{ color: 'var(--text-3)' }}>🔍</span>
          <input
            type='text'
            value={courseSearch}
            onChange={(e) => setCourseSearch(e.target.value)}
            placeholder='Buscar curso...'
            className='flex-1 bg-transparent text-sm outline-none'
            style={{ color: 'var(--text-1)' }}
          />
          {courseSearch && (
            <button onClick={() => setCourseSearch('')} className='text-xs' style={{ color: 'var(--text-3)' }}>
              ✕
            </button>
          )}
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          {courses.filter((c) =>
            courseSearch.trim() === '' ||
            c.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
            c.description?.toLowerCase().includes(courseSearch.toLowerCase())
          ).map((c) => {
            const totalLessons = c.phases.reduce((sum, p) => sum + (p.lessons as Lesson[]).length, 0)
            const totalExercises = c.phases.reduce((sum, p) => sum + (p.exercises as AdminExercise[]).length, 0)
            return (
              <button
                key={c.id}
                onClick={() => switchCourse(c.id)}
                className='w-full overflow-hidden rounded-2xl text-left transition-all hover:scale-[1.01]'
                style={{
                  background: 'var(--bg-card)',
                  border: `1px solid ${c.color}30`,
                  boxShadow: 'var(--shadow-card)'
                }}
              >
                <div
                  className='flex items-center gap-3 px-5 py-4'
                  style={{
                    background: `linear-gradient(135deg, ${c.color}20 0%, ${c.color}08 100%)`,
                    borderBottom: `1px solid ${c.color}20`
                  }}
                >
                  <div
                    className='flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl text-3xl'
                    style={{ background: `${c.color}25`, border: `1px solid ${c.color}40` }}
                  >
                    <CourseIcon icon={c.icon} className='h-11 w-11' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='truncate text-base leading-snug font-black' style={{ color: 'var(--text-1)' }}>
                      {c.name}
                    </div>
                    <div className='text-xs' style={{ color: 'var(--text-3)' }}>
                      {c.phases.length} fase{c.phases.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  {!c.isDefault && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setConfirmDeleteCourse({ id: c.id, name: c.name })
                      }}
                      className='ml-2 rounded-lg px-2 py-0.5 text-xs transition-all hover:opacity-80'
                      style={{
                        background: 'rgba(255,97,136,0.10)',
                        color: '#ffb3c6',
                        border: '1px solid rgba(255,97,136,0.25)'
                      }}
                      title='Eliminar curso'
                    >
                      🗑
                    </button>
                  )}
                </div>
                <div className='px-5 py-3.5'>
                  {c.description && (
                    <p className='mb-3 text-xs leading-relaxed' style={{ color: 'var(--text-3)' }}>
                      {c.description.slice(0, 100)}
                      {c.description.length > 100 ? '…' : ''}
                    </p>
                  )}
                  <div className='flex flex-wrap gap-2'>
                    <span
                      className='rounded-md px-2 py-0.5 text-xs'
                      style={{
                        background: 'rgba(34,197,94,0.08)',
                        border: '1px solid rgba(34,197,94,0.18)',
                        color: '#a9dc76'
                      }}
                    >
                      📖 {totalLessons} lecciones
                    </span>
                    <span
                      className='rounded-md px-2 py-0.5 text-xs'
                      style={{
                        background: 'rgba(171,157,242,0.08)',
                        border: '1px solid var(--border-default)',
                        color: 'var(--primary)'
                      }}
                    >
                      💻 {totalExercises} ejercicios
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
          {courses.filter((c) =>
            courseSearch.trim() === '' ||
            c.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
            c.description?.toLowerCase().includes(courseSearch.toLowerCase())
          ).length === 0 && courseSearch.trim() !== '' && (
            <p className='col-span-2 py-6 text-center text-sm' style={{ color: 'var(--text-3)' }}>
              No se encontraron cursos para "{courseSearch}"
            </p>
          )}
        </div>

        {/* ── Delete course confirmation ── */}
        {confirmDeleteCourse && (
          <ConfirmModal
            title='¿Eliminar curso?'
            message={`"${confirmDeleteCourse.name}" y todo su contenido serán eliminados.`}
            detail='Esta acción no puede deshacerse. Se eliminarán todas las fases, lecciones y ejercicios.'
            confirmLabel='Sí, eliminar'
            confirmStyle='danger'
            loading={deletingCourse}
            onConfirm={doDeleteCourse}
            onClose={() => setConfirmDeleteCourse(null)}
          />
        )}

        {/* ── Create course modal ── */}
        {showCreateCourse && (
          <CourseModal
            title='Nuevo curso'
            onClose={() => {
              setShowCreateCourse(false)
              setCreateCourseError('')
            }}
          >
            <div className='space-y-3 p-5'>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                <div>
                  <label className='mb-1.5 block text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
                    Nombre <span style={{ color: '#ffb3c6' }}>*</span>
                  </label>
                  <DarkInput
                    value={createCourseForm.name}
                    onChange={(e) => setCreateCourseForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder='Nombre del curso'
                  />
                </div>
                <div>
                  <label className='mb-1.5 block text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
                    Slug (URL) <span style={{ color: '#ffb3c6' }}>*</span>
                  </label>
                  <DarkInput
                    value={createCourseForm.slug}
                    onChange={(e) => setCreateCourseForm((f) => ({ ...f, slug: e.target.value }))}
                    placeholder='react-frontend'
                  />
                </div>
                <div className='sm:col-span-2'>
                  <label className='mb-1.5 block text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
                    Ícono
                  </label>
                  <IconPicker
                    value={createCourseForm.icon}
                    onChange={(v) => setCreateCourseForm((f) => ({ ...f, icon: v }))}
                  />
                </div>
                <div>
                  <label className='mb-1.5 block text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
                    Color (hex)
                  </label>
                  <div className='flex items-center gap-2'>
                    <DarkInput
                      value={createCourseForm.color}
                      onChange={(e) => setCreateCourseForm((f) => ({ ...f, color: e.target.value }))}
                      placeholder='#ab9df2'
                    />
                    <input
                      type='color'
                      value={createCourseForm.color}
                      onChange={(e) => setCreateCourseForm((f) => ({ ...f, color: e.target.value }))}
                      className='h-9 w-10 shrink-0 cursor-pointer rounded-lg'
                      style={{
                        background: 'var(--bg-base)',
                        border: '1px solid var(--border-default)',
                        padding: '2px'
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label className='mb-1.5 block text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
                    Orden
                  </label>
                  <input
                    type='number'
                    min={1}
                    value={createCourseForm.order}
                    onChange={(e) => setCreateCourseForm((f) => ({ ...f, order: Number(e.target.value) }))}
                    className='w-full rounded-xl px-3 py-2 text-sm'
                    style={{
                      background: 'var(--bg-base)',
                      color: 'var(--text-1)',
                      border: '1px solid var(--border-default)'
                    }}
                  />
                </div>
                <div className='sm:col-span-2'>
                  <label className='mb-1.5 block text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
                    Descripción
                  </label>
                  <DarkTextarea
                    value={createCourseForm.description}
                    onChange={(e) => setCreateCourseForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder='Descripción del curso...'
                    rows={2}
                  />
                </div>
              </div>
              {createCourseError && (
                <p className='text-xs' style={{ color: '#ffb3c6' }}>
                  {createCourseError}
                </p>
              )}
              <div className='w-44'>
                <PrimaryBtn
                  onClick={handleCreateCourse}
                  disabled={!createCourseForm.name.trim() || !createCourseForm.slug.trim() || creatingCourse}
                >
                  {creatingCourse ? 'Creando...' : '➕ Crear curso'}
                </PrimaryBtn>
              </div>
            </div>
          </CourseModal>
        )}
      </div>
    )
  }

  return (
    <div className='animate-fade-up space-y-5'>
      {/* ── Course header with back button ── */}
      <div className='flex items-center gap-3'>
        <button
          onClick={backToCourses}
          className='flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80'
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-2)'
          }}
        >
          ← Cursos
        </button>
        <div
          className='flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl text-lg'
          style={{ background: `${currentCourse.color}25`, border: `1px solid ${currentCourse.color}40` }}
        >
          <CourseIcon icon={currentCourse.icon} className='h-8 w-8' />
        </div>
        <div className='min-w-0 flex-1'>
          <div className='text-sm leading-tight font-black' style={{ color: 'var(--text-1)' }}>
            {currentCourse.name}
          </div>
          <div className='text-xs' style={{ color: 'var(--text-3)' }}>
            {phases.length} fase{phases.length !== 1 ? 's' : ''}
          </div>
        </div>
        <button
          onClick={openCourseEdit}
          className='shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80'
          style={{
            background: 'rgba(171,157,242,0.10)',
            color: 'var(--primary)',
            border: '1px solid var(--border-default)'
          }}
        >
          ✏️ Editar curso
        </button>
      </div>

      {/* ── Main 2-col layout ── */}
      <div className='grid grid-cols-1 items-start gap-5 md:grid-cols-[220px_1fr]'>
        {/* ── Phase sidebar ── */}
        <div className='space-y-1.5'>
          {/* Header */}
          <div className='mb-2 flex items-center justify-between px-1'>
            <div className='flex items-center gap-2'>
              <div
                className='flex h-7 w-7 items-center justify-center rounded-lg text-sm'
                style={{ background: 'rgba(171,157,242,0.12)', border: '1px solid var(--border-default)' }}
              >
                ⚡
              </div>
              <span className='text-xs font-bold tracking-widest uppercase' style={{ color: 'var(--text-3)' }}>
                Fases
              </span>
            </div>
            <button
              onClick={() => {
                setShowCreatePhase(true)
                setCreatePhaseError('')
                setCreatePhaseForm({ name: '', icon: '📖', order: 1 })
              }}
              className='rounded-lg px-2.5 py-1 text-xs font-bold transition-all hover:opacity-80'
              style={{
                background: 'rgba(169,220,118,0.10)',
                color: '#a9dc76',
                border: '1px solid rgba(169,220,118,0.25)'
              }}
              title='Nueva fase'
            >
              + Nueva
            </button>
          </div>

          {phases.map((p) => {
            const isSelected = selectedPhase === p.id
            const exCount = (p.exercises as AdminExercise[]).length
            const lsCount = (p.lessons as Lesson[]).length
            const isProtected = !!(p as any).isDefault
            return (
              <div
                key={p.id}
                className='flex items-center gap-0 overflow-hidden rounded-xl transition-all'
                style={
                  isSelected
                    ? {
                        background: 'linear-gradient(135deg,#ab9df2,#8b5cf6)',
                        boxShadow: '0 4px 12px var(--primary-glow)'
                      }
                    : { background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }
                }
              >
                {/* Selectable area */}
                <button
                  onClick={() => switchPhase(p.id)}
                  className='flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2.5 text-left'
                >
                  <span className='shrink-0 text-lg'>{p.icon}</span>
                  <div className='min-w-0 flex-1'>
                    <div
                      className='truncate text-xs leading-tight font-bold'
                      style={{ color: isSelected ? '#fff' : 'var(--text-1)' }}
                    >
                      {p.name}
                    </div>
                    <div
                      className='mt-0.5 flex gap-2 text-xs'
                      style={{ color: isSelected ? 'rgba(255,255,255,0.65)' : 'var(--text-3)' }}
                    >
                      <span>📖 {lsCount}</span>
                      <span>💻 {exCount}</span>
                    </div>
                  </div>
                </button>

                {/* Inline actions — solo al seleccionar */}
                {isSelected && (
                  <div className='flex shrink-0 items-center gap-1 pr-2'>
                    <button
                      onClick={openPhaseEdit}
                      title='Editar fase'
                      className='flex h-7 w-7 items-center justify-center rounded-lg text-sm transition-all hover:opacity-70'
                      style={{ background: 'rgba(255,255,255,0.18)' }}
                    >
                      ✏️
                    </button>
                    {!isProtected && (
                      <button
                        onClick={() => setConfirmDeletePhase({ id: p.dbId as number, name: p.name })}
                        title='Eliminar fase'
                        className='flex h-7 w-7 items-center justify-center rounded-lg text-sm transition-all hover:opacity-70'
                        style={{ background: 'rgba(255,97,136,0.30)' }}
                      >
                        🗑
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Phase content area ── */}
        <div className='space-y-4'>
          {/* Phase header */}
          {currentPhase && (
            <div className='flex items-center gap-3 px-1'>
              <div
                className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg'
                style={{ background: 'rgba(171,157,242,0.12)', border: '1px solid var(--border-default)' }}
              >
                {currentPhase.icon}
              </div>
              <div className='min-w-0 flex-1'>
                <h3 className='truncate text-sm leading-tight font-black' style={{ color: 'var(--text-1)' }}>
                  {currentPhase.name}
                </h3>
                <p className='mt-0.5 text-xs' style={{ color: 'var(--text-3)' }}>
                  Fase {currentPhase.id} · {exercises.length} ejercicio{exercises.length !== 1 ? 's' : ''} ·{' '}
                  {lessons.length} lección{lessons.length !== 1 ? 'es' : ''}
                </p>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className='grid grid-cols-2 gap-2'>
            {(['exercises', 'lessons'] as const).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className='rounded-xl py-2.5 text-sm font-bold transition-all'
                style={
                  activeTab === t
                    ? { background: 'var(--grad)', color: '#fff', boxShadow: '0 4px 12px var(--primary-glow)' }
                    : { background: 'var(--bg-card)', color: 'var(--text-3)', border: '1px solid var(--border-subtle)' }
                }
              >
                {t === 'exercises' ? '⚡ Ejercicios' : '📖 Lecciones'}
              </button>
            ))}
          </div>

          {/* ── Exercises panel ── */}
          {activeTab === 'exercises' && (
            <div
              className='overflow-hidden rounded-2xl'
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
            >
              <div
                className='flex items-center justify-between px-5 py-4'
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <div className='flex items-center gap-2'>
                  <div
                    className='flex h-7 w-7 items-center justify-center rounded-lg text-sm'
                    style={{ background: 'rgba(171,157,242,0.12)', border: '1px solid var(--border-default)' }}
                  >
                    ⚡
                  </div>
                  <span className='text-sm font-bold' style={{ color: 'var(--text-1)' }}>
                    {exercises.length} ejercicio{exercises.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <DarkInput
                    value={contentSearch}
                    onChange={(e) => setContentSearch(e.target.value)}
                    placeholder='Buscar ejercicios...'
                  />
                  <button
                    onClick={() => {
                      setShowAddForm(true)
                      setAddForm({ exerciseType: 'multiple-choice' })
                      setAddError('')
                    }}
                    className='shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-all hover:opacity-80'
                    style={{
                      background: 'rgba(169,220,118,0.10)',
                      color: '#a9dc76',
                      border: '1px solid rgba(169,220,118,0.25)'
                    }}
                  >
                    + Agregar
                  </button>
                </div>
              </div>

              {exercises.length === 0 && (
                <div className='px-5 py-10 text-center text-sm' style={{ color: 'var(--text-3)' }}>
                  No hay ejercicios en esta fase.
                </div>
              )}

              <div>
                {exercises
                  .filter(
                    (ex) =>
                      !contentSearch.trim() ||
                      ex.question.toLowerCase().includes(contentSearch.toLowerCase()) ||
                      ex.id.toLowerCase().includes(contentSearch.toLowerCase())
                  )
                  .map((ex) => (
                    <div
                      key={ex.id}
                      className='flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/2'
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                    >
                      <TypeBadge type={ex.type as Exercise['type']} />
                      <div className='min-w-0 flex-1'>
                        <p className='text-xs leading-relaxed font-medium' style={{ color: 'var(--text-1)' }}>
                          {ex.question.slice(0, 110)}
                          {ex.question.length > 110 ? '…' : ''}
                        </p>
                        <p className='mt-0.5 flex items-center gap-1.5 text-xs' style={{ color: 'var(--text-3)' }}>
                          <span className='font-mono'>{ex.id}</span>
                          {ex.isDefault ? (
                            <span title='Ejercicio incluido con el curso. Podés editarlo pero no eliminarlo.'>
                              🔒 Predeterminado
                            </span>
                          ) : (
                            <span style={{ color: '#6EE7B7' }}>✓ Personalizado</span>
                          )}
                        </p>
                      </div>
                      <div className='flex shrink-0 gap-1.5'>
                        <button
                          onClick={() => startEditEx(ex)}
                          className='rounded-lg px-2.5 py-1 text-xs font-semibold transition-all'
                          style={{
                            background: 'rgba(171,157,242,0.10)',
                            color: 'var(--primary)',
                            border: '1px solid var(--border-default)'
                          }}
                        >
                          ✏️
                        </button>
                        {!ex.isDefault && (
                          <button
                            onClick={() => handleDelete({ id: ex.id, question: ex.question })}
                            disabled={deletingId === ex.id}
                            className='rounded-lg px-2.5 py-1 text-xs font-semibold transition-all'
                            style={{
                              background: 'rgba(255,97,136,0.10)',
                              color: '#ffb3c6',
                              border: '1px solid rgba(255,97,136,0.25)'
                            }}
                          >
                            {deletingId === ex.id ? '…' : '✕'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ── Lessons panel ── */}
          {activeTab === 'lessons' && (
            <div
              className='overflow-hidden rounded-2xl'
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
            >
              <div
                className='flex items-center justify-between px-5 py-4'
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <div className='flex items-center gap-2'>
                  <div
                    className='flex h-7 w-7 items-center justify-center rounded-lg text-sm'
                    style={{ background: 'rgba(171,157,242,0.12)', border: '1px solid var(--border-default)' }}
                  >
                    📖
                  </div>
                  <span className='text-sm font-bold' style={{ color: 'var(--text-1)' }}>
                    {lessons.length} lección{lessons.length !== 1 ? 'es' : ''}
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <DarkInput
                    value={contentSearch}
                    onChange={(e) => setContentSearch(e.target.value)}
                    placeholder='Buscar lecciones...'
                  />
                  <button
                    onClick={() => {
                      setShowAddLessonForm(true)
                      setAddLessonTitle('')
                      setAddLessonBlocks([])
                      setAddLessonError('')
                    }}
                    className='shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition-all hover:opacity-80'
                    style={{
                      background: 'rgba(169,220,118,0.10)',
                      color: '#a9dc76',
                      border: '1px solid rgba(169,220,118,0.25)'
                    }}
                  >
                    + Agregar
                  </button>
                </div>
              </div>

              {lessons.length === 0 && (
                <div className='px-5 py-10 text-center text-sm' style={{ color: 'var(--text-3)' }}>
                  No hay lecciones en esta fase.
                </div>
              )}

              {lessons
                .filter(
                  (l) =>
                    !contentSearch.trim() ||
                    l.title.toLowerCase().includes(contentSearch.toLowerCase()) ||
                    l.id.toLowerCase().includes(contentSearch.toLowerCase())
                )
                .map((lesson) => (
                  <div
                    key={lesson.id}
                    className='flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/2'
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                  >
                    <div
                      className='flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm'
                      style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)' }}
                    >
                      📄
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-sm leading-tight font-semibold' style={{ color: 'var(--text-1)' }}>
                        {lesson.title}
                      </p>
                      <p className='mt-0.5 text-xs' style={{ color: 'var(--text-3)' }}>
                        {lesson.blocks.length} bloque{lesson.blocks.length !== 1 ? 's' : ''} ·{' '}
                        <span className='font-mono'>{lesson.id}</span>
                      </p>
                    </div>
                    <div className='flex shrink-0 gap-1.5'>
                      <button
                        onClick={() => startEditLesson(lesson)}
                        className='rounded-lg px-2.5 py-1 text-xs font-semibold transition-all'
                        style={{
                          background: 'rgba(171,157,242,0.10)',
                          color: 'var(--primary)',
                          border: '1px solid var(--border-default)'
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                        disabled={deletingLessonId === lesson.id}
                        className='rounded-lg px-2.5 py-1 text-xs font-semibold transition-all'
                        style={{
                          background: 'rgba(255,97,136,0.10)',
                          color: '#ffb3c6',
                          border: '1px solid rgba(255,97,136,0.25)'
                        }}
                      >
                        {deletingLessonId === lesson.id ? '…' : '✕'}
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Phase create modal ── */}
      {showCreatePhase && (
        <CourseModal
          title='Nueva fase'
          onClose={() => {
            setShowCreatePhase(false)
            setCreatePhaseError('')
          }}
        >
          <div className='space-y-3 p-5'>
            <div>
              <label className='mb-1.5 block text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
                Nombre <span style={{ color: '#ffb3c6' }}>*</span>
              </label>
              <DarkInput
                value={createPhaseForm.name}
                onChange={(e) => setCreatePhaseForm((f) => ({ ...f, name: e.target.value }))}
                placeholder='Nombre de la fase'
              />
            </div>
            <div>
              <label className='mb-1.5 block text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
                Ícono (emoji)
              </label>
              <DarkInput
                value={createPhaseForm.icon}
                onChange={(e) => setCreatePhaseForm((f) => ({ ...f, icon: e.target.value }))}
                placeholder='📖'
              />
            </div>
            {createPhaseError && (
              <p className='text-xs' style={{ color: '#ffb3c6' }}>
                {createPhaseError}
              </p>
            )}
            <div className='w-44'>
              <PrimaryBtn onClick={handleCreatePhase} disabled={!createPhaseForm.name.trim() || creatingPhase}>
                {creatingPhase ? 'Creando...' : '➕ Crear fase'}
              </PrimaryBtn>
            </div>
          </div>
        </CourseModal>
      )}

      {/* ── Phase edit modal ── */}
      {showPhaseEdit && currentPhase && (
        <CourseModal
          title={`Editar fase · ${currentPhase.name}`}
          onClose={() => {
            setShowPhaseEdit(false)
            setPhaseEditError('')
          }}
        >
          <div className='space-y-3 p-5'>
            <div>
              <label className='mb-1.5 block text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
                Nombre <span style={{ color: '#ffb3c6' }}>*</span>
              </label>
              <DarkInput
                value={phaseForm.name}
                onChange={(e) => setPhaseForm((f) => ({ ...f, name: e.target.value }))}
                placeholder='Nombre de la fase'
              />
            </div>
            <div>
              <label className='mb-1.5 block text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
                Ícono (emoji)
              </label>
              <DarkInput
                value={phaseForm.icon}
                onChange={(e) => setPhaseForm((f) => ({ ...f, icon: e.target.value }))}
                placeholder='🏗️'
              />
            </div>
            {phaseEditError && (
              <p className='text-xs' style={{ color: '#ffb3c6' }}>
                {phaseEditError}
              </p>
            )}
            <div className='w-44'>
              <PrimaryBtn onClick={handleSavePhase} disabled={!phaseForm.name.trim() || savingPhase}>
                {savingPhase ? 'Guardando...' : '💾 Guardar fase'}
              </PrimaryBtn>
            </div>
          </div>
        </CourseModal>
      )}

      {/* ── Phase delete confirmation ── */}
      {confirmDeletePhase && (
        <ConfirmModal
          title='¿Eliminar fase?'
          message={`"${confirmDeletePhase.name}" y todo su contenido serán eliminados.`}
          detail='Esta acción no puede deshacerse.'
          confirmLabel='Sí, eliminar'
          confirmStyle='danger'
          loading={deletingPhase}
          onConfirm={doDeletePhase}
          onClose={() => setConfirmDeletePhase(null)}
        />
      )}

      {/* ── Course edit modal ── */}
      {showCourseEdit && currentCourse && (
        <CourseModal title={`Editar · ${currentCourse.name}`} onClose={() => setShowCourseEdit(false)}>
          <div className='space-y-3 p-5'>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <div>
                <label className='mb-1.5 block text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
                  Nombre <span style={{ color: '#ffb3c6' }}>*</span>
                </label>
                <DarkInput
                  value={courseForm.name}
                  onChange={(e) => setCourseForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder='Nombre del curso'
                />
              </div>
              <div>
                <label className='mb-1.5 block text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
                  Slug (URL) <span style={{ color: '#ffb3c6' }}>*</span>
                </label>
                <DarkInput
                  value={courseForm.slug}
                  onChange={(e) => setCourseForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder='net-backend'
                />
              </div>
              <div className='sm:col-span-2'>
                <label className='mb-1.5 block text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
                  Ícono
                </label>
                <IconPicker value={courseForm.icon} onChange={(v) => setCourseForm((f) => ({ ...f, icon: v }))} />
              </div>
              <div>
                <label className='mb-1.5 block text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
                  Color (hex)
                </label>
                <div className='flex items-center gap-2'>
                  <DarkInput
                    value={courseForm.color}
                    onChange={(e) => setCourseForm((f) => ({ ...f, color: e.target.value }))}
                    placeholder='#ab9df2'
                  />
                  <input
                    type='color'
                    value={courseForm.color}
                    onChange={(e) => setCourseForm((f) => ({ ...f, color: e.target.value }))}
                    className='h-9 w-10 shrink-0 cursor-pointer rounded-lg'
                    style={{ background: 'var(--bg-base)', border: '1px solid var(--border-default)', padding: '2px' }}
                  />
                </div>
              </div>
              <div>
                <label className='mb-1.5 block text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
                  Orden
                </label>
                <input
                  type='number'
                  min={1}
                  value={courseForm.order}
                  onChange={(e) => setCourseForm((f) => ({ ...f, order: Number(e.target.value) }))}
                  className='w-full rounded-xl px-3 py-2 text-sm'
                  style={{
                    background: 'var(--bg-base)',
                    color: 'var(--text-1)',
                    border: '1px solid var(--border-default)'
                  }}
                />
              </div>
              <div className='sm:col-span-2'>
                <label className='mb-1.5 block text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
                  Descripción
                </label>
                <DarkTextarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder='Descripción del curso...'
                  rows={2}
                />
              </div>
              <div className='sm:col-span-2'>
                <label className='mb-1.5 block text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
                  Cursos recomendados antes{' '}
                  <span className='font-normal' style={{ color: 'var(--text-3)' }}>(no restrictivos — solo informativos)</span>
                </label>
                {courses.filter((c) => c.id !== selectedCourseId).length === 0 ? (
                  <p className='text-xs' style={{ color: 'var(--text-3)' }}>No hay otros cursos disponibles.</p>
                ) : (
                  <div className='flex flex-wrap gap-1.5 mt-1'>
                    {courses
                      .filter((c) => c.id !== selectedCourseId)
                      .sort((a, b) => a.order - b.order)
                      .map((c) => {
                        const isSelected = (courseForm.prerequisites ?? []).includes(c.slug)
                        return (
                          <button
                            key={c.id}
                            type='button'
                            onClick={() =>
                              setCourseForm((f) => ({
                                ...f,
                                prerequisites: isSelected
                                  ? (f.prerequisites ?? []).filter((s) => s !== c.slug)
                                  : [...(f.prerequisites ?? []), c.slug]
                              }))
                            }
                            className='text-xs px-2 py-1 rounded-lg font-medium transition-all flex items-center gap-1'
                            style={
                              isSelected
                                ? { background: 'rgba(171,157,242,0.18)', color: 'var(--primary)', border: '1.5px solid var(--primary)' }
                                : { background: 'rgba(255,255,255,0.03)', color: 'var(--text-3)', border: '1px solid var(--border-subtle)' }
                            }
                          >
                            <CourseIcon icon={c.icon} size={14} className='rounded shrink-0' />
                            {c.name}
                            {isSelected && <span className='ml-0.5 font-black'>✓</span>}
                          </button>
                        )
                      })}
                  </div>
                )}
              </div>
            </div>
            {courseError && (
              <p className='text-xs' style={{ color: '#ffb3c6' }}>
                {courseError}
              </p>
            )}
            <div className='w-44'>
              <PrimaryBtn
                onClick={handleSaveCourse}
                disabled={!courseForm.name.trim() || !courseForm.slug.trim() || savingCourse}
              >
                {savingCourse ? 'Guardando...' : '💾 Guardar curso'}
              </PrimaryBtn>
            </div>
          </div>
        </CourseModal>
      )}

      {/* ── Exercise delete confirmation ── */}
      {confirmDeleteEx && (
        <ConfirmModal
          title='¿Eliminar ejercicio?'
          message={`"${confirmDeleteEx.question.slice(0, 80)}${confirmDeleteEx.question.length > 80 ? '…' : ''}"`}
          detail='Esta acción no puede deshacerse.'
          confirmLabel='Sí, eliminar'
          confirmStyle='danger'
          loading={deletingId === confirmDeleteEx.id}
          onConfirm={doDeleteExercise}
          onClose={() => setConfirmDeleteEx(null)}
        />
      )}

      {/* ── Lesson delete confirmation ── */}
      {confirmDeleteLessonItem && (
        <ConfirmModal
          title='¿Eliminar lección?'
          message={`"${confirmDeleteLessonItem.title}"`}
          detail='Esta acción no puede deshacerse.'
          confirmLabel='Sí, eliminar'
          confirmStyle='danger'
          loading={deletingLessonId === confirmDeleteLessonItem.id}
          onConfirm={doDeleteLesson}
          onClose={() => setConfirmDeleteLessonItem(null)}
        />
      )}

      {/* ── Add exercise modal ── */}
      {showAddForm && (
        <ContentModal title='Nuevo ejercicio' onClose={() => setShowAddForm(false)}>
          <ExerciseForm
            form={addForm}
            setForm={setAddForm}
            onSubmit={handleAdd}
            submitting={adding}
            error={addError}
            submitLabel='Guardar ejercicio'
          />
        </ContentModal>
      )}

      {/* ── Add lesson modal ── */}
      {showAddLessonForm && (
        <ContentModal title='Nueva lección' onClose={() => setShowAddLessonForm(false)}>
          <div className='p-5'>
            <div className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
              <div className='space-y-4'>
                <div>
                  <label className='mb-1.5 block text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
                    Título de la lección
                  </label>
                  <DarkInput
                    value={addLessonTitle}
                    onChange={(e) => setAddLessonTitle(e.target.value)}
                    placeholder='Título de la nueva lección'
                  />
                </div>
                <div>
                  <label className='mb-2 block text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
                    Contenido · {addLessonBlocks.length} bloque{addLessonBlocks.length !== 1 ? 's' : ''}
                  </label>
                  <LessonBlockEditor blocks={addLessonBlocks} onChange={setAddLessonBlocks} />
                </div>
                {addLessonError && (
                  <p className='text-xs' style={{ color: '#ffb3c6' }}>
                    {addLessonError}
                  </p>
                )}
                <div className='flex flex-wrap items-center gap-2'>
                  <div className='w-44'>
                    <PrimaryBtn onClick={handleAddLesson} disabled={!addLessonTitle.trim() || addingLesson}>
                      {addingLesson ? 'Guardando...' : '💾 Crear lección'}
                    </PrimaryBtn>
                  </div>
                  <button
                    onClick={() => setShowAddLessonForm(false)}
                    className='rounded-xl px-4 py-2 text-xs font-semibold transition-all hover:opacity-80'
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      color: 'var(--text-3)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
              <PreviewShell>
                <LessonLivePreview title={addLessonTitle} blocks={addLessonBlocks} />
              </PreviewShell>
            </div>
          </div>
        </ContentModal>
      )}

      {/* ── Exercise edit modal ── */}
      {editingExId && (
        <ContentModal title={`Editar ejercicio · ${editingExId}`} onClose={() => setEditingExId(null)}>
          <ExerciseForm
            form={editExForm}
            setForm={setEditExForm}
            onSubmit={handleUpdate}
            submitting={updating}
            error={updateError}
            submitLabel='Actualizar ejercicio'
          />
        </ContentModal>
      )}

      {/* ── Lesson edit modal ── */}
      {editingLessonId && (
        <ContentModal
          title={`Editar lección · ${editLessonTitle || editingLessonId}`}
          onClose={() => setEditingLessonId(null)}
        >
          <div className='p-5'>
            <div className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
              <div className='space-y-4'>
                <div>
                  <label className='mb-1.5 block text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
                    Título de la lección
                  </label>
                  <DarkInput
                    value={editLessonTitle}
                    onChange={(e) => setEditLessonTitle(e.target.value)}
                    placeholder='Título de la lección'
                  />
                </div>
                <div>
                  <label className='mb-2 block text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
                    Contenido · {editLessonBlocks.length} bloque{editLessonBlocks.length !== 1 ? 's' : ''}
                  </label>
                  <LessonBlockEditor blocks={editLessonBlocks} onChange={setEditLessonBlocks} />
                </div>
                {lessonError && (
                  <p className='text-xs' style={{ color: '#ffb3c6' }}>
                    {lessonError}
                  </p>
                )}
                <div className='flex flex-wrap items-center gap-2'>
                  <div className='w-44'>
                    <PrimaryBtn onClick={handleUpdateLesson} disabled={!editLessonTitle.trim() || updatingLesson}>
                      {updatingLesson ? 'Guardando...' : '💾 Guardar lección'}
                    </PrimaryBtn>
                  </div>
                  <button
                    onClick={() => setEditingLessonId(null)}
                    className='rounded-xl px-4 py-2 text-xs font-semibold transition-all'
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      color: 'var(--text-3)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
              <PreviewShell>
                <LessonLivePreview title={editLessonTitle} blocks={editLessonBlocks} />
              </PreviewShell>
            </div>
          </div>
        </ContentModal>
      )}
    </div>
  )
}
