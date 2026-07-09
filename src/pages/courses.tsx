import { Navigate, useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { CourseSelectorScreen } from '@/components/learning'
import { useBoundStore } from '@/hooks'

export function Courses() {
  const navigate = useNavigate()

  const { allowedCourseIds, courses, progress, roadmap, username } = useBoundStore(
    useShallow((s) => ({
      allowedCourseIds: s.allowedCourseIds,
      courses: s.courses,
      progress: s.progress,
      roadmap: s.roadmap,
      username: s.username
    }))
  )

  const visibleCourses =
    allowedCourseIds.length === 0 ? courses : courses.filter((c) => allowedCourseIds.includes(c.id))

  // A student enrolled in a single course has no list to choose from.
  if (visibleCourses.length === 1) return <Navigate to={`/cursos/${visibleCourses[0].slug}`} replace />

  return (
    <CourseSelectorScreen
      username={username ?? ''}
      courses={visibleCourses}
      progress={progress}
      hasRoadmap={!!roadmap}
      onRoadmap={() => navigate('/mi-ruta')}
    />
  )
}
