import { useEffect, useState } from 'react'
import type { OnboardingQuestion } from '@/types/learning'
import {
  createOnboardingQuestion,
  deleteOnboardingQuestion,
  getAdminOnboardingQuestions,
  updateOnboardingQuestion
} from '@/services/backend'
import { ConfirmModal, DarkInput, DarkTextarea, PrimaryBtn, useToast } from '@/components/ui'

interface Props {
  token: string
}

function OptionListEditor({ onChange, options }: { options: string[]; onChange: (opts: string[]) => void }) {
  const add = () => onChange([...options, ''])
  const remove = (i: number) => onChange(options.filter((_, idx) => idx !== i))
  const update = (i: number, v: string) => onChange(options.map((o, idx) => (idx === i ? v : o)))

  return (
    <div className='space-y-2'>
      {options.map((opt, i) => (
        <div key={i} className='flex items-center gap-2'>
          <div className='text-primary border-line bg-primary-glow flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-xs font-bold'>
            {i + 1}
          </div>
          <div className='flex-1'>
            <DarkInput value={opt} onChange={(e) => update(i, e.target.value)} placeholder={`Opción ${i + 1}`} />
          </div>
          <button
            type='button'
            onClick={() => remove(i)}
            className='border-danger-border bg-danger-bg text-danger rounded-lg border px-2 py-1.5 text-xs transition-all hover:opacity-70'
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type='button'
        onClick={add}
        className='w-full rounded-xl py-2 text-xs font-semibold transition-all hover:opacity-80'
        style={{
          background: 'var(--primary-glow)',
          border: '1px dashed var(--primary-glow)',
          color: 'var(--primary)'
        }}
      >
        + Agregar opción
      </button>
    </div>
  )
}

interface FormState {
  text: string
  order: number
  isActive: boolean
  options: string[]
}

function QuestionFormModal({
  error,
  initial,
  loading,
  onClose,
  onSave
}: {
  initial: FormState
  onSave: (form: FormState) => void
  onClose: () => void
  loading: boolean
  error: string
}) {
  const [form, setForm] = useState<FormState>(initial)

  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.65)] p-4 backdrop-blur-[8px]'
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className='bg-card border-line w-full max-w-lg overflow-hidden rounded-2xl border'>
        <div className='border-hairline flex items-center justify-between border-b px-5 py-4'>
          <p className='text-fg text-sm font-semibold'>{initial.text ? 'Editar pregunta' : 'Nueva pregunta'}</p>
          <button onClick={onClose} className='text-fg-subtle rounded-lg p-1.5 text-xs transition-all hover:opacity-70'>
            ✕
          </button>
        </div>

        <div className='max-h-[70vh] space-y-4 overflow-y-auto px-5 py-4'>
          {error && <p className='bg-danger-bg text-danger rounded-xl px-3 py-2 text-xs'>{error}</p>}

          <div className='space-y-1'>
            <label className='text-fg-subtle block text-xs font-semibold'>Pregunta</label>
            <DarkTextarea
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              placeholder='¿Cuál es tu rol actual?'
              rows={2}
            />
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='space-y-1'>
              <label className='text-fg-subtle block text-xs font-semibold'>Orden</label>
              <DarkInput
                type='number'
                value={String(form.order)}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              />
            </div>
            <div className='flex flex-col space-y-1'>
              <label className='text-fg-subtle block text-xs font-semibold'>Estado</label>
              <button
                type='button'
                onClick={() => setForm({ ...form, isActive: !form.isActive })}
                className='flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all'
                style={{
                  background: form.isActive ? 'var(--success-bg)' : 'var(--tint-2)',
                  border: form.isActive ? '1px solid var(--success-border)' : '1px solid var(--border-subtle)',
                  color: form.isActive ? 'var(--success)' : 'var(--text-3)'
                }}
              >
                <span>{form.isActive ? '✅' : '⬜'}</span>
                <span>{form.isActive ? 'Activa' : 'Inactiva'}</span>
              </button>
            </div>
          </div>

          <div className='space-y-2'>
            <label className='text-fg-subtle block text-xs font-semibold'>Opciones de respuesta</label>
            <OptionListEditor options={form.options} onChange={(opts) => setForm({ ...form, options: opts })} />
          </div>
        </div>

        <div className='border-hairline flex gap-3 border-t px-5 py-4'>
          <button
            onClick={onClose}
            className='bg-elevated text-fg-subtle border-line flex-1 rounded-xl border py-2.5 text-xs font-semibold transition-all hover:opacity-70'
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={loading || !form.text.trim() || form.options.filter(Boolean).length < 2}
            className='flex-1 rounded-xl py-2.5 text-xs font-bold transition-all disabled:opacity-40'
            style={{
              background: 'var(--grad)',
              boxShadow: '0 4px 12px var(--primary-glow)',
              color: 'var(--on-primary)'
            }}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export function OnboardingTab({ token }: Props) {
  const { toast } = useToast()
  const [questions, setQuestions] = useState<OnboardingQuestion[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingQ, setEditingQ] = useState<OnboardingQuestion | null>(null)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<OnboardingQuestion | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const load = () => {
    setLoadingList(true)
    getAdminOnboardingQuestions(token)
      .then((qs) => setQuestions(qs.sort((a, b) => a.order - b.order)))
      .catch(() => toast('Error al cargar preguntas', 'error'))
      .finally(() => setLoadingList(false))
  }

  useEffect(() => {
    load()
  }, [token])

  const blankForm: FormState = { isActive: true, options: ['', ''], order: questions.length + 1, text: '' }

  const handleSave = async (form: FormState) => {
    const opts = form.options.filter((o) => o.trim())
    if (opts.length < 2) {
      setFormError('Agrega al menos 2 opciones.')
      return
    }
    if (!form.text.trim()) {
      setFormError('La pregunta no puede estar vacía.')
      return
    }
    setFormLoading(true)
    setFormError('')
    try {
      const payload = { isActive: form.isActive, options: opts, order: form.order, text: form.text.trim() }
      if (editingQ) {
        const updated = await updateOnboardingQuestion(token, editingQ.id, payload)
        setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)).sort((a, b) => a.order - b.order))
        toast('Pregunta actualizada', 'success')
      } else {
        const created = await createOnboardingQuestion(token, payload)
        setQuestions((prev) => [...prev, created].sort((a, b) => a.order - b.order))
        toast('Pregunta creada', 'success')
      }
      setShowForm(false)
      setEditingQ(null)
    } catch {
      setFormError('No se pudo guardar. Intenta de nuevo.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirmDelete) return
    setDeletingId(confirmDelete.id)
    setConfirmDelete(null)
    try {
      await deleteOnboardingQuestion(token, confirmDelete.id)
      setQuestions((prev) => prev.filter((q) => q.id !== confirmDelete.id))
      toast('Pregunta eliminada', 'success')
    } catch {
      toast('No se pudo eliminar', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  const openEdit = (q: OnboardingQuestion) => {
    setEditingQ(q)
    setFormError('')
    setShowForm(true)
  }

  const openCreate = () => {
    setEditingQ(null)
    setFormError('')
    setShowForm(true)
  }

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h2 className='text-fg text-lg font-semibold'>Preguntas de Onboarding</h2>
          <p className='text-fg-subtle mt-0.5 text-xs'>
            {questions.length} pregunta{questions.length !== 1 ? 's' : ''} · Los estudiantes responden estas preguntas
            al registrarse
          </p>
        </div>
        <PrimaryBtn onClick={openCreate}>+ Nueva pregunta</PrimaryBtn>
      </div>

      <div className='border-line bg-accent-glow flex items-start gap-3 rounded-xl border px-4 py-3'>
        <span className='shrink-0 text-lg'>🤖</span>
        <p className='text-fg-muted text-xs leading-relaxed'>
          Las respuestas de cada estudiante son analizadas por IA para generar un roadmap de aprendizaje personalizado.
          Las preguntas marcadas como <strong className='text-fg'>predeterminadas</strong> fueron importadas desde el
          seed y no pueden eliminarse fácilmente.
        </p>
      </div>

      {loadingList ? (
        <div className='flex items-center justify-center py-16'>
          <p className='text-fg-subtle animate-pulse text-sm'>Cargando preguntas...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className='bg-card border-hairline rounded-2xl border p-10 text-center'>
          <div className='mb-3 font-serif text-3xl font-normal'>🗒️</div>
          <p className='text-fg mb-1 text-sm font-bold'>Sin preguntas aún</p>
          <p className='text-fg-subtle mb-4 text-xs'>Crea la primera pregunta para el onboarding</p>
          <PrimaryBtn onClick={openCreate}>+ Crear pregunta</PrimaryBtn>
        </div>
      ) : (
        <div className='space-y-3'>
          {questions.map((q) => (
            <div key={q.id} className='bg-card border-hairline rounded-2xl border p-4 transition-all'>
              <div className='flex items-start gap-3'>
                <div
                  className='flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-semibold'
                  style={{
                    background: q.isActive ? 'var(--primary-glow)' : 'var(--tint-2)',
                    border: `1px solid ${q.isActive ? 'var(--primary-glow)' : 'var(--border-subtle)'}`,
                    color: q.isActive ? 'var(--primary)' : 'var(--text-3)'
                  }}
                >
                  {q.order}
                </div>

                <div className='min-w-0 flex-1'>
                  <div className='mb-1 flex flex-wrap items-center gap-2'>
                    <p className='text-fg text-sm font-bold'>{q.text}</p>
                    {!q.isActive && (
                      <span className='border-danger-border bg-danger-bg text-danger rounded-full border px-2 py-0.5 text-xs'>
                        Inactiva
                      </span>
                    )}
                    {q.isDefault && (
                      <span className='border-line bg-accent-glow text-accent rounded-full border px-2 py-0.5 text-xs'>
                        Predeterminada
                      </span>
                    )}
                  </div>

                  <div className='mt-2 flex flex-wrap gap-1.5'>
                    {q.options
                      .slice()
                      .sort((a, b) => a.order - b.order)
                      .map((opt) => (
                        <span
                          key={opt.id}
                          className='bg-elevated text-fg-subtle border-hairline rounded-lg border px-2 py-0.5 text-xs'
                        >
                          {opt.text}
                        </span>
                      ))}
                  </div>
                </div>

                <div className='flex shrink-0 gap-1.5'>
                  <button
                    onClick={() => openEdit(q)}
                    className='text-primary border-line bg-primary-glow rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80'
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setConfirmDelete(q)}
                    disabled={deletingId === q.id}
                    className='border-danger-border bg-danger-bg text-danger rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80 disabled:opacity-40'
                  >
                    {deletingId === q.id ? '...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <QuestionFormModal
          initial={
            editingQ
              ? {
                  isActive: editingQ.isActive,
                  options: editingQ.options
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((o) => o.text),
                  order: editingQ.order,
                  text: editingQ.text
                }
              : blankForm
          }
          onSave={handleSave}
          onClose={() => {
            setShowForm(false)
            setEditingQ(null)
          }}
          loading={formLoading}
          error={formError}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title='Eliminar pregunta'
          message={`¿Eliminar "${confirmDelete.text}"? Esta acción no se puede deshacer.`}
          confirmLabel='Eliminar'
          onConfirm={handleDelete}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
