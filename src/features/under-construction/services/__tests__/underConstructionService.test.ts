import { describe, it, expect, vi, beforeEach } from 'vitest'
import { underConstructionService } from '../underConstructionService'
import { underConstructionClient } from '../../../../api/client/underConstructionClient'

// Mock the API client
vi.mock('../../../../api/client/underConstructionClient', () => ({
  underConstructionClient: {
    getActiveUnderConstruction: vi.fn(),
    createUnderConstruction: vi.fn(),
    updateUnderConstruction: vi.fn(),
    getUnderConstructionList: vi.fn(),
    getUnderConstructionById: vi.fn(),
    deleteUnderConstruction: vi.fn(),
  },
}))

describe('underConstructionService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUnderConstruction', () => {
    it('fetches under construction data successfully', async () => {
      const mockData = {
        id: 1,
        isActive: false,
        title: 'Under Construction',
        message: 'Site is under construction',
        footerText: 'Thank you',
        logoUrl: 'logo.png',
        expectedDate: '2024-12-31',
        socialLinks: [],
        progressPercentage: 50,
        contactEmail: 'contact@example.com',
        newsletterEnabled: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      vi.mocked(underConstructionClient.getActiveUnderConstruction).mockResolvedValue(mockData)

      const result = await underConstructionService.getUnderConstruction()

      expect(underConstructionClient.getActiveUnderConstruction).toHaveBeenCalled()
      expect(result).toEqual(mockData)
    })

    it('creates default data when no active under construction exists', async () => {
      const mockDefaultData = {
        id: 1,
        isActive: false,
        title: 'Onder Constructie',
        message: 'Deze website is momenteel onder constructie...',
        footerText: 'Bedankt voor uw geduld!',
        logoUrl: '',
        expectedDate: null,
        socialLinks: [],
        progressPercentage: 0,
        contactEmail: '',
        newsletterEnabled: false,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      vi.mocked(underConstructionClient.getActiveUnderConstruction).mockResolvedValue(null)
      vi.mocked(underConstructionClient.createUnderConstruction).mockResolvedValue(mockDefaultData)

      const result = await underConstructionService.getUnderConstruction()

      expect(underConstructionClient.getActiveUnderConstruction).toHaveBeenCalled()
      expect(underConstructionClient.createUnderConstruction).toHaveBeenCalledWith({
        is_active: false,
        title: 'Onder Constructie',
        message: 'Deze website is momenteel onder constructie...',
        footer_text: 'Bedankt voor uw geduld!',
        logo_url: '',
        expected_date: null,
        social_links: [],
        progress_percentage: 0,
        contact_email: '',
        newsletter_enabled: false,
      })
      expect(result).toEqual(mockDefaultData)
    })

    it('throws error on fetch failure', async () => {
      const mockError = new Error('API Error')

      vi.mocked(underConstructionClient.getActiveUnderConstruction).mockRejectedValue(mockError)

      await expect(underConstructionService.getUnderConstruction()).rejects.toEqual(mockError)
    })
  })

  describe('createUnderConstruction', () => {
    it('creates under construction data successfully', async () => {
      const formData = {
        is_active: true,
        title: 'New Site',
        message: 'Coming soon',
        footer_text: 'Stay tuned',
        logo_url: 'logo.png',
        expected_date: '2024-12-31',
        social_links: [],
        progress_percentage: 25,
        contact_email: 'info@example.com',
        newsletter_enabled: true,
      }

      const mockCreatedData = {
        id: 1,
        isActive: true,
        title: 'New Site',
        message: 'Coming soon',
        footerText: 'Stay tuned',
        logoUrl: 'logo.png',
        expectedDate: '2024-12-31',
        socialLinks: [],
        progressPercentage: 25,
        contactEmail: 'info@example.com',
        newsletterEnabled: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      vi.mocked(underConstructionClient.createUnderConstruction).mockResolvedValue(mockCreatedData)

      const result = await underConstructionService.createUnderConstruction(formData)

      expect(underConstructionClient.createUnderConstruction).toHaveBeenCalledWith(formData)
      expect(result).toEqual(mockCreatedData)
    })

    it('throws error on create failure', async () => {
      const formData = {
        is_active: false,
        title: 'Test',
        message: 'Test message',
        footer_text: 'Footer',
        logo_url: '',
        expected_date: null,
        social_links: [],
        progress_percentage: 0,
        contact_email: '',
        newsletter_enabled: false,
      }

      const mockError = new Error('Create failed')

      vi.mocked(underConstructionClient.createUnderConstruction).mockRejectedValue(mockError)

      await expect(underConstructionService.createUnderConstruction(formData)).rejects.toEqual(mockError)
    })
  })

  describe('updateUnderConstruction', () => {
    it('updates under construction data successfully', async () => {
      const updateData = {
        is_active: true,
        title: 'Updated Title',
        message: 'Updated message',
        footer_text: 'Updated footer',
        logo_url: 'new-logo.png',
        expected_date: '2025-01-01',
        social_links: [{ platform: 'twitter', url: 'https://twitter.com' }],
        progress_percentage: 75,
        contact_email: 'new@example.com',
        newsletter_enabled: true,
      }

      const mockUpdatedData = {
        id: 1,
        isActive: true,
        title: 'Updated Title',
        message: 'Updated message',
        footerText: 'Updated footer',
        logoUrl: 'new-logo.png',
        expectedDate: '2025-01-01',
        socialLinks: [{ platform: 'twitter', url: 'https://twitter.com' }],
        progressPercentage: 75,
        contactEmail: 'new@example.com',
        newsletterEnabled: true,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      }

      vi.mocked(underConstructionClient.updateUnderConstruction).mockResolvedValue(mockUpdatedData)

      const result = await underConstructionService.updateUnderConstruction(1, updateData)

      expect(underConstructionClient.updateUnderConstruction).toHaveBeenCalledWith(1, updateData)
      expect(result).toEqual(mockUpdatedData)
    })

    it('throws error on update failure', async () => {
      const updateData = {
        is_active: false,
        title: 'Test',
        message: 'Test',
        footer_text: 'Test',
        logo_url: '',
        expected_date: null,
        social_links: [],
        progress_percentage: 0,
        contact_email: '',
        newsletter_enabled: false,
      }

      const mockError = new Error('Update failed')

      vi.mocked(underConstructionClient.updateUnderConstruction).mockRejectedValue(mockError)

      await expect(underConstructionService.updateUnderConstruction(1, updateData)).rejects.toEqual(mockError)
    })
  })
})