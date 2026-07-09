import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { useBoundStore } from '@/hooks'
import { RoadmapScreen } from '@/components/learning/roadmap-screen'

export function Roadmap() {
  const navigate = useNavigate()

  const { courses, roadmap, studentToken, username } = useBoundStore(
    useShallow((s) => ({
      courses: s.courses,
      roadmap: s.roadmap,
      studentToken: s.studentToken,
      username: s.username
    }))
  )

  useEffect(() => {
    if (!username || !studentToken) navigate('/', { replace: true })
    else if (!roadmap) navigate('/', { replace: true })
  }, [username, studentToken, roadmap, navigate])

  if (!username || !studentToken || !roadmap) return null

  return <RoadmapScreen roadmap={roadmap} courses={courses} onBack={() => navigate('/', { replace: true })} />
}
