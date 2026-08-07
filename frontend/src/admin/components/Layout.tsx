import Sidebar from './Sidebar'
import Header from './Header'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#020617] text-[#e2e8f0] overflow-x-hidden">
      <Sidebar />
      <div className="ml-64 min-w-0">
        <Header />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

