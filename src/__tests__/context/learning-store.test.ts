import { beforeEach, describe, expect, it, vi } from 'vitest'
import { create } from 'zustand'
import type { ExerciseRecord, Progress } from '@/types/learning'
import { type LearningSlice, createLearningSlice } from '@/context/learning-store'
import { syncProgress } from '@/services/backend'

vi.mock('@/services/backend', () => ({ syncProgress: vi.fn(() => Promise.resolve()) }))

const syncProgressMock = vi.mocked(syncProgress)

const useStore = create<LearningSlice>(createLearningSlice)
const initialState = useStore.getState()

const record: ExerciseRecord = { autoCorrect: null, type: 'find-bug', userAnswer: 'falta await' }

function storedProgress(username: string): Progress {
  return JSON.parse(localStorage.getItem(`bkl_${username}`) ?? 'null')
}

function login() {
  useStore.getState().setStudentLogin('token-123', 'ana', {}, [1, 2])
  syncProgressMock.mockClear()
}

beforeEach(() => {
  localStorage.clear()
  useStore.setState(initialState, true)
  syncProgressMock.mockReset()
  syncProgressMock.mockResolvedValue(undefined)
})

describe('setStudentLogin', () => {
  it('stores the session and mirrors the progress into localStorage', () => {
    const progress: Progress = { 'E0-1': record }

    useStore.getState().setStudentLogin('token-123', 'ana', progress, [1, 2])

    const state = useStore.getState()
    expect(state.username).toBe('ana')
    expect(state.studentToken).toBe('token-123')
    expect(state.allowedCourseIds).toEqual([1, 2])
    expect(storedProgress('ana')).toEqual(progress)
  })
})

describe('saveExercise', () => {
  beforeEach(() => login())

  it('writes the record to localStorage and to the backend', async () => {
    useStore.getState().saveExercise('E0-1', record)

    expect(useStore.getState().progress['E0-1']).toEqual(record)
    expect(storedProgress('ana')).toEqual({ 'E0-1': record })
    expect(syncProgressMock).toHaveBeenCalledWith('token-123', { 'E0-1': record })
  })

  it('keeps the previously answered exercises', () => {
    useStore.getState().saveExercise('E0-1', record)
    useStore.getState().saveExercise('E0-2', record)

    expect(Object.keys(storedProgress('ana'))).toEqual(['E0-1', 'E0-2'])
  })

  it('still updates local state when the backend sync fails', async () => {
    syncProgressMock.mockRejectedValue(new Error('offline'))

    useStore.getState().saveExercise('E0-1', record)
    await Promise.resolve()

    expect(useStore.getState().progress['E0-1']).toEqual(record)
    expect(storedProgress('ana')).toEqual({ 'E0-1': record })
  })

  it('does nothing at all when there is no logged-in student', () => {
    useStore.setState({ username: null })

    useStore.getState().saveExercise('E0-1', record)

    expect(useStore.getState().progress).toEqual({})
    expect(storedProgress('ana')).toEqual({})
    expect(syncProgressMock).not.toHaveBeenCalled()
  })

  it('writes locally but skips the sync when there is no token', () => {
    useStore.setState({ studentToken: null })

    useStore.getState().saveExercise('E0-1', record)

    expect(storedProgress('ana')).toEqual({ 'E0-1': record })
    expect(syncProgressMock).not.toHaveBeenCalled()
  })
})

describe('markLessonRead', () => {
  beforeEach(() => login())

  it('nests lesson reads under the reserved __lessons key', () => {
    useStore.getState().markLessonRead('L0-1')

    expect(storedProgress('ana')).toEqual({ __lessons: { 'L0-1': true } })
    expect(syncProgressMock).toHaveBeenCalledWith('token-123', { __lessons: { 'L0-1': true } })
  })

  it('accumulates lesson reads without dropping exercise records', () => {
    useStore.getState().saveExercise('E0-1', record)
    useStore.getState().markLessonRead('L0-1')
    useStore.getState().markLessonRead('L0-2')

    expect(storedProgress('ana')).toEqual({
      __lessons: { 'L0-1': true, 'L0-2': true },
      'E0-1': record
    })
  })
})

describe('applyGrade', () => {
  beforeEach(() => login())

  it('merges the grade into an existing record and syncs it', () => {
    useStore.getState().saveExercise('E0-1', record)
    syncProgressMock.mockClear()

    useStore.getState().applyGrade('E0-1', { autoCorrect: true, feedback: 'Bien', score: 88 })

    expect(useStore.getState().progress['E0-1']).toEqual({
      ...record,
      autoCorrect: true,
      claudeFeedback: 'Bien',
      score: 88
    })
    expect(syncProgressMock).toHaveBeenCalledTimes(1)
  })

  it('is a no-op when the exercise has no saved record', () => {
    useStore.getState().applyGrade('E9-9', { autoCorrect: true, feedback: 'Bien', score: 88 })

    expect(useStore.getState().progress).toEqual({})
    expect(syncProgressMock).not.toHaveBeenCalled()
  })
})

describe('resetProgress', () => {
  beforeEach(() => login())

  it('clears the progress locally and on the backend', () => {
    useStore.getState().saveExercise('E0-1', record)
    syncProgressMock.mockClear()

    useStore.getState().resetProgress()

    expect(useStore.getState().progress).toEqual({})
    expect(storedProgress('ana')).toEqual({})
    expect(syncProgressMock).toHaveBeenCalledWith('token-123', {})
  })
})

describe('clearUser', () => {
  it('drops the session but leaves the progress on disk for the next login', () => {
    login()
    useStore.getState().saveExercise('E0-1', record)

    useStore.getState().clearUser()

    const state = useStore.getState()
    expect(state.username).toBeNull()
    expect(state.studentToken).toBeNull()
    expect(state.progress).toEqual({})
    expect(state.allowedCourseIds).toEqual([])
    expect(storedProgress('ana')).toEqual({ 'E0-1': record })
  })
})
