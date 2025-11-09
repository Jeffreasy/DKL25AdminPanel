import { describe, it, expect, beforeEach, vi } from 'vitest'
import { emailClient } from '../emailClient'
import { apiClient } from '@/services/api.client'

// Mock apiClient
vi.mock('@/services/api.client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

describe('emailClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllEmails', () => {
    it('should fetch all emails with pagination', async () => {
      const mockResponse = {
        data: {
          emails: [
            {
              id: '1',
              sender: 'test@example.com',
              subject: 'Test',
              html: '<p>Test</p>',
              account_type: 'info',
              read: false
            }
          ],
          totalCount: 1
        }
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await emailClient.getAllEmails(10, 0)

      expect(apiClient.get).toHaveBeenCalledWith('/mail?limit=10&offset=0')
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('getEmailsByAccount', () => {
    it('should fetch emails for specific account', async () => {
      const mockResponse = {
        data: {
          emails: [],
          totalCount: 0
        }
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await emailClient.getEmailsByAccount('info', 20, 0)

      expect(apiClient.get).toHaveBeenCalledWith('/mail/account/info?limit=20&offset=0')
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('markAsProcessed', () => {
    it('should mark email as processed', async () => {
      const mockResponse = {
        data: { message: 'Email marked as processed' }
      }

      vi.mocked(apiClient.put).mockResolvedValue(mockResponse)

      const result = await emailClient.markAsProcessed('email-id-123')

      expect(apiClient.put).toHaveBeenCalledWith('/mail/email-id-123/processed')
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('deleteEmail', () => {
    it('should delete email', async () => {
      const mockResponse = {
        data: { success: true, message: 'Email deleted' }
      }

      vi.mocked(apiClient.delete).mockResolvedValue(mockResponse)

      const result = await emailClient.deleteEmail('email-id-123')

      expect(apiClient.delete).toHaveBeenCalledWith('/mail/email-id-123')
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('sendEmail', () => {
    it('should send email with correct params', async () => {
      const mockResponse = {
        data: { success: true, id: 'sent-email-id' }
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const params = {
        to: 'recipient@example.com',
        subject: 'Test Email',
        body: '<p>Test body</p>'
      }

      const result = await emailClient.sendEmail(params)

      expect(apiClient.post).toHaveBeenCalledWith('/mail/send', params)
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('fetchNewEmails', () => {
    it('should trigger manual email fetch', async () => {
      const mockResponse = {
        data: {
          message: '5 emails opgehaald',
          fetchTime: '2025-11-08T00:00:00Z'
        }
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await emailClient.fetchNewEmails()

      expect(apiClient.post).toHaveBeenCalledWith('/mail/fetch')
      expect(result).toEqual(mockResponse.data)
    })
  })

  describe('AutoResponse Management', () => {
    it('should get all autoresponses', async () => {
      const mockResponse = {
        data: [
          {
            id: '1',
            name: 'Contact Template',
            subject: 'RE: Contact',
            body: '<p>Thanks</p>',
            trigger_event: 'contact',
            is_active: true
          }
        ]
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await emailClient.getAutoResponses()

      expect(apiClient.get).toHaveBeenCalledWith('/mail/autoresponse')
      expect(result).toEqual(mockResponse.data)
    })

    it('should create autoresponse', async () => {
      const mockResponse = {
        data: {
          id: '1',
          name: 'New Template',
          subject: 'RE: Test',
          body: '<p>Body</p>',
          trigger_event: 'contact',
          is_active: true,
          created_at: '2025-11-08T00:00:00Z',
          updated_at: '2025-11-08T00:00:00Z'
        }
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const data = {
        name: 'New Template',
        subject: 'RE: Test',
        body: '<p>Body</p>',
        trigger_event: 'contact' as const,
        is_active: true,
        template_variables: {}
      }

      const result = await emailClient.createAutoResponse(data)

      expect(apiClient.post).toHaveBeenCalledWith('/mail/autoresponse', data)
      expect(result).toEqual(mockResponse.data)
    })

    it('should update autoresponse', async () => {
      const mockResponse = {
        data: {
          id: '1',
          name: 'Updated Template',
          is_active: false
        }
      }

      vi.mocked(apiClient.put).mockResolvedValue(mockResponse)

      const updates = { name: 'Updated Template', is_active: false }

      const result = await emailClient.updateAutoResponse('1', updates)

      expect(apiClient.put).toHaveBeenCalledWith('/mail/autoresponse/1', updates)
      expect(result).toEqual(mockResponse.data)
    })

    it('should delete autoresponse', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({ data: undefined })

      await emailClient.deleteAutoResponse('1')

      expect(apiClient.delete).toHaveBeenCalledWith('/mail/autoresponse/1')
    })
  })

  describe('getParticipantEmails', () => {
    it('should fetch participant emails with counts', async () => {
      const mockResponse = {
        data: {
          participant_emails: ['user1@example.com', 'user2@example.com'],
          system_emails: ['info@dkl.nl'],
          all_emails: ['user1@example.com', 'user2@example.com', 'info@dkl.nl'],
          counts: {
            participants: 2,
            system: 1,
            total: 3
          }
        }
      }

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse)

      const result = await emailClient.getParticipantEmails()

      expect(apiClient.get).toHaveBeenCalledWith('/participant/emails')
      expect(result).toEqual(mockResponse.data)
      expect(result.counts.total).toBe(3)
    })
  })

  describe('reprocessEmails', () => {
    it('should trigger email reprocessing', async () => {
      const mockResponse = {
        data: {
          success: true,
          message: 'Reprocessing complete',
          processed: 50,
          failed: 2
        }
      }

      vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

      const result = await emailClient.reprocessEmails()

      expect(apiClient.post).toHaveBeenCalledWith('/admin/mail/reprocess')
      expect(result.success).toBe(true)
      expect(result.processed).toBe(50)
    })
  })

  describe('logEmailEvent', () => {
    it('should log email event', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: undefined })

      const event = {
        event_type: 'sent',
        from_email: 'sender@example.com',
        to_email: 'recipient@example.com',
        subject: 'Test',
        email_id: 'email-123'
      }

      await emailClient.logEmailEvent(event)

      expect(apiClient.post).toHaveBeenCalledWith('/mail/events', expect.objectContaining({
        ...event,
        metadata: {}
      }))
    })
  })
})