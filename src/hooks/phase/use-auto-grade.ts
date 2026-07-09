import { useState } from 'react'
import type { Exercise, GradeResult } from '@/types/learning'
import { gradeExercise } from '@/services/backend'

interface UseAutoGradeReturn {
  grading: boolean
  apiError: string
  grade: (userAnswer: string) => Promise<void>
}

export function useAutoGrade(
  exercise: Exercise,
  onGrade: ((exerciseId: string, result: GradeResult) => void) | undefined,
  studentToken: string | null,
): UseAutoGradeReturn {
  const [grading, setGrading] = useState(false)
  const [apiError, setApiError] = useState('')

  const grade = async (userAnswer: string) => {
    if (!studentToken || !onGrade) return
    setGrading(true)
    setApiError('')
    try {
      const result = await gradeExercise(studentToken, exercise, userAnswer)
      onGrade(exercise.id, result)
    } catch (e) {
      const msg = (e as Error).message || String(e)
      setApiError(
        msg.includes('401') || msg.includes('403')
          ? 'Sesión expirada. Recargá la página.'
          : msg.includes('Failed to fetch')
            ? 'No se pudo conectar al servidor.'
            : `Error: ${msg}`,
      )
    }
    setGrading(false)
  }

  return { grading, apiError, grade }
}
