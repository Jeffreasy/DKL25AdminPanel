import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from '@/api/client/supabase'
import { sponsorService } from '../sponsorService'

vi.mock('@/api/client/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

describe('sponsorService', () => {
  const mockFrom = vi.fn()
  const mockSelect = vi.fn()
  const mockOrder = vi.fn()
  const mockInsert = vi.fn()
  const mockUpdate = vi.fn()
  const mockDelete = vi.fn()
  const mockEq = vi.fn()
  const mockSingle = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(supabase.from as any) = mockFrom
  })

  describe('getSponsors', () => {
    it('fetches and maps sponsors correctly', async () => {
      const mockData = [
        {
          id: '1',
          name: 'Sponsor 1',
          description: 'Desc 1',
          logo_url: 'logo1.png',
          website_url: 'https://sponsor1.com',
          order_number: 1,
          is_active: true,
          visible: true,
          created_at: '2024-01-01',
          updated_at: '2024-01-02',
        },
      ]

      mockFrom.mockReturnValue({ select: mockSelect })
      mockSelect.mockReturnValue({ order: mockOrder })
      mockOrder.mockResolvedValue({ data: mockData, error: null })

      const result = await sponsorService.getSponsors()

      expect(result).toHaveLength(1)
      expect(result[0].logoUrl).toBe('logo1.png')
      expect(result[0].websiteUrl).toBe('https://sponsor1.com')
      expect(result[0].order).toBe(1)
      expect(result[0].isActive).toBe(true)
    })

    it('handles errors', async () => {
      mockFrom.mockReturnValue({ select: mockSelect })
      mockSelect.mockReturnValue({ order: mockOrder })
      mockOrder.mockResolvedValue({ data: null, error: new Error('Fetch failed') })

      await expect(sponsorService.getSponsors()).rejects.toThrow('Fetch failed')
    })
  })

  describe('createSponsor', () => {
    it('creates sponsor with correct mapping', async () => {
      const formData = {
        name: 'New Sponsor',
        description: 'Description',
        logoUrl: 'logo.png',
        websiteUrl: 'https://example.com',
        order: 1,
        isActive: true,
        visible: true,
      }

      const mockCreated = {
        id: '1',
        name: 'New Sponsor',
        description: 'Description',
        logo_url: 'logo.png',
        website_url: 'https://example.com',
        order_number: 1,
        is_active: true,
        visible: true,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      mockFrom.mockReturnValue({ insert: mockInsert })
      mockInsert.mockReturnValue({ select: mockSelect })
      mockSelect.mockReturnValue({ single: mockSingle })
      mockSingle.mockResolvedValue({ data: mockCreated, error: null })

      const result = await sponsorService.createSponsor(formData)

      expect(result.logoUrl).toBe('logo.png')
      expect(result.isActive).toBe(true)
    })
  })

  describe('updateSponsor', () => {
    it('updates sponsor successfully', async () => {
      const formData = {
        name: 'Updated Sponsor',
        description: 'Updated',
        logoUrl: 'new-logo.png',
        websiteUrl: 'https://new.com',
        order: 2,
        isActive: false,
        visible: false,
      }

      const mockUpdated = {
        id: '1',
        name: 'Updated Sponsor',
        description: 'Updated',
        logo_url: 'new-logo.png',
        website_url: 'https://new.com',
        order_number: 2,
        is_active: false,
        visible: false,
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
      }

      mockFrom.mockReturnValue({ update: mockUpdate })
      mockUpdate.mockReturnValue({ eq: mockEq })
      mockEq.mockReturnValue({ select: mockSelect })
      mockSelect.mockReturnValue({ single: mockSingle })
      mockSingle.mockResolvedValue({ data: mockUpdated, error: null })

      const result = await sponsorService.updateSponsor('1', formData)

      expect(result.logoUrl).toBe('new-logo.png')
      expect(result.isActive).toBe(false)
    })
  })

  describe('deleteSponsor', () => {
    it('deletes sponsor successfully', async () => {
      mockFrom.mockReturnValue({ delete: mockDelete })
      mockDelete.mockReturnValue({ eq: mockEq })
      mockEq.mockResolvedValue({ error: null })

      await sponsorService.deleteSponsor('1')

      expect(mockFrom).toHaveBeenCalledWith('sponsors')
      expect(mockDelete).toHaveBeenCalled()
    })

    it('handles delete errors', async () => {
      mockFrom.mockReturnValue({ delete: mockDelete })
      mockDelete.mockReturnValue({ eq: mockEq })
      mockEq.mockResolvedValue({ error: new Error('Delete failed') })

      await expect(sponsorService.deleteSponsor('1')).rejects.toThrow('Delete failed')
    })
  })
})