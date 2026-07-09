import { OnboardingTab } from '@/components/admin/onboarding-tab'
import { PageHeader, ReadingColumn, useAdminSession } from '@/components/layout'

export function AdminOnboarding() {
  const { token } = useAdminSession()

  return (
    <ReadingColumn width='wide'>
      <PageHeader
        eyebrow='Administración'
        title='Onboarding'
        subtitle='Preguntas que definen el roadmap inicial del aprendiz.'
      />
      <OnboardingTab token={token ?? ''} />
    </ReadingColumn>
  )
}
