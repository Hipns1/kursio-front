import { Link } from 'react-router-dom'

export function Brand({ subtitle, to = '/cursos' }: { to?: string; subtitle?: string }) {
  return (
    <Link to={to} className='group flex items-baseline gap-2.5'>
      <span className='text-fg font-serif text-lg leading-none font-normal tracking-tight'>Asisya</span>
      {subtitle && (
        <span className='text-fg-subtle border-hairline hidden border-l pl-2.5 text-xs leading-none sm:inline'>
          {subtitle}
        </span>
      )}
    </Link>
  )
}
