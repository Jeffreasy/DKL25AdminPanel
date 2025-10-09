import { describe, it, expect, vi, beforeEach } from 'vitest'
import { underConstructionService } from '../underConstructionService'
import { supabase } from '../../../../api/client/supabase'

// Mock Supabase
vi.mock('../../../../api/client/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

// Mock case converter
vi.mock('../../../../utils/caseConverter', () => ({
  keysToCamel: vi.fn((data) => data),
  keysToSnake: vi.fn((data) => data),
}))

describe('underConstructionService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUnderConstruction', () => {
    it('fetches under construction data successfully', async () => {
      const mockData = {
        id: 1,
        is_active: false,
        title: 'Under Construction',
        message: 'Site is under construction',
        footer_text: 'Thank you',
        logo_url: 'logo.png',
        expected_date: '2024-12-31',
        social_links: [],
        progress_percentage: 50,
        contact_email: 'contact@example.com',
        newsletter_enabled: true,
      }

      const mockSelect = vi.fn().mockReturnThis()
      const mockLimit = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockData, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        limit: mockLimit,
        single: mockSingle,
      } as any)

      const result = await underConstructionService.getUnderConstruction()

      expect(supabase.from).toHaveBeenCalledWith('under_construction')
      expect(mockSelect).toHaveBeenCalledWith('*')
      expect(mockLimit).toHaveBeenCalledWith(1)
      expect(mockSingle).toHaveBeenCalled()
      expect(result).toEqual(mockData)
    })

    it('creates default data when no rows exist', async () => {
      const mockError = { code: 'PGRST116', message: 'No rows' }
      const mockDefaultData = {
        id: 1,
        isActive: false,
        title: 'Onder Constructie',
        message: 'Deze website is momenteel onder constructie...',
      }

      const mockSelect = vi.fn().mockReturnThis()
      const mockLimit = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValueOnce({ data: null, error: mockError })

      const mockInsert = vi.fn().mockReturnThis()
      const mockSelect2 = vi.fn().mockReturnThis()
      const mockSingle2 = vi.fn().mockResolvedValue({ data: mockDefaultData, error: null })

      vi.mocked(supabase.from)
        .mockReturnValueOnce({
          select: mockSelect,
          limit: mockLimit,
          single: mockSingle,
        } as any)
        .mockReturnValueOnce({
          insert: mockInsert,
          select: mockSelect2,
          single: mockSingle2,
        } as any)

      const result = await underConstructionService.getUnderConstruction()

      expect(mockInsert).toHaveBeenCalled()
      expect(result).toEqual(mockDefaultData)
    })

    it('throws error on fetch failure', async () => {
      const mockError = { code: 'ERROR', message: 'Database error' }

      const mockSelect = vi.fn().mockReturnThis()
      const mockLimit = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: null, error: mockError })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        limit: mockLimit,
        single: mockSingle,
      } as any)

      await expect(underConstructionService.getUnderConstruction()).rejects.toEqual(mockError)
    })
  })

  describe('createUnderConstruction', () => {
    it('creates under construction data successfully', async () => {
      const formData = {
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
      }

      const mockCreatedData = {
        id: 1,
        ...formData,
      }

      const mockInsert = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockCreatedData, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        insert: mockInsert,
        select: mockSelect,
        single: mockSingle,
      } as any)

      const result = await underConstructionService.createUnderConstruction(formData)

      expect(supabase.from).toHaveBeenCalledWith('under_construction')
      expect(mockInsert).toHaveBeenCalledWith([formData])
      expect(mockSelect).toHaveBeenCalled()
      expect(mockSingle).toHaveBeenCalled()
      expect(result).toEqual(mockCreatedData)
    })

    it('throws error on create failure', async () => {
      const formData = {
        isActive: false,
        title: 'Test',
        message: 'Test message',
        footerText: 'Footer',
        logoUrl: '',
        expectedDate: null,
        socialLinks: [],
        progressPercentage: 0,
        contactEmail: '',
        newsletterEnabled: false,
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

      await expect(underConstructionService.createUnderConstruction(formData)).rejects.toEqual(mockError)
    })
  })

  describe('updateUnderConstruction', () => {
    it('updates under construction data successfully', async () => {
      const updateData = {
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
      }

      const mockUpdatedData = {
        id: 1,
        ...updateData,
        updated_at: expect.any(String),
      }

      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ data: mockUpdatedData, error: null })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect,
        single: mockSingle,
      } as any)

      const result = await underConstructionService.updateUnderConstruction(1, updateData)

      expect(supabase.from).toHaveBeenCalledWith('under_construction')
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          ...updateData,
          updated_at: expect.any(String),
        })
      )
      expect(mockEq).toHaveBeenCalledWith('id', 1)
      expect(mockSelect).toHaveBeenCalled()
      expect(mockSingle).toHaveBeenCalled()
      expect(result).toEqual(mockUpdatedData)
    })

    it('throws error on update failure', async () => {
      const updateData = {
        isActive: false,
        title: 'Test',
        message: 'Test',
        footerText: 'Test',
        logoUrl: '',
        expectedDate: null,
        socialLinks: [],
        progressPercentage: 0,
        contactEmail: '',
        newsletterEnabled: false,
      }

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

      await expect(underConstructionService.updateUnderConstruction(1, updateData)).rejects.toEqual(mockError)
    })

    it('includes updated_at timestamp', async () => {
      const updateData = {
        isActive: true,
        title: 'Test',
        message: 'Test',
        footerText: 'Test',
        logoUrl: '',
        expectedDate: null,
        socialLinks: [],
        progressPercentage: 50,
        contactEmail: '',
        newsletterEnabled: false,
      }

      const mockUpdate = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockSelect = vi.fn().mockReturnThis()
      const mockSingle = vi.fn().mockResolvedValue({ 
        data: { id: 1, ...updateData, updated_at: new Date().toISOString() }, 
        error: null 
      })

      vi.mocked(supabase.from).mockReturnValue({
        update: mockUpdate,
        eq: mockEq,
        select: mockSelect,
        single: mockSingle,
      } as any)

      await underConstructionService.updateUnderConstruction(1, updateData)

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          updated_at: expect.any(String),
        })
      )
    })
  })
})