import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import type { CourseSummary, CreatedStudent, StudentSummary, UpdateStudentPayload } from '@/services/backend'
import {
  createStudent,
  deleteStudent,
  getCourses,
  getStudents,
  resetStudentProgress,
  toggleStudentActive,
  updateStudent
} from '@/services/backend'
import { ConfirmModal, CourseIcon, DarkInput, PrimaryBtn, ThemeToggle, useToast } from '@/components/ui'
import { Badge, CopyBtn, formatDate, is401, ScoreChip } from './content-tab'

// ── Course filter dropdown (custom — supports image icons + search) ───────────

function CourseFilterDropdown({
  courses,
  value,
  onChange
}: {
  courses: CourseSummary[]
  value: number | 'all'
  onChange: (v: number | 'all') => void
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')

  const selected = value === 'all' ? null : (courses.find((c) => c.id === value) ?? null)
  const filtered = courses.filter((c) => search.trim() === '' || c.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className='relative flex-1' style={{ maxWidth: '320px' }}>
      {/* Trigger */}
      <button
        type='button'
        onClick={() => {
          setOpen((o) => !o)
          setSearch('')
        }}
        className='flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs transition-all'
        style={{
          background: 'var(--bg-base)',
          color: selected ? 'var(--text-1)' : 'var(--text-3)',
          border: selected ? '1.5px solid var(--primary)' : '1px solid var(--border-subtle)',
          outline: 'none'
        }}
      >
        {selected ? (
          <>
            <CourseIcon icon={selected.icon} size={14} className='shrink-0 rounded' />
            <span className='flex-1 truncate'>{selected.name}</span>
          </>
        ) : (
          <span className='flex-1'>🌐 Todos los cursos</span>
        )}
        <span style={{ color: 'var(--text-3)' }}>{open ? '▲' : '▼'}</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className='absolute right-0 left-0 z-50 mt-1 overflow-hidden rounded-xl'
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-card)',
            top: '100%'
          }}
        >
          {/* Search inside dropdown */}
          <div className='flex items-center gap-2 px-3 py-2' style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <span className='text-xs' style={{ color: 'var(--text-3)' }}>
              🔍
            </span>
            <input
              autoFocus
              type='text'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Buscar...'
              className='flex-1 bg-transparent text-xs outline-none'
              style={{ color: 'var(--text-1)' }}
            />
            {search && (
              <button onClick={() => setSearch('')} className='text-xs' style={{ color: 'var(--text-3)' }}>
                ✕
              </button>
            )}
          </div>

          {/* Options list */}
          <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
            {search.trim() === '' && (
              <button
                type='button'
                onClick={() => {
                  onChange('all')
                  setOpen(false)
                }}
                className='flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-all hover:opacity-80'
                style={{
                  background: value === 'all' ? 'rgba(171,157,242,0.10)' : 'transparent',
                  color: value === 'all' ? 'var(--primary)' : 'var(--text-3)',
                  borderBottom: '1px solid var(--border-subtle)'
                }}
              >
                <span>🌐</span>
                <span>Todos los cursos</span>
                {value === 'all' && <span className='ml-auto'>✓</span>}
              </button>
            )}
            {filtered.map((c) => (
              <button
                key={c.id}
                type='button'
                onClick={() => {
                  onChange(c.id)
                  setOpen(false)
                }}
                className='flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-all hover:opacity-80'
                style={{
                  background: value === c.id ? `${c.color}12` : 'transparent',
                  color: value === c.id ? c.color : 'var(--text-1)',
                  borderBottom: '1px solid var(--border-subtle)'
                }}
              >
                <CourseIcon icon={c.icon} size={14} className='shrink-0 rounded' />
                <span className='flex-1 truncate'>{c.name}</span>
                {value === c.id && <span className='ml-auto'>✓</span>}
              </button>
            ))}
            {filtered.length === 0 && (
              <p className='px-3 py-2 text-xs' style={{ color: 'var(--text-3)' }}>
                Sin resultados
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  value,
  label,
  badgeColor = '#ab9df2'
}: {
  icon: string
  value: string | number
  label: string
  badgeColor?: string
}) {
  return (
    <div className='rounded-2xl p-4' style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
      <div
        className='mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-lg'
        style={{ background: `${badgeColor}18`, border: `1px solid ${badgeColor}30` }}
      >
        {icon}
      </div>
      <div className='mb-0.5 font-mono text-2xl leading-none font-black' style={{ color: 'var(--text-1)' }}>
        {value}
      </div>
      <div className='text-xs' style={{ color: 'var(--text-3)' }}>
        {label}
      </div>
    </div>
  )
}

// ── Course pills (shows enrolled courses or "Todos") ──────────────────────────

function CoursesPill({
  allowedCourseIds,
  courses,
  compact = false
}: {
  allowedCourseIds?: number[]
  courses: CourseSummary[]
  compact?: boolean
}) {
  const isAll =
    !allowedCourseIds ||
    allowedCourseIds.length === 0 ||
    (courses.length > 0 && allowedCourseIds.length === courses.length)
  if (isAll) {
    return (
      <span
        className='rounded-md px-2 py-0.5 text-xs font-semibold'
        style={{
          background: 'rgba(171,157,242,0.10)',
          color: 'var(--primary)',
          border: '1px solid var(--border-default)'
        }}
      >
        Todos
      </span>
    )
  }

  if (compact) {
    const MAX = 2
    const shown = allowedCourseIds.slice(0, MAX)
    const rest = allowedCourseIds.length - MAX
    const tooltipNames = allowedCourseIds.map((id) => courses.find((x) => x.id === id)?.name ?? `#${id}`).join(', ')
    return (
      <div className='flex flex-wrap items-center gap-1' title={tooltipNames}>
        {shown.map((id) => {
          const c = courses.find((x) => x.id === id)
          if (!c) return null
          return (
            <span
              key={id}
              className='flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold'
              style={{ background: c.color + '18', color: c.color, border: `1px solid ${c.color}30` }}
            >
              <CourseIcon icon={c.icon} size={14} className='rounded' />
            </span>
          )
        })}
        {rest > 0 && (
          <span
            className='rounded-md px-1.5 py-0.5 text-xs font-semibold'
            style={{
              background: 'rgba(255,255,255,0.06)',
              color: 'var(--text-3)',
              border: '1px solid var(--border-subtle)'
            }}
          >
            +{rest}
          </span>
        )}
      </div>
    )
  }

  return (
    <div className='flex flex-wrap gap-1'>
      {allowedCourseIds.map((id) => {
        const c = courses.find((x) => x.id === id)
        if (!c) return null
        return (
          <span
            key={id}
            title={c.name}
            className='flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold'
            style={{ background: c.color + '18', color: c.color, border: `1px solid ${c.color}30` }}
          >
            <CourseIcon icon={c.icon} size={14} className='rounded' />
            {c.name}
          </span>
        )
      })}
    </div>
  )
}

// ── Toggle switch ─────────────────────────────────────────────────────────────

function ToggleSwitch({ checked, disabled, onChange }: { checked: boolean; disabled: boolean; onChange: () => void }) {
  return (
    <button
      type='button'
      role='switch'
      aria-checked={checked}
      onClick={(e) => {
        e.stopPropagation()
        onChange()
      }}
      disabled={disabled}
      title={checked ? 'Click para desactivar' : 'Click para activar'}
      className='relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-all duration-200 focus:outline-none disabled:opacity-50'
      style={{
        background: checked ? '#a9dc76' : 'rgba(255,255,255,0.10)',
        border: checked ? '1px solid rgba(169,220,118,0.40)' : '1px solid rgba(255,255,255,0.12)'
      }}
    >
      <span
        className='inline-block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200'
        style={{ transform: checked ? 'translateX(18px)' : 'translateX(2px)' }}
      />
    </button>
  )
}

// ── Modal wrapper ─────────────────────────────────────────────────────────────

function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
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
        {children}
      </div>
    </div>
  )
}

// ── Student form (shared by create & edit) ────────────────────────────────────

interface StudentFormProps {
  title: string
  nameVal: string
  docVal: string
  courseIds: number[]
  allCourses: boolean
  isActive?: boolean
  showActiveToggle?: boolean
  availableCourses: CourseSummary[]
  onChangeName: (v: string) => void
  onChangeDoc: (v: string) => void
  onToggleCourse: (id: number) => void
  onSetAllCourses: (v: boolean) => void
  onToggleActive?: () => void
  onSubmit: () => void
  onClose: () => void
  submitLabel: string
  submitting: boolean
  error: string
}

function StudentForm({
  title,
  nameVal,
  docVal,
  courseIds,
  allCourses,
  isActive,
  showActiveToggle,
  availableCourses,
  onChangeName,
  onChangeDoc,
  onToggleCourse,
  onSetAllCourses,
  onToggleActive,
  onSubmit,
  onClose,
  submitLabel,
  submitting,
  error
}: StudentFormProps) {
  const [courseSearch, setCourseSearch] = useState('')
  const canSubmit = nameVal.trim() && docVal.trim() && (allCourses || courseIds.length > 0) && !submitting

  const filteredCourses = availableCourses.filter(
    (c) => courseSearch.trim() === '' || c.name.toLowerCase().includes(courseSearch.toLowerCase())
  )

  return (
    <>
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

      <div className='space-y-4 p-6'>
        {/* Name + Document */}
        <div className='flex flex-col gap-3 sm:flex-row'>
          <div className='flex-1'>
            <label className='mb-1.5 block text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
              Nombre completo <span style={{ color: '#ffb3c6' }}>*</span>
            </label>
            <DarkInput value={nameVal} onChange={(e) => onChangeName(e.target.value)} placeholder='Nombre completo' />
          </div>
          <div className='flex-1'>
            <label className='mb-1.5 block text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
              Documento <span style={{ color: '#ffb3c6' }}>*</span>
            </label>
            <DarkInput value={docVal} onChange={(e) => onChangeDoc(e.target.value)} placeholder='Número de documento' />
          </div>
        </div>

        {/* Course access */}
        <div>
          <label className='mb-2 block text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
            Acceso a cursos <span style={{ color: '#ffb3c6' }}>*</span>
          </label>

          {/* Todos / Específicos toggle */}
          <div className='mb-3 grid grid-cols-2 gap-2'>
            <button
              type='button'
              onClick={() => onSetAllCourses(true)}
              className='flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-all'
              style={
                allCourses
                  ? {
                      background: 'rgba(171,157,242,0.18)',
                      color: 'var(--primary)',
                      border: '1.5px solid var(--primary)'
                    }
                  : {
                      background: 'rgba(255,255,255,0.03)',
                      color: 'var(--text-3)',
                      border: '1px solid var(--border-subtle)'
                    }
              }
            >
              <span className='text-base'>🌐</span>
              <span>Todos los cursos</span>
              {allCourses && <span className='ml-auto text-xs'>✓</span>}
            </button>
            <button
              type='button'
              onClick={() => onSetAllCourses(false)}
              className='flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-all'
              style={
                !allCourses
                  ? {
                      background: 'rgba(171,157,242,0.18)',
                      color: 'var(--primary)',
                      border: '1.5px solid var(--primary)'
                    }
                  : {
                      background: 'rgba(255,255,255,0.03)',
                      color: 'var(--text-3)',
                      border: '1px solid var(--border-subtle)'
                    }
              }
            >
              <span className='text-base'>🎯</span>
              <span>Cursos específicos</span>
              {!allCourses && <span className='ml-auto text-xs'>✓</span>}
            </button>
          </div>

          {/* Course list (shown only when "específicos") */}
          {!allCourses && (
            <>
              <div
                className='mb-2 flex items-center gap-2 rounded-xl px-3 py-2'
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}
              >
                <span className='text-xs' style={{ color: 'var(--text-3)' }}>
                  🔍
                </span>
                <input
                  type='text'
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  placeholder='Buscar curso...'
                  className='flex-1 bg-transparent text-xs outline-none'
                  style={{ color: 'var(--text-1)' }}
                />
                {courseSearch && (
                  <button
                    onClick={() => setCourseSearch('')}
                    className='text-xs leading-none'
                    style={{ color: 'var(--text-3)' }}
                  >
                    ✕
                  </button>
                )}
              </div>
              <div
                className='overflow-hidden rounded-xl'
                style={{ border: '1px solid var(--border-default)', maxHeight: '260px', overflowY: 'auto' }}
              >
                {filteredCourses.length === 0 && (
                  <p className='p-3 text-xs' style={{ color: 'var(--text-3)' }}>
                    {availableCourses.length === 0
                      ? 'No hay cursos disponibles.'
                      : `Sin resultados para "${courseSearch}"`}
                  </p>
                )}
                {filteredCourses.map((c, i) => {
                  const isSelected = courseIds.includes(c.id)
                  return (
                    <button
                      key={c.id}
                      type='button'
                      onClick={() => onToggleCourse(c.id)}
                      className='flex w-full items-center gap-3 px-4 py-3 text-left transition-all'
                      style={{
                        borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none',
                        background: isSelected ? `${c.color}10` : 'transparent'
                      }}
                    >
                      <div
                        className='flex h-5 w-5 shrink-0 items-center justify-center rounded transition-all'
                        style={
                          isSelected
                            ? { background: c.color, border: `1.5px solid ${c.color}` }
                            : { background: 'transparent', border: '1.5px solid var(--border-default)' }
                        }
                      >
                        {isSelected && <span className='text-xs font-black text-white'>✓</span>}
                      </div>
                      <span className='flex shrink-0 items-center text-lg'>
                        <CourseIcon icon={c.icon} size={20} className='rounded' />
                      </span>
                      <div className='min-w-0 flex-1'>
                        <div
                          className='truncate text-xs font-bold'
                          style={{ color: isSelected ? c.color : 'var(--text-1)' }}
                        >
                          {c.name}
                        </div>
                        {c.description && (
                          <div className='truncate text-xs' style={{ color: 'var(--text-3)' }}>
                            {c.description.slice(0, 60)}
                            {c.description.length > 60 ? '…' : ''}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {!allCourses && courseIds.length === 0 && (
            <p className='mt-1.5 text-xs' style={{ color: '#ffd866' }}>
              ⚠ Seleccioná al menos un curso.
            </p>
          )}
        </div>

        {/* Active toggle */}
        {showActiveToggle && onToggleActive && (
          <div className='flex items-center justify-between'>
            <span className='text-xs font-semibold' style={{ color: 'var(--text-2)' }}>
              Estado de la cuenta
            </span>
            <button
              type='button'
              onClick={onToggleActive}
              className='rounded-lg px-3 py-1.5 text-xs font-semibold transition-all'
              style={
                isActive
                  ? {
                      background: 'rgba(169,220,118,0.12)',
                      color: '#6EE7B7',
                      border: '1px solid rgba(169,220,118,0.25)'
                    }
                  : { background: 'rgba(255,97,136,0.10)', color: '#ffb3c6', border: '1px solid rgba(255,97,136,0.20)' }
              }
            >
              {isActive ? '✓ Activo' : '✗ Inactivo'}
            </button>
          </div>
        )}

        {error && (
          <p className='text-xs' style={{ color: '#ffb3c6' }}>
            {error}
          </p>
        )}

        <div className='flex gap-3 pt-1'>
          <button
            onClick={onClose}
            className='flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-80'
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-2)'
            }}
          >
            Cancelar
          </button>
          <div className='flex-1'>
            <PrimaryBtn onClick={onSubmit} disabled={!canSubmit}>
              {submitting ? 'Guardando...' : submitLabel}
            </PrimaryBtn>
          </div>
        </div>
      </div>
    </>
  )
}

// ── Admin dashboard ───────────────────────────────────────────────────────────

interface AdminDashProps {
  token: string
  onLogout: () => void
}

export function AdminDash({ token, onLogout }: AdminDashProps) {
  const location = useLocation()
  const [students, setStudents] = useState<StudentSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [availableCourses, setAvailableCourses] = useState<CourseSummary[]>([])

  // ── Create modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createDoc, setCreateDoc] = useState('')
  const [createCourseIds, setCreateCourseIds] = useState<number[]>([])
  const [createAllCourses, setCreateAllCourses] = useState(true)
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState<CreatedStudent | null>(null)
  const [createError, setCreateError] = useState('')

  // ── Edit modal
  const [editingStudent, setEditingStudent] = useState<StudentSummary | null>(null)
  const [editName, setEditName] = useState('')
  const [editDoc, setEditDoc] = useState('')
  const [editCourseIds, setEditCourseIds] = useState<number[]>([])
  const [editAllCourses, setEditAllCourses] = useState(true)
  const [editActive, setEditActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  // ── Delete confirmation
  const [confirmDeleteStudent, setConfirmDeleteStudent] = useState<StudentSummary | null>(null)
  const [deleting, setDeleting] = useState(false)

  // ── Toggle loading
  const [togglingId, setTogglingId] = useState<number | null>(null)

  // ── Progress reset
  const [confirmResetStudent, setConfirmResetStudent] = useState<StudentSummary | null>(null)
  const [resettingProgressId, setResettingProgressId] = useState<number | null>(null)

  // ── Student detail view
  const [viewingStudent, setViewingStudent] = useState<StudentSummary | null>(null)

  // ── Search / filter / sort
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [filterCourseId, setFilterCourseId] = useState<number | 'all'>('all')
  type SortKey = 'name' | 'exercisesDone' | 'averageScore' | 'lastActivity'
  const [sortKey, setSortKey] = useState<SortKey>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const { toast } = useToast()

  const load = async () => {
    setLoadError('')
    try {
      const list = await getStudents(token)
      setStudents(list)
    } catch (e) {
      if (is401(e)) {
        onLogout()
        return
      }
      setLoadError('No se pudo cargar la lista. Verificá tu conexión.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    load()
    getCourses(token)
      .then(setAvailableCourses)
      .catch(() => {})
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (confirmResetStudent) {
        setConfirmResetStudent(null)
        return
      }
      if (confirmDeleteStudent) {
        setConfirmDeleteStudent(null)
        return
      }
      if (viewingStudent) {
        setViewingStudent(null)
        return
      }
      if (editingStudent) {
        setEditingStudent(null)
        return
      }
      if (showCreateModal) {
        setShowCreateModal(false)
        return
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [confirmResetStudent, confirmDeleteStudent, viewingStudent, editingStudent, showCreateModal])

  const toggleCourse = (id: number, list: number[], setList: (v: number[]) => void) => {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
  }

  // ── Create
  const handleCreate = async () => {
    if (!createName.trim() || !createDoc.trim()) return
    if (!createAllCourses && createCourseIds.length === 0) return
    setCreating(true)
    setCreateError('')
    setCreated(null)
    try {
      const result = await createStudent(
        token,
        createName.trim(),
        createDoc.trim(),
        createAllCourses ? [] : createCourseIds
      )
      setCreated(result)
      setCreateName('')
      setCreateDoc('')
      setCreateCourseIds([])
      setCreateAllCourses(true)
      toast(`${result.name} registrado — llave: ${result.accessKey}`, 'success')
      load()
    } catch (e) {
      if (is401(e)) {
        onLogout()
        return
      }
      setCreateError((e as Error).message || 'Error al crear aprendiz')
    } finally {
      setCreating(false)
    }
  }

  // ── Edit open
  const openEdit = (s: StudentSummary) => {
    setEditingStudent(s)
    setEditName(s.name)
    setEditDoc(s.documentNumber)
    const ids = s.allowedCourseIds ?? []
    const isAll = ids.length === 0 || (availableCourses.length > 0 && ids.length === availableCourses.length)
    setEditAllCourses(isAll)
    setEditCourseIds(isAll ? [] : ids)
    setEditActive(s.isActive)
    setSaveError('')
  }

  // ── Edit save
  const handleSave = async () => {
    if (!editingStudent || !editName.trim() || !editDoc.trim()) return
    if (!editAllCourses && editCourseIds.length === 0) return
    setSaving(true)
    setSaveError('')
    const payload: UpdateStudentPayload = {
      name: editName.trim(),
      documentNumber: editDoc.trim(),
      allowedCourseIds: editAllCourses ? [] : editCourseIds,
      isActive: editActive
    }
    try {
      await updateStudent(token, editingStudent.id, payload)
      setEditingStudent(null)
      toast('Aprendiz actualizado', 'success')
      setRefreshing(true)
      load()
    } catch (e) {
      if (is401(e)) {
        onLogout()
        return
      }
      setSaveError((e as Error).message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  // ── Toggle active
  const handleToggle = async (s: StudentSummary) => {
    setTogglingId(s.id)
    try {
      const updated = await toggleStudentActive(token, s.id)
      setStudents((prev) => prev.map((x) => (x.id === s.id ? { ...x, isActive: updated.isActive } : x)))
      toast(`${s.name} ${updated.isActive ? 'activado' : 'desactivado'}`, 'info')
    } catch (e) {
      if (is401(e)) {
        onLogout()
        return
      }
      toast('Error al cambiar estado', 'error')
    } finally {
      setTogglingId(null)
    }
  }

  // ── Delete
  const handleDelete = async () => {
    if (!confirmDeleteStudent) return
    setDeleting(true)
    try {
      await deleteStudent(token, confirmDeleteStudent.id)
      setStudents((prev) => prev.filter((x) => x.id !== confirmDeleteStudent.id))
      toast(`${confirmDeleteStudent.name} eliminado`, 'success')
      setConfirmDeleteStudent(null)
    } catch (e) {
      if (is401(e)) {
        onLogout()
        return
      }
      toast('Error al eliminar aprendiz', 'error')
    } finally {
      setDeleting(false)
    }
  }

  // ── Reset progress
  const handleResetProgress = async (s: StudentSummary) => {
    setConfirmResetStudent(s)
  }

  const doResetProgress = async () => {
    if (!confirmResetStudent) return
    const target = confirmResetStudent
    setResettingProgressId(target.id)
    setConfirmResetStudent(null)
    try {
      await resetStudentProgress(token, target.id)
      // Optimistic update — show 0s immediately
      setStudents((prev) =>
        prev.map((x) =>
          x.id === target.id
            ? { ...x, exercisesDone: 0, lessonsRead: 0, averageScore: null, lastActivity: null, lastLessonAt: null }
            : x
        )
      )
      toast(`Progreso de ${target.name} reseteado`, 'warning')
      // Refetch to sync real stats from backend
      setRefreshing(true)
      load()
    } catch (e) {
      if (is401(e)) {
        onLogout()
        return
      }
      toast('Error al resetear progreso', 'error')
    } finally {
      setResettingProgressId(null)
    }
  }

  // ── View detail
  const openViewProgress = (s: StudentSummary) => setViewingStudent(s)

  // ── CSV export
  const exportCsv = () => {
    const headers = [
      'ID',
      'Nombre',
      'Documento',
      'Llave',
      'Activo',
      'Cursos',
      'Ejercicios',
      'Score',
      'Último acceso',
      'Últ. lección'
    ]
    const rows = students.map((s) => [
      s.id,
      `"${s.name}"`,
      s.documentNumber,
      s.accessKey,
      s.isActive ? 'Sí' : 'No',
      `"${(s.allowedCourseIds ?? []).join(', ') || 'Todos'}"`,
      s.exercisesDone,
      s.averageScore !== null ? Math.round(s.averageScore) : '',
      s.lastActivity ? new Date(s.lastActivity).toLocaleDateString('es-CO') : '',
      s.lastLessonAt ? new Date(s.lastLessonAt).toLocaleDateString('es-CO') : ''
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `aprendices-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast('CSV exportado', 'success')
  }

  const toggleSort = (col: SortKey) => {
    if (sortKey === col) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(col)
      setSortDir('asc')
    }
  }

  const clearFilters = () => {
    setSearch('')
    setFilterStatus('all')
    setFilterCourseId('all')
  }

  const daysSince = (iso: string | null) => {
    if (!iso) return Infinity
    return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  }

  const filteredStudents = useMemo(() => {
    let list = students
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.documentNumber.includes(q))
    }
    if (filterStatus !== 'all') list = list.filter((s) => (filterStatus === 'active' ? s.isActive : !s.isActive))
    if (filterCourseId !== 'all') {
      list = list.filter(
        (s) =>
          !s.allowedCourseIds ||
          s.allowedCourseIds.length === 0 ||
          s.allowedCourseIds.includes(filterCourseId as number)
      )
    }
    return [...list].sort((a, b) => {
      let va: string | number, vb: string | number
      if (sortKey === 'name') {
        va = a.name.toLowerCase()
        vb = b.name.toLowerCase()
      } else if (sortKey === 'exercisesDone') {
        va = a.exercisesDone
        vb = b.exercisesDone
      } else if (sortKey === 'averageScore') {
        va = a.averageScore ?? -1
        vb = b.averageScore ?? -1
      } else {
        va = a.lastActivity ?? ''
        vb = b.lastActivity ?? ''
      }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
  }, [students, search, filterStatus, filterCourseId, sortKey, sortDir])

  const avgScore = (() => {
    const scored = students.filter((s) => s.averageScore !== null)
    return scored.length ? Math.round(scored.reduce((a, s) => a + s.averageScore!, 0) / scored.length) : '—'
  })()

  return (
    <div className='min-h-screen' style={{ background: 'var(--bg-base)' }}>
      {/* ── Nav ── */}
      <nav
        className='sticky top-0 z-10 flex items-center justify-between px-6 py-3.5'
        style={{
          background: 'var(--nav-bg)',
          borderBottom: '1px solid var(--border-subtle)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div className='flex items-center gap-3'>
          <div
            className='flex h-8 w-8 items-center justify-center rounded-xl text-base'
            style={{ background: 'var(--grad)', boxShadow: '0 4px 12px var(--primary-glow)' }}
          >
            🛡️
          </div>
          <div>
            <div className='text-sm leading-tight font-bold' style={{ color: 'var(--text-1)' }}>
              Panel Admin
            </div>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <ThemeToggle />
          <button
            onClick={() => {
              setShowCreateModal(true)
              setCreated(null)
              setCreateError('')
            }}
            className='hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80 sm:flex'
            style={{ background: 'var(--grad)', color: '#fff', boxShadow: '0 2px 8px var(--primary-glow)' }}
          >
            ➕ Nuevo aprendiz
          </button>
          <button
            onClick={() => {
              setRefreshing(true)
              load()
            }}
            disabled={refreshing}
            className='rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80'
            style={{
              background: 'rgba(171,157,242,0.10)',
              border: '1px solid var(--border-default)',
              color: refreshing ? 'var(--text-3)' : 'var(--primary)'
            }}
          >
            {refreshing ? 'Actualizando…' : loadError ? '↻ Reintentar' : '↻ Actualizar'}
          </button>
          <button
            onClick={onLogout}
            className='rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80'
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-2)'
            }}
          >
            Cerrar sesión
          </button>
        </div>
      </nav>

      {/* ── Section nav ── */}
      <div className='border-b' style={{ borderColor: 'var(--border-subtle)' }}>
        <div className='mx-auto flex max-w-6xl gap-1 px-4 pt-2'>
          {(
            [
              { to: '/admin/aprendices', label: '👥 Aprendices' },
              { to: '/admin/contenido', label: '📚 Contenido' },
              { to: '/admin/onboarding', label: '🧭 Onboarding' },
            ] as const
          ).map(({ to, label }) => {
            const active = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                className='rounded-t-xl px-4 py-2 text-sm font-semibold transition-all'
                style={
                  active
                    ? {
                        background: 'var(--bg-card)',
                        color: 'var(--primary)',
                        borderBottom: '2px solid var(--primary)'
                      }
                    : { color: 'var(--text-3)' }
                }
              >
                {label}
              </Link>
            )
          })}
        </div>
      </div>

      <div className='animate-fade-up mx-auto max-w-6xl space-y-6 px-4 py-8'>
        {
          <>
            {/* ── Stats ── */}
            <div className='stagger grid grid-cols-2 gap-3 sm:grid-cols-4'>
              <StatCard icon='👥' value={students.length} label='Total Aprendices' badgeColor='#ab9df2' />
              <StatCard
                icon='✅'
                value={students.filter((s) => s.isActive).length}
                label='Activos'
                badgeColor='#a9dc76'
              />
              <StatCard
                icon='📈'
                value={students.filter((s) => s.exercisesDone > 0).length}
                label='Con actividad'
                badgeColor='#78dce8'
              />
              <StatCard icon='🏆' value={avgScore} label='Score promedio' badgeColor='#ffd866' />
            </div>

            {/* ── Mobile add button ── */}
            <div className='sm:hidden'>
              <button
                onClick={() => {
                  setShowCreateModal(true)
                  setCreated(null)
                  setCreateError('')
                }}
                className='w-full rounded-xl py-3 text-sm font-bold transition-all'
                style={{ background: 'var(--grad)', color: '#fff', boxShadow: '0 4px 12px var(--primary-glow)' }}
              >
                ➕ Registrar aprendiz
              </button>
            </div>

            {/* ── Search and filters ── */}
            <div
              className='space-y-3 rounded-2xl p-4'
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
            >
              <div className='flex flex-col gap-2 sm:flex-row'>
                <DarkInput
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder='Buscar por nombre o documento...'
                />
                <div className='flex shrink-0 gap-1.5'>
                  {(
                    [
                      ['all', 'Todos'],
                      ['active', '✅ Activos'],
                      ['inactive', '⛔ Inactivos']
                    ] as const
                  ).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => setFilterStatus(val)}
                      className='rounded-xl px-3 py-2 text-xs font-semibold whitespace-nowrap transition-all'
                      style={
                        filterStatus === val
                          ? { background: 'var(--grad)', color: '#fff', boxShadow: '0 2px 8px var(--primary-glow)' }
                          : {
                              background: 'rgba(255,255,255,0.04)',
                              color: 'var(--text-3)',
                              border: '1px solid var(--border-subtle)'
                            }
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              {availableCourses.length > 0 && (
                <div className='flex items-center gap-2'>
                  <span className='shrink-0 text-xs' style={{ color: 'var(--text-3)' }}>
                    Curso:
                  </span>
                  <CourseFilterDropdown
                    courses={availableCourses}
                    value={filterCourseId}
                    onChange={setFilterCourseId}
                  />
                </div>
              )}
              {(search || filterStatus !== 'all' || filterCourseId !== 'all') && (
                <div className='flex items-center justify-between'>
                  <p className='text-xs' style={{ color: 'var(--text-3)' }}>
                    Mostrando <strong style={{ color: 'var(--text-1)' }}>{filteredStudents.length}</strong> de{' '}
                    {students.length} aprendices
                  </p>
                  <button
                    onClick={clearFilters}
                    className='text-xs font-semibold hover:opacity-80'
                    style={{ color: 'var(--primary)' }}
                  >
                    ✕ Limpiar filtros
                  </button>
                </div>
              )}
            </div>

            {/* ── Student table ── */}
            <div
              className='overflow-hidden rounded-2xl'
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
            >
              <div
                className='flex items-center justify-between px-5 py-4'
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <h2 className='text-sm font-bold' style={{ color: 'var(--text-1)' }}>
                  Aprendices registrados
                </h2>
                <div className='flex items-center gap-2'>
                  {loadError && (
                    <span className='text-xs font-semibold' style={{ color: '#ffb3c6' }}>
                      {loadError}
                    </span>
                  )}
                  {students.length > 0 && (
                    <button
                      onClick={exportCsv}
                      className='flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80'
                      style={{
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-2)'
                      }}
                    >
                      ⬇ CSV
                    </button>
                  )}
                </div>
              </div>

              {loading ? (
                <div className='overflow-x-auto'>
                  <table className='w-full text-xs'>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        {[
                          'Nombre',
                          'Llave',
                          'Cursos',
                          'Estado',
                          'Ejercicios',
                          'Score',
                          'Último acceso',
                          'Últ. lección',
                          ''
                        ].map((h) => (
                          <th
                            key={h}
                            className='px-4 py-3 text-left font-semibold tracking-wider uppercase'
                            style={{ color: 'var(--text-3)' }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                          {Array.from({ length: 9 }).map((_, j) => (
                            <td key={j} className='px-4 py-3'>
                              <div
                                className={`animate-pulse rounded ${j === 3 ? 'h-5' : 'h-3'}`}
                                style={{
                                  background: 'rgba(255,255,255,0.05)',
                                  width: j === 0 ? '120px' : j === 3 ? '36px' : j === 8 ? '28px' : '70px'
                                }}
                              />
                              {j === 0 && (
                                <div
                                  className='mt-1.5 h-2.5 animate-pulse rounded'
                                  style={{ background: 'rgba(255,255,255,0.03)', width: '80px' }}
                                />
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : students.length === 0 ? (
                <div className='px-5 py-12 text-center text-sm' style={{ color: 'var(--text-3)' }}>
                  No hay aprendices registrados aún.
                </div>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='w-full text-xs'>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        {(
                          [
                            { label: 'Nombre', key: 'name' },
                            { label: 'Llave', key: null },
                            { label: 'Cursos', key: null },
                            { label: 'Estado', key: null },
                            { label: 'Ejercicios', key: 'exercisesDone' },
                            { label: 'Score', key: 'averageScore' },
                            { label: 'Último acceso', key: 'lastActivity' },
                            { label: 'Últ. lección', key: null },
                            { label: '', key: null }
                          ] as { label: string; key: SortKey | null }[]
                        ).map(({ label, key }) => (
                          <th
                            key={label || '_act'}
                            onClick={key ? () => toggleSort(key) : undefined}
                            className={`px-4 py-3 text-left font-semibold tracking-wider uppercase select-none${key ? 'cursor-pointer hover:opacity-80' : ''}`}
                            style={{
                              color: sortKey === key ? 'var(--primary)' : 'var(--text-3)',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {label}
                            {key && sortKey === key && <span className='ml-1'>{sortDir === 'asc' ? '↑' : '↓'}</span>}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={9} className='px-5 py-12 text-center text-sm' style={{ color: 'var(--text-3)' }}>
                            Sin resultados.{' '}
                            <button
                              onClick={clearFilters}
                              className='font-semibold hover:opacity-80'
                              style={{ color: 'var(--primary)' }}
                            >
                              Limpiar filtros
                            </button>
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((s) => (
                          <tr
                            key={s.id}
                            onClick={() => openViewProgress(s)}
                            className='cursor-pointer transition-colors hover:bg-white/2'
                            style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                          >
                            <td className='px-4 py-3' style={{ color: 'var(--text-1)' }}>
                              <div className='flex items-center gap-2'>
                                {daysSince(s.lastActivity) > 7 && (
                                  <span
                                    className='h-1.5 w-1.5 shrink-0 rounded-full'
                                    style={{ background: '#ffd866' }}
                                    title={
                                      daysSince(s.lastActivity) === Infinity
                                        ? 'Nunca tuvo actividad'
                                        : `Sin actividad hace ${daysSince(s.lastActivity)} días`
                                    }
                                  />
                                )}
                                <div>
                                  <div className='font-medium'>{s.name}</div>
                                  <div className='mt-0.5 font-mono text-xs' style={{ color: 'var(--text-3)' }}>
                                    {s.documentNumber}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className='px-4 py-3' onClick={(e) => e.stopPropagation()}>
                              <span className='font-mono select-all' style={{ color: 'var(--primary)' }}>
                                {s.accessKey}
                              </span>
                              <CopyBtn text={s.accessKey} />
                            </td>
                            <td className='px-4 py-3'>
                              <CoursesPill allowedCourseIds={s.allowedCourseIds} courses={availableCourses} compact />
                            </td>
                            <td className='px-4 py-3'>
                              <ToggleSwitch
                                checked={s.isActive}
                                disabled={togglingId === s.id}
                                onChange={() => handleToggle(s)}
                              />
                            </td>
                            <td className='px-4 py-3 font-mono' style={{ color: 'var(--text-2)' }}>
                              {s.exercisesDone}
                            </td>
                            <td className='px-4 py-3'>
                              <ScoreChip score={s.averageScore} />
                            </td>
                            <td className='px-4 py-3' style={{ color: 'var(--text-3)' }}>
                              {formatDate(s.lastActivity)}
                            </td>
                            <td className='px-4 py-3' style={{ color: 'var(--text-3)' }}>
                              {formatDate(s.lastLessonAt ?? null)}
                            </td>
                            <td className='px-4 py-3'>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openViewProgress(s)
                                }}
                                title='Ver detalle'
                                className='flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg text-sm transition-all hover:opacity-80'
                                style={{
                                  background: 'rgba(171,157,242,0.10)',
                                  border: '1px solid var(--border-default)',
                                  color: 'var(--primary)'
                                }}
                              >
                                👁
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        }
      </div>

      {/* ── Create modal ── */}
      {showCreateModal && (
        <Modal onClose={() => setShowCreateModal(false)}>
          <StudentForm
            title='Registrar nuevo aprendiz'
            nameVal={createName}
            docVal={createDoc}
            courseIds={createCourseIds}
            allCourses={createAllCourses}
            availableCourses={availableCourses}
            onChangeName={setCreateName}
            onChangeDoc={setCreateDoc}
            onToggleCourse={(id) => toggleCourse(id, createCourseIds, setCreateCourseIds)}
            onSetAllCourses={setCreateAllCourses}
            onSubmit={handleCreate}
            onClose={() => setShowCreateModal(false)}
            submitLabel='Registrar'
            submitting={creating}
            error={createError}
          />
          {created && (
            <div
              className='animate-fade-in mx-6 mb-6 flex items-center gap-3 rounded-xl px-4 py-3 text-sm'
              style={{ background: 'rgba(169,220,118,0.07)', border: '1px solid rgba(169,220,118,0.20)' }}
            >
              <span>✅</span>
              <span style={{ color: 'var(--text-1)' }}>
                <strong>{created.name}</strong> registrado —
              </span>
              <span className='font-mono font-bold' style={{ color: '#6EE7B7' }}>
                {created.accessKey}
              </span>
              <CopyBtn text={created.accessKey} />
            </div>
          )}
        </Modal>
      )}

      {/* ── Edit modal ── */}
      {editingStudent && (
        <Modal onClose={() => setEditingStudent(null)}>
          <StudentForm
            title={`Editar · ${editingStudent.name}`}
            nameVal={editName}
            docVal={editDoc}
            courseIds={editCourseIds}
            allCourses={editAllCourses}
            isActive={editActive}
            showActiveToggle
            availableCourses={availableCourses}
            onChangeName={setEditName}
            onChangeDoc={setEditDoc}
            onToggleCourse={(id) => toggleCourse(id, editCourseIds, setEditCourseIds)}
            onSetAllCourses={setEditAllCourses}
            onToggleActive={() => setEditActive((v) => !v)}
            onSubmit={handleSave}
            onClose={() => setEditingStudent(null)}
            submitLabel='Guardar cambios'
            submitting={saving}
            error={saveError}
          />
        </Modal>
      )}

      {/* ── Delete confirmation ── */}
      {confirmDeleteStudent && (
        <ConfirmModal
          title='¿Eliminar aprendiz?'
          message={`"${confirmDeleteStudent.name}" será eliminado permanentemente.`}
          detail='Esta acción no puede deshacerse.'
          confirmLabel='Sí, eliminar'
          confirmStyle='danger'
          loading={deleting}
          onConfirm={handleDelete}
          onClose={() => setConfirmDeleteStudent(null)}
        />
      )}

      {/* ── Reset progress confirmation ── */}
      {confirmResetStudent && (
        <ConfirmModal
          title='¿Resetear progreso?'
          message={`El progreso de ${confirmResetStudent.name} será eliminado permanentemente.`}
          detail='Todos sus ejercicios y lecciones completadas se perderán.'
          confirmLabel='Sí, resetear'
          confirmStyle='warning'
          loading={resettingProgressId === confirmResetStudent.id}
          onConfirm={doResetProgress}
          onClose={() => setConfirmResetStudent(null)}
        />
      )}

      {/* ── Student detail modal ── */}
      {viewingStudent &&
        (() => {
          const s = viewingStudent
          const initials = s.name
            .split(' ')
            .slice(0, 2)
            .map((w: string) => w[0]?.toUpperCase() ?? '')
            .join('')
          return (
            <Modal onClose={() => setViewingStudent(null)}>
              {/* Header */}
              <div
                className='flex items-center gap-4 px-6 py-5'
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <div
                  className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-black'
                  style={{ background: 'var(--grad)', color: '#fff' }}
                >
                  {initials || '?'}
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='truncate text-base leading-tight font-black' style={{ color: 'var(--text-1)' }}>
                    {s.name}
                  </div>
                  <div className='mt-0.5 font-mono text-xs' style={{ color: 'var(--text-3)' }}>
                    {s.documentNumber}
                  </div>
                </div>
                <div className='flex shrink-0 items-center gap-2'>
                  <button
                    onClick={() => handleToggle(s)}
                    disabled={togglingId === s.id}
                    title={s.isActive ? 'Desactivar' : 'Activar'}
                  >
                    <Badge ok={s.isActive} />
                  </button>
                  <button
                    onClick={() => setViewingStudent(null)}
                    className='flex h-7 w-7 items-center justify-center rounded-lg text-sm transition-all hover:opacity-70'
                    style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-3)' }}
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className='space-y-5 p-6'>
                {/* Access key */}
                <div
                  className='flex items-center justify-between rounded-xl px-4 py-3'
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                >
                  <div>
                    <p className='mb-0.5 text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
                      Llave de acceso
                    </p>
                    <span className='font-mono text-sm font-bold' style={{ color: 'var(--primary)' }}>
                      {s.accessKey}
                    </span>
                  </div>
                  <CopyBtn text={s.accessKey} />
                </div>

                {/* Courses */}
                <div>
                  <p className='mb-2 text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
                    Cursos asignados
                  </p>
                  <CoursesPill allowedCourseIds={s.allowedCourseIds} courses={availableCourses} />
                </div>

                {/* Stats grid */}
                <div className='grid grid-cols-3 gap-3'>
                  {[
                    { label: 'Ejercicios', value: s.exercisesDone, color: '#ab9df2' },
                    { label: 'Lecciones', value: s.lessonsRead, color: '#78dce8' },
                    {
                      label: 'Score',
                      value: s.averageScore !== null ? `${Math.round(s.averageScore)}` : '—',
                      color:
                        s.averageScore !== null && s.averageScore >= 80
                          ? '#a9dc76'
                          : s.averageScore !== null && s.averageScore >= 50
                            ? '#ffd866'
                            : '#6b7280'
                    }
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className='rounded-xl p-3 text-center'
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                    >
                      <div className='mb-0.5 font-mono text-xl leading-none font-black' style={{ color: stat.color }}>
                        {stat.value}
                      </div>
                      <div className='text-xs' style={{ color: 'var(--text-3)' }}>
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Activity chart */}
                {(() => {
                  const maxEx = Math.max(...students.map((x) => x.exercisesDone), 1)
                  const maxLs = Math.max(...students.map((x) => x.lessonsRead), 1)
                  const exPct = Math.round((s.exercisesDone / maxEx) * 100)
                  const lsPct = Math.round((s.lessonsRead / maxLs) * 100)
                  const scorePct = s.averageScore !== null ? Math.round(s.averageScore) : 0
                  const scoreColor = scorePct >= 80 ? '#a9dc76' : scorePct >= 50 ? '#ffd866' : '#ff6188'
                  const days = s.lastActivity
                    ? Math.floor((Date.now() - new Date(s.lastActivity).getTime()) / 86400000)
                    : null
                  const activityLabel =
                    days === null ? 'Sin actividad' : days === 0 ? 'Hoy' : days === 1 ? 'Ayer' : `Hace ${days} días`
                  const activityColor = days === null || days > 14 ? '#ff6188' : days > 7 ? '#ffd866' : '#a9dc76'
                  return (
                    <div
                      className='space-y-3 rounded-xl p-3'
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                    >
                      <div className='mb-1 flex items-center justify-between'>
                        <p className='text-xs font-semibold' style={{ color: 'var(--text-3)' }}>
                          Comparativa del grupo
                        </p>
                        <span
                          className='rounded-full px-2 py-0.5 text-xs font-bold'
                          style={{
                            background: `${activityColor}18`,
                            color: activityColor,
                            border: `1px solid ${activityColor}30`
                          }}
                        >
                          {activityLabel}
                        </span>
                      </div>
                      {[
                        { label: 'Ejercicios', value: s.exercisesDone, max: maxEx, pct: exPct, color: '#ab9df2' },
                        { label: 'Lecciones', value: s.lessonsRead, max: maxLs, pct: lsPct, color: '#78dce8' }
                      ].map(({ label, value, max, pct, color }) => (
                        <div key={label}>
                          <div className='mb-1 flex items-center justify-between'>
                            <span className='text-xs' style={{ color: 'var(--text-3)' }}>
                              {label}
                            </span>
                            <span className='font-mono text-xs font-bold' style={{ color }}>
                              {value}
                              <span className='font-normal opacity-50'> / {max} máx</span>
                            </span>
                          </div>
                          <div
                            className='h-1.5 overflow-hidden rounded-full'
                            style={{ background: 'rgba(255,255,255,0.07)' }}
                          >
                            <div
                              className='h-full rounded-full transition-all duration-700'
                              style={{ width: `${pct}%`, background: color }}
                            />
                          </div>
                        </div>
                      ))}
                      <div>
                        <div className='mb-1 flex items-center justify-between'>
                          <span className='text-xs' style={{ color: 'var(--text-3)' }}>
                            Score promedio
                          </span>
                          <span className='font-mono text-xs font-bold' style={{ color: scoreColor }}>
                            {s.averageScore !== null ? `${scorePct}%` : '—'}
                          </span>
                        </div>
                        <div
                          className='h-1.5 overflow-hidden rounded-full'
                          style={{ background: 'rgba(255,255,255,0.07)' }}
                        >
                          <div
                            className='h-full rounded-full transition-all duration-700'
                            style={{ width: `${scorePct}%`, background: scoreColor }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })()}

                {/* Dates */}
                <div className='grid grid-cols-2 gap-3'>
                  <div
                    className='rounded-xl px-3 py-2.5'
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                  >
                    <p className='mb-0.5 text-xs' style={{ color: 'var(--text-3)' }}>
                      Último acceso
                    </p>
                    <p className='text-xs font-semibold' style={{ color: 'var(--text-2)' }}>
                      {formatDate(s.lastActivity)}
                    </p>
                  </div>
                  <div
                    className='rounded-xl px-3 py-2.5'
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}
                  >
                    <p className='mb-0.5 text-xs' style={{ color: 'var(--text-3)' }}>
                      Últ. lección
                    </p>
                    <p className='text-xs font-semibold' style={{ color: 'var(--text-2)' }}>
                      {formatDate(s.lastLessonAt ?? null)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className='flex gap-2 pt-1'>
                  <button
                    onClick={() => {
                      setViewingStudent(null)
                      openEdit(s)
                    }}
                    className='flex-1 rounded-xl py-2.5 text-xs font-bold transition-all hover:opacity-80'
                    style={{
                      background: 'rgba(171,157,242,0.10)',
                      color: 'var(--primary)',
                      border: '1px solid var(--border-default)'
                    }}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => {
                      setViewingStudent(null)
                      handleResetProgress(s)
                    }}
                    className='flex-1 rounded-xl py-2.5 text-xs font-bold transition-all hover:opacity-80'
                    style={{
                      background: 'rgba(255,216,102,0.10)',
                      color: '#ffd866',
                      border: '1px solid rgba(255,216,102,0.25)'
                    }}
                  >
                    ↺ Reset progreso
                  </button>
                  <button
                    onClick={() => {
                      setViewingStudent(null)
                      setConfirmDeleteStudent(s)
                    }}
                    className='flex-1 rounded-xl py-2.5 text-xs font-bold transition-all hover:opacity-80'
                    style={{
                      background: 'rgba(255,97,136,0.10)',
                      color: '#ffb3c6',
                      border: '1px solid rgba(255,97,136,0.25)'
                    }}
                  >
                    🗑 Eliminar
                  </button>
                </div>
              </div>
            </Modal>
          )
        })()}
    </div>
  )
}
