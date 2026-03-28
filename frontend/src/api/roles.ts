import apiClient from './client'
import type { Role, Permission } from '@/types'

export const rolesApi = {
  list: async (): Promise<{ roles: Role[] }> => {
    const res = await apiClient.get('/roles')
    return res.data
  },

  get: async (id: number): Promise<{ role: Role }> => {
    const res = await apiClient.get(`/roles/${id}`)
    return res.data
  },

  create: async (data: { name: string; description?: string }): Promise<{ message: string; role: Role }> => {
    const res = await apiClient.post('/roles', data)
    return res.data
  },

  update: async (id: number, data: { name?: string; description?: string }): Promise<{ message: string; role: Role }> => {
    const res = await apiClient.put(`/roles/${id}`, data)
    return res.data
  },

  delete: async (id: number): Promise<{ message: string }> => {
    const res = await apiClient.delete(`/roles/${id}`)
    return res.data
  },

  getPermissions: async (): Promise<{ permissions: Permission[] }> => {
    const res = await apiClient.get('/permissions')
    return res.data
  },

  setPermissions: async (roleId: number, permissionIds: number[]): Promise<{ message: string; role: Role }> => {
    const res = await apiClient.put(`/roles/${roleId}/permissions`, { permission_ids: permissionIds })
    return res.data
  },

  addPermission: async (roleId: number, permissionId: number): Promise<{ message: string; role: Role }> => {
    const res = await apiClient.post(`/roles/${roleId}/permissions/${permissionId}`)
    return res.data
  },

  removePermission: async (roleId: number, permissionId: number): Promise<{ message: string; role: Role }> => {
    const res = await apiClient.delete(`/roles/${roleId}/permissions/${permissionId}`)
    return res.data
  },
}
