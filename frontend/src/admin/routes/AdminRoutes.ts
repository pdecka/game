export interface AdminNavItem {
  label: string
  href: string
}

export const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Currency', href: '/admin/currency' },
  { label: 'Bank Accounts', href: '/admin/bank-accounts' },
  { label: 'Accounts', href: '/admin/accounts' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Bet History', href: '/admin/bet-history' },
  { label: 'Agent', href: '/admin/agent' },
  { label: 'Game Management', href: '/admin/game-management' },
  { label: 'Deposits', href: '/admin/deposits' },
  { label: 'Withdrawals', href: '/admin/withdrawals' },
  { label: 'Reports', href: '/admin/reports' },
  { label: 'Blogs', href: '/admin/blogs' },
  { label: 'Settings', href: '/admin/settings' },
]

