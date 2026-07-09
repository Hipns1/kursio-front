import type { CurrentStep, Exercise, ExerciseRecord, GradeResult, Progress } from '@/types/learning'
import { EXERCISES, LESSONS, PHASES } from '@/utils/consts/learning-data'

const KEY = 'bkl_'

export function loadProgress(username: string): Progress {
  try {
    return JSON.parse(localStorage.getItem(KEY + username) || '{}')
  } catch {
    return {}
  }
}

export function saveProgress(username: string, progress: Progress): void {
  localStorage.setItem(KEY + username, JSON.stringify(progress))
}

export function getPhaseExercises(phaseId: number): Exercise[] {
  return EXERCISES.filter((e) => e.phase === phaseId)
}

export function getPhaseExStats(progress: Progress, phaseId: number) {
  const exs = getPhaseExercises(phaseId)
  const answered = exs.filter((e) => progress[e.id] !== undefined).length
  return { total: exs.length, answered }
}

export function getPhaseLsStats(progress: Progress, phaseId: number) {
  const ls = LESSONS.filter((l) => l.phase === phaseId)
  const read = ls.filter((l) => (progress.__lessons || {})[l.id]).length
  return { total: ls.length, read }
}

export function isPhaseComplete(progress: Progress, phaseId: number): boolean {
  const lessons = LESSONS.filter((l) => l.phase === phaseId)
  const exs = getPhaseExercises(phaseId)
  return (
    lessons.every((l) => progress.__lessons?.[l.id]) && exs.every((e) => progress[e.id] !== undefined)
  )
}

export function isPhaseUnlocked(_progress: Progress, _phaseId: number): boolean {
  return true
}

export function isTheoryComplete(progress: Progress, phaseId: number): boolean {
  const lessons = LESSONS.filter((l) => l.phase === phaseId)
  return lessons.length === 0 || lessons.every((l) => progress.__lessons?.[l.id])
}

export function getCurrentStep(progress: Progress): CurrentStep | null {
  for (let phaseId = 0; phaseId < PHASES.length; phaseId++) {
    if (!isPhaseUnlocked(progress, phaseId)) break
    const lessons = LESSONS.filter((l) => l.phase === phaseId)
    if (lessons.some((l) => !progress.__lessons?.[l.id])) return { phaseId, tab: 'theory' }
    const exs = getPhaseExercises(phaseId)
    if (exs.some((e) => !progress[e.id])) return { phaseId, tab: 'exercises' }
  }
  return null
}

export function autoGrade(exercise: Exercise, answer: unknown): boolean | null {
  if (exercise.type === 'multiple-choice') return answer === exercise.correct
  if (exercise.type === 'complete-code') {
    return (
      Array.isArray(answer) &&
      (answer as string[]).every((a, i) => a.trim().toLowerCase() === exercise.blanks![i].toLowerCase())
    )
  }
  if (exercise.type === 'know-output') {
    const lower = String(answer).toLowerCase()
    return exercise.keywords!.some((k) => lower.includes(k.toLowerCase()))
  }
  return null
}

export function getExerciseScore(saved: ExerciseRecord | undefined): number | null {
  if (!saved) return null
  if (saved.score !== undefined) return saved.score
  if (saved.autoCorrect === true) return 100
  if (saved.autoCorrect === false) return 0
  return null
}

export function getPhaseAvgScore(progress: Progress, phaseId: number): number | null {
  const scores = getPhaseExercises(phaseId)
    .map((e) => getExerciseScore(progress[e.id] as ExerciseRecord | undefined))
    .filter((s): s is number => s !== null)
  return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
}

export function getGlobalAvgScore(progress: Progress): number | null {
  const scores = EXERCISES.map((e) => getExerciseScore(progress[e.id] as ExerciseRecord | undefined)).filter(
    (s): s is number => s !== null,
  )
  return scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null
}

export function applyGradeResult(record: ExerciseRecord, result: GradeResult): ExerciseRecord {
  return { ...record, autoCorrect: result.autoCorrect, score: result.score, claudeFeedback: result.feedback }
}
