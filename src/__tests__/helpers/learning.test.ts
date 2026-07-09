import { beforeEach, describe, expect, it } from 'vitest'
import type { Exercise, Lesson, Phase, Progress } from '@/types/learning'
import {
  applyGradeResult,
  autoGrade,
  getCurrentStep,
  getExerciseScore,
  getGlobalAvgScore,
  getPhaseAvgScore,
  getPhaseExStats,
  getPhaseLsStats,
  isPhaseComplete,
  isTheoryComplete,
  loadProgress,
  saveProgress
} from '@/utils/helpers/learning'
import { setContentArrays } from '@/utils/consts/learning-data'

const phases: Phase[] = [
  { icon: 'a', id: 0, name: 'Fase 0' },
  { icon: 'b', id: 1, name: 'Fase 1' }
]

const lessons: Lesson[] = [
  { blocks: [], id: 'L0-1', phase: 0, title: 'L0-1' },
  { blocks: [], id: 'L0-2', phase: 0, title: 'L0-2' },
  { blocks: [], id: 'L1-1', phase: 1, title: 'L1-1' }
]

const exercises: Exercise[] = [
  { correct: 1, explanation: 'e', id: 'E0-1', options: ['a', 'b'], phase: 0, question: 'q', type: 'multiple-choice' },
  { blanks: ['Task', 'await'], explanation: 'e', id: 'E0-2', phase: 0, question: 'q', type: 'complete-code' },
  { explanation: 'e', id: 'E1-1', keywords: ['42', 'cuarenta'], phase: 1, question: 'q', type: 'know-output' }
]

beforeEach(() => {
  localStorage.clear()
  setContentArrays(phases, lessons, exercises)
})

describe('loadProgress / saveProgress', () => {
  it('round-trips a progress blob under the bkl_<username> key', () => {
    const progress: Progress = { 'E0-1': { answer: 1, autoCorrect: true, type: 'multiple-choice' } }

    saveProgress('ana', progress)

    expect(localStorage.getItem('bkl_ana')).toBe(JSON.stringify(progress))
    expect(loadProgress('ana')).toEqual(progress)
  })

  it('returns an empty progress for an unknown user', () => {
    expect(loadProgress('nadie')).toEqual({})
  })

  it('returns an empty progress instead of throwing when the stored value is corrupt', () => {
    localStorage.setItem('bkl_ana', '{ no es json')

    expect(loadProgress('ana')).toEqual({})
  })

  it('keeps each user progress isolated', () => {
    saveProgress('ana', { 'E0-1': { autoCorrect: true, type: 'multiple-choice' } })
    saveProgress('luis', {})

    expect(Object.keys(loadProgress('ana'))).toEqual(['E0-1'])
    expect(loadProgress('luis')).toEqual({})
  })
})

describe('autoGrade', () => {
  it('marks a multiple-choice answer against the correct index', () => {
    expect(autoGrade(exercises[0], 1)).toBe(true)
    expect(autoGrade(exercises[0], 0)).toBe(false)
  })

  it('compares complete-code blanks ignoring case and surrounding whitespace', () => {
    expect(autoGrade(exercises[1], ['  task ', 'AWAIT'])).toBe(true)
    expect(autoGrade(exercises[1], ['Task', 'async'])).toBe(false)
  })

  it('rejects a complete-code answer that is not an array', () => {
    expect(autoGrade(exercises[1], 'Task')).toBe(false)
  })

  it('accepts a know-output answer that contains any keyword, case-insensitively', () => {
    expect(autoGrade(exercises[2], 'La salida es 42')).toBe(true)
    expect(autoGrade(exercises[2], 'CUARENTA y dos')).toBe(true)
    expect(autoGrade(exercises[2], 'no sé')).toBe(false)
  })

  it('defers to a human or the model for exercise types it cannot grade', () => {
    const findBug: Exercise = { explanation: 'e', id: 'X', phase: 0, question: 'q', type: 'find-bug' }
    const codeAlong: Exercise = { explanation: 'e', id: 'Y', phase: 0, question: 'q', type: 'code-along' }
    const improve: Exercise = { explanation: 'e', id: 'Z', phase: 0, question: 'q', type: 'improve-code' }

    expect(autoGrade(findBug, 'lo que sea')).toBeNull()
    expect(autoGrade(codeAlong, 'lo que sea')).toBeNull()
    expect(autoGrade(improve, 'lo que sea')).toBeNull()
  })
})

describe('getExerciseScore', () => {
  it('returns null for an exercise that was never answered', () => {
    expect(getExerciseScore(undefined)).toBeNull()
  })

  it('prefers an explicit score over the autoCorrect flag', () => {
    expect(getExerciseScore({ autoCorrect: false, score: 70, type: 'find-bug' })).toBe(70)
  })

  it('treats a zero score as a real score', () => {
    expect(getExerciseScore({ autoCorrect: true, score: 0, type: 'find-bug' })).toBe(0)
  })

  it('derives 100 or 0 from autoCorrect when there is no score', () => {
    expect(getExerciseScore({ autoCorrect: true, type: 'multiple-choice' })).toBe(100)
    expect(getExerciseScore({ autoCorrect: false, type: 'multiple-choice' })).toBe(0)
  })

  it('returns null for a partially correct answer with no score', () => {
    expect(getExerciseScore({ autoCorrect: null, type: 'find-bug' })).toBeNull()
  })
})

describe('average scores', () => {
  it('averages and rounds the scored exercises of a phase, ignoring unscored ones', () => {
    const progress: Progress = {
      'E0-1': { autoCorrect: true, type: 'multiple-choice' },
      'E0-2': { autoCorrect: false, score: 51, type: 'complete-code' }
    }

    expect(getPhaseAvgScore(progress, 0)).toBe(76)
  })

  it('returns null for a phase with no scored exercises', () => {
    expect(getPhaseAvgScore({}, 0)).toBeNull()
  })

  it('averages across every exercise for the global score', () => {
    const progress: Progress = {
      'E0-1': { autoCorrect: true, type: 'multiple-choice' },
      'E1-1': { autoCorrect: false, type: 'know-output' }
    }

    expect(getGlobalAvgScore(progress)).toBe(50)
  })

  it('returns null for a global score with nothing answered', () => {
    expect(getGlobalAvgScore({})).toBeNull()
  })
})

describe('phase statistics', () => {
  it('counts answered exercises in a phase', () => {
    const progress: Progress = { 'E0-1': { autoCorrect: true, type: 'multiple-choice' } }

    expect(getPhaseExStats(progress, 0)).toEqual({ answered: 1, total: 2 })
  })

  it('counts read lessons in a phase from the reserved __lessons key', () => {
    const progress: Progress = { __lessons: { 'L0-1': true } }

    expect(getPhaseLsStats(progress, 0)).toEqual({ read: 1, total: 2 })
  })

  it('needs every lesson read and every exercise answered to consider a phase complete', () => {
    const partial: Progress = {
      __lessons: { 'L0-1': true, 'L0-2': true },
      'E0-1': { autoCorrect: true, type: 'multiple-choice' }
    }
    const complete: Progress = { ...partial, 'E0-2': { autoCorrect: true, type: 'complete-code' } }

    expect(isPhaseComplete(partial, 0)).toBe(false)
    expect(isPhaseComplete(complete, 0)).toBe(true)
  })

  it('considers the theory of a phase without lessons already complete', () => {
    setContentArrays(phases, [], exercises)

    expect(isTheoryComplete({}, 0)).toBe(true)
  })
})

describe('getCurrentStep', () => {
  it('sends the student to the theory tab while lessons remain unread', () => {
    expect(getCurrentStep({})).toEqual({ phaseId: 0, tab: 'theory' })
  })

  it('sends the student to the exercises tab once the phase theory is done', () => {
    const progress: Progress = { __lessons: { 'L0-1': true, 'L0-2': true } }

    expect(getCurrentStep(progress)).toEqual({ phaseId: 0, tab: 'exercises' })
  })

  it('advances to the next phase once the current one is finished', () => {
    const progress: Progress = {
      __lessons: { 'L0-1': true, 'L0-2': true },
      'E0-1': { autoCorrect: true, type: 'multiple-choice' },
      'E0-2': { autoCorrect: true, type: 'complete-code' }
    }

    expect(getCurrentStep(progress)).toEqual({ phaseId: 1, tab: 'theory' })
  })

  it('returns null when every phase is finished', () => {
    const progress: Progress = {
      __lessons: { 'L0-1': true, 'L0-2': true, 'L1-1': true },
      'E0-1': { autoCorrect: true, type: 'multiple-choice' },
      'E0-2': { autoCorrect: true, type: 'complete-code' },
      'E1-1': { autoCorrect: true, type: 'know-output' }
    }

    expect(getCurrentStep(progress)).toBeNull()
  })
})

describe('applyGradeResult', () => {
  it('merges the model verdict into the record without losing the original answer', () => {
    const record = { autoCorrect: null, type: 'find-bug', userAnswer: 'falta await' } as const

    const graded = applyGradeResult(record, { autoCorrect: true, feedback: 'Bien visto', score: 90 })

    expect(graded).toEqual({
      autoCorrect: true,
      claudeFeedback: 'Bien visto',
      score: 90,
      type: 'find-bug',
      userAnswer: 'falta await'
    })
  })

  it('records no score at all when the backend could not evaluate the answer', () => {
    const record = { autoCorrect: null, type: 'find-bug', userAnswer: 'falta await' } as const

    const graded = applyGradeResult(record, { autoCorrect: null, feedback: 'No pudimos evaluar', score: null })

    expect(graded.score).toBeUndefined()
    expect(getExerciseScore(graded)).toBeNull()
  })
})
