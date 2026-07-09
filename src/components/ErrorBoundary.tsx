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
        <div
          className="min-h-screen flex items-center justify-center p-6"
          style={{ background: 'var(--bg-base)' }}
        >
          <div
            className="w-full max-w-sm text-center rounded-2xl p-8"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
              style={{ background: 'rgba(255,97,136,0.12)', border: '1px solid rgba(255,97,136,0.25)' }}
            >
              ⚠️
            </div>
            <p className="font-black text-base mb-1" style={{ color: 'var(--text-1)' }}>
              Algo salió mal
            </p>
            <p className="text-xs mb-6 leading-relaxed" style={{ color: 'var(--text-3)' }}>
              {this.state.message || 'Se produjo un error inesperado en la aplicación.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, message: '' })
                window.location.reload()
              }}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-80"
              style={{ background: 'linear-gradient(135deg,#ab9df2,#78dce8)' }}
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
