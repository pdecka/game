import EnhancedPage from './EnhancedPage'

export default function CurrencyEnhanced() {
  return (
    <EnhancedPage
      title="Currency Management"
      description="Enable or disable supported currencies and monitor usage."
      ctaLabel="Add Currency"
      cards={[
        { title: 'Supported', value: '3', trend: 'INR, USDT, BTC' },
        { title: 'Enabled', value: '3', trend: '100% active' },
        { title: 'Disabled', value: '0', trend: 'No inactive currencies' },
        { title: 'Last Update', value: 'Today', trend: 'Live' },
      ]}
      columns={['Code', 'Name', 'Type', 'Status', 'Updated']}
      rows={[
        ['INR', 'Indian Rupee', 'Fiat', 'Enabled', 'Today'],
        ['USDT', 'Tether', 'Crypto', 'Enabled', 'Today'],
        ['BTC', 'Bitcoin', 'Crypto', 'Enabled', 'Today'],
      ]}
    />
  )
}

