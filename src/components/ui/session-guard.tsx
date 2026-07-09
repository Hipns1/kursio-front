import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { useBoundStore } from '@/hooks'
import { validateStudentSession } from '@/services/backend'
import { useToast } from './toast'
import { ForcedLogoutModal } from './forced-logout-modal'

const POLL_MS = 30_000

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const { toast } = useToast()

  const { activeCourseSlug, allowedCourseIds, clearUser, courses, setAllowedCourseIds, studentToken } = useBoundStore(
    useShallow((s) => ({
      activeCourseSlug: s.activeCourseSlug,
      allowedCourseIds: s.allowedCourseIds,
      clearUser: s.clearUser,
      courses: s.courses,
      setAllowedCourseIds: s.setAllowedCourseIds,
      studentToken: s.studentToken
    }))
  )

  const [forcedLogout, setForcedLogout] = useState<'disabled' | 'deleted' | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stateRef = useRef({ activeCourseSlug, allowedCourseIds, courses })
  useEffect(() => {
    stateRef.current = { activeCourseSlug, allowedCourseIds, courses }
  })

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    if (!studentToken) return

    const check = async () => {
      try {
        const result = await validateStudentSession(studentToken)
        const newIds = result.allowedCourseIds
        setAllowedCourseIds(newIds)

        const { activeCourseSlug: slug, courses: courseList } = stateRef.current
        if (slug && newIds.length > 0 && courseList.length > 0) {
          const active = courseList.find((c) => c.slug === slug)
          if (active && !newIds.includes(active.id)) {
            toast('Ya no tenés acceso a este curso.', 'warning')
            navigate('/login')
          }
        }
      } catch (e) {
        const msg = (e as Error).message ?? ''
        if (msg.startsWith('403')) setForcedLogout('disabled')
        else if (msg.startsWith('401')) setForcedLogout('deleted')
      }
    }

    check()
    pollRef.current = setInterval(check, POLL_MS)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [studentToken])

  const handleDone = () => {
    clearUser()
    setForcedLogout(null)
  }

  return (
    <>
      {children}
      {forcedLogout && <ForcedLogoutModal reason={forcedLogout} onDone={handleDone} />}
    </>
  )
}
