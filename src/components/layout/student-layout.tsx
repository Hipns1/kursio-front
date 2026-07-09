import { useEffect, useState } from 'react'
import { Link, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { SettingsModal } from '@/components/learning'
import { ThemeToggle } from '@/components/ui'
import { useBoundStore } from '@/hooks'
import { fetchContent, getRoadmap } from '@/services/backend'
import { Brand } from './brand'
import { TopBar, TopBarButton } from './top-bar'

function LoadingScreen() {
  return (
    <div className='bg-surface flex min-h-screen items-center justify-center'>
      <p className='text-fg-subtle animate-pulse text-sm'>Cargando...</p>
    </div>
  )
}

export function StudentLayout() {
  const navigate = useNavigate()
  const [hydrated, setHydrated] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const {
    clearUser,
    contentVersion,
    roadmap,
    roadmapChecked,
    roadmapMissing,
    setContent,
    setRoadmap,
    setRoadmapChecked,
    setRoadmapMissing,
    studentToken,
    username
  } = useBoundStore(
    useShallow((s) => ({
      clearUser: s.clearUser,
      contentVersion: s.contentVersion,
      roadmap: s.roadmap,
      roadmapChecked: s.roadmapChecked,
      roadmapMissing: s.roadmapMissing,
      setContent: s.setContent,
      setRoadmap: s.setRoadmap,
      setRoadmapChecked: s.setRoadmapChecked,
      setRoadmapMissing: s.setRoadmapMissing,
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
        if (err.message.startsWith('404')) setRoadmapMissing(true)
      })
  }, [username, studentToken, contentVersion, roadmapChecked])

  if (!hydrated) return <LoadingScreen />
  if (!username || !studentToken) return <Navigate to='/login' replace />
  if (contentVersion === 0 || !roadmapChecked) return <LoadingScreen />
  if (roadmapMissing) return <Navigate to='/onboarding' replace />

  const handleLogout = () => {
    clearUser()
    setShowSettings(false)
    navigate('/login', { replace: true })
  }

  return (
    <div className='bg-surface min-h-screen'>
      <div id='global-progress' />
      <TopBar
        actions={
          <>
            {roadmap && (
              <Link
                to='/mi-ruta'
                className='border-hairline text-fg-muted hover:text-fg hidden rounded border px-2.5 py-1.5 text-xs font-medium transition-colors sm:inline-block'
              >
                Mi ruta
              </Link>
            )}
            <ThemeToggle />
            <TopBarButton onClick={() => setShowSettings(true)} title={username}>
              {username}
            </TopBarButton>
          </>
        }
      >
        <Brand subtitle='Aprendizaje' />
      </TopBar>

      <Outlet />

      {showSettings && (
        <SettingsModal username={username} onLogout={handleLogout} onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}
