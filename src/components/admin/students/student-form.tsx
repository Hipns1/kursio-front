import { useState } from 'react'
import type { CourseSummary } from '@/services/backend'
import { CourseIcon, DarkInput, PrimaryBtn } from '@/components/ui'

export interface StudentFormProps {
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

export function StudentForm({
  allCourses,
  availableCourses,
  courseIds,
  docVal,
  error,
  isActive,
  nameVal,
  onChangeDoc,
  onChangeName,
  onClose,
  onSetAllCourses,
  onSubmit,
  onToggleActive,
  onToggleCourse,
  showActiveToggle,
  submitLabel,
  submitting,
  title
}: StudentFormProps) {
  const [courseSearch, setCourseSearch] = useState('')
  const canSubmit = nameVal.trim() && docVal.trim() && (allCourses || courseIds.length > 0) && !submitting

  const filteredCourses = availableCourses.filter(
    (c) => courseSearch.trim() === '' || c.name.toLowerCase().includes(courseSearch.toLowerCase())
  )

  return (
    <>
      <div className='border-hairline flex items-center justify-between border-b px-6 py-4'>
        <h2 className='text-fg text-sm font-bold'>{title}</h2>
        <button
          onClick={onClose}
          className='text-fg-subtle bg-tint flex h-7 w-7 items-center justify-center rounded-lg text-sm transition-all hover:opacity-70'
        >
          ✕
        </button>
      </div>

      <div className='space-y-4 p-6'>
        <div className='flex flex-col gap-3 sm:flex-row'>
          <div className='flex-1'>
            <label className='text-fg-subtle mb-1.5 block text-xs font-semibold'>
              Nombre completo <span className='text-danger'>*</span>
            </label>
            <DarkInput value={nameVal} onChange={(e) => onChangeName(e.target.value)} placeholder='Nombre completo' />
          </div>
          <div className='flex-1'>
            <label className='text-fg-subtle mb-1.5 block text-xs font-semibold'>
              Documento <span className='text-danger'>*</span>
            </label>
            <DarkInput value={docVal} onChange={(e) => onChangeDoc(e.target.value)} placeholder='Número de documento' />
          </div>
        </div>

        <div>
          <label className='text-fg-subtle mb-2 block text-xs font-semibold'>
            Acceso a cursos <span className='text-danger'>*</span>
          </label>

          <div className='mb-3 grid grid-cols-2 gap-2'>
            <button
              type='button'
              onClick={() => onSetAllCourses(true)}
              className='flex items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs font-bold transition-all'
              style={
                allCourses
                  ? {
                      background: 'var(--primary-glow)',
                      border: '1.5px solid var(--primary)',
                      color: 'var(--primary)'
                    }
                  : {
                      background: 'var(--tint-1)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-3)'
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
                      background: 'var(--primary-glow)',
                      border: '1.5px solid var(--primary)',
                      color: 'var(--primary)'
                    }
                  : {
                      background: 'var(--tint-1)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-3)'
                    }
              }
            >
              <span className='text-base'>🎯</span>
              <span>Cursos específicos</span>
              {!allCourses && <span className='ml-auto text-xs'>✓</span>}
            </button>
          </div>

          {!allCourses && (
            <>
              <div className='border-hairline bg-tint mb-2 flex items-center gap-2 rounded-xl border px-3 py-2'>
                <span className='text-fg-subtle text-xs'>🔍</span>
                <input
                  type='text'
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  placeholder='Buscar curso...'
                  className='text-fg flex-1 bg-transparent text-xs outline-none'
                />
                {courseSearch && (
                  <button onClick={() => setCourseSearch('')} className='text-fg-subtle text-xs leading-none'>
                    ✕
                  </button>
                )}
              </div>
              <div className='border-line max-h-[260px] overflow-hidden overflow-y-auto rounded-xl border'>
                {filteredCourses.length === 0 && (
                  <p className='text-fg-subtle p-3 text-xs'>
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
                        background: isSelected ? `${c.color}10` : 'transparent',
                        borderTop: i > 0 ? '1px solid var(--border-subtle)' : 'none'
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
                        {isSelected && <span className='text-xs font-semibold text-white'>✓</span>}
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
                          <div className='text-fg-subtle truncate text-xs'>
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
            <p className='text-warning mt-1.5 text-xs'>⚠ Seleccioná al menos un curso.</p>
          )}
        </div>

        {showActiveToggle && onToggleActive && (
          <div className='flex items-center justify-between'>
            <span className='text-fg-muted text-xs font-semibold'>Estado de la cuenta</span>
            <button
              type='button'
              onClick={onToggleActive}
              className='rounded-lg px-3 py-1.5 text-xs font-semibold transition-all'
              style={
                isActive
                  ? {
                      background: 'var(--success-bg)',
                      border: '1px solid var(--success-border)',
                      color: 'var(--success)'
                    }
                  : { background: 'var(--danger-bg)', border: '1px solid var(--danger-border)', color: 'var(--danger)' }
              }
            >
              {isActive ? '✓ Activo' : '✗ Inactivo'}
            </button>
          </div>
        )}

        {error && <p className='text-danger text-xs'>{error}</p>}

        <div className='flex gap-3 pt-1'>
          <button
            onClick={onClose}
            className='bg-elevated border-hairline text-fg-muted flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-80'
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
