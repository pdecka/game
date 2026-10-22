import { GameLayout } from '@/components/layout/GameLayout'
import { PageHeader } from '@/components/ui/page-header'

export default function PrivacyPage() {
  return (
    <GameLayout>
      <div className="page-wrap max-w-3xl">
        <PageHeader title="Privacy Policy" description="How we handle account and play data." />
        <div className="space-y-3 text-sm leading-6 text-ink-2">
          <p>We collect the details you give us at signup, wallet activity, and sports or casino bets so we can run your account.</p>
          <p>We do not sell your personal data. We share it only with payment processors, identity checks, and hosts needed to operate the site.</p>
          <p>You can ask for a copy of your data or account closure through support.</p>
        </div>
      </div>
    </GameLayout>
  )
}
