import EnhancedPage from './EnhancedPage'

export default function AccountsEnhanced() {
  return (
    <EnhancedPage
      title="Accounts Management"
      description="Manage internal and operational accounts used by the platform."
      ctaLabel="Add Account"
      cards={[
        { title: 'Total Accounts', value: '26', trend: '2 new this month' },
        { title: 'Enabled', value: '23', trend: '88.4% active' },
        { title: 'Disabled', value: '3', trend: 'For audit', trendUp: false },
        { title: 'Last Sync', value: '2 min ago', trend: 'Healthy' },
      ]}
      columns={['Account ID', 'Name', 'Type', 'Status', 'Updated']}
      rows={[
        ['AC-101', 'Treasury Main', 'Operational', 'Enabled', 'Today'],
        ['AC-102', 'Payout Buffer', 'Settlement', 'Enabled', 'Today'],
        ['AC-103', 'Legacy Wallet', 'Archive', 'Disabled', 'Yesterday'],
      ]}
    />
  )
}

