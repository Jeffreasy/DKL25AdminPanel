import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sponsorClient } from '@/api/client/sponsorClient'
import { sponsorService } from '../sponsorService'

vi.mock('@/api/client/sponsorClient', () => ({
  sponsorClient: {
    getSponsors: vi.fn(),
    createSponsor: vi.fn(),
    updateSponsor: vi.fn(),
    deleteSponsor: vi.fn(),
  },
}))

describe('sponsorService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getSponsors', () => {
    it('fetches sponsors correctly', async () => {
      const mockData = [
        {
          id: '1',
          name: 'Sponsor 1',
          description: 'Desc 1',
          logoUrl: 'logo1.png',
          websiteUrl: 'https://sponsor1.com',
          order: 1,
          isActive: true,
          visible: true,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-02',
          created_at: '2024-01-01',
          updated_at: '2024-01-02',
        },
      ]

      ;(sponsorClient.getSponsors as any).mockResolvedValue(mockData)

      const result = await sponsorService.getSponsors()

      expect(result).toHaveLength(1)
      expect(result[0].logoUrl).toBe('logo1.png')
      expect(result[0].websiteUrl).toBe('https://sponsor1.com')
      expect(result[0].order).toBe(1)
      expect(result[0].isActive).toBe(true)
    })

    it('handles errors', async () => {
      ;(sponsorClient.getSponsors as any).mockRejectedValue(new Error('Fetch failed'))

      await expect(sponsorService.getSponsors()).rejects.toThrow('Fetch failed')
    })
  })

  describe('createSponsor', () => {
    it('creates sponsor correctly', async () => {
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
        logoUrl: 'logo.png',
        websiteUrl: 'https://example.com',
        order: 1,
        isActive: true,
        visible: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      ;(sponsorClient.createSponsor as any).mockResolvedValue(mockCreated)

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
        logoUrl: 'new-logo.png',
        websiteUrl: 'https://new.com',
        order: 2,
        isActive: false,
        visible: false,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
        created_at: '2024-01-01',
        updated_at: '2024-01-02',
      }

      ;(sponsorClient.updateSponsor as any).mockResolvedValue(mockUpdated)

      const result = await sponsorService.updateSponsor('1', formData)

      expect(result.logoUrl).toBe('new-logo.png')
      expect(result.isActive).toBe(false)
    })
  })

  describe('deleteSponsor', () => {
    it('deletes sponsor successfully', async () => {
      ;(sponsorClient.deleteSponsor as any).mockResolvedValue(undefined)

      await sponsorService.deleteSponsor('1')

      expect(sponsorClient.deleteSponsor).toHaveBeenCalledWith('1')
    })

    it('handles delete errors', async () => {
      ;(sponsorClient.deleteSponsor as any).mockRejectedValue(new Error('Delete failed'))

      await expect(sponsorService.deleteSponsor('1')).rejects.toThrow('Delete failed')
    })
  })
})