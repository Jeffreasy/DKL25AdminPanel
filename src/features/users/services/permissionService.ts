import { authManager } from '../../../api/client/auth'
import type { PermissionWithId, CreatePermissionRequest, GroupedPermissionsResponse } from '../types'

export const permissionService = {
  async getPermissions(): Promise<GroupedPermissionsResponse> {
    return await authManager.makeAuthenticatedRequest('/api/rbac/permissions') as GroupedPermissionsResponse
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