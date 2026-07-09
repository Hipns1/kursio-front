import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  message: string
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, message: '' }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  public componentDidCatch(error: Error, _errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary]', error.message, error.stack)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className='bg-surface flex min-h-screen items-center justify-center p-6'>
          <div className='bg-card border-hairline w-full max-w-sm rounded-2xl border p-8 text-center'>
            <div className='border-danger-border bg-danger-bg mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border font-serif text-2xl font-normal'>
              ⚠️
            </div>
            <p className='text-fg mb-1 text-base font-semibold'>Algo salió mal</p>
            <p className='text-fg-subtle mb-6 text-xs leading-relaxed'>
              {this.state.message || 'Se produjo un error inesperado en la aplicación.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, message: '' })
                window.location.reload()
              }}
              className='rounded-xl bg-[var(--grad)] px-6 py-2.5 text-sm font-bold text-white transition-all hover:opacity-80'
            >
              Recargar página
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
