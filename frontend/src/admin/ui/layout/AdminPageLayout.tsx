export default function AdminPageLayout({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: React.ReactNode
}) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[#ffffff]">{title}</h2>
        {description ? <p className="text-[#64748b] mt-1">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

