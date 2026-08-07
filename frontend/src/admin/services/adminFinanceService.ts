'use client'

import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://game-20eg.onrender.com/api'
const ADMIN_TOKEN_KEY = 'admin_token'

const adminApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

adminApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY)
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export type FinanceStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | string

export interface PaymentRequestRow {
  id: string
  userId: string
  username: string
  email?: string | null
  mobile: string | null
  amount: number
  currency: string
  method: string
  status: FinanceStatus
  reference?: string | null
  transactionId?: string | null
  createdAt: string | Date
  updatedAt: string | Date
  bank?: any
  screenshotUrl?: string | null
  txHash?: string | null
  payoutReference?: string | null
  payoutScreenshotUrl?: string | null
}

export interface DepositListResponse {
  items: PaymentRequestRow[]
  total: number
}

export const adminFinanceService = {
  async getDeposits(params?: { status?: string; username?: string; userId?: string; from?: string; to?: string; limit?: number; offset?: number }) {
    const res = await adminApi.get('/admin/payments/deposits', { params })
    return res.data as DepositListResponse
  },

  async approveDeposit(paymentId: string) {
    const res = await adminApi.patch(`/admin/payments/deposits/${paymentId}/approve`)
    return res.data
  },

  async rejectDeposit(paymentId: string, reason: string) {
    const res = await adminApi.patch(`/admin/payments/deposits/${paymentId}/reject`, { reason })
    return res.data
  },

  async getWithdrawals(params?: { status?: string; username?: string; userId?: string; from?: string; to?: string; limit?: number; offset?: number }) {
    const res = await adminApi.get('/admin/payments/withdrawals', { params })
    return res.data as DepositListResponse
  },

  async approveWithdrawal(paymentId: string, payload?: { payoutReference?: string; payoutScreenshotUrl?: string }) {
    const res = await adminApi.post(`/admin/withdrawals/${paymentId}/approve`, payload ?? {})
    return res.data
  },

  async rejectWithdrawal(paymentId: string, reason: string) {
    const res = await adminApi.patch(`/admin/payments/withdrawals/${paymentId}/reject`, { reason })
    return res.data
  },

  async getBankAccounts() {
    const res = await adminApi.get('/admin/bank-accounts')
    return res.data
  },

  async upsertBankAccount(payload: {
    id?: string
    bankName: string
    accountHolder: string
    accountNumber: string
    ifsc: string
    status?: string
  }) {
    if (payload.id) {
      const res = await adminApi.patch(`/admin/bank-accounts/${payload.id}`, payload)
      return res.data
    }
    const res = await adminApi.post('/admin/bank-accounts', payload)
    return res.data
  },

  async getFinancialReport(params?: { from?: string; to?: string; userId?: string }) {
    const res = await adminApi.get('/admin/reports/financial', { params })
    return res.data
  },
}

