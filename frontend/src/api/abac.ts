import apiClient from './client'
import type { PolicyRule } from '@/types'

export const abacApi = {
  list: async (): Promise<{ policies: PolicyRule[]; total: number }> => {
    const res = await apiClient.get('/abac/policies')
    return res.data
  },

  get: async (id: number): Promise<{ policy: PolicyRule }> => {
    const res = await apiClient.get(`/abac/policies/${id}`)
    return res.data
  },

  create: async (data: {
    name: string
    description?: string
    priority?: number
    effect: 'allow' | 'deny'
    actions?: string[]
    resources?: string[]
    conditions?: Record<string, unknown>
    is_active?: boolean
  }): Promise<{ policy: PolicyRule }> => {
    const res = await apiClient.post('/abac/policies', data)
    return res.data
  },

  update: async (id: number, data: Partial<PolicyRule>): Promise<{ policy: PolicyRule }> => {
    const res = await apiClient.put(`/abac/policies/${id}`, data)
    return res.data
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/abac/policies/${id}`)
    return res.data
  },

  toggle: async (id: number, is_active: boolean): Promise<{ policy: PolicyRule }> => {
    const res = await apiClient.patch(`/abac/policies/${id}/active`, { is_active })
    return res.data
  },
}