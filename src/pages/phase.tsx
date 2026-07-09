import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { PhaseScreen } from '@/components/phase'
import { useBoundStore } from '@/hooks'
import { PHASES } from '@/utils/consts/learning-data'

export function Phase() {
  const { id, slug } = useParams<{ id: string; slug?: string }>()
  const navigate = useNavigate()
  const phaseId = Number(id)

  const {
    activeCourseSlug,
    applyGrade,
    contentVersion,
    markLessonRead,
    progress,
    saveExercise,
    studentToken,
    username
  } = useBoundStore(
    useShallow((s) => ({
      activeCourseSlug: s.activeCourseSlug,
      applyGrade: s.applyGrade,
      contentVersion: s.contentVersion,
      markLessonRead: s.markLessonRead,
      progress: s.progress,
      saveExercise: s.saveExercise,
      studentToken: s.studentToken,
      username: s.username
    }))
  )

  const courseSlug = slug ?? activeCourseSlug
  const backPath = courseSlug ? `/cursos/${courseSlug}` : '/cursos'

  if (!username || !studentToken) return <Navigate to='/login' replace />
  if (contentVersion === 0) return <Navigate to='/cursos' replace />
  if (isNaN(phaseId) || !PHASES.find((p) => p.id === phaseId)) return <Navigate to={backPath} replace />

  const nextPhaseId = phaseId + 1
  const handleNextPhase = () => {
    if (nextPhaseId < PHASES.length) {
      navigate(`/cursos/${courseSlug}/fases/${nextPhaseId}`)
    } else {
      navigate(backPath)
    }
  }

  return (
    <PhaseScreen
      key={phaseId}
      phaseId={phaseId}
      progress={progress}
      onAnswer={saveExercise}
      onMarkRead={markLessonRead}
      onBack={() => navigate(backPath)}
      studentToken={studentToken}
      onGrade={applyGrade}
      onNextPhase={handleNextPhase}
    />
  )
}
