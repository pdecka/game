import { GameLayout } from '@/components/layout/GameLayout'
import { PageHeader } from '@/components/ui/page-header'

export default function CookiesPage() {
  return (
    <GameLayout>
      <div className="page-wrap max-w-3xl">
        <PageHeader title="Cookie Policy" description="What we store in your browser." />
        <div className="space-y-3 text-sm leading-6 text-ink-2">
          <p>We use cookies and similar storage to keep you signed in, remember settings, and keep the site secure.</p>
          <p>Essential cookies are required for login and bets. You can block non-essential cookies in your browser settings.</p>
        </div>
      </div>
    </GameLayout>
  )
}
