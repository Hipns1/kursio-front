import type { CourseSummary, RoadmapCourseItem, StudentRoadmapResult } from '@/types/learning'
import { CourseIcon } from '@/components/ui'

interface Props {
  roadmap: StudentRoadmapResult
  courses: CourseSummary[]
  onBack: () => void
}

const PRIORITY_LABELS: Record<number, { label: string; color: string; bg: string }> = {
  1: { label: 'Empezar aquí', color: '#a9dc76', bg: 'rgba(169,220,118,0.10)' },
  2: { label: 'Siguiente paso', color: '#78dce8', bg: 'rgba(120,220,232,0.10)' },
  3: { label: 'Nivel avanzado', color: '#ab9df2', bg: 'rgba(171,157,242,0.10)' },
}

function getPriorityInfo(priority: number) {
  return PRIORITY_LABELS[priority] ?? { label: `Prioridad ${priority}`, color: '#ffd866', bg: 'rgba(255,216,102,0.10)' }
}

function WeeksEstimate({ weeks }: { weeks: number }) {
  const months = Math.floor(weeks / 4)
  const remWeeks = weeks % 4
  const parts: string[] = []
  if (months > 0) parts.push(`${months} ${months === 1 ? 'mes' : 'meses'}`)
  if (remWeeks > 0) parts.push(`${remWeeks} ${remWeeks === 1 ? 'semana' : 'semanas'}`)
  return <>{parts.join(' y ')}</>
}

interface RoadmapCardProps {
  item: RoadmapCourseItem
  course: CourseSummary | undefined
  index: number
  isLast: boolean
}

function RoadmapCard({ item, course, index, isLast }: RoadmapCardProps) {
  const { label, color, bg } = getPriorityInfo(item.priority)
  const stepNum = index + 1

  return (
    <div className="flex gap-4">
      {/* Timeline column */}
      <div className="flex flex-col items-center" style={{ width: '40px', flexShrink: 0 }}>
        {/* Circle */}
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-black text-sm shadow-lg"
          style={{
            background: item.priority === 1 ? 'var(--grad)' : bg,
            color: item.priority === 1 ? '#fff' : color,
            border: `2px solid ${color}`,
            boxShadow: item.priority === 1 ? `0 0 0 4px ${color}22` : 'none',
          }}
        >
          {stepNum}
        </div>
        {/* Connector */}
        {!isLast && (
          <div
            className="mt-1 flex-1"
            style={{
              width: '2px',
              minHeight: '32px',
              background: `linear-gradient(to bottom, ${color}60, transparent)`,
            }}
          />
        )}
      </div>

      {/* Card */}
      <div
        className="mb-4 flex-1 overflow-hidden rounded-2xl p-5 transition-all duration-200 hover:scale-[1.01]"
        style={{
          background: 'var(--bg-card)',
          border: `1px solid ${color}30`,
          boxShadow: item.priority === 1 ? `0 4px 24px ${color}18` : 'none',
        }}
      >
        <div className="flex items-start gap-3">
          {/* Course icon */}
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
            style={{
              background: course ? course.color + '22' : bg,
              border: `1px solid ${course ? course.color + '40' : color + '30'}`,
            }}
          >
            {course ? (
              <CourseIcon icon={course.icon} size={22} className="rounded" />
            ) : (
              <span className="text-lg">📚</span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3
                className="font-black text-base leading-tight"
                style={{ color: 'var(--text-1)' }}
              >
                {course?.name ?? item.slug}
              </h3>
              <span
                className="rounded-full px-2.5 py-0.5 text-xs font-bold"
                style={{ background: bg, color, border: `1px solid ${color}30` }}
              >
                {label}
              </span>
            </div>

            {course?.description && (
              <p className="text-xs mb-2 line-clamp-2" style={{ color: 'var(--text-3)' }}>
                {course.description}
              </p>
            )}

            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
              {item.reason}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function RoadmapScreen({ roadmap, courses, onBack }: Props) {
  const sorted = [...roadmap.courses].sort((a, b) => a.priority - b.priority)

  const getCourse = (slug: string) => courses.find((c) => c.slug === slug)

  const priorityGroups = sorted.reduce<Record<number, RoadmapCourseItem[]>>((acc, item) => {
    if (!acc[item.priority]) acc[item.priority] = []
    acc[item.priority].push(item)
    return acc
  }, {})

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-base)' }}>
      {/* Header */}
      <div
        className="sticky top-0 z-10"
        style={{
          background: 'var(--nav-bg)',
          borderBottom: '1px solid var(--border-subtle)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-3">
          <button
            onClick={onBack}
            className="rounded-xl px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-70"
            style={{
              background: 'var(--bg-card)',
              color: 'var(--text-3)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            ← Volver
          </button>
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl text-base"
              style={{ background: 'var(--grad)', boxShadow: '0 4px 12px var(--primary-glow)' }}
            >
              🗺️
            </div>
            <div>
              <p className="font-bold text-xs" style={{ color: 'var(--text-1)' }}>Mi Roadmap</p>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                {sorted.length} cursos · <WeeksEstimate weeks={roadmap.estimatedWeeks} />
              </p>
            </div>
          </div>
          <div style={{ width: '80px' }} />
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-8">
        {/* Profile summary card */}
        <div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {/* Decorative glow */}
          <div
            className="pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full opacity-20"
            style={{ background: 'var(--grad)', filter: 'blur(40px)' }}
          />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-2xl text-xl"
                style={{ background: 'rgba(171,157,242,0.15)', border: '1px solid rgba(171,157,242,0.3)' }}
              >
                🤖
              </div>
              <div>
                <p className="font-black text-sm" style={{ color: 'var(--text-1)' }}>Análisis de tu perfil</p>
                <p className="text-xs" style={{ color: 'var(--text-3)' }}>Generado por IA · personalizado para ti</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
              {roadmap.profileSummary}
            </p>

            {/* Stats row */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { label: 'Cursos', value: sorted.length, color: '#ab9df2', icon: '📚' },
                { label: 'Estimado', value: `${roadmap.estimatedWeeks}w`, color: '#78dce8', icon: '⏱️' },
                { label: 'Por donde empezar', value: priorityGroups[1]?.length ?? 0, color: '#a9dc76', icon: '🚀' },
              ].map(({ label, value, color, icon }) => (
                <div
                  key={label}
                  className="rounded-xl p-3 text-center"
                  style={{ background: `${color}10`, border: `1px solid ${color}20` }}
                >
                  <div className="text-base mb-1">{icon}</div>
                  <div className="font-mono font-black text-lg leading-none mb-0.5" style={{ color }}>
                    {value}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-3)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Phase legend */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(PRIORITY_LABELS).map(([p, { label, color, bg }]) => (
            <span
              key={p}
              className="rounded-full px-3 py-1 text-xs font-semibold"
              style={{ background: bg, color, border: `1px solid ${color}30` }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* Roadmap timeline */}
        <div>
          <h2 className="font-black text-lg mb-5" style={{ color: 'var(--text-1)' }}>
            Tu camino de aprendizaje
          </h2>
          <div>
            {sorted.map((item, i) => (
              <RoadmapCard
                key={item.slug}
                item={item}
                course={getCourse(item.slug)}
                index={i}
                isLast={i === sorted.length - 1}
              />
            ))}
          </div>
        </div>

        {/* CTA */}
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="text-3xl mb-3">🎯</div>
          <h3 className="font-black text-base mb-2" style={{ color: 'var(--text-1)' }}>
            ¡Listo para empezar!
          </h3>
          <p className="text-sm mb-5" style={{ color: 'var(--text-3)' }}>
            Comienza con el primer curso de tu roadmap y avanza a tu ritmo.
          </p>
          <button
            onClick={onBack}
            className="rounded-xl px-8 py-3 text-sm font-bold transition-all hover:opacity-90"
            style={{
              background: 'var(--grad)',
              color: '#fff',
              boxShadow: '0 4px 14px var(--primary-glow)',
            }}
          >
            Ir a mis cursos →
          </button>
        </div>
      </div>
    </div>
  )
}
