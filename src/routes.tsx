import type { ComponentType } from 'react'

export const routes = [
  {
    lazy: async () =>
      await (import('@/pages/learning') as Promise<{ Learning: ComponentType }>).then(({ Learning }) => ({
        element: <Learning />
      })),
    path: '/'
  },
  {
    lazy: async () =>
      await (import('@/pages/course-detail') as Promise<{ CourseDetail: ComponentType }>).then(({ CourseDetail }) => ({
        element: <CourseDetail />
      })),
    path: '/course/:slug'
  },
  {
    lazy: async () =>
      await (import('@/pages/course-scores') as Promise<{ CourseScores: ComponentType }>).then(({ CourseScores }) => ({
        element: <CourseScores />
      })),
    path: '/course/:slug/scores'
  },
  {
    lazy: async () =>
      await (import('@/pages/phase') as Promise<{ Phase: ComponentType }>).then(({ Phase }) => ({
        element: <Phase />
      })),
    path: '/course/:slug/phase/:id'
  },
  {
    lazy: async () =>
      await (import('@/pages/phase') as Promise<{ Phase: ComponentType }>).then(({ Phase }) => ({
        element: <Phase />
      })),
    path: '/phase/:id'
  },
  {
    lazy: async () =>
      await (import('@/pages/admin') as Promise<{ Admin: ComponentType }>).then(({ Admin }) => ({
        element: <Admin />
      })),
    path: '/admin'
  },
  {
    lazy: async () =>
      await (import('@/pages/admin-aprendices') as Promise<{ AdminAprendices: ComponentType }>).then(
        ({ AdminAprendices }) => ({
          element: <AdminAprendices />
        })
      ),
    path: '/admin/aprendices'
  },
  {
    lazy: async () =>
      await (import('@/pages/admin-contenido') as Promise<{ AdminContenido: ComponentType }>).then(
        ({ AdminContenido }) => ({
          element: <AdminContenido />
        })
      ),
    path: '/admin/contenido'
  },
  {
    lazy: async () =>
      await (import('@/pages/admin-onboarding') as Promise<{ AdminOnboarding: ComponentType }>).then(
        ({ AdminOnboarding }) => ({
          element: <AdminOnboarding />
        })
      ),
    path: '/admin/onboarding'
  },
  {
    lazy: async () =>
      await (import('@/pages/onboarding') as Promise<{ Onboarding: ComponentType }>).then(({ Onboarding }) => ({
        element: <Onboarding />
      })),
    path: '/onboarding'
  },
  {
    lazy: async () =>
      await (import('@/pages/roadmap') as Promise<{ Roadmap: ComponentType }>).then(({ Roadmap }) => ({
        element: <Roadmap />
      })),
    path: '/roadmap'
  },
  {
    lazy: async () =>
      await (import('@/pages/not-found') as Promise<{ NotFound: ComponentType }>).then(({ NotFound }) => ({
        element: <NotFound />
      })),
    path: '*'
  }
]
