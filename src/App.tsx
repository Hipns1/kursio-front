import { RouterProvider, createBrowserRouter, useRouteError } from 'react-router-dom'
import { useMemo } from 'react'
import { Providers } from '@/providers'
import { PUBLIC_URL } from '@/utils/consts'
import ErrorBoundary from './components/ErrorBoundary'
import { routes } from './routes'
import './styles/global.css'

const RootError = () => {
  const error = useRouteError() as Error
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-base)', color: 'var(--text-2)' }}>
      <div className="text-center">
        <p className="text-lg font-bold mb-2" style={{ color: 'var(--danger)' }}>Error inesperado</p>
        <p className="text-sm">{error?.message ?? 'Algo salió mal.'}</p>
      </div>
    </div>
  )
}

function App() {
  const router = useMemo(
    () =>
      createBrowserRouter(
        [
          {
            children: routes,
            element: (
              <ErrorBoundary>
                <Providers />
              </ErrorBoundary>
            ),
            errorElement: <RootError />,
            path: '/',
          },
        ],
        { basename: PUBLIC_URL },
      ),
    [],
  )

  return <RouterProvider router={router} />
}

export default App
