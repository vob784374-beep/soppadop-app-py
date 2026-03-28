import apiClient from './client'
import type { AuthResponse, LoginRequest, RegisterRequest, User, PaginatedUsers } from '@/types'

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const res = await apiClient.post('/auth/login', data)
    return res.data
  },

  register: async (data: RegisterRequest): Promise<{ message: string; user: User }> => {
    const res = await apiClient.post('/auth/register', data)
    return res.data
  },

  getMe: async (): Promise<{ user: User }> => {
    const res = await apiClient.get('/auth/me')
    return res.data
  },

  logout: async (): Promise<{ message: string }> => {
    const res = await apiClient.post('/auth/logout')
    return res.data
  },

  getUsers: async (page = 1, perPage = 20): Promise<PaginatedUsers> => {
    const res = await apiClient.get('/auth/users', { params: { page, per_page: perPage } })
    return res.data
  },

  updateUser: async (userId: number, data: Partial<User>): Promise<{ message: string; user: User }> => {
    const res = await apiClient.put(`/auth/users/${userId}`, data)
    return res.data
  },

  deleteUser: async (userId: number): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/auth/users/${userId}`)
    return res.data
  },

  unlockAccount: async (email: string): Promise<{ message: string }> => {
    const res = await apiClient.post('/auth/unlock', { email })
    return res.data
  },

  resetPasswordRequest: async (email: string): Promise<{ message: string; verification_code?: string; expires_in: string }> => {
    const res = await apiClient.post('/auth/reset-password/request', { email })
    return res.data
  },

  resetPasswordVerify: async (email: string, code: string, newPassword: string): Promise<{ message: string }> => {
    const res = await apiClient.post('/auth/reset-password/verify', { email, verification_code: code, new_password: newPassword })
    return res.data
  },

  updateEmailRequest: async (email: string, password: string): Promise<{ message: string; verification_code?: string; expires_in: string }> => {
    const res = await apiClient.put('/auth/me/email/request', { email, password })
    return res.data
  },

  updateEmailVerify: async (code: string): Promise<{ message: string; user: User }> => {
    const res = await apiClient.put('/auth/me/email/verify', { verification_code: code })
    return res.data
  },

  updateUsernameRequest: async (username: string, password: string): Promise<{ message: string; verification_code?: string; expires_in: string }> => {
    const res = await apiClient.put('/auth/me/username/request', { username, password })
    return res.data
  },

  updateUsernameVerify: async (code: string): Promise<{ message: string; user: User }> => {
    const res = await apiClient.put('/auth/me/username/verify', { verification_code: code })
    return res.data
  },
}
