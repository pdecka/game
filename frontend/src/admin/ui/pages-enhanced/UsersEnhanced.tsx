'use client'

import { useEffect, useMemo, useState } from 'react'
import EnhancedPage from './EnhancedPage'
import ModalComponent from '../components/ModalComponent'
import FormComponent from '../components/FormComponent'
import { adminAuthService } from '../../services/adminAuthService'
import toast from 'react-hot-toast'

export default function UsersEnhanced() {
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<any[]>([])
  const [loadingUsers, setLoadingUsers] = useState(false)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoadingUsers(true)
        const data = await adminAuthService.getUsers()
        if (mounted) setUsers(data)
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Failed to load users')
      } finally {
        if (mounted) setLoadingUsers(false)
      }
    }

    load()
    return () => {
      mounted = false
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
      columns: ['Username', 'Mobile', 'Balance (INR)', 'Created At', 'Status'],
      rows: users.map((u) => [
        u.username || '-',
        u.mobile || '-',
        `₹${(Number(u.balanceINR) || 0).toFixed(2)}`,
        u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-',
        u.status || '-',
      ]),
    }
  }, [users, loadingUsers])

  return (
    <>
      <EnhancedPage
        title="Users Management"
        description="Search, filter, and manage casino users with action-ready controls."
        ctaLabel="Create User"
        cards={cards}
        columns={columns}
        rows={rows}
      />

      <div className="mt-4">
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg bg-[#22c55e] hover:opacity-90 text-[#ffffff] font-medium px-4 py-2 transition-all duration-200"
        >
          Open Create User Modal
        </button>
      </div>

      <ModalComponent open={open} title="Create User" onClose={() => setOpen(false)}>
        <FormComponent
          fields={[
            { label: 'Name', placeholder: 'Enter full name' },
            { label: 'Email', type: 'email', placeholder: 'name@example.com' },
            { label: 'Initial Balance', type: 'number', placeholder: '0' },
            { label: 'Status', placeholder: 'Active / Pending / VIP' },
          ]}
        />
      </ModalComponent>
    </>
  )
}

