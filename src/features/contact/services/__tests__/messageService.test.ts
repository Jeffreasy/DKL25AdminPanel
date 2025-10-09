import { describe, it, expect, vi, beforeEach } from 'vitest'
import { 
  fetchMessages, 
  updateMessageStatus, 
  updateMessageNotes,
  resendEmail,
  getContactStats
} from '../messageService'
import { supabase } from '../../../../api/client/supabase'

// Mock Supabase
vi.mock('../../../../api/client/supabase', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
    },
  },
}))

describe('messageService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchMessages', () => {
    it('fetches messages successfully', async () => {
      const mockMessages = [
        { id: '1', naam: 'John Doe', email: 'john@example.com', status: 'nieuw', created_at: '2024-01-01' },
        { id: '2', naam: 'Jane Smith', email: 'jane@example.com', status: 'in_behandeling', created_at: '2024-01-02' },
      ]

      const mockSelect = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({ data: mockMessages, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      } as any)

      const result = await fetchMessages()

      expect(supabase.from).toHaveBeenCalledWith('contact_formulieren')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result.data).toEqual(mockMessages)
      expect(result.error).toBeNull()
    })

    it('handles fetch errors', async () => {
      const mockError = new Error('Database error')

      const mockSelect = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({ data: null, error: mockError })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      } as any)

      const result = await fetchMessages()

      expect(result.data).toEqual([])
      expect(result.error).toEqual(mockError)
    })

    it('returns empty array when no messages', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        order: mockOrder,
      } as any)

      const result = await fetchMessages()

      expect(result.data).toEqual([])
      expect(result.error).toBeNull()
    })
  })

  describe('updateMessageStatus', () => {
    it('updates status to in_behandeling', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { email: 'admin@example.com' } },
      } as any)

      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({ error: null })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
      } as any)

      const result = await updateMessageStatus('1', 'in_behandeling')

      expect(supabase.from).toHaveBeenCalledWith('contact_formulieren')
      expect(mockUpdate).toHaveBeenCalledWith({ status: 'in_behandeling' })
      expect(mockEq).toHaveBeenCalledWith('id', '1')
      expect(result.error).toBeNull()
    })

    it('updates status to afgehandeld with user info', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { email: 'admin@example.com' } },
      } as any)

      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({ error: null })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
      } as any)

      const result = await updateMessageStatus('1', 'afgehandeld')

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'afgehandeld',
          behandeld_door: 'admin@example.com',
          behandeld_op: expect.any(String),
        })
      )
      expect(result.error).toBeNull()
    })

    it('handles update errors', async () => {
      const mockError = new Error('Update failed')

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { email: 'admin@example.com' } },
      } as any)

      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({ error: mockError })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
      } as any)

      const result = await updateMessageStatus('1', 'nieuw')

      expect(result.error).toEqual(mockError)
    })
  })

  describe('updateMessageNotes', () => {
    it('updates notes successfully', async () => {
      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({ error: null })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
      } as any)

      const result = await updateMessageNotes('1', 'Test notes')

      expect(supabase.from).toHaveBeenCalledWith('contact_formulieren')
      expect(mockUpdate).toHaveBeenCalledWith({ notities: 'Test notes' })
      expect(mockEq).toHaveBeenCalledWith('id', '1')
      expect(result.error).toBeNull()
    })

    it('handles update errors', async () => {
      const mockError = new Error('Update failed')

      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockResolvedValue({ error: mockError })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
      } as any)

      const result = await updateMessageNotes('1', 'Test notes')

      expect(result.error).toEqual(mockError)
    })
  })

  describe('resendEmail', () => {
    it('resends email successfully', async () => {
      const mockMessage = { id: '1', naam: 'John', email: 'john@example.com' }

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockMessage, error: null })
      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq2 = vi.fn().mockResolvedValue({ error: null })

      vi.mocked(supabase.from)
        .mockReturnValueOnce({
          select: mockSelect,
          eq: mockEq,
          single: mockSingle,
        } as any)
        .mockReturnValueOnce({
          update: mockUpdate,
          eq: mockEq2,
        } as any)

      const result = await resendEmail('1')

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          email_verzonden: true,
          email_verzonden_op: expect.any(String),
        })
      )
      expect(result.error).toBeNull()
    })

    it('handles message not found', async () => {
      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        single: mockSingle,
      } as any)

      const result = await resendEmail('999')

      expect(result.error).toBeInstanceOf(Error)
      expect(result.error?.message).toBe('Message not found')
    })

    it('handles resend errors', async () => {
      const mockMessage = { id: '1', naam: 'John', email: 'john@example.com' }
      const mockError = new Error('Email send failed')

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockMessage, error: null })
      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq2 = vi.fn().mockResolvedValue({ error: mockError })

      vi.mocked(supabase.from)
        .mockReturnValueOnce({
          select: mockSelect,
          eq: mockEq,
          single: mockSingle,
        } as any)
        .mockReturnValueOnce({
          update: mockUpdate,
          eq: mockEq2,
        } as any)

      const result = await resendEmail('1')

      expect(result.error).toEqual(mockError)
    })
  })

  describe('getContactStats', () => {
    it('calculates stats correctly', async () => {
      const now = new Date()
      const mockMessages = [
        { 
          id: '1', 
          status: 'nieuw', 
          created_at: now.toISOString(),
          behandeld_op: null 
        },
        { 
          id: '2', 
          status: 'in_behandeling', 
          created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          behandeld_op: null 
        },
        { 
          id: '3', 
          status: 'afgehandeld', 
          created_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          behandeld_op: new Date(now.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString()
        },
      ]

      const mockSelect = vi.fn().mockResolvedValue({ data: mockMessages, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)

      const result = await getContactStats()

      expect(result.data).toBeDefined()
      expect(result.data?.counts.total).toBe(3)
      expect(result.data?.counts.new).toBe(1)
      expect(result.data?.counts.inProgress).toBe(1)
      expect(result.data?.counts.handled).toBe(1)
      expect(result.data?.avgResponseTime).toBeGreaterThan(0)
      expect(result.data?.messagesByPeriod.daily).toBe(1)
      expect(result.data?.messagesByPeriod.weekly).toBe(2)
      expect(result.data?.messagesByPeriod.monthly).toBe(3)
      expect(result.error).toBeNull()
    })

    it('handles empty messages', async () => {
      const mockSelect = vi.fn().mockResolvedValue({ data: [], error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)

      const result = await getContactStats()

      expect(result.data?.counts.total).toBe(0)
      expect(result.data?.avgResponseTime).toBe(0)
      expect(result.error).toBeNull()
    })

    it('handles fetch errors', async () => {
      const mockError = new Error('Database error')

      const mockSelect = vi.fn().mockResolvedValue({ data: null, error: mockError })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
      } as any)

      const result = await getContactStats()

      expect(result.data).toBeNull()
      expect(result.error).toEqual(mockError)
    })
  })
})