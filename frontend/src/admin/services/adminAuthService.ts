'use client'

import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://game-20eg.onrender.com/api'
const ADMIN_TOKEN_KEY = 'admin_token'
const ADMIN_USER_KEY = 'admin_user'

export interface AdminUser {
  id: string
  email: string
  username: string
  role: string
  status: string
  mobile?: string | null
  balanceINR?: number
  createdAt?: string | Date
}

export interface GameSetting {
  id: string
  gameType: string
  enabled: boolean
  rtp: number
  houseEdge: number
  currency: string
  minBet: number
  maxBet: number
  maxWin: number
  manualOverride: boolean
  forceWin: boolean | null
  winChance: number | null
  createdAt?: string | Date
  updatedAt?: string | Date
}

interface AdminAuthResponse {
  access_token: string
  refresh_token: string
  user: AdminUser
}

const adminApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

adminApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

export const adminAuthService = {
  async signup(email: string, username: string, password: string, role?: string, signupCode?: string) {
    const response = await adminApi.post('/admin/auth/signup', {
      email,
      username,
      password,
      role,
      ...(signupCode ? { signupCode } : {}),
    })
    return response.data
  },

  async login(email: string, password: string): Promise<AdminAuthResponse> {
    const response = await adminApi.post('/admin/auth/login', { email, password })
    const data = response.data
    localStorage.setItem(ADMIN_TOKEN_KEY, data.access_token)
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(data.user))
    return data
  },

  async getProfile() {
    const response = await adminApi.get('/admin/auth/profile')
    return response.data
  },

  async getUsers(): Promise<AdminUser[]> {
    const response = await adminApi.get('/admin/users')
    return response.data
  },

  async listBlogs() {
    const response = await adminApi.get('/admin/blogs')
    return response.data as any[]
  },

  async createBlog(payload: { title: string; slug?: string; content: string; imageUrl?: string; status?: string }) {
    const response = await adminApi.post('/admin/blogs', payload)
    return response.data
  },

  async updateBlog(
    id: string,
    payload: Partial<{ title: string; slug: string; content: string; imageUrl: string; status: string }>,
  ) {
    const response = await adminApi.patch(`/admin/blogs/${id}`, payload)
    return response.data
  },

  async deleteBlog(id: string) {
    const response = await adminApi.delete(`/admin/blogs/${id}`)
    return response.data
  },

  async getDashboard(params?: { from?: string; to?: string }) {
    const response = await adminApi.get('/admin/dashboard', { params })
    return response.data as {
      totalUsers: number
      activeUsers: number
      totalDeposits: number
      totalWithdrawals: number
      totalBets: number
      totalWins: number
      totalLosses: number
      profitLoss: number
      pendingDeposits: number
      pendingWithdrawals: number
      pendingKYC: number
      fraudAlerts: number
    }
  },

  async getGameSettings(): Promise<GameSetting[]> {
    const response = await adminApi.get('/admin/game-settings')
    return response.data
  },

  async updateGameSetting(payload: Partial<GameSetting> & { gameType: string }): Promise<GameSetting> {
    const response = await adminApi.post('/admin/game-settings', payload)
    return response.data
  },

  getToken() {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(ADMIN_TOKEN_KEY)
  },

  getCurrentAdmin(): AdminUser | null {
    if (typeof window === 'undefined') return null
    const raw = localStorage.getItem(ADMIN_USER_KEY)
    return raw ? (JSON.parse(raw) as AdminUser) : null
  },

  isAuthenticated() {
    return Boolean(this.getToken())
  },

  isAdminRole() {
    const user = this.getCurrentAdmin()
    if (!user) return false
    return ['admin', 'finance', 'risk_manager'].includes(user.role)
  },

  logout() {
    localStorage.removeItem(ADMIN_TOKEN_KEY)
    localStorage.removeItem(ADMIN_USER_KEY)
    window.location.href = '/admin/login'
  },
}

