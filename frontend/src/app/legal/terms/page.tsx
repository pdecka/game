import { GameLayout } from '@/components/layout/GameLayout'
import { PageHeader } from '@/components/ui/page-header'

export default function TermsPage() {
  return (
    <GameLayout>
      <div className="page-wrap max-w-3xl">
        <PageHeader title="Terms & Conditions" description="The rules for using Arena Bet." />
        <div className="space-y-3 text-sm leading-6 text-ink-2">
          <p>By creating an account or placing a bet you agree to these terms. You must be 18 or older.</p>
          <p>Sports stakes are held as exposure until the bet is settled. A winning sports bet credits stake × odds to your balance.</p>
          <p>We may suspend markets, void bets, or request identity checks when required for security or compliance.</p>
          <p>Questions: use Support in the bottom-right corner or email the address on your account emails.</p>
        </div>
      </div>
    </GameLayout>
  )
}
