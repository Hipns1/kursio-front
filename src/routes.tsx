import type { ComponentType } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { AdminLayout, StudentLayout } from '@/components/layout'

function LegacyCourse({ to }: { to: 'curso' | 'notas' }) {
  const { slug } = useParams()
  return <Navigate to={to === 'curso' ? `/cursos/${slug}` : `/cursos/${slug}/notas`} replace />
}

function LegacyPhase() {
  const { id, slug } = useParams()
  return <Navigate to={slug ? `/cursos/${slug}/fases/${id}` : '/cursos'} replace />
}

const page =
  <T extends string>(loader: () => Promise<Record<T, ComponentType>>, name: T) =>
  async () => {
    const mod = await loader()
    const Component: ComponentType = mod[name]
    return { element: <Component /> }
  }

export const routes = [
  { element: <Navigate to='/cursos' replace />, path: '/' },
  { lazy: page(() => import('@/pages/login'), 'Login'), path: '/login' },
  { lazy: page(() => import('@/pages/onboarding'), 'Onboarding'), path: '/onboarding' },

  {
    children: [
      { lazy: page(() => import('@/pages/courses'), 'Courses'), path: '/cursos' },
      { lazy: page(() => import('@/pages/course-detail'), 'CourseDetail'), path: '/cursos/:slug' },
      { lazy: page(() => import('@/pages/course-scores'), 'CourseScores'), path: '/cursos/:slug/notas' },
      { lazy: page(() => import('@/pages/phase'), 'Phase'), path: '/cursos/:slug/fases/:id' },
      { lazy: page(() => import('@/pages/roadmap'), 'Roadmap'), path: '/mi-ruta' }
    ],
    element: <StudentLayout />
  },

  { lazy: page(() => import('@/pages/admin'), 'Admin'), path: '/admin/login' },
  { element: <Navigate to='/admin/aprendices' replace />, path: '/admin' },
  {
    children: [
      { lazy: page(() => import('@/pages/admin-aprendices'), 'AdminAprendices'), path: '/admin/aprendices' },
      { lazy: page(() => import('@/pages/admin-contenido'), 'AdminContenido'), path: '/admin/contenido' },
      { lazy: page(() => import('@/pages/admin-onboarding'), 'AdminOnboarding'), path: '/admin/onboarding' }
    ],
    element: <AdminLayout />
  },

  { element: <LegacyCourse to='curso' />, path: '/course/:slug' },
  { element: <LegacyCourse to='notas' />, path: '/course/:slug/scores' },
  { element: <LegacyPhase />, path: '/course/:slug/phase/:id' },
  { element: <Navigate to='/cursos' replace />, path: '/phase/:id' },
  { element: <Navigate to='/mi-ruta' replace />, path: '/roadmap' },

  { lazy: page(() => import('@/pages/not-found'), 'NotFound'), path: '*' }
]
