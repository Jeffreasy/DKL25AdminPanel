import { describe, it, expect, vi, beforeEach } from 'vitest'
import { adminEmailService } from '../adminEmailService'
import { supabase } from '../../../api/client/supabase'

// Mock Supabase
vi.mock('../../../api/client/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getSession: vi.fn(),
    },
  },
}))

describe('adminEmailService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAutoResponses', () => {
    it('fetches auto responses successfully', async () => {
      const mockResponses = [
        { 
          id: '1', 
          name: 'Welcome', 
          trigger_event: 'registration',
          subject: 'Welcome!',
          body: 'Welcome to our service',
          template_variables: {},
          is_active: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        { 
          id: '2', 
          name: 'Confirmation', 
          trigger_event: 'contact',
          subject: 'Confirmed',
          body: 'Your message was received',
          template_variables: {},
          is_active: true,
          created_at: '2024-01-02',
          updated_at: '2024-01-02',
        },
      ]

      const mockSelect = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({ data: mockResponses, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      } as any)

      const result = await adminEmailService.getAutoResponses()

      expect(supabase.from).toHaveBeenCalledWith('email_autoresponse')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result).toEqual(mockResponses)
      expect(result).toHaveLength(2)
    })

    it('throws error on fetch failure', async () => {
      const mockError = new Error('Database error')

      const mockSelect = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({ data: null, error: mockError })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      } as any)

      await expect(adminEmailService.getAutoResponses()).rejects.toThrow('Database error')
    })

    it('returns empty array when no responses', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      } as any)

      const result = await adminEmailService.getAutoResponses()

      expect(result).toEqual([])
    })
  })

  describe('createAutoResponse', () => {
    it('creates auto response successfully', async () => {
      const newResponse = {
        name: 'Test Response',
        trigger_event: 'registration' as const,
        subject: 'Test Subject',
        body: 'Test body with {name}',
        template_variables: { name: 'User' },
        is_active: true,
      }

      const createdResponse = {
        id: '1',
        ...newResponse,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      const mockInsert = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: createdResponse, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      } as any)

      const result = await adminEmailService.createAutoResponse(newResponse)

      expect(supabase.from).toHaveBeenCalledWith('email_autoresponse')
      expect(mockInsert).toHaveBeenCalledWith(newResponse)
      expect(mockSelect).toHaveBeenCalled()
      expect(mockSingle).toHaveBeenCalled()
      expect(result).toEqual(createdResponse)
      expect(result.id).toBe('1')
    })

    it('throws error on create failure', async () => {
      const newResponse = {
        name: 'Test',
        trigger_event: 'contact' as const,
        subject: 'Test',
        body: 'Test',
        template_variables: {},
        is_active: true,
      }

      const mockError = new Error('Create failed')

      const mockInsert = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: mockError })

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      } as any)

      await expect(adminEmailService.createAutoResponse(newResponse)).rejects.toThrow('Create failed')
    })
  })

  describe('updateAutoResponse', () => {
    it('updates auto response successfully', async () => {
      const updates = { 
        subject: 'Updated Subject',
        is_active: false,
      }

      const updatedResponse = {
        id: '1',
        name: 'Test',
        trigger_event: 'registration' as const,
        body: 'Body',
        template_variables: {},
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
        ...updates,
      }

      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: updatedResponse, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect,
        single: mockSingle,
      } as any)

      const result = await adminEmailService.updateAutoResponse('1', updates)

      expect(supabase.from).toHaveBeenCalledWith('email_autoresponse')
      expect(mockUpdate).toHaveBeenCalledWith(updates)
      expect(mockEq).toHaveBeenCalledWith('id', '1')
      expect(result.subject).toBe('Updated Subject')
      expect(result.is_active).toBe(false)
    })

    it('throws error on update failure', async () => {
      const mockError = new Error('Update failed')

      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: mockError })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect,
        single: mockSingle,
      } as any)

      await expect(adminEmailService.updateAutoResponse('1', {})).rejects.toThrow('Update failed')
    })
  })

  describe('deleteAutoResponse', () => {
    it('deletes auto response successfully', async () => {
      const mockDelete = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({ error: null })

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
        eq: mockEq,
      } as any)

      await adminEmailService.deleteAutoResponse('1')

      expect(supabase.from).toHaveBeenCalledWith('email_autoresponse')
      expect(mockDelete).toHaveBeenCalled()
      expect(mockEq).toHaveBeenCalledWith('id', '1')
    })

    it('throws error on delete failure', async () => {
      const mockError = new Error('Delete failed')

      const mockDelete = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({ error: mockError })

      vi.mocked(supabase.from).mockReturnValue({
        delete: mockDelete,
        eq: mockEq,
      } as any)

      await expect(adminEmailService.deleteAutoResponse('1')).rejects.toThrow('Delete failed')
    })
  })

  describe('fetchAanmeldingenEmails', () => {
    it('fetches unique emails successfully', async () => {
      const mockData = [
        { email: 'user1@example.com' },
        { email: 'user2@example.com' },
        { email: 'user1@example.com' }, // Duplicate
        { email: 'user3@example.com' },
      ]

      const mockSelect = vi.fn().mockResolvedValue({ data: mockData, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)

      const result = await adminEmailService.fetchAanmeldingenEmails()

      expect(supabase.from).toHaveBeenCalledWith('aanmeldingen')
      expect(mockSelect).toHaveBeenCalledWith('email')
      expect(result).toHaveLength(3)
      expect(result).toContain('user1@example.com')
      expect(result).toContain('user2@example.com')
      expect(result).toContain('user3@example.com')
    })

    it('filters out empty and whitespace emails', async () => {
      const mockData = [
        { email: 'user1@example.com' },
        { email: '' },
        { email: '   ' },
        { email: 'user2@example.com' },
        { email: null },
      ]

      const mockSelect = vi.fn().mockResolvedValue({ data: mockData, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)

      const result = await adminEmailService.fetchAanmeldingenEmails()

      expect(result).toHaveLength(2)
      expect(result).toEqual(['user1@example.com', 'user2@example.com'])
    })

    it('returns empty array on error', async () => {
      const mockError = new Error('Database error')

      const mockSelect = vi.fn().mockResolvedValue({ data: null, error: mockError })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)

      const result = await adminEmailService.fetchAanmeldingenEmails()

      expect(result).toEqual([])
    })

    it('handles null data gracefully', async () => {
      const mockSelect = vi.fn().mockResolvedValue({ data: null, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)

      const result = await adminEmailService.fetchAanmeldingenEmails()

      expect(result).toEqual([])
    })
  })

  describe('replaceTemplateVariables', () => {
    it('replaces single variable', () => {
      const template = 'Hello {name}!'
      const variables = { name: 'John' }

      const result = adminEmailService.replaceTemplateVariables(template, variables)

      expect(result).toBe('Hello John!')
    })

    it('replaces multiple variables', () => {
      const template = 'Hello {name}, your order {orderId} is ready!'
      const variables = { name: 'John', orderId: '12345' }

      const result = adminEmailService.replaceTemplateVariables(template, variables)

      expect(result).toBe('Hello John, your order 12345 is ready!')
    })

    it('keeps unmatched variables unchanged', () => {
      const template = 'Hello {name}, {unknown} variable'
      const variables = { name: 'John' }

      const result = adminEmailService.replaceTemplateVariables(template, variables)

      expect(result).toBe('Hello John, {unknown} variable')
    })

    it('handles empty template', () => {
      const result = adminEmailService.replaceTemplateVariables('', {})

      expect(result).toBe('')
    })

    it('handles template with no variables', () => {
      const template = 'Hello world!'
      const result = adminEmailService.replaceTemplateVariables(template, {})

      expect(result).toBe('Hello world!')
    })
  })

  describe('logEmailEvent', () => {
    it('logs email event successfully', async () => {
      const mockInsert = vi.fn().mockResolvedValue({ error: null })

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any)

      await adminEmailService.logEmailEvent({
        event_type: 'sent',
        from_email: 'admin@example.com',
        to_email: 'user@example.com',
        subject: 'Test',
        email_id: 'email-123',
      })

      expect(supabase.from).toHaveBeenCalledWith('email_events')
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          event_type: 'sent',
          from_email: 'admin@example.com',
          to_email: 'user@example.com',
          subject: 'Test',
          email_id: 'email-123',
          timestamp: expect.any(String),
          metadata: {},
        })
      )
    })

    it('handles logging errors gracefully', async () => {
      const mockError = new Error('Insert failed')

      const mockInsert = vi.fn().mockResolvedValue({ error: mockError })

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any)

      // Should not throw, just log error
      await expect(
        adminEmailService.logEmailEvent({
          event_type: 'sent',
          from_email: 'admin@example.com',
          to_email: 'user@example.com',
          subject: 'Test',
          email_id: 'email-123',
        })
      ).resolves.toBeUndefined()
    })

    it('handles table not exists error', async () => {
      const mockError = { code: '42P01', message: 'Table does not exist' }

      const mockInsert = vi.fn().mockResolvedValue({ error: mockError })

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any)

      // Should not throw
      await expect(
        adminEmailService.logEmailEvent({
          event_type: 'sent',
          from_email: 'admin@example.com',
          to_email: 'user@example.com',
          subject: 'Test',
          email_id: 'email-123',
        })
      ).resolves.toBeUndefined()
    })

    it('uses provided timestamp', async () => {
      const customTimestamp = '2024-01-01T12:00:00Z'

      const mockInsert = vi.fn().mockResolvedValue({ error: null })

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
      } as any)

      await adminEmailService.logEmailEvent({
        event_type: 'sent',
        from_email: 'admin@example.com',
        to_email: 'user@example.com',
        subject: 'Test',
        email_id: 'email-123',
        timestamp: customTimestamp,
      })

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: customTimestamp,
        })
      )
    })
  })
})