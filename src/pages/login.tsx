import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import type { Course, Progress } from '@/types/learning'
import { WelcomeScreen } from '@/components/learning'
import { useBoundStore } from '@/hooks'

export function Login() {
  const navigate = useNavigate()
  const [hydrated, setHydrated] = useState(false)
  const studentToken = useBoundStore((s) => s.studentToken)
  const setStudentLogin = useBoundStore((s) => s.setStudentLogin)
  const setContent = useBoundStore((s) => s.setContent)

  useEffect(() => {
    const unsub = useBoundStore.persist.onFinishHydration(() => setHydrated(true))
    if (useBoundStore.persist.hasHydrated()) setHydrated(true)
    return unsub
  }, [])

  if (!hydrated) return null
  if (studentToken) return <Navigate to='/cursos' replace />

  const handleEnter = (
    token: string,
    name: string,
    progress: Progress,
    allowedCourseIds: number[],
    courses: Course[]
  ) => {
    setStudentLogin(token, name, progress, allowedCourseIds)
    setContent(courses)
    navigate('/cursos', { replace: true })
  }

  return <WelcomeScreen onEnter={handleEnter} />
}
