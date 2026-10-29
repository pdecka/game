'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import EnhancedPage from './EnhancedPage'
import CreatePlayerModal from '../components/CreatePlayerModal'
import { adminAuthService } from '../../services/adminAuthService'
import toast from 'react-hot-toast'

export default function UsersEnhanced() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async (silent = false) => {
      try {
        if (!silent) setLoadingUsers(true)
        const data = await adminAuthService.getUsers()
        if (mounted) setUsers(data)
      } catch (err: any) {
        if (!silent) toast.error(err?.response?.data?.message || 'Failed to load users')
      } finally {
        if (mounted && !silent) setLoadingUsers(false)
      }
    }

    load()
    const timer = window.setInterval(() => {
      if (document.hidden) return
      void load(true)
    }, 5000)
    return () => {
      mounted = false
      window.clearInterval(timer)
    }
  }, [])

  const { cards, columns, rows } = useMemo(() => {
    const total = users.length
    const activeCount = users.filter((u) => u.status === 'active').length
    const pendingCount = Math.max(0, total - activeCount)
    const avgBalance =
      total > 0 ? users.reduce((sum, u) => sum + (Number(u.balanceINR) || 0), 0) / total : 0

    return {
      cards: [
        { title: 'Registered Users', value: loadingUsers ? '...' : String(total) },
        { title: 'Active', value: loadingUsers ? '...' : String(activeCount) },
        { title: 'Pending', value: loadingUsers ? '...' : String(pendingCount), trendUp: false },
        { title: 'Avg Balance', value: loadingUsers ? '...' : `₹${avgBalance.toFixed(2)}` },
      ],
      columns: ['Username', 'Email', 'Mobile', 'Balance (INR)', 'Created At', 'Status'],
      rows: users.map((u) => [
        u.username || '-',
        u.email || '-',
        u.mobile || '-',
        `₹${(Number(u.balanceINR) || 0).toFixed(2)}`,
        u.createdAt ? new Date(u.createdAt).toLocaleString() : '-',
        u.status || '-',
      ]),
    }
  }, [users, loadingUsers])

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Link
          href="/admin/bet-history"
          className="rounded-lg border border-[#16a34a] bg-white px-4 py-2 text-sm font-medium text-[#14532d] hover:bg-[#f0fdf4]"
        >
          All bet history
        </Link>
      </div>
      <EnhancedPage
        title="Users Management"
        description="Live player accounts. Create a username and password so a client can log in immediately."
        ctaLabel="Add User"
        onPrimaryAction={() => setOpen(true)}
        showFilters={false}
        cards={cards}
        columns={columns}
        rows={rows}
        extraAction={{
          label: 'Bets',
          onClick: (row) => {
            const match = users.find((user) => user.username === row[0])
            if (!match?.id) {
              toast.error('Could not open this player')
              return
            }
            router.push(`/admin/bet-history?userId=${match.id}`)
          },
        }}
      />
      <CreatePlayerModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
