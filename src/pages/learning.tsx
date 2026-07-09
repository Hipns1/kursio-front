import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { CourseSelectorScreen, SettingsModal, WelcomeScreen } from '@/components/learning'
import { useBoundStore } from '@/hooks'
import { fetchContent, getRoadmap } from '@/services/backend'

function LoadingScreen() {
  return (
    <div className='bg-surface flex min-h-screen items-center justify-center'>
      <p className='text-fg-subtle animate-pulse text-sm'>Cargando...</p>
    </div>
  )
}

export function Learning() {
  const [hydrated, setHydrated] = useState(false)
  const navigate = useNavigate()

  const {
    allowedCourseIds,
    clearUser,
    contentVersion,
    courses,
    progress,
    roadmap,
    roadmapChecked,
    roadmapMissing,
    setContent,
    setRoadmap,
    setRoadmapChecked,
    setRoadmapMissing,
    setStudentLogin,
    studentToken,
    username
  } = useBoundStore(
    useShallow((s) => ({
      allowedCourseIds: s.allowedCourseIds,
      clearUser: s.clearUser,
      contentVersion: s.contentVersion,
      courses: s.courses,
      progress: s.progress,
      roadmap: s.roadmap,
      roadmapChecked: s.roadmapChecked,
      roadmapMissing: s.roadmapMissing,
      setContent: s.setContent,
      setRoadmap: s.setRoadmap,
      setRoadmapChecked: s.setRoadmapChecked,
      setRoadmapMissing: s.setRoadmapMissing,
      setStudentLogin: s.setStudentLogin,
      studentToken: s.studentToken,
      username: s.username
    }))
  )

  useEffect(() => {
    const unsub = useBoundStore.persist.onFinishHydration(() => setHydrated(true))
    if (useBoundStore.persist.hasHydrated()) setHydrated(true)
    return unsub
  }, [])

  useEffect(() => {
    if (!username || !studentToken || contentVersion > 0) return
    fetchContent(studentToken)
      .then((data) => setContent(data.courses))
      .catch(() => clearUser())
  }, [username, studentToken, contentVersion])

  useEffect(() => {
    if (!username || !studentToken || contentVersion === 0 || roadmapChecked) return
    getRoadmap(studentToken)
      .then((data) => {
        setRoadmap(data)
        setRoadmapChecked(true)
      })
      .catch((err: Error) => {
        setRoadmapChecked(true)
        if (err.message.startsWith('404')) {
          setRoadmapMissing(true)
          navigate('/onboarding', { replace: true })
        }
      })
  }, [username, studentToken, contentVersion, roadmapChecked])

  const [showSettings, setShowSettings] = useState(false)

  const handleEnter = (
    token: string,
    name: string,
    p: import('@/types/learning').Progress,
    aid: number[],
    coursesData: import('@/types/learning').Course[]
  ) => {
    setStudentLogin(token, name, p, aid)
    setContent(coursesData)
  }

  const handleLogout = () => {
    clearUser()
    setShowSettings(false)
  }

  if (!hydrated) return <LoadingScreen />

  if (!username || !studentToken) {
    return <WelcomeScreen onEnter={handleEnter} />
  }

  if (contentVersion === 0 || !roadmapChecked) return <LoadingScreen />

  if (roadmapChecked && roadmapMissing) {
    return <Navigate to='/onboarding' replace />
  }

  const visibleCourses =
    allowedCourseIds.length === 0 ? courses : courses.filter((c) => allowedCourseIds.includes(c.id))

  if (visibleCourses.length === 1) {
    return <Navigate to={`/course/${visibleCourses[0].slug}`} replace />
  }

  return (
    <>
      <div id='global-progress' />
      <CourseSelectorScreen
        username={username}
        courses={visibleCourses}
        progress={progress}
        hasRoadmap={!!roadmap}
        onRoadmap={() => navigate('/roadmap')}
        onSettings={() => setShowSettings(true)}
      />
      {showSettings && (
        <SettingsModal username={username} onLogout={handleLogout} onClose={() => setShowSettings(false)} />
      )}
    </>
  )
}
