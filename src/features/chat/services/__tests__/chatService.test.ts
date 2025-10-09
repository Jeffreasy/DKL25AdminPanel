import { describe, it, expect, vi, beforeEach } from 'vitest'
import { chatService, getUserId, connectWebSocket } from '../chatService'
import { authManager } from '@/api/client/auth'

vi.mock('@/api/client/auth', () => ({
  authManager: {
    makeAuthenticatedRequest: vi.fn(),
    getToken: vi.fn(),
  },
}))

vi.mock('@/api/client/cloudinary', () => ({
  uploadToCloudinary: vi.fn(),
}))

vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn(() => ({ sub: 'user-123' })),
}))

describe('chatService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUserId', () => {
    it('returns user ID from token', () => {
      vi.mocked(authManager.getToken).mockReturnValue('valid-token')
      
      const userId = getUserId()
      
      expect(userId).toBe('user-123')
    })

    it('throws error when no token', () => {
      vi.mocked(authManager.getToken).mockReturnValue(null)
      
      expect(() => getUserId()).toThrow('User not authenticated')
    })
  })

  describe('getChannels', () => {
    it('fetches channels successfully', async () => {
      const mockChannels = [
        { id: '1', name: 'Channel 1', type: 'public' },
        { id: '2', name: 'Channel 2', type: 'private' },
      ]

      vi.mocked(authManager.makeAuthenticatedRequest).mockResolvedValue(mockChannels)

      const result = await chatService.getChannels()

      expect(result).toHaveLength(2)
      expect(result[0].participants).toEqual([])
      expect(authManager.makeAuthenticatedRequest).toHaveBeenCalledWith('/api/chat/channels')
    })
  })

  describe('createChannel', () => {
    it('creates channel successfully', async () => {
      const newChannel = { id: '1', name: 'New Channel', type: 'public' as const }
      vi.mocked(authManager.makeAuthenticatedRequest).mockResolvedValue(newChannel)

      const result = await chatService.createChannel({
        name: 'New Channel',
        type: 'public',
      })

      expect(result).toEqual(newChannel)
    })
  })

  describe('getMessages', () => {
    it('fetches messages with user details', async () => {
      const mockMessages = [
        { id: '1', content: 'Hello', user_id: 'u1', user_name: 'User 1' },
      ]

      vi.mocked(authManager.makeAuthenticatedRequest).mockResolvedValue(mockMessages)

      const result = await chatService.getMessages('channel-1')

      expect(result).toHaveLength(1)
      expect(result[0].user.full_name).toBe('User 1')
    })

    it('applies limit and offset', async () => {
      vi.mocked(authManager.makeAuthenticatedRequest).mockResolvedValue([])

      await chatService.getMessages('channel-1', 20, 10)

      expect(authManager.makeAuthenticatedRequest).toHaveBeenCalledWith(
        expect.stringContaining('limit=20&offset=10')
      )
    })
  })

  describe('sendMessage', () => {
    it('sends message successfully', async () => {
      const mockMessage = { id: '1', content: 'Test', channel_id: 'ch1' }
      vi.mocked(authManager.makeAuthenticatedRequest).mockResolvedValue(mockMessage)

      const result = await chatService.sendMessage({
        channel_id: 'ch1',
        content: 'Test',
      })

      expect(result).toEqual(mockMessage)
    })
  })

  describe('editMessage', () => {
    it('edits message successfully', async () => {
      const mockMessage = { id: '1', content: 'Updated' }
      vi.mocked(authManager.makeAuthenticatedRequest).mockResolvedValue(mockMessage)

      const result = await chatService.editMessage('1', { content: 'Updated' })

      expect(result).toEqual(mockMessage)
    })
  })

  describe('deleteMessage', () => {
    it('deletes message successfully', async () => {
      vi.mocked(authManager.makeAuthenticatedRequest).mockResolvedValue(undefined)

      await chatService.deleteMessage('1')

      expect(authManager.makeAuthenticatedRequest).toHaveBeenCalledWith(
        '/api/chat/messages/1',
        { method: 'DELETE' }
      )
    })
  })

  describe('formatFileSize', () => {
    it('formats bytes correctly', () => {
      expect(chatService.formatFileSize(0)).toBe('0 Bytes')
      expect(chatService.formatFileSize(1024)).toBe('1 KB')
      expect(chatService.formatFileSize(1048576)).toBe('1 MB')
      expect(chatService.formatFileSize(1073741824)).toBe('1 GB')
    })

    it('formats decimal values', () => {
      expect(chatService.formatFileSize(1536)).toBe('1.5 KB')
      expect(chatService.formatFileSize(2621440)).toBe('2.5 MB')
    })
  })

  describe('isImageFile', () => {
    it('returns true for image files', () => {
      const imageFile = new File([''], 'test.png', { type: 'image/png' })
      expect(chatService.isImageFile(imageFile)).toBe(true)
    })

    it('returns false for non-image files', () => {
      const textFile = new File([''], 'test.txt', { type: 'text/plain' })
      expect(chatService.isImageFile(textFile)).toBe(false)
    })
  })

  describe('presence', () => {
    it('updates presence status', async () => {
      vi.mocked(authManager.makeAuthenticatedRequest).mockResolvedValue(undefined)

      await chatService.updatePresence('away')

      expect(authManager.makeAuthenticatedRequest).toHaveBeenCalledWith(
        '/api/chat/presence',
        expect.objectContaining({ method: 'PUT' })
      )
    })

    it('gets online users', async () => {
      const mockUsers = [{ id: '1', name: 'User 1' }]
      vi.mocked(authManager.makeAuthenticatedRequest).mockResolvedValue(mockUsers)

      const result = await chatService.getOnlineUsers()

      expect(result).toHaveLength(1)
      expect(result[0].full_name).toBe('User 1')
    })
  })

  describe('typing indicators', () => {
    it('starts typing', async () => {
      vi.mocked(authManager.makeAuthenticatedRequest).mockResolvedValue(undefined)

      await chatService.startTyping('channel-1')

      expect(authManager.makeAuthenticatedRequest).toHaveBeenCalledWith(
        '/api/chat/channels/channel-1/typing/start',
        { method: 'POST' }
      )
    })

    it('stops typing', async () => {
      vi.mocked(authManager.makeAuthenticatedRequest).mockResolvedValue(undefined)

      await chatService.stopTyping('channel-1')

      expect(authManager.makeAuthenticatedRequest).toHaveBeenCalledWith(
        '/api/chat/channels/channel-1/typing/stop',
        { method: 'POST' }
      )
    })
  })

  describe('utility methods', () => {
    it('marks channel as read', async () => {
      vi.mocked(authManager.makeAuthenticatedRequest).mockResolvedValue(undefined)

      await chatService.markChannelAsRead('channel-1')

      expect(authManager.makeAuthenticatedRequest).toHaveBeenCalled()
    })

    it('gets unread count', async () => {
      vi.mocked(authManager.makeAuthenticatedRequest).mockResolvedValue({ unread: 5 })

      const count = await chatService.getUnreadCount()

      expect(count).toBe(5)
    })
  })
})