import { ContentTab } from '@/components/admin/content-tab'
import { PageHeader, ReadingColumn, useAdminSession } from '@/components/layout'

export function AdminContenido() {
  const { logout, token } = useAdminSession()

  return (
    <ReadingColumn width='wide'>
      <PageHeader eyebrow='Administración' title='Contenido' subtitle='Cursos, fases, lecciones y ejercicios.' />
      <ContentTab token={token ?? ''} onUnauthorized={logout} />
    </ReadingColumn>
  )
}
