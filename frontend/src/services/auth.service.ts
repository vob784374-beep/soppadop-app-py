import { authApi } from '@/api'
import type { LoginRequest, RegisterRequest, User } from '@/types'

class AuthService {
  async login(data: LoginRequest): Promise<User> {
    const res = await authApi.login(data)
    localStorage.setItem('access_token', res.access_token)
    localStorage.setItem('refresh_token', res.refresh_token)
    return res.user
  }

  async register(data: RegisterRequest) {
    return authApi.register(data)
  }

  async logout() {
    try { await authApi.logout() } catch { /* ignore */ }
    this.clearTokens()
  }

  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('access_token')
    if (!token) return null
    try {
      const { user } = await authApi.getMe()
      return user
    } catch {
      this.clearTokens()
      return null
    }
  }

  getToken(): string | null {
    return localStorage.getItem('access_token')
  }

  clearTokens() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  async resetPasswordRequest(email: string) {
    return authApi.resetPasswordRequest(email)
  }

  async resetPasswordVerify(email: string, code: string, newPassword: string) {
    return authApi.resetPasswordVerify(email, code, newPassword)
  }

  async updateEmailRequest(email: string, password: string) {
    return authApi.updateEmailRequest(email, password)
  }

  async updateEmailVerify(code: string) {
    return authApi.updateEmailVerify(code)
  }

  async updateUsernameRequest(username: string, password: string) {
    return authApi.updateUsernameRequest(username, password)
  }

  async updateUsernameVerify(code: string) {
    return authApi.updateUsernameVerify(code)
  }

  async getUsers(page = 1, perPage = 20) {
    return authApi.getUsers(page, perPage)
  }

  async updateUser(userId: number, data: Partial<User>) {
    return authApi.updateUser(userId, data)
  }

  async deleteUser(userId: number) {
    return authApi.deleteUser(userId)
  }

  async unlockAccount(email: string) {
    return authApi.unlockAccount(email)
  }
}

export const authService = new AuthService()
