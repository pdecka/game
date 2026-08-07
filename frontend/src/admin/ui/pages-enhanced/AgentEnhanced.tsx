import EnhancedPage from './EnhancedPage'

export default function AgentEnhanced() {
  return (
    <EnhancedPage
      title="Agent Management"
      description="Manage agent accounts and prepare assignment workflows."
      ctaLabel="Add Agent"
      cards={[
        { title: 'Total Agents', value: '42', trend: '2 new today' },
        { title: 'Active', value: '35', trend: 'Stable' },
        { title: 'Pending Verification', value: '4', trend: '1% up', trendUp: false },
        { title: 'Assigned Users', value: '8,230', trend: '5.2% vs last week' },
      ]}
      columns={['Agent ID', 'Name', 'Region', 'Assigned Users', 'Status']}
      rows={[
        ['AG-01', 'R. Kaur', 'India', '420', 'Active'],
        ['AG-02', 'S. Khan', 'UAE', '315', 'Active'],
        ['AG-03', 'D. Roy', 'EU', '0', 'Pending'],
      ]}
    />
  )
}

