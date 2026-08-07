import ActionBar from '../components/ActionBar'
import StatCard from '../components/StatCard'
import TableComponent from '../components/TableComponent'

interface EnhancedPageProps {
  title: string
  description: string
  cards: { title: string; value: string; trend?: string; trendUp?: boolean }[]
  columns: string[]
  rows: string[][]
  ctaLabel: string
  onEditRow?: (row: string[], rowIndex: number) => void
}

export default function EnhancedPage({
  title,
  description,
  cards,
  columns,
  rows,
  ctaLabel,
  onEditRow,
}: EnhancedPageProps) {
  return (
    <section className="space-y-6">
      {title || description ? (
        <div>
          {title ? <h1 className="text-2xl font-semibold text-[#ffffff]">{title}</h1> : null}
          {description ? <p className="text-[#64748b] mt-1">{description}</p> : null}
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <StatCard key={card.title} {...card} />
        ))}
      </div>

      <ActionBar searchPlaceholder={`Search ${title.toLowerCase()}...`} primaryLabel={ctaLabel} />
      <TableComponent columns={columns} rows={rows} onEditRow={onEditRow} />
    </section>
  )
}

