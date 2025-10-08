import { authManager } from '../../../api/client/auth'
import type { Role, CreateRoleRequest, UpdateRoleRequest } from '../types'

export const roleService = {
  async getRoles(): Promise<Role[]> {
    return await authManager.makeAuthenticatedRequest('/api/rbac/roles') as Role[]
  },

  async createRole(request: CreateRoleRequest): Promise<Role> {
    return await authManager.makeAuthenticatedRequest('/api/rbac/roles', {
      method: 'POST',
      body: JSON.stringify(request)
    }) as Role
  },

  async getRole(id: string): Promise<Role> {
    return await authManager.makeAuthenticatedRequest(`/api/rbac/roles/${id}`) as Role
  },

  async updateRole(id: string, request: UpdateRoleRequest): Promise<Role> {
    return await authManager.makeAuthenticatedRequest(`/api/rbac/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request)
    }) as Role
  },

  async deleteRole(id: string): Promise<void> {
    await authManager.makeAuthenticatedRequest(`/api/rbac/roles/${id}`, { method: 'DELETE' })
  },

  async assignPermissionsToRole(roleId: string, permissionIds: string[]): Promise<void> {
    await authManager.makeAuthenticatedRequest(`/api/rbac/roles/${roleId}/permissions`, {
      method: 'PUT',
      body: JSON.stringify({ permission_ids: permissionIds })
    })
  },

  async addPermissionToRole(roleId: string, permissionId: string): Promise<void> {
    await authManager.makeAuthenticatedRequest(`/api/rbac/roles/${roleId}/permissions/${permissionId}`, {
      method: 'POST'
    })
  },

  async removePermissionFromRole(roleId: string, permissionId: string): Promise<void> {
    await authManager.makeAuthenticatedRequest(`/api/rbac/roles/${roleId}/permissions/${permissionId}`, {
      method: 'DELETE'
    })
  },

  async assignRolesToUser(userId: string, roleIds: string[]): Promise<void> {
    await authManager.makeAuthenticatedRequest(`/api/users/${userId}/roles`, {
      method: 'PUT',
      body: JSON.stringify({ role_ids: roleIds })
    })
  }
}