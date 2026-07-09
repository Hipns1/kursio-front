import type { CourseSummary } from '@/services/backend'
import { CourseIcon } from '@/components/ui'

export function CoursesPill({
  allowedCourseIds,
  compact = false,
  courses
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
      <span className='text-primary border-line bg-primary-glow rounded-md border px-2 py-0.5 text-xs font-semibold'>
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
              style={{ background: c.color + '18', border: `1px solid ${c.color}30`, color: c.color }}
            >
              <CourseIcon icon={c.icon} size={14} className='rounded' />
            </span>
          )
        })}
        {rest > 0 && (
          <span className='text-fg-subtle border-hairline bg-tint-strong rounded-md border px-1.5 py-0.5 text-xs font-semibold'>
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
            style={{ background: c.color + '18', border: `1px solid ${c.color}30`, color: c.color }}
          >
            <CourseIcon icon={c.icon} size={14} className='rounded' />
            {c.name}
          </span>
        )
      })}
    </div>
  )
}
