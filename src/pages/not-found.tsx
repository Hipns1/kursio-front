import { useNavigate } from 'react-router-dom'

export function NotFound() {
  const navigate = useNavigate()
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--bg-base)' }}
    >
      <div className="text-center">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}
        >
          🗺️
        </div>
        <p
          className="font-black text-6xl font-mono mb-2 leading-none"
          style={{ color: 'var(--text-1)' }}
        >
          404
        </p>
        <p className="font-bold text-base mb-1" style={{ color: 'var(--text-1)' }}>
          Página no encontrada
        </p>
        <p className="text-sm mb-8" style={{ color: 'var(--text-3)' }}>
          La ruta que buscás no existe o fue movida.
        </p>
        <button
          onClick={() => navigate('/', { replace: true })}
          className="px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-80"
          style={{ background: 'linear-gradient(135deg,#ab9df2,#78dce8)' }}
        >
          ← Volver al inicio
        </button>
      </div>
    </div>
  )
}
