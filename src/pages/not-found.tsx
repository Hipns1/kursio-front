import { useNavigate } from 'react-router-dom'

export function NotFound() {
  const navigate = useNavigate()
  return (
    <div className='bg-surface flex min-h-screen items-center justify-center p-6'>
      <div className='text-center'>
        <div className='bg-card border-hairline mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border font-serif text-4xl font-normal'>
          🗺️
        </div>
        <p className='text-fg mb-2 font-mono font-serif text-6xl leading-none font-normal'>404</p>
        <p className='text-fg mb-1 text-base font-bold'>Página no encontrada</p>
        <p className='text-fg-subtle mb-8 text-sm'>La ruta que buscás no existe o fue movida.</p>
        <button
          onClick={() => navigate('/', { replace: true })}
          className='rounded-xl bg-[var(--grad)] px-6 py-2.5 text-sm font-bold text-white transition-all hover:opacity-80'
        >
          ← Volver al inicio
        </button>
      </div>
    </div>
  )
}
