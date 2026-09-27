import api from './api'

export interface User {
  id: string
  email?: string
  username: string
  role: string
  status: string
  twoFactorEnabled: boolean
}

export interface LoginResponse {
  access_token: string
  refresh_token: string
  user: User
}

export const authService = {
  async register(
    email: string | undefined,
    username: string,
    password: string,
    phone: string,
    countryCode: string,
    referralCode?: string,
  ) {
    const response = await api.post('/auth/register', {
      email,
      username,
      password,
      phone,
      countryCode,
      referralCode,
    })
    return response.data
  },

  async login(identifier: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/auth/login', { email: identifier, password })
    const data = response.data
    localStorage.setItem('token', data.access_token)
    localStorage.setItem('user', JSON.stringify(data.user))
    return data
  },

  async verifyOtp(identifier: string, otp: string) {
    const response = await api.post('/auth/verify-otp', { email: identifier, otp })
    return response.data
  },

  async getProfile(): Promise<User> {
    const response = await api.get('/auth/profile')
    return response.data
  },

  async enable2FA() {
    const response = await api.post('/auth/enable-2fa')
    return response.data
  },

  async confirm2FA(token: string) {
    const response = await api.post('/auth/confirm-2fa', { token })
    return response.data
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/auth/login'
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  getToken(): string | null {
    return localStorage.getItem('token')
  },
}
