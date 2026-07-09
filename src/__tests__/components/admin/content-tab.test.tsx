import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import type { CourseContent } from '@/services/backend'
import { fetchContent } from '@/services/backend'
import { ContentTab } from '@/components/admin/content-tab'

vi.mock('@/services/backend', () => ({
  addExercise: vi.fn(),
  addLesson: vi.fn(),
  createCourse: vi.fn(),
  createPhase: vi.fn(),
  deleteCourse: vi.fn(),
  deleteExercise: vi.fn(),
  deleteLesson: vi.fn(),
  deletePhase: vi.fn(),
  fetchContent: vi.fn(),
  updateCourse: vi.fn(),
  updateExercise: vi.fn(),
  updateLesson: vi.fn(),
  updatePhase: vi.fn()
}))

const fetchContentMock = vi.mocked(fetchContent)

const content: CourseContent = {
  courses: [
    {
      color: '#ab9df2',
      description: 'desc',
      icon: '🏗️',
      id: 1,
      name: 'Curso .NET',
      order: 1,
      phases: [
        {
          exercises: [],
          icon: '🔤',
          id: 10,
          lessons: [],
          name: 'Fase inicial',
          order: 0
        }
      ],
      slug: 'net-backend'
    }
  ]
} as unknown as CourseContent

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ContentTab', () => {
  it('shows a loading indicator until the content arrives', () => {
    fetchContentMock.mockReturnValue(new Promise(() => {}))

    render(<ContentTab token='t' onUnauthorized={vi.fn()} />)

    expect(screen.getByText('Cargando contenido...')).toBeTruthy()
  })

  it('asks the student to pick a course once the content has loaded', async () => {
    fetchContentMock.mockResolvedValue(content)

    render(<ContentTab token='t' onUnauthorized={vi.fn()} />)

    expect(await screen.findByText('Seleccioná un curso para editar')).toBeTruthy()
    expect(screen.getByText('Curso .NET')).toBeTruthy()
  })

  it('fetches the content with the token it was given', async () => {
    fetchContentMock.mockResolvedValue(content)

    render(<ContentTab token='mi-token' onUnauthorized={vi.fn()} />)

    await waitFor(() => expect(fetchContentMock).toHaveBeenCalledWith('mi-token'))
  })

  it('escalates a 401 to the caller instead of rendering an error', async () => {
    const onUnauthorized = vi.fn()
    fetchContentMock.mockRejectedValue(new Error('401: Unauthorized'))

    render(<ContentTab token='t' onUnauthorized={onUnauthorized} />)

    await waitFor(() => expect(onUnauthorized).toHaveBeenCalledTimes(1))
  })

  it('does not log the admin out for a non-401 failure', async () => {
    const onUnauthorized = vi.fn()
    fetchContentMock.mockRejectedValue(new Error('500: Server Error'))

    render(<ContentTab token='t' onUnauthorized={onUnauthorized} />)

    await waitFor(() => expect(screen.queryByText('Cargando contenido...')).toBeNull())
    expect(onUnauthorized).not.toHaveBeenCalled()
  })
})
