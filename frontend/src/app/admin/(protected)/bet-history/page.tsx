import { Suspense } from 'react'
import BetHistoryPage from '@/admin/pages/BetHistory'

export default function Page() {
  return (
    <Suspense fallback={<p className="text-sm text-[#64748b]">Loading bet history...</p>}>
      <BetHistoryPage />
    </Suspense>
  )
}
