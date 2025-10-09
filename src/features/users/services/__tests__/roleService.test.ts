import { describe, it, expect, vi, beforeEach } from 'vitest'
import { roleService } from '../roleService'
import { authManager } from '../../../../api/client/auth'

vi.mock('../../../../api/client/auth', () => ({
  authManager: {
    makeAuthenticatedRequest: vi.fn()
  }
}))

describe('roleService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getRoles', () => {
    it('fetches roles successfully', async () => {
      const mockRoles = [
        { id: '1', name: 'admin', description: 'Administrator', created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '2', name: 'user', description: 'Regular User', created_at: '2024-01-02', updated_at: '2024-01-02' }
      ]

      vi.mocked(authManager.makeAuthenticatedRequest).mockResolvedValueOnce(mockRoles)

      const result = await roleService.getRoles()

      expect(result).toEqual(mockRoles)
    })
  })

  describe('createRole', () => {
    it('creates role successfully', async () => {
      const newRole = { name: 'editor', description: 'Content Editor' }
      const createdRole = { id: '3', ...newRole, created_at: '2024-01-03', updated_at: '2024-01-03' }

      vi.mocked(authManager.makeAuthenticatedRequest).mockResolvedValueOnce(createdRole)

      const result = await roleService.createRole(newRole)

      expect(result).toEqual(createdRole)
    })
  })

  describe('updateRole', () => {
    it('updates role successfully', async () => {
      const updates = { description: 'Updated Description' }
      const updatedRole = { id: '1', name: 'admin', description: 'Updated Description', created_at: '2024-01-01', updated_at: '2024-01-02' }

      vi.mocked(authManager.makeAuthenticatedRequest).mockResolvedValueOnce(updatedRole)

      const result = await roleService.updateRole('1', updates)

      expect(result).toEqual(updatedRole)
    })
  })

  describe('deleteRole', () => {
    it('deletes role successfully', async () => {
      vi.mocked(authManager.makeAuthenticatedRequest).mockResolvedValueOnce(undefined)

      await roleService.deleteRole('1')

      expect(authManager.makeAuthenticatedRequest).toHaveBeenCalled()
    })
  })

  describe('assignPermissionsToRole', () => {
    it('assigns permissions successfully', async () => {
      const permissionIds = ['perm1', 'perm2']

      vi.mocked(authManager.makeAuthenticatedRequest).mockResolvedValueOnce({ success: true })

      await roleService.assignPermissionsToRole('1', permissionIds)

      expect(authManager.makeAuthenticatedRequest).toHaveBeenCalled()
    })
  })
})