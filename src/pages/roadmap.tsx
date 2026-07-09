import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { useBoundStore } from '@/hooks'
import { RoadmapScreen } from '@/components/learning/roadmap-screen'

export function Roadmap() {
  const navigate = useNavigate()

  const { username, studentToken, roadmap, courses } = useBoundStore(
    useShallow((s) => ({
      username: s.username,
      studentToken: s.studentToken,
      roadmap: s.roadmap,
      courses: s.courses,
    })),
  )

  useEffect(() => {
    if (!username || !studentToken) navigate('/', { replace: true })
    else if (!roadmap) navigate('/', { replace: true })
  }, [username, studentToken, roadmap, navigate])

  if (!username || !studentToken || !roadmap) return null

  return (
    <RoadmapScreen
      roadmap={roadmap}
      courses={courses}
      onBack={() => navigate('/', { replace: true })}
    />
  )
}
