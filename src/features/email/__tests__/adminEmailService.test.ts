import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { adminEmailService } from '../adminEmailService'

// Mock fetch
global.fetch = vi.fn()

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
global.localStorage = localStorageMock as any

// Mock config
vi.mock('../../../config/api.config', () => ({
  apiConfig: {
    emailURL: 'https://test-email-api.com',
    emailApiKey: 'test-api-key'
  },
  emailConfig: {
    defaultFromAddress: 'test@example.com'
  }
}))

describe('adminEmailService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('sendEmail', () => {
    it('should send email with JWT token when available', async () => {
      // Mock JWT token in localStorage
      vi.mocked(localStorageMock.getItem).mockReturnValue('mock-jwt-token')

      // Mock successful fetch response
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email-123' })
      } as Response)

      // Mock logEmailEvent
      const logSpy = vi.spyOn(adminEmailService, 'logEmailEvent').mockResolvedValue(undefined)

      const result = await adminEmailService.sendEmail({
        to: 'recipient@example.com',
        subject: 'Test Subject',
        body: '<p>Test body</p>'
      })

      expect(result).toEqual({ success: true, id: 'email-123' })
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test-email-api.com/api/mail/send',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer mock-jwt-token'
          })
        })
      )
      expect(logSpy).toHaveBeenCalled()
    })

    it('should send email via API key when no JWT token', async () => {
      // Mock no JWT token
      vi.mocked(localStorageMock.getItem).mockReturnValue(null)

      // Mock successful fetch response
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ messageId: 'msg-456' })
      } as Response)

      const logSpy = vi.spyOn(adminEmailService, 'logEmailEvent').mockResolvedValue(undefined)

      const result = await adminEmailService.sendEmail({
        to: 'recipient@example.com',
        subject: 'Test Subject',
        body: '<p>Test body</p>'
      })

      expect(result).toEqual({ success: true, id: 'msg-456' })
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test-email-api.com/api/mail/send',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-api-key'
          })
        })
      )
      expect(logSpy).toHaveBeenCalled()
    })

    it('should use default from address when not provided', async () => {
      vi.mocked(localStorageMock.getItem).mockReturnValue(null)
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'email-789' })
      } as Response)

      const logSpy = vi.spyOn(adminEmailService, 'logEmailEvent').mockResolvedValue(undefined)

      await adminEmailService.sendEmail({
        to: 'recipient@example.com',
        subject: 'Test',
        body: 'Test'
      })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: expect.stringContaining('"from":"test@example.com"')
        })
      )
      expect(logSpy).toHaveBeenCalled()
    })

    it('should throw error when fetch fails', async () => {
      vi.mocked(localStorageMock.getItem).mockReturnValue(null)
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
        text: async () => JSON.stringify({ error: 'Server error' })
      } as Response)

      await expect(
        adminEmailService.sendEmail({
          to: 'recipient@example.com',
          subject: 'Test',
          body: 'Test'
        })
      ).rejects.toThrow('Server error')
    })
  })

  describe('getAllEmails', () => {
    it('should fetch and map emails correctly', async () => {
      const mockResponse = {
        emails: [
          {
            id: '1',
            message_id: 'msg-1',
            sender: 'sender@example.com',
            to: 'recipient@example.com',
            subject: 'Test Email',
            html: '<p>Test content</p>',
            content_type: 'text/html',
            received_at: '2024-01-01T12:00:00Z',
            uid: 'uid-1',
            account_type: 'info',
            read: false,
            processed_at: null,
            created_at: '2024-01-01T12:00:00Z',
            updated_at: '2024-01-01T12:00:00Z'
          }
        ],
        totalCount: 1
      }

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await adminEmailService.getAllEmails(10, 0)

      expect(result.emails).toHaveLength(1)
      expect(result.totalCount).toBe(1)
      expect(result.emails[0].subject).toBe('Test Email')
    })

    it('should handle invalid response format', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ invalid: 'format' })
      } as Response)

      await expect(adminEmailService.getAllEmails()).rejects.toThrow(
        'Onverwacht formaat ontvangen van de email API'
      )
    })
  })

  describe('markAsRead', () => {
    it('should mark email as read', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({})
      } as Response)

      const result = await adminEmailService.markAsRead('email-1')

      expect(result).toEqual({ success: true })
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test-email-api.com/api/mail/email-1/processed',
        expect.objectContaining({
          method: 'PUT'
        })
      )
    })
  })

  describe('deleteEmail', () => {
    it('should delete email successfully', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({})
      } as Response)

      const result = await adminEmailService.deleteEmail('email-1')

      expect(result).toEqual({ success: true })
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test-email-api.com/api/mail/email-1',
        expect.objectContaining({
          method: 'DELETE'
        })
      )
    })
  })

  describe('getUnreadCount', () => {
    it('should return count of unread emails', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => [{ id: '1' }, { id: '2' }, { id: '3' }]
      } as Response)

      const count = await adminEmailService.getUnreadCount()

      expect(count).toBe(3)
    })

    it('should return 0 for non-array response', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ count: 5 })
      } as Response)

      const count = await adminEmailService.getUnreadCount()

      expect(count).toBe(0)
    })
  })

  describe('fetchNewEmails', () => {
    it('should trigger email fetch', async () => {
      const mockResponse = {
        message: 'Fetched 5 new emails',
        fetchTime: '2024-01-01T12:00:00Z'
      }

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await adminEmailService.fetchNewEmails()

      expect(result.message).toBe('Fetched 5 new emails')
      expect(result.fetchTime).toBe('2024-01-01T12:00:00Z')
    })
  })

  describe('replaceTemplateVariables', () => {
    it('should replace template variables correctly', () => {
      const template = 'Hello {name}, your order {orderId} is ready'
      const variables = { name: 'John', orderId: '12345' }

      const result = adminEmailService.replaceTemplateVariables(template, variables)

      expect(result).toBe('Hello John, your order 12345 is ready')
    })

    it('should keep unmatched placeholders', () => {
      const template = 'Hello {name}, your {missing} variable'
      const variables = { name: 'John' }

      const result = adminEmailService.replaceTemplateVariables(template, variables)

      expect(result).toBe('Hello John, your {missing} variable')
    })
  })
})