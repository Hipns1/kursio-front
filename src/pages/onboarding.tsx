import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { useBoundStore } from '@/hooks'
import { OnboardingScreen } from '@/components/learning/onboarding-screen'
import type { StudentRoadmapResult } from '@/types/learning'

export function Onboarding() {
  const navigate = useNavigate()

  const { setRoadmap, setRoadmapChecked, studentToken, username } = useBoundStore(
    useShallow((s) => ({
      setRoadmap: s.setRoadmap,
      setRoadmapChecked: s.setRoadmapChecked,
      studentToken: s.studentToken,
      username: s.username
    }))
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
