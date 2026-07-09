import { useEffect, useState } from 'react'
import type { OnboardingQuestion } from '@/types/learning'
import {
  createOnboardingQuestion,
  deleteOnboardingQuestion,
  getAdminOnboardingQuestions,
  updateOnboardingQuestion,
} from '@/services/backend'
import { ConfirmModal, DarkInput, DarkTextarea, PrimaryBtn, useToast } from '@/components/ui'

interface Props {
  token: string
}

// ── Option list editor ────────────────────────────────────────────────────────

function OptionListEditor({
  options,
  onChange,
}: {
  options: string[]
  onChange: (opts: string[]) => void
}) {
  const add = () => onChange([...options, ''])
  const remove = (i: number) => onChange(options.filter((_, idx) => idx !== i))
  const update = (i: number, v: string) => onChange(options.map((o, idx) => (idx === i ? v : o)))

  return (
    <div className="space-y-2">
      {options.map((opt, i) => (
        <div key={i} className="flex gap-2 items-center">
          <div
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold"
            style={{ background: 'rgba(171,157,242,0.15)', color: 'var(--primary)', border: '1px solid rgba(171,157,242,0.3)' }}
          >
            {i + 1}
          </div>
          <div className="flex-1">
            <DarkInput
              value={opt}
              onChange={(e) => update(i, e.target.value)}
              placeholder={`Opción ${i + 1}`}
            />
          </div>
          <button
            type="button"
            onClick={() => remove(i)}
            className="rounded-lg px-2 py-1.5 text-xs transition-all hover:opacity-70"
            style={{ background: 'rgba(255,97,136,0.10)', color: '#ffb3c6', border: '1px solid rgba(255,97,136,0.20)' }}
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="w-full rounded-xl py-2 text-xs font-semibold transition-all hover:opacity-80"
        style={{ background: 'rgba(171,157,242,0.08)', color: 'var(--primary)', border: '1px dashed rgba(171,157,242,0.3)' }}
      >
        + Agregar opción
      </button>
    </div>
  )
}

// ── Question form modal ───────────────────────────────────────────────────────

interface FormState {
  text: string
  order: number
  isActive: boolean
  options: string[]
}

function QuestionFormModal({
  initial,
  onSave,
  onClose,
  loading,
  error,
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <p className="font-black text-sm" style={{ color: 'var(--text-1)' }}>
            {initial.text ? 'Editar pregunta' : 'Nueva pregunta'}
          </p>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-xs transition-all hover:opacity-70"
            style={{ color: 'var(--text-3)' }}
          >
            ✕
          </button>
        </div>

        {/* Form body */}
        <div className="space-y-4 px-5 py-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <p className="rounded-xl px-3 py-2 text-xs" style={{ background: 'rgba(255,97,136,0.10)', color: '#ffb3c6' }}>
              {error}
            </p>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-semibold" style={{ color: 'var(--text-3)' }}>
              Pregunta
            </label>
            <DarkTextarea
              value={form.text}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
              placeholder="¿Cuál es tu rol actual?"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold" style={{ color: 'var(--text-3)' }}>
                Orden
              </label>
              <DarkInput
                type="number"
                value={String(form.order)}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1 flex flex-col">
              <label className="block text-xs font-semibold" style={{ color: 'var(--text-3)' }}>
                Estado
              </label>
              <button
                type="button"
                onClick={() => setForm({ ...form, isActive: !form.isActive })}
                className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all"
                style={{
                  background: form.isActive ? 'rgba(169,220,118,0.10)' : 'rgba(255,255,255,0.05)',
                  color: form.isActive ? '#a9dc76' : 'var(--text-3)',
                  border: form.isActive ? '1px solid rgba(169,220,118,0.30)' : '1px solid var(--border-subtle)',
                }}
              >
                <span>{form.isActive ? '✅' : '⬜'}</span>
                <span>{form.isActive ? 'Activa' : 'Inactiva'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-semibold" style={{ color: 'var(--text-3)' }}>
              Opciones de respuesta
            </label>
            <OptionListEditor
              options={form.options}
              onChange={(opts) => setForm({ ...form, options: opts })}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={onClose}
            className="flex-1 rounded-xl py-2.5 text-xs font-semibold transition-all hover:opacity-70"
            style={{
              background: 'var(--bg-elevated)',
              color: 'var(--text-3)',
              border: '1px solid var(--border-default)',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={loading || !form.text.trim() || form.options.filter(Boolean).length < 2}
            className="flex-1 rounded-xl py-2.5 text-xs font-bold transition-all disabled:opacity-40"
            style={{
              background: 'var(--grad)',
              color: '#fff',
              boxShadow: '0 4px 12px var(--primary-glow)',
            }}
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

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

  useEffect(() => { load() }, [token])

  const blankForm: FormState = { text: '', order: questions.length + 1, isActive: true, options: ['', ''] }

  const handleSave = async (form: FormState) => {
    const opts = form.options.filter((o) => o.trim())
    if (opts.length < 2) { setFormError('Agrega al menos 2 opciones.'); return }
    if (!form.text.trim()) { setFormError('La pregunta no puede estar vacía.'); return }
    setFormLoading(true)
    setFormError('')
    try {
      const payload = { text: form.text.trim(), order: form.order, isActive: form.isActive, options: opts }
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
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-black text-lg" style={{ color: 'var(--text-1)' }}>Preguntas de Onboarding</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
            {questions.length} pregunta{questions.length !== 1 ? 's' : ''} · Los estudiantes responden estas preguntas al registrarse
          </p>
        </div>
        <PrimaryBtn onClick={openCreate}>+ Nueva pregunta</PrimaryBtn>
      </div>

      {/* Info banner */}
      <div
        className="rounded-xl px-4 py-3 flex items-start gap-3"
        style={{ background: 'rgba(120,220,232,0.08)', border: '1px solid rgba(120,220,232,0.20)' }}
      >
        <span className="text-lg shrink-0">🤖</span>
        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>
          Las respuestas de cada estudiante son analizadas por IA para generar un roadmap de aprendizaje personalizado.
          Las preguntas marcadas como <strong style={{ color: 'var(--text-1)' }}>predeterminadas</strong> fueron importadas desde el seed y no pueden eliminarse fácilmente.
        </p>
      </div>

      {/* Questions list */}
      {loadingList ? (
        <div className="flex items-center justify-center py-16">
          <p className="text-sm animate-pulse" style={{ color: 'var(--text-3)' }}>Cargando preguntas...</p>
        </div>
      ) : questions.length === 0 ? (
        <div
          className="rounded-2xl p-10 text-center"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="text-3xl mb-3">🗒️</div>
          <p className="font-bold text-sm mb-1" style={{ color: 'var(--text-1)' }}>Sin preguntas aún</p>
          <p className="text-xs mb-4" style={{ color: 'var(--text-3)' }}>Crea la primera pregunta para el onboarding</p>
          <PrimaryBtn onClick={openCreate}>+ Crear pregunta</PrimaryBtn>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <div
              key={q.id}
              className="rounded-2xl p-4 transition-all"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
            >
              <div className="flex items-start gap-3">
                {/* Order badge */}
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl font-black text-xs"
                  style={{
                    background: q.isActive ? 'rgba(171,157,242,0.15)' : 'rgba(255,255,255,0.05)',
                    color: q.isActive ? 'var(--primary)' : 'var(--text-3)',
                    border: `1px solid ${q.isActive ? 'rgba(171,157,242,0.3)' : 'var(--border-subtle)'}`,
                  }}
                >
                  {q.order}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <p className="font-bold text-sm" style={{ color: 'var(--text-1)' }}>{q.text}</p>
                    {!q.isActive && (
                      <span
                        className="rounded-full px-2 py-0.5 text-xs"
                        style={{ background: 'rgba(255,97,136,0.10)', color: '#ffb3c6', border: '1px solid rgba(255,97,136,0.20)' }}
                      >
                        Inactiva
                      </span>
                    )}
                    {q.isDefault && (
                      <span
                        className="rounded-full px-2 py-0.5 text-xs"
                        style={{ background: 'rgba(120,220,232,0.10)', color: '#78dce8', border: '1px solid rgba(120,220,232,0.20)' }}
                      >
                        Predeterminada
                      </span>
                    )}
                  </div>

                  {/* Options preview */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {q.options
                      .slice()
                      .sort((a, b) => a.order - b.order)
                      .map((opt) => (
                        <span
                          key={opt.id}
                          className="rounded-lg px-2 py-0.5 text-xs"
                          style={{ background: 'var(--bg-elevated)', color: 'var(--text-3)', border: '1px solid var(--border-subtle)' }}
                        >
                          {opt.text}
                        </span>
                      ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1.5 shrink-0">
                  <button
                    onClick={() => openEdit(q)}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80"
                    style={{ background: 'rgba(171,157,242,0.10)', color: 'var(--primary)', border: '1px solid rgba(171,157,242,0.25)' }}
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => setConfirmDelete(q)}
                    disabled={deletingId === q.id}
                    className="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80 disabled:opacity-40"
                    style={{ background: 'rgba(255,97,136,0.10)', color: '#ffb3c6', border: '1px solid rgba(255,97,136,0.20)' }}
                  >
                    {deletingId === q.id ? '...' : 'Eliminar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <QuestionFormModal
          initial={
            editingQ
              ? {
                  text: editingQ.text,
                  order: editingQ.order,
                  isActive: editingQ.isActive,
                  options: editingQ.options
                    .slice()
                    .sort((a, b) => a.order - b.order)
                    .map((o) => o.text),
                }
              : blankForm
          }
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingQ(null) }}
          loading={formLoading}
          error={formError}
        />
      )}

      {/* Delete confirm */}
      {confirmDelete && (
        <ConfirmModal
          title="Eliminar pregunta"
          message={`¿Eliminar "${confirmDelete.text}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          onConfirm={handleDelete}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
