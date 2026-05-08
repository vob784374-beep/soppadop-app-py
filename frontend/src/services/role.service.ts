import { rolesApi } from '@/api'
import type { Role, Permission } from '@/types'

class RoleService {
  async list(): Promise<Role[]> {
    const { roles } = await rolesApi.list()
    return roles
  }

  async listWithUserCount(): Promise<Role[]> {
    const { roles } = await rolesApi.list()
    // For each role, fetch user count
    const rolesWithCount = await Promise.all(
      roles.map(async (r) => {
        try {
          const users = await this.getUsersByRole(r.id)
          return { ...r, user_count: users.length, users }
        } catch {
          return { ...r, user_count: 0, users: [] }
        }
      })
    )
    return rolesWithCount
  }

  async getUsersByRole(roleId: number) {
    const { users } = await rolesApi.getUsers(roleId)
    return users
  }

  async get(id: number): Promise<Role> {
    const { role } = await rolesApi.get(id)
    return role
  }

  async create(name: string, description?: string) {
    return rolesApi.create({ name, description })
  }

  async update(id: number, data: { name?: string; description?: string }) {
    return rolesApi.update(id, data)
  }

  async delete(id: number) {
    return rolesApi.delete(id)
  }

  async getPermissions(): Promise<Permission[]> {
    const { permissions } = await rolesApi.getPermissions()
    return permissions
  }

  async addPermission(roleId: number, permissionId: number) {
    return rolesApi.addPermission(roleId, permissionId)
  }

  async removePermission(roleId: number, permissionId: number) {
    return rolesApi.removePermission(roleId, permissionId)
  }

  async setPermissions(roleId: number, permissionIds: number[]) {
    return rolesApi.setPermissions(roleId, permissionIds)
  }

  async togglePermission(roleId: number, permId: number, has: boolean) {
    if (has) return this.removePermission(roleId, permId)
    return this.addPermission(roleId, permId)
  }
}

export const roleService = new RoleService()
