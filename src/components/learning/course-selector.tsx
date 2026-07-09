import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { CourseSummary, Progress } from '@/types/learning'
import { CourseIcon, ThemeToggle } from '@/components/ui'
import { ALL_COURSES } from '@/utils/consts/learning-data'

interface CourseSelectorScreenProps {
  username: string
  courses: CourseSummary[]
  progress: Progress
  hasRoadmap: boolean
  onRoadmap: () => void
  onSettings: () => void
}

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm shrink-0 select-none"
      style={{ background: 'var(--grad)', color: '#fff' }}
    >
      {initials || '?'}
    </div>
  )
}

function CourseCard({
  course,
  courses,
  progress,
  barMounted,
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
      onClick={() => navigate(`/course/${course.slug}`)}
      className="w-full text-left rounded-2xl overflow-hidden transition-all hover:scale-[1.01]"
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${isComplete ? 'rgba(34,197,94,0.30)' : 'var(--border-subtle)'}`,
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Color header */}
      <div
        className="px-5 py-4 flex items-center gap-3"
        style={{ background: `linear-gradient(135deg, ${course.color}22 0%, ${course.color}08 100%)`, borderBottom: `1px solid ${course.color}20` }}
      >
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 overflow-hidden"
          style={{ background: `${course.color}25`, border: `1px solid ${course.color}40` }}
        >
          <CourseIcon icon={course.icon} className="w-11 h-11" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="font-black text-base leading-snug truncate" style={{ color: 'var(--text-1)' }}>
            {course.name}
          </div>
          {isComplete && (
            <span
              className="text-xs font-bold"
              style={{ color: '#22c55e' }}
            >
              ✓ Completado
            </span>
          )}
          {!isComplete && hasProgress && (
            <span className="text-xs" style={{ color: 'var(--text-3)' }}>En progreso</span>
          )}
          {!isComplete && !hasProgress && (
            <span className="text-xs" style={{ color: 'var(--text-3)' }}>Sin iniciar</span>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="font-black text-xl font-mono leading-none" style={{ color: isComplete ? '#22c55e' : 'var(--text-1)' }}>
            {pct}%
          </div>
        </div>
      </div>

      {/* Stats + progress */}
      <div className="px-5 py-4">
        {course.description && (
          <p className="text-xs mb-3 leading-relaxed" style={{ color: 'var(--text-3)' }}>
            {course.description}
          </p>
        )}

        {course.prerequisites && course.prerequisites.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5 items-center">
            <span className="text-xs shrink-0" style={{ color: 'var(--text-3)' }}>Antes:</span>
            {course.prerequisites.map((slug) => {
              const prereq = courses.find((c) => c.slug === slug)
              if (!prereq) return null
              return (
                <span
                  key={slug}
                  className="text-xs px-1.5 py-0.5 rounded-md font-medium flex items-center gap-1"
                  style={{ background: `${prereq.color}18`, border: `1px solid ${prereq.color}35`, color: prereq.color }}
                >
                  <CourseIcon icon={prereq.icon} size={12} className="rounded shrink-0" />
                  {prereq.name}
                </span>
              )
            })}
          </div>
        )}

        <div className="flex items-center gap-4 mb-3">
          <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: 'var(--text-2)' }}>
            📚 {readLs}/{courseLessons.length} lecciones
          </span>
          <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', color: 'var(--text-2)' }}>
            💻 {answeredEx}/{courseExercises.length} ejercicios
          </span>
        </div>

        <div className="w-full h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-1.5 rounded-full"
            style={{
              width: barMounted ? `${pct}%` : '0%',
              background: isComplete ? '#22c55e' : course.color,
              transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          />
        </div>

        <div className="mt-3 text-xs font-bold" style={{ color: isComplete ? '#22c55e' : course.color }}>
          {isComplete ? '✓ Completado' : hasProgress ? 'Continuar →' : 'Comenzar →'}
        </div>
      </div>
    </button>
  )
}

export function CourseSelectorScreen({
  username,
  courses,
  progress,
  hasRoadmap,
  onRoadmap,
  onSettings,
}: CourseSelectorScreenProps) {
  const [barMounted, setBarMounted] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setBarMounted(true), 100)
    return () => clearTimeout(t)
  }, [])

  const filteredCourses = courses.filter((c) =>
    search.trim() === '' ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  )

  const totalAnswered = Object.keys(progress).filter((k) => !k.startsWith('__')).length
  const totalLessonsRead = Object.keys(progress.__lessons || {}).length

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* ── Nav ── */}
      <nav
        className="sticky top-0 z-10 px-5 py-4 flex items-center justify-between"
        style={{
          background: 'var(--nav-bg)',
          borderBottom: '1px solid var(--border-subtle)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div>
          <div className="font-black text-lg leading-tight" style={{ color: 'var(--text-1)' }}>
            Mis Cursos
          </div>
          <div className="text-xs" style={{ color: 'var(--text-3)' }}>
            Bienvenido de nuevo, {username}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {hasRoadmap && (
            <button
              onClick={onRoadmap}
              title="Mi Roadmap"
              className="flex items-center gap-1.5 rounded-lg px-3 h-9 text-xs font-bold transition-all hover:opacity-80"
              style={{
                background: 'var(--grad)',
                color: '#fff',
                boxShadow: '0 2px 8px var(--primary-glow)',
              }}
            >
              🗺️ Roadmap
            </button>
          )}
          <button
            onClick={onSettings}
            title="Configuración"
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:opacity-70"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)' }}
          >
            ⚙️
          </button>
          <UserAvatar name={username} />
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6 animate-fade-up">
        {/* ── Summary strip ── */}
        <div className="grid grid-cols-3 gap-3 stagger">
          <div
            className="rounded-2xl p-4 text-center"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="font-black text-2xl font-mono mb-0.5" style={{ color: 'var(--text-1)' }}>{courses.length}</div>
            <div className="text-xs" style={{ color: 'var(--text-3)' }}>Cursos activos</div>
          </div>
          <div
            className="rounded-2xl p-4 text-center"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="font-black text-2xl font-mono mb-0.5" style={{ color: 'var(--text-1)' }}>{totalAnswered}</div>
            <div className="text-xs" style={{ color: 'var(--text-3)' }}>Ejercicios resueltos</div>
          </div>
          <div
            className="rounded-2xl p-4 text-center"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="font-black text-2xl font-mono mb-0.5" style={{ color: 'var(--text-1)' }}>{totalLessonsRead}</div>
            <div className="text-xs" style={{ color: 'var(--text-3)' }}>Lecciones leídas</div>
          </div>
        </div>

        {/* ── Heading + search ── */}
        <div className="space-y-3">
          <div>
            <h2 className="font-black text-xl leading-tight" style={{ color: 'var(--text-1)' }}>
              Seleccioná un curso
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--text-3)' }}>
              Elegí el curso que querés continuar aprendiendo hoy.
            </p>
          </div>
          <div
            className="flex items-center gap-2 rounded-xl px-4 py-2.5"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
          >
            <span style={{ color: 'var(--text-3)' }}>🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar curso..."
              className="flex-1 bg-transparent text-sm outline-none"
              style={{ color: 'var(--text-1)' }}
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-sm leading-none" style={{ color: 'var(--text-3)' }}>
                ✕
              </button>
            )}
          </div>
        </div>

        {/* ── Course grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} courses={courses} progress={progress} barMounted={barMounted} />
          ))}
          {filteredCourses.length === 0 && search.trim() !== '' && (
            <p className="col-span-2 py-8 text-center text-sm" style={{ color: 'var(--text-3)' }}>
              No se encontraron cursos para "{search}"
            </p>
          )}
        </div>

        <div className="h-4" />
      </div>
    </div>
  )
}
