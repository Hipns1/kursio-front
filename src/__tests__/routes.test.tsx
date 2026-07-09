import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router-dom'
import { routes } from '@/routes'

vi.mock('@/services/backend', () => ({
  adminLogin: vi.fn(),
  fetchContent: vi.fn(() => new Promise(() => {})),
  getRoadmap: vi.fn(() => new Promise(() => {})),
  studentLogin: vi.fn()
}))

async function goTo(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(<RouterProvider router={router} />)
  await waitFor(() => expect(router.state.initialized).toBe(true))
  return router
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

describe('route redirects', () => {
  it('sends the root path to the course list', async () => {
    const router = await goTo('/')
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
  })

  it('keeps the old course URL working', async () => {
    const router = await goTo('/course/net-backend')
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
  })

  it('sends the old admin root to the students section', async () => {
    const router = await goTo('/admin')
    await waitFor(() => expect(router.state.location.pathname).toBe('/admin/login'))
  })
})

// Both layouts guard their subtree; an anonymous visitor never reaches a child route.
describe('access guards', () => {
  it('bounces an anonymous student to the login', async () => {
    const router = await goTo('/cursos')
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
  })

  it('bounces an anonymous student away from a phase', async () => {
    const router = await goTo('/cursos/net-backend/fases/2')
    await waitFor(() => expect(router.state.location.pathname).toBe('/login'))
  })

  it('bounces an anonymous admin to the admin login', async () => {
    const router = await goTo('/admin/contenido')
    await waitFor(() => expect(router.state.location.pathname).toBe('/admin/login'))
  })

  it('lets an authenticated admin reach a section', async () => {
    sessionStorage.setItem('admin_token', 'token')

    const router = await goTo('/admin/onboarding')

    await waitFor(() => expect(router.state.location.pathname).toBe('/admin/onboarding'))
  })
})
