import type { CourseSummary, RoadmapCourseItem, StudentRoadmapResult } from '@/types/learning'
import { CourseIcon } from '@/components/ui'

interface Props {
  roadmap: StudentRoadmapResult
  courses: CourseSummary[]
  onBack: () => void
}

const PRIORITY_LABELS: Record<number, { label: string; color: string; bg: string }> = {
  1: { bg: 'var(--success-bg)', color: 'var(--success)', label: 'Empezar aquí' },
  2: { bg: 'var(--accent-glow)', color: 'var(--accent)', label: 'Siguiente paso' },
  3: { bg: 'var(--primary-glow)', color: 'var(--primary)', label: 'Nivel avanzado' }
}

function getPriorityInfo(priority: number) {
  return (
    PRIORITY_LABELS[priority] ?? { bg: 'var(--warning-bg)', color: 'var(--warning)', label: `Prioridad ${priority}` }
  )
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

function RoadmapCard({ course, index, isLast, item }: RoadmapCardProps) {
  const { bg, color, label } = getPriorityInfo(item.priority)
  const stepNum = index + 1

  return (
    <div className='flex gap-4'>
      <div className='flex flex-col items-center' style={{ flexShrink: 0, width: '40px' }}>
        <div
          className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold shadow-lg'
          style={{
            background: item.priority === 1 ? 'var(--grad)' : bg,
            border: `2px solid ${color}`,
            boxShadow: item.priority === 1 ? `0 0 0 4px ${color}22` : 'none',
            color: item.priority === 1 ? '#fff' : color
          }}
        >
          {stepNum}
        </div>
        {!isLast && (
          <div
            className='mt-1 flex-1'
            style={{
              background: `linear-gradient(to bottom, ${color}60, transparent)`,
              minHeight: '32px',
              width: '2px'
            }}
          />
        )}
      </div>

      <div
        className='mb-4 flex-1 overflow-hidden rounded-2xl p-5 transition-all duration-200 hover:scale-[1.01]'
        style={{
          background: 'var(--bg-card)',
          border: `1px solid ${color}30`,
          boxShadow: item.priority === 1 ? `0 4px 24px ${color}18` : 'none'
        }}
      >
        <div className='flex items-start gap-3'>
          <div
            className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl'
            style={{
              background: course ? course.color + '22' : bg,
              border: `1px solid ${course ? course.color + '40' : color + '30'}`
            }}
          >
            {course ? (
              <CourseIcon icon={course.icon} size={22} className='rounded' />
            ) : (
              <span className='text-lg'>📚</span>
            )}
          </div>

          <div className='min-w-0 flex-1'>
            <div className='mb-1 flex flex-wrap items-center gap-2'>
              <h3 className='text-fg text-base leading-tight font-semibold'>{course?.name ?? item.slug}</h3>
              <span
                className='rounded-full px-2.5 py-0.5 text-xs font-bold'
                style={{ background: bg, border: `1px solid ${color}30`, color }}
              >
                {label}
              </span>
            </div>

            {course?.description && <p className='text-fg-subtle mb-2 line-clamp-2 text-xs'>{course.description}</p>}

            <p className='text-fg-muted text-sm leading-relaxed'>{item.reason}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function RoadmapScreen({ courses, onBack, roadmap }: Props) {
  const sorted = [...roadmap.courses].sort((a, b) => a.priority - b.priority)

  const getCourse = (slug: string) => courses.find((c) => c.slug === slug)

  const priorityGroups = sorted.reduce<Record<number, RoadmapCourseItem[]>>((acc, item) => {
    if (!acc[item.priority]) acc[item.priority] = []
    acc[item.priority].push(item)
    return acc
  }, {})

  return (
    <div className='bg-surface min-h-screen'>
      <div className='bg-nav border-hairline sticky top-0 z-10 border-b backdrop-blur-[12px]'>
        <div className='mx-auto flex max-w-2xl items-center justify-between gap-4 px-4 py-3'>
          <button
            onClick={onBack}
            className='bg-card text-fg-subtle border-hairline rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-70'
          >
            ← Volver
          </button>
          <div className='flex items-center gap-2'>
            <div
              className='flex h-8 w-8 items-center justify-center rounded-xl text-base'
              style={{ background: 'var(--grad)', boxShadow: '0 4px 12px var(--primary-glow)' }}
            >
              🗺️
            </div>
            <div>
              <p className='text-fg text-xs font-bold'>Mi Roadmap</p>
              <p className='text-fg-subtle text-xs'>
                {sorted.length} cursos · <WeeksEstimate weeks={roadmap.estimatedWeeks} />
              </p>
            </div>
          </div>
          <div className='w-20' />
        </div>
      </div>

      <div className='mx-auto max-w-2xl space-y-8 px-4 py-8'>
        <div className='bg-card border-hairline relative overflow-hidden rounded-2xl border p-6'>
          <div
            className='pointer-events-none absolute -top-12 -right-12 h-40 w-40 rounded-full opacity-20'
            style={{ background: 'var(--grad)', filter: 'blur(40px)' }}
          />
          <div className='relative'>
            <div className='mb-4 flex items-center gap-3'>
              <div className='border-line bg-primary-glow flex h-10 w-10 items-center justify-center rounded-2xl border text-xl'>
                🤖
              </div>
              <div>
                <p className='text-fg text-sm font-semibold'>Análisis de tu perfil</p>
                <p className='text-fg-subtle text-xs'>Generado por IA · personalizado para ti</p>
              </div>
            </div>
            <p className='text-fg-muted text-sm leading-relaxed'>{roadmap.profileSummary}</p>

            <div className='mt-5 grid grid-cols-3 gap-3'>
              {[
                { color: 'var(--primary)', icon: '📚', label: 'Cursos', value: sorted.length },
                { color: 'var(--accent)', icon: '⏱️', label: 'Estimado', value: `${roadmap.estimatedWeeks}w` },
                {
                  color: 'var(--success)',
                  icon: '🚀',
                  label: 'Por donde empezar',
                  value: priorityGroups[1]?.length ?? 0
                }
              ].map(({ color, icon, label, value }) => (
                <div
                  key={label}
                  className='rounded-xl p-3 text-center'
                  style={{ background: `${color}10`, border: `1px solid ${color}20` }}
                >
                  <div className='mb-1 text-base'>{icon}</div>
                  <div className='mb-0.5 font-mono text-lg leading-none font-semibold' style={{ color }}>
                    {value}
                  </div>
                  <div className='text-fg-subtle text-xs'>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className='flex flex-wrap gap-2'>
          {Object.entries(PRIORITY_LABELS).map(([p, { bg, color, label }]) => (
            <span
              key={p}
              className='rounded-full px-3 py-1 text-xs font-semibold'
              style={{ background: bg, border: `1px solid ${color}30`, color }}
            >
              {label}
            </span>
          ))}
        </div>

        <div>
          <h2 className='text-fg mb-5 text-lg font-semibold'>Tu camino de aprendizaje</h2>
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

        <div className='bg-card border-hairline rounded-2xl border p-6 text-center'>
          <div className='mb-3 font-serif text-3xl font-normal'>🎯</div>
          <h3 className='text-fg mb-2 text-base font-semibold'>¡Listo para empezar!</h3>
          <p className='text-fg-subtle mb-5 text-sm'>Comienza con el primer curso de tu roadmap y avanza a tu ritmo.</p>
          <button
            onClick={onBack}
            className='rounded-xl px-8 py-3 text-sm font-bold transition-all hover:opacity-90'
            style={{
              background: 'var(--grad)',
              boxShadow: '0 4px 14px var(--primary-glow)',
              color: '#fff'
            }}
          >
            Ir a mis cursos →
          </button>
        </div>
      </div>
    </div>
  )
}
