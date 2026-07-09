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
    <div className='bg-surface text-fg-muted flex min-h-screen items-center justify-center'>
      <div className='text-center'>
        <p className='text-danger mb-2 text-lg font-bold'>Error inesperado</p>
        <p className='text-sm'>{error?.message ?? 'Algo salió mal.'}</p>
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
            path: '/'
          }
        ],
        { basename: PUBLIC_URL }
      ),
    []
  )

  return <RouterProvider router={router} />
}

export default App
