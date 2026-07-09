import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { useBoundStore } from '@/hooks'
import { OnboardingScreen } from '@/components/learning/onboarding-screen'
import type { StudentRoadmapResult } from '@/types/learning'

export function Onboarding() {
  const navigate = useNavigate()

  const { username, studentToken, setRoadmap, setRoadmapChecked } = useBoundStore(
    useShallow((s) => ({
      username: s.username,
      studentToken: s.studentToken,
      setRoadmap: s.setRoadmap,
      setRoadmapChecked: s.setRoadmapChecked,
    })),
  )

  useEffect(() => {
    if (!username || !studentToken) navigate('/', { replace: true })
  }, [username, studentToken, navigate])

  if (!username || !studentToken) return null

  const handleComplete = (roadmap: StudentRoadmapResult) => {
    setRoadmap(roadmap)
    setRoadmapChecked(true)
    navigate('/roadmap', { replace: true })
  }

  return <OnboardingScreen token={studentToken} onComplete={handleComplete} />
}
