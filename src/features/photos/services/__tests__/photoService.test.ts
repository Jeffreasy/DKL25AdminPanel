import { describe, it, expect, vi, beforeEach } from 'vitest'
import { supabase } from '@/api/client/supabase'
import {
  fetchPhotos,
  fetchAllPhotos,
  fetchPhotosCount,
  deletePhoto,
  updatePhotoVisibility,
  fetchPhotoAlbums,
  addPhotoToAlbum,
  addPhotosToAlbums,
  removePhotoFromAlbum,
  bulkDeletePhotos,
  bulkUpdatePhotoVisibility,
  bulkAddPhotosToAlbum,
} from '../photoService'

vi.mock('@/api/client/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

describe('photoService', () => {
  const mockFrom = vi.fn()
  const mockSelect = vi.fn()
  const mockOrder = vi.fn()
  const mockLimit = vi.fn()
  const mockRange = vi.fn()
  const mockOr = vi.fn()
  const mockEq = vi.fn()
  const mockIn = vi.fn()
  const mockDelete = vi.fn()
  const mockUpdate = vi.fn()
  const mockInsert = vi.fn()
  const mockSingle = vi.fn()
  const mockMaybeSingle = vi.fn()
  const mockMatch = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(supabase.from as any) = mockFrom
  })

  describe('fetchPhotos', () => {
    it('fetches photos successfully', async () => {
      const mockPhotos = [
        { id: '1', title: 'Photo 1', url: 'url1' },
        { id: '2', title: 'Photo 2', url: 'url2' },
      ]

      mockFrom.mockReturnValue({ select: mockSelect })
      mockSelect.mockReturnValue({ order: mockOrder })
      mockOrder.mockResolvedValue({ data: mockPhotos, error: null })

      const result = await fetchPhotos()

      expect(result).toEqual(mockPhotos)
      expect(mockFrom).toHaveBeenCalledWith('photos')
    })

    it('applies pagination', async () => {
      mockFrom.mockReturnValue({ select: mockSelect })
      mockSelect.mockReturnValue({ order: mockOrder })
      mockOrder.mockReturnValue({ limit: mockLimit })
      mockLimit.mockReturnValue({ range: mockRange })
      mockRange.mockResolvedValue({ data: [], error: null })

      await fetchPhotos({ limit: 10, offset: 20 })

      expect(mockLimit).toHaveBeenCalledWith(10)
      expect(mockRange).toHaveBeenCalledWith(20, 29)
    })

    it('applies search filter', async () => {
      mockFrom.mockReturnValue({ select: mockSelect })
      mockSelect.mockReturnValue({ order: mockOrder })
      mockOrder.mockReturnValue({ or: mockOr })
      mockOr.mockResolvedValue({ data: [], error: null })

      await fetchPhotos({ search: 'test' })

      expect(mockOr).toHaveBeenCalled()
    })

    it('handles errors', async () => {
      mockFrom.mockReturnValue({ select: mockSelect })
      mockSelect.mockReturnValue({ order: mockOrder })
      mockOrder.mockResolvedValue({ data: null, error: new Error('Fetch failed') })

      await expect(fetchPhotos()).rejects.toThrow('Fetch failed')
    })
  })

  describe('fetchAllPhotos', () => {
    it('calls fetchPhotos without options', async () => {
      mockFrom.mockReturnValue({ select: mockSelect })
      mockSelect.mockReturnValue({ order: mockOrder })
      mockOrder.mockResolvedValue({ data: [], error: null })

      await fetchAllPhotos()

      expect(mockFrom).toHaveBeenCalledWith('photos')
    })
  })

  describe('fetchPhotosCount', () => {
    it('returns count successfully', async () => {
      mockFrom.mockReturnValue({ select: mockSelect })
      mockSelect.mockResolvedValue({ count: 42, error: null })

      const result = await fetchPhotosCount()

      expect(result).toBe(42)
    })

    it('returns 0 when count is null', async () => {
      mockFrom.mockReturnValue({ select: mockSelect })
      mockSelect.mockResolvedValue({ count: null, error: null })

      const result = await fetchPhotosCount()

      expect(result).toBe(0)
    })
  })

  describe('deletePhoto', () => {
    it('deletes photo and related data', async () => {
      // Mock for album_photos delete
      mockFrom.mockReturnValueOnce({ delete: mockDelete })
      mockDelete.mockReturnValueOnce({ eq: mockEq })
      mockEq.mockResolvedValueOnce({ error: null })

      // Mock for albums update
      mockFrom.mockReturnValueOnce({ update: mockUpdate })
      mockUpdate.mockReturnValueOnce({ eq: mockEq })
      mockEq.mockResolvedValueOnce({ error: null })

      // Mock for photos delete
      mockFrom.mockReturnValueOnce({ delete: mockDelete })
      mockDelete.mockReturnValueOnce({ eq: mockEq })
      mockEq.mockResolvedValueOnce({ error: null })

      await deletePhoto('photo-1')

      expect(mockFrom).toHaveBeenCalledWith('album_photos')
      expect(mockFrom).toHaveBeenCalledWith('albums')
      expect(mockFrom).toHaveBeenCalledWith('photos')
    })
  })

  describe('updatePhotoVisibility', () => {
    it('updates visibility successfully', async () => {
      mockFrom.mockReturnValue({ update: mockUpdate })
      mockUpdate.mockReturnValue({ eq: mockEq })
      mockEq.mockResolvedValue({ error: null })

      await updatePhotoVisibility('photo-1', true)

      expect(mockUpdate).toHaveBeenCalledWith({ visible: true })
    })
  })

  describe('fetchPhotoAlbums', () => {
    it('returns album IDs for photo', async () => {
      const mockData = [{ album_id: 'album-1' }, { album_id: 'album-2' }]
      
      mockFrom.mockReturnValue({ select: mockSelect })
      mockSelect.mockReturnValue({ eq: mockEq })
      mockEq.mockResolvedValue({ data: mockData, error: null })

      const result = await fetchPhotoAlbums('photo-1')

      expect(result).toEqual(['album-1', 'album-2'])
    })
  })

  describe('bulkDeletePhotos', () => {
    it('handles empty array', async () => {
      await bulkDeletePhotos([])

      expect(mockFrom).not.toHaveBeenCalled()
    })

    it('deletes multiple photos', async () => {
      // Mock for album_photos delete
      mockFrom.mockReturnValueOnce({ delete: mockDelete })
      mockDelete.mockReturnValueOnce({ in: mockIn })
      mockIn.mockResolvedValueOnce({ error: null })

      // Mock for albums update
      mockFrom.mockReturnValueOnce({ update: mockUpdate })
      mockUpdate.mockReturnValueOnce({ in: mockIn })
      mockIn.mockResolvedValueOnce({ error: null })

      // Mock for photos delete
      mockFrom.mockReturnValueOnce({ delete: mockDelete })
      mockDelete.mockReturnValueOnce({ in: mockIn })
      mockIn.mockResolvedValueOnce({ error: null })

      await bulkDeletePhotos(['1', '2', '3'])

      expect(mockFrom).toHaveBeenCalledWith('photos')
    })
  })

  describe('bulkUpdatePhotoVisibility', () => {
    it('handles empty array', async () => {
      await bulkUpdatePhotoVisibility([], true)

      expect(mockFrom).not.toHaveBeenCalled()
    })

    it('updates multiple photos', async () => {
      mockFrom.mockReturnValue({ update: mockUpdate })
      mockUpdate.mockReturnValue({ in: mockIn })
      mockIn.mockResolvedValue({ error: null })

      await bulkUpdatePhotoVisibility(['1', '2'], false)

      expect(mockUpdate).toHaveBeenCalled()
    })
  })
})