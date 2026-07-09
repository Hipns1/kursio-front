import { Outlet } from 'react-router-dom'
import { SessionGuard, ToastProvider } from '@/components/ui'

export function Providers() {
  return (
    <ToastProvider>
      <SessionGuard>
        <Outlet />
      </SessionGuard>
    </ToastProvider>
  )
}
