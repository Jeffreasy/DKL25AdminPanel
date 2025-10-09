import { describe, it, expect, vi, beforeEach } from 'vitest'
import { permissionService } from '../permissionService'
import { authManager } from '../../../../api/client/auth'

vi.mock('../../../../api/client/auth', () => ({
  authManager: {
    makeAuthenticatedRequest: vi.fn()
  }
}))

describe('permissionService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getPermissions', () => {
    it('fetches permissions successfully', async () => {
      const mockPermissions = [
        { id: '1', resource: 'user', action: 'read', description: 'Read users', is_system_permission: true, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '2', resource: 'user', action: 'write', description: 'Write users', is_system_permission: true, created_at: '2024-01-02', updated_at: '2024-01-02' }
      ]

      vi.mocked(authManager.makeAuthenticatedRequest).mockResolvedValueOnce(mockPermissions)

      const result = await permissionService.getPermissions()

      expect(result).toEqual(mockPermissions)
    })

    it('handles fetch error', async () => {
      vi.mocked(authManager.makeAuthenticatedRequest).mockRejectedValueOnce(new Error('Fetch failed'))

      await expect(permissionService.getPermissions()).rejects.toThrow('Fetch failed')
    })
  })

  describe('createPermission', () => {
    it('creates permission successfully', async () => {
      const newPermission = {
        resource: 'photo',
        action: 'delete',
        description: 'Delete photos',
        is_system_permission: false
      }

      const createdPermission = { id: '3', ...newPermission, created_at: '2024-01-03', updated_at: '2024-01-03' }

      vi.mocked(authManager.makeAuthenticatedRequest).mockResolvedValueOnce(createdPermission)

      const result = await permissionService.createPermission(newPermission)

      expect(result).toEqual(createdPermission)
    })
  })

  describe('deletePermission', () => {
    it('deletes permission successfully', async () => {
      vi.mocked(authManager.makeAuthenticatedRequest).mockResolvedValueOnce(undefined)

      await permissionService.deletePermission('1')

      expect(authManager.makeAuthenticatedRequest).toHaveBeenCalled()
    })

    it('handles delete error', async () => {
      vi.mocked(authManager.makeAuthenticatedRequest).mockRejectedValueOnce(new Error('Delete failed'))

      await expect(permissionService.deletePermission('1')).rejects.toThrow('Delete failed')
    })
  })
})