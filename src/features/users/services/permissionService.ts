import { authManager } from '../../../api/client/auth'
import type { PermissionWithId, CreatePermissionRequest } from '../types'

export const permissionService = {
  async getPermissions(): Promise<PermissionWithId[]> {
    return await authManager.makeAuthenticatedRequest('/api/rbac/permissions') as PermissionWithId[]
  },

  async createPermission(request: CreatePermissionRequest): Promise<PermissionWithId> {
    return await authManager.makeAuthenticatedRequest('/api/rbac/permissions', {
      method: 'POST',
      body: JSON.stringify(request)
    }) as PermissionWithId
  },

  async getPermission(id: string): Promise<PermissionWithId> {
    return await authManager.makeAuthenticatedRequest(`/api/rbac/permissions/${id}`) as PermissionWithId
  },

  async updatePermission(id: string, request: Partial<CreatePermissionRequest>): Promise<PermissionWithId> {
    return await authManager.makeAuthenticatedRequest(`/api/rbac/permissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request)
    }) as PermissionWithId
  },

  async deletePermission(id: string): Promise<void> {
    await authManager.makeAuthenticatedRequest(`/api/rbac/permissions/${id}`, { method: 'DELETE' })
  }
}