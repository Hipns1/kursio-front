import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import type { StudentSummary } from '@/services/backend'
import { getCourses, getStudents } from '@/services/backend'
import { AdminDash } from '@/components/admin/admin-dash'

vi.mock('@/services/backend', () => ({
  createStudent: vi.fn(),
  deleteStudent: vi.fn(),
  getCourses: vi.fn(),
  getStudents: vi.fn(),
  resetStudentProgress: vi.fn(),
  toggleStudentActive: vi.fn(),
  updateStudent: vi.fn()
}))

const getStudentsMock = vi.mocked(getStudents)
const getCoursesMock = vi.mocked(getCourses)

function student(overrides: Partial<StudentSummary> = {}): StudentSummary {
  return {
    accessKey: 'NET-ABC12345',
    averageScore: 82,
    createdAt: '2026-01-10T00:00:00Z',
    documentNumber: '123',
    exercisesDone: 4,
    id: 1,
    isActive: true,
    lastActivity: null,
    lessonsRead: 2,
    name: 'Ana Pérez',
    ...overrides
  }
}

function renderDash(onLogout = vi.fn()) {
  return render(
    <MemoryRouter>
      <AdminDash token='t' onLogout={onLogout} />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  getCoursesMock.mockResolvedValue([])
})

describe('AdminDash', () => {
  it('lists the students returned by the backend', async () => {
    getStudentsMock.mockResolvedValue([student()])

    renderDash()

    expect(await screen.findByText('Ana Pérez')).toBeTruthy()
    expect(screen.getByText('NET-ABC12345')).toBeTruthy()
  })

  it('shows an empty state when there are no students', async () => {
    getStudentsMock.mockResolvedValue([])

    renderDash()

    expect(await screen.findByText('No hay aprendices registrados aún.')).toBeTruthy()
  })

  it('renders an inactive student in the list just like an active one', async () => {
    getStudentsMock.mockResolvedValue([student({ isActive: false })])

    renderDash()

    expect(await screen.findByText('Ana Pérez')).toBeTruthy()
  })

  it('escalates a 401 to a logout', async () => {
    const onLogout = vi.fn()
    getStudentsMock.mockRejectedValue(new Error('401: Unauthorized'))

    renderDash(onLogout)

    await waitFor(() => expect(onLogout).toHaveBeenCalledTimes(1))
  })

  it('shows a connection error instead of logging out on a non-401 failure', async () => {
    const onLogout = vi.fn()
    getStudentsMock.mockRejectedValue(new Error('500: Server Error'))

    renderDash(onLogout)

    expect(await screen.findByText('No se pudo cargar la lista. Verificá tu conexión.')).toBeTruthy()
    expect(onLogout).not.toHaveBeenCalled()
  })

  it('still renders the students when the course list fails to load', async () => {
    getStudentsMock.mockResolvedValue([student()])
    getCoursesMock.mockRejectedValue(new Error('500'))

    renderDash()

    expect(await screen.findByText('Ana Pérez')).toBeTruthy()
  })
})
