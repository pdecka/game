interface StatCardProps {
  title: string
  value: string
  trend?: string
  trendUp?: boolean
}

export default function StatCard({ title, value, trend, trendUp = true }: StatCardProps) {
  return (
    <div className="rounded-xl bg-[#ffffff] border border-[#e2e8f0] p-4 shadow-sm transition-all duration-200 hover:shadow-md">
      <p className="text-[#64748b] text-sm">{title}</p>
      <p className="text-2xl font-semibold text-[#020617] mt-1">{value}</p>
      {trend ? (
        <p className={`text-xs mt-2 ${trendUp ? 'text-[#22c55e]' : 'text-[#64748b]'}`}>
          {trendUp ? '↑' : '↓'} {trend}
        </p>
      ) : null}
    </div>
  )
}

