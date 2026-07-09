import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import { ScoresView } from '@/components/course-scores'
import { PageHeader, ReadingColumn } from '@/components/layout'
import { useBoundStore } from '@/hooks'
import { getGlobalAvgScore, isTheoryComplete } from '@/utils/helpers/learning'
import { ALL_COURSES } from '@/utils/consts/learning-data'
import { gradeExercise } from '@/services/backend'
import type { Exercise, ExerciseRecord } from '@/types/learning'

export function CourseScores() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const { applyGrade, contentVersion, courses, progress, studentToken, username } = useBoundStore(
    useShallow((s) => ({
      applyGrade: s.applyGrade,
      contentVersion: s.contentVersion,
      courses: s.courses,
      progress: s.progress,
      studentToken: s.studentToken,
      username: s.username
    }))
  )

  const [batchGrading, setBatchGrading] = useState(false)
  const [batchDone, setBatchDone] = useState(0)

  if (!username || !studentToken) return <Navigate to='/' replace />
  if (contentVersion === 0) return <Navigate to='/' replace />
  if (!slug || !courses.find((c) => c.slug === slug)) return <Navigate to='/' replace />

  const course = courses.find((c) => c.slug === slug)!

  const fullCourse = ALL_COURSES.find((c) => c.slug === slug)
  const courseExercises: Exercise[] = fullCourse ? fullCourse.phases.flatMap((p) => p.exercises as Exercise[]) : []

  const globalScore = getGlobalAvgScore(progress)

  const pendingExercises = courseExercises.filter((e) => {
    const s = progress[e.id] as ExerciseRecord | undefined
    return s?.autoCorrect === null && !s.claudeFeedback && isTheoryComplete(progress, e.phase)
  })

  const handleBatchGrade = async () => {
    if (!studentToken || batchGrading) return
    setBatchGrading(true)
    setBatchDone(0)
    for (let i = 0; i < pendingExercises.length; i++) {
      const ex = pendingExercises[i]
      const saved = progress[ex.id] as ExerciseRecord
      try {
        const result = await gradeExercise(studentToken, ex, saved.userAnswer!)
        applyGrade(ex.id, result)
      } catch {}
      setBatchDone(i + 1)
    }
    setBatchGrading(false)
  }

  return (
    <ReadingColumn>
      <PageHeader
        eyebrow='Curso'
        title='Calificaciones'
        subtitle={
          <>
            {course.name} · {username}
            {globalScore !== null && <span className='text-fg ml-2 font-mono'>{globalScore}/100</span>}
          </>
        }
        actions={
          <button
            onClick={() => navigate(`/cursos/${slug}`)}
            className='border-hairline text-fg-muted hover:text-fg rounded border px-3 py-1.5 text-xs font-medium transition-colors'
          >
            Volver al curso
          </button>
        }
      />

      <div>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-fg text-xl font-semibold'>📊 Calificaciones</h1>
            <p className='text-fg-subtle mt-1 text-xs'>
              {fullCourse?.phases.length ?? 0} fase{(fullCourse?.phases.length ?? 0) !== 1 ? 's' : ''} ·{' '}
              {courseExercises.length} ejercicio{courseExercises.length !== 1 ? 's' : ''}
            </p>
          </div>
          {studentToken && pendingExercises.length > 0 && (
            <button
              onClick={handleBatchGrade}
              disabled={batchGrading}
              className='rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-all hover:opacity-80'
              style={{
                background: batchGrading ? 'var(--primary-glow)' : 'var(--primary)',
                boxShadow: '0 2px 8px var(--primary-glow)'
              }}
            >
              {batchGrading
                ? `🤖 ${batchDone}/${pendingExercises.length}...`
                : `🤖 Calificar todo (${pendingExercises.length})`}
            </button>
          )}
        </div>

        <ScoresView progress={progress} courseData={fullCourse ?? null} />
      </div>
    </ReadingColumn>
  )
}
