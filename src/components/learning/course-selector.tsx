import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CourseSummary, Progress } from '@/types/learning'
import { CourseIcon } from '@/components/ui'
import { PageHeader, ReadingColumn } from '@/components/layout'
import { ALL_COURSES } from '@/utils/consts/learning-data'

interface CourseSelectorScreenProps {
  username: string
  courses: CourseSummary[]
  progress: Progress
  hasRoadmap: boolean
  onRoadmap: () => void
}

function CourseCard({
  barMounted,
  course,
  courses,
  progress
}: {
  course: CourseSummary
  courses: CourseSummary[]
  progress: Progress
  barMounted: boolean
}) {
  const navigate = useNavigate()

  const cData = ALL_COURSES.find((c) => c.slug === course.slug)
  const courseExercises = cData?.phases.flatMap((p) => p.exercises) ?? []
  const courseLessons = cData?.phases.flatMap((p) => p.lessons) ?? []
  const answeredEx = courseExercises.filter((e) => !!progress[e.id]).length
  const readLs = courseLessons.filter((l) => !!(progress.__lessons || {})[l.id]).length
  const totalItems = courseExercises.length + courseLessons.length
  const pct = totalItems > 0 ? Math.round(((answeredEx + readLs) / totalItems) * 100) : 0
  const isComplete = pct === 100 && totalItems > 0
  const hasProgress = answeredEx > 0 || readLs > 0

  return (
    <button
      onClick={() => navigate(`/cursos/${course.slug}`)}
      className='w-full overflow-hidden rounded-2xl text-left transition-all hover:scale-[1.01]'
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${isComplete ? 'rgba(34,197,94,0.30)' : 'var(--border-subtle)'}`,
        boxShadow: 'var(--shadow-panel)'
      }}
    >
      <div
        className='flex items-center gap-3 px-5 py-4'
        style={{
          background: `linear-gradient(135deg, ${course.color}22 0%, ${course.color}08 100%)`,
          borderBottom: `1px solid ${course.color}20`
        }}
      >
        <div
          className='flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl font-serif text-2xl font-normal'
          style={{ background: `${course.color}25`, border: `1px solid ${course.color}40` }}
        >
          <CourseIcon icon={course.icon} className='h-11 w-11' />
        </div>
        <div className='min-w-0 flex-1'>
          <div className='text-fg truncate text-base leading-snug font-semibold'>{course.name}</div>
          {isComplete && <span className='text-success text-xs font-bold'>✓ Completado</span>}
          {!isComplete && hasProgress && <span className='text-fg-subtle text-xs'>En progreso</span>}
          {!isComplete && !hasProgress && <span className='text-fg-subtle text-xs'>Sin iniciar</span>}
        </div>
        <div className='shrink-0 text-right'>
          <div
            className='font-mono text-xl leading-none font-semibold'
            style={{ color: isComplete ? 'var(--success)' : 'var(--text-1)' }}
          >
            {pct}%
          </div>
        </div>
      </div>

      <div className='px-5 py-4'>
        {course.description && <p className='text-fg-subtle mb-3 text-xs leading-relaxed'>{course.description}</p>}

        {course.prerequisites && course.prerequisites.length > 0 && (
          <div className='mb-3 flex flex-wrap items-center gap-1.5'>
            <span className='text-fg-subtle shrink-0 text-xs'>Antes:</span>
            {course.prerequisites.map((slug) => {
              const prereq = courses.find((c) => c.slug === slug)
              if (!prereq) return null
              return (
                <span
                  key={slug}
                  className='flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-medium'
                  style={{
                    background: `${prereq.color}18`,
                    border: `1px solid ${prereq.color}35`,
                    color: prereq.color
                  }}
                >
                  <CourseIcon icon={prereq.icon} size={12} className='shrink-0 rounded' />
                  {prereq.name}
                </span>
              )
            })}
          </div>
        )}

        <div className='mb-3 flex items-center gap-4'>
          <span className='border-hairline text-fg-muted bg-tint rounded-md border px-2 py-0.5 text-xs'>
            📚 {readLs}/{courseLessons.length} lecciones
          </span>
          <span className='border-hairline text-fg-muted bg-tint rounded-md border px-2 py-0.5 text-xs'>
            💻 {answeredEx}/{courseExercises.length} ejercicios
          </span>
        </div>

        <div className='bg-tint-strong h-1.5 w-full rounded-full'>
          <div
            className='h-1.5 rounded-full'
            style={{
              background: isComplete ? 'var(--success)' : course.color,
              transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
              width: barMounted ? `${pct}%` : '0%'
            }}
          />
        </div>

        <div className='mt-3 text-xs font-bold' style={{ color: isComplete ? 'var(--success)' : course.color }}>
          {isComplete ? '✓ Completado' : hasProgress ? 'Continuar →' : 'Comenzar →'}
        </div>
      </div>
    </button>
  )
}

export function CourseSelectorScreen({
  courses,
  hasRoadmap,
  onRoadmap,
  progress,
  username
}: CourseSelectorScreenProps) {
  const [barMounted, setBarMounted] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setBarMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  const filteredCourses = courses.filter(
    (c) =>
      search.trim() === '' ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
  )

  const totalAnswered = Object.keys(progress).filter((k) => !k.startsWith('__')).length
  const totalLessonsRead = Object.keys(progress.__lessons || {}).length

  return (
    <ReadingColumn width='wide'>
      <PageHeader
        eyebrow='Aprendizaje'
        title='Mis cursos'
        subtitle={`Bienvenido de nuevo, ${username}`}
        actions={
          hasRoadmap && (
            <button
              onClick={onRoadmap}
              className='border-hairline text-fg-muted hover:text-fg rounded border px-3 py-1.5 text-xs font-medium transition-colors'
            >
              Ver mi ruta
            </button>
          )
        }
      />

      <div className='animate-fade-up space-y-6'>
        <div className='stagger grid grid-cols-3 gap-3'>
          <div className='bg-card border-hairline rounded-2xl border p-4 text-center'>
            <div className='text-fg mb-0.5 font-mono font-serif text-2xl font-normal'>{courses.length}</div>
            <div className='text-fg-subtle text-xs'>Cursos activos</div>
          </div>
          <div className='bg-card border-hairline rounded-2xl border p-4 text-center'>
            <div className='text-fg mb-0.5 font-mono font-serif text-2xl font-normal'>{totalAnswered}</div>
            <div className='text-fg-subtle text-xs'>Ejercicios resueltos</div>
          </div>
          <div className='bg-card border-hairline rounded-2xl border p-4 text-center'>
            <div className='text-fg mb-0.5 font-mono font-serif text-2xl font-normal'>{totalLessonsRead}</div>
            <div className='text-fg-subtle text-xs'>Lecciones leídas</div>
          </div>
        </div>

        <div className='space-y-3'>
          <div>
            <h2 className='text-fg text-xl leading-tight font-semibold'>Seleccioná un curso</h2>
            <p className='text-fg-subtle mt-1 text-sm'>Elegí el curso que querés continuar aprendiendo hoy.</p>
          </div>
          <div className='bg-card border-hairline flex items-center gap-2 rounded-xl border px-4 py-2.5'>
            <span className='text-fg-subtle'>🔍</span>
            <input
              type='text'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder='Buscar curso...'
              className='text-fg flex-1 bg-transparent text-sm outline-none'
            />
            {search && (
              <button onClick={() => setSearch('')} className='text-fg-subtle text-sm leading-none'>
                ✕
              </button>
            )}
          </div>
        </div>

        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} courses={courses} progress={progress} barMounted={barMounted} />
          ))}
          {filteredCourses.length === 0 && search.trim() !== '' && (
            <p className='text-fg-subtle col-span-2 py-8 text-center text-sm'>
              No se encontraron cursos para "{search}"
            </p>
          )}
        </div>

        <div className='h-4' />
      </div>
    </ReadingColumn>
  )
}
