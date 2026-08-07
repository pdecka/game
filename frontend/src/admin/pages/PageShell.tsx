export default function PageShell({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <section className="rounded-xl border border-[#e2e8f0] bg-[#ffffff] p-6 shadow-sm">
      <h1 className="text-2xl font-semibold text-[#020617]">{title}</h1>
      <p className="mt-2 text-[#64748b]">{description}</p>
    </section>
  )
}

