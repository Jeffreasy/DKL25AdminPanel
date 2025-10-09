import { describe, it, expect, vi, beforeEach } from 'vitest'
import { userService } from '../userService'
import { authManager } from '../../../../api/client/auth'

// Mock authManager
vi.mock('../../../../api/client/auth', () => ({
  authManager: {
    makeAuthenticatedRequest: vi.fn()
  }
}))

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUsers', () => {
    it('fetches users successfully', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@test.com', naam: 'User 1', rol: 'admin', is_actief: true, newsletter_subscribed: false, created_at: '2024-01-01', updated_at: '2024-01-01' },
        { id: '2', email: 'user2@test.com', naam: 'User 2', rol: 'user', is_actief: true, newsletter_subscribed: true, created_at: '2024-01-02', updated_at: '2024-01-02' }
      ]

      vi.mocked(authManager.makeAuthenticatedRequest).mockResolvedValueOnce(mockUsers)

      const result = await userService.getUsers()

      expect(result).toEqual(mockUsers)
      expect(authManager.makeAuthenticatedRequest).toHaveBeenCalledWith('/api/users?limit=50&offset=0')
    })

    it('accepts custom limit and offset', async () => {
      vi.mocked(authManager.makeAuthenticatedRequest).mockResolvedValueOnce([])

      await userService.getUsers(100, 50)

      expect(authManager.makeAuthenticatedRequest).toHaveBeenCalledWith('/api/users?limit=100&offset=50')
    })

    it('handles fetch error', async () => {
      vi.mocked(authManager.makeAuthenticatedRequest).mockRejectedValueOnce(new Error('Fetch failed'))

      await expect(userService.getUsers()).rejects.toThrow('Fetch failed')
    })
  })

  describe('createUser', () => {
    it('creates user successfully', async () => {
      const newUser = {
        email: 'new@test.com',
        naam: 'New User',
        rol: 'user',
        password: 'password123',
        is_actief: true,
        newsletter_subscribed: false
      }

      const createdUser = { id: '3', ...newUser, created_at: '2024-01-03', updated_at: '2024-01-03' }

      vi.mocked(authManager.makeAuthenticatedRequest).mockResolvedValueOnce(createdUser)

      const result = await userService.createUser(newUser)

      expect(result).toEqual(createdUser)
      expect(authManager.makeAuthenticatedRequest).toHaveBeenCalledWith('/api/users', {
        method: 'POST',
        body: JSON.stringify(newUser)
      })
    })

    it('handles create error', async () => {
      const newUser = {
        email: 'new@test.com',
        naam: 'New User',
        rol: 'user',
        password: 'password123',
        is_actief: true,
        newsletter_subscribed: false
      }

      vi.mocked(authManager.makeAuthenticatedRequest).mockRejectedValueOnce(new Error('Create failed'))

      await expect(userService.createUser(newUser)).rejects.toThrow('Create failed')
    })
  })

  describe('getUser', () => {
    it('fetches single user successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'user@test.com',
        naam: 'Test User',
        rol: 'admin',
        is_actief: true,
        newsletter_subscribed: false,
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      }

      vi.mocked(authManager.makeAuthenticatedRequest).mockResolvedValueOnce(mockUser)

      const result = await userService.getUser('1')

      expect(result).toEqual(mockUser)
      expect(authManager.makeAuthenticatedRequest).toHaveBeenCalledWith('/api/users/1')
    })
  })

  describe('updateUser', () => {
    it('updates user successfully', async () => {
      const updates = { naam: 'Updated Name' }
      const updatedUser = {
        id: '1',
        email: 'user@test.com',
        naam: 'Updated Name',
        rol: 'admin',
        is_actief: true,
        newsletter_subscribed: false,
        created_at: '2024-01-01',
        updated_at: '2024-01-02'
      }

      vi.mocked(authManager.makeAuthenticatedRequest).mockResolvedValueOnce(updatedUser)

      const result = await userService.updateUser('1', updates)

      expect(result).toEqual(updatedUser)
      expect(authManager.makeAuthenticatedRequest).toHaveBeenCalledWith('/api/users/1', {
        method: 'PUT',
        body: JSON.stringify(updates)
      })
    })

    it('handles update error', async () => {
      vi.mocked(authManager.makeAuthenticatedRequest).mockRejectedValueOnce(new Error('Update failed'))

      await expect(userService.updateUser('1', { naam: 'Test' })).rejects.toThrow('Update failed')
    })
  })

  describe('deleteUser', () => {
    it('deletes user successfully', async () => {
      vi.mocked(authManager.makeAuthenticatedRequest).mockResolvedValueOnce(undefined)

      await userService.deleteUser('1')

      expect(authManager.makeAuthenticatedRequest).toHaveBeenCalledWith('/api/users/1', { method: 'DELETE' })
    })

    it('handles delete error', async () => {
      vi.mocked(authManager.makeAuthenticatedRequest).mockRejectedValueOnce(new Error('Delete failed'))

      await expect(userService.deleteUser('1')).rejects.toThrow('Delete failed')
    })
  })
})