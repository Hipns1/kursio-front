import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Exercise } from '@/types/learning'
import { deleteStudent, fetchProgress, gradeExercise, studentLogin, syncProgress } from '@/services/backend'

const fetchMock = vi.fn()

function jsonResponse(body: unknown, status = 200) {
  return { json: () => Promise.resolve(body), ok: true, status, text: () => Promise.resolve('') }
}

function errorResponse(status: number, body = '') {
  return { json: () => Promise.reject(new Error('no json')), ok: false, status, text: () => Promise.resolve(body) }
}

function lastCall() {
  const calls = fetchMock.mock.calls
  const [url, init] = calls[calls.length - 1] as [string, RequestInit]
  return { headers: init.headers as Record<string, string>, init, url }
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('the api wrapper', () => {
  it('sends a JSON content type by default', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ accessToken: 't' }))

    await studentLogin('NET-ABC12345')

    expect(lastCall().headers['Content-Type']).toBe('application/json')
  })

  it('attaches the bearer token for authenticated calls', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ progressData: '{}' }))

    await fetchProgress('token-123')

    expect(lastCall().headers.Authorization).toBe('Bearer token-123')
  })

  it('resolves without a body for a 204 response', async () => {
    fetchMock.mockResolvedValue({
      json: () => Promise.reject(new Error('no body')),
      ok: true,
      status: 204,
      text: () => Promise.resolve('')
    })

    await expect(deleteStudent('token', 7)).resolves.toBeUndefined()
  })

  it('throws an error carrying the status and the response body', async () => {
    fetchMock.mockResolvedValue(errorResponse(404, 'Not Found'))

    await expect(studentLogin('NET-NOPE1234')).rejects.toThrow('404: Not Found')
  })

  it('throws with just the status when the response has no body', async () => {
    fetchMock.mockResolvedValue(errorResponse(500))

    await expect(studentLogin('NET-NOPE1234')).rejects.toThrow('500')
  })

  it('targets the versioned learning routes', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ accessToken: 't' }))

    await studentLogin('NET-ABC12345')

    expect(lastCall().url).toMatch(/\/learning\/auth\/student\/login$/)
  })
})

describe('fetchProgress', () => {
  it('parses the progress blob out of the envelope', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ progressData: '{"E0-1":{"autoCorrect":true}}' }))

    await expect(fetchProgress('token')).resolves.toEqual({ 'E0-1': { autoCorrect: true } })
  })

  it('falls back to an empty progress when the stored blob is not valid JSON', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ progressData: 'no es json' }))

    await expect(fetchProgress('token')).resolves.toEqual({})
  })
})

describe('syncProgress', () => {
  it('sends the progress as a JSON string nested in a progressData field', async () => {
    fetchMock.mockResolvedValue(jsonResponse(undefined))
    const progress = { 'E0-1': { autoCorrect: true, type: 'find-bug' } } as never

    await syncProgress('token', progress)

    const { init } = lastCall()
    expect(init.method).toBe('PUT')
    expect(JSON.parse(init.body as string)).toEqual({ progressData: JSON.stringify(progress) })
  })
})

describe('gradeExercise', () => {
  const exercise: Exercise = {
    explanation: 'Falta await',
    id: 'E0-1',
    phase: 0,
    question: '¿Dónde está el bug?',
    type: 'find-bug'
  }

  it('sends a null code field for an exercise without code', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ autoCorrect: true, feedback: 'ok', score: 90 }))

    await gradeExercise('token', exercise, 'falta await')

    expect(JSON.parse(lastCall().init.body as string)).toEqual({
      code: null,
      exerciseId: 'E0-1',
      exerciseType: 'find-bug',
      explanation: 'Falta await',
      question: '¿Dónde está el bug?',
      userAnswer: 'falta await'
    })
  })

  it('forwards the exercise code when there is one', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ autoCorrect: true, feedback: 'ok', score: 90 }))

    await gradeExercise('token', { ...exercise, code: 'var x = 1;' }, 'respuesta')

    expect(JSON.parse(lastCall().init.body as string).code).toBe('var x = 1;')
  })
})
