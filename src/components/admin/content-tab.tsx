import { useState } from 'react'
import type { AdminExercise, UpdateCoursePayload } from '@/services/backend'
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
  updateCourse,
  updateExercise,
  updateLesson,
  updatePhase
} from '@/services/backend'
import type { Lesson } from '@/types/learning'
import {
  ConfirmModal,
  CourseIcon,
  DarkInput,
  DarkTextarea,
  IconPicker,
  PrimaryBtn,
  TypeBadge,
  useToast
} from '@/components/ui'
import { is401 } from '@/utils/helpers/http'
import { useEscapeKey } from '@/hooks/use-escape-key'
import {
  ContentModal,
  CourseModal,
  type EditableBlock,
  ExerciseForm,
  type ExForm,
  LessonBlockEditor,
  LessonLivePreview,
  PreviewShell,
  useContentData
} from './content'

export function ContentTab({ onUnauthorized, token }: { token: string; onUnauthorized: () => void }) {
  const { content, loadContent, loadingContent, setContent } = useContentData(token, onUnauthorized)
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)
  const [selectedPhase, setSelectedPhase] = useState(0)
  const [activeTab, setActiveTab] = useState<'exercises' | 'lessons'>('exercises')
  const [courseSearch, setCourseSearch] = useState('')

  const [showCourseEdit, setShowCourseEdit] = useState(false)
  const [courseForm, setCourseForm] = useState<UpdateCoursePayload>({
    color: '',
    description: '',
    icon: '',
    name: '',
    order: 1,
    prerequisites: [],
    slug: ''
  })
  const [savingCourse, setSavingCourse] = useState(false)
  const [courseError, setCourseError] = useState('')

  const [showPhaseEdit, setShowPhaseEdit] = useState(false)
  const [phaseForm, setPhaseForm] = useState({ icon: '', name: '' })
  const [savingPhase, setSavingPhase] = useState(false)
  const [phaseEditError, setPhaseEditError] = useState('')

  const [showAddForm, setShowAddForm] = useState(false)
  const [addForm, setAddForm] = useState<ExForm>({ exerciseType: 'multiple-choice' })
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')

  const [editingExId, setEditingExId] = useState<string | null>(null)
  const [editExForm, setEditExForm] = useState<ExForm>({})
  const [updating, setUpdating] = useState(false)
  const [updateError, setUpdateError] = useState('')

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmDeleteEx, setConfirmDeleteEx] = useState<{ id: string; question: string } | null>(null)

  const [confirmDeleteLessonItem, setConfirmDeleteLessonItem] = useState<{ id: string; title: string } | null>(null)

  const [editingLessonId, setEditingLessonId] = useState<string | null>(null)
  const [editLessonTitle, setEditLessonTitle] = useState('')
  const [editLessonBlocks, setEditLessonBlocks] = useState<EditableBlock[]>([])
  const [updatingLesson, setUpdatingLesson] = useState(false)
  const [lessonError, setLessonError] = useState('')

  const [showAddLessonForm, setShowAddLessonForm] = useState(false)
  const [addLessonTitle, setAddLessonTitle] = useState('')
  const [addLessonBlocks, setAddLessonBlocks] = useState<EditableBlock[]>([])
  const [addingLesson, setAddingLesson] = useState(false)
  const [addLessonError, setAddLessonError] = useState('')

  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null)

  const [confirmDeleteCourse, setConfirmDeleteCourse] = useState<{ id: number; name: string } | null>(null)
  const [deletingCourse, setDeletingCourse] = useState(false)

  const [confirmDeletePhase, setConfirmDeletePhase] = useState<{ id: number; name: string } | null>(null)
  const [deletingPhase, setDeletingPhase] = useState(false)

  const [contentSearch, setContentSearch] = useState('')

  const [showCreateCourse, setShowCreateCourse] = useState(false)
  const [createCourseForm, setCreateCourseForm] = useState<CreateCoursePayload>({
    color: 'var(--primary)',
    description: '',
    icon: '📚',
    name: '',
    order: 1,
    slug: ''
  })
  const [creatingCourse, setCreatingCourse] = useState(false)
  const [createCourseError, setCreateCourseError] = useState('')

  const [showCreatePhase, setShowCreatePhase] = useState(false)
  const [createPhaseForm, setCreatePhaseForm] = useState<Omit<CreatePhasePayload, 'courseId'>>({
    icon: '📖',
    name: '',
    order: 1
  })
  const [creatingPhase, setCreatingPhase] = useState(false)
  const [createPhaseError, setCreatePhaseError] = useState('')

  const { toast } = useToast()

  useEscapeKey([
    [editingExId, () => setEditingExId(null)],
    [editingLessonId, () => setEditingLessonId(null)],
    [showAddForm, () => setShowAddForm(false)],
    [showAddLessonForm, () => setShowAddLessonForm(false)],
    [confirmDeleteEx, () => setConfirmDeleteEx(null)],
    [confirmDeleteLessonItem, () => setConfirmDeleteLessonItem(null)],
    [confirmDeleteCourse, () => setConfirmDeleteCourse(null)],
    [confirmDeletePhase, () => setConfirmDeletePhase(null)],
    [showPhaseEdit, () => setShowPhaseEdit(false)],
    [showCreatePhase, () => setShowCreatePhase(false)],
    [showCourseEdit, () => setShowCourseEdit(false)],
    [showCreateCourse, () => setShowCreateCourse(false)]
  ])

  const courses = content?.courses ?? []
  const currentCourse = courses.find((c) => c.id === selectedCourseId)
  const phases = currentCourse?.phases ?? []
  const currentPhase = phases.find((p) => p.id === selectedPhase)
  const exercises = (currentPhase?.exercises ?? []) as AdminExercise[]
  const lessons = currentPhase?.lessons ?? []

  const closeEditors = () => {
    setEditingExId(null)
    setEditingLessonId(null)
    setShowAddForm(false)
    setShowAddLessonForm(false)
  }

  const switchCourse = (id: number) => {
    const course = courses.find((c) => c.id === id)
    setSelectedCourseId(id)
    setSelectedPhase(course?.phases[0]?.id ?? 0)
    closeEditors()
    setShowCourseEdit(false)
    setShowPhaseEdit(false)
  }

  const backToCourses = () => {
    setSelectedCourseId(null)
    closeEditors()
    setShowCourseEdit(false)
    setShowPhaseEdit(false)
  }

  const switchPhase = (id: number) => {
    setSelectedPhase(id)
    closeEditors()
    setShowPhaseEdit(false)
  }

  const switchTab = (t: 'exercises' | 'lessons') => {
    setActiveTab(t)
    closeEditors()
    setContentSearch('')
  }

  const openCourseEdit = () => {
    if (!currentCourse) return
    setCourseForm({
      color: currentCourse.color,
      description: currentCourse.description,
      icon: currentCourse.icon,
      name: currentCourse.name,
      order: currentCourse.order,
      prerequisites: currentCourse.prerequisites ?? [],
      slug: currentCourse.slug
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

  const openPhaseEdit = () => {
    if (!currentPhase) return
    setPhaseForm({ icon: currentPhase.icon, name: currentPhase.name })
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

  const handleAdd = async () => {
    if (!addForm.question?.trim() || !addForm.explanation?.trim() || selectedCourseId === null) return
    setAdding(true)
    setAddError('')
    try {
      const newEx = await addExercise(token, {
        blanks: addForm.exerciseType === 'complete-code' && addForm.blanks?.length ? addForm.blanks : undefined,
        code: addForm.code || undefined,
        correct: addForm.exerciseType === 'multiple-choice' ? addForm.correct : undefined,
        courseId: selectedCourseId,
        exerciseType: addForm.exerciseType!,
        explanation: addForm.explanation,
        keywords: addForm.exerciseType === 'know-output' && addForm.keywords?.length ? addForm.keywords : undefined,
        options: addForm.exerciseType === 'multiple-choice' && addForm.options?.length ? addForm.options : undefined,
        phaseOrder: selectedPhase,
        question: addForm.question
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

  const startEditEx = (ex: AdminExercise) => {
    setEditingExId(ex.id)
    setEditExForm({
      blanks: ex.blanks ?? [],
      code: ex.code ?? '',
      correct: ex.correct ?? 0,
      exerciseType: ex.type,
      explanation: ex.explanation,
      keywords: ex.keywords ?? [],
      options: ex.options ?? [],
      question: ex.question
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
        blanks:
          editExForm.exerciseType === 'complete-code' && editExForm.blanks?.length ? editExForm.blanks : undefined,
        code: editExForm.code || undefined,
        correct: editExForm.exerciseType === 'multiple-choice' ? editExForm.correct : undefined,
        exerciseType: editExForm.exerciseType!,
        explanation: editExForm.explanation,
        keywords:
          editExForm.exerciseType === 'know-output' && editExForm.keywords?.length ? editExForm.keywords : undefined,
        options:
          editExForm.exerciseType === 'multiple-choice' && editExForm.options?.length ? editExForm.options : undefined,
        question: editExForm.question
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
        blocksJson: JSON.stringify(editLessonBlocks),
        title: editLessonTitle
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

  const handleAddLesson = async () => {
    if (!addLessonTitle.trim() || selectedCourseId === null) return
    setAddingLesson(true)
    setAddLessonError('')
    try {
      const newLesson = await addLesson(token, {
        blocksJson: JSON.stringify(addLessonBlocks),
        courseId: selectedCourseId,
        phaseOrder: selectedPhase,
        title: addLessonTitle.trim()
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

  const handleCreateCourse = async () => {
    if (!createCourseForm.name.trim() || !createCourseForm.slug.trim()) return
    setCreatingCourse(true)
    setCreateCourseError('')
    try {
      const newCourse = await createCourse(token, createCourseForm)
      setShowCreateCourse(false)
      setCreateCourseForm({ color: 'var(--primary)', description: '', icon: '📚', name: '', order: 1, slug: '' })
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

  const handleCreatePhase = async () => {
    if (!createPhaseForm.name.trim() || selectedCourseId === null) return
    setCreatingPhase(true)
    setCreatePhaseError('')
    try {
      const newPhase = await createPhase(token, { ...createPhaseForm, courseId: selectedCourseId })
      setShowCreatePhase(false)
      setCreatePhaseForm({ icon: '📖', name: '', order: 1 })
      setContent((prev) => {
        if (!prev) return prev
        return {
          courses: prev.courses.map((c) =>
            c.id === selectedCourseId ? { ...c, phases: [...c.phases, { ...newPhase, exercises: [], lessons: [] }] } : c
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
        <span className='bg-primary h-2 w-2 animate-pulse rounded-full' />
        <span className='text-fg-subtle animate-pulse text-sm'>Cargando contenido...</span>
      </div>
    )
  }

  if (!currentCourse) {
    return (
      <div className='animate-fade-up space-y-5'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-fg text-base leading-tight font-semibold'>Seleccioná un curso para editar</h3>
            <p className='text-fg-subtle mt-1 text-xs'>Elegí el curso cuyo contenido querés modificar.</p>
          </div>
          <button
            onClick={() => setShowCreateCourse(true)}
            className='shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80'
            style={{ background: 'var(--grad)', boxShadow: '0 2px 8px var(--primary-glow)', color: '#fff' }}
          >
            ➕ Nuevo curso
          </button>
        </div>

        <div className='bg-surface-raised border-line flex items-center gap-2 rounded-xl border px-3 py-2'>
          <span className='text-fg-subtle text-sm'>🔍</span>
          <input
            type='text'
            value={courseSearch}
            onChange={(e) => setCourseSearch(e.target.value)}
            placeholder='Buscar curso...'
            className='text-fg flex-1 bg-transparent text-sm outline-none'
          />
          {courseSearch && (
            <button onClick={() => setCourseSearch('')} className='text-fg-subtle text-xs'>
              ✕
            </button>
          )}
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          {courses
            .filter(
              (c) =>
                courseSearch.trim() === '' ||
                c.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
                c.description?.toLowerCase().includes(courseSearch.toLowerCase())
            )
            .map((c) => {
              const totalLessons = c.phases.reduce((sum, p) => sum + p.lessons.length, 0)
              const totalExercises = c.phases.reduce((sum, p) => sum + (p.exercises as AdminExercise[]).length, 0)
              return (
                <button
                  key={c.id}
                  onClick={() => switchCourse(c.id)}
                  className='w-full overflow-hidden rounded-2xl text-left transition-all hover:scale-[1.01]'
                  style={{
                    background: 'var(--bg-card)',
                    border: `1px solid ${c.color}30`,
                    boxShadow: 'var(--shadow-panel)'
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
                      className='flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl font-serif text-3xl font-normal'
                      style={{ background: `${c.color}25`, border: `1px solid ${c.color}40` }}
                    >
                      <CourseIcon icon={c.icon} className='h-11 w-11' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <div className='text-fg truncate text-base leading-snug font-semibold'>{c.name}</div>
                      <div className='text-fg-subtle text-xs'>
                        {c.phases.length} fase{c.phases.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                    {!c.isDefault && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setConfirmDeleteCourse({ id: c.id, name: c.name })
                        }}
                        className='border-danger-border bg-danger-bg text-danger ml-2 rounded-lg border px-2 py-0.5 text-xs transition-all hover:opacity-80'
                        title='Eliminar curso'
                      >
                        🗑
                      </button>
                    )}
                  </div>
                  <div className='px-5 py-3.5'>
                    {c.description && (
                      <p className='text-fg-subtle mb-3 text-xs leading-relaxed'>
                        {c.description.slice(0, 100)}
                        {c.description.length > 100 ? '…' : ''}
                      </p>
                    )}
                    <div className='flex flex-wrap gap-2'>
                      <span className='text-success rounded-md border border-[rgba(34,197,94,0.18)] bg-[rgba(34,197,94,0.08)] px-2 py-0.5 text-xs'>
                        📖 {totalLessons} lecciones
                      </span>
                      <span className='border-line text-primary bg-primary-glow rounded-md border px-2 py-0.5 text-xs'>
                        💻 {totalExercises} ejercicios
                      </span>
                    </div>
                  </div>
                </button>
              )
            })}
          {courses.filter(
            (c) =>
              courseSearch.trim() === '' ||
              c.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
              c.description?.toLowerCase().includes(courseSearch.toLowerCase())
          ).length === 0 &&
            courseSearch.trim() !== '' && (
              <p className='text-fg-subtle col-span-2 py-6 text-center text-sm'>
                No se encontraron cursos para "{courseSearch}"
              </p>
            )}
        </div>

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
                  <label className='text-fg-subtle mb-1.5 block text-xs font-semibold'>
                    Nombre <span className='text-danger'>*</span>
                  </label>
                  <DarkInput
                    value={createCourseForm.name}
                    onChange={(e) => setCreateCourseForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder='Nombre del curso'
                  />
                </div>
                <div>
                  <label className='text-fg-subtle mb-1.5 block text-xs font-semibold'>
                    Slug (URL) <span className='text-danger'>*</span>
                  </label>
                  <DarkInput
                    value={createCourseForm.slug}
                    onChange={(e) => setCreateCourseForm((f) => ({ ...f, slug: e.target.value }))}
                    placeholder='react-frontend'
                  />
                </div>
                <div className='sm:col-span-2'>
                  <label className='text-fg-subtle mb-1.5 block text-xs font-semibold'>Ícono</label>
                  <IconPicker
                    value={createCourseForm.icon}
                    onChange={(v) => setCreateCourseForm((f) => ({ ...f, icon: v }))}
                  />
                </div>
                <div>
                  <label className='text-fg-subtle mb-1.5 block text-xs font-semibold'>Color (hex)</label>
                  <div className='flex items-center gap-2'>
                    <DarkInput
                      value={createCourseForm.color}
                      onChange={(e) => setCreateCourseForm((f) => ({ ...f, color: e.target.value }))}
                      placeholder='var(--primary)'
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
                  <label className='text-fg-subtle mb-1.5 block text-xs font-semibold'>Orden</label>
                  <input
                    type='number'
                    min={1}
                    value={createCourseForm.order}
                    onChange={(e) => setCreateCourseForm((f) => ({ ...f, order: Number(e.target.value) }))}
                    className='bg-surface text-fg border-line w-full rounded-xl border px-3 py-2 text-sm'
                  />
                </div>
                <div className='sm:col-span-2'>
                  <label className='text-fg-subtle mb-1.5 block text-xs font-semibold'>Descripción</label>
                  <DarkTextarea
                    value={createCourseForm.description}
                    onChange={(e) => setCreateCourseForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder='Descripción del curso...'
                    rows={2}
                  />
                </div>
              </div>
              {createCourseError && <p className='text-danger text-xs'>{createCourseError}</p>}
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
      <div className='flex items-center gap-3'>
        <button
          onClick={backToCourses}
          className='border-hairline text-fg-muted bg-tint flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80'
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
          <div className='text-fg text-sm leading-tight font-semibold'>{currentCourse.name}</div>
          <div className='text-fg-subtle text-xs'>
            {phases.length} fase{phases.length !== 1 ? 's' : ''}
          </div>
        </div>
        <button
          onClick={openCourseEdit}
          className='text-primary border-line bg-primary-glow shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-80'
        >
          ✏️ Editar curso
        </button>
      </div>

      <div className='grid grid-cols-1 items-start gap-5 md:grid-cols-[220px_1fr]'>
        <div className='space-y-1.5'>
          <div className='mb-2 flex items-center justify-between px-1'>
            <div className='flex items-center gap-2'>
              <div className='border-line bg-primary-glow flex h-7 w-7 items-center justify-center rounded-lg border text-sm'>
                ⚡
              </div>
              <span className='text-fg-subtle text-xs font-bold tracking-widest uppercase'>Fases</span>
            </div>
            <button
              onClick={() => {
                setShowCreatePhase(true)
                setCreatePhaseError('')
                setCreatePhaseForm({ icon: '📖', name: '', order: 1 })
              }}
              className='border-success-border bg-success-bg text-success rounded-lg border px-2.5 py-1 text-xs font-bold transition-all hover:opacity-80'
              title='Nueva fase'
            >
              + Nueva
            </button>
          </div>

          {phases.map((p) => {
            const isSelected = selectedPhase === p.id
            const exCount = (p.exercises as AdminExercise[]).length
            const lsCount = p.lessons.length
            const isProtected = !!(p as any).isDefault
            return (
              <div
                key={p.id}
                className='flex items-center gap-0 overflow-hidden rounded-xl transition-all'
                style={
                  isSelected
                    ? {
                        background: 'var(--grad)',
                        boxShadow: '0 4px 12px var(--primary-glow)'
                      }
                    : { background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }
                }
              >
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

                {isSelected && (
                  <div className='flex shrink-0 items-center gap-1 pr-2'>
                    <button
                      onClick={openPhaseEdit}
                      title='Editar fase'
                      className='flex h-7 w-7 items-center justify-center rounded-lg bg-[rgba(255,255,255,0.18)] text-sm transition-all hover:opacity-70'
                    >
                      ✏️
                    </button>
                    {!isProtected && (
                      <button
                        onClick={() => setConfirmDeletePhase({ id: p.dbId!, name: p.name })}
                        title='Eliminar fase'
                        className='flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--danger-border)] text-sm transition-all hover:opacity-70'
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

        <div className='space-y-4'>
          {currentPhase && (
            <div className='flex items-center gap-3 px-1'>
              <div className='border-line bg-primary-glow flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border text-lg'>
                {currentPhase.icon}
              </div>
              <div className='min-w-0 flex-1'>
                <h3 className='text-fg truncate text-sm leading-tight font-semibold'>{currentPhase.name}</h3>
                <p className='text-fg-subtle mt-0.5 text-xs'>
                  Fase {currentPhase.id} · {exercises.length} ejercicio{exercises.length !== 1 ? 's' : ''} ·{' '}
                  {lessons.length} lección{lessons.length !== 1 ? 'es' : ''}
                </p>
              </div>
            </div>
          )}

          <div className='grid grid-cols-2 gap-2'>
            {(['exercises', 'lessons'] as const).map((t) => (
              <button
                key={t}
                onClick={() => switchTab(t)}
                className='rounded-xl py-2.5 text-sm font-bold transition-all'
                style={
                  activeTab === t
                    ? { background: 'var(--grad)', boxShadow: '0 4px 12px var(--primary-glow)', color: '#fff' }
                    : { background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', color: 'var(--text-3)' }
                }
              >
                {t === 'exercises' ? '⚡ Ejercicios' : '📖 Lecciones'}
              </button>
            ))}
          </div>

          {activeTab === 'exercises' && (
            <div className='bg-card border-hairline overflow-hidden rounded-2xl border'>
              <div className='border-hairline flex items-center justify-between border-b px-5 py-4'>
                <div className='flex items-center gap-2'>
                  <div className='border-line bg-primary-glow flex h-7 w-7 items-center justify-center rounded-lg border text-sm'>
                    ⚡
                  </div>
                  <span className='text-fg text-sm font-bold'>
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
                    className='border-success-border bg-success-bg text-success shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition-all hover:opacity-80'
                  >
                    + Agregar
                  </button>
                </div>
              </div>

              {exercises.length === 0 && (
                <div className='text-fg-subtle px-5 py-10 text-center text-sm'>No hay ejercicios en esta fase.</div>
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
                      className='flex items-center gap-3 border-b border-[var(--tint-1)] px-5 py-3 transition-colors hover:bg-white/2'
                    >
                      <TypeBadge type={ex.type} />
                      <div className='min-w-0 flex-1'>
                        <p className='text-fg text-xs leading-relaxed font-medium'>
                          {ex.question.slice(0, 110)}
                          {ex.question.length > 110 ? '…' : ''}
                        </p>
                        <p className='text-fg-subtle mt-0.5 flex items-center gap-1.5 text-xs'>
                          <span className='font-mono'>{ex.id}</span>
                          {ex.isDefault ? (
                            <span title='Ejercicio incluido con el curso. Podés editarlo pero no eliminarlo.'>
                              🔒 Predeterminado
                            </span>
                          ) : (
                            <span className='text-success'>✓ Personalizado</span>
                          )}
                        </p>
                      </div>
                      <div className='flex shrink-0 gap-1.5'>
                        <button
                          onClick={() => startEditEx(ex)}
                          className='text-primary border-line bg-primary-glow rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all'
                        >
                          ✏️
                        </button>
                        {!ex.isDefault && (
                          <button
                            onClick={() => handleDelete({ id: ex.id, question: ex.question })}
                            disabled={deletingId === ex.id}
                            className='border-danger-border bg-danger-bg text-danger rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all'
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

          {activeTab === 'lessons' && (
            <div className='bg-card border-hairline overflow-hidden rounded-2xl border'>
              <div className='border-hairline flex items-center justify-between border-b px-5 py-4'>
                <div className='flex items-center gap-2'>
                  <div className='border-line bg-primary-glow flex h-7 w-7 items-center justify-center rounded-lg border text-sm'>
                    📖
                  </div>
                  <span className='text-fg text-sm font-bold'>
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
                    className='border-success-border bg-success-bg text-success shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition-all hover:opacity-80'
                  >
                    + Agregar
                  </button>
                </div>
              </div>

              {lessons.length === 0 && (
                <div className='text-fg-subtle px-5 py-10 text-center text-sm'>No hay lecciones en esta fase.</div>
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
                    className='flex items-center gap-3 border-b border-[var(--tint-1)] px-5 py-3 transition-colors hover:bg-white/2'
                  >
                    <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[rgba(34,197,94,0.18)] bg-[rgba(34,197,94,0.08)] text-sm'>
                      📄
                    </div>
                    <div className='min-w-0 flex-1'>
                      <p className='text-fg text-sm leading-tight font-semibold'>{lesson.title}</p>
                      <p className='text-fg-subtle mt-0.5 text-xs'>
                        {lesson.blocks.length} bloque{lesson.blocks.length !== 1 ? 's' : ''} ·{' '}
                        <span className='font-mono'>{lesson.id}</span>
                      </p>
                    </div>
                    <div className='flex shrink-0 gap-1.5'>
                      <button
                        onClick={() => startEditLesson(lesson)}
                        className='text-primary border-line bg-primary-glow rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all'
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                        disabled={deletingLessonId === lesson.id}
                        className='border-danger-border bg-danger-bg text-danger rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all'
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
              <label className='text-fg-subtle mb-1.5 block text-xs font-semibold'>
                Nombre <span className='text-danger'>*</span>
              </label>
              <DarkInput
                value={createPhaseForm.name}
                onChange={(e) => setCreatePhaseForm((f) => ({ ...f, name: e.target.value }))}
                placeholder='Nombre de la fase'
              />
            </div>
            <div>
              <label className='text-fg-subtle mb-1.5 block text-xs font-semibold'>Ícono (emoji)</label>
              <DarkInput
                value={createPhaseForm.icon}
                onChange={(e) => setCreatePhaseForm((f) => ({ ...f, icon: e.target.value }))}
                placeholder='📖'
              />
            </div>
            {createPhaseError && <p className='text-danger text-xs'>{createPhaseError}</p>}
            <div className='w-44'>
              <PrimaryBtn onClick={handleCreatePhase} disabled={!createPhaseForm.name.trim() || creatingPhase}>
                {creatingPhase ? 'Creando...' : '➕ Crear fase'}
              </PrimaryBtn>
            </div>
          </div>
        </CourseModal>
      )}

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
              <label className='text-fg-subtle mb-1.5 block text-xs font-semibold'>
                Nombre <span className='text-danger'>*</span>
              </label>
              <DarkInput
                value={phaseForm.name}
                onChange={(e) => setPhaseForm((f) => ({ ...f, name: e.target.value }))}
                placeholder='Nombre de la fase'
              />
            </div>
            <div>
              <label className='text-fg-subtle mb-1.5 block text-xs font-semibold'>Ícono (emoji)</label>
              <DarkInput
                value={phaseForm.icon}
                onChange={(e) => setPhaseForm((f) => ({ ...f, icon: e.target.value }))}
                placeholder='🏗️'
              />
            </div>
            {phaseEditError && <p className='text-danger text-xs'>{phaseEditError}</p>}
            <div className='w-44'>
              <PrimaryBtn onClick={handleSavePhase} disabled={!phaseForm.name.trim() || savingPhase}>
                {savingPhase ? 'Guardando...' : '💾 Guardar fase'}
              </PrimaryBtn>
            </div>
          </div>
        </CourseModal>
      )}

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

      {showCourseEdit && currentCourse && (
        <CourseModal title={`Editar · ${currentCourse.name}`} onClose={() => setShowCourseEdit(false)}>
          <div className='space-y-3 p-5'>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <div>
                <label className='text-fg-subtle mb-1.5 block text-xs font-semibold'>
                  Nombre <span className='text-danger'>*</span>
                </label>
                <DarkInput
                  value={courseForm.name}
                  onChange={(e) => setCourseForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder='Nombre del curso'
                />
              </div>
              <div>
                <label className='text-fg-subtle mb-1.5 block text-xs font-semibold'>
                  Slug (URL) <span className='text-danger'>*</span>
                </label>
                <DarkInput
                  value={courseForm.slug}
                  onChange={(e) => setCourseForm((f) => ({ ...f, slug: e.target.value }))}
                  placeholder='net-backend'
                />
              </div>
              <div className='sm:col-span-2'>
                <label className='text-fg-subtle mb-1.5 block text-xs font-semibold'>Ícono</label>
                <IconPicker value={courseForm.icon} onChange={(v) => setCourseForm((f) => ({ ...f, icon: v }))} />
              </div>
              <div>
                <label className='text-fg-subtle mb-1.5 block text-xs font-semibold'>Color (hex)</label>
                <div className='flex items-center gap-2'>
                  <DarkInput
                    value={courseForm.color}
                    onChange={(e) => setCourseForm((f) => ({ ...f, color: e.target.value }))}
                    placeholder='var(--primary)'
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
                <label className='text-fg-subtle mb-1.5 block text-xs font-semibold'>Orden</label>
                <input
                  type='number'
                  min={1}
                  value={courseForm.order}
                  onChange={(e) => setCourseForm((f) => ({ ...f, order: Number(e.target.value) }))}
                  className='bg-surface text-fg border-line w-full rounded-xl border px-3 py-2 text-sm'
                />
              </div>
              <div className='sm:col-span-2'>
                <label className='text-fg-subtle mb-1.5 block text-xs font-semibold'>Descripción</label>
                <DarkTextarea
                  value={courseForm.description}
                  onChange={(e) => setCourseForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder='Descripción del curso...'
                  rows={2}
                />
              </div>
              <div className='sm:col-span-2'>
                <label className='text-fg-subtle mb-1.5 block text-xs font-semibold'>
                  Cursos recomendados antes{' '}
                  <span className='text-fg-subtle font-normal'>(no restrictivos — solo informativos)</span>
                </label>
                {courses.filter((c) => c.id !== selectedCourseId).length === 0 ? (
                  <p className='text-fg-subtle text-xs'>No hay otros cursos disponibles.</p>
                ) : (
                  <div className='mt-1 flex flex-wrap gap-1.5'>
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
                            className='flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-all'
                            style={
                              isSelected
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
                            <CourseIcon icon={c.icon} size={14} className='shrink-0 rounded' />
                            {c.name}
                            {isSelected && <span className='ml-0.5 font-semibold'>✓</span>}
                          </button>
                        )
                      })}
                  </div>
                )}
              </div>
            </div>
            {courseError && <p className='text-danger text-xs'>{courseError}</p>}
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

      {showAddLessonForm && (
        <ContentModal title='Nueva lección' onClose={() => setShowAddLessonForm(false)}>
          <div className='p-5'>
            <div className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
              <div className='space-y-4'>
                <div>
                  <label className='text-fg-subtle mb-1.5 block text-xs font-semibold'>Título de la lección</label>
                  <DarkInput
                    value={addLessonTitle}
                    onChange={(e) => setAddLessonTitle(e.target.value)}
                    placeholder='Título de la nueva lección'
                  />
                </div>
                <div>
                  <label className='text-fg-subtle mb-2 block text-xs font-semibold'>
                    Contenido · {addLessonBlocks.length} bloque{addLessonBlocks.length !== 1 ? 's' : ''}
                  </label>
                  <LessonBlockEditor blocks={addLessonBlocks} onChange={setAddLessonBlocks} />
                </div>
                {addLessonError && <p className='text-danger text-xs'>{addLessonError}</p>}
                <div className='flex flex-wrap items-center gap-2'>
                  <div className='w-44'>
                    <PrimaryBtn onClick={handleAddLesson} disabled={!addLessonTitle.trim() || addingLesson}>
                      {addingLesson ? 'Guardando...' : '💾 Crear lección'}
                    </PrimaryBtn>
                  </div>
                  <button
                    onClick={() => setShowAddLessonForm(false)}
                    className='text-fg-subtle border-hairline bg-tint rounded-xl border px-4 py-2 text-xs font-semibold transition-all hover:opacity-80'
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

      {editingLessonId && (
        <ContentModal
          title={`Editar lección · ${editLessonTitle || editingLessonId}`}
          onClose={() => setEditingLessonId(null)}
        >
          <div className='p-5'>
            <div className='grid grid-cols-1 gap-6 xl:grid-cols-2'>
              <div className='space-y-4'>
                <div>
                  <label className='text-fg-subtle mb-1.5 block text-xs font-semibold'>Título de la lección</label>
                  <DarkInput
                    value={editLessonTitle}
                    onChange={(e) => setEditLessonTitle(e.target.value)}
                    placeholder='Título de la lección'
                  />
                </div>
                <div>
                  <label className='text-fg-subtle mb-2 block text-xs font-semibold'>
                    Contenido · {editLessonBlocks.length} bloque{editLessonBlocks.length !== 1 ? 's' : ''}
                  </label>
                  <LessonBlockEditor blocks={editLessonBlocks} onChange={setEditLessonBlocks} />
                </div>
                {lessonError && <p className='text-danger text-xs'>{lessonError}</p>}
                <div className='flex flex-wrap items-center gap-2'>
                  <div className='w-44'>
                    <PrimaryBtn onClick={handleUpdateLesson} disabled={!editLessonTitle.trim() || updatingLesson}>
                      {updatingLesson ? 'Guardando...' : '💾 Guardar lección'}
                    </PrimaryBtn>
                  </div>
                  <button
                    onClick={() => setEditingLessonId(null)}
                    className='text-fg-subtle border-hairline bg-tint rounded-xl border px-4 py-2 text-xs font-semibold transition-all'
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
