export function Loading() {
  return (
    <div className='bg-surface fixed inset-0 flex flex-col items-center justify-center gap-4'>
      <div className='border-line border-t-primary h-8 w-8 animate-spin rounded-full border-2' />
      <p className='text-fg-subtle animate-pulse text-xs font-medium'>Cargando...</p>
    </div>
  )
}
