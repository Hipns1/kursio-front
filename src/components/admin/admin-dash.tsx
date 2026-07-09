import { useEffect, useState } from 'react'
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
import { Badge, ConfirmModal, CopyBtn, DarkInput, ScoreChip, useToast } from '@/components/ui'
import { PageHeader, ReadingColumn } from '@/components/layout'
import { formatDate } from '@/utils/helpers/format'
import { is401 } from '@/utils/helpers/http'
import { useEscapeKey } from '@/hooks/use-escape-key'
import { downloadStudentsCsv } from '@/utils/helpers/students-csv'
import { CourseFilterDropdown, CoursesPill, Modal, StatCard, StudentForm, ToggleSwitch } from './students'
import { type SortKey, useStudentFilters } from './students/use-student-filters'

interface AdminDashProps {
  token: string
  onLogout: () => void
}

export function AdminDash({ onLogout, token }: AdminDashProps) {
  const [students, setStudents] = useState<StudentSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [availableCourses, setAvailableCourses] = useState<CourseSummary[]>([])

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createDoc, setCreateDoc] = useState('')
  const [createCourseIds, setCreateCourseIds] = useState<number[]>([])
  const [createAllCourses, setCreateAllCourses] = useState(true)
  const [creating, setCreating] = useState(false)
  const [created, setCreated] = useState<CreatedStudent | null>(null)
  const [createError, setCreateError] = useState('')

  const [editingStudent, setEditingStudent] = useState<StudentSummary | null>(null)
  const [editName, setEditName] = useState('')
  const [editDoc, setEditDoc] = useState('')
  const [editCourseIds, setEditCourseIds] = useState<number[]>([])
  const [editAllCourses, setEditAllCourses] = useState(true)
  const [editActive, setEditActive] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const [confirmDeleteStudent, setConfirmDeleteStudent] = useState<StudentSummary | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [togglingId, setTogglingId] = useState<number | null>(null)

  const [confirmResetStudent, setConfirmResetStudent] = useState<StudentSummary | null>(null)
  const [resettingProgressId, setResettingProgressId] = useState<number | null>(null)

  const [viewingStudent, setViewingStudent] = useState<StudentSummary | null>(null)

  const {
    clearFilters,
    filterCourseId,
    filteredStudents,
    filterStatus,
    search,
    setFilterCourseId,
    setFilterStatus,
    setSearch,
    sortDir,
    sortKey,
    toggleSort
  } = useStudentFilters(students)

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

  useEscapeKey([
    [confirmResetStudent, () => setConfirmResetStudent(null)],
    [confirmDeleteStudent, () => setConfirmDeleteStudent(null)],
    [viewingStudent, () => setViewingStudent(null)],
    [editingStudent, () => setEditingStudent(null)],
    [showCreateModal, () => setShowCreateModal(false)]
  ])

  const toggleCourse = (id: number, list: number[], setList: (v: number[]) => void) => {
    setList(list.includes(id) ? list.filter((x) => x !== id) : [...list, id])
  }

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

  const handleSave = async () => {
    if (!editingStudent || !editName.trim() || !editDoc.trim()) return
    if (!editAllCourses && editCourseIds.length === 0) return
    setSaving(true)
    setSaveError('')
    const payload: UpdateStudentPayload = {
      allowedCourseIds: editAllCourses ? [] : editCourseIds,
      documentNumber: editDoc.trim(),
      isActive: editActive,
      name: editName.trim()
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
      setStudents((prev) =>
        prev.map((x) =>
          x.id === target.id
            ? { ...x, averageScore: null, exercisesDone: 0, lastActivity: null, lastLessonAt: null, lessonsRead: 0 }
            : x
        )
      )
      toast(`Progreso de ${target.name} reseteado`, 'warning')
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

  const openViewProgress = (s: StudentSummary) => setViewingStudent(s)

  const exportCsv = () => {
    downloadStudentsCsv(students)
    toast('CSV exportado', 'success')
  }

  const daysSince = (iso: string | null) => {
    if (!iso) return Infinity
    return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  }

  const avgScore = (() => {
    const scored = students.filter((s) => s.averageScore !== null)
    return scored.length ? Math.round(scored.reduce((a, s) => a + s.averageScore!, 0) / scored.length) : '—'
  })()

  return (
    <ReadingColumn width='wide'>
      <PageHeader
        eyebrow='Administración'
        title='Aprendices'
        subtitle='Altas, accesos y progreso del grupo.'
        actions={
          <button
            onClick={() => {
              setRefreshing(true)
              void load()
            }}
            disabled={refreshing}
            className='border-hairline text-fg-muted hover:text-fg rounded border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50'
          >
            {refreshing ? 'Actualizando…' : loadError ? 'Reintentar' : 'Actualizar'}
          </button>
        }
      />

      <div className='animate-fade-up space-y-6'>
        {
          <>
            <div className='stagger grid grid-cols-2 gap-3 sm:grid-cols-4'>
              <StatCard icon='👥' value={students.length} label='Total Aprendices' badgeColor='var(--primary)' />
              <StatCard
                icon='✅'
                value={students.filter((s) => s.isActive).length}
                label='Activos'
                badgeColor='var(--success)'
              />
              <StatCard
                icon='📈'
                value={students.filter((s) => s.exercisesDone > 0).length}
                label='Con actividad'
                badgeColor='var(--accent)'
              />
              <StatCard icon='🏆' value={avgScore} label='Score promedio' badgeColor='var(--warning)' />
            </div>

            <div className='sm:hidden'>
              <button
                onClick={() => {
                  setShowCreateModal(true)
                  setCreated(null)
                  setCreateError('')
                }}
                className='w-full rounded-xl py-3 text-sm font-bold transition-all'
                style={{ background: 'var(--grad)', boxShadow: '0 4px 12px var(--primary-glow)', color: '#fff' }}
              >
                ➕ Registrar aprendiz
              </button>
            </div>

            <div className='bg-card border-hairline space-y-3 rounded-2xl border p-4'>
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
                          ? { background: 'var(--grad)', boxShadow: '0 2px 8px var(--primary-glow)', color: '#fff' }
                          : {
                              background: 'var(--tint-1)',
                              border: '1px solid var(--border-subtle)',
                              color: 'var(--text-3)'
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
                  <span className='text-fg-subtle shrink-0 text-xs'>Curso:</span>
                  <CourseFilterDropdown
                    courses={availableCourses}
                    value={filterCourseId}
                    onChange={setFilterCourseId}
                  />
                </div>
              )}
              {(search || filterStatus !== 'all' || filterCourseId !== 'all') && (
                <div className='flex items-center justify-between'>
                  <p className='text-fg-subtle text-xs'>
                    Mostrando <strong className='text-fg'>{filteredStudents.length}</strong> de {students.length}{' '}
                    aprendices
                  </p>
                  <button onClick={clearFilters} className='text-primary text-xs font-semibold hover:opacity-80'>
                    ✕ Limpiar filtros
                  </button>
                </div>
              )}
            </div>

            <div className='bg-card border-hairline overflow-hidden rounded-2xl border'>
              <div className='border-hairline flex items-center justify-between border-b px-5 py-4'>
                <h2 className='text-fg text-sm font-bold'>Aprendices registrados</h2>
                <div className='flex items-center gap-2'>
                  {loadError && <span className='text-danger text-xs font-semibold'>{loadError}</span>}
                  {students.length > 0 && (
                    <button
                      onClick={exportCsv}
                      className='border-hairline text-fg-muted bg-tint flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80'
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
                      <tr className='border-hairline border-b'>
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
                            className='text-fg-subtle px-4 py-3 text-left font-semibold tracking-wider uppercase'
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className='border-b border-[var(--tint-1)]'>
                          {Array.from({ length: 9 }).map((_, j) => (
                            <td key={j} className='px-4 py-3'>
                              <div
                                className={`animate-pulse rounded ${j === 3 ? 'h-5' : 'h-3'}`}
                                style={{
                                  background: 'var(--tint-2)',
                                  width: j === 0 ? '120px' : j === 3 ? '36px' : j === 8 ? '28px' : '70px'
                                }}
                              />
                              {j === 0 && <div className='bg-tint mt-1.5 h-2.5 w-20 animate-pulse rounded' />}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : students.length === 0 ? (
                <div className='text-fg-subtle px-5 py-12 text-center text-sm'>No hay aprendices registrados aún.</div>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='w-full text-xs'>
                    <thead>
                      <tr className='border-hairline border-b'>
                        {(
                          [
                            { key: 'name', label: 'Nombre' },
                            { key: null, label: 'Llave' },
                            { key: null, label: 'Cursos' },
                            { key: null, label: 'Estado' },
                            { key: 'exercisesDone', label: 'Ejercicios' },
                            { key: 'averageScore', label: 'Score' },
                            { key: 'lastActivity', label: 'Último acceso' },
                            { key: null, label: 'Últ. lección' },
                            { key: null, label: '' }
                          ] as { label: string; key: SortKey | null }[]
                        ).map(({ key, label }) => (
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
                          <td colSpan={9} className='text-fg-subtle px-5 py-12 text-center text-sm'>
                            Sin resultados.{' '}
                            <button onClick={clearFilters} className='text-primary font-semibold hover:opacity-80'>
                              Limpiar filtros
                            </button>
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((s) => (
                          <tr
                            key={s.id}
                            onClick={() => openViewProgress(s)}
                            className='cursor-pointer border-b border-[var(--tint-1)] transition-colors hover:bg-white/2'
                          >
                            <td className='text-fg px-4 py-3'>
                              <div className='flex items-center gap-2'>
                                {daysSince(s.lastActivity) > 7 && (
                                  <span
                                    className='h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--warning)]'
                                    title={
                                      daysSince(s.lastActivity) === Infinity
                                        ? 'Nunca tuvo actividad'
                                        : `Sin actividad hace ${daysSince(s.lastActivity)} días`
                                    }
                                  />
                                )}
                                <div>
                                  <div className='font-medium'>{s.name}</div>
                                  <div className='text-fg-subtle mt-0.5 font-mono text-xs'>{s.documentNumber}</div>
                                </div>
                              </div>
                            </td>
                            <td className='px-4 py-3' onClick={(e) => e.stopPropagation()}>
                              <span className='text-primary font-mono select-all'>{s.accessKey}</span>
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
                            <td className='text-fg-muted px-4 py-3 font-mono'>{s.exercisesDone}</td>
                            <td className='px-4 py-3'>
                              <ScoreChip score={s.averageScore} />
                            </td>
                            <td className='text-fg-subtle px-4 py-3'>{formatDate(s.lastActivity)}</td>
                            <td className='text-fg-subtle px-4 py-3'>{formatDate(s.lastLessonAt ?? null)}</td>
                            <td className='px-4 py-3'>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openViewProgress(s)
                                }}
                                title='Ver detalle'
                                className='border-line text-primary bg-primary-glow flex h-7 w-7 cursor-pointer items-center justify-center rounded-lg border text-sm transition-all hover:opacity-80'
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
            <div className='animate-fade-in border-success-border bg-success-bg mx-6 mb-6 flex items-center gap-3 rounded-xl border px-4 py-3 text-sm'>
              <span>✅</span>
              <span className='text-fg'>
                <strong>{created.name}</strong> registrado —
              </span>
              <span className='text-success font-mono font-bold'>{created.accessKey}</span>
              <CopyBtn text={created.accessKey} />
            </div>
          )}
        </Modal>
      )}

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
              <div className='border-hairline flex items-center gap-4 border-b px-6 py-5'>
                <div className='bg-grad text-on-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-base font-semibold'>
                  {initials || '?'}
                </div>
                <div className='min-w-0 flex-1'>
                  <div className='text-fg truncate text-base leading-tight font-semibold'>{s.name}</div>
                  <div className='text-fg-subtle mt-0.5 font-mono text-xs'>{s.documentNumber}</div>
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
                    className='text-fg-subtle bg-tint flex h-7 w-7 items-center justify-center rounded-lg text-sm transition-all hover:opacity-70'
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className='space-y-5 p-6'>
                <div className='bg-elevated border-hairline flex items-center justify-between rounded-xl border px-4 py-3'>
                  <div>
                    <p className='text-fg-subtle mb-0.5 text-xs font-semibold'>Llave de acceso</p>
                    <span className='text-primary font-mono text-sm font-bold'>{s.accessKey}</span>
                  </div>
                  <CopyBtn text={s.accessKey} />
                </div>

                <div>
                  <p className='text-fg-subtle mb-2 text-xs font-semibold'>Cursos asignados</p>
                  <CoursesPill allowedCourseIds={s.allowedCourseIds} courses={availableCourses} />
                </div>

                <div className='grid grid-cols-3 gap-3'>
                  {[
                    { color: 'var(--primary)', label: 'Ejercicios', value: s.exercisesDone },
                    { color: 'var(--accent)', label: 'Lecciones', value: s.lessonsRead },
                    {
                      color:
                        s.averageScore !== null && s.averageScore >= 80
                          ? 'var(--success)'
                          : s.averageScore !== null && s.averageScore >= 50
                            ? 'var(--warning)'
                            : '#6b7280',
                      label: 'Score',
                      value: s.averageScore !== null ? `${Math.round(s.averageScore)}` : '—'
                    }
                  ].map((stat) => (
                    <div key={stat.label} className='bg-elevated border-hairline rounded-xl border p-3 text-center'>
                      <div
                        className='mb-0.5 font-mono text-xl leading-none font-semibold'
                        style={{ color: stat.color }}
                      >
                        {stat.value}
                      </div>
                      <div className='text-fg-subtle text-xs'>{stat.label}</div>
                    </div>
                  ))}
                </div>

                {(() => {
                  const maxEx = Math.max(...students.map((x) => x.exercisesDone), 1)
                  const maxLs = Math.max(...students.map((x) => x.lessonsRead), 1)
                  const exPct = Math.round((s.exercisesDone / maxEx) * 100)
                  const lsPct = Math.round((s.lessonsRead / maxLs) * 100)
                  const scorePct = s.averageScore !== null ? Math.round(s.averageScore) : 0
                  const scoreColor =
                    scorePct >= 80 ? 'var(--success)' : scorePct >= 50 ? 'var(--warning)' : 'var(--danger)'
                  const days = s.lastActivity
                    ? Math.floor((Date.now() - new Date(s.lastActivity).getTime()) / 86400000)
                    : null
                  const activityLabel =
                    days === null ? 'Sin actividad' : days === 0 ? 'Hoy' : days === 1 ? 'Ayer' : `Hace ${days} días`
                  const activityColor =
                    days === null || days > 14 ? 'var(--danger)' : days > 7 ? 'var(--warning)' : 'var(--success)'
                  return (
                    <div className='bg-elevated border-hairline space-y-3 rounded-xl border p-3'>
                      <div className='mb-1 flex items-center justify-between'>
                        <p className='text-fg-subtle text-xs font-semibold'>Comparativa del grupo</p>
                        <span
                          className='rounded-full px-2 py-0.5 text-xs font-bold'
                          style={{
                            background: `${activityColor}18`,
                            border: `1px solid ${activityColor}30`,
                            color: activityColor
                          }}
                        >
                          {activityLabel}
                        </span>
                      </div>
                      {[
                        {
                          color: 'var(--primary)',
                          label: 'Ejercicios',
                          max: maxEx,
                          pct: exPct,
                          value: s.exercisesDone
                        },
                        { color: 'var(--accent)', label: 'Lecciones', max: maxLs, pct: lsPct, value: s.lessonsRead }
                      ].map(({ color, label, max, pct, value }) => (
                        <div key={label}>
                          <div className='mb-1 flex items-center justify-between'>
                            <span className='text-fg-subtle text-xs'>{label}</span>
                            <span className='font-mono text-xs font-bold' style={{ color }}>
                              {value}
                              <span className='font-normal opacity-50'> / {max} máx</span>
                            </span>
                          </div>
                          <div className='bg-tint-strong h-1.5 overflow-hidden rounded-full'>
                            <div
                              className='h-full rounded-full transition-all duration-700'
                              style={{ background: color, width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      ))}
                      <div>
                        <div className='mb-1 flex items-center justify-between'>
                          <span className='text-fg-subtle text-xs'>Score promedio</span>
                          <span className='font-mono text-xs font-bold' style={{ color: scoreColor }}>
                            {s.averageScore !== null ? `${scorePct}%` : '—'}
                          </span>
                        </div>
                        <div className='bg-tint-strong h-1.5 overflow-hidden rounded-full'>
                          <div
                            className='h-full rounded-full transition-all duration-700'
                            style={{ background: scoreColor, width: `${scorePct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })()}

                <div className='grid grid-cols-2 gap-3'>
                  <div className='bg-elevated border-hairline rounded-xl border px-3 py-2.5'>
                    <p className='text-fg-subtle mb-0.5 text-xs'>Último acceso</p>
                    <p className='text-fg-muted text-xs font-semibold'>{formatDate(s.lastActivity)}</p>
                  </div>
                  <div className='bg-elevated border-hairline rounded-xl border px-3 py-2.5'>
                    <p className='text-fg-subtle mb-0.5 text-xs'>Últ. lección</p>
                    <p className='text-fg-muted text-xs font-semibold'>{formatDate(s.lastLessonAt ?? null)}</p>
                  </div>
                </div>

                <div className='flex gap-2 pt-1'>
                  <button
                    onClick={() => {
                      setViewingStudent(null)
                      openEdit(s)
                    }}
                    className='text-primary border-line bg-primary-glow flex-1 rounded-xl border py-2.5 text-xs font-bold transition-all hover:opacity-80'
                  >
                    ✏️ Editar
                  </button>
                  <button
                    onClick={() => {
                      setViewingStudent(null)
                      handleResetProgress(s)
                    }}
                    className='border-warning-border bg-warning-bg text-warning flex-1 rounded-xl border py-2.5 text-xs font-bold transition-all hover:opacity-80'
                  >
                    ↺ Reset progreso
                  </button>
                  <button
                    onClick={() => {
                      setViewingStudent(null)
                      setConfirmDeleteStudent(s)
                    }}
                    className='border-danger-border bg-danger-bg text-danger flex-1 rounded-xl border py-2.5 text-xs font-bold transition-all hover:opacity-80'
                  >
                    🗑 Eliminar
                  </button>
                </div>
              </div>
            </Modal>
          )
        })()}
    </ReadingColumn>
  )
}
